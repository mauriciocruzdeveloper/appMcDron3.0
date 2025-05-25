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

    // Para cada intervención, obtenemos los repuestos asociados
    const intervenciones = await Promise.all(data.map(async (item) => {
      // Obtenemos los repuestos asociados a esta intervención
      const { data: partInterventions, error: partsError } = await supabase
        .from('part_intervention')
        .select('part_id')
        .eq('intervention_id', item.intervention.id);

      if (partsError) {
        console.error('Error al obtener repuestos de intervención:', partsError);
      }

      // Extraemos los IDs de los repuestos
      const repuestosIds = partInterventions ? partInterventions.map(rel => rel.part_id) : [];

      return {
        id: item.intervention.id,
        data: {
          NombreInt: item.intervention.name,
          DescripcionInt: item.intervention.description || '',
          ModeloDroneId: item.intervention.drone_model_id,
          RepuestosIds: repuestosIds,
          PrecioManoObra: item.labor_cost || item.intervention.labor_cost || 0,
          PrecioTotal: item.total_cost || item.intervention.total_cost || 0,
          DuracionEstimada: item.intervention.estimated_duration || 30
        },
        // Guardamos los datos de la relación por si son útiles
        relationData: {
          id: item.id,
          labor_cost: item.labor_cost,
          parts_cost: item.parts_cost,
          total_cost: item.total_cost
        }
      };
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
        owner_id,
        drive_link,
        notes,
        contact_date,
        description,
        diagnosis,
        reception_date,
        repair_resume,
        price_labor,
        price_parts,
        price_total,
        price_diagnosis,
        delivery_description,
        delivery_tracking,
        photo_urls,
        document_urls,
        drone:drone_id (id, number_series),
        owner:owner_id (id, email, first_name, last_name, telephone)
      `);

      // Si el usuario no es administrador, filtrar por owner_id
      if (!usuario?.data?.Admin) {
        query = query.eq('owner_id', usuario.id);
      }

      // Ordenar por prioridad
      query = query.order('priority', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      // Transformar los datos al formato esperado por el frontend
      const reparaciones = data.map(item => ({
        id: item.id,
        data: {
          EstadoRep: item.state,
          PrioridadRep: item.priority,
          DroneRep: item.drone?.number_series || '',
          NombreUsu: item.owner?.first_name || '',
          ApellidoUsu: item.owner?.last_name || '',
          UsuarioRep: item.owner_id,
          DriveRep: item.drive_link || '',
          AnotacionesRep: item.notes || '',
          FeConRep: item.contact_date,
          EmailUsu: item.owner?.email || '',
          TelefonoUsu: item.owner?.telephone || '',
          DescripcionUsuRep: item.description || '',
          DiagnosticoRep: item.diagnosis || '',
          FeRecRep: item.reception_date,
          NumeroSerieRep: item.drone?.number_series || '',
          DescripcionTecRep: item.repair_resume || '',
          PresuMoRep: item.price_labor || 0,
          PresuReRep: item.price_parts || 0,
          PresuFiRep: item.price_total || 0,
          PresuDiRep: item.price_diagnosis || 0,
          TxtRepuestosRep: '',  // No hay equivalente directo
          InformeRep: item.repair_resume || '',
          FeFinRep: 0,  // No hay equivalente directo
          FeEntRep: 0,  // No hay equivalente directo
          TxtEntregaRep: item.delivery_description || '',
          SeguimientoEntregaRep: item.delivery_tracking || '',
          urlsFotos: item.photo_urls || [],
          urlsDocumentos: item.document_urls || [],
          IntervencionesIds: []  // Obtendremos estos de otra consulta
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

    // Transformar al formato esperado por el frontend
    return {
      id: data.id,
      data: {
        EstadoRep: data.state,
        PrioridadRep: data.priority,
        DroneRep: data.drone?.number_series || '',
        NombreUsu: data.owner?.first_name || '',
        ApellidoUsu: data.owner?.last_name || '',
        UsuarioRep: data.owner_id,
        DriveRep: data.drive_link || '',
        AnotacionesRep: data.notes || '',
        FeConRep: data.contact_date,
        EmailUsu: data.owner?.email || '',
        TelefonoUsu: data.owner?.telephone || '',
        DescripcionUsuRep: data.description || '',
        DiagnosticoRep: data.diagnosis || '',
        FeRecRep: data.reception_date,
        NumeroSerieRep: data.drone?.number_series || '',
        DescripcionTecRep: data.repair_resume || '',
        PresuMoRep: data.price_labor || 0,
        PresuReRep: data.price_parts || 0,
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
        IntervencionesIds: []  // Obtendremos estos de otra consulta
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
    // Transformar el objeto al formato de Supabase
    const reparacionData = {
      state: reparacion.data.EstadoRep,
      priority: reparacion.data.PrioridadRep,
      drone_id: null, // Se obtendría del drone con número de serie DroneRep
      owner_id: reparacion.data.UsuarioRep,
      drive_link: reparacion.data.DriveRep,
      notes: reparacion.data.AnotacionesRep,
      contact_date: reparacion.data.FeConRep,
      description: reparacion.data.DescripcionUsuRep,
      diagnosis: reparacion.data.DiagnosticoRep,
      reception_date: reparacion.data.FeRecRep,
      repair_resume: reparacion.data.DescripcionTecRep,
      price_labor: reparacion.data.PresuMoRep,
      price_parts: reparacion.data.PresuReRep,
      price_total: reparacion.data.PresuFiRep,
      price_diagnosis: reparacion.data.PresuDiRep,
      delivery_description: reparacion.data.TxtEntregaRep,
      delivery_tracking: reparacion.data.SeguimientoEntregaRep,
      photo_urls: reparacion.data.urlsFotos,
      document_urls: reparacion.data.urlsDocumentos
    };

    let result;

    if (reparacion.id) {
      // Actualización
      const { data, error } = await supabase
        .from('repair')
        .update(reparacionData)
        .eq('id', reparacion.id)
        .select();

      if (error) throw error;
      result = data[0];
    } else {
      // Inserción
      const { data, error } = await supabase
        .from('repair')
        .insert(reparacionData)
        .select();

      if (error) throw error;
      result = data[0];
    }

    return {
      id: result.id,
      data: reparacion.data
    };
  } catch (error) {
    console.error("Error al guardar reparación:", error);
    throw error;
  }
};

// DELETE Reparación por id
export const eliminarReparacionPersistencia = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Primero verificamos si hay relaciones en repair_intervention
      const { data: relacionesIntervenciones, error: errorRelaciones } = await supabase
        .from('repair_intervention')
        .select('id')
        .eq('repair_id', id);

      if (errorRelaciones) throw errorRelaciones;

      // 2. Si existen relaciones, las eliminamos primero
      if (relacionesIntervenciones && relacionesIntervenciones.length > 0) {
        const { error: errorBorradoRelaciones } = await supabase
          .from('repair_intervention')
          .delete()
          .eq('repair_id', id);

        if (errorBorradoRelaciones) throw errorBorradoRelaciones;
      }

      // 3. Ahora eliminamos la reparación
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

// GET todos los usuarios con suscripción en tiempo real
export const getUsuariosPersistencia = (setUsuariosToRedux) => {
  console.log('getUsuariosPersistencia con Supabase');

  // Función para cargar los datos iniciales
  const cargarUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('user')
        .select(`
          id,
          email,
          first_name,
          last_name,
          telephone,
          address,
          city,
          state,
          is_admin
        `)
        .order('first_name');

      if (error) throw error;

      // Transformar los datos al formato esperado por el frontend
      const usuarios = data.map(item => ({
        id: item.id,
        data: {
          EmailUsu: item.email,
          NombreUsu: item.first_name || '',
          ApellidoUsu: item?.last_name || '',
          TelefonoUsu: item?.telephone || '',
          DireccionUsu: item?.address || '',
          CiudadUsu: item?.city || '',
          ProvinciaUsu: item?.state || '',
          Admin: item?.is_admin || false
        }
      }));

      // Actualizar el estado en Redux
      setUsuariosToRedux(usuarios);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  // Cargar datos iniciales
  cargarUsuarios();

  // Configurar la suscripción en tiempo real
  const channel = supabase
    .channel('usuarios-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'user'
    }, (payload) => {
      console.log('Cambio detectado en usuarios:', payload);
      // Cuando hay cambios, recargamos todos los datos
      cargarUsuarios();
    })
    .subscribe();

  // Devolver función para cancelar la suscripción
  return () => {
    supabase.removeChannel(channel);
  };
};

// GET Cliente por id
export const getClientePersistencia = async (id) => {
  try {
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error('Usuario no encontrado');
    }

    // Transformar al formato esperado por el frontend
    return {
      id: data.id,
      data: {
        EmailUsu: data.email,
        NombreUsu: data.first_name || '',
        ApellidoUsu: data.last_name || '',
        TelefonoUsu: data.telephone || '',
        DireccionUsu: data.address || '',
        CiudadUsu: data.city || '',
        ProvinciaUsu: data.state || '',
        Admin: data.is_admin || false
      }
    };
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    throw error;
  }
};

// GET Cliente por email
export const getClientePorEmailPersistencia = async (email) => {
  try {
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      // Si es un error de "no data found", retornamos null
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    if (!data) return null;

    // Transformar al formato esperado por el frontend
    return {
      id: data.id,
      data: {
        EmailUsu: data.email,
        NombreUsu: data.first_name || '',
        ApellidoUsu: data.last_name || '',
        TelefonoUsu: data.telephone || '',
        DireccionUsu: data.address || '',
        CiudadUsu: data.city || '',
        ProvinciaUsu: data.state || '',
        Admin: data.is_admin || false
      }
    };
  } catch (error) {
    console.error("Error al obtener cliente por email:", error);
    throw error;
  }
};

// GUARDAR Cliente
export const guardarUsuarioPersistencia = async (usuario) => {
  try {
    // Preparar datos para Supabase
    const userData = {
      email: usuario.data.EmailUsu,
      name: usuario.data.NombreUsu || '',
      last_name: usuario.data.ApellidoUsu || '',
      telephone: usuario.data.TelefonoUsu || '',
      address: usuario.data.DireccionUsu || '',
      city: usuario.data.CiudadUsu || '',
      state: usuario.data.ProvinciaUsu || '',
      is_admin: usuario.data.Admin || false
    };

    let result;

    if (usuario.id) {
      // Actualización
      const { data, error } = await supabase
        .from('user')
        .update(userData)
        .eq('id', usuario.id)
        .select();

      if (error) throw error;
      result = data[0];

      // En lugar de actualizar los datos en las reparaciones, confiar en las relaciones
      // y joins para obtener la información actualizada del usuario
    } else {
      // Inserción
      const { data, error } = await supabase
        .from('user')
        .insert({
          ...userData,
          // Adicional para nuevos usuarios
          created_at: new Date()
        })
        .select();

      if (error) throw error;
      result = data[0];
    }

    return {
      id: result.id,
      data: usuario.data
    };
  } catch (error) {
    console.error("Error al guardar usuario:", error);
    throw error;
  }
};

// DELETE Usuario/Cliente
export const eliminarUsuarioPersistencia = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Primero verificamos si hay reparaciones asociadas al usuario
      const { data: reparacionesAsociadas, error: errorReparaciones } = await supabase
        .from('repair')
        .select('id')
        .eq('owner_id', id);

      if (errorReparaciones) throw errorReparaciones;

      if (reparacionesAsociadas && reparacionesAsociadas.length > 0) {
        reject({
          code: 'No se puede borrar este usuario. Reparación relacionada: ' +
            reparacionesAsociadas.map(rep => rep.id).toString()
        });
        return;
      }

      // 2. Verificar si hay drones asociados al usuario como propietario
      const { data: dronesAsociados, error: errorDrones } = await supabase
        .from('drone')
        .select('id, number_series')
        .eq('owner_id', id);

      if (errorDrones) throw errorDrones;

      if (dronesAsociados && dronesAsociados.length > 0) {
        reject({
          code: 'No se puede borrar este usuario. Drone relacionado: ' +
            dronesAsociados.map(drone => drone.number_series || drone.id).toString()
        });
        return;
      }

      // 3. Si no hay dependencias, procedemos a eliminar
      const { error: errorEliminacion } = await supabase
        .from('user')
        .delete()
        .eq('id', id);

      if (errorEliminacion) throw errorEliminacion;

      console.log('Usuario eliminado correctamente');
      resolve(id);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      reject(error);
    }
  });
};

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
    const modelosDroneIds = partDroneModels.map(rel => rel.drone_model.id);
    
    // 3. Transformar al formato esperado por el frontend
    return {
      id: data.id,
      data: {
        NombreRepu: data.name,
        DescripcionRepu: data.description || '',
        ModeloDrones: partDroneModels || [],
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
    const repuestosIds = relacionesPartDroneModel.map(rel => rel.part_id);

    // 3. Obtener la información completa de los repuestos
    const { data, error } = await supabase
      .from('part')
      .select('*')
      .in('id', repuestosIds);

    if (error) throw error;

    // 4. Transformar al formato esperado por el frontend
    const repuestos = data.map(item => ({
      id: item.id,
      data: {
        NombreRepu: item.name,
        DescripcionRepu: item.description || '',
        ModeloDroneRepu: 'Múltiple', // Ahora un repuesto puede estar asociado a múltiples modelos
        ModelosDroneIds: [modeloDroneId], // Incluimos el modelo que estamos consultando
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
      id: item.id,
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

    // 4. Obtener los modelos asociados para el retorno
    const { data: droneModels, error: modelsError } = await supabase
      .from('part_drone_model')
      .select(`
        drone_model:drone_model_id (*)
      `)
      .eq('part_id', result.id);
    
    // 5. Devolver el resultado en formato esperado por el frontend
    return {
      id: result.id,
      data: {
        NombreRepu: result.name,
        DescripcionRepu: result.description || '',
        ModeloDrones: droneModels || [],
        ModelosDroneIds: repuesto.data.ModelosDroneIds || [],
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
      const { error: errorEliminacion } = await supabase
        .from('part')
        .delete()
        .eq('id', id);

      if (errorEliminacion) throw errorEliminacion;

      resolve(id);
    } catch (error) {
      console.error('Error al eliminar repuesto:', error);
      reject(error);
    }
  });
};

// GET todos los Repuestos con suscripción en tiempo real
export const getRepuestosPersistencia = async (setRepuestosToRedux) => {
  console.log('getRepuestosPersistencia con Supabase');

  // Función para cargar los datos iniciales
  const cargarRepuestos = async () => {
    try {
      // 1. Obtener todos los repuestos
      const { data, error } = await supabase
        .from('part')
        .select('*')
        .order('name');

      if (error) throw error;

      // 2. Para cada repuesto, obtener sus modelos de drone asociados
      const repuestos = [];

      for (const repuesto of data) {
        // Obtener los modelos de drone asociados
        const { data: partDroneModels, error: relError } = await supabase
          .from('part_drone_model')
          .select(`
            drone_model:drone_model_id (*)
          `)
          .eq('part_id', repuesto.id);

        if (relError) throw relError;

        // Extraer los IDs de los modelos y determinar ModeloDroneRepu
        const modelosDroneIds = partDroneModels.map(rel => rel.drone_model.id);

        console.log('partDroneModels:', partDroneModels);

        // Añadir a la lista de repuestos
        repuestos.push({
          id: repuesto.id,
          data: {
            NombreRepu: repuesto.name,
            DescripcionRepu: repuesto.description || '',
            ModeloDrones: partDroneModels || [],
            ModelosDroneIds: modelosDroneIds,
            ProveedorRepu: repuesto.provider || '',
            PrecioRepu: repuesto.price || 0,
            StockRepu: repuesto.stock || 0,
            UnidadesPedidas: repuesto.backorder || 0
          }
        });
      }

      // Actualizar el estado en Redux
      setRepuestosToRedux(repuestos);
    } catch (error) {
      console.error("Error al cargar repuestos:", error);
      throw error;
    }
  };

  // Cargar datos iniciales
  cargarRepuestos();

  // Configurar la suscripción en tiempo real
  const channel = supabase
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
    .subscribe();

  // Devolver función para cancelar la suscripción
  return () => {
    supabase.removeChannel(channel);
  };
};

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
      id: data.id,
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
      id: item.id,
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
      id: result.id,
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
export const getModelosDronePersistencia = (setModelosDroneToRedux) => {
  console.log('getModelosDronePersistencia con Supabase');

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
        id: item.id,
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
      id: data.id,
      data: {
        NumeroSerie: data.number_series || '',
        ModeloDroneId: data.drone_model_id || '',
        ModeloDroneRepu: data.drone_model?.name || '',
        Propietario: data.owner_id || '',
        Observaciones: data.observations || ''
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
      id: item.id,
      data: {
        NumeroSerie: item.number_series || '',
        ModeloDroneId: item.drone_model_id || '',
        ModeloDroneRepu: item.drone_model?.name || '',
        Propietario: item.owner_id || '',
        Observaciones: item.observations || ''
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
      id: item.id,
      data: {
        NumeroSerie: item.number_series || '',
        ModeloDroneId: item.drone_model_id || '',
        ModeloDroneRepu: item.drone_model?.name || '',
        Propietario: item.owner_id || '',
        Observaciones: item.observations || ''
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
      number_series: drone.data.NumeroSerie || '',
      drone_model_id: drone.data.ModeloDroneId || null,
      owner_id: drone.data.Propietario || null,
      observations: drone.data.Observaciones || ''
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
      id: result.id,
      data: {
        NumeroSerie: result.number_series || '',
        ModeloDroneId: result.drone_model_id || '',
        ModeloDroneRepu: result.drone_model?.name || '',
        Propietario: result.owner_id || '',
        Observaciones: result.observations || ''
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
export const getDronesPersistencia = (setDronesToRedux) => {
  console.log('getDronesPersistencia con Supabase');

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
        .order('number_series');

      if (error) throw error;

      // Transformar los datos al formato esperado por el frontend
      const drones = data.map(item => ({
        id: item.id,
        data: {
          NumeroSerie: item.number_series || '',
          ModeloDroneId: item.drone_model_id || '',
          ModeloDroneRepu: item.drone_model?.name || '',
          Propietario: item.owner_id || '',
          Observaciones: item.observations || ''
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

/////// OBTENER DATOS PARA LA PRESENTACIÓN DESDE LA PERSISTENCIA ////////////////////
// Todos los datos deberían provenir desde la persistencia.
// Estas funciones cargan los en la app.

// Método 1: Mantener los mismos datos locales como en Firebase
import { provincias } from '../datos/provincias.json';
import { localidades } from '../datos/localidades.json';

// Obtengo las provincias desde un archivo propio
export const getProvinciasSelectPersistencia = () => {
  console.log('getProvinciasSelectPersistencia con Supabase');
  return new Promise((resolve, reject) => {
    try {
      resolve(provincias.map(provincia => {
        return {
          value: provincia.provincia,
          label: provincia.provincia
        }
      }))
    } catch (error) {
      console.error('Error al obtener provincias:', error);
      reject(error);
    }
  });
}

// Obtengo las localidades por provincia
export const getLocPorProvPersistencia = (provincia) => {
  console.log('getLocPorProvPersistencia con Supabase');
  return new Promise((resolve, reject) => {
    try {
      const localidadesFiltradas = localidades.filter(localidad => (
        localidad.provincia.nombre == provincia
      )).map(localidad => {
        return {
          value: localidad.nombre,
          label: localidad.nombre
        }
      });
      resolve(localidadesFiltradas);
    } catch (error) {
      console.error('Error al obtener localidades:', error);
      reject(error);
    }
  });
};

// Método 2 (alternativo): Si ya hay tablas en Supabase, usar este código:
/*
// Obtengo las provincias desde Supabase
export const getProvinciasSelectPersistencia = async () => {
  console.log('getProvinciasSelectPersistencia con Supabase');
  try {
    const { data, error } = await supabase
      .from('provincias')
      .select('*')
      .order('nombre');
    
    if (error) throw error;
    
    return data.map(provincia => ({
      value: provincia.nombre,
      label: provincia.nombre
    }));
  } catch (error) {
    console.error('Error al obtener provincias:', error);
    throw error;
  }
};

// Obtengo las localidades por provincia
export const getLocPorProvPersistencia = async (provincia) => {
  console.log('getLocPorProvPersistencia con Supabase');
  try {
    const { data, error } = await supabase
      .from('localidades')
      .select('*')
      .eq('provincia', provincia)
      .order('nombre');
    
    if (error) throw error;
    
    return data.map(localidad => ({
      value: localidad.nombre,
      label: localidad.nombre
    }));
  } catch (error) {
    console.error('Error al obtener localidades por provincia:', error);
    throw error;
  }
};
*/

////////////////////// INTERVENCIONES ///////////////////////////////////////////////////////////////////////////

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
    const repuestosIds = partInterventions.map(rel => rel.part_id);
    const partsCost = partInterventions.reduce((sum, rel) => {
      const quantity = rel.quantity || 1;
      const price = rel.part?.price || 0;
      return sum + (quantity * price);
    }, 0);

    // Transformar al formato esperado por el frontend
    return {
      id: data.id,
      data: {
        NombreInt: data.name,
        DescripcionInt: data.description || '',
        ModeloDroneId: data.drone_model_id,
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
      const repuestosIds = partInterventions.map(rel => rel.part_id);

      // Añadir a la lista de intervenciones
      intervenciones.push({
        id: intervencion.id,
        data: {
          NombreInt: intervencion.name,
          DescripcionInt: intervencion.description || '',
          ModeloDroneId: intervencion.drone_model_id,
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

      // Calcular el costo total de las partes
      const partsCost = repuestos.reduce((sum, repuesto) => {
        // Si el repuesto está en la lista de RepuestosIds
        if (intervencion.data.RepuestosIds.includes(repuesto.id)) {
          return sum + (repuesto.price || 0);
        }
        return sum;
      }, 0);

      // Actualizar el costo total en la intervención
      const laborCost = intervencionData.labor_cost || 0;
      const totalCost = laborCost + partsCost;

      const { error: updateError } = await supabase
        .from('intervention')
        .update({
          parts_cost: partsCost,
          total_cost: totalCost
        })
        .eq('id', intervencionId);

      if (updateError) throw updateError;

      // Actualizar el resultado con los nuevos costos calculados
      intervencionResult.parts_cost = partsCost;
      intervencionResult.total_cost = totalCost;
    }

    // 4. Devolver el resultado en el formato esperado por el frontend
    return {
      id: intervencionResult.id,
      data: {
        NombreInt: intervencionResult.name,
        DescripcionInt: intervencionResult.description || '',
        ModeloDroneId: intervencionResult.drone_model_id,
        RepuestosIds: intervencion.data.RepuestosIds || [],
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
export const getIntervencionesPersistencia = (setIntervencionesToRedux) => {
  console.log('getIntervencionesPersistencia con Supabase');

  // Función para cargar los datos iniciales
  const cargarIntervenciones = async () => {
    try {
      // 1. Obtener todas las intervenciones
      const { data, error } = await supabase
        .from('intervention')
        .select(`
          *,
          drone_model:drone_model_id (*)
        `)
        .order('name');

      if (error) throw error;

      // 2. Para cada intervención, obtener sus repuestos asociados de la tabla part_intervention
      const intervenciones = [];

      for (const intervencion of data) {
        // Obtener los repuestos asociados
        const { data: partInterventions, error: relError } = await supabase
          .from('part_intervention')
          .select('part_id')
          .eq('intervention_id', intervencion.id);

        if (relError) throw relError;

        // Extraer los IDs de los repuestos
        const repuestosIds = partInterventions.map(rel => rel.part_id);

        // Añadir a la lista de intervenciones
        intervenciones.push({
          id: intervencion.id,
          data: {
            NombreInt: intervencion.name,
            DescripcionInt: intervencion.description || '',
            ModeloDroneId: intervencion.drone_model_id,
            RepuestosIds: repuestosIds,
            PrecioManoObra: intervencion.labor_cost || 0,
            PrecioTotal: intervencion.total_cost || 0,
            DuracionEstimada: intervencion.estimated_duration || 30
          }
        });
      }

      // Actualizar el estado en Redux
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

// Función para reenviar email de verificación
export const reenviarEmailVerificacionPersistencia = async (email) => {
  try {
    console.log('Reenviando email de verificación a:', email);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      console.error('Error al enviar email de verificación:', error);
      throw { code: error.code };
    }

    console.log('Email de verificación enviado correctamente');
    return true;
  } catch (error) {
    console.error('Error en reenviarEmailVerificacionPersistencia:', error);
    throw error;
  }
};

// Login
export const loginPersistencia = async (emailParametro, passwordParametro) => {
  try {
    console.log('Iniciando login con Supabase:', emailParametro);

    // Intenta iniciar sesión con Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailParametro,
      password: passwordParametro,
    });

    // Si el día de mañana supabase cambia el atributo code por otro, lo cambio acá y listo
    if (authError) {
      throw { code: authError.code };
    }

    // Obtener los datos del usuario de la tabla de usuarios
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('*')
      .eq('email', emailParametro)
      .single();

    if (userError) {
      console.error('Error al obtener datos del usuario:', userError);
      if (userError.code === 'PGRST116') {
        throw { code: 'user_not_found' };
      }
      throw { code: userError.code };
    }

    if (!userData) {
      console.error('Usuario no encontrado en la base de datos');
      throw { code: 'user_not_found' };
    }

    // Construir el objeto usuario como lo espera la aplicación
    const usuario = {
      id: emailParametro, // Mantener el email como ID para compatibilidad con el frontend
      data: {
        EmailUsu: userData.email,
        NombreUsu: userData.name || '',
        ApellidoUsu: userData.last_name || '',
        TelefonoUsu: userData.tel || '',
        DireccionUsu: '', // Este campo no existe en la tabla
        CiudadUsu: userData.city || '',
        ProvinciaUsu: userData.state || '',
        Admin: userData.is_admin || false,
        UrlPhotoUsu: userData.url_photo || ''
      }
    };

    console.log('Login exitoso');
    return usuario;

  } catch (error) {
    console.error('Error en loginPersistencia:', error);
    throw error;
  }
};

// SEND de un mensaje
export const sendMessagePersistencia = (message) => {
  console.log('sendMessagePersistencia()');
  return new Promise(async (resolve, reject) => {
    try {
      // Preparar datos para el mensaje del remitente
      const dataFrom = {
        date: message.data.date,
        content: message.data.content,
        emailCli: message.data.to, // Para el remitente, el destinatario es el cliente
        sender: message.data.from,
        senderName: message.data.senderName,
        isRead: false
      };

      // Preparar datos para el mensaje del destinatario
      const dataTo = {
        date: message.data.date,
        content: message.data.content,
        emailCli: message.data.from, // Para el destinatario, el remitente es el cliente
        sender: message.data.from,
        senderName: message.data.senderName,
        isRead: false
      };

      // Insertar mensaje en la tabla de mensajes del remitente
      const { error: errorFrom } = await supabase
        .from('messages')
        .insert({
          ...dataFrom,
          user_id: message.data.from,
          created_at: new Date().toISOString()
        });

      if (errorFrom) throw errorFrom;

      // Insertar mensaje en la tabla de mensajes del destinatario
      const { error: errorTo } = await supabase
        .from('messages')
        .insert({
          ...dataTo,
          user_id: message.data.to,
          created_at: new Date().toISOString()
        });

      if (errorTo) throw errorTo;

      resolve();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      reject(error);
    }
  });
};

// GET todos los mensajes entre dos usuarios
export const getMessagesPersistencia = (setMessagesToRedux, emailUsu, emailCli) => {
  console.log('getMessagesPersistencia: ' + emailUsu + ' ' + emailCli);
  return new Promise((resolve, reject) => {
    try {
      // Consultar mensajes para el usuario actual donde el cliente sea el especificado
      const consulta = supabase
        .from('messages')
        .select('*')
        .eq('user_id', emailUsu)
        .eq('emailCli', emailCli)
        .order('date', { ascending: true });

      // Configurar suscripción en tiempo real
      const channel = supabase
        .channel('messages-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${emailUsu} AND emailCli=eq.${emailCli}`
        }, async () => {
          // Cuando hay cambios, ejecutar la consulta nuevamente
          const { data, error } = await consulta;

          if (error) throw error;

          // Transformar los datos al formato esperado por el frontend
          const messages = data.map(doc => ({
            id: doc.id,
            data: {
              date: doc.date,
              content: doc.content,
              senderName: doc.senderName,
              from: doc.sender,
              to: doc.sender === emailUsu ? emailCli : emailUsu,
              isRead: doc.isRead,
              emailUsu: emailUsu // Para saber a qué usuario pertenece este mensaje
            }
          }));

          setMessagesToRedux(messages);
        })
        .subscribe();

      // Ejecutar la consulta inicial para cargar los datos
      consulta.then(({ data, error }) => {
        if (error) throw error;

        // Transformar los datos al formato esperado por el frontend
        const messages = data.map(doc => ({
          id: doc.id,
          data: {
            date: doc.date,
            content: doc.content,
            senderName: doc.senderName,
            from: doc.sender,
            to: doc.sender === emailUsu ? emailCli : emailUsu,
            isRead: doc.isRead,
            emailUsu: emailUsu // Para saber a qué usuario pertenece este mensaje
          }
        }));

        setMessagesToRedux(messages);
      });

      // Devolver función para cancelar la suscripción
      resolve(() => {
        supabase.removeChannel(channel);
      });
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      reject(error);
    }
  });
};

