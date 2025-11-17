import { Estados } from "../types/estado";

export const estados: Estados = {
  Consulta: {
    nombre: "Consulta",
    prioridad: 1,
    accion: "Responder consulta",
    color: "#ff9500",
    etapa: 1,
  },
  Respondido: {
    nombre: "Respondido",
    prioridad: 3,
    accion: "Esperar decisión del cliente",
    color: "#5ac8fa",
    etapa: 2,
  },
  Transito: {
    nombre: "Transito",
    prioridad: 2,
    accion: "Esperar a que llegue",
    color: "#cddc39",
    etapa: 3,
  },
  Recibido: {
    nombre: "Recibido",
    prioridad: 1,
    accion: "Revisar",
    color: "#ffcc00",
    etapa: 4,
  },
  Revisado: {
    nombre: "Revisado",
    prioridad: 1,
    accion: "Presupuestar",
    color: "#ff6b22",
    etapa: 5,
  },
  Presupuestado: {
    nombre: "Presupuestado",
    prioridad: 2,
    accion: "Esperar decisión de cliente",
    color: "#ff2d55",
    etapa: 6,
  },
  Aceptado: {
    nombre: "Aceptado",
    prioridad: 1,
    accion: "Reparar",
    color: "#007aff",
    etapa: 7,
  },
  Rechazado: {
    nombre: "Rechazado",
    prioridad: 1,
    accion: "Diagnosticar",
    color: "#ff9500",
    etapa: 8,
  },
  Repuestos: {
    nombre: "Repuestos",
    prioridad: 1,
    accion: "Esperar llegada de repuestos",
    color: "#009688",
    etapa: 8.5, // Entre Aceptado/Rechazado y Reparado
  },
  Reparado: {
    nombre: "Reparado",
    prioridad: 3,
    accion: "Cobrar reparación",
    color: "#34c759",
    etapa: 9,
  },
  Diagnosticado: {
    nombre: "Diagnosticado",
    prioridad: 3,
    accion: "Cobrar diagnóstico",
    color: "#ff6b35",
    etapa: 10,
  },
  Cobrado: {
    nombre: "Cobrado",
    prioridad: 4,
    accion: "Enviar al cliente",
    color: "#673ab7",
    etapa: 11,
  },
  Enviado: {
    nombre: "Enviado",
    prioridad: 3,
    accion: "Esperar confirmación de entrega",
    color: "#af52de",
    etapa: 12,
  },
  Finalizado: {
    nombre: "Finalizado",
    prioridad: 5,
    accion: "Proceso completado",
    color: "#8e8e93",
    etapa: 13,
  },
  Abandonado: {
    nombre: "Abandonado",
    prioridad: 5,
    accion: "Proceso abandonado por el cliente",
    color: "#8e8e93",
    etapa: 14,
  },
  Cancelado: {
    nombre: "Cancelado",
    prioridad: 5,
    accion: "Proceso cancelado",
    color: "#ff3b30",
    etapa: 15,
  },
  
  // ======================================================
  // ESTADOS DE RETROCOMPATIBILIDAD (SISTEMA ANTERIOR)
  // ======================================================
  Indefinido: {
    nombre: "Indefinido",
    prioridad: 5,
    accion: "Revisar y reasignar estado",
    color: "#8e8e93",
    etapa: 0,
  },
  Reparar: {
    nombre: "Reparar",
    prioridad: 1,
    accion: "Migrar a 'Aceptado'",
    color: "#ff3b30",
    etapa: 100, // Etapa alta para indicar que es legacy
  },
  Entregado: {
    nombre: "Entregado",
    prioridad: 5,
    accion: "Migrar a 'Finalizado'",
    color: "#EEEEEE",
    etapa: 103,
  },
  Venta: {
    nombre: "Venta",
    prioridad: 3,
    accion: "Revisar y reasignar",
    color: "#8e8e93",
    etapa: 104,
  },
  Liquidación: {
    nombre: "Liquidación",
    prioridad: 4,
    accion: "Migrar a 'Cancelado'",
    color: "#8e8e93",
    etapa: 105,
  },
};
