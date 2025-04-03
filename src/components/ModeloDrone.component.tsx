import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import history from '../history';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { ModeloDrone } from '../types/modeloDrone';
import { guardarModeloDroneAsync, eliminarModeloDroneAsync, getModeloDroneAsync } from '../redux-tool-kit/modeloDrone/modeloDrone.actions';
import { useModal } from './Modal/useModal';

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

  const [modeloDrone, setModeloDrone] = useState<ModeloDrone>({
    id: '',
    data: {
      NombreModelo: '',
      Fabricante: '',
      DescripcionModelo: '',
      EspecificacionesTecnicas: '',
      PrecioReferencia: 0,
      AnioLanzamiento: new Date().getFullYear(),
      Estado: 'Disponible'
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

  const changeInput = (field: string, value: any) => {
    setModeloDrone(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        [field]: field === 'PrecioReferencia' || field === 'AnioLanzamiento' 
          ? Number(value) 
          : value
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
      const response = await dispatch(eliminarModeloDroneAsync(modeloDrone.id));
      
      if (response.meta.requestStatus === 'fulfilled') {
        openModal({
          mensaje: "Modelo de drone eliminado correctamente.",
          tipo: "success",
          titulo: "Eliminar Modelo de Drone",
        });
        history.goBack();
      } else {
        const error = response.payload as any;
        openModal({
          mensaje: error?.code || "Error al eliminar el modelo de drone.",
          tipo: "danger",
          titulo: "Error",
        });
      }
    } catch (error) {
      console.error("Error al eliminar el modelo de drone:", error);
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
              value={modeloDrone.data.NombreModelo}
              onChange={(e) => changeInput('NombreModelo', e.target.value)}
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Fabricante</label>
            <input
              type="text"
              className="form-control"
              value={modeloDrone.data.Fabricante}
              onChange={(e) => changeInput('Fabricante', e.target.value)}
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-control"
              value={modeloDrone.data.DescripcionModelo}
              onChange={(e) => changeInput('DescripcionModelo', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Especificaciones Técnicas</label>
            <textarea
              className="form-control"
              value={modeloDrone.data.EspecificacionesTecnicas}
              onChange={(e) => changeInput('EspecificacionesTecnicas', e.target.value)}
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
                value={modeloDrone.data.PrecioReferencia}
                onChange={(e) => changeInput('PrecioReferencia', e.target.value)}
                min="0"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Año de Lanzamiento</label>
            <input
              type="number"
              className="form-control"
              value={modeloDrone.data.AnioLanzamiento}
              onChange={(e) => changeInput('AnioLanzamiento', e.target.value)}
              min="2000"
              max={new Date().getFullYear()}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Estado</label>
            <select
              className="form-select"
              value={modeloDrone.data.Estado}
              onChange={(e) => changeInput('Estado', e.target.value)}
            >
              <option value="Disponible">Disponible</option>
              <option value="Descontinuado">Descontinuado</option>
              <option value="Próximamente">Próximamente</option>
            </select>
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
