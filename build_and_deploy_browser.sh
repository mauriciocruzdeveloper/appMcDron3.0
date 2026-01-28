#!/bin/bash

# Script para compilar y desplegar la aplicación Cordova para Browser
# Autor: Generado para McDron
# Fecha: 2026-01-27

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuración del servidor - Ferozo
# Usuario: a0050223
# Host: a0050223.ferozo.com
# Ruta: /app
# Nota: SSH/SFTP te pedirá la contraseña al ejecutar el script
SERVER_USER="${DEPLOY_USER:-a0050223}"
SERVER_HOST="${DEPLOY_HOST:-a0050223.ferozo.com}"
SERVER_PATH="${DEPLOY_PATH:-/app}"
SERVER_PORT="${DEPLOY_PORT:-22}"

# Función para mostrar spinner con mensaje
spinner() {
    local pid=$1
    local message=$2
    local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local i=0
    
    while kill -0 $pid 2>/dev/null; do
        i=$(( (i+1) %10 ))
        printf "\r${CYAN}${spin:$i:1}${NC} ${message}..."
        sleep 0.1
    done
    printf "\r${GREEN}✓${NC} ${message}... Completado\n"
}

# Función para ejecutar comando con spinner
run_with_spinner() {
    local message=$1
    shift
    local command="$@"
    
    $command > /tmp/build_output.log 2>&1 &
    local pid=$!
    spinner $pid "$message"
    wait $pid
    local status=$?
    
    if [ $status -ne 0 ]; then
        echo -e "${RED}✗${NC} Error: $message falló"
        echo -e "${YELLOW}Últimas líneas del log:${NC}"
        tail -20 /tmp/build_output.log
        exit 1
    fi
    
    return $status
}

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║          McDron - Build & Deploy Browser App              ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "config.xml" ]; then
    echo -e "${RED}Error: config.xml no encontrado. Ejecuta este script desde la raíz del proyecto Cordova.${NC}"
    exit 1
fi

# Paso 1: Limpiar build anterior
echo -e "\n${BLUE}[1/5]${NC} Limpiando build anterior..."
if [ -d "platforms/browser" ]; then
    run_with_spinner "Limpiando plataforma browser" rm -rf platforms/browser/www/*
fi
if [ -d "www" ]; then
    run_with_spinner "Limpiando carpeta www" rm -rf www
fi

# Paso 2: Build de React
echo -e "\n${BLUE}[2/5]${NC} Compilando aplicación React..."
run_with_spinner "Ejecutando npm run build" npm run build

# Paso 3: Copiar build a www
echo -e "\n${BLUE}[3/5]${NC} Preparando archivos para Cordova..."
if [ ! -d "www" ]; then
    mkdir -p www
fi
run_with_spinner "Copiando archivos a www" cp -r build/* www/

# Paso 4: Build de Cordova para Browser
echo -e "\n${BLUE}[4/5]${NC} Compilando Cordova para Browser..."
run_with_spinner "Ejecutando cordova build browser" cordova build browser

# Verificar que el build fue exitoso
if [ ! -d "platforms/browser/www" ]; then
    echo -e "${RED}✗ Error: El build de Cordova falló${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completado exitosamente${NC}"
echo -e "${CYAN}Archivos generados en:${NC} platforms/browser/www/"

# Paso 5: Desplegar al servidor (opcional)
echo -e "\n${BLUE}[5/5]${NC} Desplegando al servidor..."

# Verificar si las variables de servidor están configuradas
if [ "$SERVER_USER" = "usuario" ] || [ "$SERVER_HOST" = "tudominio.com" ] || [ "$SERVER_USER" = "" ]; then
    echo -e "${YELLOW}⚠ Configuración del servidor no establecida${NC}"
    echo -e "${CYAN}Para habilitar el despliegue automático, configura las variables de entorno:${NC}"
    echo -e "  export DEPLOY_USER=a0050223"
    echo -e "  export DEPLOY_HOST=a0050223.ferozo.com"
    echo -e "  export DEPLOY_PATH=/app"
    echo -e "  export DEPLOY_PORT=22"
    echo ""
    echo -e "${YELLOW}¿Deseas configurar ahora el despliegue? (s/n)${NC}"
    read -r response
    
    if [[ "$response" =~ ^([sS]|[yY])$ ]]; then
        echo -e "${CYAN}Usuario SSH:${NC}"
        read -r SERVER_USER
        echo -e "${CYAN}Host del servidor:${NC}"
        read -r SERVER_HOST
        echo -e "${CYAN}Ruta en el servidor:${NC}"
        read -r SERVER_PATH
        echo -e "${CYAN}Puerto SSH (default 22):${NC}"
        read -r input_port
        SERVER_PORT=${input_port:-22}
    else
        echo -e "${YELLOW}Saltando despliegue automático${NC}"
        echo -e "${GREEN}✓ Build completado. Puedes subir manualmente los archivos de:${NC}"
        echo -e "  ${CYAN}platforms/browser/www/${NC}"
        exit 0
    fi
fi


# Verificar si lftp está instalado
if ! command -v lftp &> /dev/null; then
    echo -e "${YELLOW}⚠ lftp no está instalado.${NC}"
    echo -e "${CYAN}Instalando lftp...${NC}"
    sudo apt-get update && sudo apt-get install -y lftp
fi

# Leer la contraseña de forma segura
if [ -n "$1" ]; then
    PASSWORD="$1"
else
    echo -n "Contraseña: "
    read -s PASSWORD
    echo ""
fi

# Listar estructura de carpetas en la raíz y en public_html
echo -e "${CYAN}Listando estructura de carpetas en la raíz del FTP...${NC}"
lftp -u ${SERVER_USER},${PASSWORD} ${SERVER_HOST} << EOF
set ftp:ssl-force true
set ftp:ssl-protect-data true
set ssl:verify-certificate no
set ftp:passive-mode true
ls
ls public_html
bye
EOF

echo -e "${YELLOW}¿Dónde querés subir la app?${NC}"
echo -e "1) public_html/app (recomendado)"
echo -e "2) public_html (directo en la raíz web)"
echo -e "3) Cancelar"
read -p "Elegí una opción [1-3]: " opcion

case $opcion in
    1)
        DESTINO="public_html/app"
        ;;
    2)
        DESTINO="public_html"
        ;;
    *)
        echo -e "${YELLOW}Cancelado por el usuario. No se subió nada.${NC}"
        exit 0
        ;;
esac

echo -e "${CYAN}Vas a subir el contenido de platforms/browser/www/ a: $DESTINO${NC}"
read -p "¿Confirmás el deploy? (s/n): " confirmacion
if [[ ! "$confirmacion" =~ ^([sS]|[yY])$ ]]; then
    echo -e "${YELLOW}Cancelado por el usuario. No se subió nada.${NC}"
    exit 0
fi

# Subir archivos sin borrar nada remoto
lftp -u ${SERVER_USER},${PASSWORD} ${SERVER_HOST} << EOF
set ftp:ssl-force true
set ftp:ssl-protect-data true
set ssl:verify-certificate no
set ftp:passive-mode true
cd $DESTINO
mirror -R --only-newer --verbose platforms/browser/www/ ./
bye
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Despliegue completado exitosamente${NC}"
    echo -e "${CYAN}La aplicación está disponible en: http://mauriciocruzdrones.com/$([ "$DESTINO" = "public_html/app" ] && echo "app" || echo "")${NC}"
else
    echo -e "${RED}✗ Error durante el despliegue${NC}"
    echo -e "${YELLOW}Puedes subir manualmente los archivos de: platforms/browser/www/${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║                ✓ Proceso completado                       ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
