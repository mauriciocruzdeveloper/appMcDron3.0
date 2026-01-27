#!/usr/bin/env node

/**
 * Script de migración: Generar miniaturas para fotos existentes
 * 
 * Este script:
 * 1. Conecta a Supabase
 * 2. Obtiene todas las reparaciones con fotos
 * 3. Para cada foto verifica si existe la miniatura
 * 4. Si no existe, descarga la original, genera la miniatura y la sube
 * 
 * Uso:
 *   node scripts/migrar_miniaturas.js [--dry-run] [--limit=N]
 * 
 * Opciones:
 *   --dry-run    Solo muestra qué se haría sin modificar nada
 *   --limit=N    Procesa solo las primeras N fotos (útil para testing)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Configuración
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_KEY;
const BUCKET_NAME = 'archivos';

// Tamaños de imagen
const THUMBNAIL_MAX_WIDTH = 400;
const THUMBNAIL_MAX_HEIGHT = 300;
const JPEG_QUALITY = 0.7;

// Parsear argumentos
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;

// Validar configuración
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_KEY (o SERVICE_KEY) deben estar definidas en .env');
  process.exit(1);
}

// Inicializar Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Genera el nombre de archivo de la miniatura desde el original
 */
function getThumbnailPath(originalPath) {
  return originalPath.replace(/\.([^.]+)$/, '_thumb.$1');
}

/**
 * Verifica si existe un archivo en Supabase Storage
 */
async function existeArchivo(path) {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(path.substring(0, path.lastIndexOf('/')), {
        search: path.substring(path.lastIndexOf('/') + 1)
      });
    
    if (error) return false;
    return data && data.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Descarga una imagen desde Supabase Storage
 */
async function descargarImagen(url) {
  try {
    // Extraer el path del archivo desde la URL
    const matches = url.match(/\/object\/public\/([^/]+)\/(.+)$/);
    if (!matches) throw new Error('URL inválida');
    
    const bucket = matches[1];
    const filePath = matches[2];
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);
    
    if (error) throw error;
    
    // Convertir Blob a Buffer
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    throw new Error(`Error al descargar imagen: ${error.message}`);
  }
}

/**
 * Genera una miniatura desde un buffer de imagen
 * Usa Canvas en Node.js (requiere canvas package)
 */
async function generarMiniatura(imageBuffer) {
  // Para Node.js necesitamos usar una librería de procesamiento de imágenes
  // Como no tenemos Canvas en Node, usamos sharp si está disponible
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    throw new Error('sharp no está instalado. Ejecuta: npm install sharp --save-dev');
  }
  
  try {
    const thumbnail = await sharp(imageBuffer)
      .resize(THUMBNAIL_MAX_WIDTH, THUMBNAIL_MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: Math.round(JPEG_QUALITY * 100) })
      .toBuffer();
    
    return thumbnail;
  } catch (error) {
    throw new Error(`Error al generar miniatura: ${error.message}`);
  }
}

/**
 * Sube una miniatura a Supabase Storage
 */
