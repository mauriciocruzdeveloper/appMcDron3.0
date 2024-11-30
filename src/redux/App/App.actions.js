// En este archivo están las definiciones de acciones para el reducer y también funciones
// que pueden no disparar una acción. Acá están todas las funciones que se llaman desde
// los componentes.
// Habría que separar la lógica de las acciones... No se cómo. Puede ser con in middleware.
// Otra opción podría se usar componentes "Contenedores", donde esté la lógica, y aquí también
// se disparen las acciones, y luego los componentes "Presentación" que se sirvan de los estados del store.

import { AppTypes } from "./App.types";
import { 
    loginPersistencia,
    registroPersistencia,
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
    getMessagesPersistencia,
    sendMessagePersistencia
} from "../../persistencia/persistenciaFirebase";
// } from "../../persistencia/persistenciaJava";
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

export const setUsuariosToRedux = (usuarios) => ({ 
    type: AppTypes.GET_USUARIOS, 
    payload: { data: usuarios }
});

export const setMessagesToRedux = (messages) => ({ 
    type: AppTypes.GET_MESSAGES, 
    payload: { data: messages }
});

// export const setCliente = (cliente) => ({
//     type: AppTypes.GET_CLIENTE,
//     payload: cliente
// });

export const setUsuario = (usuario) => ({
    type: AppTypes.SET_USUARIO,
    payload: usuario
});

export const setReparacionesToRedux = (reparaciones) => ({ 
    type: AppTypes.SET_REPARACIONES, 
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

/////////////////////////////////////////////////
// FUNCIONES PARA CONECTARSE A LA PERSISTENCIA //
/////////////////////////////////////////////////

// LOGIN
export const login = (login) => (dispatch) => {
    console.log("login()");
    const { email, password } = login;
    return new Promise((resolve, reject) => {
        if(email != "" && password != ""){
            dispatch(isFetchingStart());
            loginPersistencia(email, password)
            .then(usuario => {
                dispatch(loginAction(usuario));
                resolve(usuario); 
            })
            .catch(error => {
                dispatch(abreModal("Error ", "Código - " + error.code, "danger"));
                reject();
            })
            .finally(() => dispatch(isFetchingCoplete()));
        }else{
            // dispatch(isFetchingCoplete());
            dispatch(abreModal("Error", "Email o password vacios", "danger"));
            reject();
        }
    });
};

// REGISTRO
export const registro = (registro) => (dispatch) => {
    console.log("registro()");
    const { email, password, password2, NombreUsu } = registro;

    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        if(
            email != "" 
            && password != "" 
            && password2 != ""
            && NombreUsu != ""
        ){ 
            if(password == password2){
                registroPersistencia(registro)
                .then(() => {
                    dispatch(abreModal("Usuario Registrado", "Verifique su casilla de email para completar el registro", "warning"));
                    resolve();
                })
                .catch(error => {
                    dispatch(abreModal("Error", "Error en registro(), en registroPersistencia() - " + error, "danger"));
                    reject();
                })
                .finally(() => dispatch(isFetchingCoplete()));
            }else{
                dispatch(isFetchingCoplete());
                dispatch(abreModal("Error", "Los password deben ser iguales", "danger"));
                reject();
            }
        }else{
            dispatch(isFetchingCoplete());
            dispatch(abreModal("Error", "Completar todos los campos obligatorios (*)", "danger"));
            reject();
        }
    });
};

// GET Cliente/Usuario por id
export const getCliente = (id) => (dispatch) => {
    console.log("getCliente()");
    dispatch(isFetchingStart());
    return new Promise(async (resolve, reject) => {
        getClientePersistencia(id)
        .then(cliente => resolve(cliente))
        .catch(() => reject({ code: "Error al obtener cliente en getCliente()" }))
        .finally(() => dispatch(isFetchingCoplete()));
    });
};

// GET Reparación por id
export const getReparacion = (id) => (dispatch) => {
    console.log("getReparacion()");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        getReparacionPersistencia(id)
        .then(reparacion =>resolve(reparacion))
        .catch(() => reject({ code: "Error en getReparacion() al buscar una Reparacion"}))
        .finally(() => dispatch(isFetchingCoplete()));
    });
};

// GUARDA Presupuesto
export const guardarPresupuesto = (presupuesto) => (dispatch) => {
    console.log("guardarPersupuesto()");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        guardarPresupuestoPersistencia(presupuesto)
        .then(() => {
            dispatch(abreModal("Presupuesto enviado!", "", "success" ));
            resolve(presupuesto);
        })
        .catch(error => {
            reject(abreModal("Error al guardar ", "Código - " + error, "danger" ));
            reject(error);
        })
        .finally(() => dispatch(isFetchingCoplete()));
    });
}

// GUARDA Reparación
export const guardarReparacion = (reparacion) => (dispatch) => {
    console.log("guardarReparacion()");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        guardarReparacionPersistencia(reparacion)
        .then(reparacion => {
            dispatch(abreModal("Guardado con éxito", "Reparación: " + reparacion.id, "success" ));
            resolve(reparacion);
        })
        .catch(error => {
            dispatch(abreModal("Error al guardar ", "Código - " + error, "danger" ));
            reject(error);
        })
        .finally(() => dispatch(isFetchingCoplete()));
    });
}

