@echo off
REM 🚀 BetAI - Script de Démarrage Rapide (Windows)
REM Ce script installe les dépendances et démarre l'application en développement

echo ================================
echo 🎯 BetAI - Démarrage de l'app
echo ================================

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé. Veuillez l'installer d'abord.
    echo 📍 Téléchargez depuis: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js détecté:
node --version

echo ✅ npm détecté:
npm --version
echo.

REM Vérifier si package.json existe
if not exist "package.json" (
    echo ❌ package.json non trouvé. Veuillez être dans le répertoire BetAI
    pause
    exit /b 1
)

REM Installer les dépendances si node_modules n'existe pas
if not exist "node_modules" (
    echo 📦 Installation des dépendances...
    call npm install
    if errorlevel 1 (
        echo ❌ Erreur lors de l'installation des dépendances
        pause
        exit /b 1
    )
    echo ✅ Dépendances installées avec succès
) else (
    echo ✅ node_modules trouvé, on saute l'installation
)

echo.
echo ================================
echo 🎯 Variables d'environnement
echo ================================

REM Vérifier si .env.local existe
if not exist ".env.local" (
    echo ⚠️  .env.local non trouvé!
    echo Les variables par défaut seront utilisées.
) else (
    echo ✅ .env.local trouvé
    echo Variables chargées:
    for /f "tokens=*" %%A in (.env.local) do (
        echo    %%A
    )
)

echo.
echo ================================
echo 🚀 Démarrage du serveur...
echo ================================
echo.
echo 📍 Accédez à: http://localhost:5173
echo 📍 Appuyez sur CTRL+C pour arrêter
echo.

call npm run dev
pause
