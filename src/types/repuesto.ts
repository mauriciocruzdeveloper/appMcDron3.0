import { ModeloDrone } from "./modeloDrone";

// Interfaz para la data de un repuesto
export interface RepuestoData {
  NombreRepu: string;
  DescripcionRepu: string;
  ModeloDrones: ModeloDrone[]; // Array de objetos ModeloDrone
  ModelosDroneIds: number[]; // Nuevo array de IDs de modelos
  ProveedorRepu: string;
  PrecioRepu: number;
  StockRepu: number;
  UnidadesPedidas: number;
}

export interface Repuesto {
  id: string;
  data: RepuestoData;
}
