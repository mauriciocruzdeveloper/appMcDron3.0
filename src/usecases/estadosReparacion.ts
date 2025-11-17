/**
 * Lógica de negocio para transiciones de estados de reparación
 * Valida qué cambios de estado son permitidos según el flujo del negocio
 */

export type EstadoReparacion =
  | "Consulta"
  | "Respondido"
  | "Transito"
  | "Recibido"
  | "Revisado"
  | "Presupuestado"
  | "Aceptado"
  | "Repuestos"      // ← NUEVO: Estado para esperar repuestos
  | "Rechazado"
  | "Reparado"
  | "Diagnosticado"
  | "Cobrado"
  | "Enviado"
  | "Finalizado"
  | "Abandonado"
  | "Cancelado"
  | "Reparar"        // Legacy
  | "Entregado"      // Legacy
  | "Venta"          // Legacy
  | "Liquidación"    // Legacy
  | "Indefinido";    // Legacy

/**
 * Mapa de transiciones permitidas desde cada estado
 * Define el flujo de estados válido del negocio
 */
export const transicionesPermitidas: Record<EstadoReparacion, EstadoReparacion[]> = {
  Consulta: ["Respondido", "Cancelado"],
  Respondido: ["Transito", "Rechazado", "Cancelado"],
  Transito: ["Recibido", "Cancelado"],
  Recibido: ["Revisado"],
  Revisado: ["Presupuestado"],
  Presupuestado: ["Aceptado", "Rechazado", "Cancelado"],
  
  // ⬇️ MODIFICADO: Aceptado ahora puede ir a Repuestos
  Aceptado: ["Repuestos", "Reparado", "Rechazado", "Cancelado", "Abandonado"],
  
  // ⬇️ NUEVO: Estado Repuestos con ciclo bidireccional
  Repuestos: ["Aceptado", "Cancelado", "Abandonado"],
  
  Rechazado: ["Diagnosticado", "Cancelado", "Abandonado"],
  Reparado: ["Cobrado", "Finalizado"],
  Diagnosticado: ["Cobrado", "Finalizado"],
  Cobrado: ["Enviado", "Finalizado"],
  Enviado: ["Finalizado"],
  Finalizado: [],
  Abandonado: [],
  Cancelado: [],
  
  // Estados legacy - permitir migración a estados principales
  Reparar: ["Aceptado", "Repuestos", "Reparado", "Cancelado", "Abandonado"],
  Entregado: ["Finalizado"],
  Venta: ["Cobrado", "Finalizado"],
  Liquidación: ["Cancelado", "Finalizado"],
  Indefinido: ["Consulta", "Recibido", "Cancelado"]
};

/**
 * Valida si una transición de estado es permitida
 * 
 * @param estadoActual - Estado actual de la reparación
 * @param estadoNuevo - Estado al que se quiere cambiar
 * @returns true si la transición es válida, false en caso contrario
 * 
 * @example
 * esTransicionValida("Aceptado", "Repuestos") // true
 * esTransicionValida("Repuestos", "Aceptado") // true (ciclo permitido)
 * esTransicionValida("Repuestos", "Reparado") // false (debe volver a Aceptado primero)
 */
export const esTransicionValida = (
  estadoActual: EstadoReparacion,
  estadoNuevo: EstadoReparacion
): boolean => {
  // Validar que ambos estados existen
  if (!estadoActual || !estadoNuevo) {
    return false;
  }

  // Si no está definido en el mapa, no permitir (estado desconocido)
  if (!transicionesPermitidas[estadoActual]) {
    console.warn(`Estado actual no reconocido: ${estadoActual}`);
    return false;
  }

  // Verificar si el estado nuevo está en la lista de permitidos
  return transicionesPermitidas[estadoActual].includes(estadoNuevo);
};

/**
 * Obtiene la lista de estados permitidos desde un estado actual
 * Útil para poblar dropdowns dinámicos en la UI
 * 
 * @param estadoActual - Estado actual de la reparación
 * @returns Array de estados permitidos
 * 
 * @example
 * getEstadosPermitidos("Aceptado") 
 * // ["Repuestos", "Reparado", "Rechazado", "Cancelado", "Abandonado"]
 */
export const getEstadosPermitidos = (
  estadoActual: EstadoReparacion
): EstadoReparacion[] => {
  if (!transicionesPermitidas[estadoActual]) {
    console.warn(`Estado actual no reconocido: ${estadoActual}`);
    return [];
  }

  return transicionesPermitidas[estadoActual];
};

/**
 * Determina si un estado es terminal (no permite más transiciones)
 * 
 * @param estado - Estado a verificar
 * @returns true si es estado terminal
 */
export const esEstadoTerminal = (estado: EstadoReparacion): boolean => {
  const estadosTerminales: EstadoReparacion[] = [
    "Finalizado",
    "Abandonado",
    "Cancelado"
  ];
  
  return estadosTerminales.includes(estado);
};

/**
 * Verifica si un estado es legacy (retrocompatibilidad)
 * 
 * @param estado - Estado a verificar
 * @returns true si es estado legacy
 */
export const esEstadoLegacy = (estado: EstadoReparacion): boolean => {
  const estadosLegacy: EstadoReparacion[] = [
    "Reparar",
    "Entregado",
    "Venta",
    "Liquidación",
    "Indefinido"
  ];
  
  return estadosLegacy.includes(estado);
};

/**
 * Determina si un estado requiere observaciones obligatorias
 * 
 * @param estado - Estado a verificar
 * @returns true si requiere observaciones
 */
export const requiereObservaciones = (estado: EstadoReparacion): boolean => {
  const estadosConObservaciones: EstadoReparacion[] = [
    "Rechazado",
    "Cancelado",
    "Abandonado",
    "Repuestos"  // ← NUEVO: Repuestos puede requerir observaciones
  ];
  
  return estadosConObservaciones.includes(estado);
};

/**
 * Obtiene un mensaje descriptivo para una transición
 * 
 * @param estadoActual - Estado actual
 * @param estadoNuevo - Estado nuevo
 * @returns Mensaje descriptivo
 */
export const getMensajeTransicion = (
  estadoActual: EstadoReparacion,
  estadoNuevo: EstadoReparacion
): string => {
  // Transiciones especiales con Repuestos
  if (estadoActual === "Aceptado" && estadoNuevo === "Repuestos") {
    return "⚠️ La reparación quedará pausada hasta que lleguen los repuestos";
  }
  
  if (estadoActual === "Repuestos" && estadoNuevo === "Aceptado") {
    return "✅ Los repuestos han llegado y se retomará la reparación";
  }
  
  // Transiciones a estados terminales
  if (esEstadoTerminal(estadoNuevo)) {
    return `⚠️ Se marcará la reparación como: ${estadoNuevo}`;
  }
  
  return `Se cambiará el estado a: ${estadoNuevo}`;
};
