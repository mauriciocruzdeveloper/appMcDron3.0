import { DocumentData } from "firebase/firestore";

export interface Usuario {
    id: string;
    data: DocumentData;
    // {
    //   NombreUsu: string,
    //   ApellidoUsu: string,
    //   EmailUsu: string,
    //   ProvinciaUsu: string,
    //   CiudadUsu: string,
    //   Admin: boolean,
    //   Nick: string,
    //   TelefonoUsu: string,
    //   UrlFotoUsu: string
    // };
  }