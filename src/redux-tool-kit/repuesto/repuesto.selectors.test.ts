import {
  calcularEstadoRepuesto,
  selectCantidadPedidaPorRepuesto,
  selectRepuestosEnPedido,
  selectRepuestosAComprar,
  selectRepuestosFaltantes,
  selectRepuestosPedidos,
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

describe('clasificacion de listas de repuestos del inicio', () => {
  const crearEstado = (): any => ({
    repuesto: { coleccionRepuestos: Object.fromEntries([
      ['comprar', 0], ['cubierto', 0], ['sinDemanda', 0], ['conStock', 2],
      ['soloComprometido', 3], ['pedidoHistorico', 0], ['obsoleto', 0],
    ].map(([id, stock]) => [id, { id, data: {
      NombreRepu: id, StockRepu: stock, Obsoleta: id === 'obsoleto',
    } }])) },
    reparacion: {
      coleccionReparaciones: {},
      asignacionesCompromiso: ['comprar', 'cubierto', 'conStock', 'soloComprometido'].map(id => ({
        id: `a-${id}`, reparacionId: `r-${id}`, estadoReparacion: 'Aceptado',
        incluyeRepuestosTaller: true, repuestosSnapshot: [{ partId: id, quantity: 5 }],
      })),
    },
    intervencion: { coleccionIntervenciones: {} },
    pedidoRepuesto: { coleccionPedidos: {
      pendiente: { data: { Estado: 'pending', Items: [
        { data: { RepuestoId: 'comprar', Cantidad: 2 } },
        { data: { RepuestoId: 'cubierto', Cantidad: 5 } },
        { data: { RepuestoId: 'conStock', Cantidad: 1 } },
        { data: { RepuestoId: null, Cantidad: 100 } },
      ] } },
      transito: { data: { Estado: 'in_transit', Items: [
        { data: { RepuestoId: 'comprar', Cantidad: 1 } },
        { data: { RepuestoId: 'sinDemanda', Cantidad: 2 } },
      ] } },
      recibido: { data: { Estado: 'arrived', Items: [{ data: { RepuestoId: 'pedidoHistorico', Cantidad: 20 } }] } },
      cancelado: { data: { Estado: 'cancelled', Items: [{ data: { RepuestoId: 'soloComprometido', Cantidad: 20 } }] } },
    } },
  });

  it('a comprar muestra demanda sin stock ni cobertura total de pedidos', () => {
    expect(selectRepuestosAComprar(crearEstado())).toEqual([expect.objectContaining({
      repuestoId: 'comprar', cantidadNecesaria: 5, cantidadPedida: 3, cantidadAComprar: 2,
    })]);
  });

  it('agotados incluye los de stock cero con o sin demanda y pedidos, excepto obsoletos', () => {
    expect(selectRepuestosFaltantes(crearEstado()).map(repuesto => repuesto.id).sort())
      .toEqual(['comprar', 'cubierto', 'pedidoHistorico', 'sinDemanda']);
  });

  it('pedidos usa pedidos activos sin exigir stock cero ni compromiso y suma cantidades', () => {
    const pedidos = selectRepuestosPedidos(crearEstado());
    expect(pedidos.map(repuesto => repuesto.id).sort()).toEqual(['comprar', 'conStock', 'cubierto', 'sinDemanda']);
    expect(pedidos.find(repuesto => repuesto.id === 'comprar')?.cantidadPedida).toBe(3);
  });

  it('oculta un obsoleto en las tres listas aunque tenga demanda y pedido activo', () => {
    const state = crearEstado();
    state.repuesto.coleccionRepuestos.comprar.data.Obsoleta = true;
    expect(selectRepuestosAComprar(state).some(fila => fila.repuestoId === 'comprar')).toBe(false);
    expect(selectRepuestosFaltantes(state).some(repuesto => repuesto.id === 'comprar')).toBe(false);
    expect(selectRepuestosPedidos(state).some(repuesto => repuesto.id === 'comprar')).toBe(false);
  });
});
