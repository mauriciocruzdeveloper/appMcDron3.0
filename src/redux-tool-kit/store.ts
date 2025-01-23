// store.ts
import { configureStore } from '@reduxjs/toolkit';
import appReducer from './app/app.slice';
import usuarioReducer from './usuario/usuario.slice';


const store = configureStore({
  reducer: {
    app: appReducer,
    usuario: usuarioReducer,
  },
  // Middleware se añade automáticamente, incluyendo Thunk.
  // Si necesitas personalizarlo, puedes usar esta opción:
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware({ ... }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
