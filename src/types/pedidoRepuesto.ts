// ============================================================
// Tipos para Pedidos de Repuestos
// ============================================================

// Proveedores hardcodeados - en el futuro pueden ser una tabla en la BD
export const PROVEEDORES_PEDIDO = [
  { id: 1, nombre: 'AliExpress' },
  { id: 2, nombre: 'MercadoLibre' },
  { id: 3, nombre: 'Amazon' },
  { id: 4, nombre: 'eBay' },
  { id: 5, nombre: 'DJI Store' },
  { id: 6, nombre: 'Shein' },
  { id: 7, nombre: 'Otro' },
] as const;

export type ProveedorId = typeof PROVEEDORES_PEDIDO[number]['id'];

export type EstadoPedido = 'pending' | 'in_transit' | 'arrived' | 'cancelled';

export const ESTADOS_PEDIDO: { value: EstadoPedido; label: string; color: string }[] = [
  { value: 'pending',    label: 'Pendiente',    color: 'secondary' },
  { value: 'in_transit', label: 'En tránsito',  color: 'warning' },
  { value: 'arrived',    label: 'Recibido',     color: 'success' },
  { value: 'cancelled',  label: 'Cancelado',    color: 'danger' },
];

// Ítem de un pedido (un repuesto con cantidad y precio)
export interface PedidoRepuestoItemData {
  PedidoId: string;
  RepuestoId: string | null;  // null si el repuesto fue eliminado
  NombreRepuesto: string;     // nombre denormalizado
  Cantidad: number;
  PrecioUnitario: number | null;
}

export interface PedidoRepuestoItem {
  id: string;
  data: PedidoRepuestoItemData;
}

// Pedido principal
export interface PedidoRepuestoData {
  ProveedorId: ProveedorId;
  ProveedorNombre: string;
  FechaPedido: string;         // ISO date string
  FechaEstimadaLlegada: string | null;
  FechaLlegadaReal: string | null;
  Estado: EstadoPedido;
  NumeroPedido: string | null; // tracking number
  Notas: string;
  Items: PedidoRepuestoItem[];
}

export interface PedidoRepuesto {
  id: string;
  data: PedidoRepuestoData;
}

export interface PedidosRepuesto {
  [key: string]: PedidoRepuesto;
}
