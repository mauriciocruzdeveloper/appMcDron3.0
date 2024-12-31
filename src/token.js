import store from './redux-DEPRECATED/store.js';


export const token = () => {
    const state = store.getState();
    return state.app.usuario.data.token;
};
    // Hago esto para traer el token del estado de redux. Me pareció no muy prolijo,
    // pero es más práctico que pasarlo como propiedad de cada formulario donde se dispare un evento
    // que termine en una consulta al servidor.
 