import React, { useEffect } from 'react';

function CodeLoading({ onDone }) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="app-main">
      <div className="container">
        <div className="auth-card" style={{maxWidth:480, margin:'2rem auto', textAlign:'center'}}>
          <div className="spinner" aria-hidden="true" style={{margin:'0 auto 1rem'}}></div>
          <h3>Traitement de votre envoi…</h3>
          <p style={{color:'var(--text-secondary)'}}>Nous préparons le formulaire de vérification. Vous serez redirigé automatiquement.</p>
        </div>
      </div>
    </div>
  );
}

export default CodeLoading;


