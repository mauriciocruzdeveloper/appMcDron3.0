import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from '../hooks/useHistory';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { Intervencion } from '../types/intervencion';
import { guardarIntervencionAsync, eliminarIntervencionAsync, getIntervencionAsync } from '../redux-tool-kit/intervencion/intervencion.actions';
import { useModal } from './Modal/useModal';
import Select from 'react-select';
import { selectModelosDroneArray } from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';
import { selectColeccionRepuestos, selectRepuestosArray } from '../redux-tool-kit/repuesto/repuesto.selectors';
import { selectIntervencionPorId } from '../redux-tool-kit/intervencion/intervencion.selectors';

interface ParamTypes extends Record<string, string | undefined> {
  id: string;
}

export default function IntervencionComponent(): JSX.Element {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { openModal } = useModal();
  const { id } = useParams<ParamTypes>();
  
  const isNew = id === 'new';
  const intervencionActual = useAppSelector(state => 
    selectIntervencionPorId(state, id || '')
  );
  
  const modelosDroneArray = useAppSelector(selectModelosDroneArray);
  const repuestos = useAppSelector(selectColeccionRepuestos);
  const repuestosArray = useAppSelector(selectRepuestosArray);
  
  const [intervencion, setIntervencion] = useState<Intervencion>({
    id: '',
    data: {
      NombreInt: '',
      DescripcionInt: '',
      ModeloDroneId: '',
      RepuestosIds: [],
      PrecioManoObra: 0,
      PrecioTotal: 0,
      DuracionEstimada: 30
    }
  });

  // Para el selector múltiple de repuestos
  const [selectedRepuestos, setSelectedRepuestos] = useState<{value: string, label: string, precio: number}[]>([]);
  
  // Estado para almacenar los repuestos filtrados por modelo
  const [repuestosFiltrados, setRepuestosFiltrados] = useState<{value: string, label: string, precio: number}[]>([]);
  
  useEffect(() => {
    if (!isNew && id) {
      if (intervencionActual) {
        setIntervencion(intervencionActual);
        
        // Configurar los repuestos seleccionados
        if (intervencionActual.data.RepuestosIds?.length) {
          const repuestosSeleccionados = intervencionActual.data.RepuestosIds
            .map(repId => {
              const rep = repuestos[repId]; // Acceso directo al diccionario
              if (rep) {
                return {
                  value: rep.id,
                  label: rep.data.NombreRepu,
                  precio: rep.data.PrecioRepu || 0
                };
              }
              return null;
            })
            .filter(Boolean);
          
          setSelectedRepuestos(repuestosSeleccionados as {value: string, label: string, precio: number}[]);
        }
      } else {
        dispatch(getIntervencionAsync(id));
      }
    }
  }, [dispatch, id, isNew, intervencionActual, repuestos]);

  // Filtrar repuestos cuando cambia el modelo de drone seleccionado
  useEffect(() => {
    // Si hay un modelo seleccionado, filtrar repuestos compatibles
    if (intervencion.data.ModeloDroneId) {
      const compatibles = repuestosArray.filter(repuesto =>
        // El repuesto es compatible si el modelo está en ModelosDroneIds
        repuesto.data.ModelosDroneIds.includes(intervencion.data.ModeloDroneId as string)
        // O si es universal (puedes definir la lógica, aquí: si ModelosDroneIds está vacío)
        || repuesto.data.ModelosDroneIds.length === 0
      );
      
      const options = compatibles.map(repuesto => ({
        value: repuesto.id,
        label: `${repuesto.data.NombreRepu} - ${repuesto.data.PrecioRepu?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '$0'}`,
        precio: repuesto.data.PrecioRepu || 0
      }));
      
      setRepuestosFiltrados(options);
      
      // Si hay repuestos seleccionados que ya no son compatibles, eliminarlos
      const repuestosCompatiblesIds = compatibles.map(r => r.id);
      const repuestosSeleccionadosCompatibles = selectedRepuestos.filter(
        selected => repuestosCompatiblesIds.includes(selected.value)
      );
      
      if (repuestosSeleccionadosCompatibles.length !== selectedRepuestos.length) {
        setSelectedRepuestos(repuestosSeleccionadosCompatibles);
        
        // Actualizar también los IDs en el objeto de intervención
        const nuevosIds = repuestosSeleccionadosCompatibles.map(r => r.value);
        setIntervencion(prev => ({
          ...prev,
          data: {
            ...prev.data,
            RepuestosIds: nuevosIds
          }
        }));
      }
    } else {
      // Si no hay modelo seleccionado, mostrar todos los repuestos
      const options = repuestosArray.map(repuesto => ({
        value: repuesto.id,
        label: `${repuesto.data.NombreRepu} - ${repuesto.data.PrecioRepu?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '$0'}`,
        precio: repuesto.data.PrecioRepu || 0
      }));
      
      setRepuestosFiltrados(options);
    }
  }, [intervencion.data.ModeloDroneId, repuestosArray, selectedRepuestos]);

  // Actualizar el precio total cuando cambian los valores
  useEffect(() => {
    // Calcular el precio total sumando mano de obra + repuestos
    const precioRepuestos = selectedRepuestos.reduce((total, rep) => total + rep.precio, 0);
    const precioTotal = intervencion.data.PrecioManoObra + precioRepuestos;
    
    setIntervencion(prev => ({
      ...prev,
      data: {
        ...prev.data,
        PrecioTotal: precioTotal
      }
    }));
  }, [intervencion.data.PrecioManoObra, selectedRepuestos]);
  
  // Manejador para campos de texto comunes
  const handleTextInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setIntervencion(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        [id]: value
      }
    }));
  };

  // Manejador específico para campos numéricos
  const handleNumberInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numValue = value === '' ? 0 : Number(value);
    
    setIntervencion(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        [id]: numValue
      }
    }));
  };

  // Manejador para los selects
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setIntervencion(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        [id]: value
      }
    }));
    
    // Si estamos cambiando el modelo, los repuestos se actualizarán en el useEffect
  };

  const handleRepuestosChange = (selected: readonly {value: string, label: string, precio: number}[] | null) => {
    const selectedArray = selected ? [...selected] : [];
    setSelectedRepuestos(selectedArray);
    
    // Actualizar los IDs de repuestos en el objeto de intervención
    const repuestosIds = selectedArray.map(item => item.value);
    setIntervencion(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        RepuestosIds: repuestosIds
      }
    }));
  };

  const handleGuardarIntervencion = async () => {
    openModal({
      mensaje: "¿Desea guardar esta intervención?",
      tipo: "warning",
      titulo: "Guardar Intervención",
      confirmCallback: confirmaGuardarIntervencion,
    });
  };

  const confirmaGuardarIntervencion = async () => {
    try {
      const response = await dispatch(guardarIntervencionAsync(intervencion));
      
      if (response.meta.requestStatus === 'fulfilled') {
        openModal({
          mensaje: "Intervención guardada correctamente.",
          tipo: "success",
          titulo: "Guardar Intervención",
        });
        // Si estamos creando una nueva intervención, actualizar la URL con el ID real
        if (isNew && (response.payload as Intervencion)?.id) {
          history.replace(`/inicio/intervenciones/${(response.payload as Intervencion).id}`);
        }
      } else if (response.meta.requestStatus === 'rejected') {
        // Mostrar mensaje de error específico si está disponible
        const resp = response as { error: { message: string } };
        openModal({
          mensaje: "Error al guardar la intervención: " + (resp.error?.message || "Error desconocido."),
          tipo: "danger",
          titulo: "Error",
        });
      }
    } catch (error) {
      openModal({
        mensaje: "Error al guardar la intervención: " + error,
        tipo: "danger",
        titulo: "Error",
      });
      console.error("Error al guardar la intervención:", error);
    }
  };

  const handleEliminarIntervencion = () => {
    openModal({
      mensaje: "¿Está seguro de que desea eliminar esta intervención?",
      tipo: "danger",
      titulo: "Eliminar Intervención",
      confirmCallback: confirmaEliminarIntervencion,
    });
  };

  const confirmaEliminarIntervencion = async () => {
    try {
      await dispatch(eliminarIntervencionAsync(intervencion.id)).unwrap();
      
      openModal({
        mensaje: "Intervención eliminada correctamente.",
        tipo: "success",
        titulo: "Eliminar Intervención",
      });
      history.goBack();
    } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
      console.error("Error al eliminar la intervención:", error);
      
      openModal({
        mensaje: (error as { code?: string })?.code || "Error al eliminar la intervención.",
        tipo: "danger",
        titulo: "Error",
      });
    }
  };
  
  const formatPrice = (precio: number): string => {
    return precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
  };

  return (
    <div className="p-4">
      <div className="card mb-3 bg-bluemcdron">
        <div className="card-body">
          <h3 className="card-title text-light p-0 m-0">
            {isNew ? "NUEVA INTERVENCIÓN" : "EDITAR INTERVENCIÓN"}
          </h3>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title bluemcdron">DATOS DE LA INTERVENCIÓN</h5>
          
          <div className="mb-3">
            <label className="form-label">Nombre de la Intervención</label>
            <input
              type="text"
              className="form-control"
              id="NombreInt"
              value={intervencion.data.NombreInt}
              onChange={handleTextInputChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-control"
              id="DescripcionInt"
              value={intervencion.data.DescripcionInt}
              onChange={handleTextInputChange}
              rows={3}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Modelo de Drone (opcional)</label>
            <select
              className="form-select"
              id="ModeloDroneId"
              value={intervencion.data.ModeloDroneId || ''}
              onChange={handleSelectChange}
            >
              <option value="">General (compatible con cualquier modelo)</option>
              {modelosDroneArray.map((modelo) => (
                <option key={modelo.id} value={modelo.id}>
                  {modelo.data.NombreModelo} - {modelo.data.Fabricante}
                </option>
              ))}
            </select>
            <small className="form-text text-muted">
              Deje en blanco para intervenciones generales que aplican a cualquier modelo
            </small>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Repuestos Necesarios</label>
            <Select
              isMulti
              options={repuestosFiltrados} // Usar los repuestos filtrados aquí en lugar de repuestosOptions
              value={selectedRepuestos}
              onChange={handleRepuestosChange}
              placeholder="Seleccione los repuestos..."
              noOptionsMessage={() => intervencion.data.ModeloDroneId 
                ? "No hay repuestos compatibles con este modelo" 
                : "No se encontraron repuestos"}
            />
            {intervencion.data.ModeloDroneId && repuestosFiltrados.length === 0 && (
              <div className="alert alert-warning mt-2">
                No hay repuestos registrados para este modelo de drone.
              </div>
            )}
            {intervencion.data.ModeloDroneId && (
              <small className="form-text text-muted">
                Solo se muestran repuestos compatibles con el modelo seleccionado y repuestos universales.
              </small>
            )}
          </div>
          
          <div className="mb-3">
            <label className="form-label">Precio Mano de Obra</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                className="form-control"
                id="PrecioManoObra"
                value={intervencion.data.PrecioManoObra || ''}
                onChange={handleNumberInputChange}
                step="any"
              />
            </div>
            <small className="form-text text-muted">
              Puede ingresar valores negativos para representar descuentos o ajustes
            </small>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Duración Estimada (minutos)</label>
            <input
              type="number"
              className="form-control"
              id="DuracionEstimada"
              value={intervencion.data.DuracionEstimada || ''}
              onChange={handleNumberInputChange}
              min="1"
            />
          </div>
          
          <div className="mt-4 card bg-light">
            <div className="card-body">
              <h6 className="card-title">Resumen</h6>
              <div className="row">
                <div className="col">
                  <div className="mb-2">Precio mano de obra:</div>
                  <div className="mb-2">
                    Precio repuestos:
                    <ul className="list-unstyled ms-3 mt-1">
                      {selectedRepuestos.map((rep, idx) => (
                        <li key={idx}>- {rep.label.split(' - ')[0]}: {formatPrice(rep.precio)}</li>
                      ))}
                      {selectedRepuestos.length === 0 && <li className="text-muted">No hay repuestos seleccionados</li>}
                    </ul>
                  </div>
                  <div className="fw-bold">Total:</div>
                </div>
                <div className="col-auto text-end">
                  <div className="mb-2">{formatPrice(intervencion.data.PrecioManoObra)}</div>
                  <div className="mb-2">{formatPrice(intervencion.data.PrecioTotal - intervencion.data.PrecioManoObra)}</div>
                  <div className="fw-bold">{formatPrice(intervencion.data.PrecioTotal)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={handleGuardarIntervencion}
          className="w-100 mb-3 btn bg-bluemcdron text-white"
        >
          Guardar
        </button>
        
        {!isNew && (
          <button
            onClick={handleEliminarIntervencion}
            className="w-100 btn bg-danger text-white"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
