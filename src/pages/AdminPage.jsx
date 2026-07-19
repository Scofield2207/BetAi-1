import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import './AdminPage.css';

const ADMIN_PASSWORD = 'superadmin2026';

function AdminPage({ onGoHome }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('adminAuth') === 'true');
  const [passwordInput, setPasswordInput] = useState('');
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchCodes();
    }
  }, [isAuthenticated]);
  
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
    } else {
      setError('Mot de passe incorrect.');
    }
  };

  const fetchCodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('access_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
      setError('Impossible de charger les codes.');
    } else {
      setCodes(data || []);
    }
    setLoading(false);
  };

  const generateCodeString = () => {
    // On exclut les lettres/chiffres ambigus (O, 0, I, 1)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerate200Codes = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    const newCodes = [];
    for (let i = 0; i < 200; i++) {
      newCodes.push({ 
        code: generateCodeString(), 
        is_active: true, 
        is_used: false 
      });
    }

    const { error } = await supabase
      .from('access_codes')
      .insert(newCodes);

    if (error) {
      console.error('Insert error:', error);
      setError('Erreur lors de la génération des codes.');
    } else {
      setSuccess('200 nouveaux codes générés avec succès !');
      fetchCodes();
    }
    setLoading(false);
  };

  const toggleCodeStatus = async (id, currentStatus) => {
    const { error } = await supabase
      .from('access_codes')
      .update({ is_active: !currentStatus })
      .eq('id', id);
      
    if (!error) {
      fetchCodes();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-box">
          <h2>Administration Secrète</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder="Mot de passe" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary">Entrer</button>
          </form>
          {error && <p className="admin-error">{error}</p>}
          <button className="btn-ghost" onClick={onGoHome} style={{marginTop: '1rem'}}>
            Retour au site
          </button>
        </div>
      </div>
    );
  }

  const activeCodes = codes.filter(c => c.is_active && !c.is_used).length;
  const usedCodes = codes.filter(c => c.is_used).length;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Dashboard Administrateur</h1>
        <button className="btn-ghost" onClick={() => {
          sessionStorage.removeItem('adminAuth');
          onGoHome();
        }}>Quitter l'Admin</button>
      </header>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total des codes</h3>
          <p>{codes.length}</p>
        </div>
        <div className="stat-card">
          <h3>Codes Vierge (Prêts)</h3>
          <p>{activeCodes}</p>
        </div>
        <div className="stat-card">
          <h3>Codes Utilisés</h3>
          <p>{usedCodes}</p>
        </div>
      </div>

      <div className="admin-actions">
        <button 
          className="btn-primary" 
          onClick={handleGenerate200Codes} 
          disabled={loading}
        >
          {loading ? 'Génération...' : '+ Générer 200 codes'}
        </button>
        {success && <span className="admin-success">{success}</span>}
        {error && <span className="admin-error">{error}</span>}
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Statut</th>
              <th>Appareil (ID)</th>
              <th>Expiration</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {codes.map(c => (
              <tr key={c.id} className={!c.is_active ? 'row-inactive' : ''}>
                <td><strong>{c.code}</strong></td>
                <td>
                  {c.is_used ? (
                    <span className="badge badge-used">Utilisé</span>
                  ) : c.is_active ? (
                    <span className="badge badge-ready">Prêt</span>
                  ) : (
                    <span className="badge badge-disabled">Désactivé</span>
                  )}
                </td>
                <td>{c.device_id ? c.device_id.substring(0, 15) + '...' : '-'}</td>
                <td>
                  {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '-'}
                </td>
                <td>
                  <button 
                    className={`btn-toggle ${c.is_active ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => toggleCodeStatus(c.id, c.is_active)}
                  >
                    {c.is_active ? 'Désactiver' : 'Réactiver'}
                  </button>
                </td>
              </tr>
            ))}
            {codes.length === 0 && !loading && (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>Aucun code trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPage;
