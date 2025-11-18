import React, { useState } from 'react';
import './StrategySimulator.css';

function StrategySimulator({ crashHistory, onSimulate, loading }) {
  const [formData, setFormData] = useState({
    initialBet: 6550, // 10€ = 6550 FCFA
    targetMultiplier: 2.0,
    numRounds: 20,
    strategyType: 'martingale'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Si pas d'historique de crash, utiliser des données simulées
    const crashData = crashHistory && crashHistory.length > 0 
      ? crashHistory 
      : Array.from({length: 10}, (_, i) => 1.5 + Math.random() * 3);
    
    onSimulate({
      crashHistory: crashData,
      initialBet: parseFloat(formData.initialBet),
      targetMultiplier: parseFloat(formData.targetMultiplier),
      numRounds: parseInt(formData.numRounds),
      strategyType: formData.strategyType
    });
  };

  const getStrategyDescription = (strategy) => {
    switch (strategy) {
      case 'fixed':
        return 'Mise fixe à chaque tour';
      case 'martingale':
        return 'Double la mise après une perte';
      case 'anti_martingale':
        return 'Double la mise après un gain';
      default:
        return '';
    }
  };

  const getStrategyIcon = (strategy) => {
    switch (strategy) {
      case 'fixed':
        return '📊';
      case 'martingale':
        return '📈';
      case 'anti_martingale':
        return '📉';
      default:
        return ' ';
    }
  };

  return (
    <div className="strategy-simulator">
      <div className="simulator-header">
        
        <div className="header-content">
          <h2>Simulateur de Stratégie</h2>
          <p>Testez différentes stratégies de paris sans risque avec notre IA avancée</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="simulator-form">
        <div className="simulation-grid">
          <div className="input-group">
            <div className="input-label">
        
              <label htmlFor="initial-bet">Mise Initiale (FCFA)</label>
            </div>
            <div className="input-wrapper">
              <input
                id="initial-bet"
                type="number"
                min="100"
                step="100"
                value={formData.initialBet}
                onChange={(e) => handleChange('initialBet', e.target.value)}
                placeholder="Ex: 6550"
                required
                className="form-input"
              />
              <div className="input-suffix">FCFA</div>
            </div>
          </div>

          <div className="input-group">
            <div className="input-label">
      
              <label htmlFor="target-multiplier">Multiplicateur Cible</label>
            </div>
            <div className="input-wrapper">
              <input
                id="target-multiplier"
                type="number"
                min="1.1"
                step="0.1"
                value={formData.targetMultiplier}
                onChange={(e) => handleChange('targetMultiplier', e.target.value)}
                required
                className="form-input"
              />
              <div className="input-suffix">x</div>
            </div>
          </div>

          <div className="input-group">
            <div className="input-label">
              <span className="label-icon">🔄</span>
              <label htmlFor="num-rounds">Nombre de Tours</label>
            </div>
            <div className="input-wrapper">
              <input
                id="num-rounds"
                type="number"
                min="5"
                max="100"
                step="5"
                value={formData.numRounds}
                onChange={(e) => handleChange('numRounds', e.target.value)}
                required
                className="form-input"
              />
              <div className="input-suffix">tours</div>
            </div>
          </div>

          <div className="input-group">
            <div className="input-label">
     
              <label htmlFor="strategy-type">Stratégie</label>
            </div>
            <div className="select-wrapper">
              <select
                id="strategy-type"
                value={formData.strategyType}
                onChange={(e) => handleChange('strategyType', e.target.value)}
                className="form-select"
              >
                <option value="fixed">📊 Mise Fixe</option>
                <option value="martingale">📈 Martingale</option>
                <option value="anti_martingale">📉 Anti-Martingale</option>
              </select>
              <div className="select-arrow">▼</div>
            </div>
            <div className="strategy-description">
              <span className="strategy-icon">{getStrategyIcon(formData.strategyType)}</span>
              {getStrategyDescription(formData.strategyType)}
            </div>
          </div>
        </div>

        <div className="simulation-info">
          <div className="info-card">
            <div className="info-header">
              <span className="info-icon">ℹ️</span>
              <h4>Informations de Simulation</h4>
            </div>
            <div className="info-content">
              <div className="info-item">
                <span className="bullet">•</span>
                <span>Basé sur l'historique des crashs analysés</span>
              </div>
              <div className="info-item">
                <span className="bullet">•</span>
                <span>Génération de crashs simulés avec distribution réaliste</span>
              </div>
              <div className="info-item">
                <span className="bullet">•</span>
                <span>Calcul automatique des profits/pertes en FCFA</span>
              </div>
              <div className="info-item">
                <span className="bullet">•</span>
                <span>Conversion: 1€ ≈ 655 FCFA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={loading}
            className={`btn-primary ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                <span>Simulation en cours...</span>
              </>
            ) : (
              <>
                
                <span>Lancer la Simulation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StrategySimulator;
