import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

const schema = z.object({
  analysisId: z.string().min(1),
  kind: z.enum(["HELPED", "DID_NOT_HELP"]),
  target: z.string().min(1).max(200),
  note: z.string().max(1000).optional(),
});

/** Feedback "ajudou / não ajudou" — alimenta dataset e UserColorProfile (Fase 2/3). */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticada." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const analysis = await prisma.analysis.findFirst({
    where: { id: parsed.data.analysisId, userId: session.user.id },
  });
  if (!analysis) {
    return NextResponse.json({ error: "Análise não encontrada" }, { status: 404 });
  }

  const event = await prisma.feedbackEvent.create({
    data: {
      userId: session.user.id,
      analysisId: analysis.id,
      kind: parsed.data.kind,
      target: parsed.data.target,
      note: parsed.data.note,
    },
  });

  // Soft-label self-report na estação (consultora vence se já houver label).
  if (
    parsed.data.target === "season" &&
    parsed.data.kind === "HELPED" &&
    analysis.seasonId
  ) {
    const sample = await prisma.analysisSample.findUnique({
      where: { analysisId: analysis.id },
      select: { id: true, labelSeasonId: true, labelSource: true },
    });
    if (
      sample &&
      (!sample.labelSeasonId || sample.labelSource === "user_feedback")
    ) {
      await prisma.analysisSample.update({
        where: { id: sample.id },
        data: {
          labelSeasonId: analysis.overrideSeasonId || analysis.seasonId,
          labelSource: "user_feedback",
        },
      });
    }
  }

  return NextResponse.json({ event }, { status: 201 });
}
