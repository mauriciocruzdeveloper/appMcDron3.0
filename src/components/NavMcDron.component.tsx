import React from 'react';
import { Navbar, NavDropdown } from 'react-bootstrap';
import { ArrowLeftShort, List } from 'react-bootstrap-icons';
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
    const admin = usuario?.data?.Admin;

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
            <h4 className="text-white m-0">
                Hola {usuario?.data?.NombreUsu || "amigo"}!
            </h4>
            <NavDropdown 
                title={
                    <img
                        src={usuario?.data?.UrlFotoUsu || "./img/logo1.png"}
                        width="50"
                        className="rounded-circle"
                        alt="Foto del usuario"
                    />
                }
                id="nav-dropdown"
                drop="down"
                align="end"
            >
                <NavDropdown.Item onClick={() => history.push('/inicio/perfil')}>
                    Perfil
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => history.push('/inicio/reparaciones')}>
                    Reparaciones
                </NavDropdown.Item>
                {admin && (
                    <>
                        <NavDropdown.Item onClick={() => history.push('/inicio/usuarios')}>
                            Usuarios
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => history.push('/inicio/repuestos')}>
                            Repuestos
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => history.push('/inicio/modelos-drone')}>
                            Modelos de Drones
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => history.push('/inicio/drones')}>
                            Drones
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => history.push('/inicio/intervenciones')}>
                            Intervenciones
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item onClick={() => history.push('/inicio/estadisticas')}>
                            Estadísticas (Ingresos)
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => history.push('/inicio/estadisticas-locacion')}>
                            Estadísticas (Locación)
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => history.push('/inicio/galeria-reparaciones')}>
                            Galería de Reparaciones
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => history.push('/inicio/estados-legacy')}>
                            Estados Legacy
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                    </>
                )}
                <NavDropdown.Item onClick={() => history.push('/inicio/mensajes')}>
                    Mensajes
                </NavDropdown.Item>
            </NavDropdown>
        </Navbar>
    )
}
