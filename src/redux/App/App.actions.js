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
    eliminarReparacionPersistencia,
    eliminarUsuarioPersistencia,
    getProvinciasSelectPersistencia,
    getLocPorProvPersistencia,
    getUsuariosPersistencia,
    getClientePorEmailPersistencia,
    escuchaUsuariosPersistencia,
    escuchaReparacionesPersistencia
} from "../../persistencia/persistenciaFirebase";
// } from "../../persistencia/persistenciaNode";

// import { async } from "@firebase/util";

export const isFetchingStart = () => {
    console.log("llega a isfetching"); return { type: AppTypes.ISFETCHING_START }
};
export const isFetchingCoplete = () => (
    { type: AppTypes.ISFETCHING_COMPLETE }
);

export const login = (email, password) => async (dispatch) => {
    dispatch(isFetchingStart());
    return new Promise(async (resolve, reject) => {
        if(email != "" && password != ""){
            loginPersistencia(email, password)
            .then( usuario => {
                console.log("llega al then del loginPersistencia: " + JSON.stringify(usuario));
                dispatch({ 
                    type: AppTypes.LOGIN, 
                    payload: { 
                        data: {
                            isLoggedIn: true,
                            usuario: usuario
                        }
                    }
                });
                // No hace falta devolver el usuario, pero lo hago por si sirve en otra ocación.
                return resolve(usuario); 
            })
            .catch(error => {
                console.log("llega al catch del loginPersistencia");
                console.log("error.code: " + error.code);
                reject(error);
            })
            .finally(() => dispatch(isFetchingCoplete()));
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
    console.log('llega a cierra modal');
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

export const cierraConfirm = () => {
    console.log('llega a cierra confirm');
    return {
        type: AppTypes.CONFIRM,
        payload: { 
            data: {
                confirm: {
                    showConfirm: false
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

export const changeInputUsu = (target) => {
    // En caso que el input sea tipo date,
    if(target.type == "date"){
        let anio = target.value.substr(0, 4);
        let mes = target.value.substr(5, 2)-1;
        let dia = target.value.substr(8, 2);
        return { 
            type: AppTypes.CHANGE_INPUT_USU,
            payload: { 
                input: target.id, 
                data: new Date(anio, mes, dia).getTime()+10800001 
                // Se agrega este número para que de bien la fecha.
            }
        } 
    }else{
        return { 
            type: AppTypes.CHANGE_INPUT_USU,
            payload: { input: target.id, data: target.value }
        }
    }  
};

export const changeInputPresu = (target) => {
    // En caso que el input sea tipo date,
    if(target.type == "date"){
        let anio = target.value.substr(0, 4);
        let mes = target.value.substr(5, 2)-1;
        let dia = target.value.substr(8, 2);
        return { 
            type: AppTypes.CHANGE_INPUT_PRESU,
            payload: { 
                input: target.id, 
                data: new Date(anio, mes, dia).getTime()+10800001 
                // Se agrega este número para que de bien la fecha.
            }
        } 
    }else{
        return { 
            type: AppTypes.CHANGE_INPUT_PRESU,
            payload: { input: target.id, data: target.value }
        }
    }  
};

export const changeEmailUsuPresu = (inputEmailUsuPresu) => (
    {
        type: AppTypes.CHANGE_INPUT_PRESU,
        payload: { input: target.id, data: target.value }
    }
)

export const setEstado = (estado) => ({ 
    type: AppTypes.SET_ESTADO,
    payload: { data: estado }
});

export const getReparaciones = () => async (dispatch) => {
    dispatch( isFetchingStart());
    return new Promise(async (resolve, reject) => {
        getReparacionesPersistencia()
        .then( reparaciones => {
            console.log("llega al then del getReparacionesPersistencia");
            dispatch(setReparacionesToRedux());
            return resolve(reparaciones); 
        })
        .catch(error  => {
            console.log("llega al catch del getReparacionesPersistencia");
            reject(error);
        })
        .finally(() => dispatch(isFetchingCoplete()));
    });
};

export const getUsuarios = () => async (dispatch) => {
    console.log("getUsuarios()");
    dispatch(isFetchingStart());
    return new Promise(async (resolve, reject) => {
        getUsuariosPersistencia()
        .then( usuarios => {
            console.log("llega al then del getUsuariosPersistencia");
            dispatch(setUsuariosToRedux());
            // No hace falta devolver el usuario, pero lo hago por si sirve en otra ocación.
            return resolve(usuarios); 
        })
        .catch(error  => {
            console.log("llega al catch del getUsuariosPersistencia");
            reject(error);
        })
        .finally(() => dispatch(isFetchingCoplete()));
    });
};

export const getReparacion = (id) => async (dispatch) => {
    console.log("getReparacion()");
    dispatch( isFetchingStart());
    return new Promise(async (resolve, reject) => {
        await getReparacionPersistencia(id)
        .then( reparacion => {
            dispatch({ 
                type: AppTypes.GET_REPARACION, 
                payload: {
                    id: id,
                    data: reparacion.data
                }
            });
            // No hace falta devolver el usuario, pero lo hago por si sirve en otra ocación.
            resolve(reparacion); 
        })
        .catch(error  => {
            reject(error);
        })
        .finally(() => dispatch(isFetchingCoplete()));
    });
};

export const getCliente = (id) => async (dispatch) => {
    console.log("getCliente()");
    dispatch( isFetchingStart());
    return new Promise(async (resolve, reject) => {
        getClientePersistencia(id)
        .then( cliente => {
            dispatch({ 
                type: AppTypes.GET_CLIENTE, 
                payload: cliente 
            });
            // No hace falta devolver el usuario, pero lo hago por si sirve en otra ocación.
            resolve(cliente); 
        })
        .catch(error  => {
            reject(error);
        })
        .finally(() => dispatch(isFetchingCoplete()));
    });
};

export const rememberMe = () => {
    localStorage.setItem('memoria', JSON.stringify( estado.display1 ));
    const memoria = JSON.parse(localStorage.getItem('memoria')) || [];
}

export const confirm = (mensaje, titulo, tipo, callBack) => {
    return(
        {
            type: AppTypes.CONFIRM,
                payload: { 
                    data: {
                        confirm: {
                            showConfirm: true,
                            mensajeConfirm: mensaje,
                            tituloConfirm: titulo,
                            tipoConfirm: tipo,
                            callBackConfirm: callBack
                        }
                    } 
                }
        }
    )
};

export const setCliente = (cliente) => {
    console.log("cliente SETuSU: " + JSON.stringify(usuario));
    return({
        type: AppTypes.GET_CLIENTE,
        payload: cliente
    })
};

export const setReparacion = (reparacion) => {
    console.log("reparacion SETuSU: " + JSON.stringify(reparacion));
    return({
        type: AppTypes.GET_REPARACION,
        payload: reparacion
    })
};

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
        getUsuariosPersistencia()
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

export const setUsuarioPresu = (emailUsuario) => async (dispatch) => {
    console.log("setUsuarioPresu: " + emailUsuario);
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        console.log("Promise: " + emailUsuario);
        getClientePorEmailPersistencia(emailUsuario)
        .then(usuario => {
            console.log("usuario set: " + JSON.stringify(usuario));
            dispatch({
                type: AppTypes.GET_CLIENTE,
                payload: usuario
            });
            resolve();
        })
        .catch(error  => reject(error))
        .finally(() => dispatch(isFetchingCoplete()));
    });
}

export const setLocalidadPresu = (localidad) => ({
    type: AppTypes.SET_LOCALIDAD_PRESU,
    payload: {data: localidad}
})

export const setProvinciaPresu = (provincia) => ({
    type: AppTypes.SET_PROVINCIA_PRESU,
    payload: {data: provincia}
})

export const setLocalidadCliente = (localidad) => ({
    type: AppTypes.SET_LOCALIDAD_CLIENTE,
    payload: {data: localidad}
})

export const setProvinciaCliente = (provincia) => ({
    type: AppTypes.SET_PROVINCIA_CLIENTE,
    payload: {data: provincia}
})

export const clearForm = () => ({
    type: AppTypes.CLEAR_FORM,
    payload: {}
})



////////////////////////////////////////////////////////////////////////
// ESTAS SON ACTIONS CREATORS QUE SÓLO MODIFICAN EL ISFETCHING,
// PERO PRINCIPALMENTE SE ENCARGAN DE MANEJAR LA PERSISTENCIA

export const guardarPresupuesto = (presupuesto) => async (dispatch) => {
    dispatch(isFetchingStart());

    presupuesto.reparacion.data.EstadoRep = "Consulta";
    presupuesto.reparacion.data.PrioridadRep = "1";
    presupuesto.reparacion.data.FeConRep = Date.now();

    return new Promise((resolve, reject) => {
        guardarUsuarioPersistencia(presupuesto.usuario)
        .then(usuario => {
            presupuesto.reparacion.data.UsuarioRep = presupuesto.usuario.data.EmailUsu;
            guardarReparacionPersistencia(presupuesto.reparacion)
            .then(() => resolve())
            .catch(error  => reject(error));
        })
        .catch(error  => reject(error))
        .finally(() => dispatch(isFetchingCoplete()));
    });
}

export const guardarReparacion = (reparacion) => async (dispatch) => {
    dispatch(isFetchingStart());
    return new Promise(async (resolve, reject) => {
        await guardarReparacionPersistencia(reparacion)
        .then( reparacion => {
            console.log("llega al then del guardarReparacionPesistencia");
            return resolve(reparacion); 
        })
        .catch(error  => {
            console.log("llega al catch del guardarReparacionPersistencia");
            reject(error);
        });
        dispatch(isFetchingCoplete());
    });   
}

export const guardarUsuario = (usuario) => async (dispatch) => {
    dispatch(isFetchingStart());
    return new Promise(async (resolve, reject) => {
        await guardarUsuarioPersistencia(usuario)
        .then(usuario => {
            console.log("llega al then del guardarUsuarioPesistencia");
            return resolve(usuario); 
        })
        // .catch(error  => {
        //     console.log("llega al catch del guardarReparacionPersistencia");
        //     reject(error);
        // });
        dispatch(isFetchingCoplete());
    });   
}

export const eliminarReparacion = (id) => async (dispatch) => {
    dispatch(isFetchingStart());
    return new Promise(async (resolve, reject) => {
        await eliminarReparacionPersistencia(id)
        .then((id) => {
            console.log("llega al then del eliminarReparacionPesistencia");
            return resolve(id); 
        })
        .catch(error  => {
            console.log("llega al catch del eliminarReparacionPersistencia");
            reject(error);
        })
        dispatch(isFetchingCoplete());
    });   
}

export const eliminarUsuario = (id) => async (dispatch) => {
    dispatch(isFetchingStart());
    return new Promise(async (resolve, reject) => {
        await eliminarUsuarioPersistencia(id)
        .then((id) => {
            return resolve(id); 
        })
        .catch(error  => {
            reject(error);
        })
        dispatch(isFetchingCoplete());
    });   
}

// Esta función es para escuchar los cambios en la colección de usuarios,
// y luego mandarlos a dispatch para actualizar el state en el store.
export const escuchaUsuarios = () => async (dispatch) => {
    console.log("escuchaUsuarios()");
    dispatch(isFetchingStart());
    await escuchaUsuariosPersistencia(
        usuarios => dispatch(setUsuariosToRedux(usuarios))
    );
    dispatch(isFetchingCoplete());
}

export const setUsuariosToRedux = (usuarios) => {
    console.log("setUsuriosToRedux(): " + JSON.stringify(usuarios[0]));
    return { 
        type: AppTypes.GET_USUARIOS, 
        payload: { data: usuarios }
    }
};

export const setReparacionesToRedux = (reparaciones) => {
    console.log("setReparacionesToRedux(): " + JSON.stringify(reparaciones[0]));
    return { 
        type: AppTypes.GET_REPARACIONES, 
        payload: { data: reparaciones }
    }
};

export const escuchaReparaciones = () => async (dispatch) => {
    console.log("escuchaReparaciones()");
    dispatch(isFetchingStart());
    await escuchaReparacionesPersistencia(
        reparaciones => dispatch(setReparacionesToRedux(reparaciones))
    );
    dispatch(isFetchingCoplete());
}