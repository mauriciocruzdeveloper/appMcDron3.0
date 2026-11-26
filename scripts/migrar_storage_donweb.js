#!/usr/bin/env node

/**
 * Herramienta de migración por etapas: Supabase Storage (bucket 'archivos') -> DonWeb
 *
 * Modos de uso:
 *   1) Auditoría sin tocar nada (modo por defecto):
 *      node scripts/migrar_storage_donweb.js --dry-run
 *
 *   2) Etapa 2 — Descargar todos los objetos del bucket 'archivos' a disco local (reanudable):
 *      node scripts/migrar_storage_donweb.js --download [--out-dir=./tmp_migracion_archivos]
 *      (Luego subir esa carpeta a public_html/uploads/archivos en DonWeb vía FTPS con lftp)
 *
 *   3) Verificar localmente (sin bombardear a DonWeb por HTTP) que cada archivo referenciado
 *      en la BD exista y tenga tamaño > 0 en el directorio sincronizado por FTPS:
 *      node scripts/migrar_storage_donweb.js --verify-urls [--out-dir=./tmp_migracion_archivos]
 *
 *   4) Etapa 3 — Actualizar prefijos de URLs en PostgreSQL (guarda backup JSON reversible antes):
 *      node scripts/migrar_storage_donweb.js --update-db --confirm [--target-base-url=https://mauriciocruzdrones.com.ar/uploads/archivos]
 *
 * Importante: Este script NUNCA borra archivos de Supabase Storage ni hace ráfagas HTTP a DonWeb.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_URL = (process.env.REACT_APP_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_KEY =
  process.env.REACT_APP_SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_KEY;
const BUCKET_NAME = 'archivos';
const DEFAULT_TARGET_BASE = 'https://mauriciocruzdrones.com.ar/uploads/archivos';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Uso:
  node scripts/migrar_storage_donweb.js --dry-run
  node scripts/migrar_storage_donweb.js --download [--out-dir=./tmp_migracion_archivos]
  node scripts/migrar_storage_donweb.js --verify-urls [--target-base-url=${DEFAULT_TARGET_BASE}]
  node scripts/migrar_storage_donweb.js --update-db --confirm [--target-base-url=${DEFAULT_TARGET_BASE}]
`);
  process.exit(0);
}

const getArgValue = (prefix, fallback) => {
  const found = args.find((a) => a.startsWith(`${prefix}=`));
  return found ? found.slice(prefix.length + 1) : fallback;
};

const isDownload = args.includes('--download');
const isVerifyUrls = args.includes('--verify-urls');
const isUpdateDb = args.includes('--update-db');
const isConfirmed = args.includes('--confirm');
const skipVerify = args.includes('--skip-verify');
const outDir = path.resolve(getArgValue('--out-dir', './tmp_migracion_archivos'));
const targetBaseUrl = getArgValue('--target-base-url', DEFAULT_TARGET_BASE).replace(/\/+$/, '');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    'Error: REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_SERVICE_KEY (o REACT_APP_SUPABASE_KEY) deben estar definidas en .env'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const SUPABASE_PUBLIC_MARKER = `/storage/v1/object/public/${BUCKET_NAME}/`;

/**
 * Normaliza los segmentos de ruta para DonWeb:
 * - Carpeta raíz siempre en MAYÚSCULAS (corrige casos históricos como 'asignaciones/218/...')
 * - Reemplaza espacios en nombres de archivo por '_' para evitar problemas con URLs/FTPS
 */
function normalizeRelativeSegments(rawSegments) {
  return rawSegments.map((seg, idx) => {
    let decoded = seg;
    try {
      decoded = decodeURIComponent(seg);
    } catch (_e) {
      // mantener original
    }
    if (idx === 0) {
      return decoded.toUpperCase();
    }
    return decoded.replace(/\s+/g, '_');
  });
}

/**
 * Convierte una URL pública de Supabase Storage a su equivalente en DonWeb.
 * Si no pertenece al bucket 'archivos' de Supabase, devuelve la misma URL sin cambios.
 */
