import { AppTypes } from "./App.types";
// Esta función está en Empleados en lugar de Login
// import { getLoginOkApi } from "../Empleados/Empleados.utils";

export const isFetchingStart = () => {console.log("llega a isfetching"); return { type: AppTypes.ISFETCHING_START }};
export const isFetchingCoplete = () => ({ type: AppTypes.ISFETCHING_COMPLETE });

export const login = ( email, password ) => async (dispatch) => {

    // dispatch( isFetchingStart());

    // return new Promise((resolve, reject) => {
    //     getLoginOkApi( email, password )
    //         .then( empleado => {
    //             dispatch({ 
    //                 type: LoginTypes.LOGIN, 
    //                 payload: { 
    //                     data: {
    //                         isLoggedIn: true,
    //                         empleado
    //                     }
    //                 }
    //             });
    //             resolve( empleado );
    //         })
    //         .catch(error  => reject(error))
    //         .finally(dispatch(isFetchingCoplete()));
    // });
};

// export const errorLogin = () => ({
//     type: LoginTypes.ERROR_LOGIN,
//     payload: { data: { errorLogin: true } }
// });

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
