import { AppTypes } from "./App.types";

const INITIAL_STATE = {
    isLoggedIn: false,
    isFetching: false,
    modalError: {
        showError: false,
        mensajeError: '',
        tituloError: ''
    },
    usuario:{
        nombre: null,
        apellido: null,
        email: null,
        nick: null,
        urlFoto: null,
        password: null,
        admin: false
        //token: ''
    },
}

// Reducer para el App
export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
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
        case AppTypes.MODAL_ERROR:
            console.log("llega al reducer " + action.payload.data.showError);
            return { 
                ...state,
                modalError: action.payload.data.modalError
            };
        default:
            return state;
    }
}

