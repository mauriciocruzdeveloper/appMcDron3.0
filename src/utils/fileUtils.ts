/**
 * Utilidades para sanitizar nombres de archivos y construir rutas de subida
 */

export const sanitizeBaseName = (name: string): string => {
  const extIndex = name.lastIndexOf('.');
  const baseName = extIndex !== -1 ? name.substring(0, extIndex) : name;
  return baseName.replace(/[^a-zA-Z0-9]/g, '_');
};

export interface BuildPathOptions {
  entityType: string; // e.g., 'REPARACIONES' or 'ASIGNACIONES'
  entityId: string;
  folder?: string; // e.g., 'fotos' or 'documentos'
  fileName: string; // sanitized base name without extension or with, depending on keepExtension
  keepExtension?: boolean; // if true, expects fileName includes extension
}

export const buildUploadPath = (opts: BuildPathOptions): string => {
  const folderPart = opts.folder ? `/${opts.folder}` : '';
  // No extension appended here: caller may expect subirImagenConMiniaturaPersistencia to add .jpg
  return `${opts.entityType}/${opts.entityId}${folderPart}/${opts.fileName}`;
};

export const addTimestampToBase = (base: string): string => {
  const timestamp = Date.now();
  return `${base}_${timestamp}`;

};
