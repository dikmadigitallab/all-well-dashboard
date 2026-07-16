// POST /api/login — autenticação custom
import { createFileRoute } from "@tanstack/react-router";
import { SignJWT } from "jose";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnv(key: string): string {
  if (process.env[key]) return process.env[key]!;
  for (const path of [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "../.env"),
  ]) {
    if (existsSync(path)) {
      const raw = readFileSync(path, "utf-8");
      const match = raw.match(new RegExp(`^${key}=(.+)`, "m"));
      if (match) return match[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  throw new Error(`${key} não encontrado`);
}

export const Route = createFileRoute("/api/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { username, password } = body || {};

          if (!username || !password) {
            return Response.json(
              { error: "username e password obrigatórios" },
              { status: 400 }
            );
          }

          const validUser = loadEnv("AUTH_USERNAME");
          const validPass = loadEnv("AUTH_PASSWORD");

          if (username !== validUser || password !== validPass) {
            return Response.json(
              { error: "Usuário ou senha inválidos" },
              { status: 401 }
            );
          }

          const secret = new TextEncoder().encode(loadEnv("AUTH_JWT_SECRET"));

          const user = {
            id: "user-001",
            username: loadEnv("AUTH_USERNAME"),
            fullName: loadEnv("AUTH_USER_FULL_NAME"),
            role: loadEnv("AUTH_USER_ROLE"),
          };

          const token = await new SignJWT({ sub: user.id, ...user })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("24h")
            .sign(secret);

          return Response.json({ ok: true, token, user });
        } catch (err) {
          console.error("[login]", err);
          return Response.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
          );
        }
      },
    },
  },
});
