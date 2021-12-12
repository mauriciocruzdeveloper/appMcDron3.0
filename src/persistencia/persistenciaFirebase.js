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
        .then(() => {
            console.log("Se logueó");
            let userAuth = auth.currentUser;
            if(userAuth.emailVerified) {
                console.log('Email is verified ' + emailParametro);
                let usuarioRef = doc(collection(firestore, "USUARIOS"), emailParametro);
                console.log('Pasa el ref:' + JSON.stringify(usuarioRef));
                getDoc(usuarioRef)
                .then(doc => {
                    console.log('Entra al then get');
                    if(doc.exists){
                        console.log('Entra al doc.exists');
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

                        console.log(JSON.stringify(usuario));

                        return resolve(usuario);
                    }
                })
                .catch(error => {
                    console.log('Entra al catch get');
                    reject(error);
                });
                return resolve();
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
            querySnapshot.forEach(doc => reparaciones.push({id: doc.id, data:doc.data()}))
            resolve(reparaciones)
        })
        .catch(error => reject(error))
    });
};


// VER DONDE AGREGARLO PARA QUE ME ACTUALICE LAS REPARACIONES
// unsubscribeRep = colReparaciones.onSnapshot(function(snapshot){
//     console.log("detecta cambio reparaciones");
//     cargaListaRep()
// });