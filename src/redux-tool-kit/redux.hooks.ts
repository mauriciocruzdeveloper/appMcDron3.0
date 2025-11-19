/**
 * redux.hooks.ts
 * 
 * Custom hooks tipados para usar Redux en el proyecto.
 * Provee versiones tipadas de useDispatch y useSelector.
 * 
 * @module redux-tool-kit/hooks
 */

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/**
 * Hook tipado para dispatch de Redux.
 * Usar en lugar de useDispatch para tener tipos correctos.
 * 
 * @example
 * ```tsx
 * const dispatch = useAppDispatch();
 * dispatch(guardarReparacionAsync(reparacion));
 * ```
 */
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();

/**
 * Hook tipado para selector de Redux.
 * Usar en lugar de useSelector para tener tipos correctos.
 * 
 * @example
 * ```tsx
 * const reparacion = useAppSelector(state => 
 *   state.reparacion.coleccionReparaciones[id]
 * );
 * ```
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
