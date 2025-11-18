import React from 'react';
import './AnalysisDashboard.css';

function AnalysisDashboard({ data }) {
  if (!data) return null;

  const getTrapStatus = (trapIndicator) => {
    switch (trapIndicator) {
      case 'low_trap':
        return { text: 'Piège détecté (crashs bas)', class: 'warning', icon: '' };
      case 'high_trap':
        return { text: 'Piège détecté (crashs hauts)', class: 'danger', icon: '' };
      case 'normal':
        return { text: 'Comportement normal', class: 'success', icon: '' };
      default:
        return { text: 'Données insuffisantes', class: 'neutral', icon: '' };
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return '📈';
    if (trend < 0) return '📉';
    return '➡️';
  };

  const getVolatilityClass = (volatility) => {
    if (volatility < 0.5) return 'low';
    if (volatility < 1.0) return 'medium';
    return 'high';
  };

  const trapStatus = getTrapStatus(data.trap_indicator);

  return (
    <div className="analysis-dashboard">
      <div className="dashboard-header">
   
        <div className="header-content">
          <h2>Tableau de Bord d'Analyse IA</h2>
          <p>Analyse approfondie des données de crash avec détection de patterns</p>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="card-header">
     
            <h3>Statistiques de Base</h3>
          </div>
          <div className="card-content">
            <div className="stat-row">
              <span className="stat-label">Moyenne</span>
              <span className="stat-value">{data.mean}x</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Médiane</span>
              <span className="stat-value">{data.median}x</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Écart-type</span>
              <span className="stat-value">{data.std}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-header">
         
            <h3>Répartition des Crashs</h3>
          </div>
          <div className="card-content">
            <div className="stat-row">
              <span className="stat-label">Crashs bas (&lt;2x)</span>
              <span className="stat-value low">{data.low_crashes}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Crashs moyens (2-10x)</span>
              <span className="stat-value medium">{data.medium_crashes}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Crashs hauts (&gt;10x)</span>
              <span className="stat-value high">{data.high_crashes}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-header">
            
            <h3>Indicateurs Avancés</h3>
          </div>
          <div className="card-content">
            <div className="stat-row">
              <span className="stat-label">Volatilité</span>
              <span className={`stat-value volatility-${getVolatilityClass(data.volatility)}`}>
                {data.volatility}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Tendance</span>
              <span className={`stat-value ${data.trend > 0 ? 'positive' : 'negative'}`}>
                <span className="trend-icon">{getTrendIcon(data.trend)}</span>
                {Math.abs(data.trend).toFixed(3)}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Total crashs</span>
              <span className="stat-value total">{data.total_crashes}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-header">
            
            <h3>Détection de Pièges</h3>
          </div>
          <div className="card-content">
            <div className={`trap-status ${trapStatus.class}`}>
              <span className="trap-icon">{trapStatus.icon}</span>
              <span className="trap-text">{trapStatus.text}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Variance</span>
              <span className="stat-value">{data.variance}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <div className="footer-info">
         
          <p>Analyse basée sur {data.total_crashes} crashs avec IA avancée</p>
        </div>
      </div>
    </div>
  );
}

export default AnalysisDashboard;
