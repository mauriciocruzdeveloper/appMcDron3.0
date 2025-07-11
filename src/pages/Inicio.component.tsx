import React from 'react';
import { useHistory } from '../hooks/useHistory';

const Inicio = () => {
    const history = useHistory();

    return (
        <div className="container py-4">
            <h1 className="mb-4">Panel de Control</h1>
            
            <div className="row g-4">
                
                {/* Tarjeta para Repuestos */}
                <div className="col-md-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Repuestos</h5>
                            <p className="card-text">Gestión de repuestos para drones.</p>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => history.push('/inicio/repuestos')}
                            >
                                Ver repuestos
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Tarjeta para Modelos de Drones */}
                <div className="col-md-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Modelos de Drones</h5>
                            <p className="card-text">Gestión de modelos de drones disponibles.</p>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => history.push('/inicio/modelos-drone')}
                            >
                                Ver modelos
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Tarjeta para Drones */}
                <div className="col-md-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Drones</h5>
                            <p className="card-text">Gestión de drones específicos de clientes.</p>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => history.push('/inicio/drones')}
                            >
                                Ver drones
                            </button>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default Inicio;