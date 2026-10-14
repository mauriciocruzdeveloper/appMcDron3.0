import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import RepuestoCard from './RepuestoCard.component';
import { Repuesto } from '../types/repuesto';

jest.mock('./ImageGallery', () => ({
    ImageGallery: () => <div>Galeria de fotos</div>,
}));

const repuesto: Repuesto = {
    id: 'repuesto-1',
    data: {
        NombreRepu: 'Motor',
        DescripcionRepu: '',
        ProveedorRepu: 'Proveedor DJI',
        PrecioRepu: 15000,
        StockRepu: 2,
        UnidadesComprometidas: 1,
        ModelosDroneIds: ['modelo-1'],
        FotoRepu: 'https://example.com/motor.jpg',
        Obsoleta: true,
    },
};

test('muestra los datos comunes y coloca los detalles al final sin interferir con la navegacion', () => {
    const onClick = jest.fn();
    const onPedido = jest.fn();
    render(
        <RepuestoCard repuesto={repuesto} modelosNombres={['Mini 3']} estado="En Pedido" cantidadPedida={3} vecesUsado={2} onClick={onClick}>
            <button onClick={onPedido}>Ver pedido</button>
        </RepuestoCard>
    );

    ['Proveedor DJI', 'En Pedido', 'Obsoleto', 'Stock: 2', '| Comprometido: 1', 'Modelos de drones: Mini 3', '3 unidades pedidas', 'Usado 2 veces en reparaciones'].forEach(texto => {
        expect(screen.getByText(texto)).toBeTruthy();
    });
    expect(screen.getByText(/\$\s*15\.000,00/)).toBeTruthy();
    const detalles = screen.getByRole('button', { name: 'Ver pedido' }).parentElement!;
    expect(detalles.parentElement!.lastElementChild).toBe(detalles);
    fireEvent.click(screen.getByRole('link', { name: 'Motor' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Ver pedido' }));
    expect(onPedido).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('Proveedor DJI'));
    expect(onClick).toHaveBeenCalledTimes(2);
});

test('abre y cierra la foto sin navegar y usa la imagen original si falla la miniatura', () => {
    const onClick = jest.fn();
    render(<RepuestoCard repuesto={repuesto} modelosNombres={[]} estado="Disponible" onClick={onClick} />);

    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img').getAttribute('src')).toBe(repuesto.data.FotoRepu);
    fireEvent.click(screen.getByRole('button', { name: 'Ver foto de Motor' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar foto' }));
    expect(screen.queryByRole('dialog')).toBeNull();
});

test('soporta repuestos sin foto ni modelos y los contadores en cero', () => {
    render(<RepuestoCard repuesto={{ ...repuesto, data: { ...repuesto.data, FotoRepu: '' } }} modelosNombres={[]} estado="Agotado" cantidadPedida={0} vecesUsado={0} onClick={jest.fn()} />);

    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('Modelos de drones: Sin modelos asignados')).toBeTruthy();
    expect(screen.getByText('No usado en reparaciones')).toBeTruthy();
    expect(screen.queryByText('0 unidades pedidas')).toBeNull();
});

test('inserta incluso un valor cero dentro del espacio fijo', () => {
    render(<RepuestoCard repuesto={repuesto} modelosNombres={[]} estado="Disponible" onClick={jest.fn()}>{0}</RepuestoCard>);

    const detalle = screen.getByText('0');
    expect(detalle.className).toContain('repuesto-card-details');
    expect(detalle.parentElement?.lastElementChild).toBe(detalle);
});