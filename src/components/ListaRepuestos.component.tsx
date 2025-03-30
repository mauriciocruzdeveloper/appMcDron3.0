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
            ModeloRepu: 'CF8045',
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
            ModeloRepu: 'LP5000-4S',
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
            ModeloRepu: 'F722-SE',
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
                        repuesto.data?.ModeloRepu?.toLowerCase().includes(filter.toLowerCase()) ||
                        repuesto.data?.ProveedorRepu?.toLowerCase().includes(filter.toLowerCase());
                }
                return incluirPorSearch;
            });
            setRepuestosList(repuestos);
            setMostrandoMock(false);
        } else {
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

            <div className="mb-2 text-muted">
                {mostrandoMock ?
                    <span>Mostrando {repuestosMock.length} repuestos de ejemplo <span className="badge bg-warning text-dark">DATOS DE EJEMPLO</span></span> :
                    <span>{repuestosList.length} {repuestosList.length === 1 ? 'repuesto' : 'repuestos'}</span>
                }
            </div>

            <button
                className="btn btn-primary mb-3"
                onClick={() => history.push('/inicio/repuestos/new')}
            >
                Nuevo Repuesto
            </button>

            {repuestosList.length === 0 ? (
                mostrandoMock ? (
                    <>
                        <div className="alert alert-warning text-center mb-3" role="alert">
                            No hay repuestos disponibles. Mostrando datos de ejemplo. ¡Agregue un nuevo repuesto!
                        </div>
                        {repuestosMock.map(repuesto => (
                            <div
                                key={repuesto.id}
                                className='card mb-3 p-3 bg-light'
                                aria-current='true'
                            >
                                <div className='d-flex w-100 justify-content-between'>
                                    <h5 className='mb-1'>{repuesto.data.DescripcionRepu}</h5>
                                    <span className='badge bg-primary'>{formatPrice(repuesto.data.PrecioRepu)}</span>
                                </div>
                                <div>
                                    <small className='text-muted'>Modelo: {repuesto.data.ModeloRepu}</small>
                                </div>
                                <div>
                                    <small className='text-muted'>Proveedor: {repuesto.data.ProveedorRepu}</small>
                                </div>
                                {repuesto.data.StockRepu !== undefined && (
                                    <div>
                                        <small className={`${repuesto.data.StockRepu > 0 ? 'text-success' : 'text-danger'}`}>
                                            Stock: {repuesto.data.StockRepu} {repuesto.data.StockRepu === 1 ? 'unidad' : 'unidades'}
                                        </small>
                                    </div>
                                )}
                                {repuesto.data.EstadoRepu && (
                                    <div>
                                        <small className={`${repuesto.data.EstadoRepu === 'Disponible' ? 'text-success' :
                                                repuesto.data.EstadoRepu === 'Agotado' ? 'text-danger' : 'text-warning'
                                            }`}>
                                            Estado: {repuesto.data.EstadoRepu}
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
                        No hay repuestos disponibles. ¡Agregue un nuevo repuesto!
                    </div>
                )
            ) : (
                repuestosList.map(repuesto => (
                    <div
                        key={repuesto.id}
                        className='card mb-3 p-3'
                        aria-current='true'
                        onClick={() => history.push(`/inicio/repuestos/${repuesto.id}`)}
                    >
                        <div className='d-flex w-100 justify-content-between'>
                            <h5 className='mb-1'>{repuesto.data.DescripcionRepu}</h5>
                            <span className='badge bg-primary'>{formatPrice(repuesto.data.PrecioRepu)}</span>
                        </div>
                        <div>
                            <small className='text-muted'>Modelo: {repuesto.data.ModeloRepu}</small>
                        </div>
                        <div>
                            <small className='text-muted'>Proveedor: {repuesto.data.ProveedorRepu}</small>
                        </div>
                        {repuesto.data.StockRepu !== undefined && (
                            <div>
                                <small className={`${repuesto.data.StockRepu > 0 ? 'text-success' : 'text-danger'}`}>
                                    Stock: {repuesto.data.StockRepu} {repuesto.data.StockRepu === 1 ? 'unidad' : 'unidades'}
                                </small>
                            </div>
                        )}
                        {repuesto.data.EstadoRepu && (
                            <div>
                                <small className={`${repuesto.data.EstadoRepu === 'Disponible' ? 'text-success' :
                                        repuesto.data.EstadoRepu === 'Agotado' ? 'text-danger' : 'text-warning'
                                    }`}>
                                    Estado: {repuesto.data.EstadoRepu}
                                </small>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
