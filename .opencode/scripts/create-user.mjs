// Cria usuário maria_eduarda via Supabase Auth admin API
// E adiciona role admin na tabela user_roles (se existir)
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('C:/projetos/all-well-dashboard/.env', 'utf-8');
const vars = Object.fromEntries(
  env.split('\n').filter(Boolean).map(l => {
    const i = l.indexOf('=');
    return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
  })
);

const URL = vars.SUPABASE_URL || vars.VITE_SUPABASE_URL;
const SERVICE_KEY = vars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  console.log('🔑 Criando usuário maria_eduarda...\n');

  // 1. Verifica se já existe
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users.find(u => u.email === 'maria_eduarda@allwell.local');
  if (found) {
    console.log('✅ Usuário já existe! ID:', found.id);
    return;
  }

  // 2. Cria o usuário
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'maria_eduarda@allwell.local',
    password: '123456',
    email_confirm: true,
    user_metadata: { full_name: 'Maria Eduarda', role: 'admin' }
  });

  if (error) {
    console.error('❌ Erro ao criar:', error.message);
    return;
  }

  console.log(`✅ Usuário criado! ID: ${data.user.id}`);
  console.log(`   Email: maria_eduarda@allwell.local`);
  console.log(`   Senha: 123456`);

  // 3. Tenta inserir role admin
  console.log('\n📝 Tentando inserir role admin (se tabela user_roles existir)...');
  const { error: roleErr } = await supabase
    .from('user_roles')
    .insert({ user_id: data.user.id, role: 'admin' })
    .single();

  if (roleErr) {
    console.log(`   ⚠️  Tabela user_roles não existe ainda: ${roleErr.message.slice(0, 100)}`);
    console.log('   (As migrations serão aplicadas quando o banco estiver acessível)');
  } else {
    console.log('   ✅ Role admin inserida!');
  }
}

main().catch(e => console.error('Erro:', e.message));
