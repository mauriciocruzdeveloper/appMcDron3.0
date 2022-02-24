# App MC Dron 3.0

La versión anterior es la 2.0 que está siendo desarrollada en Framework7/Cordova/Firebase. La versión 3.0 está siendo desarrollada en Bootstrap/React/Cordova/Firebase.
Ambas versiones no están terminadas, y ambas siguen desarrollándose.

## PRIMERA ETAPA

En la primera etapa sólo se harán las funcionalidades relacionadas a las reparaciones y los usuarios. Se podrá pedir un presupuesto, y éste generará una nueva reparación en estado "Consulta" y guardará el usuario. Se podrá modificar o eliminar el usuario y/o la reparación.

### Versión de prueba online (puede estar desactualizada)
http://mauriciocruzdrones.com/app


## TECNOLOGÍAS:
- Cordova
- React
- Redux Thunk
- React Router Dom
- React Bootstrap
- React Floating Action Button
- React Router Dom
- Firebase
- React-Select

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


## MODELO DE FLUJO


## PATRÓN CONTENEDOR-PRESENTACIONAL


## CARACTERÍSTICAS
- Usa persistencia en caché (para Firebase) en caso que se pierda la conexión a internet
- Para conectar los components con las actions y los states uso el patrón container-component.
- La app escucha los cambios en las colecciones a nivel de persistencia, y actualiza las colecciones en redux automáticamente cuando éstas cambian, lo que también actualiza automáticamente la presentación.