import learningEngine from './learningEngine';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const mean = (values) => values.reduce((sum, val) => sum + val, 0) / values.length;

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

const standardDeviation = (values) => {
  const avg = mean(values);
  const variance = values.reduce((sum, val) => sum + (val - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
};

const trend = (values) => {
  if (values.length < 2) return 0;
  const n = values.length;
  const xMean = (n + 1) / 2;
  const yMean = mean(values);
  const numerator = values.reduce((sum, y, index) => sum + ((index + 1) - xMean) * (y - yMean), 0);
  const denominator = values.reduce((sum, x, index) => sum + ((index + 1) - xMean) ** 2, 0);
  return denominator === 0 ? 0 : numerator / denominator;
};

const volatility = (values) => {
  const std = standardDeviation(values);
  return std / Math.max(mean(values), 1);
};

const trapIndicator = (values) => {
  const last = values[values.length - 1];
  const prev = values[values.length - 2] ?? last;
  if (last < prev * 0.8) return 'trap';
  if (last > prev * 1.3) return 'spike';
  return 'normal';
};

const computeAnalysisStatistics = (crashHistory) => {
  const cleaned = crashHistory.filter((value) => typeof value === 'number' && value > 0);
  const stats = {
    mean: parseFloat(mean(cleaned).toFixed(2)),
    median: parseFloat(median(cleaned).toFixed(2)),
    std: parseFloat(standardDeviation(cleaned).toFixed(2)),
    variance: parseFloat((standardDeviation(cleaned) ** 2).toFixed(2)),
    volatility: parseFloat(volatility(cleaned).toFixed(2)),
    trend: parseFloat(trend(cleaned).toFixed(2)),
    trap_indicator: trapIndicator(cleaned),
    total_crashes: cleaned.length,
    low_crashes: cleaned.filter((x) => x < 1.5).length,
    medium_crashes: cleaned.filter((x) => x >= 1.5 && x < 2.5).length,
    high_crashes: cleaned.filter((x) => x >= 2.5).length,
    total_rounds: cleaned.length,
    crash_data: cleaned.slice(-10),
  };
  return stats;
};

const predictionConfidence = (stats, aiMode) => {
  const base = 0.6;
  const volatilityPenalty = clamp(0.2 - stats.volatility * 0.1, -0.2, 0.2);
  const trendBonus = clamp(stats.trend * 0.05, -0.1, 0.15);
  
  if (aiMode === 'recuperation') {
    // Mode Récupération : la confiance augmente si on sort d'une série noire (cluster_low)
    const recentLowCrashes = stats.crash_data.slice(-3).filter(x => x < 1.5).length;
    if (recentLowCrashes >= 2) {
      return clamp(base + 0.20 + trendBonus, 0.65, 0.94); // Haute confiance de rebond
    } else {
      return clamp(base - 0.20, 0.35, 0.50); // Faible confiance si pas de série noire
    }
  }

  if (aiMode === 'jackpot') {
    // Mode Jackpot : Confiance naturellement plus basse car pari très risqué
    // Mais augmente si la volatilité est élevée (signe de gros crashs potentiels)
    const jackpotConfidence = clamp(0.40 + stats.volatility * 0.2 + trendBonus, 0.25, 0.65);
    return jackpotConfidence;
  }

  const aiBonus = aiMode === 'prudent' ? 0.05 : aiMode === 'agressif' ? -0.05 : 0;
  return clamp(base + volatilityPenalty + trendBonus + aiBonus, 0.35, 0.94);
};

const predictionValue = (stats, aiMode) => {
  const base = stats.mean;
  const adjustment = stats.trend * 0.3 + (stats.volatility > 0.7 ? -0.15 : 0.1);
  
  if (aiMode === 'recuperation') {
    // Cible de récupération sécurisée (ex: 2.0x à 2.5x max) après une série noire
    const recentLowCrashes = stats.crash_data.slice(-3).filter(x => x < 1.5).length;
    if (recentLowCrashes >= 2) {
      return clamp(parseFloat((base + 0.5).toFixed(2)), 1.8, 2.5); // Vise un rebond moyen/sûr
    } else {
      return clamp(parseFloat((base - 0.5).toFixed(2)), 1.1, 1.5); // Recommande d'attendre (cible très basse)
    }
  }

  if (aiMode === 'jackpot') {
    // Cible Jackpot : Ignore la moyenne habituelle. Se base sur la variance maximale
    // Vise entre 5x et 15x selon l'écart-type et la volatilité.
    const jackpotTarget = 5.0 + (stats.volatility * stats.std * 1.5);
    return clamp(parseFloat(jackpotTarget.toFixed(2)), 5.0, 15.0);
  }

  const modeFactor = aiMode === 'prudent' ? -0.15 : aiMode === 'agressif' ? 0.15 : 0;
  const raw = base + adjustment + modeFactor;
  return clamp(parseFloat(raw.toFixed(2)), 1.1, 5.5);
};

const generatePrediction = (crashHistory, aiMode = 'equilibre') => {
  const stats = computeAnalysisStatistics(crashHistory);
  return {
    prediction: predictionValue(stats, aiMode).toFixed(2),
    confidence: predictionConfidence(stats, aiMode),
    volatility_factor: stats.volatility,
    trend_factor: stats.trend,
    ai_mode: aiMode,
    statistics: stats,
  };
};


export const generateAnalysisMock = (crashHistory, aiMode = 'equilibre') => {
  // ─── Apprentissage automatique à chaque soumission ───
  learningEngine.learn(crashHistory);
  const learnedPred = learningEngine.generateLearnedPrediction(crashHistory, aiMode);

  // Statistiques classiques (conservées pour les graphiques)
  const stats = computeAnalysisStatistics(crashHistory);

  // Prédiction enrichie par le modèle appris
  const basePred = generatePrediction(crashHistory, aiMode);

  // Fusion : on donne 60% au moteur appris, 40% au moteur classique
  // Sauf pour Jackpot où on laisse le moteur classique dicter le gros multiplicateur si l'apprentissage ne suit pas
  const sessions = learningEngine.getStats().sessionCount;
  const learnedWeight = aiMode === 'jackpot' ? 0.20 : Math.min(0.80, 0.40 + sessions * 0.04);
  const classicWeight = 1 - learnedWeight;

  const blendedPrediction = clamp(
    parseFloat(
      (learnedWeight * learnedPred.predicted_multiplier
      + classicWeight * parseFloat(basePred.prediction)).toFixed(2)
    ),
    1.10, 15.0
  );

  const blendedConfidence = clamp(
    (learnedWeight * learnedPred.confidence / 100
    + classicWeight * basePred.confidence),
    0.35, 0.95
  );

  const prediction = {
    ...basePred,
    prediction: blendedPrediction.toFixed(2),
    confidence: parseFloat(blendedConfidence.toFixed(4)),
    risk_level:     learnedPred.risk_level,
    recommendation: learnedPred.recommendation,
    alert:          learnedPred.alert,
    alertType:      learnedPred.alertType,
    learning_state: learnedPred.learning_state,
    is_learned:     sessions > 0,
  };

  return {
    statistics: stats,
    prediction,
  };
};
