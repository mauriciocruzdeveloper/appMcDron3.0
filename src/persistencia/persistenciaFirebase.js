import { initializeApp } from "firebase/app";

import { 
    getAuth, 
    signInWithEmailAndPassword,
    sendEmailVerification
} from "firebase/auth";

import {
    onSnapshot,
    where,
    collection, 
    doc, 
    setDoc, 
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
// const firestore = getFirestore();
// Base de datos usando initializeFirestore() para pasar parámetro cacheSizeBytes
const firestore = initializeFirestore(firebaseApp, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
})


// Habilita la persistensia sin conexión
enableIndexedDbPersistence(firestore)
  .then(() => console.log("Persistencia habilitada"))
  .catch(err => console.log("Error en persistencia: " + err));


// Login
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

//////////////////////// REPARACIONES ///////////////////////////////////////////////////////////////

// GET todas las Reparaciones
export const getReparacionesPersistencia = (setReparacionesToRedux) => {
    console.log("getReparacionesPersistencia");
    return new Promise((resolve, reject) => {
        // const unsubscribe = null;
        const q = query(collection(firestore, "REPARACIONES"), orderBy("PrioridadRep"));
        try{
            const unsubscribeRep = onSnapshot(q, (querySnapshot) => {
                let reparaciones = [];
                querySnapshot.forEach(doc => reparaciones.push({id: doc.id, data: doc.data()}));
                // console.log("reparaciones en getReparacionesPersistencia(): " + JSON.stringify(reparaciones[0]));
                setReparacionesToRedux(reparaciones);
                resolve(reparaciones);
            });
        }catch(error){
            () => reject(error);
        };
    });
}

// GET Reparación por id
export const getReparacionPersistencia = (id) => {
    return new Promise((resolve, reject) => {
        const docRef = doc(firestore, 'REPARACIONES', id);
        getDoc(docRef)
        .then(docSnap => {
            const idCliente = docSnap.data().UsuarioRep;
            const docRefCliente = doc(firestore, 'USUARIOS', idCliente);
            getDoc(docRefCliente)
            .then(docSnapCliente => {
                console.log("docSnapCliente: " + JSON.stringify(docSnapCliente.data()));
                resolve({
                    id: id, 
                    data: {
                        ...docSnap.data(),
                        NombreUsu: docSnapCliente.data().NombreUsu,
                        ApellidoUsu: docSnapCliente.data().ApellidoUsu,
                        TelefonoUsu: docSnapCliente.data().TelefonoUsu,
                        EmailUsu: docSnapCliente.data().EmailUsu
                    }
                })
            })
        })
        .catch(error => reject(error))
    });
};

// GUARDAR Reparación
export const guardarReparacionPersistencia = (reparacion) => {
    return new Promise((resolve, reject) => {
        // El id es el id o sino la fecha de consulta.
        reparacion.id = (reparacion.id || reparacion.data?.FeConRep.toString());
        setDoc(
            doc(firestore, "REPARACIONES", reparacion.id), 
            reparacion.data
        )
        .then(() => {
            console.log("actualizado reparación ok");
            resolve(reparacion);
        })
        .catch(error => {
            console.log("Error: " + error);
            reject(error);
        });
    })
};

// DELETE Reparación por id
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



///////////////////// CLIENTES/USUARIOS ///////////////////////////////////////////////////////////////////////////

// GET todos los clientes
export const getUsuariosPersistencia = (setUsuariosToRedux) => {
    console.log("getUsuariosPersistencia");
    return new Promise((resolve, reject) => {
        // const unsubscribe = null;
        const q = query(collection(firestore, "USUARIOS"), orderBy("NombreUsu"));
        try {
            const unsubscribeUsu = onSnapshot(q, (querySnapshot) => {
                let usuarios = [];
                querySnapshot.forEach(doc => usuarios.push({id: doc.id, data: { ...doc.data(), EmailUsu: doc.id}}))
                // console.log("usuarios en getUsuariosPersistencia(): " + JSON.stringify(usuarios[0]));
                // Esta función es una callback. Se llama igual que el action creator
                console.log(JSON.stringify(setUsuariosToRedux));
                setUsuariosToRedux(usuarios);
                resolve(usuarios);
            });
        }catch(error){
            () => reject(error);
        }
    });
}

