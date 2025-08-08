export interface Usuario {
    id: string,
    data: {
      NombreUsu: string,     // name en Supabase
      TelefonoUsu: string,   // tel en Supabase
      ApellidoUsu?: string,   // last_name en Supabase
      EmailUsu?: string,      // email en Supabase
      ProvinciaUsu?: string,  // state en Supabase
      CiudadUsu?: string,     // city en Supabase
      Admin?: boolean,        // is_admin en Supabase
      Nick?: string,          // nick en Supabase
      UrlFotoUsu?: string     // url_photo en Supabase
    };
}

// Tipo para la colección de usuarios como diccionario
export interface Usuarios {
  [key: string]: Usuario;
}