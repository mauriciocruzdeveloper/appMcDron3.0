import React, { useState } from 'react';
import { useHistory } from '../hooks/useHistory';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { setFilter } from '../redux-tool-kit/pedidoRepuesto/pedidoRepuesto.slice';
import {
    selectPedidosFiltrados,
    selectPedidoFilter,
    selectTienePedidos,
    selectEstadisticasPedidos,
} from '../redux-tool-kit/pedidoRepuesto/pedidoRepuesto.selectors';
import { ESTADOS_PEDIDO, EstadoPedido, PedidoRepuesto } from '../types/pedidoRepuesto';
import { selectColeccionRepuestos } from '../redux-tool-kit/repuesto/repuesto.selectors';
import { selectColeccionModelosDrone } from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';
import { ComboBox } from './common';

export default function ListaPedidos(): JSX.Element {
    const dispatch = useAppDispatch();
    const history = useHistory();

    const filter = useAppSelector(selectPedidoFilter);
    const tienePedidos = useAppSelector(selectTienePedidos);
    const estadisticas = useAppSelector(selectEstadisticasPedidos);
    const [filtroEstado, setFiltroEstado] = useState<string>('');

    const pedidosFiltrados = useAppSelector((state) =>
        selectPedidosFiltrados(state, filtroEstado)
    );
    const coleccionRepuestos = useAppSelector(selectColeccionRepuestos);
    const coleccionModelosDrone = useAppSelector(selectColeccionModelosDrone);

    const getModeloDroneNombres = (repuestoId: string | null): string => {
        if (!repuestoId) return '';
        const repuesto = coleccionRepuestos[repuestoId];
        if (!repuesto?.data?.ModelosDroneIds?.length) return '';
        const nombres = [...new Set(repuesto.data.ModelosDroneIds as string[])]
            .map((id: string) => coleccionModelosDrone[id]?.data?.NombreModelo)
            .filter(Boolean);
        return nombres.length > 0 ? ` [${nombres.join(', ')}]` : '';
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setFilter(e.target.value));
    };

    const getEstadoBadge = (estado: EstadoPedido) => {
        const def = ESTADOS_PEDIDO.find(e => e.value === estado);
        return def ? (
            <span className={`badge bg-${def.color}`}>{def.label}</span>
        ) : null;
    };

    const formatFecha = (fecha: string | null): string => {
        if (!fecha) return '—';
        const d = new Date(fecha + 'T00:00:00');
        return d.toLocaleDateString('es-AR');
    };

    return (
        <div className='d-flex flex-column' style={{ height: '100vh' }}>
            {/* Header */}
            <div className='p-4 pb-2 bg-white border-bottom' style={{ position: 'sticky', top: 0, zIndex: 100 }}>
                <h3 className='mb-0'>Pedidos de Repuestos</h3>
            </div>

            {/* Contenido con scroll */}
            <div className='flex-grow-1 overflow-auto'>
                <div className='p-4 pt-3'>
                    {/* Filtros */}
                    <div className='card mb-3'>
                        <div className='card-body'>
                            <div className='form-group'>
                                <input
                                    type='text'
                                    className='form-control'
                                    placeholder='Buscar por proveedor, repuesto o N° seguimiento...'
                                    value={filter}
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <div className='form-group mt-2'>
                                <ComboBox
                                    options={ESTADOS_PEDIDO.map(e => ({ value: e.value, label: e.label }))}
                                    value={filtroEstado}
                                    onChange={(option) => setFiltroEstado(option?.value ?? '')}
                                    placeholder='Todos los estados'
                                    isClearable
                                />
                            </div>
                        </div>
                    </div>

                    {/* Acciones y resumen */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="text-muted">
                            {tienePedidos ? (
                                <div>
                                    <span>{pedidosFiltrados.length} {pedidosFiltrados.length === 1 ? 'pedido' : 'pedidos'}</span>
                                    <div className="mt-1 d-flex gap-2 flex-wrap">
                                        {estadisticas['pending'] > 0 && (
                                            <small className="text-secondary">
                                                {estadisticas['pending']} pendiente{estadisticas['pending'] !== 1 ? 's' : ''}
                                            </small>
                                        )}
                                        {estadisticas['in_transit'] > 0 && (
                                            <small className="text-warning">
                                                {estadisticas['in_transit']} en tránsito
                                            </small>
                                        )}
                                        {estadisticas['arrived'] > 0 && (
                                            <small className="text-success">
                                                {estadisticas['arrived']} recibido{estadisticas['arrived'] !== 1 ? 's' : ''}
                                            </small>
                                        )}
                                        {estadisticas['cancelled'] > 0 && (
                                            <small className="text-danger">
                                                {estadisticas['cancelled']} cancelado{estadisticas['cancelled'] !== 1 ? 's' : ''}
                                            </small>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <span>Sin pedidos registrados</span>
                            )}
                        </div>
                        <button
                            className="btn w-auto bg-bluemcdron text-white"
                            onClick={() => history.push('/inicio/pedidos/new')}
                        >
                            <i className="bi bi-plus-circle me-1"></i> Nuevo Pedido
                        </button>
                    </div>

                    {/* Lista */}
                    {pedidosFiltrados.length === 0 ? (
                        <div className="alert alert-info text-center" role="alert">
                            {tienePedidos
                                ? 'No hay pedidos que coincidan con los filtros.'
                                : '¡Registrá tu primer pedido de repuestos!'}
                        </div>
                    ) : (
                        pedidosFiltrados.map((pedido: PedidoRepuesto) => (
                            <div
                                key={pedido.id}
                                className="card mb-3 cursor-pointer"
                                style={{ cursor: 'pointer' }}
                                onClick={() => history.push(`/inicio/pedidos/${pedido.id}`)}
                            >
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 className="mb-1 fw-bold">{pedido.data.ProveedorNombre}</h6>
                                            {pedido.data.NumeroPedido && (
                                                <small className="text-muted d-block">
                                                    Seguimiento: {pedido.data.NumeroPedido}
                                                </small>
                                            )}
                                        </div>
                                        {getEstadoBadge(pedido.data.Estado)}
                                    </div>

                                    <div className="mt-2 d-flex gap-3 flex-wrap">
                                        <small className="text-muted">
                                            <i className="bi bi-calendar me-1"></i>
                                            Pedido: {formatFecha(pedido.data.FechaPedido)}
                                        </small>
                                        {pedido.data.FechaEstimadaLlegada && (
                                            <small className="text-muted">
                                                <i className="bi bi-calendar-check me-1"></i>
                                                Est. llegada: {formatFecha(pedido.data.FechaEstimadaLlegada)}
                                            </small>
                                        )}
                                        {pedido.data.FechaLlegadaReal && (
                                            <small className="text-success">
                                                <i className="bi bi-calendar2-check me-1"></i>
                                                Llegó: {formatFecha(pedido.data.FechaLlegadaReal)}
                                            </small>
                                        )}
                                    </div>

                                    {/* Ítems del pedido */}
                                    {pedido.data.Items.length > 0 && (
                                        <div className="mt-2">
                                            <small className="text-muted d-block mb-1">
                                                {pedido.data.Items.length} {pedido.data.Items.length === 1 ? 'repuesto' : 'repuestos'}:
                                            </small>
                                            {pedido.data.Items.map(item => {
                                                const modelos = getModeloDroneNombres(item.data.RepuestoId);
                                                return (
                                                    <div key={item.id} className="d-flex align-items-baseline gap-1 ms-2">
                                                        <small>
                                                            <span className="fw-semibold">{item.data.NombreRepuesto}</span>
                                                            {modelos && <span className="text-muted"> {modelos}</span>}
                                                            <span className="text-secondary"> ×{item.data.Cantidad}</span>
                                                        </small>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {pedido.data.Notas && (
                                        <div className="mt-1">
                                            <small className="text-secondary fst-italic">
                                                {pedido.data.Notas}
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
