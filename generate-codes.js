#!/usr/bin/env node

/**
 * 🎟️ Script de Génération de Codes d'Accès BetAI
 * 
 * Usage:
 *   node generate-codes.js [count] [plan]
 *   node generate-codes.js 10 starter   # Génère 10 codes Starter
 *   node generate-codes.js 5 pro        # Génère 5 codes Pro
 *   node generate-codes.js 2 expert     # Génère 2 codes Expert
 */

const crypto = require('crypto');

const PLANS = {
  starter: {
    duration: '1_month',
    features: ['basic_analysis', '5_predictions'],
    prefix: 'START'
  },
  pro: {
    duration: '3_months',
    features: ['advanced_analysis', 'unlimited_predictions', 'strategy_simulator'],
    prefix: 'PRO'
  },
  expert: {
    duration: '1_year',
    features: ['all_features', 'api_access', 'dedicated_support'],
    prefix: 'EXPERT'
  }
};

function generateCode(plan, index) {
  const planConfig = PLANS[plan];
  if (!planConfig) {
    throw new Error(`Plan inconnu: ${plan}`);
  }

  // Format: BETAI-PLAN-NUMERO-RANDOM
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  const code = `BETAI-${planConfig.prefix}-${String(index).padStart(3, '0')}-${randomPart}`;
  
  return {
    code,
    plan,
    duration: planConfig.duration,
    features: planConfig.features
  };
}

function generateMultipleCodes(count = 10, plan = 'starter') {
  const codes = [];
  
  console.log(`\n🎟️  Génération de ${count} codes ${plan.toUpperCase()}\n`);
  console.log('═'.repeat(70));
  
  for (let i = 1; i <= count; i++) {
    const code = generateCode(plan, i);
    codes.push(code);
    
    console.log(`${i.toString().padStart(2, '0')}. ${code.code}`);
  }
  
  console.log('═'.repeat(70));
  
  // Générer le SQL INSERT
  console.log('\n📋 Insérez ce code SQL dans Supabase:\n');
  console.log('```sql');
  console.log(`INSERT INTO access_codes (code, plan, duration, features, is_active, is_used)`);
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
  
  // Générer JSON pour le backend
  console.log('📦 Ou utilisez ce JSON pour votre backend:\n');
  console.log('```json');
  console.log(JSON.stringify(codes, null, 2));
  console.log('```\n');
  
  return codes;
}

// Script principal
const args = process.argv.slice(2);
const count = parseInt(args[0]) || 10;
const plan = (args[1] || 'starter').toLowerCase();

if (!PLANS[plan]) {
  console.error(`\n❌ Plan inconnu: ${plan}`);
  console.error(`Plans disponibles: ${Object.keys(PLANS).join(', ')}\n`);
  process.exit(1);
}

if (count < 1 || count > 1000) {
  console.error(`\n❌ Le nombre de codes doit être entre 1 et 1000\n`);
  process.exit(1);
}

try {
  const generatedCodes = generateMultipleCodes(count, plan);
  console.log(`✅ ${generatedCodes.length} code(s) générés avec succès!\n`);
} catch (error) {
  console.error(`\n❌ Erreur: ${error.message}\n`);
  process.exit(1);
}
