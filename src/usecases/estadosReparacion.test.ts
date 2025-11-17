/**
 * Tests unitarios para lógica de transiciones de estados de reparación
 * @file estadosReparacion.test.ts
 */

import {
  EstadoReparacion,
  transicionesPermitidas,
  esTransicionValida,
  getEstadosPermitidos,
  esEstadoTerminal,
  esEstadoLegacy,
  requiereObservaciones,
  getMensajeTransicion
} from './estadosReparacion';

describe('estadosReparacion - Transiciones de Estado', () => {
  
  // ============================================================================
  // TESTS: Estado "Repuestos" - Transiciones Bidireccionales
  // ============================================================================
  
  describe('Estado Repuestos - Transiciones', () => {
    test('permite transición de Aceptado a Repuestos', () => {
      expect(esTransicionValida('Aceptado', 'Repuestos')).toBe(true);
    });

    test('permite transición de Repuestos a Aceptado', () => {
      expect(esTransicionValida('Repuestos', 'Aceptado')).toBe(true);
    });

    test('permite transición de Repuestos a Cancelado', () => {
      expect(esTransicionValida('Repuestos', 'Cancelado')).toBe(true);
    });

    test('permite transición de Repuestos a Abandonado', () => {
      expect(esTransicionValida('Repuestos', 'Abandonado')).toBe(true);
    });

    test('NO permite transición directa de Repuestos a Reparado', () => {
      expect(esTransicionValida('Repuestos', 'Reparado')).toBe(false);
    });

    test('NO permite transición de Repuestos a Presupuestado', () => {
      expect(esTransicionValida('Repuestos', 'Presupuestado')).toBe(false);
    });

    test('NO permite transición de Repuestos a Diagnosticado', () => {
      expect(esTransicionValida('Repuestos', 'Diagnosticado')).toBe(false);
    });
  });

  describe('Estado Aceptado - Incluye Repuestos', () => {
    test('getEstadosPermitidos desde Aceptado incluye Repuestos', () => {
      const permitidos = getEstadosPermitidos('Aceptado');
      expect(permitidos).toContain('Repuestos');
    });

    test('permite todas las transiciones desde Aceptado', () => {
      const estadosEsperados: EstadoReparacion[] = [
        'Repuestos',
        'Reparado',
        'Rechazado',
        'Cancelado',
        'Abandonado'
      ];
      
      estadosEsperados.forEach(estado => {
        expect(esTransicionValida('Aceptado', estado)).toBe(true);
      });
    });
  });

  // ============================================================================
  // TESTS: Validación de Transiciones Generales
  // ============================================================================
  
  describe('Validación de Transiciones', () => {
    test('transición válida desde Recibido a Revisado', () => {
      expect(esTransicionValida('Recibido', 'Revisado')).toBe(true);
    });

    test('transición válida desde Revisado a Presupuestado', () => {
      expect(esTransicionValida('Revisado', 'Presupuestado')).toBe(true);
    });

    test('transición válida desde Presupuestado a Aceptado', () => {
      expect(esTransicionValida('Presupuestado', 'Aceptado')).toBe(true);
    });

    test('transición inválida desde Recibido a Reparado', () => {
      expect(esTransicionValida('Recibido', 'Reparado')).toBe(false);
    });

    test('transición con estados no definidos retorna false', () => {
      expect(esTransicionValida('EstadoInexistente' as EstadoReparacion, 'Recibido')).toBe(false);
    });

    test('transición desde estado sin transiciones retorna false', () => {
      expect(esTransicionValida('Entregado', 'Recibido')).toBe(false);
    });
  });

  // ============================================================================
  // TESTS: Estados Terminales
  // ============================================================================
  
  describe('Estados Terminales', () => {
    test('Finalizado es estado terminal', () => {
      expect(esEstadoTerminal('Finalizado')).toBe(true);
      expect(transicionesPermitidas['Finalizado']).toEqual([]);
    });

    test('Abandonado es estado terminal', () => {
      expect(esEstadoTerminal('Abandonado')).toBe(true);
      expect(transicionesPermitidas['Abandonado']).toEqual([]);
    });

    test('Cancelado es estado terminal', () => {
      expect(esEstadoTerminal('Cancelado')).toBe(true);
      expect(transicionesPermitidas['Cancelado']).toEqual([]);
    });

    test('Repuestos NO es estado terminal', () => {
      expect(esEstadoTerminal('Repuestos')).toBe(false);
    });

    test('Aceptado NO es estado terminal', () => {
      expect(esEstadoTerminal('Aceptado')).toBe(false);
    });
  });

  // ============================================================================
  // TESTS: Estados Legacy
  // ============================================================================
  
  describe('Estados Legacy', () => {
    test('Indefinido es estado legacy', () => {
      expect(esEstadoLegacy('Indefinido')).toBe(true);
    });

    test('Entregado es estado legacy', () => {
      expect(esEstadoLegacy('Entregado')).toBe(true);
    });

    test('Repuestos NO es estado legacy (fue actualizado)', () => {
      expect(esEstadoLegacy('Repuestos')).toBe(false);
    });

    test('Recibido NO es estado legacy', () => {
      expect(esEstadoLegacy('Recibido')).toBe(false);
    });
  });

  // ============================================================================
  // TESTS: Requerimiento de Observaciones
  // ============================================================================
  
  describe('Requerimiento de Observaciones', () => {
    test('Repuestos puede requerir observaciones (opcional pero recomendado)', () => {
      expect(requiereObservaciones('Repuestos')).toBe(true);
    });

    test('Rechazado requiere observaciones', () => {
      expect(requiereObservaciones('Rechazado')).toBe(true);
    });

    test('Cancelado requiere observaciones', () => {
      expect(requiereObservaciones('Cancelado')).toBe(true);
    });

    test('Abandonado requiere observaciones', () => {
      expect(requiereObservaciones('Abandonado')).toBe(true);
    });

    test('Reparado NO requiere observaciones', () => {
      expect(requiereObservaciones('Reparado')).toBe(false);
    });
  });

  // ============================================================================
  // TESTS: Mensajes de Transición
  // ============================================================================
  
  describe('Mensajes de Transición', () => {
    test('mensaje correcto para transición Aceptado → Repuestos contiene advertencia', () => {
      const mensaje = getMensajeTransicion('Aceptado', 'Repuestos');
      expect(mensaje).toContain('pausada');
      expect(mensaje).toContain('repuestos');
      expect(mensaje).toBeTruthy();
    });

    test('mensaje correcto para transición Repuestos → Aceptado contiene confirmación', () => {
      const mensaje = getMensajeTransicion('Repuestos', 'Aceptado');
      expect(mensaje).toContain('llegado');
      expect(mensaje).toContain('retomará');
      expect(mensaje).toBeTruthy();
    });

    test('mensaje para transición válida incluye estado destino', () => {
      const mensaje = getMensajeTransicion('Presupuestado', 'Aceptado');
      expect(mensaje).toContain('Aceptado');
    });

    test('mensaje para transición a estado terminal incluye advertencia', () => {
      const mensaje = getMensajeTransicion('Aceptado', 'Cancelado');
      expect(mensaje).toContain('Cancelado');
    });
  });

  // ============================================================================
  // TESTS: Flujo Completo con Repuestos
  // ============================================================================
  
  describe('Flujo Completo con Estado Repuestos', () => {
    test('flujo completo: Recibido → ... → Repuestos → Aceptado → Reparado', () => {
      // 1. Recibido → Revisado
      expect(esTransicionValida('Recibido', 'Revisado')).toBe(true);
      
      // 2. Revisado → Presupuestado
      expect(esTransicionValida('Revisado', 'Presupuestado')).toBe(true);
      
      // 3. Presupuestado → Aceptado
      expect(esTransicionValida('Presupuestado', 'Aceptado')).toBe(true);
      
      // 4. Aceptado → Repuestos (necesita repuestos)
      expect(esTransicionValida('Aceptado', 'Repuestos')).toBe(true);
      
      // 5. Repuestos → Aceptado (llegaron repuestos)
      expect(esTransicionValida('Repuestos', 'Aceptado')).toBe(true);
      
      // 6. Aceptado → Reparado
      expect(esTransicionValida('Aceptado', 'Reparado')).toBe(true);
      
      // 7. Reparado → Finalizado
      expect(esTransicionValida('Reparado', 'Cobrado')).toBe(true);
    });

    test('flujo con cancelación desde Repuestos', () => {
      expect(esTransicionValida('Aceptado', 'Repuestos')).toBe(true);
      expect(esTransicionValida('Repuestos', 'Cancelado')).toBe(true);
      expect(esEstadoTerminal('Cancelado')).toBe(true);
    });

    test('NO puede saltar de Repuestos directamente a Reparado', () => {
      expect(esTransicionValida('Repuestos', 'Reparado')).toBe(false);
    });
  });

  // ============================================================================
  // TESTS: Edge Cases
  // ============================================================================
  
  describe('Edge Cases', () => {
    test('transición desde mismo estado a mismo estado', () => {
      expect(esTransicionValida('Repuestos', 'Repuestos')).toBe(false);
    });

    test('getEstadosPermitidos con estado inexistente retorna array vacío', () => {
      const permitidos = getEstadosPermitidos('EstadoInexistente' as EstadoReparacion);
      expect(permitidos).toEqual([]);
    });

    test('todas las claves de transicionesPermitidas son EstadoReparacion válidos', () => {
      const claves = Object.keys(transicionesPermitidas) as EstadoReparacion[];
      claves.forEach(clave => {
        expect(typeof clave).toBe('string');
        expect(clave.length).toBeGreaterThan(0);
      });
    });

    test('todos los valores de transicionesPermitidas son arrays', () => {
      const valores = Object.values(transicionesPermitidas);
      valores.forEach(valor => {
        expect(Array.isArray(valor)).toBe(true);
      });
    });
  });

  // ============================================================================
  // TESTS: Cobertura de Todos los Estados
  // ============================================================================
  
  describe('Cobertura de Estados', () => {
    const todosLosEstados: EstadoReparacion[] = [
      'Consulta',
      'Respondido',
      'Transito',
      'Recibido',
      'Revisado',
      'Presupuestado',
      'Aceptado',
      'Repuestos',
      'Rechazado',
      'Reparado',
      'Diagnosticado',
      'Cobrado',
      'Enviado',
      'Finalizado',
      'Abandonado',
      'Cancelado',
      'Reparar',
      'Entregado',
      'Venta',
      'Liquidación',
      'Indefinido'
    ];

    test('todos los estados están definidos en transicionesPermitidas', () => {
      todosLosEstados.forEach(estado => {
        expect(transicionesPermitidas).toHaveProperty(estado);
      });
    });

    test('cada estado no-terminal tiene al menos una transición', () => {
      todosLosEstados
        .filter(estado => !esEstadoTerminal(estado))
        .forEach(estado => {
          const permitidos = getEstadosPermitidos(estado);
          expect(permitidos.length).toBeGreaterThan(0);
        });
    });

    test('cada estado terminal no tiene transiciones', () => {
      todosLosEstados
        .filter(estado => esEstadoTerminal(estado))
        .forEach(estado => {
          const permitidos = getEstadosPermitidos(estado);
          expect(permitidos.length).toBe(0);
        });
    });
  });
});
