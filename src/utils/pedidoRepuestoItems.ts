import type { PedidoRepuestoItem } from '../types/pedidoRepuesto';

export const itemVacio = (pedidoId: string): PedidoRepuestoItem => ({
  id: `temp-${Date.now()}`,
  data: {
    PedidoId: pedidoId,
    RepuestoId: null,
    NombreRepuesto: '',
    Cantidad: 1,
    PrecioUnitario: null,
  },
});

export const agregarItemEnInicio = (items: PedidoRepuestoItem[], pedidoId: string): PedidoRepuestoItem[] => {
  return [itemVacio(pedidoId), ...items];
};

export const hayItemEnBlanco = (items: PedidoRepuestoItem[]): boolean => {
  return items.some(item => !item.data.RepuestoId);
};
