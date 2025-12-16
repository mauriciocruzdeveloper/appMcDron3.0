# 📱 Guía de Compilación de AppMcDron

## Scripts Disponibles

### 1. `build_and_sign.sh` (Script Original - Rápido) ⚡
Script básico que requiere todas las dependencias pre-instaladas.

**Características:**
- ✅ Spinner animado durante la compilación
- ✅ Indicadores de progreso paso a paso (1/5, 2/5, etc.)
- ✅ Colores para mejor visualización
- ✅ Ejecución rápida

**Uso:**
```bash
./build_and_sign.sh <password_keystore>
```

### 2. `build_and_sign_auto.sh` (Script Automático Completo) ⭐ RECOMENDADO
Script inteligente que verifica e instala automáticamente todas las dependencias necesarias.

**Características:**
- ✅ Verifica e instala todas las dependencias automáticamente
- ✅ Barra de progreso para verificación de dependencias
- ✅ Spinner animado durante la compilación
- ✅ Funciona en cualquier PC Linux desde cero

**Uso:**
```bash
# IMPORTANTE: Usar bash, no sh
bash ./build_and_sign_auto.sh <password_keystore>

# O dar permisos de ejecución y ejecutar directamente
chmod +x ./build_and_sign_auto.sh
./build_and_sign_auto.sh <password_keystore>
```

## ⚠️ Importante

**NO uses `sh` para ejecutar el script**, siempre usa `bash`:

❌ **INCORRECTO:**
```bash
sh ./build_and_sign_auto.sh N0t9S8e7
```

✅ **CORRECTO:**
```bash
bash ./build_and_sign_auto.sh N0t9S8e7
# O simplemente:
./build_and_sign_auto.sh N0t9S8e7
```

## 📊 Indicadores Visuales Nuevos

### 🌀 Spinner Animado
Durante tareas largas como la compilación verás un spinner girando:
```
⠋ Compilando aplicación (esto puede tardar varios minutos)...
```

Esto te indica que el proceso está en curso y no se ha detenido.

### 📊 Barra de Progreso (en build_and_sign_auto.sh)
Para la verificación de dependencias:
```
[████████████████████░░░░░░░░░░] 60% - Verificando Gradle
```

### ✓ Indicadores de Éxito
```
✓ APK construido correctamente.
✓ APK alineado correctamente.
✓ APK firmado correctamente.
```

### ❌ Mensajes de Error Claros
```
[ERROR] Error al compilar la aplicación.
```

## 🔧 Dependencias que se Instalan Automáticamente

El script `build_and_sign_auto.sh` verifica e instala:

1. ✅ **NVM** (Node Version Manager)
2. ✅ **Node.js 16**
3. ✅ **Java JDK 11**
4. ✅ **Android SDK**
5. ✅ **Gradle**
6. ✅ **Cordova**
7. ✅ **Build Tools** (zipalign, apksigner)
8. ✅ **Dependencias npm del proyecto**

## 📋 Requisitos Previos

- Sistema operativo Linux
- Acceso a `sudo` (para instalar paquetes del sistema)
- Conexión a internet
- Archivo keystore en `/home/mauricio/mauriciokey.keystore`

## 🚀 Primera Vez en una PC Nueva

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd appMcDron3.0

# 2. Ejecutar el script automático
bash ./build_and_sign_auto.sh <tu_password>

# 3. Esperar a que instale todo y compile
# El APK final estará en: ./tmp_build/signed_appmcdron.apk
```

## 📦 Salida del Script

El APK firmado se guarda en:
```
./tmp_build/signed_appmcdron.apk
```

## 🐛 Solución de Problemas

### Error: "NVM no está disponible"
- **Causa:** Estás usando `sh` en lugar de `bash`
- **Solución:** Usa `bash ./build_and_sign_auto.sh <password>`

### Error: "Keystore no encontrado"
- **Causa:** El archivo keystore no está en la ruta esperada
- **Solución:** Asegúrate de que `/home/mauricio/mauriciokey.keystore` existe o modifica la variable `KEYSTORE` en el script

### Error: "Permission denied"
- **Causa:** El script no tiene permisos de ejecución
- **Solución:** `chmod +x ./build_and_sign_auto.sh`

## 💡 Consejos

- El script muestra mensajes con colores para mejor visibilidad
- Verde = Información/Éxito
- Amarillo = Advertencia/Instalando
- Rojo = Error

- Si algo falla durante la instalación de dependencias, el script se detiene automáticamente
- Puedes ejecutar el script múltiples veces, solo instalará lo que falte
