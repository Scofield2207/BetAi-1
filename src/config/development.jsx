// Configuration de développement pour BetAI
const developmentConfig = {
  // URL de l'API backend (localhost en développement)
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  
  // Configuration de l'environnement
  ENVIRONMENT: 'development',
  
  // Version de l'application
  VERSION: '1.0.0-dev',
  
  // Configuration des analytics
  ANALYTICS_ENABLED: false, // Désactivé en développement
  
  // Configuration des timeouts
  API_TIMEOUT: 10000, // 10 secondes (plus court en dev)
  
  // Configuration des retry
  MAX_RETRIES: 1, // Moins de retry en dev
  RETRY_DELAY: 500, // 0.5 seconde
  
  // Configuration des logs
  LOG_LEVEL: 'debug', // Plus de logs en développement
  
  // Configuration de la cache
  CACHE_ENABLED: false, // Pas de cache en dev
  CACHE_DURATION: 0,
  
  // Configuration des notifications
  NOTIFICATIONS_ENABLED: true,
  
  // Configuration de la sécurité
  SECURE_COOKIES: false, // Cookies non sécurisés en local
  HTTPS_ONLY: false, // HTTP autorisé en local
  
  // Configuration du hot reload
  HOT_RELOAD_ENABLED: true,
  
  // Configuration des dev tools
  DEV_TOOLS_ENABLED: true,
  
  // Configuration des mocks
  MOCK_API_ENABLED: false
};

export default developmentConfig;
