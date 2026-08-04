import { describe, expect, it } from "vitest";
import path from "node:path";
import { resolveUploadPath, uploadOwnerId } from "@/lib/storage/local";

describe("resolveUploadPath", () => {
  it("aceita userId/arquivo válidos", () => {
    const full = resolveUploadPath("user_abc/123-uuid.jpg");
    expect(full).toContain(`${path.sep}user_abc${path.sep}123-uuid.jpg`);
  });

  it("rejeita path traversal", () => {
    expect(() => resolveUploadPath("user_a/../../etc/passwd")).toThrow();
    expect(() => resolveUploadPath("../x/y.jpg")).toThrow();
    expect(() => resolveUploadPath("user_a/../user_b/f.jpg")).toThrow();
  });

  it("rejeita segmentos inválidos", () => {
    expect(() => resolveUploadPath("user_a")).toThrow();
    expect(() => resolveUploadPath("user a/file.jpg")).toThrow();
  });

  it("uploadOwnerId lê o dono", () => {
    expect(uploadOwnerId("cuid123/foto.jpg")).toBe("cuid123");
  });
});
