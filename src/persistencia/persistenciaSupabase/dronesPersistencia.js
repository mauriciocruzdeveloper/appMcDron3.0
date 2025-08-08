import { supabase } from './supabaseClient.js';

// GET ModeloDrone por id
export const getModeloDronePersistencia = async (id) => {
  try {
    const { data, error } = await supabase
      .from('drone_model')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error('Modelo de drone no encontrado');
    }

    // Transformar al formato esperado por el frontend
    return {
      id: String(data.id),
      data: {
        NombreModelo: data.name,
        DescripcionModelo: data.description || '',
        Fabricante: data.manufacturer || '', // Asumiendo que se añadió esta columna
        PrecioReferencia: data.price_ref || 0
      }
    };
  } catch (error) {
    console.error("Error al obtener modelo de drone:", error);
    throw error;
  }
};

// GET ModelosDrone por fabricante
export const getModelosDronePorFabricantePersistencia = async (fabricante) => {
  try {
    const { data, error } = await supabase
      .from('drone_model')
      .select('*')
      .ilike('manufacturer', `%${fabricante}%`);

    if (error) throw error;

    // Transformar al formato esperado por el frontend
    const modelosDrone = data.map(item => ({
      id: String(item.id),
      data: {
        NombreModelo: item.name,
        DescripcionModelo: item.description || '',
        Fabricante: item.manufacturer || '',
        PrecioReferencia: item.price_ref || 0
      }
    }));

    return modelosDrone;
  } catch (error) {
    console.error("Error al obtener modelos de drone por fabricante:", error);
    throw error;
  }
};

// GUARDAR ModeloDrone
export const guardarModeloDronePersistencia = async (modeloDrone) => {
  try {
    // Preparar datos para Supabase
    const modeloDroneData = {
      name: modeloDrone.data.NombreModelo,
      description: modeloDrone.data.DescripcionModelo || '',
      manufacturer: modeloDrone.data.Fabricante || '',
      price_ref: modeloDrone.data.PrecioReferencia || 0
    };

    let result;

    if (modeloDrone.id) {
      // Actualización
      const { data, error } = await supabase
        .from('drone_model')
        .update(modeloDroneData)
        .eq('id', modeloDrone.id)
        .select();

      if (error) throw error;
      result = data[0];
    } else {
      // Inserción
      const { data, error } = await supabase
        .from('drone_model')
        .insert({
          ...modeloDroneData,
          created_at: new Date()
        })
        .select();

      if (error) throw error;
      result = data[0];
    }

    // Transformar el resultado al formato esperado por el frontend
    return {
      id: String(result.id),
      data: {
        NombreModelo: result.name,
        DescripcionModelo: result.description || '',
        Fabricante: result.manufacturer || '',
        PrecioReferencia: result.price_ref || 0
      }
    };
  } catch (error) {
    console.error("Error al guardar modelo de drone:", error);
    throw error;
  }
};

// ELIMINAR ModeloDrone
export const eliminarModeloDronePersistencia = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Verificar si hay drones asociados a este modelo
      const { data: dronesAsociados, error: errorDrones } = await supabase
        .from('drone')
        .select('id')
        .eq('drone_model_id', id);

      if (errorDrones) throw errorDrones;

      if (dronesAsociados && dronesAsociados.length > 0) {
        reject({
          code: 'No se puede borrar este modelo de drone. Hay drones asociados a este modelo.'
        });
        return;
      }

      // 2. Verificar si hay intervenciones asociadas a este modelo
      const { data: intervencionesAsociadas, error: errorIntervenciones } = await supabase
        .from('intervention')
        .select('id')
        .eq('drone_model_id', id);

      if (errorIntervenciones) throw errorIntervenciones;

      if (intervencionesAsociadas && intervencionesAsociadas.length > 0) {
        reject({
          code: 'No se puede borrar este modelo de drone. Hay intervenciones asociadas a este modelo.'
        });
        return;
      }

      // 3. Verificar si hay repuestos asociados a este modelo en la tabla intermedia part_drone_model
      const { data: relacionesRepuestoModelo, error: errorRelaciones } = await supabase
        .from('part_drone_model')
        .select('id')
        .eq('drone_model_id', id);

      if (errorRelaciones) throw errorRelaciones;

      if (relacionesRepuestoModelo && relacionesRepuestoModelo.length > 0) {
        reject({
          code: 'No se puede borrar este modelo de drone. Hay repuestos asociados a este modelo.'
        });
        return;
      }

      // 4. Si no hay dependencias, procedemos a eliminar
      const { error: errorEliminacion } = await supabase
        .from('drone_model')
        .delete()
        .eq('id', id);

      if (errorEliminacion) throw errorEliminacion;

      resolve(id);
    } catch (error) {
      console.error('Error al eliminar modelo de drone:', error);
      reject(error);
    }
  });
};

