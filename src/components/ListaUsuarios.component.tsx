import React from 'react';
import { useHistory } from '../hooks/useHistory';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { setFilter } from '../redux-tool-kit/usuario/usuario.slice';
import { selectUsuariosFiltradosPorEstado } from '../redux-tool-kit/usuario/usuario.selectors';

export default function ListaUsuarios(): JSX.Element {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const usuariosList = useAppSelector(selectUsuariosFiltradosPorEstado);
  const filter = useAppSelector((state) => state.usuario.filter);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilter(e.target.value));
  }

  return (
    <div className='d-flex flex-column' style={{ height: '100vh' }}>
      {/* Header fijo */}
      <div className='p-4 pb-2 bg-white border-bottom' style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <h3 className='mb-0'>Usuarios</h3>
      </div>

      {/* Contenido con scroll */}
      <div className='flex-grow-1 overflow-auto'>
        <div className='p-4 pt-3'>
          <div className='card mb-3'>
            <div className='card-body'>
              <div className='form-group'>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Buscar usuarios...'
                  value={filter}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="text-muted">
              {usuariosList.length} {usuariosList.length === 1 ? 'usuario' : 'usuarios'}
            </div>

            <button
              className="btn w-auto bg-bluemcdron text-white"
              onClick={() => history.push('/inicio/usuarios/new')}
            >
              + Nuevo Usuario
            </button>
          </div>

          {usuariosList.length === 0 ? (
            <div className="alert alert-info text-center" role="alert">
              No hay usuarios disponibles.
            </div>
          ) : (
            usuariosList.map(usuario => (
              <div
                key={usuario.id}
                className='card mb-3 p-1' 
                aria-current='true'
                onClick={() => history.push(`/inicio/usuarios/${usuario.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className='d-flex w-100 justify-content-between'>
                  <h5 className='mb-1'>{usuario.data.NombreUsu} {usuario.data.ApellidoUsu}</h5>
                </div>
                <small>{usuario?.data?.EmailUsu}</small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
