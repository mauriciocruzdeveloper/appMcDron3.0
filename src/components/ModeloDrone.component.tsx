import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import history from '../history';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { ModeloDrone } from '../types/modeloDrone';
import { guardarModeloDroneAsync, eliminarModeloDroneAsync, getModeloDroneAsync } from '../redux-tool-kit/modeloDrone/modeloDrone.actions';
import { useModal } from './Modal/useModal';
import { InputType, SelectType } from '../types/types';

interface ParamTypes {
  id: string;
}

export default function ModeloDroneComponent(): JSX.Element {
  const dispatch = useAppDispatch();
  const { openModal } = useModal();
  const { id } = useParams<ParamTypes>();
  
  const isNew = id === 'new';
  const modeloDroneActual = useAppSelector(state => 
    state.modeloDrone.coleccionModelosDrone.find(modelo => modelo.id === id)
  );

  // Estado para el modelo de drone
  const [modeloDrone, setModeloDrone] = useState<ModeloDrone>({
    id: '',
    data: {
      NombreModelo: '',
      Fabricante: '',
      DescripcionModelo: '',
      PrecioReferencia: 0
    }
  });

  useEffect(() => {
    if (!isNew && id) {
      if (modeloDroneActual) {
        setModeloDrone(modeloDroneActual);
      } else {
        dispatch(getModeloDroneAsync(id));
      }
    }
  }, [dispatch, id, isNew, modeloDroneActual]);

  // Manejador para campos de texto comunes
  const handleTextInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setModeloDrone(prevState => ({
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
    
    setModeloDrone(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        [id]: numValue
      }
    }));
  };

  const handleGuardarModeloDrone = async () => {
    openModal({
      mensaje: "¿Desea guardar este modelo de drone?",
      tipo: "warning",
      titulo: "Guardar Modelo de Drone",
      confirmCallback: confirmaGuardarModeloDrone,
    });
  };

  const confirmaGuardarModeloDrone = async () => {
    try {
      const response = await dispatch(guardarModeloDroneAsync(modeloDrone));
      
      if (response.meta.requestStatus === 'fulfilled') {
        openModal({
          mensaje: "Modelo de drone guardado correctamente.",
          tipo: "success",
          titulo: "Guardar Modelo de Drone",
        });
        
        // Si estamos creando un nuevo modelo, actualizar la URL con el ID real
        if (isNew && response.payload?.id) {
          history.replace(`/inicio/modelos-drone/${response.payload.id}`);
        }
      } else {
        openModal({
          mensaje: "Error al guardar el modelo de drone.",
          tipo: "danger",
          titulo: "Error",
        });
      }
    } catch (error) {
      console.error("Error al guardar el modelo de drone:", error);
    }
  };

  const handleEliminarModeloDrone = () => {
    openModal({
      mensaje: "¿Está seguro de que desea eliminar este modelo de drone?",
      tipo: "danger",
      titulo: "Eliminar Modelo de Drone",
      confirmCallback: confirmaEliminarModeloDrone,
    });
  };

  const confirmaEliminarModeloDrone = async () => {
    try {
        const response = await dispatch(eliminarModeloDroneAsync(modeloDrone.id)).unwrap();

        openModal({
            mensaje: "Modelo de drone eliminado correctamente.",
            tipo: "success",
            titulo: "Eliminar Modelo de Drone",
        });
        history.goBack();
    } catch (error: any) { // TODO: Hacer tipo de dato para el error
        console.error("Error al eliminar el modelo de drone:", error);

        openModal({
            mensaje: error?.code || "Error al eliminar el modelo de drone.",
            tipo: "danger",
            titulo: "Error",
        });
    }
  };

  return (
    <div className="p-4">
      <div className="card mb-3 bg-bluemcdron">
        <div className="card-body">
          <h3 className="card-title text-light p-0 m-0">
            {isNew ? "NUEVO MODELO DE DRONE" : "EDITAR MODELO DE DRONE"}
          </h3>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title bluemcdron">DATOS DEL MODELO</h5>
          
          <div className="mb-3">
            <label className="form-label">Nombre del Modelo</label>
            <input
              type="text"
              className="form-control"
              id="NombreModelo"
              value={modeloDrone.data.NombreModelo}
              onChange={handleTextInputChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Fabricante</label>
            <input
              type="text"
              className="form-control"
              id="Fabricante"
              value={modeloDrone.data.Fabricante}
              onChange={handleTextInputChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-control"
              id="DescripcionModelo"
              value={modeloDrone.data.DescripcionModelo}
              onChange={handleTextInputChange}
              rows={3}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Precio de Referencia</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                className="form-control"
                id="PrecioReferencia"
                value={modeloDrone.data.PrecioReferencia || ''}
                onChange={handleNumberInputChange}
                min="0"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={handleGuardarModeloDrone}
          className="w-100 mb-3 btn bg-bluemcdron text-white"
        >
          Guardar
        </button>
        
        {!isNew && (
          <button
            onClick={handleEliminarModeloDrone}
            className="w-100 btn bg-danger text-white"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
