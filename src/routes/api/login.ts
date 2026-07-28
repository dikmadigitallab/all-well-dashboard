// POST /api/login — autenticação via Data API (service role), compatível com runtime edge/Workers
import { createFileRoute } from "@tanstack/react-router";
import { verifyPassword, createToken } from "@/lib/auth.server";

type LoginUserRow = {
  id: string;
  username: string;
  password_hash: string;
  full_name: string | null;
  role: string;
  ativo: boolean;
};

async function findUserByUsername(username: string): Promise<LoginUserRow | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await (supabaseAdmin as any)
    .from("users")
    .select("id, username, password_hash, full_name, role, ativo")
    .eq("username", username)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as LoginUserRow | null) ?? null;
}

export const Route = createFileRoute("/api/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const { username, password } = (body || {}) as {
            username?: string;
            password?: string;
          };

          if (!username || !password) {
            return Response.json(
              { ok: false, error: "username e password obrigatórios" },
              { status: 400 },
            );
          }

          const user = await findUserByUsername(String(username));

          if (!user || !user.ativo) {
            return Response.json(
              { ok: false, error: "Usuário ou senha inválidos" },
              { status: 401 },
            );
          }

          const valid = await verifyPassword(String(password), user.password_hash);
          if (!valid) {
            return Response.json(
              { ok: false, error: "Usuário ou senha inválidos" },
              { status: 401 },
            );
          }

          const token = await createToken({
            id: user.id,
            username: user.username,
            fullName: user.full_name,
            role: user.role,
          });

          return Response.json({
            ok: true,
            token,
            user: {
              id: user.id,
              username: user.username,
              fullName: user.full_name,
              role: user.role,
            },
          });
        } catch (err) {
          console.error("[login]", err);
          const msg = err instanceof Error ? err.message : String(err);
          return Response.json({ ok: false, error: `Erro interno: ${msg}` }, { status: 500 });
        }
      },
    },
  },
});
