-- =====================================================================
-- MIGRACIÓN: Actualizar tabla messages para usar user IDs en lugar de emails
-- =====================================================================
-- 
-- CONTEXTO:
-- El sistema de mensajes actualmente usa emails como identificadores (emailCli, sender)
-- pero debe usar IDs de usuario para mejor integridad referencial y mantener
-- consistencia con el resto del sistema.
--
-- CAMBIOS:
-- 1. Agregar nuevas columnas: other_user_id, sender_id
-- 2. Migrar datos existentes de email a ID
-- 3. Eliminar columnas antiguas: emailCli, sender
-- 4. Agregar foreign keys para integridad referencial
-- 5. Actualizar índices
--
-- NOTA: Esta migración debe ejecutarse cuando NO haya usuarios activos
-- en el sistema de mensajes para evitar inconsistencias.
--
-- =====================================================================

BEGIN;

-- =====================================================================
-- PASO 1: Agregar nuevas columnas
-- =====================================================================

ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS other_user_id UUID,
ADD COLUMN IF NOT EXISTS sender_id UUID;

COMMENT ON COLUMN messages.other_user_id IS 'ID del otro usuario en la conversación (el destinatario desde la perspectiva del user_id)';
COMMENT ON COLUMN messages.sender_id IS 'ID del usuario que envió el mensaje';

-- =====================================================================
-- PASO 2: Migrar datos existentes
-- =====================================================================

-- Actualizar other_user_id a partir de emailCli
UPDATE messages m
SET other_user_id = u.id
FROM usuarios u
WHERE m.emailCli = u.email
AND m.other_user_id IS NULL;

-- Actualizar sender_id a partir de sender
UPDATE messages m
SET sender_id = u.id
FROM usuarios u
WHERE m.sender = u.email
AND m.sender_id IS NULL;

-- =====================================================================
-- PASO 3: Verificar migración
-- =====================================================================

-- Verificar que no haya registros sin migrar
DO $$
DECLARE
    unmigrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unmigrated_count
    FROM messages
    WHERE other_user_id IS NULL OR sender_id IS NULL;
    
    IF unmigrated_count > 0 THEN
        RAISE EXCEPTION 'Existen % mensajes que no pudieron ser migrados. Verificar que todos los emails en messages existan en la tabla usuarios.', unmigrated_count;
    END IF;
END $$;

-- =====================================================================
-- PASO 4: Hacer columnas NOT NULL y agregar foreign keys
-- =====================================================================

ALTER TABLE messages 
ALTER COLUMN other_user_id SET NOT NULL,
ALTER COLUMN sender_id SET NOT NULL;

-- Agregar foreign keys para integridad referencial
ALTER TABLE messages
ADD CONSTRAINT fk_messages_other_user 
    FOREIGN KEY (other_user_id) 
    REFERENCES usuarios(id) 
    ON DELETE CASCADE,
ADD CONSTRAINT fk_messages_sender 
    FOREIGN KEY (sender_id) 
    REFERENCES usuarios(id) 
    ON DELETE CASCADE,
ADD CONSTRAINT fk_messages_user 
    FOREIGN KEY (user_id) 
    REFERENCES usuarios(id) 
    ON DELETE CASCADE;

-- =====================================================================
-- PASO 5: Eliminar columnas antiguas
-- =====================================================================

ALTER TABLE messages 
DROP COLUMN IF EXISTS emailCli,
DROP COLUMN IF EXISTS sender;

-- =====================================================================
-- PASO 6: Actualizar índices
-- =====================================================================

-- Eliminar índices antiguos si existen
DROP INDEX IF EXISTS idx_messages_user_email;
DROP INDEX IF EXISTS idx_messages_emailcli;
DROP INDEX IF EXISTS idx_messages_sender;

-- Crear nuevos índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_messages_user_other_user 
ON messages(user_id, other_user_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender_date 
ON messages(sender_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON messages(user_id, isRead) 
WHERE isRead = false;

-- =====================================================================
-- PASO 7: Actualizar RLS policies si existen
-- =====================================================================

-- Nota: Si hay Row Level Security habilitadas, actualizar las policies
-- para usar los nuevos campos. Ejemplo:
-- DROP POLICY IF EXISTS messages_select_policy ON messages;
-- CREATE POLICY messages_select_policy ON messages
--     FOR SELECT
--     USING (
--         user_id = auth.uid() OR 
--         sender_id = auth.uid() OR 
--         other_user_id = auth.uid()
--     );

-- =====================================================================
-- FINALIZAR
-- =====================================================================

COMMIT;

-- =====================================================================
-- ROLLBACK (solo para referencia, no ejecutar)
-- =====================================================================
-- Si algo sale mal y necesitas revertir:
--
-- BEGIN;
-- 
-- -- Restaurar columnas antiguas
-- ALTER TABLE messages 
-- ADD COLUMN emailCli VARCHAR(255),
-- ADD COLUMN sender VARCHAR(255);
-- 
-- -- Restaurar datos desde IDs
-- UPDATE messages m
-- SET emailCli = u.email
-- FROM usuarios u
-- WHERE m.other_user_id = u.id;
-- 
-- UPDATE messages m
-- SET sender = u.email
-- FROM usuarios u
-- WHERE m.sender_id = u.id;
-- 
-- -- Hacer NOT NULL las columnas restauradas
-- ALTER TABLE messages 
-- ALTER COLUMN emailCli SET NOT NULL,
-- ALTER COLUMN sender SET NOT NULL;
-- 
-- -- Eliminar foreign keys
-- ALTER TABLE messages
-- DROP CONSTRAINT IF EXISTS fk_messages_other_user,
-- DROP CONSTRAINT IF EXISTS fk_messages_sender,
-- DROP CONSTRAINT IF EXISTS fk_messages_user;
-- 
-- -- Eliminar columnas nuevas
-- ALTER TABLE messages 
-- DROP COLUMN IF EXISTS other_user_id,
-- DROP COLUMN IF EXISTS sender_id;
-- 
-- -- Restaurar índices antiguos
-- CREATE INDEX idx_messages_user_email ON messages(user_id, emailCli);
-- CREATE INDEX idx_messages_emailcli ON messages(emailCli);
-- CREATE INDEX idx_messages_sender ON messages(sender);
-- 
-- COMMIT;
-- =====================================================================
