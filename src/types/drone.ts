// Interfaz para la data de un drone específico
export interface DroneData {
  NumeroSerie: string;
  ModeloDroneId: string; // Referencia al id del modelo de drone
  Propietario: string;
  FechaAdquisicion: Date;
  EstadoDrone: string;
  UltimoMantenimiento?: Date;
  Observaciones?: string;
}

export interface Drone {
  id: string;
  data: DroneData;
}
