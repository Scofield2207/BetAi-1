import { createClient } from '@supabase/supabase-js';

// Configuration depuis les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Validation des clés
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Clés Supabase manquantes. Vérifiez vos fichiers .env.local ou .env.production');
}

// Création du client Supabase
export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
