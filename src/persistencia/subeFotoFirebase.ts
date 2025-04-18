import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirestore, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { collectionNames } from "../types/collectionNames";

async function subirArchivoReparacionBase(
  reparacionId: string,
  file: File,
  subcarpeta: string
): Promise<string> {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `${collectionNames.REPARACIONES}/${reparacionId}/${subcarpeta}/${file.name}`);
    await uploadBytes(storageRef, file);
    const urlArchivo = await getDownloadURL(storageRef);
    return urlArchivo;
  } catch (error) {
    console.error(`Error al subir ${subcarpeta}`, error);
    throw error;
  }
}

async function actualizarUrlArchivoEnReparacion(
  reparacionId: string, 
  urlArchivo: string, 
  nombreCampo: string
): Promise<void> {
  const db = getFirestore();
  await updateDoc(doc(db, collectionNames.REPARACIONES, reparacionId), {
    [nombreCampo]: arrayUnion(urlArchivo)
  });
}

export async function subirFotoReparacionPersistencia(
  reparacionId: string,
  file: File
): Promise<string> {
  try {
    const urlArchivo = await subirArchivoReparacionBase(reparacionId, file, "fotos");
    await actualizarUrlArchivoEnReparacion(reparacionId, urlArchivo, "urlsFotos");
    return urlArchivo;
  } catch (error) {
    console.error('Error al subir la foto de reparación', error);
    throw error;
  }
}

export async function subirDocumentoReparacionPersistencia(
  reparacionId: string,
  file: File
): Promise<string> {
  try {
    const urlArchivo = await subirArchivoReparacionBase(reparacionId, file, "documentos");
    await actualizarUrlArchivoEnReparacion(reparacionId, urlArchivo, "urlsDocumentos");
    return urlArchivo;
  } catch (error) {
    console.error('Error al subir el documento de reparación', error);
    throw error;
  }
}

export async function eliminarFotoReparacionPersistencia(
  reparacionId: string,
  fotoUrl: string
): Promise<void> {
  // 1) Borrar de Storage
  const storage = getStorage();
  const fotoRef = ref(storage, fotoUrl);
  const response = await deleteObject(fotoRef);
  // TODO: Verificar que la respuesta sea correcta
  console.log('TODO response', response);
  // 2) Remover la URL en Firestore
  const db = getFirestore();
  await updateDoc(doc(db, collectionNames.REPARACIONES, reparacionId), {
    urlsFotos: arrayRemove(fotoUrl)
  });
}

export async function eliminarDocumentoReparacionPersistencia(
  reparacionId: string,
  documentoUrl: string
): Promise<void> {
  // 1) Borrar de Storage
  const storage = getStorage();
  const documentoRef = ref(storage, documentoUrl);
  const response = await deleteObject(documentoRef);
  // TODO: Verificar que la respuesta sea correcta
  console.log('TODO response', response);
  // 2) Remover la URL en Firestore
  const db = getFirestore();
  await updateDoc(doc(db, collectionNames.REPARACIONES, reparacionId), {
    urlsDocumentos: arrayRemove(documentoUrl)
  });
}