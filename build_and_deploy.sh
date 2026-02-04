#!/bin/bash

set -e  # Detener en caso de error

# Script unificado para compilar Android, Browser y desplegar
# Combina: build_and_sign_auto.sh + build_and_deploy_browser.sh

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# ==================== CARGAR VARIABLES DE ENTORNO ====================

# Cargar .env si existe
if [ -f ".env" ]; then
    source .env
else
    echo -e "${RED}[ERROR]${NC} Archivo .env no encontrado"
    echo -e "${YELLOW}Crea un archivo .env basándote en .env.example${NC}"
    exit 1
fi

# Verificar que las variables necesarias estén definidas
if [ -z "$KEYSTORE_PASSWORD" ] || [ -z "$FTP_PASSWORD" ]; then
    echo -e "${RED}[ERROR]${NC} Variables faltantes en .env"
    echo -e "${YELLOW}Asegúrate de definir: KEYSTORE_PASSWORD y FTP_PASSWORD${NC}"
    exit 1
fi

# ==================== CONFIGURACIÓN ====================

# Configuración Android
KEYSTORE="/home/mauricio/mauriciokey.keystore"
KEY_ALIAS="mauriciokey"
APK_NAME="appmcdron.apk"
NODE_VERSION="16"
BUILD_DIR="./tmp_build"
SIGNED_APK="$BUILD_DIR/signed_$APK_NAME"
ALIGNED_APK="$BUILD_DIR/aligned_$APK_NAME"

# Configuración Browser/Deploy
SERVER_USER="a0050223"
SERVER_HOST="a0050223.ferozo.com"
SERVER_PATH="public_html/app"
SERVER_PORT="22"

# ==================== FUNCIONES COMUNES ====================

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo -e "${MAGENTA}[====] $1 [====]${NC}"
}

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

progress_bar() {
    local current=$1
    local total=$2
    local message=$3
    local width=50
    local percentage=$((current * 100 / total))
    local filled=$((width * current / total))
    local empty=$((width - filled))
    
    printf "\r${BLUE}["
    printf "%${filled}s" '' | tr ' ' '█'
    printf "%${empty}s" '' | tr ' ' '░'
    printf "]${NC} %3d%% - %s" "$percentage" "$message"
    
    if [ $current -eq $total ]; then
        echo ""
    fi
}

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
        log_error "Falló: $message"
        cat /tmp/build_output_$$.log
        rm -f /tmp/build_output_$$.log
        exit $exit_code
    fi
    
    rm -f /tmp/build_output_$$.log
    return 0
}

# ==================== VERIFICACIÓN DE DEPENDENCIAS ====================

check_and_install_nvm() {
    export NVM_DIR="$HOME/.nvm"
    
    if [ -s "$NVM_DIR/nvm.sh" ]; then
        log_info "NVM ya está instalado"
        \. "$NVM_DIR/nvm.sh"
    else
        log_warn "NVM no encontrado. Instalando..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        log_info "NVM instalado correctamente"
    fi
}

check_and_install_node() {
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    if nvm ls $NODE_VERSION &> /dev/null; then
        log_info "Node.js $NODE_VERSION ya está instalado"
    else
        log_warn "Instalando Node.js $NODE_VERSION..."
        nvm install $NODE_VERSION
        log_info "Node.js $NODE_VERSION instalado"
    fi
    
    nvm use $NODE_VERSION
    log_info "Usando Node.js $(node -v)"
}

check_and_install_java() {
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
        JAVA_MAJOR=$(echo $JAVA_VERSION | cut -d'.' -f1)
        
        if [ "$JAVA_MAJOR" -ge "17" ]; then
            log_info "Java ya está instalado: $JAVA_VERSION"
        else
            log_warn "Java $JAVA_VERSION encontrado, pero se requiere Java 17 o superior"
            log_warn "Instalando OpenJDK 17..."
            sudo apt-get update
            sudo apt-get install -y openjdk-17-jdk
            log_info "Java 17 instalado correctamente"
        fi
    else
        log_warn "Java no encontrado. Instalando OpenJDK 17..."
        sudo apt-get update
        sudo apt-get install -y openjdk-17-jdk
        log_info "Java instalado correctamente"
    fi
    
    if [ -d "/usr/lib/jvm/java-17-openjdk-amd64" ]; then
        export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
        export PATH=$JAVA_HOME/bin:$PATH
        log_info "JAVA_HOME configurado: $JAVA_HOME"
    elif [ -z "$JAVA_HOME" ]; then
        export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
        log_info "JAVA_HOME configurado: $JAVA_HOME"
    fi
}

