import { Drones } from '../types/drone';
import { ModelosDrone } from '../types/modeloDrone';
import { ReparacionType } from '../types/reparacion';
import {
  calcularRankingModelosDrone,
  EstadisticaModeloDrone,
  obtenerFamiliaModeloDrone,
  planificarCajasModelosDrone,
} from './estadisticasModelosDrone';

const DIA = 24 * 60 * 60 * 1000;
const HOY = Date.UTC(2026, 7, 25);

const modelos: ModelosDrone = {
  mini3: {
    id: 'mini3',
    data: {
      NombreModelo: 'DJI Mini 3 Pro',
      Fabricante: 'DJI',
      DescripcionModelo: '',
      PrecioReferencia: 0,
      code: 'MINI3',
    },
  },
  mavic3: {
    id: 'mavic3',
    data: {
      NombreModelo: 'Mavic 3',
      Fabricante: 'DJI',
      DescripcionModelo: '',
      PrecioReferencia: 0,
      code: 'MAVIC3',
    },
  },
  evoNano: {
    id: 'evoNano',
    data: {
      NombreModelo: 'EVO Nano+',
      Fabricante: 'Autel',
      DescripcionModelo: '',
      PrecioReferencia: 0,
      code: 'EVO-NANO',
    },
  },
  phantom3Standard: {
    id: 'phantom3Standard',
    data: {
      NombreModelo: 'Phantom 3 Standard',
      Fabricante: 'DJI',
      DescripcionModelo: '',
      PrecioReferencia: 0,
      code: 'P3-STANDARD',
    },
  },
  phantom3Pro: {
    id: 'phantom3Pro',
    data: {
      NombreModelo: 'Phantom 3 Pro',
      Fabricante: 'DJI',
      DescripcionModelo: '',
      PrecioReferencia: 0,
      code: 'P3-PRO',
    },
  },
  phantom4Pro: {
    id: 'phantom4Pro',
    data: {
      NombreModelo: 'Phantom 4 Pro',
      Fabricante: 'DJI',
      DescripcionModelo: '',
      PrecioReferencia: 0,
      code: 'P4-PRO',
    },
  },
  air3: {
    id: 'air3',
    data: {
      NombreModelo: 'Air 3',
      Fabricante: 'DJI',
      DescripcionModelo: '',
      PrecioReferencia: 0,
      code: 'AIR3',
    },
  },
  air3s: {
    id: 'air3s',
    data: {
      NombreModelo: 'Air 3S',
      Fabricante: 'DJI',
      DescripcionModelo: '',
      PrecioReferencia: 0,
      code: 'AIR3S',
    },
  },
};

const drones: Drones = Object.keys(modelos).reduce((resultado, modeloId) => ({
  ...resultado,
  [`drone-${modeloId}`]: {
    id: `drone-${modeloId}`,
    data: {
      ModeloDroneId: modeloId,
      Propietario: 'usuario-1',
      Nombre: modeloId,
      NumeroSerie: modeloId,
    },
  },
}), {} as Drones);

const crearReparacion = (
  id: string,
  modeloId: string,
  fechaFinalizacion: number | null,
): ReparacionType => ({
  id,
  data: {
    EstadoRep: 'Finalizado',
    PrioridadRep: 1,
    FeConRep: HOY,
    FeFinRep: fechaFinalizacion,
    ModeloDroneNameRep: modelos[modeloId]?.data.NombreModelo || 'Desconocido',
    DescripcionUsuRep: '',
    UsuarioRep: 'usuario-1',
    DroneId: `drone-${modeloId}`,
  },
});

const crearEstadistica = (
  modeloId: string,
  familia: string,
  puntaje: number,
): EstadisticaModeloDrone => ({
  modeloId,
  nombreModelo: modeloId,
  fabricante: familia.split(' / ')[0],
  familia,
  cantidadReparaciones: 1,
  puntaje,
  fechaUltimaReparacion: HOY,
});

describe('estadísticas temporales de modelos de drone', () => {
  it('pondera una reparación actual, de 180 días y de 360 días', () => {
    const resultado = calcularRankingModelosDrone([
      crearReparacion('rep-hoy', 'mini3', HOY),
      crearReparacion('rep-180', 'mavic3', HOY - 180 * DIA),
      crearReparacion('rep-360', 'evoNano', HOY - 360 * DIA),
    ], drones, modelos, HOY);

    expect(resultado.modelos.map(modelo => modelo.modeloId))
      .toEqual(['mini3', 'mavic3', 'evoNano']);
    expect(resultado.modelos[0].puntaje).toBeCloseTo(1);
    expect(resultado.modelos[1].puntaje).toBeCloseTo(0.5);
    expect(resultado.modelos[2].puntaje).toBeCloseTo(0.25);
  });

  it('acumula reparaciones y omite fechas o relaciones inválidas', () => {
    const resultado = calcularRankingModelosDrone([
      crearReparacion('rep-1', 'mini3', HOY),
      crearReparacion('rep-2', 'mini3', HOY - 180 * DIA),
      crearReparacion('sin-fecha', 'mavic3', null),
      crearReparacion('sin-modelo', 'inexistente', HOY),
    ], drones, modelos, HOY);

    expect(resultado.modelos).toHaveLength(1);
    expect(resultado.modelos[0].cantidadReparaciones).toBe(2);
    expect(resultado.modelos[0].puntaje).toBeCloseTo(1.5);
    expect(resultado.reparacionesOmitidas).toBe(1);
  });

  it('infiere la familia por serie y generación, sin confundir variantes', () => {
    expect(obtenerFamiliaModeloDrone(modelos.mini3)).toBe('DJI / Mini 3');
    expect(obtenerFamiliaModeloDrone(modelos.mavic3)).toBe('DJI / Mavic 3');
    expect(obtenerFamiliaModeloDrone(modelos.evoNano)).toBe('Autel / EVO Nano');
    expect(obtenerFamiliaModeloDrone(modelos.phantom3Standard)).toBe('DJI / Phantom 3');
    expect(obtenerFamiliaModeloDrone(modelos.phantom3Pro)).toBe('DJI / Phantom 3');
    expect(obtenerFamiliaModeloDrone(modelos.phantom4Pro)).toBe('DJI / Phantom 4');
    expect(obtenerFamiliaModeloDrone(modelos.air3)).toBe('DJI / Air 3');
    expect(obtenerFamiliaModeloDrone(modelos.air3s)).toBe('DJI / Air 3');
  });
});

