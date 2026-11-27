import { Intervencion } from '../types/intervencion';
import {
  evaluarAjusteRepuestosAsignacion,
  formatearListaRepuestos,
  generarLineaInformeAjusteRepuestos,
  normalizarRepuestosSnapshot,
  sincronizarNotaAjusteEnInforme,
} from './repuestosAsignacion';

const intervencionBrazo: Intervencion = {
  id: 'int-brazo',
  data: {
    NombreInt: 'Cambio de brazo delantero izquierdo',
    DescripcionInt: '',
    RepuestosIds: ['rep-brazo'],
    PrecioManoObra: 15000,
    DuracionEstimada: 45,
  },
};

const nombresCatalogo: Record<string, string> = {
  'rep-brazo': 'Brazo delantero izquierdo Mini 3',
  'rep-motor': 'Motor brushless Mini 3',
  'rep-helice': 'Par de hélices Mini 3',
};

const obtenerNombre = (id: string) => nombresCatalogo[id] || id;

describe('repuestosAsignacion usecases', () => {
  it('normaliza y consolida IDs repetidos filtrando entradas inválidas', () => {
    expect(
      normalizarRepuestosSnapshot([
        { partId: 'rep-motor', quantity: 1 },
        { partId: 'rep-motor', quantity: 2 },
        { partId: '', quantity: 3 },
        { partId: 'rep-brazo', quantity: 0 },
      ]),
    ).toEqual([{ partId: 'rep-motor', quantity: 3 }]);
  });

  it('distingue repuesto original, sustituto, sin repuesto de stock y exclusión comercial', () => {
    // Original de catálogo
    expect(
      evaluarAjusteRepuestosAsignacion(
        {
          repuestosSnapshot: [{ partId: 'rep-brazo', quantity: 1 }],
          incluyeRepuestosTaller: true,
          PrecioPiezas: 30000,
        },
        intervencionBrazo,
      ),
    ).toEqual(
      expect.objectContaining({
        tipoAjuste: 'original',
        esAjustado: false,
      }),
    );

    // Sustituido por motor
    expect(
      evaluarAjusteRepuestosAsignacion(
        {
          repuestosSnapshot: [{ partId: 'rep-motor', quantity: 1 }],
          incluyeRepuestosTaller: true,
          PrecioPiezas: 30000,
        },
        intervencionBrazo,
      ),
    ).toEqual(
      expect.objectContaining({
        tipoAjuste: 'sustituido',
        esAjustado: true,
        repuestosEfectivos: [{ partId: 'rep-motor', quantity: 1 }],
      }),
    );

    // Resuelto en taller sin usar repuestos del inventario
    expect(
      evaluarAjusteRepuestosAsignacion(
        {
          repuestosSnapshot: [],
          incluyeRepuestosTaller: false,
          PrecioPiezas: 30000,
        },
        intervencionBrazo,
      ),
    ).toEqual(
      expect.objectContaining({
        tipoAjuste: 'sin_repuesto_stock',
        esAjustado: true,
        repuestosEfectivos: [],
      }),
    );

    // Excluido en presupuesto porque el cliente trajo el repuesto (conserva snapshot)
    expect(
      evaluarAjusteRepuestosAsignacion(
        {
          repuestosSnapshot: [{ partId: 'rep-brazo', quantity: 1 }],
          incluyeRepuestosTaller: false,
          PrecioPiezas: 0,
        },
        intervencionBrazo,
      ),
    ).toEqual(
      expect.objectContaining({
        tipoAjuste: 'original',
        esAjustado: false,
        repuestosEfectivos: [],
      }),
    );
  });

  it('formatea listas de repuestos con cantidades en español natural', () => {
    expect(
      formatearListaRepuestos([{ partId: 'rep-motor', quantity: 1 }], obtenerNombre),
    ).toBe('Motor brushless Mini 3');

    expect(
      formatearListaRepuestos(
        [
          { partId: 'rep-motor', quantity: 1 },
          { partId: 'rep-helice', quantity: 2 },
        ],
        obtenerNombre,
      ),
    ).toBe('Motor brushless Mini 3 y Par de hélices Mini 3 (x2)');
  });

  it('agrega, actualiza y elimina de forma idempotente la aclaración en DescripcionTecRep', () => {
    const nombre = intervencionBrazo.data.NombreInt;

    const evalOriginal = evaluarAjusteRepuestosAsignacion(
      {
        repuestosSnapshot: [{ partId: 'rep-brazo', quantity: 1 }],
        incluyeRepuestosTaller: true,
      },
      intervencionBrazo,
    );
    const evalMotor = evaluarAjusteRepuestosAsignacion(
      {
        repuestosSnapshot: [{ partId: 'rep-motor', quantity: 1 }],
        incluyeRepuestosTaller: true,
      },
      intervencionBrazo,
    );
    const evalSinStock = evaluarAjusteRepuestosAsignacion(
      {
        repuestosSnapshot: [],
        incluyeRepuestosTaller: false,
      },
      intervencionBrazo,
    );

    const lineaOriginal = generarLineaInformeAjusteRepuestos(nombre, evalOriginal, obtenerNombre);
    const lineaMotor = generarLineaInformeAjusteRepuestos(nombre, evalMotor, obtenerNombre);
    const lineaSinStock = generarLineaInformeAjusteRepuestos(nombre, evalSinStock, obtenerNombre);

    const textoInicial = 'Se verificó telemetría y vuelo estacionario estable.';

    // 1. Original -> Sustituto: agrega línea respetando texto previo
    const trasSustituir = sincronizarNotaAjusteEnInforme(textoInicial, {
      nombreIntervencion: nombre,
      lineaAnterior: lineaOriginal,
      lineaNueva: lineaMotor,
    });
    expect(trasSustituir).toBe(
      `${textoInicial}\n- Cambio de brazo delantero izquierdo: resuelto utilizando Motor brushless Mini 3.`,
    );

    // 2. Sustituto -> Sin repuesto de stock: reemplaza en el lugar sin duplicar
    const trasSinStock = sincronizarNotaAjusteEnInforme(trasSustituir, {
      nombreIntervencion: nombre,
      lineaAnterior: lineaMotor,
      lineaNueva: lineaSinStock,
    });
    expect(trasSinStock).toBe(
      `${textoInicial}\n- Cambio de brazo delantero izquierdo: resuelto reparando el componente sin reemplazo completo de pieza.`,
    );

    // 3. Sin repuesto -> Restaurar original: elimina solo la línea automática
    const trasRestaurar = sincronizarNotaAjusteEnInforme(trasSinStock, {
      nombreIntervencion: nombre,
      lineaAnterior: lineaSinStock,
      lineaNueva: lineaOriginal,
    });
    expect(trasRestaurar).toBe(textoInicial);
  });

  it('no pisa la aclaración de otra asignación con el mismo nombre de intervención', () => {
    const texto = [
      '- Cambio de motor: resuelto utilizando Motor A.',
      '- Cambio de motor: resuelto utilizando Motor B.',
    ].join('\n');

    const actualizado = sincronizarNotaAjusteEnInforme(texto, {
      nombreIntervencion: 'Cambio de motor',
      lineaAnterior: '- Cambio de motor: resuelto utilizando Motor B.',
      lineaNueva: '- Cambio de motor: resuelto utilizando Motor C.',
    });

    expect(actualizado).toBe(
      [
        '- Cambio de motor: resuelto utilizando Motor A.',
        '- Cambio de motor: resuelto utilizando Motor C.',
      ].join('\n'),
    );
  });
});
