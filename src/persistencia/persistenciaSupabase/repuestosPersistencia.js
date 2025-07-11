import { supabase } from './supabaseClient.js';

// GET Repuesto por id
export const getRepuestoPersistencia = async (id) => {
  try {
    // 1. Obtener el repuesto principal
    const { data, error } = await supabase
      .from('part')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error('Repuesto no encontrado');
    }

    // 2. Obtener los modelos de drone relacionados
    const { data: partDroneModels, error: relError } = await supabase
      .from('part_drone_model')
      .select(`
        drone_model:drone_model_id (*)
      `)
      .eq('part_id', id);

    if (relError) throw relError;

    // Extraer los IDs de los modelos y sus nombres
    const modelosDroneIds = partDroneModels.map(rel => String(rel.drone_model.id));

    // 3. Transformar al formato esperado por el frontend
    return {
      id: String(data.id),
      data: {
        NombreRepu: data.name,
        DescripcionRepu: data.description || '',
        ModelosDroneIds: modelosDroneIds,
        ProveedorRepu: data.provider || '',
        PrecioRepu: data.price || 0,
        StockRepu: data.stock || 0,
        UnidadesPedidas: data.backorder || 0
      }
    };
  } catch (error) {
    console.error("Error al obtener repuesto:", error);
    throw error;
  }
};

// GET Repuestos por modelo de drone
export const getRepuestosPorModeloPersistencia = async (modeloDroneId) => {
  try {
    // 1. Primero obtenemos los IDs de los repuestos asociados a este modelo desde la tabla intermedia
    const { data: relacionesPartDroneModel, error: errorRelaciones } = await supabase
      .from('part_drone_model')
      .select('part_id')
      .eq('drone_model_id', modeloDroneId);

    if (errorRelaciones) throw errorRelaciones;

    // Si no hay repuestos asociados, devolver un array vacío
    if (!relacionesPartDroneModel || relacionesPartDroneModel.length === 0) {
      return [];
    }

    // 2. Extraer los IDs de los repuestos
    const repuestosIds = relacionesPartDroneModel.map(rel => String(rel.part_id));

    // 3. Obtener la información completa de los repuestos
    const { data, error } = await supabase
      .from('part')
      .select('*')
      .in('id', repuestosIds);

    if (error) throw error;

    // 4. Transformar al formato esperado por el frontend
    const repuestos = data.map(item => ({
      id: String(item.id),
      data: {
        NombreRepu: item.name,
        DescripcionRepu: item.description || '',
        ModeloDroneRepu: 'Múltiple', // Ahora un repuesto puede estar asociado a múltiples modelos
        ModelosDroneIds: [String(modeloDroneId)], // Incluimos el modelo que estamos consultando
        ProveedorRepu: item.provider || '',
        PrecioRepu: item.price || 0,
        StockRepu: item.stock || 0,
        UnidadesPedidas: item.backorder || 0
      }
    }));

    return repuestos;
  } catch (error) {
    console.error("Error al obtener repuestos por modelo:", error);
    throw error;
  }
};

// GET Repuestos por proveedor
export const getRepuestosPorProveedorPersistencia = async (proveedor) => {
  try {
    const { data, error } = await supabase
      .from('part')
      .select(`
        *,
        drone_model:drone_model_id (id, name)
      `)
      .eq('provider', proveedor);

    if (error) throw error;

    // Transformar al formato esperado por el frontend
    const repuestos = data.map(item => ({
      id: String(item.id),
      data: {
        NombreRepu: item.name,
        DescripcionRepu: item.description || '',
        ModeloDroneRepu: item.drone_model?.name || '',
        ProveedorRepu: item.provider || '',
        PrecioRepu: item.price || 0,
        StockRepu: item.stock || 0,
        UnidadesPedidas: item.backorder || 0
      }
    }));

    return repuestos;
  } catch (error) {
    console.error("Error al obtener repuestos por proveedor:", error);
    throw error;
  }
};

