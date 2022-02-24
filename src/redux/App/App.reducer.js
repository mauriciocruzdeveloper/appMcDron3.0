import { applyActionCode } from "firebase/auth";
import { AppTypes } from "./App.types";
import { Usuario } from "../../interfases/Usuario";

const INITIAL_STATE = {
    isLoggedIn: false, // Para indicar si hay alguien logueado
    isFetching: false, // Para indicar si está leyendo en la nube
    modal: { // Los parámetros para el modal tipo alert
        showModal: false,
        mensajeModal: '',
        tituloModal: '',
        tipoModal: ''
    },
    confirm: { // Los parámetros para el modal confirm
        showConfirm: false,
        mensajeConfirm: '',
        tituloConfirm: '',
        tipoConfirm: '',
        callBakcConfirm: null
    },
    login: { // Son los datos de usuario y contraseña
        email: '',
        password: '',
        token: ''
    },
    usuario: {}, // Es el usuario logueado
    // Le voy a llamar usuario al usuario logueado, 
    // y cliente al usuario/cliente en general
    coleccionReparaciones: [], // Todas las reparaciones
    coleccionUsuarios: [], // Todos los usuarios
    provinciasSelect: [], // Las provincias usadas en los select
    localidadesSelect: [], // Las localidades usadas en los select
    usuariosSelect: [] // Los usuarios usados en los select
}

// Todas las estructuras tiene un id del documento y un data del documento.

