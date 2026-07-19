#!/bin/bash

# 🚀 BetAI - Script de Démarrage Rapide
# Ce script installe les dépendances et démarre l'application en développement

echo "================================"
echo "🎯 BetAI - Démarrage de l'app"
echo "================================"

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null
then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    echo "📍 Téléchargez depuis: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js détecté: $(node --version)"
echo "✅ npm détecté: $(npm --version)"
echo ""

# Vérifier si package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ package.json non trouvé. Veuillez être dans le répertoire BetAI"
    exit 1
fi

# Installer les dépendances si node_modules n'existe pas
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de l'installation des dépendances"
        exit 1
    fi
    echo "✅ Dépendances installées avec succès"
else
    echo "✅ node_modules trouvé, on saute l'installation"
fi

echo ""
echo "================================"
echo "🎯 Variables d'environnement"
echo "================================"

# Vérifier si .env.local existe
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local non trouvé!"
    echo "Les variables par défaut seront utilisées."
else
    echo "✅ .env.local trouvé"
    echo "Variables chargées:"
    grep -E "VITE_" .env.local | sed 's/^/   /'
fi

echo ""
echo "================================"
echo "🚀 Démarrage du serveur..."
echo "================================"
echo ""
echo "📍 Accédez à: http://localhost:5173"
echo "📍 Appuyez sur CTRL+C pour arrêter"
echo ""

npm run dev
