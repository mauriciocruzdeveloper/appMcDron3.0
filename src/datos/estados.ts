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
    accion: "Revisar y presupuestar",
    color: "#ffcc00",
    etapa: 4,
  },
  Revisado: {
    nombre: "Revisado",
    prioridad: 1,
    accion: "Enviar Presupuesto",
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
  Reparar: {
    nombre: "Reparar",
    prioridad: 1,
    accion: "Reparar",
    color: "#ff3b30",
    etapa: 7,
  },
  Repuestos: {
    nombre: "Repuestos",
    prioridad: 2,
    accion: "Esperar repuestos",
    color: "#009688",
    etapa: 8,
  },
  Reparado: {
    nombre: "Reparado",
    prioridad: 2,
    accion: "Esperar el cobro",
    color: "#2196f3",
    etapa: 9,
  },
  Diagnosticado: {
    nombre: "Diagnosticado",
    prioridad: 2,
    accion: "Esperar el pago",
    color: "#9c27b0",
    etapa: 10,
  },
  Cobrado: {
    nombre: "Cobrado",
    prioridad: 1,
    accion: "Enviar",
    color: "#673ab7",
    etapa: 11,
  },
  Entregado: {
    nombre: "Entregado",
    prioridad: 5,
    accion: "",
    color: "#EEEEEE",
    etapa: 12,
  },
  Venta: {
    nombre: "Venta",
    prioridad: 3,
    accion: "",
    color: "#8e8e93",
    etapa: 13,
  },
  Liquidación: {
    nombre: "Liquidación",
    prioridad: 4,
    accion: "",
    color: "#8e8e93",
    etapa: 14,
  },
  Trabado: {
    nombre: "Trabado",
    prioridad: 3,
    accion: "",
    color: "#4cd964",
    etapa: 15,
  },
};
