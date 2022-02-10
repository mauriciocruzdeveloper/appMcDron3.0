import { initializeApp } from "firebase/app";

import axios from 'axios';

import { 
    getAuth, 
    signInWithEmailAndPassword,
    sendEmailVerification
} from "firebase/auth"

import { 
    collection, 
    doc, 
    setDoc, 
    //getFirestore, COMENTADO PORQUE NO LO USO
    initializeFirestore,
    getDoc,
    getDocs,
    query, 
    orderBy,
    deleteDoc,
    enableIndexedDbPersistence,
    CACHE_SIZE_UNLIMITED // constante para caché ilimitada
} from "firebase/firestore";

// import { config as firebaseConfig }  from '../configProd'; // Para producción
import { config as firebaseConfig }  from '../configDev'; // Para desarrollo

import { provincias } from '../datos/provincias.json';

import { localidades } from '../datos/localidades.json';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Base de datos usando getFirestore()
//const firestore = getFirestore();
// Base de datos usando initializeFirestore() para pasar parámetro cacheSizeBytes
const firestore = initializeFirestore(firebaseApp, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
})

// Esto habilita la persistensia sin conexión
enableIndexedDbPersistence(firestore)
  .then(() => console.log("Persistencia habilitada"))
  .catch(err => console.log("Error en persistencia: " + err));


export const loginPersistencia = (emailParametro, passwordParametro) => {

    // La contraseña se encripta del lado del servidor por seguridad
    return new Promise((resolve, reject) => {

        console.log(emailParametro,passwordParametro);

        const auth = getAuth();

        signInWithEmailAndPassword(auth, emailParametro,passwordParametro)
        .then(async () => {
            console.log("Se logueó");
            let userAuth = auth.currentUser;
            if(userAuth.emailVerified) {
                console.log('Email is verified ' + emailParametro);
                let usuarioRef = doc(collection(firestore, "USUARIOS"), emailParametro);
                console.log('Pasa el ref:');
                await getDoc(usuarioRef)
                .then(doc => {
                    console.log('Entra al then get');
                    if(doc.exists){
                        console.log('Entra al doc.exists');
                        let usuario = {};
                        usuario.id = doc.id;
                        usuario.data = doc.data();
                        return resolve(usuario);
                    }
                })
                .catch(error => reject(error));
                return resolve(); // ESTA LÍNEA PUEDE ESTAR MAL
            }else{
                console.log('Email no verificado');
                await sendEmailVerification(userAuth)
                .then(reject({code: "Email no verificado. Se envió email de verificación a su casilla de correos"}))
                .catch(error => reject(error));
            }
        })
        .catch(error => {
            reject(error = {...error, code: "problema en el logueo"});
        });
    });

};

export const getReparacionesPersistencia = () => {
    return new Promise((resolve, reject) => {
        const reparacionesRef = collection(firestore, 'REPARACIONES');
        const q = query(reparacionesRef, orderBy("PrioridadRep"));
        getDocs(q)
        .then(querySnapshot => {
            let reparaciones = [];
            querySnapshot.forEach(doc => reparaciones.push({id: doc.id, data: doc.data()}))
            resolve(reparaciones)
        })
        .catch(error => reject(error))
    });
};

export const getUsuariosPersistencia = () => {
    return new Promise((resolve, reject) => {
        const usuariosRef = collection(firestore, 'USUARIOS');
        const q = query(usuariosRef, orderBy("NombreUsu"));
        getDocs(q)
        .then(querySnapshot => {
            let usuarios = [];
            querySnapshot.forEach(doc => usuarios.push({id: doc.id, data: doc.data()}))
            resolve(usuarios)
        })
        .catch(error => reject(error))
    });
};

export const getReparacionPersistencia = (id) => {
    return new Promise((resolve, reject) => {
        const docRef = doc(firestore, 'REPARACIONES', id);
        getDoc(docRef)
        .then(docSnap => {
            const idCliente = docSnap.data().UsuarioRep;
            const docRefCliente = doc(firestore, 'USUARIOS', idCliente);
            getDoc(docRefCliente)
            .then(docSnapCliente => {
                resolve({
                    id: id, 
                    data: {
                        ...docSnap.data(),
                        NombreUsu: docSnapCliente.data().NombreUsu,
                        ApellidoUsu: docSnapCliente.data().ApellidoUsu,
                        TelefonoUsu: docSnapCliente.data().TelefonoUsu
                    }

                })
            })
        })
        .catch(error => reject(error))
    });
};

