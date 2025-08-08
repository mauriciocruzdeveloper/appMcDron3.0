import React from 'react';
import { useHistory } from '../hooks/useHistory';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { selectModelosDroneArray } from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';
import { selectColeccionUsuarios } from '../redux-tool-kit/usuario/usuario.selectors';
import { 
  selectDronesFiltrados,
  selectDroneFilter,
  setFilter,
} from '../redux-tool-kit/drone';

export default function ListaDrones(): JSX.Element {
    const dispatch = useAppDispatch();
    const history = useHistory();
    
    const dronesList = useAppSelector(selectDronesFiltrados);
    const filter = useAppSelector(selectDroneFilter);
    
    const modelosDrone = useAppSelector(selectModelosDroneArray);
    const usuarios = useAppSelector(selectColeccionUsuarios);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setFilter(e.target.value));
    }

    const getModeloDroneName = (modeloDroneId: string): string => {
        const modelo = modelosDrone.find(modelo => modelo.id === modeloDroneId);
        return modelo ? modelo.data.NombreModelo : modeloDroneId;
    };

    return (
        <div className='p-4'>
            <h2 className="mb-4">Drones</h2>
            
            <div className='card mb-3'>
                <div className='card-body'>
                    <div className='form-group'>
                        <input
                            type='text'
                            className='form-control'
                            placeholder='Buscar drones...'
                            value={filter}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="text-muted">
                    <span>{dronesList.length} {dronesList.length === 1 ? 'drone' : 'drones'}</span>
                </div>
                
                <button
                    className="btn w-auto bg-bluemcdron text-white"
                    onClick={() => history.push('/inicio/drones/new')}
                >
                    <i className="bi bi-plus-circle me-1"></i> Nuevo Drone
                </button>
            </div>

            {dronesList.length === 0 ? (
                <div className="alert alert-info text-center" role="alert">
                    No hay elementos en la lista.
                </div>
            ) : (
                dronesList.map(drone => (
                    <div
                        key={drone.id}
                        className='card mb-3'
                        aria-current='true'
                        onClick={() => history.push(`/inicio/drones/${drone.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className='card-body p-3'>
                            <div className='d-flex w-100 justify-content-between'>
                                <h5 className='mb-1'>{getModeloDroneName(drone.data.ModeloDroneId)}</h5>
                            </div>
                            <div>
                                <small className='text-muted'>
                                  {(() => {
                                    const propietarioId = drone.data.Propietario;
                                    const usuario = usuarios[propietarioId];
                                    return usuario ? `${usuario.data.NombreUsu} ${usuario.data.ApellidoUsu}` : propietarioId;
                                  })()}
                                </small>
                            </div>
                            {drone.data.Observaciones && (
                                <div>
                                    <small className='text-muted'>{drone.data.Observaciones}</small>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