function mapSupabaseUrlToDonweb(url) {
  if (typeof url !== 'string' || !url) return url;
  const idx = url.indexOf(SUPABASE_PUBLIC_MARKER);
  if (idx === -1) return url;

  const rawTail = url.slice(idx + SUPABASE_PUBLIC_MARKER.length).split('?')[0];
  const normalizedSegments = normalizeRelativeSegments(rawTail.split('/'));
  const encodedPath = normalizedSegments.map((seg) => encodeURIComponent(seg)).join('/');
  return `${targetBaseUrl}/${encodedPath}`;
}

function isSupabaseBucketUrl(url) {
  return typeof url === 'string' && url.includes(SUPABASE_PUBLIC_MARKER);
}

/**
 * Lista recursivamente todos los archivos reales dentro del bucket 'archivos'.
 */
async function listarBucketRecursivo(prefix = '') {
  const archivos = [];
  let offset = 0;
  const pageSize = 100;

  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).list(prefix, {
      limit: pageSize,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      throw new Error(`Error listando '${prefix}': ${error.message}`);
    }
    if (!data || data.length === 0) break;

    for (const item of data) {
      if (!item.name || item.name === '.emptyFolderPlaceholder') continue;
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      // En Supabase Storage las carpetas tienen id === null
      if (item.id === null) {
        const nested = await listarBucketRecursivo(fullPath);
        archivos.push(...nested);
      } else {
        archivos.push({
          path: fullPath,
          size: item.metadata?.size || 0,
          mimetype: item.metadata?.mimetype || '',
        });
      }
    }

    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return archivos;
}

/**
 * Obtiene todas las filas paginadas de una tabla en Supabase.
 */
async function fetchAllRows(table, columns) {
  const all = [];
  let from = 0;
  const step = 500;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + step - 1);

    if (error) {
      throw new Error(`Error consultando ${table}: ${error.message}`);
    }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < step) break;
    from += step;
  }

  return all;
}

/**
 * Recolecta todos los cambios pendientes en BD (tablas repair, repair_intervention, part, user).
 */
async function planificarCambiosBaseDeDatos() {
  const plan = {
    repair: [],
    repair_intervention: [],
    part: [],
    user: [],
    allTargetUrls: new Set(),
  };

  const trackAndMapString = (val) => {
    if (!isSupabaseBucketUrl(val)) return { changed: false, value: val };
    const mapped = mapSupabaseUrlToDonweb(val);
    plan.allTargetUrls.add(mapped);
    return { changed: mapped !== val, value: mapped };
  };

  const trackAndMapArray = (arr) => {
    if (!Array.isArray(arr)) return { changed: false, value: arr };
    let anyChanged = false;
    const next = arr.map((item) => {
      const res = trackAndMapString(item);
      if (res.changed) anyChanged = true;
      return res.value;
    });
    return { changed: anyChanged, value: next };
  };

  // 1. repair
  const repairs = await fetchAllRows(
    'repair',
    'id, photo_urls, document_urls, photo_before, photo_after, informe_photo_urls'
  );
  for (const row of repairs) {
    const patch = {};
    const before = {};

    for (const arrCol of ['photo_urls', 'document_urls', 'informe_photo_urls']) {
      const res = trackAndMapArray(row[arrCol]);
      if (res.changed) {
        before[arrCol] = row[arrCol];
        patch[arrCol] = res.value;
      }
    }

    for (const strCol of ['photo_before', 'photo_after']) {
      const res = trackAndMapString(row[strCol]);
      if (res.changed) {
        before[strCol] = row[strCol];
        patch[strCol] = res.value;
      }
    }

    if (Object.keys(patch).length > 0) {
      plan.repair.push({ id: row.id, before, patch });
    }
  }

  // 2. repair_intervention
  const interventions = await fetchAllRows('repair_intervention', 'id, photos');
  for (const row of interventions) {
    const res = trackAndMapArray(row.photos);
    if (res.changed) {
      plan.repair_intervention.push({
        id: row.id,
        before: { photos: row.photos },
        patch: { photos: res.value },
      });
    }
  }

  // 3. part
  const parts = await fetchAllRows('part', 'id, photo_url');
  for (const row of parts) {
    const res = trackAndMapString(row.photo_url);
    if (res.changed) {
      plan.part.push({
        id: row.id,
        before: { photo_url: row.photo_url },
        patch: { photo_url: res.value },
      });
    }
  }

  // 4. user
  const users = await fetchAllRows('user', 'id, url_photo');
  for (const row of users) {
    const res = trackAndMapString(row.url_photo);
    if (res.changed) {
      plan.user.push({
        id: row.id,
        before: { url_photo: row.url_photo },
        patch: { url_photo: res.value },
      });
    }
  }

  return plan;
}

