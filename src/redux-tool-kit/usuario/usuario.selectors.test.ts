import { selectClientesConCuitConUso } from './usuario.selectors';

describe('selectClientesConCuitConUso', () => {
  it('calcula el uso del CUIT con colores y oculta clientes con 5 o más usos', () => {
    const state = {
      usuario: {
        filter: '',
        coleccionUsuarios: {
          user1: {
            id: 'user1',
            data: { NombreUsu: 'Ana', ApellidoUsu: 'García', Role: 'cliente', CUIT: '20-12345678-6' },
          },
          user2: {
            id: 'user2',
            data: { NombreUsu: 'Bruno', ApellidoUsu: 'López', Role: 'cliente', CUIT: '27-12345678-0' },
          },
          user3: {
            id: 'user3',
            data: { NombreUsu: 'Carla', ApellidoUsu: 'Pérez', Role: 'cliente', CUIT: '30-12345678-1' },
          },
          user4: {
            id: 'user4',
            data: { NombreUsu: 'Diego', ApellidoUsu: 'Martín', Role: 'cliente', CUIT: '23-12345678-5' },
          },
          user5: {
            id: 'user5',
            data: { NombreUsu: 'Ema', ApellidoUsu: 'Sosa', Role: 'cliente', CUIT: '24-12345678-1' },
          },
          user6: {
            id: 'user6',
            data: { NombreUsu: 'Flor', ApellidoUsu: 'Ramos', Role: 'cliente', CUIT: '25-12345678-8' },
          },
        },
      },
      pedidoRepuesto: {
        coleccionPedidos: {
          p1: { id: 'p1', data: { CUIT: '20123456786', Items: [] } },
          p2: { id: 'p2', data: { CUIT: '20123456786', Items: [] } },
          p3: { id: 'p3', data: { CUIT: '27123456780', Items: [] } },
          p4: { id: 'p4', data: { CUIT: '27123456780', Items: [] } },
          p5: { id: 'p5', data: { CUIT: '30123456781', Items: [] } },
          p6: { id: 'p6', data: { CUIT: '30123456781', Items: [] } },
          p7: { id: 'p7', data: { CUIT: '30123456781', Items: [] } },
          p8: { id: 'p8', data: { CUIT: '30123456781', Items: [] } },
          p9: { id: 'p9', data: { CUIT: '30123456781', Items: [] } },
          p10: { id: 'p10', data: { CUIT: '23123456785', Items: [] } },
          p11: { id: 'p11', data: { CUIT: '23123456785', Items: [] } },
          p12: { id: 'p12', data: { CUIT: '23123456785', Items: [] } },
          p13: { id: 'p13', data: { CUIT: '23123456785', Items: [] } },
          p14: { id: 'p14', data: { CUIT: '23123456785', Items: [] } },
          p15: { id: 'p15', data: { CUIT: '24123456781', Items: [] } },
        },
      },
    } as any;

    const clientes = selectClientesConCuitConUso(state);

    expect(clientes.map(cliente => ({
      id: cliente.id,
      usos: cliente.usos,
      badgeText: cliente.badgeText,
      badgeColor: cliente.badgeColor,
    }))).toEqual([
      { id: 'user1', usos: 2, badgeText: '2', badgeColor: 'warning' },
      { id: 'user2', usos: 2, badgeText: '2', badgeColor: 'warning' },
      { id: 'user5', usos: 1, badgeText: '1', badgeColor: 'success' },
      { id: 'user6', usos: 0, badgeText: '0', badgeColor: 'success' },
    ]);
  });
});
