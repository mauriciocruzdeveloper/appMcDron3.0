import { AppTypes } from "./App.types";

const INITIAL_STATE = {
    isLoggedIn: false,
    isFetching: false,
    modal: {
        showModal: false,
        mensajeModal: '',
        tituloModal: '',
        tipoModal: ''
    },
    confirm: {
        showConfirm: false,
        mensajeConfirm: '',
        tituloConfirm: '',
        tipoConfirm: '',
        callBakcConfirm: null
    },
    usuario:{
        nombre: '',
        apellido: '',
        email: '',
        nick: '',
        urlFoto: '',
        password: '',
        admin: false
        //token: ''
    },
    // reparacion:{
    //     drone: '',
    //     nroSerieDrone: '',
    //     descripcionTec: '',
    //     descripcionUsu: '',
    //     presupuestoMO: '',
    //     presupuestoRepuestos: '',
    //     presupuestoFinal: '',
    //     presupuestoDiagnostico: '',
    //     estado: '',
    //     fechaConsulta: '',
    //     fechaRecepcion: '',
    //     fechaEntrega: '',
    //     fechaFinalizacion: '',
    //     prioridad: '',
    //     repuestos: '',
    //     entrega: '',
    //     seguimientoEntrega: '',
    //     drive: '',
    //     informe: ''
    // },
    coleccionReparaciones: []
}

// Reducer para el App
export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case AppTypes.GET_REPARACIONES:
            return { 
                ...state, 
                coleccionReparaciones: action.payload.data
            };

        case AppTypes.GET_REPARACION:
            return { 
                ...state, 
                reparacion: {
                    id: action.payload.id,
                    data: action.payload.data
                }
            };

        case AppTypes.SET_ESTADO:
            return { 
                ...state, 
                reparacion: {
                    ...state.reparacion,
                    data: {
                        ...state.reparacion.data,
                        EstadoRep: action.payload.data.nombre,
                        PrioridadRep: action.payload.data.prioridad
                    }
                }
            };

        case AppTypes.CHANGE_INPUT_REP:
            return { 
                ...state, 
                reparacion: {
                    ...state.reparacion,
                    data: {
                        ...state.reparacion.data,
                        [action.payload.input]: action.payload.data
                    }
                    
                }
             };

        case AppTypes.CHANGE_INPUT_PRESU:
            return { 
                ...state, 
                presupuesto: {
                    ...state.presupuesto,
                    data: {
                        ...state.presupuesto.data,
                        [action.payload.input]: action.payload.data
                    }
                    
                }
            };

        case AppTypes.ISFETCHING_START:
            return { ...state, isFetching: true };

        case AppTypes.ISFETCHING_COMPLETE:
            return { ...state, isFetching: false };

        case AppTypes.LOGIN:
            return {
                ...state,
                isFetching: false,
                isLoggedIn: action.payload.data.isLoggedIn,
                usuario: {
                    ...state.usuario,
                    nombre: action.payload.data.usuario?.nombre,
                    apellido: action.payload.data.usuario?.apellido,
                    admin: action.payload.data.usuario?.admin,
                    email: action.payload.data.usuario?.email,
                    nick: action.payload.data.usuario?.nick,
                    password: action.payload.data.usuario?.password,
                    urlFoto: action.payload.data.usuario?.urlFoto
                    //token: action.payload.data.usuario.token
                }
            }
        case AppTypes.LOGOUT:
            return {
                ...state, 
                isLoggedIn: action.payload.data.isLoggedIn
            }
        case AppTypes.CHANGE_PASSWORD_LOGIN:
            return { 
                ...state, 
                usuario: {
                    ...state.usuario,
                    password: action.payload.data
                }
            };
        case AppTypes.CHANGE_EMAIL_LOGIN:
            return { 
                ...state, 
                usuario: {
                    ...state.usuario,
                    email: action.payload.data
                }
            };
        case AppTypes.MODAL:
            console.log("llega al reducer Modal " + action.payload.data.modal.showModal);
            return { 
                ...state,
                modal: action.payload.data.modal
            };
        case AppTypes.CONFIRM:
            console.log("llega al reducer Confirm " + action.payload.data.confirm.callBackConfirm);
            return { 
                ...state,
                confirm: action.payload.data.confirm
            };
        default:
            return state;
    }
}

