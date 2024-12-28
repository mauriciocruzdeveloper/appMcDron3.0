export interface DataCliente {
    EmailUsu: string,
    NombreUsu: string,
    ApellidoUsu: string,
    TelefonoUsu: string,
    ProvinciaUsu: string,
    CiudadUsu: string        
}

export interface ClienteType {
    id: string;
    data: DataCliente;
}