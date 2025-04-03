import React, { useEffect, useState } from 'react';
import history from '../history';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { ModeloDrone } from '../types/modeloDrone';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { setFilter } from '../redux-tool-kit/modeloDrone/modeloDrone.slice';

// Mock de modelos de drones para mostrar como ejemplo
const modelosDroneMock: ModeloDrone[] = [
    {
        id: 'mock-1',
        data: {
            NombreModelo: 'Mavic 3',
            Fabricante: 'DJI',
            DescripcionModelo: 'Drone profesional con cámara Hasselblad',
            EspecificacionesTecnicas: 'Cámara 4/3 CMOS, 46 minutos de vuelo, 15km de alcance',
            PrecioReferencia: 2049000,
            AnioLanzamiento: 2021,
            Estado: 'Disponible'
        }
    },
    {
        id: 'mock-2',
        data: {
            NombreModelo: 'Mini 3 Pro',
            Fabricante: 'DJI',
            DescripcionModelo: 'Drone compacto y ligero con excelente calidad de imagen',
            EspecificacionesTecnicas: 'Menos de 249g, cámara 1/1.3", 34 minutos de vuelo',
            PrecioReferencia: 759000,
            AnioLanzamiento: 2022,
            Estado: 'Disponible'
        }
    },
    {
        id: 'mock-3',
        data: {
            NombreModelo: 'Phantom 4 Pro V2.0',
            Fabricante: 'DJI',
            DescripcionModelo: 'Drone profesional para fotografía aérea',
            EspecificacionesTecnicas: 'Sensor 1", 30 minutos de vuelo, sistema anticolisión',
            PrecioReferencia: 1699000,
            AnioLanzamiento: 2018,
            Estado: 'Descontinuado'
        }
    }
];

export default function ListaModelosDrone(): JSX.Element {
    const dispatch = useAppDispatch();
    const coleccionModelosDrone = useAppSelector((state) => state.modeloDrone.coleccionModelosDrone);
    const filter = useAppSelector((state) => state.modeloDrone.filter);

    const [modelosList, setModelosList] = useState<ModeloDrone[]>([]);
    const [mostrandoMock, setMostrandoMock] = useState<boolean>(false);

    useEffect(() => {
        if (coleccionModelosDrone.length) {
            const modelos = coleccionModelosDrone.filter(modelo => {
                let incluirPorSearch = true;
                if (filter) {
                    incluirPorSearch =
                        modelo.data?.NombreModelo?.toLowerCase().includes(filter.toLowerCase()) ||
                        modelo.data?.Fabricante?.toLowerCase().includes(filter.toLowerCase()) ||
                        modelo.data?.DescripcionModelo?.toLowerCase().includes(filter.toLowerCase());
                }
                return incluirPorSearch;
            });
            setModelosList(modelos);
            setMostrandoMock(false);
        } else {
            // Usar los datos mock cuando no hay datos reales
            setModelosList(modelosDroneMock);
            setMostrandoMock(true);
        }
    }, [coleccionModelosDrone, filter]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setFilter(e.target.value));
    }

    const formatPrice = (precio: number): string => {
        return precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    };

    return (
        <div className='p-4'>
            <h2 className="mb-4">Modelos de Drone</h2>
            
            <div className='card mb-3'>
                <div className='card-body'>
                    <div className='form-group'>
                        <input
                            type='text'
                            className='form-control'
                            placeholder='Buscar modelos de drone...'
                            value={filter}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="text-muted">
                    {mostrandoMock ?
                        <span>Mostrando {modelosList.length} modelos de ejemplo <span className="badge bg-warning text-dark">DATOS DE EJEMPLO</span></span> :
                        <span>{modelosList.length} {modelosList.length === 1 ? 'modelo' : 'modelos'}</span>
                    }
                </div>
                
                <button
                    className="btn btn-primary"
                    onClick={() => history.push('/inicio/modelos-drone/new')}
                >
                    <i className="bi bi-plus-circle me-1"></i> Nuevo Modelo
                </button>
            </div>

            {modelosList.length === 0 ? (
                <div className="alert alert-info text-center" role="alert">
                    No hay modelos disponibles. ¡Agregue un nuevo modelo!
                </div>
            ) : (
                modelosList.map(modelo => (
                    <div
                        key={modelo.id}
                        className={`card mb-3 p-3 ${mostrandoMock && modelo.id.startsWith('mock') ? 'bg-light' : ''}`}
                        aria-current='true'
                        onClick={() => history.push(`/inicio/modelos-drone/${modelo.id}`)}
                    >
                        <div className='d-flex w-100 justify-content-between'>
                            <h5 className='mb-1'>{modelo.data.NombreModelo}</h5>
                            <span className='badge bg-primary'>{formatPrice(modelo.data.PrecioReferencia)}</span>
                        </div>
                        <div>
                            <small className='text-muted'>{modelo.data.Fabricante}</small>
                        </div>
                        <div>
                            <small className='text-muted'>{modelo.data.AnioLanzamiento}</small>
                        </div>
                        <div>
                            <small className='text-muted'>{modelo.data.DescripcionModelo}</small>
                        </div>
                        {modelo.data.Estado && (
                            <div>
                                <small className={`${modelo.data.Estado === 'Disponible' ? 'text-success' :
                                        modelo.data.Estado === 'Descontinuado' ? 'text-danger' : 'text-warning'
                                    }`}>
                                    {modelo.data.Estado}
                                </small>
                            </div>
                        )}
                        {mostrandoMock && modelo.id.startsWith('mock') && (
                            <div className="mt-2">
                                <span className="badge bg-secondary">Ejemplo</span>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
