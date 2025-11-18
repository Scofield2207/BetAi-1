import React, { useState } from 'react';
import API_CONFIG from '../config/api';
import CrashForm from '../components/CrashForm';
import AnalysisDashboard from '../components/AnalysisDashboard';
import PredictionCard from '../components/PredictionCard';
import StrategySimulator from '../components/StrategySimulator';
import ProfitChart from '../components/ProfitChart';
import SimulationTable from '../components/SimulationTable';
import './AnalysisPage.css';

const USE_MOCK_API = process.env.REACT_APP_USE_MOCKS === 'true';

const MOCK_ANALYSIS_RESPONSE = {
  statistics: {
    mean: 2.18,
    median: 2.05,
    std: 0.54,
    variance: 0.29,
    volatility: 0.82,
    trend: 0.17,
    trap_indicator: 'normal',
    total_crashes: 128,
    low_crashes: 46,
    medium_crashes: 68,
    high_crashes: 14,
    total_rounds: 5,
    crash_data: [1.6, 2.4, 1.8, 2.7, 2.1],
  },
  prediction: {
    prediction: '2.34',
    confidence: 0.76,
    volatility_factor: 0.63,
    trend_factor: 0.18,
    ai_mode: 'equilibre',
  },
};

const MOCK_SIMULATION_RESPONSE = {
  simulation: {
    statistics: {
      total_profit: 19450,
      win_rate: 0.67,
      roi: 38.5,
      max_profit: 6050,
      min_profit: -6500,
      total_rounds: 12,
    },
    rounds: [
      { round: 1, crash: 2.4, bet: 5000, target: 2.0, result: 'WIN', profit: 5000, total_profit: 5000 },
      { round: 2, crash: 1.4, bet: 5000, target: 2.1, result: 'LOSS', profit: -6500, total_profit: -1500 },
      { round: 3, crash: 2.9, bet: 5000, target: 2.0, result: 'WIN', profit: 5000, total_profit: 3500 },
      { round: 4, crash: 3.2, bet: 5000, target: 2.3, result: 'WIN', profit: 6000, total_profit: 9500 },
      { round: 5, crash: 1.5, bet: 6000, target: 2.0, result: 'LOSS', profit: -6000, total_profit: 3500 },
      { round: 6, crash: 2.2, bet: 6000, target: 1.9, result: 'WIN', profit: 5400, total_profit: 8900 },
      { round: 7, crash: 2.8, bet: 5000, target: 2.1, result: 'WIN', profit: 5000, total_profit: 13900 },
      { round: 8, crash: 1.6, bet: 5000, target: 2.0, result: 'LOSS', profit: -5000, total_profit: 8900 },
      { round: 9, crash: 2.3, bet: 5000, target: 1.9, result: 'WIN', profit: 4500, total_profit: 13400 },
      { round: 10, crash: 2.7, bet: 5000, target: 2.0, result: 'WIN', profit: 5500, total_profit: 18900 },
      { round: 11, crash: 3.1, bet: 5200, target: 2.2, result: 'WIN', profit: 6050, total_profit: 24950 },
      { round: 12, crash: 1.7, bet: 5200, target: 2.0, result: 'LOSS', profit: -5500, total_profit: 19450 },
    ],
  },
};

const mockDelay = (ms = 650) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const shouldUseMockFallback = (error) => {
  if (USE_MOCK_API) return true;
  if (!error || !error.message) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('connection refused')
  );
};

