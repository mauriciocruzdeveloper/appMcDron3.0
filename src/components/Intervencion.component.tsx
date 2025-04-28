import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import history from '../history';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { Intervencion } from '../types/intervencion';
import { guardarIntervencionAsync, eliminarIntervencionAsync, getIntervencionAsync } from '../redux-tool-kit/intervencion/intervencion.actions';
import { useModal } from './Modal/useModal';
import Select from 'react-select';

interface ParamTypes {
  id: string;
}

export default function IntervencionComponent(): JSX.Element {
  const dispatch = useAppDispatch();
  const { openModal } = useModal();
  const { id } = useParams<ParamTypes>();
  
  const isNew = id === 'new';
  const intervencionActual = useAppSelector(state => 
    state.intervencion.coleccionIntervenciones.find(intervencion => intervencion.id === id)
  );
  
  const modelosDrone = useAppSelector(state => state.modeloDrone.coleccionModelosDrone);
  const repuestos = useAppSelector(state => state.repuesto.coleccionRepuestos);
  
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
  
  useEffect(() => {
    if (!isNew && id) {
      if (intervencionActual) {
        setIntervencion(intervencionActual);
        
        // Configurar los repuestos seleccionados
        if (intervencionActual.data.RepuestosIds?.length) {
          const repuestosSeleccionados = intervencionActual.data.RepuestosIds
            .map(repId => {
              const rep = repuestos.find(r => r.id === repId);
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
          
          setSelectedRepuestos(repuestosSeleccionados as any);
        }
      } else {
        dispatch(getIntervencionAsync(id));
      }
    }
  }, [dispatch, id, isNew, intervencionActual, repuestos]);

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
  };

  const handleRepuestosChange = (selected: any) => {
    setSelectedRepuestos(selected || []);
    
    // Actualizar los IDs de repuestos en el objeto de intervención
    const repuestosIds = selected ? selected.map((item: any) => item.value) : [];
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
        if (isNew && response.payload?.id) {
          history.replace(`/inicio/intervenciones/${response.payload.id}`);
        }
      } else {
        openModal({
          mensaje: "Error al guardar la intervención.",
          tipo: "danger",
          titulo: "Error",
        });
      }
    } catch (error) {
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
      const response = await dispatch(eliminarIntervencionAsync(intervencion.id)).unwrap();
      
      openModal({
        mensaje: "Intervención eliminada correctamente.",
        tipo: "success",
        titulo: "Eliminar Intervención",
      });
      history.goBack();
    } catch (error: any) { // TODO: Hacer tipo de dato para el error
      console.error("Error al eliminar la intervención:", error);
      
      openModal({
        mensaje: error?.code || "Error al eliminar la intervención.",
        tipo: "danger",
        titulo: "Error",
      });
    }
  };
  
  // Opciones para el selector de repuestos
  const repuestosOptions = repuestos.map(repuesto => ({
    value: repuesto.id,
    label: `${repuesto.data.NombreRepu} - ${repuesto.data.PrecioRepu?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '$0'}`,
    precio: repuesto.data.PrecioRepu || 0
  }));

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
              {modelosDrone.map((modelo) => (
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
              options={repuestosOptions}
              value={selectedRepuestos}
              onChange={handleRepuestosChange}
              placeholder="Seleccione los repuestos..."
              noOptionsMessage={() => "No se encontraron repuestos"}
            />
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
