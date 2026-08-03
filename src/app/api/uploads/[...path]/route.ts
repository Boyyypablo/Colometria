import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { readUpload } from "@/lib/storage/local";

type Params = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticada." }, { status: 401 });
  }

  const { path: segments } = await params;
  const relative = segments.join("/");

  // Autorização: dona do arquivo (primeiro segmento = userId) ou staff
  const ownerId = segments[0];
  const isOwner = ownerId === session.user.id;
  const isStaff =
    session.user.role === "CONSULTANT" || session.user.role === "ADMIN";
  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const buffer = await readUpload(relative);
    const ext = relative.split(".").pop()?.toLowerCase();
    const contentType =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : "image/jpeg";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }
}

/** Garante que o path ainda exista em alguma análise/simulação do usuário (auditoria leve). */
export async function HEAD(request: Request, ctx: Params) {
  return GET(request, ctx);
}
