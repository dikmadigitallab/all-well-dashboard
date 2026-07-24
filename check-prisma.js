const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
const keys = Object.keys(p).filter(k => k.includes('exame') || k.includes('Exame'));
console.log(JSON.stringify(keys));
p.$disconnect();