import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

const selectCampanaEmailState = (state: RootState) => state.campanaEmail;

export const selectColeccionCampanasEmail = createSelector(
  [selectCampanaEmailState],
  (slice) => slice.coleccionCampanasEmail
);

export const selectCampanasEmailArray = createSelector(
  [selectColeccionCampanasEmail],
  (coleccion) => Object.values(coleccion)
);

export const selectCampanasEmailFilter = createSelector(
  [selectCampanaEmailState],
  (slice) => slice.filter
);

export const selectCampanasEmailFiltradas = createSelector(
  [selectCampanasEmailArray, selectCampanasEmailFilter],
  (campanas, filter) => {
    if (!filter) return campanas;
    const normalized = filter.toLowerCase();
    return campanas.filter((c) => c.data.NombreCampana.toLowerCase().includes(normalized));
  }
);

export const selectCampanasRunsRecientes = createSelector(
  [selectCampanaEmailState],
  (slice) => slice.runsRecientes
);

export const selectResumenUltimaEjecucionCampanas = createSelector(
  [selectCampanaEmailState],
  (slice) => slice.ultimoResumenEjecucion
);
