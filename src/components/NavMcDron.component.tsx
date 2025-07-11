import React from 'react';
import { Navbar } from 'react-bootstrap';
import { ArrowLeftShort } from 'react-bootstrap-icons';
import { useHistory } from '../hooks/useHistory';
import { logout } from "../redux-tool-kit/app/app.slice";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";
import { useModal } from './Modal/useModal';
import { notificacionesPorMensajesPersistencia } from '../persistencia/persistencia';
import '../styles/navbar.css'; // Importa el archivo CSS


export default function NavMcDron (): JSX.Element {
    console.log("NavMcDron");

    const usuario = useAppSelector(state => state.app.usuario);
    const history = useHistory();

    const {
        openModal,
    } = useModal();

    // Esto hay que ver donde lo ponemos...
    notificacionesPorMensajesPersistencia(usuario?.data.EmailUsu);

    const confirmaDesloguearse = () => {
        localStorage.removeItem('loginData');
        logout();
    }
        
    const handleBack = () => {
        if (history.location.pathname == "/inicio") {
            openModal({
                mensaje: "Desea desloguearse?",
                tipo: "warning",
                titulo: "Atención!",
                confirmCallback: confirmaDesloguearse,
            })
        } else {
            history.goBack()
        }
    }

    return (
        <Navbar sticky="top" className="navbar-shadow bg-bluemcdron d-flex justify-content-between px-2">
            <ArrowLeftShort
                width="50"
                height="50"
                onClick={handleBack}
                color="white"
            />
            <h4 className="text-white m-0 float-left">
                Hola {usuario?.data?.NombreUsu || "amigo"}!
            </h4>
            {/* <div 
                className="imageContainer rounded-circle float-right"
                width="50" 
                height="50"
            > */}
            <img
                src={usuario?.data?.UrlFotoUsu || "./img/logo1.png"}
                width="50"
                // height="50"
                className="rounded-circle float-right"
                alt="Foto del usuario"
            />
            {/* </div> */}
        </Navbar>
    )
}
