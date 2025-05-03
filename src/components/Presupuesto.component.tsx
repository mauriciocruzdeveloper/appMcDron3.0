import { useEffect, useCallback, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import TextareaAutosize from "react-textarea-autosize";
import Select, { InputActionMeta } from 'react-select';

import history from "../history";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../redux-tool-kit/hooks/useAppDispatch";
import { useModal } from "./Modal/useModal";
import { guardarReciboAsync, guardarTransitoAsync } from "../redux-tool-kit/reparacion/reparacion.actions";
import { getClienteByEmailAsync } from "../redux-tool-kit/usuario/usuario.actions";
import { generarAutoDiagnostico, getLocalidadesPorProvincia, getProvinciasSelect } from "../utils/utils";
import { estados } from "../datos/estados";

// import { provincias } from '../datos/provincias.json'; 

export default function Presupuesto(): JSX.Element {
    console.log("PRESUPUESTO");
    const dispatch = useAppDispatch();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const estadoParam = queryParams.get('estado') || "Recibido";
    const estadoInfo = estados[estadoParam] || estados["Recibido"];

    const {
        openModal,
    } = useModal();

    const usuario = useAppSelector(state => state.app.usuario);
    const localidadesSelect = useAppSelector(state => state.usuario.localidadesSelect);
    const provinciasSelect = useAppSelector(state => state.usuario.provinciasSelect);
    const usuariosSelect = useAppSelector(state => state.usuario.usuariosSelect);
    const isAdmin = useMemo(() => usuario?.data?.Admin, [usuario]);

    const [presupuesto, setPresupuesto] = useState<{
        cliente: {
            id?: string,
            data: any,
        },
        reparacion: {
            data: any,
        },
    }>({
        cliente: {
            data: {}
        },
        reparacion: {
            data: {}
        }
    });


    // TODO: Ver cómo está hecho en Reparacion.container.tsx
    const changeInputUsu = (field: string, value: string) => {
        setPresupuesto(prevState => prevState ? {
            ...presupuesto,
            cliente: {
                ...presupuesto?.cliente,
                data: {
                    ...presupuesto?.cliente?.data,
                    [field]: value
                },
            }
        } : presupuesto);
    };

    // TODO: Ver el tipo correcto de target. Ver cómo está hecho en Reparacion.container.tsx
    const changeInputRep = (target: any) => {
        let value = null;
        if (target.type == "date") {
            const anio = target.value.substr(0, 4);
            const mes = target.value.substr(5, 2) - 1;
            const dia = target.value.substr(8, 2);
            value = new Date(anio, mes, dia).getTime() + 10800001; // Se agrega este número para que de bien la fecha.
        } else {
            value = target.value;
        }
        setPresupuesto({
            ...presupuesto,
            reparacion: {
                ...presupuesto.reparacion,
                data: {
                    ...presupuesto.reparacion.data,
                    [target.id]: value
                }
            }
        });
    };

    const initForm = useCallback(async () => {
        // Si el usuario es admin, deja todo en blanco para cargar cualquier usuario
        // sino cargo los datos del usuario logueado.
        //!usuario.data?.Admin ? await getCliente(usuario.id) : null; // Acá iría getCliente(usuario.id);
        !usuario?.data?.Admin && usuario
            ? setPresupuesto({ ...presupuesto, cliente: usuario })
            : null; // Acá iría getCliente(usuario.id);
        await dispatch(getProvinciasSelect());
        // .catch(error => abreModal("Error buscando ProvinciasSelect ", `Código - ${error.code}`, "danger" ));
    }, [usuario]);

    useEffect(() => {
        initForm();
    }, [initForm]);

    //////////////////////////////////////////////////////////////
    const confirmaGuardarPresupuesto = async () => {
        const dateNow = Date.now();
        const autoDiagnostico = await dispatch(generarAutoDiagnostico(reparacion));

        const presupuestoObject = {
            usuario: {
                ...presupuesto.cliente,
                id: presupuesto.cliente.id ?? presupuesto.cliente.data.EmailUsu,
            },
            reparacion: {
                ...presupuesto.reparacion,
                id: dateNow.toString(),
                data: {
                    ...presupuesto.reparacion.data,
                    EstadoRep: estadoInfo.nombre,
                    PrioridadRep: estadoInfo.prioridad,
                    FeConRep: dateNow,
                    FeRecRep: estadoParam === "Recibido" ? dateNow : null, // Solo poner fecha de recepción si está recibido
                    DiagnosticoRep: autoDiagnostico,
                },
            },
        };

        let response;

        if (estadoInfo.nombre === "Recibido") {
            response = await dispatch(guardarReciboAsync(presupuestoObject));
        } else if (estadoInfo.nombre === "Transito") { 
            response = await dispatch(guardarTransitoAsync(presupuestoObject));
        }

        if (response?.meta.requestStatus === 'fulfilled') {
            openModal({
                mensaje: `${estadoInfo.nombre} registrado correctamente!`,
                tipo: "success",
                titulo: `Registrar ${estadoInfo.nombre}`,
            })
            console.log(JSON.stringify(presupuesto));
            history.goBack();
        } else {
            openModal({
                mensaje: "Error al guardar",
                tipo: "danger",
                titulo: `Registrar ${estadoInfo.nombre}`,
            })
        }
    }

    // El botón utilizará un texto basado en el estado
    const getButtonText = () => {
        return `Registrar ${estadoInfo.nombre}`;
    }

    // El título de la card utilizará un texto basado en el estado
    const getCardTitle = () => {
        return `REGISTRO DE ${estadoInfo.nombre.toUpperCase()}`;
    }

    const handleGuardarPresupuesto = () => {
        openModal({
            mensaje: `¿Desea registrar este ${estadoInfo.nombre.toLowerCase()}?`,
            tipo: "warning",
            titulo: `Registrar ${estadoInfo.nombre}`,
            confirmCallback: confirmaGuardarPresupuesto,
        });
    }

    const handleOnChangeProvincias = async (e: any) => {
        await dispatch(getLocalidadesPorProvincia(e.value));

        setPresupuesto({
            ...presupuesto,
            cliente: {
                ...presupuesto.cliente,
                data: {
                    ...presupuesto.cliente.data,
                    ProvinciaUsu: e.value
                }
            }
        });
    }

    const handleOnChangeLocalidades = (e: any) => {
        setPresupuesto({
            ...presupuesto,
            cliente: {
                ...presupuesto.cliente,
                data: {
                    ...presupuesto.cliente.data,
                    CiudadUsu: e.value
                }
            }
        });
    }


    // Función que maneja el onChange del Select de usuarios cuando se selecciona
    // un usuario/cliente de la lista que previamente se cargó en el Select
    const handleOnChangeUsuarios = async (e: any) => {
        if (e) {
            const response = await dispatch(getClienteByEmailAsync(e.value));

            if (response.meta.requestStatus === 'rejected') {
                openModal({
                    mensaje: "Error al obtener el cliente.",
                    tipo: "danger",
                    titulo: "Error al obtener el cliente",
                });
                return;
            }
            setPresupuesto({
                ...presupuesto,
                cliente: response.payload
            });
        }
    }

    // Función que maneja los onChange de toda la vida, del Select de usuarios.
    // Tengo que hacerlo mediante un handle porque el evento de onInputChange
    // sólo contiene el valor del input, no es un evento.
    // Abajo creo target con los atributos correctos para pasarlos como 
    // parámetro del método changeInputPresu.
    const handleOnInputChangeUsuarios = (inputEmailUsu: string, action: InputActionMeta) => {
        // https://github.com/JedWatson/react-select/issues/588#issuecomment-815133270
        if (action.action === "input-change") changeInputUsu("EmailUsu", inputEmailUsu);
        // Otra opción
        //if (action?.action !== 'input-blur' && action?.action !== 'menu- close') changeInputUsu(target);
    }

    const { cliente, reparacion } = presupuesto;

    // Color de fondo según el estado
    const getCardColor = () => {
        return estadoInfo.color || "bg-bluemcdron";
    }

    return (
        <div className="p-4">
            <div className={`card mb-3 ${getCardColor()}`}>
                <div className="card-body">
                    <h3 className={`card-title ${estadoInfo.color === '#cddc39' ? "text-dark" : "text-light"} p-0 m-0`}>
                        {getCardTitle()}
                    </h3>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title bluemcdron">USUARIO</h5>
                    <div>
                        <label className="form-label">E-mail</label>
                        {/* Crear un componente propio para otros usos que no se borre
                        el contenido cuando se desenfoca. Ponerlo en una carpeta aparte 
                        de componentes propios */}
                        <Select
                            options={usuariosSelect}
                            noOptionsMessage={() => null}
                            onChange={e => handleOnChangeUsuarios(e)}
                            onInputChange={handleOnInputChangeUsuarios}
                            id="EmailUsu"
                            value={{ value: cliente.data?.EmailUsu, label: cliente.data?.EmailUsu }}
                            isDisabled={!isAdmin}
                        />
                    </div>
                    <div>
                        <label className="form-label">Nombre</label>
                        <input
                            onChange={e => changeInputUsu(e.target.id, e.target.value)}
                            type="text"
                            className="form-control"
                            id="NombreUsu"
                            value={cliente.data?.NombreUsu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Apellido</label>
                        <input
                            onChange={e => changeInputUsu(e.target.id, e.target.value)}
                            type="text"
                            className="form-control"
                            id="ApellidoUsu"
                            value={cliente.data?.ApellidoUsu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Teléfono</label>
                        <input
                            onChange={e => changeInputUsu(e.target.id, e.target.value)}
                            type="tel"
                            className="form-control"
                            id="TelefonoUsu"
                            value={cliente.data?.TelefonoUsu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Provincia</label>
                        <Select
                            // onFocus={handleOnFocusSelect}
                            options={provinciasSelect}
                            onChange={e => handleOnChangeProvincias(e)}
                            id="ProvinciaUsu"
                            value={{
                                value: cliente.data?.ProvinciaUsu,
                                label: cliente.data?.ProvinciaUsu
                            }}
                        />
                    </div>
                    <div>
                        <label className="form-label">Ciudad</label>
                        <Select
                            // onFocus={handleOnFocusSelect}
                            options={localidadesSelect}
                            onChange={e => handleOnChangeLocalidades(e)}
                            id="CiudadUsu"
                            value={{
                                value: cliente.data?.CiudadUsu,
                                label: cliente.data?.CiudadUsu
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title bluemcdron">DRONE</h5>
                    <div>
                        <label className="form-label">Modelo del Drone</label>
                        <input
                            onChange={e => changeInputRep(e.target)}
                            type="text"
                            className="form-control"
                            id="DroneRep"
                            value={reparacion.data?.DroneRep || ""}
                        />
                    </div>

                    <div>
                        <label className="form-label">Desperfectos o Roturas</label>
                        <TextareaAutosize
                            onChange={e => changeInputRep(e.target)}
                            className="form-control"
                            id="DescripcionUsuRep"
                            value={reparacion.data?.DescripcionUsuRep || ""}
                        />
                    </div>
                </div>
            </div>



            <div className="text-center">
                <button
                    onClick={handleGuardarPresupuesto}
                    className={`w-100 mb-3 btn`}
                    style={{ backgroundColor: estadoInfo.color, color: estadoInfo.color === '#cddc39' ? "black" : "white" }}
                >
                    {getButtonText()}
                </button>
            </div>
        </div>

    )
}
