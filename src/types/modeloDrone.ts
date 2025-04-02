// Interfaz para la data de un modelo de drone
export interface ModeloDroneData {
  NombreModelo: string;
  Fabricante: string;
  DescripcionModelo: string;
  EspecificacionesTecnicas: string;
  PrecioReferencia: number;
  AnioLanzamiento: number;
  Estado: string;
}

export interface ModeloDrone {
  id: string;
  data: ModeloDroneData;
}
