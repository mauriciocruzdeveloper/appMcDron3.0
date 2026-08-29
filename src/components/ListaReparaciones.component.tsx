import React, { useEffect, useState } from "react";
import { usePermissions } from "hooks/usePermissions";
import { useAppSelector } from "redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "redux-tool-kit/hooks/useAppDispatch";
import { 
  selectReparacionesFitradasYOrdenadas,
  selectReparacionesByRole,
  selectReparacionFilter,
  setFilter,
} from "redux-tool-kit/reparacion";
import { selectDronesDictionary } from "redux-tool-kit/drone/drone.selectors";
import ReparacionesFiltro from "./ListaReparaciones/ReparacionesFiltro.component";
import ReparacionesLista from "./ListaReparaciones/ReparacionesLista.component";
import { clearStoredListFilter, getStoredListFilter, saveStoredListFilter } from "../utils/listFilters";
import { Filtro } from "../types/Filtro";

interface ReparacionFilterState extends Filtro {
  modelo: string;
}

const REPARACIONES_FILTER_STORAGE_KEY = 'lista-reparaciones-filtros';
const DEFAULT_REPARACIONES_FILTERS: ReparacionFilterState = {
  estadosPrioritarios: true,
  search: '',
  estadosReparacion: [],
  modelo: '',
};

export default function ListaReparaciones(): JSX.Element {
  const dispatch = useAppDispatch();
  const { canViewAdminContent, currentRole } = usePermissions();
  const savedFilter = useAppSelector(selectReparacionFilter);
  
  // Si es admin, usa el selector filtrado normal, si no, usa el selector con control de acceso
  const reparacionesByAccess = useAppSelector(selectReparacionesByRole);
  const reparacionesFiltered = useAppSelector(selectReparacionesFitradasYOrdenadas);
  
  // Admin ve las filtradas (con filtros de prioridad, etc), cliente/partner ven solo las suyas
  const reparacionesList = currentRole === 'admin' ? reparacionesFiltered : reparacionesByAccess;
  const drones = useAppSelector(selectDronesDictionary);
  const [selectedModelo, setSelectedModelo] = useState<string>(() =>
    getStoredListFilter<ReparacionFilterState>(REPARACIONES_FILTER_STORAGE_KEY, DEFAULT_REPARACIONES_FILTERS).modelo
  );

  useEffect(() => {
    const storedFilters = getStoredListFilter<ReparacionFilterState>(
      REPARACIONES_FILTER_STORAGE_KEY,
      DEFAULT_REPARACIONES_FILTERS
    );

    const tieneFiltrosPersistidos =
      storedFilters.search !== '' ||
      storedFilters.estadosReparacion.length > 0 ||
      storedFilters.estadosPrioritarios !== DEFAULT_REPARACIONES_FILTERS.estadosPrioritarios;

    const estaEnFiltroPorDefecto =
      savedFilter.search === '' &&
      savedFilter.estadosReparacion.length === 0 &&
      savedFilter.estadosPrioritarios === DEFAULT_REPARACIONES_FILTERS.estadosPrioritarios;

    if (estaEnFiltroPorDefecto && tieneFiltrosPersistidos) {
      dispatch(setFilter({
        search: storedFilters.search,
        estadosPrioritarios: storedFilters.estadosPrioritarios,
        estadosReparacion: storedFilters.estadosReparacion,
      }));
    }
  }, [dispatch, savedFilter]);

  useEffect(() => {
    saveStoredListFilter(REPARACIONES_FILTER_STORAGE_KEY, {
      ...savedFilter,
      modelo: selectedModelo,
    });
  }, [savedFilter, selectedModelo]);

  const resetFilters = () => {
    setSelectedModelo('');
    dispatch(setFilter({
      estadosPrioritarios: DEFAULT_REPARACIONES_FILTERS.estadosPrioritarios,
      search: DEFAULT_REPARACIONES_FILTERS.search,
      estadosReparacion: DEFAULT_REPARACIONES_FILTERS.estadosReparacion,
    }));
    clearStoredListFilter(REPARACIONES_FILTER_STORAGE_KEY);
  };

  // Filtro adicional por modelo (aplicado localmente)
  const reparacionesFiltradas = reparacionesList.filter(reparacion => {
    if (!selectedModelo) return true;
    const drone = reparacion.data.DroneId ? drones[reparacion.data.DroneId] : undefined;
    if (!drone) return false;
    return drone.data.ModeloDroneId === selectedModelo;
  });

  return (
    <div className="d-flex flex-column" style={{ height: '100vh' }}>
      {/* Header fijo */}
      <div className="list-page-header p-4 pb-2 border-bottom" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <h3 className="mb-0">Reparaciones</h3>
      </div>

      {/* Contenido con scroll */}
      <div className="flex-grow-1 overflow-auto">
        <div className="p-4 pt-3">
          {/* Filtros - Solo visible para admin */}
          {canViewAdminContent && (
            <ReparacionesFiltro 
              selectedModelo={selectedModelo}
              onModeloChange={setSelectedModelo}
              onReset={resetFilters}
            />
          )}

          {/* Contador de reparaciones */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="mb-2 text-muted">
              {reparacionesFiltradas.length} {reparacionesFiltradas.length === 1 ? 'reparación' : 'reparaciones'}
            </div>
          </div>

          {/* Lista de reparaciones */}
          <ReparacionesLista reparaciones={reparacionesFiltradas} />
        </div>
      </div>
    </div>
  );
}
