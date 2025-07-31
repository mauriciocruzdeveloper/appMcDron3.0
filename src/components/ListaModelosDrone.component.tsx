import React, { useEffect, useState } from 'react';
import { useHistory } from '../hooks/useHistory';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { ModeloDrone } from '../types/modeloDrone';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { setFilter } from '../redux-tool-kit/modeloDrone/modeloDrone.slice';
import { 
    selectModeloDroneFilter,
    selectTieneModelosDrone,
    selectModelosDroneFiltradosPorEstado
} from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';

// Mock de modelos de drones para mostrar como ejemplo
const modelosDroneMock: ModeloDrone[] = [
    {
        id: 'mock-1',
        data: {
            NombreModelo: 'Mavic 3',
            Fabricante: 'DJI',
            DescripcionModelo: 'Drone profesional con cámara Hasselblad',
            PrecioReferencia: 2049000
        }
    },
    {
        id: 'mock-2',
        data: {
            NombreModelo: 'Mini 3 Pro',
            Fabricante: 'DJI',
            DescripcionModelo: 'Drone compacto y ligero con excelente calidad de imagen',
            PrecioReferencia: 759000
        }
    },
    {
        id: 'mock-3',
        data: {
            NombreModelo: 'Phantom 4 Pro V2.0',
            Fabricante: 'DJI',
            DescripcionModelo: 'Drone profesional para fotografía aérea',
            PrecioReferencia: 1699000
        }
    }
];

export default function ListaModelosDrone(): JSX.Element {
    const dispatch = useAppDispatch();
    const history = useHistory();
    
    // Usar selectores para obtener datos del estado
    const filter = useAppSelector(selectModeloDroneFilter);
    const tieneModelos = useAppSelector(selectTieneModelosDrone);
    const modelosFiltrados = useAppSelector(selectModelosDroneFiltradosPorEstado);

    const [modelosList, setModelosList] = useState<ModeloDrone[]>([]);
    const [mostrandoMock, setMostrandoMock] = useState<boolean>(false);

    useEffect(() => {
        if (tieneModelos) {
            setModelosList(modelosFiltrados);
            setMostrandoMock(false);
        } else {
            // Usar los datos mock cuando no hay datos reales
            setModelosList(modelosDroneMock);
            setMostrandoMock(true);
        }
    }, [tieneModelos, modelosFiltrados]);

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
                    className="btn w-auto bg-bluemcdron text-white"
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
                        className={`card mb-3 ${mostrandoMock && modelo.id.startsWith('mock') ? 'bg-light' : ''}`}
                        aria-current='true'
                        onClick={() => history.push(`/inicio/modelos-drone/${modelo.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className='card-body p-3'>
                            <div className='d-flex w-100 justify-content-between'>
                                <h5 className='mb-1'>{modelo.data.NombreModelo}</h5>
                                <span className='badge bg-bluemcdron'>{formatPrice(modelo.data.PrecioReferencia)}</span>
                            </div>
                            <div>
                                <small className='text-muted'>{modelo.data.Fabricante}</small>
                            </div>
                            <div>
                                <small className='text-muted'>{modelo.data.DescripcionModelo}</small>
                            </div>
                            {mostrandoMock && modelo.id.startsWith('mock') && (
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
