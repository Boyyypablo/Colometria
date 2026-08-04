import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  countTodaySimulations,
  getVtoRuntimeInfo,
  processSimulationJob,
} from "@/lib/vto/simulate";

const schema = z.object({
  analysisId: z.string().min(1),
  targetColorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  type: z.enum(["COLOR_DRAPE", "BLOUSE_TONE"]).default("COLOR_DRAPE"),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const vto = getVtoRuntimeInfo();
  if (!vto.aiReady) {
    return NextResponse.json(
      {
        error:
          vto.provider === "huggingface"
            ? "Simulação com Hugging Face não configurada. Defina HF_TOKEN no .env (https://huggingface.co/settings/tokens)."
            : vto.provider === "gemini"
            ? "Simulação com Gemini não configurada. Defina GEMINI_API_KEY no .env (https://aistudio.google.com/apikey)."
            : vto.provider === "fal"
              ? "Simulação com fal.ai não configurada. Defina FAL_KEY ou use VTO_PROVIDER=huggingface."
              : "Simulação indisponível.",
        vto,
      },
      { status: 503 },
    );
  }

  let email = session.user.email?.toLowerCase() ?? "";
  if (!email) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });
    email = dbUser?.email?.toLowerCase() ?? "";
  }
  const unlimitedEmails = (process.env.VTO_UNLIMITED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const skipDailyLimit = unlimitedEmails.includes(email);

  const limit = Number(process.env.VTO_DAILY_LIMIT || 5);
  if (!skipDailyLimit && Number.isFinite(limit) && limit > 0) {
    const used = await countTodaySimulations(session.user.id);
    if (used >= limit) {
      return NextResponse.json(
        { error: `Limite diário de ${limit} simulações atingido.` },
        { status: 429 },
      );
    }
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
      provider: vto.provider,
    },
  });

  void processSimulationJob(job.id);

  return NextResponse.json({ job, vto }, { status: 202 });
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("id");
  if (!jobId) {
    return NextResponse.json(
      { error: "id obrigatório", vto: getVtoRuntimeInfo() },
      { status: 400 },
    );
  }

  const job = await prisma.simulationJob.findUnique({ where: { id: jobId } });
  if (!job || job.userId !== session.user.id) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ job, vto: getVtoRuntimeInfo() });
}
