import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import Landing from './components/Landing';
import AnalysisPage from './pages/AnalysisPage';
import AdminPage from './pages/AdminPage';
import authService from './services/authService';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [session, setSession] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');

    // Check hash for admin route
    if (window.location.hash === '#admin') {
      setCurrentPage('admin');
    }

    // Handle hash changes
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentPage('admin');
      } else if (currentPage === 'admin') {
        setCurrentPage('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    // Vérifier la session au chargement
    const activeSession = authService.getSession();
    if (activeSession) {
      setSession(activeSession);
    } else {
      setSession(null);
      if (currentPage === 'analysis') {
        setCurrentPage('landing');
      }
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentPage]);

  const handleNavigate = (page) => {
    if (page === 'analysis' && !authService.getSession()) {
      page = 'landing';
    }
    
    if (page !== 'admin' && window.location.hash === '#admin') {
      window.location.hash = ''; // Clear hash if leaving admin
    }

    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleGoToAnalysis = () => {
    if (authService.getSession()) {
      setCurrentPage('analysis');
      window.scrollTo(0, 0);
    }
  };

  const handleLoginSuccess = (newSession) => {
    setSession(newSession);
    setCurrentPage('analysis');
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    authService.logout();
    setSession(null);
    setCurrentPage('landing');
    window.scrollTo(0, 0);
  };

  return (
    <div className="app">
      <NavBar 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        session={session}
        onLogout={handleLogout}
      />
      {currentPage === 'admin' ? (
        <AdminPage onGoHome={() => handleNavigate('landing')} />
      ) : currentPage === 'analysis' && session ? (
        <AnalysisPage onGoHome={() => handleNavigate('landing')} />
      ) : (
        <Landing
          onPrimaryAction={handleGoToAnalysis}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

export default App;