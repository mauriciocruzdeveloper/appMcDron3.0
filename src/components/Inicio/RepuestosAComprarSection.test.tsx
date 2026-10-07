import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RepuestosAComprarSection from './RepuestosAComprarSection.component';
import repuestoReducer, { iniciarCargaRepuestos, setErrorCargaRepuestos, setRepuestos } from '../../redux-tool-kit/repuesto/repuesto.slice';
import pedidoReducer, { iniciarCargaPedidos, setErrorCargaPedidos, setPedidos } from '../../redux-tool-kit/pedidoRepuesto/pedidoRepuesto.slice';
import { selectEstadoComprasRepuestos } from '../../redux-tool-kit/repuesto/repuesto.selectors';

let mockState: any;
jest.mock('redux-tool-kit/hooks/useAppSelector', () => ({
  useAppSelector: (selector: (state: any) => unknown) => selector(mockState),
}));

const crearEstado = (): any => ({
  modeloDrone: { coleccionModelosDrone: {
    mini3: { id: 'mini3', data: { NombreModelo: 'Mini 3' } },
    mini4: { id: 'mini4', data: { NombreModelo: 'Mini 4 Pro' } },
  } },
  reparacion: {
    estadoAsignacionesCompromiso: 'succeeded', errorAsignacionesCompromiso: null,
    asignacionesCompromiso: [{ id: 'a1', reparacionId: 'r1', estadoReparacion: 'Aceptado',
      incluyeRepuestosTaller: true, repuestosSnapshot: [{ partId: 'motor', quantity: 5 }] }],
    coleccionReparaciones: { r1: { id: 'r1', data: {
      IdPublicoRep: 'REP-2026-00001', ModeloDroneNameRep: 'Mini 3', NombreUsu: 'Ana',
    } } },
  },
  repuesto: {
    estadoCarga: 'succeeded', errorCarga: null,
    coleccionRepuestos: { motor: { id: 'motor', data: { NombreRepu: 'Motor', StockRepu: 1, ProveedorRepu: 'DJI' } } },
  },
  pedidoRepuesto: {
    estadoCarga: 'succeeded', errorCarga: null,
    coleccionPedidos: { p1: { data: { Estado: 'pending', Items: [{ data: { RepuestoId: 'motor', Cantidad: 2 } }] } } },
  },
});

const desplegar = () => {
  render(<MemoryRouter><RepuestosAComprarSection /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: /Repuestos a comprar/ }));
};

describe('lista de compras del inicio', () => {
  beforeEach(() => { mockState = crearEstado(); });

  it('pliega la lista, muestra cantidades y enlaza a repuesto y reparacion', () => {
    desplegar();
    expect(screen.getByText('Comprar: 2')).toBeTruthy();
    expect(screen.getByText('Necesarios: 5')).toBeTruthy();
    expect(screen.getByText('Stock: 1')).toBeTruthy();
    expect(screen.getByText('Pedidos: 2')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Motor' }).getAttribute('href')).toBe('/inicio/repuestos/motor');
    expect(screen.getByRole('link', { name: /REP-2026-00001/ }).getAttribute('href')).toBe('/inicio/reparaciones/r1');
    const boton = screen.getByRole('button', { name: /Repuestos a comprar/ });
    expect(boton.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(boton);
    expect(screen.queryByText('Comprar: 2')).toBeNull();
  });

  it('muestra el modelo junto al repuesto separado por un guion', () => {
    mockState.repuesto.coleccionRepuestos.motor.data.ModelosDroneIds = ['mini3'];
    desplegar();
    expect(screen.getByRole('link', { name: 'Motor - Mini 3' }).getAttribute('href')).toBe('/inicio/repuestos/motor');
  });

  it('muestra varios modelos sin duplicados e ignora referencias no cargadas', () => {
    mockState.repuesto.coleccionRepuestos.motor.data.ModelosDroneIds = ['mini3', 'mini4', 'mini3', 'ausente'];
    desplegar();
    expect(screen.getByRole('link', { name: 'Motor - Mini 3, Mini 4 Pro' })).toBeTruthy();
  });

  it('conserva el nombre sin guion si no hay modelos disponibles', () => {
    mockState.repuesto.coleccionRepuestos.motor.data.ModelosDroneIds = ['ausente'];
    desplegar();
    expect(screen.getByRole('link', { name: 'Motor' })).toBeTruthy();
  });

  it.each(['repuesto', 'pedidoRepuesto', 'reparacion'])('no confirma vacio durante carga de %s', capa => {
    if (capa === 'reparacion') mockState[capa].estadoAsignacionesCompromiso = 'loading';
    else mockState[capa].estadoCarga = 'idle';
    desplegar();
    expect(screen.getByRole('status').textContent).toContain('Cargando');
    expect(screen.queryByText('No hay repuestos pendientes de compra')).toBeNull();
  });

  it('muestra error en lugar de cantidades sin confirmar', () => {
    mockState.pedidoRepuesto.estadoCarga = 'failed';
    mockState.pedidoRepuesto.errorCarga = 'Error de pedidos';
    desplegar();
    expect(screen.getByRole('alert').textContent).toBe('Error de pedidos');
    expect(screen.queryByText('Comprar: 2')).toBeNull();
  });

  it('muestra vacio confirmado cuando stock y pedidos cubren la demanda', () => {
    mockState.repuesto.coleccionRepuestos.motor.data.StockRepu = 3;
    desplegar();
    expect(screen.getByText('No hay repuestos pendientes de compra')).toBeTruthy();
  });

  it('identifica referencias ausentes sin compra inventada y senala obsoletos', () => {
    mockState.repuesto.coleccionRepuestos.motor.data.Obsoleta = true;
    const { unmount } = render(<MemoryRouter><RepuestosAComprarSection /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /Repuestos a comprar/ }));
    expect(screen.getByText('Obsoleto: revisar alternativa')).toBeTruthy();
    unmount();
    mockState = { ...mockState, repuesto: { ...mockState.repuesto, coleccionRepuestos: {} } };
    desplegar();
    expect(screen.getByText('Repuesto no encontrado (motor)')).toBeTruthy();
    expect(screen.queryByText('Comprar: 2')).toBeNull();
    expect(screen.getByText('Stock: Sin confirmar')).toBeTruthy();
  });

  it('los reducers distinguen carga, error y recuperacion con colecciones vacias', () => {
    let repuestos = repuestoReducer(undefined, iniciarCargaRepuestos());
    let pedidos = pedidoReducer(undefined, iniciarCargaPedidos());
    expect(selectEstadoComprasRepuestos({ ...mockState, repuesto: repuestos, pedidoRepuesto: pedidos }).estado).toBe('loading');
    repuestos = repuestoReducer(repuestos, setErrorCargaRepuestos('Stock no disponible'));
    pedidos = pedidoReducer(pedidos, setErrorCargaPedidos('Pedidos no disponibles'));
    expect(selectEstadoComprasRepuestos({ ...mockState, repuesto: repuestos, pedidoRepuesto: pedidos }).estado).toBe('failed');
    repuestos = repuestoReducer(repuestos, setRepuestos([]));
    pedidos = pedidoReducer(pedidos, setPedidos([]));
    expect(selectEstadoComprasRepuestos({ ...mockState, repuesto: repuestos, pedidoRepuesto: pedidos }).estado).toBe('succeeded');
    expect(repuestos.errorCarga).toBeNull();
    expect(pedidos.errorCarga).toBeNull();
  });
});