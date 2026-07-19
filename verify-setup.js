#!/usr/bin/env node

/**
 * ✅ BetAI - Configuration Verification Checklist
 * 
 * Ce script vérifie que tout est configuré correctement
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  🎯 BetAI - Configuration Verification Checklist           ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const checks = [];

// Check 1: package.json exists
console.log('1️⃣  Vérification de package.json...');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.dependencies?.['@supabase/supabase-js']) {
    console.log('   ✅ @supabase/supabase-js est installé\n');
    checks.push(true);
  } else {
    console.log('   ❌ @supabase/supabase-js n\'est pas dans package.json');
    console.log('   💡 Exécutez: npm install\n');
    checks.push(false);
  }
} else {
  console.log('   ❌ package.json non trouvé\n');
  checks.push(false);
}

// Check 2: .env.local exists
console.log('2️⃣  Vérification des variables d\'environnement...');
if (fs.existsSync('.env.local')) {
  const envLocal = fs.readFileSync('.env.local', 'utf8');
  const hasUrl = envLocal.includes('VITE_SUPABASE_URL');
  const hasKey = envLocal.includes('VITE_SUPABASE_PUBLISHABLE_KEY');
  
  if (hasUrl && hasKey) {
    console.log('   ✅ .env.local est configuré\n');
    checks.push(true);
  } else {
    console.log('   ❌ Variables manquantes dans .env.local\n');
    checks.push(false);
  }
} else {
  console.log('   ⚠️  .env.local non trouvé (création recommandée)');
  console.log('   💡 Créez .env.local avec les variables Supabase\n');
  checks.push(false);
}

// Check 3: supabase.js exists
console.log('3️⃣  Vérification de la configuration Supabase...');
if (fs.existsSync('src/config/supabase.js')) {
  const supabaseConfig = fs.readFileSync('src/config/supabase.js', 'utf8');
  if (supabaseConfig.includes('import.meta.env.VITE_SUPABASE_URL')) {
    console.log('   ✅ src/config/supabase.js est configuré\n');
    checks.push(true);
  } else {
    console.log('   ⚠️  src/config/supabase.js existe mais peut nécessiter une mise à jour\n');
    checks.push(false);
  }
} else {
  console.log('   ❌ src/config/supabase.js non trouvé\n');
  checks.push(false);
}

// Check 4: accessCodeService exists
console.log('4️⃣  Vérification du service des codes d\'accès...');
if (fs.existsSync('src/services/accessCodeService.js')) {
  console.log('   ✅ src/services/accessCodeService.js existe\n');
  checks.push(true);
} else {
  console.log('   ❌ src/services/accessCodeService.js non trouvé\n');
  checks.push(false);
}

// Check 5: AccessCode component updated
console.log('5️⃣  Vérification du composant AccessCode...');
if (fs.existsSync('src/components/AccessCode.jsx')) {
  const accessCode = fs.readFileSync('src/components/AccessCode.jsx', 'utf8');
  if (accessCode.includes('accessCodeService')) {
    console.log('   ✅ AccessCode.jsx est mis à jour\n');
    checks.push(true);
  } else {
    console.log('   ⚠️  AccessCode.jsx peut ne pas utiliser le service\n');
    checks.push(false);
  }
} else {
  console.log('   ❌ src/components/AccessCode.jsx non trouvé\n');
  checks.push(false);
}

// Check 6: Database schema exists
console.log('6️⃣  Vérification du schéma de base de données...');
if (fs.existsSync('database/supabase-schema.sql')) {
  console.log('   ✅ database/supabase-schema.sql existe\n');
  checks.push(true);
} else {
  console.log('   ❌ database/supabase-schema.sql non trouvé\n');
  checks.push(false);
}

// Check 7: Documentation exists
console.log('7️⃣  Vérification de la documentation...');
const docs = ['BACKEND_SETUP.md', 'SETUP_SUMMARY.md', 'BACKEND_API_IMPLEMENTATION.md'];
const docsFound = docs.filter(doc => fs.existsSync(doc)).length;
if (docsFound === 3) {
  console.log('   ✅ Toute la documentation existe\n');
  checks.push(true);
} else {
  console.log(`   ⚠️  ${3 - docsFound} fichier(s) de documentation manquant(s)\n`);
  checks.push(false);
}

// Check 8: Helper scripts exist
console.log('8️⃣  Vérification des scripts utilitaires...');
const scripts = ['generate-codes.js'];
const scriptsFound = scripts.filter(script => fs.existsSync(script)).length;
if (scriptsFound === 1) {
  console.log('   ✅ Scripts utilitaires trouvés\n');
  checks.push(true);
} else {
  console.log('   ⚠️  Scripts utilitaires non trouvés\n');
  checks.push(false);
}

// Summary
console.log('╔════════════════════════════════════════════════════════════╗');

const passed = checks.filter(c => c).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`║  Résultats: ${passed}/${total} vérifications réussies (${percentage}%)         ║`);
console.log('╚════════════════════════════════════════════════════════════╝\n');

if (percentage === 100) {
  console.log('🎉 EXCELLENT! Configuration complète et prête!\n');
  console.log('📖 Prochaines étapes:\n');
  console.log('  1. Exécutez le script SQL dans Supabase:');
  console.log('     cat database/supabase-schema.sql\n');
  console.log('  2. Générez des codes de test:');
  console.log('     node generate-codes.js 10 starter\n');
  console.log('  3. Installez les dépendances:');
  console.log('     npm install\n');
  console.log('  4. Lancez l\'application:');
  console.log('     npm run dev\n');
} else if (percentage >= 75) {
  console.log('✅ Bonne configuration! Quelques éléments à finaliser.\n');
  console.log('📖 Consultez BACKEND_SETUP.md pour les détails.\n');
} else {
  console.log('⚠️  Configuration incomplète. Veuillez vérifier les erreurs ci-dessus.\n');
  console.log('📖 Consultez BACKEND_SETUP.md et SETUP_SUMMARY.md pour l\'aide.\n');
}

// Additional tips
console.log('═'.repeat(62));
console.log('💡 CONSEILS:\n');
console.log('  • Vérifiez que vos clés Supabase sont correctes');
console.log('  • Testez la connexion à Supabase depuis votre dashboard');
console.log('  • Consultez BACKEND_SETUP.md pour plus d\'informations');
console.log('  • Utilisez generate-codes.js pour créer des codes de test');
console.log('  • Vérifiez les logs du navigateur en cas d\'erreur\n');

process.exit(percentage === 100 ? 0 : 1);
