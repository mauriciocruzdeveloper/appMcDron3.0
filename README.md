# App MC Dron 3.0

App MC Dron 3.0 es una aplicación diseñada para gestionar un negocio de reparación de drones, optimizando la administración de presupuestos, reparaciones y comunicación con clientes. Se ha desarrollado con Cordova, React, Redux Toolkit y Firebase, permitiendo su ejecución en la web y en dispositivos Android (con potencial soporte para iOS).

Siguiendo la filosofía Local First, la aplicación almacena y gestiona los datos localmente, sincronizándolos con la nube solo cuando es necesario. Esto garantiza un mejor rendimiento y una experiencia más fluida en comparación con aplicaciones que dependen exclusivamente de servidores remotos.

## PRIMERA ETAPA: Gestión de reparaciones y usuarios

- Implementación de funcionalidades para gestionar reparaciones y usuarios.
- Se podrá solicitar un presupuesto, lo que creará una nueva reparación en estado "Consulta" y registrará al usuario.
- Se permitirá modificar o eliminar tanto el usuario como la reparación.


## SEGUNDA ETAPA: Mensajería y notificaciones

- Se agregará un sistema de mensajería entre el cliente y el administrador.
- La arquitectura permitirá futuras expansiones para habilitar mensajes entre clientes.
- Se implementarán notificaciones, inicialmente para mensajes y luego para cambios de estado en las reparaciones.


## TERCERA ETAPA: Expansión de notificaciones

- Se agregarán notificaciones para:
    - Cambios de estado en las reparaciones.
    - Envío de presupuestos.
    - Avisos de recepción y envío de drones.


## CUARTA ETAPA: Mejoras y optimización

- Implementación de optimizaciones en rendimiento y experiencia de usuario.
- Incorporación de nuevas funcionalidades según las necesidades detectadas.
- **Gestión de inventario de repuestos con ledger de movimientos**: stock físico y demanda
  comprometida (`UnidadesComprometidas`) derivados de una tabla append-only `stock_movement`
  (reserva al aceptar, consumo al reparar, recepción de pedidos, ajuste manual). Detalle y
  reglas en `openspec/project.md` (Reglas de Negocio) y propuestas en `openspec/changes/`.
- **Validación de transiciones de estado** según mapa de dominio (`usecases/estadosReparacion.ts`):
  no se pueden saltear estados; Cobrado/Enviado/Finalizado exigen pasar por Reparado.

## Versiones

- Versión 2.0: Desarrollada en Framework7/Cordova/Firebase (desarrollo pausado).
- Versión 3.0: Actualmente en desarrollo con Bootstrap/React/Redux/Cordova/Firebase.

### Versión APK (para Android) de prueba

http://mauriciocruzdrones.com/app/appmcdrondev.apk (próximamente)

### Versión de prueba online (puede estar desactualizada)

http://mauriciocruzdrones.com/demo (proximamente)

Administrador
usuario: admin@mauriciocruzdrones.com
password: 123456

Invitado
usuario: invitado@mauriciocruzdrones.com
password: 123456

O sino puede registrarse y tendrá una cuenta como invitado.


## COMENZAR

### INSTALAR CORDOVA
 npm install -g cordova

- cordova run browser: Para levantar con Cordova
- npm start: Para levantar con React


## Solución a errores comunes

### Error en cordova-plugin-firestore

- El archivo RunTransactionHandler.java (línea 128) no encuentra NonNull.
- Solución: Importar manualmente la clase NonNull.

### Configuración del entorno - Instalar Java 8, Android Studio y Gradle

- Instalar Java8, Android Studio y Gradle: https://stackoverflow.com/questions/66864889/how-to-solve-android-sdk-root-undefined-recommended-setting-and-android-home-u

### Configurar variables de entorno

- Setear variables de entorno.
export ANDROID_SDK_ROOT="/home/mauricio/Android/Sdk/"
export JAVA_HOME="/usr/java/jdk1.8.0_202"

### Verificar que las variables de entorno estén correctamente exportadas

- Para ver si están exportadas las variables de entorno
echo $ANDROID_SDK_ROOT
echo $JAVA_HOME


## TECNOLOGÍAS:

- Frontend:

    - React
    - Redux Toolkit
    - React Router Dom
    - React Bootstrap
    - React Floating Action Button
    - React Select
    - React Textarea Autosize

- Backend y almacenamiento:

    - Firebase

- Plataforma móvil:

    - Cordova

### Floating Action Button

- https://www.npmjs.com/package/react-floating-action-button

### React Bootstrap

- https://www.npmjs.com/package/react-bootstrap

### Redux Thunk

- https://www.npmjs.com/package/redux-thunk

### React Select

- https://react-select.com

### React Router Dom

- https://reactrouter.com/

### Cordova

- https://cordova.apache.org/

### React

- https://es.reactjs.org/

### React Textarea Autosize

- https://www.npmjs.com/package/react-textarea-autosize


## PLUGINS

