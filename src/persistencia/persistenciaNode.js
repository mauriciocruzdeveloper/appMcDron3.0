import axios from 'axios';

import { token } from '../token';

import { provincias } from '../datos/provincias.json';

import { localidades } from '../datos/localidades.json';

const SERVIDOR = 'http://localhost:5000';

//////////////////// LOGIN //////////////////////

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
            return reject({ ...error, code: `Error consulta codigo: ${error?.response?.status}` });
        });
    });
};

//////////////////// REPARACIONES //////////////////////

// Devuelve todas las reparaciones
export const getReparacionesPersistencia = (setReparacionesToRedux) => {
    return new Promise((resolve, reject) => {
        const headers = { 'autorization': token() }
        axios.get(`${SERVIDOR}/api/reparaciones`, { headers })
        .then(response => {
            let reparaciones = [];
            response.data.forEach(doc => {
                let id = doc._id;
                delete doc._id;
                delete response.data.__v;
                reparaciones.push({id: id, data: doc});
            });
            // Esto lo tuve que agregar para que funcione más o menos igual
            // que la versión de Firebase.
            setReparacionesToRedux(reparaciones);
            resolve(reparaciones);
        })
        .catch(error => reject({ ...error, code: `Error consulta codigo: ${error?.response?.status}` }));
    });
};

// Trae una reparación por id
export const getReparacionPersistencia = (id) => {
    console.log("getReparacionPersistencia()");
    return new Promise((resolve, reject) => {
        console.log("llega a Promesa de getReparacionPersistencia");
        const headers = { 'autorization': token() }
        axios.get(`${SERVIDOR}/api/reparaciones/${id}`, { headers })
        .then(async response => {
            console.log("llega al then de getReparacionPersistencia");
            let id = response.data._id;
            // Borro el id y el v para no pasar datos que no corresponden al cuerpo del objeto.
            delete response.data._id;
            delete response.data.__v;
            let reparacion = {};
            reparacion.id = id;
            reparacion.data = response.data;
            await getUsuariosPersistencia(reparacion.data.UsuarioRep)
            .then(usuario => {
                reparacion.data = { ...reparacion.data, ...usuario.data };
            })
            .catch(error => reject({ code: "Error en getReparacionPersistencia" }));
            console.log("reparacion en gerReparacionPersistencia: " + JSON.stringify(reparacion));
            resolve(reparacion);
        })
        .catch(error => {
            console.log("llega al catch de getReparacionPersistencia");
            reject({ ...error, code: `Error consulta codigo: ${error?.response?.status}` })
        });
    });
};

// Guarda una reparación. Ver la del usuario
export const guardarReparacionPersistencia = (reparacion) => {
    return new Promise((resolve, reject) => {
        const headers = {'autorization': token()}
        console.log("data: " + JSON.stringify(reparacion.data));
        reparacion.id 
        ? axios.patch(`${SERVIDOR}/api/reparaciones/${reparacion.id}`, reparacion.data, { headers })
            .then(response => resolve(response.data))
            .catch(error => reject(error))
        : axios.post(`${SERVIDOR}/api/reparaciones`, reparacion.data, { headers })
            .then(response => resolve(response.data))
            .catch(error => reject(error));
    });
};

// Elimina una reparción
export const eliminarReparacionPersistencia = (id) => {
    return new Promise((resolve, reject) => {
        const headers = {'autorization': token()}
        axios.delete(`${SERVIDOR}/api/reparaciones/${id}`, { headers })
        .then(() => resolve(id))
        .catch(() => reject( {code: `Error POST usu guardarUsuarioPersistencia` }));
    });
};

//////////////////// REPARACIONES //////////////////////

// Trae todos los usuarios
export const getUsuariosPersistencia = async (setUsuariosToRedux) => {
    console.log("llega a getUsuariosPersistencia()");
    return new Promise((resolve, reject) => {
        // Acá agrego en el header el token() para que el backend me autorice la consulta
        const headers = { 'autorization': token() }
        axios.get(`${SERVIDOR}/api/usuarios`, { headers })
        .then(response => {
            let usuarios = [];
            response.data.forEach(doc => usuarios.push(transformMongooseToApp(doc)));
            setUsuariosToRedux(usuarios);
            resolve(usuarios);
        })
        .catch(() => reject({ code: `Error en getUsuariosPersistencia() al hacer get con axios` }));
    });
};

// Trae un usuario por id
export const getClientePersistencia = (id) => {
    return new Promise((resolve, reject) => {
        const headers = { 'autorization': token() }
        axios.get(`${SERVIDOR}/api/usuarios/${id}`, { headers })
        .then(response => resolve(transformMongooseToApp(response)))
        .catch(() => reject({ code: `Error en getUsuariosPersistencia() al hacer get con axios` }));
    });
};

export const getClientePorEmailPersistencia = (id) => {
    console.log("getClientePorEmailPersistencia: " + id);
    return new Promise((resolve, reject) => {
        const headers = { 'autorization': token() }
        axios.get(`${SERVIDOR}/api/usuarioByEmail/${id}`, { headers })
        .then(response => resolve(transformMongooseToApp(response)))
        .catch(() => reject({ code: `Error en getUsuariosPersistencia() al hacer get con axios` }));
    });
};

// Esta función guarda. Hace un alta o modifica según si tiene un id o no el usuario.
// Esto mismo en Firebase no lo hago porque firebase lo hace automáticamente.
export const guardarUsuarioPersistencia = (usuario) => {
    return new Promise((resolve, reject) => {
        const headers = {'autorization': token()}
        console.log("data: " + JSON.stringify(usuario.data));
        console.log("usuario.id: " + usuario.id);
        if(usuario.id){
            console.log("llega A PATCH");
            axios.patch(`${SERVIDOR}/api/usuarios/${usuario.id}`, usuario.data, { headers })
            .then(response => resolve(transformMongooseToApp(response)))
            .catch(() => reject( {code: `Error PATCH usu guardarUsuarioPersistencia()` }));
        }
        else{
            console.log("llega A POST: " + JSON.stringify(usuario.data));
            axios.post(SERVIDOR + '/api/usuarios', usuario.data, { headers })
            .then(response => resolve(transformMongooseToApp(response)))
            .catch(() => reject( {code: `Error POST usu guardarUsuarioPersistencia()` }));
        };
    });
};

// Elimina un usuario
export const eliminarUsuarioPersistencia = (id) => {
    return new Promise((resolve, reject) => {
        const headers = {'autorization': token()}
        axios.delete(`${SERVIDOR}/api/usuarios/${id}`, { headers })
        .then(() => resolve(id))
        .catch(() => reject( {code: `Error DELETE en eliminarUsuarioPersistencia()` }));
    });
};


///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////


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
            localidades
            .filter(localidad => (
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

// Quita _id y __v de response.data.
const transformMongooseToApp = (response) => {
    let objeto = {};
    objeto.id = response.data._id;
    delete response.data._id;
    delete response.data.__v;
    objeto.data = response.data;
    return objeto;
}