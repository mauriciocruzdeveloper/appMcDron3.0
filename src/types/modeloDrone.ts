// Interfaz para la data de un modelo de drone
export interface ModeloDroneData {
  NombreModelo: string;
  Fabricante: string;
  DescripcionModelo: string;
  PrecioReferencia: number;
}

export interface ModeloDrone {
  id: number;
  data: ModeloDroneData;
}
