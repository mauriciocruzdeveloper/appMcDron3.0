import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import history from '../history';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { Drone } from '../types/drone';
import { guardarDroneAsync, eliminarDroneAsync, getDroneAsync } from '../redux-tool-kit/drone/drone.actions';
import { useModal } from './Modal/useModal';
import Select from 'react-select';

interface ParamTypes {
  id: string;
}

export default function DroneComponent(): JSX.Element {
  const dispatch = useAppDispatch();
  const { openModal } = useModal();
  const { id } = useParams<ParamTypes>();
  
  const isNew = id === 'new';
  const droneActual = useAppSelector(state => 
    state.drone.coleccionDrones.find(drone => drone.id === id)
  );
  
  const modelosDrone = useAppSelector(state => state.modeloDrone.coleccionModelosDrone);
  const usuarios = useAppSelector(state => state.usuario.coleccionUsuarios);
  const usuariosSelect = useAppSelector(state => state.usuario.usuariosSelect);

  const [drone, setDrone] = useState<Drone>({
    id: '',
    data: {
      NumeroSerie: '',
      ModeloDroneId: '',
      Propietario: '',
      Observaciones: ''
    }
  });

  const [propietarioValue, setPropietarioValue] = useState<{value: string, label: string} | null>(null);

  useEffect(() => {
    if (!isNew && id) {
      if (droneActual) {
        setDrone(droneActual);
        // Si el propietario existe, configuramos el valor para el selector
        if (droneActual.data.Propietario) {
          const propietario = usuarios.find(u => u.id === droneActual.data.Propietario || 
                                          u.data.EmailUsu === droneActual.data.Propietario);
          if (propietario) {
            const email = propietario.data.EmailUsu || propietario.id;
            setPropietarioValue({ value: email, label: email });
          }
        }
      } else {
        dispatch(getDroneAsync(id));
      }
    }
  }, [dispatch, id, isNew, droneActual, usuarios]);

  const changeInput = (field: string, value: any) => {
    setDrone(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        [field]: value
      }
    }));
  };

  const handleUsuarioChange = (selectedOption: any) => {
    if (selectedOption) {
      setPropietarioValue(selectedOption);
      changeInput('Propietario', selectedOption.value);
    }
  };

  const handleGuardarDrone = async () => {
    openModal({
      mensaje: "¿Desea guardar este drone?",
      tipo: "warning",
      titulo: "Guardar Drone",
      confirmCallback: confirmaGuardarDrone,
    });
  };

  const confirmaGuardarDrone = async () => {
    try {
      const response = await dispatch(guardarDroneAsync(drone));
      
      if (response.meta.requestStatus === 'fulfilled') {
        openModal({
          mensaje: "Drone guardado correctamente.",
          tipo: "success",
          titulo: "Guardar Drone",
        });
        
        // Si estamos creando un nuevo drone, actualizar la URL con el ID real
        if (isNew && response.payload?.id) {
          history.replace(`/inicio/drones/${response.payload.id}`);
        }
      } else {
        openModal({
          mensaje: "Error al guardar el drone.",
          tipo: "danger",
          titulo: "Error",
        });
      }
    } catch (error) {
      console.error("Error al guardar el drone:", error);
    }
  };

  const handleEliminarDrone = () => {
    openModal({
      mensaje: "¿Está seguro de que desea eliminar este drone?",
      tipo: "danger",
      titulo: "Eliminar Drone",
      confirmCallback: confirmaEliminarDrone,
    });
  };

  const confirmaEliminarDrone = async () => {
    try {
      const response = await dispatch(eliminarDroneAsync(drone.id)).unwrap();
      
      openModal({
        mensaje: "Drone eliminado correctamente.",
        tipo: "success",
        titulo: "Eliminar Drone",
      });
      history.goBack();
    } catch (error: any) { // TODO: Hacer tipo de dato para el error
      console.error("Error al eliminar el drone:", error);
      
      openModal({
        mensaje: error?.code || "Error al eliminar el drone.",
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
            {isNew ? "NUEVO DRONE" : "EDITAR DRONE"}
          </h3>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title bluemcdron">DATOS DEL DRONE</h5>
          
          <div className="mb-3">
            <label className="form-label">Número de Serie</label>
            <input
              type="text"
              className="form-control"
              value={drone.data.NumeroSerie}
              onChange={(e) => changeInput('NumeroSerie', e.target.value)}
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Modelo de Drone</label>
            <select
              className="form-select"
              value={drone.data.ModeloDroneId}
              onChange={(e) => changeInput('ModeloDroneId', e.target.value)}
              required
            >
              <option value="">Seleccione un modelo...</option>
              {modelosDrone.map((modelo) => (
                <option key={modelo.id} value={modelo.id}>
                  {modelo.data.NombreModelo} - {modelo.data.Fabricante}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Propietario</label>
            <Select
              options={usuariosSelect}
              noOptionsMessage={() => "No se encontraron usuarios"}
              onChange={handleUsuarioChange}
              value={propietarioValue}
              placeholder="Seleccione un propietario..."
              isClearable
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Observaciones</label>
            <textarea
              className="form-control"
              value={drone.data.Observaciones || ''}
              onChange={(e) => changeInput('Observaciones', e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={handleGuardarDrone}
          className="w-100 mb-3 btn bg-bluemcdron text-white"
        >
          Guardar
        </button>
        
        {!isNew && (
          <button
            onClick={handleEliminarDrone}
            className="w-100 btn bg-danger text-white"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
