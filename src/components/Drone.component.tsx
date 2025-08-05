import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from '../hooks/useHistory';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { Drone } from '../types/drone';
import { guardarDroneAsync, eliminarDroneAsync, getDroneAsync } from '../redux-tool-kit/drone/drone.actions';
import { useModal } from './Modal/useModal';
import Select from 'react-select';
import { selectModelosDroneArray } from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';
import { selectUsuarioPorId } from '../redux-tool-kit/usuario/usuario.selectors';
import { selectDroneById, selectDronesArray } from '../redux-tool-kit/drone';

interface ParamTypes extends Record<string, string | undefined> {
  id: string;
}

export default function DroneComponent(): JSX.Element {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { openModal } = useModal();
  const { id } = useParams<ParamTypes>();
  
  const isNew = id === 'new';
  // Usar selector optimizado O(1) en lugar de .find() O(n)
  const droneActual = useAppSelector(selectDroneById(id || ''));
  
  const modelosDrone = useAppSelector(selectModelosDroneArray);
  const usuariosSelect = useAppSelector(state => state.usuario.usuariosSelect);
  const propietarioActual = useAppSelector(state => 
    droneActual?.data.Propietario ? selectUsuarioPorId(state, droneActual.data.Propietario) : null
  );

  const [drone, setDrone] = useState<Drone>({
    id: '',
    data: {
      ModeloDroneId: '',
      Propietario: '',
      Observaciones: '',
      Nombre: '',
      NumeroSerie: ''
    }
  });

  const [propietarioValue, setPropietarioValue] = useState<{value: string, label: string} | null>(null);

  // Obtener usuario completo para generar nombre
  const usuarioCompleto = useAppSelector(state => 
    drone.data.Propietario ? selectUsuarioPorId(state, drone.data.Propietario) : null
  );
  
  // Obtener todos los drones para verificar nombres duplicados
  const todosDrones = useAppSelector(selectDronesArray);
  
  // Función para generar nombre único
  const generarNombreUnico = (nombreBase: string) => {
    const nombresExistentes = todosDrones
      .filter(d => d.id !== drone.id) // Excluir el drone actual
      .map(d => d.data.Nombre);
    
    let nombreFinal = nombreBase;
    let contador = 1;
    
    while (nombresExistentes.includes(nombreFinal)) {
      contador++;
      nombreFinal = `${nombreBase} ${contador}`;
    }
    
    return nombreFinal;
  };

  // Effect para generar nombre automático cuando cambien modelo o propietario
  useEffect(() => {
    if (drone.data.ModeloDroneId && drone.data.Propietario) {
      const modelo = modelosDrone.find(m => m.id === drone.data.ModeloDroneId);
      
      if (modelo && usuarioCompleto?.data) {
        const nombreCompleto = `${usuarioCompleto.data.NombreUsu || ''} ${usuarioCompleto.data.ApellidoUsu || ''}`.trim();
        const nombreBase = `${modelo.data.NombreModelo} - ${nombreCompleto}`;
        const nombreUnico = generarNombreUnico(nombreBase);
        changeInput('Nombre', nombreUnico);
      }
    }
  }, [drone.data.ModeloDroneId, drone.data.Propietario, usuarioCompleto, modelosDrone, todosDrones]);

  useEffect(() => {
    if (!isNew && id) {
      if (droneActual) {
        setDrone(droneActual);
        // Si el propietario existe, configuramos el valor para el selector
        if (droneActual.data.Propietario && propietarioActual) {
          setPropietarioValue({ value: propietarioActual.id, label: propietarioActual.data.EmailUsu ?? '' });
        }
      } else {
        dispatch(getDroneAsync(id));
      }
    }
  }, [dispatch, id, isNew, droneActual, propietarioActual]);

  const changeInput = (field: string, value: string) => {
    setDrone(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        [field]: value
      }
    }));
  };

  const handleModeloChange = (modeloId: string) => {
    changeInput('ModeloDroneId', modeloId);
  };

  const handleUsuarioChange = (selectedOption: { value: string; label: string } | null) => {
    if (selectedOption) {
      setPropietarioValue(selectedOption);
      changeInput('Propietario', selectedOption.value);
    } else {
      setPropietarioValue(null);
      changeInput('Propietario', '');
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
        if (isNew && (response.payload as Drone)?.id) { // TODO: Corregir este problema de tipo, acá y en las otras entidades
          history.replace(`/inicio/drones/${(response.payload as Drone).id}`);
        }
      } else if (response.meta.requestStatus === 'rejected') {
        // Mostrar mensaje de error específico si está disponible
        const resp = response as { error: { message: string }};
        openModal({
          mensaje: "Error al guardar el drone: " + (resp.error?.message || "Error desconocido."),
          tipo: "danger",
          titulo: "Error",
        });
      }
    } catch (error) {
      openModal({
        mensaje: "Error al guardar el drone: " + error,
        tipo: "danger",
        titulo: "Error",
      });
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
      await dispatch(eliminarDroneAsync(drone.id)).unwrap();
      
      openModal({
        mensaje: "Drone eliminado correctamente.",
        tipo: "success",
        titulo: "Eliminar Drone",
      });
      history.goBack();
    } catch (error: unknown) {
      console.error("Error al eliminar el drone:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar el drone.";
      openModal({
        mensaje: errorMessage,
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
            <label className="form-label">Nombre del Drone</label>
            <input
              type="text"
              className="form-control"
              value={drone.data.Nombre}
              onChange={(e) => changeInput('Nombre', e.target.value)}
              placeholder="Ingrese el nombre del drone"
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Número de Serie</label>
            <input
              type="text"
              className="form-control"
              value={drone.data.NumeroSerie}
              onChange={(e) => changeInput('NumeroSerie', e.target.value)}
              placeholder="Ingrese el número de serie"
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Modelo de Drone</label>
            <select
              className="form-select"
              value={drone.data.ModeloDroneId}
              onChange={(e) => handleModeloChange(e.target.value)}
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
