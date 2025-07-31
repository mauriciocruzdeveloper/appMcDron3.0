import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from "../hooks/useHistory";
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { Repuesto } from '../types/repuesto';
import { guardarRepuestoAsync, eliminarRepuestoAsync } from '../redux-tool-kit/repuesto/repuesto.actions';
import { useModal } from './Modal/useModal';
import Select from 'react-select'; // Importar Select para selección múltiple
import { SelectOption } from '../types/selectOption';
import { selectModelosDroneArray } from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';
import { selectRepuestoPorId } from '../redux-tool-kit/repuesto/repuesto.selectors';

interface ParamTypes extends Record<string, string | undefined> {
  id: string;
}

// Función para calcular el estado del repuesto
export const calcularEstadoRepuesto = (stock: number, unidadesPedidas: number): string => {
  if (stock > 0) return 'Disponible';
  return unidadesPedidas > 0 ? 'En Pedido' : 'Agotado';
};

// Obtén el color para la etiqueta del estado
const getEstadoColor = (estado: string): string => {
  switch (estado) {
    case 'Disponible': return 'text-success';
    case 'Agotado': return 'text-danger';
    case 'En Pedido': return 'text-warning';
    default: return '';
  }
};

export default function RepuestoComponent(): JSX.Element {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { openModal } = useModal();
  const { id } = useParams<ParamTypes>();

  const isNew = id === 'new';
  const repuestoActual = useAppSelector((state) => 
    isNew || !id ? null : selectRepuestoPorId(state, id)
  );

  const [selectedModelos, setSelectedModelos] = useState<SelectOption[]>([]);

  const modelosDrone = useAppSelector(selectModelosDroneArray);

  const [repuesto, setRepuesto] = useState<Repuesto>({
    id: '',
    data: {
      NombreRepu: '',
      DescripcionRepu: '',
      ModelosDroneIds: [],
      ProveedorRepu: '',
      PrecioRepu: 0,
      StockRepu: 0,
      UnidadesPedidas: 0
    }
  });

  // Para el selector múltiple de modelos de drone
  const [estadoCalculado, setEstadoCalculado] = useState<string>('Agotado');

  useEffect(() => {
    if (!isNew && id) {
      if (!repuestoActual) return;
      setRepuesto(repuestoActual);


      // Inicializar el selector múltiple con los modelos ya asociados al repuesto
      if (repuestoActual.data.ModelosDroneIds && repuestoActual.data.ModelosDroneIds.length > 0) {
        const modelosSeleccionados = modelosDrone
          .filter(modelo => repuestoActual.data.ModelosDroneIds.includes(modelo.id))
          .map((modelo) => ({
            value: modelo.id,
            label: `${modelo.data.NombreModelo} - ${modelo.data.Fabricante}`
          }));

        setSelectedModelos(modelosSeleccionados);
      } else {
        setSelectedModelos([]);
      }
    }
  }, [dispatch, id, isNew, repuestoActual, modelosDrone]);

  // Actualizar el estado calculado cuando cambien los valores relevantes
  useEffect(() => {
    const nuevoEstado = calcularEstadoRepuesto(
      repuesto.data.StockRepu,
      repuesto.data.UnidadesPedidas
    );
    setEstadoCalculado(nuevoEstado);
  }, [repuesto.data.StockRepu, repuesto.data.UnidadesPedidas]);

  // Manejador para campos de texto comunes
  const handleTextInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setRepuesto(prevState => ({
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

    setRepuesto(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        [id]: numValue
      }
    }));
  };

  // Manejador para el select
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setRepuesto(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        [id]: value
      }
    }));
  };

  // Nuevo manejador para el selector múltiple de modelos
  const handleModelosChange = (selected: any) => {
    setSelectedModelos(selected || []);

    // Actualizar los IDs de modelos en el objeto de repuesto
    const modelosIds = selected ? selected.map((item: any) => item.value) : [];
    setRepuesto(prevState => ({
      ...prevState,
      data: {
        ...prevState.data,
        ModelosDroneIds: modelosIds,
      }
    }));
  };

  const handleGuardarRepuesto = async () => {
    openModal({
      mensaje: "¿Desea guardar este repuesto?",
      tipo: "warning",
      titulo: "Guardar Repuesto",
      confirmCallback: confirmaGuardarRepuesto,
    });
  };

  const confirmaGuardarRepuesto = async () => {
    try {
      const response = await dispatch(guardarRepuestoAsync(repuesto));

      if (response.meta.requestStatus === 'fulfilled') {
        openModal({
          mensaje: "Repuesto guardado correctamente.",
          tipo: "success",
          titulo: "Guardar Repuesto",
        });

        if (isNew && (response.payload as Repuesto)?.id) {
          history.replace(`/inicio/repuestos/${(response.payload as Repuesto).id}`);
        }
      } else if (response.meta.requestStatus === 'rejected') {
        // TODO: Corregir el problema de typescript que no infiere que el rejected tiene un error como atributo
        const resp = response as { error: { message: string } };
        openModal({
          mensaje: "Error al guardar el repuesto: " + resp.error.message,
          tipo: "danger",
          titulo: "Error",
        });
      }
    } catch (error) {
      openModal({
        mensaje: "Error al guardar el repuesto: " + error,
        tipo: "danger",
        titulo: "Error",
      });
      console.error("Error al guardar el repuesto en confirmaGuardarRepuesto:", error);
    }
  };

  const handleEliminarRepuesto = () => {
    openModal({
      mensaje: "¿Está seguro de que desea eliminar este repuesto?",
      tipo: "danger",
      titulo: "Eliminar Repuesto",
      confirmCallback: confirmaEliminarRepuesto,
    });
  };

  const confirmaEliminarRepuesto = async () => {
    try {
      const response = await dispatch(eliminarRepuestoAsync(repuesto.id)).unwrap();

      openModal({
        mensaje: "Repuesto eliminado correctamente.",
        tipo: "success",
        titulo: "Eliminar Repuesto",
      });
      history.goBack();
    } catch (error: any) {
      console.error("Error al eliminar el repuesto:", error);

      openModal({
        mensaje: error?.code || "Error al eliminar el repuesto.",
        tipo: "danger",
        titulo: "Error",
      });
    }
  };

  // Opciones para el selector de modelos de drone
  const modelosDroneOptions = modelosDrone.map(modelo => ({
    value: modelo.id,
    label: `${modelo.data.NombreModelo} - ${modelo.data.Fabricante}`
  }));

  return (
    <div className="p-4">
      <div className="card mb-3 bg-bluemcdron">
        <div className="card-body">
          <h3 className="card-title text-light p-0 m-0">
            {isNew ? "NUEVO REPUESTO" : "EDITAR REPUESTO"}
          </h3>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title bluemcdron">DATOS DEL REPUESTO</h5>

          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              id="NombreRepu"
              value={repuesto.data.NombreRepu}
              onChange={handleTextInputChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-control"
              id="DescripcionRepu"
              value={repuesto.data.DescripcionRepu}
              onChange={handleTextInputChange}
              rows={3}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Modelos de Drone Compatibles</label>
            <Select
              isMulti
              options={modelosDroneOptions}
              value={selectedModelos}
              onChange={handleModelosChange}
              placeholder="Seleccione los modelos de drone compatibles..."
              noOptionsMessage={() => "No se encontraron modelos de drone"}
            />
            <small className="form-text text-muted">
              Seleccione todos los modelos de drone para los que este repuesto es compatible.
              {selectedModelos.length === 0
                ? " Si no selecciona ninguno, se considerará universal."
                : ` Actualmente compatible con ${selectedModelos.length} modelo(s).`}
            </small>
            {selectedModelos.length > 0 && (
              <div className="mt-2 p-2 border rounded bg-light">
                <p className="mb-1 fw-bold">Modelos seleccionados:</p>
                <ul className="list-unstyled mb-0">
                  {selectedModelos.map(modelo => (
                    <li key={modelo.value} className="text-success">
                      <i className="bi bi-check-circle-fill me-1"></i> {modelo.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Proveedor</label>
            <input
              type="text"
              className="form-control"
              id="ProveedorRepu"
              value={repuesto.data.ProveedorRepu}
              onChange={handleTextInputChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Precio</label>
            <div className="input-group">
              <span className="input-group-text">$</span>
              <input
                type="number"
                className="form-control"
                id="PrecioRepu"
                value={repuesto.data.PrecioRepu || ''}
                onChange={handleNumberInputChange}
                min="0"
                step="any"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Stock Disponible</label>
            <input
              type="number"
              className="form-control"
              id="StockRepu"
              value={repuesto.data.StockRepu || ''}
              onChange={handleNumberInputChange}
              min="0"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Unidades Pedidas</label>
            <input
              type="number"
              className="form-control"
              id="UnidadesPedidas"
              value={repuesto.data.UnidadesPedidas || ''}
              onChange={handleNumberInputChange}
              min="0"
            />
            <small className="form-text text-muted">
              Cantidad de unidades que están en proceso de pedido
            </small>
          </div>

          <div className="card bg-light mb-3">
            <div className="card-body">
              <h6 className="card-title">Estado del repuesto</h6>
              <div className={`h5 ${getEstadoColor(estadoCalculado)}`}>
                {estadoCalculado}
              </div>
              <p className="mb-0 small">
                El estado se calcula automáticamente según el stock y unidades pedidas:
              </p>
              <ul className="mb-0 mt-1">
                <li>Stock &gt; 0 → Disponible</li>
                <li>Stock 0 + Unidades pedidas &gt; 0 → En Pedido</li>
                <li>Stock 0 + Sin unidades pedidas → Agotado</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleGuardarRepuesto}
          className="w-100 mb-3 btn bg-bluemcdron text-white"
        >
          Guardar
        </button>

        {!isNew && (
          <button
            onClick={handleEliminarRepuesto}
            className="w-100 btn bg-danger text-white"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
