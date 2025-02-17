// Importa las funciones necesarias desde el SDK de Firebase
import { initializeApp } from 'firebase/app';
import { CACHE_SIZE_UNLIMITED, enableIndexedDbPersistence, getFirestore, initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { config } from './configProd';

// Inicializa Firebase
const app = initializeApp(config);

// Setea la cache de Firestore a ilimitada
const firestore = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
})

// Habilita la persistensia sin conexión
enableIndexedDbPersistence(firestore)
  .then(() => console.log('Persistencia habilitada'))
  .catch((err) => console.log('Error en persistencia: ' + err));

// Exporta los servicios que vas a usar
export const db = getFirestore(app); // Firestore
export const auth = getAuth(app); // Authentication
export const storage = getStorage(app); // Storage
