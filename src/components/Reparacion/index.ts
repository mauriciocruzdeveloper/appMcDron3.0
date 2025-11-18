/**
 * Barrel exports para el módulo Reparacion
 * 
 * Este archivo exporta todos los componentes públicos del módulo Reparación refactorizado.
 * 
 * @module Reparacion
 */

// Container principal (Smart Component)
export { default as ReparacionContainer } from './Reparacion.container';

// Context y Provider
export { 
    ReparacionProvider,
    useReparacion,
    useReparacionPermissions,
    useReparacionStatus
} from './ReparacionContext';

// Hooks de datos y acciones
export { 
    useReparacionData,
    useReparacionDataComplete,
    useReparacionSummary 
} from './hooks/useReparacionData';

export { 
    useReparacionActions,
    useActionValidation 
} from './hooks/useReparacionActions';

// Componentes de presentación
export { ReparacionLayout } from './ReparacionLayout.component';
export { ReparacionHeader } from './components/Header/ReparacionHeader.component';
export { ReparacionFooter } from './components/Footer/ReparacionFooter.component';
export { ReparacionTabs } from './components/Tabs/ReparacionTabs.component';

// Componentes compartidos
export { EstadoBadge } from './components/shared/EstadoBadge.component';
export { ActionButton } from './components/shared/ActionButton.component';
export { SeccionCard } from './components/shared/SeccionCard.component';
export { FormField } from './components/shared/FormField.component';

// Tipos
export type { ReparacionContextValue, ReparacionProviderProps } from './types/context.types';
export type { ReparacionData } from './hooks/useReparacionData';
export type { ReparacionActions } from './hooks/useReparacionActions';

// Legacy: Componente monolítico original (mantener hasta migración completa)
export { default as ReparacionLegacy } from './Reparacion.component';
