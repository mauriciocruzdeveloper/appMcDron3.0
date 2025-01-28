import { createAsyncThunk } from "@reduxjs/toolkit";
import { eliminarUsuarioPersistencia, guardarUsuarioPersistencia } from "../../persistencia/persistenciaFirebase";
import { isFetchingComplete, isFetchingStart } from "../app/app.slice";
import { Usuario } from "../../types/usuario";

// ELIMINAR USUARIO
export const eliminarUsuarioAsync = createAsyncThunk(
    'app/eliminarUsuario',
    async (id: string, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const usuarioEliminado = await eliminarUsuarioPersistencia(id);
            dispatch(isFetchingComplete());
            return usuarioEliminado;
        } catch (error: any) {
            dispatch(isFetchingComplete());
            return error;
        }
    },
)

// GUARDAR USUARIO
export const guardarUsuarioAsync = createAsyncThunk(
    'app/guardarUsuario',
    async (usuario: Usuario, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const usuarioGuardado = await guardarUsuarioPersistencia(usuario);
            dispatch(isFetchingComplete());
            return usuarioGuardado;
        } catch (error: any) {
            dispatch(isFetchingComplete());
            return error;
        }
    },
);