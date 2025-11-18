// Configuration principale de BetAI
import developmentConfig from './development';
import productionConfig from './production';

// Sélection automatique de la configuration selon l'environnement
const config = process.env.NODE_ENV === 'production' 
  ? productionConfig 
  : developmentConfig;

// Configuration par défaut
const defaultConfig = {
  // Nom de l'application
  APP_NAME: 'BetAI',
  
  // Description de l'application
  APP_DESCRIPTION: 'Plateforme d\'analyse et de prédiction de crashs avec IA',
  
  // Configuration des plans d'abonnement
  SUBSCRIPTION_PLANS: {
    starter: {
      name: 'Starter',
      price: 7000,
      currency: 'FCFA',
      features: ['Analyse de base', '5 prédictions/jour', 'Support email']
    },
    pro: {
      name: 'Pro',
      price: 10000,
      currency: 'FCFA',
      features: ['Analyse avancée', 'Prédictions illimitées', 'Simulateur de stratégies', 'Support prioritaire']
    },
    expert: {
      name: 'Expert',
      price: 14900,
      currency: 'FCFA',
      features: ['Tout du plan Pro', 'Analyses personnalisées', 'API access', 'Support dédié']
    }
  },
  
  // Configuration des opérateurs de paiement
  PAYMENT_OPERATORS: {
    mtn: {
      name: 'MTN Mobile Money',
      logo: '/logos/mtn.png',
      colors: ['#FFC107', '#FF9800']
    },
    moov: {
      name: 'Moov Money',
      logo: '/logos/moov.png',
      colors: ['#2196F3', '#1976D2']
    },
    celtiis: {
      name: 'Celtiis',
      logo: '/logos/celtiis.png',
      colors: ['#4CAF50', '#388E3C']
    }
  },
  
  // Configuration des modes IA
  AI_MODES: {
    prudent: {
      name: 'Prudent',
      description: 'Analyse conservatrice avec risque minimal',
      icon: '🛡️',
      riskLevel: 'low'
    },
    equilibre: {
      name: 'Équilibré',
      description: 'Analyse équilibrée entre risque et performance',
      icon: '⚖️',
      riskLevel: 'medium'
    },
    agressif: {
      name: 'Agressif',
      description: 'Analyse audacieuse pour maximiser les gains',
      icon: '⚡',
      riskLevel: 'high'
    }
  },
  
  // Configuration des stratégies de trading
  TRADING_STRATEGIES: {
    fixed: {
      name: 'Mise Fixe',
      description: 'Mise constante à chaque tour',
      riskLevel: 'low',
      maxLoss: 'limitée'
    },
    martingale: {
      name: 'Martingale',
      description: 'Double la mise après une perte',
      riskLevel: 'high',
      maxLoss: 'élevée'
    },
    anti_martingale: {
      name: 'Anti-Martingale',
      description: 'Double la mise après un gain',
      riskLevel: 'medium',
      maxLoss: 'modérée'
    }
  },
  
  // Configuration des limites
  LIMITS: {
    MAX_CRASH_HISTORY: 100,
    MIN_CRASH_HISTORY: 5,
    MAX_SIMULATION_ROUNDS: 1000,
    MIN_SIMULATION_ROUNDS: 10,
    MAX_BET_AMOUNT: 1000000, // 1M FCFA
    MIN_BET_AMOUNT: 100 // 100 FCFA
  },
  
  // Configuration des timeouts
  TIMEOUTS: {
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 heures
    PAYMENT_TIMEOUT: 15 * 60 * 1000, // 15 minutes
    API_TIMEOUT: config.API_TIMEOUT,
    RETRY_DELAY: config.RETRY_DELAY
  },
  
  // Configuration des erreurs
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre internet.',
    PAYMENT_FAILED: 'Paiement échoué. Veuillez réessayer.',
    INVALID_CRASH_DATA: 'Données de crash invalides. Minimum 5 valeurs requises.',
    SUBSCRIPTION_REQUIRED: 'Abonnement requis pour accéder à cette fonctionnalité.',
    SESSION_EXPIRED: 'Session expirée. Veuillez vous reconnecter.'
  }
};

// Fusion de la configuration par défaut avec la configuration d'environnement
const finalConfig = {
  ...defaultConfig,
  ...config,
  
  // Méthodes utilitaires
  isProduction: () => config.ENVIRONMENT === 'production',
  isDevelopment: () => config.ENVIRONMENT === 'development',
  
  // Méthode pour obtenir l'URL complète de l'API
  getApiUrl: (endpoint = '') => {
    const baseUrl = config.API_BASE_URL.replace(/\/$/, '');
    const cleanEndpoint = endpoint.replace(/^\//, '');
    return `${baseUrl}/${cleanEndpoint}`;
  },
  
  // Méthode pour vérifier si une fonctionnalité est disponible
  isFeatureEnabled: (feature) => {
    const featureFlags = {
      analytics: config.ANALYTICS_ENABLED,
      cache: config.CACHE_ENABLED,
      notifications: config.NOTIFICATIONS_ENABLED,
      devTools: config.DEV_TOOLS_ENABLED || false
    };
    return featureFlags[feature] || false;
  }
};

export default finalConfig;
