import { AppTypes } from "./App.types";
import { 
    loginPersistencia, 
    getReparacionesPersistencia,
    getReparacionPersistencia,
    guardarReparacionPersistencia,
    eliminarReparacionPersistencia
} from "../../persistencia/persistenciaFirebase";
// import { async } from "@firebase/util";

export const isFetchingStart = () => {
    console.log("llega a isfetching"); return { type: AppTypes.ISFETCHING_START }
};
export const isFetchingCoplete = () => (
    { type: AppTypes.ISFETCHING_COMPLETE }
);

export const login = (email, password) => async (dispatch) => {
    return new Promise((resolve, reject) => {
        if(email!="" && password!=""){
            dispatch( isFetchingStart());
            loginPersistencia( email, password )
            .then( usuario => {
                console.log("llega al then del loginPersistencia: " + JSON.stringify(usuario));
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

export const cierraModal = () => {
    console.log('llega a cierra');
    return {
        type: AppTypes.MODAL,
        payload: { 
            data: {
                modal: {
                    showModal: false
                }
            } 
        }
    }
};

export const abreModal = (titulo, mensaje, tipo) => {
    console.log('llega a abreModal');
    return {
        type: AppTypes.MODAL,
        payload: { 
            data: {
                modal: {
                    showModal: true,
                    mensajeModal: mensaje,
                    tituloModal: titulo,
                    tipoModal: tipo
                }
            } 
        }
    }
};

export const changeInputRep = (target) => {
    // En caso que el input sea tipo date,
    if(target.type == "date"){
        let anio = target.value.substr(0, 4);
        let mes = target.value.substr(5, 2)-1;
        let dia = target.value.substr(8, 2);
        return { 
            type: AppTypes.CHANGE_INPUT_REP,
            payload: { 
                input: target.id, 
                data: new Date(anio, mes, dia).getTime()+10800001 
                // Se agrega este número para que de bien la fecha.
            }
        } 
    }else{
        return { 
            type: AppTypes.CHANGE_INPUT_REP,
            payload: { input: target.id, data: target.value }
        }
    }  
};

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
        guardarReparacionPersistencia(reparacion)
        .then( reparacion => {
            console.log("llega al then del guardarReparacionPesistencia");
            return resolve(reparacion); 
        })
        .catch(error  => {
            console.log("llega al catch del guardarReparacionPersistencia");
            reject(error);
        })
        .finally(dispatch(isFetchingCoplete()));
    });   
}

export const eliminarReparacion = (reparacion) => async (dispatch) => {
    return new Promise(async (resolve, reject) => {
        dispatch( isFetchingStart());
        await eliminarReparacionPersistencia(reparacion)
        .then( (reparacion) => {
            console.log("llega al then del eliminarReparacionPesistencia");
            return resolve(reparacion); 
        })
        .catch(error  => {
            console.log("llega al catch del eliminarReparacionPersistencia");
            reject(error);
        })
        .finally(dispatch(isFetchingCoplete()));
    });   
}

export const rememberMe = () => {
    localStorage.setItem('memoria', JSON.stringify( estado.display1 ));
    const memoria = JSON.parse(localStorage.getItem('memoria')) || [];
}