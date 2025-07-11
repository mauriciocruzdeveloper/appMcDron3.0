import { supabase } from './supabaseClient.js';

// Función para subir archivos a Supabase Storage
export const subirArchivoPersistencia = async (path, file) => {
  try {
    // path: ruta completa dentro del bucket, por ejemplo: 'REPARACIONES/123/fotos/archivo.jpg'
    // file: Blob o File
    const bucket = 'archivos'; // Cambia por el nombre de tu bucket en Supabase
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true // Permite sobrescribir si ya existe
    });
    if (error) throw error;

    // Obtener la URL pública del archivo subido
    // TODO: Ver cómo hacer para que sea privado el bucket
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('No se pudo obtener la URL pública del archivo');
    }
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error al subir archivo a Supabase:', error);
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
    return true;
  } catch (error) {
    console.error('Error al eliminar archivo en Supabase:', error);
    throw error;
  }
};
