# Plan de Tareas - Refactorización Componente Reparación

**Change ID:** `refactor-reparacion-component`  
**Esfuerzo Total:** 60-80 horas (5-6 semanas)  
**Fases:** 6 (Phase 0-5)

---

## 📊 Resumen de Fases

```
Phase 0: Preparación           ████░░░░░░  3-4 días   (3-6 horas)
Phase 1: Infraestructura      ████████░░  1 semana  (15-20 horas)
Phase 2: Tabs Core            ████████████████  2 semanas  (25-30 horas)
Phase 3: Tabs Avanzados       ████████░░  1 semana  (10-15 horas)
Phase 4: Migración & Testing  ████████░░  1 semana  (10-15 horas)
Phase 5: Deprecación          ████░░░░░░  3-5 días   (3-5 horas)
```

---

## Phase 0: Preparación (3-4 días, 3-6 horas)

### Objetivo
Establecer la base técnica y organizativa para el proyecto de refactorización.

### T0.1: Setup de Estructura de Carpetas

**Effort:** 1 hora  
**Priority:** P0 (Bloqueante)

```bash
# Crear estructura completa
mkdir -p src/components/Reparacion/{hooks,components,tabs}
mkdir -p src/components/Reparacion/components/{Header,Tabs,Shared}
mkdir -p src/components/Reparacion/tabs/{GeneralTab,DiagnosticoTab,PresupuestoTab,ReparacionTab,GaleriaTab,IntervencionesTab,FinalizacionTab}
```

**Checklist:**
- [ ] Tests unitarios
- [ ] Integración con Tabs
- [ ] Responsive design

**Validation:**
```bash
tree src/components/Reparacion -L 3
```

---

### T0.2: Configuración de Testing

**Effort:** 2 horas  
**Priority:** P0 (Bloqueante)

**Files:**
- `src/setupTests.ts` (actualizar)
- `jest.config.js` (actualizar)
- `src/__tests__/testUtils.tsx` (crear)

**Checklist:**
- [ ] Configurar React Testing Library
- [ ] Setup de mocks para contexto
- [ ] Helpers de testing (renderWithContext, etc)
- [ ] Template de test para cada tipo de componente

**Validation:**
```bash
npm test -- --coverage --watchAll=false
```

---

### T0.3: Documentación del Estado Actual

**Effort:** 2-3 horas  
**Priority:** P1

**Files:**
- `openspec/changes/refactor-reparacion-component/CURRENT_STATE.md`

**Checklist:**
```

**Checklist:**
- [ ] Mapear todas las funciones actuales
- [ ] Documentar flujos críticos
- [ ] Identificar dependencias externas
- [ ] Listar edge cases conocidos

---

## Phase 1: Infraestructura Base (1 semana, 15-20 horas)

---

### T0.4: Setup de Storybook

**Effort:** 2 horas  
**Priority:** P2

```bash
npx sb init
```

**Checklist:**
- [ ] Instalar Storybook
- [ ] Configurar para React 17
- [ ] Crear template de stories
- [ ] Documentar cómo agregar stories

**Validation:**
```bash
npm run storybook
```

---

## Phase 1: Infraestructura Base (1 semana, 15-20 horas)

### T1.1: Context y Provider

**Effort:** 4 horas  
**Priority:** P0 (Bloqueante)  
**Files:**
- `src/components/Reparacion/ReparacionContext.tsx` (200 líneas)
- `src/components/Reparacion/__tests__/ReparacionContext.test.tsx`

**Implementation:**

```typescript
// ReparacionContext.tsx
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
  
  // Acciones
  updateField: (field: string, value: any) => void;
  save: () => Promise<void>;
  delete: () => Promise<void>;
  cambiarEstado: (nuevoEstado: string) => Promise<void>;
  
  // Upload
  uploadFoto: (file: File) => Promise<void>;
  deleteFoto: (url: string) => Promise<void>;
  uploadDocumento: (file: File) => Promise<void>;
  deleteDocumento: (url: string) => Promise<void>;
  
  // Validaciones
  canSave: boolean;
  canDelete: boolean;
  canChangeState: (estado: string) => boolean;
  
  // Helpers
  formatPrice: (price: number) => string;
  formatDate: (timestamp: number) => string;
}

