# Custom Hooks - Reparación

Esta carpeta contiene los custom hooks reutilizables para el componente de Reparación.

## Hooks Disponibles

### useReparacionForm
Hook principal para gestionar el estado del formulario de reparación.

**Responsabilidades:**
- Gestión de estado del formulario
- Dirty checking
- Validación
- Handlers de guardar/cancelar

### useReparacionValidation
Hook para validaciones del formulario.

**Responsabilidades:**
- Validar campos requeridos
- Validar longitudes máximas
- Validar formatos (email, teléfono, etc)
- Retornar errores de validación

### useEstadoTransition
Hook para gestionar transiciones de estado.

**Responsabilidades:**
- Validar si se puede avanzar a un estado
- Ejecutar transición de estado
- Enviar emails automáticos en transiciones

### useFileUpload
Hook para gestionar subida de archivos.

**Responsabilidades:**
- Subir fotos
- Subir documentos
- Eliminar archivos
- Validar tamaños y tipos

## Convenciones

- Todos los hooks deben empezar con `use`
- Cada hook debe tener su archivo de tests correspondiente
- Documentar con JSDoc todos los hooks públicos
- Retornar objetos con nombres descriptivos
