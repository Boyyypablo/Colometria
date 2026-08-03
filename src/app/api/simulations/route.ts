import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  countTodaySimulations,
  processSimulationJob,
} from "@/lib/vto/simulate";

const schema = z.object({
  analysisId: z.string().min(1),
  targetColorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/),
  type: z.enum(["COLOR_DRAPE", "BLOUSE_TONE"]).default("COLOR_DRAPE"),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticada." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const limit = Number(process.env.VTO_DAILY_LIMIT || 5);
  const used = await countTodaySimulations(session.user.id);
  if (used >= limit) {
    return NextResponse.json(
      { error: `Limite diário de ${limit} simulações atingido.` },
      { status: 429 },
    );
  }

  const analysis = await prisma.analysis.findUnique({
    where: { id: parsed.data.analysisId },
  });
  if (!analysis || analysis.userId !== session.user.id) {
    return NextResponse.json({ error: "Análise não encontrada" }, { status: 404 });
  }

  const job = await prisma.simulationJob.create({
    data: {
      userId: session.user.id,
      analysisId: analysis.id,
      type: parsed.data.type,
      targetColorHex: parsed.data.targetColorHex,
      inputPath: analysis.imagePath,
      status: "QUEUED",
      provider: process.env.VTO_PROVIDER || "mock",
    },
  });

  // Processa em background (fire-and-forget no mesmo processo para MVP)
  void processSimulationJob(job.id);

  return NextResponse.json({ job }, { status: 202 });
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticada." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("id");
  if (!jobId) {
    return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  }

  const job = await prisma.simulationJob.findUnique({ where: { id: jobId } });
  if (!job || job.userId !== session.user.id) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ job });
}