export const getClientePersistencia = (id) => {
    console.log("id cliente: " + id);
    return new Promise((resolve, reject) => {
        const docRef = doc(firestore, 'USUARIOS', id);
        getDoc(docRef)
        .then(docSnap => {
            resolve({id: id, data: docSnap.data()}) // Este objeto es una reparación.
        })
        .catch(error => reject(error))
    });
};

export const guardarReparacionPersistencia = (reparacion) => {

    return new Promise((resolve, reject) => {
        console.log("Llega a guardarReparacionPersistencia");
        setDoc(
            doc(firestore, "REPARACIONES", reparacion.id), 
            reparacion.data
        )
        .then(() => {
            console.log("actualizado reparación ok");
            resolve(reparacion);
            //app.dialog.alert("Su reparacion se ha actualizado","Atención");
            //LO DE LAS FOTOS LO VEREMOS DESPUES
            //subeFotoReparacion(Date.now(),idReparacion,userAuth.email);
            // cargaListaRep();
            // precargaInicio();
        })
        .catch(error => {
            console.log("Error: " + error);
            reject(error);
        });

    })
};

export const guardarUsuarioPersistencia = (usuario) => {
    return new Promise((resolve, reject) => {
        console.log("Llega a guardarUsuarioPersistencia");
        setDoc(
            doc(firestore, "USUARIOS", usuario.id), 
            usuario.data
        )
        .then(() => {
            console.log("actualizado usuario ok");
            resolve(usuario);
        })
        .catch(error => {
            console.log("Error: " + error);
            reject(error);
        });
    })
};

export const eliminarReparacionPersistencia = (id) => {
    return new Promise((resolve, reject) => {
        deleteDoc(doc(firestore, "REPARACIONES", id))
        .then(() => {
            console.log("borrando reparación ok");
            resolve(id);
        })
        .catch(error => {
            console.log("Error: " + error);
            reject(error);
        });

    })
};

export const eliminarUsuarioPersistencia = (id) => {
    return new Promise((resolve, reject) => {
        deleteDoc(doc(firestore, "USUARIOS", id))
        .then(() => {
            console.log("borrando usuario ok");
            resolve(id);
        })
        .catch(error => {
            console.log("Error: " + error);
            reject(error);
        });

    })
};

// Obtengo las provincias desde un archivo propio

export const getProvinciasSelectPersistencia = () => {
    console.log("getProvinciasSelectPersistencia");
    return new Promise((resolve, reject) => {
    //     // Acá meto en el header el token para que el backend me autorice la consulta
    //     axios.get("../datos/provincias")
    //     .then(provincias => {
    //         return resolve(provincias.map(provincia => {
    //             return {
    //                 value: provincia.provincia,
    //                 label: provincia.provincia
    //             }
    //         }))
    //     }).
    //     catch(error => reject(error));
    // });
    
        resolve(provincias.map(provincia => {
            return {
                value: provincia.provincia,
                label: provincia.provincia
            }
        }))
    });
}

export const getLocPorProvPersistencia = (provincia) => {
     console.log("getLocPorProvPersistencia");
     return new Promise((resolve, reject) => {
        resolve(
            localidades.filter(localidad => (
                localidad.provincia.nombre == provincia
            ))
            .map(localidad => {
                return {
                    value: localidad.nombre,
                    label: localidad.nombre
                }
            })
        );
    })
};

// VER DONDE AGREGARLO PARA QUE ME ACTUALICE LAS REPARACIONES
// En lista reparaciones, en el effect, poner esto, y en el unmount del effect
// poner unsuscribeRep();
// unsubscribeRep = colReparaciones.onSnapshot(function(snapshot){
//     console.log("detecta cambio reparaciones");
//     cargaListaRep()
// })