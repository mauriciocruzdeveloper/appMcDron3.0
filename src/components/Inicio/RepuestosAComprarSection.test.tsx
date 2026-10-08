import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RepuestosAComprarSection from './RepuestosAComprarSection.component';
import RepuestosAgotadosSection from './RepuestosAgotadosSection.component';
import RepuestosPedidosSection from './RepuestosPedidosSection.component';
import repuestoReducer, { iniciarCargaRepuestos, setErrorCargaRepuestos, setRepuestos } from '../../redux-tool-kit/repuesto/repuesto.slice';
import pedidoReducer, { iniciarCargaPedidos, setErrorCargaPedidos, setPedidos } from '../../redux-tool-kit/pedidoRepuesto/pedidoRepuesto.slice';
import { selectEstadoComprasRepuestos } from '../../redux-tool-kit/repuesto/repuesto.selectors';

let mockState: any;
jest.mock('redux-tool-kit/hooks/useAppSelector', () => ({
  useAppSelector: (selector: (state: any) => unknown) => selector(mockState),
}));

const crearEstado = (): any => ({
  intervencion: { coleccionIntervenciones: {} },
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
    coleccionRepuestos: { motor: { id: 'motor', data: { NombreRepu: 'Motor', StockRepu: 0, ProveedorRepu: 'DJI' } } },
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
    expect(screen.getByText('Comprar: 3')).toBeTruthy();
    expect(screen.getByText('Necesarios: 5')).toBeTruthy();
    expect(screen.getByText('Stock: 0')).toBeTruthy();
    expect(screen.getByText('Pedidos: 2')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Motor' }).getAttribute('href')).toBe('/inicio/repuestos/motor');
    expect(screen.getByRole('link', { name: /REP-2026-00001/ }).getAttribute('href')).toBe('/inicio/reparaciones/r1');
    const boton = screen.getByRole('button', { name: /Repuestos a comprar/ });
    expect(boton.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(boton);
    expect(screen.queryByText('Comprar: 3')).toBeNull();
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
    expect(screen.queryByText('Comprar: 3')).toBeNull();
  });

  it('muestra vacio confirmado cuando los pedidos cubren toda la demanda sin stock', () => {
    mockState.pedidoRepuesto.coleccionPedidos.p1.data.Items[0].data.Cantidad = 5;
    desplegar();
    expect(screen.getByText('No hay repuestos pendientes de compra')).toBeTruthy();
  });

  it('no muestra compras para repuestos con stock positivo aunque haya demanda sin cubrir', () => {
    mockState.repuesto.coleccionRepuestos.motor.data.StockRepu = 1;
    desplegar();
    expect(screen.getByText('No hay repuestos pendientes de compra')).toBeTruthy();
  });

  it.each([2, 5])('mantiene agotados y pedidos cuando hay %s unidades pedidas', cantidadPedida => {
    mockState.pedidoRepuesto.coleccionPedidos.p1.data.Items[0].data.Cantidad = cantidadPedida;
    render(
      <MemoryRouter>
        <section aria-label='Compras'><RepuestosAComprarSection /></section>
        <section aria-label='Agotados'><RepuestosAgotadosSection /></section>
        <section aria-label='Pedidos'><RepuestosPedidosSection /></section>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Repuestos a comprar/ }));
    fireEvent.click(screen.getByText(/Repuestos Agotados/));
    fireEvent.click(screen.getByText(/Repuestos en Pedido/));
    const compras = within(screen.getByRole('region', { name: 'Compras' }));
    expect(Boolean(compras.queryByRole('link', { name: 'Motor' }))).toBe(cantidadPedida < 5);
    expect(within(screen.getByRole('region', { name: 'Agotados' })).getByText('Motor')).toBeTruthy();
    const pedidos = within(screen.getByRole('region', { name: 'Pedidos' }));
    expect(pedidos.getByText('Motor')).toBeTruthy();
    expect(pedidos.getByText(new RegExp(`${cantidadPedida} unidades pedidas`))).toBeTruthy();
    expect(pedidos.queryByText(/unidades comprometidas/)).toBeNull();
  });

  it('oculta obsoletos e identifica referencias ausentes sin compra inventada', () => {
    mockState.repuesto.coleccionRepuestos.motor.data.Obsoleta = true;
    const { unmount } = render(<MemoryRouter><RepuestosAComprarSection /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /Repuestos a comprar/ }));
    expect(screen.queryByRole('link', { name: 'Motor' })).toBeNull();
    expect(screen.getByText('No hay repuestos pendientes de compra')).toBeTruthy();
    unmount();
    mockState = { ...mockState, repuesto: { ...mockState.repuesto, coleccionRepuestos: {} } };
    desplegar();
    expect(screen.getByText('Repuesto no encontrado (motor)')).toBeTruthy();
    expect(screen.queryByText('Comprar: 3')).toBeNull();
    expect(screen.getByText('Stock: Sin confirmar')).toBeTruthy();
  });

  it('no muestra obsoletos en ninguna de las tres secciones del inicio', () => {
    mockState.repuesto.coleccionRepuestos.motor.data.Obsoleta = true;
    render(
      <MemoryRouter>
        <RepuestosAComprarSection />
        <RepuestosAgotadosSection />
        <RepuestosPedidosSection />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Repuestos a comprar/ }));
    fireEvent.click(screen.getByText(/Repuestos Agotados/));
    fireEvent.click(screen.getByText(/Repuestos en Pedido/));
    expect(screen.queryByText('Motor')).toBeNull();
    expect(screen.getByText('No hay repuestos pendientes de compra')).toBeTruthy();
    expect(screen.getByText('No hay repuestos agotados')).toBeTruthy();
    expect(screen.getByText('No hay repuestos en pedido')).toBeTruthy();
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