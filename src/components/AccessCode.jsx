import React, { useEffect, useState } from 'react';
import API_CONFIG from '../config/api';

function AccessCode({ notice, onActivated, onCancel }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const handler = async () => {
      setResending(true);
      try {
        await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESEND_CODE}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      } catch {}
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
    setLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACTIVATE_CODE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: code.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Activation échouée');
      onActivated?.();
    } catch (e2) {
      setError(e2.message);
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
              placeholder="Code d'accès (ex: 123456789012)"
              value={code}
              onChange={(e)=> setCode(e.target.value)}
              style={{padding:'0.9rem', borderRadius:10, border:'1px solid var(--border-color)', background:'var(--bg-secondary)', color:'var(--text-primary)'}}
              required
            />
            <button type="button" className="btn-ghost-small" onClick={onCancel}>Annuler</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AccessCode;


