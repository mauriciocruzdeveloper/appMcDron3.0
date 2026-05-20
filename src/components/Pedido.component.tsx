import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from '../hooks/useHistory';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { useModal } from './Modal/useModal';
import {
    PedidoRepuesto,
    PedidoRepuestoItem,
    EstadoPedido,
    PROVEEDORES_PEDIDO,
    ESTADOS_PEDIDO,
    ProveedorId,
} from '../types/pedidoRepuesto';
import { guardarPedidoAsync, eliminarPedidoAsync } from '../redux-tool-kit/pedidoRepuesto/pedidoRepuesto.actions';
import { selectPedidoPorId } from '../redux-tool-kit/pedidoRepuesto/pedidoRepuesto.selectors';
import { selectRepuestosArray } from '../redux-tool-kit/repuesto/repuesto.selectors';
import { selectModelosDroneArray } from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';

interface ParamTypes extends Record<string, string | undefined> {
    id: string;
}

const hoy = (): string => new Date().toISOString().split('T')[0];

const pedidoVacio = (): PedidoRepuesto => ({
    id: 'new',
    data: {
        ProveedorId: PROVEEDORES_PEDIDO[0].id,
        ProveedorNombre: PROVEEDORES_PEDIDO[0].nombre,
        FechaPedido: hoy(),
        FechaEstimadaLlegada: null,
        FechaLlegadaReal: null,
        Estado: 'pending',
        NumeroPedido: null,
        Notas: '',
        Items: [],
    },
});

const itemVacio = (pedidoId: string): PedidoRepuestoItem => ({
    id: `temp-${Date.now()}`,
    data: {
        PedidoId: pedidoId,
        RepuestoId: null,
        NombreRepuesto: '',
        Cantidad: 1,
        PrecioUnitario: null,
    },
});

