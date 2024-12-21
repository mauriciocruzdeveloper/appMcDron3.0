import { Estados } from "../types/estado";

export const estados: Estados = {
  Consulta: {
    nombre: "Consulta",
    prioridad: 1,
    accion: "Responder consulta",
    color: "#ff9500",
  },
  Respondido: {
    nombre: "Respondido",
    prioridad: 3,
    accion: "Esperar decisión del cliente",
    color: "#5ac8fa",
  },
  Transito: {
    nombre: "Transito",
    prioridad: 2,
    accion: "Esperar a que llegue",
    color: "#cddc39",
  },
  Recibido: {
    nombre: "Recibido",
    prioridad: 1,
    accion: "Revisar y presupuestar",
    color: "#ffcc00",
  },
  Revisado: {
    nombre: "Revisado",
    prioridad: 1,
    accion: "Enviar Presupuesto",
    color: "#ff6b22",
  },
  Presupuestado: {
    nombre: "Presupuestado",
    prioridad: 2,
    accion: "Esperar decisión de cliente",
    color: "#ff2d55",
  },
  Reparar: {
    nombre: "Reparar",
    prioridad: 1,
    accion: "Reparar",
    color: "#ff3b30",
  },
  Repuestos: {
    nombre: "Repuestos",
    prioridad: 2,
    accion: "Esperar repuestos",
    color: "#009688",
  },
  Reparado: {
    nombre: "Reparado",
    prioridad: 2,
    accion: "Esperar el cobro",
    color: "#2196f3",
  },
  Diagnosticado: {
    nombre: "Diagnosticado",
    prioridad: 2,
    accion: "Esperar el pago",
    color: "#9c27b0",
  },
  Cobrado: {
    nombre: "Cobrado",
    prioridad: 1,
    accion: "Enviar",
    color: "#673ab7",
  },
  Entregado: {
    nombre: "Entregado",
    prioridad: 5,
    accion: "",
    color: "#EEEEEE"
  },
  Venta: {
    nombre: "Venta",
    prioridad: 3,
    accion: "",
    color: "#8e8e93",
  },
  Liquidación: {
    nombre: "Liquidación",
    prioridad: 4,
    accion: "",
    color: "#8e8e93",
  },
  Trabado: {
    nombre: "Trabado",
    prioridad: 3,
    accion: "",
    color: "#4cd964",
  },
}
