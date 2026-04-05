# Project Context

## Purpose
**AppMcDron 3.0** es una aplicación híbrida (web/móvil) diseñada para gestionar un negocio de reparación de drones. Optimiza la administración de presupuestos, reparaciones, inventario de repuestos, modelos de drones, intervenciones técnicas y comunicación con clientes.

### Objetivos principales:
- Gestionar el ciclo completo de reparaciones de drones (desde consulta hasta entrega)
- Administrar usuarios, presupuestos y estados de reparación
- Sistema de mensajería entre cliente y administrador
- Notificaciones para cambios de estado y eventos importantes
- Trabajar con filosofía **Local First** (datos locales sincronizados con la nube)

### Etapas de desarrollo:
1. ✅ **Gestión de reparaciones y usuarios** (consultas, presupuestos, estados)
2. 🔄 **Mensajería y notificaciones** (comunicación cliente-administrador)
3. 📋 **Expansión de notificaciones** (cambios de estado, envío de presupuestos, recepción/envío de drones)
4. 🚀 **Mejoras y optimización** (rendimiento y nuevas funcionalidades)

## Tech Stack

### Frontend
- **React 17.0.2** - Librería UI principal
- **TypeScript 4.5.5** - Tipado estático
- **Redux Toolkit 2.5.0** - Gestión de estado global
- **React Router Dom 6.14.1** - Enrutamiento SPA
- **React Bootstrap 2.0.2** & **Bootstrap 5.1.3** - Framework UI
- **React Bootstrap Icons 1.6.1** - Iconografía
- **Chart.js 3.9.1** & **React ChartJS 2** - Gráficos y estadísticas
- **React Select 5.2.2** - Selectores avanzados
- **React Textarea Autosize 8.3.3** - Inputs adaptativos
- **React Floating Action Button** - FAB para acciones rápidas

### Backend y Almacenamiento
- **Firebase 9.5.0** - Backend as a Service
  - Firestore (base de datos NoSQL)
  - Firebase Authentication
  - Firebase Storage (imágenes y documentos)
  - Persistencia offline habilitada (IndexedDB)
- **Supabase 2.49.4** (en migración/evaluación)

### Plataforma Móvil
- **Apache Cordova** - Wrapper para apps nativas
  - Soporte Android (principal)
  - Soporte Browser (desarrollo)
  - Potencial iOS

### Plugins Cordova
- `cordova-plugin-local-notification` - Notificaciones locales
- `cordova-plugin-email-composer` - Composición de emails
- `cordova-sms-plugin` - Envío de SMS
- `cordova-plugin-badge` - Badges en app
- `cordova-plugin-device` - Información del dispositivo
- `cordova-plugin-whitelist` - Seguridad CSP

### Build Tools
- **React Scripts 4.0.3** - Build system
- **Gradle 7.6** - Build para Android
- **JDK 8** - Compilación Java/Android

## Project Conventions

### Code Style

#### Naming Conventions
- **Componentes React**: PascalCase con sufijo `.component.tsx`
  - Ejemplo: `Estadisticas.component.tsx`, `Reparacion.component.tsx`
- **Containers**: PascalCase con sufijo `.container.tsx`
  - Ejemplo: `Login.container.tsx`, `Mensajes.container.tsx`
- **Presentational Components**: PascalCase con sufijo `.presentational.tsx`
  - Ejemplo: `Login.presentational.tsx`
- **Custom Hooks**: camelCase con prefijo `use`
  - Ejemplo: `useEstadisticas.ts`, `useModal.ts`
- **Types/Interfaces**: PascalCase
  - Ejemplo: `ReparacionType`, `DataReparacion`, `Reparaciones`
- **Redux Slices**: camelCase con sufijos `.actions.ts`, `.selectors.ts`, `.slice.ts`
- **Archivos de datos**: camelCase
  - Ejemplo: `estados.ts`, `modelosDrone.ts`

