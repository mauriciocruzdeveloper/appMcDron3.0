// TODO: habría que hacer un objeto aparte para el Usuario. Quizás o mismo para el estado.
interface DataReparacion {
    EstadoRep: string;
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
}

interface Reparacion {
  id: number;
  data: DataReparacion;
}
