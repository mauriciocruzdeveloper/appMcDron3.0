import { useEffect, useCallback, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import TextareaAutosize from "react-textarea-autosize";
import Select, { InputActionMeta } from 'react-select';

import { useHistory } from "../hooks/useHistory";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../redux-tool-kit/hooks/useAppDispatch";
import { useModal } from "./Modal/useModal";
import { guardarReciboAsync, guardarTransitoAsync, guardarPresupuestadoAsync, aceptarPresupuestoAsync, rechazarPresupuestoAsync, diagnosticarAsync } from "../redux-tool-kit/reparacion/reparacion.actions";
import { getClienteAsync } from "../redux-tool-kit/usuario/usuario.actions";
import { getLocalidadesPorProvincia, getProvinciasSelect } from "../utils/utils";
import { estados } from "../datos/estados";
import { obtenerEstadoSeguro } from "../utils/estadosHelper";
import { selectModelosDroneSelect } from "../redux-tool-kit/modeloDrone/modeloDrone.selectors";
import { selectDronesByPropietario } from "../redux-tool-kit/drone";

// import { provincias } from '../datos/provincias.json';

export interface PresupuestoProps {
    EmailUsu: string;
    NombreUsu: string;
    ApellidoUsu: string;
    TelefonoUsu: string;
    ProvinciaUsu: string;
    CiudadUsu: string;
    ModeloDroneNameRep: string;
    ModeloDroneIdRep: string
    DroneId: string;
    DescripcionUsuRep: string;
    FeRecRep: number | null;
    EstadoRep: string;
    PrioridadRep: number | null;
    FeConRep: number | null;
    UsuarioRep: string;
}

const INITIAL_PRESUPUESTO: PresupuestoProps = {
    EmailUsu: "",
    NombreUsu: "",
    ApellidoUsu: "",
    TelefonoUsu: "",
    ProvinciaUsu: "",
    CiudadUsu: "",
    ModeloDroneNameRep: "",
    ModeloDroneIdRep: "",
    DroneId: "",
    DescripcionUsuRep: "",
    FeRecRep: null,
    FeConRep: null,
    EstadoRep: "",
    PrioridadRep: null,
    UsuarioRep: "",
};

export default function Presupuesto(): JSX.Element {
    console.log("PRESUPUESTO");
    const dispatch = useAppDispatch();
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const estadoParam = queryParams.get('estado') || "Recibido";
    const estadoInfo = obtenerEstadoSeguro(estadoParam);

    const {
        openModal,
    } = useModal();

    const usuario = useAppSelector(state => state.app.usuario);
    const localidadesSelect = useAppSelector(state => state.usuario.localidadesSelect);
    const provinciasSelect = useAppSelector(state => state.usuario.provinciasSelect);
    const usuariosSelect = useAppSelector(state => state.usuario.usuariosSelect);
    const modelosDroneSelect = useAppSelector(selectModelosDroneSelect);
    const isAdmin = useMemo(() => usuario?.data?.Role === 'admin', [usuario]);
    
    const dateNow = Date.now();
    
    const [presupuesto, setPresupuesto] = useState<PresupuestoProps>({
        ...INITIAL_PRESUPUESTO,
        FeRecRep: estadoParam === "Recibido" ? dateNow : null,
        FeConRep: dateNow,
        EstadoRep: estadoInfo.nombre,
        PrioridadRep: estadoInfo.prioridad,
    });
    
    // Obtener drones del usuario seleccionado
    const dronesDelUsuario = useAppSelector(state => 
        presupuesto.UsuarioRep ? selectDronesByPropietario(presupuesto.UsuarioRep)(state) : []
    );
    
    // Debug logs
    console.log('UsuarioRep:', presupuesto.UsuarioRep);
    console.log('Drones del usuario:', dronesDelUsuario);
    
    // Crear opciones para el selector de drones
    const dronesSelect = useMemo(() => {
        const options = dronesDelUsuario.map(drone => ({
            value: drone.id,
            label: drone.data.Nombre
        }));
        console.log('Opciones de drones:', options);
        return options;
    }, [dronesDelUsuario]);
    
    // Estado para controlar si el selector de modelo está deshabilitado
    const [modeloDeshabilitado, setModeloDeshabilitado] = useState(false);

    const changeInput = (field: keyof PresupuestoProps, value: string | number) => {
        setPresupuesto(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // TODO: Ver cómo está hecho en Reparacion.container.tsx
    const changeInputUsu = (field: string, value: string) => {
        setPresupuesto(prevState => prevState ? {
            ...prevState,
            [field]: value
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
            [target.id]: value
        });
    };

    const initForm = useCallback(async () => {
        const userRole = usuario?.data?.Role;
        const isCliente = userRole === 'cliente' || userRole === 'partner';
        
        if (isCliente && usuario) {
            setPresupuesto({
                ...presupuesto,
                EmailUsu: usuario.data?.EmailUsu || "",
                NombreUsu: usuario.data?.NombreUsu || "",
                ApellidoUsu: usuario.data?.ApellidoUsu || "",
                TelefonoUsu: usuario.data?.TelefonoUsu || "",
                ProvinciaUsu: usuario.data?.ProvinciaUsu || "",
                CiudadUsu: usuario.data?.CiudadUsu || "",
            });
        }
        await dispatch(getProvinciasSelect());
    }, [usuario]);

    useEffect(() => {
        initForm();
    }, [initForm]);

    //////////////////////////////////////////////////////////////
    const confirmaGuardarPresupuesto = async () => {
        let response;

        if (estadoInfo.nombre === "Recibido") {
            response = await dispatch(guardarReciboAsync(presupuesto));
        } else if (estadoInfo.nombre === "Transito") {
            response = await dispatch(guardarTransitoAsync(presupuesto));
        } else if (estadoInfo.nombre === "Presupuestado") {
            response = await dispatch(guardarPresupuestadoAsync(presupuesto));
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
                mensaje: "Error al guardar: " + (response?.payload || "Error desconocido."),
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
        // Validar campos requeridos
        if (!presupuesto.EmailUsu || !presupuesto.NombreUsu) {
            openModal({
                mensaje: "Por favor complete los campos obligatorios: Email y Nombre",
                tipo: "danger",
                titulo: `Registrar ${estadoInfo.nombre}`,
            });
            return;
        }

        if (!presupuesto.ModeloDroneIdRep || !presupuesto.ModeloDroneNameRep) {
            openModal({
                mensaje: "Por favor seleccione un modelo de drone",
                tipo: "danger",
                titulo: `Registrar ${estadoInfo.nombre}`,
            });
            return;
        }

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
            ProvinciaUsu: e.value
        });
    }

    const handleOnChangeLocalidades = (e: any) => {
        setPresupuesto({
            ...presupuesto,
            CiudadUsu: e.value,
        });
    }


    // Función que maneja el onChange del Select de usuarios cuando se selecciona
    // un usuario/cliente de la lista que previamente se cargó en el Select
    const handleOnChangeUsuarios = async (e: any) => {
        if (e) {
            const response = await dispatch(getClienteAsync(e.value));

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
                EmailUsu: response.payload.data?.EmailUsu || "",
                NombreUsu: response.payload.data?.NombreUsu || "",
                ApellidoUsu: response.payload.data?.ApellidoUsu || "",
                TelefonoUsu: response.payload.data?.TelefonoUsu || "",
                ProvinciaUsu: response.payload.data?.ProvinciaUsu || "",
                CiudadUsu: response.payload.data?.CiudadUsu || "",
                UsuarioRep: response.payload.id || "",
                // Limpiar drone seleccionado al cambiar usuario
                DroneId: "",
                ModeloDroneIdRep: "",
                ModeloDroneNameRep: ""
            });
            setModeloDeshabilitado(false);
        }
    }

    // Función que maneja los onChange de toda la vida, del Select de usuarios.
    const handleOnInputChangeUsuarios = (inputEmailUsu: string, action: InputActionMeta) => {
        if (action.action === "input-change") changeInputUsu("EmailUsu", inputEmailUsu);
    }
    
    // Función que maneja el onChange del Select de drones
    const handleOnChangeDrones = (e: any) => {
        if (e) {
            const droneSeleccionado = dronesDelUsuario.find(drone => drone.id === e.value);
            if (droneSeleccionado) {
                changeInput("DroneId", droneSeleccionado.id);
                changeInput("ModeloDroneIdRep", droneSeleccionado.data.ModeloDroneId);
                // Buscar el nombre del modelo
                const modelo = modelosDroneSelect.find(m => m.value === droneSeleccionado.data.ModeloDroneId);
                if (modelo) {
                    changeInput("ModeloDroneNameRep", modelo.label);
                }
                setModeloDeshabilitado(true);
            }
        } else {
            changeInput("DroneId", "");
            setModeloDeshabilitado(false);
        }
    }
    
    // Función que maneja el onChange del Select de modelos de drone
    const handleOnChangeModelosDrone = (e: any) => {
        if (e && !modeloDeshabilitado) {
            changeInput("ModeloDroneIdRep", e.value);
            changeInput("ModeloDroneNameRep", e.label);
        }
    }

    // Color de fondo según el estado
    const getCardColor = () => {
        return estadoInfo.color || "bg-bluemcdron";
    }

    return (
        <div className="p-4">
            <div
                className={`card mb-3`}
                style={{ backgroundColor: estadoInfo.color, color: estadoInfo.color === '#cddc39' ? "black" : "white" }}
            >
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
                            value={{ value: presupuesto.EmailUsu, label: presupuesto.EmailUsu }}
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
                            value={presupuesto.NombreUsu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Apellido</label>
                        <input
                            onChange={e => changeInputUsu(e.target.id, e.target.value)}
                            type="text"
                            className="form-control"
                            id="ApellidoUsu"
                            value={presupuesto.ApellidoUsu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Teléfono</label>
                        <input
                            onChange={e => changeInputUsu(e.target.id, e.target.value)}
                            type="tel"
                            className="form-control"
                            id="TelefonoUsu"
                            value={presupuesto.TelefonoUsu || ""}
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
                                value: presupuesto.ProvinciaUsu,
                                label: presupuesto.ProvinciaUsu
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
                                value: presupuesto.CiudadUsu,
                                label: presupuesto.CiudadUsu
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title bluemcdron">DRONE</h5>
                    
                    <div>
                        <label className="form-label">Drone Existente (Opcional)</label>
                        <Select
                            options={dronesSelect}
                            onChange={handleOnChangeDrones}
                            id="DroneId"
                            value={{
                                value: presupuesto.DroneId,
                                label: dronesSelect.find(d => d.value === presupuesto.DroneId)?.label || ""
                            }}
                            placeholder="Seleccionar drone existente..."
                            noOptionsMessage={() => "No hay drones disponibles para este usuario"}
                            isClearable
                            isDisabled={!presupuesto.UsuarioRep}
                        />
                    </div>
                    
                    <div>
                        <label className="form-label">Modelo del Drone</label>
                        <Select
                            options={modelosDroneSelect}
                            onChange={handleOnChangeModelosDrone}
                            id="ModeloDroneIdRep"
                            value={{
                                value: presupuesto.ModeloDroneIdRep,
                                label: presupuesto.ModeloDroneNameRep
                            }}
                            placeholder="Seleccionar modelo de drone..."
                            noOptionsMessage={() => "No hay modelos disponibles"}
                            isDisabled={modeloDeshabilitado}
                        />
                    </div>

                    <div>
                        <label className="form-label">Desperfectos o Roturas</label>
                        <TextareaAutosize
                            onChange={e => changeInputRep(e.target)}
                            className="form-control"
                            id="DescripcionUsuRep"
                            value={presupuesto.DescripcionUsuRep || ""}
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
