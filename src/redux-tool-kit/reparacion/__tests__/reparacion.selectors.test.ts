/**
 * reparacion.selectors.test.ts
 * 
 * Tests unitarios para los selectores de reparación.
 * Valida complejidad O(1), memoización y correctitud.
 * 
 * **Phase 3 - T3.7:** Testing
 * 
 * @module Redux/Reparacion/__tests__
 */

import {
    selectUsuarioDeReparacion,
    selectDroneDeReparacion,
    selectModeloDeReparacion,
    selectReparacionCompleta,
} from '../reparacion.selectors';
import type { RootState } from '../../store';

/**
 * Helper para crear un state de prueba
 */
function createMockState(): RootState {
    return {
        reparacion: {
            ids: ['rep-1', 'rep-2'],
            entities: {
                'rep-1': {
                    id: 'rep-1',
                    UsuarioRep: 'user-1',
                    DroneRep: 'drone-1',
                    ModeloDroneNameRep: 'model-1',
                    EstadoRep: 'Consulta',
                } as never,
                'rep-2': {
                    id: 'rep-2',
                    UsuarioRep: 'user-2',
                    DroneRep: 'drone-2',
                    ModeloDroneNameRep: 'model-2',
                    EstadoRep: 'Reparado',
                } as never,
            },
            loading: false,
            error: null,
        },
        usuario: {
            ids: ['user-1', 'user-2'],
            entities: {
                'user-1': {
                    id: 'user-1',
                    NomUsu: 'Juan',
                    ApeUsu: 'Pérez',
                    EmaUsu: 'juan@test.com',
                } as never,
                'user-2': {
                    id: 'user-2',
                    NomUsu: 'María',
                    ApeUsu: 'García',
                    EmaUsu: 'maria@test.com',
                } as never,
            },
            loading: false,
            error: null,
        },
        drone: {
            ids: ['drone-1', 'drone-2'],
            entities: {
                'drone-1': {
                    id: 'drone-1',
                    NomDrone: 'Mavic Pro',
                    NumSerieDrone: 'SN12345',
                } as never,
                'drone-2': {
                    id: 'drone-2',
                    NomDrone: 'Phantom 4',
                    NumSerieDrone: 'SN67890',
                } as never,
            },
            loading: false,
            error: null,
        },
        modeloDrone: {
            ids: ['model-1', 'model-2'],
            entities: {
                'model-1': {
                    id: 'model-1',
                    NomModDrone: 'Mavic Pro',
                    FabModDrone: 'DJI',
                } as never,
                'model-2': {
                    id: 'model-2',
                    NomModDrone: 'Phantom 4',
                    FabModDrone: 'DJI',
                } as never,
            },
            loading: false,
            error: null,
        },
    } as RootState;
}

describe('Reparacion Selectors', () => {
    let mockState: RootState;

    beforeEach(() => {
        mockState = createMockState();
    });

    describe('selectUsuarioDeReparacion', () => {
        it('debe retornar el usuario de una reparación existente', () => {
            const usuario = selectUsuarioDeReparacion(mockState, 'rep-1');

            expect(usuario).not.toBeNull();
            expect(usuario?.id).toBe('user-1');
            expect(usuario?.NomUsu).toBe('Juan');
            expect(usuario?.ApeUsu).toBe('Pérez');
        });

        it('debe retornar null si la reparación no existe', () => {
            const usuario = selectUsuarioDeReparacion(mockState, 'rep-999');

            expect(usuario).toBeNull();
        });

        it('debe retornar null si el usuario no existe', () => {
            mockState.reparacion.entities['rep-1'] = {
                ...mockState.reparacion.entities['rep-1'],
                UsuarioRep: 'user-999',
            } as never;

            const usuario = selectUsuarioDeReparacion(mockState, 'rep-1');

            expect(usuario).toBeNull();
        });

        it('debe tener complejidad O(1)', () => {
            const start = performance.now();
            selectUsuarioDeReparacion(mockState, 'rep-1');
            const end = performance.now();

            // Debe completar en menos de 1ms (acceso directo)
            expect(end - start).toBeLessThan(1);
        });
    });

    describe('selectDroneDeReparacion', () => {
        it('debe retornar el drone de una reparación existente', () => {
            const drone = selectDroneDeReparacion(mockState, 'rep-1');

            expect(drone).not.toBeNull();
            expect(drone?.id).toBe('drone-1');
            expect(drone?.NomDrone).toBe('Mavic Pro');
        });

        it('debe retornar null si la reparación no existe', () => {
            const drone = selectDroneDeReparacion(mockState, 'rep-999');

            expect(drone).toBeNull();
        });
    });

    describe('selectModeloDeReparacion', () => {
        it('debe retornar el modelo de una reparación existente', () => {
            const modelo = selectModeloDeReparacion(mockState, 'rep-1');

            expect(modelo).not.toBeNull();
            expect(modelo?.id).toBe('model-1');
            expect(modelo?.NomModDrone).toBe('Mavic Pro');
        });

        it('debe retornar null si la reparación no existe', () => {
            const modelo = selectModeloDeReparacion(mockState, 'rep-999');

            expect(modelo).toBeNull();
        });
    });

    describe('selectReparacionCompleta', () => {
        it('debe retornar objeto completo con todas las entidades', () => {
            const selector = selectReparacionCompleta('rep-1');
            const completa = selector(mockState);

            expect(completa).not.toBeNull();
            expect(completa?.reparacion).toBeDefined();
            expect(completa?.usuario).toBeDefined();
            expect(completa?.drone).toBeDefined();
            expect(completa?.modelo).toBeDefined();
        });

        it('debe estar memoizado', () => {
            const selector = selectReparacionCompleta('rep-1');

            const result1 = selector(mockState);
            const result2 = selector(mockState);

            // Debe retornar la misma referencia (memoizado)
            expect(result1).toBe(result2);
        });

        it('debe recalcular si cambia el state', () => {
            const selector = selectReparacionCompleta('rep-1');

            const result1 = selector(mockState);

            // Modificar state
            const newState = {
                ...mockState,
                usuario: {
                    ...mockState.usuario,
                    entities: {
                        ...mockState.usuario.entities,
                        'user-1': {
                            ...mockState.usuario.entities['user-1'],
                            NomUsu: 'Pedro',
                        } as never,
                    },
                },
            } as RootState;

            const result2 = selector(newState);

            // Debe ser diferente (recalculado)
            expect(result1).not.toBe(result2);
            expect(result2?.usuario?.NomUsu).toBe('Pedro');
        });
    });
});

describe('Selector Performance', () => {
    it('todos los selectores deben ejecutar en < 1ms', () => {
        const mockState = createMockState();

        const selectors = [
            () => selectUsuarioDeReparacion(mockState, 'rep-1'),
            () => selectDroneDeReparacion(mockState, 'rep-1'),
            () => selectModeloDeReparacion(mockState, 'rep-1'),
            () => selectReparacionCompleta('rep-1')(mockState),
        ];

        selectors.forEach((selector) => {
            const start = performance.now();
            selector();
            const end = performance.now();

            expect(end - start).toBeLessThan(1);
        });
    });
});
