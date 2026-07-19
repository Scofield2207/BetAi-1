// Configuration de production pour BetAI
const productionConfig = {
  // URL de l'API backend
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  
  // Configuration de l'environnement
  ENVIRONMENT: 'production',
  
  // Version de l'application
  VERSION: '1.0.0',
  
  // Configuration des analytics
  ANALYTICS_ENABLED: true,
  
  // Configuration des timeouts
  API_TIMEOUT: 30000, // 30 secondes
  
  // Configuration des retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 seconde
  
  // Configuration des logs
  LOG_LEVEL: 'warn', // warn, error, info, debug
  
  // Configuration de la cache
  CACHE_ENABLED: true,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // Configuration des notifications
  NOTIFICATIONS_ENABLED: true,
  
  // Configuration de la sécurité
  SECURE_COOKIES: true,
  HTTPS_ONLY: true
};

export default productionConfig;
