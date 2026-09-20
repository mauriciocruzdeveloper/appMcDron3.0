## 1. Dominio y frontend
- [x] 1.1 Agregar reglas de 3 meses calendario y 7 dias completos con tests de limites.
- [x] 1.2 Separar el thunk de aviso del cambio a `Abandonado` y persistir la fecha solo luego
  de un envio exitoso.
- [x] 1.3 Agregar botones de enviar aviso, cancelar aviso y confirmar abandono definitivo.
- [x] 1.4 Quitar la accion duplicada de abandono de `ReparacionEntrega`.
- [x] 1.5 Agregar selector Reselect y seccion de Inicio para reparaciones listas para aviso.

## 2. Datos
- [x] 2.1 Agregar migracion nullable `repair.abandonment_notice_date`.
- [x] 2.2 Mapear `FechaAvisoAbandono` en tipos y persistencia sin incorporar reglas de dominio.

## 3. Backend de email
- [x] 3.1 Crear endpoint autenticado, caso de uso y plantilla para el aviso de drone
  abandonado.
- [x] 3.2 Validar y escapar los datos recibidos, reutilizando remitente, copia, estilos y
  registro de resultados de las notificaciones existentes.
- [x] 3.3 Incluir en el email los datos de reparacion, el plazo de 7 dias y el aviso de
  disposicion por el servicio tecnico.

## 4. Verificacion
- [x] 4.1 Probar visibilidad y listado de Inicio por estado, antiguedad, aviso y vencimiento.
- [x] 4.2 Probar que el aviso exitoso conserva estado y registra fecha; el fallo no registra.
- [x] 4.3 Probar cancelacion del aviso y abandono definitivo sin segundo email.
- [x] 4.4 Verificar sintaxis PHP y revisar el HTML renderizado del email.
- [x] 4.5 Ejecutar pruebas enfocadas y build del frontend.