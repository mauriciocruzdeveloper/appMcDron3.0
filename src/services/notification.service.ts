/**
 * notification.service.ts
 * 
 * Servicio para gestionar envío de notificaciones por email, SMS y push.
 * Integra con backend PHP y plugins de Cordova.
 * 
 * **Phase 4 - T4.1:** Sistema de Notificaciones
 * 
 * @module Services/Notification
 */

import type {
    SendNotificationRequest,
    SendNotificationResponse,
    SendEmailData,
    SendSMSData,
    NotificationPreferences,
    NotificationEvent,
    NotificationChannel,
    Notification,
} from '../types/notification.types';

/**
 * Configuración del servicio
 */
const CONFIG = {
    emailEndpoint: '/api/send_email.php',
    smsEndpoint: '/api/send_sms.php',
    preferencesKey: 'notification_preferences',
};

/**
 * Templates de notificaciones por evento
 */
const NOTIFICATION_TEMPLATES: Record<NotificationEvent, {
    email: { subject: string; body: string };
    sms: { body: string };
}> = {
    presupuesto_enviado: {
        email: {
            subject: 'Presupuesto de Reparación #{reparacionId}',
            body: `Hola {clienteNombre},\n\nTe hemos enviado el presupuesto para la reparación de tu {droneModelo}.\n\nMonto: ${'{presupuesto}'}\n\nPuedes revisar los detalles en: {link}\n\nSaludos,\nMcDron`,
        },
        sms: {
            body: 'McDron: Presupuesto #{reparacionId} enviado. Monto: ${presupuesto}. Revisa tu email.',
        },
    },
    presupuesto_aceptado: {
        email: {
            subject: 'Presupuesto Aceptado - Comenzamos Reparación',
            body: `Hola {clienteNombre},\n\n¡Gracias por aceptar el presupuesto!\n\nComenzaremos la reparación de tu {droneModelo} lo antes posible.\n\nTe mantendremos informado del progreso.\n\nSaludos,\nMcDron`,
        },
        sms: {
            body: 'McDron: Presupuesto aceptado. Comenzamos reparación #{reparacionId}. Te avisaremos cuando esté lista.',
        },
    },
    presupuesto_rechazado: {
        email: {
            subject: 'Presupuesto Rechazado',
            body: `Hola {clienteNombre},\n\nHemos registrado que no aceptaste el presupuesto.\n\nSi cambias de opinión o quieres discutir opciones, contáctanos.\n\nSaludos,\nMcDron`,
        },
        sms: {
            body: 'McDron: Presupuesto #{reparacionId} rechazado. Contáctanos si cambias de opinión.',
        },
    },
    estado_cambiado: {
        email: {
            subject: 'Actualización de Estado - Reparación #{reparacionId}',
            body: `Hola {clienteNombre},\n\nTu reparación ha cambiado de estado:\n\nEstado anterior: {estadoAnterior}\nEstado nuevo: {estadoNuevo}\n\nRevisa los detalles en: {link}\n\nSaludos,\nMcDron`,
        },
        sms: {
            body: 'McDron: Reparación #{reparacionId} ahora en estado: {estadoNuevo}',
        },
    },
    drone_recibido: {
        email: {
            subject: 'Drone Recibido - Comenzamos Revisión',
            body: `Hola {clienteNombre},\n\nHemos recibido tu {droneModelo}.\n\nComenzaremos la revisión técnica y te enviaremos el presupuesto pronto.\n\nSaludos,\nMcDron`,
        },
        sms: {
            body: 'McDron: Drone recibido. Número de reparación: #{reparacionId}. Te enviaremos el presupuesto pronto.',
        },
    },
    reparacion_completa: {
        email: {
            subject: '¡Reparación Completada! - #{reparacionId}',
            body: `Hola {clienteNombre},\n\n¡Buenas noticias! La reparación de tu {droneModelo} está completa.\n\nTu drone está listo para ser retirado o enviado.\n\nSaludos,\nMcDron`,
        },
        sms: {
            body: 'McDron: ¡Reparación #{reparacionId} completa! Tu drone está listo. Contáctanos para coordinar entrega.',
        },
    },
    reparacion_lista: {
        email: {
            subject: 'Tu Drone está Listo para Retirar',
            body: `Hola {clienteNombre},\n\nTu {droneModelo} está listo para ser retirado.\n\nNuestro horario: Lunes a Viernes 9-18hs\n\nSaludos,\nMcDron`,
        },
        sms: {
            body: 'McDron: Tu drone está listo para retirar. Horario: Lun-Vie 9-18hs.',
        },
    },
    pago_recibido: {
        email: {
            subject: 'Pago Recibido - Gracias',
            body: `Hola {clienteNombre},\n\nHemos recibido el pago de ${'{monto}'}.\n\nGracias por confiar en McDron.\n\nSaludos,\nMcDron`,
        },
        sms: {
            body: 'McDron: Pago recibido. Gracias por confiar en nosotros.',
        },
    },
    comentario_nuevo: {
        email: {
            subject: 'Nuevo Comentario en Reparación #{reparacionId}',
            body: `Hola {clienteNombre},\n\nHay un nuevo comentario en tu reparación:\n\n"{comentario}"\n\nRevisa los detalles en: {link}\n\nSaludos,\nMcDron`,
        },
        sms: {
            body: 'McDron: Nuevo comentario en reparación #{reparacionId}. Revisa tu email.',
        },
    },
    repuestos_llegados: {
        email: {
            subject: 'Repuestos Disponibles - Continuamos Reparación',
            body: `Hola {clienteNombre},\n\nLos repuestos necesarios para tu {droneModelo} han llegado.\n\nContinuaremos con la reparación de inmediato.\n\nSaludos,\nMcDron`,
        },
        sms: {
            body: 'McDron: Repuestos llegaron. Continuamos reparación #{reparacionId}.',
        },
    },
};

