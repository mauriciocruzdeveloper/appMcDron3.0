import React, { useMemo, useState } from 'react';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import {
  eliminarPlantillaEmailAsync,
  guardarPlantillaEmailAsync,
  selectPlantillasEmailFiltradas,
  setFilterPlantillasEmail,
} from '../redux-tool-kit/plantillaEmail';
import { EmailTemplate } from '../types/emailTemplate';
import { useModal } from './Modal/useModal';

const emptyTemplate: EmailTemplate = {
  id: '',
  data: {
    NombrePlantilla: '',
    AsuntoPlantilla: '',
    CuerpoHtmlPlantilla: '',
    ActivaPlantilla: true,
  },
};

export default function ListaPlantillasEmail(): JSX.Element {
  const dispatch = useAppDispatch();
  const { openModal } = useModal();

  const filter = useAppSelector((state) => state.plantillaEmail.filter);
  const plantillas = useAppSelector(selectPlantillasEmailFiltradas);

  const [draft, setDraft] = useState<EmailTemplate>(emptyTemplate);

  const sortedPlantillas = useMemo(
    () => [...plantillas].sort((a, b) => a.data.NombrePlantilla.localeCompare(b.data.NombrePlantilla)),
    [plantillas]
  );

  const handleSave = async () => {
    if (!draft.data.NombrePlantilla.trim()) {
      openModal({
        titulo: 'Atencion',
        tipo: 'warning',
        mensaje: 'El nombre de la plantilla es obligatorio.',
      });
      return;
    }

    if (!draft.data.AsuntoPlantilla.trim()) {
      openModal({
        titulo: 'Atencion',
        tipo: 'warning',
        mensaje: 'El asunto de la plantilla es obligatorio.',
      });
      return;
    }

    await dispatch(guardarPlantillaEmailAsync(draft));
    setDraft(emptyTemplate);
  };

  const handleDelete = (id: string) => {
    openModal({
      titulo: 'Eliminar plantilla',
      tipo: 'danger',
      mensaje: 'Esta accion desactivara la plantilla y conservara el historial. Desea continuar?',
      confirmCallback: async () => {
        await dispatch(eliminarPlantillaEmailAsync(id));
        if (draft.id === id) {
          setDraft(emptyTemplate);
        }
      },
    });
  };

  const handleEdit = (template: EmailTemplate) => {
    setDraft(template);
  };

  return (
    <div className='d-flex flex-column' style={{ height: '100vh' }}>
      <div className='p-4 pb-2 bg-white border-bottom' style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <h3 className='mb-0'>Plantillas de Emails</h3>
      </div>

      <div className='flex-grow-1 overflow-auto'>
        <div className='p-4 pt-3'>
          <div className='card mb-3'>
            <div className='card-body'>
              <div className='mb-2'>
                <input
                  className='form-control'
                  placeholder='Buscar plantilla por nombre o asunto...'
                  value={filter}
                  onChange={(e) => dispatch(setFilterPlantillasEmail(e.target.value))}
                />
              </div>
              <div className='mb-2'>
                <input
                  className='form-control'
                  placeholder='Nombre de plantilla'
                  value={draft.data.NombrePlantilla}
                  onChange={(e) => setDraft({
                    ...draft,
                    data: { ...draft.data, NombrePlantilla: e.target.value },
                  })}
                />
              </div>
              <div className='mb-2'>
                <input
                  className='form-control'
                  placeholder='Asunto'
                  value={draft.data.AsuntoPlantilla}
                  onChange={(e) => setDraft({
                    ...draft,
                    data: { ...draft.data, AsuntoPlantilla: e.target.value },
                  })}
                />
              </div>
              <div className='mb-2'>
                <textarea
                  className='form-control'
                  rows={8}
                  placeholder='Cuerpo HTML del email (acepta placeholders como {{cliente}})'
                  value={draft.data.CuerpoHtmlPlantilla}
                  onChange={(e) => setDraft({
                    ...draft,
                    data: { ...draft.data, CuerpoHtmlPlantilla: e.target.value },
                  })}
                />
              </div>
              <div className='form-check mb-3'>
                <input
                  id='plantilla-activa'
                  type='checkbox'
                  className='form-check-input'
                  checked={draft.data.ActivaPlantilla}
                  onChange={(e) => setDraft({
                    ...draft,
                    data: { ...draft.data, ActivaPlantilla: e.target.checked },
                  })}
                />
                <label className='form-check-label' htmlFor='plantilla-activa'>Plantilla activa</label>
              </div>
              <div className='d-flex gap-2'>
                <button className='btn bg-bluemcdron text-white' onClick={handleSave}>
                  {draft.id ? 'Guardar cambios' : 'Crear plantilla'}
                </button>
                {draft.id ? (
                  <button className='btn btn-outline-secondary' onClick={() => setDraft(emptyTemplate)}>
                    Cancelar edicion
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className='text-muted mb-2'>{sortedPlantillas.length} plantillas</div>

          {sortedPlantillas.length === 0 ? (
            <div className='alert alert-info text-center'>No hay plantillas cargadas.</div>
          ) : (
            <div className='entity-card-grid'>
              {sortedPlantillas.map((template) => (
                <div key={template.id} className='card mb-3'>
                  <div className='card-body'>
                    <div className='d-flex justify-content-between align-items-start'>
                      <div>
                        <h5 className='mb-1'>{template.data.NombrePlantilla}</h5>
                        <small className='text-muted'>{template.data.AsuntoPlantilla}</small>
                      </div>
                      <span className={`badge ${template.data.ActivaPlantilla ? 'bg-success' : 'bg-secondary'}`}>
                        {template.data.ActivaPlantilla ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <div className='mt-3 d-flex gap-2'>
                      <button className='btn btn-sm btn-outline-primary' onClick={() => handleEdit(template)}>
                        Editar
                      </button>
                      <button className='btn btn-sm btn-outline-danger' onClick={() => handleDelete(template.id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
