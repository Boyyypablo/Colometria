import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { saveUserImage } from "@/lib/storage/local";
import { analyzeImageBuffer } from "@/lib/color/classifier";
import { buildRecommendations, getSeasonById } from "@/lib/color/recommendations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticada." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user?.lgpdConsentAt) {
    return NextResponse.json(
      { error: "Consentimento LGPD necessário para upload de imagem facial." },
      { status: 403 },
    );
  }

  const form = await request.formData();
  const file = form.get("image");
  const contextRaw = String(form.get("context") || "casual");
  const context =
    contextRaw === "trabalho" || contextRaw === "noite" ? contextRaw : "casual";
  const consent = form.get("biometricConsent") === "true";

  if (!consent) {
    return NextResponse.json(
      { error: "Confirme o consentimento para processamento biométrico da foto." },
      { status: 400 },
    );
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Imagem obrigatória." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Arquivo deve ser imagem." }, { status: 400 });
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Máximo 8MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.type.includes("png") ? "png" : "jpg";
  const imagePath = await saveUserImage(session.user.id, buffer, ext);

  const pending = await prisma.analysis.create({
    data: {
      userId: session.user.id,
      imagePath,
      status: "PENDING",
      context,
    },
  });

  try {
    const result = await analyzeImageBuffer(buffer);
    const season = getSeasonById(result.seasonId);
    if (!season) {
      throw new Error("Estação não encontrada");
    }

    const recommendations = buildRecommendations(season, context);
    const status = result.needsReview ? "NEEDS_REVIEW" : "READY";

    const analysis = await prisma.analysis.update({
      where: { id: pending.id },
      data: {
        status,
        seasonId: result.seasonId,
        confidence: result.confidence,
        features: result.features,
        photoQuality: result.photoQuality,
        undertoneLabel: result.undertoneLabel,
        recommendations,
      },
      include: {
        season: true,
      },
    });

    return NextResponse.json({ analysis });
  } catch (err) {
    await prisma.analysis.update({
      where: { id: pending.id },
      data: { status: "NEEDS_REVIEW" },
    });
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Falha na análise",
        analysisId: pending.id,
      },
      { status: 500 },
    );
  }
}
