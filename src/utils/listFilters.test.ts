import { clearStoredListFilter, getStoredListFilter, saveStoredListFilter } from './listFilters';

describe('listFilters helper', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('guarda y restaura un snapshot de filtros', () => {
    const defaults = { modelo: '', estado: '' };

    expect(getStoredListFilter('repuestos', defaults)).toEqual(defaults);

    const next = { modelo: 'Mavic 3', estado: 'Disponible' };
    saveStoredListFilter('repuestos', next);

    expect(getStoredListFilter('repuestos', defaults)).toEqual(next);

    clearStoredListFilter('repuestos');
    expect(getStoredListFilter('repuestos', defaults)).toEqual(defaults);
  });

  it('mantiene operativa la vista si localStorage rechaza una escritura', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    expect(() => saveStoredListFilter('repuestos', { estado: 'Disponible' })).not.toThrow();

    setItemSpy.mockRestore();
  });
});