export default function PedidoComponent(): JSX.Element {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const { openModal } = useModal();
    const { id } = useParams<ParamTypes>();

    const isNew = id === 'new';
    const pedidoActual = useAppSelector((state) =>
        isNew || !id ? null : selectPedidoPorId(state, id)
    );
    const repuestos = useAppSelector(selectRepuestosArray);
    const modelosDrone = useAppSelector(selectModelosDroneArray);

    // Filtro de modelo de drone por ítem (map: itemId -> modeloDroneId)
    const [filtrosModeloItem, setFiltrosModeloItem] = useState<Record<string, string>>({});

    const [pedido, setPedido] = useState<PedidoRepuesto>(pedidoVacio());

    useEffect(() => {
        if (!isNew && pedidoActual) {
            setPedido(pedidoActual);

            // Pre-popular el filtro de modelo con el primer modelo de cada repuesto
            const filtrosIniciales: Record<string, string> = {};
            pedidoActual.data.Items.forEach(item => {
                if (item.data.RepuestoId) {
                    const repuesto = repuestos.find(r => r.id === item.data.RepuestoId);
                    if (repuesto?.data.ModelosDroneIds?.length) {
                        filtrosIniciales[item.id] = repuesto.data.ModelosDroneIds[0];
                    }
                }
            });
            setFiltrosModeloItem(filtrosIniciales);
        }
    }, [isNew, pedidoActual, repuestos]);

    // -------------------------------------------------------
    // Handlers campos principales
    // -------------------------------------------------------
    const handleProveedorChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const provId = Number(e.target.value) as ProveedorId;
        const proveedor = PROVEEDORES_PEDIDO.find(p => p.id === provId);
        setPedido(prev => ({
            ...prev,
            data: {
                ...prev.data,
                ProveedorId: provId,
                ProveedorNombre: proveedor?.nombre ?? '',
            },
        }));
    };

    const handleEstadoChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const nuevoEstado = e.target.value as EstadoPedido;
        // Si pasa a "arrived" y no tiene fecha real, poner hoy
        const llegada =
            nuevoEstado === 'arrived' && !pedido.data.FechaLlegadaReal
                ? hoy()
                : pedido.data.FechaLlegadaReal;
        setPedido(prev => ({
            ...prev,
            data: { ...prev.data, Estado: nuevoEstado, FechaLlegadaReal: llegada },
        }));
    };

    const handleFieldChange = (field: string, value: string | null) => {
        setPedido(prev => ({
            ...prev,
            data: { ...prev.data, [field]: value },
        }));
    };

    // -------------------------------------------------------
    // Handlers ítems
    // -------------------------------------------------------
    const handleAgregarItem = () => {
        setPedido(prev => ({
            ...prev,
            data: {
                ...prev.data,
                Items: [...prev.data.Items, itemVacio(prev.id)],
            },
        }));
    };

    const handleEliminarItem = (itemId: string) => {
        setPedido(prev => ({
            ...prev,
            data: {
                ...prev.data,
                Items: prev.data.Items.filter(i => i.id !== itemId),
            },
        }));
    };

    const handleItemChange = (itemId: string, field: string, value: string | number | null) => {
        setPedido(prev => ({
            ...prev,
            data: {
                ...prev.data,
                Items: prev.data.Items.map(item => {
                    if (item.id !== itemId) return item;
                    return { ...item, data: { ...item.data, [field]: value } };
                }),
            },
        }));
    };

    const handleFiltroModeloItem = (itemId: string, modeloId: string) => {
        setFiltrosModeloItem(prev => ({ ...prev, [itemId]: modeloId }));
        // Limpiar repuesto seleccionado si ya no pertenece al nuevo modelo
        const repuestoActual = pedido.data.Items.find(i => i.id === itemId)?.data.RepuestoId;
        if (repuestoActual && modeloId) {
            const sigue = repuestos.find(r => r.id === repuestoActual)?.data.ModelosDroneIds.includes(modeloId);
            if (!sigue) {
                handleItemChange(itemId, 'RepuestoId', null);
            }
        }
    };

    // Cuando se selecciona un repuesto del combo, copia el nombre automáticamente
    const handleItemRepuestoChange = (itemId: string, repuestoId: string) => {
        const repuesto = repuestos.find(r => r.id === repuestoId);
        setPedido(prev => ({
            ...prev,
            data: {
                ...prev.data,
                Items: prev.data.Items.map(item => {
                    if (item.id !== itemId) return item;
                    return {
                        ...item,
                        data: {
                            ...item.data,
                            RepuestoId: repuestoId || null,
                            NombreRepuesto: repuesto?.data.NombreRepu ?? item.data.NombreRepuesto,
                            PrecioUnitario: repuesto?.data.PrecioRepu ?? item.data.PrecioUnitario,
                        },
                    };
                }),
            },
        }));
    };

    // -------------------------------------------------------
    // Guard: si no existe el pedido en el store (ruta directa)
    // -------------------------------------------------------
    if (!isNew && !pedidoActual) {
        return (
            <div className="p-4">
                <div className="alert alert-warning">Pedido no encontrado.</div>
            </div>
        );
    }

    // -------------------------------------------------------
    // Guardar
    // -------------------------------------------------------
    const handleGuardar = () => {
        if (pedido.data.Items.length === 0) {
            openModal({
                mensaje: 'El pedido debe tener al menos un repuesto.',
                tipo: 'warning',
                titulo: 'Atención',
            });
            return;
        }
        const itemSinRepuesto = pedido.data.Items.find(i => !i.data.RepuestoId);
        if (itemSinRepuesto) {
            openModal({
                mensaje: 'Todos los ítems deben tener un repuesto seleccionado del catálogo.',
                tipo: 'warning',
                titulo: 'Atención',
            });
            return;
        }
        openModal({
            mensaje: '¿Desea guardar este pedido?',
            tipo: 'warning',
            titulo: 'Guardar Pedido',
            confirmCallback: confirmaGuardar,
        });
    };

    const confirmaGuardar = async () => {
        try {
            const response = await dispatch(guardarPedidoAsync(pedido));
            if (response.meta.requestStatus === 'fulfilled') {
                openModal({
                    mensaje: 'Pedido guardado correctamente.',
                    tipo: 'success',
                    titulo: 'Guardar Pedido',
                });
                if (isNew && (response.payload as PedidoRepuesto)?.id) {
                    history.replace(`/inicio/pedidos/${(response.payload as PedidoRepuesto).id}`);
                }
            } else {
                const resp = response as { error: { message: string } };
                openModal({
                    mensaje: 'Error al guardar el pedido: ' + resp.error.message,
                    tipo: 'danger',
                    titulo: 'Error',
                });
            }
        } catch (error) {
            openModal({ mensaje: 'Error inesperado: ' + error, tipo: 'danger', titulo: 'Error' });
        }
    };

    // -------------------------------------------------------
    // Eliminar
    // -------------------------------------------------------
    const handleEliminar = () => {
        openModal({
            mensaje: '¿Está seguro de que desea eliminar este pedido?',
            tipo: 'danger',
            titulo: 'Eliminar Pedido',
            confirmCallback: confirmaEliminar,
        });
    };

    const confirmaEliminar = async () => {
        try {
            await dispatch(eliminarPedidoAsync(pedido.id)).unwrap();
            openModal({ mensaje: 'Pedido eliminado.', tipo: 'success', titulo: 'Eliminar Pedido' });
            history.goBack();
        } catch (error: any) {
            openModal({ mensaje: error?.message ?? 'Error al eliminar.', tipo: 'danger', titulo: 'Error' });
        }
    };

    // -------------------------------------------------------
    // Render
    // -------------------------------------------------------
    const estadoConfig = ESTADOS_PEDIDO.find(e => e.value === pedido.data.Estado);

    return (
        <div className="p-4">
            {/* Header */}
            <div className="card mb-3 bg-bluemcdron">
                <div className="card-body">
                    <h3 className="card-title text-light p-0 m-0">
                        {isNew ? 'NUEVO PEDIDO' : 'EDITAR PEDIDO'}
                    </h3>
                    {!isNew && estadoConfig && (
                        <span className={`badge bg-${estadoConfig.color} mt-1`}>
                            {estadoConfig.label}
                        </span>
                    )}
                </div>
            </div>

            {/* --- Datos principales --- */}
            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title">Datos del Pedido</h5>

                    {/* Proveedor */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Proveedor</label>
                        <select
                            className="form-select"
                            value={pedido.data.ProveedorId}
                            onChange={handleProveedorChange}
                        >
                            {PROVEEDORES_PEDIDO.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Estado */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Estado</label>
                        <select
                            className="form-select"
                            value={pedido.data.Estado}
                            onChange={handleEstadoChange}
                        >
                            {ESTADOS_PEDIDO.map(e => (
                                <option key={e.value} value={e.value}>{e.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Número de seguimiento */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">N° de seguimiento / Orden</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Ej: AE-123456789-ES"
                            value={pedido.data.NumeroPedido ?? ''}
                            onChange={e => handleFieldChange('NumeroPedido', e.target.value || null)}
                        />
                    </div>

                    {/* Fechas */}
                    <div className="row">
                        <div className="col-sm-4 mb-3">
                            <label className="form-label fw-semibold">Fecha del pedido</label>
                            <input
                                type="date"
                                className="form-control"
                                value={pedido.data.FechaPedido}
                                onChange={e => handleFieldChange('FechaPedido', e.target.value)}
                            />
                        </div>
                        <div className="col-sm-4 mb-3">
                            <label className="form-label fw-semibold">Fecha estimada de llegada</label>
                            <input
                                type="date"
                                className="form-control"
                                value={pedido.data.FechaEstimadaLlegada ?? ''}
                                onChange={e => handleFieldChange('FechaEstimadaLlegada', e.target.value || null)}
                            />
                        </div>
                        <div className="col-sm-4 mb-3">
                            <label className="form-label fw-semibold">Fecha de llegada real</label>
                            <input
                                type="date"
                                className="form-control"
                                value={pedido.data.FechaLlegadaReal ?? ''}
                                onChange={e => handleFieldChange('FechaLlegadaReal', e.target.value || null)}
                            />
                        </div>
                    </div>

                    {/* Notas */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Notas</label>
                        <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Observaciones del pedido..."
                            value={pedido.data.Notas}
                            onChange={e => handleFieldChange('Notas', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* --- Ítems --- */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">Repuestos del pedido</h5>
                        <button
                            className="btn btn-sm bg-bluemcdron text-white"
                            onClick={handleAgregarItem}
                        >
                            <i className="bi bi-plus-circle me-1"></i> Agregar repuesto
                        </button>
                    </div>

                    {pedido.data.Items.length === 0 && (
                        <div className="alert alert-light text-center mb-0">
                            Todavía no hay repuestos. Hacé clic en &quot;Agregar repuesto&quot;.
                        </div>
                    )}

                    {pedido.data.Items.map((item, idx) => (
                        <div key={item.id} className="card mb-2 border-secondary">
                            <div className="card-body py-2">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="fw-semibold text-muted small">Ítem #{idx + 1}</span>
                                    <button
                                        className="btn btn-sm btn-outline-danger py-0 px-2"
                                        onClick={() => handleEliminarItem(item.id)}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>

                                {/* Modelo de drone: filtra el combo de repuestos */}
                                <div className="mb-2">
                                    <label className="form-label small mb-1">
                                        Modelo de drone
                                        {item.data.RepuestoId && filtrosModeloItem[item.id] && (
                                            <span className="ms-1 text-muted fw-normal">
                                                — {modelosDrone.find(m => m.id === filtrosModeloItem[item.id])?.data.NombreModelo ?? ''}
                                            </span>
                                        )}
                                    </label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={filtrosModeloItem[item.id] ?? ''}
                                        onChange={e => handleFiltroModeloItem(item.id, e.target.value)}
                                    >
                                        <option value=''>— Todos los modelos —</option>
                                        {modelosDrone.map(m => (
                                            <option key={m.id} value={m.id}>
                                                {m.data.NombreModelo} — {m.data.Fabricante}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Selector de repuesto existente */}
                                <div className="mb-2">
                                    <label className="form-label small mb-1">Repuesto del catálogo (opcional)</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={item.data.RepuestoId ?? ''}
                                        onChange={e => handleItemRepuestoChange(item.id, e.target.value)}
                                    >
                                        <option value=''>— Seleccionar repuesto —</option>
                                        {repuestos
                                            .filter(r =>
                                                !filtrosModeloItem[item.id] ||
                                                r.data.ModelosDroneIds.includes(filtrosModeloItem[item.id])
                                            )
                                            .map(r => (
                                                <option key={r.id} value={r.id}>{r.data.NombreRepu}</option>
                                            ))
                                        }
                                    </select>
                                </div>



                                <div className="row g-2">
                                    <div className="col-6">
                                        <label className="form-label small mb-1">Cantidad *</label>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            min={1}
                                            value={item.data.Cantidad}
                                            onChange={e => handleItemChange(item.id, 'Cantidad', Math.max(1, Number(e.target.value)))}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small mb-1">Precio unitario</label>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            min={0}
                                            step="0.01"
                                            placeholder="0.00"
                                            value={item.data.PrecioUnitario ?? ''}
                                            onChange={e => handleItemChange(item.id, 'PrecioUnitario', e.target.value === '' ? null : Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Total estimado */}
                    {pedido.data.Items.length > 0 && (
                        <div className="text-end mt-2">
                            <span className="fw-semibold">
                                Total estimado:{' '}
                                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(
                                    pedido.data.Items.reduce(
                                        (acc, i) => acc + i.data.Cantidad * (i.data.PrecioUnitario ?? 0),
                                        0
                                    )
                                )}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Acciones --- */}
            <div className="d-flex gap-2">
                <button className="btn bg-bluemcdron text-white flex-grow-1" onClick={handleGuardar}>
                    <i className="bi bi-floppy me-1"></i> Guardar
                </button>
                {!isNew && (
                    <button className="btn btn-outline-danger" onClick={handleEliminar}>
                        <i className="bi bi-trash me-1"></i> Eliminar
                    </button>
                )}
            </div>
        </div>
    );
}
