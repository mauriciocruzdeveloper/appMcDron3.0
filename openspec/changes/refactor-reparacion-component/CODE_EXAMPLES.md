# Ejemplos de Código - Refactorización Reparación

Este documento contiene ejemplos concretos de cómo implementar los componentes principales de la refactorización.

---

## 📁 Estructura de Archivos Ejemplo

```
src/components/Reparacion/
├── index.ts                              # Export principal
├── Reparacion.container.tsx              # Container (250 líneas)
├── ReparacionContext.tsx                 # Contexto (150 líneas)
│
├── hooks/
│   ├── index.ts
│   ├── useReparacionData.ts              # Data fetching (100 líneas)
│   ├── useReparacionActions.ts           # Actions (150 líneas)
│   ├── useEstadoTransitions.ts           # Estado logic (100 líneas)
│   └── useDocumentUpload.ts              # Upload logic (80 líneas)
│
├── components/
│   ├── Header/
│   │   ├── ReparacionHeader.tsx
│   │   ├── ProgressBar.tsx
│   │   └── QuickActions.tsx
│   ├── Tabs/
│   │   ├── TabNavigation.tsx
│   │   └── TabPanel.tsx
│   └── Shared/
│       ├── SectionCard.tsx
│       ├── EstadoBadge.tsx
│       ├── PriceDisplay.tsx
│       └── DateField.tsx
│
└── tabs/
    ├── GeneralTab/
    │   ├── GeneralTab.tsx
    │   ├── ClienteSection.tsx
    │   ├── DroneSection.tsx
    │   └── ConsultaSection.tsx
    ├── DiagnosticoTab/
    ├── PresupuestoTab/
    ├── ReparacionTab/
    ├── GaleriaTab/
    ├── IntervencionesTab/
    └── FinalizacionTab/
```

---

## 1. ReparacionContext.tsx

