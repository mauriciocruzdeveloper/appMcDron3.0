import { Drones } from '../types/drone';
import { ModeloDrone, ModelosDrone } from '../types/modeloDrone';
import { ReparacionType } from '../types/reparacion';

const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;
export const VIDA_MEDIA_REPARACION_DIAS = 180;

export interface EstadisticaModeloDrone {
  modeloId: string;
  nombreModelo: string;
  fabricante: string;
  familia: string;
  cantidadReparaciones: number;
  puntaje: number;
  fechaUltimaReparacion: number;
}

export interface RankingModelosDrone {
  modelos: EstadisticaModeloDrone[];
  reparacionesOmitidas: number;
}

export type TipoCajaModeloDrone = 'exclusiva' | 'compartida';

export interface PropuestaCajaModeloDrone {
  numero: number;
  tipo: TipoCajaModeloDrone;
  modelos: EstadisticaModeloDrone[];
  familias: string[];
  cantidadReparaciones: number;
  puntaje: number;
}

const normalizarTexto = (valor: string): string => valor
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const obtenerFechaValida = (valor: number | string | null | undefined): number | null => {
  if (!valor) return null;
  const fecha = new Date(valor).getTime();
  return Number.isFinite(fecha) ? fecha : null;
};

export const obtenerFamiliaModeloDrone = (modelo: ModeloDrone): string => {
  const fabricante = modelo.data.Fabricante.trim() || 'Sin fabricante';
  const tokensModelo = modelo.data.NombreModelo.trim().split(/\s+/).filter(Boolean);
  const tokensFabricante = new Set(normalizarTexto(fabricante).split(' ').filter(Boolean));
  const tokensSinFabricante = [...tokensModelo];

  while (
    tokensSinFabricante.length > 1
    && tokensFabricante.has(normalizarTexto(tokensSinFabricante[0]))
  ) {
    tokensSinFabricante.shift();
  }

  const variantes = new Set([
    'advanced',
    'classic',
    'cine',
    'combo',
    'enterprise',
    'fly',
    'more',
    'plus',
    'pro',
    'professional',
    's',
    'se',
    'standard',
    'zoom',
  ]);
  const tokensFamilia: string[] = [];
  let encontroGeneracion = false;

  for (const token of tokensSinFabricante) {
    const tokenNormalizado = normalizarTexto(token);
    const generacion = tokenNormalizado.match(/^(\d+)/);

    if (generacion) {
      tokensFamilia.push(generacion[1]);
      encontroGeneracion = true;
      break;
    }

    if (variantes.has(tokenNormalizado) && tokensFamilia.length > 0) break;
    if (tokenNormalizado) tokensFamilia.push(token.replace(/[^a-zA-Z0-9-]/g, ''));
  }

  const familia = (encontroGeneracion ? tokensFamilia : tokensFamilia.slice(0, 2)).join(' ')
    || tokensModelo[0]
    || 'Sin familia';
  return `${fabricante} / ${familia}`;
};

export const calcularRankingModelosDrone = (
  reparaciones: ReparacionType[],
  drones: Drones,
  modelosDrone: ModelosDrone,
  fechaReferencia: number = Date.now(),
): RankingModelosDrone => {
  const estadisticas = new Map<string, EstadisticaModeloDrone>();
  let reparacionesOmitidas = 0;

  reparaciones.forEach(reparacion => {
    const fechaFinalizacion = obtenerFechaValida(reparacion.data.FeFinRep);
    if (!fechaFinalizacion) return;

    const drone = reparacion.data.DroneId ? drones[reparacion.data.DroneId] : undefined;
    const modelo = drone?.data.ModeloDroneId
      ? modelosDrone[drone.data.ModeloDroneId]
      : undefined;

    if (!modelo) {
      reparacionesOmitidas += 1;
      return;
    }

    const diasDesdeFinalizacion = Math.max(
      0,
      (fechaReferencia - fechaFinalizacion) / MILISEGUNDOS_POR_DIA,
    );
    const peso = Math.pow(2, -diasDesdeFinalizacion / VIDA_MEDIA_REPARACION_DIAS);
    const estadisticaActual = estadisticas.get(modelo.id);

    if (estadisticaActual) {
      estadisticaActual.cantidadReparaciones += 1;
      estadisticaActual.puntaje += peso;
      estadisticaActual.fechaUltimaReparacion = Math.max(
        estadisticaActual.fechaUltimaReparacion,
        fechaFinalizacion,
      );
      return;
    }

    estadisticas.set(modelo.id, {
      modeloId: modelo.id,
      nombreModelo: modelo.data.NombreModelo,
      fabricante: modelo.data.Fabricante,
      familia: obtenerFamiliaModeloDrone(modelo),
      cantidadReparaciones: 1,
      puntaje: peso,
      fechaUltimaReparacion: fechaFinalizacion,
    });
  });

  const modelos = Array.from(estadisticas.values()).sort((modeloA, modeloB) => (
    modeloB.puntaje - modeloA.puntaje
    || modeloB.fechaUltimaReparacion - modeloA.fechaUltimaReparacion
    || modeloA.fabricante.localeCompare(modeloB.fabricante, 'es')
    || modeloA.nombreModelo.localeCompare(modeloB.nombreModelo, 'es')
  ));

  return { modelos, reparacionesOmitidas };
};

const completarResumenCaja = (
  caja: Omit<PropuestaCajaModeloDrone, 'familias' | 'cantidadReparaciones' | 'puntaje'>,
): PropuestaCajaModeloDrone => ({
  ...caja,
  familias: Array.from(new Set(caja.modelos.map(modelo => modelo.familia))),
  cantidadReparaciones: caja.modelos.reduce(
    (total, modelo) => total + modelo.cantidadReparaciones,
    0,
  ),
  puntaje: caja.modelos.reduce((total, modelo) => total + modelo.puntaje, 0),
});

