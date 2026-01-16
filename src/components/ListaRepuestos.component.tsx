import React, { useState } from 'react';
import { useHistory } from '../hooks/useHistory';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { Repuesto } from '../types/repuesto';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { setFilter } from '../redux-tool-kit/repuesto/repuesto.slice';
import { ModeloDrone } from '../types/modeloDrone';
import {
    selectRepuestosFiltrados,
    selectRepuestoFilter,
    selectTieneRepuestos,
    selectEstadisticasRepuestos
} from '../redux-tool-kit/repuesto/repuesto.selectors';
import { selectModelosDroneArray } from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';

// Mock de repuestos para mostrar como ejemplo
const repuestosMock: Repuesto[] = [
    {
        id: 'mock-1',
        data: {
            NombreRepu: 'Hélices de carbono 8"',
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
    const history = useHistory();

    // Usar selectores para obtener datos del estado
    const filter = useAppSelector(selectRepuestoFilter);
    const tieneRepuestos = useAppSelector(selectTieneRepuestos);
    const estadisticas = useAppSelector(selectEstadisticasRepuestos);
    const modelosDrone = useAppSelector(selectModelosDroneArray);

    const [filtroModeloDrone, setFiltroModeloDrone] = useState<string>('');
    const [filtroEstado, setFiltroEstado] = useState<string>('');

    // Usar selector para obtener repuestos filtrados
    const repuestosFiltrados = useAppSelector((state) =>
        selectRepuestosFiltrados(state, filtroModeloDrone, filtroEstado)
    );

    // Estado para mostrar mock cuando no hay datos
    const mostrandoMock = !tieneRepuestos;
    const repuestosList = mostrandoMock ? repuestosMock : repuestosFiltrados;

    // Función para determinar el estado del repuesto basado en el stock
    const getEstadoRepuesto = (repuesto: Repuesto): string => {
        // Manejar migración de datos
        const unidadesPedidas = repuesto.data.UnidadesPedidas || 0;

        return calcularEstadoRepuesto(repuesto.data.StockRepu, unidadesPedidas);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setFilter(e.target.value));
    }

    const handleModeloChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFiltroModeloDrone(e.target.value);
    }

    const formatPrice = (precio: number): string => {
        return precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    };

    return (
        <div className='d-flex flex-column' style={{ height: '100vh' }}>
            {/* Header fijo */}
            <div className='p-4 pb-2 bg-white border-bottom' style={{ position: 'sticky', top: 0, zIndex: 100 }}>
                <h3 className='mb-0'>Repuestos</h3>
            </div>

            {/* Contenido con scroll */}
            <div className='flex-grow-1 overflow-auto'>
                <div className='p-4 pt-3'>
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
                    <div className='form-group mt-2'>
                        <select
                            className='form-select'
                            value={filtroModeloDrone}
                            onChange={handleModeloChange}
                        >
                            <option value=''>Todos los modelos</option>
                            {modelosDrone.map((modelo: ModeloDrone) => (
                                <option key={modelo.id} value={modelo.id}>
                                    {modelo.data.NombreModelo}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='form-group mt-2'>
                        <select
                            className='form-select'
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                            <option value=''>Todos los estados</option>
                            <option value='Disponible'>Disponibles</option>
                            <option value='En Pedido'>En Pedido</option>
                            <option value='Agotado'>Agotados</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="text-muted">
                    {mostrandoMock ? (
                        <span>Mostrando {repuestosList.length} repuestos de ejemplo
                            <span className="badge bg-warning text-dark ms-1">DATOS DE EJEMPLO</span>
                        </span>
                    ) : (
                        <div>
                            <span>{repuestosList.length} {repuestosList.length === 1 ? 'repuesto' : 'repuestos'}</span>
                            {estadisticas.total > 0 && (
                                <div className="mt-1">
                                    <small className="text-success">
                                        <i className="bi bi-check-circle me-1"></i>
                                        {estadisticas.disponibles} disponibles
                                    </small>
                                    {estadisticas.enPedido > 0 && (
                                        <small className="text-warning ms-2">
                                            <i className="bi bi-clock me-1"></i>
                                            {estadisticas.enPedido} en pedido
                                        </small>
                                    )}
                                    {estadisticas.agotados > 0 && (
                                        <small className="text-danger ms-2">
                                            <i className="bi bi-x-circle me-1"></i>
                                            {estadisticas.agotados} agotados
                                        </small>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
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
                                        {estado === 'Disponible' && ` ${repuesto.data.StockRepu}`}
                                        {estado === 'En Pedido' && repuesto.data.UnidadesPedidas &&
                                            ` ${repuesto.data.UnidadesPedidas}`}
                                    </small>
                                </div>
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
            </div>
        </div>
    );
}
