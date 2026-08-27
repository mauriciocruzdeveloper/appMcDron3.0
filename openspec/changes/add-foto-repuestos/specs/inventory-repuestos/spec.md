## ADDED Requirements

### Requirement: Asociación de foto a repuesto
El sistema DEBE permitir asociar una foto identificatoria a cada repuesto del catálogo para facilitar su reconocimiento visual.

#### Scenario: Subir foto a un repuesto
- **WHEN** el usuario selecciona una imagen y la sube en el formulario del repuesto
- **THEN** la imagen se comprime y sube a Supabase Storage bajo la carpeta `REPUESTOS/{repuestoId}/foto/`
- **AND** la URL devuelta se guarda en el campo `FotoRepu` del repuesto (`photo_url` en Supabase)

#### Scenario: Visualización de miniatura en formulario y listados
- **WHEN** un repuesto tiene una foto cargada (`FotoRepu`)
- **THEN** se muestra su miniatura en el formulario de edición y en los ítems de los listados de repuestos

#### Scenario: Eliminar la foto de un repuesto
- **WHEN** el usuario presiona el botón de eliminar foto en el formulario del repuesto
- **THEN** el archivo físico se elimina de Supabase Storage
- **AND** el campo `FotoRepu` del repuesto queda vacío/indefinido
