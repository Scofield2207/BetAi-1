const API_CONFIG = {
  // Base URL configurable par variable d'environnement (fallback localhost)
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  ENDPOINTS: {
    // Authentification
    LOGIN: '/login',
    REGISTER: '/register',
    LOGOUT: '/logout',
    CHECK_AUTH: '/check-auth',
    ACTIVATE_CODE: '/activate-code',
    
    // Prédictions et simulations
    PREDICT: '/predict',
    SIMULATE: '/simulate',
    
    
    
  
    
    // Tests et santé
    HEALTH: '/health',
    TEST: '/test',
    DB_STATUS: '/db-status',
    
    // Configuration admin
    ADMIN_LOGIN: '/admin/login',
    ADMIN_PANEL: '/admin/panel',
    ADMIN_REQUESTS: '/admin/api/requests',
    ADMIN_VALIDATE: '/admin/api/validate',
    ADMIN_REJECT: '/admin/api/reject',
    
    // Autres
    RESEND_CODE: '/api/resend_code'
  }
};

export default API_CONFIG;
