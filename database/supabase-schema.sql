-- ============================================================
-- SCHEMA BETAI - Gestion des Codes d'Accès
-- ============================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- Dashboard > SQL Editor > New query > Collez ce code

-- ============================================================
-- 1. TABLE: access_codes
-- Stocke tous les codes d'accès générés pour les utilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS access_codes (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  plan VARCHAR(50) NOT NULL, -- 'starter', 'pro', 'expert'
  features JSONB DEFAULT '[]'::jsonb, -- Liste des features activées
  duration VARCHAR(50), -- '1_month', '3_months', '1_year', etc.
  is_active BOOLEAN DEFAULT TRUE,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID, -- ID de l'utilisateur qui a utilisé le code
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Date d'expiration du code
  metadata JSONB DEFAULT '{}'::jsonb -- Données additionnelles
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);
CREATE INDEX IF NOT EXISTS idx_access_codes_is_used ON access_codes(is_used);
CREATE INDEX IF NOT EXISTS idx_access_codes_plan ON access_codes(plan);

-- Commentaires
COMMENT ON TABLE access_codes IS 'Stocke les codes d''accès pour les plans BetAI';
COMMENT ON COLUMN access_codes.code IS 'Code alphanumérique unique';
COMMENT ON COLUMN access_codes.plan IS 'Plan associé: starter, pro, expert';
COMMENT ON COLUMN access_codes.is_used IS 'Indique si le code a été utilisé';
COMMENT ON COLUMN access_codes.used_by IS 'UUID de l''utilisateur qui a activé le code';

-- ============================================================
-- 2. TABLE: code_activations
-- Historique des activations de codes
-- ============================================================
CREATE TABLE IF NOT EXISTS code_activations (
  id BIGSERIAL PRIMARY KEY,
  code_id BIGINT NOT NULL,
  user_id UUID NOT NULL,
  code_value VARCHAR(50) NOT NULL,
  plan_activated VARCHAR(50),
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  FOREIGN KEY (code_id) REFERENCES access_codes(id) ON DELETE CASCADE
);

-- Index pour les recherches par utilisateur
CREATE INDEX IF NOT EXISTS idx_code_activations_user_id ON code_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_code_activations_code_id ON code_activations(code_id);
CREATE INDEX IF NOT EXISTS idx_code_activations_activated_at ON code_activations(activated_at);

-- Commentaires
COMMENT ON TABLE code_activations IS 'Historique complet des activations de codes';
COMMENT ON COLUMN code_activations.user_id IS 'UUID de l''utilisateur Supabase Auth';

-- ============================================================
-- 3. TABLE: user_subscriptions
-- Suivi des abonnements actifs des utilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  plan VARCHAR(50) NOT NULL, -- 'starter', 'pro', 'expert'
  code_id BIGINT,
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  renewal_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  FOREIGN KEY (code_id) REFERENCES access_codes(id) ON DELETE SET NULL
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_is_active ON user_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);

-- Commentaires
COMMENT ON TABLE user_subscriptions IS 'Suivi des abonnements actifs par utilisateur';

-- ============================================================
-- 4. TABLE: code_analytics
-- Analytics sur l'utilisation des codes
-- ============================================================
CREATE TABLE IF NOT EXISTS code_analytics (
  id BIGSERIAL PRIMARY KEY,
  code_id BIGINT NOT NULL,
  activated_at TIMESTAMP WITH TIME ZONE,
  country VARCHAR(100),
  device_type VARCHAR(50), -- 'mobile', 'desktop', 'tablet'
  browser VARCHAR(100),
  plan_conversion VARCHAR(50), -- Le plan vers lequel a mené ce code
  metadata JSONB DEFAULT '{}'::jsonb,
  
  FOREIGN KEY (code_id) REFERENCES access_codes(id) ON DELETE CASCADE
);

-- Index pour analytics
CREATE INDEX IF NOT EXISTS idx_code_analytics_code_id ON code_analytics(code_id);
CREATE INDEX IF NOT EXISTS idx_code_analytics_activated_at ON code_analytics(activated_at);

