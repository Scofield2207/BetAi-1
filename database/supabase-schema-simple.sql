-- ============================================================
-- SCHEMA BETAI SIMPLIFIÉ - Gestion des Codes d'Accès
-- ============================================================
-- 1. Copiez ce code
-- 2. Allez dans votre Dashboard Supabase > SQL Editor > New query
-- 3. Collez et exécutez (Run)
-- ============================================================

CREATE TABLE IF NOT EXISTS access_codes (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_used BOOLEAN DEFAULT FALSE,
  duration_days INTEGER DEFAULT 60, -- Durée du code en jours (ajouté)
  device_id VARCHAR(255), -- L'appareil qui a activé le code
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Désactiver RLS (Row Level Security) pour faire simple (vu qu'on n'a pas d'utilisateurs authentifiés via Supabase Auth)
ALTER TABLE access_codes DISABLE ROW LEVEL SECURITY;

-- Créer quelques codes de test pour vérifier que ça marche
INSERT INTO access_codes (code, is_active, is_used)
VALUES
  ('X7K9P2M4', true, false),
  ('A1B2C3D4', true, false),
  ('Z9Y8X7W6', true, false)
ON CONFLICT (code) DO NOTHING;