```typescript
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ReparacionType, DataReparacion } from '../../types/reparacion';
import { Usuario } from '../../types/usuario';
import { Drone } from '../../types/drone';
import { ModeloDrone } from '../../types/modeloDrone';

// ============================================================================
// TYPES
// ============================================================================

interface ReparacionContextValue {
  // Estado
  reparacion: ReparacionType;
  reparacionOriginal: ReparacionType;
  usuario: Usuario | null;
  drone: Drone | null;
  modelo: ModeloDrone | null;
  isAdmin: boolean;
  isNew: boolean;
  hasChanges: boolean;
  
  // Acciones básicas
  updateField: (field: keyof DataReparacion, value: any) => void;
  updateMultipleFields: (fields: Partial<DataReparacion>) => void;
  resetChanges: () => void;
  
  // Acciones de persistencia
  save: () => Promise<boolean>;
  delete: () => Promise<boolean>;
  
  // Acciones de estado
  cambiarEstado: (nuevoEstado: string) => Promise<boolean>;
  canChangeState: (estado: string) => boolean;
  getNextStates: () => string[];
  
  // Upload/Delete
  uploadFoto: (file: File) => Promise<string>;
  deleteFoto: (url: string) => Promise<void>;
  uploadDocumento: (file: File) => Promise<string>;
  deleteDocumento: (url: string) => Promise<void>;
  
  // Validaciones
  canSave: boolean;
  canDelete: boolean;
  validationErrors: Record<string, string>;
  
  // Helpers
  formatPrice: (price: number) => string;
  formatDate: (timestamp: number) => string;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ReparacionContext = createContext<ReparacionContextValue | null>(null);

// ============================================================================
// HOOK
// ============================================================================

export function useReparacion(): ReparacionContextValue {
  const context = useContext(ReparacionContext);
  
  if (!context) {
    throw new Error('useReparacion must be used within ReparacionProvider');
  }
  
  return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

interface ReparacionProviderProps {
  children: React.ReactNode;
  reparacion: ReparacionType;
  reparacionOriginal: ReparacionType;
  usuario: Usuario | null;
  drone: Drone | null;
  modelo: ModeloDrone | null;
  isAdmin: boolean;
  isNew: boolean;
  onSave: (reparacion: ReparacionType) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onChangeState: (estado: string) => Promise<boolean>;
  onUploadFoto: (file: File) => Promise<string>;
  onDeleteFoto: (url: string) => Promise<void>;
  onUploadDocumento: (file: File) => Promise<string>;
  onDeleteDocumento: (url: string) => Promise<void>;
}

export function ReparacionProvider({
  children,
  reparacion: initialReparacion,
  reparacionOriginal,
  usuario,
  drone,
  modelo,
  isAdmin,
  isNew,
  onSave,
  onDelete,
  onChangeState,
  onUploadFoto,
  onDeleteFoto,
  onUploadDocumento,
  onDeleteDocumento,
}: ReparacionProviderProps): React.ReactElement {
  
  const [reparacion, setReparacion] = useState<ReparacionType>(initialReparacion);
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const hasChanges = useMemo(() => {
    return JSON.stringify(reparacion.data) !== JSON.stringify(reparacionOriginal.data);
  }, [reparacion, reparacionOriginal]);
  
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    
    // Validaciones básicas
    if (!reparacion.data.EmailUsu) {
      errors.EmailUsu = 'Email es requerido';
    }
    
    if (!reparacion.data.ModeloDroneNameRep) {
      errors.ModeloDroneNameRep = 'Modelo de drone es requerido';
    }
    
    // Validaciones de presupuesto
    if (reparacion.data.PresuDiRep < 0) {
      errors.PresuDiRep = 'El presupuesto no puede ser negativo';
    }
    
    return errors;
  }, [reparacion]);
  
  const canSave = useMemo(() => {
    return hasChanges && Object.keys(validationErrors).length === 0;
  }, [hasChanges, validationErrors]);
  
  const canDelete = useMemo(() => {
    return isAdmin && !isNew;
  }, [isAdmin, isNew]);
  
  // ============================================================================
  // ACTIONS
  // ============================================================================
  
  const updateField = useCallback((field: keyof DataReparacion, value: any) => {
    setReparacion(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value
      }
    }));
  }, []);
  
  const updateMultipleFields = useCallback((fields: Partial<DataReparacion>) => {
    setReparacion(prev => ({
      ...prev,
      data: {
        ...prev.data,
        ...fields
      }
    }));
  }, []);
  
  const resetChanges = useCallback(() => {
    setReparacion(reparacionOriginal);
  }, [reparacionOriginal]);
  
  const save = useCallback(async () => {
    if (!canSave) return false;
    return await onSave(reparacion);
  }, [canSave, onSave, reparacion]);
  
  const deleteReparacion = useCallback(async () => {
    if (!canDelete) return false;
    return await onDelete();
  }, [canDelete, onDelete]);
  
  const cambiarEstado = useCallback(async (nuevoEstado: string) => {
    return await onChangeState(nuevoEstado);
  }, [onChangeState]);
  
  // ============================================================================
  // ESTADO TRANSITIONS
  // ============================================================================
  
  const canChangeState = useCallback((estado: string): boolean => {
    if (!isAdmin) return false;
    
    // Aquí va la lógica de transiciones
    // Ver useEstadoTransitions.ts para implementación completa
    
    return true;
  }, [isAdmin, reparacion]);
  
  const getNextStates = useCallback((): string[] => {
    // Retorna lista de estados válidos siguientes
    return [];
  }, [reparacion]);
  
  // ============================================================================
  // HELPERS
  // ============================================================================
  
  const formatPrice = useCallback((price: number): string => {
    return price.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    });
  }, []);
  
  const formatDate = useCallback((timestamp: number): string => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }, []);
  
  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  
  const value: ReparacionContextValue = {
    // Estado
    reparacion,
    reparacionOriginal,
    usuario,
    drone,
    modelo,
    isAdmin,
    isNew,
    hasChanges,
    
    // Acciones
    updateField,
    updateMultipleFields,
    resetChanges,
    save,
    delete: deleteReparacion,
    cambiarEstado,
    canChangeState,
    getNextStates,
    
    // Upload
    uploadFoto: onUploadFoto,
    deleteFoto: onDeleteFoto,
    uploadDocumento: onUploadDocumento,
    deleteDocumento: onDeleteDocumento,
    
    // Validaciones
    canSave,
    canDelete,
    validationErrors,
    
    // Helpers
    formatPrice,
    formatDate,
  };
  
  return (
    <ReparacionContext.Provider value={value}>
      {children}
    </ReparacionContext.Provider>
  );
}

export default ReparacionContext;
```

