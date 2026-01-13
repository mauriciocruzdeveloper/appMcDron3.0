import { supabase } from './supabaseClient.js';

// GET todos los usuarios con suscripción en tiempo real
export const getUsuariosPersistencia = async (setUsuariosToRedux) => {
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
          role
        `)
        .order('first_name');

      if (error) throw error;

      // Transformar los datos al formato esperado por el frontend
      const usuarios = data.map(item => ({
        id: String(item.id),
        data: {
          EmailUsu: item.email,
          NombreUsu: item.first_name || '',
          ApellidoUsu: item?.last_name || '',
          TelefonoUsu: item?.telephone || '',
          DireccionUsu: item?.address || '',
          CiudadUsu: item?.city || '',
          ProvinciaUsu: item?.state || '',
          Role: item?.role || 'cliente'
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
        ProvinciaUsu: data.state || '',
        Role: data.role || 'cliente'
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
        ProvinciaUsu: data.state || '',
        Role: data.role || 'cliente'
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
      state: usuario.data.ProvinciaUsu || '',
      role: usuario.data.Role || 'cliente',
      nick: usuario.data.EmailUsu,
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
        .select('id') // Quitado number_series
        .eq('owner_id', id);

      if (errorDrones) throw errorDrones;

      if (dronesAsociados && dronesAsociados.length > 0) {
        reject({
          code: 'No se puede borrar este usuario. Drone relacionado: ' +
            dronesAsociados.map(drone => drone.id).toString()
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
