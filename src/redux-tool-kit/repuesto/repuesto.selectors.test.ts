import {
  calcularEstadoRepuesto,
  selectCantidadPedidaPorRepuesto,
  selectRepuestosEnPedido,
} from './repuesto.selectors';

describe('estado de repuestos', () => {
  it('distingue compromiso de reparación de pedido de compra', () => {
    expect(calcularEstadoRepuesto(0, 1, 0)).toBe('Comprometido');
    expect(calcularEstadoRepuesto(0, 1, 2)).toBe('En Pedido');
    expect(calcularEstadoRepuesto(0, 0, 0)).toBe('Agotado');
  });

  it('cuenta solo pedidos activos y no compromisos de reparaciones', () => {
    const state = {
      pedidoRepuesto: {
        coleccionPedidos: {
          pendiente: {
            id: 'pedido-1',
            data: {
              Estado: 'pending',
              Items: [{ data: { RepuestoId: 'parte-1', Cantidad: 2 } }],
            },
          },
          recibido: {
            id: 'pedido-2',
            data: {
              Estado: 'arrived',
              Items: [{ data: { RepuestoId: 'parte-1', Cantidad: 5 } }],
            },
          },
          cancelado: {
            id: 'pedido-3',
            data: {
              Estado: 'cancelled',
              Items: [{ data: { RepuestoId: 'parte-1', Cantidad: 7 } }],
            },
          },
        },
      },
      repuesto: {
        coleccionRepuestos: {
          'parte-1': {
            id: 'parte-1',
            data: { StockRepu: 0, UnidadesComprometidas: 1 },
          },
        },
      },
      reparacion: { asignacionesCompromiso: [] },
    } as any;

    expect(selectCantidadPedidaPorRepuesto(state, 'parte-1')).toBe(2);
    expect(selectRepuestosEnPedido(state)).toHaveLength(1);
  });
});
