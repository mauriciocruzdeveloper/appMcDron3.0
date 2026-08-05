import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

const selectPlantillaEmailState = (state: RootState) => state.plantillaEmail;

export const selectColeccionPlantillasEmail = createSelector(
  [selectPlantillaEmailState],
  (slice) => slice.coleccionPlantillasEmail
);

export const selectPlantillasEmailArray = createSelector(
  [selectColeccionPlantillasEmail],
  (coleccion) => Object.values(coleccion)
);

export const selectPlantillaEmailFilter = createSelector(
  [selectPlantillaEmailState],
  (slice) => slice.filter
);

export const selectPlantillasEmailFiltradas = createSelector(
  [selectPlantillasEmailArray, selectPlantillaEmailFilter],
  (plantillas, filter) => {
    if (!filter) return plantillas;
    const normalized = filter.toLowerCase();
    return plantillas.filter((p) =>
      p.data.NombrePlantilla.toLowerCase().includes(normalized) ||
      p.data.AsuntoPlantilla.toLowerCase().includes(normalized)
    );
  }
);
