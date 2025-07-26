import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Usuarios } from '../../types/usuario';

// Selector base para el estado de usuarios
const selectUsuarioState = (state: RootState) => state.usuario;

// ---------------------------------------------------------
// SELECTORES BÁSICOS DE ESTADO
// ---------------------------------------------------------

// Selector para el filtro actual
export const selectUsuarioFilter = createSelector(
  [selectUsuarioState],
  (usuarioState) => usuarioState.filter
);

// Selector para las provincias select
export const selectProvinciasSelect = createSelector(
  [selectUsuarioState],
  (usuarioState) => usuarioState.provinciasSelect
);

// Selector para las localidades select
export const selectLocalidadesSelect = createSelector(
  [selectUsuarioState],
  (usuarioState) => usuarioState.localidadesSelect
);

// Selector para usuarios select
export const selectUsuariosSelect = createSelector(
  [selectUsuarioState],
  (usuarioState) => usuarioState.usuariosSelect
);

// ---------------------------------------------------------
// SELECTORES DE COLECCIÓN
// ---------------------------------------------------------

// Selector para la colección de usuarios (diccionario)
export const selectColeccionUsuarios = createSelector(
  [selectUsuarioState],
  (usuarioState) => usuarioState.coleccionUsuarios
);

// Selector para la colección como array
export const selectUsuariosArray = createSelector(
  [selectColeccionUsuarios],
  (coleccionUsuarios: Usuarios) => Object.values(coleccionUsuarios)
);

// Selector para obtener un usuario por ID
export const selectUsuarioPorId = createSelector(
  [selectColeccionUsuarios, (state: RootState, usuarioId: string) => usuarioId],
  (coleccionUsuarios, usuarioId) => {
    return coleccionUsuarios[usuarioId] || null;
  }
);

