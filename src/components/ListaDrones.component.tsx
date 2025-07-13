import React from 'react';
import { useHistory } from '../hooks/useHistory';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { Drone } from '../types/drone';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { selectModelosDroneArray } from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';
import { selectColeccionUsuarios } from '../redux-tool-kit/usuario/usuario.selectors';
import { 
  selectDronesFiltrados,
  selectDroneFilter,
  setFilter,
  selectHasDrones
} from '../redux-tool-kit/drone';

// Mock de drones para mostrar como ejemplo
const dronesMock: Drone[] = [
    {
        id: 'mock-1',
        data: {
            ModeloDroneId: 'mock-1', // ID de un Mavic 3
            Propietario: 'mock-user-1', // Usar un id ficticio
            Observaciones: 'Utilizado principalmente para fotografía'
        }
    },
    {
        id: 'mock-2',
        data: {
            ModeloDroneId: 'mock-2', // ID de un Mini 3 Pro
            Propietario: 'mock-user-2',
            Observaciones: 'Usado para grabación de eventos'
        }
    },
    {
        id: 'mock-3',
        data: {
            ModeloDroneId: 'mock-3', // ID de un Phantom 4 Pro
            Propietario: 'mock-user-3',
            Observaciones: 'Problema con la batería, cambio programado'
        }
    }
];

export default function ListaDrones(): JSX.Element {
    const dispatch = useAppDispatch();
    const history = useHistory();
    
    // ✅ Usar selectores optimizados en lugar de acceso directo al estado
    const dronesFilteredFromStore = useAppSelector(selectDronesFiltrados);
    const filter = useAppSelector(selectDroneFilter);
    const hasDrones = useAppSelector(selectHasDrones);
    
    const modelosDrone = useAppSelector(selectModelosDroneArray);
    const usuarios = useAppSelector(selectColeccionUsuarios);

    // ✅ Determinar qué drones mostrar: datos reales o mock
    const dronesList = hasDrones ? dronesFilteredFromStore : dronesMock;
    const mostrandoMock = !hasDrones;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setFilter(e.target.value));
    }

    // Nueva función para obtener el nombre del modelo de drone
    const getModeloDroneName = (modeloDroneId: string): string => {
        // Para datos mock, usamos nombres fijos
        if (modeloDroneId === 'mock-1') return 'Mavic 3';
        if (modeloDroneId === 'mock-2') return 'Mini 3 Pro';
        if (modeloDroneId === 'mock-3') return 'Phantom 4 Pro V2.0';
        
        // ✅ Para datos reales, buscamos el modelo por ID usando acceso O(1)
        const modelo = modelosDrone.find(modelo => modelo.id === modeloDroneId);
        return modelo ? modelo.data.NombreModelo : modeloDroneId;
    };

    return (
        <div className='p-4'>
            <h2 className="mb-4">Drones</h2>
            
            <div className='card mb-3'>
                <div className='card-body'>
                    <div className='form-group'>
                        <input
                            type='text'
                            className='form-control'
                            placeholder='Buscar drones...'
                            value={filter}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="text-muted">
                    {mostrandoMock ?
                        <span>Mostrando {dronesList.length} drones de ejemplo <span className="badge bg-warning text-dark">DATOS DE EJEMPLO</span></span> :
                        <span>{dronesList.length} {dronesList.length === 1 ? 'drone' : 'drones'}</span>
                    }
                </div>
                
                <button
                    className="btn w-auto bg-bluemcdron text-white"
                    onClick={() => history.push('/inicio/drones/new')}
                >
                    <i className="bi bi-plus-circle me-1"></i> Nuevo Drone
                </button>
            </div>

            {dronesList.length === 0 ? (
                <div className="alert alert-info text-center" role="alert">
                    No hay drones disponibles. ¡Agregue un nuevo drone!
                </div>
            ) : (
                dronesList.map(drone => (
                    <div
                        key={drone.id}
                        className={`card mb-3 ${mostrandoMock && drone.id.startsWith('mock') ? 'bg-light' : ''}`}
                        aria-current='true'
                        onClick={() => history.push(`/inicio/drones/${drone.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className='card-body p-3'>
                            <div className='d-flex w-100 justify-content-between'>
                                <h5 className='mb-1'>{getModeloDroneName(drone.data.ModeloDroneId)}</h5>
                                {/* Badge de modelo eliminado, ya se muestra como título */}
                            </div>
                            <div>
                                {/* ✅ Mostrar nombre y apellido del propietario usando acceso O(1) por diccionario */}
                                <small className='text-muted'>
                                  {(() => {
                                    // Nos aseguramos que el id del usuario sea string
                                    const propietarioId = drone.data.Propietario;
                                    const usuario = usuarios[propietarioId];
                                    return usuario ? `${usuario.data.NombreUsu} ${usuario.data.ApellidoUsu}` : propietarioId;
                                  })()}
                                </small>
                            </div>
                            {drone.data.Observaciones && (
                                <div>
                                    <small className='text-muted'>{drone.data.Observaciones}</small>
                                </div>
                            )}
                            {mostrandoMock && drone.id.startsWith('mock') && (
                                <div className="mt-2">
                                    <span className="badge bg-secondary">Ejemplo</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
