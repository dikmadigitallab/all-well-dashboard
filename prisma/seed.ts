import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.SEED_USERNAME || "admin";
  const password = process.env.SEED_PASSWORD || "admin123";
  const fullName = process.env.SEED_FULL_NAME || "Administrador";
  const role = "admin";

  const exists = await prisma.user.findUnique({ where: { username } });

  if (exists) {
    console.log(`[seed] Usuário "${username}" já existe. Pulando.`);
    return;
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      password_hash,
      full_name: fullName,
      role,
      ativo: true,
    },
  });

  console.log(`[seed] Usuário criado: ${user.username} (${user.role})`);
  console.log(`[seed]   Login: ${username}`);
  console.log(`[seed]   Senha: ${password}`);
}

main()
  .catch((e) => {
    console.error("[seed] Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
