import { AppTypes } from "./App.types";

const INITIAL_STATE = {
    isLoggedIn: false,
    isFetching: false,
    usuario:{
        nombre: '',
        email: '',
        password: '',
        admin: false,
        token: ''
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
                    nombre: action.payload.data.empleado.nombre,
                    admin: action.payload.data.empleado.admin,
                    email: action.payload.data.empleado.email,
                    password: action.payload.data.empleado.password,
                    token: action.payload.data.empleado.token
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
        default:
            return state;
    }
}

