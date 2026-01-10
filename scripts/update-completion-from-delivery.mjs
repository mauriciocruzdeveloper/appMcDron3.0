/**
 * Script para actualizar completion_date en Supabase con lógica de prioridad:
 * 
 * Para cada reparación SIN completion_date en Supabase:
 *   1. Buscar FeFinRep en Firebase → si existe, usar esa fecha
 *   2. Si no existe en Firebase o no tiene FeFinRep → usar delivery_date de Supabase
 *   3. Si no tiene delivery_date → buscar FeEntRep en Firebase
 * 
 * Uso:
 *   node scripts/update-completion-from-delivery.mjs --dry-run  (modo prueba)
 *   node scripts/update-completion-from-delivery.mjs             (ejecución real)
 */

import { createClient } from '@supabase/supabase-js';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc,
  getDoc
} from 'firebase/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Configuración de Supabase con service_role key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCqupkvp1jXt8y8WjVjSuqi9OFMkJu_LpI",
  authDomain: "mc-dron.firebaseapp.com",
  databaseURL: "https://mc-dron-default-rtdb.firebaseio.com",
  projectId: "mc-dron",
  storageBucket: "mc-dron.appspot.com",
  messagingSenderId: "410639876260",
  appId: "1:410639876260:web:045fb9451d7ec1d6ee2631"
};

// Inicializar Firebase
let firestore;
async function initFirebase() {
  const app = initializeApp(firebaseConfig, 'update-script');
  firestore = getFirestore(app);
  return firestore;
}

