@echo off
REM Script de inicio rápido para Mini Grúa Web
REM Uso: startup.bat

echo 🏗️  Mini Grúa Web - Startup Script
echo ====================================
echo.

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado
    echo    Descarga desde: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js encontrado: %NODE_VERSION%

REM Cambiar a backend
echo.
echo 📦 Instalando Backend...
cd backend

REM Verificar .env
if not exist .env (
    echo ⚠️  Archivo .env no encontrado
    echo    Creando desde .env.example...
    copy .env.example .env
    echo ⚠️  IMPORTANTE: Edita backend\.env y configura SERIAL_PORT
    echo    En Windows: COM3, COM4, etc.
    echo    En Linux: /dev/ttyUSB0, /dev/ttyACM0, etc.
    echo    En macOS: /dev/cu.usbserial-*, /dev/cu.usbmodem*, etc.
)

call npm install
echo ✓ Backend instalado

REM Cambiar a frontend
echo.
echo 📦 Instalando Frontend...
cd ..\frontend

REM Verificar .env
if not exist .env (
    echo    Creando .env desde .env.example...
    copy .env.example .env
)

call npm install
echo ✓ Frontend instalado

echo.
echo ✅ Instalación completada
echo.
echo Próximos pasos:
echo.
echo 1. Edita backend\.env y configura el puerto serial
echo 2. En Terminal 1, ejecuta:
echo    cd backend ^&^& npm run dev
echo.
echo 3. En Terminal 2, ejecuta:
echo    cd frontend ^&^& npm run dev
echo.
echo 4. Abre en navegador:
echo    http://localhost:5173
echo.
pause
