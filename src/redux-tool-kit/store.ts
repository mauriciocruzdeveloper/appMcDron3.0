// store.ts
import { configureStore } from '@reduxjs/toolkit';
import appReducer from './app/app.slice';
import usuarioReducer from './usuario/usuario.slice';
import reparacionReducer from './reparacion/reparacion.slice';
import mensajeReducer from './mensaje/mensaje.slice';
import repuestoReducer from './repuesto/repuesto.slice';
import droneReducer from './drone/drone.slice';
import modeloDroneReducer from './modeloDrone/modeloDrone.slice';
// Importa otros reducers según sea necesario

export const store = configureStore({
  reducer: {
    app: appReducer,
    usuario: usuarioReducer,
    reparacion: reparacionReducer,
    mensaje: mensajeReducer,
    repuesto: repuestoReducer,
    drone: droneReducer,
    modeloDrone: modeloDroneReducer,
    // Agrega otros reducers según sea necesario
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Tipos de inferencia para useAppSelector y useAppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
