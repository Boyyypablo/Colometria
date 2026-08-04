/**
 * Build na Vercel: Prisma generate + migrate + next build.
 * Aceita DATABASE_URL ou aliases injetados pelo Neon no Marketplace.
 */
import { spawnSync } from "node:child_process";

const db =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!db) {
  console.error(`
╔══════════════════════════════════════════════════════════════════╗
║  Falta DATABASE_URL no projeto Vercel                            ║
╠══════════════════════════════════════════════════════════════════╣
║  1. Abra o projeto → Storage → Create Database → Neon            ║
║  2. Conecte ao projeto (injeta DATABASE_URL / POSTGRES_URL)      ║
║  3. Settings → Env: AUTH_SECRET + AUTH_URL                       ║
║  4. Redeploy                                                     ║
║                                                                  ║
║  Docs: https://vercel.com/docs/storage/vercel-postgres           ║
╚══════════════════════════════════════════════════════════════════╝
`);
  process.exit(1);
}

process.env.DATABASE_URL = db;

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit", env: process.env, shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run("npx", ["prisma", "generate"]);
run("npx", ["prisma", "migrate", "deploy"]);
run("npx", ["next", "build"]);
