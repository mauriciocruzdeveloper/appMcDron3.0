import axios from 'axios';

import { token } from '../token';

import { provincias } from '../datos/provincias.json';

import { localidades } from '../datos/localidades.json';

const SERVIDOR = 'http://localhost:8080';

//////////////////// LOGIN //////////////////////

export const loginPersistencia = (email, password) => {
    return new Promise((resolve, reject) => {
        // console.log("email en login api: " + email);
        // console.log("password en login api: " + password);
        // // Se pasa por post en el body para que no se vea el usuario ni el password en la url
        // axios.post(SERVIDOR + '/login', 
        //     {
        //         email: email,
        //         password: password
        //     }
        // ).then(response => {
        //     console.log("entra al then de getLoginOkApi en Empleados.utils");
        //     // En data está el token, que va a guardarse entre los datos del 
        //     // usaruio logueado.
            return resolve({ id: email, data: { NombreUsu: "Mauricio", Nick: "admin" } });
        // }).catch(error => {
        //     console.log("Error en catch getLoginOkApi:" + error);
        //     return reject({ ...error, code: `Error consulta codigo: ${error?.response?.status}` });
        // });
    });
};

/////////////////// PRESUPUESTO /////////////////////////////

export const guardarPresupuestoPersistencia = (presupuesto) => {
    let { usuario, reparacion } = presupuesto;
    return new Promise((resolve, reject) => {
        guardarUsuarioPersistencia(usuario)
        .then(usuario => {
            reparacion.data.UsuarioRep = usuario.id
            guardarReparacionPersistencia(reparacion)
            .then(() => resolve())
            .catch(() => reject({ code: "Error en guardarPresupuestoPersistencia() al guardar Reparación" }));
        })
        .catch(()  => reject({ code: "Error en guardarPresupuestoPersistencia() al guardar Usuario" }));
    });
}

//////////////////// REPARACIONES //////////////////////

// Devuelve todas las reparaciones
export const getReparacionesPersistencia = (setReparaciones) => {
    return new Promise((resolve, reject) => {
        const headers = { 'autorization': token() }
        axios.get(`${SERVIDOR}/reparaciones`, { headers })
        .then(response => {
            let reparaciones = [];
            response.data.forEach(doc => {
                reparaciones.push(transformReparacionJavaToApp(doc));
            });
            // Esto lo tuve que agregar para que funcione más o menos igual
            // que la versión de Firebase.
            setReparaciones(reparaciones);
            resolve(reparaciones);
        })
        .catch(() => reject({ code: `Error en getReparacionesPersistencia()` }));
    });
};

// Trae una reparación por id
export const getReparacionPersistencia = (id) => {
    return new Promise((resolve, reject) => {
        const headers = { 'autorization': token() }
        axios.get(`${SERVIDOR}/reparaciones/${id}`, { headers })
        // devuelvo el response, pero transformado a objeto de mi app
        .then(response => resolve(transformReparacionJavaToApp(response.data)))
        .catch(() => reject({ code: `Error en getReparacionPersistencia() en axios` }));
    });
};

// Guarda una reparación. Ver la del usuario
export const guardarReparacionPersistencia = (reparacion) => {
    return new Promise((resolve, reject) => {
        const headers = {'autorization': token()}
        if(reparacion.id){
             axios.patch(`${SERVIDOR}/reparaciones/${reparacion.id}`, transformReparacionAppToJava(reparacion), { headers })
            .then(response => resolve(transformReparacionJavaToApp(response.data)))
            .catch(error => reject(error))
        }else{
            axios.post(`${SERVIDOR}/reparaciones`, transformReparacionAppToJava(reparacion), { headers })
            .then(response => resolve(response.data))
            .catch(error => reject(error));
        }
    });
};

// Elimina una reparción
export const eliminarReparacionPersistencia = (id) => {
    return new Promise((resolve, reject) => {
        const headers = {'autorization': token()}
        axios.delete(`${SERVIDOR}/reparaciones/${id}`, { headers })
        .then(() => resolve(id))
        .catch(error => reject(error));
    });
};

//////////////////// REPARACIONES //////////////////////

// Trae todos los usuarios
export const getUsuariosPersistencia = async (setUsuariosToRedux) => {
    return new Promise((resolve, reject) => {
        // Acá agrego en el header el token() para que el backend me autorice la consulta
        const headers = { 'autorization': token() }
        axios.get(`${SERVIDOR}/usuarios`, { headers })
        .then(response => {
            let usuarios = [];
            response.data.forEach(doc => usuarios.push(transformUsuarioJavaToApp(doc)));
            setUsuariosToRedux(usuarios);
            resolve(usuarios);
        })
        // Da error cuando intenta leer status
        .catch(error => reject({ ...error, code: `Error consulta codigo: ${error?.response?.status}` }));
    });
};

// Trae un usuario por id
export const getClientePersistencia = (id) => {
    return new Promise((resolve, reject) => {
        const headers = { 'autorization': token() }
        axios.get(`${SERVIDOR}/usuarios/${id}`, { headers })
        .then(response => resolve(transformUsuarioJavaToApp(response)))
        .catch(error => reject({ ...error, code: `Error consulta codigo: ${error.response.status}` }));
    });
};

// Busca un cliente por email
export const getClientePorEmailPersistencia = (id) => {
    return new Promise((resolve, reject) => {
        const headers = { 'autorization': token() }
        axios.get(`${SERVIDOR}/usuarioByEmail/${id}`, { headers })
        .then(response => resolve(transformUsuarioJavaToApp(response)))
        .catch(error => reject({ ...error, code: `Error consulta codigo: ${error.response.status}` }));
    });
};

