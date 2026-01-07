/**
 * Script para sincronizar fechas de finalización (completion_date)
 * entre Firebase y Supabase
 * 
 * Uso:
 *   node scripts/sync-completion-dates.js --dry-run  (modo prueba)
 *   node scripts/sync-completion-dates.js             (ejecución real)
 */

import { createClient } from '@supabase/supabase-js';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obtener __dirname en módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env') });

// Configuración de Supabase con service_role key para acceso completo
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.error('   REACT_APP_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   REACT_APP_SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuración de Firebase (producción)
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
  const app = initializeApp(firebaseConfig, 'sync-script');
  firestore = getFirestore(app);
  return firestore;
}

// Función para obtener reparaciones sin completion_date en Supabase
async function getReparacionesSinFecha() {
  console.log('📊 Consultando reparaciones sin fecha de finalización en Supabase...\n');
  
  // Buscar reparaciones donde completion_date es NULL o 0
  const { data, error } = await supabase
    .from('repair')
    .select('id, state, priority, drone_name, owner_id, reception_date, completion_date')
    .or('completion_date.is.null,completion_date.eq.0');
  
  if (error) {
    throw new Error(`Error al consultar Supabase: ${error.message}`);
  }
  
  return data;
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

// Función para formatear fecha de timestamp a fecha legible
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
  
  console.log('🔄 Script de Sincronización de Fechas de Finalización');
  console.log('====================================================\n');
  console.log(`Modo: ${isDryRun ? '🔍 DRY-RUN (Prueba)' : '✅ EJECUCIÓN REAL'}\n`);
  
  try {
    // Inicializar Firebase
    console.log('🔌 Conectando a Firebase...');
    await initFirebase();
    console.log('✅ Conectado a Firebase\n');
    
    console.log('🔌 Conectando a Supabase...');
    // Verificar conexión a Supabase
    const { error: connectionError } = await supabase.from('repair').select('count').limit(1);
    if (connectionError) throw connectionError;
    console.log('✅ Conectado a Supabase\n');
    
    // Obtener reparaciones sin fecha en Supabase
    const reparacionesSinFecha = await getReparacionesSinFecha();
    
    console.log(`📋 Reparaciones sin completion_date en Supabase: ${reparacionesSinFecha.length}\n`);
    
    // Mostrar estadísticas adicionales
    console.log('📊 Estadísticas de Supabase:');
    const { data: todasReparaciones, error: errorTodas } = await supabase
      .from('repair')
      .select('id, state, completion_date, delivery_date');
    
    if (!errorTodas && todasReparaciones) {
      const conFecha = todasReparaciones.filter(r => r.completion_date && r.completion_date !== 0);
      const sinFecha = todasReparaciones.filter(r => !r.completion_date || r.completion_date === 0);
      const finalizadas = todasReparaciones.filter(r => r.state === 'Finalizada');
      
      console.log(`   Total de reparaciones: ${todasReparaciones.length}`);
      console.log(`   Con completion_date válida: ${conFecha.length}`);
      console.log(`   Sin completion_date (null o 0): ${sinFecha.length}`);
      console.log(`   Estado "Finalizada": ${finalizadas.length}`);
      console.log('');
      
      // Si hay reparaciones finalizadas sin fecha, mostrarlas
      const finalizadasSinFecha = todasReparaciones.filter(r => 
        r.state === 'Finalizada' && (!r.completion_date || r.completion_date === 0)
      );
      
      if (finalizadasSinFecha.length > 0) {
        console.log(`⚠️  Encontradas ${finalizadasSinFecha.length} reparaciones finalizadas sin fecha:`);
        finalizadasSinFecha.slice(0, 10).forEach(r => {
          console.log(`   - ID: ${r.id}, completion_date: ${r.completion_date}, delivery_date: ${r.delivery_date}`);
        });
        console.log('');
      }
    }
    
    // Verificar también Firebase
    console.log('📊 Estadísticas de Firebase:');
    try {
      const reparacionesCol = collection(firestore, 'REPARACIONES');
      const snapshot = await getDocs(reparacionesCol);
      console.log(`   Total de reparaciones en Firebase: ${snapshot.size}`);
      
      let conFeFinRep = 0;
      let sinFeFinRep = 0;
      let finalizadas = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.FeFinRep && data.FeFinRep !== 0) conFeFinRep++;
        else sinFeFinRep++;
        if (data.EstadoRep === 'Finalizada') finalizadas++;
      });
      
      console.log(`   Con FeFinRep válida: ${conFeFinRep}`);
      console.log(`   Sin FeFinRep (undefined o 0): ${sinFeFinRep}`);
      console.log(`   Estado "Finalizada": ${finalizadas}`);
      console.log('');
    } catch (error) {
      console.error('   Error al consultar Firebase:', error.message);
    }
    
    if (reparacionesSinFecha.length === 0) {
      console.log('✨ ¡Todas las reparaciones tienen fecha de finalización!\n');
      return;
    }
    
    // Estadísticas
    const stats = {
      total: reparacionesSinFecha.length,
      conFechaEnFirebase: 0,
      sinFechaEnFirebase: 0,
      noEncontradaEnFirebase: 0,
      actualizadas: 0,
      errores: 0
    };
    
    const resultados = [];
    
    // Procesar cada reparación
    console.log('🔍 Comparando con Firebase...\n');
    console.log('─'.repeat(120));
    console.log('ID'.padEnd(25) + 'Estado'.padEnd(15) + 'Dron'.padEnd(30) + 'Fecha en Firebase'.padEnd(25) + 'Acción');
    console.log('─'.repeat(120));
    
    for (const repSupabase of reparacionesSinFecha) {
      const id = String(repSupabase.id);
      
      // Buscar en Firebase
      const repFirebase = await getReparacionFirebase(id);
      
      let accion = '';
      let fechaFirebase = null;
      
      if (!repFirebase) {
        stats.noEncontradaEnFirebase++;
        accion = '❌ No encontrada en Firebase';
      } else if (repFirebase.data.FeFinRep) {
        stats.conFechaEnFirebase++;
        fechaFirebase = repFirebase.data.FeFinRep;
        accion = isDryRun ? '🔄 Se actualizaría' : '⏳ Actualizando...';
        
        // Actualizar en Supabase si no es dry-run
        if (!isDryRun) {
          try {
            await actualizarFechaSupabase(id, fechaFirebase);
            stats.actualizadas++;
            accion = '✅ Actualizada';
          } catch (error) {
            stats.errores++;
            accion = `❌ Error: ${error.message}`;
          }
        }
      } else {
        stats.sinFechaEnFirebase++;
        accion = '⚠️  Tampoco tiene fecha en Firebase';
      }
      
      // Mostrar resultado
      const idStr = id.substring(0, 23).padEnd(25);
      const estadoStr = (repSupabase.state || 'N/A').padEnd(15);
      const dronStr = (repSupabase.drone_name || 'Sin dron').substring(0, 28).padEnd(30);
      const fechaStr = formatearFecha(fechaFirebase).padEnd(25);
      
      console.log(idStr + estadoStr + dronStr + fechaStr + accion);
      
      resultados.push({
        id,
        estado: repSupabase.state,
        dron: repSupabase.drone_name,
        fechaFirebase,
        accion
      });
    }
    
    console.log('─'.repeat(120));
    console.log('\n📊 RESUMEN DE RESULTADOS:');
    console.log('=========================\n');
    console.log(`Total de reparaciones sin fecha en Supabase: ${stats.total}`);
    console.log(`  ✅ Con fecha en Firebase: ${stats.conFechaEnFirebase}`);
    console.log(`  ⚠️  Sin fecha en Firebase: ${stats.sinFechaEnFirebase}`);
    console.log(`  ❌ No encontradas en Firebase: ${stats.noEncontradaEnFirebase}`);
    
    if (!isDryRun) {
      console.log(`\n🔄 Actualizaciones realizadas: ${stats.actualizadas}`);
      console.log(`❌ Errores: ${stats.errores}`);
    } else {
      console.log(`\n🔍 Reparaciones que se actualizarían: ${stats.conFechaEnFirebase}`);
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (isDryRun && stats.conFechaEnFirebase > 0) {
      console.log('\n💡 Para aplicar los cambios, ejecuta:');
      console.log('   node scripts/sync-completion-dates.js\n');
    } else if (!isDryRun && stats.actualizadas > 0) {
      console.log('\n✨ ¡Sincronización completada exitosamente!\n');
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
