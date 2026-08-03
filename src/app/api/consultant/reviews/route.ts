import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { buildRecommendations, getSeasonById } from "@/lib/color/recommendations";

const schema = z.object({
  overrideSeasonId: z.string().min(1),
  notes: z.string().max(2000).optional(),
  approved: z.boolean().default(true),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticada." }, { status: 401 });
  }
  if (session.user.role !== "CONSULTANT" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const queue = await prisma.analysis.findMany({
    where: { status: { in: ["NEEDS_REVIEW", "READY"] } },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      season: true,
      overrideSeason: true,
    },
    take: 50,
  });

  return NextResponse.json({ queue });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticada." }, { status: 401 });
  }
  if (session.user.role !== "CONSULTANT" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const analysisId = body.analysisId as string | undefined;
  if (!analysisId) {
    return NextResponse.json({ error: "analysisId obrigatório" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const season = getSeasonById(parsed.data.overrideSeasonId);
  if (!season) {
    return NextResponse.json({ error: "Estação inválida" }, { status: 400 });
  }

  const analysis = await prisma.analysis.findUnique({ where: { id: analysisId } });
  if (!analysis) {
    return NextResponse.json({ error: "Análise não encontrada" }, { status: 404 });
  }

  const context =
    analysis.context === "trabalho" || analysis.context === "noite"
      ? analysis.context
      : "casual";
  const recommendations = buildRecommendations(season, context);

  const [review, updated] = await prisma.$transaction([
    prisma.consultantReview.create({
      data: {
        analysisId,
        reviewerId: session.user.id,
        overrideSeasonId: parsed.data.overrideSeasonId,
        notes: parsed.data.notes,
        approved: parsed.data.approved,
      },
    }),
    prisma.analysis.update({
      where: { id: analysisId },
      data: {
        overrideSeasonId: parsed.data.overrideSeasonId,
        recommendations,
        consultantApproved: parsed.data.approved,
        status: parsed.data.approved ? "APPROVED" : "NEEDS_REVIEW",
        undertoneLabel:
          season.temperature === "warm" ? "quente (revisado)" : "frio (revisado)",
      },
      include: {
        season: true,
        overrideSeason: true,
      },
    }),
  ]);

  // Label gold para treino (Fase 2)
  await prisma.analysisSample.updateMany({
    where: { analysisId },
    data: {
      labelSeasonId: parsed.data.overrideSeasonId,
      labelSource: "consultant_review",
    },
  });

  return NextResponse.json({ review, analysis: updated });
}
