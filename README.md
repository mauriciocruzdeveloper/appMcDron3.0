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


## COMPILAR APK

nvm use 16

cordova build android --release -- --packageType=apk (para que genere una apk y no una aab)

La versión de Gradle tiene que ser la 7.6: https://askubuntu.com/questions/1307132/how-to-upgrade-gradle-to-6-7-1

### Instalar SDKs

1. Descargar Android Studio: https://developer.android.com/studio?hl=es-419
2. cd ~/Descargas
3. tar -xzvf android-studio-2024.2.1.12-linux.tar.gz -C ~/Android
4. mkdir ~/Android
5. cd ~/Android/android-studio/bin
6. ./studio.sh
Instalar herramientas de línea de comandos
7. sudo apt install google-android-cmdline-tools-1.0-installer
8. sudo apt install google-android-platform-tools-installer
Instalar JDk8 (Probablemente tiene que ser la 17)
9. sudo apt update
10. sudo apt install openjdk-8-jdk
Seleccionar la versión correcta de java
11. sudo update-alternatives --config javac
Instalar gradle (Quizás hay que instalar la 8.3, al final termina instalando esa...)
12. sudo apt remove gradle
13. wget https://services.gradle.org/distributions/gradle-7.6-bin.zip
14. sudo mkdir /opt/gradle
15. sudo unzip gradle-7.6-bin.zip -d /opt/gradle
16. sudo nano ~/.bashrc
17. Copiar
export GRADLE_HOME=/opt/gradle/gradle-7.6
export PATH=$PATH:$GRADLE_HOME/bin
18. source ~/.bashrc
19. gradle -v
Tiene que decir 7.6

Script hecho en bash para instalar todo esto:
https://chatgpt.com/c/676a081f-df28-8007-b653-a2978c623858
Probar!!!

### PASOS

#### Con sh
(No va a funcionar porque falta la contraseña para firmar, se hará una versión sin firma, pero no se podrá instalar en el teléfono)
sh ./build_and_sign.sh

### Sin sh

1. Construir la APK (Release)
Ejecuta el siguiente comando para compilar tu aplicación en modo release:

cordova build android --release -- --packageType=apk

2. Alinear el APK
Usa zipalign para optimizar el APK:

zipalign -v -p 4 appmcdron.apk appmcdron-aligned.apk

3. Firmar el APK
Firma el APK con apksigner:

apksigner sign --ks mauriciokey.keystore appmcdron-aligned.apk

4. Verificar la firma
Verifica que el APK esté correctamente firmado:

apksigner verify --verbose appmcdron-aligned.apk

5. Instalar en el dispositivo
Finalmente, instala el APK en tu dispositivo Android:

adb install appmcdron-aligned.apk