/**
 * Clase principal del servicio de notificaciones
 */
class NotificationService {
    /**
     * Envía una notificación a usuario(s)
     */
    async send(request: SendNotificationRequest): Promise<SendNotificationResponse> {
        try {
            const userIds = Array.isArray(request.userIds) ? request.userIds : [request.userIds];
            const sent: SendNotificationResponse['sent'] = [];
            const failed: SendNotificationResponse['failed'] = [];

            for (const userId of userIds) {
                // Obtener preferencias del usuario
                const prefs = this.getPreferences(userId);
                
                // Determinar canales a usar
                const channels = request.channels || prefs.eventChannels[request.event] || ['email'];
                
                // Enviar por cada canal
                for (const channel of channels) {
                    try {
                        await this.sendByChannel(channel, request.event, request.data, userId);
                        
                        sent.push({
                            notificationId: `${Date.now()}-${userId}-${channel}`,
                            userId,
                            channel,
                            status: 'sent',
                        });
                    } catch (error) {
                        failed.push({
                            userId,
                            channel,
                            error: error instanceof Error ? error.message : 'Error desconocido',
                        });
                    }
                }
            }

            return {
                success: failed.length === 0,
                sent,
                failed,
                message: `Enviadas: ${sent.length}, Fallidas: ${failed.length}`,
            };
        } catch (error) {
            return {
                success: false,
                sent: [],
                failed: [{
                    userId: 'all',
                    channel: 'email',
                    error: error instanceof Error ? error.message : 'Error general',
                }],
                message: 'Error al enviar notificaciones',
            };
        }
    }

    /**
     * Envía notificación por un canal específico
     */
    private async sendByChannel(
        channel: NotificationChannel,
        event: NotificationEvent,
        data: Record<string, string | number>,
        userId: string
    ): Promise<void> {
        const template = NOTIFICATION_TEMPLATES[event];

        switch (channel) {
            case 'email':
                await this.sendEmail({
                    to: data.email as string,
                    toName: data.clienteNombre as string,
                    subject: this.replaceVars(template.email.subject, data),
                    text: this.replaceVars(template.email.body, data),
                    html: this.replaceVars(template.email.body, data).replace(/\n/g, '<br>'),
                });
                break;

            case 'sms':
                await this.sendSMS({
                    to: data.telefono as string,
                    message: this.replaceVars(template.sms.body, data),
                });
                break;

            case 'push':
                // TODO: Implementar push notifications
                console.log('Push notifications not implemented yet');
                break;

            case 'inApp':
                // Guardar en local storage para mostrar en app
                this.saveInAppNotification({
                    id: `${Date.now()}-${userId}`,
                    userId,
                    event,
                    channel: 'inApp',
                    priority: 'normal',
                    status: 'sent',
                    title: this.replaceVars(template.email.subject, data),
                    message: this.replaceVars(template.email.body, data),
                    createdAt: new Date(),
                    reparacionId: data.reparacionId as string,
                });
                break;
        }
    }

