import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client para uso server-side.
 * Sem singleton global para evitar cache obsoleto em hot-reload.
 */
let _prisma: PrismaClient | null = null;

function createPrisma(): PrismaClient {
  try {
    return new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL,
    });
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
