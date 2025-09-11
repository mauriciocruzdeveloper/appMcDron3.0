import { estados } from "../datos/estados";
import { Estado } from "../types/estado";

/**
 * Valida si un estado existe en el sistema actual
 * @param estadoNombre - Nombre del estado a validar
 * @returns boolean - true si el estado existe, false en caso contrario
 */
export const existeEstado = (estadoNombre: string): boolean => {
  return estadoNombre in estados;
};

/**
 * Obtiene un estado válido o retorna "Indefinido" si no existe
 * @param estadoNombre - Nombre del estado a obtener
 * @returns Estado válido o estado "Indefinido"
 */
export const obtenerEstadoSeguro = (estadoNombre: string): Estado => {
  if (existeEstado(estadoNombre)) {
    return estados[estadoNombre];
  }
  
  console.warn(`Estado '${estadoNombre}' no reconocido. Asignando estado 'Indefinido'.`);
  return estados.Indefinido;
};

/**
 * Mapea estados legacy a estados actuales
 * @param estadoLegacy - Estado del sistema anterior
 * @returns Estado equivalente en el nuevo sistema
 */
export const mapearEstadoLegacy = (estadoLegacy: string): string => {
  const mapeoLegacy: { [key: string]: string } = {
    'Reparar': 'Aceptado',      // Reparar -> Aceptado (estado actual equivalente)
    'Repuestos': 'Aceptado',    // Repuestos -> Aceptado (esperando repuestos para reparar)
    'Entregado': 'Finalizado',  // Entregado -> Finalizado (proceso completado)
    'Venta': 'Indefinido',     // Venta -> requiere revisión manual
    'Liquidación': 'Cancelado', // Liquidación -> Cancelado (proceso terminado)
  };
  
  return mapeoLegacy[estadoLegacy] || 'Indefinido';
};

/**
 * Determina si un estado es legacy (del sistema anterior)
 * @param estadoNombre - Nombre del estado
 * @returns boolean - true si es un estado legacy
 */
export const esEstadoLegacy = (estadoNombre: string): boolean => {
  const estadosLegacy = ['Reparar', 'Repuestos', 'Entregado', 'Venta', 'Liquidación'];
  return estadosLegacy.includes(estadoNombre);
};

/**
 * Obtiene todos los estados legacy que requieren migración
 * @returns Array de nombres de estados legacy
 */
export const obtenerEstadosLegacy = (): string[] => {
  return ['Reparar', 'Repuestos', 'Entregado', 'Venta', 'Liquidación'];
};

/**
 * Crea un mensaje de ayuda para migrar un estado legacy
 * @param estadoLegacy - Estado legacy a migrar
 * @returns Mensaje con sugerencias de migración
 */
export const obtenerMensajeMigracion = (estadoLegacy: string): string => {
  const mensajes: Record<string, string> = {
    'Reparar': 'Este estado puede migrarse a "Aceptado" si el presupuesto fue aprobado.',
    'Repuestos': 'Este estado puede migrarse a "Aceptado" si se están esperando repuestos para la reparación.',
    'Entregado': 'Este estado puede migrarse a "Finalizado" si el proceso fue completado exitosamente.',
    'Liquidación': 'Este estado puede migrarse a "Cancelado" si el proceso fue cancelado.',
    'Venta': 'Este estado requiere revisión manual para determinar el estado actual.',
  };
  
  return mensajes[estadoLegacy] || 'Estado no reconocido. Requiere revisión manual.';
};
