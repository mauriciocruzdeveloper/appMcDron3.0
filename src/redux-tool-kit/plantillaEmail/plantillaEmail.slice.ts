import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EmailTemplate, EmailTemplates } from '../../types/emailTemplate';
import { eliminarPlantillaEmailAsync, guardarPlantillaEmailAsync } from './plantillaEmail.actions';

interface PlantillaEmailState {
  filter: string;
  coleccionPlantillasEmail: EmailTemplates;
}

const initialState: PlantillaEmailState = {
  filter: '',
  coleccionPlantillasEmail: {},
};

const plantillaEmailSlice = createSlice({
  name: 'plantillaEmail',
  initialState,
  reducers: {
    setPlantillasEmail: (state, action: PayloadAction<EmailTemplate[]>) => {
      const collection: EmailTemplates = {};
      action.payload.forEach((item) => {
        collection[item.id] = item;
      });
      state.coleccionPlantillasEmail = collection;
    },
    setFilterPlantillasEmail: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(guardarPlantillaEmailAsync.fulfilled, (state, action) => {
      state.coleccionPlantillasEmail[action.payload.id] = action.payload;
    });
    builder.addCase(eliminarPlantillaEmailAsync.fulfilled, (state, action) => {
      delete state.coleccionPlantillasEmail[action.payload];
    });
  },
});

export const { setPlantillasEmail, setFilterPlantillasEmail } = plantillaEmailSlice.actions;

export default plantillaEmailSlice.reducer;
