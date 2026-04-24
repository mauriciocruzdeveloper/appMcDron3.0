import { supabase } from './supabaseClient.js';
import { eliminarArchivoPersistencia } from './archivosPersistencia.js';
import { formatRepairPublicId } from '../../utils/publicIdHelper';

// Agregar una asignación de intervención a una reparación
// Se permiten múltiples asignaciones de la misma intervención
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

    if (intervencion.is_obsolete) {
      throw new Error('Esta intervención está marcada como obsoleta y no puede asignarse a nuevas reparaciones');
    }

    // 3. Obtener los repuestos asociados a esta intervención para calcular el costo
    const { data: partInterventions, error: partsError } = await supabase
      .from('part_intervention')
      .select(`
        part_id,
        quantity,
        part:part_id (price)
      `)
      .eq('intervention_id', intervencionId);

    if (partsError) {
      console.error('Error al obtener repuestos de intervención:', partsError);
    }

    // 4. Calcular el costo de repuestos basándose en los precios ACTUALES
    let parts_cost = 0;
    if (partInterventions && partInterventions.length > 0) {
      parts_cost = partInterventions.reduce((sum, item) => {
        const precio = item.part?.price || 0;
        const cantidad = item.quantity || 1;
        return sum + (precio * cantidad);
      }, 0);
    }

    // 5. Calcular el costo total
    const labor_cost = intervencion.labor_cost || 0;
    const total_cost = labor_cost + parts_cost;

    // 6. Insertar la nueva asignación de intervención con los costos calculados
    const { data: nuevaRelacion, error: insercionError } = await supabase
      .from('repair_intervention')
      .insert([
        {
          repair_id: reparacionId,
          intervention_id: intervencionId,
          labor_cost: labor_cost,
          parts_cost: parts_cost,
          total_cost: total_cost,
          status: 'pendiente' // Nueva asignación comienza como pendiente
        }
      ])
      .select();

    if (insercionError) {
      throw new Error(`Error al asociar la intervención: ${insercionError.message}`);
    }

    // 7. Actualizar el precio total de la reparación sumando todos los costos
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
      message: 'Asignación de intervención creada correctamente'
    };

  } catch (error) {
    console.error('Error en agregarIntervencionAReparacionPersistencia:', error);
    return {
      success: false,
      error: error.message || 'Error al crear la asignación de intervención'
    };
  }
};

// GET Asignaciones de intervenciones por reparación
// Retorna cada asignación con su ID único (repair_intervention.id)
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

    // Mapear las asignaciones tal cual están en la BD
    const intervenciones = data.map((item) => {
      return {
        id: String(item.id), // ID de la asignación (repair_intervention.id)
        data: {
          reparacionId: String(reparacionId),
          intervencionId: String(item.intervention.id),
          estado: item.status || 'pendiente', // Estado de la asignación
          PrecioManoObra: item.labor_cost || 0,
          PrecioPiezas: item.parts_cost || 0, // 0 significa sin repuesto en el presupuesto
          PrecioTotal: item.total_cost || 0,
          descripcion: item.description || '', // Descripción del problema
          fotos: item.photos || [] // Array de URLs de fotos
        }
      };
    });

    return intervenciones;

  } catch (error) {
    console.error('Error en getIntervencionesPorReparacionPersistencia:', error);
    throw error;
  }
};

