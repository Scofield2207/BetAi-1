#!/usr/bin/env node

/**
 * 📥 Import des Codes d'Accès depuis CSV
 * 
 * Usage:
 *   node import-codes-csv.js <fichier.csv>
 *   node import-codes-csv.js codes.csv
 *   node import-codes-csv.js codes-example.csv
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');

// Charger .env.local
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
let supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Clés Supabase manquantes. Vérifiez votre .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Vérifier les arguments
if (process.argv.length < 3) {
  console.log(`
📥 Importateur de Codes CSV pour BetAI

Usage:
  node import-codes-csv.js <fichier.csv>

Exemples:
  node import-codes-csv.js codes.csv
  node import-codes-csv.js codes-example.csv

Format du CSV requis:
  code,plan,duration,features
  BETAI-STARTER-101,starter,1_month,"basic_analysis,5_predictions"
  BETAI-PRO-101,pro,3_months,"advanced_analysis,unlimited_predictions"

  `);
  process.exit(1);
}

const csvFile = process.argv[2];

// Vérifier que le fichier existe
if (!fs.existsSync(csvFile)) {
  console.error(`❌ Fichier non trouvé: ${csvFile}`);
  process.exit(1);
}

console.log(`\n📥 Lecture du fichier: ${csvFile}\n`);

// Parser le CSV
async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const lines = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      lines.push(line);
    });

    rl.on('close', () => {
      resolve(lines);
    });

    rl.on('error', (err) => {
      reject(err);
    });
  });
}

// Parser une ligne CSV
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// Convertir les features
function parseFeatures(featuresString) {
  if (!featuresString) return [];
  return featuresString.split(',').map(f => f.trim());
}

// Importer les codes
async function importCodes() {
  try {
    const lines = await parseCSV(csvFile);

    if (lines.length < 2) {
      console.error('❌ Le fichier CSV doit contenir au moins une ligne de données');
      process.exit(1);
    }

    // Vérifier l'en-tête
    const header = parseCSVLine(lines[0]);
    if (header[0] !== 'code' || header[1] !== 'plan' || header[2] !== 'duration') {
      console.error('❌ Format d\'en-tête incorrect. Attendu: code,plan,duration,features');
      process.exit(1);
    }

    // Parser les codes
    const codes = [];
    let errorCount = 0;

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Sauter les lignes vides

      const fields = parseCSVLine(lines[i]);

      if (fields.length < 3) {
        console.warn(`⚠️  Ligne ${i + 1}: Format invalide, ignorée`);
        errorCount++;
        continue;
      }

      const [code, plan, duration, featuresStr] = fields;

      if (!code || !plan || !duration) {
        console.warn(`⚠️  Ligne ${i + 1}: Champs requis manquants, ignorée`);
        errorCount++;
        continue;
      }

      const validPlans = ['starter', 'pro', 'expert'];
      if (!validPlans.includes(plan)) {
        console.warn(`⚠️  Ligne ${i + 1}: Plan invalide "${plan}", ignorée`);
        errorCount++;
        continue;
      }

      codes.push({
        code: code.trim().toUpperCase(),
        plan: plan.trim(),
        duration: duration.trim(),
        features: parseFeatures(featuresStr),
        is_active: true,
        is_used: false,
        created_at: new Date().toISOString()
      });
    }

    if (codes.length === 0) {
      console.error('❌ Aucun code valide trouvé dans le fichier');
      process.exit(1);
    }

    console.log(`📊 Codes à importer: ${codes.length}`);
    if (errorCount > 0) {
      console.log(`⚠️  Lignes ignorées: ${errorCount}\n`);
    }

    // Afficher les codes avant import
    console.log('═'.repeat(70));
    codes.forEach((code, index) => {
      console.log(`${(index + 1).toString().padStart(2, '0')}. ${code.code.padEnd(30)} [${code.plan.padEnd(8)}]`);
    });
    console.log('═'.repeat(70));
    console.log('');

    // Importer dans Supabase
    console.log('⏳ Importation en cours...\n');

    // Importer par batch de 10 pour éviter les limites
    for (let i = 0; i < codes.length; i += 10) {
      const batch = codes.slice(i, i + 10);
      
      const { data, error } = await supabase
        .from('access_codes')
        .insert(batch);

      if (error) {
        console.error(`❌ Erreur lors de l'import du batch ${i / 10 + 1}: ${error.message}`);
        throw error;
      }

      console.log(`✅ Batch ${i / 10 + 1}/${Math.ceil(codes.length / 10)} importé (${batch.length} codes)`);
    }

    console.log(`\n🎉 ${codes.length} code(s) importé(s) avec succès!\n`);

    // Générer le SQL pour référence
    console.log('📋 SQL d\'insertion (pour référence):\n');
    console.log('```sql');
    console.log('INSERT INTO access_codes (code, plan, duration, features, is_active, is_used)');
    console.log('VALUES');
    
    codes.forEach((code, index) => {
      const featuresJson = JSON.stringify(code.features);
      const isLastRow = index === codes.length - 1;
      const comma = isLastRow ? ';' : ',';
      console.log(
        `  ('${code.code}', '${code.plan}', '${code.duration}', '${featuresJson}'::jsonb, true, false)${comma}`
      );
    });
    
    console.log('```\n');

  } catch (err) {
    console.error(`\n❌ Erreur: ${err.message}\n`);
    process.exit(1);
  }
}

// Lancer l'import
importCodes();
