import { supabase } from './supabaseClient.js';
import { processImageForUpload } from '../../utils/imageUtils';

const getStorageApiBaseUrl = () => {
  const baseUrl = process.env.REACT_APP_STORAGE_API_URL || process.env.REACT_APP_API_URL || '';
  const trimmed = baseUrl.replace(/\/+$/, '');
  if (!trimmed) {
    throw new Error('REACT_APP_API_URL no está configurada para gestionar archivos');
  }
  return trimmed;
};

const getStorageAuthHeaders = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw sessionError;
  }

  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) {
    throw new Error('No hay sesión activa para gestionar archivos');
  }

  return {
    'X-API-KEY': process.env.REACT_APP_ENDPOINT_API_KEY || '',
    Authorization: `Bearer ${accessToken}`,
    'X-Supabase-Auth': accessToken,
  };
};

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch (_err) {
    return null;
  }
};

// Función para subir archivos al almacenamiento en DonWeb
export const subirArchivoPersistencia = async (path, file) => {
  try {
    const apiBaseUrl = getStorageApiBaseUrl();
    const authHeaders = await getStorageAuthHeaders();

    const fileName = path.split('/').pop() || 'archivo';
    const formData = new FormData();
    formData.append('path', path);
    formData.append('file', file, fileName);

    const response = await fetch(`${apiBaseUrl}/upload_file`, {
      method: 'POST',
      headers: authHeaders,
      body: formData,
    });

    const data = await parseJsonSafe(response);
    if (!response.ok || !data?.publicUrl) {
      throw new Error(data?.error || 'No se pudo obtener la URL pública del archivo');
    }

    return data.publicUrl;
  } catch (error) {
    console.error('Error al subir archivo:', error);
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
    const fileBlob = typeof file.arrayBuffer === 'function'
      ? new Blob([await file.arrayBuffer()], { type: file.type })
      : file;

    // Procesar la imagen: comprimir y generar miniatura usando el Blob estable
    const { original, thumbnail } = await processImageForUpload(fileBlob);

    // Generar paths para ambos archivos (convertidos a JPEG)
    const basePath = path.replace(/\.[^.]+$/, '');
    const originalPath = `${basePath}.jpg`;
    const thumbnailPath = `${basePath}_thumb.jpg`;

    const apiBaseUrl = getStorageApiBaseUrl();
    const authHeaders = await getStorageAuthHeaders();

    const originalFileName = originalPath.split('/').pop() || 'imagen.jpg';
    const thumbFileName = thumbnailPath.split('/').pop() || 'imagen_thumb.jpg';

    const formData = new FormData();
    formData.append('path', originalPath);
    formData.append('file', original, originalFileName);
    formData.append('thumbnail_path', thumbnailPath);
    formData.append('thumbnail', thumbnail, thumbFileName);

    const response = await fetch(`${apiBaseUrl}/upload_file`, {
      method: 'POST',
      headers: authHeaders,
      body: formData,
    });

    const data = await parseJsonSafe(response);
    if (!response.ok || !data?.publicUrl) {
      throw new Error(data?.error || 'No se pudo obtener la URL pública del archivo');
    }

    return {
      originalUrl: data.publicUrl,
      thumbnailUrl: data.thumbnailUrl || data.publicUrl,
    };
  } catch (error) {
    console.error('Error al subir imagen con miniatura:', error);
    throw error;
  }
};

// Función para eliminar archivos (soporta URLs nuevas en DonWeb y legacy en Supabase Storage)
export const eliminarArchivoPersistencia = async (url) => {
  try {
    if (!url) {
      return true;
    }

    // 1. Si es una URL alojada en DonWeb (/uploads/archivos/...)
    if (url.includes('/uploads/archivos/')) {
      const apiBaseUrl = getStorageApiBaseUrl();
      const authHeaders = await getStorageAuthHeaders();

      const response = await fetch(`${apiBaseUrl}/delete_file`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await parseJsonSafe(response);
      if (!response.ok || data?.success === false) {
        throw new Error(data?.error || 'Error al eliminar archivo en el servidor');
      }

      return true;
    }

    // 2. Fallback para URLs históricas en Supabase Storage antes de migrar
    // Ejemplo: https://xxxx.supabase.co/storage/v1/object/public/archivos/REPARACIONES/123/fotos/archivo.jpg
    const matches = url.match(/\/object\/public\/([^/]+)\/(.+)$/);
    if (!matches) {
      throw new Error('No se pudo extraer el path del archivo desde la URL');
    }

    const bucket = matches[1];
    const path = decodeURIComponent(matches[2]);
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;

    // Intentar eliminar también la miniatura si existe
    const thumbPath = path.replace(/\.([^.]+)$/, '_thumb.$1');
    if (thumbPath !== path) {
      try {
        await supabase.storage.from(bucket).remove([thumbPath]);
      } catch (_thumbError) {
        // No fallar si la miniatura no existe
      }
    }

    return true;
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    throw error;
  }
};
