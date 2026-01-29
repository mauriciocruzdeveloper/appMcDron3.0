import { supabase } from './supabaseClient.js';
import { processImageForUpload, getThumbnailFilename } from '../../utils/imageUtils';

const BUCKET_NAME = 'archivos';

// Función para subir archivos a Supabase Storage
export const subirArchivoPersistencia = async (path, file) => {
  try {
    // path: ruta completa dentro del bucket, por ejemplo: 'REPARACIONES/123/fotos/archivo.jpg'
    // file: Blob o File
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, file, {
      upsert: true // Permite sobrescribir si ya existe
    });
    if (error) throw error;

    // Obtener la URL pública del archivo subido
    // TODO: Ver cómo hacer para que sea privado el bucket
    const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('No se pudo obtener la URL pública del archivo');
    }
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error al subir archivo a Supabase:', error);
    throw error;
  }
};

/**
 * Sube una imagen procesada: comprime el original y genera miniatura
 * Retorna { originalUrl, thumbnailUrl }
 * 
 * @param path - Ruta base para el archivo (ej: 'REPARACIONES/123/fotos/imagen_123.jpg')
 * @param file - Archivo de imagen (File o Blob)
 * @returns {{ originalUrl: string, thumbnailUrl: string }}
 */
export const subirImagenConMiniaturaPersistencia = async (path, file) => {
  try {
    // En algunos WebViews (Android) el objeto File puede cambiar mientras se procesa
    // -> Generar un Blob estable a partir del arrayBuffer para evitar net::ERR_UPLOAD_FILE_CHANGED
    const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });

    // Procesar la imagen: comprimir y generar miniatura usando el Blob estable
    const { original, thumbnail } = await processImageForUpload(fileBlob);
    
    // Generar paths para ambos archivos
    // Asegurar que el path termina en .jpg ya que convertimos a JPEG
    const basePath = path.replace(/\.[^.]+$/, '');
    const originalPath = `${basePath}.jpg`;
    const thumbnailPath = `${basePath}_thumb.jpg`;

    // Subir original comprimido
    const { error: originalError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(originalPath, original, {
        upsert: true,
        contentType: 'image/jpeg'
      });
    if (originalError) throw originalError;

    // Subir miniatura
    const { error: thumbError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(thumbnailPath, thumbnail, {
        upsert: true,
        contentType: 'image/jpeg'
      });
    if (thumbError) {
      console.error('Error al subir miniatura:', thumbError);
      // No fallar si la miniatura falla, solo logear
    }

    // Obtener URLs públicas
    const { data: originalUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(originalPath);
    const { data: thumbUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(thumbnailPath);

    const originalUrl = originalUrlData?.publicUrl;
    const thumbnailUrl = thumbUrlData?.publicUrl || originalUrl; // Fallback a original si falla

    if (!originalUrl) {
      throw new Error('No se pudo obtener la URL pública del archivo');
    }
    
    return { originalUrl, thumbnailUrl };
  } catch (error) {
    console.error('Error al subir imagen con miniatura:', error);
    throw error;
  }
};

// Función para eliminar archivos de Supabase Storage
export const eliminarArchivoPersistencia = async (url) => {
  try {
    // Extraer el bucket y el path del archivo desde la URL
    // Ejemplo de URL: https://xxxx.supabase.co/storage/v1/object/public/archivos/REPARACIONES/123/fotos/archivo.jpg
    const matches = url.match(/\/object\/public\/([^/]+)\/(.+)$/);
    if (!matches) throw new Error('No se pudo extraer el path del archivo desde la URL');
    const bucket = matches[1];
    const path = matches[2];
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
    
    // Intentar eliminar también la miniatura si existe
    // El path de la miniatura es: archivo_thumb.jpg
    const thumbPath = path.replace(/\.([^.]+)$/, '_thumb.$1');
    if (thumbPath !== path) {
      try {
        await supabase.storage.from(bucket).remove([thumbPath]);
      } catch (thumbError) {
        // No fallar si la miniatura no existe
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error al eliminar archivo en Supabase:', error);
    throw error;
  }
};