// Eliminar intervención de reparación
// NOTA: asignacionId es el ID de la tabla repair_intervention, NO el ID de la intervención
export const eliminarIntervencionDeReparacionPersistencia = async (reparacionId, asignacionId) => {
  try {
    // 1. Obtener los datos de la asignación antes de eliminarla para acceder a las fotos
    const { data: asignacionData, error: consultaAsignacionError } = await supabase
      .from('repair_intervention')
      .select('photos')
      .eq('id', asignacionId)
      .eq('repair_id', reparacionId)
      .single();

    if (consultaAsignacionError) {
      console.error('Error al consultar asignación antes de eliminar:', consultaAsignacionError);
      // No bloqueamos la eliminación si falla la consulta, pero logueamos el error
    } else if (asignacionData && asignacionData.photos && asignacionData.photos.length > 0) {
      // Si tiene fotos, procedemos a eliminarlas del Storage
      try {
        const promesasEliminacion = asignacionData.photos.map(url => eliminarArchivoPersistencia(url));
        await Promise.all(promesasEliminacion);
        console.log(`Eliminadas ${asignacionData.photos.length} fotos asociadas a la asignación ${asignacionId}.`);
      } catch (errorFotos) {
        // No bloqueamos la eliminación del registro si falla borrar alguna foto, 
        // pero es importante saberlo para mantenimiento
        console.error('Error al eliminar fotos asociadas a la asignación:', errorFotos);
      }
    }

    // 2. Eliminar la asignación específica por su ID único
    const { error: eliminacionError } = await supabase
      .from('repair_intervention')
      .delete()
      .eq('id', asignacionId)
      .eq('repair_id', reparacionId); // Verificación adicional de seguridad

    if (eliminacionError) {
      throw new Error(`Error al eliminar la asignación: ${eliminacionError.message}`);
    }

    // 2. Recalcular el precio total de la reparación
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
      message: 'Asignación de intervención eliminada correctamente'
    };

  } catch (error) {
    console.error('Error en eliminarIntervencionDeReparacionPersistencia:', error);
    return {
      success: false,
      error: error.message || 'Error al eliminar la asignación de intervención'
    };
  }
};

// ACTUALIZAR ESTADO DE ASIGNACIÓN
export const actualizarEstadoAsignacionPersistencia = async (asignacionId, nuevoEstado) => {
  try {
    const { data, error } = await supabase
      .from('repair_intervention')
      .update({ status: nuevoEstado })
      .eq('id', asignacionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar estado: ${error.message}`);
    }

    return {
      success: true,
      data: data,
      message: 'Estado actualizado correctamente'
    };

  } catch (error) {
    console.error('Error en actualizarEstadoAsignacionPersistencia:', error);
    return {
      success: false,
      error: error.message || 'Error al actualizar el estado de la asignación'
    };
  }
};

// ACTUALIZAR DESCRIPCIÓN DE ASIGNACIÓN
export const actualizarDescripcionAsignacionPersistencia = async (asignacionId, descripcion) => {
  try {
    const { data, error } = await supabase
      .from('repair_intervention')
      .update({ description: descripcion })
      .eq('id', asignacionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar descripción: ${error.message}`);
    }

    return {
      success: true,
      data: data,
      message: 'Descripción actualizada correctamente'
    };

  } catch (error) {
    console.error('Error en actualizarDescripcionAsignacionPersistencia:', error);
    return {
      success: false,
      error: error.message || 'Error al actualizar la descripción de la asignación'
    };
  }
};

// ACTUALIZAR PRECIOS DE PIEZAS DE ASIGNACIÓN
// Recibe los valores ya calculados desde el thunk; solo persiste sin lógica.
export const actualizarPreciosPiezasAsignacionPersistencia = async (asignacionId, reparacionId, parts_cost, total_cost, nuevoPrecioReparacion) => {
  try {
    const { data, error } = await supabase
      .from('repair_intervention')
      .update({ parts_cost, total_cost })
      .eq('id', asignacionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar precios: ${error.message}`);
    }

    await supabase
      .from('repair')
      .update({ price_total: nuevoPrecioReparacion })
      .eq('id', reparacionId);

    return { success: true, data };
  } catch (error) {
    console.error('Error en actualizarPreciosPiezasAsignacionPersistencia:', error);
    return { success: false, error: error.message };
  }
};

// ACTUALIZAR FOTOS DE ASIGNACIÓN
export const actualizarFotosAsignacionPersistencia = async (asignacionId, fotos) => {
  try {
    // fotos debe ser un array de URLs
    if (!Array.isArray(fotos)) {
      throw new Error('El parámetro fotos debe ser un array');
    }

    const { data, error } = await supabase
      .from('repair_intervention')
      .update({ photos: fotos })
      .eq('id', asignacionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar fotos: ${error.message}`);
    }

    return {
      success: true,
      data: data,
      message: 'Fotos actualizadas correctamente'
    };

  } catch (error) {
    console.error('Error en actualizarFotosAsignacionPersistencia:', error);
    return {
      success: false,
      error: error.message || 'Error al actualizar las fotos de la asignación'
    };
  }
};

