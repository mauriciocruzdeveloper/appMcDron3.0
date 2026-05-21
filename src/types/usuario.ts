// Tipos de roles disponibles en el sistema
export type UserRole = 'admin' | 'cliente' | 'partner';

export interface Usuario {
    id: string,
    data: {
      NombreUsu: string,
      TelefonoUsu: string,
      ApellidoUsu?: string,
      EmailUsu?: string,
      EmailContacto?: string,
      ProvinciaUsu?: string,
      CiudadUsu?: string,
      Role: UserRole,
      Nick?: string,
      UrlFotoUsu?: string,
    };
}

/** Datos necesarios para crear un usuario nuevo (auth + perfil).
 *  La contraseña se mantiene fuera del modelo de dominio `Usuario`. */
export interface DatosCreacionUsuario {
  usuario: Omit<Usuario, 'id'>;
  password: string;
}

// Tipo para la colección de usuarios como diccionario
export interface Usuarios {
  [key: string]: Usuario;
}