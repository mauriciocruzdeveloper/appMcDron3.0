export interface IntervencionData {
  NombreInt: string;
  DescripcionInt: string;
  ModeloDroneId: string; // Referencia al ID del modelo de drone
  RepuestosIds: string[]; // Lista de IDs de repuestos utilizados
  PrecioManoObra: number; // Precio sin repuestos (solo mano de obra)
  PrecioTotal: number; // Precio con repuestos incluidos
  DuracionEstimada: number; // Duración estimada en minutos
  Complejidad: 'Baja' | 'Media' | 'Alta';
  Categoria: string; // Por ejemplo: "Reparación", "Mantenimiento", "Actualización", etc.
  Estado: string; // "Activa", "Descontinuada", etc.
}

export interface Intervencion {
  id: string;
  data: IntervencionData;
}