// GET todas las Reparaciones con suscripción en tiempo real
export const getReparacionesPersistencia = (setReparacionesToRedux, usuario) => {
  // Función para cargar los datos iniciales
  const cargarReparaciones = async () => {
    try {
      let query = supabase.from('repair').select(`
        id,
        created_at,
        state,
        priority,
        drone_id,
        drone_name,
        owner_id,
        drive_link,
        notes,
        contact_date,
        description,
        diagnosis,
        reception_date,
        repair_resume,
        price_labor,
        price_advance,
        price_total,
        price_diagnosis,
        completion_date,
        delivery_description,
        delivery_tracking,
        delivery_date,
        photo_urls,
        document_urls,
        photo_before,
        photo_after,
        parts_notes,
        requested_parts_ids,
        parent_repair_id,
        drone:drone_id (id),
        owner:owner_id (id, email, first_name, last_name, telephone)
      `);

      // Si el usuario no es administrador, filtrar por owner_id
      if (usuario?.data?.Role !== 'admin') {
        query = query.eq('owner_id', usuario.id);
      }

      // Ordenar por prioridad
      query = query.order('priority', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      // Obtener las intervenciones de todas las reparaciones en una sola consulta
      const reparacionIds = data.map(item => item.id);
      const { data: intervencionesData, error: intervencionesError } = await supabase
        .from('repair_intervention')
        .select('repair_id, intervention_id')
        .in('repair_id', reparacionIds);

      if (intervencionesError) {
        console.error('Error al obtener intervenciones:', intervencionesError);
      }

      // Crear un mapa de reparación -> intervenciones
      const intervencionesMap = {};
      if (intervencionesData) {
        intervencionesData.forEach(rel => {
          const repairId = String(rel.repair_id);
          if (!intervencionesMap[repairId]) {
            intervencionesMap[repairId] = [];
          }
          intervencionesMap[repairId].push(String(rel.intervention_id));
        });
      }

      // Transformar los datos al formato esperado por el frontend
      const reparaciones = data.map(item => ({
        id: String(item.id),
        data: {
          EstadoRep: item.state,
          PrioridadRep: item.priority,
          FeAltaRep: item.created_at ? new Date(item.created_at).getTime() : null,
          IdPublicoRep: item.public_id || (item.created_at ? formatRepairPublicId(item.id, item.created_at) : undefined),
          DroneId: item.drone?.id ? String(item.drone.id) : '',
          ModeloDroneNameRep: item.drone_name || '',
          NombreUsu: item.owner?.first_name || '',
          ApellidoUsu: item.owner?.last_name || '',
          UsuarioRep: item.owner_id ? String(item.owner_id) : '',
          DriveRep: item.drive_link || '',
          AnotacionesRep: item.notes || '',
          FeConRep: item.contact_date,
          EmailUsu: item.owner?.email || '',
          TelefonoUsu: item.owner?.telephone || '',
          DescripcionUsuRep: item.description || '',
          DiagnosticoRep: item.diagnosis || '',
          FeRecRep: item.reception_date,
          DescripcionTecRep: item.repair_resume || '',
          PresuMoRep: item.price_labor || 0,
          AdelantoRep: item.price_advance || 0,
          PresuFiRep: item.price_total || 0,
          PresuDiRep: item.price_diagnosis || 0,
          TxtRepuestosRep: '',  // No hay equivalente directo
          InformeRep: item.repair_resume || '',
          FeFinRep: item.completion_date || 0,
          FeEntRep: item.delivery_date || 0,
          TxtEntregaRep: item.delivery_description || '',
          SeguimientoEntregaRep: item.delivery_tracking || '',
          urlsFotos: item.photo_urls || [],
          urlsDocumentos: item.document_urls || [],
          IntervencionesIds: intervencionesMap[String(item.id)] || [],  // IDs de intervenciones desde la tabla intermedia
          FotoAntes: item.photo_before || undefined,  // Mapeo de BD a frontend
          FotoDespues: item.photo_after || undefined,  // Mapeo de BD a frontend
          ObsRepuestos: item.parts_notes || undefined,  // Mapeo de BD a frontend - NUEVO
          RepuestosSolicitados: item.requested_parts_ids || undefined,  // Mapeo de BD a frontend - NUEVO
          ParentRepairId: item.parent_repair_id ? String(item.parent_repair_id) : undefined
        }
      }));

      // Actualizar el estado en Redux
      setReparacionesToRedux(reparaciones);
    } catch (error) {
      console.error("Error al cargar reparaciones:", error);
    }
  };

  // Cargar datos iniciales
  cargarReparaciones();

  // Configurar la suscripción en tiempo real
  const channel = supabase
    .channel('reparaciones-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'repair'
    }, (payload) => {
      console.log('Cambio detectado en reparaciones:', payload);
      // Cuando hay cambios, recargamos todos los datos
      cargarReparaciones();
    })
    .subscribe();

  // Devolver función para cancelar la suscripción
  return () => {
    supabase.removeChannel(channel);
  };
};

