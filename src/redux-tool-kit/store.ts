// store.ts
import { configureStore } from '@reduxjs/toolkit';
import appReducer from './app/app.slice';
import modalsReducer from './modals/modals.slice';

const store = configureStore({
  reducer: {
    app: appReducer,
    modals: modalsReducer,
  },
  // Middleware se añade automáticamente, incluyendo Thunk.
  // Si necesitas personalizarlo, puedes usar esta opción:
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware({ ... }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
