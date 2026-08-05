import { supabase } from './supabaseClient.js';

const mapCampaignToDomain = (item) => ({
  id: String(item.id),
  data: {
    NombreCampana: item.name || '',
    PlantillaId: item.template_id ? String(item.template_id) : '',
    Filtros: item.filter_definition || {},
    Frecuencia: item.frequency || 'once',
    CadaCantidad: item.interval_count || 1,
    ProximaEjecucion: item.next_run_at || null,
    UltimaEjecucion: item.last_run_at || null,
    ActivaCampana: item.is_active !== false,
    DeletedAtCampana: item.deleted_at || null,
    CreatedAtCampana: item.created_at,
    UpdatedAtCampana: item.updated_at,
  },
});

const mapRunToDomain = (item) => ({
  id: String(item.id),
  data: {
    campaignId: String(item.campaign_id),
    scheduledFor: item.scheduled_for || null,
    executedAt: item.executed_at,
    status: item.status || 'failed',
    totalRecipients: item.total_recipients || 0,
    totalSent: item.total_sent || 0,
    totalFailed: item.total_failed || 0,
    errorSummary: item.error_summary || null,
  },
});

const buildCampaignPayload = (campaign) => ({
  name: campaign.data.NombreCampana,
  template_id: campaign.data.PlantillaId ? Number(campaign.data.PlantillaId) : null,
  filter_definition: campaign.data.Filtros || {},
  frequency: campaign.data.Frecuencia,
  interval_count: campaign.data.CadaCantidad || 1,
  next_run_at: campaign.data.ProximaEjecucion,
  last_run_at: campaign.data.UltimaEjecucion || null,
  is_active: campaign.data.ActivaCampana !== false,
  deleted_at: campaign.data.DeletedAtCampana || null,
});

export const getCampanasEmailPersistencia = async (setCampanasToRedux) => {
  const cargarCampanas = async () => {
    try {
      const { data, error } = await supabase
        .from('email_campaign')
        .select('*')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      const campanas = (data || []).map(mapCampaignToDomain);
      setCampanasToRedux(campanas);
    } catch (error) {
      console.error('Error al cargar campanas email:', error);
      setCampanasToRedux([]);
    }
  };

  await cargarCampanas();

  const channel = supabase
    .channel('email-campaign-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'email_campaign'
    }, () => {
      cargarCampanas();
    })
    .subscribe((status, err) => {
      if (err) {
        console.error('Error en suscripcion email-campaign-changes:', err);
      }
      if (status === 'CHANNEL_ERROR') {
        console.error('Error del canal email-campaign-changes');
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
};

export const guardarCampanaEmailPersistencia = async (campaign) => {
  const payload = buildCampaignPayload(campaign);

  if (campaign.id) {
    const { data, error } = await supabase
      .from('email_campaign')
      .update(payload)
      .eq('id', campaign.id)
      .select()
      .single();

    if (error) throw error;
    return mapCampaignToDomain(data);
  }

  const { data, error } = await supabase
    .from('email_campaign')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return mapCampaignToDomain(data);
};

export const eliminarCampanaEmailPersistencia = async (id) => {
  const { error } = await supabase
    .from('email_campaign')
    .update({
      is_active: false,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
  return id;
};

export const getRunsCampanaEmailPersistencia = async (campaignId) => {
  const query = supabase
    .from('email_campaign_run')
    .select('*')
    .order('executed_at', { ascending: false })
    .limit(30);

  if (campaignId) {
    query.eq('campaign_id', campaignId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error al cargar runs de campana:', error);
    return [];
  }

  return (data || []).map(mapRunToDomain);
};
