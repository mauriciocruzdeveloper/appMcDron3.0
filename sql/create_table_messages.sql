-- =====================================================================
-- CREAR TABLA: messages
-- =====================================================================
-- 
-- DESCRIPCIÓN:
-- Tabla para almacenar mensajes entre usuarios del sistema.
-- Los mensajes se duplican: una copia para el remitente y otra para el destinatario.
-- Cada usuario ve sus mensajes en su propia "bandeja".
--
-- CAMPOS PRINCIPALES:
-- - user_id: El dueño de esta copia del mensaje (quién ve este mensaje en su bandeja)
-- - other_user_id: El otro usuario en la conversación (el interlocutor)
-- - sender_id: Quién envió el mensaje originalmente
-- - content: El contenido del mensaje
-- - isRead: Si el mensaje fue leído por el user_id
--
-- =====================================================================

-- Eliminar tabla si existe (solo para desarrollo, comentar en producción)
-- DROP TABLE IF EXISTS messages CASCADE;

CREATE TABLE IF NOT EXISTS messages (
    -- Identificador único del mensaje
    id BIGSERIAL PRIMARY KEY,
    
    -- Usuario dueño de esta copia del mensaje
    user_id BIGINT NOT NULL,
    
    -- El otro usuario en la conversación
    other_user_id BIGINT NOT NULL,
    
    -- Usuario que envió el mensaje
    sender_id BIGINT NOT NULL,
    
    -- Nombre del remitente (desnormalizado para performance)
    senderName VARCHAR(255) NOT NULL,
    
    -- Contenido del mensaje
    content TEXT NOT NULL,
    
    -- Timestamp del mensaje (milisegundos desde epoch)
    date BIGINT NOT NULL,
    
    -- Estado de lectura
    isRead BOOLEAN NOT NULL DEFAULT false,
    
    -- Timestamps de auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================
-- COMENTARIOS EN COLUMNAS
-- =====================================================================

COMMENT ON TABLE messages IS 'Mensajes entre usuarios. Cada mensaje se duplica: una copia para el remitente y otra para el destinatario.';

COMMENT ON COLUMN messages.id IS 'Identificador único del mensaje';
COMMENT ON COLUMN messages.user_id IS 'Usuario dueño de esta copia del mensaje (ve este mensaje en su bandeja)';
COMMENT ON COLUMN messages.other_user_id IS 'El otro usuario en la conversación (el interlocutor)';
COMMENT ON COLUMN messages.sender_id IS 'Usuario que originalmente envió el mensaje';
COMMENT ON COLUMN messages.senderName IS 'Nombre del remitente (desnormalizado para mejor performance en consultas)';
COMMENT ON COLUMN messages.content IS 'Contenido del mensaje';
COMMENT ON COLUMN messages.date IS 'Timestamp del mensaje en milisegundos desde epoch (Unix timestamp * 1000)';
COMMENT ON COLUMN messages.isRead IS 'Indica si el mensaje fue leído por el user_id';
COMMENT ON COLUMN messages.created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN messages.updated_at IS 'Fecha de última actualización del registro';

-- =====================================================================
-- FOREIGN KEYS
-- =====================================================================

-- Relación con la tabla user
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_messages_user'
    ) THEN
        ALTER TABLE messages
        ADD CONSTRAINT fk_messages_user 
            FOREIGN KEY (user_id) 
            REFERENCES "user"(id) 
            ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_messages_other_user'
    ) THEN
        ALTER TABLE messages
        ADD CONSTRAINT fk_messages_other_user 
            FOREIGN KEY (other_user_id) 
            REFERENCES "user"(id) 
            ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_messages_sender'
    ) THEN
        ALTER TABLE messages
        ADD CONSTRAINT fk_messages_sender 
            FOREIGN KEY (sender_id) 
            REFERENCES "user"(id) 
            ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================================================
-- ÍNDICES
-- =====================================================================

-- Índice compuesto para consultar mensajes de una conversación específica
-- Optimiza: WHERE user_id = ? AND other_user_id = ? ORDER BY date
CREATE INDEX IF NOT EXISTS idx_messages_user_other_user 
ON messages(user_id, other_user_id, date DESC);

-- Índice para consultar mensajes por remitente y fecha
CREATE INDEX IF NOT EXISTS idx_messages_sender_date 
ON messages(sender_id, date DESC);

-- Índice parcial para mensajes no leídos
-- Optimiza: WHERE user_id = ? AND isRead = false
CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON messages(user_id) 
WHERE isRead = false;

-- Índice para consultas de tiempo real
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
ON messages(created_at DESC);

-- =====================================================================
-- TRIGGER PARA UPDATED_AT
-- =====================================================================

-- Función para actualizar el timestamp
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que actualiza updated_at automáticamente
DROP TRIGGER IF EXISTS trigger_update_messages_timestamp ON messages;
CREATE TRIGGER trigger_update_messages_timestamp
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) - Opcional
-- =====================================================================
-- Descomentar si se usa autenticación de Supabase

-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- -- Policy: Los usuarios pueden ver sus propios mensajes
-- CREATE POLICY messages_select_policy ON messages
--     FOR SELECT
--     USING (user_id = auth.uid());

