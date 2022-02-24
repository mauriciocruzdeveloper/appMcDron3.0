// En este archivo están las definiciones de acciones para el reducer y también funciones
// que pueden no disparar una acción. Acá están todas las funciones que se llaman desde
// los componentes.
// Habría que separar la lógica de las acciones... No se cómo. Puede ser con in middleware.
// Otra opción podría se usar componentes "Contenedores", donde esté la lógica, y aquí también
// se disparen las acciones, y luego los componentes "Presentación" que se sirvan de los estados del store.

import { AppTypes } from "./App.types";
import { 
    loginPersistencia, 
    getReparacionesPersistencia,
    getReparacionPersistencia,
    getClientePersistencia,
    guardarReparacionPersistencia,
    guardarUsuarioPersistencia,
    guardarPresupuestoPersistencia,
    eliminarReparacionPersistencia,
    eliminarUsuarioPersistencia,
    getProvinciasSelectPersistencia,
    getLocPorProvPersistencia,
    getUsuariosPersistencia,
    getClientePorEmailPersistencia,
} from "../../persistencia/persistenciaFirebase";
// } from "../../persistencia/persistenciaNode";


//////////////////////////////////////////////////////////////////////////
//////// ACTIONS /////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

// Action que setea ifFetching en true
export const isFetchingStart = () => ({ type: AppTypes.ISFETCHING_START });

// Action que setea ifFetching en false
export const isFetchingCoplete = () => ({ type: AppTypes.ISFETCHING_COMPLETE });

// Action Login. 
export const loginAction = (usuario) => ({ 
    type: AppTypes.LOGIN, 
    payload: { data: {
        isLoggedIn: true,
        usuario: usuario
    }}
});

export const logout = () => ({
    type: AppTypes.LOGOUT,
    payload: { data: { isLoggedIn: false } }
});

export const cierraModal = () => ({
    type: AppTypes.MODAL,
    payload: { data: { modal: { showModal: false }}}
});

export const cierraConfirm = () => ({
    type: AppTypes.CONFIRM,
    payload: { data: { confirm: { showConfirm: false}} }
});

// export const setLocalidadPresu = (localidad) => ({
//     type: AppTypes.SET_LOCALIDAD_PRESU,
//     payload: { data: localidad }
// })

// export const setProvinciaPresu = (provincia) => ({
//     type: AppTypes.SET_PROVINCIA_PRESU,
//     payload: { data: provincia }
// })

// export const setLocalidadCliente = (localidad) => ({
//     type: AppTypes.SET_LOCALIDAD_CLIENTE,
//     payload: { data: localidad }
// })

// export const setProvinciaCliente = (provincia) => ({
//     type: AppTypes.SET_PROVINCIA_CLIENTE,
//     payload: { data: provincia }
// })

// export const clearForm = () => ({
//     type: AppTypes.CLEAR_FORM,
//     payload: {}
// })

export const setUsuariosToRedux = (usuarios) => ({ 
    type: AppTypes.GET_USUARIOS, 
    payload: { data: usuarios }
});

export const setCliente = (cliente) => ({
    type: AppTypes.GET_CLIENTE,
    payload: cliente
});

export const setReparacion = (reparacion) => ({
    type: AppTypes.GET_REPARACION,
    payload: reparacion
});

// export const setEstado = (estado) => ({ 
//     type: AppTypes.SET_ESTADO,
//     payload: { data: estado }
// });

export const setReparacionesToRedux = (reparaciones) => ({ 
    type: AppTypes.GET_REPARACIONES, 
    payload: { data: reparaciones }
});

export const abreModal = (titulo, mensaje, tipo) => ({
    type: AppTypes.MODAL,
    payload: { data: { modal: {
                showModal: true,
                mensajeModal: mensaje,
                tituloModal: titulo,
                tipoModal: tipo
    }}}
});

export const confirm = (mensaje, titulo, tipo, callBack) => {
    return({
        type: AppTypes.CONFIRM,
        payload: { data: { confirm: {
                    showConfirm: true,
                    mensajeConfirm: mensaje,
                    tituloConfirm: titulo,
                    tipoConfirm: tipo,
                    callBackConfirm: callBack
        }}}
    })
};

// export const changeInputRep = (target) => {
//     // En caso que el input sea tipo date, sino es el value tal cual del target
//     let data = 0;
//     if(target.type == "date"){
//         let anio = target.value.substr(0, 4);
//         let mes = target.value.substr(5, 2)-1;
//         let dia = target.value.substr(8, 2);
//         data = new Date(anio, mes, dia).getTime()+10800001; // Se agrega este número para que de bien la fecha.
//     }else{
//         data = target.value;
//     };
//     return({ 
//         type: AppTypes.CHANGE_INPUT_REP,
//         payload: { input: target.id, data: data }
//     })
// };

