import React from 'react';
import { useEffect, useState } from 'react';
import history from '../history';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { getUsuariosAsync } from '../redux-tool-kit/slices/appSlice';
import { ClienteType } from '../types/cliente';

export default function ListaUsuarios() {
  const dispatch = useAppDispatch();
  const coleccionUsuarios = useAppSelector((state) => state.app.coleccionUsuarios);

  const [filter, setFilter] = useState<string>('');
  const [usuariosList, setUsuariosList] = useState<ClienteType[]>([]);

  useEffect(() => {
    const unsubscribe = dispatch(getUsuariosAsync());

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (coleccionUsuarios.length) {
      const usuarios = coleccionUsuarios.filter(usuario => {
        let incluirPorSearch = true;
        if (filter) {
          incluirPorSearch = usuario.data.NombreUsu?.toLowerCase().includes(filter.toLowerCase())
            || usuario.data.ApellidoUsu?.toLowerCase().includes(filter.toLowerCase())
            || usuario.data.EmailUsu?.toLowerCase().includes(filter.toLowerCase())
            || usuario.data.TelefonoUsu?.toLowerCase().includes(filter.toLowerCase());
        }
        return incluirPorSearch;
      });
      setUsuariosList(usuarios);
    }
  }, [coleccionUsuarios, filter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  }

  return (
    <div className='p-4'>
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

      {usuariosList.map(usuario => (
        <div
          key={usuario.id}
          className='card mb-3 p-1' 
          aria-current='true'
          onClick={() => history.push(`/inicio/usuarios/${usuario.id}`)}
        >
          <div className='d-flex w-100 justify-content-between'>
            <h5 className='mb-1'>{usuario.data.NombreUsu} {usuario.data.ApellidoUsu}</h5>
          </div>
          <small>{usuario?.data?.EmailUsu}</small>
        </div>
      ))}
    </div>
  );
}
