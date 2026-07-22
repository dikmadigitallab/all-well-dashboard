/**
 * Criptografia AES-256-GCM para senhas de email.
 * Usa uma chave derivada do AUTH_JWT_SECRET via HKDF (SHA-256).
 * Server-side apenas.
 */
import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT = "email-crypto-v1";

function deriveKey(): Buffer {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) throw new Error("AUTH_JWT_SECRET não definido (necessário para criptografia)");
  // Deriva uma chave de 256 bits via SHA-256
  return createHash("sha256")
    .update(SALT)
    .update(secret)
    .digest();
}

/**
 * Criptografa um texto plano (senha) e retorna uma string base64
 * no formato: iv:authTag:ciphertext (tudo em base64)
 */
export function encryptPassword(plaintext: string): string {
  const key = deriveKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag().toString("base64");

  return `${iv.toString("base64")}:${authTag}:${encrypted}`;
}

/**
 * Descriptografa uma string no formato iv:authTag:ciphertext
 * e retorna o texto plano original.
 */
export function decryptPassword(encryptedData: string): string {
  const key = deriveKey();
  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Formato de dados criptografados inválido");
  }

  const iv = Buffer.from(parts[0], "base64");
  const authTag = Buffer.from(parts[1], "base64");
  const encrypted = parts[2];

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
