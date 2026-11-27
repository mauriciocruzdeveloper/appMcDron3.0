import {
  AsignacionIntervencionData,
  Intervencion,
  RepuestoAsignacionSnapshot,
} from '../types/intervencion';

export type TipoAjusteRepuestosAsignacion =
  | 'original'
  | 'sustituido'
  | 'sin_repuesto_stock';

export interface EvaluacionAjusteRepuestos {
  tipoAjuste: TipoAjusteRepuestosAsignacion;
  esAjustado: boolean;
  repuestosEfectivos: RepuestoAsignacionSnapshot[];
  repuestosCatalogo: RepuestoAsignacionSnapshot[];
}

interface RelacionCatalogoLike {
  part_id?: string | number;
  partId?: string | number;
  quantity?: number | string;
}

/**
 * Normaliza y consolida una lista de repuestos de asignación:
 * - Filtra IDs vacíos y cantidades <= 0
 * - Unifica IDs repetidos sumando sus cantidades enteras positivas
 */
export const normalizarRepuestosSnapshot = (
  items?: ReadonlyArray<{ partId?: string | number; part_id?: string | number; quantity?: number | string }> | null,
): RepuestoAsignacionSnapshot[] => {
  if (!Array.isArray(items) || items.length === 0) return [];

  const acumulado = new Map<string, number>();

  items.forEach((item) => {
    const rawId = item?.partId ?? item?.part_id;
    const partId = rawId !== undefined && rawId !== null ? String(rawId).trim() : '';
    if (!partId) return;

    const cantidadRaw = Number(item?.quantity);
    const cantidad = Number.isFinite(cantidadRaw) ? Math.floor(cantidadRaw) : 1;
    if (cantidad <= 0) return;

    acumulado.set(partId, (acumulado.get(partId) || 0) + cantidad);
  });

  return Array.from(acumulado.entries()).map(([partId, quantity]) => ({
    partId,
    quantity,
  }));
};

/**
 * Obtiene el snapshot base definido en el catálogo para una intervención.
 * Usa `_partsRelations` si está presente (incluye cantidades de `part_intervention`)
 * y cae a `RepuestosIds` con cantidad 1 por ítem.
 */
export const obtenerRepuestosBaseIntervencion = (
  intervencion?: Intervencion | null,
): RepuestoAsignacionSnapshot[] => {
  if (!intervencion?.data) return [];

  const relaciones = (intervencion.data as Intervencion['data'] & {
    _partsRelations?: RelacionCatalogoLike[];
  })._partsRelations;

  if (Array.isArray(relaciones) && relaciones.length > 0) {
    return normalizarRepuestosSnapshot(relaciones);
  }

  return normalizarRepuestosSnapshot(
    (intervencion.data.RepuestosIds || []).map((partId) => ({
      partId,
      quantity: 1,
    })),
  );
};

/**
 * Compara dos snapshots de repuestos sin importar el orden de sus elementos.
 */
export const sonSnapshotsRepuestosIguales = (
  a: ReadonlyArray<RepuestoAsignacionSnapshot>,
  b: ReadonlyArray<RepuestoAsignacionSnapshot>,
): boolean => {
  const normA = normalizarRepuestosSnapshot(a);
  const normB = normalizarRepuestosSnapshot(b);

  if (normA.length !== normB.length) return false;

  const mapaB = new Map(normB.map((item) => [item.partId, item.quantity]));
  return normA.every((item) => mapaB.get(item.partId) === item.quantity);
};

/**
 * Evalúa si una asignación utiliza los repuestos estándar del catálogo de su intervención,
 * si fueron sustituidos/ajustados, o si se resolvió sin consumir repuestos de inventario.
 *
 * Distinción clave:
 * - Cuando en Presupuesto o al crear una adicional el admin desmarca "Incluir repuesto"
 *   (ej. repuesto provisto por el cliente), `repuestosSnapshot` conserva las piezas del
 *   catálogo y `incluyeRepuestosTaller` es `false` → NO se considera ajuste técnico de taller.
 * - Cuando en REPARAR el técnico resuelve sin usar repuesto de stock, `repuestosSnapshot`
 *   queda vacío (`[]`) e `incluyeRepuestosTaller` en `false` → `sin_repuesto_stock`.
 */
