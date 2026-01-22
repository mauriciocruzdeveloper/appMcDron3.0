import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SingleValue } from 'react-select';
import { useHistory } from "../hooks/useHistory";
import { enviarEmail, enviarSms, getLocalidadesPorProvincia, getProvinciasSelect, generarPasswordPorDefecto, getEmailForNotifications } from "../utils/utils";
import { cambiarPasswordPersistencia } from "../persistencia/persistencia";
import Select from 'react-select';
import { ChangeEvent } from 'react';
import { InputType, SelectType } from '../types/types';
import { Usuario } from "../types/usuario";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../redux-tool-kit/hooks/useAppDispatch";
import { useModal } from "./Modal/useModal";
import { eliminarUsuarioAsync, guardarUsuarioAsync } from "../redux-tool-kit/usuario/usuario.actions";
import { selectUsuarioPorId } from "../redux-tool-kit/usuario/usuario.selectors";
import { selectReparacionesByUsuario } from "../redux-tool-kit/reparacion/reparacion.selectors";
import { convertTimestampCORTO } from "../utils/utils";
import { estados } from "../datos/estados";

interface ParamTypes extends Record<string, string | undefined> {
    id: string;
}

export default function UsuarioComponent(): React.ReactElement | null {
    console.log("USUARIO component");

    const dispatch = useAppDispatch();
    const history = useHistory();
    const { openModal } = useModal();

    const { id } = useParams<ParamTypes>();
    const usuarioLogueado = useAppSelector(state => state.app.usuario);
    
    const isNew = id === 'new';
    const esPropioPerfil = !isNew && id === usuarioLogueado?.id;
    const usuarioStore = useAppSelector(state => 
        isNew || !id ? null : selectUsuarioPorId(state, id || "")
    );
    
    const provinciasSelect = useAppSelector(state => state.usuario.provinciasSelect);
    const localidadesSelect = useAppSelector(state => state.usuario.localidadesSelect);

    // Obtener las reparaciones relacionadas con este usuario
    const reparacionesDelUsuario = useAppSelector(state => 
        id && !isNew ? selectReparacionesByUsuario(id)(state) : []
    );

    const [usuario, setUsuario] = useState<Usuario>({
        id: '',
        data: {
            NombreUsu: '',
            TelefonoUsu: '',
            ApellidoUsu: '',
            EmailUsu: '',
            EmailContacto: '',
            ProvinciaUsu: '',
            CiudadUsu: '',
            Role: 'cliente',
            Nick: '',
            UrlFotoUsu: '',
            PasswordUsu: ''
        }
    });
    
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordActual, setPasswordActual] = useState('');
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmarNuevaPassword, setConfirmarNuevaPassword] = useState('');

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
            
            // Si no es nuevo y hay un usuario en el store, lo cargamos
            if (!isNew && id) {
                if (!usuarioStore) return;
                
                setUsuario(usuarioStore);
                
                // Si el usuario tiene provincia, cargamos sus localidades
                if (usuarioStore.data?.ProvinciaUsu) {
                    try {
                        await dispatch(getLocalidadesPorProvincia(usuarioStore.data.ProvinciaUsu));
                    } catch (error) {
                        console.error("Error al cargar localidades:", error);
                    }
                }
            }
        };

        inicializaFormulario();
    }, [dispatch, id, isNew, usuarioStore, provinciasSelect]);

    const changeInputUsu = (field: string, value: string) => {
        setUsuario({
            ...usuario,
            data: {
                ...usuario.data,
                [field]: value
            }
        });
    };

    const handleOnChange = (event: ChangeEvent<InputType | HTMLSelectElement>) => {
        const target = event.target;

        let value = target.value;
        if ('type' in target && target.type === 'date') {
            const anio = Number(target.value.substr(0, 4));
            const mes = Number(target.value.substr(5, 2)) - 1;
            const dia = Number(target.value.substr(8, 2));
            value = String(Number(new Date(anio, mes, dia).getTime()) + 10800001); // Se agrega este número para que de bien la fecha.
        }
        const field = target.id;
        changeInputUsu(field, value);
    };

    const confirmaGuardarUsuario = async () => {
        // Para usuarios nuevos, verificar que tengan nombre antes de generar contraseña
        if (isNew && !usuario.data.NombreUsu?.trim()) {
            openModal({
                mensaje: "El nombre del usuario es obligatorio.",
                tipo: "warning",
                titulo: "Validación",
            });
            return;
        }
        
        // Si es el propio perfil y quiere cambiar la contraseña
        if (esPropioPerfil && nuevaPassword) {
            // Validar que se haya ingresado la contraseña actual
            if (!passwordActual) {
                openModal({
                    mensaje: "Debe ingresar su contraseña actual para cambiarla.",
                    tipo: "warning",
                    titulo: "Validación",
                });
                return;
            }
            
            // Validar que las nuevas contraseñas coincidan
            if (nuevaPassword !== confirmarNuevaPassword) {
                openModal({
                    mensaje: "Las nuevas contraseñas no coinciden.",
                    tipo: "warning",
                    titulo: "Validación",
                });
                return;
            }
            
            // Validar longitud mínima
            if (nuevaPassword.length < 6) {
                openModal({
                    mensaje: "La nueva contraseña debe tener al menos 6 caracteres.",
                    tipo: "warning",
                    titulo: "Validación",
                });
                return;
            }
            
            // Cambiar la contraseña usando Supabase Auth
            try {
                await cambiarPasswordPersistencia(passwordActual, nuevaPassword);
                
                openModal({
                    mensaje: "Contraseña actualizada correctamente.",
                    tipo: "success",
                    titulo: "Cambio de Contraseña",
                });
                
                // Limpiar los campos de contraseña
                setPasswordActual('');
                setNuevaPassword('');
                setConfirmarNuevaPassword('');
                
                return; // No continuar con el guardado normal
            } catch (error: any) {
                const errorMessage = error.code === 'invalid_current_password'
                    ? 'La contraseña actual es incorrecta.'
                    : error.message || 'Error al cambiar la contraseña.';
                
                openModal({
                    mensaje: errorMessage,
                    tipo: "danger",
                    titulo: "Error",
                });
                return;
            }
        }
        
        // Para usuarios nuevos, asegurar que tengan una contraseña
        let usuarioAGuardar = usuario;
        if (isNew && !usuario.data.PasswordUsu) {
            const passwordGenerada = generarPasswordPorDefecto(usuario.data.NombreUsu);
            usuarioAGuardar = {
                ...usuario,
                data: {
                    ...usuario.data,
                    PasswordUsu: passwordGenerada
                }
            };
            setUsuario(usuarioAGuardar);
        }
        
        const response = await dispatch(guardarUsuarioAsync(usuarioAGuardar));
        if (response.meta.requestStatus === 'fulfilled') {
            const passwordInfo = isNew 
                ? `\n\nContraseña generada: ${usuarioAGuardar.data.PasswordUsu}\n\nEl usuario puede cambiarla después de iniciar sesión.`
                : "";
            
            const mensajeBase = isNew 
                ? `Usuario creado correctamente.${passwordInfo}\n\nEl usuario puede iniciar sesión inmediatamente.`
                : "Usuario actualizado correctamente.";
            
            openModal({
                mensaje: mensajeBase,
                tipo: "success",
                titulo: isNew ? "Crear Usuario" : "Actualizar Usuario",
            });
            
            if (isNew) {
                // Redirigir a la lista de usuarios después de crear
                setTimeout(() => history.goBack(), 3000);
            }
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
            await dispatch(eliminarUsuarioAsync(usuario.id)).unwrap();
            
            openModal({
                mensaje: "Usuario eliminado correctamente.",
                tipo: "success",
                titulo: "Eliminar Usuario",
            });
            history.goBack();
        } catch (error: unknown) {
            console.error("Error al eliminar el usuario:", error);
            
            const errorMessage = error && typeof error === 'object' && 'code' in error 
                ? (error as { code: string }).code 
                : "Error al eliminar el usuario.";
            
            openModal({
                mensaje: errorMessage,
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
            to: getEmailForNotifications(usuario),
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

    // Función para obtener el color del estado
    const getEstadoColor = (estado: string): string => {
        return estados[estado]?.color || '#6c757d';
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
                        <label className='form-label'>E-mail (autenticación)</label>
                        <div className='d-flex w-100 justify-content-between'>
                            <input 
                                onChange={handleOnChange} 
                                type='text' 
                                className='form-control' 
                                id='EmailUsu' 
                                value={usuario?.data?.EmailUsu || ''}
                                disabled={!isNew}
                            />
                            <button 
                                type='submit' 
                                className='btn btn-outline-secondary bg-bluemcdron text-white' 
                                onClick={handleSendEmail}
                                disabled={!isNew}
                            >
                                <i className='bi bi-envelope'></i>
                            </button>
                        </div>
                        {!isNew && (
                            <small className='text-muted'>El email de autenticación no se puede modificar.</small>
                        )}
                    </div>
                    
                    <div>
                        <label className='form-label'>Email de contacto (notificaciones)</label>
                        <div className='d-flex w-100 justify-content-between'>
                            <input 
                                onChange={handleOnChange} 
                                type='email' 
                                className='form-control' 
                                id='EmailContacto' 
                                value={usuario?.data?.EmailContacto || ''}
                                placeholder='Email donde recibirás notificaciones'
                            />
                            <button 
                                type='submit' 
                                className='btn btn-outline-secondary bg-bluemcdron text-white' 
                                onClick={handleSendEmail}
                            >
                                <i className='bi bi-envelope'></i>
                            </button>
                        </div>
                        <small className='text-muted'>Si está vacío, se usará el email de autenticación.</small>
                    </div>
                    
                    {isNew && (
                        <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            <strong>Contraseña automática:</strong> Se generará una contraseña con el formato: <code>nombre1234</code>
                            <br />
                            <small>El usuario podrá cambiarla después de iniciar sesión.</small>
                        </div>
                    )}
                    
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
                        <label className='form-label'>Rol</label>
                        <select 
                            onChange={handleOnChange} 
                            className='form-select' 
                            id='Role'
                            value={usuario?.data?.Role || 'cliente'}
                        >
                            <option value='cliente'>Cliente</option>
                            <option value='partner'>Partner</option>
                            <option value='admin'>Administrador</option>
                        </select>
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

            {esPropioPerfil && (
                <div className='card mb-3'>
                    <div className='card-body'>
                        <h5 className='card-title bluemcdron'>CAMBIAR CONTRASEÑA</h5>
                        <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            Complete estos campos solo si desea cambiar su contraseña.
                        </div>
                        <div>
                            <label className='form-label'>Contraseña Actual</label>
                            <input 
                                onChange={(e) => setPasswordActual(e.target.value)} 
                                type='password' 
                                className='form-control' 
                                value={passwordActual}
                                placeholder='Ingrese su contraseña actual'
                            />
                        </div>
                        <div>
                            <label className='form-label'>Nueva Contraseña</label>
                            <input 
                                onChange={(e) => setNuevaPassword(e.target.value)} 
                                type='password' 
                                className='form-control' 
                                value={nuevaPassword}
                                placeholder='Mínimo 6 caracteres'
                            />
                        </div>
                        <div>
                            <label className='form-label'>Confirmar Nueva Contraseña</label>
                            <input 
                                onChange={(e) => setConfirmarNuevaPassword(e.target.value)} 
                                type='password' 
                                className='form-control' 
                                value={confirmarNuevaPassword}
                                placeholder='Repita la nueva contraseña'
                            />
                        </div>
                    </div>
                </div>
            )}

            {reparacionesDelUsuario.length > 0 && (
                <div className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title bluemcdron">REPARACIONES DEL CLIENTE</h5>
                        <div className="row">
                            <div className="col-12">
                                {reparacionesDelUsuario.map((reparacion, index) => (
                                    <div
                                        key={reparacion.id}
                                        className="card mb-2"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => history.push(`/inicio/reparaciones/${reparacion.id}`)}
                                    >
                                        <div className="card-body p-3">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="mb-1">
                                                        Reparación #{index + 1} - {reparacion.data.EstadoRep}
                                                    </h6>
                                                    <small className="text-muted">
                                                        Fecha: {convertTimestampCORTO(reparacion.data.FeConRep)}
                                                    </small>
                                                    {reparacion.data.ModeloDroneNameRep && (
                                                        <div className="mt-1">
                                                            <small className="text-info">
                                                                Drone: {reparacion.data.ModeloDroneNameRep}
                                                            </small>
                                                        </div>
                                                    )}
                                                    {reparacion.data.DescripcionUsuRep && (
                                                        <div className="mt-1">
                                                            <small className="text-muted">
                                                                {reparacion.data.DescripcionUsuRep.length > 100
                                                                    ? `${reparacion.data.DescripcionUsuRep.substring(0, 100)}...`
                                                                    : reparacion.data.DescripcionUsuRep}
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        backgroundColor: getEstadoColor(reparacion.data.EstadoRep),
                                                        color: 'white'
                                                    }}
                                                >
                                                    {reparacion.data.EstadoRep}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