// GUARDAR Repuesto - Mejorado para trabajar con IDs o nombres de modelo
export const guardarRepuestoPersistencia = async (repuesto) => {
  try {
    // 1. Preparar datos para Supabase
    const repuestoData = {
      name: repuesto.data.NombreRepu,
      description: repuesto.data.DescripcionRepu || '',
      provider: repuesto.data.ProveedorRepu || '',
      price: repuesto.data.PrecioRepu || 0,
      stock: repuesto.data.StockRepu || 0,
      backorder: repuesto.data.UnidadesPedidas || 0,
    };

    let result;

    // 2. Insertar o actualizar el repuesto base
    if (repuesto.id) {
      // Actualización
      const { data, error } = await supabase
        .from('part')
        .update(repuestoData)
        .eq('id', repuesto.id)
        .select();

      if (error) throw error;
      result = data[0];
    } else {
      // Inserción
      const { data, error } = await supabase
        .from('part')
        .insert(repuestoData)
        .select();

      if (error) throw error;
      result = data[0];
    }

    // 3. Gestionar las relaciones con los modelos de drone

    // 3.1. Eliminar todas las relaciones existentes para este repuesto
    const { error: deleteError } = await supabase
      .from('part_drone_model')
      .delete()
      .eq('part_id', result.id);

    if (deleteError) throw deleteError;

    // 3.2. Si hay modelos seleccionados, crear las nuevas relaciones
    if (repuesto.data.ModelosDroneIds && repuesto.data.ModelosDroneIds.length > 0) {
      const partDroneModelData = repuesto.data.ModelosDroneIds.map(modelId => ({
        part_id: result.id,
        drone_model_id: modelId,
        created_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('part_drone_model')
        .insert(partDroneModelData);

      if (insertError) throw insertError;
    }

    // 4. Devolver el resultado en formato esperado por el frontend
    return {
      id: String(result.id),
      data: {
        NombreRepu: result.name,
        DescripcionRepu: result.description || '',
        ModelosDroneIds: repuesto.data.ModelosDroneIds ?
          repuesto.data.ModelosDroneIds.map(id => String(id)) : [],
        ProveedorRepu: result.provider || '',
        PrecioRepu: result.price || 0,
        StockRepu: result.stock || 0,
        UnidadesPedidas: result.backorder || 0
      }
    };
  } catch (error) {
    console.error("Error al guardar repuesto:", error);
    throw error;
  }
};

// ELIMINAR Repuesto
export const eliminarRepuestoPersistencia = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Verificar si el repuesto está siendo utilizado en alguna intervención
      const { data: relacionesRepuestoIntervencion, error: errorRelaciones } = await supabase
        .from('part_intervention')
        .select('*')
        .eq('part_id', id);

      if (errorRelaciones) throw errorRelaciones;

      if (relacionesRepuestoIntervencion && relacionesRepuestoIntervencion.length > 0) {
        reject({
          code: "No se puede eliminar este repuesto porque está siendo utilizado en una o más intervenciones."
        });
        return;
      }

      // 2. Si no hay dependencias, procedemos a eliminar
      // 2.1. Eliminar las relaciones en la tabla part_drone_model
      const { error: errorEliminarRelaciones } = await supabase
        .from('part_drone_model')
        .delete()
        .eq('part_id', id);

      if (errorEliminarRelaciones) {
        console.error('Error al eliminar relaciones en part_drone_model:', errorEliminarRelaciones);
        throw errorEliminarRelaciones;
      }

      // 2.2. Eliminar el repuesto en la tabla part
      const { error: errorEliminacion } = await supabase
        .from('part')
        .delete()
        .eq('id', id);

      if (errorEliminacion) {
        console.error('Error al eliminar el repuesto en part:', errorEliminacion);
        throw errorEliminacion;
      }

      resolve(id);
    } catch (error) {
      console.error('Error al eliminar repuesto:', error);
      reject(error);
    }
  });
};

// GET todos los Repuestos con suscripción en tiempo real
export const getRepuestosPersistencia = async (setRepuestosToRedux) => {
  // Función para cargar los datos iniciales
  const cargarRepuestos = async () => {
    try {
      // 1. Obtener todos los repuestos
      const { data, error } = await supabase
        .from('part')
        .select(`
          *,
          part_drone_model (
            drone_model:drone_model_id (*)
          )
        `)
        .order('name');

      if (error) throw error;

      const repuestos = data.map(repuesto => ({
        id: String(repuesto.id),
        data: {
          NombreRepu: repuesto.name,
          DescripcionRepu: repuesto.description || '',
          ModelosDroneIds: repuesto.part_drone_model.map(rel => String(rel.drone_model.id)),
          ProveedorRepu: repuesto.provider || '',
          PrecioRepu: repuesto.price || 0,
          StockRepu: repuesto.stock || 0,
          UnidadesPedidas: repuesto.backorder || 0
        }
      }));

      setRepuestosToRedux(repuestos);
    } catch (error) {
      console.error("Error al cargar repuestos:", error);
      throw error;
    }
  };

  // Cargar datos iniciales
  cargarRepuestos();

  // Configurar la suscripción en tiempo real
  const channelRepuestos = supabase
    .channel('repuestos-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'part'
    }, (payload) => {
      console.log('Cambio detectado en repuestos:', payload);
      // Cuando hay cambios, recargamos todos los datos
      cargarRepuestos();
    })
    .subscribe((status, err) => {
      if (err) {
        console.error('Error en suscripción repuestos-changes:', err);
      }
      if (status === 'CHANNEL_ERROR') {
        console.error('Error del canal repuestos-changes. Posibles causas:');
        console.error('- RLS (Row Level Security) no configurado correctamente');
        console.error('- Realtime no habilitado para la tabla "part"');
        console.error('- Permisos insuficientes en la tabla');
      }
    });

  const channelRepuestosModelos = supabase
    .channel('repuestos-modelos-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'part_drone_model'
    }, (payload) => {
      console.log('Cambio detectado en relaciones repuestos-modelos:', payload);
      // Cuando hay cambios, recargamos todos los datos
      cargarRepuestos();
    })
    .subscribe((status, err) => {
      if (err) {
        console.error('Error en suscripción repuestos-modelos-changes:', err);
      }
      if (status === 'CHANNEL_ERROR') {
        console.error('Error del canal repuestos-modelos-changes. Posibles causas:');
        console.error('- RLS (Row Level Security) no configurado correctamente');
        console.error('- Realtime no habilitado para la tabla "part_drone_model"');
        console.error('- Permisos insuficientes en la tabla');
      }
    });

  // Devolver función para cancelar la suscripción
  return () => {
    supabase.removeChannel(channelRepuestos);
    supabase.removeChannel(channelRepuestosModelos);
  };
};