---

## 2. Reparacion.container.tsx

```typescript
import React, { Suspense, useState, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from '../../hooks/useHistory';
import { ReparacionProvider } from './ReparacionContext';
import { useReparacionData } from './hooks/useReparacionData';
import { useReparacionActions } from './hooks/useReparacionActions';
import ReparacionHeader from './components/Header/ReparacionHeader';
import ProgressBar from './components/Header/ProgressBar';
import TabNavigation from './components/Tabs/TabNavigation';
import TabPanel from './components/Tabs/TabPanel';
import QuickActions from './components/Header/QuickActions';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

// Lazy loading de tabs
const GeneralTab = lazy(() => import('./tabs/GeneralTab/GeneralTab'));
const DiagnosticoTab = lazy(() => import('./tabs/DiagnosticoTab/DiagnosticoTab'));
const PresupuestoTab = lazy(() => import('./tabs/PresupuestoTab/PresupuestoTab'));
const ReparacionTab = lazy(() => import('./tabs/ReparacionTab/ReparacionTab'));
const GaleriaTab = lazy(() => import('./tabs/GaleriaTab/GaleriaTab'));
const IntervencionesTab = lazy(() => import('./tabs/IntervencionesTab/IntervencionesTab'));
const FinalizacionTab = lazy(() => import('./tabs/FinalizacionTab/FinalizacionTab'));

// ============================================================================
// TYPES
// ============================================================================

interface TabConfig {
  id: string;
  label: string;
  icon: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  visibleFrom: number; // etapa mínima
  badge?: () => number;
}

// ============================================================================
// TAB CONFIGURATION
// ============================================================================

const TABS: TabConfig[] = [
  {
    id: 'general',
    label: 'General',
    icon: 'info-circle',
    component: GeneralTab,
    visibleFrom: 0, // Siempre visible
  },
  {
    id: 'diagnostico',
    label: 'Diagnóstico',
    icon: 'search',
    component: DiagnosticoTab,
    visibleFrom: 5, // Revisado
  },
  {
    id: 'presupuesto',
    label: 'Presupuesto',
    icon: 'calculator',
    component: PresupuestoTab,
    visibleFrom: 6, // Presupuestado
  },
  {
    id: 'reparacion',
    label: 'Reparación',
    icon: 'tools',
    component: ReparacionTab,
    visibleFrom: 7, // Aceptado
  },
  {
    id: 'galeria',
    label: 'Galería',
    icon: 'images',
    component: GaleriaTab,
    visibleFrom: 4, // Recibido
  },
  {
    id: 'intervenciones',
    label: 'Intervenciones',
    icon: 'list-task',
    component: IntervencionesTab,
    visibleFrom: 7, // Aceptado
  },
  {
    id: 'finalizacion',
    label: 'Finalización',
    icon: 'check-circle',
    component: FinalizacionTab,
    visibleFrom: 9, // Reparado
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function ReparacionContainer(): React.ReactElement | null {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const isNew = id === "new";
  
  // State
  const [activeTab, setActiveTab] = useState('general');
  
  // Custom hooks
  const reparacionData = useReparacionData(id, isNew);
  const actions = useReparacionActions(id);
  
  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================
  
  if (reparacionData.loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <LoadingSpinner />
      </div>
    );
  }
  
  if (reparacionData.error || !reparacionData.data) {
    return (
      <ErrorMessage
        message={reparacionData.error || "Reparación no encontrada"}
        onRetry={() => reparacionData.reload()}
        onBack={() => history.goBack()}
      />
    );
  }
  
  // ============================================================================
  // TAB VISIBILITY
  // ============================================================================
  
  const getEtapaActual = (): number => {
    const estadoInfo = obtenerEstadoSeguro(reparacionData.data.EstadoRep);
    return estadoInfo.etapa;
  };
  
  const visibleTabs = TABS.filter(tab => {
    const etapaActual = getEtapaActual();
    return tab.visibleFrom <= etapaActual;
  });
  
  // Asegurar que el tab activo esté visible
  if (!visibleTabs.find(t => t.id === activeTab)) {
    setActiveTab(visibleTabs[0]?.id || 'general');
  }
  
  // ============================================================================
  // TAB RENDERING
  // ============================================================================
  
  const renderActiveTab = () => {
    const activeTabConfig = TABS.find(t => t.id === activeTab);
    if (!activeTabConfig) return null;
    
    const TabComponent = activeTabConfig.component;
    return <TabComponent />;
  };
  
  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  
  const contextValue = {
    reparacion: reparacionData.data,
    reparacionOriginal: reparacionData.original,
    usuario: reparacionData.usuario,
    drone: reparacionData.drone,
    modelo: reparacionData.modelo,
    isAdmin: reparacionData.isAdmin,
    isNew,
    
    // Actions
    onSave: actions.save,
    onDelete: actions.delete,
    onChangeState: actions.cambiarEstado,
    onUploadFoto: actions.uploadFoto,
    onDeleteFoto: actions.deleteFoto,
    onUploadDocumento: actions.uploadDocumento,
    onDeleteDocumento: actions.deleteDocumento,
  };
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <ReparacionProvider {...contextValue}>
      <div className="reparacion-container p-4">
        {/* Header con información principal */}
        <ReparacionHeader />
        
        {/* Barra de progreso */}
        <ProgressBar />
        
        {/* Navegación por tabs */}
        <TabNavigation
          tabs={visibleTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {/* Contenido del tab activo */}
        <TabPanel activeTab={activeTab}>
          <Suspense fallback={<LoadingSpinner />}>
            {renderActiveTab()}
          </Suspense>
        </TabPanel>
        
        {/* Acciones flotantes (guardar, eliminar, etc) */}
        <QuickActions />
      </div>
    </ReparacionProvider>
  );
}
```

