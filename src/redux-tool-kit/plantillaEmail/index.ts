export {
  setPlantillasEmail,
  setFilterPlantillasEmail,
} from './plantillaEmail.slice';

export {
  guardarPlantillaEmailAsync,
  eliminarPlantillaEmailAsync,
} from './plantillaEmail.actions';

export {
  selectColeccionPlantillasEmail,
  selectPlantillasEmailArray,
  selectPlantillaEmailFilter,
  selectPlantillasEmailFiltradas,
} from './plantillaEmail.selectors';

export { default as plantillaEmailReducer } from './plantillaEmail.slice';
