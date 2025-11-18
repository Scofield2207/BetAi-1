import React, { useState, useEffect } from 'react';
import './NavBar.css';

function NavBar({ currentPage, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('nav-menu-open', menuOpen);
    return () => {
      document.body.classList.remove('nav-menu-open');
    };
  }, [menuOpen]);

  const handleMenuToggle = () => setMenuOpen((prev) => !prev);
  const handleNavClick = (page) => {
    setMenuOpen(false);
    if (onNavigate) {
      onNavigate(page);
    }
  };

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMenuOpen(false);
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <nav className="navbar-container">
        <div className="navbar-brand" onClick={() => handleNavClick('landing')}>
          <img
            src="/logos/Bet.png"
            alt="BetAi"
            width="40"
            height="40"
            loading="eager"
          />
          <span>BetAi</span>
        </div>

        <button
          type="button"
          className={`navbar-toggle ${menuOpen ? 'active' : ''}`}
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
          onClick={handleMenuToggle}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          {currentPage === 'landing' ? (
            <>
              <a href="#features" onClick={(e) => handleLinkClick(e, '#features')}>
                Fonctionnalités
              </a>
              <a href="#testimonials" onClick={(e) => handleLinkClick(e, '#testimonials')}>
                Avis de nos clients
              </a>
              <a href="#faq" onClick={(e) => handleLinkClick(e, '#faq')}>
                FAQ
              </a>
            </>
          ) : null}
          
          <button
            className="navbar-btn navbar-btn-primary"
            onClick={() => handleNavClick('analysis')}
          >
            {currentPage === 'landing' ? 'Analyser' : 'Nouvelle Analyse'}
          </button>
          
        </div>
      </nav>
    </header>
  );
}

export default NavBar;

