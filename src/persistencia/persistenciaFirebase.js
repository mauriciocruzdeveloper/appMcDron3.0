//import firebase from  'firebase/app';
//const firebase = require('firebase/app');
// import firebase from 'firebase/app';

import { initializeApp } from "firebase/app";

import { 
    getAuth, 
    signInWithEmailAndPassword 
} from "firebase/auth"
import { 
    collection, 
    doc, 
    setDoc, 
    getFirestore, 
    getDoc,
    getDocs,
    query, 
    orderBy
} from "firebase/firestore";

var firebaseConfig = {
    apiKey: "AIzaSyCqupkvp1jXt8y8WjVjSuqi9OFMkJu_LpI",
    authDomain: "mc-dron.firebaseapp.com",
    projectId: "mc-dron",
    storageBucket: "mc-dron.appspot.com",
    messagingSenderId: "410639876260",
    appId: "1:410639876260:web:045fb9451d7ec1d6ee2631"
  };
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const firestore = getFirestore();



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
                        // ESTO DE ABAJO HAY QUE REVISAR. EN LUGAR DE PASAR PARÁMETRO POR PARÁMETRO Y USAR
                        // NOMBRES DISTINTOS, SE PODRÍA PASAR EL OBJETO ENTERO, Y LUEGO MAPEAR LOS PARÁMETROS
                        // EN EL REDUCER. EN EL STORE ESTARÍA EL OBJETO CON LOS PARÁMETROS TAL CUAL LOS PASA
                        // LA BASE DE DATOS.
                        const {Nick, UrlFotoUsu, NombreUsu, ApellidoUsu, CiudadUsu, DomicilioUsu, ProvinciaUsu, TelefonoUsu, Admin} = doc.data();

                        let usuario = {
                            nombre: NombreUsu, 
                            apellido: ApellidoUsu, 
                            email: emailParametro, 
                            nick: Nick, 
                            urlFoto: UrlFotoUsu, 
                            password: passwordParametro, 
                            admin: Admin, 
                            ciudad: CiudadUsu, 
                            domicilio: DomicilioUsu,  
                            provincia: ProvinciaUsu, 
                            telefono: TelefonoUsu
                        };

                        console.log("OBTUVO EL USUARIO: " + JSON.stringify(usuario));

                        return resolve(usuario);
                    }
                })
                .catch(error => {
                    console.log('Entra al catch get');
                    reject(error);
                });
                return resolve(); // ESTA LÍNEA PUEDE ESTAR MAL
            }else{
                console.log('Email is not verified');
                app.dialog.alert("Falta verificar el email. Compruebe su casilla de correos","Atención");
                userAuth.sendEmailVerification();
            }
        })
        .catch(error => {
            console.log(error.code);
            reject(error);
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

export const getReparacionPersistencia = (id) => {
    return new Promise((resolve, reject) => {

        const docRef = doc(firestore, 'REPARACIONES', id);
        getDoc(docRef)
        .then(docSnap => {
            resolve({id: id, data: docSnap.data()}) // Este objeto es una reparación.
        })
        .catch(error => reject(error))
    });
};

export const guardarReparacionPersistencia = (reparacion) => {

    return new Promise((resolve, reject) => {

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
// VER DONDE AGREGARLO PARA QUE ME ACTUALICE LAS REPARACIONES
// unsubscribeRep = colReparaciones.onSnapshot(function(snapshot){
//     console.log("detecta cambio reparaciones");
//     cargaListaRep()
// });