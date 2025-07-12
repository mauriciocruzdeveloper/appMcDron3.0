// Interfaz para la data de un repuesto
export interface RepuestoData {
  NombreRepu: string;
  DescripcionRepu: string;
  ModelosDroneIds: string[]; // Nuevo array de IDs de modelos
  ProveedorRepu: string;
  PrecioRepu: number;
  StockRepu: number;
  UnidadesPedidas: number;
}

export interface Repuesto {
  id: string;
  data: RepuestoData;
}

export interface Repuestos {
  [key: string]: Repuesto;
}
