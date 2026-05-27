@echo off
REM GymFit App - Startup Script
REM Este script instala dependencias y ejecuta la aplicación

echo.
echo ========================================
echo   GymFit App - Startup
echo ========================================
echo.

REM Verificar si npm está instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no está instalado o no está en el PATH
    echo Por favor instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

echo ✓ npm detected
echo.

REM Instalar dependencias
echo Instalando dependencias...
call npm install

if %errorlevel% neq 0 (
    echo ERROR: No se pudieron instalar las dependencias
    pause
    exit /b 1
)

echo.
echo ✓ Dependencias instaladas
echo.

REM Instalar expo-sqlite específicamente
echo Instalando expo-sqlite...
call expo install expo-sqlite

if %errorlevel% neq 0 (
    echo WARNING: Hubo un problema con expo-sqlite
    echo Continuando...
)

echo.
echo ========================================
echo   Iniciando la aplicación
echo ========================================
echo.
echo Opciones:
echo 1. Web (npm run web) - Recomendado para desarrollo
echo 2. Android (npm run android)
echo 3. iOS (npm run ios) - Solo en Mac
echo.

REM Ejecutar la aplicación en web por defecto
echo Iniciando en modo web...
call npm run web

pause
