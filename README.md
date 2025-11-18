# 🚀 BetAI - Plateforme d'Analyse et Prédiction de Crashs avec IA

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3+-000000.svg)](https://flask.palletsprojects.com/)

> **BetAI** est une plateforme sophistiquée d'analyse et de prédiction de crashs de jeux de hasard, utilisant l'intelligence artificielle pour analyser les tendances et simuler des stratégies de paris avancées.

## ✨ Fonctionnalités Principales

### 🧠 **Intelligence Artificielle Avancée**
- **Prédictions IA** basées sur l'historique des crashs
- **Analyse de patterns** avec détection d'anomalies
- **Modes d'IA** : Prudent, Équilibré, Agressif
- **Confiance prédictive** avec métriques de fiabilité

### 📊 **Analyse Statistique Complète**
- **Statistiques en temps réel** des crashs
- **Graphiques interactifs** et visualisations
- **Détection de pièges** et patterns suspects
- **Historique détaillé** avec filtres avancés

### 🎯 **Simulateur de Stratégies**
- **Mise Fixe** : Stratégie conservatrice
- **Martingale** : Doublement progressif
- **Anti-Martingale** : Doublement après gains
- **Simulations personnalisées** avec paramètres ajustables

### 💳 **Système de Paiement Intégré**
- **MTN Mobile Money** 🇹🇬
- **Moov Money** 🇹🇬
- **Celtiis** 🇹🇬
- **Validation admin** en temps réel
- **Gestion des abonnements** automatique

### 🔐 **Sécurité et Authentification**
- **Système de connexion** sécurisé
- **Gestion des sessions** avec timeout
- **Validation des paiements** admin
- **Protection CORS** et headers de sécurité

## 🏗️ Architecture Technique

### **Backend (Flask + Python)**
```
backend/
├── app.py                 # Application principale Flask
├── requirements.txt       # Dépendances Python
├── config/               # Configuration par environnement
│   ├── production.py     # Config production
│   └── development.py    # Config développement
└── templates/            # Templates HTML admin
    └── admin_panel.html  # Interface d'administration
```

### **Frontend (React + JavaScript)**
```
frontend/
├── src/
│   ├── components/       # Composants React
│   ├── config/          # Configuration
│   │   ├── index.js     # Config principale
│   │   ├── production.js # Config production
│   │   └── development.js # Config développement
│   └── App.js           # Composant principal
├── public/              # Fichiers statiques
└── package.json         # Dépendances Node.js
```

### **Base de Données (SQLite/PostgreSQL)**
- **Users** : Gestion des utilisateurs
- **User_subscriptions** : Abonnements et statuts
- **Payments** : Historique des paiements
- **External_transactions** : Transactions externes
- **User_payment_events** : Événements de paiement

## 🚀 Installation et Démarrage

### **Prérequis**
- Python 3.8+
- Node.js 16+
- Git
- Navigateur web moderne

### **1. Cloner le projet**
```bash
git clone https://github.com/votre-username/BetAI.git
cd BetAI
```

### **2. Backend (Flask)**
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Le serveur démarre sur `https://monapi.onrender.com`

### **3. Frontend (React)**
```bash
cd frontend
npm install
npm start
```
L'application s'ouvre sur `http://localhost:3000`

### **4. Accès Admin**
- **URL** : `https://monapi.onrender.com/admin/login`
- **Identifiants** : Voir la console du backend

## 🌐 Déploiement sur Render

### **Déploiement automatique**
1. Connectez votre repository GitHub à Render
2. Render détecte automatiquement le `render.yaml`
3. Configuration automatique des services
4. Déploiement en quelques minutes

### **Services créés**
- **Backend** : API Flask avec gunicorn
- **Frontend** : Site React en hosting statique
- **Base de données** : PostgreSQL gérée

### **Variables d'environnement**
```bash
# Backend
PYTHON_VERSION=3.9.16
PORT=5000
DATABASE_PATH=/opt/render/project/src/backend/betai.db
WEBHOOK_SECRET=[Généré automatiquement]

# API de paiement
MOOV_API_KEY=[Votre clé]
MOOV_API_SECRET=[Votre secret]
MTN_API_KEY=[Votre clé]
MTN_API_SECRET=[Votre secret]
CELTIIS_API_KEY=[Votre clé]
CELTIIS_API_SECRET=[Votre secret]

# Frontend
REACT_APP_API_URL=https://betai-backend.onrender.com
REACT_APP_ENVIRONMENT=production
```

## 📱 Utilisation

### **1. Création de compte**
- Remplir le formulaire d'inscription
- Vérifier l'email (optionnel)
- Choisir un plan d'abonnement

### **2. Paiement et activation**
- Sélectionner l'opérateur de paiement
- Suivre les instructions de paiement
- Attendre la validation admin
- Accès immédiat après validation

### **3. Analyse et prédictions**
- Saisir l'historique des crashs
- Choisir le mode d'IA
- Obtenir prédictions avec niveau de confiance
- Simuler différentes stratégies

### **4. Administration**
- **Panel admin** : `/admin/login`
- **Gestion des paiements** en temps réel
- **Validation/rejet** des demandes
- **Monitoring** des utilisateurs

## 🔧 Configuration Avancée

### **Variables d'environnement**
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Configurer les variables
FLASK_ENV=development
SECRET_KEY=votre-cle-secrete
MOOV_API_KEY=votre-cle-api
# ... autres variables
```

### **Configuration de la base de données**
```python
# Dans backend/app.py
DATABASE_PATH = os.environ.get('DATABASE_PATH', 'betai.db')
```

### **Configuration CORS**
```python
# Origines autorisées
CORS_ORIGINS = [
    'http://localhost:3000',
    'https://votre-domaine.com'
]
```

## 📊 API Endpoints

### **Authentification**
- `POST /register` - Inscription utilisateur
- `POST /login` - Connexion utilisateur
- `POST /logout` - Déconnexion
- `GET /check-auth` - Vérification statut

### **Paiements**
- `POST /payment/submit` - Soumission paiement
- `POST /momo/initiate` - Initiation MTN
- `POST /moov/initiate` - Initiation Moov
- `POST /celtiis/initiate` - Initiation Celtiis

### **Analyse et Prédictions**
- `POST /predict` - Prédiction IA
- `POST /simulate` - Simulation stratégie
- `GET /health` - Statut du serveur

### **Administration**
- `GET /admin/login` - Page de connexion admin
- `GET /admin/panel` - Panel d'administration
- `GET /admin/api/requests` - Liste des demandes
- `POST /admin/api/validate/<id>` - Validation paiement
- `POST /admin/api/reject/<id>` - Rejet paiement

## 🛡️ Sécurité

### **Mesures implémentées**
- **Validation des entrées** côté serveur
- **Protection CSRF** avec tokens
- **Headers de sécurité** (HSTS, CSP, etc.)
- **Rate limiting** pour prévenir les abus
- **Chiffrement** des mots de passe
- **Sessions sécurisées** avec timeout

### **Bonnes pratiques**
- **Variables d'environnement** pour les secrets
- **Validation des paiements** admin obligatoire
- **Logs de sécurité** pour audit
- **Sauvegarde automatique** des données

## 📈 Performance et Monitoring

### **Optimisations**
- **Gunicorn** avec workers multiples
- **Cache Redis** pour les données fréquentes
- **Compression** des réponses HTTP
- **Lazy loading** des composants React

### **Monitoring**
- **Health checks** automatiques
- **Métriques de performance** en temps réel
- **Logs structurés** pour debug
- **Alertes** en cas de problème

## 🤝 Contribution

### **Comment contribuer**
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### **Standards de code**
- **Python** : PEP 8, docstrings
- **JavaScript** : ESLint, Prettier
- **Tests** : pytest pour Python, Jest pour React
- **Commits** : Conventionnel Commits

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

### **Documentation**
- **Guide d'installation** : `INSTALLATION.md`
- **Configuration Render** : `render-config.md`
- **API Reference** : `API.md`

### **Contact**
- **Issues** : [GitHub Issues](https://github.com/votre-username/BetAI/issues)
- **Discussions** : [GitHub Discussions](https://github.com/votre-username/BetAI/discussions)
- **Wiki** : [Documentation complète](https://github.com/votre-username/BetAI/wiki)

### **Communauté**
- **Discord** : [Serveur BetAI](https://discord.gg/betai)
- **Telegram** : [Groupe BetAI](https://t.me/betai_community)
- **Email** : support@betai.com

## 🙏 Remerciements

- **Équipe de développement** BetAI
- **Contributeurs** open source
- **Communauté** des utilisateurs
- **Partners** de paiement (MTN, Moov, Celtiis)

---

## 🎯 Roadmap

### **Version 1.1** (Q1 2024)
- [ ] Interface mobile responsive
- [ ] Notifications push
- [ ] Export des données
- [ ] API publique

### **Version 1.2** (Q2 2024)
- [ ] Machine Learning avancé
- [ ] Intégration Binance
- [ ] Trading automatique
- [ ] Multi-langues

### **Version 2.0** (Q3 2024)
- [ ] Blockchain integration
- [ ] Smart contracts
- [ ] DeFi features
- [ ] Marketplace

---

**⭐ Si ce projet vous plaît, n'oubliez pas de le star sur GitHub !**

**🚀 Prêt à révolutionner l'analyse des crashs ? Commencez avec BetAI !**
