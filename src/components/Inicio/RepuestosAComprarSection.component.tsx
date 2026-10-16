import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from 'redux-tool-kit/hooks/useAppSelector';
import { selectEstadoComprasRepuestos, selectRepuestosAComprar } from 'redux-tool-kit/repuesto/repuesto.selectors';
import { selectReparacionesDictionary } from 'redux-tool-kit/reparacion/reparacion.selectors';
import { selectColeccionModelosDrone } from 'redux-tool-kit/modeloDrone/modeloDrone.selectors';
import { useHistory } from 'hooks/useHistory';
import RepuestoCard from '../RepuestoCard.component';

const RepuestosAComprarSection = (): React.ReactElement => {
  const history = useHistory();
  const [expanded, setExpanded] = React.useState(false);
  const filas = useAppSelector(selectRepuestosAComprar);
  const carga = useAppSelector(selectEstadoComprasRepuestos);
  const reparaciones = useAppSelector(selectReparacionesDictionary);
  const repuestos = useAppSelector(state => state.repuesto.coleccionRepuestos);
  const modelos = useAppSelector(selectColeccionModelosDrone);
  const cantidadTipos = filas.filter(fila => fila.cantidadAComprar !== null).length;

  return (
    <div className='mb-4'>
      <h5 className='mb-3'>
        <button
          type='button'
          className='btn btn-link p-0 text-reset text-decoration-none d-flex align-items-center justify-content-between w-100 text-start'
          style={{ fontSize: 'inherit', fontWeight: 'inherit', gap: 8 }}
          aria-expanded={expanded}
          aria-controls='repuestos-a-comprar-lista'
          onClick={() => setExpanded(!expanded)}
        >
          <span><i className='bi bi-cart-plus me-2' aria-hidden='true'></i>Repuestos a comprar</span>
          <span className='d-flex align-items-center flex-shrink-0'>
            {carga.estado === 'succeeded' && cantidadTipos > 0 && (
              <span className='badge bg-danger me-2'>{cantidadTipos}</span>
            )}
            <i className={`bi bi-chevron-${expanded ? 'up' : 'down'}`} aria-hidden='true'></i>
          </span>
        </button>
      </h5>
      {expanded && (
        <div id='repuestos-a-comprar-lista'>
          {carga.estado === 'loading' ? (
            <p className='text-muted mb-0' role='status'>Cargando repuestos a comprar...</p>
          ) : carga.estado === 'failed' ? (
            <div className='alert alert-danger mb-0' role='alert'>{carga.error}</div>
          ) : filas.length === 0 ? (
            <p className='text-muted mb-0'>No hay repuestos pendientes de compra</p>
          ) : (
            <ul className='list-group list-unstyled'>
              {filas.map(fila => {
                const nombresModelos = Array.from(new Set(
                  (repuestos[fila.repuestoId]?.data.ModelosDroneIds || [])
                    .map(modeloId => modelos[modeloId]?.data.NombreModelo)
                    .filter((nombre): nombre is string => nombre !== undefined)
                ));
                return (
                <li key={fila.repuestoId} style={{ overflowWrap: 'anywhere' }}>
                  <RepuestoCard
                    repuesto={repuestos[fila.repuestoId] || { id: fila.repuestoId, data: { NombreRepu: fila.nombre } }}
                    modelosNombres={nombresModelos}
                    estado={fila.stock === null ? 'Sin confirmar' : 'Agotado'}
                    cantidadPedida={fila.cantidadPedida}
                    onClick={fila.stock === null ? undefined : () => history.push(`/inicio/repuestos/${fila.repuestoId}`)}
                  >
                  {fila.cantidadAComprar !== null && <span className='badge bg-danger'>Comprar: {fila.cantidadAComprar}</span>}
                  <div className='small mt-2 d-flex flex-wrap gap-2'>
                    <span>Necesarios: {fila.cantidadNecesaria}</span>
                    <span>Pedidos: {fila.cantidadPedida}</span>
                  </div>
                  {fila.stock === null && <p className='small text-danger mt-1 mb-0'>No se pudo confirmar la cantidad a comprar</p>}
                  <ul className='list-unstyled small mt-2 mb-0'>
                    {fila.reparacionesIds.map(reparacionId => {
                      const reparacion = reparaciones[reparacionId];
                      const nombre = [reparacion?.data.NombreUsu, reparacion?.data.ApellidoUsu].filter(Boolean).join(' ');
                      return (
                        <li key={reparacionId} className='mt-1'>
                          <Link to={`/inicio/reparaciones/${reparacionId}`}>
                            {reparacion?.data.IdPublicoRep || `Reparacion #${reparacionId}`}
                            {reparacion?.data.ModeloDroneNameRep && ` - ${reparacion.data.ModeloDroneNameRep}`}
                            {nombre && ` - ${nombre}`}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  </RepuestoCard>
                </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default RepuestosAComprarSection;