// Actualizar mensajes como leídos
export const actualizarLeidosPersistencia = (mensajesLeidos) => {
  try {
    mensajesLeidos.forEach(async mensaje => {
      console.log('actualiza leidos, mensaje: ' + JSON.stringify(mensaje));

      const { error } = await supabase
        .from('messages')
        .update({ isRead: true })
        .eq('id', mensaje.id)
        .eq('user_id', mensaje.data.emailUsu);

      if (error) {
        console.error('Error al actualizar mensaje como leído:', error);
      } else {
        console.log('Mensaje actualizado como leído');
      }
    });
  } catch (error) {
    console.error('Error en actualizarLeidosPersistencia:', error);
  }
};

// Configurar notificaciones para mensajes nuevos
export const notificacionesPorMensajesPersistencia = (emailUsu) => {
  console.log('notificacionesPorMensajesPersistencia:', emailUsu);

  try {
    // Configuramos una suscripción para detectar mensajes no leídos enviados por otros usuarios
    const channel = supabase
      .channel('messages-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `user_id=eq.${emailUsu} AND sender=neq.${emailUsu} AND isRead=eq.false`
      }, (payload) => {
        // Cuando llega un mensaje nuevo, generamos la notificación
        const mensajeNuevo = payload.new;

        if (mensajeNuevo && mensajeNuevo.sender !== emailUsu) {
          const notification = {
            title: 'Nuevo Mensaje de ' + mensajeNuevo.senderName,
            text: mensajeNuevo.content,
            foreground: true,
            vibrate: true
          };

          // Importar la función desde utils
          import('../utils/utils').then(utils => {
            utils.triggerNotification(notification);
          });
        }
      })
      .subscribe();

    // Esta función no devuelve nada, pero podríamos devolver la función para cancelar la suscripción
    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Error en notificacionesPorMensajesPersistencia:', error);
  }
};

