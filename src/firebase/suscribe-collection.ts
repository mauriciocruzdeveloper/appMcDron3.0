import { AppDispatch } from '../redux-tool-kit/store'; // Ajusta según tu configuración
import { collection, onSnapshot, Query } from 'firebase/firestore';
import { isFetchingStart, setError } from '../redux-tool-kit/modals/appSlice/app.slice';
import { db } from './firebase';
import { setReparaciones } from '../redux-DEPRECATED/App/App.actions';

export const subscribeToCollection = (collectionName: string) => (dispatch: AppDispatch) => {
  dispatch(isFetchingStart());

  try {
    const collectionRef: Query = collection(db, collectionName);

    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        dispatch(setReparaciones(data));
      },
      (error) => {
        console.error('Error listening to Firestore collection:', error);
        dispatch(setError(error.message));
      }
    );
    return unsubscribe;
  } catch (error: any) {
    console.error('Error subscribing to Firestore collection:', error);
    dispatch(setError(error.message));
  }
};
