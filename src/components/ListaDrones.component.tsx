import React, { useEffect, useState } from 'react';
import history from '../history';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { Drone } from '../types/drone';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { setFilter } from '../redux-tool-kit/drone/drone.slice';

// Mock de drones para mostrar como ejemplo
const dronesMock: Drone[] = [
    {
        id: 'mock-1',
        data: {
            NumeroSerie: 'SN123456789',
            ModeloDroneId: 'mock-1', // ID de un Mavic 3
            Propietario: 'Juan Pérez',
            Observaciones: 'Utilizado principalmente para fotografía'
        }
    },
    {
        id: 'mock-2',
        data: {
            NumeroSerie: 'SN987654321',
            ModeloDroneId: 'mock-2', // ID de un Mini 3 Pro
            Propietario: 'María López',
            Observaciones: 'Usado para grabación de eventos'
        }
    },
    {
        id: 'mock-3',
        data: {
            NumeroSerie: 'SN456789123',
            ModeloDroneId: 'mock-3', // ID de un Phantom 4 Pro
            Propietario: 'Carlos Rodríguez',
            Observaciones: 'Problema con la batería, cambio programado'
        }
    }
];

export default function ListaDrones(): JSX.Element {
    const dispatch = useAppDispatch();
    const coleccionDrones = useAppSelector((state) => state.drone.coleccionDrones);
    const filter = useAppSelector((state) => state.drone.filter);
    const modelosDrone = useAppSelector((state) => state.modeloDrone.coleccionModelosDrone);

    const [dronesList, setDronesList] = useState<Drone[]>([]);
    const [mostrandoMock, setMostrandoMock] = useState<boolean>(false);

    useEffect(() => {
        if (coleccionDrones.length) {
            const drones = coleccionDrones.filter(drone => {
                let incluirPorSearch = true;
                if (filter) {
                    incluirPorSearch =
                        drone.data?.NumeroSerie?.toLowerCase().includes(filter.toLowerCase()) ||
                        drone.data?.Propietario?.toLowerCase().includes(filter.toLowerCase()) ||
                        (drone.data?.Observaciones?.toLowerCase().includes(filter.toLowerCase()) || false);
                }
                return incluirPorSearch;
            });
            setDronesList(drones);
            setMostrandoMock(false);
        } else {
            // Usar los datos mock cuando no hay datos reales
            setDronesList(dronesMock);
            setMostrandoMock(true);
        }
    }, [coleccionDrones, filter]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setFilter(e.target.value));
    }

    const formatDate = (date: Date): string => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('es-AR');
    };

    // Nueva función para obtener el nombre del modelo de drone
    const getModeloDroneName = (modeloDroneId: string): string => {
        // Para datos mock, usamos nombres fijos
        if (modeloDroneId === 'mock-1') return 'Mavic 3';
        if (modeloDroneId === 'mock-2') return 'Mini 3 Pro';
        if (modeloDroneId === 'mock-3') return 'Phantom 4 Pro V2.0';
        
        // Para datos reales, buscamos el modelo por ID
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
                                <h5 className='mb-1'>{drone.data.NumeroSerie}</h5>
                                <span className='badge bg-bluemcdron'>{getModeloDroneName(drone.data.ModeloDroneId)}</span>
                            </div>
                            <div>
                                <small className='text-muted'>{drone.data.Propietario}</small>
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