export const ReparacionContext = createContext<ReparacionContextValue | null>(null);

export function useReparacion() {
  const context = useContext(ReparacionContext);
  if (!context) {
    throw new Error('useReparacion must be used within ReparacionProvider');
  }
  return context;
}

export function ReparacionProvider({ children, reparacionId }) {
  // Implementation...
}
```

**Checklist:**
- [ ] Definir interface completa del contexto
- [ ] Implementar ReparacionProvider
- [ ] Implementar useReparacion hook
- [ ] Tests unitarios (>80% coverage)
- [ ] Documentación JSDoc completa

**Tests:**
- Inicialización correcta del contexto
- updateField actualiza estado
- hasChanges detecta cambios
- Validaciones funcionan correctamente
- Error si se usa fuera del Provider

---

### T1.2: Custom Hooks - Data Management

**Effort:** 4 horas  
**Priority:** P0 (Bloqueante)  
**Files:**
- `src/components/Reparacion/hooks/useReparacionData.ts` (100 líneas)
- `src/components/Reparacion/hooks/useReparacionActions.ts` (150 líneas)
- `src/components/Reparacion/hooks/__tests__/*.test.ts`

**useReparacionData.ts:**
```typescript
export function useReparacionData(id: string, isNew: boolean) {
  const dispatch = useAppDispatch();
  const reparacion = useAppSelector(selectReparacionById(id));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isNew && !reparacion) {
      loadReparacion();
    }
  }, [id, isNew]);
  
  return {
    data: reparacion,
    loading,
    error,
    reload: loadReparacion
  };
}
```

**useReparacionActions.ts:**
```typescript
export function useReparacionActions(id: string) {
  const dispatch = useAppDispatch();
  const { openModal } = useModal();
  
  const save = useCallback(async (reparacion: ReparacionType) => {
    // Implementation
  }, [dispatch, openModal]);
  
  const cambiarEstado = useCallback(async (nuevoEstado: string) => {
    // Implementation
  }, []);
  
  // ... más acciones
  
  return {
    save,
    delete: deleteReparacion,
    cambiarEstado,
    uploadFoto,
    // ...
  };
}
```

**Checklist:**
- [ ] Implementar useReparacionData
- [ ] Implementar useReparacionActions
- [ ] Tests unitarios con mocks
- [ ] Manejo de errores
- [ ] Loading states

---

### T1.3: Hook - Estado Transitions

**Effort:** 3 horas  
**Priority:** P1  
**Files:**
- `src/components/Reparacion/hooks/useEstadoTransitions.ts` (100 líneas)

```typescript
export function useEstadoTransitions(estadoActual: string) {
  const isAdmin = useAppSelector(state => state.app.usuario?.data.Admin);
  
  const puedeAvanzarA = useCallback((nombreEstado: string): boolean => {
    if (!isAdmin) return false;
    
    const estadoActualObj = obtenerEstadoSeguro(estadoActual);
    const estadoDestino = estados[nombreEstado];
    
    // Lógica de transiciones...
    
    return true; // o false
  }, [estadoActual, isAdmin]);
  
  const getEstadosSiguientes = useCallback(() => {
    return Object.keys(estados).filter(estado => puedeAvanzarA(estado));
  }, [puedeAvanzarA]);
  
  return {
    puedeAvanzarA,
    getEstadosSiguientes,
    canGoBack: puedeAvanzarA(getPreviousState(estadoActual))
  };
}
```

**Checklist:**
- [ ] Implementar lógica de transiciones
- [ ] Tests para todas las transiciones válidas
- [ ] Tests para transiciones inválidas
- [ ] Manejo de casos especiales (Repuestos ⇄ Aceptado)

---

### T1.4: Container Principal

**Effort:** 4 horas  
**Priority:** P0 (Bloqueante)  
**Files:**
- `src/components/Reparacion/Reparacion.container.tsx` (250 líneas)
- `src/components/Reparacion/__tests__/Reparacion.container.test.tsx`

```typescript
export default function ReparacionContainer(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  
  const reparacionData = useReparacionData(id, isNew);
  const actions = useReparacionActions(id);
  
  const [activeTab, setActiveTab] = useState('general');
  
  if (reparacionData.loading) return <LoadingSpinner />;
  if (reparacionData.error) return <ErrorMessage error={reparacionData.error} />;
  
  const contextValue = {
    reparacion: reparacionData.data,
    actions,
    // ... resto del contexto
  };
  
  return (
    <ReparacionProvider value={contextValue}>
      <div className="reparacion-container">
        <ReparacionHeader />
        <ProgressBar />
        <TabNavigation
          tabs={getVisibleTabs(reparacionData.data.EstadoRep)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <TabPanel activeTab={activeTab}>
          <Suspense fallback={<LoadingSpinner />}>
            {renderActiveTab(activeTab)}
          </Suspense>
        </TabPanel>
        <QuickActions />
      </div>
    </ReparacionProvider>
  );
}
```

**Checklist:**
- [ ] Implementar container con routing
- [ ] Loading y error states
- [ ] Lazy loading de tabs
- [ ] Tests de integración
- [ ] Validar navigation funciona

---

### T1.5: Sistema de Tabs

**Effort:** 4 horas  
**Priority:** P0 (Bloqueante)  
**Files:**
- `src/components/Reparacion/components/Tabs/TabNavigation.tsx` (150 líneas)
- `src/components/Reparacion/components/Tabs/TabPanel.tsx` (50 líneas)

```typescript
// TabNavigation.tsx
interface Tab {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  visible: boolean;
}

export function TabNavigation({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="tab-navigation">
      {tabs.filter(t => t.visible).map(tab => (
        <button
          key={tab.id}
          className={cn('tab-button', { active: tab.id === activeTab })}
          onClick={() => onTabChange(tab.id)}
        >
          <i className={`bi bi-${tab.icon}`} />
          {tab.label}
          {tab.badge && <span className="badge">{tab.badge}</span>}
        </button>
      ))}
    </nav>
  );
}

// TabPanel.tsx
export function TabPanel({ activeTab, children }) {
  return (
    <div className="tab-panel" role="tabpanel">
      {children}
    </div>
  );
}
```

**Checklist:**
- [ ] Implementar TabNavigation
- [ ] Implementar TabPanel
- [ ] Soporte para badges
- [ ] Soporte para iconos
- [ ] Tests de navegación
- [ ] Accessibility (ARIA)

---

### T1.6: Header Components

**Effort:** 3 horas  
**Priority:** P1  
**Files:**
- `src/components/Reparacion/components/Header/ReparacionHeader.tsx` (100 líneas)
- `src/components/Reparacion/components/Header/ProgressBar.tsx` (80 líneas)
- `src/components/Reparacion/components/Header/QuickActions.tsx` (100 líneas)

**Checklist:**
- [ ] ReparacionHeader con info principal
- [ ] ProgressBar visual
- [ ] QuickActions (guardar, email, SMS, eliminar)
- [ ] Tests unitarios
- [ ] Stories en Storybook

---

### T1.7: Shared Components

**Effort:** 2 horas  
**Priority:** P2  
**Files:**
- `src/components/Reparacion/components/Shared/SectionCard.tsx`
- `src/components/Reparacion/components/Shared/EstadoBadge.tsx`
- `src/components/Reparacion/components/Shared/PriceDisplay.tsx`
- `src/components/Reparacion/components/Shared/DateField.tsx`

**Checklist:**
- [ ] SectionCard reusable
- [ ] EstadoBadge con colores
- [ ] PriceDisplay con formato
- [ ] DateField consistente
- [ ] Stories en Storybook

---

## Phase 2: Tabs Core (2 semanas, 25-30 horas)

### T2.1: General Tab

**Effort:** 6 horas  
**Priority:** P0 (Bloqueante)  
**Files:**
- `tabs/GeneralTab/GeneralTab.tsx` (200 líneas)
- `tabs/GeneralTab/ClienteSection.tsx` (100 líneas)
- `tabs/GeneralTab/DroneSection.tsx` (100 líneas)
- `tabs/GeneralTab/ConsultaSection.tsx` (80 líneas)

**Funcionalidad:**
- Datos del cliente (nombre, email, teléfono, ubicación)
- Selector de drone existente o nuevo
- Descripción del problema (DescripcionUsuRep)
- Fecha de consulta
- Botón para ir al perfil del usuario

**Checklist:**
- [ ] Implementar GeneralTab
- [ ] ClienteSection con todos los campos
- [ ] DroneSection con selector
- [ ] ConsultaSection con descripción
- [ ] Tests unitarios (cada sección)
- [ ] Integración con contexto
- [ ] Validaciones de campos

---

### T2.2: Diagnóstico Tab

**Effort:** 7 horas  
**Priority:** P0 (Bloqueante)  
**Files:**
- `tabs/DiagnosticoTab/DiagnosticoTab.tsx` (250 líneas)
- `tabs/DiagnosticoTab/RecepcionSection.tsx` (100 líneas)
- `tabs/DiagnosticoTab/RevisionSection.tsx` (100 líneas)
- `tabs/DiagnosticoTab/AutodiagnosticoButton.tsx` (80 líneas)

**Funcionalidad:**
- Datos de recepción (FeRecRep, NumeroSerieRep)
- Revisión técnica
- Diagnóstico técnico (DiagnosticoRep)
- Botón de autodiagnóstico
- Cambio de estado a Revisado/Presupuestado

**Checklist:**
- [ ] Implementar DiagnosticoTab
- [ ] RecepcionSection con fecha y serie
- [ ] RevisionSection
- [ ] AutodiagnosticoButton funcional
- [ ] Tests unitarios
- [ ] Integración con generarAutoDiagnostico()

---

### T2.3: Presupuesto Tab

**Effort:** 7 horas  
**Priority:** P0 (Bloqueante)  
**Files:**
- `tabs/PresupuestoTab/PresupuestoTab.tsx` (250 líneas)
- `tabs/PresupuestoTab/PresupuestoDiagnostico.tsx` (80 líneas)
- `tabs/PresupuestoTab/PresupuestoReparacion.tsx` (100 líneas)
- `tabs/PresupuestoTab/PresupuestoFinal.tsx` (100 líneas)
- `tabs/PresupuestoTab/CalculadoraPresupuesto.tsx` (120 líneas)

**Funcionalidad:**
- Presupuesto diagnóstico (PresuDiRep)
- Presupuesto reparación (PresuReRep)
- Presupuesto mano de obra (PresuMoRep)
- Presupuesto final (PresuFiRep)
- Calculadora automática (intervenciones + repuestos + mano de obra)
- Botones Aceptar/Rechazar presupuesto

**Checklist:**
- [ ] Implementar PresupuestoTab
- [ ] Cada sección de presupuesto
- [ ] Calculadora con totales automáticos
- [ ] Botones de aceptar/rechazar
- [ ] Tests de cálculos
- [ ] Validaciones de montos

---

### T2.4: Reparación Tab

**Effort:** 6 horas  
**Priority:** P0 (Bloqueante)  
**Files:**
- `tabs/ReparacionTab/ReparacionTab.tsx` (200 líneas)
- `tabs/ReparacionTab/DescripcionTecnica.tsx` (80 líneas)
- `tabs/ReparacionTab/RepuestosSection.tsx` (100 líneas)
- `tabs/ReparacionTab/FotosAntesDepues.tsx` (120 líneas)

**Funcionalidad:**
- Descripción técnica (DescripcionTecRep)
- Gestión de repuestos (TxtRepuestosRep, ObsRepuestos, RepuestosSolicitados)
- Fotos antes/después
- Botón pausar por Repuestos
- Botón Repuestos Llegaron

**Checklist:**
- [ ] Implementar ReparacionTab
- [ ] DescripcionTecnica con textarea
- [ ] RepuestosSection con campos nuevos
- [ ] FotosAntesDepues con selección de galería
- [ ] Botones de estado Repuestos
- [ ] Tests unitarios

---

## Phase 3: Tabs Avanzados (1 semana, 10-15 horas)

### T3.1: Galería Tab

**Effort:** 4 horas  
**Priority:** P1  
**Files:**
- `tabs/GaleriaTab/GaleriaTab.tsx` (150 líneas)
- `tabs/GaleriaTab/FotosGrid.tsx` (100 líneas)
- `tabs/GaleriaTab/FotoUploader.tsx` (100 líneas)

**Funcionalidad:**
- Grid de todas las fotos (urlsFotos)
- Upload de múltiples fotos
- Lightbox para ver fotos
- Eliminar fotos
- Marcar fotos como antes/después

**Checklist:**
- [ ] Implementar GaleriaTab
- [ ] FotosGrid con layout responsive
- [ ] FotoUploader con drag & drop
- [ ] Integración con ImageGallery existente
- [ ] Tests de upload/delete

---

### T3.2: Intervenciones Tab

**Effort:** 4 horas  
**Priority:** P1  
**Files:**
- `tabs/IntervencionesTab/IntervencionesTab.tsx` (200 líneas)
- `tabs/IntervencionesTab/IntervencionItem.tsx` (80 líneas)
- `tabs/IntervencionesTab/AgregarIntervencion.tsx` (100 líneas)

**Funcionalidad:**
- Lista de intervenciones aplicadas
- Total de intervenciones
- Agregar/editar intervención
- Eliminar intervención
- Selector de intervención desde catálogo

**Checklist:**
- [ ] Implementar IntervencionesTab
- [ ] IntervencionItem con detalles
- [ ] AgregarIntervencion con modal/form
- [ ] Total automático
- [ ] Tests unitarios

---

### T3.3: Finalización Tab

**Effort:** 5 horas  
**Priority:** P1  
**Files:**
- `tabs/FinalizacionTab/FinalizacionTab.tsx` (250 líneas)
- `tabs/FinalizacionTab/CobroSection.tsx` (100 líneas)
- `tabs/FinalizacionTab/EnvioSection.tsx` (120 líneas)
- `tabs/FinalizacionTab/DocumentosSection.tsx` (100 líneas)

**Funcionalidad:**
- Fecha de finalización (FeFinRep)
- Datos de cobro (estado Cobrado)
- Envío (FeEntRep, TxtEntregaRep, SeguimientoEntregaRep)
- Documentos adjuntos (urlsDocumentos)
- Botones de email (recibo, reparado, diagnosticado)

**Checklist:**
- [ ] Implementar FinalizacionTab
- [ ] CobroSection
- [ ] EnvioSection con seguimiento
- [ ] DocumentosSection con upload/delete
- [ ] Botones de email
- [ ] Tests unitarios

---

## Phase 4: Migración & Testing (1 semana, 10-15 horas)

### T4.1: Feature Flag Implementation

**Effort:** 2 horas  
**Priority:** P0 (Bloqueante)  
**Files:**
- `src/config/feature-flags.ts` (50 líneas)
- `src/routes/index.tsx` (actualizar)

```typescript
// feature-flags.ts
export const USE_NEW_REPARACION_COMPONENT = 
  process.env.REACT_APP_NEW_REPARACION === 'true' ||
  localStorage.getItem('beta_new_reparacion') === 'true';

export function enableNewReparacion() {
  localStorage.setItem('beta_new_reparacion', 'true');
}

export function disableNewReparacion() {
  localStorage.removeItem('beta_new_reparacion');
}

// routes/index.tsx
<Route path="/reparaciones/:id">
  {USE_NEW_REPARACION_COMPONENT 
    ? <ReparacionContainer /> 
    : <ReparacionComponentOld />}
</Route>
```

**Checklist:**
- [ ] Implementar feature flag
- [ ] Toggle en UI para beta testers
- [ ] Logging de uso de cada versión
- [ ] Documentar cómo activar/desactivar

---

### T4.2: Tests de Integración

**Effort:** 4 horas  
**Priority:** P0 (Bloqueante)  
**Files:**
- `src/components/Reparacion/__tests__/integration/*.test.tsx`

**Tests:**
- Flujo completo: crear reparación → guardar → cambiar estado
- Navegación entre tabs
- Upload de fotos/documentos
- Validaciones cross-tab
- Persistencia de cambios

**Checklist:**
- [ ] Tests de flujo completo
- [ ] Tests de navegación
- [ ] Tests de upload
- [ ] Tests de validaciones
- [ ] Coverage >80%

---

### T4.3: Tests E2E con Cypress

**Effort:** 4 horas  
**Priority:** P1  
**Files:**
- `cypress/integration/reparacion/*.spec.ts`

**Scenarios:**
- Happy path: consulta → diagnóstico → presupuesto → reparación → finalización
- Upload de fotos
- Cambio de estados
- Validaciones de campos
- Responsive en mobile

**Checklist:**
- [ ] Setup Cypress
- [ ] Test de happy path
- [ ] Tests de edge cases
- [ ] Tests responsive
- [ ] CI/CD integration

---

### T4.4: Performance Testing

**Effort:** 2 horas  
**Priority:** P2  
**Files:**
- `src/components/Reparacion/__tests__/performance.test.tsx`

**Metrics:**
- Initial load time <2s
- Tab switch <200ms
- Re-renders optimizados
- Bundle size <500KB

**Checklist:**
- [ ] Lighthouse audit (>90)
- [ ] Bundle analyzer
- [ ] React DevTools Profiler
- [ ] Memory leak check

---

### T4.5: Documentación Técnica

**Effort:** 3 horas  
**Priority:** P1  
**Files:**
- `openspec/changes/refactor-reparacion-component/ARCHITECTURE.md`
- `openspec/changes/refactor-reparacion-component/API_DOCS.md`
- `openspec/changes/refactor-reparacion-component/MIGRATION_GUIDE.md`

**Checklist:**
- [ ] Documentar arquitectura completa
- [ ] API de cada componente
- [ ] Guía de migración
- [ ] Troubleshooting guide
- [ ] Ejemplos de uso

---

## Phase 5: Deprecación (3-5 días, 3-5 horas)

### T5.1: Rollout a 100%

**Effort:** 1 hora  
**Priority:** P0 (Bloqueante)

**Proceso:**
1. Beta testing con usuarios seleccionados (10%)
2. Gradual rollout (25% → 50% → 75%)
3. Monitoreo de errores en cada etapa
4. 100% cuando no hay issues críticos

**Checklist:**
- [ ] Beta testing completado
- [ ] 0 bugs críticos
- [ ] 0 regresiones reportadas
- [ ] Feedback positivo de usuarios

---

### T5.2: Eliminar Componente Viejo

**Effort:** 2 horas  
**Priority:** P1

**Files a eliminar:**
- `src/components/Reparacion.component.tsx` (viejo, 1,756 líneas)
- Tests del componente viejo
- Feature flag

**Checklist:**
- [ ] Backup del componente viejo
- [ ] Eliminar archivo
- [ ] Eliminar tests viejos
- [ ] Eliminar feature flag
- [ ] Actualizar imports en toda la app
- [ ] Verificar build exitoso

---

### T5.3: Release Notes

**Effort:** 1 hora  
**Priority:** P2

**Files:**
- `CHANGELOG.md` (actualizar)
- `openspec/changes/refactor-reparacion-component/RELEASE_NOTES.md`

**Content:**
- Cambios principales
- Mejoras de UX
- Mejoras de performance
- Breaking changes (ninguno esperado)
- Migration notes (para devs)

**Checklist:**
- [ ] Escribir release notes
- [ ] Actualizar CHANGELOG
- [ ] Comunicar a equipo
- [ ] Documentar lecciones aprendidas

---

## 📊 Métricas de Éxito

### Coverage de Tests

```
Target: >80% coverage

Unit Tests:
- Hooks: >90%
- Components: >80%
- Context: >90%

Integration Tests:
- User flows: 100% happy paths
- Edge cases: >80%

E2E Tests:
- Critical paths: 100%
```

### Performance

```
Target Metrics:

Initial Load: <2s (currently ~3-4s)
Tab Switch: <200ms
Memory Usage: <10MB per instance
Bundle Size: <500KB (gzipped)
Lighthouse: >90 (currently ~75)
```

### Code Quality

```
Target Metrics:

Cyclomatic Complexity: <15 per file
Lines per File: <300
Functions per File: <20
Test Coverage: >80%
TypeScript Errors: 0
ESLint Warnings: <10
```

---

## 🚨 Dependencias Críticas

### Bloqueantes (P0)
- T0.1 → Todo (estructura de carpetas)
- T1.1 → T1.2, T1.3 (contexto base)
- T1.4 → T1.5, T1.6 (container)
- T2.* → T4.1 (tabs antes de migración)

### No Bloqueantes (P1-P2)
- T1.7 (Shared components) - pueden crearse según necesidad
- T3.* (Tabs avanzados) - pueden implementarse después de migración

---

## 🎯 Checklist de Cada Fase

### Al Finalizar Cada Phase

- [ ] Todos los tests passing
- [ ] Coverage >80%
- [ ] Code review aprobado
- [ ] Documentación actualizada
- [ ] No errores TypeScript
- [ ] No warnings ESLint críticos
- [ ] Performance validada
- [ ] Demo funcional

---

## 📅 Cronograma Sugerido

```
Semana 1: Phase 0 + Phase 1
├── Lun-Mar: T0.1, T0.2, T0.3
├── Mié-Jue: T1.1, T1.2, T1.3
└── Vie: T1.4, T1.5, T1.6, T1.7

Semana 2-3: Phase 2
├── Semana 2:
│   ├── Lun-Mar: T2.1 (GeneralTab)
│   ├── Mié-Jue: T2.2 (DiagnosticoTab)
│   └── Vie: T2.3 inicio (PresupuestoTab)
└── Semana 3:
    ├── Lun-Mar: T2.3 fin + T2.4 (ReparacionTab)
    └── Mié-Vie: Testing y ajustes

Semana 4: Phase 3
├── Lun-Mar: T3.1 (GaleriaTab)
├── Mié: T3.2 (IntervencionesTab)
├── Jue-Vie: T3.3 (FinalizacionTab)

Semana 5: Phase 4
├── Lun: T4.1 (Feature flag)
├── Mar-Mié: T4.2, T4.3 (Tests)
├── Jue: T4.4 (Performance)
└── Vie: T4.5 (Docs)

Semana 6: Phase 5 + Buffer
├── Lun-Mar: Beta testing
├── Mié: T5.1 (Rollout)
├── Jue: T5.2 (Cleanup)
├── Vie: T5.3 (Release) + Retrospective
```

---

## 📝 Notas Finales

### Priorización Flexible

Si el tiempo es limitado, se puede reducir alcance:

**Must Have (MVP):**
- Phase 0-1: Infraestructura
- Phase 2: Tabs Core (T2.1, T2.2, T2.3, T2.4)
- Phase 4: Migración básica (T4.1, T4.2)

**Should Have:**
- Phase 3: Tabs Avanzados
- Phase 4: Tests E2E y Performance
- Phase 5: Deprecación completa

**Could Have:**
- Documentación exhaustiva
- Optimizaciones de performance avanzadas

### Riesgos y Mitigaciones

Ver sección de Riesgos en `proposal.md`

---

**Última actualización:** 17 de noviembre de 2025  
**Versión:** 1.0  
**Status:** ⏳ Ready for Implementation

