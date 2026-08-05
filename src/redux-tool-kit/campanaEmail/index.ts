export {
  setCampanasEmail,
  setFilterCampanasEmail,
} from './campanaEmail.slice';

export {
  guardarCampanaEmailAsync,
  eliminarCampanaEmailAsync,
  getRunsCampanaEmailAsync,
  ejecutarCampanasVencidasAsync,
} from './campanaEmail.actions';

export {
  selectColeccionCampanasEmail,
  selectCampanasEmailArray,
  selectCampanasEmailFilter,
  selectCampanasEmailFiltradas,
  selectCampanasRunsRecientes,
  selectResumenUltimaEjecucionCampanas,
} from './campanaEmail.selectors';

export { default as campanaEmailReducer } from './campanaEmail.slice';
