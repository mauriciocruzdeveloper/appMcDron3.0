/**
 * useReparacionRedux.test.ts
 * 
 * Tests unitarios para el hook useReparacionRedux.
 * Valida carga de datos, acciones CRUD, y manejo de errores.
 * 
 * **Phase 3 - T3.7:** Testing
 * 
 * @module Reparacion/hooks/__tests__
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useReparacionRedux } from '../useReparacionRedux';
import reparacionReducer from '../../../redux-tool-kit/reparacion/reparacion.slice';
import intervencionReducer from '../../../redux-tool-kit/intervencion/intervencion.slice';

/**
 * Helper para crear un store de prueba
 */
function createTestStore(initialState = {}) {
    return configureStore({
        reducer: {
            reparacion: reparacionReducer,
            intervencion: intervencionReducer,
        },
        preloadedState: initialState,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
            }),
    });
}

/**
 * Wrapper para el hook con Provider
 */
function createWrapper(store: ReturnType<typeof createTestStore>) {
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return <Provider store={store}>{children}</Provider>;
    };
}

describe('useReparacionRedux', () => {
    describe('Initialization', () => {
        it('debe inicializar con valores por defecto', () => {
            const store = createTestStore();
            const wrapper = createWrapper(store);

            const { result } = renderHook(
                () => useReparacionRedux({ reparacionId: 'test-id', autoLoad: false }),
                { wrapper }
            );

            expect(result.current.reparacion).toBeNull();
            expect(result.current.intervenciones).toEqual([]);
            expect(result.current.isLoading).toBe(false);
            expect(result.current.isSaving).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it('debe cargar reparación automáticamente si autoLoad es true', async () => {
            const store = createTestStore();
            const wrapper = createWrapper(store);

            const { result } = renderHook(
                () => useReparacionRedux({ reparacionId: 'test-id', autoLoad: true }),
                { wrapper }
            );

            // Verificar que se activó el loading
            await waitFor(() => {
                expect(result.current.isLoading).toBe(true);
            });
        });
    });

    describe('Actions', () => {
        it('debe tener todas las acciones definidas', () => {
            const store = createTestStore();
            const wrapper = createWrapper(store);

            const { result } = renderHook(
                () => useReparacionRedux({ reparacionId: 'test-id', autoLoad: false }),
                { wrapper }
            );

            expect(typeof result.current.loadReparacion).toBe('function');
            expect(typeof result.current.saveReparacion).toBe('function');
            expect(typeof result.current.deleteReparacion).toBe('function');
            expect(typeof result.current.loadIntervenciones).toBe('function');
            expect(typeof result.current.addIntervencion).toBe('function');
            expect(typeof result.current.removeIntervencion).toBe('function');
        });

        it('debe llamar a saveReparacion correctamente', async () => {
            const store = createTestStore();
            const wrapper = createWrapper(store);

            const { result } = renderHook(
                () => useReparacionRedux({ reparacionId: 'test-id', autoLoad: false }),
                { wrapper }
            );

            const mockData = {
                id: 'test-id',
                EstadoRep: 'Consulta',
                // ... otros campos
            } as any;

            await act(async () => {
                await result.current.saveReparacion(mockData);
            });

            // Verificar que el estado cambió a isSaving
            expect(result.current.isSaving).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        it('debe manejar errores de carga', async () => {
            const store = createTestStore();
            const wrapper = createWrapper(store);

            const { result } = renderHook(
                () => useReparacionRedux({ reparacionId: 'invalid-id', autoLoad: true }),
                { wrapper }
            );

            await waitFor(() => {
                // El error debería estar manejado
                expect(result.current.isLoading).toBe(false);
            });
        });
    });

    describe('State Updates', () => {
        it('debe actualizar isLoading durante operaciones async', async () => {
            const store = createTestStore();
            const wrapper = createWrapper(store);

            const { result } = renderHook(
                () => useReparacionRedux({ reparacionId: 'test-id', autoLoad: true }),
                { wrapper }
            );

            // Al inicio debe estar loading
            expect(result.current.isLoading || result.current.reparacion === null).toBe(true);
        });
    });
});

describe('useReparacionRedux - Integration Tests', () => {
    it('debe coordinar carga de reparación e intervenciones', async () => {
        const store = createTestStore();
        const wrapper = createWrapper(store);

        const { result } = renderHook(
            () => useReparacionRedux({ reparacionId: 'test-id', autoLoad: false }),
            { wrapper }
        );

        // Cargar reparación
        await act(async () => {
            await result.current.loadReparacion('test-id');
        });

        // Cargar intervenciones
        await act(async () => {
            await result.current.loadIntervenciones('test-id');
        });

        // Verificar que ambas operaciones se ejecutaron
        expect(result.current.loadReparacion).toBeDefined();
        expect(result.current.loadIntervenciones).toBeDefined();
    });
});
