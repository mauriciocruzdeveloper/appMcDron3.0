import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import ListaRepuestos from './ListaRepuestos.component';
import { ReparacionRepuestos } from './Reparacion/sections/ReparacionRepuestos';

const mockPush = jest.fn();
const mockDispatch = jest.fn();
let mockEstadoReparacion = 'Aceptado';

const mockRepuesto = {
    id: 'motor',
    data: {
        NombreRepu: 'Motor', DescripcionRepu: '', ProveedorRepu: 'DJI',
        PrecioRepu: 15000, StockRepu: 0, UnidadesComprometidas: 2,
        ModelosDroneIds: ['mini3'], FotoRepu: 'https://example.com/motor.jpg',
    },
};

jest.mock('../hooks/useHistory', () => ({ useHistory: () => ({ push: mockPush }) }));
jest.mock('../redux-tool-kit/hooks/useAppDispatch', () => ({ useAppDispatch: () => mockDispatch }));
jest.mock('../redux-tool-kit/hooks/useAppSelector', () => ({ useAppSelector: (selector: (state: unknown) => unknown) => selector({}) }));
jest.mock('../redux-tool-kit/repuesto/repuesto.selectors', () => ({
    selectRepuestoFilter: () => '',
    selectTieneRepuestos: () => true,
    selectEstadisticasRepuestos: () => ({ total: 1, disponibles: 0, enPedido: 1, agotados: 1 }),
    selectRepuestosFiltrados: () => [mockRepuesto],
    selectColeccionRepuestos: () => ({ motor: mockRepuesto }),
}));
jest.mock('../redux-tool-kit/modeloDrone/modeloDrone.selectors', () => ({
    selectModelosDroneArray: () => [{ id: 'mini3', data: { NombreModelo: 'Mini 3' } }],
    selectColeccionModelosDrone: () => ({ mini3: { id: 'mini3', data: { NombreModelo: 'Mini 3' } } }),
}));
jest.mock('../redux-tool-kit/pedidoRepuesto/pedidoRepuesto.selectors', () => ({
    selectPedidosArray: () => [{ data: { Estado: 'pending', Items: [{ data: { RepuestoId: 'motor', Cantidad: 3 } }] } }],
}));
jest.mock('../redux-tool-kit/reparacion', () => ({
    selectReparacionById: () => () => ({ id: 'rep-1', data: { EstadoRep: mockEstadoReparacion } }),
    selectSeccionesVisibles: () => () => ({ repuestos: true }),
    selectPuedeAvanzarA: () => () => false,
    selectRepuestosDeReparacionActual: () => [{
        repuestoId: 'motor', nombre: 'Motor', estadoStock: 'En pedido', estadoColor: 'warning',
        stockRepu: 0, unidadesPedidas: 2, stockLibre: -2, demandaTotalRepuesto: 2,
        faltanteGlobal: 2, requierePedido: true, tienePedidoActivo: true,
        intervencionesNombre: ['Cambiar motor'],
        pedidos: [{ pedidoId: 'p1', estado: 'pending', proveedorNombre: 'DJI', numeroPedido: '123' }],
    }],
}));
jest.mock('../redux-tool-kit/reparacion/reparacion.actions', () => ({
    getIntervencionesPorReparacionAsync: () => ({ type: 'cargar' }),
    cambiarEstadoReparacionAsync: jest.fn(),
}));
jest.mock('../hooks/useDebouncedField', () => ({ useDebouncedField: () => ({ value: '', onChange: jest.fn() }) }));
jest.mock('./common', () => ({ ComboBox: () => <div /> }));
jest.mock('./ImageGallery', () => ({ ImageGallery: () => <div>Galeria</div> }));
jest.mock('./Reparacion/sections/ReparacionSeccionColapsable', () => ({
    ReparacionSeccionColapsable: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
}));

beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockEstadoReparacion = 'Aceptado';
});

test('el listado renderiza la tarjeta comun y conserva foto y navegacion', () => {
    render(<ListaRepuestos />);
    const tarjeta = within(screen.getByRole('article', { name: 'Repuesto Motor' }));
    expect(tarjeta.getByText('Modelos de drones: Mini 3')).toBeTruthy();
    expect(tarjeta.getByText('3 unidades pedidas')).toBeTruthy();
    fireEvent.click(tarjeta.getByRole('link', { name: 'Motor' }));
    expect(mockPush).toHaveBeenLastCalledWith('/inicio/repuestos/motor');
    mockPush.mockClear();
    fireEvent.click(tarjeta.getByRole('button', { name: 'Ver foto de Motor' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
});

test('reparacion inserta intervenciones y pedidos al final de la misma tarjeta', () => {
    render(<ReparacionRepuestos reparacionId="rep-1" isAdmin />);
    const tarjeta = screen.getByRole('article', { name: 'Repuesto Motor' });
    const contenido = within(tarjeta);
    expect(contenido.getByText('Modelos de drones: Mini 3')).toBeTruthy();
    const detalles = contenido.getByText('Requerido por: Cambiar motor').parentElement!;
    expect(tarjeta.firstElementChild!.lastElementChild).toBe(detalles);
    expect(contenido.getByText(/Cobertura compartida insuficiente: faltan 2/)).toBeTruthy();
    fireEvent.click(contenido.getByRole('button', { name: /Ver pedido #123/ }));
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenLastCalledWith('/inicio/pedidos/p1');
    fireEvent.click(contenido.getByRole('link', { name: 'Motor' }));
    expect(mockPush).toHaveBeenLastCalledWith('/inicio/repuestos/motor');
});

test('reparacion finalizada conserva el detalle de repuestos utilizados sin alertar faltantes', () => {
    mockEstadoReparacion = 'Finalizado';
    render(<ReparacionRepuestos reparacionId="rep-1" isAdmin />);
    expect(screen.getByText(/Reparación finalizada, repuestos ya utilizados/)).toBeTruthy();
    expect(screen.queryByText(/Faltante crítico/)).toBeNull();
});

test('esperando adelanto conserva piezas presupuestadas sin alertas ni afirmar disponibilidad', () => {
    mockEstadoReparacion = 'Esperando adelanto';
    render(<ReparacionRepuestos reparacionId="rep-1" isAdmin />);
    expect(screen.getByRole('article', { name: 'Repuesto Motor' })).toBeTruthy();
    expect(screen.getByText('Requerido por: Cambiar motor')).toBeTruthy();
    expect(screen.getByText('Esperando adelanto, sin compromiso de repuestos')).toBeTruthy();
    expect(screen.queryByText(/Faltante crítico/)).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByText(/Stock disponible para esta reparación/)).toBeNull();
});