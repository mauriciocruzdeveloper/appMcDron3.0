import React, { useEffect, useState } from 'react';
import history from '../history';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { Intervencion } from '../types/intervencion';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { setFilter } from '../redux-tool-kit/intervencion/intervencion.slice';

// Mock de intervenciones para mostrar como ejemplo
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
      DuracionEstimada: 30,
      Complejidad: 'Baja',
      Categoria: 'Reparación',
      Estado: 'Activa'
    }
  },
  {
    id: 'mock-2',
    data: {
      NombreInt: 'Calibración de sensores',
      DescripcionInt: 'Ajuste y calibración de sensores de vuelo',
      ModeloDroneId: 'mock-2',
      RepuestosIds: [],
      PrecioManoObra: 8000,
      PrecioTotal: 8000,
      DuracionEstimada: 45,
      Complejidad: 'Media',
      Categoria: 'Mantenimiento',
      Estado: 'Activa'
    }
  },
  {
    id: 'mock-3',
    data: {
      NombreInt: 'Cambio de cámara',
      DescripcionInt: 'Reemplazo completo de la cámara',
      ModeloDroneId: 'mock-1',
      RepuestosIds: ['mock-2'],
      PrecioManoObra: 10000,
      PrecioTotal: 48000,
      DuracionEstimada: 60,
      Complejidad: 'Alta',
      Categoria: 'Actualización',
      Estado: 'Activa'
    }
  }
];

export default function ListaIntervenciones(): JSX.Element {
  const dispatch = useAppDispatch();
  const coleccionIntervenciones = useAppSelector((state) => state.intervencion.coleccionIntervenciones);
  const filter = useAppSelector((state) => state.intervencion.filter);
  const modelosDrone = useAppSelector((state) => state.modeloDrone.coleccionModelosDrone);

  const [intervencionesList, setIntervencionesList] = useState<Intervencion[]>([]);
  const [mostrandoMock, setMostrandoMock] = useState<boolean>(false);

  useEffect(() => {
    if (coleccionIntervenciones.length) {
      const intervenciones = coleccionIntervenciones.filter(intervencion => {
        let incluirPorSearch = true;
        if (filter) {
          incluirPorSearch =
            intervencion.data?.NombreInt?.toLowerCase().includes(filter.toLowerCase()) ||
            intervencion.data?.DescripcionInt?.toLowerCase().includes(filter.toLowerCase()) ||
            intervencion.data?.Categoria?.toLowerCase().includes(filter.toLowerCase());
        }
        return incluirPorSearch;
      });
      setIntervencionesList(intervenciones);
      setMostrandoMock(false);
    } else {
      // Usar los datos mock cuando no hay datos reales
      setIntervencionesList(intervencionesMock);
      setMostrandoMock(true);
    }
  }, [coleccionIntervenciones, filter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilter(e.target.value));
  }

  const formatPrice = (precio: number): string => {
    return precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
  };

  const getModeloDroneName = (modeloId: string): string => {
    const modelo = modelosDrone.find(m => m.id === modeloId);
    return modelo ? modelo.data.NombreModelo : modeloId;
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
                  <span className='badge bg-bluemcdron me-2'>{formatPrice(intervencion.data.PrecioTotal)}</span>
                  <span className={`badge ${intervencion.data.Complejidad === 'Baja' ? 'bg-success' : 
                    intervencion.data.Complejidad === 'Media' ? 'bg-warning' : 'bg-danger'}`}>
                    {intervencion.data.Complejidad}
                  </span>
                </div>
              </div>
              <div>
                <small className='text-muted'>Modelo: {getModeloDroneName(intervencion.data.ModeloDroneId)}</small>
              </div>
              <div>
                <small className='text-muted'>Categoría: {intervencion.data.Categoria}</small>
                <small className='text-muted ms-3'>Tiempo est.: {intervencion.data.DuracionEstimada} min</small>
              </div>
              <div>
                <small className='text-muted'>{intervencion.data.DescripcionInt}</small>
              </div>
              {intervencion.data.Estado && intervencion.data.Estado !== 'Activa' && (
                <div>
                  <small className='text-danger'>{intervencion.data.Estado}</small>
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
