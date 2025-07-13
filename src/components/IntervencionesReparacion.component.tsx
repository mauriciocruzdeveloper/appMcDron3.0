import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { getIntervencionesPorReparacionAsync, agregarIntervencionAReparacionAsync, eliminarIntervencionDeReparacionAsync } from '../redux-tool-kit/reparacion/reparacion.actions';
import { Intervencion } from '../types/intervencion';
import { useModal } from './Modal/useModal';
import Select from 'react-select';
import { setIntervencionesDeReparacionActual } from '../redux-tool-kit/reparacion/reparacion.slice';
import { selectColeccionModelosDrone } from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';
import { selectColeccionRepuestos } from '../redux-tool-kit/repuesto/repuesto.selectors';
import { selectColeccionIntervenciones } from '../redux-tool-kit/intervencion/intervencion.selectors';
import { selectIntervencionesDeReparacionActual } from '../redux-tool-kit/reparacion';

interface IntervencionesReparacionProps {
  reparacionId: string;
  readOnly?: boolean;
}

export default function IntervencionesReparacion({ reparacionId, readOnly = false }: IntervencionesReparacionProps): JSX.Element {
  const dispatch = useAppDispatch();
  const { openModal } = useModal();

  // Usar selectores optimizados
  const intervenciones = useAppSelector(selectIntervencionesDeReparacionActual);
  const todasLasIntervenciones = useAppSelector(selectColeccionIntervenciones);
  const modelosDrone = useAppSelector(selectColeccionModelosDrone);
  const repuestosInventario = useAppSelector(selectColeccionRepuestos);

  const [intervencionSeleccionada, setIntervencionSeleccionada] = useState<string | null>(null);
  const [totalManoObra, setTotalManoObra] = useState<number>(0);
  const [totalRepuestos, setTotalRepuestos] = useState<number>(0);
  const [totalGeneral, setTotalGeneral] = useState<number>(0);

  // Opciones para el selector de intervenciones - optimizado para diccionario
  const opcionesIntervenciones = Object.values(todasLasIntervenciones)
    .filter(intervencion => !intervenciones.some(i => i.id === intervencion.id)) // Filtrar las ya asociadas
    .map(intervencion => ({
      value: intervencion.id,
      label: `${intervencion.data.NombreInt}`,
    }));

  useEffect(() => {
    // Cargar intervenciones al montar el componente
    dispatch(getIntervencionesPorReparacionAsync(reparacionId));

    return () => {
      // Limpiar el estado de intervenciones al desmontar el componente
      dispatch(setIntervencionesDeReparacionActual([]));
    }
  }, [dispatch, reparacionId]);

  useEffect(() => {
    // Calcular los totales cuando cambian las intervenciones
    let manoObra = 0;
    let repuestos = 0;
    let total = 0;

    intervenciones.forEach(intervencion => {
      manoObra += intervencion.data.PrecioManoObra;
      total += intervencion.data.PrecioTotal;
    });

    repuestos = total - manoObra;

    setTotalManoObra(manoObra);
    setTotalRepuestos(repuestos);
    setTotalGeneral(total);
  }, [intervenciones]);

  const handleAgregarIntervencion = async () => {
    if (!intervencionSeleccionada) return;

    try {
      await dispatch(agregarIntervencionAReparacionAsync({
        reparacionId,
        intervencionId: intervencionSeleccionada
      })).unwrap();

      setIntervencionSeleccionada(null);

      openModal({
        mensaje: "Intervención agregada correctamente.",
        tipo: "success",
        titulo: "Agregar Intervención",
      });
    } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
      openModal({
        mensaje: (error as { code?: string })?.code || "Error al agregar la intervención.",
        tipo: "danger",
        titulo: "Error",
      });
    }
  };

  const handleEliminarIntervencion = async (intervencionId: string) => {
    openModal({
      mensaje: "¿Está seguro de que desea eliminar esta intervención de la reparación?",
      tipo: "danger",
      titulo: "Eliminar Intervención",
      confirmCallback: async () => {
        try {
          await dispatch(eliminarIntervencionDeReparacionAsync({
            reparacionId,
            intervencionId
          })).unwrap();

          openModal({
            mensaje: "Intervención eliminada correctamente.",
            tipo: "success",
            titulo: "Eliminar Intervención",
          });
        } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
          openModal({
            mensaje: (error as { code?: string })?.code || "Error al eliminar la intervención.",
            tipo: "danger",
            titulo: "Error",
          });
        }
      }
    });
  };

  const formatPrice = (precio: number): string => {
    return precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
  };

  const getModeloDroneName = (modeloId: string): string => {
    const modelo = modelosDrone[modeloId];
    return modelo ? modelo.data.NombreModelo : modeloId;
  };

  const getRepuestoInfo = (repuestoId: string) => {
    const repuesto = repuestosInventario[repuestoId];
    return repuesto
      ? `${repuesto.data.NombreRepu} (${formatPrice(repuesto.data.PrecioRepu)})`
      : 'Repuesto no encontrado';
  };

  return (
    <div className="mb-3">
      {!readOnly && (
        <div className="mb-4">
          <div className="row g-3 align-items-center">
            <div className="col">
              <Select
                options={opcionesIntervenciones}
                value={opcionesIntervenciones.find(opt => opt.value === intervencionSeleccionada) || null}
                onChange={(selected) => setIntervencionSeleccionada(selected?.value || null)}
                placeholder="Seleccionar una intervención..."
                isClearable
              />
            </div>
            <div className="col-auto">
              <button
                className="btn bg-bluemcdron text-white"
                onClick={handleAgregarIntervencion}
                disabled={!intervencionSeleccionada}
              >
                <i className="bi bi-plus-circle me-1"></i> Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {intervenciones.length === 0 ? (
        <div className="alert alert-info text-center" role="alert">
          No hay intervenciones asociadas a esta reparación.
        </div>
      ) : (
        <>
          <div>
            {intervenciones.map((intervencion: Intervencion) => (
              <div
                key={intervencion.id}
                className="card mb-3"
              >
                <div className="card-body">
                  <div className="d-flex w-100 justify-content-between mb-2">
                    <h6 className="mb-1">{intervencion.data.NombreInt}</h6>
                    <div>
                      <span className="badge bg-bluemcdron">
                        {formatPrice(intervencion.data.PrecioTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-1 small">
                    <strong>Modelo:</strong> {intervencion.data.ModeloDroneId && getModeloDroneName(intervencion.data.ModeloDroneId)}
                  </div>

                  <div className="mb-1 small">
                    <strong>Tiempo estimado:</strong> {intervencion.data.DuracionEstimada} minutos
                  </div>

                  <div className="mb-2 small">
                    <strong>Descripción:</strong> {intervencion.data.DescripcionInt}
                  </div>

                  {intervencion.data.RepuestosIds && intervencion.data.RepuestosIds.length > 0 && (
                    <div className="mb-2 small">
                      <strong>Repuestos:</strong>
                      <ul className="mb-0 ps-3">
                        {intervencion.data.RepuestosIds.map((repuestoId, idx) => (
                          <li key={idx}>
                            {getRepuestoInfo(repuestoId)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div>
                      <span className="badge bg-secondary me-2">
                        Mano de obra: {formatPrice(intervencion.data.PrecioManoObra)}
                      </span>
                      <span className="badge bg-secondary">
                        Repuestos: {formatPrice(intervencion.data.PrecioTotal - intervencion.data.PrecioManoObra)}
                      </span>
                    </div>

                    {!readOnly && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleEliminarIntervencion(intervencion.id)}
                      >
                        <i className="bi bi-trash"></i> Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card bg-light">
            <div className="card-body">
              <h6 className="card-title">Resumen</h6>
              <div className="row">
                <div className="col">
                  <div className="mb-2">Mano de obra:</div>
                  <div className="mb-2">Repuestos:</div>
                  <div className="fw-bold">Total:</div>
                </div>
                <div className="col-auto text-end">
                  <div className="mb-2">{formatPrice(totalManoObra)}</div>
                  <div className="mb-2">{formatPrice(totalRepuestos)}</div>
                  <div className="fw-bold">{formatPrice(totalGeneral)}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
