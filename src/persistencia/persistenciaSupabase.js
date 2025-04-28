import { createClient } from '@supabase/supabase-js';

// Estas credenciales deberían estar en un archivo de configuración o variables de entorno
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'TU_URL_DE_SUPABASE';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || 'TU_API_KEY_DE_SUPABASE';

// Inicializa el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Agregar una intervención a una reparación
export const agregarIntervencionAReparacionPersistencia = async (reparacionId, intervencionId) => {
  try {
    // 1. Verificar que la reparación existe
    const { data: reparacion, error: reparacionError } = await supabase
      .from('repair')
      .select('*')
      .eq('id', reparacionId)
      .single();
    
    if (reparacionError || !reparacion) {
      throw new Error('Reparación no encontrada');
    }
    
    // 2. Verificar que la intervención existe
    const { data: intervencion, error: intervencionError } = await supabase
      .from('intervention')
      .select('*')
      .eq('id', intervencionId)
      .single();
    
    if (intervencionError || !intervencion) {
      throw new Error('Intervención no encontrada');
    }
    
    // 3. Verificar si la relación ya existe para evitar duplicados
    const { data: relacionExistente, error: relacionError } = await supabase
      .from('repair_intervention')
      .select('*')
      .eq('repair_id', reparacionId)
      .eq('intervention_id', intervencionId);
    
    if (relacionExistente && relacionExistente.length > 0) {
      return { success: true, message: 'La intervención ya está asociada a esta reparación' };
    }
    
    // 4. Insertar la nueva relación con los costos de la intervención
    const { data: nuevaRelacion, error: insercionError } = await supabase
      .from('repair_intervention')
      .insert([
        { 
          repair_id: reparacionId, 
          intervention_id: intervencionId,
          labor_cost: intervencion.labor_cost || 0,
          parts_cost: intervencion.parts_cost || 0,
          total_cost: intervencion.total_cost || 0
        }
      ])
      .select();
    
    if (insercionError) {
      throw new Error(`Error al asociar la intervención: ${insercionError.message}`);
    }
    
    // 5. Actualizar el precio total de la reparación sumando todos los costos
    // Primero obtenemos todas las intervenciones de esta reparación
    const { data: todasIntervenciones, error: consultaError } = await supabase
      .from('repair_intervention')
      .select('total_cost')
      .eq('repair_id', reparacionId);
    
    if (!consultaError && todasIntervenciones) {
      // Calculamos el total
      const nuevoTotal = todasIntervenciones.reduce((sum, item) => sum + (item.total_cost || 0), 0);
      
      // Actualizamos la reparación con el nuevo total
      await supabase
        .from('repair')
        .update({ price_total: nuevoTotal })
        .eq('id', reparacionId);
    }
    
    return { 
      success: true, 
      data: nuevaRelacion[0],
      message: 'Intervención asociada correctamente a la reparación'
    };
    
  } catch (error) {
    console.error('Error en agregarIntervencionAReparacionPersistencia:', error);
    return { 
      success: false, 
      error: error.message || 'Error al asociar la intervención a la reparación'
    };
  }
};

// GET Intervenciones por reparación
export const getIntervencionesPorReparacionPersistencia = async (reparacionId) => {
  try {
    // Consultamos la tabla de relación y hacemos un join con la tabla de intervenciones
    const { data, error } = await supabase
      .from('repair_intervention')
      .select(`
        *,
        intervention:intervention_id (*)
      `)
      .eq('repair_id', reparacionId);
    
    if (error) throw error;
    
    // Transformamos los datos al formato esperado por el frontend
    const intervenciones = data.map(item => ({
      id: item.intervention.id,
      data: {
        NombreInt: item.intervention.name,
        DescripcionInt: item.intervention.description,
        ModeloDroneId: item.intervention.drone_model_id,
        PrecioManoObra: item.labor_cost || item.intervention.labor_cost,
        PrecioTotal: item.total_cost || item.intervention.total_cost,
        // Otros campos necesarios...
      },
      // Guardamos los datos de la relación por si son útiles
      relationData: {
        id: item.id,
        labor_cost: item.labor_cost,
        parts_cost: item.parts_cost,
        total_cost: item.total_cost
      }
    }));
    
    return intervenciones;
    
  } catch (error) {
    console.error('Error en getIntervencionesPorReparacionPersistencia:', error);
    throw error;
  }
};

// Eliminar intervención de reparación
export const eliminarIntervencionDeReparacionPersistencia = async (reparacionId, intervencionId) => {
  try {
    // 1. Encontrar el registro específico que queremos eliminar
    const { data: relacion, error: consultaError } = await supabase
      .from('repair_intervention')
      .select('*')
      .eq('repair_id', reparacionId)
      .eq('intervention_id', intervencionId);
    
    if (consultaError || !relacion || relacion.length === 0) {
      throw new Error('Relación no encontrada');
    }
    
    // 2. Eliminar la relación
    const { error: eliminacionError } = await supabase
      .from('repair_intervention')
      .delete()
      .eq('id', relacion[0].id);
    
    if (eliminacionError) {
      throw new Error(`Error al eliminar la relación: ${eliminacionError.message}`);
    }
    
    // 3. Recalcular el precio total de la reparación
    const { data: todasIntervenciones, error: recalculoError } = await supabase
      .from('repair_intervention')
      .select('total_cost')
      .eq('repair_id', reparacionId);
    
    if (!recalculoError) {
      const nuevoTotal = todasIntervenciones.reduce((sum, item) => sum + (item.total_cost || 0), 0);
      
      await supabase
        .from('repair')
        .update({ price_total: nuevoTotal })
        .eq('id', reparacionId);
    }
    
    return { 
      success: true, 
      message: 'Intervención eliminada correctamente de la reparación'
    };
    
  } catch (error) {
    console.error('Error en eliminarIntervencionDeReparacionPersistencia:', error);
    return { 
      success: false, 
      error: error.message || 'Error al eliminar la intervención de la reparación'
    };
  }
};

// Aquí puedes agregar más funciones para trabajar con Supabase
