import { supabase } from '../config/supabase';

/**
 * Service de gestion des codes d'accès
 * Gère la validation, l'activation et le suivi des codes d'accès pour BetAI
 */

export const accessCodeService = {
  /**
   * Valide et active un code d'accès
   * @param {string} code - Le code d'accès à valider
   * @param {string} userId - L'ID de l'utilisateur qui active le code
   * @returns {Promise<{success: boolean, message: string, codeData?: object}>}
   */
  async validateAndActivateCode(code, userId) {
    try {
      if (!code || code.trim().length < 6) {
        return {
          success: false,
          message: 'Code invalide. Le code doit contenir au moins 6 caractères.'
        };
      }

      // Rechercher le code dans la base de données
      const { data: codeRecord, error: fetchError } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', code.trim())
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return {
            success: false,
            message: 'Code d\'accès non trouvé.'
          };
        }
        throw fetchError;
      }

      // Vérifier si le code a déjà été utilisé
      if (codeRecord.is_used) {
        return {
          success: false,
          message: 'Ce code a déjà été utilisé. Veuillez contacter le support.'
        };
      }

      // Vérifier si le code est actif
      if (!codeRecord.is_active) {
        return {
          success: false,
          message: 'Ce code n\'est pas actif actuellement.'
        };
      }

      // Vérifier la date d'expiration si elle existe
      if (codeRecord.expires_at) {
        const expiryDate = new Date(codeRecord.expires_at);
        if (expiryDate < new Date()) {
          return {
            success: false,
            message: 'Ce code a expiré. Veuillez contacter le support.'
          };
        }
      }

      // Mettre à jour le code comme utilisé
      const { error: updateError } = await supabase
        .from('access_codes')
        .update({
          is_used: true,
          used_by: userId,
          used_at: new Date().toISOString(),
          plan: codeRecord.plan
        })
        .eq('id', codeRecord.id);

      if (updateError) throw updateError;

      // Créer un enregistrement dans les activations de code
      const { error: activationError } = await supabase
        .from('code_activations')
        .insert([
          {
            code_id: codeRecord.id,
            user_id: userId,
            code_value: code.trim(),
            plan_activated: codeRecord.plan,
            activated_at: new Date().toISOString(),
            ip_address: null // Sera défini côté serveur
          }
        ]);

      if (activationError) console.warn('Activation record storage failed');

      return {
        success: true,
        message: `Code activé avec succès! Plan "${codeRecord.plan}" déverrouillé.`,
        codeData: {
          plan: codeRecord.plan,
          features: codeRecord.features,
          duration: codeRecord.duration
        }
      };
    } catch (error) {
      console.error('Code validation failed');
      return {
        success: false,
        message: error.message || 'Une erreur est survenue lors de la validation du code.'
      };
    }
  },

  /**
   * Vérifie si un utilisateur a déjà activé un code
   * @param {string} userId - L'ID de l'utilisateur
   * @returns {Promise<boolean>}
   */
  async hasActivatedCode(userId) {
    try {
      const { data, error } = await supabase
        .from('code_activations')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Activation check failed');
      return false;
    }
  },

  /**
   * Récupère le plan activé pour un utilisateur
   * @param {string} userId - L'ID de l'utilisateur
   * @returns {Promise<{plan: string, features: array} | null>}
   */
  async getUserActivatedPlan(userId) {
    try {
      const { data, error } = await supabase
        .from('code_activations')
        .select('plan_activated, code_id')
        .eq('user_id', userId)
        .order('activated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Pas de résultat
        throw error;
      }

      // Récupérer les détails du plan
      if (data) {
        const { data: codeData } = await supabase
          .from('access_codes')
          .select('plan, features, duration')
          .eq('id', data.code_id)
          .single();

        return codeData || { plan: data.plan_activated };
      }

      return null;
    } catch (error) {
      console.error('User plan lookup failed');
      return null;
    }
  },

  /**
   * Crée des codes d'accès (côté admin/backend)
   * Cette fonction doit être appelée avec des droits admin
   * @param {array} codes - Array d'objets {code, plan, duration, features}
   * @returns {Promise<{success: boolean, message: string, createdCount?: number}>}
   */
  async createAccessCodes(codes) {
    try {
      const codesData = codes.map(code => ({
        code: code.code,
        plan: code.plan,
        duration: code.duration,
        features: code.features,
        is_active: true,
        is_used: false,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('access_codes')
        .insert(codesData);

      if (error) throw error;

      return {
        success: true,
        message: `${codes.length} code(s) d'accès créé(s) avec succès.`,
        createdCount: codes.length
      };
    } catch (error) {
      console.error('Code creation failed');
      return {
        success: false,
        message: 'Erreur lors de la création des codes d\'accès.'
      };
    }
  }
};

export default accessCodeService;