/**
 * Verifica sobre el directorio local sincronizado (sin enviar peticiones HTTP a DonWeb)
 * que cada URL destino mapeada tenga su archivo no vacío.
 */
function verificarArchivosSincronizadosLocalmente(urls) {
  const list = Array.from(urls);
  const faltantes = [];
  const prefix = `${targetBaseUrl}/`;

  for (const targetUrl of list) {
    if (!targetUrl.startsWith(prefix)) {
      faltantes.push({ url: targetUrl, error: 'Prefijo inesperado' });
      continue;
    }
    const encodedRel = targetUrl.slice(prefix.length);
    const segments = encodedRel.split('/').map((s) => decodeURIComponent(s));
    const localPath = path.join(outDir, ...segments);

    if (!fs.existsSync(localPath)) {
      faltantes.push({ url: targetUrl, localPath, error: 'No existe en directorio sincronizado' });
    }
  }

  return faltantes;
}

async function ejecutarDescargaBucket(objetos) {
  fs.mkdirSync(outDir, { recursive: true });
  let descargados = 0;
  let salteados = 0;
  let errores = 0;
  let procesados = 0;
  const concurrency = 10;

  async function descargarConReintento(obj) {
    const normalizedSegments = normalizeRelativeSegments(obj.path.split('/'));
    const destFile = path.join(outDir, ...normalizedSegments);

    if (fs.existsSync(destFile)) {
      const stat = fs.statSync(destFile);
      if (stat.size > 0 && (!obj.size || stat.size === obj.size)) {
        salteados++;
        procesados++;
        return;
      }
    }

    const candidatePaths = [obj.path];
    const lowerFirst = [
      obj.path.split('/')[0].toLowerCase(),
      ...obj.path.split('/').slice(1),
    ].join('/');
    if (lowerFirst !== obj.path) {
      candidatePaths.push(lowerFirst);
    }

    let ultimoError = null;
    for (let intento = 1; intento <= 3; intento++) {
      for (const candidatePath of candidatePaths) {
        try {
          const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .download(candidatePath);
          if (error) throw error;

          const buffer = Buffer.from(await data.arrayBuffer());
          fs.mkdirSync(path.dirname(destFile), { recursive: true });
          fs.writeFileSync(destFile, buffer);
          descargados++;
          procesados++;
          if (procesados % 25 === 0 || procesados === objetos.length) {
            process.stdout.write(
              `\r[${procesados}/${objetos.length}] Descargados: ${descargados} | Ya existentes: ${salteados}`
            );
          }
          return;
        } catch (err) {
          ultimoError = err;
        }
      }
      await new Promise((r) => setTimeout(r, intento * 500));
    }

    errores++;
    procesados++;
    console.error(`\nError descargando ${obj.path}: ${ultimoError?.message || ultimoError}`);
  }

  let cursor = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < objetos.length) {
      const idx = cursor++;
      await descargarConReintento(objetos[idx]);
    }
  });

  await Promise.all(workers);

  console.log(
    `\nDescarga finalizada en ${outDir} -> Nuevos: ${descargados}, Salteados: ${salteados}, Errores: ${errores}`
  );
  if (errores > 0) process.exit(1);
}

