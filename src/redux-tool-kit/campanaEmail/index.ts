export {
  setCampanasEmail,
  setFilterCampanasEmail,
} from './campanaEmail.slice';

export {
  guardarCampanaEmailAsync,
  eliminarCampanaEmailAsync,
  getRunsCampanaEmailAsync,
  getRecipientsRunCampanaEmailAsync,
  ejecutarCampanasVencidasAsync,
  reintentarRunCampanaEmailAsync,
  finalizarRunCampanaEmailAsync,
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