-- -- Policy: Los usuarios pueden insertar mensajes donde ellos son el user_id
-- CREATE POLICY messages_insert_policy ON messages
--     FOR INSERT
--     WITH CHECK (user_id = auth.uid());

-- -- Policy: Los usuarios pueden actualizar sus propios mensajes (ej: marcar como leído)
-- CREATE POLICY messages_update_policy ON messages
--     FOR UPDATE
--     USING (user_id = auth.uid())
--     WITH CHECK (user_id = auth.uid());

-- -- Policy: Los usuarios pueden eliminar sus propios mensajes
-- CREATE POLICY messages_delete_policy ON messages
--     FOR DELETE
--     USING (user_id = auth.uid());

-- =====================================================================
-- REALTIME CONFIGURATION
-- =====================================================================

-- Habilitar Realtime para la tabla messages
-- Esto permite que los clientes se suscriban a cambios en tiempo real
DO $$ 
BEGIN
    -- Intentar agregar la tabla a la publicación de realtime
    -- Si ya existe, el error será capturado y se continuará
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    EXCEPTION 
        WHEN duplicate_object THEN
            RAISE NOTICE 'La tabla messages ya está en supabase_realtime';
    END;
END $$;

COMMENT ON TABLE messages IS 'Mensajes entre usuarios. Realtime habilitado para actualizaciones en tiempo real.';

-- =====================================================================
-- DATOS DE EJEMPLO (Opcional - Solo para testing)
-- =====================================================================
-- Descomentar para insertar datos de prueba

-- -- Asumiendo que existen usuarios con estos IDs
-- INSERT INTO messages (user_id, other_user_id, sender_id, senderName, content, date, isRead) VALUES
-- ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Juan Pérez', '¡Hola! ¿Cómo estás?', 1706000000000, false),
-- ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Juan Pérez', '¡Hola! ¿Cómo estás?', 1706000000000, false);

-- =====================================================================
-- VERIFICACIÓN
-- =====================================================================

-- Verificar que la tabla se creó correctamente
DO $$
DECLARE
    table_exists BOOLEAN;
    fk_count INTEGER;
    index_count INTEGER;
    trigger_count INTEGER;
BEGIN
    -- Verificar existencia de tabla
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'messages'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✓ Tabla messages existe';
        
        -- Contar foreign keys
        SELECT COUNT(*) INTO fk_count
        FROM pg_constraint
        WHERE conrelid = 'messages'::regclass
        AND contype = 'f';
        
        RAISE NOTICE '✓ Foreign keys creadas: %', fk_count;
        
        -- Contar índices (excluyendo el índice primario)
        SELECT COUNT(*) INTO index_count
        FROM pg_indexes
        WHERE tablename = 'messages'
        AND indexname != 'messages_pkey';
        
        RAISE NOTICE '✓ Índices creados: %', index_count;
        
        -- Contar triggers
        SELECT COUNT(*) INTO trigger_count
        FROM pg_trigger
        WHERE tgrelid = 'messages'::regclass
        AND tgname = 'trigger_update_messages_timestamp';
        
        RAISE NOTICE '✓ Triggers activos: %', trigger_count;
        
        -- Verificar si está en realtime
        IF EXISTS (
            SELECT 1
            FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
            AND tablename = 'messages'
        ) THEN
            RAISE NOTICE '✓ Realtime habilitado';
        ELSE
            RAISE WARNING '⚠ Realtime NO habilitado - ejecutar manualmente: ALTER PUBLICATION supabase_realtime ADD TABLE messages;';
        END IF;
        
        RAISE NOTICE '================================================';
        RAISE NOTICE 'RESUMEN DE CONFIGURACIÓN:';
        RAISE NOTICE '================================================';
        RAISE NOTICE 'Tabla: messages';
        RAISE NOTICE 'Foreign Keys: % (esperados: 3)', fk_count;
        RAISE NOTICE 'Índices: % (esperados: 4)', index_count;
        RAISE NOTICE 'Triggers: % (esperados: 1)', trigger_count;
        RAISE NOTICE '================================================';
        
    ELSE
        RAISE EXCEPTION '✗ Error: La tabla messages no fue creada';
    END IF;
END $$;

-- =====================================================================
-- INFORMACIÓN DETALLADA
-- =====================================================================

-- Listar columnas con sus tipos
RAISE NOTICE 'Estructura de columnas:';
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- Listar índices creados
RAISE NOTICE 'Índices creados:';
SELECT 
    indexname AS "Nombre del Índice",
    indexdef AS "Definición"
FROM pg_indexes
WHERE tablename = 'messages'
ORDER BY indexname;

-- Verificar foreign keys
RAISE NOTICE 'Foreign Keys configuradas:';
SELECT
    conname AS "Constraint",
    a.attname AS "Columna Local",
    confrelid::regclass AS "Tabla Referenciada"
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE conrelid = 'messages'::regclass
AND contype = 'f'
ORDER BY conname;

-- Estadísticas de la tabla
RAISE NOTICE 'Contadores actuales:';
SELECT 
    COUNT(*) AS total_mensajes,
    COUNT(CASE WHEN isRead = false THEN 1 END) AS mensajes_no_leidos,
    COUNT(DISTINCT user_id) AS usuarios_con_mensajes,
    MIN(created_at) AS primer_mensaje,
    MAX(created_at) AS ultimo_mensaje
FROM messages;
