# App MC Dron 3.0

La versión anterior es la 2.0 que está siendo desarrollada en Framework7/Cordova/Firebase. La versión 3.0 está siendo desarrollada en Bootstrap/React/Redux/Cordova/Firebase.
Ambas versiones no están terminadas, y ambas siguen desarrollándose.

### Versión APK (para Android) de prueba

http://mauriciocruzdrones.com/app/appmcdrondev.apk

### Versión de prueba online (puede estar desactualizada)

http://mauriciocruzdrones.com/app

Administrador
usuario: admin@mauriciocruzdrones.com
password: 123456

Invitado
usuario: invitado@mauriciocruzdrones.com
password: 123456

O sino puede registrarse y tendrá una cuenta como invitado.


## COMANZAR

- cordova run browser: Para levantar con Cordova
- npm start: Para levantar con React


## PROBLEMAS

- El complemento cordova-plugin-firestore da problemas al compilar. Por ejemplo, en la línea 128 de RunTransactionHandler.java no encuentra NonNull. Hay que modificar ese archivo para solucionar el problema importando la clase NonNull correctamente.

- Instalar Java8, Android Studio y Gradle: https://stackoverflow.com/questions/66864889/how-to-solve-android-sdk-root-undefined-recommended-setting-and-android-home-u

- Setear variables de entorno.
export ANDROID_SDK_ROOT="/home/mauricio/Android/Sdk/"
export JAVA_HOME="/usr/java/jdk1.8.0_202"

- Para ver si están exportadas las variables de entorno
echo $ANDROID_SDK_ROOT
echo $JAVA_HOME


## PRIMERA ETAPA

En la primera etapa sólo se harán las funcionalidades relacionadas a las REPARACIONES y los USUARIOS. Se podrá pedir un PRESUPUESTO, y éste generará una nueva reparación en estado "Consulta" y guardará el usuario. Se podrá modificar o eliminar el usuario y/o la reparación.


## SEGUNDA ETAPA

Se agregó la funcionalidad e MENSAJES. En un principio, para enviar y recibir mensajes entre el cliente y el administrador. Está hecho de tal manera que permitiría, con pocas modificaciones, enviar mensajes también entre clientes.

Se empezarán a incorporar las NOTIFICACIONES. Primero para los mensajes y luego para las actualizaciones de los estados de las reparaciones.


## TERCERA ETAPA

Se incorporarán notificaciones para los cambios de estado de las reparaciones, para informar el presupuesto, para avisar la recepció no envío del drone, etc.


## CUARTA ETAPA

Otras mejoras.


## TECNOLOGÍAS:

- Cordova
- React
- Redux Thunk
- React Router Dom
- React Bootstrap
- React Floating Action Button
- React Router Dom
- Firebase
- React Select
- React Textarea Autosize

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


## PATRÓN CONTENEDOR-PRESENTACIONAL
Falta implementarlo en algunos componentes. La idea es poder cambiar la capa de presentación prácticamente sin modificar el resto de la app.


## CARACTERÍSTICAS
- Usa persistencia en caché (para Firebase) en caso que se pierda la conexión a internet
- Para conectar los components con las actions y los states uso el patrón container-component.
- La app escucha los cambios en las colecciones a nivel de persistencia, y actualiza las colecciones en redux automáticamente cuando éstas cambian, lo que también actualiza automáticamente la presentación.