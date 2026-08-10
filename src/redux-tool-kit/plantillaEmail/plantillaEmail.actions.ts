import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  eliminarPlantillaEmailPersistencia,
  guardarPlantillaEmailPersistencia,
} from '../../persistencia/persistencia';
import { EmailTemplate } from '../../types/emailTemplate';
import { isFetchingComplete, isFetchingStart } from '../app/app.slice';

export const guardarPlantillaEmailAsync = createAsyncThunk(
  'plantillaEmail/guardar',
  async (plantilla: EmailTemplate, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      const guardada = await guardarPlantillaEmailPersistencia(plantilla);
      dispatch(isFetchingComplete());
      return guardada;
    } catch (error) {
      dispatch(isFetchingComplete());
      throw error;
    }
  }
);

export const eliminarPlantillaEmailAsync = createAsyncThunk(
  'plantillaEmail/eliminar',
  async (id: string, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      const eliminado = await eliminarPlantillaEmailPersistencia(id);
      dispatch(isFetchingComplete());
      return eliminado;
    } catch (error) {
      dispatch(isFetchingComplete());
      throw error;
    }
  }
);
