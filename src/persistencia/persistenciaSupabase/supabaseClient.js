import { createClient } from '@supabase/supabase-js';

// Estas credenciales deberían estar en un archivo de configuración o variables de entorno
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'TU_URL_DE_SUPABASE';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || 'TU_API_KEY_DE_SUPABASE';

// Inicializa el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