// export const changeInputUsu = (target) => {
//     // En caso que el input sea tipo date, sino es el value tal cual del target
//     let data = 0;
//     if(target.type == "date"){
//         let anio = target.value.substr(0, 4);
//         let mes = target.value.substr(5, 2)-1;
//         let dia = target.value.substr(8, 2);
//         data = new Date(anio, mes, dia).getTime()+10800001; // Se agrega este número para que de bien la fecha.
//     }else{
//         data = target.value;
//     };
//     return({ 
//         type: AppTypes.CHANGE_INPUT_USU,
//         payload: { input: target.id, data: data }
//     })
// };

// export const changeInputPresu = (target) => {
//     // En caso que el input sea tipo date, sino es el value tal cual del target
//     let data = 0;
//     if(target.type == "date"){
//         let anio = target.value.substr(0, 4);
//         let mes = target.value.substr(5, 2)-1;
//         let dia = target.value.substr(8, 2);
//         data = new Date(anio, mes, dia).getTime()+10800001; // Se agrega este número para que de bien la fecha.
//     }else{
//         data = target.value;
//     };
//     return({ 
//         type: AppTypes.CHANGE_INPUT_PRESU,
//         payload: { input: target.id, data: data }
//     }) 
// };


/////////////////////////////////////////////////
// FUNCIONES PARA CONECTARSE A LA PERSISTENCIA //
/////////////////////////////////////////////////

// LOGIN
export const login = (login) => async (dispatch) => {
    const { email, password } = login;
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        if(email != "" && password != ""){
            loginPersistencia(email, password)
            .then( usuario => {
                dispatch(loginAction(usuario));
                resolve(usuario); 
            })
            .catch(() => reject({ code: "Login incorrecto en login()" }))
            .finally(() => dispatch(isFetchingCoplete()));
        }else{
            dispatch(isFetchingCoplete());
            reject({ code: "Email o password vacios" });
        };
    });
};

// GET Cliente/Usuario por id
export const getCliente = (id) => async (dispatch) => {
    console.log("getCliente()");
    dispatch( isFetchingStart());
    return new Promise(async (resolve, reject) => {
        getClientePersistencia(id)
        .then(cliente => {
            dispatch(setCliente(cliente));
            // No hace falta devolver el usuario, pero lo hago por si sirve en otra ocación.
            resolve(cliente); 
        })
        .catch(() => reject({ code: "Error al obtener cliente en getCliente()" }))
        .finally(() => dispatch(isFetchingCoplete()));
    });
};

// GET Reparación por id
export const getReparacion = (id) => async (dispatch) => {
    console.log("getReparacion()");
    dispatch( isFetchingStart());
    return new Promise((resolve, reject) => {
        getReparacionPersistencia(id)
        .then(reparacion => {
            dispatch(setReparacion(reparacion));
            // No hace falta devolver la reparación, pero lo hago por si sirve en otra ocación.
            resolve(reparacion); 
        })
        .catch(() => reject({ code: "Error en getReparacion() al buscar una Reparacion"}))
        .finally(() => dispatch(isFetchingCoplete()));
    });
};

// GUARDA Presupuesto
export const guardarPresupuesto = (presupuesto) => async (dispatch) => {
    console.log("guardarPersupuesto()");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        guardarPresupuestoPersistencia(presupuesto)
        .then(presupuesto => resolve(presupuesto))
        .catch(()  => reject({ code: "Error en guardarPresupuesto() al guardar Presupuesto"}))
        .finally(() => dispatch(isFetchingCoplete()));
    });
}

// GUARDA Reparación
export const guardarReparacion = (reparacion) => async (dispatch) => {
    console.log("guardarReparacion()");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        guardarReparacionPersistencia(reparacion)
        .then(reparacion => resolve(reparacion))
        .catch(()  => reject({ code: "Error en guardarReparacion() al guardar Reparación"}))
        .finally(() => dispatch(isFetchingCoplete()));
    });   
}

// GUARDA Usuario
export const guardarUsuario = (usuario) => async (dispatch) => {
    console.log("guardarUsuario()");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        guardarUsuarioPersistencia(usuario)
        .then(usuario => resolve(usuario))
        .catch(() => reject({ code: "Error en guardarUsuario() al guardar Usuario"}))
        .finally(() => dispatch(isFetchingCoplete()));
    });   
}

