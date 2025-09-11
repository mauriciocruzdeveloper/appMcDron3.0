# 🔄 Migración de Estados: Entregado → Finalizado

Este sistema permite migrar todas las reparaciones con estado "Entregado" al nuevo estado "Finalizado" del workflow actualizado.

## 🎯 Herramienta Disponible

### Componente React Integrado (Única Opción)
- **Archivo**: `src/components/MigradorEntregadoFinalizado.component.tsx`
- **Ubicación en la app**: Menú → Estados Legacy
- **Características**:
  - ✅ Interfaz gráfica integrada
  - ✅ Confirmación antes de migrar
  - ✅ Progreso en tiempo real
  - ✅ Manejo de errores
  - ✅ Backup automático en localStorage
  - ✅ Utiliza Redux y persistencia de la app

## 🚀 Cómo Usar

1. **Accede a la aplicación McDron**
2. **Ve al menú desplegable** → "Estados Legacy"
3. **En la sección "Migrador: Entregado → Finalizado"**:
   - Verás cuántas reparaciones tienen estado "Entregado"
   - Lista de las reparaciones que serán migradas
   - Botón para iniciar la migración
4. **Haz clic en "Iniciar Migración"** y confirma
5. **El sistema migrará automáticamente** todas las reparaciones

## 🔄 Qué Hace Exactamente

- **Busca** todas las reparaciones con `EstadoRep: "Entregado"`
- **Las cambia** a `EstadoRep: "Finalizado"`
- **Agrega metadatos**:
  - `MigracionTimestamp`: Momento de la migración
  - `EstadoAnteriorMigracion`: "Entregado"
  - `MigradoPorScript`: true

## 🛡️ Seguridad

- **Backup automático** en localStorage antes de migrar
- **Confirmación** antes de ejecutar
- **Vista previa** de qué se va a cambiar
- **Manejo de errores** con reportes detallados

## 📈 Proceso de Migración

1. **Vista previa**: El sistema muestra las reparaciones que serán afectadas
2. **Confirmación**: Solicita confirmación explícita del usuario
3. **Backup**: Crea automáticamente un backup en localStorage
4. **Migración**: Procesa cada reparación individualmente
5. **Reporte**: Muestra resultados exitosos y errores

## 📊 Información Mostrada

### Antes de migrar:
- Total de reparaciones con estado "Entregado"
- Lista detallada con ID, cliente, modelo y fecha
- Contadores de estado

### Durante la migración:
- Barra de progreso
- Estado actual de procesamiento
- Mensajes en tiempo real

### Después de migrar:
- Reparaciones migradas exitosamente
- Errores encontrados (si los hay)
- Opción para resetear y volver a intentar

## ❗ Consideraciones Importantes

### Antes de Ejecutar
1. **Verificar datos**: Asegúrate de que las reparaciones "Entregado" realmente deban ser "Finalizado"
2. **Horario apropiado**: Ejecuta durante horas de bajo uso

### Después de Ejecutar
1. **Verificar resultados**: Revisa las reparaciones migradas
2. **Comprobar funcionalidad**: Asegúrate de que la app funciona correctamente
3. **Backup conservado**: El backup queda disponible en localStorage

### Recuperación
Si algo sale mal, el backup está disponible en localStorage del navegador con la clave `backup_migracion_[timestamp]`.

## 📝 Ejemplo de Uso Completo

1. **Abrir aplicación McDron**
2. **Ir a Menú → Estados Legacy**
3. **Revisar la sección "Migrador: Entregado → Finalizado"**
4. **Ver las reparaciones que serán migradas**
5. **Hacer clic en "Iniciar Migración"**
6. **Confirmar la operación**
7. **Esperar a que termine el proceso**
8. **Verificar los resultados**

¡La migración se completará automáticamente usando el sistema de persistencia existente! 🎉

## 📊 Qué Hace la Migración