---

## 3. TabNavigation.tsx

```typescript
import React from 'react';
import classNames from 'classnames';
import './TabNavigation.css';

interface Tab {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TabNavigation({
  tabs,
  activeTab,
  onTabChange
}: TabNavigationProps): React.ReactElement {
  
  return (
    <nav className="tab-navigation mb-4" role="tablist">
      <div className="nav nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={classNames('nav-link', {
              active: tab.id === activeTab
            })}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            aria-selected={tab.id === activeTab}
            aria-controls={`tab-panel-${tab.id}`}
          >
            <i className={`bi bi-${tab.icon} me-2`} />
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="badge bg-primary ms-2">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
```

```css
/* TabNavigation.css */
.tab-navigation .nav-tabs {
  border-bottom: 2px solid #dee2e6;
  overflow-x: auto;
  overflow-y: hidden;
  flex-wrap: nowrap;
  -webkit-overflow-scrolling: touch;
}

.tab-navigation .nav-link {
  border: none;
  border-bottom: 3px solid transparent;
  color: #6c757d;
  padding: 1rem 1.5rem;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tab-navigation .nav-link:hover {
  color: #495057;
  border-bottom-color: #dee2e6;
}

.tab-navigation .nav-link.active {
  color: #007bff;
  border-bottom-color: #007bff;
  font-weight: 600;
}

.tab-navigation .nav-link i {
  font-size: 1.1em;
}

.tab-navigation .badge {
  font-size: 0.7em;
  padding: 0.25em 0.5em;
}

@media (max-width: 768px) {
  .tab-navigation .nav-link {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
}
```

---

## 4. Ejemplo de Tab: GeneralTab.tsx

```typescript
import React from 'react';
import { useReparacion } from '../../ReparacionContext';
import SectionCard from '../../components/Shared/SectionCard';
import ClienteSection from './ClienteSection';
import DroneSection from './DroneSection';
import ConsultaSection from './ConsultaSection';
import { esEstadoLegacy, obtenerMensajeMigracion } from '../../../../utils/estadosHelper';

export default function GeneralTab(): React.ReactElement {
  const { reparacion, isAdmin } = useReparacion();
  
  const isLegacy = esEstadoLegacy(reparacion.data.EstadoRep);
  
  return (
    <div className="general-tab">
      {/* Alerta de estado legacy */}
      {isLegacy && isAdmin && (
        <div className="alert alert-warning mb-4">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Estado Legacy:</strong> {obtenerMensajeMigracion(reparacion.data.EstadoRep)}
        </div>
      )}
      
      {/* Sección Cliente */}
      <SectionCard
        title="Cliente"
        icon="person"
        collapsible
        defaultExpanded
      >
        <ClienteSection />
      </SectionCard>
      
      {/* Sección Drone */}
      <SectionCard
        title="Drone"
        icon="drone"
        collapsible
        defaultExpanded
      >
        <DroneSection />
      </SectionCard>
      
      {/* Sección Consulta */}
      <SectionCard
        title="Consulta Inicial"
        icon="chat-left-text"
        collapsible
        defaultExpanded
      >
        <ConsultaSection />
      </SectionCard>
    </div>
  );
}
```

