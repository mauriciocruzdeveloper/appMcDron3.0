import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EmailCampaign, EmailCampaignRun, EmailCampaignRunRecipient, EmailCampaigns } from '../../types/emailCampaign';
import {
  eliminarCampanaEmailAsync,
  ejecutarCampanasVencidasAsync,
  guardarCampanaEmailAsync,
  getRunsCampanaEmailAsync,
  getRecipientsRunCampanaEmailAsync,
} from './campanaEmail.actions';

interface CampanaEmailState {
  filter: string;
  coleccionCampanasEmail: EmailCampaigns;
  runsRecientes: EmailCampaignRun[];
  recipientsPorRun: { [runId: string]: EmailCampaignRunRecipient[] };
  ultimoResumenEjecucion: unknown;
}

const initialState: CampanaEmailState = {
  filter: '',
  coleccionCampanasEmail: {},
  runsRecientes: [],
  recipientsPorRun: {},
  ultimoResumenEjecucion: null,
};

const campanaEmailSlice = createSlice({
  name: 'campanaEmail',
  initialState,
  reducers: {
    setCampanasEmail: (state, action: PayloadAction<EmailCampaign[]>) => {
      const collection: EmailCampaigns = {};
      action.payload.forEach((item) => {
        collection[item.id] = item;
      });
      state.coleccionCampanasEmail = collection;
    },
    setFilterCampanasEmail: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(guardarCampanaEmailAsync.fulfilled, (state, action) => {
      state.coleccionCampanasEmail[action.payload.id] = action.payload;
    });
    builder.addCase(eliminarCampanaEmailAsync.fulfilled, (state, action) => {
      delete state.coleccionCampanasEmail[action.payload];
    });
    builder.addCase(getRunsCampanaEmailAsync.fulfilled, (state, action) => {
      state.runsRecientes = action.payload;
    });
    builder.addCase(getRecipientsRunCampanaEmailAsync.fulfilled, (state, action) => {
      state.recipientsPorRun[action.payload.runId] = action.payload.recipients;
    });
    builder.addCase(ejecutarCampanasVencidasAsync.fulfilled, (state, action) => {
      state.ultimoResumenEjecucion = action.payload;
    });
  },
});

export const { setCampanasEmail, setFilterCampanasEmail } = campanaEmailSlice.actions;

export default campanaEmailSlice.reducer;
