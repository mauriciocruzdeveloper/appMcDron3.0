import { createClient } from '@supabase/supabase-js';
import { collectionNames } from '../types/collectionNames';

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
        id: String(item.id),
        data: {
          EstadoRep: item.state,
          PrioridadRep: item.priority,
          DroneRep: item.drone?.number_series || '',
          NombreUsu: item.owner?.first_name || '',
          ApellidoUsu: item.owner?.last_name || '',
          UsuarioRep: String(item.owner_id),
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
      id: String(data.id),
      data: {
        EstadoRep: data.state,
        PrioridadRep: data.priority,
        DroneRep: data.drone?.number_series || '',
        NombreUsu: data.owner?.first_name || '',
        ApellidoUsu: data.owner?.last_name || '',
        UsuarioRep: String(data.owner_id),
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
      id: String(result.id),
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
          province,
          is_admin
        `)
        .order('first_name');
      
      if (error) throw error;
      
      // Transformar los datos al formato esperado por el frontend
      const usuarios = data.map(item => ({
        id: String(item.id),
        data: {
          EmailUsu: item.email,
          NombreUsu: item.first_name || '',
          ApellidoUsu: item.last_name || '',
          TelefonoUsu: item.telephone || '',
          DireccionUsu: item.address || '',
          CiudadUsu: item.city || '',
          ProvinciaUsu: item.province || '',
          Admin: item.is_admin || false
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
      id: String(data.id),
      data: {
        EmailUsu: data.email,
        NombreUsu: data.first_name || '',
        ApellidoUsu: data.last_name || '',
        TelefonoUsu: data.telephone || '',
        DireccionUsu: data.address || '',
        CiudadUsu: data.city || '',
        ProvinciaUsu: data.province || '',
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
      id: String(data.id),
      data: {
        EmailUsu: data.email,
        NombreUsu: data.first_name || '',
        ApellidoUsu: data.last_name || '',
        TelefonoUsu: data.telephone || '',
        DireccionUsu: data.address || '',
        CiudadUsu: data.city || '',
        ProvinciaUsu: data.province || '',
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
      first_name: usuario.data.NombreUsu || '',
      last_name: usuario.data.ApellidoUsu || '',
      telephone: usuario.data.TelefonoUsu || '',
      address: usuario.data.DireccionUsu || '',
      city: usuario.data.CiudadUsu || '',
      province: usuario.data.ProvinciaUsu || '',
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
      id: String(result.id),
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
    const { data, error } = await supabase
      .from('part')
      .select(`
        *,
        drone_model:drone_model_id (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      throw new Error('Repuesto no encontrado');
    }
    
    // Transformar al formato esperado por el frontend
    return {
      id: String(data.id),
      data: {
        NombreRepu: data.name,
        DescripcionRepu: data.description || '',
        ModeloDroneRepu: data.drone_model?.name || '',
        ModeloDroneId: data.drone_model_id,  // Añadido para mantener la referencia directa al ID
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
    const { data, error } = await supabase
      .from('part')
      .select(`
        *,
        drone_model:drone_model_id (*)
      `)
      .eq('drone_model_id', modeloDroneId);
    
    if (error) throw error;
    
    // Transformar al formato esperado por el frontend
    const repuestos = data.map(item => ({
      id: String(item.id),
      data: {
        NombreRepu: item.name,
        DescripcionRepu: item.description || '',
        ModeloDroneRepu: item.drone_model?.name || '',
        ModeloDroneId: item.drone_model_id,  // Añadido para mantener la referencia directa
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
    // 1. Determinar el ID del modelo de drone
    let drone_model_id = null;
    
    // Si ya tenemos el ID directamente, lo usamos
    if (repuesto.data.ModeloDroneId) {
      drone_model_id = repuesto.data.ModeloDroneId;
    }
    // Si no, pero tenemos el nombre, buscamos el ID
    else if (repuesto.data.ModeloDroneRepu && repuesto.data.ModeloDroneRepu !== 'Universal') {
      const { data: modeloDrone, error: errorModelo } = await supabase
        .from('drone_model')
        .select('id')
        .eq('name', repuesto.data.ModeloDroneRepu)
        .maybeSingle();
      
      if (!errorModelo && modeloDrone) {
        drone_model_id = modeloDrone.id;
      }
    }
    
    // 2. Preparar datos para Supabase
    const repuestoData = {
      name: repuesto.data.NombreRepu,
      description: repuesto.data.DescripcionRepu || '',
      provider: repuesto.data.ProveedorRepu || '',
      price: repuesto.data.PrecioRepu || 0,
      stock: repuesto.data.StockRepu || 0,
      backorder: repuesto.data.UnidadesPedidas || 0,
      drone_model_id: drone_model_id
    };
    
    let result;
    
    if (repuesto.id) {
      // Actualización
      const { data, error } = await supabase
        .from('part')
        .update(repuestoData)
        .eq('id', repuesto.id)
        .select(`
          *,
          drone_model:drone_model_id (id, name)
        `);
      
      if (error) throw error;
      result = data[0];
    } else {
      // Inserción
      const { data, error } = await supabase
        .from('part')
        .insert(repuestoData)
        .select(`
          *,
          drone_model:drone_model_id (id, name)
        `);
      
      if (error) throw error;
      result = data[0];
    }
    
    // 3. Devolver el resultado en formato esperado por el frontend
    return {
      id: String(result.id),
      data: {
        NombreRepu: result.name,
        DescripcionRepu: result.description || '',
        ModeloDroneRepu: result.drone_model?.name || '',
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
        .from('intervention_part')
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
export const getRepuestosPersistencia = (setRepuestosToRedux) => {
  console.log('getRepuestosPersistencia con Supabase');
  
  // Función para cargar los datos iniciales
  const cargarRepuestos = async () => {
    try {
      const { data, error } = await supabase
        .from('part')
        .select(`
          *,
          drone_model:drone_model_id (*)
        `)
        .order('name');
      
      if (error) throw error;
      
      // Transformar los datos al formato esperado por el frontend
      const repuestos = data.map(item => ({
        id: String(item.id),
        data: {
          NombreRepu: item.name,
          DescripcionRepu: item.description || '',
          ModeloDroneRepu: item.drone_model?.name || '',
          ModeloDroneId: item.drone_model_id,  // Añadido para mantener la referencia directa
          ProveedorRepu: item.provider || '',
          PrecioRepu: item.price || 0,
          StockRepu: item.stock || 0,
          UnidadesPedidas: item.backorder || 0
        }
      }));
      
      // Actualizar el estado en Redux
      setRepuestosToRedux(repuestos);
    } catch (error) {
      console.error("Error al cargar repuestos:", error);
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
      
      // 3. Verificar si hay repuestos asociados a este modelo
      const { data: repuestosAsociados, error: errorRepuestos } = await supabase
        .from('part')
        .select('id')
        .eq('drone_model_id', id);
      
      if (errorRepuestos) throw errorRepuestos;
      
      if (repuestosAsociados && repuestosAsociados.length > 0) {
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
      id: String(item.id),
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
      id: String(item.id),
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
      id: String(result.id),
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
        id: String(item.id),
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
