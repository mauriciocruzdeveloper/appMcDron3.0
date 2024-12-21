import { Unsubscribe } from "firebase/auth";
import { subscribeToCollection } from "../firebase/suscribe-collection";
import { AppDispatch } from "../redux-tool-kit/store";

export const getReparaciones = (): ((dispatch: AppDispatch) => Unsubscribe | undefined) => (dispatch: AppDispatch): Unsubscribe | undefined => {
    return dispatch(subscribeToCollection('REPARACIONES'));
}