### Estados Afectados
- **Origen**: `Entregado` (estado legacy)
- **Destino**: `Finalizado` (estado del nuevo workflow)

### Cambios Aplicados
```json
{
  "data": {
    "EstadoRep": "Finalizado",           // ← Cambio principal
    "MigracionTimestamp": 1694123456789, // ← Timestamp de migración
    "EstadoAnteriorMigracion": "Entregado", // ← Estado original
    "MigradoPorScript": true             // ← Marca de migración automática
  }
}
```

### Metadatos Agregados
- `MigracionTimestamp`: Momento de la migración
- `EstadoAnteriorMigracion`: Estado antes de la migración
- `MigradoPorScript`: Indica que fue migrado automáticamente

## 🛡️ Seguridad y Backups

### Backups Automáticos
Todos los scripts crean backups automáticamente:

- **React Component**: Backup en `localStorage` con key `backup_migracion_[timestamp]`
- **Node.js Scripts**: Archivo de backup con sufijo `_backup_antes_migracion_[timestamp].json`

### Modo Simulación
Usa `--dry-run` para probar sin aplicar cambios:
```bash
node scripts/migrarEntregadoSimple.js --dry-run
```

### Verificación Previa
El script React muestra exactamente qué reparaciones serán afectadas antes de ejecutar.

## 📈 Monitoreo y Logs

### Archivos de Log
- `migracion_entregado_finalizado.log`: Log detallado de la migración
- Console output con timestamps y niveles de log

### Información Registrada
- Timestamp de cada operación
- Reparaciones procesadas exitosamente
- Errores encontrados
- Resumen final con estadísticas

## 🔧 Opciones de Configuración

### Script Node.js Simple
```javascript
const CONFIG = {
    RUTA_DATOS: '/ruta/a/tus/datos.json',  // ⚠️ CAMBIAR ESTO
    ESTADO_ORIGEN: 'Entregado',
    ESTADO_DESTINO: 'Finalizado',
    DRY_RUN: false,        // true para simular
    CREAR_BACKUP: true,    // false para no crear backup
    VERBOSE: false         // true para más detalles
};
```

### Argumentos de Línea de Comandos
```bash
--dry-run      # Simular sin aplicar cambios
--no-backup    # No crear backup
--verbose      # Mostrar información detallada
--help         # Mostrar ayuda
```

## ❗ Consideraciones Importantes

### Antes de Ejecutar
1. **Backup manual**: Haz un backup completo de tus datos
2. **Verificar reparaciones**: Revisa que las reparaciones "Entregado" realmente deban ser "Finalizado"
3. **Horario**: Ejecuta durante horas de bajo uso

### Después de Ejecutar
1. **Verificar resultados**: Revisa las reparaciones migradas
2. **Comprobar funcionalidad**: Asegúrate de que la app funciona correctamente
3. **Guardar logs**: Conserva los archivos de log para referencia

### Recuperación
Si algo sale mal:
1. **Desde React**: Usa la función `restaurarDesdeBackup()` en la consola del navegador
2. **Desde Node.js**: Restaura el archivo de backup manualmente

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los logs** para identificar errores específicos
2. **Verifica la configuración** de rutas y permisos
3. **Usa modo simulación** para probar antes de aplicar
4. **Conserva los backups** hasta confirmar que todo funciona

## 📝 Ejemplo de Uso Completo

```bash
# 1. Ir al directorio del proyecto
cd /home/mauricio/Documentos/misapps/mcdron/appMcDron3.0

# 2. Configurar el script (editar RUTA_DATOS)
nano scripts/migrarEntregadoSimple.js

# 3. Probar en modo simulación
node scripts/migrarEntregadoSimple.js --dry-run --verbose

# 4. Si todo se ve bien, ejecutar la migración
node scripts/migrarEntregadoSimple.js

# 5. Verificar los resultados
cat migracion_entregado_finalizado.log
```

¡La migración debería completarse sin problemas siguiendo estos pasos! 🎉
