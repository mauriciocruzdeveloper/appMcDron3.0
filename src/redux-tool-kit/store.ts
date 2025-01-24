// store.ts
import { configureStore } from '@reduxjs/toolkit';
import appReducer from './app/app.slice';
import usuarioReducer from './usuario/usuario.slice';
import reparacionReducer from './reparacion/reparacion.slice';

const store = configureStore({
  reducer: {
    app: appReducer,
    usuario: usuarioReducer,
    reparacion: reparacionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
