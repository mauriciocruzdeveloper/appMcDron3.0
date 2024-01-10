import { ReparacionType } from "../../types/reparacion";
import { SelectType } from "../../types/types";
import { ClienteType } from "../../types/usuario";
import { AppTypes } from "./App.types";

export interface RootState {
    app: AppState;
}

export interface ConfirmType {
    showConfirm: boolean;
    mensajeConfirm: string;
    tituloConfirm: string;
    tipoConfirm: string;
    callBackConfirm: () => void;
}

export interface AppState {
    isLoggedIn: boolean;
    isFetching: boolean;
    modal: {
        showModal: boolean;
        mensajeModal: string;
        tituloModal: string;
        tipoModal: string;
    };
    confirm: ConfirmType;
    login: {
        email: string;
        password: string;
        token: string;
    };
    usuario: any;
    coleccionReparaciones: ReparacionType[];
    coleccionMensajes: any[];
    coleccionUsuarios: ClienteType[];
    provinciasSelect: SelectType[];
    localidadesSelect: SelectType[];
    usuariosSelect: any[];
}

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
        callBackConfirm: null
    },
    login: {
        email: '',
        password: '',
        token: ''
    },
    usuario: {},
    coleccionReparaciones: [],
    coleccionMensajes: [],
    coleccionUsuarios: [],
    provinciasSelect: [],
    localidadesSelect: [],
    usuariosSelect: []
}

// Todas las estructuras tiene un id del documento y un data del documento.

// Type for action
export interface ReduxAction {
    type: string;
    payload: any;
}

// Reducer para el App
export default (state = INITIAL_STATE, action: ReduxAction) => {
    switch (action.type) {
        case AppTypes.SET_REPARACIONES:{
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

