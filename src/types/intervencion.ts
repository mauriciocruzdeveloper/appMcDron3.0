export interface IntervencionData {
  NombreInt: string;
  DescripcionInt: string;
  ModeloDroneId?: string; // Ahora opcional - Referencia al ID del modelo de drone
  RepuestosIds: string[]; // Lista de IDs de repuestos utilizados
  PrecioManoObra: number; // Precio sin repuestos (solo mano de obra) - Puede ser negativo
  PrecioTotal: number; // Precio con repuestos incluidos
  DuracionEstimada: number; // Duración estimada en minutos
}

export interface Intervencion {
  id: string;
  data: IntervencionData;
}

// Tipo para la colección de intervenciones como diccionario
export type Intervenciones = { [id: string]: Intervencion };
