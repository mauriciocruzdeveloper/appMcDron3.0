import { LoginTypes } from "./App.types";
// Esta función está en Empleados en lugar de Login
import { getLoginOkApi } from "../Empleados/Empleados.utils";

export const isFetchingStart = () => {console.log("llega a isfetching"); return { type: LoginTypes.ISFETCHING_LOGIN_START }};
export const isFetchingCoplete = () => ({ type: LoginTypes.ISFETCHING_LOGIN_COMPLETE });

export const login = ( email, password ) => async (dispatch) => {

    dispatch( isFetchingStart());
    // Puerta trasera para entrar como administrador.
    // if( email === "mauricio@mauricio.com" && password === "mauricio") 
    //     { return dispatch(
    //         {

    //             type: LoginTypes.LOGIN, 
    //             payload: { 
    //                 data: { 
    //                     isLoggedIn: true,
    //                     empleado:{
    //                         nombre: "mauricio",
    //                         email: "mauricio@mauriciol.com",
    //                         password: "mauricio",
    //                         admin: true,
    //                     }
    //                 }
    //             }
    //         }
    //     )};

        return new Promise((resolve, reject) => {
            getLoginOkApi( email, password )
                .then(( empleado ) => {
                    console.log("entra al then:" + JSON.stringify(empleado));
                    dispatch(
                        { 
                            type: LoginTypes.LOGIN, 
                            payload: { 
                                data: {
                                    isLoggedIn: true,
                                    empleado
                                }
                            }
                        }
                    );
                    resolve( empleado );
                })
                .catch(( error ) => {
                    console.log("entra al catch");
                    // dispatch( errorLogin() );
                    // history.push("/errorlogin");
                    console.log( error );
                    reject( error );
                })
                .finally( dispatch( isFetchingCoplete()) );
        });
};

// export const errorLogin = () => ({
//     type: LoginTypes.ERROR_LOGIN,
//     payload: { data: { errorLogin: true } }
// });

export const logout = () => ({
    type: LoginTypes.LOGOUT,
    payload: { data: { isLoggedIn: false } }
});

// Los "OnChange" me van actualizando los valores de las variables de estado en la medida que toco algo del formulario.

export const emailOnChangeLogin = ( data ) => ({ 
    type: LoginTypes.CHANGE_EMAIL_LOGIN,
    payload: { data }
});

export const passwordOnChangeLogin = ( data ) => ({ 
    type: LoginTypes.CHANGE_PASSWORD_LOGIN,
    payload: { data }
});