describe('planificación de cajas por modelo', () => {
  const ranking = [
    crearEstadistica('mini3', 'DJI / Mini', 1),
    crearEstadistica('mavic3', 'DJI / Mavic', 0.5),
    crearEstadistica('evoNano', 'Autel / EVO', 0.25),
  ];

  it('agrupa todos los modelos cuando solo hay una caja', () => {
    const cajas = planificarCajasModelosDrone(ranking, 1);

    expect(cajas).toHaveLength(1);
    expect(cajas[0].tipo).toBe('compartida');
    expect(cajas[0].modelos).toHaveLength(3);
  });

  it('reserva una caja exclusiva al modelo que supera la carga promedio', () => {
    const cajas = planificarCajasModelosDrone(ranking, 2);

    expect(cajas).toHaveLength(2);
    expect(cajas[0].tipo).toBe('exclusiva');
    expect(cajas[0].modelos[0].modeloId).toBe('mini3');
    expect(cajas[1].modelos.map(modelo => modelo.modeloId))
      .toEqual(['mavic3', 'evoNano']);
  });

  it('asigna una caja exclusiva por modelo cuando alcanzan justo', () => {
    const cajas = planificarCajasModelosDrone(ranking, 3);

    expect(cajas).toHaveLength(3);
    expect(cajas.every(caja => caja.tipo === 'exclusiva')).toBe(true);
  });

  it('asigna las cajas sobrantes a modelos concretos según su demanda', () => {
    const cajas = planificarCajasModelosDrone(ranking, 5);

    expect(cajas).toHaveLength(5);
    expect(cajas.every(caja => caja.tipo === 'exclusiva')).toBe(true);
    expect(cajas.filter(caja => caja.modelos[0].modeloId === 'mini3')).toHaveLength(2);
    expect(cajas.filter(caja => caja.modelos[0].modeloId === 'mavic3')).toHaveLength(2);
    expect(cajas.filter(caja => caja.modelos[0].modeloId === 'evoNano')).toHaveLength(1);
  });

  it('aprovecha las 25 cajas y las distribuye proporcionalmente', () => {
    const cajas = planificarCajasModelosDrone(ranking, 25);

    expect(cajas).toHaveLength(25);
    expect(cajas.every(caja => caja.tipo === 'exclusiva')).toBe(true);
    expect(cajas.filter(caja => caja.modelos[0].modeloId === 'mini3')).toHaveLength(14);
    expect(cajas.filter(caja => caja.modelos[0].modeloId === 'mavic3')).toHaveLength(7);
    expect(cajas.filter(caja => caja.modelos[0].modeloId === 'evoNano')).toHaveLength(4);
  });

  it('mantiene juntas las familias cuando distribuye cajas compartidas', () => {
    const modelosCompartidos = [
      crearEstadistica('mini3', 'DJI / Mini', 1),
      crearEstadistica('mini2', 'DJI / Mini', 1),
      crearEstadistica('evoNano', 'Autel / EVO', 1),
      crearEstadistica('evoLite', 'Autel / EVO', 1),
    ];
    const cajas = planificarCajasModelosDrone(modelosCompartidos, 2);

    expect(cajas).toHaveLength(2);
    expect(cajas[0].familias).toHaveLength(1);
    expect(cajas[1].familias).toHaveLength(1);
    expect(cajas[0].familias).not.toEqual(cajas[1].familias);
  });

  it('agrupa Phantom 3 y Phantom 4 en cajas diferentes', () => {
    const modelosPhantom = [
      crearEstadistica('phantom3Standard', 'DJI / Phantom 3', 1),
      crearEstadistica('phantom3Pro', 'DJI / Phantom 3', 1),
      crearEstadistica('phantom4Standard', 'DJI / Phantom 4', 1),
      crearEstadistica('phantom4Pro', 'DJI / Phantom 4', 1),
    ];
    const cajas = planificarCajasModelosDrone(modelosPhantom, 2);

    expect(cajas.map(caja => caja.familias)).toEqual([
      ['DJI / Phantom 3'],
      ['DJI / Phantom 4'],
    ]);
    expect(cajas[0].modelos.map(modelo => modelo.modeloId)).toEqual([
      'phantom3Standard',
      'phantom3Pro',
    ]);
    expect(cajas[1].modelos.map(modelo => modelo.modeloId)).toEqual([
      'phantom4Standard',
      'phantom4Pro',
    ]);
  });

  it('no genera propuesta para una cantidad inválida', () => {
    expect(planificarCajasModelosDrone(ranking, 0)).toEqual([]);
    expect(planificarCajasModelosDrone(ranking, 1.5)).toEqual([]);
  });
});