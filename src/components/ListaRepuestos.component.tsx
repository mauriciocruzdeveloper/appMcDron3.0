import React, { useEffect, useState } from 'react';
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
import { ComboBox } from './common';
import { SelectOption } from '../types/selectOption';
import { clearStoredListFilter, getStoredListFilter, saveStoredListFilter } from '../utils/listFilters';
import { ImageGallery } from './ImageGallery';
import { getThumbnailUrl } from '../utils/imageUtils';

interface RepuestoFilterState {
    text: string;
    modelo: string;
    estado: string;
}

const REPUESTOS_FILTER_STORAGE_KEY = 'lista-repuestos-filtros';
const DEFAULT_REPUESTOS_FILTERS: RepuestoFilterState = {
    text: '',
    modelo: '',
    estado: '',
};

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
            UnidadesComprometidas: 1, // Simulando que hay unidades pedidas
        }
    },
    {
        id: 'mock-2',
        data: {
            NombreRepu: 'Batería LiPo 5000mAh',
            ProveedorRepu: 'PowerDrones',
            ModelosDroneIds: ['modelo-1'], // Simulando que es compatible con un modelo específico
            PrecioRepu: 38000,
            UnidadesComprometidas: 0, // Simulando que no hay unidades pedidas
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
            UnidadesComprometidas: 2, // Simulando que hay unidades pedidas
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

    const [filtroModeloDrone, setFiltroModeloDrone] = useState<string>(() =>
        getStoredListFilter<RepuestoFilterState>(REPUESTOS_FILTER_STORAGE_KEY, DEFAULT_REPUESTOS_FILTERS).modelo
    );
    const [filtroEstado, setFiltroEstado] = useState<string>(() =>
        getStoredListFilter<RepuestoFilterState>(REPUESTOS_FILTER_STORAGE_KEY, DEFAULT_REPUESTOS_FILTERS).estado
    );
    const [selectedFotoModal, setSelectedFotoModal] = useState<{ url: string; nombre: string } | null>(null);

    useEffect(() => {
        const storedFilters = getStoredListFilter<RepuestoFilterState>(
            REPUESTOS_FILTER_STORAGE_KEY,
            DEFAULT_REPUESTOS_FILTERS
        );

        if (!filter && storedFilters.text) {
            dispatch(setFilter(storedFilters.text));
        }
    }, [dispatch, filter]);

    useEffect(() => {
        saveStoredListFilter(REPUESTOS_FILTER_STORAGE_KEY, {
            text: filter,
            modelo: filtroModeloDrone,
            estado: filtroEstado,
        });
    }, [filter, filtroModeloDrone, filtroEstado]);

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
        const unidadesPedidas = repuesto.data.UnidadesComprometidas || 0;

        return calcularEstadoRepuesto(repuesto.data.StockRepu, unidadesPedidas);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setFilter(e.target.value));
    }

    const handleModeloChange = (option: SelectOption | null) => {
        setFiltroModeloDrone(option?.value ?? '');
    }

    const resetFilters = () => {
        dispatch(setFilter(''));
        setFiltroModeloDrone('');
        setFiltroEstado('');
        clearStoredListFilter(REPUESTOS_FILTER_STORAGE_KEY);
    };

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
                <div className='card-body list-filter-grid list-filter-grid-three'>
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
                        <ComboBox
                            options={modelosDrone.map((modelo: ModeloDrone) => ({
                                value: modelo.id,
                                label: modelo.data.NombreModelo,
                            }))}
                            value={filtroModeloDrone}
                            onChange={handleModeloChange}
                            placeholder='Todos los modelos'
                            isClearable
                        />
                    </div>
                    <div className='form-group mt-2'>
                        <ComboBox
                            options={[
                                { value: 'Disponible', label: 'Disponibles' },
                                { value: 'En Pedido', label: 'En Pedido' },
                                { value: 'Agotado', label: 'Agotados' },
                            ]}
                            value={filtroEstado}
                            onChange={(option) => setFiltroEstado(option?.value ?? '')}
                            placeholder='Todos los estados'
                            isClearable
                        />
                    </div>
                </div>
                <div className='d-flex justify-content-end mt-2'>
                    <button
                        type='button'
                        className='btn btn-link btn-sm p-0 text-muted'
                        onClick={resetFilters}
                    >
                        Restaurar filtros
                    </button>
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
                <div className="entity-card-grid">
                {repuestosList.map(repuesto => {
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
                                <div className='d-flex w-100 justify-content-between align-items-start gap-2'>
                                    <div className='d-flex align-items-center gap-2'>
                                        {repuesto.data.FotoRepu && (
                                            <div
                                                className="position-relative"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFotoModal({ url: repuesto.data.FotoRepu!, nombre: repuesto.data.NombreRepu });
                                                }}
                                                title="Haga clic para ver la foto"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <img
                                                    src={getThumbnailUrl(repuesto.data.FotoRepu)}
                                                    alt={repuesto.data.NombreRepu}
                                                    className='rounded border shadow-sm'
                                                    style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        if (target.src !== repuesto.data.FotoRepu) {
                                                            target.src = repuesto.data.FotoRepu!;
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <h5 className='mb-1'>{repuesto.data.NombreRepu}</h5>
                                    </div>
                                    <div>
                                        {repuesto.data.Obsoleta && (
                                            <span className="badge bg-warning text-dark me-2">Obsoleto</span>
                                        )}
                                        <span className='badge bg-bluemcdron'>{formatPrice(repuesto.data.PrecioRepu)}</span>
                                    </div>
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
                                        {estado === 'En Pedido' && repuesto.data.UnidadesComprometidas &&
                                            ` ${repuesto.data.UnidadesComprometidas}`}
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
                })}
                </div>
            )}
                </div>
            </div>

            {selectedFotoModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}
                    onClick={() => setSelectedFotoModal(null)}
                >
                    <div
                        className="modal-dialog modal-dialog-centered"
                        style={{ maxWidth: '440px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content bg-dark text-white border-0 shadow-lg" style={{ borderRadius: '12px' }}>
                            <div className="modal-header border-bottom border-secondary py-2">
                                <h6 className="modal-title mb-0">{selectedFotoModal.nombre}</h6>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setSelectedFotoModal(null)}
                                ></button>
                            </div>
                            <div className="modal-body p-3 d-flex justify-content-center">
                                <ImageGallery
                                    images={[selectedFotoModal.url]}
                                    isAdmin={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
