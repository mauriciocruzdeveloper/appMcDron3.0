// Actualizar la interfaz para la data de un repuesto
export interface RepuestoData {
  NombreRepu: string;
  DescripcionRepu: string;
  ModeloDroneRepu: string; // Cambiado de ModeloRepu a ModeloDroneRepu
  ProveedorRepu: string;
  PrecioRepu: number;
  StockRepu: number;
  EstadoRepu: string;
}

export interface Repuesto {
  id: string;
  data: RepuestoData;
}