#### File Organization
```
src/
├── components/          # Componentes React
│   ├── Modal/          # Sub-componentes modulares
│   └── Reparacion/     # Componentes de dominio
├── hooks/              # Custom hooks
├── redux-tool-kit/     # Estado global Redux
│   ├── app/           # Slice de aplicación
│   ├── reparacion/    # Slice de reparaciones
│   └── store.ts       # Store principal
├── types/              # Definiciones TypeScript
├── usecases/           # Casos de uso / lógica de negocio
├── persistencia/       # Capa de persistencia
├── firebase/           # Configuración Firebase
├── utils/              # Utilidades compartidas
├── routes/             # Configuración de rutas
├── datos/              # Datos estáticos/configuración
├── css/                # Estilos globales
└── img/                # Assets de imágenes
```

#### TypeScript
- Strict mode habilitado
- Interfaces para props de componentes
- Tipos explícitos en funciones públicas
- Uso de tipos genéricos en Redux y selectores

#### Component Patterns
- Componentes funcionales con hooks
- Props destructuring
- Export default para componentes principales
- Named exports para utilidades

### Architecture Patterns

#### 1. **Local First Architecture**
- Datos almacenados localmente en IndexedDB vía Firebase Persistence
- Sincronización automática con Firestore cuando hay conexión
- La app funciona offline y sincroniza al reconectar

#### 2. **Redux Flux Pattern (Modernizado)**
```
Component → Action Creator → Async Logic → Dispatch → Reducer → State Update → Component Re-render
```

#### 3. **Container/Presentational Pattern** (En refactorización a Custom Hooks)
- **Containers**: Lógica y conexión con Redux
- **Presentational**: Solo UI y props
- **Migración**: Moviendo lógica a custom hooks para mejor reutilización

#### 4. **Selector Pattern**
- Selectores memoizados con `createSelector` de Redux Toolkit
- Selectores base (O(1)) y derivados
- Documentación de complejidad algorítmica en selectores
- Ejemplo: `selectReparacionesArray`, `selectReparacionesFiltradas`

#### 5. **Subscription Pattern**
- Firebase listeners para actualizaciones en tiempo real
- Gestión automática de suscripciones/desuscripciones
- Actualización automática del store Redux cuando cambian los datos en Firebase

#### 6. **Use Cases Layer**
- Capa de lógica de negocio separada de componentes
- Ejemplo: `getReparaciones.ts`, operaciones CRUD

#### 7. **Type Safety**
- Interfaces para estructuras de datos
- Tipos para diccionarios optimizados (`Reparaciones: {[id: string]: ReparacionType}`)
- DTOs explícitos para Firebase

### Testing Strategy
- Framework: Jest + React Testing Library
- Testing scripts disponibles: `npm test`
- **Estado actual**: Tests básicos configurados, pendiente expansión
- **Próximos pasos**: 
  - Tests unitarios para hooks personalizados
  - Tests de integración para flujos de reparación
  - Tests de selectores Redux

### Git Workflow
- **Branch principal**: `master`
- **Commits**: Descriptivos en español
- **Workflow**: Feature development directo en master (proyecto individual)
- **Repositorio**: `mauriciocruzdeveloper/appMcDron3.0`

## Domain Context

### Dominio de Negocio: Reparación de Drones

#### Entidades Principales

