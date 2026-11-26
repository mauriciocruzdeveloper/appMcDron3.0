import {
  subirArchivoPersistencia,
  subirImagenConMiniaturaPersistencia,
  eliminarArchivoPersistencia,
} from './archivosPersistencia.js';
import { supabase } from './supabaseClient.js';
import { processImageForUpload, getThumbnailUrl } from '../../utils/imageUtils';

jest.mock('./supabaseClient.js', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
    storage: {
      from: jest.fn(),
    },
  },
}));

jest.mock('../../utils/imageUtils', () => {
  const actual = jest.requireActual('../../utils/imageUtils');
  return {
    ...actual,
    processImageForUpload: jest.fn(),
  };
});

describe('archivosPersistencia (almacenamiento DonWeb + compatibilidad legacy Supabase)', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      REACT_APP_API_URL: 'https://mauriciocruzdrones.com.ar/api/',
      REACT_APP_ENDPOINT_API_KEY: 'test-api-key',
    };
    delete process.env.REACT_APP_STORAGE_API_URL;

    global.fetch = jest.fn();

    supabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'jwt.session.token',
        },
      },
      error: null,
    });
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  describe('subirArchivoPersistencia', () => {
    it('sube un documento mediante POST multipart a /upload_file con headers de autenticacion', async () => {
      const expectedUrl =
        'https://mauriciocruzdrones.com.ar/uploads/archivos/REPARACIONES/42/documentos/remito_1.pdf';

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          publicUrl: expectedUrl,
        }),
      });

      const blob = new Blob(['%PDF-1.4 contenido'], { type: 'application/pdf' });
      const result = await subirArchivoPersistencia(
        'REPARACIONES/42/documentos/remito_1.pdf',
        blob
      );

      expect(result).toBe(expectedUrl);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const [calledUrl, options] = global.fetch.mock.calls[0];
      expect(calledUrl).toBe('https://mauriciocruzdrones.com.ar/api/upload_file');
      expect(options.method).toBe('POST');
      expect(options.headers).toEqual({
        'X-API-KEY': 'test-api-key',
        Authorization: 'Bearer jwt.session.token',
        'X-Supabase-Auth': 'jwt.session.token',
      });
      expect(options.body).toBeInstanceOf(FormData);
      expect(options.body.get('path')).toBe('REPARACIONES/42/documentos/remito_1.pdf');
    });

    it('rechaza si no hay sesion activa en Supabase Auth', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const blob = new Blob(['test'], { type: 'text/plain' });
      await expect(
        subirArchivoPersistencia('REPARACIONES/42/documentos/nota.txt', blob)
      ).rejects.toThrow('No hay sesión activa para gestionar archivos');

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('subirImagenConMiniaturaPersistencia', () => {
    it('comprime imagen, adjunta original y _thumb.jpg en una sola llamada y retorna URLs compatibles con getThumbnailUrl', async () => {
      const originalBlob = new Blob(['jpeg-original'], { type: 'image/jpeg' });
      const thumbBlob = new Blob(['jpeg-thumb'], { type: 'image/jpeg' });
      processImageForUpload.mockResolvedValue({
        original: originalBlob,
        thumbnail: thumbBlob,
      });

      const originalUrl =
        'https://mauriciocruzdrones.com.ar/uploads/archivos/REPARACIONES/99/fotos/dron_1700000000.jpg';
      const thumbnailUrl =
        'https://mauriciocruzdrones.com.ar/uploads/archivos/REPARACIONES/99/fotos/dron_1700000000_thumb.jpg';

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          publicUrl: originalUrl,
          thumbnailUrl,
        }),
      });

      const inputBlob = new Blob(['raw-image'], { type: 'image/png' });
      inputBlob.arrayBuffer = async () => new Uint8Array([1, 2, 3]).buffer;

      const result = await subirImagenConMiniaturaPersistencia(
        'REPARACIONES/99/fotos/dron_1700000000',
        inputBlob
      );

      expect(result).toEqual({ originalUrl, thumbnailUrl });
      expect(getThumbnailUrl(result.originalUrl)).toBe(result.thumbnailUrl);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const [, options] = global.fetch.mock.calls[0];
      expect(options.body.get('path')).toBe('REPARACIONES/99/fotos/dron_1700000000.jpg');
      expect(options.body.get('thumbnail_path')).toBe(
        'REPARACIONES/99/fotos/dron_1700000000_thumb.jpg'
      );
    });
  });

  describe('eliminarArchivoPersistencia', () => {
    it('elimina archivos alojados en DonWeb llamando a /delete_file', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          deleted: true,
          thumbnailDeleted: true,
        }),
      });

      const donwebUrl =
        'https://mauriciocruzdrones.com.ar/uploads/archivos/ASIGNACIONES/15/fotos/pieza_1.jpg';
      await expect(eliminarArchivoPersistencia(donwebUrl)).resolves.toBe(true);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://mauriciocruzdrones.com.ar/api/delete_file',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-KEY': 'test-api-key',
            Authorization: 'Bearer jwt.session.token',
          }),
          body: JSON.stringify({ url: donwebUrl }),
        })
      );
      expect(supabase.storage.from).not.toHaveBeenCalled();
    });

    it('conserva compatibilidad para eliminar URLs historicas de Supabase Storage', async () => {
      const removeMock = jest.fn().mockResolvedValue({ error: null });
      supabase.storage.from.mockReturnValue({ remove: removeMock });

      const legacyUrl =
        'https://xyz.supabase.co/storage/v1/object/public/archivos/REPARACIONES/10/fotos/antes_1.jpg';

      await expect(eliminarArchivoPersistencia(legacyUrl)).resolves.toBe(true);

      expect(global.fetch).not.toHaveBeenCalled();
      expect(supabase.storage.from).toHaveBeenCalledWith('archivos');
      expect(removeMock).toHaveBeenNthCalledWith(1, ['REPARACIONES/10/fotos/antes_1.jpg']);
      expect(removeMock).toHaveBeenNthCalledWith(2, ['REPARACIONES/10/fotos/antes_1_thumb.jpg']);
    });
  });
});
