import { convertTimestampCORTO } from "../utils/utils";
// Components
import TextareaAutosize from "react-textarea-autosize";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ChangeEvent } from "react";
import { InputType } from "../types/types";
import { ReparacionType } from "../types/reparacion";
import { Estado, Estados } from "../types/estado";

interface ReparacionPresentationalProps {
    admin: boolean;
    reparacion: ReparacionType;
    estados: Estados;
    setEstado: (estado: Estado) => void;
    changeInputRep: (field: string, value: string) => void;
    handleGuardarReparacion: () => void;
    handleEliminarReparacion: () => void;
    handleSendEmail: () => void;
    handleSendSms: () => void;
    handleSendRecibo: () => void;
}

const ReparacionPresentational = (props: ReparacionPresentationalProps) => {
    const {
        admin,
        reparacion,
        estados,
        setEstado,
        changeInputRep,
        handleGuardarReparacion,
        handleEliminarReparacion,
        handleSendEmail,
        handleSendSms,
        handleSendRecibo,
    } = props;

    console.log("REPARACION presentational");

    const handleOnChange = (event: ChangeEvent<InputType>) => {
        const target = event.target;

        let value = target.value;
        if (target.type == "date") {
            const anio = Number(target.value.substr(0, 4));
            const mes = Number(target.value.substr(5, 2)) - 1;
            const dia = Number(target.value.substr(8, 2));
            value = String(Number(new Date(anio, mes, dia).getTime()) + 10800001); // Se agrega este número para que de bien la fecha.
        }
        const field = target.id;
        changeInputRep(field, value);
    }

    return (
        <div
            className="p-4"
            style={{
                backgroundColor: estados[reparacion.data.EstadoRep].color
            }}
        >
            <div
                className="card mb-3"
                style={{
                    backgroundColor: "#CCCCCC"
                }}
            >
                <div className="card-body">
                    <h3 className="card-title">
                        REPARACIÓN
                    </h3>
                    <div>id: {reparacion?.id}</div>
                    <div>Drone: {reparacion?.data?.DroneRep}</div>
                    <div>Cliente: {reparacion?.data?.NombreUsu || reparacion?.data.UsuarioRep} {reparacion?.data?.ApellidoUsu}</div>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title bluemcdron">ESTADO DE LA REPARACIÓN</h5>
                    <div className="text-center">
                        {Object.values(estados).map(estado =>
                            <button
                                key={estado.nombre}
                                className="m-2 btn btn-outline-secondary overflow-hidden"
                                type="button"
                                style={{
                                    backgroundColor:
                                        estado.nombre == reparacion?.data?.EstadoRep ?
                                            estado.color :
                                            "#CCCCCC"
                                    ,
                                    width: "90px",
                                    height: "30px"
                                }}
                                onClick={() => setEstado(estado)} // PARA REDUX, Y QUIZÁS PARA USESTATE
                            >
                                {estado.nombre}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {admin ? // Sólo para administrador
                <div className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title bluemcdron">ENLACE A DRIVE</h5>
                        <div>
                            <label className="form-label">En lace a Drive</label>

                            <div className="input-group">
                                <input
                                    onChange={handleOnChange}
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
                : null}

            {admin ? // Sólo para administrador
                <div
                    className="card mb-3"
                    style={{
                        backgroundColor: "#FF0000"
                    }}
                >
                    <div className="card-body">
                        <h5 className="card-title bluemcdron">ANOTACIONES CONFIDENCIALES</h5>
                        <div>
                            <label className="form-label text-white">Anotaciones varias</label>
                            <TextareaAutosize
                                onChange={handleOnChange}
                                className="form-control"
                                id="AnotacionesRep"
                                value={reparacion?.data?.AnotacionesRep || ""}
                                rows={5}
                            />
                        </div>
                    </div>
                </div>
                : null}

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
                        <div className="d-flex w-100 justify-content-between">
                            <input
                                type="text"
                                className="form-control"
                                id="UsuarioRep"
                                value={reparacion?.data?.EmailUsu || reparacion?.data?.UsuarioRep}
                                disabled
                            />
                            <button
                                type="submit"
                                className="btn btn-outline-secondary bg-bluemcdron text-white"
                                onClick={handleSendEmail}
                            >
                                <i className="bi bi-envelope"></i>
                            </button>
                        </div>
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
                        <div className="d-flex w-100 justify-content-between">
                            <input
                                type="tel"
                                className="form-control"
                                id="TelefonoUsu"
                                value={reparacion?.data?.TelefonoUsu}
                                disabled
                            />
                            <button
                                type="submit"
                                className="btn btn-outline-secondary bg-bluemcdron text-white"
                                onClick={handleSendSms}
                            >
                                <i className="bi bi-chat-left-text"></i>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="form-label">Modelo del Drone</label>
                        <input
                            onChange={handleOnChange}
                            type="text"
                            className="form-control"
                            id="DroneRep"
                            value={reparacion?.data?.DroneRep || ""}
                            disabled={!admin}
                        />
                    </div>
                    <div>
                        <label className="form-label">Desperfectos o Roturas</label>
                        <TextareaAutosize
                            onChange={handleOnChange}
                            className="form-control"
                            id="DescripcionUsuRep"
                            value={reparacion?.data?.DescripcionUsuRep || ""}
                            disabled={!admin}
                        />
                    </div>
                    <div>
                        <label className="form-label">Autdiagnóstico</label>
                        <TextareaAutosize
                            readOnly
                            className="form-control"
                            id="DiagnosticoRep"
                            value={reparacion?.data?.DiagnosticoRep || ""}
                        />
                    </div>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title bluemcdron">RECEPCIÓN</h5>
                    <div>
                        <label className="form-label">Fecha de Recepción</label>
                        <div className="d-flex w-100 justify-content-between">

                            <input
                                onChange={handleOnChange}
                                type="date"
                                className="form-control"
                                id="FeRecRep"
                                value={convertTimestampCORTO(reparacion?.data?.FeRecRep)}
                                disabled={!admin}
                            />
                            <button
                                type="submit"
                                className="btn btn-outline-secondary bg-bluemcdron text-white"
                                onClick={handleSendRecibo}
                            >
                                <i className="bi bi-envelope"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title bluemcdron">REVISIÓN - DIAGNÓSTICO Y PRESUPUESTO DATOS</h5>
                    <div>
                        <label className="form-label">Número de Serie</label>
                        <input
                            onChange={handleOnChange}
                            type="text"
                            className="form-control"
                            id="NumeroSerieRep"
                            value={reparacion?.data?.NumeroSerieRep || ""}
                            disabled={!admin}
                        />
                    </div>
                    <div>
                        <label className="form-label">Observaciones del Técnico</label>
                        <TextareaAutosize
                            onChange={handleOnChange}
                            className="form-control"
                            id="DescripcionTecRep"
                            value={reparacion?.data?.DescripcionTecRep || ""}
                            rows={5}
                            disabled={!admin}
                        />
                    </div>
                    <div>
                        <label className="form-label">Presupuesto Mano de Obra $</label>
                        <input
                            onChange={handleOnChange}
                            type="number"
                            className="form-control"
                            id="PresuMoRep"
                            value={reparacion?.data?.PresuMoRep || ""}
                            disabled={!admin}
                        />
                    </div>
                    <div>
                        <label className="form-label">Presupuesto Repuestos $</label>
                        <input
                            onChange={handleOnChange}
                            type="number"
                            className="form-control"
                            id="PresuReRep"
                            value={reparacion?.data?.PresuReRep || ""}
                            disabled={!admin}
                        />
                    </div>
                    <div>
                        <label className="form-label">Presupuesto Final $</label>
                        <input
                            onChange={handleOnChange}
                            type="number"
                            className="form-control"
                            id="PresuFiRep"
                            value={reparacion?.data?.PresuFiRep || ""}
                            disabled={!admin}
                        />
                    </div>
                    <div>
                        <label className="form-label">Diagnóstico $</label>
                        <input
                            onChange={handleOnChange}
                            type="number"
                            className="form-control"
                            id="PresuDiRep"
                            value={reparacion?.data?.PresuDiRep || ""}
                            disabled={!admin}
                        />
                    </div>
                </div>
            </div>
            {admin ? // Sólo para administrador
                <div className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title bluemcdron">REPUESTOS - CUALES Y SEGUIMIENTO</h5>
                        <div>
                            <label className="form-label">Qué repuesto, seguimiento, transportista</label>
                            <TextareaAutosize
                                onChange={handleOnChange}
                                className="form-control"
                                id="TxtRepuestosRep"
                                value={reparacion?.data?.TxtRepuestosRep || ""} //Esto es lo correcto
                                rows={5}
                            />
                        </div>
                    </div>
                </div>
                : null}
            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title bluemcdron">REPARACIÓN - DATOS DE LA REPARACIÓN</h5>
                    <div>
                        <label className="form-label">Informe de Reparación o Diagnóstico</label>
                        <TextareaAutosize
                            onChange={handleOnChange}
                            className="form-control"
                            id="InformeRep"
                            value={reparacion?.data?.InformeRep || ""}
                            rows={5}
                            disabled={!admin}
                        />
                    </div>
                    <div>
                        <label className="form-label">Fecha Finalizacion</label>
                        <input
                            onChange={handleOnChange}
                            type="date"
                            className="form-control"
                            id="FeFinRep"
                            value={convertTimestampCORTO(reparacion?.data?.FeFinRep)}
                            disabled={!admin}
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
                            onChange={handleOnChange}
                            type="date"
                            className="form-control"
                            id="FeEntRep"
                            value={convertTimestampCORTO(reparacion?.data?.FeEntRep)}
                            disabled={!admin}
                        />
                    </div>
                    <div>
                        <label className="form-label">Cliente, Comisionista, Correo, Seguimiento</label>
                        <TextareaAutosize
                            onChange={handleOnChange}
                            className="form-control"
                            id="TxtEntregaRep"
                            value={reparacion?.data?.TxtEntregaRep || ""}
                            rows={5}
                            disabled={!admin}
                        />
                    </div>
                    <div>
                        <label className="form-label">Nro. de Seguimiento</label>
                        <input
                            onChange={handleOnChange}
                            type="text"
                            className="form-control"
                            id="SeguimientoEntregaRep"
                            value={reparacion?.data?.SeguimientoEntregaRep || ""}
                            disabled={!admin}
                        />
                    </div>
                </div>
            </div>

            {admin ? // Sólo para administrador
                <div className="text-center">
                    <button
                        key="botonGuardar"
                        onClick={handleGuardarReparacion}
                        className="w-100 mb-3 btn bg-bluemcdron text-white"
                    >
                        Guardar
                    </button>
                    <button
                        key="botonEliminar"
                        onClick={handleEliminarReparacion}
                        className="w-100 btn bg-danger text-white"
                    >
                        Eliminar
                    </button>
                </div>
                : null}

        </div>

    )
}

export default ReparacionPresentational;