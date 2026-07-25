import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * Prisma Client para uso server-side.
 * Usa adapter pg para conexão direta ao PostgreSQL.
 * Sem singleton global para evitar cache obsoleto em hot-reload.
 */
let _prisma: PrismaClient | null = null;

function createPrisma(): PrismaClient {
  const isProd = process.env.NODE_ENV === "production";

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: isProd ? 5 : 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: isProd },
  });

  const adapter = new PrismaPg(pool);

  try {
    return new PrismaClient({ adapter });
  } catch (err) {
    console.error("[prisma.server] Erro ao criar PrismaClient:", err);
    throw err;
  }
}

/**
 * Retorna a instância do Prisma Client, criando sob demanda.
 * Em ambiente serverless/Nitro, cada request ou worker terá sua própria instância.
 */
export function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = createPrisma();
  }
  return _prisma;
}

// Proxy lazy — só cria o client na PRIMEIRA operação (não na importação)
// Isso evita que o SSR quebre se o banco estiver indisponível no momento do load
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: keyof PrismaClient, receiver) {
    return Reflect.get(getPrisma(), prop, receiver);
  },
});
