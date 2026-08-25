import { agregarItemEnInicio, hayItemEnBlanco } from './pedidoRepuestoItems';
import type { PedidoRepuestoItem } from '../types/pedidoRepuesto';

describe('pedidoRepuestoItems helpers', () => {
  it('inserta un nuevo ítem al inicio de la lista', () => {
    const items: PedidoRepuestoItem[] = [
      {
        id: 'existing',
        data: {
          PedidoId: 'pedido-1',
          RepuestoId: 'repuesto-1',
          NombreRepuesto: 'Motor',
          Cantidad: 2,
          PrecioUnitario: 100,
        },
      },
    ];

    const result = agregarItemEnInicio(items, 'pedido-1');

    expect(result).toHaveLength(2);
    expect(result[0].id).toMatch(/^temp-/);
    expect(result[1].id).toBe('existing');
  });

  it('detecta un ítem vacío cuando no tiene repuesto seleccionado', () => {
    const item: PedidoRepuestoItem = {
      id: 'temp-1',
      data: {
        PedidoId: 'pedido-1',
        RepuestoId: null,
        NombreRepuesto: '',
        Cantidad: 1,
        PrecioUnitario: null,
      },
    };

    expect(hayItemEnBlanco([item])).toBe(true);
    expect(hayItemEnBlanco([
      {
        ...item,
        data: {
          ...item.data,
          RepuestoId: 'repuesto-1',
        },
      },
    ])).toBe(false);
  });
});
