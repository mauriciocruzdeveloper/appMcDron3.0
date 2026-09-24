import { getMovimientosStockPorRepuestoPersistencia } from './repuestosPersistencia.js';
import { supabase } from './supabaseClient.js';

jest.mock('./supabaseClient.js', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('getMovimientosStockPorRepuestoPersistencia', () => {
  it('consulta el ledger por repuesto y mapea los movimientos', async () => {
    const result = {
      data: [{
        id: 8,
        part_id: 12,
        kind: 'adjustment',
        on_hand_delta: -2,
        committed_delta: 0,
        reference_type: 'manual',
        reference_id: null,
        note: 'Conteo físico',
        created_at: '2026-09-24T12:00:00.000Z',
      }],
      error: null,
    };
    const query = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(result),
    };
    supabase.from.mockReturnValue(query);

    await expect(getMovimientosStockPorRepuestoPersistencia('12')).resolves.toEqual([{
      id: '8',
      repuestoId: '12',
      tipo: 'adjustment',
      variacionStock: -2,
      variacionComprometido: 0,
      tipoReferencia: 'manual',
      referenciaId: null,
      nota: 'Conteo físico',
      creadoEn: '2026-09-24T12:00:00.000Z',
    }]);

    expect(supabase.from).toHaveBeenCalledWith('stock_movement');
    expect(query.eq).toHaveBeenCalledWith('part_id', 12);
    expect(query.order).toHaveBeenNthCalledWith(1, 'created_at', { ascending: false });
    expect(query.order).toHaveBeenNthCalledWith(2, 'id', { ascending: false });
    expect(query.limit).toHaveBeenCalledWith(100);
  });

  it('propaga el error de Supabase', async () => {
    const query = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: null, error: new Error('fallo') }),
    };
    supabase.from.mockReturnValue(query);

    await expect(getMovimientosStockPorRepuestoPersistencia('12')).rejects.toThrow('fallo');
  });
});
