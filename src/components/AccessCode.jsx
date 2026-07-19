import React, { useEffect, useState } from 'react';
import accessCodeService from '../services/accessCodeService';
import API_CONFIG from '../config/api';

function AccessCode({ notice, onActivated, onCancel }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Récupérer l'ID utilisateur depuis le localStorage ou sessionStorage
    const storedUserId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }

    const handler = async () => {
      setResending(true);
      try {
        await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESEND_CODE}`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ userId: storedUserId }) 
        });
      } catch (err) {
        console.error('Erreur renvoi code:', err);
      }
      setResending(false);
    };
    
    window.addEventListener('resend_code', handler);
    return () => window.removeEventListener('resend_code', handler);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!code || code.trim().length < 6) {
      setError("Code invalide");
      return;
    }

    if (!userId) {
      setError("Erreur: utilisateur non identifié");
      return;
    }

    setLoading(true);
    try {
      // Utiliser le service d'accès aux codes
      const result = await accessCodeService.validateAndActivateCode(code.trim(), userId);
      
      if (result.success) {
        // Sauvegarder le plan activé
        localStorage.setItem('userPlan', result.codeData?.plan || 'starter');
        localStorage.setItem('codeActivated', 'true');
        
        // Notifier l'application
        onActivated?.();
        
        // Afficher un message de succès
        console.log('✅ Code activé:', result.message);
      } else {
        setError(result.message || 'Activation échouée');
      }
    } catch (err) {
      console.error('Erreur validation code:', err);
      setError(err.message || 'Erreur lors de la validation du code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-main">
      <div className="container">
        <div className="auth-card" style={{maxWidth:480, margin:'2rem auto'}}>
          <h2>Entrer le code d'accès</h2>
          <p style={{color:'var(--text-secondary)'}}>Saisissez le code reçu par email après validation de votre paiement. Une fois vérifié, votre accès complet sera activé.</p>
          {notice && <div className="info-message" style={{marginTop:'0.5rem', padding:'0.5rem 0.75rem', border:'1px solid var(--border-color)', borderRadius:10}}>{notice}</div>}
          {error && <div className="error-message" style={{marginTop: '0.75rem'}}>{error}</div>}
          <form onSubmit={submit} style={{marginTop:'1rem', display:'grid', gap:'0.75rem'}}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Code d'accès (ex: TEST001STARTER)"
              value={code}
              onChange={(e)=> setCode(e.target.value.toUpperCase())}
              style={{padding:'0.9rem', borderRadius:10, border:'1px solid var(--border-color)', background:'var(--bg-secondary)', color:'var(--text-primary)'}}
              disabled={loading}
              required
            />
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading || !code}
              style={{opacity: loading ? 0.6 : 1}}
            >
              {loading ? 'Validation...' : 'Activer le code'}
            </button>
            <button type="button" className="btn-ghost-small" onClick={onCancel} disabled={loading}>
              Annuler
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AccessCode;


