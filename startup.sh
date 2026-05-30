#!/bin/bash

# Script de inicio rápido para Mini Grúa Web
# Uso: bash startup.sh

echo "🏗️  Mini Grúa Web - Startup Script"
echo "===================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "   Descarga desde: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js encontrado: $(node --version)${NC}"

# Cambiar a backend
echo ""
echo -e "${YELLOW}📦 Instalando Backend...${NC}"
cd backend

# Verificar .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado${NC}"
    echo "   Creando desde .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edita backend/.env y configura SERIAL_PORT${NC}"
    echo "   En Windows: COM3, COM4, etc."
    echo "   En Linux: /dev/ttyUSB0, /dev/ttyACM0, etc."
    echo "   En macOS: /dev/cu.usbserial-*, /dev/cu.usbmodem*, etc."
fi

npm install
echo -e "${GREEN}✓ Backend instalado${NC}"

# Cambiar a frontend
echo ""
echo -e "${YELLOW}📦 Instalando Frontend...${NC}"
cd ../frontend

# Verificar .env
if [ ! -f .env ]; then
    echo "   Creando .env desde .env.example..."
    cp .env.example .env
fi

npm install
echo -e "${GREEN}✓ Frontend instalado${NC}"

echo ""
echo -e "${GREEN}✅ Instalación completada${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo ""
echo "1. Edita backend/.env y configura el puerto serial"
echo "2. En Terminal 1, ejecuta:"
echo -e "   ${GREEN}cd backend && npm run dev${NC}"
echo ""
echo "3. En Terminal 2, ejecuta:"
echo -e "   ${GREEN}cd frontend && npm run dev${NC}"
echo ""
echo "4. Abre en navegador:"
echo -e "   ${GREEN}http://localhost:5173${NC}"
echo ""
