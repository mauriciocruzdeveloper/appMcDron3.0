/**
 * Utilidades para procesamiento de imágenes
 * - Compresión
 * - Redimensionado
 * - Generación de miniaturas
 */

export interface ImageSize {
  width: number;
  height: number;
}

export interface ProcessedImage {
  blob: Blob;
  width: number;
  height: number;
}

// Tamaños estándar
export const IMAGE_SIZES = {
  // Miniatura muy pequeña para listados y galerías (muy ágil)
  THUMBNAIL: { width: 400, height: 300 },
  // Tamaño máximo para la imagen "original" (evitar subir 4000x3000)
  MAX_ORIGINAL: { width: 1600, height: 1200 },
};

// Calidad de compresión JPEG (0-1)
export const JPEG_QUALITY = {
  THUMBNAIL: 0.7,  // 70% - buena relación calidad/tamaño para miniaturas
  ORIGINAL: 0.85,  // 85% - buena calidad para visualización
};

/**
 * Carga una imagen desde un File/Blob y retorna un HTMLImageElement
 */
const loadImage = (file: File | Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Error al cargar la imagen'));
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calcula las dimensiones manteniendo el aspect ratio
 */
const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): ImageSize => {
  let width = originalWidth;
  let height = originalHeight;

  // Si la imagen es más pequeña que el máximo, no redimensionar
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  // Calcular el ratio de aspecto
  const aspectRatio = width / height;

  if (width > maxWidth) {
    width = maxWidth;
    height = Math.round(width / aspectRatio);
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = Math.round(height * aspectRatio);
  }

  return { width, height };
};

/**
 * Redimensiona y comprime una imagen
 */
const resizeImage = (
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  quality: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('No se pudo obtener el contexto del canvas'));
      return;
    }

    // Usar mejor calidad de interpolación
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Dibujar la imagen redimensionada
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Convertir a Blob JPEG
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Error al generar el blob de la imagen'));
        }
      },
      'image/jpeg',
      quality
    );
  });
};

/**
 * Procesa una imagen: la redimensiona y comprime según los parámetros dados
 */
export const processImage = async (
  file: File | Blob,
  maxSize: ImageSize,
  quality: number
): Promise<ProcessedImage> => {
  const img = await loadImage(file);
  
  const { width, height } = calculateDimensions(
    img.width,
    img.height,
    maxSize.width,
    maxSize.height
  );

  const blob = await resizeImage(img, width, height, quality);

  return { blob, width, height };
};

/**
 * Genera una miniatura de la imagen
 * Retorna un Blob optimizado para carga rápida
 */
export const generateThumbnail = async (file: File | Blob): Promise<Blob> => {
  const result = await processImage(
    file,
    IMAGE_SIZES.THUMBNAIL,
    JPEG_QUALITY.THUMBNAIL
  );
  return result.blob;
};

/**
 * Comprime la imagen original a un tamaño razonable
 * Evita subir imágenes de 4000x3000 cuando 1600x1200 es suficiente
 */
export const compressOriginal = async (file: File | Blob): Promise<Blob> => {
  const result = await processImage(
    file,
    IMAGE_SIZES.MAX_ORIGINAL,
    JPEG_QUALITY.ORIGINAL
  );
  return result.blob;
};

/**
 * Procesa una imagen para subida: genera tanto la versión comprimida como la miniatura
 * Retorna ambos blobs listos para subir
 */
export const processImageForUpload = async (
  file: File | Blob
): Promise<{ original: Blob; thumbnail: Blob }> => {
  const img = await loadImage(file);

  // Generar versión "original" comprimida
  const originalDims = calculateDimensions(
    img.width,
    img.height,
    IMAGE_SIZES.MAX_ORIGINAL.width,
    IMAGE_SIZES.MAX_ORIGINAL.height
  );
  const original = await resizeImage(
    img,
    originalDims.width,
    originalDims.height,
    JPEG_QUALITY.ORIGINAL
  );

  // Generar miniatura
  const thumbDims = calculateDimensions(
    img.width,
    img.height,
    IMAGE_SIZES.THUMBNAIL.width,
    IMAGE_SIZES.THUMBNAIL.height
  );
  const thumbnail = await resizeImage(
    img,
    thumbDims.width,
    thumbDims.height,
    JPEG_QUALITY.THUMBNAIL
  );

  return { original, thumbnail };
};

/**
 * Genera el nombre del archivo de miniatura a partir del nombre original
 * Ejemplo: "foto_123456789.jpg" -> "foto_123456789_thumb.jpg"
 */
export const getThumbnailFilename = (originalFilename: string): string => {
  const lastDotIndex = originalFilename.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return `${originalFilename}_thumb`;
  }
  const baseName = originalFilename.substring(0, lastDotIndex);
  // Siempre usamos .jpg porque convertimos a JPEG
  return `${baseName}_thumb.jpg`;
};

/**
 * Obtiene la URL de la miniatura a partir de la URL original
 * Ejemplo: ".../foto_123.jpg" -> ".../foto_123_thumb.jpg"
 */
export const getThumbnailUrl = (originalUrl: string): string => {
  const lastDotIndex = originalUrl.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return `${originalUrl}_thumb`;
  }
  const baseName = originalUrl.substring(0, lastDotIndex);
  return `${baseName}_thumb.jpg`;
};
