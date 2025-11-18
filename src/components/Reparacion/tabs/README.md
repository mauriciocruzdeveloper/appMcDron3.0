# Tabs - Reparación

Esta carpeta contiene los componentes de cada tab del workflow de reparación.

## Tabs Disponibles

### GeneralTab/
**Tab 1: Información General**
- Información de cliente
- Información de drone
- Anotaciones confidenciales
- Enlaces a Drive

### DiagnosticoTab/
**Tab 2: Diagnóstico**
- Consulta inicial
- Recepción
- Revisión técnica

### PresupuestoTab/
**Tab 3: Presupuesto**
- Intervenciones
- Cálculo de presupuesto
- Aceptar/Rechazar presupuesto

### ReparacionTab/
**Tab 4: Reparación**
- Descripción técnica
- Estado de reparación
- Finalización

### GaleriaTab/
**Tab 5: Galería**
- Fotos antes/después
- Galería de imágenes
- Gestión de fotos

### IntervencionesTab/
**Tab 6: Intervenciones**
- Lista de intervenciones técnicas
- Historial de trabajos

### FinalizacionTab/
**Tab 7: Finalización y Entrega**
- Información de entrega
- Seguimiento
- Documentos finales

## Convenciones

- Cada tab es un componente independiente
- Reciben props del container
- No acceden a Redux directamente
- Pueden tener sub-componentes en su carpeta
- Usar lazy loading cuando sea posible
