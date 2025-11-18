import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import Landing from './components/Landing';
import AnalysisPage from './pages/AnalysisPage';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleGoToAnalysis = () => {
    setCurrentPage('analysis');
    window.scrollTo(0, 0);
  };

  return (
    <div className="app">
      <NavBar currentPage={currentPage} onNavigate={handleNavigate} />
      {currentPage === 'analysis' ? (
        <AnalysisPage onGoHome={() => handleNavigate('landing')} />
      ) : (
        <Landing
          onPrimaryAction={handleGoToAnalysis}
          onSecondaryAction={handleGoToAnalysis}
        />
      )}
    </div>
  );
}

export default App;