// Función para obtener una reparación de Firebase por ID
async function getReparacionFirebase(id) {
  try {
    const docRef = doc(firestore, 'REPARACIONES', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, data: docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error(`Error al consultar Firebase para ID ${id}:`, error.message);
    return null;
  }
}

// Función para actualizar completion_date en Supabase
async function actualizarFechaSupabase(id, fecha) {
  const { error } = await supabase
    .from('repair')
    .update({ completion_date: fecha })
    .eq('id', id);
  
  if (error) {
    throw new Error(`Error al actualizar Supabase: ${error.message}`);
  }
  
  return true;
}

// Función para formatear fecha
function formatearFecha(timestamp) {
  if (!timestamp) return 'N/A';
  const fecha = new Date(timestamp);
  return fecha.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Función principal
async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  
  console.log('🔄 Script de Actualización Inteligente de completion_date');
  console.log('==========================================================\n');
  console.log('Lógica:');
  console.log('  1. Si tiene FeFinRep en Firebase → usar esa fecha');
  console.log('  2. Si no, usar delivery_date de Supabase');
  console.log('  3. Si no, usar FeEntRep de Firebase\n');
  console.log(`Modo: ${isDryRun ? '🔍 DRY-RUN (Prueba)' : '✅ EJECUCIÓN REAL'}\n`);
  
  try {
    // Inicializar Firebase
    console.log('🔌 Conectando a Firebase...');
    await initFirebase();
    console.log('✅ Conectado a Firebase\n');
    
    console.log('🔌 Conectando a Supabase...');
    const { error: connectionError } = await supabase.from('repair').select('count').limit(1);
    if (connectionError) throw connectionError;
    console.log('✅ Conectado a Supabase\n');
    
    // Obtener reparaciones sin completion_date
    console.log('📊 Consultando reparaciones sin completion_date en Supabase...\n');
    
    const { data: reparaciones, error } = await supabase
      .from('repair')
      .select('id, state, drone_name, delivery_date, completion_date, owner:owner_id(first_name, last_name)')
      .or('completion_date.is.null,completion_date.eq.0');
    
    if (error) {
      throw new Error(`Error al consultar Supabase: ${error.message}`);
    }
    
    console.log(`📋 Encontradas ${reparaciones.length} reparaciones sin completion_date\n`);
    
    if (reparaciones.length === 0) {
      console.log('✨ No hay reparaciones para actualizar\n');
      return;
    }
    
    // Estadísticas
    const stats = {
      total: reparaciones.length,
      conFeFinRepFirebase: 0,
      conDeliveryDateSupabase: 0,
      conFeEntRepFirebase: 0,
      sinFecha: 0,
      actualizadas: 0,
      errores: 0
    };
    
    const resultados = [];
    
    // Procesar cada reparación
    console.log('🔍 Procesando reparaciones con lógica de prioridad...\n');
    console.log('─'.repeat(160));
    console.log('ID'.padEnd(20) + 'Estado'.padEnd(18) + 'Dron'.padEnd(32) + 'Cliente'.padEnd(30) + 'Fecha encontrada'.padEnd(20) + 'Origen'.padEnd(25) + 'Acción');
    console.log('─'.repeat(160));
    
    for (const rep of reparaciones) {
      const id = String(rep.id);
      const cliente = rep.owner ? `${rep.owner.first_name || ''} ${rep.owner.last_name || ''}`.trim() || 'Sin nombre' : 'Sin dueño';
      
      let fechaAUsar = null;
      let origen = '';
      let accion = '';
      
      // 1. Buscar en Firebase primero
      const repFirebase = await getReparacionFirebase(id);
      
      if (repFirebase && repFirebase.data.FeFinRep && repFirebase.data.FeFinRep !== 0) {
        // Prioridad 1: Tiene FeFinRep en Firebase
        fechaAUsar = repFirebase.data.FeFinRep;
        origen = 'Firebase (FeFinRep)';
        stats.conFeFinRepFirebase++;
      } else if (rep.delivery_date && rep.delivery_date !== 0) {
        // Prioridad 2: Tiene delivery_date en Supabase
        fechaAUsar = rep.delivery_date;
        origen = 'Supabase (delivery_date)';
        stats.conDeliveryDateSupabase++;
      } else if (repFirebase && repFirebase.data.FeEntRep && repFirebase.data.FeEntRep !== 0) {
        // Prioridad 3: Tiene FeEntRep en Firebase
        fechaAUsar = repFirebase.data.FeEntRep;
        origen = 'Firebase (FeEntRep)';
        stats.conFeEntRepFirebase++;
      } else {
        // No tiene ninguna fecha disponible
        stats.sinFecha++;
        origen = 'Sin fecha disponible';
      }
      
      // Actualizar si se encontró una fecha
      if (fechaAUsar) {
        if (isDryRun) {
          accion = '🔄 Se actualizaría';
        } else {
          try {
            await actualizarFechaSupabase(id, fechaAUsar);
            stats.actualizadas++;
            accion = '✅ Actualizada';
          } catch (error) {
            stats.errores++;
            accion = `❌ Error: ${error.message}`;
          }
        }
      } else {
        accion = '⚠️  Sin fecha para actualizar';
      }
      
      // Mostrar resultado
      const idStr = id.substring(0, 18).padEnd(20);
      const estadoStr = (rep.state || 'N/A').substring(0, 16).padEnd(18);
      const dronStr = (rep.drone_name || 'Sin dron').substring(0, 30).padEnd(32);
      const clienteStr = cliente.substring(0, 28).padEnd(30);
      const fechaStr = formatearFecha(fechaAUsar).padEnd(20);
      const origenStr = origen.padEnd(25);
      
      console.log(idStr + estadoStr + dronStr + clienteStr + fechaStr + origenStr + accion);
      
      resultados.push({
        id,
        estado: rep.state,
        dron: rep.drone_name,
        cliente,
        fechaAUsar,
        origen,
        accion
      });
    }
    
    console.log('─'.repeat(160));
    console.log('\n📊 RESUMEN DE RESULTADOS:');
    console.log('=========================\n');
    console.log(`Total de reparaciones sin completion_date: ${stats.total}`);
    console.log(`  ✅ Con FeFinRep en Firebase: ${stats.conFeFinRepFirebase}`);
    console.log(`  ✅ Con delivery_date en Supabase: ${stats.conDeliveryDateSupabase}`);
    console.log(`  ✅ Con FeEntRep en Firebase: ${stats.conFeEntRepFirebase}`);
    console.log(`  ⚠️  Sin fecha disponible: ${stats.sinFecha}`);
    
    if (!isDryRun) {
      console.log(`\n🔄 Actualizaciones realizadas: ${stats.actualizadas}`);
      console.log(`❌ Errores: ${stats.errores}`);
    } else {
      const totalActualizables = stats.conFeFinRepFirebase + stats.conDeliveryDateSupabase + stats.conFeEntRepFirebase;
      console.log(`\n🔍 Reparaciones que se actualizarían: ${totalActualizables}`);
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (isDryRun && (stats.conFeFinRepFirebase + stats.conDeliveryDateSupabase + stats.conFeEntRepFirebase) > 0) {
      console.log('\n💡 Para aplicar los cambios, ejecuta:');
      console.log('   node scripts/update-completion-from-delivery.mjs\n');
    } else if (!isDryRun && stats.actualizadas > 0) {
      console.log('\n✨ ¡Actualización completada exitosamente!\n');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar script
main()
  .then(() => {
    console.log('✅ Script finalizado\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
