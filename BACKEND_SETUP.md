# 🎯 Configuration Backend Supabase - BetAI

Voici le guide complet pour configurer et gérer le système de codes d'accès avec Supabase.

## 📋 Table des matières
1. [Configuration Supabase](#configuration-supabase)
2. [Initialisation de la Base de Données](#initialisation-de-la-base-de-données)
3. [Générer des Codes d'Accès](#générer-des-codes-daccès)
4. [Variables d'Environnement](#variables-denvironnement)
5. [Utilisation côté Frontend](#utilisation-côté-frontend)
6. [API Endpoints](#api-endpoints)

---

## 🔧 Configuration Supabase

### Étape 1: Créer un projet Supabase
1. Allez sur https://supabase.com/
2. Créez un nouveau compte ou connectez-vous
3. Cliquez sur "New Project"
4. Saisissez les détails de votre projet:
   - **Name**: `betai` ou le nom de votre choix
   - **Password**: Choisissez un mot de passe fort
   - **Region**: Sélectionnez la région la plus proche (ex: Europe si vous êtes en Afrique de l'Ouest)

### Étape 2: Obtenir vos clés
Une fois le projet créé, allez dans **Settings > API**:
- Copiez l'URL de votre projet: `https://[project-id].supabase.co`
- Copiez la **Publishable Key** (anon key): `sb_anon_[...]`
- Gardez la **Secret Key** en sécurité (pour le backend seulement)

### ✅ Clés actuelles
Vos clés Supabase ont été sauvegardées dans:
- **`.env.local`** (développement): Pour le développement local
- **`.env.production`** (production): Pour Render.com

---

## 🗄️ Initialisation de la Base de Données

### Étape 1: Ouvrir l'éditeur SQL
1. Dans votre dashboard Supabase, allez dans **SQL Editor**
2. Cliquez sur **New Query**

### Étape 2: Charger le schéma
1. Copiez tout le contenu du fichier [`database/supabase-schema.sql`](../database/supabase-schema.sql)
2. Collez-le dans l'éditeur SQL
3. Cliquez sur **RUN** (ou appuyez sur Ctrl+Enter)

### ✅ Résultat attendu
Vous devriez voir les messages de succès:
```
CREATE TABLE (success)
CREATE INDEX (success)
CREATE FUNCTION (success)
CREATE POLICY (success)
```

**Tables créées:**
- ✅ `access_codes` - Stocke les codes d'accès
- ✅ `code_activations` - Historique des activations
- ✅ `user_subscriptions` - Suivi des abonnements actifs
- ✅ `code_analytics` - Analytics sur l'utilisation

---

## 🎟️ Générer des Codes d'Accès

### Option 1: Via SQL (Recommandé pour tester)

Exécutez ce script SQL dans **Supabase SQL Editor**:

```sql
-- Générer 5 codes Starter
INSERT INTO access_codes (code, plan, duration, features, is_active, is_used)
VALUES
  ('BETAI-STARTER-001', 'starter', '1_month', '["basic_analysis", "5_predictions"]'::jsonb, true, false),
  ('BETAI-STARTER-002', 'starter', '1_month', '["basic_analysis", "5_predictions"]'::jsonb, true, false),
  ('BETAI-STARTER-003', 'starter', '1_month', '["basic_analysis", "5_predictions"]'::jsonb, true, false),
  ('BETAI-STARTER-004', 'starter', '1_month', '["basic_analysis", "5_predictions"]'::jsonb, true, false),
  ('BETAI-STARTER-005', 'starter', '1_month', '["basic_analysis", "5_predictions"]'::jsonb, true, false);

-- Générer 3 codes Pro
INSERT INTO access_codes (code, plan, duration, features, is_active, is_used)
VALUES
  ('BETAI-PRO-001', 'pro', '3_months', '["advanced_analysis", "unlimited_predictions", "strategy_simulator"]'::jsonb, true, false),
  ('BETAI-PRO-002', 'pro', '3_months', '["advanced_analysis", "unlimited_predictions", "strategy_simulator"]'::jsonb, true, false),
  ('BETAI-PRO-003', 'pro', '3_months', '["advanced_analysis", "unlimited_predictions", "strategy_simulator"]'::jsonb, true, false);

-- Générer 2 codes Expert
INSERT INTO access_codes (code, plan, duration, features, is_active, is_used)
VALUES
  ('BETAI-EXPERT-001', 'expert', '1_year', '["all_features", "api_access", "dedicated_support"]'::jsonb, true, false),
  ('BETAI-EXPERT-002', 'expert', '1_year', '["all_features", "api_access", "dedicated_support"]'::jsonb, true, false);
```

### Option 2: Via Frontend Service

Dans votre code Node.js/backend:

```javascript
import accessCodeService from './src/services/accessCodeService';

const newCodes = [
  {
    code: 'BETAI-STARTER-006',
    plan: 'starter',
    duration: '1_month',
    features: ['basic_analysis', '5_predictions']
  },
  {
    code: 'BETAI-PRO-004',
    plan: 'pro',
    duration: '3_months',
    features: ['advanced_analysis', 'unlimited_predictions', 'strategy_simulator']
  }
];

const result = await accessCodeService.createAccessCodes(newCodes);
console.log(result.message); // "2 code(s) d'accès créé(s) avec succès."
```

### Format des Codes

**Recommandé:** `BETAI-PLAN-NUMERO`
- ✅ `BETAI-STARTER-001`
- ✅ `BETAI-PRO-001`
- ✅ `BETAI-EXPERT-001`

**Ou:** Format libre (minimum 6 caractères)
- ✅ `TEST001STARTER`
- ✅ `CODE-PROMO-2024-XYZ`

---

## 🌍 Variables d'Environnement

### `.env.local` (Développement)
```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://ojmlumtihoxmhvnufkqh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_faglJq3r9YpMkxA9j09ofA_qtZ0yGx4
```

### `.env.production` (Production sur Render)
```env
VITE_API_URL=https://betai-api.render.com
VITE_SUPABASE_URL=https://ojmlumtihoxmhvnufkqh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_faglJq3r9YpMkxA9j09ofA_qtZ0yGx4
```

### Backend (.env du serveur Node.js)
Créez un fichier `.env` à la racine de votre backend:
```env
SUPABASE_URL=https://ojmlumtihoxmhvnufkqh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SECRET_KEY_HERE
```

⚠️ **Attention**: Ne jamais partager la clé secrète (`SUPABASE_SERVICE_ROLE_KEY`)

---

## 💻 Utilisation côté Frontend

### Activer un Code d'Accès

```javascript
import accessCodeService from './services/accessCodeService';

// Utiliser le service pour valider un code
const result = await accessCodeService.validateAndActivateCode('BETAI-STARTER-001', userId);

if (result.success) {
  console.log('✅', result.message);
  console.log('Plan activé:', result.codeData.plan);
  console.log('Features:', result.codeData.features);
} else {
  console.log('❌', result.message);
}
```

### Vérifier le Plan de l'Utilisateur

```javascript
// Vérifier si l'utilisateur a déjà activé un code
const hasCode = await accessCodeService.hasActivatedCode(userId);

// Récupérer le plan activé
const plan = await accessCodeService.getUserActivatedPlan(userId);
console.log('Plan de l\'utilisateur:', plan?.plan); // 'starter', 'pro', 'expert'
```

### Composant AccessCode.jsx

Le composant `AccessCode.jsx` a été mis à jour pour:
- ✅ Valider automatiquement les codes via Supabase
- ✅ Gérer les erreurs (code invalide, expiré, déjà utilisé)
- ✅ Sauvegarder le plan activé dans le localStorage
- ✅ Afficher des messages clairs en français

---

## 🔌 API Endpoints (Backend)

Votre backend doit implémenter ces endpoints:

### 1. Activation de Code
**POST** `/activate-code`
```json
{
  "code": "BETAI-STARTER-001",
  "userId": "uuid-utilisateur"
}
```

### 2. Renvoi du Code
**POST** `/api/resend_code`
```json
{
  "userId": "uuid-utilisateur"
}
```

### 3. Vérification Auth
**GET** `/check-auth`
Retourne l'utilisateur authentifié

---

## 📊 Dashboard & Monitoring

### Voir les Codes Créés
Dans **Supabase > Table Editor**:
1. Allez dans la table `access_codes`
2. Voir tous les codes, leur statut, plan, etc.

### Voir les Activations
1. Allez dans la table `code_activations`
2. Visualisez quels codes ont été utilisés et par qui

### Voir les Abonnements Actifs
1. Allez dans la table `user_subscriptions`
2. Vérifiez quels utilisateurs ont des plans actifs

---

## 🚀 Installation et Démarrage

### 1. Installer les dépendances
```bash
npm install
```

Cela installera `@supabase/supabase-js` et toutes les autres dépendances.

### 2. Démarrer en développement
```bash
npm run dev
```

### 3. Build pour production
```bash
npm run build
```

---

## 🐛 Dépannage

### Les codes ne s'activent pas
- ✅ Vérifiez que le schéma SQL a été exécuté correctement
- ✅ Confirmez que les variables d'environnement sont bonnes
- ✅ Vérifiez dans Supabase que la table `access_codes` contient des codes

### Erreur "Code non trouvé"
- ✅ Vérifiez l'orthographe du code
- ✅ Les codes sont sensibles à la casse après normalisation
- ✅ Assurez-vous que le code a été inséré avec `is_active = true`

### Erreur "Code déjà utilisé"
- ✅ Chaque code ne peut être utilisé qu'une seule fois
- ✅ Générez de nouveaux codes ou contactez le support

---

## 📞 Support

Pour toute question:
1. Consultez la [Documentation Supabase](https://supabase.com/docs)
2. Vérifiez les logs dans Supabase SQL Editor
3. Consultez les erreurs dans la console du navigateur

---

**Créé pour BetAI - Plateforme d'analyse et de prédiction de crashs**