// GET todos los ModelosDrone con suscripción en tiempo real
export const getModelosDronePersistencia = async (setModelosDroneToRedux) => {
  // Función para cargar los datos iniciales
  const cargarModelosDrone = async () => {
    try {
      const { data, error } = await supabase
        .from('drone_model')
        .select('*')
        .order('name');

      if (error) throw error;

      // Transformar los datos al formato esperado por el frontend
      const modelosDrone = data.map(item => ({
        id: String(item.id),
        data: {
          NombreModelo: item.name,
          DescripcionModelo: item.description || '',
          Fabricante: item.manufacturer || '',
          PrecioReferencia: item.price_ref || 0
        }
      }));

      // Actualizar el estado en Redux
      setModelosDroneToRedux(modelosDrone);
    } catch (error) {
      console.error("Error al cargar modelos de drone:", error);
    }
  };

  // Cargar datos iniciales
  cargarModelosDrone();

  // Configurar la suscripción en tiempo real
  const channel = supabase
    .channel('modelos-drone-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'drone_model'
    }, (payload) => {
      console.log('Cambio detectado en modelos de drone:', payload);
      // Cuando hay cambios, recargamos todos los datos
      cargarModelosDrone();
    })
    .subscribe();

  // Devolver función para cancelar la suscripción
  return () => {
    supabase.removeChannel(channel);
  };
};

////////////////////// DRONE ///////////////////////////////////////////////////////////////////////////

