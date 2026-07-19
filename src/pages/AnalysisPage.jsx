import React, { useState } from 'react';
import API_CONFIG from '../config/api';
import { generateAnalysisMock } from '../utils/calculationEngine';
import learningEngine from '../utils/learningEngine';
import CrashForm from '../components/CrashForm';
import AnalysisDashboard from '../components/AnalysisDashboard';
import PredictionCard from '../components/PredictionCard';
import LearningIndicator from '../components/LearningIndicator';
import './AnalysisPage.css';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCKS === 'true';

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
  const [analysisData, setAnalysisData]     = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [loadingAction, setLoadingAction]   = useState(null);
  const [error, setError]                   = useState(null);
  const [learningStats, setLearningStats]   = useState(() => learningEngine.getStats());
  const [isLearning, setIsLearning]         = useState(false);

  const isAnalysisLoading = loadingAction === 'analysis';

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

  const applyMockAnalysis = async (crashHistory, aiMode) => {
    await mockDelay();
    const { statistics, prediction } = generateAnalysisMock(crashHistory, aiMode);
    setAnalysisData(statistics);
    setPredictionData(prediction);
    scrollToSection('insights');
  };



  const handleCrashSubmit = async (crashHistory, aiMode = 'equilibre') => {
    setLoadingAction('analysis');
    setIsLearning(true);
    setError(null);

    if (USE_MOCK_API) {
      await applyMockAnalysis(crashHistory, aiMode);
      setLearningStats(learningEngine.getStats());
      setIsLearning(false);
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
      scrollToSection('insights');
    } catch (err) {
      if (shouldUseMockFallback(err)) {
        console.warn('API Predict indisponible. Utilisation des données simulées.', err);
        await applyMockAnalysis(crashHistory, aiMode);
      } else {
        setError(getFriendlyError(err.message));
      }
    } finally {
      setLearningStats(learningEngine.getStats());
      setIsLearning(false);
      clearLoading('analysis');
    }
  };



  const handleResetModel = () => {
    learningEngine.reset();
    setLearningStats(learningEngine.getStats());
  };

  return (
    <div className="analysis-page">
      <main className="analysis-main">
        <div className="container">
          <section id="analyse" className="app-section">
            {/* ─── Indicateur d'apprentissage IA ─── */}
            <LearningIndicator
              learningStats={learningStats}
              isLearning={isLearning}
              onReset={handleResetModel}
            />

            <CrashForm onSubmit={handleCrashSubmit} loading={isAnalysisLoading} />

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
          </section>

          {analysisData && (
            <section id="insights" className="app-section">
              {predictionData && (
                <PredictionCard prediction={predictionData} />
              )}

              <AnalysisDashboard data={analysisData} />
            </section>
          )}


        </div>
      </main>
    </div>
  );
}

export default AnalysisPage;