const scrollToSection = (id) => {
  setTimeout(() => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};

function AnalysisPage({ onGoHome }) {
  const [analysisData, setAnalysisData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [simulationData, setSimulationData] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState(null);

  const isAnalysisLoading = loadingAction === 'analysis';
  const isSimulationLoading = loadingAction === 'simulation';

  const getFriendlyError = (message) => {
    if (!message) {
      return "Une erreur inattendue est survenue. Veuillez réessayer.";
    }
    if (message.toLowerCase().includes('failed to fetch')) {
      return "Impossible de contacter le serveur. Vérifie ta connexion internet puis réessaie.";
    }
    return message;
  };

  const clearLoading = (action) => {
    setLoadingAction((current) => (current === action ? null : current));
  };

  const applyMockAnalysis = async (aiMode) => {
    await mockDelay();
    setAnalysisData(MOCK_ANALYSIS_RESPONSE.statistics);
    setPredictionData({
      ...MOCK_ANALYSIS_RESPONSE.prediction,
      ai_mode: aiMode || MOCK_ANALYSIS_RESPONSE.prediction.ai_mode,
    });
    setSimulationData(null);
    scrollToSection('insights');
  };

  const applyMockSimulation = async () => {
    await mockDelay();
    setSimulationData(MOCK_SIMULATION_RESPONSE.simulation);
    scrollToSection('resultats');
  };

  const handleCrashSubmit = async (crashHistory, aiMode = 'equilibre') => {
    setLoadingAction('analysis');
    setError(null);

    if (USE_MOCK_API) {
      await applyMockAnalysis(aiMode);
      clearLoading('analysis');
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PREDICT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ crash_history: crashHistory, ai_mode: aiMode }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      setAnalysisData(data.statistics);
      setPredictionData(data.prediction);
      setSimulationData(null);
      scrollToSection('insights');
    } catch (err) {
      if (shouldUseMockFallback(err)) {
        console.warn('API Predict indisponible. Utilisation des données simulées.', err);
        await applyMockAnalysis(aiMode);
      } else {
        setError(getFriendlyError(err.message));
      }
    } finally {
      clearLoading('analysis');
    }
  };

  const handleSimulation = async (simulationParams) => {
    setLoadingAction('simulation');
    setError(null);

    if (USE_MOCK_API) {
      await applyMockSimulation();
      clearLoading('simulation');
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SIMULATE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          crash_history: simulationParams.crashHistory,
          initial_bet: simulationParams.initialBet,
          target_multiplier: simulationParams.targetMultiplier,
          num_rounds: simulationParams.numRounds,
          strategy_type: simulationParams.strategyType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      setSimulationData(data.simulation);
      scrollToSection('resultats');
    } catch (err) {
      if (shouldUseMockFallback(err)) {
        console.warn('API Simulate indisponible. Utilisation des données simulées.', err);
        await applyMockSimulation();
      } else {
        setError(getFriendlyError(err.message));
      }
    } finally {
      clearLoading('simulation');
    }
  };

  const defaultCrashHistory = analysisData?.crash_data || Array.from({ length: 5 }, (_, i) => 1.5 + i * 0.5);

  return (
    <div className="analysis-page">
      <main className="analysis-main">
        <div className="container">
          <section id="analyse" className="app-section">
            <CrashForm onSubmit={handleCrashSubmit} loading={isAnalysisLoading} />

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
          </section>

          {analysisData && (
            <section id="insights" className="app-section">
              <AnalysisDashboard data={analysisData} />

              {predictionData && (
                <PredictionCard prediction={predictionData} />
              )}
            </section>
          )}

          {analysisData && (
            <section id="strategie" className="app-section">
              <StrategySimulator
                crashHistory={defaultCrashHistory}
                onSimulate={handleSimulation}
                loading={isSimulationLoading}
              />
            </section>
          )}

          {simulationData && (
            <section id="resultats" className="app-section simulation-results">
              <h3>Résultats de la Simulation</h3>

              <ProfitChart simulationData={simulationData} />
              <SimulationTable simulationData={simulationData} />

              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Profit Total</h4>
                  <p className={simulationData.statistics.total_profit >= 0 ? 'positive' : 'negative'}>
                    {simulationData.statistics.total_profit} FCFA
                  </p>
                </div>
                <div className="stat-card">
                  <h4>Taux de Réussite</h4>
                  <p>{(simulationData.statistics.win_rate * 100).toFixed(1)}%</p>
                </div>
                <div className="stat-card">
                  <h4>ROI</h4>
                  <p className={simulationData.statistics.roi >= 0 ? 'positive' : 'negative'}>
                    {simulationData.statistics.roi}%
                  </p>
                </div>
                <div className="stat-card">
                  <h4>Gain Max</h4>
                  <p className="positive">{simulationData.statistics.max_profit} FCFA</p>
                </div>
                <div className="stat-card">
                  <h4>Perte Max</h4>
                  <p className="negative">{simulationData.statistics.min_profit} FCFA</p>
                </div>
                <div className="stat-card">
                  <h4>Tours Joués</h4>
                  <p>{simulationData.statistics.total_rounds}</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default AnalysisPage;

