#!/bin/bash

set -e  # Detener el script si ocurre un error

# Variables
ANDROID_STUDIO_URL="https://developer.android.com/studio?hl=es-419"
ANDROID_STUDIO_ARCHIVE="android-studio-2024.2.1.12-linux.tar.gz"
ANDROID_DIR="$HOME/Android"
GRADLE_VERSION="7.6"
GRADLE_URL="https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip"
GRADLE_DIR="/opt/gradle"
JAVA_VERSION="8"

echo "== Instalación de Android Studio =="
echo "Descargando Android Studio desde: $ANDROID_STUDIO_URL"
cd ~/Descargas
if [ ! -f "$ANDROID_STUDIO_ARCHIVE" ]; then
    wget -O "$ANDROID_STUDIO_ARCHIVE" "$ANDROID_STUDIO_URL"
fi

echo "Extrayendo Android Studio..."
mkdir -p "$ANDROID_DIR"
tar -xzvf "$ANDROID_STUDIO_ARCHIVE" -C "$ANDROID_DIR"

echo "Ejecutando Android Studio..."
"$ANDROID_DIR/android-studio/bin/studio.sh" &

echo "== Instalación de herramientas de línea de comandos =="
sudo apt update
sudo apt install -y google-android-cmdline-tools-1.0-installer google-android-platform-tools-installer

echo "== Instalación de JDK $JAVA_VERSION =="
sudo apt install -y openjdk-${JAVA_VERSION}-jdk
echo "Seleccionando la versión correcta de Java..."
sudo update-alternatives --config javac

echo "== Instalación de Gradle =="
echo "Eliminando versiones anteriores de Gradle..."
sudo apt remove -y gradle
echo "Descargando Gradle $GRADLE_VERSION desde: $GRADLE_URL"
cd ~/Descargas
wget -O "gradle-${GRADLE_VERSION}-bin.zip" "$GRADLE_URL"

echo "Instalando Gradle..."
sudo mkdir -p "$GRADLE_DIR"
sudo unzip -o "gradle-${GRADLE_VERSION}-bin.zip" -d "$GRADLE_DIR"

echo "Configurando variables de entorno para Gradle..."
if ! grep -q "GRADLE_HOME" ~/.bashrc; then
    echo "export GRADLE_HOME=${GRADLE_DIR}/gradle-${GRADLE_VERSION}" >> ~/.bashrc
    echo "export PATH=\$PATH:\$GRADLE_HOME/bin" >> ~/.bashrc
fi
source ~/.bashrc

echo "Verificando instalación de Gradle..."
gradle -v

echo "Instalación completada. Android Studio y las herramientas están listas para usarse."
