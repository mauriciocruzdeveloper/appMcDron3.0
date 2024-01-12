import { initializeApp } from "firebase/app";

import { 
    getAuth, 
    signInWithEmailAndPassword,
    sendEmailVerification,
    createUserWithEmailAndPassword
} from "firebase/auth";

import {
    onSnapshot,
    where,
    limit,
    collection, 
    doc, 
    setDoc, 
    initializeFirestore,
    getDoc,
    addDoc,
    getDocs,
    updateDoc,
    query, 
    orderBy,
    deleteDoc,
    enableIndexedDbPersistence,
    CACHE_SIZE_UNLIMITED // constante para caché ilimitada
} from "firebase/firestore";

import { triggerNotification } from '../utils/utils';

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
        signInWithEmailAndPassword(auth, emailParametro, passwordParametro)
        .then(async () => {
            console.log("Se logueó");
            let userAuth = auth.currentUser;
            if(userAuth.emailVerified) {
                console.log('Email is verified ' + emailParametro);
                let usuarioRef = doc(collection(firestore, "USUARIOS"), emailParametro);
                await getDoc(usuarioRef)
                .then(doc => {
                    if(doc.exists){
                        let usuario = {};
                        usuario.id = doc.id;
                        usuario.data = doc.data();
                        return resolve(usuario);
                    }else{
                        reject({ code: "Problema en doc.exist en loginPersistencia()"});
                    }
                })
                .catch(() => reject({ code: "problema en el logueo" }));
                return resolve(); // ESTA LÍNEA PUEDE ESTAR MAL
            }else{
                console.log('Email no verificado');
                await sendEmailVerification(userAuth)
                .then(() => reject({code: "Email no verificado. Se envió email de verificación a su casilla de correos"}))
                .catch(() => reject({ code: "No se pudo enviar el email de verificación" }));
            };
        })
        .catch((error) => reject({ code: error.code }));
    });
};


// Registro
export const registroPersistencia = (registro) => {

    const { email, password, admin, NombreUsu, ApellidoUsu } = registro;

    const usuario = {
        id: email,
        data: {
            Admin: admin,
            EmailUsu: email,
            NombreUsu: NombreUsu,
            ApellidoUsu: ApellidoUsu
        }
    }

    return new Promise((resolve, reject) => {
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            // Signed in
            const user = userCredential.user;
            await guardarUsuarioPersistencia(usuario);
            await sendEmailVerification(user);
            resolve(user);
        })
        .catch((error) => {
            const errorCode = error.code;
            reject(errorCode);
        });
    });
}


//////////////////////// REPARACIONES ///////////////////////////////////////////////////////////////