    /**
     * Envía un email
     */
    private async sendEmail(data: SendEmailData): Promise<void> {
        const response = await fetch(CONFIG.emailEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Error sending email: ${response.statusText}`);
        }
    }

    /**
     * Envía un SMS (usando Cordova plugin)
     */
    private async sendSMS(data: SendSMSData): Promise<void> {
        // Check if cordova SMS plugin is available
        if (typeof window !== 'undefined' && (window as never)['sms']) {
            const sms = (window as never)['sms'];
            
            return new Promise((resolve, reject) => {
                sms.send(
                    data.to,
                    data.message,
                    {
                        replaceLineBreaks: false,
                        android: { intent: 'INTENT' },
                    },
                    () => resolve(),
                    (error: Error) => reject(error)
                );
            });
        } else {
            // Fallback: usar endpoint PHP
            const response = await fetch(CONFIG.smsEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`Error sending SMS: ${response.statusText}`);
            }
        }
    }

    /**
     * Obtiene preferencias de notificación del usuario
     */
    getPreferences(userId: string): NotificationPreferences {
        const stored = localStorage.getItem(`${CONFIG.preferencesKey}_${userId}`);
        
        if (stored) {
            return JSON.parse(stored);
        }

        // Default preferences
        return {
            userId,
            eventChannels: {
                presupuesto_enviado: ['email'],
                presupuesto_aceptado: ['email', 'sms'],
                estado_cambiado: ['email'],
                drone_recibido: ['email', 'sms'],
                reparacion_completa: ['email', 'sms'],
                reparacion_lista: ['email', 'sms'],
            },
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '08:00',
            },
            emailDigest: 'never',
            language: 'es',
        };
    }

    /**
     * Guarda preferencias de notificación
     */
    savePreferences(prefs: NotificationPreferences): void {
        localStorage.setItem(
            `${CONFIG.preferencesKey}_${prefs.userId}`,
            JSON.stringify(prefs)
        );
    }

    /**
     * Guarda notificación in-app
     */
    private saveInAppNotification(notification: Notification): void {
        const stored = localStorage.getItem('inapp_notifications') || '[]';
        const notifications: Notification[] = JSON.parse(stored);
        
        notifications.unshift(notification);
        
        // Keep only last 50
        if (notifications.length > 50) {
            notifications.splice(50);
        }
        
        localStorage.setItem('inapp_notifications', JSON.stringify(notifications));
    }

    /**
     * Obtiene notificaciones in-app
     */
    getInAppNotifications(userId: string): Notification[] {
        const stored = localStorage.getItem('inapp_notifications') || '[]';
        const all: Notification[] = JSON.parse(stored);
        
        return all.filter(n => n.userId === userId);
    }

    /**
     * Marca notificación como leída
     */
    markAsRead(notificationId: string): void {
        const stored = localStorage.getItem('inapp_notifications') || '[]';
        const notifications: Notification[] = JSON.parse(stored);
        
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.status = 'read';
            notification.readAt = new Date();
            localStorage.setItem('inapp_notifications', JSON.stringify(notifications));
        }
    }

    /**
     * Reemplaza variables en template
     */
    private replaceVars(template: string, data: Record<string, string | number>): string {
        let result = template;
        
        for (const [key, value] of Object.entries(data)) {
            result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
        }
        
        return result;
    }
}

/**
 * Instancia singleton del servicio
 */
export const notificationService = new NotificationService();

/**
 * Hook para usar el servicio de notificaciones
 */
export function useNotifications(): {
    send: (request: SendNotificationRequest) => Promise<SendNotificationResponse>;
    getPreferences: (userId: string) => NotificationPreferences;
    savePreferences: (prefs: NotificationPreferences) => void;
    getInAppNotifications: (userId: string) => Notification[];
    markAsRead: (notificationId: string) => void;
} {
    return {
        send: (request: SendNotificationRequest) => notificationService.send(request),
        getPreferences: (userId: string) => notificationService.getPreferences(userId),
        savePreferences: (prefs: NotificationPreferences) => notificationService.savePreferences(prefs),
        getInAppNotifications: (userId: string) => notificationService.getInAppNotifications(userId),
        markAsRead: (notificationId: string) => notificationService.markAsRead(notificationId),
    };
}
