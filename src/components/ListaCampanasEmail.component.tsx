import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import {
  eliminarCampanaEmailAsync,
  ejecutarCampanasVencidasAsync,
  finalizarRunCampanaEmailAsync,
  getRecipientsRunCampanaEmailAsync,
  getRunsCampanaEmailAsync,
  guardarCampanaEmailAsync,
  reintentarRunCampanaEmailAsync,
  selectCampanasEmailFiltradas,
  selectCampanasRunsRecientes,
  selectResumenUltimaEjecucionCampanas,
  setFilterCampanasEmail,
} from '../redux-tool-kit/campanaEmail';
import { selectPlantillasEmailArray } from '../redux-tool-kit/plantillaEmail';
import { EmailCampaign, EmailCampaignFilterDefinition, EmailCampaignFrequency, EmailCampaignRunRecipient } from '../types/emailCampaign';
import { suscribirseEnviosCampanaEmailPersistencia } from '../persistencia/persistencia';
import { useModal } from './Modal/useModal';
import { estados } from '../datos/estados';
import { selectReparacionesArray } from '../redux-tool-kit/reparacion/reparacion.selectors';
import { selectUsuariosArray } from '../redux-tool-kit/usuario/usuario.selectors';

const getDefaultNextRunAt = (): string => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  return now.toISOString();
};

const emptyCampaign: EmailCampaign = {
  id: '',
  data: {
    NombreCampana: '',
    PlantillaId: '',
    Filtros: {
      incluirTodosLosClientes: true,
      estadosReparacion: [],
      noPagaron: false,
      soloConEmail: true,
      minDiasDesdeConsulta: null,
      minDiasDesdeRecepcion: null,
    },
    Frecuencia: 'once',
    CadaCantidad: 1,
    ProximaEjecucion: getDefaultNextRunAt(),
    UltimaEjecucion: null,
    ActivaCampana: true,
  },
};

const emailUsuario = (u: any): string => u?.data?.EmailContacto || u?.data?.EmailUsu || '';

const cumpleFiltros = (filters: EmailCampaignFilterDefinition, reparacion: any): boolean => {
  if (filters.estadosReparacion && filters.estadosReparacion.length > 0) {
    if (!filters.estadosReparacion.includes(reparacion.data.EstadoRep)) {
      return false;
    }
  }

  if (filters.minDiasDesdeConsulta != null) {
    const feConRep = reparacion.data.FeConRep || 0;
    const dias = (Date.now() - Number(feConRep)) / (1000 * 60 * 60 * 24);
    if (dias < filters.minDiasDesdeConsulta) {
      return false;
    }
  }

  if (filters.minDiasDesdeRecepcion != null) {
    const feRecRep = reparacion.data.FeRecRep || 0;
    if (!feRecRep) return false;
    const dias = (Date.now() - Number(feRecRep)) / (1000 * 60 * 60 * 24);
    if (dias < filters.minDiasDesdeRecepcion) {
      return false;
    }
  }

  if (filters.noPagaron) {
    const restante = (Number(reparacion.data.PresuFiRep) || 0) - (Number(reparacion.data.AdelantoRep) || 0);
    if (restante <= 0) {
      return false;
    }
  }

  return true;
};

const previewDestinatarios = (filters: EmailCampaignFilterDefinition, usuarios: any[], reparaciones: any[]) => {
  if (filters.incluirTodosLosClientes) {
    return usuarios.filter((u) => {
      const email = emailUsuario(u);
      return filters.soloConEmail ? Boolean(email) : true;
    });
  }

  const userIds = new Set<string>();
  reparaciones.forEach((rep) => {
    if (cumpleFiltros(filters, rep)) {
      userIds.add(rep.data.UsuarioRep);
    }
  });

  return usuarios.filter((u) => {
    if (!userIds.has(u.id)) return false;
    const email = emailUsuario(u);
    return filters.soloConEmail ? Boolean(email) : true;
  });
};