// GET todas las Reparaciones
export const getReparacionesPersistencia = (setReparacionesToRedux, usuario, filtros = [ '' ]) => {
    console.log("getReparacionesPersistencia()");
    console.log("filtros: " + filtros);
    return new Promise((resolve, reject) => {
        // const unsubscribe = null;
        let queryReparaciones = "";
        if(usuario?.data?.Admin) {
            // con el not-in se podría hacer un array con los que no quiero que estén, o con el in los que sí quiero.
            queryReparaciones = query(collection(firestore, "REPARACIONES"), where("EstadoRep", "not-in", filtros)); // , orderBy("PrioridadRep"));
        } else {
            queryReparaciones = query(collection(firestore, "REPARACIONES"), where("UsuarioRep", "==", usuario.id));
        };
        try{
            const unsubscribeRep = onSnapshot(queryReparaciones, (querySnapshot) => {
                let reparaciones = [];
                querySnapshot.forEach(doc => reparaciones.push(
                    {
                        id: doc.id,
                        data: doc.data()
                    }
                ));
                setReparacionesToRedux(reparaciones);
                // Ordeno por prioridad porque firebase no me deja ordenar y filtrar por distintos campos.
                reparaciones.sort((a, b) => a.data.PrioridadRep - b.data.PrioridadRep);
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
            const idCliente = docSnap.data()?.UsuarioRep || '';
            const docRefCliente = doc(firestore, 'USUARIOS', idCliente);
            getDoc(docRefCliente)
            .then(docSnapCliente => {
                resolve({
                    id: id, 
                    data: {
                        ...docSnap.data(),
                        NombreUsu: docSnapCliente.data()?.NombreUsu,
                        ApellidoUsu: docSnapCliente.data()?.ApellidoUsu,
                        TelefonoUsu: docSnapCliente.data()?.TelefonoUsu,
                        EmailUsu: docSnapCliente.data()?.EmailUsu
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
        .then(docReparacion => {
            console.log("actualizado reparación ok");
            resolve(docReparacion || reparacion);
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
const triggerUsuarioReparaciones = (usuario) => {
    console.log("triggerUsuarioReparaciones()");
    return new Promise(async (resolve, reject) => {
        try {
            console.log("enter try triggerUsuarioReparaciones()");
            console.log("enter promise triggerUsuarioReparaciones()");
            const q = query(collection(firestore, "REPARACIONES"), where("UsuarioRep", "==", usuario.id));
            const docs = await getDocs(q);
                
            docs.forEach(doc => {
                guardarReparacionPersistencia({
                    id: doc.id,
                    data: {
                        ...doc.data(),
                        NombreUsu: usuario.data.NombreUsu,
                        ApellidoUsu: usuario.data.ApellidoUsu,
                        TelefonoUsu: usuario.data.TelefonoUsu,
                        EmailUsu: usuario.data.EmailUsu
                    }
                });                
            });
            resolve();
        }catch(error){
            console.log("error triggerUsuarioReparaciones()", error);
            () => reject(error);
        }
    });
}

export const guardarUsuarioPersistencia = (usuario) => {
    return new Promise((resolve, reject) => {
        // El id es el id o sino el email.
        usuario.id = usuario.id || usuario.data?.EmailUsu;
        setDoc(doc(firestore, "USUARIOS", usuario.id), usuario.data)
        .then(docUsuario => {
            triggerUsuarioReparaciones(usuario)
            .then(() => {
                console.log("actualizado usuario ok");
                resolve(docUsuario || usuario);
            })
            .catch((error) => {
                console.log("Error en triggerUsuarioReparaciones() al guardar Usuario", error);
                reject({ code: "Error en triggerUsuarioReparaciones() al guardar Usuario" })
            });
        })
        .catch(error => {
            console.log("Error: " + error);
            reject(error);
        });
    });
};

// DELETE Cliente
export const eliminarUsuarioPersistencia = (id) => {
    return new Promise(async (resolve, reject) => {
        // Busco si hay alguna reparación relacionada al usuario a eliminar
        const refCol = collection(firestore, "REPARACIONES");
        const q = query(refCol, where("UsuarioRep", "==", id));
        const querySnapshot = await getDocs(q);
        // Si la consulta no arroja ningún resultado, se elimina, sino da error y muestra reparación relacionada.
        if(querySnapshot.empty){
            deleteDoc(doc(firestore, "USUARIOS", id))
            .then(() => {
                console.log("borrando usuario ok");
                resolve(id);
            })
            .catch(error => {
                reject(error);
            });
        }else{
            reject({ 
                code: 
                    "No se puede borrar este usuario. Reparación relacionada: "
                    // Muestra en el mesaje de error los ids de las reparaciones relacionadas al usuario
                    + querySnapshot.docs.map(doc => doc.id).toString()
        });
        }

    })
};


////////////////////// MENSAJES ////////////////////////////////////////////

// SEND de un mensaje
// VER EL PROBLEMA DE LOS LEÍDOS Y NO LEÍDOS
export const sendMessagePersistencia = (message) => {
    console.log("sendMessagePersistencia()");
    return new Promise(async (resolve, reject) => {
        // Usu es el que está logueado, Cli es al que se le envía el mensaje
        let colRefUsu = collection(firestore, 'USUARIOS', message.data.from, 'messages');
        let colRefCli = collection(firestore, 'USUARIOS', message.data.to, 'messages');
        let dataUsu = {
            date: message.data.date,
            content: message.data.content,
            // Para el Usu, el Cli es el to
            emailCli: message.data.to,
            // El que envía siempre es el from
            sender: message.data.from,
            senderName: message.data.senderName,
            isRead: false 
        };
        let dataCli = {
            date: message.data.date,
            content: message.data.content,
            // Para el Cli, el Cli es el from
            emailCli: message.data.from,
            // El que envía siempre es el from
            sender: message.data.from,
            senderName: message.data.senderName,
            isRead: false 
        };
        // Actualiza los mensajes del Usu y del Cli (el qué envía y el que recibe)
        await addDoc(colRefUsu, dataUsu).catch(error => reject(error));
        await addDoc(colRefCli, dataCli).catch(error => reject(error));
        resolve();
    });
};

// GET todos los mensajes
export const getMessagesPersistencia = (emailUsu, emailCli, setMessagesToRedux) => {
    console.log("getMessagesPersistencia: " + emailUsu + ' ' + emailCli);
    return new Promise((resolve, reject) => {
        const colRef = collection(firestore, 'USUARIOS', emailUsu, 'messages');
        const q = query(colRef, where('emailCli', '==', emailCli), orderBy("date"));
        try {             
            const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
                let messages = [];
                querySnapshot.forEach(doc => messages.push({
                    id: doc.id, 
                    data: {
                        date: doc.data().date,
                        content: doc.data().content,
                        senderName: doc.data().senderName,
                        from: doc.data().sender,
                        // Si el que envió es el usuario, el to es el cliente, si el que envió es el cliente, el to es el usuario
                        to: doc.data().sender == emailUsu ? emailCli : emailUsu,
                        isRead: doc.data().isRead,
                        // emailUsu es el dueño del mensaje. Sirve para la ruta al buscar.
                        emailUsu: emailUsu
                    }
                }))
                setMessagesToRedux(messages);
                // Cuando leo los mensajes, marco los mensajes del cliente como leídos
            });
            // updateDoc(docRef, {
            //     isRead: true
            // });
            resolve(unsubscribeMessages); // Devuelvo la función de cancelación de suscripción.
        }catch(error){
            () => reject(error);
        }
    });
}

export const actualizarLeidosPersistencia = (mensajesLeidos) => {
    mensajesLeidos.forEach(async mensaje => {
        console.log("actualiza leidos, mensaje: " +     JSON.stringify(mensaje));
        const docRef = doc(collection(firestore, `USUARIOS/${mensaje.data.emailUsu}/messages`), mensaje.id);
        await updateDoc(docRef, {isRead: true}).then(console.log("ACTUALIZADO")).catch(error => console.log("ERROR: " + error.code));
    });
};

// Esta función probablemente no debería estar acá ////////////////////////
export const notificacionesPorMensajesPersistencia = (emailUsu) => {

    // PLUGIN cordova-plugin-firestore (no funciona el plugin) //////////////////////////////////////////

    // var options = {
    //     "datePrefix": '__DATE:',
    //     "fieldValueDelete": "__DELETE",
    //     "fieldValueServerTimestamp" : "__SERVERTIMESTAMP",
    //     "persist": true,
    //     // "config" : {}
    // };
      
    
    // options.config = firebaseConfig;  
      
    // Firestore.initialise(options).then(function(db) {
    // // Add a second document with a generated ID.
    //     const colRef = db.collection("USUARIOS").doc(emailUsu).collection(messages);
    //     const query = colRef.where("isRead", "==", false).where("sender", "!=", emailUsu);
    //     query.onSnapshot(querySnapshot => {
    //         querySnapshot.docChanges().forEach(change => {
    //             if(change.doc.data().sender != emailUsu){
    //                 const notification = {
    //                     title: "Nuevo Mensaje de " + change.doc.data().senderName,
    //                     text: change.doc.data().content,
    //                     foreground: true,
    //                     vibrate: true
    //                 }
    //                 triggerNotification(notification);
    //             }
    //         })
    //         //resolve();
    //     })
    //     .catch(function(error) {
    //         console.error("Error adding document: ", error);
    //     });
    // });

    ///////////////////////////////////////////////////////



    console.log("emailUsu: " + emailUsu);
    const colRef = collection(firestore, 'USUARIOS', emailUsu, 'messages');
    const q = query(colRef, where("isRead", "==", false), where("sender", "!=", emailUsu));
    try {
        const unsubscribeNotificationMenssages = onSnapshot(q, (querySnapshot) => {
            //const doc = querySnapshot.docs[0];
            querySnapshot.docChanges().forEach(change => {
                if(change.doc.data().sender != emailUsu){
                    const notification = {
                        title: "Nuevo Mensaje de " + change.doc.data().senderName,
                        text: change.doc.data().content,
                        foreground: true,
                        vibrate: true
                    }
                    triggerNotification(notification);
                }
            })
            //resolve();
        });
    }catch(error){
        () => reject(error);
    }
}

// VER PARA MANDAR NOTIFICACIONES DE UNA CONVERSACION AGRUPADAS POR REMITENTE
// cordova.plugins.notification.local.schedule({
//     id: 15,
//     title: 'Chat with Irish',
//     icon: 'http://climberindonesia.com/assets/icon/ionicons-2.0.1/png/512/android-chat.png',
//     text: [
//         { message: 'I miss you' },
//         { person: 'Irish', message: 'I miss you more!' },
//         { message: 'I always miss you more by 10%' }
//     ]
// });

// O SINO
// cordova.plugins.notification.local.schedule([
//     { id: 0, title: 'Design team meeting', ... },
//     { id: 1, summary: 'me@gmail.com', group: 'email', groupSummary: true },
//     { id: 2, title: 'Please take all my money', ... group: 'email' },
//     { id: 3, title: 'A question regarding this plugin', ... group: 'email' },
//     { id: 4, title: 'Wellcome back home', ... group: 'email' }
// ]);

////////////////////////////////////////////////////////////////////////


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

////////////////////// FUNCIONES UTILS ///////////////////////////

// Hash simple para generar los ids de los chats
function hash_method(inputAHash, inputBHash) { return inputAHash ^ inputBHash };







/////////////////////////////////////////////////////////////////////


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