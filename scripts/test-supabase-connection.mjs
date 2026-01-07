import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_SERVICE_KEY
);

console.log('🔍 Verificando conexión a Supabase...\n');
console.log('URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Usando: SERVICE_ROLE KEY (acceso completo)\n');

try {
  // Verificar autenticación
  console.log('🔐 Estado de autenticación:');
  const { data: { user } } = await supabase.auth.getUser();
  console.log('   Usuario autenticado:', user ? user.email : 'Anónimo (sin autenticar)\n');
  
  // Intentar obtener el count
  console.log('1️⃣ Obteniendo count de reparaciones...');
  const { count, error: countError } = await supabase
    .from('repair')
    .select('*', { count: 'exact', head: true });
  
  console.log('   Count:', count);
  console.log('   Error:', countError?.message || 'ninguno');
  if (countError) {
    console.log('   Código error:', countError.code);
    console.log('   Detalles:', countError.details);
    console.log('   Hint:', countError.hint);
  }
  console.log('');
  
  // Intentar obtener algunas reparaciones
  console.log('2️⃣ Obteniendo primeras 5 reparaciones...');
  const { data: repairs, error: repairsError } = await supabase
    .from('repair')
    .select('id, state, completion_date, drone_name')
    .limit(5);
  
  if (repairsError) {
    console.log('   ❌ Error:', repairsError.message);
    console.log('   Detalles:', repairsError);
  } else {
    console.log('   ✅ Reparaciones encontradas:', repairs?.length || 0);
    if (repairs && repairs.length > 0) {
      console.log('\n   Primeras reparaciones:');
      repairs.forEach(r => {
        console.log(`   - ID: ${r.id}, Estado: ${r.state}, Dron: ${r.drone_name}, completion_date: ${r.completion_date}`);
      });
    }
  }
  
  // Verificar también otras tablas
  console.log('\n3️⃣ Verificando otras tablas...');
  const tables = ['drone', 'user', 'intervention', 'part'];
  for (const table of tables) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`   - ${table}: ${count} registros`);
  }
  
} catch (error) {
  console.error('❌ Error general:', error);
}
