/**
 * Helper para generar y formatear el ID público de reparaciones.
 * 
 * Formato: REP-YYYY-NNNNNNN
 * - REP: prefijo fijo
 * - YYYY: año de creación de la reparación
 * - NNNNNNN: 1000000 + id de la BD, resultando en 7 dígitos empezando por 1
 * 
 * No requiere columnas adicionales en la BD (se guarda en public_id).
 * Se computa en el frontend a partir de id y created_at.
 */

/**
 * Formatea un ID público de reparación.
 * - IDs nuevos (secuenciales, pequeños): 1000000 + id → 7 dígitos empezando por 1
 * - IDs legacy (timestamps largos): se usan tal cual
 * @param id - ID de la reparación en la BD (PK)
 * @param createdAt - Fecha de creación (timestamp, Date, o string ISO)
 * @returns ID público formateado, ej: "REP-2026-1000042"
 */
export const formatRepairPublicId = (id: string | number, createdAt: Date | string | number): string => {
  const year = new Date(createdAt).getFullYear();
  const numId = Number(id);
  // IDs legacy son timestamps (13 dígitos), los nuevos son secuenciales pequeños
  const publicNumber = numId <= 9999999 ? 1000000 + numId : numId;
  return `REP-${year}-${publicNumber}`;
};

/**
 * Obtiene el ID público de una reparación, con fallback al ID interno truncado.
 * @param reparacion - Objeto reparación con id y data
 * @returns El IdPublicoRep si existe, o el id interno truncado como fallback
 */
export const getPublicIdDisplay = (reparacion: { id: string; data: { IdPublicoRep?: string } }): string => {
  return reparacion.data.IdPublicoRep || `#${reparacion.id.substring(0, 8)}`;
};
