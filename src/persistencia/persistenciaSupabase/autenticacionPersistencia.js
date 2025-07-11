import { supabase } from './supabaseClient.js';

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
