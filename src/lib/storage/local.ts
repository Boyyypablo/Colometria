import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

function uploadRoot(): string {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");
}

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
  const dir = await ensureUploadDir(userId);
  const filename = `${Date.now()}-${randomUUID()}.${extension}`;
  const full = path.join(dir, filename);
  await writeFile(full, buffer);
  // caminho relativo armazenado no banco
  return path.join(userId, filename).replace(/\\/g, "/");
}

export function resolveUploadPath(relativePath: string): string {
  const safe = path
    .normalize(relativePath)
    .replace(/^(\.\.(\/|\\|$))+/, "")
    .replace(/^[/\\]+/, "");
  const full = path.join(uploadRoot(), safe);
  if (!full.startsWith(uploadRoot())) {
    throw new Error("Caminho de upload inválido");
  }
  return full;
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
