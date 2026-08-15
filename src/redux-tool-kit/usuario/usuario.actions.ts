import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    eliminarUsuarioPersistencia,
    getClientePersistencia,
    getClientePorEmailPersistencia,
    guardarUsuarioPersistencia,
} from "../../persistencia/persistencia"; // Actualizado para usar la importación centralizada
import { isFetchingComplete, isFetchingStart } from "../app/app.slice";
import { Usuario } from "../../types/usuario";
import { sanitizeCuitInput } from "../../utils/cuit";

// ELIMINAR USUARIO
export const eliminarUsuarioAsync = createAsyncThunk(
    'app/eliminarUsuario',
    async (id: string, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const usuarioEliminado = await eliminarUsuarioPersistencia(id);
            dispatch(isFetchingComplete());
            
            return usuarioEliminado;
        } catch (error: any) { // TODO: Hacer tipo de dato para el error // TODO: Hacer tipo de dato para el error
            console.error(error);
            dispatch(isFetchingComplete());
            throw error;
        }
    },
)

// GUARDAR USUARIO
export const guardarUsuarioAsync = createAsyncThunk(
    'app/guardarUsuario',
    async (usuario: Usuario, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const usuarioSanitizado: Usuario = {
                ...usuario,
                data: {
                    ...usuario.data,
                    CUIT: sanitizeCuitInput(usuario.data.CUIT),
                },
            };
            const usuarioGuardado = await guardarUsuarioPersistencia(usuarioSanitizado);
            dispatch(isFetchingComplete());
            return usuarioGuardado;
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
            dispatch(isFetchingComplete());
            throw error;
        }
    },
);

// GET Clientes/Usuarios por id
export const getClienteAsync = createAsyncThunk(
    'app/getCliente',
    async (id: string, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const cliente = await getClientePersistencia(id);
            dispatch(isFetchingComplete());
            return cliente;
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
            dispatch(isFetchingComplete());
            return error;
        }
    },
);

// GET Clientes/Usuarios por email
export const getClienteByEmailAsync = createAsyncThunk(
    'app/getCliente',
    async (id: string, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const cliente = await getClientePorEmailPersistencia(id); // TODO: tengo que llamar por id, no email.
            dispatch(isFetchingComplete());
            return cliente;
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
            dispatch(isFetchingComplete());
            return error;
        }
    },
);