---

## 5. ClienteSection.tsx

```typescript
import React from 'react';
import { useReparacion } from '../../ReparacionContext';
import { useHistory } from '../../../../hooks/useHistory';

export default function ClienteSection(): React.ReactElement {
  const { reparacion, usuario, isAdmin, updateField } = useReparacion();
  const history = useHistory();
  
  const handleGoToUser = () => {
    if (usuario) {
      history.push(`/inicio/usuarios/${usuario.id}`);
    }
  };
  
  return (
    <div className="cliente-section">
      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            className="form-control"
            value={reparacion.data.NombreUsu || ''}
            onChange={(e) => updateField('NombreUsu', e.target.value)}
            disabled={!isAdmin}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Apellido</label>
          <input
            type="text"
            className="form-control"
            value={reparacion.data.ApellidoUsu || ''}
            onChange={(e) => updateField('ApellidoUsu', e.target.value)}
            disabled={!isAdmin}
          />
        </div>
      </div>
      
      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={reparacion.data.EmailUsu || ''}
            onChange={(e) => updateField('EmailUsu', e.target.value)}
            disabled={!isAdmin}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Teléfono</label>
          <input
            type="tel"
            className="form-control"
            value={reparacion.data.TelefonoUsu || ''}
            onChange={(e) => updateField('TelefonoUsu', e.target.value)}
            disabled={!isAdmin}
          />
        </div>
      </div>
      
      {usuario && (
        <div className="mt-3">
          <button
            className="btn btn-outline-primary"
            onClick={handleGoToUser}
          >
            <i className="bi bi-person-badge me-2" />
            Ver perfil completo
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 6. SectionCard.tsx (Componente Compartido)

```typescript
import React, { useState } from 'react';
import classNames from 'classnames';
import './SectionCard.css';

interface SectionCardProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
  badge?: number | string;
}

export default function SectionCard({
  title,
  icon,
  children,
  collapsible = false,
  defaultExpanded = true,
  className,
  badge
}: SectionCardProps): React.ReactElement {
  
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };
  
  return (
    <div className={classNames('section-card card mb-4', className)}>
      <div
        className={classNames('card-header', {
          'cursor-pointer': collapsible
        })}
        onClick={toggleExpanded}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            {icon && <i className={`bi bi-${icon} me-2`} />}
            {title}
            {badge !== undefined && (
              <span className="badge bg-secondary ms-2">{badge}</span>
            )}
          </h5>
          
          {collapsible && (
            <i className={classNames('bi', {
              'bi-chevron-up': isExpanded,
              'bi-chevron-down': !isExpanded
            })} />
          )}
        </div>
      </div>
      
      {(!collapsible || isExpanded) && (
        <div className="card-body">
          {children}
        </div>
      )}
    </div>
  );
}
```

---

## 7. useReparacionData.ts (Custom Hook)

```typescript
import { useState, useEffect } from 'react';
import { useAppSelector } from '../../../redux-tool-kit/hooks/useAppSelector';
import { useAppDispatch } from '../../../redux-tool-kit/hooks/useAppDispatch';
import {
  selectReparacionById,
  selectIntervencionesDeReparacionActual
} from '../../../redux-tool-kit/reparacion';
import { selectUsuarioPorId } from '../../../redux-tool-kit/usuario/usuario.selectors';
import { selectDroneById } from '../../../redux-tool-kit/drone/drone.selectors';
import { selectModeloDronePorId } from '../../../redux-tool-kit/modeloDrone/modeloDrone.selectors';
import { ReparacionType } from '../../../types/reparacion';
import { getReparacionAsync } from '../../../redux-tool-kit/reparacion/reparacion.actions';

