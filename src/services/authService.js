import { supabase } from '../config/supabase';
import { sanitizeSession } from '../utils/sensitiveData';

const DEVICE_ID_KEY = 'betai_device_id';
const SESSION_KEY = 'betai_auth_session';
const ADMIN_BYPASS_CODES = {
  SUPERADMIN2026: { role: 'superadmin' },
  'GILDAS12345@G': { role: 'admin' }
};

// Generate a random UUID-like string for device fingerprinting
const generateDeviceId = () => {
  return 'device_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Get or create the unique device ID for this browser
export const getDeviceId = () => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

// All codes have a duration of 2 months (60 days)
const DURATION_DAYS = 60;

const daysToMs = (d) => d * 24 * 60 * 60 * 1000;

const getDurationMsFromCode = () => {
  return daysToMs(DURATION_DAYS);
};

export const authService = {
  /**
   * Tente de se connecter avec un code.
   * @param {string} code Le code de connexion
   * @returns {Object} { success: boolean, error?: string, session?: Object }
   */
  login: async (code) => {
    if (!code || typeof code !== 'string') {
      return { success: false, error: "Code invalide." };
    }

    const cleanCode = code.trim().toUpperCase();
    const deviceId = getDeviceId();

    const adminConfig = ADMIN_BYPASS_CODES[cleanCode];

    if (adminConfig) {
      const session = {
        code: cleanCode,
        deviceId,
        expiresAt: null,
        loginTime: Date.now(),
        isAdmin: true,
        role: adminConfig.role
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(sanitizeSession(session)));
      return { success: true, session: sanitizeSession(session) };
    }

    try {
      // 1. Chercher le code dans Supabase
      const { data: license, error: fetchError } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', cleanCode)
        .single();

      if (fetchError || !license) {
        return { success: false, error: "Ce code n'est pas reconnu par le système." };
      }

      if (!license.is_active) {
        return { success: false, error: "Ce code a été désactivé." };
      }

      const durationMs = getDurationMsFromCode();
      let expiresAt = license.expires_at ? new Date(license.expires_at).getTime() : 0;

      // 2. Si le code a déjà été utilisé
      if (license.is_used) {
        // Bloquer si le code est lié à un autre appareil ET qu'il est toujours valide
        if (license.device_id && license.device_id !== deviceId && Date.now() <= expiresAt) {
          return {
            success: false,
            error: "Ce code est déjà utilisé sur un autre appareil. Un code = une session ouverte."
          };
        }

        // Si le code a expiré, on permet à un nouvel appareil de le reprendre (ou on pourrait forcer un nouveau code)
        if (Date.now() > expiresAt) {
           return { success: false, error: "Ce code a expiré. Veuillez obtenir un nouveau code." };
        }

      } else {
        // 3. Si le code n'est pas utilisé, on l'active !
        expiresAt = Date.now() + durationMs;

        const { error: updateError } = await supabase
          .from('access_codes')
          .update({
            is_used: true,
            device_id: deviceId,
            activated_at: new Date().toISOString(),
            expires_at: new Date(expiresAt).toISOString()
          })
          .eq('id', license.id);

        if (updateError) {
          console.error('Activation failed');
          return { success: false, error: "Erreur lors de l'activation du code." };
        }
      }

      // Connexion réussie, on crée la session locale
      const session = {
        code: cleanCode,
        deviceId: deviceId,
        expiresAt: expiresAt,
        loginTime: Date.now()
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(sanitizeSession(session)));

      return { success: true, session: sanitizeSession(session) };
    } catch (err) {
      console.error('Unexpected auth error');
      return { success: false, error: "Erreur de connexion au serveur." };
    }
  },

  /**
   * Vérifie si la session actuelle est valide.
   * @returns {Object|null} La session si valide, sinon null
   */
  getSession: () => {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (!sessionStr) return null;

      const session = JSON.parse(sessionStr);
      
      // Vérifications de base (manipulation locale possible par l'utilisateur, 
      // mais simulée ici)
      if (session.isAdmin || session.role === 'admin' || session.expiresAt === null) {
        return session;
      }

      if (!session.expiresAt || Date.now() > session.expiresAt) {
        authService.logout();
        return null;
      }

      if (session.deviceId !== getDeviceId()) {
        authService.logout();
        return null;
      }

      return session;
    } catch {
      authService.logout();
      return null;
    }
  },

  /**
   * Déconnecte l'utilisateur de l'appareil courant.
   */
  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  /**
   * Calcule le nombre de jours restants
   */
  getDaysRemaining: () => {
    const session = authService.getSession();
    if (!session) return 0;
    if (session.isAdmin || session.role === 'admin' || session.expiresAt === null) return null;
    const diff = session.expiresAt - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
};

export default authService;
