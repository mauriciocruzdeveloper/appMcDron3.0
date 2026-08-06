import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  eliminarCampanaEmailPersistencia,
  getRecipientsRunCampanaEmailPersistencia,
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

export const getRecipientsRunCampanaEmailAsync = createAsyncThunk(
  'campanaEmail/getRecipientsRun',
  async (runId: string, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      const recipients = await getRecipientsRunCampanaEmailPersistencia(runId);
      dispatch(isFetchingComplete());
      return { runId, recipients };
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

export const reintentarRunCampanaEmailAsync = createAsyncThunk(
  'campanaEmail/reintentarRun',
  async (runId: string, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      const url = process.env.REACT_APP_API_URL + '/send_campaign_batch';
      const response = await callEndpoint({
        url,
        method: HttpMethod.POST,
        body: { retry_run_id: runId },
      });
      dispatch(isFetchingComplete());
      return response;
    } catch (error) {
      dispatch(isFetchingComplete());
      throw error;
    }
  }
);

export const finalizarRunCampanaEmailAsync = createAsyncThunk(
  'campanaEmail/finalizarRun',
  async (runId: string, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      const url = process.env.REACT_APP_API_URL + '/send_campaign_batch';
      const response = await callEndpoint({
        url,
        method: HttpMethod.POST,
        body: { finalize_run_id: runId },
      });
      dispatch(isFetchingComplete());
      return response;
    } catch (error) {
      dispatch(isFetchingComplete());
      throw error;
    }
  }
);
