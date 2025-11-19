/**
 * notification.types.ts
 * 
 * Tipos TypeScript para el sistema de notificaciones.
 * Define eventos, canales, templates y configuración.
 * 
 * **Phase 4 - T4.1:** Sistema de Notificaciones
 * 
 * @module Types/Notification
 */

/**
 * Canales de notificación disponibles
 */
export type NotificationChannel = 'email' | 'sms' | 'push' | 'inApp';

/**
 * Eventos que pueden disparar notificaciones
 */
export type NotificationEvent =
    | 'presupuesto_enviado'
    | 'presupuesto_aceptado'
    | 'presupuesto_rechazado'
    | 'estado_cambiado'
    | 'drone_recibido'
    | 'reparacion_completa'
    | 'reparacion_lista'
    | 'pago_recibido'
    | 'comentario_nuevo'
    | 'repuestos_llegados';

/**
 * Prioridad de la notificación
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Estado de envío de la notificación
 */
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'read';

/**
 * Configuración de notificaciones por usuario
 */
export interface NotificationPreferences {
    /** ID del usuario */
    userId: string;
    
    /** Canales habilitados por evento */
    eventChannels: {
        [K in NotificationEvent]?: NotificationChannel[];
    };
    
    /** Horario de no molestar */
    quietHours?: {
        enabled: boolean;
        start: string; // HH:mm
        end: string;   // HH:mm
    };
    
    /** Frecuencia de digest email */
    emailDigest?: 'never' | 'daily' | 'weekly';
    
    /** Idioma preferido */
    language?: 'es' | 'en';
}

/**
 * Template de notificación
 */
export interface NotificationTemplate {
    /** ID único del template */
    id: string;
    
    /** Evento asociado */
    event: NotificationEvent;
    
    /** Canal para el que es este template */
    channel: NotificationChannel;
    
    /** Asunto (para email) */
    subject?: string;
    
    /** Cuerpo del mensaje (puede tener placeholders) */
    body: string;
    
    /** HTML body (para email) */
    htmlBody?: string;
    
    /** Placeholders disponibles */
    placeholders: string[];
}

/**
 * Datos de una notificación individual
 */
export interface Notification {
    /** ID único */
    id: string;
    
    /** Usuario destinatario */
    userId: string;
    
    /** Evento que disparó la notificación */
    event: NotificationEvent;
    
    /** Canal usado */
    channel: NotificationChannel;
    
    /** Prioridad */
    priority: NotificationPriority;
    
    /** Estado actual */
    status: NotificationStatus;
    
    /** Título de la notificación */
    title: string;
    
    /** Mensaje */
    message: string;
    
    /** Datos adicionales (JSON) */
    metadata?: Record<string, unknown>;
    
    /** ID de reparación relacionada */
    reparacionId?: string;
    
    /** Fecha de creación */
    createdAt: Date;
    
    /** Fecha de envío */
    sentAt?: Date;
    
    /** Fecha de lectura */
    readAt?: Date;
    
    /** Error si falló */
    error?: string;
}

/**
 * Request para enviar notificación
 */
export interface SendNotificationRequest {
    /** Usuario(s) destinatario(s) */
    userIds: string | string[];
    
    /** Evento que dispara la notificación */
    event: NotificationEvent;
    
    /** Canales a usar (opcional, usa preferencias del usuario) */
    channels?: NotificationChannel[];
    
    /** Prioridad (default: normal) */
    priority?: NotificationPriority;
    
    /** Datos para reemplazar en template */
    data: Record<string, string | number>;
    
    /** ID de reparación relacionada */
    reparacionId?: string;
    
    /** Forzar envío aunque esté en quiet hours */
    force?: boolean;
}

/**
 * Response del servicio de notificaciones
 */
export interface SendNotificationResponse {
    /** Éxito general */
    success: boolean;
    
    /** Notificaciones enviadas */
    sent: Array<{
        notificationId: string;
        userId: string;
        channel: NotificationChannel;
        status: 'sent' | 'queued';
    }>;
    
    /** Notificaciones fallidas */
    failed: Array<{
        userId: string;
        channel: NotificationChannel;
        error: string;
    }>;
    
    /** Mensaje general */
    message: string;
}

/**
 * Configuración de template de email
 */
export interface EmailTemplate {
    /** Nombre del template */
    name: string;
    
    /** Asunto */
    subject: string;
    
    /** HTML template */
    html: string;
    
    /** Texto plano (fallback) */
    text: string;
    
    /** Variables requeridas */
    requiredVars: string[];
}

/**
 * Datos para enviar email
 */
export interface SendEmailData {
    /** Email destinatario */
    to: string;
    
    /** Nombre destinatario */
    toName?: string;
    
    /** Asunto */
    subject: string;
    
    /** HTML body */
    html: string;
    
    /** Texto plano */
    text?: string;
    
    /** Adjuntos */
    attachments?: Array<{
        filename: string;
        path: string;
    }>;
    
    /** Reply-to */
    replyTo?: string;
}

/**
 * Datos para enviar SMS
 */
export interface SendSMSData {
    /** Número de teléfono */
    to: string;
    
    /** Mensaje (max 160 caracteres) */
    message: string;
    
    /** Remitente (opcional) */
    from?: string;
}

/**
 * Estadísticas de notificaciones
 */
export interface NotificationStats {
    /** Total enviadas */
    totalSent: number;
    
    /** Total fallidas */
    totalFailed: number;
    
    /** Por canal */
    byChannel: {
        [K in NotificationChannel]?: {
            sent: number;
            failed: number;
        };
    };
    
    /** Por evento */
    byEvent: {
        [K in NotificationEvent]?: number;
    };
    
    /** Últimas 24 horas */
    last24h: number;
    
    /** Tasa de lectura (in-app) */
    readRate?: number;
}
