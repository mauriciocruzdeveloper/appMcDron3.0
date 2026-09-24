export interface MovimientoStock {
  id: string;
  repuestoId: string;
  tipo: string;
  variacionStock: number;
  variacionComprometido: number;
  tipoReferencia?: string | null;
  referenciaId?: string | null;
  nota?: string | null;
  creadoEn: string;
}