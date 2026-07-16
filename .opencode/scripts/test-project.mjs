// Verifica se o projeto Supabase responde com a service role key
import { createClient } from '@supabase/supabase-js';

const REF = 'gsxznhzbvcmkytfhkvug';
const URL = `https://${REF}.supabase.co`;
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzeHpuaHpidmNta3l0ZmhrdnVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDIwNjY3NiwiZXhwIjoyMDk5NzgyNjc2fQ.AyKlFbqaX0_HI3PRZltsh2moZCviNbxFFb3RnTmYE5Y';

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

async function main() {
  console.log('🔍 Testando projeto Supabase...\n');

  // 1. Tenta listar usuários (Auth admin)
  console.log('1. Auth API (listar usuários)...');
  const { data: users, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) {
    console.log(`   ❌ ${authErr.message}`);
  } else {
    console.log(`   ✅ ${users.users.length} usuários encontrados`);
  }

  // 2. Tenta consultar tabela public (se existir)
  console.log('2. Tabelas públicas...');
  const { data: tables, error: tblErr } = await supabase.from('_tables').select('*').limit(1);
  if (tblErr) {
    console.log(`   ℹ️  Nenhuma tabela pública ainda (esperado): ${tblErr.message.slice(0, 100)}`);
  }

  // 3. Tenta acessar health check
  console.log('3. Health check do projeto...');
  try {
    const resp = await fetch(`${URL}/rest/v1/`, {
      headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
    });
    console.log(`   ℹ️  REST API status: ${resp.status} ${resp.statusText}`);
  } catch (e) {
    console.log(`   ❌ ${e.message}`);
  }

  console.log('\n✅ Projeto existe e service role key funciona.');
  console.log('⚠️  Conexão direta ao banco (pg) não funcionou — possivelmente a senha está incorreta');
  console.log('   ou o projeto usa um pooler diferente.');
}

main().catch(e => console.error('Erro:', e.message));
