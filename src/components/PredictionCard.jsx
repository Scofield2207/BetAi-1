import React from 'react';
import './PredictionCard.css';

function PredictionCard({ prediction }) {
  if (!prediction) return null;

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'Très élevée';
    if (confidence >= 0.6) return 'Élevée';
    return 'Faible';
  };

  const confidenceColor = getConfidenceColor(prediction.confidence);
  const confidenceText = getConfidenceText(prediction.confidence);
  const confidencePercentage = Math.min(100, Math.max(0, prediction.confidence * 100));
  const trendValue = Number.isFinite(prediction.trend_factor)
    ? prediction.trend_factor.toFixed(3)
    : '0.000';
  const volatilityValue = Number.isFinite(prediction.volatility_factor)
    ? prediction.volatility_factor.toFixed(2)
    : '0.00';
  const crashHistory = Array.isArray(prediction.statistics?.crash_data)
    ? prediction.statistics.crash_data.slice(-8)
    : [];
  const maxCrashValue = crashHistory.length ? Math.max(...crashHistory) : 1;

  // Données du moteur d'apprentissage
  const ls          = prediction.learning_state;
  const riskLevel   = prediction.risk_level   ?? null;
  const recommendation = prediction.recommendation ?? null;
  const alert       = prediction.alert        ?? null;
  const alertType   = prediction.alertType    ?? 'info';
  const isLearned   = prediction.is_learned   ?? false;

  return (
    <div className="prediction-card">
      <div className="prediction-card-banner">
        <div className="prediction-card-banner-title">
          Prédiction IA ({prediction.ai_mode ? prediction.ai_mode : 'équilibre'})
        </div>
        <div className="prediction-card-banner-main">
          <span className="prediction-card-banner-crash">Prochain Crash Prédit:</span>
          <span className="prediction-card-banner-value">{prediction.prediction}x</span>
        </div>
        <div className="prediction-card-banner-meta">
          <span className="prediction-card-banner-label">Indice de Confiance:</span>
          <strong>{confidenceText} ({confidencePercentage.toFixed(1)}%)</strong>
        </div>

        {crashHistory.length > 0 && (
          <div className="prediction-card-sparkline">
            <div className="sparkline-header">
              <span>Historique court</span>
              <span>{crashHistory.length} derniers crashs</span>
            </div>
            <div className="sparkline-bars">
              {crashHistory.map((value, index) => (
                <div
                  key={index}
                  className="sparkline-bar"
                  style={{ height: `${Math.max(18, (value / maxCrashValue) * 100)}%` }}
                  title={`${value.toFixed(2)}x`}
                />
              ))}
            </div>
            <div className="sparkline-values">
              {crashHistory.map((value, index) => (
                <span key={index}>{value.toFixed(1)}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="prediction-main">
        <div className="prediction-value">
          <span className="label">Prochain Crash Prédit</span>
          <span className="value prediction-value-highlight">{prediction.prediction}x</span>
        </div>

        <div className="confidence-indicator">
          <div className="confidence-indicator-top">
            <span className="label">Indice de Confiance</span>
            <span className={`confidence-pill ${confidenceColor}`}>{confidenceText}</span>
          </div>
          <div className={`confidence-bar ${confidenceColor}`}>
            <div className="confidence-fill" style={{ width: `${confidencePercentage}%` }} />
          </div>
          <span className="confidence-text">{confidencePercentage.toFixed(1)}%</span>
        </div>
      </div>

      <div className="prediction-details">
        <div className="detail-row">
          <span>Facteur de Volatilité</span>
          <span className="value">{volatilityValue}</span>
        </div>
        <div className="detail-row">
          <span>Facteur de Tendance</span>
          <span className={`value ${prediction.trend_factor >= 0 ? 'positive' : 'negative'}`}>
            {trendValue}
          </span>
        </div>
      </div>

      {/* ─── Alerte IA apprise ─── */}
      {alert && (
        <div className={`pc-alert pc-alert-${alertType}`}>
          {alert}
        </div>
      )}

      {/* ─── Recommandation ─── */}
      <div className="prediction-recommendation">
        <div className="prediction-recommendation-header">
          <h3>Recommandation</h3>
          {riskLevel && (
            <span className={`pc-risk-badge pc-risk-${riskLevel.toLowerCase().replace(/\s+/g, '-').replace(/é/g, 'e').replace(/è/g, 'e')}` }>
              Risque : {riskLevel}
            </span>
          )}
        </div>

        {recommendation === 'FAVORABLE' ? (
          <p className="recommendation positive">
            {isLearned
              ? `Le modèle IA (${ls?.sessions ?? 0} sessions) identifie une fenêtre favorable. Envisagez un pari avec prudence.`
              : 'Prédiction fiable — Considérez un pari avec prudence'}
          </p>
        ) : recommendation === 'NEUTRE' ? (
          <p className="recommendation neutral">
            {isLearned
              ? 'Le modèle détecte un signal ambigu. Surveillez les tendances avant de miser.'
              : 'Prédiction modérée — Surveillez les tendances'}
          </p>
        ) : recommendation === 'ATTENDRE' ? (
          <p className="recommendation negative">
            {isLearned
              ? 'Le modèle recommande d’attendre. Distribution défavorable détectée.'
              : 'Prédiction peu fiable — Évitez les paris risqués'}
          </p>
        ) : prediction.confidence >= 0.7 ? (
          <p className="recommendation positive">Prédiction fiable — Considérez un pari avec prudence</p>
        ) : prediction.confidence >= 0.5 ? (
          <p className="recommendation neutral">Prédiction modérée — Surveillez les tendances</p>
        ) : (
          <p className="recommendation negative">Prédiction peu fiable — Évitez les paris risqués</p>
        )}

        {/* Badge "Modèle appris" */}
        {isLearned && ls && (
          <div className="pc-learned-badge">
            <span className="pc-learned-dot" />
            Modèle appris — {ls.sessions} session{ls.sessions > 1 ? 's' : ''}
             ·  {ls.data_points} points · précision {ls.accuracy}%
             ·  Pattern : {ls.dominant_pattern}
          </div>
        )}
      </div>
    </div>
  );
}

export default PredictionCard;