// Esta función guarda. Hace un alta o modifica según si tiene un id o no el usuario.
// Esto mismo en Firebase no lo hago porque firebase lo hace automáticamente.
export const guardarUsuarioPersistencia = (usuario) => {
    return new Promise((resolve, reject) => {
        const headers = {'autorization': token()}
        if(usuario.id){
            axios.patch(`${SERVIDOR}/usuarios/${usuario.id}`, transformUsuarioAppToJava(usuario), { headers })
            .then(response => resolve(transformUsuarioJavaToApp(response.data)))
            .catch(() => reject( {code: `Error PATCH usu guardarUsuarioPersistencia` }))
        }
        else{
            axios.post(SERVIDOR + '/usuarios', transformUsuarioAppToJava(usuario), { headers })
            .then(response => resolve(transformUsuarioJavaToApp(response.data)))
            .catch(error => {
                console.log("error: " + JSON.stringify(error.message));
                reject({code: error.messaje})
            });
        }
    });
};

// Elimina un usuario
export const eliminarUsuarioPersistencia = (id) => {
    return new Promise((resolve, reject) => {
        const headers = {'autorization': token()}
        axios.delete(`${SERVIDOR}/usuarios/${id}`, { headers })
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

// transforma el objeto de como viene del backend de java a app o al revés

const transformReparacionJavaToApp = ({
    id,
    estadoRep,
    prioridadRep,
    driveRep,
    feConRep,
    usuarioRep,
    droneRep,
    descripcionUsuRep,
    feRecRep,
    numeroSerieRep,
    descripcionTecRep,
    presuMoRep,
    presuReRep,
    presuFiRep,
    presuDiRep,
    txtRepuestosRep,
    informeRep,
    feFinRep,
    feEntRep,
    txtEntregaRep,
    seguimientoEntregaRep }) => {

    return {
        id: id,
        data: {
            EstadoRep: estadoRep,
            PrioridadRep: prioridadRep,
            DriveRep: driveRep,
            FeConRep: feConRep,
            UsuarioRep: usuarioRep,
            DroneRep: droneRep,
            DescripcionUsuRep: descripcionUsuRep,
            FeRecRep: feRecRep,
            NumeroSerieRep: numeroSerieRep,
            DescripcionTecRep: descripcionTecRep,
            PresuMoRep: presuMoRep,
            PresuReRep: presuReRep,
            PresuFiRep: presuFiRep,
            PresuDiRep: presuDiRep,
            TxtRepuestosRep: txtRepuestosRep,
            InformeRep: informeRep,
            FeFinRep: feFinRep,
            FeEntRep: feEntRep,
            TxtEntregaRep: txtEntregaRep,
            SeguimientoEntregaRep: seguimientoEntregaRep
        }
    };
};

const transformReparacionAppToJava = (reparacion) => {
    const {
        EstadoRep,
        PrioridadRep,
        DriveRep,
        FeConRep,
        UsuarioRep,
        DroneRep,
        DescripcionUsuRep,
        FeRecRep,
        NumeroSerieRep,
        DescripcionTecRep,
        PresuMoRep,
        PresuReRep,
        PresuFiRep,
        PresuDiRep,
        TxtRepuestosRep,
        InformeRep,
        FeFinRep,
        FeEntRep,
        TxtEntregaRep,
        SeguimientoEntregaRep 
    } = reparacion.data;

    return {
        id: reparacion?.id,
        estadoRep: EstadoRep,
        prioridadRep: PrioridadRep,
        driveRep: DriveRep,
        feConRep: FeConRep,
        usuarioRep: UsuarioRep,
        droneRep: DroneRep,
        descripcionUsuRep: DescripcionUsuRep,
        feRecRep: FeRecRep,
        numeroSerieRep: NumeroSerieRep,
        descripcionTecRep: DescripcionTecRep,
        presuMoRep: PresuMoRep,
        presuReRep: PresuReRep,
        presuFiRep: PresuFiRep,
        presuDiRep: PresuDiRep,
        txtRepuestosRep: TxtRepuestosRep,
        informeRep: InformeRep,
        feFinRep: FeFinRep,
        feEntRep: FeEntRep,
        txtEntregaRep: TxtEntregaRep,
        seguimientoEntregaRep: SeguimientoEntregaRep
    };
};

const transformUsuarioAppToJava = (usuario) => {

    const {
        NombreUsu,
        ApellidoUsu,
        EmailUsu,
        ProvinciaUsu,
        CiudadUsu,
        Admin,
        Nick,
        TelefonoUsu,
        UrlFotoUsu
    } = usuario.data;

    return {
        id: usuario?.id,
        nombreUsu: NombreUsu,
        apellidoUsu: ApellidoUsu,
        emailUsu: EmailUsu,
        provinciaUsu: ProvinciaUsu,
        ciudadUsu: CiudadUsu,
        admin: Admin,
        nick: Nick,
        telefonoUsu: TelefonoUsu,
        urlFotoUsu: UrlFotoUsu
    }
}

const transformUsuarioJavaToApp = ({
    id,
    nombreUsu,
    apellidoUsu,
    emailUsu,
    provinciaUsu,
    ciudadUsu,
    admin,
    nick,
    telefonoUsu,
    urlFotoUsu
}) => {

    return {
        id: id,
        data: {
            NombreUsu: nombreUsu,
            ApellidoUsu: apellidoUsu,
            EmailUsu: emailUsu,
            ProvinciaUsu: provinciaUsu,
            CiudadUsu: ciudadUsu,
            Admin: admin,
            Nick: nick,
            TelefonoUsu: telefonoUsu,
            UrlFotoUsu: urlFotoUsu
        }
    }
}