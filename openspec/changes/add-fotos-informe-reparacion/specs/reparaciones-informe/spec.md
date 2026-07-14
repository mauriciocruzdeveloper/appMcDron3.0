## ADDED Requirements

### Requirement: Fotos dedicadas al informe de reparación
El sistema SHALL permitir adjuntar un conjunto de fotos dedicado al informe de
reparación/diagnóstico (`FotosInformeRep`), independiente de la galería general
de fotos de la reparación (`urlsFotos`) y de las fotos de las intervenciones
asignadas (`asignacion.data.fotos`).

#### Scenario: Admin sube una foto al informe
- **WHEN** un admin selecciona un archivo de imagen en la sección de fotos del
  informe dentro de la vista Reparar
- **THEN** la imagen se sube al storage y su URL se agrega a
  `FotosInformeRep` de la reparación
- **AND** la foto se muestra inmediatamente en la lista de miniaturas del
  informe

#### Scenario: Admin elimina una foto del informe
- **WHEN** un admin elimina una foto ya cargada del informe
- **THEN** la foto se borra del storage y su URL se remueve de
  `FotosInformeRep`

#### Scenario: Usuario no admin no puede modificar fotos del informe
- **WHEN** un usuario no admin visualiza la sección Reparar
- **THEN** no puede subir ni eliminar fotos del informe (controles
  deshabilitados u ocultos)

### Requirement: Email de Drone Reparado incluye fotos del informe
Al enviar el email de "Drone Reparado" o "Drone Diagnosticado", el sistema SHALL
incluir las fotos cargadas en `FotosInformeRep` y SHALL NOT incluir fotos de las
intervenciones/asignaciones.

#### Scenario: Reparación con fotos de informe cargadas
- **WHEN** se marca la reparación como Reparado y existen fotos en
  `FotosInformeRep`
- **THEN** el email enviado al cliente muestra esas fotos en una sección
  dedicada
- **AND** el email no muestra fotos provenientes de `asignacion.data.fotos`

#### Scenario: Reparación sin fotos de informe
- **WHEN** se marca la reparación como Reparado y `FotosInformeRep` está vacío
  o no definido
- **THEN** el email no muestra la sección de fotos del informe
