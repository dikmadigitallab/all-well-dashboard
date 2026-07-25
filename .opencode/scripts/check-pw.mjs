import { readFileSync } from 'fs';
const env = readFileSync('C:/projetos/all-well-dashboard/.env', 'utf-8');
const match = env.match(/SENHABD=(.+)/);
if (match) {
  const pw = match[1].trim().replace(/["']/g, '');
  console.log('Password length:', pw.length);
  console.log('Chars:', [...pw].map(c => c + '(' + c.charCodeAt(0) + ')').join(' '));
}
