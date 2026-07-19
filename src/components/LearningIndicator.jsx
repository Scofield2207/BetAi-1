import React, { useEffect, useState } from 'react';
import './LearningIndicator.css';

/**
 * LearningIndicator
 * ─────────────────
 * Affiche en temps réel l'état d'apprentissage du moteur IA.
 * Props:
 *   learningStats  : objet retourné par learningEngine.getStats()
 *   isLearning     : booléen — true pendant le traitement (spinner)
 *   onReset        : callback pour réinitialiser le modèle
 */
function LearningIndicator({ learningStats, isLearning, onReset }) {
  const [expanded, setExpanded] = useState(false);
  const [prevAccuracy, setPrevAccuracy] = useState(null);
  const [accuracyDelta, setAccuracyDelta] = useState(null);

  useEffect(() => {
    if (!learningStats) return;
    if (prevAccuracy !== null && prevAccuracy !== learningStats.estimatedAccuracy) {
      const delta = learningStats.estimatedAccuracy - prevAccuracy;
      setAccuracyDelta(delta);
      const t = setTimeout(() => setAccuracyDelta(null), 3000);
      return () => clearTimeout(t);
    }
    setPrevAccuracy(learningStats.estimatedAccuracy);
  }, [learningStats?.estimatedAccuracy]);

  if (!learningStats && !isLearning) return null;

  const stats = learningStats ?? {};
  const accuracy = stats.estimatedAccuracy ?? 0;
  const sessions = stats.sessionCount ?? 0;
  const dataPoints = stats.totalDataPoints ?? 0;
  const lr = stats.learningRate ?? 0;
  const patterns = stats.patterns ?? {};
  const dist = stats.crashDistribution ?? {};
  const weights = stats.weights ?? {};

  const dominantPatternKey = Object.entries(patterns).sort((a, b) => b[1] - a[1])[0]?.[0];
  const patternLabels = {
    alternating: 'Alternant',
    trending: 'Tendanciel',
    cluster_low: 'Cluster bas',
    cluster_high: 'Cluster haut',
    mean_revert: 'Retour moyen',
  };
  const dominantPattern = patternLabels[dominantPatternKey] ?? '—';

  // Indicateur de convergence du LR
  const convergenceLevel = lr > 0.25 ? 'Exploration' : lr > 0.12 ? 'Apprentissage' : 'Convergence';
  const convergenceColor = lr > 0.25 ? '#f59e0b' : lr > 0.12 ? '#38bdf8' : '#4ade80';

  return (
    <div className={`learning-indicator ${isLearning ? 'learning' : ''} ${expanded ? 'expanded' : ''}`}>
      {/* ─── Barre compacte toujours visible ─── */}
      <div className="li-header" onClick={() => setExpanded((p) => !p)} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded((p) => !p)} aria-expanded={expanded}>
        <div className="li-header-left">
          <div className={`li-pulse ${isLearning ? 'active' : sessions > 0 ? 'ready' : 'idle'}`}>
            <span className="li-pulse-dot" />
          </div>
          <span className="li-title">
            {isLearning ? 'IA en apprentissage…' : sessions > 0 ? 'Modèle IA actif' : 'Modèle IA initialisé'}
          </span>
          {accuracyDelta !== null && (
            <span className={`li-delta ${accuracyDelta >= 0 ? 'up' : 'down'}`}>
              {accuracyDelta >= 0 ? '▲' : '▼'} {Math.abs(accuracyDelta).toFixed(1)}%
            </span>
          )}
        </div>

        <div className="li-header-right">
          <div className="li-accuracy-badge">
            <span className="li-accuracy-value">{accuracy}%</span>
            <span className="li-accuracy-label">précision</span>
          </div>
          <div className="li-sessions-badge">
            <span className="li-sessions-value">{sessions}</span>
            <span className="li-sessions-label">sessions</span>
          </div>
          <span className="li-chevron">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* ─── Barre de précision ─── */}
      <div className="li-accuracy-bar-wrap">
        <div className="li-accuracy-bar">
          <div
            className="li-accuracy-fill"
            style={{ width: `${accuracy}%` }}
          />
        </div>
        {isLearning && (
          <div className="li-scan-line" />
        )}
      </div>

      {/* ─── Panneau détaillé (expandable) ─── */}
      {expanded && (
        <div className="li-detail">
          {/* Stats principales */}
          <div className="li-stats-row">
            <div className="li-stat">
              <span className="li-stat-val">{dataPoints}</span>
              <span className="li-stat-lbl">points de données</span>
            </div>
            <div className="li-stat">
              <span className="li-stat-val">{dominantPattern}</span>
              <span className="li-stat-lbl">pattern dominant</span>
            </div>
            <div className="li-stat">
              <span className="li-stat-val" style={{ color: convergenceColor }}>
                {convergenceLevel}
              </span>
              <span className="li-stat-lbl">phase actuelle</span>
            </div>
            <div className="li-stat">
              <span className="li-stat-val">{lr.toFixed(3)}</span>
              <span className="li-stat-lbl">taux d'apprentissage η</span>
            </div>
          </div>

          {/* Distribution des crashs apprise */}
          <div className="li-section">
            <h4 className="li-section-title">Distribution apprise des crashs</h4>
            <div className="li-dist-bars">
              {[
                { key: 'range_1_15',  label: '< 1.5x',   color: '#ef4444' },
                { key: 'range_15_2',  label: '1.5–2x',   color: '#f97316' },
                { key: 'range_2_5',   label: '2–5x',     color: '#facc15' },
                { key: 'range_5_10',  label: '5–10x',    color: '#4ade80' },
                { key: 'range_10p',   label: '> 10x',    color: '#38bdf8' },
              ].map(({ key, label, color }) => {
                const pct = Math.round((dist[key] ?? 0) * 100);
                return (
                  <div key={key} className="li-dist-item">
                    <div className="li-dist-bar-wrap">
                      <div className="li-dist-bar-bg">
                        <div
                          className="li-dist-bar-fill"
                          style={{ height: `${pct}%`, background: color }}
                        />
                      </div>
                    </div>
                    <span className="li-dist-pct" style={{ color }}>{pct}%</span>
                    <span className="li-dist-label">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Poids des signaux */}
          <div className="li-section">
            <h4 className="li-section-title">Poids adaptatifs des signaux</h4>
            <div className="li-weights">
              {[
                { key: 'recentTrend',       label: 'Tendance récente' },
                { key: 'volatility',         label: 'Volatilité' },
                { key: 'patternFrequency',   label: 'Pattern freq.' },
                { key: 'meanReversion',      label: 'Moy. reversion' },
                { key: 'distributionBias',   label: 'Biais distrib.' },
              ].map(({ key, label }) => {
                const pct = Math.round((weights[key] ?? 0) * 100);
                return (
                  <div key={key} className="li-weight-row">
                    <span className="li-weight-label">{label}</span>
                    <div className="li-weight-bar-bg">
                      <div className="li-weight-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="li-weight-pct">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Patterns détectés */}
          <div className="li-section">
            <h4 className="li-section-title">Patterns détectés</h4>
            <div className="li-patterns">
              {Object.entries(patternLabels).map(([key, label]) => {
                const val = patterns[key] ?? 0;
                const pct = Math.round(val * 100);
                const strong = pct > 55;
                return (
                  <div key={key} className={`li-pattern-pill ${strong ? 'strong' : ''}`}>
                    <span className="li-pattern-name">{label}</span>
                    <span className="li-pattern-val">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bouton reset */}
          <div className="li-actions">
            <button className="li-reset-btn" onClick={onReset} type="button">
              🔄 Réinitialiser le modèle
            </button>
            <span className="li-data-note">
              Le modèle est sauvegardé automatiquement dans votre navigateur.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default LearningIndicator;