1. **Reparación** (`ReparacionType`)
   - **Estados principales**: Consulta → Respondido → Transito → Recibido → Revisado → Presupuestado → Aceptado → **Repuestos** ⇄ Aceptado → Reparado → Diagnosticado → Cobrado → Enviado → Finalizado
   - **Estados terminales**: Rechazado, Cancelado, Abandonado
   - **Estados legacy**: Reparar, Entregado, Venta, Liquidación
   - **Estado "Repuestos" (Etapa 8.5)**:
     - **Propósito**: Pausar reparaciones cuando faltan repuestos necesarios
     - **Transición bidireccional**: Aceptado ⇄ Repuestos (permite volver a Aceptado cuando llegan los repuestos)
     - **Color**: #009688 (teal)
     - **Prioridad**: 1 (estado activo de trabajo)
     - **Acción**: "Esperar llegada de repuestos"
     - **Campos específicos**:
       - `ObsRepuestos`: Observaciones sobre repuestos faltantes (max 2000 caracteres)
       - `RepuestosSolicitados`: Array de IDs de repuestos pedidos (max 50 items)
     - **Database (Supabase)**: 
       - `parts_notes`: TEXT (mapea a ObsRepuestos)
       - `requested_parts_ids`: TEXT[] (mapea a RepuestosSolicitados)
     - **UI**: Widget en dashboard "⏸️ Esperando Repuestos" con contador de reparaciones pausadas
   - **Campos financieros**:
     - `PresuDiRep`: Presupuesto de diagnóstico
     - `PresuReRep`: Presupuesto de reparación
     - `PresuFiRep`: Presupuesto final
     - `PresuMoRep`: Presupuesto de mano de obra
   - **Campos temporales**:
     - `FeConRep`: Fecha de consulta
     - `FeRecRep`: Fecha de recepción
     - `FeFinRep`: Fecha de finalización
     - `FeEntRep`: Fecha de entrega

2. **Usuario** (`Usuario`)
   - Tipos: Administrador, Invitado, Cliente
   - Vinculado a reparaciones vía `UsuarioRep` (ID)

3. **Drone** (`Drone`)
   - Vinculado a modelo (`ModeloDroneNameRep`)
   - Número de serie único

4. **Modelo de Drone** (`ModeloDrone`)
   - Catálogo de modelos (DJI, etc.)
   - Usado para presupuestos y repuestos

5. **Repuesto** (`Repuesto`)
   - Inventario de partes
   - Vinculado a modelos de drones

6. **Intervención** (`Intervencion`)
   - Registro de trabajos técnicos
   - Asociado a reparaciones vía `IntervencionesIds`

#### Reglas de Negocio

1. **Cálculo de Ingresos**:
   - Si existe `PresuDiRep > 0`: usar ese monto
   - Sino, si `PresuFiRep > 0`:
     - Si estado es Finalizado/Enviado/Cobrado: usar `PresuFiRep`
     - Sino: usar `PresuReRep`

2. **Estados No Prioritarios**: 
   - "Entregado", "Liquidación", "Abandonado", "Respondido", "Finalizado", "Cancelado"
   - Usados en filtros de visualización

3. **Transiciones de Estado "Repuestos"**:
   - **Desde Aceptado → Repuestos**: Pausar reparación cuando faltan repuestos
   - **Desde Repuestos → Aceptado**: Reanudar cuando llegan los repuestos
   - **Validación**: ObsRepuestos tiene límite de 2000 caracteres
   - **Validación**: RepuestosSolicitados tiene límite de 50 items
   - **UI**: Botones bidireccionales ("⏸️ Pausar - Esperando Repuestos" y "✅ Repuestos Llegaron - Continuar Reparación")

4. **Persistencia Optimizada**:
   - Reparaciones almacenadas como diccionario `{[id: string]: ReparacionType}` para O(1) lookup
   - Conversión a array cuando se necesita iterar/filtrar

5. **Orden de Reparaciones Prioritarias (Pantalla de Inicio)**:
   - Solo se muestran reparaciones en estados: Consulta, Recibido, Revisado, Aceptado
   - Una reparación es **urgente** si supera el umbral de días desde su ingreso (`FeRecRep` o `FeConRep`):
     - Consulta: > 1 día
     - Recibido: > 2 días
     - Revisado: > 2 días
     - Aceptado: > 15 días
   - **Criterios de orden** (en orden de prioridad):
     1. Urgentes primero, no urgentes después
     2. Dentro de cada grupo: por estado (Consulta → Recibido → Revisado → Aceptado)
     3. Mismo estado: más antigua primero (fecha de ingreso ascendente)
   - Selector: `selectReparacionesAccionInmediata` en `reparacion.selectors.ts`

## Important Constraints

