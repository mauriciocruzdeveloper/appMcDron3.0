import { AppTypes } from "./App.types";
// import { Usuario } from "../../interfaces/Usuario";

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
    coleccionMensajes: [], // Todas los mensajes
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
            return { 
                ...state, 
                coleccionReparaciones: action.payload.data
            };
        }
        case AppTypes.GET_USUARIOS:{
            return { 
                ...state, 
                coleccionUsuarios: action.payload.data
            };
        }
        case AppTypes.GET_MESSAGES:{
            return { 
                ...state, 
                coleccionMensajes: action.payload.data
            };
        }
        // case AppTypes.GET_REPARACION:{
        //     return { 
        //         ...state, 
        //         reparacion: {
        //             id: action.payload.id,
        //             data: action.payload.data
        //         }
        //     };
        // }
        // case AppTypes.GET_CLIENTE:{
        //     return { 
        //         ...state, 
        //         cliente: {
        //             id: action.payload.id,
        //             data: action.payload.data
        //         }
        //     };
        // }
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
        case AppTypes.SET_USUARIO:
            return {
                ...state,
                usuario: action.payload
            }
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
            }
        case AppTypes.LOGOUT:
            return INITIAL_STATE;
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
        default:
            return state;
    }
}

