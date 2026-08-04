const OWNER_RE = /^[a-zA-Z0-9_-]+$/;
const FILE_RE = /^[a-zA-Z0-9._-]+$/;

/** Valida path relativo `userId/arquivo.ext` (anti path-traversal). */
export function assertRelativeUploadPath(relativePath: string): {
  ownerId: string;
  filename: string;
  relative: string;
} {
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
  return {
    ownerId: parts[0],
    filename: parts[1],
    relative: `${parts[0]}/${parts[1]}`,
  };
}

export function uploadOwnerId(relativePath: string): string {
  const parts = relativePath.replace(/\\/g, "/").split("/").filter(Boolean);
  if (parts.length < 1 || !OWNER_RE.test(parts[0])) {
    throw new Error("Caminho de upload inválido");
  }
  return parts[0];
}

export function isValidOwnerId(userId: string): boolean {
  return OWNER_RE.test(userId);
}

export function contentTypeForExtension(extension: string): string {
  const ext = extension.toLowerCase().replace(/^\./, "");
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}