// GET Reparación por id
export const getReparacionPersistencia = async (id) => {
  try {
    const { data, error } = await supabase
      .from('repair')
      .select(`
        *,
        drone:drone_id (*),
        owner:owner_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error('Reparación no encontrada');
    }

    // Obtener las intervenciones asociadas a esta reparación
    const { data: intervencionesData, error: intervencionesError } = await supabase
      .from('repair_intervention')
      .select('intervention_id')
      .eq('repair_id', id);

    if (intervencionesError) {
      console.error('Error al obtener intervenciones de la reparación:', intervencionesError);
    }

    const intervencionesIds = intervencionesData ? intervencionesData.map(rel => String(rel.intervention_id)) : [];

    // Transformar al formato esperado por el frontend
    return {
      id: String(data.id),
      data: {
        EstadoRep: data.state,
        PrioridadRep: data.priority,
        FeAltaRep: data.created_at ? new Date(data.created_at).getTime() : null,
        IdPublicoRep: data.public_id || (data.created_at ? formatRepairPublicId(data.id, data.created_at) : undefined),
        DroneId: data.drone?.id ? String(data.drone.id) : '',
        ModeloDroneNameRep: data.drone_name || '',
        NombreUsu: data.owner?.first_name || '',
        ApellidoUsu: data.owner?.last_name || '',
        UsuarioRep: data.owner_id ? String(data.owner_id) : '',
        DriveRep: data.drive_link || '',
        AnotacionesRep: data.notes || '',
        FeConRep: data.contact_date,
        EmailUsu: data.owner?.email || '',
        TelefonoUsu: data.owner?.telephone || '',
        DescripcionUsuRep: data.description || '',
        DiagnosticoRep: data.diagnosis || '',
        FeRecRep: data.reception_date,
        DescripcionTecRep: data.repair_resume || '',
        PresuMoRep: data.price_labor || 0,
        AdelantoRep: data.price_advance || 0,
        PresuFiRep: data.price_total || 0,
        PresuDiRep: data.price_diagnosis || 0,
        TxtRepuestosRep: '',  // No hay equivalente directo
        InformeRep: data.repair_resume || '',
        FeFinRep: 0,  // No hay equivalente directo
        FeEntRep: 0,  // No hay equivalente directo
        TxtEntregaRep: data.delivery_description || '',
        SeguimientoEntregaRep: data.delivery_tracking || '',
        urlsFotos: data.photo_urls || [],
        urlsDocumentos: data.document_urls || [],
        IntervencionesIds: intervencionesIds,  // IDs de intervenciones asociadas
        FotoAntes: data.photo_before || undefined,  // Mapeo de BD a frontend
        FotoDespues: data.photo_after || undefined,  // Mapeo de BD a frontend
        ParentRepairId: data.parent_repair_id ? String(data.parent_repair_id) : undefined
      }
    };
  } catch (error) {
    console.error("Error al obtener reparación:", error);
    throw error;
  }
};

// GUARDAR Reparación
export const guardarReparacionPersistencia = async (reparacion) => {
  try {
    // Validar campos de repuestos ANTES de guardar
    if (reparacion.data.ObsRepuestos && reparacion.data.ObsRepuestos.length > 2000) {
      throw new Error('Las observaciones de repuestos no pueden superar los 2000 caracteres');
    }
    
    if (reparacion.data.RepuestosSolicitados && reparacion.data.RepuestosSolicitados.length > 50) {
      throw new Error('No se pueden solicitar más de 50 repuestos por reparación');
    }
    
    // Transformar el objeto al formato de Supabase
    const reparacionData = {
      state: reparacion.data.EstadoRep,
      priority: reparacion.data.PrioridadRep,
      drone_id: reparacion.data.DroneId || null,
      drone_name: reparacion.data.ModeloDroneNameRep || '',
      owner_id: reparacion.data.UsuarioRep,
      drive_link: reparacion.data.DriveRep,
      notes: reparacion.data.AnotacionesRep,
      contact_date: reparacion.data.FeConRep || null,
      description: reparacion.data.DescripcionUsuRep,
      diagnosis: reparacion.data.DiagnosticoRep,
      reception_date: reparacion.data.FeRecRep || null,
      repair_resume: reparacion.data.DescripcionTecRep,
      price_labor: reparacion.data.PresuMoRep,
      price_advance: reparacion.data.AdelantoRep,
      price_total: reparacion.data.PresuFiRep,
      price_diagnosis: reparacion.data.PresuDiRep,
      completion_date: reparacion.data.FeFinRep || null,
      delivery_date: reparacion.data.FeEntRep || null,
      delivery_description: reparacion.data.TxtEntregaRep,
      delivery_tracking: reparacion.data.SeguimientoEntregaRep,
      photo_urls: reparacion.data.urlsFotos,
      document_urls: reparacion.data.urlsDocumentos,
      photo_before: reparacion.data.FotoAntes || null,  // Mapeo de frontend a BD
      photo_after: reparacion.data.FotoDespues || null,   // Mapeo de frontend a BD
      parts_notes: reparacion.data.ObsRepuestos || null,  // Mapeo de frontend a BD - NUEVO
      requested_parts_ids: reparacion.data.RepuestosSolicitados || null,  // Mapeo de frontend a BD - NUEVO
      parent_repair_id: reparacion.data.ParentRepairId ? parseInt(reparacion.data.ParentRepairId) : null
    };
    
    console.log('🔍 GUARDANDO REPARACION:', {
      id: reparacion.id,
      'Frontend FotoAntes': reparacion.data.FotoAntes,
      'Frontend FotoDespues': reparacion.data.FotoDespues,
      'BD photo_before': reparacionData.photo_before,
      'BD photo_after': reparacionData.photo_after
    });
    console.log('Datos para Supabase:', reparacionData);
    console.log('drone_id que se enviará:', reparacionData.drone_id);

    let result;

    if (reparacion.id) {
      // Actualización
      console.log('Actualizando reparación con ID:', reparacion.id);
      const { data, error } = await supabase
        .from('repair')
        .update(reparacionData)
        .eq('id', reparacion.id)
        .select();

      if (error) {
        console.error('❌ Error en actualización:', error);
        console.error('❌ Detalles del error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      result = data[0];
      console.log('✅ Actualización exitosa. Datos guardados:', {
        id: result.id,
        photo_before: result.photo_before,
        photo_after: result.photo_after
      });
    } else {
      // Inserción
      console.log('Insertando nueva reparación');
      const { data, error } = await supabase
        .from('repair')
        .insert(reparacionData)
        .select();

      if (error) {
        console.error('Error en inserción:', error);
        throw error;
      }
      result = data[0];

      // Computar y guardar el public_id usando el id recién generado
      if (result && result.id && result.created_at) {
        const publicId = formatRepairPublicId(result.id, result.created_at);
        await supabase
          .from('repair')
          .update({ public_id: publicId })
          .eq('id', result.id);
        result.public_id = publicId;
      }
    }

    console.log('Resultado de la operación:', result);
    console.log('drone_id guardado:', result?.drone_id);

    if (!result) {
      throw new Error('No se pudo guardar la reparación');
    }

    // Mapear IdPublicoRep desde la BD
    const updatedData = { ...reparacion.data };
    if (result.public_id) {
      updatedData.IdPublicoRep = result.public_id;
    }
    if (result.created_at) {
      updatedData.FeAltaRep = new Date(result.created_at).getTime();
    }

    return {
      id: String(result.id),
      data: updatedData
    };
  } catch (error) {
    console.error("Error al guardar reparación:", error);
    throw error;
  }
};

// ACTUALIZAR SOLO ESTADO, PRIORIDAD Y FECHAS de una reparación
// NO toca los campos de precio para evitar sobrescribir valores pendientes del debounce
export const actualizarEstadoReparacionPersistencia = async (id, camposEstado) => {
  try {
    // Filtrar undefined para que no se envíen al UPDATE (preservar valores existentes)
    const datos = Object.fromEntries(
      Object.entries(camposEstado).filter(([, v]) => v !== undefined && v !== null)
    );

    const { data, error } = await supabase
      .from('repair')
      .update(datos)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al actualizar estado:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en actualizarEstadoReparacionPersistencia:', error);
    throw error;
  }
};

// DELETE Reparación por id
export const eliminarReparacionPersistencia = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Importar función de archivos para eliminar archivos
      const { eliminarArchivoPersistencia } = await import('./archivosPersistencia.js');

      // 1. Primero verificamos si hay relaciones en repair_intervention y obtenemos sus fotos
      const { data: relacionesIntervenciones, error: errorRelaciones } = await supabase
        .from('repair_intervention')
        .select('id, photos')
        .eq('repair_id', id);

      if (errorRelaciones) throw errorRelaciones;

      // 2. Si existen relaciones, eliminamos primero las fotos de cada asignación del Storage y luego los registros
      if (relacionesIntervenciones && relacionesIntervenciones.length > 0) {
        // Eliminar fotos de cada asignación del Storage antes de borrar los registros
        for (const intervencion of relacionesIntervenciones) {
          if (intervencion.photos && intervencion.photos.length > 0) {
            for (const url of intervencion.photos) {
              try {
                await eliminarArchivoPersistencia(url);
              } catch (error) {
                console.error(`Error al eliminar foto de asignación: ${url}`, error);
              }
            }
          }
        }

        const { error: errorBorradoRelaciones } = await supabase
          .from('repair_intervention')
          .delete()
          .eq('repair_id', id);

        if (errorBorradoRelaciones) throw errorBorradoRelaciones;
      }

      // 3. Ahora eliminamos la reparación
      // 3.1 Eliminar fotos y documentos relacionados
      const { data: reparacion, error: errorReparacion } = await supabase
        .from('repair')
        .select('photo_urls, document_urls')
        .eq('id', id)
        .single();

      if (errorReparacion) throw errorReparacion;

      if (reparacion.photo_urls) {
        for (const url of reparacion.photo_urls) {
          try {
            await eliminarArchivoPersistencia(url);
          } catch (error) {
            console.error(`Error al eliminar foto: ${url}`, error);
          }
        }
      }

      if (reparacion.document_urls) {
        for (const url of reparacion.document_urls) {
          try {
            await eliminarArchivoPersistencia(url);
          } catch (error) {
            console.error(`Error al eliminar documento: ${url}`, error);
          }
        }
      }

      // 3.2 Ahora eliminamos la reparación
      const { error: errorBorrado } = await supabase
        .from('repair')
        .delete()
        .eq('id', id);

      if (errorBorrado) throw errorBorrado;

      console.log('Reparación eliminada correctamente');
      resolve(id);
    } catch (error) {
      console.error('Error al eliminar reparación:', error);
      reject(error);
    }
  });
};

