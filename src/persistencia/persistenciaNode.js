import axios from 'axios';

// import { config as firebaseConfig }  from '../configProd'; // Para producción
// import { config as firebaseConfig }  from '../configDev'; // Para desarrollo

import { provincias } from '../datos/provincias.json';

import { localidades } from '../datos/localidades.json';

const SERVIDOR = 'http://localhost:5000';


export const loginPersistencia = (email, password) => {
    return new Promise((resolve, reject) => {
        console.log("email en login api: " + email);
        console.log("password en login api: " + password);
        // Se pasa por post en el body para que no se vea el usuario ni el password en la url
        axios.post(SERVIDOR + '/api/login', 
            {
                email: email,
                password: password
            }
        ).then(response => {
            console.log("entra al then de getLoginOkApi en Empleados.utils");
            // En data está el token, que va a guardarse entre los datos del 
            // usaruio logueado.
            return resolve({ id: email, data: response.data });
        }).catch(error => {
            console.log("Error en catch getLoginOkApi:" + error);
            return reject({ ...error, code: `Error consulta codigo: ${error.response.status}` });
        });
    });
};

export const getReparacionesPersistencia = async () => {
    return new Promise((resolve, reject) => {
        // Acá meto en el header el token para que el backend me autorice la consulta
        const headers = { 'autorization': token() }
        axios.get(SERVIDOR + '/api/reparaciones', { headers })
        .then(response =>{
            let reparaciones = [];
            response.forEach(doc => reparaciones.push({ id: doc.data._id, data: doc.data }));
            resolve(reparaciones);
        })
        .catch(error => reject({ ...error, code: `Error consulta codigo: ${error.response.status}` }));
    });
};

export const getUsuariosPersistencia = async () => {
    return new Promise((resolve, reject) => {
        // Acá meto en el header el token para que el backend me autorice la consulta
        const headers = { 'autorization': token() }
        axios.get(SERVIDOR + '/api/usuarios', { headers })
        .then(response => {
            let usuarios = [];
            response.forEach(doc => usuarios.push({id: doc.data._id, data: doc.data}));
            resolve(usuarios);
        })
        .catch(error => reject({ ...error, code: `Error consulta codigo: ${error.response.status}` }));
    });
};

export const getReparacionPersistencia = (id) => {
    return new Promise((resolve, reject) => {
        const headers = { 'autorization': token() }
        axios.get(`${SERVIDOR}/api/reparaciones/${id}`, { headers })
        .then(response => resolve({ id: response.data._id, data: response.data }))
        .catch(error => reject({ ...error, code: `Error consulta codigo: ${error.response.status}` }));
    });
};

export const getClientePersistencia = (id) => {
    return new Promise((resolve, reject) => {
        const headers = { 'autorization': token() }
        axios.get(`${SERVIDOR}/api/usuarios/${id}`, { headers })
        .then(response => resolve({ id: response.data._id, data: response.data }))
        .catch(error => reject({ ...error, code: `Error consulta codigo: ${error.response.status}` }));
    });
};

export const guardarReparacionPersistencia = (reparacion) => {
    return new Promise((resolve, reject) => {
        const headers = {'autorization': token()}
        axios.post(SERVIDOR + '/api/reparaciones', { reparacion }, { headers }
        ).then(response => {
            console.log(response.data);
            return resolve(response.data);
        }).catch(error => {
            return reject(error);
        });
    });
};


export const guardarUsuarioPersistencia = (usuario) => {
    return new Promise((resolve, reject) => {
        const headers = {'autorization': token()}
        axios.post(SERVIDOR + '/api/usuarios', { usuario }, { headers })
        .then(response => resolve(response.data))
        .catch(error => reject(error));
    });
};

export const eliminarReparacionPersistencia = (id) => {
    return new Promise((resolve, reject) => {
        const headers = {'autorization': token()}
        axios.delete(`${SERVIDOR}/api/reparaciones/${id}`, { headers })
        .then(() => resolve(id))
        .catch(error => reject(error));
    });
};

export const eliminarUsuarioPersistencia = (id) => {
    return new Promise((resolve, reject) => {
        const headers = {'autorization': token()}
        axios.delete(`${SERVIDOR}/api/usuarios/${id}`, { headers })
        .then(() => resolve(id))
        .catch(error => reject(error));
    });
};

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

// Localidades filtradas por provincia.
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