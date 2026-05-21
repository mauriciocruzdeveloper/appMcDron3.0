import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    eliminarUsuarioPersistencia,
    getClientePersistencia,
    getClientePorEmailPersistencia,
    crearUsuarioPersistencia,
    actualizarPerfilUsuarioPersistencia,
} from "../../persistencia/persistencia";
import { isFetchingComplete, isFetchingStart } from "../app/app.slice";
import { Usuario, DatosCreacionUsuario } from "../../types/usuario";

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

// CREAR Usuario nuevo (autenticación + perfil)
export const crearUsuarioAsync = createAsyncThunk(
    'app/crearUsuario',
    async (datos: DatosCreacionUsuario, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const usuarioCreado = await crearUsuarioPersistencia(datos);
            dispatch(isFetchingComplete());
            return usuarioCreado;
        } catch (error: any) {
            dispatch(isFetchingComplete());
            throw error;
        }
    },
);

// ACTUALIZAR perfil de usuario existente (no modifica autenticación)
export const actualizarUsuarioAsync = createAsyncThunk(
    'app/actualizarUsuario',
    async (usuario: Usuario, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const usuarioActualizado = await actualizarPerfilUsuarioPersistencia(usuario.id, usuario.data);
            dispatch(isFetchingComplete());
            return usuarioActualizado;
        } catch (error: any) {
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