async function main() {
  console.log('=== Migración de Storage Supabase -> DonWeb ===');
  console.log(`Origen Supabase : ${SUPABASE_URL} (bucket: ${BUCKET_NAME})`);
  console.log(`Destino DonWeb  : ${targetBaseUrl}\n`);

  console.log('1) Analizando referencias en base de datos...');
  const plan = await planificarCambiosBaseDeDatos();
  console.log(`   - repair              : ${plan.repair.length} filas con URLs de Supabase`);
  console.log(`   - repair_intervention : ${plan.repair_intervention.length} filas con URLs de Supabase`);
  console.log(`   - part                : ${plan.part.length} filas con URLs de Supabase`);
  console.log(`   - user                : ${plan.user.length} filas con URLs de Supabase`);
  console.log(`   - URLs únicas destino : ${plan.allTargetUrls.size}\n`);

  if (isDownload || (!isVerifyUrls && !isUpdateDb)) {
    console.log(`2) Listando objetos en el bucket '${BUCKET_NAME}'...`);
    const objetos = await listarBucketRecursivo('');
    const totalBytes = objetos.reduce((acc, o) => acc + (o.size || 0), 0);
    const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);
    console.log(`   - Objetos encontrados : ${objetos.length} archivos (~${totalMb} MB)\n`);

    if (isDownload) {
      await ejecutarDescargaBucket(objetos);
      return;
    }
  }

  if (isVerifyUrls) {
    console.log(`2) Verificando las ${plan.allTargetUrls.size} URLs contra el árbol sincronizado (${outDir})...`);
    const faltantes = verificarArchivosSincronizadosLocalmente(plan.allTargetUrls);
    if (faltantes.length === 0) {
      console.log(`OK: Las ${plan.allTargetUrls.size} URLs referenciadas en BD existen y son válidas en el árbol sincronizado.`);
      return;
    }
    console.error(`Atención: ${faltantes.length} archivos faltantes o vacíos:`);
    faltantes.slice(0, 20).forEach((f) => console.error(`  - ${f.url} (${f.error})`));
    process.exit(1);
  }

  if (isUpdateDb) {
    if (!isConfirmed) {
      console.error('Error: Para modificar la base de datos debe incluir explícitamente --confirm');
      process.exit(1);
    }

    if (!skipVerify && plan.allTargetUrls.size > 0) {
      console.log('2) Verificando integridad local del árbol sincronizado antes de actualizar BD...');
      const faltantes = verificarArchivosSincronizadosLocalmente(plan.allTargetUrls);
      if (faltantes.length > 0) {
        console.error(
          `Abortado: ${faltantes.length} archivos no están en ${outDir}. Descargue y sincronice antes de actualizar la BD.`
        );
        faltantes.slice(0, 15).forEach((f) => console.error(`  - ${f.url} (${f.error})`));
        process.exit(1);
      }
    }

    const backupPath = path.resolve(
      `./backup_urls_supabase_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );
    fs.writeFileSync(
      backupPath,
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          targetBaseUrl,
          repair: plan.repair,
          repair_intervention: plan.repair_intervention,
          part: plan.part,
          user: plan.user,
        },
        null,
        2
      )
    );
    console.log(`Backup reversible de URLs guardado en: ${backupPath}`);

    for (const table of ['repair', 'repair_intervention', 'part', 'user']) {
      const items = plan[table];
      let okCount = 0;
      for (const item of items) {
        const { error } = await supabase.from(table).update(item.patch).eq('id', item.id);
        if (error) {
          throw new Error(`Error actualizando ${table} id=${item.id}: ${error.message}`);
        }
        okCount++;
      }
      console.log(`Actualizada tabla ${table}: ${okCount}/${items.length} filas`);
    }

    console.log('\nActualización de URLs en base de datos completada exitosamente.');
    return;
  }

  console.log('Modo simulación (--dry-run) finalizado. No se realizaron modificaciones.');
}

main().catch((err) => {
  console.error('Error fatal:', err.message);
  process.exit(1);
});
