// Actualizar la interfaz para la data de un repuesto
export interface RepuestoData {
  NombreRepu: string;
  DescripcionRepu: string;
  ModeloDroneRepu: string;
  ProveedorRepu: string;
  PrecioRepu: number;
  StockRepu: number;
  UnidadesPedidas: number; // Cantidad de unidades que están en proceso de pedido
}

export interface Repuesto {
  id: string;
  data: RepuestoData;
}