### Technical Constraints
1. **Node Version**: 14.19.0 (especificado en package.json)
2. **React Version**: 17.x (no migrado a 18 por compatibilidad Cordova)
3. **Gradle Version**: 7.6 (requerido para build Android)
4. **JDK Version**: 8 (requerido por Cordova Android)
5. **Firebase Persistence**: Cache ilimitado configurado
6. **TypeScript Strict Mode**: Habilitado
7. **Cordova Platforms**: Android 13.x, Browser 6.x

### Build Constraints
- APK build requiere firma con keystore
- Debe usar `--packageType=apk` (no AAB por defecto)
- ZipAlign y APKSigner requeridos para producción
- Variables de entorno requeridas:
  - `ANDROID_SDK_ROOT`
  - `JAVA_HOME`

### Performance Constraints
- Selectores deben ser memoizados (evitar re-renders)
- Colecciones grandes deben usar diccionarios
- Imágenes optimizadas para móvil
- Lazy loading considerado para rutas

### Business Constraints
- Datos sensibles de clientes (cumplir GDPR/LGPD eventualmente)
- Backup de reparaciones crítico
- Estados legacy deben mantenerse para datos históricos

## External Dependencies

### Backend Services
1. **Firebase (Principal)**
   - **Firestore**: Base de datos NoSQL
     - Colecciones: `reparaciones`, `usuarios`, `drones`, `repuestos`, `modelos`, `intervenciones`
     - Persistencia offline habilitada
     - Listeners en tiempo real
   - **Firebase Auth**: Autenticación de usuarios
     - Email/Password
   - **Firebase Storage**: Almacenamiento de archivos
     - Fotos de drones
     - Documentos de presupuestos/recibos
   - **Configuración**: `src/firebase/configProd.js`

2. **Supabase** (Evaluación/Migración)
   - Alternativa considerada para PostgreSQL
   - Actualmente en fase de prueba

### Build & Development Tools
- **NPM/PNPM**: Gestión de dependencias
- **Android Studio**: IDE para desarrollo Android
- **Gradle**: Build system Android
- **APK Signer**: Firma de aplicaciones
- **ADB (Android Debug Bridge)**: Deploy en dispositivos

### Scripts Disponibles
```json
{
  "start": "react-scripts start",      // Dev server React
  "build": "react-scripts build",      // Build producción web
  "test": "react-scripts test",        // Tests
  "eject": "react-scripts eject"       // Exponer config
}
```

### Comandos Cordova
- `cordova run browser`: Ejecutar en navegador
- `cordova build android --release`: Build APK release
- `cordova platform add android`: Agregar plataforma Android

### Known Issues & Workarounds
1. **cordova-plugin-firestore**: Error con `NonNull` en `RunTransactionHandler.java`
   - Solución: Importar manualmente la clase
2. **Firebase Persistence**: Puede fallar en algunos navegadores
   - Manejado con try/catch y fallback
3. **Caniuse-lite**: Puede quedar desactualizado
   - Actualizar periódicamente: `npx browserslist@latest --update-db`

### Environment Variables
Configuradas en scripts de build:
```bash
export ANDROID_SDK_ROOT="/home/mauricio/Android/Sdk/"
export JAVA_HOME="/usr/java/jdk1.8.0_202"
```

### URLs & Endpoints
- **Demo Web**: http://mauriciocruzdrones.com/demo (próximamente)
- **APK Dev**: http://mauriciocruzdrones.com/app/appmcdrondev.apk (próximamente)
- **Firebase Console**: Acceso vía configuración en `configProd.js`

---

## Notes for AI Assistants

- Usa **español** para commits, comentarios y documentación
- Al refactorizar, mantén compatibilidad con estados legacy
- Siempre considera el modo offline (Local First)
- Los selectores deben documentar su complejidad algorítmica
- Componentes nuevos siguen patrón funcional + hooks
- Tests son bienvenidos pero no bloquean desarrollo
- Prioriza legibilidad y mantenibilidad sobre optimización prematura
