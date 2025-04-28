// Interfaz para la data de un drone específico
export interface DroneData {
  NumeroSerie: string;
  ModeloDroneId: string; // Referencia al id del modelo de drone
  Propietario: string;
  Observaciones?: string;
}

export interface Drone {
  id: string;
  data: DroneData;
}
