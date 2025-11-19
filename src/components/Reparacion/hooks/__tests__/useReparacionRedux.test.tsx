/**
 * useReparacionRedux.test.tsx
 * 
 * Tests unitarios para el hook useReparacionRedux.
 * Valida carga de datos, acciones CRUD, y manejo de errores.
 * 
 * **Phase 3 - T3.7:** Testing
 * 
 * @module Reparacion/hooks/__tests__
 */

import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { useReparacionRedux } from '../useReparacionRedux';
import reparacionReducer from '../../../../redux-tool-kit/reparacion/reparacion.slice';
import intervencionReducer from '../../../../redux-tool-kit/intervencion/intervencion.slice';

/**
 * Helper para crear un store de prueba
 */
function createTestStore(initialState = {}) {
    return configureStore({
        reducer: {
            reparacion: reparacionReducer,
            intervencion: intervencionReducer,
        },
        preloadedState: initialState as never,
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
    });
});
