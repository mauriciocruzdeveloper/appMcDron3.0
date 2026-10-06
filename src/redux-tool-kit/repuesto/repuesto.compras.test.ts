import { selectRepuestosAComprar } from './repuesto.selectors';

const crearEstado = (stock = 1, cantidadPedida = 2, estadoPedido = 'in_transit'): any => ({
  repuesto: { coleccionRepuestos: {
    motor: { id: 'motor', data: { NombreRepu: 'Motor', StockRepu: stock, Obsoleta: true } },
    agotado: { id: 'agotado', data: { NombreRepu: 'Sin demanda', StockRepu: 0 } },
  } },
  reparacion: { asignacionesCompromiso: [
    { id: 'a1', reparacionId: 'r1', estadoReparacion: 'Aceptado', incluyeRepuestosTaller: true,
      repuestosSnapshot: [{ partId: 'motor', quantity: 2 }] },
    { id: 'a2', reparacionId: 'r2', estadoReparacion: 'Repuestos', incluyeRepuestosTaller: true,
      repuestosSnapshot: [{ partId: 'motor', quantity: 3 }] },
    { id: 'a3', reparacionId: 'r3', estadoReparacion: 'Aceptado', incluyeRepuestosTaller: false,
      repuestosSnapshot: [{ partId: 'motor', quantity: 10 }] },
    { id: 'a4', reparacionId: 'r4', estadoReparacion: 'Reparado', incluyeRepuestosTaller: true,
      repuestosSnapshot: [{ partId: 'motor', quantity: 10 }] },
  ] },
  pedidoRepuesto: { coleccionPedidos: {
    pedido: { data: { Estado: estadoPedido, Items: [{ data: { RepuestoId: 'motor', Cantidad: cantidadPedida } }] } },
  } },
});

describe('repuestos a comprar', () => {
  it('consolida demanda compartida, descuenta pedidos y conserva obsoletos', () => {
    expect(selectRepuestosAComprar(crearEstado())).toEqual([expect.objectContaining({
      repuestoId: 'motor', cantidadNecesaria: 5, stock: 1, cantidadPedida: 2,
      cantidadAComprar: 2, reparacionesIds: ['r1', 'r2'], obsoleto: true,
    })]);
  });

  it.each(['pending', 'in_transit'])('descuenta pedidos %s y omite compras cubiertas', estado => {
    expect(selectRepuestosAComprar(crearEstado(2, 3, estado))).toEqual([]);
    expect(selectRepuestosAComprar(crearEstado(6, 0, estado))).toEqual([]);
  });

  it.each(['arrived', 'cancelled'])('no descuenta pedidos %s', estado => {
    expect(selectRepuestosAComprar(crearEstado(2, 20, estado))[0].cantidadAComprar).toBe(3);
  });

  it('normaliza stock y pedidos negativos y cuenta demanda sin stock', () => {
    expect(selectRepuestosAComprar(crearEstado(-2, -5))[0].cantidadAComprar).toBe(5);
    expect(selectRepuestosAComprar(crearEstado(0, 0))[0].cantidadAComprar).toBe(5);
  });

  it('no inventa stock ni compras para un ID ausente del catalogo', () => {
    const state = crearEstado();
    delete state.repuesto.coleccionRepuestos.motor;
    expect(selectRepuestosAComprar(state)[0]).toEqual(expect.objectContaining({
      nombre: 'Repuesto no encontrado (motor)', stock: null, cantidadAComprar: null,
      reparacionesIds: ['r1', 'r2'],
    }));
  });

  it('deduplica reparaciones y se actualiza ante cambios de asignaciones', () => {
    const state = crearEstado(0, 0);
    state.reparacion.asignacionesCompromiso.push({ ...state.reparacion.asignacionesCompromiso[0], id: 'a5' });
    expect(selectRepuestosAComprar(state)[0]).toEqual(expect.objectContaining({
      cantidadNecesaria: 7, reparacionesIds: ['r1', 'r2'],
    }));
    expect(selectRepuestosAComprar({ ...state, reparacion: { asignacionesCompromiso: [] } })).toEqual([]);
  });
});