export default function ListaCampanasEmail(): JSX.Element {
  const dispatch = useAppDispatch();
  const { openModal } = useModal();

  const filter = useAppSelector((state) => state.campanaEmail.filter);
  const campanas = useAppSelector(selectCampanasEmailFiltradas);
  const plantillas = useAppSelector(selectPlantillasEmailArray).filter((p) => p.data.ActivaPlantilla);
  const runs = useAppSelector(selectCampanasRunsRecientes);
  const resumen = useAppSelector(selectResumenUltimaEjecucionCampanas);
  const usuarios = useAppSelector(selectUsuariosArray);
  const reparaciones = useAppSelector(selectReparacionesArray);
  const campanasById = useAppSelector((state) => state.campanaEmail.coleccionCampanasEmail);
  const plantillasById = useAppSelector((state) => state.plantillaEmail.coleccionPlantillasEmail);

  const [draft, setDraft] = useState<EmailCampaign>(emptyCampaign);
  const [viewing, setViewing] = useState<EmailCampaign | null>(null);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [liveEvents, setLiveEvents] = useState<EmailCampaignRunRecipient[] | null>(null);
  const [liveDone, setLiveDone] = useState(false);
  const recipientsPorRun = useAppSelector((state) => state.campanaEmail.recipientsPorRun);

  const conProgresoEnVivo = async (accion: () => Promise<void>) => {
    setLiveEvents([]);
    setLiveDone(false);
    const unsubscribe = suscribirseEnviosCampanaEmailPersistencia((recipient: EmailCampaignRunRecipient) => {
      setLiveEvents((prev) => {
        const list = prev ? [...prev] : [];
        const idx = list.findIndex((r) => r.id === recipient.id);
        if (idx >= 0) list[idx] = recipient;
        else list.push(recipient);
        return list;
      });
    });
    try {
      await accion();
    } finally {
      unsubscribe();
      setLiveDone(true);
    }
  };

  const toggleRunDetail = async (runId: string) => {
    if (expandedRunId === runId) {
      setExpandedRunId(null);
      return;
    }
    setExpandedRunId(runId);
    if (!recipientsPorRun[runId]) {
      await dispatch(getRecipientsRunCampanaEmailAsync(runId));
    }
  };

  const handleRetryRun = async (runId: string) => {
    await conProgresoEnVivo(async () => {
      await dispatch(reintentarRunCampanaEmailAsync(runId));
      await dispatch(getRunsCampanaEmailAsync(undefined));
      await dispatch(getRecipientsRunCampanaEmailAsync(runId));
    });
  };

  const handleFinalizeRun = (runId: string) => {
    openModal({
      titulo: 'Finalizar envio',
      tipo: 'danger',
      mensaje: 'La corrida quedara finalizada y no se podran reintentar los envios restantes. Continuar?',
      confirmCallback: async () => {
        await dispatch(finalizarRunCampanaEmailAsync(runId));
        await dispatch(getRunsCampanaEmailAsync(undefined));
      },
    });
  };

  useEffect(() => {
    dispatch(getRunsCampanaEmailAsync(undefined));
  }, [dispatch]);

  const destinatariosPreview = useMemo(
    () => previewDestinatarios(draft.data.Filtros, usuarios, reparaciones),
    [draft.data.Filtros, usuarios, reparaciones]
  );

  const sortedCampanas = useMemo(
    () => [...campanas].sort((a, b) => a.data.NombreCampana.localeCompare(b.data.NombreCampana)),
    [campanas]
  );

  const updateFilters = (newFilters: Partial<EmailCampaignFilterDefinition>) => {
    setDraft((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        Filtros: {
          ...prev.data.Filtros,
          ...newFilters,
        },
      },
    }));
  };

  const handleSave = async () => {
    if (!draft.data.NombreCampana.trim()) {
      openModal({ titulo: 'Atencion', tipo: 'warning', mensaje: 'El nombre de la campana es obligatorio.' });
      return;
    }
    if (!draft.data.PlantillaId) {
      openModal({ titulo: 'Atencion', tipo: 'warning', mensaje: 'Debes seleccionar una plantilla.' });
      return;
    }

    await dispatch(guardarCampanaEmailAsync(draft));
    setDraft(emptyCampaign);
  };

  const handleDelete = (id: string) => {
    openModal({
      titulo: 'Eliminar campana',
      tipo: 'danger',
      mensaje: 'Se desactivara la campana y se mantendra el historial. Desea continuar?',
      confirmCallback: async () => {
        await dispatch(eliminarCampanaEmailAsync(id));
        if (draft.id === id) {
          setDraft(emptyCampaign);
        }
      },
    });
  };

  const handleRunNow = async (campaignId?: string) => {
    await conProgresoEnVivo(async () => {
      const result = await dispatch(ejecutarCampanasVencidasAsync(campaignId));
      if (result.meta.requestStatus === 'fulfilled') {
        await dispatch(getRunsCampanaEmailAsync(campaignId));
      }
    });
  };

  const handleEdit = async (campaign: EmailCampaign) => {
    setDraft(campaign);
    await dispatch(getRunsCampanaEmailAsync(campaign.id));
  };

  const frequencyOptions: { value: EmailCampaignFrequency; label: string }[] = [
    { value: 'once', label: 'Una vez' },
    { value: 'daily', label: 'Diaria' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
  ];

  return (
    <div className='d-flex flex-column' style={{ height: '100vh' }}>
      <div className='p-4 pb-2 bg-white border-bottom' style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <h3 className='mb-0'>Campanas de Email</h3>
      </div>

      <div className='flex-grow-1 overflow-auto'>
        <div className='p-4 pt-3'>
          <div className='card mb-3'>
            <div className='card-body'>
              <div className='mb-2'>
                <input
                  className='form-control'
                  placeholder='Buscar campana...'
                  value={filter}
                  onChange={(e) => dispatch(setFilterCampanasEmail(e.target.value))}
                />
              </div>
              <div className='mb-2'>
                <input
                  className='form-control'
                  placeholder='Nombre de campana'
                  value={draft.data.NombreCampana}
                  onChange={(e) => setDraft({
                    ...draft,
                    data: { ...draft.data, NombreCampana: e.target.value },
                  })}
                />
              </div>
              <div className='mb-2'>
                <label className='form-label'>Plantilla</label>
                <select
                  className='form-select'
                  value={draft.data.PlantillaId}
                  onChange={(e) => setDraft({
                    ...draft,
                    data: { ...draft.data, PlantillaId: e.target.value },
                  })}
                >
                  <option value=''>Seleccionar plantilla...</option>
                  {plantillas.map((p) => (
                    <option key={p.id} value={p.id}>{p.data.NombrePlantilla}</option>
                  ))}
                </select>
              </div>

              <div className='row g-2 mb-2'>
                <div className='col-md-4'>
                  <label className='form-label'>Frecuencia</label>
                  <select
                    className='form-select'
                    value={draft.data.Frecuencia}
                    onChange={(e) => setDraft({
                      ...draft,
                      data: { ...draft.data, Frecuencia: e.target.value as EmailCampaignFrequency },
                    })}
                  >
                    {frequencyOptions.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div className='col-md-3'>
                  <label className='form-label'>Cada</label>
                  <input
                    className='form-control'
                    type='number'
                    min={1}
                    value={draft.data.CadaCantidad}
                    onChange={(e) => setDraft({
                      ...draft,
                      data: { ...draft.data, CadaCantidad: Number(e.target.value) || 1 },
                    })}
                  />
                </div>
                <div className='col-md-5'>
                  <label className='form-label'>Proxima ejecucion</label>
                  <input
                    className='form-control'
                    type='datetime-local'
                    value={(draft.data.ProximaEjecucion || '').slice(0, 16)}
                    onChange={(e) => setDraft({
                      ...draft,
                      data: { ...draft.data, ProximaEjecucion: e.target.value ? new Date(e.target.value).toISOString() : null },
                    })}
                  />
                </div>
              </div>

              <div className='border rounded p-3 mb-3'>
                <h6>Filtros</h6>
                <div className='form-check mb-2'>
                  <input
                    id='filtro-todos'
                    type='checkbox'
                    className='form-check-input'
                    checked={Boolean(draft.data.Filtros.incluirTodosLosClientes)}
                    onChange={(e) => updateFilters({ incluirTodosLosClientes: e.target.checked })}
                  />
                  <label className='form-check-label' htmlFor='filtro-todos'>Incluir todos los clientes</label>
                </div>
                <div className='form-check mb-2'>
                  <input
                    id='filtro-email'
                    type='checkbox'
                    className='form-check-input'
                    checked={Boolean(draft.data.Filtros.soloConEmail)}
                    onChange={(e) => updateFilters({ soloConEmail: e.target.checked })}
                  />
                  <label className='form-check-label' htmlFor='filtro-email'>Solo clientes con email</label>
                </div>
                <div className='form-check mb-2'>
                  <input
                    id='filtro-no-pagaron'
                    type='checkbox'
                    className='form-check-input'
                    checked={Boolean(draft.data.Filtros.noPagaron)}
                    onChange={(e) => updateFilters({ noPagaron: e.target.checked })}
                  />
                  <label className='form-check-label' htmlFor='filtro-no-pagaron'>No pagaron (monto restante {'>'} 0)</label>
                </div>

                <div className='row g-2 mb-2'>
                  <div className='col-md-6'>
                    <label className='form-label'>Min dias desde consulta</label>
                    <input
                      className='form-control'
                      type='number'
                      min={0}
                      value={draft.data.Filtros.minDiasDesdeConsulta ?? ''}
                      onChange={(e) => updateFilters({
                        minDiasDesdeConsulta: e.target.value === '' ? null : Number(e.target.value),
                      })}
                    />
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label'>Min dias desde recepcion</label>
                    <input
                      className='form-control'
                      type='number'
                      min={0}
                      value={draft.data.Filtros.minDiasDesdeRecepcion ?? ''}
                      onChange={(e) => updateFilters({
                        minDiasDesdeRecepcion: e.target.value === '' ? null : Number(e.target.value),
                      })}
                    />
                  </div>
                </div>

                <label className='form-label'>Estados de reparacion</label>
                <div className='d-flex flex-wrap gap-2'>
                  {Object.entries(estados).map(([estadoKey, estadoData]) => {
                    const checked = Boolean(draft.data.Filtros.estadosReparacion?.includes(estadoKey));
                    return (
                      <label key={estadoKey} className='form-check-label border rounded px-2 py-1'>
                        <input
                          type='checkbox'
                          className='form-check-input me-1'
                          checked={checked}
                          onChange={(e) => {
                            const current = draft.data.Filtros.estadosReparacion || [];
                            const next = e.target.checked
                              ? [...current, estadoKey]
                              : current.filter((item) => item !== estadoKey);
                            updateFilters({ estadosReparacion: next });
                          }}
                        />
                        {estadoData.nombre || estadoKey}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className='alert alert-secondary py-2'>
                Destinatarios estimados ahora: <strong>{destinatariosPreview.length}</strong>
              </div>

              <div className='form-check mb-3'>
                <input
                  id='campana-activa'
                  type='checkbox'
                  className='form-check-input'
                  checked={draft.data.ActivaCampana}
                  onChange={(e) => setDraft({
                    ...draft,
                    data: { ...draft.data, ActivaCampana: e.target.checked },
                  })}
                />
                <label className='form-check-label' htmlFor='campana-activa'>Campana activa</label>
              </div>

              <div className='d-flex gap-2 flex-wrap'>
                <button className='btn bg-bluemcdron text-white' onClick={handleSave}>
                  {draft.id ? 'Guardar cambios' : 'Crear campana'}
                </button>
                {draft.id ? (
                  <button className='btn btn-outline-secondary' onClick={() => setDraft(emptyCampaign)}>
                    Cancelar edicion
                  </button>
                ) : null}
                <button className='btn btn-outline-success' onClick={() => handleRunNow(draft.id || undefined)}>
                  Ejecutar ahora
                </button>
                <button className='btn btn-outline-primary' onClick={() => handleRunNow(undefined)}>
                  Ejecutar todas las vencidas
                </button>
              </div>

              {resumen ? (
                <div className='mt-3 alert alert-light border'>
                  <strong>Ultima ejecucion:</strong>
                  <pre className='mb-0 mt-2 small'>{JSON.stringify(resumen, null, 2)}</pre>
                </div>
              ) : null}
            </div>
          </div>

          <div className='text-muted mb-2'>{sortedCampanas.length} campanas</div>
          {sortedCampanas.length === 0 ? (
            <div className='alert alert-info text-center'>No hay campanas cargadas.</div>
          ) : (
            <div className='entity-card-grid'>
              {sortedCampanas.map((campana) => (
                <div key={campana.id} className='card mb-3'>
                  <div className='card-body'>
                    <div className='d-flex justify-content-between align-items-start'>
                      <div>
                        <h5 className='mb-1'>{campana.data.NombreCampana}</h5>
                        <small className='text-muted'>
                          Frecuencia: {campana.data.Frecuencia} cada {campana.data.CadaCantidad}
                        </small>
                        <br />
                        <small className='text-muted'>
                          Proxima: {campana.data.ProximaEjecucion ? new Date(campana.data.ProximaEjecucion).toLocaleString() : '-'}
                        </small>
                      </div>
                      <span className={`badge ${campana.data.ActivaCampana ? 'bg-success' : 'bg-secondary'}`}>
                        {campana.data.ActivaCampana ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <div className='mt-3 d-flex gap-2 flex-wrap'>
                      <button className='btn btn-sm btn-outline-secondary' onClick={() => setViewing(campana)}>
                        Ver
                      </button>
                      <button className='btn btn-sm btn-outline-primary' onClick={() => handleEdit(campana)}>
                        Editar
                      </button>
                      <button className='btn btn-sm btn-outline-success' onClick={() => handleRunNow(campana.id)}>
                        Enviar ahora
                      </button>
                      <button className='btn btn-sm btn-outline-danger' onClick={() => handleDelete(campana.id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className='card mt-3'>
            <div className='card-body'>
              <h5 className='card-title'>Historial reciente</h5>
              {runs.length === 0 ? (
                <p className='text-muted mb-0'>No hay ejecuciones registradas para mostrar.</p>
              ) : (
                <div className='table-responsive'>
                  <table className='table table-sm table-striped mb-0'>
                    <thead>
                      <tr>
                        <th></th>
                        <th>Fecha</th>
                        <th>Campana</th>
                        <th>Plantilla</th>
                        <th>Estado</th>
                        <th>Destinatarios</th>
                        <th>Enviados</th>
                        <th>Fallidos</th>
                        <th>Pendientes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {runs.map((run) => {
                        const campana = campanasById[run.data.campaignId];
                        const plantilla = campana ? plantillasById[campana.data.PlantillaId] : undefined;
                        const expanded = expandedRunId === run.id;
                        const recipients = recipientsPorRun[run.id];
                        return (
                          <React.Fragment key={run.id}>
                            <tr style={{ cursor: 'pointer' }} onClick={() => toggleRunDetail(run.id)}>
                              <td>{expanded ? '▾' : '▸'}</td>
                              <td>{new Date(run.data.executedAt).toLocaleString()}</td>
                              <td>{campana?.data.NombreCampana || `#${run.data.campaignId}`}</td>
                              <td>{plantilla?.data.NombrePlantilla || '-'}</td>
                              <td>{run.data.status}</td>
                              <td>{run.data.totalRecipients}</td>
                              <td>{run.data.totalSent}</td>
                              <td>{run.data.totalFailed}</td>
                              <td>{Math.max(0, run.data.totalRecipients - run.data.totalSent - run.data.totalFailed)}</td>
                            </tr>
                            {expanded ? (
                              <tr>
                                <td colSpan={9} className='bg-light'>
                                  {(run.data.status === 'partial' || run.data.status === 'failed') ? (
                                    <div className='d-flex gap-2 mb-2'>
                                      <button
                                        className='btn btn-sm btn-outline-success'
                                        onClick={(e) => { e.stopPropagation(); handleRetryRun(run.id); }}
                                      >
                                        Reintentar pendientes/fallidos
                                      </button>
                                      <button
                                        className='btn btn-sm btn-outline-danger'
                                        onClick={(e) => { e.stopPropagation(); handleFinalizeRun(run.id); }}
                                      >
                                        Finalizar envio
                                      </button>
                                    </div>
                                  ) : null}
                                  {run.data.errorSummary ? (
                                    <div className='alert alert-warning py-2 small mb-2'>
                                      <strong>Resumen de error:</strong> {run.data.errorSummary}
                                    </div>
                                  ) : null}
                                  {!recipients ? (
                                    <span className='text-muted small'>Cargando destinatarios...</span>
                                  ) : recipients.length === 0 ? (
                                    <span className='text-muted small'>
                                      No hay detalle de destinatarios para esta ejecucion.
                                    </span>
                                  ) : (
                                    <table className='table table-sm mb-0 small'>
                                      <thead>
                                        <tr>
                                          <th>Email</th>
                                          <th>Estado</th>
                                          <th>Error</th>
                                          <th>Enviado</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {recipients.map((r) => (
                                          <tr key={r.id} className={r.data.status === 'failed' ? 'table-danger' : ''}>
                                            <td>{r.data.email}</td>
                                            <td>{r.data.status}</td>
                                            <td>{r.data.errorMessage || '-'}</td>
                                            <td>{r.data.sentAt ? new Date(r.data.sentAt).toLocaleString() : '-'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </td>
                              </tr>
                            ) : null}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {viewing ? (
        <div className='modal d-block' tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setViewing(null)}>
          <div className='modal-dialog modal-dialog-centered' onClick={(e) => e.stopPropagation()}>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>{viewing.data.NombreCampana}</h5>
                <button type='button' className='btn-close' onClick={() => setViewing(null)} />
              </div>
              <div className='modal-body'>
                <p className='mb-1'><strong>Plantilla:</strong> {plantillasById[viewing.data.PlantillaId]?.data.NombrePlantilla || '-'}</p>
                <p className='mb-1'><strong>Frecuencia:</strong> {viewing.data.Frecuencia} cada {viewing.data.CadaCantidad}</p>
                <p className='mb-1'><strong>Proxima ejecucion:</strong> {viewing.data.ProximaEjecucion ? new Date(viewing.data.ProximaEjecucion).toLocaleString() : '-'}</p>
                <p className='mb-1'><strong>Ultima ejecucion:</strong> {viewing.data.UltimaEjecucion ? new Date(viewing.data.UltimaEjecucion).toLocaleString() : '-'}</p>
                <p className='mb-1'><strong>Estado:</strong> {viewing.data.ActivaCampana ? 'Activa' : 'Inactiva'}</p>
                <hr />
                <p className='mb-1'><strong>Filtros:</strong></p>
                <ul className='mb-0 small'>
                  <li>Todos los clientes: {viewing.data.Filtros.incluirTodosLosClientes ? 'Si' : 'No'}</li>
                  <li>Solo con email: {viewing.data.Filtros.soloConEmail ? 'Si' : 'No'}</li>
                  <li>No pagaron: {viewing.data.Filtros.noPagaron ? 'Si' : 'No'}</li>
                  <li>Estados: {viewing.data.Filtros.estadosReparacion?.length ? viewing.data.Filtros.estadosReparacion.join(', ') : '-'}</li>
                  <li>Min. dias desde consulta: {viewing.data.Filtros.minDiasDesdeConsulta ?? '-'}</li>
                  <li>Min. dias desde recepcion: {viewing.data.Filtros.minDiasDesdeRecepcion ?? '-'}</li>
                </ul>
              </div>
              <div className='modal-footer'>
                <button className='btn btn-secondary' onClick={() => setViewing(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {liveEvents !== null ? (
        <div className='modal d-block' tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className='modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>
                  {liveDone ? 'Envio finalizado' : 'Enviando emails...'}
                </h5>
                {liveDone ? (
                  <button type='button' className='btn-close' onClick={() => setLiveEvents(null)} />
                ) : (
                  <div className='spinner-border spinner-border-sm text-primary' role='status' />
                )}
              </div>
              <div className='modal-body'>
                <div className='mb-2'>
                  <span className='badge bg-success me-2'>
                    Enviados: {liveEvents.filter((e) => e.data.status === 'sent').length}
                  </span>
                  <span className='badge bg-danger me-2'>
                    Fallidos: {liveEvents.filter((e) => e.data.status === 'failed').length}
                  </span>
                  <span className='badge bg-secondary'>
                    Pendientes: {liveEvents.filter((e) => e.data.status === 'pending').length}
                  </span>
                </div>
                {liveEvents.length === 0 ? (
                  <p className='text-muted mb-0'>Esperando el primer envio...</p>
                ) : (
                  <table className='table table-sm small mb-0'>
                    <tbody>
                      {[...liveEvents].reverse().map((e) => (
                        <tr key={e.id} className={e.data.status === 'failed' ? 'table-danger' : e.data.status === 'sent' ? 'table-success' : ''}>
                          <td>{e.data.email}</td>
                          <td>{e.data.status}</td>
                          <td className='text-truncate' style={{ maxWidth: 300 }}>{e.data.errorMessage || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {liveDone ? (
                <div className='modal-footer'>
                  <button className='btn btn-secondary' onClick={() => setLiveEvents(null)}>Cerrar</button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
