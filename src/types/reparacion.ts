// TODO: habría que hacer un objeto aparte para el Usuario. Quizás o mismo para el estado.
export interface DataReparacion {
    EstadoRep: string;
    PrioridadRep: number;
    DroneRep: string;
    NombreUsu: string;
    ApellidoUsu: string;
    UsuarioRep?: string;
    DriveRep: string;
    AnotacionesRep: string;
    FeConRep: number;
    EmailUsu: string;
    TelefonoUsu: string;
    DescripcionUsuRep: string;
    DiagnosticoRep: string;
    FeRecRep: number;
    NumeroSerieRep: string;
    DescripcionTecRep: string;
    PresuMoRep: number;
    PresuReRep: number;
    PresuFiRep: number;
    PresuDiRep: number;
    TxtRepuestosRep: string;
    InformeRep: string;
    FeFinRep: number;
    FeEntRep: number;
    TxtEntregaRep: string;
    SeguimientoEntregaRep: string;
    urlsFotos?: string[];
}

export interface ReparacionType {
  id: string;
  data: DataReparacion;
}
