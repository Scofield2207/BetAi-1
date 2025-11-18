import React, { useEffect, useState } from 'react';
import './Landing.css';

function Landing({ onPrimaryAction, onSecondaryAction }) {
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
  const triggerPrimaryAction = (source = 'cta_primary') => {
    if (typeof onPrimaryAction === 'function') {
      onPrimaryAction();
      window.dispatchEvent(new CustomEvent('analytics', { detail: { type: 'cta_primary', source } }));
    }
  };
  const triggerSecondaryAction = (source = 'cta_secondary') => {
    if (typeof onSecondaryAction === 'function') {
      onSecondaryAction();
      window.dispatchEvent(new CustomEvent('analytics', { detail: { type: 'cta_secondary', source } }));
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
              Analysez les tendances, simulez vos stratégies et maximisez vos chances de gains grâce à notre intelligence artificielle avancée.
            </p>
              
              {/* Points forts */}
            <div className="hero-highlights">
                <span className="pill">IA multi‑modèles</span>
                <span className="pill">Indice de confiance</span>
                <span className="pill">Stratégie Martingale</span>
                <span className="pill">Prêt à l'emploi</span>
            </div>
              
              {/* Boutons d'action */}
            <div className="hero-cta">
              
              <button 
                className="btn-primary btn-cta"
                  onClick={() => triggerPrimaryAction('hero_primary')}
              >
                Lancer une analyse
              </button>
                <button 
                className="btn-secondary btn-cta"
                  onClick={() => triggerSecondaryAction('hero_secondary')}
              >
                
                Voir la démo en direct
              </button>
            </div>
            </div>
            
            {/* Logo et art visuel */}
            <div className="hero-art" aria-hidden="true">
              <div className="ring r1"></div>
              <div className="ring r2"></div>
              <div className="hero-logo-wrap">
                <img
                  src="/logos/Bet.png"
                  alt="BetAi"
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
              <div className="hero-stat" aria-label="Simulations">
              <span className="stat-value">
                <span className="counter" data-target="120" data-suffix="k+">0</span>
              </span>
                <span className="stat-label">Simulations</span>
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
            <h3 className="feature-title">Gestion </h3>
            <p className="feature-desc">
              Interface adaptée  avec simulation de gains/pertes en monnaie locale.
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
              <p>Simulez Martingale et Anti-Martingale avec des paramètres personnalisés pour optimiser vos résultats.</p>
              <ul>
                <li>Simulation rapide</li>
                <li>Graphiques de performance</li>
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
              <p className="testimonial-text">"Grâce à BetAi, j'ai enfin une stratégie claire. Je joue en confiance et je vois la différence."</p>
              <div className="testimonial-author">
                <div className="author-avatar">AM</div>
                <div>
                  <div className="author-name">Abdoulaye M.</div>
                  <div className="author-meta">Dakar, Sénégal</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">"La simulation m'a évité des pertes. J'ajuste mes mises selon l'indice de confiance, c'est top."</p>
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
              <summary>BetAi fonctionne-t-il avec d'autres jeux que Aviator ?</summary>
              <p>Oui, la logique est adaptable à d'autres jeux de crash et de hasard. Aviator est notre premier module.</p>
            </details>
            <details className="faq-item">
              <summary>Dois-je déposer de l'argent pour tester ?</summary>
              <p>Non. Le simulateur vous permet de tester sans risquer votre argent.</p>
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
          <p>Rejoignez des milliers d'utilisateurs qui font confiance à BetAi</p>
          <div className="cta-actions">
            <button className="btn-primary" onClick={() => triggerPrimaryAction('cta_footer_primary')}>
              Démarrer une analyse
            </button>
            <button className="btn-ghost" onClick={() => triggerSecondaryAction('cta_footer_secondary')}>
              Voir la démo
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="site-footer fade-slide" id="contact">
        <div className="footer-inner">
          <div className="footer-col">
          <h6 className='footer-logo'>BetAi</h6>
            <p className="footer-desc">Prédictions IA, simulation de stratégie et analyse pour jouer avec un avantage.</p>
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
          © {new Date().getFullYear()} <span className="footer-brand">BetAi</span>. Tous droits réservés.
          <br />
          Développé par GX Technologie 
        </div>
      </footer>
    </div>
  );
}

export default Landing;