// TODO: habría que hacer un objeto aparte para el Usuario. Quizás o mismo para el estado.
export interface DataReparacion {
    EstadoRep: string;
    PrioridadRep: number | null;
    FeConRep: number | null;
    ModeloDroneNameRep: string;
    DescripcionUsuRep: string;
    UsuarioRep: string; // ID del usuario propietario (owner_id en BD)
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
    
    // ======================================================
    // CAMPOS PARA ESTADO "REPUESTOS"
    // ======================================================
    
    /**
     * Observaciones sobre qué repuestos se necesitan.
     * Texto libre para especificar detalles.
     * @maxLength 2000
     * @example "Necesita: Motor delantero izquierdo DJI Mini 3 Pro, tornillos M2x6 (x4)"
     */
    ObsRepuestos?: string;
    
    /**
     * Lista de IDs de repuestos del inventario que se solicitaron.
     * Cada ID corresponde a un documento en la colección 'repuestos' o tabla 'part' en Supabase.
     * @maxItems 50
     * @example ["rep_abc123xyz", "rep_def456uvw"]
     */
    RepuestosSolicitados?: string[];
}

export interface ReparacionType {
  id: string;
  data: DataReparacion;
}

// Tipo para colección de reparaciones como diccionario (optimización O(1))
export interface Reparaciones {
  [id: string]: ReparacionType;
}