// GET Cliente por id
export const getClientePersistencia = (id) => {
    return new Promise((resolve, reject) => {
        const docRef = doc(firestore, 'USUARIOS', id);
        getDoc(docRef)
        .then(docSnap => resolve({id: id, data: { ...docSnap.data(), EmailUsu: id }})) // Este objeto es una reparación.
        .catch(error => reject(error))
    });
};

// En Firesbase el id del cliente es el email.
export const getClientePorEmailPersistencia = getClientePersistencia;

// GUARDAR Cliente
export const guardarUsuarioPersistencia = (usuario) => {
    return new Promise((resolve, reject) => {
        console.log("Llega a guardarUsuarioPersistencia");
        // El id es el id o sino el email.
        usuario.id = usuario.id || usuario.data?.EmailUsu;
        setDoc(doc(firestore, "USUARIOS", usuario.id), usuario.data)
        .then(usuario => {
            console.log("actualizado usuario ok");
            resolve(usuario);
        })
        .catch(error => {
            console.log("Error: " + error);
            reject(error);
        });
    })
};

// DELETE Cliente
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

///////////// PRESUPUESTO ///////////////////////////////////////////////////

export const guardarPresupuestoPersistencia = (presupuesto) => {
    // En firebase, agrego información del usuario a la reparación para que sea mas performante la app
    presupuesto.reparacion.data.NombreUsu = presupuesto.usuario.data?.NombreUsu || '';
    presupuesto.reparacion.data.ApellidoUsu = presupuesto.usuario.data?.ApellidoUsu || '';
    presupuesto.reparacion.data.EmailUsu = presupuesto.usuario.data?.EmailUsu || '';
    presupuesto.reparacion.data.TelefonoUsu = presupuesto.usuario.data?.TelefonoUsu || '';
    return new Promise((resolve, reject) => {
        guardarUsuarioPersistencia(presupuesto.usuario)
        .then(() => {
            presupuesto.reparacion.data.UsuarioRep = presupuesto.usuario.data.EmailUsu;
            guardarReparacionPersistencia(presupuesto.reparacion)
            .then(() => resolve(presupuesto))
            .catch(() => reject({ code: "Error en guardarPresupuestoPersistencia() al guardar Reparación" }));
        })
        .catch(()  => reject({ code: "Error en guardarPresupuestoPersistencia() al guardar Usuario" }));
    });
}






/////// OBTENER DATOS PARA LA PRESENTACIÓN DESDE LA PERSISTENCIA ////////////////////
// Todos los datos deberían provenir desde la persistencia.
// Estas funciones cargan los en la app.
/////////////
// Los estados funcionan con el otro enfoque, el de buscarlos directamente en el componente.
// Ver bien qué conviene. QUizás el enfoque de los estados podría usarse pero
// en componentes contenedores...

// Obtengo las provincias desde un archivo propio
export const getProvinciasSelectPersistencia = () => {
    console.log("getProvinciasSelectPersistencia");
    return new Promise((resolve, reject) => {
        resolve(provincias.map(provincia => {
            return {
                value: provincia.provincia,
                label: provincia.provincia
            }
        }))
    });
}

// Obtengo las localidades por provincia desde /data
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



/////////////// FUNCIONES A DESCARTAR /////////////////////////////

// export const getReparacionesPersistencia = () => {
//     return new Promise((resolve, reject) => {
//         const reparacionesRef = collection(firestore, 'REPARACIONES');
//         const q = query(reparacionesRef, orderBy("PrioridadRep"));
//         getDocs(q)
//         .then(querySnapshot => {
//             let reparaciones = [];
//             querySnapshot.forEach(doc => reparaciones.push({id: doc.id, data: doc.data()}))
//             resolve(reparaciones)
//         })
//         .catch(error => reject(error))
//     });
// };

// export const getUsuariosPersistencia = () => {
//     return new Promise((resolve, reject) => {
//         const usuariosRef = collection(firestore, 'USUARIOS');
//         const q = query(usuariosRef, orderBy("NombreUsu"));
//         getDocs(q)
//         .then(querySnapshot => {
//             let usuarios = [];
//             querySnapshot.forEach(doc => usuarios.push({id: doc.id, data: { ...doc.data(), EmailUsu: doc.id}}))
//             resolve(usuarios)
//         })
//         .catch(error => reject(error))
//     });
// };2