import React, { useState, useRef, useEffect } from 'react';
// Íconos Bootstrap Icons usando CSS
import { useHistory } from '../hooks/useHistory';
import { logout } from "../redux-tool-kit/app/app.slice";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../redux-tool-kit/hooks/useAppDispatch";
import { useModal } from './Modal/useModal';
import { notificacionesPorMensajesPersistencia } from '../persistencia/persistencia';
import '../styles/navbar.css';


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

    const { openModal } = useModal();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Esto hay que ver donde lo ponemos...
    notificacionesPorMensajesPersistencia(usuario?.id);

    const confirmaDesloguearse = () => {
        localStorage.removeItem('loginData');
        dispatch(logout());
    };

    const handleBack = () => {
        if (history.location.pathname === "/inicio") {
            openModal({
                mensaje: "Desea desloguearse?",
                tipo: "warning",
                titulo: "Atención!",
                confirmCallback: confirmaDesloguearse,
            });
        } else {
            history.goBack();
        }
    };

    const navigate = (path: string) => {
        setDropdownOpen(false);
        history.push(path);
    };

    // Cerrar dropdown al clickear fuera
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        }
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [dropdownOpen]);

    return (
        <nav className="mc-navbar">
            {/* Foto de usuario → volver / inicio */}
            <img
                src={usuario?.data?.UrlFotoUsu || "./img/logo1.png"}
                width="50"
                height="50"
                className="rounded-circle"
                alt="Foto del usuario"
                onClick={() => history.push('/inicio')}
                style={{ cursor: 'pointer', objectFit: 'cover' }}
            />

            {/* Saludo */}
            <h4 className="text-white m-0" style={{ fontSize: '1.1rem' }}>
                Hola {nombreUsuario}!
            </h4>

            {/* Dropdown */}
            <div className="mc-dropdown" ref={dropdownRef}>
                <button
                    className="mc-dropdown-toggle"
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    onClick={() => setDropdownOpen(prev => !prev)}
                    type="button"
                >
                    <i className="bi bi-list text-white" style={{ fontSize: 35 }}></i>
                </button>

                <div className={`mc-dropdown-menu${dropdownOpen ? ' open' : ''}`} role="menu">
                    <button className="mc-dropdown-item" onClick={() => navigate('/inicio/perfil')}>
                        Perfil
                    </button>

                    <div className="mc-dropdown-divider" />

                    <button className="mc-dropdown-item" onClick={() => navigate('/inicio/reparaciones')}>
                        Reparaciones
                    </button>

                    {admin && (
                        <>
                            <button className="mc-dropdown-item" onClick={() => navigate('/inicio/usuarios')}>
                                Usuarios
                            </button>
                            <button className="mc-dropdown-item" onClick={() => navigate('/inicio/repuestos')}>
                                Repuestos
                            </button>
                            <button className="mc-dropdown-item" onClick={() => navigate('/inicio/modelos-drone')}>
                                Modelos de Drones
                            </button>
                            <button className="mc-dropdown-item" onClick={() => navigate('/inicio/drones')}>
                                Drones
                            </button>
                            <button className="mc-dropdown-item" onClick={() => navigate('/inicio/intervenciones')}>
                                Intervenciones
                            </button>
                            <button className="mc-dropdown-item" onClick={() => navigate('/inicio/pedidos')}>
                                Pedidos de Repuestos
                            </button>

                            <div className="mc-dropdown-divider" />

                            <button className="mc-dropdown-item" onClick={() => navigate('/inicio/estadisticas')}>
                                Estadísticas (Ingresos)
                            </button>
                            <button className="mc-dropdown-item" onClick={() => navigate('/inicio/estadisticas-locacion')}>
                                Estadísticas (Locación)
                            </button>
                            <button className="mc-dropdown-item" onClick={() => navigate('/inicio/estadisticas-semanales')}>
                                Estadísticas (Recepción Semanal)
                            </button>
                            <button className="mc-dropdown-item" onClick={() => navigate('/inicio/galeria-reparaciones')}>
                                Galería de Reparaciones
                            </button>
                            <button className="mc-dropdown-item" onClick={() => navigate('/inicio/estados-legacy')}>
                                Estados Legacy
                            </button>

                            <div className="mc-dropdown-divider" />

                            <button className="mc-dropdown-item" onClick={() => navigate('/inicio/exportar-clientes-google-ads')}>
                                Exportar Clientes (Google Ads)
                            </button>

                            <div className="mc-dropdown-divider" />
                        </>
                    )}

                    <button className="mc-dropdown-item" onClick={() => navigate('/inicio/mensajes')}>
                        Mensajes
                    </button>
                </div>
            </div>
        </nav>
    );
}
