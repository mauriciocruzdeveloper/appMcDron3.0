## 1. Frontend y dominio
- [x] 1.1 Agregar thunks de email para los eventos `Enviado` y `Finalizado`, reutilizando el criterio actual para resolver destinatario.
- [x] 1.2 Construir el payload de `Enviado` con codigo de seguimiento y enlace oficial solamente cuando el codigo sea Andreani.
- [x] 1.3 Integrar ambos emails en `cambiarEstadoReparacionAsync` y activarlos desde las acciones de entrega.
- [x] 1.4 Mostrar confirmacion o error de email al marcar la reparacion como Enviada o Finalizada, preservando el aviso de fecha final ajustada.

## 2. Backend de emails
- [x] 2.1 Crear endpoint, caso de uso y plantilla para el aviso de drone enviado.
- [x] 2.2 Crear endpoint, caso de uso y plantilla para el aviso de reparacion finalizada.
- [x] 2.3 Validar y escapar todos los datos recibidos; aceptar el enlace Andreani solo si es una URL oficial construida a partir del codigo valido.
- [x] 2.4 Mantener autenticacion, configuracion de remitente, copia y registro de resultados consistentes con los emails existentes.

## 3. Verificacion
- [x] 3.1 Probar la construccion del payload de envio con seguimiento Andreani y con otro transportista.
- [x] 3.2 Probar que las transiciones `Enviado` y `Finalizado` invocan solamente el email correspondiente cuando `enviarEmail` esta activo.
- [x] 3.3 Verificar sintaxis PHP de endpoints, casos de uso y plantillas nuevas.
- [x] 3.4 Ejecutar las pruebas enfocadas del frontend y revisar manualmente el HTML renderizado de ambos emails.
