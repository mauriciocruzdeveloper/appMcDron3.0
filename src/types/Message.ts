/**
 * Interfaz para los mensajes entre usuarios
 * IMPORTANTE: from y to son los IDs de los usuarios (usuario.id)
 * NO usar emails para identificar usuarios en mensajes
 */
export interface Message {
  id: string,
  data: {
    date: number,
    content: string,
    senderName: string,
    from: string, // ID del usuario que envía
    to: string, // ID del usuario que recibe
    isRead?: boolean
  }
}