check_and_install_android_sdk() {
    if [ -d "$HOME/Android/Sdk" ]; then
        log_info "Android SDK encontrado en $HOME/Android/Sdk"
        export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
        export ANDROID_HOME="$HOME/Android/Sdk"
    elif [ -d "$ANDROID_HOME" ]; then
        log_info "Android SDK encontrado en $ANDROID_HOME"
        export ANDROID_SDK_ROOT="$ANDROID_HOME"
    else
        log_warn "Android SDK no encontrado. Instalando..."
        mkdir -p "$HOME/Android/Sdk"
        
        cd "$HOME/Android/Sdk"
        wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
        unzip commandlinetools-linux-9477386_latest.zip
        mkdir -p cmdline-tools/latest
        mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true
        rm commandlinetools-linux-9477386_latest.zip
        
        export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
        export ANDROID_HOME="$HOME/Android/Sdk"
        export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools
        
        yes | sdkmanager --licenses
        sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
        
        cd -
        log_info "Android SDK instalado correctamente"
    fi
    
    export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools
    
    if [ ! -d "$ANDROID_SDK_ROOT/build-tools/34.0.0" ]; then
        log_warn "Build tools 34.0.0 no encontrado. Instalando..."
        if [ -d "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin" ]; then
            yes | $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager --licenses 2>/dev/null || true
            $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager "build-tools;34.0.0" "platforms;android-34"
            log_info "Build tools 34.0.0 instalado"
        else
            log_warn "No se pudo instalar build-tools automáticamente"
        fi
    fi
    
    if [ -d "$ANDROID_SDK_ROOT/build-tools" ]; then
        BUILD_TOOLS_VERSION=$(ls "$ANDROID_SDK_ROOT/build-tools" | sort -V | tail -n 1)
        export PATH=$PATH:$ANDROID_SDK_ROOT/build-tools/$BUILD_TOOLS_VERSION
        log_info "Build tools encontrado: $BUILD_TOOLS_VERSION"
    fi
}

check_and_install_gradle() {
    if command -v gradle &> /dev/null; then
        GRADLE_VERSION=$(gradle -v 2>&1 | grep "Gradle" | head -n 1 | cut -d ' ' -f 2)
        log_info "Gradle ya está instalado: $GRADLE_VERSION"
    else
        log_warn "Gradle no encontrado. Instalando..."
        sudo apt-get update
        sudo apt-get install -y gradle
        log_info "Gradle instalado correctamente"
    fi
}

check_and_install_cordova() {
    if command -v cordova &> /dev/null; then
        CORDOVA_VERSION=$(cordova -v 2>&1)
        log_info "Cordova ya está instalado: $CORDOVA_VERSION"
    else
        log_warn "Cordova no encontrado. Instalando..."
        npm install -g cordova
        log_info "Cordova instalado correctamente"
    fi
}

check_build_tools() {
    if ! command -v zipalign &> /dev/null; then
        log_warn "zipalign no encontrado en PATH. Buscando en Android SDK..."
        if [ -d "$ANDROID_SDK_ROOT/build-tools" ]; then
            BUILD_TOOLS_VERSION=$(ls "$ANDROID_SDK_ROOT/build-tools" | sort -V | tail -n 1)
            export PATH=$PATH:$ANDROID_SDK_ROOT/build-tools/$BUILD_TOOLS_VERSION
            log_info "Build tools agregado al PATH: $BUILD_TOOLS_VERSION"
        else
            log_error "No se encontró zipalign. Instala Android SDK build-tools"
            exit 1
        fi
    else
        log_info "zipalign encontrado: $(which zipalign)"
    fi
    
    if ! command -v apksigner &> /dev/null; then
        log_error "apksigner no encontrado. Verifica la instalación de Android SDK build-tools"
        exit 1
    else
        log_info "apksigner encontrado: $(which apksigner)"
    fi
}

check_keystore() {
    if [ ! -f "$KEYSTORE" ]; then
        log_error "Keystore no encontrado: $KEYSTORE"
        log_error "Por favor, asegúrate de que el archivo keystore existe"
        exit 1
    else
        log_info "Keystore encontrado: $KEYSTORE"
    fi
}

install_npm_dependencies() {
    if [ -f "package.json" ]; then
        log_info "Verificando dependencias npm del proyecto..."
        if [ ! -d "node_modules" ]; then
            log_warn "node_modules no encontrado. Instalando dependencias..."
            npm install
        else
            log_info "Dependencias npm ya instaladas"
        fi
    fi
}

