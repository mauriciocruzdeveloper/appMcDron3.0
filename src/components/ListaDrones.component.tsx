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
            FechaAdquisicion: new Date('2022-06-15'),
            EstadoDrone: 'Activo',
            UltimoMantenimiento: new Date('2023-02-10'),
            Observaciones: 'Utilizado principalmente para fotografía'
        }
    },
    {
        id: 'mock-2',
        data: {
            NumeroSerie: 'SN987654321',
            ModeloDroneId: 'mock-2', // ID de un Mini 3 Pro
            Propietario: 'María López',
            FechaAdquisicion: new Date('2023-01-20'),
            EstadoDrone: 'Activo',
            UltimoMantenimiento: new Date('2023-07-05'),
            Observaciones: 'Usado para grabación de eventos'
        }
    },
    {
        id: 'mock-3',
        data: {
            NumeroSerie: 'SN456789123',
            ModeloDroneId: 'mock-3', // ID de un Phantom 4 Pro
            Propietario: 'Carlos Rodríguez',
            FechaAdquisicion: new Date('2020-03-10'),
            EstadoDrone: 'En Reparación',
            UltimoMantenimiento: new Date('2023-03-18'),
            Observaciones: 'Problema con la batería, cambio programado'
        }
    }
];

export default function ListaDrones(): JSX.Element {
    const dispatch = useAppDispatch();
    const coleccionDrones = useAppSelector((state) => state.drone.coleccionDrones);
    const filter = useAppSelector((state) => state.drone.filter);

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
                        drone.data?.EstadoDrone?.toLowerCase().includes(filter.toLowerCase());
                }
                return incluirPorSearch;
            });
            setDronesList(drones);
            setMostrandoMock(false);
        } else {
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

    return (
        <div className='p-4'>
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

            <div className="mb-2 text-muted">
                {mostrandoMock ?
                    <span>Mostrando {dronesMock.length} drones de ejemplo <span className="badge bg-warning text-dark">DATOS DE EJEMPLO</span></span> :
                    <span>{dronesList.length} {dronesList.length === 1 ? 'drone' : 'drones'}</span>
                }
            </div>

            <button
                className="btn btn-primary mb-3"
                onClick={() => history.push('/inicio/drones/new')}
            >
                Nuevo Drone
            </button>

            {dronesList.length === 0 ? (
                mostrandoMock ? (
                    <>
                        <div className="alert alert-warning text-center mb-3" role="alert">
                            No hay drones disponibles. Mostrando datos de ejemplo. ¡Agregue un nuevo drone!
                        </div>
                        {dronesMock.map(drone => (
                            <div
                                key={drone.id}
                                className='card mb-3 p-3 bg-light'
                                aria-current='true'
                            >
                                <div className='d-flex w-100 justify-content-between'>
                                    <h5 className='mb-1'>{drone.data.NumeroSerie}</h5>
                                    <span className='badge bg-primary'>{drone.data.ModeloDroneId}</span>
                                </div>
                                <div>
                                    <small className='text-muted'>Propietario: {drone.data.Propietario}</small>
                                </div>
                                <div>
                                    <small className='text-muted'>Adquirido: {formatDate(drone.data.FechaAdquisicion)}</small>
                                </div>
                                {drone.data.UltimoMantenimiento && (
                                    <div>
                                        <small className='text-muted'>Último mantenimiento: {formatDate(drone.data.UltimoMantenimiento)}</small>
                                    </div>
                                )}
                                {drone.data.EstadoDrone && (
                                    <div>
                                        <small className={`${drone.data.EstadoDrone === 'Activo' ? 'text-success' :
                                                drone.data.EstadoDrone === 'En Reparación' ? 'text-warning' : 'text-danger'
                                            }`}>
                                            Estado: {drone.data.EstadoDrone}
                                        </small>
                                    </div>
                                )}
                                <div className="mt-2">
                                    <span className="badge bg-secondary">Ejemplo</span>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="alert alert-info text-center" role="alert">
                        No hay drones disponibles. ¡Agregue un nuevo drone!
                    </div>
                )
            ) : (
                dronesList.map(drone => (
                    <div
                        key={drone.id}
                        className='card mb-3 p-3'
                        aria-current='true'
                        onClick={() => history.push(`/inicio/drones/${drone.id}`)}
                    >
                        <div className='d-flex w-100 justify-content-between'>
                            <h5 className='mb-1'>{drone.data.NumeroSerie}</h5>
                            <span className='badge bg-primary'>{drone.data.ModeloDroneId}</span>
                        </div>
                        <div>
                            <small className='text-muted'>Propietario: {drone.data.Propietario}</small>
                        </div>
                        <div>
                            <small className='text-muted'>Adquirido: {formatDate(drone.data.FechaAdquisicion)}</small>
                        </div>
                        {drone.data.UltimoMantenimiento && (
                            <div>
                                <small className='text-muted'>Último mantenimiento: {formatDate(drone.data.UltimoMantenimiento)}</small>
                            </div>
                        )}
                        {drone.data.EstadoDrone && (
                            <div>
                                <small className={`${drone.data.EstadoDrone === 'Activo' ? 'text-success' :
                                        drone.data.EstadoDrone === 'En Reparación' ? 'text-warning' : 'text-danger'
                                    }`}>
                                    Estado: {drone.data.EstadoDrone}
                                </small>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
