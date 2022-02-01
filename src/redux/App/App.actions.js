import { AppTypes } from "./App.types";
import { 
    loginPersistencia, 
    getReparacionesPersistencia,
    getReparacionPersistencia,
    getClientePersistencia,
    guardarReparacionPersistencia,
    guardarUsuarioPersistencia,
    eliminarReparacionPersistencia,
    getProvinciasSelectPersistencia,
    getLocPorProvPersistencia,
    getUsuariosPersistencia
} from "../../persistencia/persistenciaFirebase";
// import { async } from "@firebase/util";

export const isFetchingStart = () => {
    console.log("llega a isfetching"); return { type: AppTypes.ISFETCHING_START }
};
export const isFetchingCoplete = () => (
    { type: AppTypes.ISFETCHING_COMPLETE }
);

export const login = (email, password) => async (dispatch) => {
    dispatch( isFetchingStart());
    return new Promise(async (resolve, reject) => {
        if(email!="" && password!=""){
            await loginPersistencia(email, password)
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
            });
            dispatch(isFetchingCoplete());
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

export const setEstado = (estado) => ({ 
    type: AppTypes.SET_ESTADO,
    payload: { data: estado }
});

export const getReparaciones = () => async (dispatch) => {
    dispatch( isFetchingStart());
    return new Promise(async (resolve, reject) => {
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
        });
        dispatch(isFetchingCoplete());
    });
};

export const getUsuarios = () => async (dispatch) => {
    dispatch( isFetchingStart());
    return new Promise(async (resolve, reject) => {
        await getUsuariosPersistencia()
        .then( usuarios => {
            console.log("llega al then del getUsuariosPersistencia");
            dispatch({ 
                type: AppTypes.GET_USUARIOS, 
                payload: { 
                    data: usuarios
                }
            });
            // No hace falta devolver el usuario, pero lo hago por si sirve en otra ocación.
            return resolve(usuarios); 
        })
        .catch(error  => {
            console.log("llega al catch del getUsuariosPersistencia");
            reject(error);
        });
        dispatch(isFetchingCoplete());
    });
};

export const getReparacion = (id) => async (dispatch) => {
    dispatch( isFetchingStart());
    return new Promise(async (resolve, reject) => {
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
        });
        dispatch(isFetchingCoplete());
    });
};

export const getCliente = (id) => async (dispatch) => {
    console.log("id cliente action: " + id);
    dispatch( isFetchingStart());
    return new Promise(async (resolve, reject) => {
        await getClientePersistencia(id)
        .then( cliente => {
            console.log("llega al then del getClientePersistencia");
            dispatch({ 
                type: AppTypes.GET_CLIENTE, 
                payload: {
                    id: id,
                    data: cliente.data
                }
            });
            // No hace falta devolver el usuario, pero lo hago por si sirve en otra ocación.
            return resolve(cliente); 
        })
        .catch(error  => {
            console.log("llega al catch del getClientePersistencia");
            reject(error);
        });
        dispatch(isFetchingCoplete());
    });
};

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
        .catch(error  => {
            console.log("llega al catch del guardarReparacionPersistencia");
            reject(error);
        });
        dispatch(isFetchingCoplete());
    });   
}

export const eliminarReparacion = (reparacion) => async (dispatch) => {
    dispatch(isFetchingStart());
    return new Promise(async (resolve, reject) => {
        await eliminarReparacionPersistencia(reparacion)
        .then( (reparacion) => {
            console.log("llega al then del eliminarReparacionPesistencia");
            return resolve(reparacion); 
        })
        .catch(error  => {
            console.log("llega al catch del eliminarReparacionPersistencia");
            reject(error);
        })
        dispatch(isFetchingCoplete());
    });   
}

export const eliminarUsuario = (usuario) => async (dispatch) => {
    dispatch(isFetchingStart());
    return new Promise(async (resolve, reject) => {
        await eliminarUsuarioPersistencia(usuario)
        .then((usuario) => {
            return resolve(usuario); 
        })
        .catch(error  => {
            reject(error);
        })
        dispatch(isFetchingCoplete());
    });   
}

export const rememberMe = () => {
    localStorage.setItem('memoria', JSON.stringify( estado.display1 ));
    const memoria = JSON.parse(localStorage.getItem('memoria')) || [];
}

export const confirm = (mensaje, titulo, tipo, callBack) => {
    console.log("llega a actions. callBack: " + callBack);
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

export const loadUsuToPresu = (usuario) => {
    return({
        type: AppTypes.LOAD_USU_TO_PRESU,
        payload: {
            data: {
                usuario
            }
        }
    })
};

export const guardarPresupuesto = (presupuesto) => async (dispatch) => {

    dispatch(isFetchingStart());

    let usuario = {};
    usuario.data = {};
    usuario.id = presupuesto.UsuarioPresu || '';
    usuario.data.NombreUsu = presupuesto.NombrePresu || '';
    usuario.data.ApellidoUsu = presupuesto.ApellidoPresu || '';
    usuario.data.TelefonoUsu = presupuesto.TelefonoPresu || '';
    usuario.data.ProvinciaUsu = presupuesto.ProvinciaPresu || '';
    usuario.data.CiudadUsu = presupuesto.CiudadPresu || '';
    let reparacion = {};
    reparacion.data = {};
    reparacion.data.UsuarioRep = presupuesto.UsuarioPresu || '';
    reparacion.data.DroneRep = presupuesto.DronePresu || '';
    reparacion.data.DescripcionUsuRep = presupuesto.DescripcionPresu || '';
    reparacion.data.EstadoRep = "Consulta";
    reparacion.data.PrioridadRep = "1";
    reparacion.data.ApellidoUsu = presupuesto.ApellidoPresu,
    reparacion.data.NombreUsu = presupuesto.NombrePresu,
    reparacion.data.TelefonoUsu = presupuesto.TelefonoPresu
    reparacion.data.FeConRep = Date.now();
    reparacion.id = Date.now().toString();

    return new Promise(async (resolve, reject) => {
        await guardarReparacionPersistencia(reparacion)
        .then(() => {
            guardarUsuarioPersistencia(usuario)
            .then(resolve())
            .catch(error  => reject(error))
        })
        .catch(error  => reject(error));
        dispatch(isFetchingCoplete());
    });
}

export const getProvinciasSelect = () => async (dispatch) => {
    console.log("getProvinciasSelect");
    dispatch(isFetchingStart());
    return new Promise(async (resolve, reject) => {
        await getProvinciasSelectPersistencia()
        .then(provincias => {
            dispatch({
                type: AppTypes.GET_PROVINCIAS,
                payload: {
                    data: 
                        provincias
                    
                }
            });
            resolve(provincias);
        })
        .catch(error  => reject(error));
        dispatch(isFetchingCoplete());
    });
}

export const getLocalidadesPorProvincia = (provincia) => async (dispatch) => {
    console.log("getLocalidadesPorProvincia");
    dispatch(isFetchingStart());
    return new Promise(async (resolve, reject) => {
        await getLocPorProvPersistencia(provincia)
        .then(localidades => {
            dispatch({
                type: AppTypes.GET_LOCALIDADES,
                payload: {
                    data: {
                        localidades: localidades,
                        provincia: provincia
                    }
                }
            });
            resolve(localidades);
        })
        .catch(error  => reject(error));
        dispatch(isFetchingCoplete());
    });
    // localidadesSelect = localidades.filter(localidad => (
        //     localidad.provincia.nombre == e.value
        // ))
        // .map(localidad => {
        //     return {
        //         value: localidad.nombre,
        //         label: localidad.nombre
        //     }
        // });
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