///////////// PRESUPUESTO ///////////////////////////////////////////////////

export const guardarPresupuestoPersistencia = (presupuesto) => {
  // En Supabase también agregamos información del usuario a la reparación 
  // para mantener consistencia con la implementación original
  presupuesto.reparacion.data.NombreUsu = presupuesto.usuario.data?.NombreUsu || '';
  presupuesto.reparacion.data.ApellidoUsu = presupuesto.usuario.data?.ApellidoUsu || '';
  presupuesto.reparacion.data.EmailUsu = presupuesto.usuario.data?.EmailUsu || '';
  presupuesto.reparacion.data.TelefonoUsu = presupuesto.usuario.data?.TelefonoUsu || '';

  return new Promise(async (resolve, reject) => {
    try {
      // 1. Primero guardar el usuario
      const usuarioGuardado = await guardarUsuarioPersistencia(presupuesto.usuario);

      // 2. Luego obtener el ID numérico del usuario (no el email)
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('id')
        .eq('email', usuarioGuardado.id)
        .single();

      if (userError || !userData) {
        throw new Error('Error al obtener el ID del usuario');
      }

      // 3. Guardar la reparación con el ID numérico del usuario en owner_id
      presupuesto.reparacion.data.UsuarioRep = userData.id.toString();
      const reparacionGuardada = await guardarReparacionPersistencia(presupuesto.reparacion);

      // 4. Devolver el presupuesto actualizado
      resolve({
        usuario: usuarioGuardado,
        reparacion: reparacionGuardada
      });
    } catch (error) {
      console.error('Error en guardarPresupuestoPersistencia:', error);
      reject(error);
    }
  });
};

// Función para registrar usuario a través del endpoint API
export const registroUsuarioEndpointPersistencia = async (registroData) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/registro_usuario`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registroData)
    });

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(errorData);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en registroUsuarioEndpointPersistencia:', error);
    throw error;
  }
};
