/**
 * Script para listar reparaciones sin fecha de finalización
 * Muestra: ID, Fecha contacto, Cliente, Estado, Dron
 * 
 * Uso:
 *   node scripts/list-repairs-without-completion-date.mjs
 *   node scripts/list-repairs-without-completion-date.mjs --csv  (exportar a CSV)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

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

// Función para formatear fecha
function formatearFecha(timestamp) {
  if (!timestamp) return 'Sin fecha';
  const fecha = new Date(timestamp);
  return fecha.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit'
  });
}

// Función principal
async function main() {
  const exportarCSV = process.argv.includes('--csv');
  
  console.log('📋 Listado de Reparaciones sin Fecha de Finalización');
  console.log('====================================================\n');
  
  try {
    console.log('🔌 Conectando a Supabase...');
    
    // Obtener reparaciones sin fecha de finalización
    const { data: reparaciones, error } = await supabase
      .from('repair')
      .select(`
        id,
        state,
        priority,
        contact_date,
        reception_date,
        drone_name,
        owner_id,
        completion_date,
        owner:owner_id (
          id,
          email,
          first_name,
          last_name,
          telephone
        )
      `)
      .or('completion_date.is.null,completion_date.eq.0')
      .order('contact_date', { ascending: false });
    
    if (error) {
      throw new Error(`Error al consultar: ${error.message}`);
    }
    
    console.log(`✅ Encontradas ${reparaciones.length} reparaciones sin fecha de finalización\n`);
    
    if (reparaciones.length === 0) {
      console.log('✨ ¡Todas las reparaciones tienen fecha de finalización!');
      return;
    }
    
    // Preparar datos para mostrar
    const datosTabla = reparaciones.map(r => ({
      id: String(r.id),
      fechaContacto: formatearFecha(r.contact_date),
      fechaRecepcion: formatearFecha(r.reception_date),
      cliente: r.owner ? `${r.owner.first_name || ''} ${r.owner.last_name || ''}`.trim() || 'Sin nombre' : 'Sin dueño',
      email: r.owner?.email || 'Sin email',
      telefono: r.owner?.telephone || 'Sin teléfono',
      estado: r.state || 'Sin estado',
      dron: r.drone_name || 'Sin dron',
      prioridad: r.priority || 0
    }));
    
    // Agrupar por estado
    const porEstado = {};
    datosTabla.forEach(r => {
      if (!porEstado[r.estado]) {
        porEstado[r.estado] = [];
      }
      porEstado[r.estado].push(r);
    });
    
    // Mostrar estadísticas
    console.log('📊 Resumen por Estado:');
    console.log('─'.repeat(50));
    Object.entries(porEstado).forEach(([estado, reps]) => {
      console.log(`   ${estado}: ${reps.length} reparaciones`);
    });
    console.log('─'.repeat(50));
    console.log('');
    
    // Mostrar tabla
    console.log('📋 Detalle de Reparaciones:');
    console.log('═'.repeat(160));
    console.log(
      'ID'.padEnd(20) + 
      'Fecha Contacto'.padEnd(16) + 
      'Cliente'.padEnd(30) + 
      'Estado'.padEnd(18) + 
      'Dron'.padEnd(35) + 
      'Email'.padEnd(30) +
      'Prioridad'
    );
    console.log('═'.repeat(160));
    
    datosTabla.forEach(r => {
      console.log(
        r.id.substring(0, 18).padEnd(20) +
        r.fechaContacto.padEnd(16) +
        r.cliente.substring(0, 28).padEnd(30) +
        r.estado.substring(0, 16).padEnd(18) +
        r.dron.substring(0, 33).padEnd(35) +
        r.email.substring(0, 28).padEnd(30) +
        r.prioridad
      );
    });
    
    console.log('═'.repeat(160));
    console.log('');
    
    // Exportar a CSV si se solicita
    if (exportarCSV) {
      const csvHeader = 'ID,Fecha Contacto,Fecha Recepción,Cliente,Email,Teléfono,Estado,Dron,Prioridad\n';
      const csvRows = datosTabla.map(r => 
        `"${r.id}","${r.fechaContacto}","${r.fechaRecepcion}","${r.cliente}","${r.email}","${r.telefono}","${r.estado}","${r.dron}",${r.prioridad}`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      const filename = `reparaciones_sin_fecha_${new Date().toISOString().split('T')[0]}.csv`;
      const filepath = join(__dirname, '..', filename);
      
      writeFileSync(filepath, csvContent, 'utf8');
      console.log(`📁 Archivo CSV exportado: ${filename}`);
      console.log(`   Ruta: ${filepath}\n`);
    } else {
      console.log('💡 Para exportar a CSV, ejecuta:');
      console.log('   node scripts/list-repairs-without-completion-date.mjs --csv\n');
    }
    
    // Mostrar reparaciones críticas (estado Finalizado pero sin fecha)
    const finalizadasSinFecha = datosTabla.filter(r => 
      r.estado === 'Finalizado' || r.estado === 'Finalizada'
    );
    
    if (finalizadasSinFecha.length > 0) {
      console.log('⚠️  ATENCIÓN: Reparaciones marcadas como "Finalizado" pero sin fecha:');
      console.log('─'.repeat(80));
      finalizadasSinFecha.slice(0, 10).forEach(r => {
        console.log(`   ID: ${r.id} | Cliente: ${r.cliente} | Dron: ${r.dron}`);
      });
      if (finalizadasSinFecha.length > 10) {
        console.log(`   ... y ${finalizadasSinFecha.length - 10} más`);
      }
      console.log('─'.repeat(80));
      console.log('');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar
main()
  .then(() => {
    console.log('✅ Script finalizado\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
