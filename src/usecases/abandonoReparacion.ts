import { ReparacionType } from "../types/reparacion";
import { esTransicionValida, EstadoReparacion } from "./estadosReparacion";

const MESES_ANTES_DEL_AVISO = 3;
const DIAS_ANTES_DEL_ABANDONO = 7;

const agregarMesesCalendario = (timestamp: number, meses: number): number => {
  const fecha = new Date(timestamp);
  const diaOriginal = fecha.getDate();

  fecha.setDate(1);
  fecha.setMonth(fecha.getMonth() + meses);
  const ultimoDiaDestino = new Date(
    fecha.getFullYear(),
    fecha.getMonth() + 1,
    0
  ).getDate();
  fecha.setDate(Math.min(diaOriginal, ultimoDiaDestino));

  return fecha.getTime();
};

const agregarDiasCalendario = (timestamp: number, dias: number): number => {
  const fecha = new Date(timestamp);
  fecha.setDate(fecha.getDate() + dias);
  return fecha.getTime();
};

const estadoPermiteAbandono = (reparacion: ReparacionType): boolean =>
  esTransicionValida(
    reparacion.data.EstadoRep as EstadoReparacion,
    "Abandonado"
  );

export const puedeEnviarAvisoAbandono = (
  reparacion: ReparacionType,
  ahora = Date.now()
): boolean => {
  const fechaRecepcion = Number(reparacion.data.FeRecRep);

  return Boolean(
    estadoPermiteAbandono(reparacion) &&
    fechaRecepcion > 0 &&
    !reparacion.data.FechaAvisoAbandono &&
    ahora >= agregarMesesCalendario(fechaRecepcion, MESES_ANTES_DEL_AVISO)
  );
};

export const puedeCancelarAvisoAbandono = (
  reparacion: ReparacionType
): boolean =>
  reparacion.data.EstadoRep !== "Abandonado" &&
  Number(reparacion.data.FechaAvisoAbandono) > 0;

export const puedeConfirmarAbandono = (
  reparacion: ReparacionType,
  ahora = Date.now()
): boolean => {
  const fechaAviso = Number(reparacion.data.FechaAvisoAbandono);

  return Boolean(
    estadoPermiteAbandono(reparacion) &&
    fechaAviso > 0 &&
    ahora >= agregarDiasCalendario(fechaAviso, DIAS_ANTES_DEL_ABANDONO)
  );
};

export const obtenerFechaHabilitacionAbandono = (
  fechaAviso: number
): number => agregarDiasCalendario(fechaAviso, DIAS_ANTES_DEL_ABANDONO);