// Selector para usuarios filtrados por el filtro del estado
export const selectUsuariosFiltradosPorEstado = createSelector(
  [selectUsuariosArray, selectUsuarioFilter],
  (usuarios, filtro) => {
    if (!filtro) return usuarios;
    
    return usuarios.filter(usuario =>
      (usuario.data.NombreUsu || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (usuario.data.ApellidoUsu || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (usuario.data.EmailUsu || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (usuario.data.Nick || '').toLowerCase().includes(filtro.toLowerCase())
    );
  }
);

// ---------------------------------------------------------
// SELECTORES AVANZADOS Y UTILITARIOS
// ---------------------------------------------------------

// Selector para usuarios ordenados por nombre
export const selectUsuariosOrdenados = createSelector(
  [selectUsuariosArray],
  (usuarios) => 
    [...usuarios].sort((a, b) => {
      const nombreA = `${a.data.NombreUsu || ''} ${a.data.ApellidoUsu || ''}`.trim();
      const nombreB = `${b.data.NombreUsu || ''} ${b.data.ApellidoUsu || ''}`.trim();
      return nombreA.localeCompare(nombreB);
    })
);

// Selector para verificar si hay usuarios cargados
export const selectTieneUsuarios = createSelector(
  [selectUsuariosArray],
  (usuarios) => usuarios.length > 0
);

// Selector para opciones de select de usuarios
export const selectUsuariosSelectOptions = createSelector(
  [selectUsuariosOrdenados],
  (usuarios) => 
    usuarios.map(usuario => ({
      value: usuario.id,
      label: `${usuario.data.NombreUsu || ''} ${usuario.data.ApellidoUsu || ''} (${usuario.data.Nick || 'Sin nick'})`.trim()
    }))
);

// Selector para buscar usuarios por nombre o email
export const selectUsuariosPorBusqueda = createSelector(
  [selectUsuariosArray, (state: RootState, busqueda: string) => busqueda],
  (usuarios, busqueda) => {
    if (!busqueda) return usuarios;
    
    return usuarios.filter(usuario =>
      (usuario.data.NombreUsu || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (usuario.data.ApellidoUsu || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (usuario.data.EmailUsu || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (usuario.data.Nick || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (usuario.data.TelefonoUsu || '').includes(busqueda)
    );
  }
);

// Selector para usuarios filtrados por texto
export const selectUsuariosFiltrados = createSelector(
  [selectUsuariosArray, (state: RootState, filtro?: string) => filtro],
  (usuarios, filtro) => {
    if (!filtro) return usuarios;
    
    return usuarios.filter(usuario =>
      (usuario.data.NombreUsu || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (usuario.data.ApellidoUsu || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (usuario.data.EmailUsu || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (usuario.data.Nick || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (usuario.data.ProvinciaUsu || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (usuario.data.CiudadUsu || '').toLowerCase().includes(filtro.toLowerCase())
    );
  }
);

// Selector para provincias únicas
export const selectProvinciasUnicas = createSelector(
  [selectUsuariosArray],
  (usuarios) => {
    const provincias = new Set(
      usuarios
        .map(usuario => usuario.data.ProvinciaUsu)
        .filter(provincia => provincia && provincia.trim() !== '')
    );
    
    return Array.from(provincias).sort();
  }
);

// Selector para usuarios por provincia
export const selectUsuariosPorProvincia = createSelector(
  [selectUsuariosArray, (state: RootState, provincia: string) => provincia],
  (usuarios, provincia) => {
    if (!provincia) return usuarios;
    
    return usuarios.filter(usuario => 
      (usuario.data.ProvinciaUsu || '').toLowerCase() === provincia.toLowerCase()
    );
  }
);

// Selector para ciudades únicas
export const selectCiudadesUnicas = createSelector(
  [selectUsuariosArray],
  (usuarios) => {
    const ciudades = new Set(
      usuarios
        .map(usuario => usuario.data.CiudadUsu)
        .filter(ciudad => ciudad && ciudad.trim() !== '')
    );
    
    return Array.from(ciudades).sort();
  }
);

// Selector para usuarios por ciudad
export const selectUsuariosPorCiudad = createSelector(
  [selectUsuariosArray, (state: RootState, ciudad: string) => ciudad],
  (usuarios, ciudad) => {
    if (!ciudad) return usuarios;
    
    return usuarios.filter(usuario => 
      (usuario.data.CiudadUsu || '').toLowerCase() === ciudad.toLowerCase()
    );
  }
);

// Selector para usuarios administradores
export const selectUsuariosAdmin = createSelector(
  [selectUsuariosArray],
  (usuarios) => usuarios.filter(usuario => usuario.data.Admin === true)
);

// Selector para usuarios no administradores
export const selectUsuariosNoAdmin = createSelector(
  [selectUsuariosArray],
  (usuarios) => usuarios.filter(usuario => usuario.data.Admin === false)
);

// Selector para estadísticas de usuarios
export const selectEstadisticasUsuarios = createSelector(
  [selectUsuariosArray],
  (usuarios) => {
    const total = usuarios.length;
    
    // Contar administradores
    const administradores = usuarios.filter(u => u.data.Admin).length;
    const noAdministradores = total - administradores;
    
    // Agrupar por provincia
    const porProvincia = usuarios.reduce((acc, usuario) => {
      const provincia = usuario.data.ProvinciaUsu || 'Sin provincia';
      acc[provincia] = (acc[provincia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Agrupar por ciudad
    const porCiudad = usuarios.reduce((acc, usuario) => {
      const ciudad = usuario.data.CiudadUsu || 'Sin ciudad';
      acc[ciudad] = (acc[ciudad] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      administradores,
      noAdministradores,
      porProvincia,
      porCiudad,
      provinciasUnicas: Object.keys(porProvincia).length,
      ciudadesUnicas: Object.keys(porCiudad).length
    };
  }
);

// Selector para buscar usuario por email exacto
export const selectUsuarioPorEmailExacto = createSelector(
  [selectUsuariosArray, (state: RootState, email: string) => email],
  (usuarios, email) => 
    usuarios.find(usuario => 
      (usuario.data.EmailUsu || '').toLowerCase() === email.toLowerCase()
    )
);

// Selector para buscar usuario por nick exacto
export const selectUsuarioPorNickExacto = createSelector(
  [selectUsuariosArray, (state: RootState, nick: string) => nick],
  (usuarios, nick) => 
    usuarios.find(usuario => 
      (usuario.data.Nick || '').toLowerCase() === nick.toLowerCase()
    )
);

// Selector para usuarios con foto
export const selectUsuariosConFoto = createSelector(
  [selectUsuariosArray],
  (usuarios) => 
    usuarios.filter(usuario => 
      usuario.data.UrlFotoUsu && usuario.data.UrlFotoUsu.trim() !== ''
    )
);

// Selector para usuarios sin foto
export const selectUsuariosSinFoto = createSelector(
  [selectUsuariosArray],
  (usuarios) => 
    usuarios.filter(usuario => 
      !usuario.data.UrlFotoUsu || usuario.data.UrlFotoUsu.trim() === ''
    )
);

// Selector para usuarios con teléfono
export const selectUsuariosConTelefono = createSelector(
  [selectUsuariosArray],
  (usuarios) => 
    usuarios.filter(usuario => 
      usuario.data.TelefonoUsu && usuario.data.TelefonoUsu.trim() !== ''
    )
);

// Selector para usuarios ordenados por fecha de creación (si estuviera disponible)
// o por orden alfabético de email como alternativa
export const selectUsuariosOrdenadosPorEmail = createSelector(
  [selectUsuariosArray],
  (usuarios) => 
    [...usuarios].sort((a, b) => 
      (a.data.EmailUsu || '').localeCompare(b.data.EmailUsu || '')
    )
);
