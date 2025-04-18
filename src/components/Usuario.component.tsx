import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SingleValue } from 'react-select';
import history from "../history";
import { enviarEmail, enviarSms, getLocalidadesPorProvincia, getProvinciasSelect } from "../utils/utils";
import Select from 'react-select';
import { ChangeEvent } from 'react';
import { InputType, SelectType } from '../types/types';
import { Usuario } from "../types/usuario";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../redux-tool-kit/hooks/useAppDispatch";
import { useModal } from "./Modal/useModal";
import { eliminarUsuarioAsync, guardarUsuarioAsync } from "../redux-tool-kit/usuario/usuario.actions";

interface ParamTypes {
    id: string;
}

export default function UsuarioComponent(): React.ReactElement | null {
    console.log("USUARIO component");

    const dispatch = useAppDispatch();
    const { openModal } = useModal();

    const provinciasSelect = useAppSelector(state => state.usuario.provinciasSelect);
    const localidadesSelect = useAppSelector(state => state.usuario.localidadesSelect);
    const coleccionUsuarios = useAppSelector(state => state.usuario.coleccionUsuarios);

    const { id } = useParams<ParamTypes>();
    const [usuario, setUsuario] = useState<Usuario>();

    useEffect(() => {
        const inicializaFormulario = async () => {
            // Intentamos cargar las provincias si no están cargadas
            if (!provinciasSelect || provinciasSelect.length === 0) {
                try {
                    await dispatch(getProvinciasSelect());
                } catch (error) {
                    console.error("Error al cargar provincias:", error);
                }
            }
            
            // Buscamos el usuario independientemente del resultado de cargar provincias
            const usuarioEncontrado = coleccionUsuarios.find(usuario => usuario.id === id);
            if (usuarioEncontrado) {
                setUsuario(usuarioEncontrado);
                
                // Si el usuario tiene provincia, cargamos sus localidades
                if (usuarioEncontrado.data?.ProvinciaUsu) {
                    try {
                        await dispatch(getLocalidadesPorProvincia(usuarioEncontrado.data.ProvinciaUsu));
                    } catch (error) {
                        console.error("Error al cargar localidades:", error);
                    }
                }
            }
        };

        inicializaFormulario();
    }, [dispatch, id, coleccionUsuarios, provinciasSelect]);

    if (!usuario) return null;

    const changeInputUsu = (field: string, value: string) => {
        setUsuario({
            ...usuario,
            data: {
                ...usuario.data,
                [field]: value
            }
        });
    };

    const handleOnChange = (event: ChangeEvent<InputType>) => {
        const target = event.target;

        let value = target.value;
        if (target.type === 'date') {
            const anio = Number(target.value.substr(0, 4));
            const mes = Number(target.value.substr(5, 2)) - 1;
            const dia = Number(target.value.substr(8, 2));
            value = String(Number(new Date(anio, mes, dia).getTime()) + 10800001); // Se agrega este número para que de bien la fecha.
        }
        const field = target.id;
        changeInputUsu(field, value);
    };

    const confirmaGuardarUsuario = async () => {
        const response = await dispatch(guardarUsuarioAsync(usuario));
        if (response.meta.requestStatus === 'fulfilled') {
            openModal({
                mensaje: "Usuario guardado correctamente.",
                tipo: "success",
                titulo: "Guardar Usuario",
            });
        } else {
            openModal({
                mensaje: "Error al guardar el usuario.",
                tipo: "danger",
                titulo: "Guardar Usuario",
            });
        }
    };

    const confirmEliminarUsuario = async () => {
        if (!usuario) return;
        try {
            const response = await dispatch(eliminarUsuarioAsync(usuario.id)).unwrap();
            
            openModal({
                mensaje: "Usuario eliminado correctamente.",
                tipo: "success",
                titulo: "Eliminar Usuario",
            });
            history.goBack();
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
            console.error("Error al eliminar el usuario:", error);
            
            openModal({
                mensaje: error?.code || "Error al eliminar el usuario.",
                tipo: "danger",
                titulo: "Error",
            });
        }
    };

    const handleGuardarUsuario = async () => {
        openModal({
            mensaje: "¿Desea guardar los cambios?",
            tipo: "warning",
            titulo: "Guardar Usuario",
            confirmCallback: confirmaGuardarUsuario,
        });
    };

    const handleEliminarUsuario = () => {
        openModal({
            mensaje: "¿Desea eliminar el Usuario?",
            tipo: "danger",
            titulo: "Eliminar Usuario",
            confirmCallback: confirmEliminarUsuario,
        });
    };

    const handleOnChangeProvincias = async (newValue: SingleValue<SelectType>) => {
        if (!newValue) return;
        
        await dispatch(getLocalidadesPorProvincia(newValue.value));
        setUsuario({
            ...usuario,
            data: {
                ...usuario.data,
                ProvinciaUsu: newValue.value
            }
        });
    };

    const handleOnChangeLocalidades = (newValue: SingleValue<SelectType>) => {
        if (!newValue) return;
        
        setUsuario({
            ...usuario,
            data: {
                ...usuario.data,
                CiudadUsu: newValue.value
            }
        });
    };

    const handleSendEmail = () => {
        const data = {
            to: usuario.data.EmailUsu,
            cc: 'info@mauriciocruzdrones.com',
            bcc: [],
            subject: '',
            body: ''
        };
        enviarEmail(data);
    };

    const handleSendSms = () => {
        const data = {
            number: usuario.data.TelefonoUsu, /* iOS: ensure number is actually a string */
            message: 'Prueba de sms',

            //CONFIGURATION
            options: {
                replaceLineBreaks: false, // true to replace \n by a new line, false by default
                android: {
                    intent: 'INTENT'  // send SMS with the native android SMS messaging
                    //intent: '' // send SMS without opening any other app, require : android.permission.SEND_SMS and android.permission.READ_PHONE_STATE
                }
            },

            success: () => null,
            error: (e: unknown) => alert('Message Failed:' + e)
        };
        enviarSms(data);
    };

    return (
        <div
            className='p-4'
            style={{
                backgroundColor: '#EEEEEE'
            }}
        >
            <div className='card mb-3'>
                <div className='card-body'>
                    <h3 className='card-title'>
                        USUARIO
                    </h3>
                    <div>Nombre: {usuario?.data?.NombreUsu} {usuario?.data?.ApellidoUsu}</div>
                    <div>Email: {usuario?.data?.EmailUsu}</div>
                </div>
            </div>

            <div className='card mb-3'>
                <div className='card-body'>
                <h5 className='card-title bluemcdron'>DATOS DEL USUARIO</h5>
                    <div>
                        <label className='form-label'>E-mail</label>
                        <div className='d-flex w-100 justify-content-between'>
                            <input 
                                onChange={handleOnChange} 
                                type='text' 
                                className='form-control' 
                                id='EmailUsu' 
                                value={usuario?.data?.EmailUsu || ''}
                            />
                            <button 
                                type='submit' 
                                className='btn btn-outline-secondary bg-bluemcdron text-white' 
                                onClick={handleSendEmail}
                            >
                                <i className='bi bi-envelope'></i>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className='form-label'>Nombre</label>
                        <input 
                            onChange={handleOnChange} 
                            type='text' 
                            className='form-control' 
                            id='NombreUsu' 
                            value={usuario?.data?.NombreUsu || ''}
                        />
                    </div>
                    <div>
                        <label className='form-label'>Apellido</label>
                        <input 
                            onChange={handleOnChange} 
                            type='text' 
                            className='form-control' 
                            id='ApellidoUsu' 
                            value={usuario?.data?.ApellidoUsu || ''}
                        />
                    </div>
                    <div>
                        <label className='form-label'>Teléfono</label>
                        <div className='d-flex w-100 justify-content-between'>
                            <input 
                                onChange={handleOnChange} 
                                type='tel' 
                                className='form-control' 
                                id='TelefonoUsu'
                                value={usuario?.data?.TelefonoUsu || ''}
                            />
                            <button 
                                type='submit' 
                                className='btn btn-outline-secondary bg-bluemcdron text-white' 
                                onClick={handleSendSms}
                            >
                               <i className='bi bi-chat-left-text'></i>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className='form-label'>Provincia</label>
                        <Select 
                            options={provinciasSelect || []}
                            onChange={handleOnChangeProvincias}
                            id='ProvinciaUsu'
                            value={usuario?.data?.ProvinciaUsu ? {
                                value: usuario?.data?.ProvinciaUsu, 
                                label: usuario?.data?.ProvinciaUsu
                            } : null}
                        />
                    </div>
                    <div>
                        <label className='form-label'>Ciudad</label>
                        <Select 
                            options={localidadesSelect || []}
                            onChange={handleOnChangeLocalidades}
                            id='CiudadUsu'
                            value={usuario?.data?.CiudadUsu ? {
                                value: usuario?.data?.CiudadUsu, 
                                label: usuario?.data?.CiudadUsu
                            } : null}
                            isDisabled={!provinciasSelect?.length || !usuario?.data?.ProvinciaUsu}
                        />
                    </div>
                </div>
            </div>

           <div className='text-center'>
                <button 
                    onClick={handleGuardarUsuario}
                    className='w-100 mb-3 btn bg-bluemcdron text-white'
                >
                    Guardar
                </button>
                <button 
                    onClick={handleEliminarUsuario}
                    className='w-100 btn bg-danger text-white'
                >
                    Eliminar
                </button>
            </div>
        </div>
    );
}