check_cordova_platform() {
    log_info "Verificando estructura base de Cordova..."
    mkdir -p platforms
    mkdir -p plugins
    
    if [ ! -d "www" ]; then
        log_warn "Carpeta www/ no encontrada. Compilando proyecto React..."
        
        npm run build > /tmp/react_build_$$.log 2>&1
        BUILD_EXIT=$?
        
        if [ $BUILD_EXIT -ne 0 ]; then
            log_error "Error: La compilación de React falló"
            log_error "Salida del build:"
            cat /tmp/react_build_$$.log
            rm -f /tmp/react_build_$$.log
            exit 1
        fi
        
        if [ -d "build" ]; then
            mv build www
            log_info "Proyecto React compilado y movido a www/"
        else
            log_error "Error: La compilación no generó la carpeta build/"
            cat /tmp/react_build_$$.log
            rm -f /tmp/react_build_$$.log
            exit 1
        fi
        
        rm -f /tmp/react_build_$$.log
    else
        log_info "Carpeta www/ ya existe"
    fi
    
    if [ -d "platforms/android" ]; then
        log_info "Plataforma Android de Cordova ya está agregada"
    else
        log_warn "Plataforma Android no encontrada. Agregando plataforma..."
        
        cordova platform add android > /tmp/cordova_platform_$$.log 2>&1
        CORDOVA_EXIT=$?
        
        if [ $CORDOVA_EXIT -ne 0 ] || [ ! -d "platforms/android" ]; then
            log_error "Error: No se pudo agregar la plataforma Android de Cordova"
            log_error "Salida de cordova:"
            cat /tmp/cordova_platform_$$.log
            rm -f /tmp/cordova_platform_$$.log
            exit 1
        fi
        
        rm -f /tmp/cordova_platform_$$.log
        log_info "Plataforma Android agregada correctamente"
    fi
}

check_and_install_lftp() {
    if ! command -v lftp &> /dev/null; then
        log_warn "lftp no está instalado"
        log_info "Instalando lftp..."
        sudo apt-get update && sudo apt-get install -y lftp
        log_info "lftp instalado correctamente"
    else
        log_info "lftp ya está instalado"
    fi
}

# ==================== BANNER ====================

echo ""
echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║                                                           ║${NC}"
echo -e "${MAGENTA}║       McDRON - BUILD & DEPLOY ALL (ANDROID + WEB)        ║${NC}"
echo -e "${MAGENTA}║                                                           ║${NC}"
echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# ==================== VERIFICACIÓN DE DEPENDENCIAS ====================

log_section "VERIFICACIÓN E INSTALACIÓN DE DEPENDENCIAS"
echo ""

TOTAL_STEPS=11
CURRENT_STEP=0

CURRENT_STEP=$((CURRENT_STEP + 1))
progress_bar $CURRENT_STEP $TOTAL_STEPS "Verificando NVM"
check_and_install_nvm

CURRENT_STEP=$((CURRENT_STEP + 1))
progress_bar $CURRENT_STEP $TOTAL_STEPS "Verificando Node.js"
check_and_install_node

CURRENT_STEP=$((CURRENT_STEP + 1))
progress_bar $CURRENT_STEP $TOTAL_STEPS "Verificando Java JDK"
check_and_install_java

CURRENT_STEP=$((CURRENT_STEP + 1))
progress_bar $CURRENT_STEP $TOTAL_STEPS "Verificando Android SDK"
check_and_install_android_sdk

CURRENT_STEP=$((CURRENT_STEP + 1))
progress_bar $CURRENT_STEP $TOTAL_STEPS "Verificando Gradle"
check_and_install_gradle

CURRENT_STEP=$((CURRENT_STEP + 1))
progress_bar $CURRENT_STEP $TOTAL_STEPS "Verificando Cordova"
check_and_install_cordova

CURRENT_STEP=$((CURRENT_STEP + 1))
progress_bar $CURRENT_STEP $TOTAL_STEPS "Verificando Build Tools"
check_build_tools

CURRENT_STEP=$((CURRENT_STEP + 1))
progress_bar $CURRENT_STEP $TOTAL_STEPS "Verificando Keystore"
check_keystore

CURRENT_STEP=$((CURRENT_STEP + 1))
progress_bar $CURRENT_STEP $TOTAL_STEPS "Instalando dependencias npm"
install_npm_dependencies

CURRENT_STEP=$((CURRENT_STEP + 1))
progress_bar $CURRENT_STEP $TOTAL_STEPS "Verificando plataforma Cordova Android"
check_cordova_platform

CURRENT_STEP=$((CURRENT_STEP + 1))
progress_bar $CURRENT_STEP $TOTAL_STEPS "Verificando lftp"
check_and_install_lftp

echo ""
log_info "✓ TODAS LAS DEPENDENCIAS VERIFICADAS CORRECTAMENTE"
echo ""

# ==================== COMPILACIÓN ANDROID APK ====================

log_section "COMPILACIÓN DE APK ANDROID"
echo ""

mkdir -p "$BUILD_DIR"

log_info "==> Paso 1/5: Construyendo APK en modo release..."
echo ""

