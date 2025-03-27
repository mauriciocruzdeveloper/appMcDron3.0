/* eslint-disable react/jsx-no-target-blank */
import { convertTimestampCORTO } from "../utils/utils";
// Components
import TextareaAutosize from "react-textarea-autosize";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ChangeEvent, useState } from "react";
import { InputType } from "../types/types";
import { ReparacionType } from "../types/reparacion";
import { Estado, Estados } from "../types/estado";
import { Usuario } from "../types/usuario";
import history from '../history';

interface ReparacionPresentationalProps {
    admin: boolean;
    reparacion: ReparacionType;
    usuario: Usuario;
    estados: Estados;
    setEstado: (estado: Estado) => void;
    changeInputRep: (field: string, value: string) => void;
    handleGuardarReparacion: () => void;
    handleEliminarReparacion: () => void;
    handleSendEmail: () => void;
    handleSendSms: () => void;
    handleSendRecibo: () => void;
    handleGenerarAutoDiagnostico: () => void;
    handleFotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDeleteFoto: (url: string) => void;
    handleDocumentoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDeleteDocumento: (url: string) => void;
}

const ReparacionPresentational = (props: ReparacionPresentationalProps) => {
    const {
        admin,
        reparacion,
        usuario,
        estados,
        setEstado,
        changeInputRep,
        handleGuardarReparacion,
        handleEliminarReparacion,
        handleSendEmail,
        handleSendSms,
        handleSendRecibo,
        handleGenerarAutoDiagnostico,
        handleFotoChange,
        handleDeleteFoto,
        handleDocumentoChange,
        handleDeleteDocumento,
    } = props;

    console.log("REPARACION presentational");

    const [fotoSeleccionada, setFotoSeleccionada] = useState<string | null>(null);

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

    const handleGoToUser = () => {
        history.push(`/inicio/usuarios/${usuario.data.EmailUsu}`)
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
                    <div>Cliente: {usuario?.data?.NombreUsu} {usuario?.data?.ApellidoUsu}</div>
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
                    <div className="d-flex w-100 justify-content-between align-items-center">
                        <h5 className="card-title bluemcdron">CONSULTA - PRIMEROS DATOS</h5>
                        <button
                            type="button"
                            className="btn btn-outline-secondary bg-bluemcdron text-white"
                            onClick={handleGoToUser}
                        >
                            Ir al Cliente
                        </button>
                    </div>
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
                                id="EmailUsu"
                                value={usuario?.data?.EmailUsu || ''}
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
                            value={usuario?.data?.NombreUsu}
                            disabled
                        />
                    </div>
                    <div>
                        <label className="form-label">Apellido Cliente</label>
                        <input
                            type="text"
                            className="form-control"
                            id="ApellidoUsu"
                            value={usuario?.data?.ApellidoUsu}
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
                                value={usuario?.data?.TelefonoUsu}
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
                        <div className="d-flex w-100 justify-content-between align-items-center">
                            <label className="form-label">Autodiagnóstico</label>
                            <button
                                type="button"
                                className="btn btn-outline-secondary bg-bluemcdron text-white"
                                onClick={handleGenerarAutoDiagnostico}
                            >
                                <i className="bi bi-arrow-repeat"></i>
                            </button>
                        </div>
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
            <div className="card mb-3">
                <div className="card-body">
                    <div className="d-flex w-100 justify-content-between align-items-center">
                        <h5 className="card-title bluemcdron">FOTOS</h5>
                        <div className="d-flex justify-content-start mb-2">
                            <label className="btn btn-outline-secondary bg-bluemcdron text-white">
                                Subir Foto
                                <input
                                    type="file"
                                    onChange={handleFotoChange}
                                    style={{ display: "none" }}
                                />
                            </label>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap mt-3">
                        {reparacion.data.urlsFotos?.map((url, idx) => (
                            <div
                                key={idx}
                                style={{
                                    width: "calc((100% - (2 * 12px)) / 3)",
                                    margin: "4px",
                                    backgroundColor: "#f1f1f1"
                                }}
                            >
                                <div
                                    style={{
                                        height: "150px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setFotoSeleccionada(url)}
                                >
                                    <img
                                        src={url}
                                        alt="Foto Reparación"
                                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                    />
                                </div>
                                {admin && (
                                    <div className="flex text-center my-2">
                                        <a
                                            target="_blank"
                                            href={url}
                                            download
                                            className="btn btn-sm btn-success me-2 bi-cloud-download"
                                        >
                                        </a>
                                        <a
                                            className="btn btn-sm btn-danger bi bi-trash"
                                            onClick={() => handleDeleteFoto(url)}
                                        >
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {fotoSeleccionada && (
                        <div
                            style={{
                                position: "fixed",
                                top: 0, left: 0,
                                width: "100%", height: "100%",
                                backgroundColor: "rgba(0,0,0,0.7)",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}
                        >
                            <div style={{ position: "relative" }}>
                                <button
                                    type="button"
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        right: 0,
                                        margin: "8px"
                                    }}
                                    className="btn btn-sm btn-light"
                                    onClick={() => setFotoSeleccionada(null)}
                                >
                                    X
                                </button>
                                <img
                                    src={fotoSeleccionada}
                                    alt="Foto Ampliada"
                                    style={{ maxHeight: "80vh", maxWidth: "90vw", objectFit: "contain" }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <div className="d-flex w-100 justify-content-between align-items-center">
                        <h5 className="card-title bluemcdron">DOCUMENTOS</h5>
                        <div className="d-flex justify-content-start mb-2">
                            <label className="btn btn-outline-secondary bg-bluemcdron text-white">
                                Subir Documento
                                <input
                                    type="file"
                                    onChange={handleDocumentoChange}
                                    style={{ display: "none" }}
                                />
                            </label>
                        </div>
                    </div>
                    <div className="mt-3">
                        {reparacion.data.urlsDocumentos?.length ? (
                            <div className="list-group">
                                {reparacion.data.urlsDocumentos.map((url, idx) => {
                                    // Decodificar caracteres especiales como %20
                                    let fileName = decodeURIComponent(url);
                                    // Extraer nombre del documento de la URL y decodificar
                                    fileName = fileName.split('/').pop() || `Documento ${idx + 1}`;
                                    // Eliminar los parámetros de consulta
                                    fileName = fileName.split('?')[0];
                                    
                                    return (
                                        <div 
                                            key={idx} 
                                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-2"
                                        >
                                            <div className="text-truncate" style={{ maxWidth: "70%" }}>
                                                <i className="bi bi-file-earmark-text me-2"></i>
                                                <span className="text-truncate">{fileName}</span>
                                            </div>
                                            <div>
                                                <a 
                                                    href={url} 
                                                    target="_blank" 
                                                    className="btn btn-sm btn-success me-3"
                                                    download
                                                >
                                                    <i className="bi bi-cloud-download"></i>
                                                </a>
                                                {admin && (
                                                    <button 
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDeleteDocumento(url)}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center text-muted">
                                <p>No hay documentos adjuntos</p>
                            </div>
                        )}
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