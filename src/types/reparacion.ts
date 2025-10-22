// TODO: habría que hacer un objeto aparte para el Usuario. Quizás o mismo para el estado.
export interface DataReparacion {
    EstadoRep: string;
    PrioridadRep: number | null;
    FeConRep: number | null;
    ModeloDroneNameRep: string;
    DescripcionUsuRep: string;
    UsuarioRep: string;
    NombreUsu?: string;
    EmailUsu?: string;
    TelefonoUsu?: string;
    ApellidoUsu?: string;
    DroneId?: string;
    DriveRep?: string;
    AnotacionesRep?: string;
    DiagnosticoRep?: string;
    FeRecRep?: number | null;
    NumeroSerieRep?: string;
    DescripcionTecRep?: string;
    PresuMoRep?: number | null;
    PresuReRep?: number | null;
    PresuFiRep?: number | null;
    PresuDiRep?: number | null;
    TxtRepuestosRep?: string;
    InformeRep?: string;
    FeFinRep?: number | null;
    FeEntRep?: number | null;
    TxtEntregaRep?: string;
    SeguimientoEntregaRep?: string;
    urlsFotos?: string[];
    urlsDocumentos?: string[];
    IntervencionesIds?: string[]; // Lista de IDs de intervenciones aplicadas en la reparación
    FotoAntes?: string; // URL de la foto "antes" de la reparación
    FotoDespues?: string; // URL de la foto "después" de la reparación
}

export interface ReparacionType {
  id: string;
  data: DataReparacion;
}

// Tipo para colección de reparaciones como diccionario (optimización O(1))
export interface Reparaciones {
  [id: string]: ReparacionType;
}