cordova build android --release -- --packageType=apk &
BUILD_PID=$!

spinner $BUILD_PID "Compilando aplicación Android (esto puede tardar varios minutos)"

wait $BUILD_PID
BUILD_EXIT=$?

if [ $BUILD_EXIT -ne 0 ]; then
  log_error "Error al compilar la aplicación Android"
  exit 1
fi
log_info "✓ APK construido correctamente"
echo ""

log_info "==> Paso 2/5: Copiando APK sin firmar..."
cp "platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk" "$BUILD_DIR/$APK_NAME"
log_info "✓ APK copiado a $BUILD_DIR/$APK_NAME"
echo ""

log_info "==> Paso 3/5: Alineando APK..."
if [ -f "$ALIGNED_APK" ]; then
  rm -f "$ALIGNED_APK"
fi

run_with_spinner "Alineando APK" zipalign -v -p 4 "$BUILD_DIR/$APK_NAME" "$ALIGNED_APK"
log_info "✓ APK alineado correctamente"
echo ""

log_info "==> Paso 4/5: Firmando APK..."
run_with_spinner "Firmando APK con keystore" apksigner sign --ks "$KEYSTORE" --ks-key-alias "$KEY_ALIAS" --ks-pass pass:$KEYSTORE_PASSWORD --out "$SIGNED_APK" "$ALIGNED_APK"
log_info "✓ APK firmado correctamente"
echo ""

log_info "==> Paso 5/5: Verificando firma del APK..."
run_with_spinner "Verificando firma" apksigner verify --verbose "$SIGNED_APK"
log_info "✓ APK firma verificada correctamente"
echo ""

log_info "✓ COMPILACIÓN ANDROID COMPLETADA"
log_info "📱 APK final: $SIGNED_APK"
log_info "📦 Tamaño: $(du -h "$SIGNED_APK" | cut -f1)"
echo ""

# ==================== COMPILACIÓN BROWSER ====================

log_section "COMPILACIÓN BROWSER WEB"
echo ""

log_info "==> Paso 1/4: Limpiando build anterior..."
if [ -d "platforms/browser" ]; then
    run_with_spinner "Limpiando plataforma browser" rm -rf platforms/browser/www/*
fi
if [ -d "www" ]; then
    run_with_spinner "Limpiando carpeta www" rm -rf www
fi
log_info "✓ Limpieza completada"
echo ""

log_info "==> Paso 2/4: Compilando aplicación React..."
run_with_spinner "Ejecutando npm run build" npm run build
log_info "✓ React compilado"
echo ""

log_info "==> Paso 3/4: Preparando archivos para Cordova..."
if [ ! -d "www" ]; then
    mkdir -p www
fi
run_with_spinner "Copiando archivos a www" cp -r build/* www/
log_info "✓ Archivos preparados"
echo ""

log_info "==> Paso 4/4: Compilando Cordova para Browser..."
run_with_spinner "Ejecutando cordova build browser" cordova build browser

if [ ! -d "platforms/browser/www" ]; then
    log_error "El build de Cordova Browser falló"
    exit 1
fi

log_info "✓ COMPILACIÓN BROWSER COMPLETADA"
log_info "🌐 Archivos generados en: platforms/browser/www/"
echo ""

# ==================== DESPLIEGUE A SERVIDOR ====================

log_section "DESPLIEGUE AL SERVIDOR"
echo ""

log_info "Desplegando en: $SERVER_PATH"

lftp -u ${SERVER_USER},${FTP_PASSWORD} ${SERVER_HOST} << EOF
set ftp:ssl-force true
set ftp:ssl-protect-data true
set ssl:verify-certificate no
set ftp:passive-mode true
cd $SERVER_PATH
mirror -R --only-newer --verbose platforms/browser/www/ ./
bye
EOF

if [ $? -eq 0 ]; then
    log_info "✓ Despliegue completado exitosamente"
    log_info "🌐 La aplicación está disponible en: http://mauriciocruzdrones.com/app"
else
    log_error "Error durante el despliegue"
    log_warn "Puedes subir manualmente los archivos de: platforms/browser/www/"
    exit 1
fi

echo ""
echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║                                                           ║${NC}"
echo -e "${MAGENTA}║            ✓ PROCESO COMPLETO FINALIZADO                  ║${NC}"
echo -e "${MAGENTA}║                                                           ║${NC}"
echo -e "${MAGENTA}║  📱 APK Android: $BUILD_DIR/signed_$APK_NAME              ║${NC}"
echo -e "${MAGENTA}║  🌐 Web desplegada: http://mauriciocruzdrones.com/app    ║${NC}"
echo -e "${MAGENTA}║                                                           ║${NC}"
echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
