// ============================================================================
// INTERVENCIÓN (CATÁLOGO)
// ============================================================================

export interface IntervencionData {
  NombreInt: string;
  DescripcionInt: string;
  ModeloDroneId?: string; // Opcional - Referencia al ID del modelo de drone
  RepuestosIds: string[]; // Lista de IDs de repuestos utilizados
  PrecioManoObra: number; // Precio de mano de obra base (solo para referencia)
  DuracionEstimada: number; // Duración estimada en minutos
}

export interface Intervencion {
  id: string; // ID de la intervención en el catálogo
  data: IntervencionData;
}

// Tipo para la colección de intervenciones como diccionario
export type Intervenciones = { [id: string]: Intervencion };

// ============================================================================
// ASIGNACIÓN DE INTERVENCIÓN (INSTANCIA EN REPARACIÓN)
// ============================================================================

export interface AsignacionIntervencionData {
  // IDs de relación
  reparacionId: string; // ID de la reparación a la que pertenece
  intervencionId: string; // ID de la intervención del catálogo
  
  // Precios congelados al momento de la asignación
  PrecioManoObra: number; // Labor cost congelado
  PrecioPiezas: number; // Parts cost congelado (puede ser 0 si no tiene repuestos)
  PrecioTotal: number; // Total cost congelado
}

export interface AsignacionIntervencion {
  id: string; // ID único de la asignación (repair_intervention.id)
  data: AsignacionIntervencionData;
}

// Tipo para colección de asignaciones
export type AsignacionesIntervenciones = { [id: string]: AsignacionIntervencion };