// GUARDA Usuario
export const guardarUsuario = (usuario) => (dispatch) => {
    console.log("guardarUsuario()");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        guardarUsuarioPersistencia(usuario)
        .then(usuario => {
            dispatch(abreModal("Guardado con éxito", "Usuario: " + usuario.id, "success" ));
            resolve(usuario);
        })
        .catch(error => {
            dispatch(abreModal("Error al guardar ", "Código - " + error, "danger" ));
            reject(error);
        })
        .finally(() => dispatch(isFetchingCoplete()));
    }); 
}

// GUARDA Mensaje
export const sendMessage = (message) => (dispatch) => {
    console.log("sendMessage()");
    return new Promise((resolve, reject) => {
        sendMessagePersistencia(message)
        .then(message => resolve(message))
        .catch(error => {
            dispatch(abreModal("Mensaje no enviado", "Código - " + error, "danger" ));
            reject(error);
        })
    }); 
}

// DELETE Reparación
export const eliminarReparacion = (id) => (dispatch) => {
    console.log("eliminarReparacion()");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        eliminarReparacionPersistencia(id)
        .then(id => {
            dispatch(abreModal("Reparación eliminada con éxito", "Reparación: " + id, "success" ));
            resolve(id);
        })
        .catch(error => {
            dispatch(abreModal("Error al eliminar ", "Error en eliminarReparación() - Código - " + error.code, "danger" ));
            reject(error);
        })
        .finally(() => dispatch(isFetchingCoplete()));
    }); 
}

// DELETE Usuario
export const eliminarUsuario = (id) => (dispatch) => {
    console.log("eliminarUsuarios()");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        eliminarUsuarioPersistencia(id)
        .then(id => {
            dispatch(abreModal("Usuario eliminado con éxito", "Usuario: " + id, "success" ));
            resolve(id);
        })
        .catch(error => {
            dispatch(abreModal("Error al eliminar ", "Error en eliminarUsuario() - Código - " + error.code, "danger" ));
            reject(error);
        })
        .finally(() => dispatch(isFetchingCoplete()));
    }); 
}

// GET de todos los Usuarios
export const getUsuarios = () => (dispatch) => {
    console.log("getUsuarios()");
    dispatch(isFetchingStart());
    // Se pasa como argumento una función callback para que se ejecute el dispatch
    // cada vez que se actualiza la DB
    return new Promise((resolve, reject) => {
        getUsuariosPersistencia(usuarios => dispatch(setUsuariosToRedux(usuarios)))
        .then(() => resolve())
        .catch(() => {
            dispatch(abreModal("Error", "getUsuario() en getUsuariosPersistencia()", "danger"));
            reject()
        })
        .finally(() => dispatch(isFetchingCoplete()));
    });
}

// GET de todas las Reparaciones
// EstadoRep en el futuro puede reemplazarse por un Array con los estados por los cuales quiero filtrar
export const getReparaciones = (usuario) => (dispatch) => {
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        getReparacionesPersistencia(reparaciones => dispatch(setReparacionesToRedux(reparaciones)), usuario)
        .then(() => resolve())
        // .catch(() => {
        //     dispatch(abreModal("Error", "Error en getReparaciones() al buscar las Reparaciones", "danger"));
        //     reject();
        // })
        .finally(() => dispatch(isFetchingCoplete()));
    });
}

// GET de todos los Mensajes
export const getMessages = (emailUsu, emailCli) => (dispatch) => {
    console.log("getMessages()");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        getMessagesPersistencia(emailUsu, emailCli, mensajes => dispatch(setMessagesToRedux(mensajes)))
        // podría ubicar unsubscribeMessages en el store así puedo accederla desde cualquier lado
        .then((unsubscribeMessages) => resolve(unsubscribeMessages)) 
        // .catch(() => {
        //     dispatch(abreModal("Error", "getMessages() en getMensajesPersistencia()", "danger"));
        //     reject()
        // })
        .finally(() => dispatch(isFetchingCoplete()));
    });
}

////////////////////////////////////////////////////
// FUNCIONES PARA PARA POSIBLES REFACTORIZACIONES //
////////////////////////////////////////////////////

export const getProvinciasSelect = () => (dispatch) => {
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

// Esta función no tiene mucho sentido. Habría que verlo bien.
export const getUsuariosSelect = () => (dispatch) => {
    console.log("getUsuariosSelect");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        getUsuariosPersistencia(
            // Esta es la función callback que actualiza usuariosSelect
            usuarios => {
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
            }
        )
        .catch(error  => reject(error))
        .finally(() => dispatch(isFetchingCoplete()));
    });
}

export const getLocalidadesPorProvincia = (provincia) => (dispatch) => {
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

// export const rememberMe = () => {
//     localStorage.setItem('memoria', JSON.stringify( estado.display1 ));
//     const memoria = JSON.parse(localStorage.getItem('memoria')) || [];
// }