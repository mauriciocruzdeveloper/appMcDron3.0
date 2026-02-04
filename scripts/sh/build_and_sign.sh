#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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
    
    $command > /tmp/build_output_$$.log 2>&1 &
    local pid=$!
    
    spinner $pid "$message"
    
    wait $pid
    local exit_code=$?
    
    if [ $exit_code -ne 0 ]; then
        echo -e "${RED}[ERROR]${NC} Falló: $message"
        cat /tmp/build_output_$$.log
        rm -f /tmp/build_output_$$.log
        exit $exit_code
    fi
    
    rm -f /tmp/build_output_$$.log
    return 0
}

# Cargar nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Configura Node.js 16 usando NVM
nvm use 16

# Configurar variables de entorno de Android SDK
if [ -d "$HOME/Android/Sdk" ]; then
    export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
    export ANDROID_HOME="$HOME/Android/Sdk"
elif [ -n "$ANDROID_HOME" ]; then
    export ANDROID_SDK_ROOT="$ANDROID_HOME"
else
    echo -e "${RED}[ERROR]${NC} Android SDK no encontrado en $HOME/Android/Sdk"
    echo -e "${RED}[ERROR]${NC} Por favor, instala Android SDK o configura ANDROID_HOME"
    exit 1
fi

# Agregar herramientas de Android al PATH
export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools

# Buscar y agregar build-tools al PATH
if [ -d "$ANDROID_SDK_ROOT/build-tools" ]; then
    BUILD_TOOLS_VERSION=$(ls "$ANDROID_SDK_ROOT/build-tools" | sort -V | tail -n 1)
    export PATH=$PATH:$ANDROID_SDK_ROOT/build-tools/$BUILD_TOOLS_VERSION
fi

# Configurar JAVA_HOME para Java 17
if [ -d "/usr/lib/jvm/java-17-openjdk-amd64" ]; then
    export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
    export PATH=$JAVA_HOME/bin:$PATH
fi

# Variables configurables
KEYSTORE="/home/mauricio/mauriciokey.keystore"
KEY_ALIAS="mauriciokey"
APK_NAME="appmcdron.apk"
PASSWORD="$1" # Toma la contraseña del primer parámetro del script

if [ -z "$PASSWORD" ]; then
  echo "Error: Debes proporcionar la contraseña del keystore como primer parámetro."
  echo "Uso: $0 <keystore_password>"
  exit 1
fi

# Directorios temporales
BUILD_DIR="./tmp_build"
SIGNED_APK="$BUILD_DIR/signed_$APK_NAME"
ALIGNED_APK="$BUILD_DIR/aligned_$APK_NAME"

# Crear directorio de compilación si no existe
mkdir -p "$BUILD_DIR"

# Crear carpetas base de Cordova
mkdir -p platforms
mkdir -p plugins

# Verificar que existe www/, si no, compilar React
if [ ! -d "www" ]; then
  echo -e "${YELLOW}[WARN]${NC} Carpeta www/ no encontrada. Compilando proyecto React..."
  npm run build
  
  if [ -d "build" ]; then
    mv build www
    echo -e "${GREEN}✓ Proyecto React compilado y movido a www/${NC}"
  else
    echo -e "${RED}[ERROR]${NC} Error: La compilación no generó la carpeta build/"
    exit 1
  fi
fi

# Verificar que la plataforma Android esté agregada
if [ ! -d "platforms/android" ]; then
  echo -e "${YELLOW}[WARN]${NC} Plataforma Android no encontrada. Agregando plataforma..."
  cordova platform add android
  if [ ! -d "platforms/android" ]; then
    echo -e "${RED}[ERROR]${NC} Error: No se pudo agregar la plataforma Android de Cordova"
    exit 1
  fi
  echo -e "${GREEN}✓ Plataforma Android agregada correctamente${NC}"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              INICIANDO COMPILACIÓN DE APK                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Compilar la app
echo -e "${GREEN}==> Paso 1/5: Construyendo APK en modo release...${NC}"
echo ""

cordova build android --release -- --packageType=apk &
BUILD_PID=$!

spinner $BUILD_PID "Compilando aplicación (esto puede tardar varios minutos)"

wait $BUILD_PID
if [ $? -ne 0 ]; then
  echo -e "${RED}Error al compilar la aplicación.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ APK construido correctamente.${NC}"
echo ""

# 2. Mover el APK generado al directorio temporal
echo -e "${GREEN}==> Paso 2/5: Copiando APK sin firmar...${NC}"
cp "platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk" "$BUILD_DIR/$APK_NAME"
echo -e "${GREEN}✓ APK copiado correctamente.${NC}"
echo ""

# 3. Alinear el APK
echo -e "${GREEN}==> Paso 3/5: Alineando APK...${NC}"
if [ -f "$ALIGNED_APK" ]; then
  rm -f "$ALIGNED_APK"
fi

run_with_spinner "Alineando APK" zipalign -v -p 4 "$BUILD_DIR/$APK_NAME" "$ALIGNED_APK"
echo -e "${GREEN}✓ APK alineado correctamente.${NC}"
echo ""

# 4. Firmar el APK
echo -e "${GREEN}==> Paso 4/5: Firmando APK...${NC}"
run_with_spinner "Firmando APK con keystore" apksigner sign --ks "$KEYSTORE" --ks-key-alias "$KEY_ALIAS" --ks-pass pass:$PASSWORD --out "$SIGNED_APK" "$ALIGNED_APK"
echo -e "${GREEN}✓ APK firmado correctamente.${NC}"
echo ""

# 5. Verificar la firma
echo -e "${GREEN}==> Paso 5/5: Verificando firma del APK...${NC}"
run_with_spinner "Verificando firma" apksigner verify --verbose "$SIGNED_APK"
echo -e "${GREEN}✓ APK firma verificada correctamente.${NC}"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✓ PROCESO COMPLETADO CON ÉXITO               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📱 APK final: $SIGNED_APK${NC}"
echo -e "${GREEN}📦 Tamaño: $(du -h "$SIGNED_APK" | cut -f1)${NC}"
echo ""
