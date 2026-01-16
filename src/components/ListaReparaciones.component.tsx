import React, { useState } from "react";
import { usePermissions } from "hooks/usePermissions";
import { useAppSelector } from "redux-tool-kit/hooks/useAppSelector";
import { 
  selectReparacionesFitradasYOrdenadas,
  selectReparacionesByRole,
} from "redux-tool-kit/reparacion";
import { selectDronesDictionary } from "redux-tool-kit/drone/drone.selectors";
import ReparacionesFiltro from "./ListaReparaciones/ReparacionesFiltro.component";
import ReparacionesLista from "./ListaReparaciones/ReparacionesLista.component";

export default function ListaReparaciones(): JSX.Element {
  const { canViewAdminContent, currentRole } = usePermissions();
  
  // Si es admin, usa el selector filtrado normal, si no, usa el selector con control de acceso
  const reparacionesByAccess = useAppSelector(selectReparacionesByRole);
  const reparacionesFiltered = useAppSelector(selectReparacionesFitradasYOrdenadas);
  
  // Admin ve las filtradas (con filtros de prioridad, etc), cliente/partner ven solo las suyas
  const reparacionesList = currentRole === 'admin' ? reparacionesFiltered : reparacionesByAccess;
  const drones = useAppSelector(selectDronesDictionary);
  const [selectedModelo, setSelectedModelo] = useState<string>('');

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
      <div className="p-4 pb-2 bg-white border-bottom" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
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