// DELETE Reparación
export const eliminarReparacion = (id) => async (dispatch) => {
    console.log("eliminarReparacion()");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        eliminarReparacionPersistencia(id)
        .then(id => resolve(id))
        .catch(()  => reject({ code: "Error en eliminarReparacion() al eliminar Reparación"}))
        .finally(() => dispatch(isFetchingCoplete()));
    });   
}

// DELETE Usuario
export const eliminarUsuario = (id) => async (dispatch) => {
    console.log("eliminarUsuarios()");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        eliminarUsuarioPersistencia(id)
        .then(id => resolve(id))
        .catch(() => reject({ code: "Error en eliminarUsuario() al eliminar Usuario"}))
        .finally(() => dispatch(isFetchingCoplete()));
    });   
}

// GET de todos los Usuarios
export const getUsuarios = () => async (dispatch) => {
    console.log("getUsuarios()");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        // Se pasa como argumento una función callback para que se ejecute el dispatch
        // cada vez que se actualiza la DB
        getUsuariosPersistencia(usuarios => dispatch(setUsuariosToRedux(usuarios)))
        .then(usuarios => resolve(usuarios))
        .catch(() => reject({ code: "Error en getUsuarios() al buscar los Usuarios"}))
        .finally(() => dispatch(isFetchingCoplete()));
    });
}

// GET de todas las Reparaciones
export const getReparaciones = () => async (dispatch) => {
    console.log("getReparaciones()");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        getReparacionesPersistencia(reparaciones => dispatch(setReparacionesToRedux(reparaciones)))
        .then(reparaciones => resolve(reparaciones))
        .catch(() => reject({ code: "Error en getReparaciones() al buscar las Reparaciones"}))
        .finally(() => dispatch(isFetchingCoplete()));
    });
}


////////////////////////////////////////////////////
// FUNCIONES PARA PARA POSIBLES REFACTORIZACIONES //
////////////////////////////////////////////////////



export const getProvinciasSelect = () => async (dispatch) => {
    console.log("getProvinciasSelect");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        getProvinciasSelectPersistencia()
        .then(provinciasSelect => {
            dispatch({
                type: AppTypes.GET_PROVINCIAS_SELECT,
                payload: { data: provinciasSelect }
            });
            resolve(provinciasSelect);
        })
        .catch(error  => reject(error))
        .finally(() => dispatch(isFetchingCoplete()));
    });
}

export const getUsuariosSelect = () => async (dispatch) => {
    console.log("getUsuariosSelect");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        getUsuariosPersistencia(usuarios => dispatch(setUsuariosToRedux(usuarios)))
        .then(usuarios => {
            const usuariosSelect = usuarios.map(usuario => {
                let dato = usuario.data.EmailUsu ? usuario.data.EmailUsu : usuario.id;
                return { value: dato, label: dato }
            });
            dispatch({
                type: AppTypes.GET_USUARIOS_SELECT,
                payload: {
                    data: usuariosSelect
                }
            });
            resolve(usuariosSelect);
        })
        .catch(error  => reject(error))
        .finally(() => dispatch(isFetchingCoplete()));
    });
}

export const getLocalidadesPorProvincia = (provincia) => async (dispatch) => {
    console.log("getLocalidadesPorProvincia");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        getLocPorProvPersistencia(provincia)
        .then(localidadesSelect => {
            dispatch({
                type: AppTypes.GET_LOCALIDADES_SELECT,
                payload: {
                    data: {
                        localidadesSelect: localidadesSelect,
                        provincia: provincia
                    }
                }
            });
            resolve(localidadesSelect);
        })
        .catch(error  => reject(error))
        .finally(() => dispatch(isFetchingCoplete()));
    });
}

export const rememberMe = () => {
    localStorage.setItem('memoria', JSON.stringify( estado.display1 ));
    const memoria = JSON.parse(localStorage.getItem('memoria')) || [];
}

// export const emailOnChangeLogin = ( data ) => ({ 
//     type: AppTypes.CHANGE_EMAIL_LOGIN,
//     payload: { data }
// });

// export const passwordOnChangeLogin = ( data ) => ({ 
//     type: AppTypes.CHANGE_PASSWORD_LOGIN,
//     payload: { data }
// });

// export const changeEmailUsuPresu = (inputEmailUsuPresu) => (
//     {
//         type: AppTypes.CHANGE_INPUT_PRESU,
//         payload: { input: target.id, data: target.value }
//     }
// )