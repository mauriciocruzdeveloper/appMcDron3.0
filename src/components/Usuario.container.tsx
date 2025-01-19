import React from "react";
import { useEffect, useCallback, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import history from "../history";
import { 
    // Cliente y Usuario es lo mismo, pero Usuario se usa para referirse
    // al usuario logueado, y Cliente para el usuario en un ABMC
    guardarUsuario,
    eliminarUsuario,
    confirm,
    getProvinciasSelect,
    getLocalidadesPorProvincia,
  } from "../redux-DEPRECATED/root-actions";
import { 
    enviarEmail,
    enviarSms
} from "../utils/utils";
import UsuarioPresentational from './Usuario.presentational'
import { RootState } from "../redux-DEPRECATED/App/App.reducer";
import type { Usuario } from "../types/usuario";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../redux-tool-kit/hooks/useAppDispatch";

interface ParamTypes {
    id: string;
}

function UsuarioComponent(): React.ReactElement | null {
    const dispatch = useAppDispatch();
    const provinciasSelect = useAppSelector(state => state.app.provinciasSelect);
    const localidadesSelect = useAppSelector(state => state.app.localidadesSelect);
    const coleccionUsuarios = useAppSelector(state => state.app.coleccionUsuarios);

    console.log("USUARIO container");

    const { id } = useParams<ParamTypes>();

    const [ cliente, setCliente ] = useState<Usuario>();

    const inicializaFormulario = useCallback(async () => {
        if (!provinciasSelect?.length) await dispatch(getProvinciasSelect());
        setCliente(coleccionUsuarios.find(usuario => usuario.id == id))
    }, [coleccionUsuarios]);

    useEffect(() => {
        inicializaFormulario();
    }, [inicializaFormulario]);
    
    if (!cliente) return null;

    const changeInputUsu = (field: string, value: string) => {
        setCliente({ 
            ...cliente, 
            data: {
                ...cliente.data,
                [field]: value
            } 
        });
    };

    const handleGuardarUsuario = () => {
        confirm(
            "Guardar Usuario?",
            "Atención",
            "warning",
            () => guardarUsuario(cliente)
        );
    }

    const handleEliminarUsuario = () => {
        confirm(
            "Eliminar Reparación?",
            "Atención",
            "danger",
            async () => {
                await eliminarUsuario(cliente.id);
                history.goBack();
            }
        );
    }

    const handleOnChangeProvincias = async (value: string) => {
        if (!cliente) return;

        await getLocalidadesPorProvincia(value);
        setCliente({ 
            ...cliente, 
            data: {
                ...cliente.data,
                ProvinciaUsu: value
            } 
        });
    }

    const handleOnChangeLocalidades = (value: string) => {
        setCliente({ 
            ...cliente, 
            data: {
                ...cliente.data,
                CiudadUsu: value
            } 
        });
    }

    const handleSendEmail = () => {
        const data = {
            to: cliente.data.EmailUsu,
            cc: 'info@mauriciocruzdrones.com',
            bcc: [],
            subject: '',
            body:    ''
        };
        enviarEmail(data);
    }

    const handleSendSms = () => {
        const data = {
            number: cliente.data.TelefonoUsu, /* iOS: ensure number is actually a string */
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
            error: (e: any) => alert('Message Failed:' + e)
        };
        enviarSms(data);
    }

    return(
                // Sólo se renderiza el commponente presentacional cuando están los datos necesarios ya cargados.
        cliente && provinciasSelect.length ?
        <UsuarioPresentational 
            cliente={cliente}
            provinciasSelect={provinciasSelect}
            localidadesSelect={localidadesSelect}
            handleGuardarUsuario={handleGuardarUsuario}
            handleEliminarUsuario={handleEliminarUsuario}
            changeInputUsu={changeInputUsu}
            onChangeProvincias={handleOnChangeProvincias}
            onChangeLocalidades={handleOnChangeLocalidades}
            handleSendEmail={handleSendEmail}
            handleSendSms={handleSendSms}
        /> : null
    )
}

const mapStateToProps = (state: RootState) => ({
    provinciasSelect: state.app?.provinciasSelect,
    localidadesSelect: state.app?.localidadesSelect,
    coleccionUsuarios: state.app?.coleccionUsuarios
  });


export default connect(
    mapStateToProps, 
    {
        guardarUsuario,
        eliminarUsuario, 
        confirm,
        getProvinciasSelect,
        getLocalidadesPorProvincia,
    })(UsuarioComponent);