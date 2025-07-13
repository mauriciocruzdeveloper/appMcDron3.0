import React, { useEffect, useState } from 'react';
import { useHistory } from '../hooks/useHistory';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { Intervencion } from '../types/intervencion';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { setFilter } from '../redux-tool-kit/intervencion/intervencion.slice';
import { selectModelosDroneArray } from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';
import { selectIntervencionesArray, selectTieneIntervenciones } from '../redux-tool-kit/intervencion/intervencion.selectors';

// Mock de intervenciones para mostrar como ejemplo (modificado)
const intervencionesMock: Intervencion[] = [
  {
    id: 'mock-1',
    data: {
      NombreInt: 'Reemplazo de hélices',
      DescripcionInt: 'Cambio de hélices rotas o desgastadas',
      ModeloDroneId: 'mock-1',
      RepuestosIds: ['mock-1'],
      PrecioManoObra: 5000,
      PrecioTotal: 20000,
      DuracionEstimada: 30
    }
  },
  {
    id: 'mock-2',
    data: {
      NombreInt: 'Calibración de sensores',
      DescripcionInt: 'Ajuste y calibración de sensores de vuelo',
      RepuestosIds: [],
      PrecioManoObra: 8000,
      PrecioTotal: 8000,
      DuracionEstimada: 45
    }
  },
  {
    id: 'mock-3',
    data: {
      NombreInt: 'Descuento por fidelidad',
      DescripcionInt: 'Descuento especial para clientes frecuentes',
      ModeloDroneId: 'mock-1',
      RepuestosIds: [],
      PrecioManoObra: -5000,
      PrecioTotal: -5000,
      DuracionEstimada: 0
    }
  }
];

export default function ListaIntervenciones(): JSX.Element {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const intervenciones = useAppSelector(selectIntervencionesArray);
  const tieneIntervenciones = useAppSelector(selectTieneIntervenciones);
  const filter = useAppSelector((state) => state.intervencion.filter);
  const modelosDrone = useAppSelector(selectModelosDroneArray);

  const [mostrandoMock, setMostrandoMock] = useState<boolean>(false);

  // Lista final de intervenciones a mostrar
  const intervencionesList = tieneIntervenciones 
    ? intervenciones.filter(intervencion => {
        if (!filter) return true;
        return intervencion.data?.NombreInt?.toLowerCase().includes(filter.toLowerCase()) ||
               intervencion.data?.DescripcionInt?.toLowerCase().includes(filter.toLowerCase());
      })
    : intervencionesMock;

  // Actualizar el estado de mostrar mock
  useEffect(() => {
    setMostrandoMock(!tieneIntervenciones);
  }, [tieneIntervenciones]);

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

  // Determinar el color de la insignia de precio según sea positivo o negativo
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
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="text-muted">
          {mostrandoMock ?
            <span>Mostrando {intervencionesList.length} intervenciones de ejemplo <span className="badge bg-warning text-dark">DATOS DE EJEMPLO</span></span> :
            <span>{intervencionesList.length} {intervencionesList.length === 1 ? 'intervención' : 'intervenciones'}</span>
          }
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
          No hay intervenciones disponibles. ¡Agregue una nueva intervención!
        </div>
      ) : (
        intervencionesList.map(intervencion => (
          <div
            key={intervencion.id}
            className={`card mb-3 ${mostrandoMock && intervencion.id.startsWith('mock') ? 'bg-light' : ''}`}
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
              {mostrandoMock && intervencion.id.startsWith('mock') && (
                <div className="mt-2">
                  <span className="badge bg-secondary">Ejemplo</span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
