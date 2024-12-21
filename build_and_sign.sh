#!/bin/bash

# Cargar nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Configura Node.js 16 usando NVM
nvm use 16

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

# 1. Compilar la app
echo "==> Construyendo APK en modo release..."
cordova build android --release -- --packageType=apk
if [ $? -ne 0 ]; then
  echo "Error al compilar la aplicación."
  exit 1
fi
echo "==> APK construido correctamente."

# 2. Mover el APK generado al directorio temporal
cp "platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk" "$BUILD_DIR/$APK_NAME"

# 3. Alinear el APK
echo "==> Alineando APK..."
if [ -f "$ALIGNED_APK" ]; then
  rm -f "$ALIGNED_APK"
fi

ALIGN_OUTPUT=$(zipalign -v -p 4 "$BUILD_DIR/$APK_NAME" "$ALIGNED_APK" 2>&1)
if [ $? -ne 0 ]; then
  echo "Error al alinear el APK."
  echo "$ALIGN_OUTPUT"
  exit 1
fi
echo "==> APK alineado correctamente."

# 4. Firmar el APK
echo "==> Firmando APK..."
apksigner sign --ks "$KEYSTORE" --ks-key-alias "$KEY_ALIAS" --ks-pass pass:$PASSWORD --out "$SIGNED_APK" "$ALIGNED_APK"
if [ $? -ne 0 ]; then
  echo "Error al firmar el APK."
  exit 1
fi
echo "==> APK firmado correctamente."

# 5. Verificar la firma
echo "==> Verificando APK firmado..."
apksigner verify --verbose "$SIGNED_APK"
if [ $? -ne 0 ]; then
  echo "Error al verificar la firma del APK."
  exit 1
fi
echo "APK firma verificada correctamente: $SIGNED_APK"

echo "==> Proceso completado con éxito."