// Reducer para el App
export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case AppTypes.GET_REPARACIONES:{
            console.log("reparaciones en reducer: " + JSON.stringify(action.payload.data[0]));
            return { 
                ...state, 
                coleccionReparaciones: action.payload.data
            };
        }
        case AppTypes.GET_USUARIOS:{
            console.log("usuarios en reducer: " + JSON.stringify(action.payload.data[0]));
            return { 
                ...state, 
                coleccionUsuarios: action.payload.data
            };
        }
        case AppTypes.GET_REPARACION:{
            console.log("reparacion red: " + JSON.stringify(action.payload.data))
            return { 
                ...state, 
                reparacion: {
                    id: action.payload.id,
                    data: action.payload.data
                }
            };
        }
        case AppTypes.GET_CLIENTE:{
            return { 
                ...state, 
                cliente: {
                    id: action.payload.id,
                    data: action.payload.data
                }
            };
        }
        // case AppTypes.SET_ESTADO:
        //     return { 
        //         ...state, 
        //         reparacion: {
        //             ...state.reparacion,
        //             data: {
        //                 ...state.reparacion.data,
        //                 EstadoRep: action.payload.data.nombre,
        //                 PrioridadRep: action.payload.data.prioridad
        //             }
        //         }
        //     };
        // case AppTypes.CHANGE_INPUT_REP:
        //     return { 
        //         ...state, 
        //         reparacion: {
        //             ...state.reparacion,
        //             data: {
        //                 ...state.reparacion.data,
        //                 [action.payload.input]: action.payload.data
        //             }
                    
        //         }
        //      };
        // case AppTypes.CHANGE_INPUT_USU:
        //     return { 
        //         ...state, 
        //         cliente: {
        //             ...state.cliente,
        //             data: {
        //                 ...state.cliente.data,
        //                 [action.payload.input]: action.payload.data
        //             }
                    
        //         }
        //     };
        // case AppTypes.CHANGE_INPUT_PRESU:
        //     return { 
        //         ...state, 
        //         presupuesto: {
        //             ...state.presupuesto,
        //             [action.payload.input]: action.payload.data   
        //         }
        //     };
        case AppTypes.ISFETCHING_START:
            return { 
                ...state, 
                isFetching: true
            };
        case AppTypes.ISFETCHING_COMPLETE:
            return { 
                ...state, 
                isFetching: false 
            };
        // HAY QUE ESTABLECER EL ESTÁNDAR DE USUARIO COMO ESTÁ EN LA BASE DE DATOS
        // DE FIRESTORE COMO EL ESTÁNDAR DEL FRONTEND. LAS OTRAS DB TENDRÁN QUE USAR
        // ESOS NOMBRES, O SINO LA PERSISTENCIA TENDRÁ QUE CAMBIAR LOS NOSMBRES PARA
        // QUE SEAN COMO ESTÁN EN LA DB DE FIRESTORE.
        // CAMBIAR LO DE ABAJO PARA QUE SEA COMO DICE ARRIBA.
        case AppTypes.LOGIN:
            return {
                ...state,
                isFetching: false,
                isLoggedIn: action.payload.data.isLoggedIn,
                usuario: action.payload.data.usuario
                // {
                //     ...state.usuario,
                //     nombre: action.payload.data.usuario?.nombre,
                //     apellido: action.payload.data.usuario?.apellido,
                //     admin: action.payload.data.usuario?.admin,
                //     email: action.payload.data.usuario?.email,
                //     nick: action.payload.data.usuario?.nick,
                //     password: action.payload.data.usuario?.password,
                //     urlFoto: action.payload.data.usuario?.urlFoto
                //     //token: action.payload.data.usuario.token
                // }
            }
        case AppTypes.LOGOUT:
            return {
                ...state, 
                isLoggedIn: action.payload.data.isLoggedIn
            }
        // case AppTypes.CHANGE_PASSWORD_LOGIN:
        //     return {
        //         ...state, 
        //         login: {
        //             ...state.login,
        //             password: action.payload.data
        //         }
        //     };
        // case AppTypes.CHANGE_EMAIL_LOGIN:
        //     return { 
        //         ...state, 
        //         login: {
        //             ...state.login,
        //             email: action.payload.data
        //         }
        //     };
        case AppTypes.MODAL:
            return { 
                ...state,
                modal: action.payload.data.modal
            };
        case AppTypes.CONFIRM:
            return { 
                ...state,
                confirm: action.payload.data.confirm
            };
        // case AppTypes.LOAD_USU_TO_PRESU:
        //     return {
        //         ...state,
        //         presupuesto: {
        //             UsuarioPreu: action.payload.data.usuario?.id,
        //             EmailPresu: action.payload.data.usuario.data?.EmailUsu,
        //             NombrePresu: action.payload.data.usuario.data?.NombreUsu,
        //             ApellidoPresu: action.payload.data.usuario.data?.ApellidoUsu,
        //             TelefonoPresu: action.payload.data.usuario.data?.TelefonoUsu,
        //             CiudadPresu: action.payload.data.usuario.data?.CiudadUsu,
        //             ProvinciaPresu: action.payload.data.usuario.data?.ProvinciaUsu
        //         }
        //     }
        case AppTypes.GET_PROVINCIAS_SELECT:
            return {
                ...state,
                provinciasSelect: action.payload.data
            }
        case AppTypes.GET_LOCALIDADES_SELECT:
            return {
                ...state,
                localidadesSelect: action.payload.data.localidadesSelect
            }
        case AppTypes.GET_USUARIOS_SELECT:
            return {
                ...state,
                usuariosSelect: action.payload.data
            }
        // case AppTypes.SET_LOCALIDAD_PRESU:
        //     return {
        //         ...state,
        //         presupuesto: {
        //             ...state.presupuesto,
        //             usuario: {
        //                 ...state.presupuesto.usuario,
        //                 CiudadUsu: action.payload.data
        //             }
        //         },
        //     }
        // case AppTypes.SET_LOCALIDAD_CLIENTE:
        //     return {
        //         ...state,
        //         cliente: {
        //             ...state.cliente,
        //             data: {
        //                 ...state.cliente.data,
        //                 CiudadUsu: action.payload.data
        //             }
                    
        //         },
        //     }
        // case AppTypes.SET_PROVINCIA_CLIENTE:
        //     return {
        //         ...state,
        //         cliente: {
        //             ...state.cliente,
        //             data: {
        //                 ...state.cliente.data,
        //                 ProvinciaUsu: action.payload.data
        //             }
                    
        //         },
        //     }
        // case AppTypes.CLEAR_FORM:
        //     return {
        //         ...state,
        //         cliente: {},
        //         reparacion: {},
        //         presupuesto: {},
        //     }
        default:
            return state;
    }
}

