import React, { useEffect, useState } from 'react';
import history from '../history';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { Repuesto } from '../types/repuesto';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { setFilter } from '../redux-tool-kit/repuesto/repuesto.slice';

// Mock de repuestos para mostrar como ejemplo
const repuestosMock: Repuesto[] = [
    {
        id: 'mock-1',
        data: {
            NombreRepu: 'Hélices de carbono 8"',
            DescripcionRepu: 'Hélices de carbono 8"',
            ModeloDroneRepu: 'CF8045',
            ProveedorRepu: 'DronePartes',
            PrecioRepu: 15000,
            StockRepu: 5,
            EstadoRepu: 'Disponible'
        }
    },
    {
        id: 'mock-2',
        data: {
            NombreRepu: 'Batería LiPo 5000mAh',
            DescripcionRepu: 'Batería LiPo 5000mAh',
            ModeloDroneRepu: 'LP5000-4S',
            ProveedorRepu: 'PowerDrones',
            PrecioRepu: 38000,
            StockRepu: 3,
            EstadoRepu: 'Disponible'
        }
    },
    {
        id: 'mock-3',
        data: {
            NombreRepu: 'Controlador de vuelo F7',
            DescripcionRepu: 'Controlador de vuelo F7',
            ModeloDroneRepu: 'F722-SE',
            ProveedorRepu: 'ControlTech',
            PrecioRepu: 25600,
            StockRepu: 0,
            EstadoRepu: 'Agotado'
        }
    }
];

export default function ListaRepuestos(): JSX.Element {
    const dispatch = useAppDispatch();
    const coleccionRepuestos = useAppSelector((state) => state.repuesto.coleccionRepuestos);
    const filter = useAppSelector((state) => state.repuesto.filter);

    const [repuestosList, setRepuestosList] = useState<Repuesto[]>([]);
    const [mostrandoMock, setMostrandoMock] = useState<boolean>(false);

    useEffect(() => {
        if (coleccionRepuestos.length) {
            const repuestos = coleccionRepuestos.filter(repuesto => {
                let incluirPorSearch = true;
                if (filter) {
                    incluirPorSearch =
                        repuesto.data?.DescripcionRepu?.toLowerCase().includes(filter.toLowerCase()) ||
                        repuesto.data?.ModeloDroneRepu?.toLowerCase().includes(filter.toLowerCase()) ||
                        repuesto.data?.ProveedorRepu?.toLowerCase().includes(filter.toLowerCase());
                }
                return incluirPorSearch;
            });
            setRepuestosList(repuestos);
            setMostrandoMock(false);
        } else {
            // Usar los datos mock cuando no hay datos reales
            setRepuestosList(repuestosMock);
            setMostrandoMock(true);
        }
    }, [coleccionRepuestos, filter]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setFilter(e.target.value));
    }

    const formatPrice = (precio: number): string => {
        return precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    };

    return (
        <div className='p-4'>
            <h2 className="mb-4">Repuestos</h2>
            
            <div className='card mb-3'>
                <div className='card-body'>
                    <div className='form-group'>
                        <input
                            type='text'
                            className='form-control'
                            placeholder='Buscar repuestos...'
                            value={filter}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="text-muted">
                    {mostrandoMock ?
                        <span>Mostrando {repuestosList.length} repuestos de ejemplo <span className="badge bg-warning text-dark">DATOS DE EJEMPLO</span></span> :
                        <span>{repuestosList.length} {repuestosList.length === 1 ? 'repuesto' : 'repuestos'}</span>
                    }
                </div>
                
                <button
                    className="btn w-auto bg-bluemcdron text-white"
                    onClick={() => history.push('/inicio/repuestos/new')}
                >
                    <i className="bi bi-plus-circle me-1"></i> Nuevo Repuesto
                </button>
            </div>

            {repuestosList.length === 0 ? (
                <div className="alert alert-info text-center" role="alert">
                    No hay repuestos disponibles. ¡Agregue un nuevo repuesto!
                </div>
            ) : (
                repuestosList.map(repuesto => (
                    <div
                        key={repuesto.id}
                        className={`card mb-3 ${mostrandoMock && repuesto.id.startsWith('mock') ? 'bg-light' : ''}`}
                        aria-current='true'
                        onClick={() => history.push(`/inicio/repuestos/${repuesto.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className='card-body p-3'>
                            <div className='d-flex w-100 justify-content-between'>
                                <h5 className='mb-1'>{repuesto.data.DescripcionRepu}</h5>
                                <span className='badge bg-bluemcdron'>{formatPrice(repuesto.data.PrecioRepu)}</span>
                            </div>
                            <div>
                                <small className='text-muted'>{repuesto.data.ModeloDroneRepu}</small>
                            </div>
                            <div>
                                <small className='text-muted'>{repuesto.data.ProveedorRepu}</small>
                            </div>
                            {repuesto.data.StockRepu !== undefined && (
                                <div>
                                    <small className={`${repuesto.data.StockRepu > 0 ? 'text-success' : 'text-danger'}`}>
                                        {repuesto.data.StockRepu} {repuesto.data.StockRepu === 1 ? 'unidad' : 'unidades'}
                                    </small>
                                </div>
                            )}
                            {repuesto.data.EstadoRepu && (
                                <div>
                                    <small className={`${repuesto.data.EstadoRepu === 'Disponible' ? 'text-success' :
                                            repuesto.data.EstadoRepu === 'Agotado' ? 'text-danger' : 'text-warning'
                                        }`}>
                                        {repuesto.data.EstadoRepu}
                                    </small>
                                </div>
                            )}
                            {mostrandoMock && repuesto.id.startsWith('mock') && (
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
