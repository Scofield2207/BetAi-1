import React, { useState } from 'react';
import API_CONFIG from '../config/api';
import './UserHeader.css';

function UserHeader({ user, onLogout, onHomeClick }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        onLogout();
      }
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
      onLogout(); // Déconnexion locale même en cas d'erreur
    }
  };

  return (
    <header className="main-header">
      
     
      {/* Avatar de profil à droite */}
      <div className="header-profile">
        <div className="user-info">
          <div 
            className="user-avatar"
            onClick={() => setShowMenu(!showMenu)}
          >
            <span className="avatar-text">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>

          
          {showMenu && (
            <div className="user-menu">
              <div className="menu-header">
                <span className="username">{user.username}</span>
                <span className="user-email">{user.email}</span>
              </div>
              <div className="menu-actions">
                <button 
                  onClick={handleLogout}
                  className="menu-item logout-btn"
                > Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default UserHeader;
