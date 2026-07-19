import React, { useState } from 'react';
import './CrashForm.css';

function CrashForm({ onSubmit, loading }) {
  const [inputs, setInputs] = useState(['', '', '', '', '']);
  const [aiMode, setAiMode] = useState('equilibre');

  const handleChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const crashHistory = inputs
      .map((value) => {
        const normalized = String(value).trim().replace(',', '.');
        return parseFloat(normalized);
      })
      .filter((val) => !Number.isNaN(val) && val > 1.0);

    if (crashHistory.length >= 5) {
      onSubmit(crashHistory, aiMode);
    }
  };

  const handleQuickFill = () => {
    // Remplit avec des valeurs d'exemple
    setInputs(['1.5', '2.1', '1.8', '2.3', '1.9']);
  };

  const getAiModeDescription = (mode) => {
    switch (mode) {
      case 'prudent':
        return 'Analyse conservatrice avec risque minimal';
      case 'equilibre':
        return 'Analyse équilibrée entre risque et performance';
      case 'agressif':
        return 'Analyse audacieuse pour maximiser les gains';
      case 'recuperation':
        return 'Détecte les séries noires pour anticiper un rebond sécurisé';
      case 'jackpot':
        return 'Vise les multiplicateurs massifs (> 5x) sur base d\'anomalies';
      default:
        return '';
    }
  };

  const getAiModeIcon = (mode) => {
    switch (mode) {
      case 'prudent':
        return '🛡️';
      case 'equilibre':
        return '⚖️';
      case 'agressif':
        return '🔥';
      case 'recuperation':
        return '🔁';
      case 'jackpot':
        return '🚀';
      default:
        return '';
    }
  };

  return (
    <div className="crash-form">
      <div className="form-header">
        
        <div className="header-content">
          <h2>Saisie des Crashs</h2>
          <p>Entrez les 5 derniers crashs pour l'analyse IA avancée</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="crash-form-content">
        <div className="inputs-section">
          <div className="section-title">
       
            <h3>Historique des Crashs</h3>
          </div>
          
          <div className="inputs-grid">
            {inputs.map((val, i) => (
              <div key={i} className="input-group">
                <div className="input-label">
                  <span className="crash-number">#{i + 1}</span>
                  <label htmlFor={`crash-${i}`}>Crash {i + 1}</label>
                </div>
                <div className="input-wrapper">
                  <input
                    id={`crash-${i}`}
                    type="text"
                    inputMode="decimal"
                    pattern="^[0-9]*\.?[0-9]*$"
                    value={val}
                    onChange={(e) => handleChange(i, e.target.value)}
                    placeholder={`Ex: ${(1.5 + i * 0.3).toFixed(1)}`}
                    required
                    className="crash-input"
                  />
                  <div className="input-suffix">x</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={handleQuickFill}
            className="btn-secondary"
          >
            <span>Remplir avec exemple</span>
          </button>
          
          <button 
            type="submit" 
            disabled={loading || inputs.some(val => !val)}
            className={`btn-primary ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                <span>Analyse en cours...</span>
              </>
            ) : (
              <>
                <span>Analyser avec l'IA</span>
              </>
            )}
          </button>
        </div>

        <div className="ai-mode-section">
          <div className="section-title">
         
            <h3>Configuration IA</h3>
          </div>
          
          <div className="ai-mode-selector">
            <div className="mode-options" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
              {['prudent', 'equilibre', 'agressif', 'recuperation', 'jackpot'].map((mode) => (
                <button
                  type="button"
                  key={mode}
                  className={`mode-option ${aiMode === mode ? 'active' : ''}`}
                  onClick={() => setAiMode(mode)}
                  aria-pressed={aiMode === mode}
                >
                  <span className="mode-icon">{getAiModeIcon(mode)}</span>
                  <span className="mode-name">
                    {mode === 'prudent' ? 'Prudent' :
                     mode === 'equilibre' ? 'Équilibré' : 
                     mode === 'agressif' ? 'Agressif' : 
                     mode === 'recuperation' ? 'Récupération' : 'Jackpot'}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="mode-description">
              <p>{getAiModeDescription(aiMode)}</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CrashForm;
