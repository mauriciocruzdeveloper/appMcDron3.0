import { useEffect, useCallback, useState } from "react";
import { connect } from "react-redux";
import TextareaAutosize from "react-textarea-autosize";
import { 
    changeInputRep,
    getReparacion,
    getCliente,
    setEstado,
    guardarReparacion,
    eliminarReparacion,
    abreModal,
    confirm,
    clearForm,
    setReparacion
  } from "../redux/root-actions";

import { convertTimestampCORTO } from "../utils/utils";

import { useParams } from "react-router-dom";

import { estados } from '../datos/estados.json';

import history from "../history";

const Reparacion = ({ 
    // changeInputRep, // PARA USAR CON REDUX
    getReparacion,
    // reparacion, // PARA USAR CON REDUX
    // setEstado, // PARA REDUX
    guardarReparacion,
    eliminarReparacion,
    abreModal,
    confirm,
    clearForm,
    coleccionReparaciones,
    // setReparacion // PARA USAR CON REDUX
}) => {

    console.log("REPARACION");

    const { id } = useParams();

    ///////////////////////////////////////////////////
    // relaciono "reparacion" con la reparación de la colección, para que,
    // cuando se modifique la colección, se vea reflejado el cambio inmediatamente.
    // Además me ahorro todo lo del useEffect...
    //////////////////////////////

    // !!!!!!!!!!!!!!!!!!!!!! USANDO VARIABLES !!!!!!!!!!!!!!!!!!!!!!!!!!
    // De esta manera no renderiza cada vez que cambia la reparación
    // Esto me trae problemas al cambiar de estado de reparación,
    // que tendría que cambiar el color de los botones
    //////////////////////////////////////////////////////////////////////
    // let reparacion = coleccionReparaciones.find(rep => rep.id == id);

    // const handleOnChange = (target) => {
    //     reparacion[target.id] = target.value;
    // }
    //////////////////////////////////////////////////////////////////////
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


    // !!!!!!!!!!!!!!!!!!!!!!!! USANDO REDUX !!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Con redux guardo absolutamente todo en el store. Todo sigue el mismo
    // flujo, acción, reducer, nuevo estado.
    //////////////////////////////////////////////////////////////
    const inicializarFormulario = useCallback(async () => {
        coleccionReparaciones?.length
        ? setReparacion(coleccionReparaciones.find(reparacion => reparacion.id == id))
        : await getReparacion(id)
                .catch(error => {
                    abreModal("Error buscando Reparación ", `Código - ${error.code}`, "danger" );
                    history.goBack();
                })
    // Cuando cambia la colección de reparaciones, el escuchador lo ve, y se actualiza la colección
    // entonces la pongo como dependencia del useCallback para que se vuelva a renderizar la función
    // y vuelva a setear la reparación como está en la actualidad.
    }, [coleccionReparaciones]);
    
    useEffect(() => {
        inicializarFormulario();
        return () => clearForm();
    }, [inicializarFormulario]);
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    

    //!!!!!!!!!!!!!!!!!!!!!!!! USANDO STATE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // También se podría usar setState(reparacion) para manejar el estado localmente,
    // algunos dicen que es lo correcto, y redux sólo para el estado global.
    // Otros dicen que todo en redux es mejor porque es más mantenible y entendible.
    //////////////////////////////////////////////////////////////////
    const [ reparacion, setReparacion ] = useState();

    const changeInputRep = target => setReparacion({ 
        ...reparacion, 
        data: {
            ...reparacion.data,
            [target.id]: target.value
        } 
    });
    // Tengo que hacer una función aparte porque cuando modifica el estado de la reparación
    // también tengo que modificar la prioridad. Se podría hacer diferente quizás con 
    // id, value y otra prop del botón.
    const setEstado = estado => {
        setReparacion({
            ...reparacion, 
            data: {
                ...reparacion.data,
                EstadoRep: estado.nombre, 
                PrioridadRep: estado.prioridad 
            }
        });
    }
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    let estadosArray = Object.values(estados);

    const handleGuardarReparacion = () => {
        confirm(
            "Guardar Reparación?",
            "Atención",
            "warning",
            () => {
                guardarReparacion(reparacion)
                .then(reparacion => abreModal("Guardado con éxito", "Reparación: " + reparacion.id, "success" ))
                .catch(error => abreModal("Error al guardar ", `Código - ${error.code}`, "danger" ));
            }
        );
    }

    const handleEliminarReparacion = () => {
        confirm(
            "Eliminar Reparación?",
            "Atención",
            "danger",
            () => {
                console.log("llega al callBacK de confirm") ;
                eliminarReparacion(reparacion.id)
                .then(id => {
                        abreModal("Reparación eliminada con éxito", "Reparación: " + id, "success" );
                        history.goBack();
                })
                .catch(error => abreModal("Error al guardar ", `Código - ${error.code}`, "danger" ))
            }
        );
    }

    return(
        <div
            className="p-4"
            style={{
                backgroundColor: estados[reparacion?.data?.EstadoRep]?.color
            }}
        >
            <div 
                className="card mb-3"
                style={{
                    backgroundColor: "#CCCCCC",

                }}
            >
                <div className="card-body">
                    <h3 className="card-title">
                        REPARACIÓN
                    </h3>
                    <div>Drone: {reparacion?.data?.DroneRep}</div>
                    <div>Cliente: {reparacion?.data?.NombreUsu} {reparacion?.data?.ApellidoUsu}</div>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                <h5 className="card-title bluemcdron">ESTADO DE LA REPARACIÓN</h5>
                    <div className="text-center">
                        {estadosArray.map(estado =>
                            <button 
                                className="m-2 btn btn-outline-secondary overflow-hidden"
                                type="button"
                                alt={estado.nombre}
                                style={{
                                    backgroundColor: 
                                        estado.nombre == reparacion?.data?.EstadoRep?
                                        estado.color :
                                        "#CCCCCC"
                                    ,
                                    width: "90px",
                                    height: "30px"
                                }}
                                onClick={ ()=>setEstado(estado) } // PARA REDUX, Y QUIZÁS PARA USESTATE
                            >
                                {estado.nombre}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-body">
                <h5 className="card-title bluemcdron">ENLACE A DRIVE</h5>
                    <div>
                        <label className="form-label">En lace a Drive</label>

                        <div className="input-group">
                            <input 
                                // onChange={e => handleOnChange(e.target)} // {e => changeInputRep(e.target)} 
                                onChange={e => changeInputRep(e.target)}
                                type="text"
                                className="form-control" 
                                id="DriveRep"
                                value={reparacion?.data?.DriveRep} 
                            />
                            <div className="input-group-append">
                                <a href={reparacion?.data?.DriveRep}><button className="btn btn-outline-secondary bg-bluemcdron text-white" type="button">Ir</button></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-body">
                <h5 className="card-title bluemcdron">CONSULTA - PRIMEROS DATOS</h5>
                    <div>
                        <label className="form-label">Fecha de Cosulta</label>
                        <input 
                            type="date" 
                            className="form-control" 
                            id="FeConRep"
                            value={convertTimestampCORTO(reparacion?.data?.FeConRep)}
                            disabled
                        />
                    </div>
                    <div>
                        <label className="form-label">Email Cliente</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="UsuarioRep" 
                            value={reparacion?.data?.UsuarioRep}
                            disabled
                        />
                    </div>
                    <div>
                        <label className="form-label">Nombre Cliente</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="NombreUsu" 
                            value={reparacion?.data?.NombreUsu}
                            disabled
                        />
                    </div>
                    <div>
                        <label className="form-label">Apellido Cliente</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="ApellidoUsu" 
                            value={reparacion?.data?.ApellidoUsu}
                            disabled
                        />
                    </div>
                    <div>
                        <label className="form-label">Teléfono Cliente</label>
                        <input 
                            type="tel" 
                            className="form-control" 
                            id="TelefonoUsu" 
                            value={reparacion?.data?.TelefonoUsu}
                            disabled
                        />
                    </div>
                    <div>
                        <label className="form-label">Modelo del Drone</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="DroneRep"
                            value={reparacion?.data?.DroneRep || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Desperfectos o Roturas</label>
                        <TextareaAutosize
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="DescripcionUsuRep"
                            value={reparacion?.data?.DescripcionUsuRep || ""}
                        />
                    </div>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-body">
                <h5 className="card-title bluemcdron">RECEPCIÓN</h5>
                    <div>
                        <label className="form-label">Fecha de Recepción</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="date" 
                            className="form-control" 
                            id="FeRecRep"
                            value={convertTimestampCORTO(reparacion?.data?.FeRecRep)}
                        />
                    </div>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-body">
                <h5 className="card-title bluemcdron">REVISIÓN - DIAGNÓSTICO Y PRESUPUESTO DATOS</h5>
                    <div>
                        <label className="form-label">Número de Serie</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="NumeroSerieRep"
                            value={reparacion?.data?.NumeroSerieRep || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Observaciones del Técnico</label>
                        <TextareaAutosize
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="DescripcionTecRep"
                            value={reparacion?.data?.DescripcionTecRep || ""}
                            rows="5"
                        />
                    </div>
                    <div>
                        <label className="form-label">Presupuesto Mano de Obra $</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="number" 
                            className="form-control" 
                            id="PresuMoRep" 
                            value={reparacion?.data?.PresuMoRep || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Presupuesto Repuestos $</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="number" 
                            className="form-control" 
                            id="PresuReRep"
                            value={reparacion?.data?.PresuReRep || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Presupuesto Final $</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="number" 
                            className="form-control" 
                            id="PresuFiRep"
                            value={reparacion?.data?.PresuFiRep || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Diagnóstico $</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="number" 
                            className="form-control" 
                            id="PresuDiRep"
                            value={reparacion?.data?.PresuDiRep || ""}
                        />
                    </div>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-body">
                <h5 className="card-title bluemcdron">REPUESTOS - CUALES Y SEGUIMIENTO</h5>
                    <div>
                        <label className="form-label">Qué repuesto, seguimiento, transportista</label>
                        <TextareaAutosize
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="TxtRepuestosRep"
                            value={reparacion?.data?.TxtRepuestosRep || ""} //Esto es lo correcto
                            rows="5"
                        />
                    </div>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-body">
                <h5 className="card-title bluemcdron">REPARACIÓN - DATOS DE LA REPARACIÓN</h5>
                    <div>
                        <label className="form-label">Informe de Reparación o Diagnóstico</label>
                        <TextareaAutosize
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="InformeRep"
                            value={reparacion?.data?.InformeRep || ""}
                            rows="5"
                        />
                    </div>
                    <div>
                        <label className="form-label">Fecha Finalizacion</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="date" 
                            className="form-control" 
                            id="FeFinRep"
                            value={convertTimestampCORTO(reparacion?.data?.FeFinRep)}
                        />
                    </div>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-body">
                <h5 className="card-title bluemcdron">ENTREGA - DATOS DE LA ENTREGA</h5>
                    <div>
                        <label className="form-label">Fecha Entrega</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="date" 
                            className="form-control" 
                            id="FeEntRep"
                            value={convertTimestampCORTO(reparacion?.data?.FeEntRep)}
                        />
                    </div>
                    <div>
                        <label className="form-label">Cliente, Comisionista, Correo, Seguimiento</label>
                        <TextareaAutosize
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="TxtEntregaRep"
                            value={reparacion?.data?.TxtEntregaRep || ""}
                            rows="5"
                        />
                    </div>
                    <div>
                        <label className="form-label">Nro. de Seguimiento</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="SeguimientoEntregaRep"
                            value={reparacion?.data?.SeguimientoEntregaRep || ""}
                            rows="5"
                        />
                    </div>
                </div>
            </div>

           <div className="text-center">
                <button
                    key="botonGuardar"
                    onClick={ handleGuardarReparacion }
                    className="w-100 mb-3 btn bg-bluemcdron text-white"
                >
                    Guardar
                </button>
                <button
                    key="botonEliminar"
                    onClick={ handleEliminarReparacion }
                    className="w-100 btn bg-danger text-white"
                >
                    Eliminar
                </button>
            </div>

        </div>
 
    )
}

const mapStateToProps = (state) => ({
    reparacion: state.app?.reparacion,
    cliente: state.app?.cliente,
    coleccionReparaciones: state.app?.coleccionReparaciones
  });


export default connect(
    mapStateToProps, 
    {
        changeInputRep, 
        getReparacion,
        getCliente,
        setEstado, 
        guardarReparacion, 
        eliminarReparacion, 
        abreModal,
        confirm,
        clearForm,
        setReparacion
    })(Reparacion);