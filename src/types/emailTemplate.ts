export interface DataEmailTemplate {
  NombrePlantilla: string;
  AsuntoPlantilla: string;
  CuerpoHtmlPlantilla: string;
  ActivaPlantilla: boolean;
  DeletedAtPlantilla?: string | null;
  CreatedAtPlantilla?: string;
  UpdatedAtPlantilla?: string;
}

export interface EmailTemplate {
  id: string;
  data: DataEmailTemplate;
}

export interface EmailTemplates {
  [id: string]: EmailTemplate;
}
