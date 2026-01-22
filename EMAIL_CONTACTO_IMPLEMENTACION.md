# Implementación Email de Contacto Alternativo

## 📋 Descripción

Se ha implementado un sistema de email alternativo para que los usuarios puedan recibir notificaciones en un email diferente al de autenticación.

## 🎯 Concepto

- **EmailUsu (email)**: Email de autenticación, vinculado a Supabase Auth, **inmutable**
- **EmailContacto (contact_email)**: Email de contacto para notificaciones, **editable**

## 📦 Archivos modificados

### 1. Tipo de datos
- **`src/types/usuario.ts`**: Agregado `EmailContacto?: string`

### 2. Base de datos
- **`sql/migration_add_contact_email.sql`**: Script de migración para agregar la columna
  - Ejecutar en Supabase para aplicar cambios en producción

### 3. Formulario
- **`src/components/Usuario.component.tsx`**:
  - Email de autenticación: deshabilitado para usuarios existentes
  - Email de contacto: nuevo campo siempre editable
  - Textos explicativos para el usuario

### 4. Persistencia
- **`src/persistencia/persistenciaSupabase/usuariosPersistencia.js`**:
  - Actualizado `getUsuariosPersistencia`
  - Actualizado `getClientePersistencia`
  - Actualizado `getClientePorEmailPersistencia`
  - Actualizado `guardarUsuarioPersistencia`
  - Todos leen/escriben el campo `contact_email`

### 5. Utilidades
- **`src/utils/utils.js`**: Nueva función `getEmailForNotifications(usuario)`
  - Devuelve `EmailContacto` si existe, sino `EmailUsu`
  - Centraliza la lógica de selección de email

### 6. Envío de emails
- **`src/utils/sendEmails.ts`**: `enviarEmailVacio` actualizada para usar email correcto
- **`src/components/Usuario.component.tsx`**: `handleSendEmail` usa `getEmailForNotifications`
- **`src/components/Reparacion/sections/ReparacionConsulta.tsx`**: Pasa usuario a `enviarEmailVacio`
- **`src/redux-tool-kit/app/app.actions.ts`**:
  - `enviarReciboAsync`: usa email de contacto
  - `enviarDroneReparadoAsync`: usa email de contacto
  - `enviarDroneDiagnosticadoAsync`: usa email de contacto

## 🚀 Cómo usar

### Para usuarios
1. Editar perfil
2. Completar campo "Email de contacto (notificaciones)"
3. Si está vacío, se usará el email de autenticación

### Para desarrolladores

```javascript
import { getEmailForNotifications } from "../utils/utils";

// Obtener email correcto para notificaciones
const emailDestino = getEmailForNotifications(usuario);

// Enviar email
enviarEmail({
  to: emailDestino,
  subject: "Asunto",
  body: "Contenido"
});
```

## 🗄️ Aplicar migración

```sql
-- Ejecutar en Supabase SQL Editor
\i /home/mauricio/workspace/appMcDron3.0/sql/migration_add_contact_email.sql
```

O copiar y pegar el contenido del archivo en el editor SQL de Supabase.

## ✅ Ventajas

1. **Flexibilidad**: Usuario puede recibir notificaciones en diferente email
2. **Sin romper autenticación**: El email de login permanece inmutable
3. **Retrocompatibilidad**: Si no hay email de contacto, usa el de autenticación
4. **Casos de uso**:
   - Cliente se registró con email personal pero quiere notificaciones en email corporativo
   - Partner quiere emails laborales en un email y notificaciones en otro
   - Migración de emails sin perder acceso a la cuenta

## 🔍 Validaciones

- Formato de email válido (constraint en BD)
- Puede ser NULL (usa EmailUsu por defecto)
- Índice parcial para búsquedas eficientes

## 📝 Notas

- El campo `EmailUsu` sigue siendo el identificador principal del usuario
- Todas las búsquedas y relaciones usan `EmailUsu`
- Solo los envíos de notificaciones usan `EmailContacto` cuando está disponible