-- ============================================================
-- 5. VUE: active_user_plans
-- Vue pour récupérer rapidement le plan actif d'un utilisateur
-- ============================================================
CREATE OR REPLACE VIEW active_user_plans AS
SELECT 
  us.user_id,
  us.plan,
  us.activated_at,
  us.expires_at,
  ac.features,
  ac.code,
  us.is_active
FROM user_subscriptions us
LEFT JOIN access_codes ac ON us.code_id = ac.id
WHERE us.is_active = TRUE
ORDER BY us.activated_at DESC;

-- ============================================================
-- 6. FONCTION: activate_code_for_user
-- Fonction pour automatiser l'activation d'un code
-- ============================================================
CREATE OR REPLACE FUNCTION activate_code_for_user(
  p_code VARCHAR(50),
  p_user_id UUID,
  p_ip_address INET DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  plan VARCHAR(50),
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_code_id BIGINT;
  v_plan VARCHAR(50);
  v_expires_at TIMESTAMP WITH TIME ZONE;
  v_features JSONB;
BEGIN
  -- Vérifier que le code existe et n'est pas utilisé
  SELECT id, plan, expires_at, features INTO v_code_id, v_plan, v_expires_at, v_features
  FROM access_codes
  WHERE code = p_code AND is_active = TRUE AND is_used = FALSE;
  
  IF v_code_id IS NULL THEN
    RETURN QUERY SELECT false, 'Code invalide ou déjà utilisé'::TEXT, NULL::VARCHAR, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- Vérifier l'expiration
  IF v_expires_at IS NOT NULL AND v_expires_at < NOW() THEN
    RETURN QUERY SELECT false, 'Code expiré'::TEXT, NULL::VARCHAR, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- Marquer le code comme utilisé
  UPDATE access_codes
  SET is_used = TRUE, used_by = p_user_id, used_at = NOW()
  WHERE id = v_code_id;
  
  -- Créer l'activation
  INSERT INTO code_activations (code_id, user_id, code_value, plan_activated, ip_address)
  VALUES (v_code_id, p_user_id, p_code, v_plan, p_ip_address);
  
  -- Créer ou mettre à jour l'abonnement utilisateur
  INSERT INTO user_subscriptions (user_id, plan, code_id, is_active, expires_at)
  VALUES (p_user_id, v_plan, v_code_id, TRUE, v_expires_at)
  ON CONFLICT (user_id) DO UPDATE
  SET plan = v_plan, code_id = v_code_id, is_active = TRUE, expires_at = v_expires_at;
  
  RETURN QUERY SELECT true, 'Code activé avec succès'::TEXT, v_plan::VARCHAR, v_expires_at;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PERMISSIONS RLS (Row Level Security)
-- ============================================================

-- Activer RLS sur les tables
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_analytics ENABLE ROW LEVEL SECURITY;

-- Politiques pour access_codes (lecture seule pour les utilisateurs)
CREATE POLICY "access_codes_read_only" ON access_codes
  FOR SELECT TO authenticated
  USING (true);

-- Politiques pour code_activations (les utilisateurs voient leurs activations)
CREATE POLICY "code_activations_user_view" ON code_activations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Politiques pour user_subscriptions (les utilisateurs voient leurs abonnements)
CREATE POLICY "user_subscriptions_user_view" ON user_subscriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- DONNÉES INITIALES (OPTIONNEL)
-- Décommentez pour ajouter des codes de test
-- ============================================================
-- INSERT INTO access_codes (code, plan, duration, features, is_active, is_used)
-- VALUES
--   ('TEST001STARTER', 'starter', '1_month', '["basic_analysis", "5_predictions"]'::jsonb, true, false),
--   ('TEST002PRO', 'pro', '3_months', '["advanced_analysis", "unlimited_predictions", "strategy_simulator"]'::jsonb, true, false),
--   ('TEST003EXPERT', 'expert', '1_year', '["all_features", "api_access", "dedicated_support"]'::jsonb, true, false);

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
