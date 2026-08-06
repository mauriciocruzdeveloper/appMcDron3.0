export type EmailCampaignFrequency = 'once' | 'daily' | 'weekly' | 'monthly';

export interface EmailCampaignFilterDefinition {
  incluirTodosLosClientes?: boolean;
  estadosReparacion?: string[];
  minDiasDesdeRecepcion?: number | null;
  minDiasDesdeConsulta?: number | null;
  noPagaron?: boolean;
  soloConEmail?: boolean;
}

export interface DataEmailCampaign {
  NombreCampana: string;
  PlantillaId: string;
  Filtros: EmailCampaignFilterDefinition;
  Frecuencia: EmailCampaignFrequency;
  CadaCantidad: number;
  ProximaEjecucion: string | null;
  UltimaEjecucion?: string | null;
  ActivaCampana: boolean;
  DeletedAtCampana?: string | null;
  CreatedAtCampana?: string;
  UpdatedAtCampana?: string;
}

export interface EmailCampaign {
  id: string;
  data: DataEmailCampaign;
}

export interface EmailCampaigns {
  [id: string]: EmailCampaign;
}

export interface EmailCampaignRun {
  id: string;
  data: {
    campaignId: string;
    scheduledFor?: string | null;
    executedAt: string;
    status: 'success' | 'partial' | 'failed' | 'finalized';
    totalRecipients: number;
    totalSent: number;
    totalFailed: number;
    errorSummary?: string | null;
  };
}

export interface EmailCampaignRunRecipient {
  id: string;
  data: {
    runId: string;
    userId: string | null;
    email: string;
    status: 'sent' | 'failed' | 'pending';
    errorMessage: string | null;
    sentAt: string | null;
  };
}
