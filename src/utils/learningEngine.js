/**
 * BetAI — Moteur d'Apprentissage Adaptatif (Online Learning Engine)
 * ─────────────────────────────────────────────────────────────────
 * À chaque soumission de données, l'IA :
 *  1. Met à jour la distribution des crashes (Bayesian EMA update)
 *  2. Détecte et apprend les patterns dominants (alternant, tendanciel, cluster)
 *  3. Ajuste dynamiquement les poids des features
 *  4. Recalcule sa précision estimée
 *  5. Persiste l'état dans localStorage pour continuer d'apprendre entre sessions
 */

const STORAGE_KEY = 'betai_learning_state_v2';

/* ─── helpers ─────────────────────────────────────────── */
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const avg   = (arr) => arr.reduce((s, x) => s + x, 0) / arr.length;
const std   = (arr) => {
  const m = avg(arr);
  return Math.sqrt(arr.reduce((s, x) => s + (x - m) ** 2, 0) / arr.length);
};
const normalise = (obj) => {
  const total = Object.values(obj).reduce((s, v) => s + v, 0);
  const out = {};
  Object.keys(obj).forEach((k) => { out[k] = obj[k] / total; });
  return out;
};

/* ─── état initial (prior vierge) ─────────────────────── */
function getInitialState() {
  return {
    version: 2,
    sessionCount: 0,         // nombre de soumissions
    totalDataPoints: 0,      // nombre total de valeurs traitées

    // Distribution apprise des crashs (probabilités par plage)
    crashDistribution: {
      range_1_15:  0.30,     // crashes  1x – 1.5x  (très petits)
      range_15_2:  0.25,     // crashes  1.5x – 2x
      range_2_5:   0.28,     // crashes  2x – 5x
      range_5_10:  0.11,     // crashes  5x – 10x
      range_10p:   0.06,     // crashes  >10x
    },

    // Poids adaptatifs des signaux de prédiction
    weights: {
      recentTrend:       0.30,
      volatility:        0.20,
      patternFrequency:  0.25,
      meanReversion:     0.15,
      distributionBias:  0.10,
    },

    // Paramètres statistiques appris
    learnedParams: {
      avgCrash:             2.10,
      stdCrash:             1.60,
      medianCrash:          1.80,
      maxConsecutiveLow:    2,
      consecutiveLowProb:   0.30,
      streakThreshold:      3,
    },

    // Patterns détectés (0–1)
    patterns: {
      alternating:   0.0,   // alternance hauts / bas
      trending:      0.0,   // tendance progressive
      cluster_low:   0.0,   // clusters de petits crashs
      cluster_high:  0.0,   // clusters de grands crashs
      mean_revert:   0.0,   // retour vers la moyenne
    },

    // Précision auto-estimée (actualisée à chaque session)
    estimatedAccuracy: 0.65,

    // Dernières prédictions (pour mesurer le feedback)
    predictionHistory: [],

    // Logs d'apprentissage (dernières sessions)
    learningLog: [],
  };
}

/* ════════════════════════════════════════════════════════
   Classe principale : AdaptiveLearningEngine
   ════════════════════════════════════════════════════════ */
class AdaptiveLearningEngine {
  constructor() {
    this.state = this._load();
  }

