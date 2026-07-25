import pg from 'pg';

const REF = 'gsxznhzbvcmkytfhkvug';
const PW = '7bBjTGaalBDCA30z';

const REGIONS = [
  'us-east-1','us-east-2','us-west-1','us-west-2',
  'sa-east-1','eu-west-1','eu-west-2','eu-central-1',
  'eu-central-2','eu-south-1','eu-south-2',
  'ap-southeast-1','ap-southeast-2','ap-southeast-3','ap-southeast-4',
  'ap-northeast-1','ap-northeast-2','ap-northeast-3',
  'ap-south-1','ap-south-2',
  'ca-central-1','me-south-1','af-south-1',
  'me-central-1','il-central-1'
];

const e = encodeURIComponent(PW);

async function tryConnect(label, connStr) {
  const pool = new pg.Pool({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 5000
  });
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT version()');
    client.release();
    await pool.end();
    return res.rows[0].version;
  } catch {
    await pool.end().catch(() => {});
    return null;
  }
}

async function main() {
  console.log('Testando todas as regiões disponíveis...\n');
  
  for (const r of REGIONS) {
    process.stdout.write(`  ${r}:6543 (postgres.{ref})... `);
    const v = await tryConnect(
      `pooler ${r}:6543`,
      `postgresql://postgres.${REF}:${e}@aws-0-${r}.pooler.supabase.com:6543/postgres`
    );
    if (v) {
      console.log(`✅ CONECTADO! ${v.split(',')[0]}`);
      return { region: r, port: 6543, version: v };
    }
    console.log('✗');
  }
  
  console.log('\nNenhuma região funcionou. Tentando porta 5432 (session mode)...\n');
  
  for (const r of REGIONS) {
    process.stdout.write(`  ${r}:5432... `);
    const v = await tryConnect(
      `pooler ${r}:5432`,
      `postgresql://postgres.${REF}:${e}@aws-0-${r}.pooler.supabase.com:5432/postgres`
    );
    if (v) {
      console.log(`✅ CONECTADO! ${v.split(',')[0]}`);
      return { region: r, port: 5432, version: v };
    }
    console.log('✗');
  }

  console.log('\n❌ Nenhuma conexão funcionou em nenhuma região.');
  console.log('   Possíveis causas:');
  console.log('   1. Senha do banco incorreta');
  console.log('   2. O banco ainda está sendo provisionado');
  console.log('   3. O projeto usa um pooler customizado');
  return null;
}

main().then(r => {
  if (r) console.log(`\n✅ Região encontrada: ${r.region}:${r.port}`);
  process.exit(r ? 0 : 1);
}).catch(e => {
  console.error('Erro:', e.message);
  process.exit(1);
});