- cordova-plugin-local-notification

https://www.npmjs.com/package/cordova-plugin-local-notification

- cordova-plugin-email

https://www.npmjs.com/package/cordova-plugin-email

- cordova-sms-plugin

https://www.npmjs.com/package/cordova-sms-plugin


## MODELO DE FLUJO

El flujo es como el de redux. Las acciones se originan en el componente presetacional, luego se pasan los parámetros del evento mediante callbacks al componente container. El container llama a las "action creators" conectadas mediante connect(). Las "action creators" llaman al backend de manera asincrónica, si es el caso, o hacen lo que tengan que hacer para luego crear la acción y dispacharla al reducer. El reducer modifica el estado. El estado pasa al componente container, y el container pasa los parámetros que necesita el componente presentacional. El componente presentacional muestra la vista según el estado del store.

Los estados de los componentes tipo formularios se manejan de manera local con el hook useState.


## PATRÓN CONTENEDOR-PRESENTACIONAL (Refactorizando a custom hooks)
Esto está refactorizándose, se van a usar custom hooks.

Falta implementarlo en algunos componentes. La idea es poder cambiar la capa de presentación prácticamente sin modificar el resto de la app.


## CARACTERÍSTICAS
- Usa persistencia en caché (para Firebase) en caso que se pierda la conexión a internet
- Para conectar los components con las actions y los states uso acciones y selectores.
- La app escucha los cambios en las colecciones a nivel de persistencia, y actualiza las colecciones en redux automáticamente cuando éstas cambian, lo que también actualiza automáticamente la presentación.


## NOTAS - CASO DE USO - EJEMPLO

- El usuario guarda en estado

USUAIRO --estadoSeleccionadoId--> SISTEMA FRONT --estadoSeleccionadId+Fecha--> PERSISTENCIA


## COMPILAR Y DESPLEGAR

### 🚀 Script Unificado Completo (RECOMENDADO)

El proyecto incluye un script automatizado todo-en-uno que compila Android, Browser y despliega automáticamente:

```bash
chmod +x build_and_deploy.sh
./build_and_deploy.sh
```

**Este script hace TODO automáticamente:**
- ✅ Verifica e instala todas las dependencias faltantes
- ✅ Compila APK Android firmada y lista para instalar
- ✅ Compila versión web/browser
- ✅ Despliega automáticamente a http://mauriciocruzdrones.com/app
- ✅ Sin preguntas ni confirmaciones - totalmente automatizado
- ✅ Contraseñas ya incluidas en el script

**Dependencias que instala automáticamente:**
- NVM y Node.js 16
- Java JDK 17
- Android SDK (command line tools)
- Gradle
- Cordova
- Build tools (zipalign, apksigner)
- lftp (para despliegue FTP)
- Dependencias npm del proyecto
- Plataformas Android y Browser de Cordova

**Proceso completo:**
1. Verifica e instala dependencias (NVM, Node, Java, Android SDK, Gradle, Cordova, lftp)
2. Compila proyecto React
3. Construye APK Android en modo release
4. Alinea y firma APK con keystore
5. Verifica firma del APK
6. Compila versión Browser/Web
7. Despliega automáticamente al servidor Ferozo

**Requisitos previos:**
- Archivo keystore en `/home/mauricio/mauriciokey.keystore`
- Git, curl, wget básicos instalados en Linux

**Salidas:**
- 📱 APK firmada: `./tmp_build/signed_appmcdron.apk`
- 🌐 Web desplegada: http://mauriciocruzdrones.com/app

---

### Scripts Individuales

Todos los scripts están en la raíz del proyecto y en `scripts/sh/`:

- **`build_and_deploy.sh`** ⭐ (RECOMENDADO): Script completo unificado - compila Android + Web + despliega
- **`build_and_sign_auto.sh`**: Solo Android con verificación e instalación automática de dependencias
- **`build_and_sign.sh`**: Solo Android, versión simple (asume dependencias instaladas)
- **`build_and_deploy_browser.sh`**: Solo Web - compila y despliega versión browser

---

### Compilación Manual (si prefieres instalar dependencias por separado)

#### 1. Construir la APK (Release)
```bash
nvm use 16
cordova build android --release -- --packageType=apk
```

#### 2. Alinear el APK
```bash
zipalign -v -p 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk appmcdron-aligned.apk
```

#### 3. Firmar el APK
```bash
apksigner sign --ks mauriciokey.keystore --ks-key-alias mauriciokey --out appmcdron-signed.apk appmcdron-aligned.apk
```

#### 4. Verificar la firma
```bash
apksigner verify --verbose appmcdron-signed.apk
```

#### 5. Instalar en el dispositivo
```bash
adb install appmcdron-signed.apk
```

---

### Notas sobre versiones

- **Node.js:** Versión 16 (gestionado por NVM)
- **Java:** JDK 17 o superior
- **Gradle:** Se instala automáticamente via apt-get
- **Android SDK:** API level 34, Build tools 34.0.0