async function subirMiniatura(thumbnailPath, thumbnailBuffer) {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      });
    
    if (error) throw error;
    
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${thumbnailPath}`;
  } catch (error) {
    throw new Error(`Error al subir miniatura: ${error.message}`);
  }
}

/**
 * Procesa una foto: verifica si tiene miniatura y la genera si no existe
 */
async function procesarFoto(url, index, total) {
  try {
    // Extraer el path del archivo desde la URL
    const matches = url.match(/\/object\/public\/([^/]+)\/(.+)$/);
    if (!matches) {
      console.log(`⚠️  [${index}/${total}] URL inválida, saltando: ${url}`);
      return { skipped: true, reason: 'url_invalida' };
    }
    
    const originalPath = matches[2];
    const thumbnailPath = getThumbnailPath(originalPath);
    
    // Verificar si ya existe la miniatura
    if (await existeArchivo(thumbnailPath)) {
      console.log(`✓  [${index}/${total}] Miniatura ya existe: ${thumbnailPath}`);
      return { skipped: true, reason: 'ya_existe' };
    }
    
    if (isDryRun) {
      console.log(`🔍 [${index}/${total}] [DRY-RUN] Se generaría miniatura para: ${originalPath}`);
      return { processed: true, dryRun: true };
    }
    
    console.log(`⏳ [${index}/${total}] Procesando: ${originalPath}`);
    
    // Descargar imagen original
    const imageBuffer = await descargarImagen(url);
    
    // Generar miniatura
    const thumbnailBuffer = await generarMiniatura(imageBuffer);
    
    // Subir miniatura
    const thumbnailUrl = await subirMiniatura(thumbnailPath, thumbnailBuffer);
    
    console.log(`✅ [${index}/${total}] Miniatura creada: ${thumbnailPath}`);
    return { processed: true, thumbnailUrl };
    
  } catch (error) {
    console.error(`❌ [${index}/${total}] Error procesando ${url}:`, error.message);
    return { error: true, message: error.message };
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('\n🚀 Iniciando migración de miniaturas...\n');
  
  if (isDryRun) {
    console.log('🔍 Modo DRY-RUN: No se realizarán cambios\n');
  }
  
  if (limit) {
    console.log(`⚠️  Límite establecido: ${limit} fotos\n`);
  }
  
  try {
    // 1. Obtener todas las reparaciones con fotos
    console.log('📊 Obteniendo reparaciones de la base de datos...');
    const { data: reparaciones, error } = await supabase
      .from('repair')
      .select('id, photo_urls, photo_before, photo_after');
    
    if (error) throw error;
    
    console.log(`✓ ${reparaciones.length} reparaciones encontradas\n`);
    
    // 2. Recolectar todas las URLs de fotos únicas
    const fotosSet = new Set();
    
    reparaciones.forEach(rep => {
      if (rep.photo_urls && Array.isArray(rep.photo_urls)) {
        rep.photo_urls.forEach(url => {
          if (url && url.trim()) fotosSet.add(url);
        });
      }
      // No incluimos photo_before/photo_after porque son referencias a URLs que ya están en photo_urls
    });
    
    const fotos = Array.from(fotosSet);
    const totalFotos = limit ? Math.min(fotos.length, limit) : fotos.length;
    
    console.log(`📸 Total de fotos únicas a procesar: ${totalFotos}\n`);
    
    // 3. Procesar cada foto
    const resultados = {
      procesadas: 0,
      yaExistian: 0,
      errores: 0,
      urlsInvalidas: 0
    };
    
    for (let i = 0; i < totalFotos; i++) {
      const resultado = await procesarFoto(fotos[i], i + 1, totalFotos);
      
      if (resultado.processed) {
        resultados.procesadas++;
      } else if (resultado.skipped) {
        if (resultado.reason === 'ya_existe') resultados.yaExistian++;
        else if (resultado.reason === 'url_invalida') resultados.urlsInvalidas++;
      } else if (resultado.error) {
        resultados.errores++;
      }
      
      // Pequeña pausa para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 4. Mostrar resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(60));
    console.log(`Total fotos analizadas:    ${totalFotos}`);
    console.log(`✅ Miniaturas creadas:     ${resultados.procesadas}`);
    console.log(`✓  Ya existían:            ${resultados.yaExistian}`);
    console.log(`⚠️  URLs inválidas:         ${resultados.urlsInvalidas}`);
    console.log(`❌ Errores:                ${resultados.errores}`);
    console.log('='.repeat(60) + '\n');
    
    if (isDryRun) {
      console.log('💡 Ejecuta sin --dry-run para realizar los cambios\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error fatal:', error.message);
    process.exit(1);
  }
}

// Ejecutar
main().then(() => {
  console.log('✓ Migración completada\n');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