export const evaluarAjusteRepuestosAsignacion = (
  asignacionData: Pick<
    AsignacionIntervencionData,
    'repuestosSnapshot' | 'incluyeRepuestosTaller' | 'PrecioPiezas'
  >,
  intervencion?: Intervencion | null,
): EvaluacionAjusteRepuestos => {
  const tieneSnapshot = Array.isArray(asignacionData.repuestosSnapshot);
  const repuestosCatalogo = obtenerRepuestosBaseIntervencion(intervencion);
  const snapshotNormalizado = tieneSnapshot
    ? normalizarRepuestosSnapshot(asignacionData.repuestosSnapshot)
    : repuestosCatalogo;
  const incluyeTaller =
    asignacionData.incluyeRepuestosTaller ?? ((asignacionData.PrecioPiezas || 0) > 0);

  if (!intervencion) {
    return {
      tipoAjuste: 'original',
      esAjustado: false,
      repuestosEfectivos: incluyeTaller ? snapshotNormalizado : [],
      repuestosCatalogo: [],
    };
  }

  if (!incluyeTaller) {
    if (tieneSnapshot && snapshotNormalizado.length === 0 && repuestosCatalogo.length > 0) {
      return {
        tipoAjuste: 'sin_repuesto_stock',
        esAjustado: true,
        repuestosEfectivos: [],
        repuestosCatalogo,
      };
    }

    return {
      tipoAjuste: 'original',
      esAjustado: false,
      repuestosEfectivos: [],
      repuestosCatalogo,
    };
  }

  if (!tieneSnapshot || sonSnapshotsRepuestosIguales(snapshotNormalizado, repuestosCatalogo)) {
    return {
      tipoAjuste: 'original',
      esAjustado: false,
      repuestosEfectivos: snapshotNormalizado,
      repuestosCatalogo,
    };
  }

  if (snapshotNormalizado.length === 0 && repuestosCatalogo.length > 0) {
    return {
      tipoAjuste: 'sin_repuesto_stock',
      esAjustado: true,
      repuestosEfectivos: [],
      repuestosCatalogo,
    };
  }

  return {
    tipoAjuste: 'sustituido',
    esAjustado: snapshotNormalizado.length > 0,
    repuestosEfectivos: snapshotNormalizado,
    repuestosCatalogo,
  };
};

/**
 * Formatea en español natural una lista de repuestos con sus cantidades.
 */
export const formatearListaRepuestos = (
  items: ReadonlyArray<RepuestoAsignacionSnapshot>,
  obtenerNombreRepuesto: (partId: string) => string,
): string => {
  const normalizados = normalizarRepuestosSnapshot(items);
  const etiquetas = normalizados.map(({ partId, quantity }) => {
    const nombre = (obtenerNombreRepuesto(partId) || partId).trim();
    return quantity > 1 ? `${nombre} (x${quantity})` : nombre;
  });

  if (etiquetas.length === 0) return '';
  if (etiquetas.length === 1) return etiquetas[0];
  if (etiquetas.length === 2) return `${etiquetas[0]} y ${etiquetas[1]}`;
  return `${etiquetas.slice(0, -1).join(', ')} y ${etiquetas[etiquetas.length - 1]}`;
};

/**
 * Construye la línea aclaratoria automática para `DescripcionTecRep`,
 * o `null` cuando la asignación usa sus repuestos originales de catálogo.
 */
export const generarLineaInformeAjusteRepuestos = (
  nombreIntervencion: string,
  evaluacion: EvaluacionAjusteRepuestos,
  obtenerNombreRepuesto: (partId: string) => string,
): string | null => {
  if (!evaluacion.esAjustado) return null;

  const nombreLimpio = (nombreIntervencion || 'Intervención').trim() || 'Intervención';

  if (evaluacion.tipoAjuste === 'sin_repuesto_stock') {
    return `- ${nombreLimpio}: resuelto reparando el componente sin reemplazo completo de pieza.`;
  }

  if (evaluacion.tipoAjuste === 'sustituido') {
    const detalleRepuestos = formatearListaRepuestos(
      evaluacion.repuestosEfectivos,
      obtenerNombreRepuesto,
    );
    if (!detalleRepuestos) return null;
    return `- ${nombreLimpio}: resuelto utilizando ${detalleRepuestos}.`;
  }

  return null;
};

/**
 * Inserta, actualiza o quita de manera idempotente la línea aclaratoria automática
 * de una asignación dentro del informe técnico (`DescripcionTecRep`), preservando
 * intacto el resto del texto libre del técnico.
 */
export const sincronizarNotaAjusteEnInforme = (
  textoActual: string | undefined | null,
  params: {
    nombreIntervencion: string;
    lineaAnterior: string | null;
    lineaNueva: string | null;
  },
): string => {
  const base = (textoActual ?? '').replace(/\r\n/g, '\n');
  const { nombreIntervencion, lineaAnterior, lineaNueva } = params;

  if (lineaAnterior === lineaNueva) {
    if (lineaNueva === null) return base;
    const existe = base
      .split('\n')
      .some((linea) => linea.trim() === lineaNueva.trim());
    if (existe) return base;
  }

  const nombreLimpio = (nombreIntervencion || 'Intervención').trim() || 'Intervención';
  const prefijoAuto = `- ${nombreLimpio}: resuelto `;
  const lineas = base.length > 0 ? base.split('\n') : [];

  let indiceExistente = -1;
  if (lineaAnterior) {
    indiceExistente = lineas.findIndex(
      (linea) => linea.trim() === lineaAnterior.trim(),
    );
  }
  if (indiceExistente === -1 && lineaAnterior) {
    indiceExistente = lineas.findIndex((linea) =>
      linea.trim().startsWith(prefijoAuto),
    );
  }

  if (lineaNueva !== null) {
    if (indiceExistente !== -1) {
      lineas[indiceExistente] = lineaNueva;
      return lineas.join('\n');
    }

    if (lineas.some((linea) => linea.trim() === lineaNueva.trim())) {
      return base;
    }

    if (base.trim().length === 0) {
      return lineaNueva;
    }

    return base.endsWith('\n') ? `${base}${lineaNueva}` : `${base}\n${lineaNueva}`;
  }

  // lineaNueva === null → restaurado al original: quitar únicamente la línea automática asociada
  if (indiceExistente === -1) {
    return base;
  }

  lineas.splice(indiceExistente, 1);
  const resultado = lineas.join('\n');
  return resultado.trim().length === 0 ? '' : resultado;
};
