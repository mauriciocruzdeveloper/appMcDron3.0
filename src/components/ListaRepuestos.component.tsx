import React, { useEffect, useState } from 'react';
import history from '../history';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { Repuesto } from '../types/repuesto';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { setFilter } from '../redux-tool-kit/repuesto/repuesto.slice';
import { ModeloDrone } from '../types/modeloDrone';

// Mock de repuestos para mostrar como ejemplo
const repuestosMock: Repuesto[] = [
    {
        id: 'mock-1',
        data: {
            NombreRepu: 'Hélices de carbono 8"',
            DescripcionRepu: 'Hélices de carbono de 8 pulgadas para drones de carrera',
            ProveedorRepu: 'DronePartes',
            ModelosDroneIds: ['modelo-1', 'modelo-2'], // Simulando que es compatible con varios modelos
            PrecioRepu: 15000,
            StockRepu: 5,
            UnidadesPedidas: 1, // Simulando que hay unidades pedidas
        }
    },
    {
        id: 'mock-2',
        data: {
            NombreRepu: 'Batería LiPo 5000mAh',
            DescripcionRepu: 'Batería de polímero de litio de 5000mAh 4S para drones',
            ProveedorRepu: 'PowerDrones',
            ModelosDroneIds: ['modelo-1'], // Simulando que es compatible con un modelo específico
            PrecioRepu: 38000,
            UnidadesPedidas: 0, // Simulando que no hay unidades pedidas
            StockRepu: 10,
        }
    },
    {
        id: 'mock-3',
        data: {
            NombreRepu: 'Controlador de vuelo F7',
            DescripcionRepu: 'Controlador de vuelo F7 con giroscopio y acelerómetro',
            ProveedorRepu: 'ControlTech',
            ModelosDroneIds: ['modelo-1', 'modelo-2'], // Simulando que es compatible con varios modelos
            PrecioRepu: 25600,
            StockRepu: 0,
            UnidadesPedidas: 2, // Simulando que hay unidades pedidas
        }
    }
];

// Función para calcular el estado del repuesto - mantenerla idéntica a la de Repuesto.component.tsx
export const calcularEstadoRepuesto = (stock: number, unidadesPedidas: number): string => {
    if (stock > 0) return 'Disponible';
    return unidadesPedidas > 0 ? 'En Pedido' : 'Agotado';
};

export default function ListaRepuestos(): JSX.Element {
    const dispatch = useAppDispatch();
    const coleccionRepuestos = useAppSelector((state) => state.repuesto.coleccionRepuestos);
    const filter = useAppSelector((state) => state.repuesto.filter);
    const modelosDrone = useAppSelector((state) => state.modeloDrone.coleccionModelosDrone); // Obtener los modelos de drones desde el estado

    const [repuestosList, setRepuestosList] = useState<Repuesto[]>([]);
    const [mostrandoMock, setMostrandoMock] = useState<boolean>(false);

    useEffect(() => {
        if (coleccionRepuestos.length) {
            const repuestos = coleccionRepuestos.filter(repuesto => {
                let incluirPorSearch = true;
                if (filter) {
                    incluirPorSearch =
                        repuesto.data?.NombreRepu?.toLowerCase().includes(filter.toLowerCase()) ||
                        repuesto.data?.DescripcionRepu?.toLowerCase().includes(filter.toLowerCase()) ||
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
    
    // Función para determinar el estado del repuesto basado en el stock
    const getEstadoRepuesto = (repuesto: Repuesto): string => {
        // Manejar migración de datos
        const unidadesPedidas = repuesto.data.UnidadesPedidas || 0;
        
        return calcularEstadoRepuesto(repuesto.data.StockRepu, unidadesPedidas);
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
                repuestosList.map(repuesto => {
                    const estado = getEstadoRepuesto(repuesto);
                    
                    return (
                        <div
                            key={repuesto.id}
                            className={`card mb-3 ${mostrandoMock && repuesto.id.startsWith('mock') ? 'bg-light' : ''}`}
                            aria-current='true'
                            onClick={() => history.push(`/inicio/repuestos/${repuesto.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className='card-body p-3'>
                                <div className='d-flex w-100 justify-content-between'>
                                    <h5 className='mb-1'>{repuesto.data.NombreRepu}</h5>
                                    <span className='badge bg-bluemcdron'>{formatPrice(repuesto.data.PrecioRepu)}</span>
                                </div>
                                <div>
                                    <small className='text-muted'>{repuesto.data.ProveedorRepu}</small>
                                </div>
                                <div>
                                    <small className={`${estado === 'Disponible' ? 'text-success' :
                                            estado === 'Agotado' ? 'text-danger' : 
                                            estado === 'En Pedido' ? 'text-warning' : ''
                                        }`}>
                                        {estado}
                                        {estado === 'En Pedido' && repuesto.data.UnidadesPedidas && 
                                          ` (${repuesto.data.UnidadesPedidas} unid.)`}
                                    </small>
                                </div>
                                {repuesto.data.DescripcionRepu && (
                                    <div className="mt-1">
                                        <small className="text-muted">{repuesto.data.DescripcionRepu}</small>
                                    </div>
                                )}
                                {repuesto.data.ModelosDroneIds.length > 0 && (
                                    <div className="mt-1">
                                        <small className="text-muted">
                                            Modelos de drones: {
                                                repuesto.data.ModelosDroneIds
                                                    .map(id => {
                                                        const modelo = modelosDrone.find((modelo: ModeloDrone) => modelo.id === id);
                                                        return modelo ? modelo.data.NombreModelo : id;
                                                    })
                                                    .join(', ')
                                            }
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
                    );
                })
            )}
        </div>
    );
}
