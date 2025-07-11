import { supabase } from './supabaseClient.js';

// GET Intervención por id
export const getIntervencionPersistencia = async (id) => {
  try {
    // 1. Obtener la intervención principal
    const { data, error } = await supabase
      .from('intervention')
      .select(`
        *,
        drone_model:drone_model_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error('Intervención no encontrada');
    }

    // 2. Obtener los repuestos asociados a través de la tabla part_intervention
    const { data: partInterventions, error: relError } = await supabase
      .from('part_intervention')
      .select(`
        *,
        part:part_id (*)
      `)
      .eq('intervention_id', id);

    if (relError) throw relError;

    // Extraer los IDs de los repuestos y calcular los costos
    const repuestosIds = partInterventions.map(rel => String(rel.part_id));

    // 3. Transformar al formato esperado por el frontend

    return {
      id: String(data.id),
      data: {
        NombreInt: data.name,
        DescripcionInt: data.description || '',
        ModeloDroneId: data.drone_model_id ? String(data.drone_model_id) : '',
        RepuestosIds: repuestosIds,
        PrecioManoObra: data.labor_cost || 0,
        PrecioTotal: data.total_cost || 0,
        DuracionEstimada: data.estimated_duration || 30,
        // Datos adicionales sobre los repuestos
        _partsRelations: partInterventions
      }
    };
  } catch (error) {
    console.error("Error al obtener intervención:", error);
    throw error;
  }
};

// GET Intervenciones por modelo de drone
export const getIntervencionesPorModeloDronePersistencia = async (modeloDroneId) => {
  try {
    // 1. Obtener las intervenciones para el modelo especificado
    const { data, error } = await supabase
      .from('intervention')
      .select(`
        *,
        drone_model:drone_model_id (*)
      `)
      .eq('drone_model_id', modeloDroneId);

    if (error) throw error;

    // 2. Para cada intervención, obtener sus repuestos asociados
    const intervenciones = [];

    for (const intervencion of data) {
      // Obtener los repuestos asociados
      const { data: partInterventions, error: relError } = await supabase
        .from('part_intervention')
        .select('part_id, quantity')
        .eq('intervention_id', intervencion.id);

      if (relError) throw relError;

      // Extraer los IDs de los repuestos
      const repuestosIds = partInterventions.map(rel => String(rel.part_id));

      // Añadir a la lista de intervenciones
      intervenciones.push({
        id: String(intervencion.id),
        data: {
          NombreInt: intervencion.name,
          DescripcionInt: intervencion.description || '',
          ModeloDroneId: intervencion.drone_model_id ? String(intervencion.drone_model_id) : '',
          RepuestosIds: repuestosIds,
          PrecioManoObra: intervencion.labor_cost || 0,
          PrecioTotal: intervencion.total_cost || 0,
          DuracionEstimada: intervencion.estimated_duration || 30
        }
      });
    }

    return intervenciones;
  } catch (error) {
    console.error("Error al obtener intervenciones por modelo:", error);
    throw error;
  }
};

// GUARDAR Intervención
export const guardarIntervencionPersistencia = async (intervencion) => {
  try {
    // Iniciar una transacción para asegurar la integridad de los datos
    // (Simulamos transacción con múltiples operaciones secuenciales)
    // 1. Preparar datos para la tabla intervention
    const intervencionData = {
      name: intervencion.data.NombreInt,
      description: intervencion.data.DescripcionInt || '',
      drone_model_id: intervencion.data.ModeloDroneId || null,
      labor_cost: intervencion.data.PrecioManoObra || 0,
      total_cost: intervencion.data.PrecioTotal || 0,
      estimated_duration: intervencion.data.DuracionEstimada || 30
    };

    let intervencionResult;

    // 2. Insertar o actualizar en la tabla intervention
    if (intervencion.id) {
      // Actualización
      const { data, error } = await supabase
        .from('intervention')
        .update(intervencionData)
        .eq('id', intervencion.id)
        .select();

      if (error) throw error;
      intervencionResult = data[0];
    } else {
      // Inserción
      const { data, error } = await supabase
        .from('intervention')
        .insert({
          ...intervencionData,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;
      intervencionResult = data[0];
    }

    const intervencionId = intervencionResult.id;

    // 3. Manejar la relación con los repuestos

    // 3.1 Eliminar todas las relaciones existentes para esta intervención
    const { error: deleteError } = await supabase
      .from('part_intervention')
      .delete()
      .eq('intervention_id', intervencionId);

    if (deleteError) throw deleteError;

    // 3.2 Crear las nuevas relaciones
    if (intervencion.data.RepuestosIds && intervencion.data.RepuestosIds.length > 0) {
      // Obtener información de los repuestos para calcular costos
      const { data: repuestos, error: repuestosError } = await supabase
        .from('part')
        .select('id, price')
        .in('id', intervencion.data.RepuestosIds);

      if (repuestosError) throw repuestosError;

      // Crear las relaciones parte-intervención
      const partInterventionData = intervencion.data.RepuestosIds.map(repuestoId => {
        // Buscar el precio del repuesto
        const repuesto = repuestos.find(r => r.id === repuestoId);

        return {
          intervention_id: intervencionId,
          part_id: repuestoId,
          quantity: 1, // Por defecto asumimos cantidad 1
          created_at: new Date().toISOString()
        };
      });

      if (partInterventionData.length > 0) {
        const { error: insertError } = await supabase
          .from('part_intervention')
          .insert(partInterventionData);

        if (insertError) throw insertError;
      }

      // // Calcular el costo total de las partes
      // const partsCost = repuestos.reduce((sum, repuesto) => {
      //   // Si el repuesto está en la lista de RepuestosIds
      //   if (intervencion.data.RepuestosIds.includes(repuesto.id)) {
      //     return sum + (repuesto.price || 0);
      //   }
      //   return sum;
      // }, 0);

      // // Actualizar el costo total en la intervención
      // const laborCost = intervencionData.labor_cost || 0;
      // const totalCost = laborCost + partsCost;

      // const { error: updateError } = await supabase
      //   .from('intervention')
      //   .update({
      //     parts_cost: partsCost,
      //     total_cost: totalCost
      //   })
      //   .eq('id', intervencionId);

      // if (updateError) throw updateError;

      // // Actualizar el resultado con los nuevos costos calculados
      // intervencionResult.parts_cost = partsCost;
      // intervencionResult.total_cost = totalCost;
    }

    // 4. Devolver el resultado en el formato esperado por el frontend
    return {
      id: String(intervencionResult.id),
      data: {
        NombreInt: intervencionResult.name,
        DescripcionInt: intervencionResult.description || '',
        ModeloDroneId: intervencionResult.drone_model_id ? String(intervencionResult.drone_model_id) : '',
        RepuestosIds: intervencion.data.RepuestosIds ?
          intervencion.data.RepuestosIds.map(id => String(id)) : [],
        PrecioManoObra: intervencionResult.labor_cost || 0,
        PrecioTotal: intervencionResult.total_cost || 0,
        DuracionEstimada: intervencionResult.estimated_duration || 30
      }
    };
  } catch (error) {
    console.error("Error al guardar intervención:", error);
    throw error;
  }
};

// ELIMINAR Intervención
export const eliminarIntervencionPersistencia = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Verificar si hay reparaciones que utilizan esta intervención
      const { data: relacionesEnReparaciones, error: errorRelaciones } = await supabase
        .from('repair_intervention')
        .select('repair_id')
        .eq('intervention_id', id);

      if (errorRelaciones) throw errorRelaciones;

      if (relacionesEnReparaciones && relacionesEnReparaciones.length > 0) {
        reject({
          code: "No se puede eliminar esta intervención porque está siendo utilizada en una o más reparaciones."
        });
        return;
      }

      // 2. Eliminar primero las relaciones con repuestos
      const { error: errorRelacionesRepuestos } = await supabase
        .from('part_intervention')
        .delete()
        .eq('intervention_id', id);

      if (errorRelacionesRepuestos) throw errorRelacionesRepuestos;

      // 3. Luego eliminar la intervención
      const { error: errorEliminacion } = await supabase
        .from('intervention')
        .delete()
        .eq('id', id);

      if (errorEliminacion) throw errorEliminacion;

      console.log('Intervención eliminada correctamente');
      resolve(id);
    } catch (error) {
      console.error('Error al eliminar intervención:', error);
      reject(error);
    }
  });
};

// GET todas las Intervenciones con suscripción en tiempo real
export const getIntervencionesPersistencia = async (setIntervencionesToRedux) => {
  console.log('getIntervencionesPersistencia con Supabase');

  // Función para cargar los datos iniciales
  const cargarIntervenciones = async () => {
    try {
      // 1. Obtener todas las intervenciones
      const { data, error } = await supabase
        .from('intervention')
        .select(`
          *,
          drone_model:drone_model_id (*),
          part_intervention (
            part:part_id (*)
          )
        `)
        .order('name');

      if (error) throw error;

      const intervenciones = data.map(intervencion => ({
        id: String(intervencion.id),
        data: {
          NombreInt: intervencion.name,
          DescripcionInt: intervencion.description || '',
          ModeloDroneId: intervencion.drone_model_id ? String(intervencion.drone_model_id) : '',
          RepuestosIds: intervencion.part_intervention.map(rel => String(rel.part.id)),
          PrecioManoObra: intervencion.labor_cost || 0,
          PrecioTotal: intervencion.total_cost || 0,
          DuracionEstimada: intervencion.estimated_duration || 30
        }
      }));

      setIntervencionesToRedux(intervenciones);
    } catch (error) {
      console.error("Error al cargar intervenciones:", error);
    }
  };

  // Cargar datos iniciales
  cargarIntervenciones();

  // Configurar las suscripciones en tiempo real para ambas tablas
  const channel1 = supabase
    .channel('intervenciones-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'intervention'
    }, (payload) => {
      console.log('Cambio detectado en intervenciones:', payload);
      // Cuando hay cambios, recargamos todos los datos
      cargarIntervenciones();
    })
    .subscribe();

  const channel2 = supabase
    .channel('part-intervention-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'part_intervention'
    }, (payload) => {
      console.log('Cambio detectado en relaciones de intervenciones y repuestos:', payload);
      // Cuando hay cambios, recargamos todos los datos
      cargarIntervenciones();
    })
    .subscribe();

  // Devolver función para cancelar las suscripciones
  return () => {
    supabase.removeChannel(channel1);
    supabase.removeChannel(channel2);
  };
};
