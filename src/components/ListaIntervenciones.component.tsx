import React, { useState } from 'react';
import { useHistory } from '../hooks/useHistory';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { setFilter } from '../redux-tool-kit/intervencion/intervencion.slice';
import { selectModelosDroneArray } from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';
import { selectIntervencionesArray } from '../redux-tool-kit/intervencion/intervencion.selectors';

export default function ListaIntervenciones(): JSX.Element {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const intervenciones = useAppSelector(selectIntervencionesArray);
  const filter = useAppSelector((state) => state.intervencion.filter);
  const modelosDrone = useAppSelector(selectModelosDroneArray);

  const [selectedModelo, setSelectedModelo] = useState<string>('');

  const intervencionesList = intervenciones.filter(intervencion => {
    const searchFilter = !filter ||
           intervencion.data?.NombreInt?.toLowerCase().includes(filter.toLowerCase()) ||
           intervencion.data?.DescripcionInt?.toLowerCase().includes(filter.toLowerCase());

    const modeloFilter = !selectedModelo ||
           (selectedModelo === 'general' && !intervencion.data.ModeloDroneId) ||
           intervencion.data.ModeloDroneId === selectedModelo;

    return searchFilter && modeloFilter;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilter(e.target.value));
  }

  const formatPrice = (precio: number): string => {
    return precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
  };

  const getModeloDroneName = (modeloId?: string): string => {
    if (!modeloId) return "General";
    const modelo = modelosDrone.find(m => m.id === modeloId);
    return modelo ? modelo.data.NombreModelo : modeloId;
  };

  const getPriceBadgeClass = (precio: number): string => {
    return precio < 0 ? 'bg-success' : 'bg-bluemcdron';
  };

  return (
    <div className='p-4'>
      <h2 className="mb-4">Intervenciones</h2>

      <div className='card mb-3'>
        <div className='card-body'>
          <div className='form-group'>
            <input
              type='text'
              className='form-control'
              placeholder='Buscar intervenciones...'
              value={filter}
              onChange={handleSearchChange}
            />
          </div>
          <div className='form-group mt-2'>
            <select
              className='form-control'
              value={selectedModelo}
              onChange={(e) => setSelectedModelo(e.target.value)}
            >
              <option value="">Todos los modelos</option>
              <option value="general">General</option>
              {modelosDrone.map(modelo => (
                <option key={modelo.id} value={modelo.id}>{modelo.data.NombreModelo}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="text-muted">
          <span>{intervencionesList.length} {intervencionesList.length === 1 ? 'intervención' : 'intervenciones'}</span>
        </div>

        <button
          className="btn w-auto bg-bluemcdron text-white"
          onClick={() => history.push('/inicio/intervenciones/new')}
        >
          <i className="bi bi-plus-circle me-1"></i> Nueva Intervención
        </button>
      </div>

      {intervencionesList.length === 0 ? (
        <div className="alert alert-info text-center" role="alert">
          No hay intervenciones que coincidan con los filtros.
        </div>
      ) : (
        intervencionesList.map(intervencion => (
          <div
            key={intervencion.id}
            className='card mb-3'
            aria-current='true'
            onClick={() => history.push(`/inicio/intervenciones/${intervencion.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className='card-body p-3'>
              <div className='d-flex w-100 justify-content-between'>
                <h5 className='mb-1'>{intervencion.data.NombreInt}</h5>
                <div>
                  <span className={`badge ${getPriceBadgeClass(intervencion.data.PrecioTotal)} me-2`}>
                    {formatPrice(intervencion.data.PrecioTotal)}
                  </span>
                </div>
              </div>
              <div>
                <small className='text-muted'>
                  Modelo: {getModeloDroneName(intervencion.data.ModeloDroneId)}
                  {!intervencion.data.ModeloDroneId &&
                    <span className="ms-1 badge bg-secondary">General</span>
                  }
                </small>
              </div>
              <div>
                <small className='text-muted'>Tiempo est.: {intervencion.data.DuracionEstimada} min</small>
              </div>
              <div>
                <small className='text-muted'>{intervencion.data.DescripcionInt}</small>
              </div>
              {intervencion.data.PrecioManoObra < 0 && (
                <div className="mt-1">
                  <span className="badge bg-success">Descuento</span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
