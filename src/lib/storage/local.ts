import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

function uploadRoot(): string {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");
}

const OWNER_RE = /^[a-zA-Z0-9_-]+$/;
const FILE_RE = /^[a-zA-Z0-9._-]+$/;

export async function ensureUploadDir(...segments: string[]): Promise<string> {
  const dir = path.join(uploadRoot(), ...segments);
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function saveUserImage(
  userId: string,
  buffer: Buffer,
  extension = "jpg",
): Promise<string> {
  if (!OWNER_RE.test(userId)) {
    throw new Error("userId inválido para upload");
  }
  const dir = await ensureUploadDir(userId);
  const filename = `${Date.now()}-${randomUUID()}.${extension}`;
  const full = path.join(dir, filename);
  await writeFile(full, buffer);
  return path.join(userId, filename).replace(/\\/g, "/");
}

/**
 * Resolve path relativo `userId/arquivo.ext` de forma segura (anti path-traversal).
 */
export function resolveUploadPath(relativePath: string): string {
  const parts = relativePath.replace(/\\/g, "/").split("/").filter(Boolean);
  if (parts.length !== 2) {
    throw new Error("Caminho de upload inválido");
  }
  if (parts.some((p) => p === ".." || p === "." || p.includes("\0"))) {
    throw new Error("Caminho de upload inválido");
  }
  if (!OWNER_RE.test(parts[0]) || !FILE_RE.test(parts[1])) {
    throw new Error("Caminho de upload inválido");
  }

  const root = uploadRoot();
  const full = path.resolve(root, parts[0], parts[1]);
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  if (full !== root && !full.startsWith(rootWithSep)) {
    throw new Error("Caminho de upload inválido");
  }
  return full;
}

/** Primeiro segmento (owner) de um path relativo já validável. */
export function uploadOwnerId(relativePath: string): string {
  const parts = relativePath.replace(/\\/g, "/").split("/").filter(Boolean);
  if (parts.length < 1 || !OWNER_RE.test(parts[0])) {
    throw new Error("Caminho de upload inválido");
  }
  return parts[0];
}

export async function readUpload(relativePath: string): Promise<Buffer> {
  return readFile(resolveUploadPath(relativePath));
}

export async function deleteUpload(relativePath: string): Promise<void> {
  try {
    await unlink(resolveUploadPath(relativePath));
  } catch {
    // ignore missing
  }
}
