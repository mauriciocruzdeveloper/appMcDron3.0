import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReparacionItem from './ReparacionItem.component';
import ReparacionesEsperandoRepuestosSection from '../ReparacionesEsperandoRepuestosSection.component';
import ReparacionesAvisoAbandonoSection from '../ReparacionesAvisoAbandonoSection.component';

let mockFaltantes: Set<string>;
const mockReparaciones = [{ id: 'r1', data: { EstadoRep: 'Repuestos', NombreUsu: 'Ana', ModeloDroneNameRep: 'Mini 3', FeRecRep: null } }];
jest.mock('redux-tool-kit/hooks/useAppSelector', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) => selector({}),
}));
jest.mock('redux-tool-kit/reparacion/reparacion.selectors', () => ({
  selectModeloNombreByReparacionId: () => () => 'Mini 3',
  selectReparacionesConRepuestoFaltante: () => mockFaltantes,
  esUrgente: () => false,
  getDiasAtrasoUrgencia: () => 0,
  selectReparacionesEnRepuestos: () => mockReparaciones,
  selectCantidadEnRepuestos: () => mockReparaciones.length,
  selectReparacionesListasParaAvisoAbandono: () => mockReparaciones,
}));

describe('etiqueta de repuestos en reparaciones del inicio', () => {
  const reparacion = { id: 'r1', data: { EstadoRep: 'Aceptado', NombreUsu: 'Ana' } };
  const estado = { color: '#fff', accion: 'Reparar' };

  it('muestra la misma etiqueta que la lista y conserva la navegacion', () => {
    mockFaltantes = new Set(['r1']);
    const onClick = jest.fn();
    render(<ReparacionItem reparacion={reparacion} estado={estado} onClick={onClick} />);
    expect(screen.getByText(/Repuesto sin cobertura/)).toBeTruthy();
    fireEvent.click(screen.getByText(/Repuesto sin cobertura/));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('no muestra etiqueta cuando la reparacion no tiene faltantes', () => {
    mockFaltantes = new Set(['otra']);
    render(<ReparacionItem reparacion={reparacion} estado={estado} onClick={jest.fn()} />);
    expect(screen.queryByText(/Repuesto sin cobertura/)).toBeNull();
  });

  it.each([true, false])('respeta faltantes=%s en Esperando Repuestos', faltan => {
    mockFaltantes = new Set(faltan ? ['r1'] : []);
    render(<MemoryRouter><ReparacionesEsperandoRepuestosSection /></MemoryRouter>);
    fireEvent.click(screen.getByText(/Esperando Repuestos/));
    expect(Boolean(screen.queryByText(/Repuesto sin cobertura/))).toBe(faltan);
  });

  it.each([true, false])('respeta faltantes=%s en Avisos de abandono', faltan => {
    mockFaltantes = new Set(faltan ? ['r1'] : []);
    render(<MemoryRouter><ReparacionesAvisoAbandonoSection /></MemoryRouter>);
    expect(Boolean(screen.queryByText(/Repuesto sin cobertura/))).toBe(faltan);
  });
});