  /* ── Persistance ─────────────────────────────────────── */
  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.version === 2) return parsed;
      }
    } catch (_) { /* silencieux */ }
    return getInitialState();
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (_) { /* silencieux */ }
  }

  /* ── Taux d'apprentissage décroissant (convergence) ─── */
  _learningRate() {
    // Commence à 0.35, converge vers 0.05 après ~50 sessions
    return clamp(0.35 / (1 + 0.06 * this.state.sessionCount), 0.05, 0.35);
  }

  /* ── 1. Mise à jour de la distribution (Bayesian EMA) ─ */
  _updateDistribution(history, eta) {
    const n = history.length;
    const counts = { range_1_15: 0, range_15_2: 0, range_2_5: 0, range_5_10: 0, range_10p: 0 };
    history.forEach((v) => {
      if (v < 1.5)  counts.range_1_15++;
      else if (v < 2) counts.range_15_2++;
      else if (v < 5)  counts.range_2_5++;
      else if (v < 10) counts.range_5_10++;
      else             counts.range_10p++;
    });
    const dist = this.state.crashDistribution;
    Object.keys(counts).forEach((k) => {
      dist[k] = (1 - eta) * dist[k] + eta * (counts[k] / n);
    });
    // Re-normalise pour garantir que la somme = 1
    const total = Object.values(dist).reduce((s, v) => s + v, 0);
    Object.keys(dist).forEach((k) => { dist[k] /= total; });
  }

  /* ── 2. Détection et mise à jour des patterns ─────────── */
  _updatePatterns(history, eta) {
    const n = history.length;
    if (n < 3) return;

    let alt = 0, trend = 0;
    for (let i = 1; i < n - 1; i++) {
      const p = history[i - 1], c = history[i], nx = history[i + 1];
      if ((c > p && c > nx) || (c < p && c < nx)) alt++;
      if ((c > p && nx > c) || (c < p && nx < c)) trend++;
    }
    const base = n - 2;

    const recentW = Math.min(6, n);
    const recent = history.slice(-recentW);
    const clLow  = recent.filter((v) => v < 1.6).length / recentW;
    const clHigh = recent.filter((v) => v > 5).length / recentW;

    // Mean-reversion : les valeurs restent proches de la moyenne apprise
    const m = avg(history);
    const mr = history.filter((v) => Math.abs(v - m) < 0.5).length / n;

    const p = this.state.patterns;
    p.alternating  = (1 - eta) * p.alternating  + eta * (alt   / base);
    p.trending     = (1 - eta) * p.trending     + eta * (trend / base);
    p.cluster_low  = (1 - eta) * p.cluster_low  + eta * clLow;
    p.cluster_high = (1 - eta) * p.cluster_high + eta * clHigh;
    p.mean_revert  = (1 - eta) * p.mean_revert  + eta * mr;
  }

  /* ── 3. Mise à jour des paramètres statistiques ────────── */
  _updateLearnedParams(history, eta) {
    const lp = this.state.learnedParams;
    const m  = avg(history);
    const s  = std(history);
    const sorted = [...history].sort((a, b) => a - b);
    const med = sorted[Math.floor(sorted.length / 2)];

    lp.avgCrash    = (1 - eta) * lp.avgCrash    + eta * m;
    lp.stdCrash    = (1 - eta) * lp.stdCrash    + eta * s;
    lp.medianCrash = (1 - eta) * lp.medianCrash + eta * med;

    // Longueur max de série de petits crashs
    let maxCons = 0, curCons = 0;
    history.forEach((v) => {
      curCons = v < 2 ? curCons + 1 : 0;
      maxCons = Math.max(maxCons, curCons);
    });
    lp.maxConsecutiveLow = Math.round(
      (1 - eta) * lp.maxConsecutiveLow + eta * maxCons
    );
    lp.consecutiveLowProb = (1 - eta) * lp.consecutiveLowProb
      + eta * (maxCons / Math.max(1, history.length));
    lp.streakThreshold = Math.max(2, Math.round(
      (1 - eta) * lp.streakThreshold + eta * Math.max(2, maxCons)
    ));
  }

  /* ── 4. Mise à jour dynamique des poids ─────────────── */
  _updateWeights(eta) {
    const w = this.state.weights;
    const p = this.state.patterns;

    // Pattern alternatif fort → on favorise le signal de pattern
    if (p.alternating > 0.55) {
      w.patternFrequency = Math.min(0.45, w.patternFrequency + eta * 0.08);
      w.recentTrend      = Math.max(0.10, w.recentTrend      - eta * 0.04);
    }
    // Tendance forte → on favorise le signal de trend
    if (p.trending > 0.55) {
      w.recentTrend      = Math.min(0.45, w.recentTrend      + eta * 0.08);
      w.meanReversion    = Math.max(0.05, w.meanReversion    - eta * 0.04);
    }
    // Cluster de petits crashs → on penche vers la distribution
    if (p.cluster_low > 0.55) {
      w.distributionBias = Math.min(0.30, w.distributionBias + eta * 0.06);
      w.volatility       = Math.max(0.10, w.volatility       - eta * 0.03);
    }
    // Mean-reversion forte → on augmente ce signal
    if (p.mean_revert > 0.60) {
      w.meanReversion    = Math.min(0.35, w.meanReversion    + eta * 0.05);
    }

    // Normalise pour que la somme reste 1
    const norm = normalise(w);
    Object.assign(w, norm);
  }

  /* ── 5. Précision auto-estimée ────────────────────────── */
  _updateEstimatedAccuracy() {
    const hist = this.state.predictionHistory;
    const n    = this.state.totalDataPoints;

    // Amélioration progressive avec l'accumulation de données
    const dataBonus = clamp(n * 0.0008, 0, 0.18);

    if (hist.length < 5) {
      this.state.estimatedAccuracy = clamp(0.62 + dataBonus, 0.62, 0.92);
      return;
    }
    const recent = hist.slice(-20);
    const hits   = recent.filter((h) => h.hit).length;
    const measured = hits / recent.length;
    this.state.estimatedAccuracy = clamp(
      0.65 * this.state.estimatedAccuracy + 0.35 * measured + dataBonus,
      0.55, 0.95
    );
  }

  /* ════════════════════════════════════════════════════════
     API publique
     ════════════════════════════════════════════════════════ */

  /**
   * learn(crashHistory) — Point d'entrée principal
   * Appelé automatiquement à chaque soumission de données.
   * Retourne l'état après apprentissage.
   */
  learn(crashHistory) {
    const cleaned = crashHistory.filter((v) => typeof v === 'number' && v > 1.0);
    if (cleaned.length < 3) return this.state;

    const eta = this._learningRate();

    this.state.sessionCount++;
    this.state.totalDataPoints += cleaned.length;

    this._updateDistribution(cleaned, eta);
    this._updatePatterns(cleaned, eta);
    this._updateLearnedParams(cleaned, eta);
    this._updateWeights(eta);
    this._updateEstimatedAccuracy();

    // Log de la session
    this.state.learningLog.push({
      session: this.state.sessionCount,
      dataPoints: cleaned.length,
      eta: parseFloat(eta.toFixed(4)),
      accuracy: parseFloat(this.state.estimatedAccuracy.toFixed(4)),
      timestamp: Date.now(),
    });
    if (this.state.learningLog.length > 50) this.state.learningLog.shift();

    this._save();
    return this.state;
  }

  /**
   * generateLearnedPrediction(crashHistory, aiMode)
   * Génère une prédiction enrichie par l'état appris.
   */
  generateLearnedPrediction(crashHistory, aiMode = 'equilibre') {
    const state  = this.state;
    const lp     = state.learnedParams;
    const dist   = state.crashDistribution;
    const pat    = state.patterns;
    const w      = state.weights;
    const n      = crashHistory.length;
    const recent = crashHistory.slice(-5);

    const recentMean  = avg(recent);
    const globalMean  = avg(crashHistory);
    const trendSlope  = n >= 2
      ? (crashHistory[n - 1] - crashHistory[n - 2]) * 0.5
      : 0;

    /* ─ Construction du score de prédiction ─ */
    let score = 0;

    // Signal 1 — Mean reversion vers la moyenne apprise
    score += w.meanReversion * lp.avgCrash;

    // Signal 2 — Tendance récente
    score += w.recentTrend * (recentMean + trendSlope);

    // Signal 3 — Pattern fréquent
    if (pat.alternating > 0.5) {
      const lastHigh = crashHistory[n - 1] > recentMean;
      score += w.patternFrequency * (lastHigh ? recentMean * 0.72 : recentMean * 1.28);
    } else {
      score += w.patternFrequency * recentMean;
    }

    // Signal 4 — Volatilité
    const vol = lp.stdCrash / Math.max(lp.avgCrash, 1);
    score += w.volatility * (globalMean * (1 + (vol - 0.75) * 0.18));

    // Signal 5 — Biais de distribution (si la distribution est skewed)
    const lowBias = dist.range_1_15 + dist.range_15_2;  // prob < 2x
    const highBias = dist.range_5_10 + dist.range_10p;   // prob > 5x
    if (lowBias > 0.65) {
      score += w.distributionBias * (lp.avgCrash * 0.75);
    } else if (highBias > 0.25) {
      score += w.distributionBias * (lp.avgCrash * 1.35);
    } else {
      score += w.distributionBias * lp.avgCrash;
    }

    /* ─ Facteur selon le mode IA ─ */
    let modeFactor = 1.0;
    if (aiMode === 'prudent') modeFactor = 0.82;
    if (aiMode === 'agressif') modeFactor = 1.22;
    
    score *= modeFactor;

    if (aiMode === 'recuperation') {
      // Stratégie de récupération : Si cluster_low est détecté, on vise le rebond.
      // Sinon, on abaisse le score pour forcer la recommandation "ATTENDRE".
      if (pat.cluster_low > 0.4 || recent.filter(x => x < 1.5).length >= 2) {
        score = Math.max(score, 2.10); // Vise au moins un multiplicateur de 2x pour récupérer
      } else {
        score = 1.20; // Pas de série noire, pas de récupération à faire
      }
    } else if (aiMode === 'jackpot') {
      // Stratégie Jackpot : Si la volatilité (cluster_high ou trend) le permet, on booste fort.
      if (pat.cluster_high > 0.2 || highBias > 0.15 || vol > 0.8) {
        score = Math.max(score, 5.50);
      } else {
        score = Math.max(score, 3.50); // Toujours viser haut, même si risqué
      }
    }

    score = clamp(parseFloat(score.toFixed(2)), 1.10, 15.0);

    /* ─ Confiance ─ */
    const dataQuality   = clamp(n / 30, 0.1, 1.0);
    const patternClarity = Math.max(pat.alternating, pat.trending, pat.mean_revert);
    let rawConf = state.estimatedAccuracy * 0.60
      + dataQuality  * 0.25
      + patternClarity * 0.15;

    if (aiMode === 'recuperation') {
      if (pat.cluster_low > 0.4 || recent.filter(x => x < 1.5).length >= 2) {
        rawConf += 0.20; // Rebond imminent très probable
      } else {
        rawConf -= 0.30; // Pas les conditions de ce mode
      }
    } else if (aiMode === 'jackpot') {
      // La confiance pour le jackpot est toujours divisée pour refléter le risque
      rawConf = rawConf * 0.5 + (pat.cluster_high > 0.2 ? 0.1 : 0);
    }

    const confidence = clamp(Math.round(rawConf * 100), 50, 95);

    /* ─ Niveau de risque ─ */
    let riskLevel = 'MODÉRÉ';
    let alert = null;
    let alertType = 'info';

    if (aiMode === 'recuperation') {
      if (pat.cluster_low > 0.4 || recent.filter(x => x < 1.5).length >= 2) {
        riskLevel = 'FAIBLE';
        alert = '🔁 Mode Récupération : Fin de série noire détectée. Rebond imminent, feu vert pour récupérer vos pertes.';
        alertType = 'success';
      } else {
        riskLevel = 'TRÈS ÉLEVÉ';
        alert = '🛡️ Mode Récupération : Pas de série noire en cours. L\'IA vous conseille d\'attendre pour préserver votre capital.';
        alertType = 'warning';
      }
    } else if (aiMode === 'jackpot') {
      riskLevel = 'EXTRÊME';
      if (pat.cluster_high > 0.2 || highBias > 0.15 || vol > 0.8) {
        alert = '🚀 Cible Jackpot possible : Volatilité très favorable. Tentez un multiplicateur > 5x avec une petite mise.';
        alertType = 'success';
      } else {
        alert = '⚠️ Chasseur de Jackpot : Le marché est calme. Les probabilités d\'un x5+ sont faibles pour ce tour.';
        alertType = 'warning';
      }
    } else {
      // Logique classique
      if (pat.cluster_low > 0.62) {
        riskLevel = 'TRÈS ÉLEVÉ';
        alert = '🔴 Cluster de petits crashs en cours. L\'IA recommande d\'attendre.';
        alertType = 'danger';
      } else if (lowBias > 0.65) {
        riskLevel = 'ÉLEVÉ';
        alert = '⚠️ Forte probabilité de crashes < 2x. Prudence recommandée.';
        alertType = 'warning';
      } else if (highBias > 0.20 || pat.cluster_high > 0.35) {
        riskLevel = 'FAIBLE';
        alert = '✨ Patterns favorables détectés. Fenêtre potentiellement intéressante.';
        alertType = 'success';
      } else if (pat.trending > 0.55 && trendSlope > 0) {
        riskLevel = 'MODÉRÉ';
        alert = '📈 Tendance haussière détectée sur les derniers crashs.';
        alertType = 'info';
      }
    }

    /* ─ Pattern dominant ─ */
    const patEntries = Object.entries(pat).sort((a, b) => b[1] - a[1]);
    const dominantPattern = {
      alternating:  'Alternant',
      trending:     'Tendanciel',
      cluster_low:  'Cluster bas',
      cluster_high: 'Cluster haut',
      mean_revert:  'Retour moyen',
    }[patEntries[0][0]] ?? 'Mixte';

    /* ─ Recommandation ─ */
    const recommendation = score >= 2.0 ? 'FAVORABLE' : score >= 1.5 ? 'NEUTRE' : 'ATTENDRE';

    return {
      predicted_multiplier: score,
      confidence,
      risk_level: riskLevel,
      recommendation,
      alert,
      alertType,
      learning_state: {
        sessions:        state.sessionCount,
        data_points:     state.totalDataPoints,
        accuracy:        Math.round(state.estimatedAccuracy * 100),
        learning_rate:   parseFloat(this._learningRate().toFixed(4)),
        dominant_pattern: dominantPattern,
        weights:         { ...state.weights },
        distribution:    { ...state.crashDistribution },
      },
    };
  }

  /** Retourne les statistiques d'apprentissage pour l'affichage UI */
  getStats() {
    const s = this.state;
    return {
      sessionCount:      s.sessionCount,
      totalDataPoints:   s.totalDataPoints,
      estimatedAccuracy: Math.round(s.estimatedAccuracy * 100),
      learningRate:      parseFloat(this._learningRate().toFixed(4)),
      learnedParams:     { ...s.learnedParams },
      crashDistribution: { ...s.crashDistribution },
      patterns:          { ...s.patterns },
      weights:           { ...s.weights },
      learningLog:       s.learningLog.slice(-5),
    };
  }

  /** Réinitialise le modèle (bouton reset) */
  reset() {
    this.state = getInitialState();
    this._save();
  }
}

// Singleton partagé dans toute l'application
export const learningEngine = new AdaptiveLearningEngine();
export default learningEngine;
