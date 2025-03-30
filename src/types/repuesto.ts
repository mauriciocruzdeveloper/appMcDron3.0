export interface Repuesto {
    id: string;
    data: {
        NombreRepu: string;
        DescripcionRepu: string;
        ModeloRepu: string;
        PrecioRepu: number;
        ProveedorRepu: string;
        FechaRegistroRepu?: Date;
        StockRepu?: number;
        EstadoRepu?: 'Disponible' | 'Agotado' | 'Descontinuado';
    }
}
