import React, { useEffect, useState } from 'react';
import authService from '../services/authService';
import './Landing.css';

function Landing({ onLoginSuccess }) {
  const [authCode, setAuthCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  useEffect(() => {
    // Déclenche l'animation d'entrée
    const sects = document.querySelectorAll('.landing section');
    sects.forEach((s, i) => {
      s.style.setProperty('--stagger', i);
      s.classList.add('in');
    });

    // Compteurs du héros (respecte prefers-reduced-motion)
    const mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const counters = Array.from(document.querySelectorAll('.hero .counter'));
    if (counters.length) {
      const animateCounters = () => {
        counters.forEach((el) => {
          const target = parseFloat(el.getAttribute('data-target')) || 0;
          const suffix = el.getAttribute('data-suffix') || '';
          if (mediaReduced.matches) {
            el.textContent = `${target}${suffix}`;
            return;
          }
          const start = performance.now();
          const duration = 1200;
          const startVal = 0;
          const step = (t) => {
            const p = Math.min(1, (t - start) / duration);
            const value = Math.floor(startVal + (target - startVal) * p);
            el.textContent = `${value}${suffix}`;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      };
      const hero = document.querySelector('.landing .hero');
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { animateCounters(); io.disconnect(); } });
      }, { threshold: 0.6 });
      if (hero) io.observe(hero);
    }
  }, []);

  const [logoFiles, setLogoFiles] = useState([]);
  const prettyName = (file) => file
    .replace(/\.[^.]+$/, '')
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const fileSrc = (file) => `/logos/${encodeURIComponent(file)}`;

  useEffect(() => {
    // Découverte dynamique des fichiers logos via un endpoint statique simple
    const fallback = ['av1.jpeg','av2.jpeg','av3.jpeg','av4.jpeg','av6.jpeg','av9.jpeg'];
    fetch('/logos/manifest.json', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(arr => Array.isArray(arr) ? setLogoFiles(arr) : setLogoFiles(fallback))
      .catch(() => setLogoFiles(fallback));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    const normalizedCode = authCode.trim().toUpperCase();
    const isSuperAdminCode = normalizedCode === 'SUPERADMIN2026';
    const isUnlimitedAdminCode = normalizedCode === 'GILDAS12345@G';

    setAuthError('');
    setIsLoggingIn(true);

    if (isSuperAdminCode) {
      sessionStorage.setItem('adminAuth', 'true');
      window.location.hash = '#admin';
      setIsLoggingIn(false);
      return;
    }

    if (isUnlimitedAdminCode) {
      const result = await authService.login(normalizedCode);
      setIsLoggingIn(false);

      if (result.success) {
        if (onLoginSuccess) onLoginSuccess(result.session);
      } else {
        setAuthError(result.error);
      }
      return;
    }

    const result = await authService.login(normalizedCode);
    setIsLoggingIn(false);

    if (result.success) {
      if (onLoginSuccess) onLoginSuccess(result.session);
    } else {
      setAuthError(result.error);
    }
  };

  return (
    <div className="landing">
      {/* ===== SECTION HÉRO ===== */}
      <section className="hero fade-slide" id="hero">
        <div className="hero-inner">
          <div className="hero-grid">
            {/* Contenu principal du héros */}
            <div className="hero-copy">
            <h1 className="hero-title">
              Predisez vos gains sur Aviator avec l'IA
            </h1>
            <p className="hero-subtitle">
              Analysez les tendances, ajustez vos stratégies et maximisez vos chances de gains grâce à notre intelligence artificielle avancée.
            </p>
              
              {/* Points forts */}
            <div className="hero-highlights">
                <span className="pill">IA multi‑modèles</span>
                <span className="pill">Indice de confiance</span>
                <span className="pill">Stratégie Martingale</span>
                <span className="pill">Prêt à l'emploi</span>
            </div>
              
              {/* Formulaire de Connexion par Code */}
              <div className="hero-auth-box" id="connexion">
                <h3>Code d'accès</h3>
                <p>Entrez votre code d'accès (valable 2 mois)</p>
                <form onSubmit={handleLogin} className="auth-form">
                  <input 
                    type="text" 
                    placeholder="ex: X7K9P2M4" 
                    value={authCode}
                    maxLength={20}
                    onChange={(e) => setAuthCode(e.target.value)}
                    className="auth-input"
                    required
                  />
                  <button type="submit" className="btn-primary auth-submit" disabled={isLoggingIn || !authCode.trim()}>
                    {isLoggingIn ? 'Vérification...' : 'Se Connecter'}
                  </button>
                </form>
                {authError && <div className="auth-error">{authError}</div>}
                <div className="auth-note">
                  🔒 Un code est lié à un seul appareil.
                </div>
              </div>
            </div>
            
            {/* Logo et art visuel */}
            <div className="hero-art" aria-hidden="true">
              <div className="ring r1"></div>
              <div className="ring r2"></div>
              <div className="hero-logo-wrap">
                <img
                  src="/logos/Bet.png"
                  alt="CRASH PREDICTOR"
                  className="hero-logo"
                  width="180"
                  height="180"
                  loading="eager"
                />
              </div>
              <div className="glare"></div>
            </div>
          </div>
          
          {/* Statistiques du héros */}
            <div className="hero-stats">
              <div className="hero-stat" aria-label="Modèles d'IA">
              <span className="stat-value">
                <span className="counter" data-target="8" data-suffix="+">0</span>
              </span>
                <span className="stat-label">Modèles d'IA</span>
              </div>
              <div className="hero-stat" aria-label="Précision moyenne">
              <span className="stat-value">
                <span className="counter" data-target="92" data-suffix="%">0</span>
              </span>
                <span className="stat-label">Précision moyenne</span>
              </div>
              <div className="hero-stat" aria-label="Analyses">
              <span className="stat-value">
                <span className="counter" data-target="120" data-suffix="k+">0</span>
              </span>
                <span className="stat-label">Analyses</span>
            </div>
          </div>
        </div>
      </section>

      {logoFiles.length > 0 && (
        <div className="logo-strip" aria-label="Logos des partenaires et joueurs satisfaits">
          <div className="logo-track">
            {[...logoFiles, ...logoFiles].map((file, index) => (
              <div className="logo-item" key={`${file}-${index}`}>
                <img
                  src={fileSrc(file)}
                  alt={prettyName(file)}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== SECTION VIDÉO ===== */}
      <section className="video-showcase fade-slide" id="demo">
        <div className="section-inner">
          <h2 className="section-title main-heading">L'Algorithme en Action</h2>
          <p className="section-subtitle">Découvrez comment notre IA analyse les données en temps réel pour prédire les crashs.</p>
          <div className="video-container">
            {/* Espace réservé pour la vidéo. 
                L'utilisateur pourra remplacer le src par son vrai fichier */}
            <div className="video-wrapper">
              <video 
                controls 
                poster="/logos/Bet.png" 
                className="algo-video"
                preload="none"
              >
                <source src="/demo-video.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION FONCTIONNALITÉS ===== */}
      <section className="features fade-slide" id="features">
        <div className="section-inner">
          <h2 className="section-title main-heading">Fonctionnalités principales</h2>
        <div className="features-grid">
          <div className="feature-card">
          
            <h3 className="feature-title">Prédiction IA</h3>
            <p className="feature-desc">
              Algorithmes avancés combinant plusieurs modèles pour des prédictions précises avec indice de confiance.
            </p>
          </div>

          <div className="feature-card">
            
            <h3 className="feature-title">Analyse Statistique</h3>
            <p className="feature-desc">
              Analyse complète des tendances, volatilité et patterns pour comprendre le comportement du jeu.
            </p>
          </div>

          <div className="feature-card">
            
            <h3 className="feature-title">Détection Anti-Piège</h3>
            <p className="feature-desc">
              Système intelligent qui détecte les patterns trompeurs et vous alerte des situations risquées.
            </p>
          </div>

          <div className="feature-card">
            <h3 className="feature-title">Gestion</h3>
            <p className="feature-desc">
              Interface adaptée avec suivi de l'historique et de vos performances.
            </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION CAS D'USAGE ===== */}
      <section className="usecases fade-slide" id="usecases">
        <div className="section-inner">
          <h2 className="section-title main-heading">Adapté à tous les niveaux</h2>
          <div className="usecases-grid">
            <div className="usecase-card">
              <h3> Débutant</h3>
              <p>Comprenez les tendances et commencez avec des mises intelligentes adaptées à votre budget.</p>
              <ul>
                <li>Guide pas à pas</li>
                <li>Stratégie fixe recommandée</li>
                <li>Alertes anti-piège</li>
              </ul>
            </div>
            <div className="usecase-card">
              <h3>Intermédiaire</h3>
              <p>Mettez en place la Martingale ou l'Anti-Martingale avec des paramètres adaptés pour optimiser vos résultats.</p>
              <ul>
                <li>Analyse des risques</li>
                <li>Historique des crashs</li>
                <li>Indice de confiance de l'IA</li>
              </ul>
            </div>
            <div className="usecase-card">
              <h3>Avancé</h3>
              <p>Exploitez l'analyse avancée, la détection de patterns et optimisez votre ROI sur le long terme.</p>
              <ul>
                <li>Analyse multi-modèles</li>
                <li>Historique détaillé</li>
                <li>Export des résultats</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION TÉMOIGNAGES ===== */}
      <section className="testimonials fade-slide" id="testimonials">
        <div className="section-inner">
          <h2 className="section-title main-heading">Ils ont boosté leurs gains</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-text">"Grâce à CRASH PREDICTOR, j'ai enfin une stratégie claire. Je joue en confiance et je vois la différence."</p>
              <div className="testimonial-author">
                <div className="author-avatar">AM</div>
                <div>
                  <div className="author-name">Abdoulaye M.</div>
                  <div className="author-meta">Dakar, Sénégal</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">"L'analyse IA m'a évité des pertes. J'ajuste mes mises selon l'indice de confiance, c'est top."</p>
              <div className="testimonial-author">
                <div className="author-avatar">KF</div>
                <div>
                  <div className="author-name">Kouamé F.</div>
                  <div className="author-meta">Abidjan, Côte d'Ivoire</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">"Interface propre, résultats clairs, et surtout en FCFA. Je recommande."</p>
              <div className="testimonial-author">
                <div className="author-avatar">NZ</div>
                <div>
                  <div className="author-name">Nadia Z.</div>
                  <div className="author-meta">Yaoundé, Cameroun</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* ===== SECTION SÉCURITÉ ===== */}
      <section className="security fade-slide" id="security">
        <div className="section-inner">
          <h2 className="section-title main-heading">Sécurité & Transparence</h2>
          <div className="security-grid">
            <div className="badge">
              <div>
                <h4>Transparence</h4>
                <p>Explication claire des prédictions et des limites.</p>
              </div>
            </div>
            <div className="badge">
              <div>
                <h4>Tests continus</h4>
                <p>Améliorations data‑driven et revue régulière des modèles.</p>
              </div>
            </div>
            <div className="badge">
              <div>
                <h4>Protection</h4>
                <p>Gestion stricte des données et bonnes pratiques de sécurité.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION RESSOURCES ===== */}
      <section className="resources fade-slide" id="resources">
        <div className="section-inner">
          <h2 className="section-title main-heading">Ressources pour progresser</h2>
          <div className="resources-grid">
            <article className="resource-card">
              <h3> Comprendre la variance</h3>
              <p>Pourquoi la volatilité change tout et comment adapter votre stratégie.</p>
              <span className="link disabled">Article à venir</span>
            </article>
            <article className="resource-card">
              <h3>Martingale: mythe ou réalité</h3>
              <p>Les cas où elle marche, ceux où elle échoue, et nos recommandations.</p>
              <span className="link disabled">Article à venir</span>
            </article>
            <article className="resource-card">
              <h3>Check-list avant de jouer</h3>
              <p>5 points simples pour éviter les erreurs fréquentes et garder la tête froide.</p>
              <span className="link disabled">Article à venir</span>
            </article>
          </div>
        </div>
      </section>

      {/* ===== SECTION FAQ ===== */}
      <section className="faq fade-slide" id="faq">
        <div className="section-inner">
          <h2 className="section-title main-heading">Questions fréquentes</h2>
          <div className="faq-grid">
            <details className="faq-item">
              <summary>CRASH PREDICTOR fonctionne-t-il avec d'autres jeux que Aviator ?</summary>
              <p>Oui, la logique est adaptable à d'autres jeux de crash et de hasard. Aviator est notre premier module.</p>
            </details>
            <details className="faq-item">
              <summary>Dois-je déposer de l'argent pour tester ?</summary>
              <p>Non. L'outil d'analyse vous permet d'observer les tendances sans risquer votre argent.</p>
            </details>
            
            <details className="faq-item">
              <summary>Comment l'indice de confiance est-il calculé ?</summary>
              <p>Il combine la cohérence des modèles, la volatilité récente et la qualité des données saisies.</p>
            </details>
          </div>
        </div>
      </section>

      {/* ===== SECTION CTA FINALE ===== */}
      <section className="cta-wide fade-slide">
        <div className="cta-inner">
          <h2>Prêt à optimiser vos gains ?</h2>
          <p>Obtenez votre code d'accès et rejoignez des milliers d'utilisateurs qui font confiance à CRASH PREDICTOR</p>
          <div className="cta-actions">
            <button className="btn-primary" onClick={() => {
              document.getElementById('connexion')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Saisir mon code d'accès
            </button>
            <a href="https://t.me/votre_lien_telegram" target="_blank" rel="noopener noreferrer" className="btn-ghost">
              Acheter un code
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="site-footer fade-slide" id="contact">
        <div className="footer-inner">
          <div className="footer-col">
          <h6 className='footer-logo'>CRASH PREDICTOR</h6>
            <p className="footer-desc">Prédictions IA et analyses de données pour jouer avec un avantage.</p>
          </div>
          <div className="footer-col">
            <h4>Produits</h4>
            <ul>
              <li><a href="#features">Fonctionnalités</a></li>
              <li><a href="#testimonials">Avis de nos clients</a></li>
            
              <li><a href="#security">Sécurité</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Ressources</h4>
            <ul>
              <li><a href="#resources">Guides</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} <span className="footer-brand">CRASH PREDICTOR</span>. Tous droits réservés.
          <br />
          Développé par GX Technologie 
        </div>
      </footer>
    </div>
  );
}

export default Landing;