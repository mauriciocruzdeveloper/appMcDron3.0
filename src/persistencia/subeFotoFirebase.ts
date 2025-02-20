import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirestore, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { collectionNames } from "../types/collectionNames";

export async function subirFotoReparacionPersistencia(
  reparacionId: string,
  file: File
): Promise<string> {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `${collectionNames.REPARACIONES}/${reparacionId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const urlFoto = await getDownloadURL(storageRef);
    const db = getFirestore();
    await updateDoc(doc(db, collectionNames.REPARACIONES, reparacionId), {
      "urlsFotos": arrayUnion(urlFoto)
    });
    return urlFoto;
  } catch (error) {
    console.error('Error al subir foto', error);
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
  console.log('!!! response', response);
  // 2) Remover la URL en Firestore
  const db = getFirestore();
  await updateDoc(doc(db, collectionNames.REPARACIONES, reparacionId), {
    urlsFotos: arrayRemove(fotoUrl)
  });
}