interface UseReparacionDataReturn {
  data: ReparacionType | undefined;
  original: ReparacionType | undefined;
  usuario: Usuario | null;
  drone: Drone | null;
  modelo: ModeloDrone | null;
  intervenciones: Intervencion[];
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useReparacionData(
  id: string,
  isNew: boolean
): UseReparacionDataReturn {
  
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);
  
  // Selectores
  const reparacion = useAppSelector(selectReparacionById(id));
  const usuario = useAppSelector(
    state => selectUsuarioPorId(state, reparacion?.data.UsuarioRep || "")
  );
  const drone = useAppSelector(
    state => selectDroneById(state, reparacion?.data.DroneId || "")
  );
  const modelo = useAppSelector(
    state => selectModeloDronePorId(state, drone?.data.ModeloDroneId || "")
  );
  const intervenciones = useAppSelector(selectIntervencionesDeReparacionActual);
  const isAdmin = useAppSelector(state => state.app.usuario?.data.Admin) ?? false;
  
  // Cargar reparación si no está en store
  useEffect(() => {
    if (!isNew && !reparacion) {
      loadReparacion();
    } else if (reparacion) {
      setLoading(false);
    }
  }, [id, isNew, reparacion]);
  
  const loadReparacion = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await dispatch(getReparacionAsync(id));
      
      if (result.meta.requestStatus === 'rejected') {
        setError('Error al cargar la reparación');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };
  
  return {
    data: reparacion,
    original: reparacion, // TODO: mantener copia original
    usuario,
    drone,
    modelo,
    intervenciones,
    isAdmin,
    loading,
    error,
    reload: loadReparacion,
  };
}
```

---

## 8. Feature Flag Implementation

```typescript
// src/config/feature-flags.ts

export interface FeatureFlags {
  USE_NEW_REPARACION_COMPONENT: boolean;
  // Otras flags...
}

class FeatureFlagManager {
  private flags: FeatureFlags;
  
  constructor() {
    this.flags = {
      USE_NEW_REPARACION_COMPONENT: this.getNewReparacionFlag(),
    };
  }
  
  private getNewReparacionFlag(): boolean {
    // 1. Environment variable (para CI/CD)
    if (process.env.REACT_APP_NEW_REPARACION === 'true') {
      return true;
    }
    
    // 2. LocalStorage (para beta testers)
    if (localStorage.getItem('beta_new_reparacion') === 'true') {
      return true;
    }
    
    // 3. Usuario específico
    const currentUser = this.getCurrentUser();
    if (currentUser?.betaFeatures?.includes('new_reparacion')) {
      return true;
    }
    
    // 4. Porcentaje de rollout (A/B testing)
    const rolloutPercentage = parseInt(
      process.env.REACT_APP_NEW_REPARACION_ROLLOUT || '0',
      10
    );
    if (rolloutPercentage > 0) {
      const userId = currentUser?.id || '';
      const userHash = this.hashString(userId);
      return (userHash % 100) < rolloutPercentage;
    }
    
    return false;
  }
  
  private getCurrentUser() {
    // Obtener usuario del store o localStorage
    return null;
  }
  
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  public isEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag];
  }
  
  public enableNewReparacion(): void {
    localStorage.setItem('beta_new_reparacion', 'true');
    this.flags.USE_NEW_REPARACION_COMPONENT = true;
  }
  
  public disableNewReparacion(): void {
    localStorage.removeItem('beta_new_reparacion');
    this.flags.USE_NEW_REPARACION_COMPONENT = false;
  }
}

export const featureFlags = new FeatureFlagManager();

// Usage en Routes
import { featureFlags } from './config/feature-flags';

<Route path="/reparaciones/:id">
  {featureFlags.isEnabled('USE_NEW_REPARACION_COMPONENT')
    ? <ReparacionContainer />
    : <ReparacionComponentOld />}
</Route>

