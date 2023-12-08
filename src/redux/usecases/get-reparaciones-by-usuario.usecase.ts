import { Dispatch } from "redux";
import { getReparaciones } from "../root-actions";

export const getReparacionesByUsuario = () => (dispatch: Dispatch, state: ) => {
    console.log("getReparaciones() FILTROS: " + JSON.stringify(filtros));
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        getReparacionesPersistencia(reparaciones => dispatch(setReparacionesToRedux(reparaciones)), usuario, filtros)
        .then(() => resolve())
        // .catch(() => {
        //     dispatch(abreModal("Error", "Error en getReparaciones() al buscar las Reparaciones", "danger"));
        //     reject();
        // })
        .finally(() => dispatch(isFetchingCoplete()));
    });
}