import { supabase } from './supabaseClient.js';

const mapTemplateToDomain = (item) => ({
  id: String(item.id),
  data: {
    NombrePlantilla: item.name || '',
    AsuntoPlantilla: item.subject || '',
    CuerpoHtmlPlantilla: item.body_html || '',
    ActivaPlantilla: item.is_active !== false,
    DeletedAtPlantilla: item.deleted_at || null,
    CreatedAtPlantilla: item.created_at,
    UpdatedAtPlantilla: item.updated_at,
  },
});

const buildTemplatePayload = (template) => ({
  name: template.data.NombrePlantilla,
  subject: template.data.AsuntoPlantilla,
  body_html: template.data.CuerpoHtmlPlantilla,
  is_active: template.data.ActivaPlantilla !== false,
  deleted_at: template.data.DeletedAtPlantilla || null,
});

export const getPlantillasEmailPersistencia = async (setPlantillasToRedux) => {
  const cargarPlantillas = async () => {
    try {
      const { data, error } = await supabase
        .from('email_template')
        .select('*')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      const plantillas = (data || []).map(mapTemplateToDomain);
      setPlantillasToRedux(plantillas);
    } catch (error) {
      console.error('Error al cargar plantillas email:', error);
      setPlantillasToRedux([]);
    }
  };

  await cargarPlantillas();

  const channel = supabase
    .channel('email-template-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'email_template'
    }, () => {
      cargarPlantillas();
    })
    .subscribe((status, err) => {
      if (err) {
        console.error('Error en suscripcion email-template-changes:', err);
      }
      if (status === 'CHANNEL_ERROR') {
        console.error('Error del canal email-template-changes');
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
};

export const guardarPlantillaEmailPersistencia = async (template) => {
  const payload = buildTemplatePayload(template);

  if (template.id) {
    const { data, error } = await supabase
      .from('email_template')
      .update(payload)
      .eq('id', template.id)
      .select()
      .single();

    if (error) throw error;
    return mapTemplateToDomain(data);
  }

  const { data, error } = await supabase
    .from('email_template')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return mapTemplateToDomain(data);
};

export const eliminarPlantillaEmailPersistencia = async (id) => {
  const { error } = await supabase
    .from('email_template')
    .update({
      is_active: false,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
  return id;
};
