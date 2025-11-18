import React from 'react';

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

  return (
    <div className="prediction-card">
      <h2>Prédiction IA {prediction.ai_mode ? `(${prediction.ai_mode})` : ''}</h2>
      
      <div className="prediction-main">
        <div className="prediction-value">
          <span className="label">Prochain Crash Prédit:</span>
          <span className="value">{prediction.prediction}x</span>
        </div>
        
        <div className="confidence-indicator">
          <span className="label">Indice de Confiance:</span>
          <div className={`confidence-bar ${confidenceColor}`}>
            <div 
              className="confidence-fill" 
              style={{ width: `${prediction.confidence * 100}%` }}
            ></div>
            <span className="confidence-text">
              {confidenceText} ({(prediction.confidence * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="prediction-details">
        <div className="detail-row">
          <span>Facteur de Volatilité:</span>
          <span className="value">{prediction.volatility_factor}</span>
        </div>
        <div className="detail-row">
          <span>Facteur de Tendance:</span>
            <span className={`value ${prediction.trend_factor > 0 ? 'positive' : 'negative'}`}>
            {Math.abs(prediction.trend_factor).toFixed(3)}
          </span>
        </div>
      </div>

      <div className="prediction-recommendation">
        <h3>Recommandation</h3>
        {prediction.confidence >= 0.7 ? (
          <p className="recommendation positive">Prédiction fiable - Considérez un pari avec prudence</p>
        ) : prediction.confidence >= 0.5 ? (
          <p className="recommendation neutral">Prédiction modérée - Surveillez les tendances</p>
        ) : (
          <p className="recommendation negative">Prédiction peu fiable - Évitez les paris risqués</p>
        )}
      </div>
    </div>
  );
}

export default PredictionCard;
