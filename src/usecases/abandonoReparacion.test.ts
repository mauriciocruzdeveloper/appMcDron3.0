import { ReparacionType } from "../types/reparacion";
import {
  obtenerFechaHabilitacionAbandono,
  puedeCancelarAvisoAbandono,
  puedeConfirmarAbandono,
  puedeEnviarAvisoAbandono,
} from "./abandonoReparacion";

const crearReparacion = (
  estado: string,
  fechaRecepcion: number | null,
  fechaAviso: number | null = null
): ReparacionType => ({
  id: "rep-1",
  data: {
    EstadoRep: estado,
    PrioridadRep: 1,
    FeConRep: null,
    FeRecRep: fechaRecepcion,
    FechaAvisoAbandono: fechaAviso,
    ModeloDroneNameRep: "DJI Mini",
    DescripcionUsuRep: "",
    UsuarioRep: "user-1",
  },
});

describe("abandonoReparacion", () => {
  const fechaRecepcion = new Date(2026, 0, 31, 10, 0).getTime();
  const fechaTresMeses = new Date(2026, 3, 30, 10, 0).getTime();

  it("habilita el aviso al cumplir tres meses calendario", () => {
    const reparacion = crearReparacion("Presupuestado", fechaRecepcion);

    expect(puedeEnviarAvisoAbandono(reparacion, fechaTresMeses - 1)).toBe(false);
    expect(puedeEnviarAvisoAbandono(reparacion, fechaTresMeses)).toBe(true);
  });

  it("no habilita el aviso sin fecha de recepción ni en un estado excluido", () => {
    expect(puedeEnviarAvisoAbandono(crearReparacion("Presupuestado", null), fechaTresMeses))
      .toBe(false);
    expect(puedeEnviarAvisoAbandono(crearReparacion("Recibido", fechaRecepcion), fechaTresMeses))
      .toBe(false);
  });

  it("permite enviar el aviso desde Cobrado", () => {
    expect(puedeEnviarAvisoAbandono(crearReparacion("Cobrado", fechaRecepcion), fechaTresMeses))
      .toBe(true);
  });

  it("no ofrece un segundo aviso mientras existe uno registrado", () => {
    const reparacion = crearReparacion("Presupuestado", fechaRecepcion, fechaTresMeses);

    expect(puedeEnviarAvisoAbandono(reparacion, fechaTresMeses)).toBe(false);
    expect(puedeCancelarAvisoAbandono(reparacion)).toBe(true);
  });

  it("habilita el abandono exactamente siete días después del aviso", () => {
    const reparacion = crearReparacion("Presupuestado", fechaRecepcion, fechaTresMeses);
    const fechaHabilitacion = obtenerFechaHabilitacionAbandono(fechaTresMeses);

    expect(puedeConfirmarAbandono(reparacion, fechaHabilitacion - 1)).toBe(false);
    expect(puedeConfirmarAbandono(reparacion, fechaHabilitacion)).toBe(true);
  });

  it("mantiene Abandonado como estado irreversible", () => {
    const reparacion = crearReparacion("Abandonado", fechaRecepcion, fechaTresMeses);

    expect(puedeConfirmarAbandono(reparacion, Date.now())).toBe(false);
    expect(puedeCancelarAvisoAbandono(reparacion)).toBe(false);
  });
});