import React from 'react';
import { useLocation } from 'react-router-dom';
import { useHistory } from '../hooks/useHistory';
import { estados } from '../datos/estados';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { selectReparacionesAccionInmediata, selectModeloNombreByReparacionId } from '../redux-tool-kit/reparacion/reparacion.selectors';
import { selectRepuestosFaltantes, selectModelosNombresByRepuestoId } from '../redux-tool-kit/repuesto/repuesto.selectors';

interface InicioProps {
  admin: boolean;
}

// Componente para mostrar cada reparación
const ReparacionItem = ({ reparacion, estado, onClick }: {
  reparacion: any;
  estado: any;
  onClick: () => void;
}) => {
  const modeloNombre = useAppSelector(selectModeloNombreByReparacionId(reparacion.id));

  return (
    <div
      className='list-group-item list-group-item-action mb-2'
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className='d-flex justify-content-between align-items-center'>
        <div>
          <h6 className='mb-1'>{modeloNombre || reparacion.data.ModeloDroneNameRep || 'Modelo no especificado'}</h6>
          <p className='mb-1 text-muted'>{reparacion.data.NombreUsu} {reparacion.data.ApellidoUsu}</p>
        </div>
        <div className='d-flex flex-column align-items-end'>
          <span
            className='badge'
            style={{
              backgroundColor: estado?.color || '#6c757d',
              color: reparacion.data.EstadoRep === 'Recibido' ? 'white' : 'black'
            }}
          >
            {reparacion.data.EstadoRep}
          </span>
          <span
            className='badge mt-2'
            style={{
              color: 'black',
            }}
          >
            {estado.accion}
          </span>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar cada repuesto agotado
const RepuestoItem = ({ repuesto, onClick }: {
  repuesto: any;
  onClick: () => void;
}) => {
  const modelosNombres = useAppSelector(selectModelosNombresByRepuestoId(repuesto.id));

  return (
    <div
      className='list-group-item list-group-item-action mb-2'
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className='d-flex justify-content-between align-items-center'>
        <div>
          <h6 className='mb-1'>{repuesto.data.NombreRepu}</h6>
          <p className='mb-1 text-muted'>{repuesto.data.ProveedorRepu}</p>
          <small className='text-muted'>
            {modelosNombres.length > 0 ? modelosNombres.join(', ') : 'Sin modelos asignados'}
          </small>
        </div>
        <span
          className='badge'
          style={{
            backgroundColor: '#dc3545',
            color: 'white'
          }}
        >
          Agotado
        </span>
      </div>
    </div>
  );
};

const Inicio = (props: InicioProps): React.ReactElement => {
  const { admin } = props;
  const history = useHistory();
  const location = useLocation();
  const match = { path: location.pathname }; // Simular match.path para compatibilidad
  const reparacionesPrioritarias = useAppSelector(selectReparacionesAccionInmediata);
  const repuestosFaltantes = useAppSelector(selectRepuestosFaltantes);
  const [repuestosExpanded, setRepuestosExpanded] = React.useState(false);

  console.log('INICIO');

  // Función para generar un botón de estado con su configuración específica
  const renderEstadoButton = (estadoKey: string, texto: string) => {
    const estado = estados[estadoKey];
    if (!estado) return null;

    return (
      <button
        className='mb-3 btn w-100'
        style={{
          height: '100px',
          backgroundColor: estado.color,
          color: estadoKey === 'Recibido' ? 'white' : 'black' // Texto blanco para Recibido, negro para otros
        }}
        onClick={() => history.push(`${match.path}/presupuesto?estado=${estadoKey}`)}
      >
        <div className={`text-center`}>{texto}</div>
      </button>
    );
  };

  return (
    <div className='p-4'>
      <img className='mb-4' src='./img/logo.png' alt='' width='100%' max-width='100px' />

      {/* Sección de casos de uso */}
      <div className='mb-4'>
        <h5 className='mb-3'>Casos de Uso</h5>
        {renderEstadoButton('Recibido', 'RECEPCIÓN')}
        {renderEstadoButton('Transito', 'DRONE EN TRÁNSITO')}
      </div>

      {/* Lista de reparaciones prioritarias */}
      <div className='mb-4'>
        <h5 className='mb-3'>Reparaciones Prioritarias</h5>
        {reparacionesPrioritarias.length > 0 ? (
          <div className='list-group'>
            {reparacionesPrioritarias.map(reparacion => {
              const estado = estados[reparacion.data.EstadoRep];
              return (
                <ReparacionItem
                  key={reparacion.id}
                  reparacion={reparacion}
                  estado={estado}
                  onClick={() => history.push(`${match.path}/reparaciones/${reparacion.id}`)}
                />
              );
            })}
          </div>
        ) : (
          <p className='text-muted'>No hay reparaciones que requieran acción inmediata</p>
        )}
      </div>

      {/* Lista de repuestos agotados */}
      <div>
        <div
          className='d-flex justify-content-between align-items-center mb-3'
          onClick={() => setRepuestosExpanded(!repuestosExpanded)}
          style={{ cursor: 'pointer' }}
        >
          <h5 className='mb-0'>Repuestos Agotados</h5>
          <div className='d-flex align-items-center'>
            {repuestosFaltantes.length > 0 && (
              <span className='badge bg-danger me-2'>{repuestosFaltantes.length}</span>
            )}
            <i className={`bi bi-chevron-${repuestosExpanded ? 'up' : 'down'}`}></i>
          </div>
        </div>
        {repuestosExpanded && (
          repuestosFaltantes.length > 0 ? (
            <div className='list-group'>
              {repuestosFaltantes.map(repuesto => (
                <RepuestoItem
                  key={repuesto.id}
                  repuesto={repuesto}
                  onClick={() => history.push(`${match.path}/repuestos/${repuesto.id}`)}
                />
              ))}
            </div>
          ) : (
            <p className='text-muted'>No hay repuestos agotados</p>
          )
        )}
      </div>
    </div>
  )
};

export default Inicio;
