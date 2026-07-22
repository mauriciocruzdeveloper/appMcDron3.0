import React from 'react';
import { Navbar, NavDropdown } from 'react-bootstrap';
import { List } from 'react-bootstrap-icons';
import { useHistory } from '../hooks/useHistory';
import { logout } from "../redux-tool-kit/app/app.slice";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../redux-tool-kit/hooks/useAppDispatch";
import { useModal } from './Modal/useModal';
import { notificacionesPorMensajesPersistencia } from '../persistencia/persistencia';
import '../styles/navbar.css'; // Importa el archivo CSS


export default function NavMcDron (): JSX.Element {
    console.log("NavMcDron");

    const usuario = useAppSelector(state => state.app.usuario);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const admin = usuario?.data?.Role === 'admin';
    const nombreUsuario =
        usuario?.data?.NombreUsu?.trim() ||
        usuario?.data?.Nick?.trim() ||
        usuario?.data?.EmailUsu?.split('@')[0] ||
        "usuario";

    const {
        openModal,
    } = useModal();

    // Esto hay que ver donde lo ponemos...
    notificacionesPorMensajesPersistencia(usuario?.id);

    const confirmaDesloguearse = () => {
        localStorage.removeItem('loginData');
        dispatch(logout());
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

    const isActive = (path: string): boolean => history.location.pathname === path;

    return (
        <Navbar sticky="top" className="app-navbar navbar-shadow bg-bluemcdron px-2 px-lg-3">
            <div className="app-navbar-user">
                <img
                    src={usuario?.data?.UrlFotoUsu || "./img/logo1.png"}
                    width="50"
                    className="rounded-circle"
                    alt="Foto del usuario"
                    onClick={() => history.push('/inicio')}
                    style={{ cursor: 'pointer' }}
                />
                <div className="app-navbar-greeting">
                    <span>Hola,</span>
                    <strong>{nombreUsuario}</strong>
                </div>
            </div>

            <nav className="app-navbar-links" aria-label="Navegación principal">
                <button
                    type="button"
                    className={`app-navbar-link ${isActive('/inicio') ? 'active' : ''}`}
                    onClick={() => history.push('/inicio')}
                >
                    <i className="bi bi-house-door"></i>
                    Inicio
                </button>
                <button
                    type="button"
                    className={`app-navbar-link ${history.location.pathname.startsWith('/inicio/reparaciones') ? 'active' : ''}`}
                    onClick={() => history.push('/inicio/reparaciones')}
                >
                    <i className="bi bi-tools"></i>
                    Reparaciones
                </button>
                {admin && (
                    <>
                        <button
                            type="button"
                            className={`app-navbar-link app-navbar-link-wide ${history.location.pathname.startsWith('/inicio/repuestos') ? 'active' : ''}`}
                            onClick={() => history.push('/inicio/repuestos')}
                        >
                            <i className="bi bi-box-seam"></i>
                            Repuestos
                        </button>
                        <button
                            type="button"
                            className={`app-navbar-link app-navbar-link-wide ${history.location.pathname.startsWith('/inicio/pedidos') ? 'active' : ''}`}
                            onClick={() => history.push('/inicio/pedidos')}
                        >
                            <i className="bi bi-truck"></i>
                            Pedidos
                        </button>
                    </>
                )}
                <button
                    type="button"
                    className={`app-navbar-link ${history.location.pathname.startsWith('/inicio/mensajes') ? 'active' : ''}`}
                    onClick={() => history.push('/inicio/mensajes')}
                >
                    <i className="bi bi-chat-dots"></i>
                    Mensajes
                </button>
            </nav>

            <NavDropdown 
                title={
                    <span className="app-navbar-menu-label">
                        <List width="32" height="32" color="white" />
                        <span>Más</span>
                    </span>
                }
                id="nav-dropdown"
                drop="down"
                align="end"
            >
                <NavDropdown.Item onClick={() => history.push('/inicio/perfil')}>
                    Perfil
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item className="d-lg-none" onClick={() => history.push('/inicio/reparaciones')}>
                    Reparaciones
                </NavDropdown.Item>
                {admin && (
                    <>
                        <NavDropdown.Item onClick={() => history.push('/inicio/usuarios')}>
                            Usuarios
                        </NavDropdown.Item>
                        <NavDropdown.Item className="d-xl-none" onClick={() => history.push('/inicio/repuestos')}>
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
                        <NavDropdown.Item className="d-xl-none" onClick={() => history.push('/inicio/pedidos')}>
                            Pedidos de Repuestos
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item onClick={() => history.push('/inicio/estadisticas')}>
                            Estadísticas (Ingresos)
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => history.push('/inicio/estadisticas-locacion')}>
                            Estadísticas (Locación)
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => history.push('/inicio/estadisticas-semanales')}>
                            Estadísticas (Recepción Semanal)
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => history.push('/inicio/galeria-reparaciones')}>
                            Galería de Reparaciones
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => history.push('/inicio/estados-legacy')}>
                            Estados Legacy
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item onClick={() => history.push('/inicio/exportar-clientes-google-ads')}>
                            Exportar Clientes (Google Ads)
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                    </>
                )}
                <NavDropdown.Item className="d-lg-none" onClick={() => history.push('/inicio/mensajes')}>
                    Mensajes
                </NavDropdown.Item>
            </NavDropdown>
        </Navbar>
    )
}
