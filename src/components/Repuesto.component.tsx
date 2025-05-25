import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import history from "../history";
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { Repuesto } from '../types/repuesto';
import { guardarRepuestoAsync, eliminarRepuestoAsync, getRepuestoAsync } from '../redux-tool-kit/repuesto/repuesto.actions';
import { useModal } from './Modal/useModal';
import { ModeloDrone } from '../types/modeloDrone';

interface ParamTypes {
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
  const { openModal } = useModal();
  const { id } = useParams<ParamTypes>();

  const isNew = id === 'new';
  const repuestoActual = useAppSelector(state =>
    state.repuesto.coleccionRepuestos.find(repuesto => repuesto.id === id)
  );

  const modelosDrone = useAppSelector(state => state.modeloDrone.coleccionModelosDrone);

  const [repuesto, setRepuesto] = useState<Repuesto>({
    id: '',
    data: {
      NombreRepu: '',
      DescripcionRepu: '',
      ModeloDroneRepu: '',
      ProveedorRepu: '',
      PrecioRepu: 0,
      StockRepu: 0,
      UnidadesPedidas: 0
    }
  });

  const [estadoCalculado, setEstadoCalculado] = useState<string>('Agotado');

  useEffect(() => {
    if (!isNew && id) {
      if (repuestoActual) {
        // Migración de datos: asegurarse de que los campos nuevos existan
        const repuestoMigrado = {
          ...repuestoActual,
          data: {
            ...repuestoActual.data,
            UnidadesPedidas: repuestoActual.data.UnidadesPedidas || 0
          }
        };
        setRepuesto(repuestoMigrado);
      } else {
        dispatch(getRepuestoAsync(id));
      }
    }
  }, [dispatch, id, isNew, repuestoActual]);

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

      console.log("!!! response en confirmaGuardarRepuesto", response);

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
        const resp = response as { error: { message: string }};
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
            <label className="form-label">Modelo de Drone Compatible</label>
            <select
              className="form-select"
              id="ModeloDroneRepu"
              value={repuesto.data.ModeloDroneRepu}
              onChange={handleSelectChange}
            >
              <option value="">Seleccione un modelo...</option>
              {modelosDrone.map((modelo: ModeloDrone) => (
                <option key={modelo.id} value={modelo.data.NombreModelo}>
                  {modelo.data.NombreModelo}
                </option>
              ))}
              <option value="Universal">Universal (compatible con varios modelos)</option>
            </select>
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