const distribuirModelosCompartidos = (
  modelos: EstadisticaModeloDrone[],
  cantidadCajas: number,
  numeroInicial: number,
): PropuestaCajaModeloDrone[] => {
  const cajas = Array.from({ length: cantidadCajas }, (_, indice) => ({
    numero: numeroInicial + indice,
    tipo: 'compartida' as const,
    modelos: [] as EstadisticaModeloDrone[],
  }));
  const gruposFamilia = new Map<string, EstadisticaModeloDrone[]>();

  modelos.forEach(modelo => {
    const grupo = gruposFamilia.get(modelo.familia) || [];
    grupo.push(modelo);
    gruposFamilia.set(modelo.familia, grupo);
  });

  const gruposOrdenados = Array.from(gruposFamilia.values()).sort((grupoA, grupoB) => (
    grupoB.reduce((total, modelo) => total + modelo.puntaje, 0)
    - grupoA.reduce((total, modelo) => total + modelo.puntaje, 0)
  ));
  const modelosEnRondas: EstadisticaModeloDrone[] = [];
  const mayorGrupo = Math.max(...gruposOrdenados.map(grupo => grupo.length));

  for (let indice = 0; indice < mayorGrupo; indice += 1) {
    gruposOrdenados.forEach(grupo => {
      if (grupo[indice]) modelosEnRondas.push(grupo[indice]);
    });
  }

  modelosEnRondas.forEach(modelo => {
    const cajaVacia = cajas.find(caja => caja.modelos.length === 0);
    const cajasMismaFamilia = cajas.filter(caja => (
      caja.modelos.some(modeloAsignado => modeloAsignado.familia === modelo.familia)
    ));
    const candidatas = cajaVacia
      ? [cajaVacia]
      : cajasMismaFamilia.length > 0
        ? cajasMismaFamilia
        : cajas;
    const cajaDestino = [...candidatas].sort((cajaA, cajaB) => (
      cajaA.modelos.reduce((total, item) => total + item.puntaje, 0)
      - cajaB.modelos.reduce((total, item) => total + item.puntaje, 0)
      || cajaA.numero - cajaB.numero
    ))[0];

    cajaDestino.modelos.push(modelo);
  });

  return cajas.map(completarResumenCaja);
};

export const planificarCajasModelosDrone = (
  modelos: EstadisticaModeloDrone[],
  cantidadCajas: number,
): PropuestaCajaModeloDrone[] => {
  if (!Number.isInteger(cantidadCajas) || cantidadCajas < 1 || modelos.length === 0) {
    return [];
  }

  if (cantidadCajas >= modelos.length) {
    const cajasPorModelo = modelos.map(() => 1);
    const cajasAdicionales = cantidadCajas - modelos.length;
    const puntajeTotal = modelos.reduce((total, modelo) => total + modelo.puntaje, 0);
    const cuotasAdicionales = modelos.map(modelo => (
      puntajeTotal > 0 ? (modelo.puntaje / puntajeTotal) * cajasAdicionales : 0
    ));

    cuotasAdicionales.forEach((cuota, indice) => {
      cajasPorModelo[indice] += Math.floor(cuota);
    });

    const cajasPendientes = cantidadCajas
      - cajasPorModelo.reduce((total, cantidad) => total + cantidad, 0);
    const indicesPorResto = cuotasAdicionales
      .map((cuota, indice) => ({ indice, resto: cuota - Math.floor(cuota) }))
      .sort((itemA, itemB) => (
        itemB.resto - itemA.resto
        || modelos[itemB.indice].puntaje - modelos[itemA.indice].puntaje
      ));

    for (let indice = 0; indice < cajasPendientes; indice += 1) {
      cajasPorModelo[indicesPorResto[indice % indicesPorResto.length].indice] += 1;
    }

    let numeroCaja = 1;
    return modelos.flatMap((modelo, indice) => Array.from(
      { length: cajasPorModelo[indice] },
      () => completarResumenCaja({
        numero: numeroCaja++,
        tipo: 'exclusiva',
        modelos: [modelo],
      }),
    ));
  }

  if (cantidadCajas === 1) {
    return [completarResumenCaja({ numero: 1, tipo: 'compartida', modelos: [...modelos] })];
  }

  const puntajeTotal = modelos.reduce((total, modelo) => total + modelo.puntaje, 0);
  const cargaPromedio = puntajeTotal / cantidadCajas;
  const modelosExclusivos: EstadisticaModeloDrone[] = [];

  for (const modelo of modelos) {
    const cajasRestantes = cantidadCajas - modelosExclusivos.length;
    const modelosRestantes = modelos.length - modelosExclusivos.length;
    if (
      modelo.puntaje >= cargaPromedio
      && cajasRestantes > 1
      && modelosRestantes > 1
    ) {
      modelosExclusivos.push(modelo);
    } else {
      break;
    }
  }

  const idsExclusivos = new Set(modelosExclusivos.map(modelo => modelo.modeloId));
  const modelosCompartidos = modelos.filter(modelo => !idsExclusivos.has(modelo.modeloId));
  const cajasExclusivas = modelosExclusivos.map((modelo, indice) => completarResumenCaja({
    numero: indice + 1,
    tipo: 'exclusiva',
    modelos: [modelo],
  }));
  const cajasCompartidas = distribuirModelosCompartidos(
    modelosCompartidos,
    cantidadCajas - cajasExclusivas.length,
    cajasExclusivas.length + 1,
  );

  return [...cajasExclusivas, ...cajasCompartidas];
};