// Toggle para admins/beta testers
function FeatureFlagToggle() {
  const [enabled, setEnabled] = useState(
    featureFlags.isEnabled('USE_NEW_REPARACION_COMPONENT')
  );
  
  const toggle = () => {
    if (enabled) {
      featureFlags.disableNewReparacion();
    } else {
      featureFlags.enableNewReparacion();
    }
    setEnabled(!enabled);
    window.location.reload(); // Recargar para aplicar cambios
  };
  
  return (
    <div className="form-check form-switch">
      <input
        className="form-check-input"
        type="checkbox"
        checked={enabled}
        onChange={toggle}
      />
      <label className="form-check-label">
        Nuevo componente de reparación (Beta)
      </label>
    </div>
  );
}
```

---

## 9. Tests Ejemplo

```typescript
// ReparacionContext.test.tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useReparacion, ReparacionProvider } from '../ReparacionContext';

describe('ReparacionContext', () => {
  const mockReparacion = {
    id: 'test-id',
    data: {
      EstadoRep: 'Aceptado',
      EmailUsu: 'test@example.com',
      // ... más datos
    }
  };
  
  const wrapper = ({ children }) => (
    <ReparacionProvider
      reparacion={mockReparacion}
      reparacionOriginal={mockReparacion}
      usuario={null}
      drone={null}
      modelo={null}
      isAdmin={true}
      isNew={false}
      onSave={jest.fn()}
      onDelete={jest.fn()}
      onChangeState={jest.fn()}
      onUploadFoto={jest.fn()}
      onDeleteFoto={jest.fn()}
      onUploadDocumento={jest.fn()}
      onDeleteDocumento={jest.fn()}
    >
      {children}
    </ReparacionProvider>
  );
  
  it('should provide reparacion context', () => {
    const { result } = renderHook(() => useReparacion(), { wrapper });
    
    expect(result.current.reparacion).toEqual(mockReparacion);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.hasChanges).toBe(false);
  });
  
  it('should detect changes when field is updated', () => {
    const { result } = renderHook(() => useReparacion(), { wrapper });
    
    act(() => {
      result.current.updateField('EmailUsu', 'newemail@example.com');
    });
    
    expect(result.current.hasChanges).toBe(true);
    expect(result.current.reparacion.data.EmailUsu).toBe('newemail@example.com');
  });
  
  it('should validate required fields', () => {
    const { result } = renderHook(() => useReparacion(), { wrapper });
    
    act(() => {
      result.current.updateField('EmailUsu', '');
    });
    
    expect(result.current.validationErrors.EmailUsu).toBeDefined();
    expect(result.current.canSave).toBe(false);
  });
});
```

---

## 10. Storybook Ejemplo

```typescript
// GeneralTab.stories.tsx
import React from 'react';
import { Meta, Story } from '@storybook/react';
import { ReparacionProvider } from '../ReparacionContext';
import GeneralTab from './GeneralTab';

export default {
  title: 'Reparacion/Tabs/GeneralTab',
  component: GeneralTab,
  decorators: [
    (Story) => (
      <ReparacionProvider {...mockContextValue}>
        <Story />
      </ReparacionProvider>
    ),
  ],
} as Meta;

const mockContextValue = {
  reparacion: {
    id: 'story-id',
    data: {
      EstadoRep: 'Aceptado',
      NombreUsu: 'Juan',
      ApellidoUsu: 'Pérez',
      EmailUsu: 'juan@example.com',
      TelefonoUsu: '+54 9 11 1234-5678',
      ModeloDroneNameRep: 'DJI Mavic 3 Pro',
      DescripcionUsuRep: 'El drone no enciende',
    }
  },
  // ... resto del contexto
};

export const Default: Story = () => <GeneralTab />;

export const EstadoLegacy: Story = () => (
  <ReparacionProvider
    {...mockContextValue}
    reparacion={{
      ...mockContextValue.reparacion,
      data: {
        ...mockContextValue.reparacion.data,
        EstadoRep: 'Reparar',
      }
    }}
  >
    <GeneralTab />
  </ReparacionProvider>
);

export const SinUsuario: Story = () => (
  <ReparacionProvider
    {...mockContextValue}
    usuario={null}
  >
    <GeneralTab />
  </ReparacionProvider>
);
```

---

**Última actualización:** 17 de noviembre de 2025  
**Versión:** 1.0

