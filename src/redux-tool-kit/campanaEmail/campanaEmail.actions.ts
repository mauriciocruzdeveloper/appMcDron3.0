import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  eliminarCampanaEmailPersistencia,
  getRunsCampanaEmailPersistencia,
  guardarCampanaEmailPersistencia,
} from '../../persistencia/persistencia';
import { EmailCampaign } from '../../types/emailCampaign';
import { HttpMethod } from '../../types/httpMethods';
import { callEndpoint } from '../../utils/utils';
import { isFetchingComplete, isFetchingStart } from '../app/app.slice';

export const guardarCampanaEmailAsync = createAsyncThunk(
  'campanaEmail/guardar',
  async (campana: EmailCampaign, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      const guardada = await guardarCampanaEmailPersistencia(campana);
      dispatch(isFetchingComplete());
      return guardada;
    } catch (error) {
      dispatch(isFetchingComplete());
      throw error;
    }
  }
);

export const eliminarCampanaEmailAsync = createAsyncThunk(
  'campanaEmail/eliminar',
  async (id: string, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      const eliminado = await eliminarCampanaEmailPersistencia(id);
      dispatch(isFetchingComplete());
      return eliminado;
    } catch (error) {
      dispatch(isFetchingComplete());
      throw error;
    }
  }
);

export const getRunsCampanaEmailAsync = createAsyncThunk(
  'campanaEmail/getRuns',
  async (campaignId: string | undefined, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      const runs = await getRunsCampanaEmailPersistencia(campaignId);
      dispatch(isFetchingComplete());
      return runs;
    } catch (error) {
      dispatch(isFetchingComplete());
      throw error;
    }
  }
);

export const ejecutarCampanasVencidasAsync = createAsyncThunk(
  'campanaEmail/ejecutarVencidas',
  async (campaignId: string | undefined, { dispatch }) => {
    try {
      dispatch(isFetchingStart());

      const url = process.env.REACT_APP_API_URL + '/send_campaign_batch';
      const response = await callEndpoint({
        url,
        method: HttpMethod.POST,
        body: campaignId ? { campaign_id: campaignId } : {},
      });

      dispatch(isFetchingComplete());
      return response;
    } catch (error) {
      dispatch(isFetchingComplete());
      throw error;
    }
  }
);
