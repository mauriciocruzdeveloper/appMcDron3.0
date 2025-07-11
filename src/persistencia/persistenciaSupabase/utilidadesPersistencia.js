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
import { supabase } from './supabaseClient.js';

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
