import { AppTypes } from "./App.types";
import { 
    loginPersistencia, 
    getReparacionesPersistencia,
    getReparacionPersistencia,
    guardarReparacionPersistencia
} from "../../persistencia/persistenciaFirebase";
import { async } from "@firebase/util";

export const isFetchingStart = () => {console.log("llega a isfetching"); return { type: AppTypes.ISFETCHING_START }};
export const isFetchingCoplete = () => ({ type: AppTypes.ISFETCHING_COMPLETE });

export const login = (email, password) => async (dispatch) => {


    return new Promise(async (resolve, reject) => {
        if(email!="" && password!=""){
            dispatch( isFetchingStart());
            await loginPersistencia( email, password )
            .then( usuario => {
                console.log("llega al then del loginPersistencia");
                dispatch({ 
                    type: AppTypes.LOGIN, 
                    payload: { 
                        data: {
                            isLoggedIn: true,
                            usuario
                        }
                    }
                });
                // No hace falta devolver el usuario, pero lo hago por si sirve en otra ocación.
                return resolve(usuario); 
            })
            .catch(error  => {
                console.log("llega al catch del loginPersistencia");
                reject(error);
            })
            .finally(dispatch(isFetchingCoplete()));
        }else{
            const error = {code: "email o password incorrectos"};
            return reject(error);
        };
    });
};

// export const errorLogin = () => ({
//     type: LoginTypes.ERROR_LOGIN,
//     payload: { data: { errorLogin: true } }
// });

export const logout = () => ({
    type: AppTypes.LOGOUT,
    payload: { data: { isLoggedIn: false } }
});

// Los "OnChange" me van actualizando los valores de las variables de estado en la medida que toco algo del formulario.

export const emailOnChangeLogin = ( data ) => ({ 
    type: AppTypes.CHANGE_EMAIL_LOGIN,
    payload: { data }
});

export const passwordOnChangeLogin = ( data ) => ({ 
    type: AppTypes.CHANGE_PASSWORD_LOGIN,
    payload: { data }
});

export const cierraError = () => {
    console.log('llega a cierra');
    return {
        type: AppTypes.MODAL_ERROR,
        payload: { 
            data: {
                modalError: {
                    showError: false
                }
            } 
        }
    }
};

export const abreError = (titulo, mensaje) => {
    console.log('llega a abreError');
    return {
        type: AppTypes.MODAL_ERROR,
        payload: { 
            data: {
                modalError: {
                    showError: true,
                    mensajeError: mensaje,
                    tituloError: titulo
                }
            } 
        }
    }
};

export const changeInputRep = (target) => ({ 
    type: AppTypes.CHANGE_INPUT_REP,
    payload: { input: target.id, data: target.value }
});

export const setEstado = (estado) => ({ 
    type: AppTypes.SET_ESTADO,
    payload: { data: estado }
});

export const getReparaciones = () => async (dispatch) => {
    return new Promise(async (resolve, reject) => {
        dispatch( isFetchingStart());
        await getReparacionesPersistencia()
        .then( reparaciones => {
            console.log("llega al then del getReparacionesPersistencia");
            dispatch({ 
                type: AppTypes.GET_REPARACIONES, 
                payload: { 
                    data: reparaciones
                }
            });
            // No hace falta devolver el usuario, pero lo hago por si sirve en otra ocación.
            return resolve(reparaciones); 
        })
        .catch(error  => {
            console.log("llega al catch del getReparacionesPersistencia");
            reject(error);
        })
        .finally(dispatch(isFetchingCoplete()));
    });
};

export const getReparacion = (id) => async (dispatch) => {
    return new Promise(async (resolve, reject) => {
        dispatch( isFetchingStart());
        await getReparacionPersistencia(id)
        .then( reparacion => {
            console.log("llega al then del getReparacionPersistencia");
            console.log("reparacion: " + JSON.stringify(reparacion))
            dispatch({ 
                type: AppTypes.GET_REPARACION, 
                payload: {
                    id: id,
                    data: reparacion.data
                }
            });
            // No hace falta devolver el usuario, pero lo hago por si sirve en otra ocación.
            return resolve(reparacion); 
        })
        .catch(error  => {
            console.log("llega al catch del getReparacionPersistencia");
            reject(error);
        })
        .finally(dispatch(isFetchingCoplete()));
    });
};

export const guardarReparacion = (reparacion) => async (dispatch) => {
    return new Promise(async (resolve, reject) => {
        dispatch( isFetchingStart());
        await guardarReparacionPersistencia(reparacion)
        .then( reparacion => {
            console.log("llega al then del guardarReparacionPesistencia");
            return resolve(reparacion); 
        })
        .catch(error  => {
            console.log("llega al catch del getReparacionPersistencia");
            reject(error);
        })
        .finally(dispatch(isFetchingCoplete()));
    });
    
}