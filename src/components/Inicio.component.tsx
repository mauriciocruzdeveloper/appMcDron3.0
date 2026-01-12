import React from 'react';
import { useLocation } from 'react-router-dom';
import { useHistory } from '../hooks/useHistory';
import { estados } from '../datos/estados';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { 
  selectReparacionesAccionInmediata, 
  selectModeloNombreByReparacionId,
  selectReparacionesEnRepuestos,
  selectCantidadEnRepuestos
} from '../redux-tool-kit/reparacion/reparacion.selectors';
import { selectRepuestosFaltantes, selectModelosNombresByRepuestoId, selectRepuestosPedidos } from '../redux-tool-kit/repuesto/repuesto.selectors';

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
  const vecesUsado = repuesto.vecesUsado || 0;

  return (
    <div
      className='list-group-item list-group-item-action mb-2'
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className='d-flex justify-content-between align-items-center'>
        <div style={{ flex: 1 }}>
          <h6 className='mb-1'>{repuesto.data.NombreRepu}</h6>
          <p className='mb-1 text-muted'>{repuesto.data.ProveedorRepu}</p>
          <small className='text-muted d-block'>
            {modelosNombres.length > 0 ? modelosNombres.join(', ') : 'Sin modelos asignados'}
          </small>
          <small className={`badge mt-1 ${vecesUsado > 0 ? 'bg-info text-dark' : 'bg-secondary'}`}>
            {vecesUsado > 0 
              ? `📊 Usado ${vecesUsado} ${vecesUsado === 1 ? 'vez' : 'veces'} en reparaciones`
              : '⚪ No usado en reparaciones'
            }
          </small>
        </div>
        <span
          className='badge ms-2'
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

// Componente para mostrar cada repuesto en pedido
const RepuestoPedidoItem = ({ repuesto, onClick }: {
  repuesto: any;
  onClick: () => void;
}) => {
  const modelosNombres = useAppSelector(selectModelosNombresByRepuestoId(repuesto.id));
  const vecesUsado = repuesto.vecesUsado || 0;

  return (
    <div
      className='list-group-item list-group-item-action mb-2'
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className='d-flex justify-content-between align-items-center'>
        <div style={{ flex: 1 }}>
          <h6 className='mb-1'>{repuesto.data.NombreRepu}</h6>
          <p className='mb-1 text-muted'>{repuesto.data.ProveedorRepu}</p>
          <small className='text-muted d-block'>
            {modelosNombres.length > 0 ? modelosNombres.join(', ') : 'Sin modelos asignados'}
          </small>
          <div className='d-flex gap-2 mt-1'>
            <small className='badge bg-warning text-dark'>
              📦 {repuesto.data.UnidadesPedidas} {repuesto.data.UnidadesPedidas === 1 ? 'unidad pedida' : 'unidades pedidas'}
            </small>
            <small className={`badge ${vecesUsado > 0 ? 'bg-info text-dark' : 'bg-secondary'}`}>
              {vecesUsado > 0 
                ? `📊 Usado ${vecesUsado} ${vecesUsado === 1 ? 'vez' : 'veces'} en reparaciones`
                : '⚪ No usado en reparaciones'
              }
            </small>
          </div>
        </div>
        <span
          className='badge ms-2'
          style={{
            backgroundColor: '#ffc107',
            color: 'black'
          }}
        >
          En Pedido
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
  const reparacionesEnRepuestos = useAppSelector(selectReparacionesEnRepuestos);
  const cantidadEnRepuestos = useAppSelector(selectCantidadEnRepuestos);
  const repuestosFaltantes = useAppSelector(selectRepuestosFaltantes);
  const repuestosPedidos = useAppSelector(selectRepuestosPedidos);
  const [repuestosExpanded, setRepuestosExpanded] = React.useState(false);
  const [repuestosPedidosExpanded, setRepuestosPedidosExpanded] = React.useState(false);
  const [repuestosReparacionExpanded, setRepuestosReparacionExpanded] = React.useState(false);

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
        <h5 className='mb-3'>🎯 Casos de Uso</h5>
        {renderEstadoButton('Recibido', 'RECEPCIÓN')}
        {renderEstadoButton('Transito', 'DRONE EN TRÁNSITO')}
      </div>

      {/* Lista de reparaciones prioritarias */}
      <div className='mb-4'>
        <h5 className='mb-3'>⚡ Reparaciones Prioritarias</h5>
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

      {/* Lista de reparaciones esperando repuestos */}
      <div className='mb-4'>
        <div
          className='d-flex justify-content-between align-items-center mb-3'
          onClick={() => setRepuestosReparacionExpanded(!repuestosReparacionExpanded)}
          style={{ cursor: 'pointer' }}
        >
          <h5 className='mb-0'>⏸️ Esperando Repuestos</h5>
          <div className='d-flex align-items-center'>
            {cantidadEnRepuestos > 0 && (
              <span className='badge bg-warning text-dark me-2'>{cantidadEnRepuestos}</span>
            )}
            <i className={`bi bi-chevron-${repuestosReparacionExpanded ? 'up' : 'down'}`}></i>
          </div>
        </div>
        {repuestosReparacionExpanded && (
          reparacionesEnRepuestos.length > 0 ? (
            <div className='list-group'>
              {reparacionesEnRepuestos.map(reparacion => {
                const estado = estados.Repuestos;
                return (
                  <div
                    key={reparacion.id}
                    className='list-group-item list-group-item-action mb-2'
                    onClick={() => history.push(`${match.path}/reparaciones/${reparacion.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className='d-flex justify-content-between align-items-center'>
                      <div style={{ flex: 1 }}>
                        <h6 className='mb-1'>
                          {reparacion.data.ModeloDroneNameRep || 'Modelo no especificado'}
                        </h6>
                        <p className='mb-1 text-muted'>
                          {reparacion.data.NombreUsu} {reparacion.data.ApellidoUsu}
                        </p>
                        {reparacion.data.ObsRepuestos && (
                          <small className='text-muted'>
                            📝 {reparacion.data.ObsRepuestos.substring(0, 80)}
                            {reparacion.data.ObsRepuestos.length > 80 ? '...' : ''}
                          </small>
                        )}
                      </div>
                      <div className='d-flex flex-column align-items-end ms-3'>
                        <span
                          className='badge'
                          style={{
                            backgroundColor: estado?.color || '#ffc107',
                            color: 'black'
                          }}
                        >
                          {reparacion.data.EstadoRep}
                        </span>
                        <span className='badge mt-2' style={{ color: 'black' }}>
                          {estado?.accion || 'Esperar repuestos'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className='text-muted'>No hay reparaciones esperando repuestos</p>
          )
        )}
      </div>

      {/* Lista de repuestos agotados */}
      <div className='mb-4'>
        <div
          className='d-flex justify-content-between align-items-center mb-3'
          onClick={() => setRepuestosExpanded(!repuestosExpanded)}
          style={{ cursor: 'pointer' }}
        >
          <h5 className='mb-0'>🚫 Repuestos Agotados</h5>
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

      {/* Lista de repuestos en pedido */}
      <div>
        <div
          className='d-flex justify-content-between align-items-center mb-3'
          onClick={() => setRepuestosPedidosExpanded(!repuestosPedidosExpanded)}
          style={{ cursor: 'pointer' }}
        >
          <h5 className='mb-0'>🚚 Repuestos en Pedido</h5>
          <div className='d-flex align-items-center'>
            {repuestosPedidos.length > 0 && (
              <span className='badge bg-warning text-dark me-2'>{repuestosPedidos.length}</span>
            )}
            <i className={`bi bi-chevron-${repuestosPedidosExpanded ? 'up' : 'down'}`}></i>
          </div>
        </div>
        {repuestosPedidosExpanded && (
          repuestosPedidos.length > 0 ? (
            <div className='list-group'>
              {repuestosPedidos.map(repuesto => (
                <RepuestoPedidoItem
                  key={repuesto.id}
                  repuesto={repuesto}
                  onClick={() => history.push(`${match.path}/repuestos/${repuesto.id}`)}
                />
              ))}
            </div>
          ) : (
            <p className='text-muted'>No hay repuestos en pedido</p>
          )
        )}
      </div>
    </div>
  )
};

export default Inicio;