// GET Drone por id
export const getDronePersistencia = async (id) => {
  try {
    const { data, error } = await supabase
      .from('drone')
      .select(`
        *,
        drone_model:drone_model_id (*),
        owner:owner_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error('Drone no encontrado');
    }

    // Transformar al formato esperado por el frontend
    return {
      id: String(data.id),
      data: {
        ModeloDroneId: data.drone_model_id ? String(data.drone_model_id) : '',
        ModeloDroneName: data.drone_model?.name || '',
        Propietario: data.owner_id ? String(data.owner_id) : '',
        Observaciones: data.observations || '',
        Nombre: data.name || '',
        NumeroSerie: data.serial_number || '',

      }
    };
  } catch (error) {
    console.error("Error al obtener drone:", error);
    throw error;
  }
};

// GET Drones por modelo de drone
export const getDronesPorModeloDronePersistencia = async (modeloDroneId) => {
  try {
    const { data, error } = await supabase
      .from('drone')
      .select(`
        *,
        drone_model:drone_model_id (*),
        owner:owner_id (*)
      `)
      .eq('drone_model_id', modeloDroneId);

    if (error) throw error;

    // Transformar al formato esperado por el frontend
    const drones = data.map(item => ({
      id: String(item.id),
      data: {
        ModeloDroneId: item.drone_model_id ? String(item.drone_model_id) : '',
        ModeloDroneName: item.drone_model?.name || '',
        Propietario: item.owner_id ? String(item.owner_id) : '',
        Observaciones: item.observations || '',
        Nombre: item.name || '',
        NumeroSerie: item.serial_number || ''
      }
    }));

    return drones;
  } catch (error) {
    console.error("Error al obtener drones por modelo:", error);
    throw error;
  }
};

// GET Drones por propietario
export const getDronesPorPropietarioPersistencia = async (propietarioId) => {
  try {
    const { data, error } = await supabase
      .from('drone')
      .select(`
        *,
        drone_model:drone_model_id (*),
        owner:owner_id (*)
      `)
      .eq('owner_id', propietarioId);

    if (error) throw error;

    // Transformar al formato esperado por el frontend
    const drones = data.map(item => ({
      id: String(item.id),
      data: {
        ModeloDroneId: item.drone_model_id ? String(item.drone_model_id) : '',
        ModeloDroneName: item.drone_model?.name || '',
        Propietario: item.owner_id ? String(item.owner_id) : '',
        Observaciones: item.observations || '',
        Nombre: item.name || '',
        NumeroSerie: item.serial_number || ''
      }
    }));

    return drones;
  } catch (error) {
    console.error("Error al obtener drones por propietario:", error);
    throw error;
  }
};

// GUARDAR Drone
export const guardarDronePersistencia = async (drone) => {
  try {
    // Preparar datos para Supabase
    const droneData = {
      drone_model_id: drone.data.ModeloDroneId || null,
      owner_id: drone.data.Propietario || null,
      observations: drone.data.Observaciones || '',
      name: drone.data.Nombre || '',
      serial_number: drone.data.NumeroSerie || ''
    };

    let result;

    if (drone.id) {
      // Actualización
      const { data, error } = await supabase
        .from('drone')
        .update(droneData)
        .eq('id', drone.id)
        .select(`
          *,
          drone_model:drone_model_id (*),
          owner:owner_id (*)
        `);

      if (error) throw error;
      result = data[0];
    } else {
      // Inserción
      const { data, error } = await supabase
        .from('drone')
        .insert({
          ...droneData,
          created_at: new Date()
        })
        .select(`
          *,
          drone_model:drone_model_id (*),
          owner:owner_id (*)
        `);

      if (error) throw error;
      result = data[0];
    }

    // Transformar el resultado al formato esperado por el frontend
    return {
      id: String(result.id),
      data: {
        ModeloDroneId: result.drone_model_id ? String(result.drone_model_id) : '',
        ModeloDroneName: result.drone_model?.name || '',
        Propietario: result.owner_id ? String(result.owner_id) : '',
        Observaciones: result.observations || '',
        Nombre: result.name || '',
        NumeroSerie: result.serial_number || ''
      }
    };
  } catch (error) {
    console.error("Error al guardar drone:", error);
    throw error;
  }
};

// ELIMINAR Drone
export const eliminarDronePersistencia = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Verificar si hay reparaciones asociadas a este drone
      const { data: reparacionesAsociadas, error: errorReparaciones } = await supabase
        .from('repair')
        .select('id')
        .eq('drone_id', id);

      if (errorReparaciones) throw errorReparaciones;

      if (reparacionesAsociadas && reparacionesAsociadas.length > 0) {
        reject({
          code: 'No se puede borrar este drone. Hay reparaciones asociadas a este drone.'
        });
        return;
      }

      // 2. Si no hay dependencias, procedemos a eliminar
      const { error: errorEliminacion } = await supabase
        .from('drone')
        .delete()
        .eq('id', id);

      if (errorEliminacion) throw errorEliminacion;

      resolve(id);
    } catch (error) {
      console.error('Error al eliminar drone:', error);
      reject(error);
    }
  });
};

// GET todos los Drones con suscripción en tiempo real
export const getDronesPersistencia = async (setDronesToRedux) => {
  // Función para cargar los datos iniciales
  const cargarDrones = async () => {
    try {
      const { data, error } = await supabase
        .from('drone')
        .select(`
          *,
          drone_model:drone_model_id (*),
          owner:owner_id (*)
        `)
        .order('id');

      if (error) throw error;

      // Transformar los datos al formato esperado por el frontend
      const drones = data.map(item => ({
        id: String(item.id), // Convertir a String
        data: {
          ModeloDroneId: item.drone_model_id ? String(item.drone_model_id) : '', // Convertir a String
          ModeloDroneName: item.drone_model?.name || '',
          Propietario: item.owner_id ? String(item.owner_id) : '', // Convertir a String
          Observaciones: item.observations || '',
          Nombre: item.name || '',
          NumeroSerie: item.serial_number || ''
        }
      }));

      // Actualizar el estado en Redux
      setDronesToRedux(drones);
    } catch (error) {
      console.error("Error al cargar drones:", error);
    }
  };

  // Cargar datos iniciales
  cargarDrones();

  // Configurar la suscripción en tiempo real
  const channel = supabase
    .channel('drones-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'drone'
    }, (payload) => {
      console.log('Cambio detectado en drones:', payload);
      // Cuando hay cambios, recargamos todos los datos
      cargarDrones();
    })
    .subscribe();

  // Devolver función para cancelar la suscripción
  return () => {
    supabase.removeChannel(channel);
  };
};
