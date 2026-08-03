import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { SimulationPanel } from "@/components/SimulationPanel";
import {
  ConsultantReviewForm,
  RequestReviewButton,
} from "@/components/ReviewActions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ id: string }> };

const statusLabel: Record<string, string> = {
  PENDING: "Processando",
  READY: "Pronto (self-service)",
  NEEDS_REVIEW: "Aguarda consultora",
  APPROVED: "Aprovado pela consultora",
};

export default async function AnalysisPage({ params }: Params) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const analysis = await prisma.analysis.findUnique({
    where: { id },
    include: {
      season: true,
      overrideSeason: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { reviewer: { select: { name: true } } },
      },
    },
  });

  if (!analysis) notFound();

  const isOwner = analysis.userId === session.user.id;
  const isStaff =
    session.user.role === "CONSULTANT" || session.user.role === "ADMIN";
  if (!isOwner && !isStaff) redirect("/dashboard");

  const season = analysis.overrideSeason || analysis.season;
  const rec = analysis.recommendations as {
    description?: string;
    ethicalNote?: string;
    useColors?: string[];
    avoidColors?: string[];
    clothing?: Array<{ hex: string; label: string }>;
    lipstick?: Array<{ hex: string; label: string }>;
    eyeshadow?: Array<{ hex: string; label: string }>;
    base?: Array<{ hex: string; label: string }>;
  } | null;

  const seasons = await prisma.seasonPalette.findMany({
    select: { id: true, namePt: true },
    orderBy: { namePt: "asc" },
  });

  const quality = analysis.photoQuality as { warnings?: string[] } | null;

  return (
    <main>
      <AppHeader />
      <section className="shell space-y-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="badge">{statusLabel[analysis.status]}</p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl">
              {season?.namePt || "Análise"}
            </h1>
            <p className="mt-2 max-w-2xl text-[var(--muted)]">
              {rec?.description || season?.description}
            </p>
            {analysis.consultantApproved && (
              <p className="mt-2 text-sm font-medium text-[var(--ok)]">
                Selo consultora
                {analysis.reviews[0]?.reviewer?.name
                  ? ` · ${analysis.reviews[0].reviewer.name}`
                  : ""}
              </p>
            )}
            {analysis.reviews[0]?.notes && (
              <p className="mt-3 max-w-2xl rounded-xl bg-[rgba(154,52,18,0.06)] p-3 text-sm leading-relaxed">
                <span className="font-medium">Notas da consultora: </span>
                {analysis.reviews[0].notes}
              </p>
            )}
          </div>
          {isOwner && analysis.status === "READY" && (
            <RequestReviewButton analysisId={analysis.id} />
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="card space-y-3">
            <h2 className="font-display text-xl">Sua foto</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/uploads/${analysis.imagePath}`}
              alt="Foto enviada"
              className="max-h-[420px] rounded-xl object-contain"
            />
            {quality?.warnings && quality.warnings.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--warn)]">
                {quality.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-4">
            <div className="card space-y-2">
              <h2 className="font-display text-xl">Diagnóstico</h2>
              <p className="text-sm">
                Subtom: <strong>{analysis.undertoneLabel || "—"}</strong>
              </p>
              <p className="text-sm">
                Confiança:{" "}
                <strong>
                  {analysis.confidence != null
                    ? `${Math.round(analysis.confidence * 100)}%`
                    : "—"}
                </strong>
              </p>
              <p className="text-sm text-[var(--muted)]">
                Contexto: {analysis.context}
              </p>
              {rec?.ethicalNote && (
                <p className="mt-3 rounded-xl bg-[rgba(154,52,18,0.06)] p-3 text-sm leading-relaxed">
                  {rec.ethicalNote}
                </p>
              )}
            </div>

            <div className="card space-y-3">
              <h2 className="font-display text-xl">Usar</h2>
              <div className="flex flex-wrap gap-2">
                {(rec?.useColors || []).map((c) => (
                  <span key={c} className="swatch" style={{ background: c }} title={c} />
                ))}
              </div>
              <h3 className="pt-2 text-sm font-semibold">Evitar</h3>
              <div className="flex flex-wrap gap-2">
                {(rec?.avoidColors || []).map((c) => (
                  <span key={c} className="swatch" style={{ background: c }} title={c} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {(
            [
              ["Roupas", rec?.clothing],
              ["Batons", rec?.lipstick],
              ["Sombras / base", [...(rec?.eyeshadow || []), ...(rec?.base || [])]],
            ] as const
          ).map(([title, items]) => (
            <div key={title} className="card space-y-3">
              <h2 className="font-display text-lg">{title}</h2>
              <ul className="space-y-2">
                {(items || []).map((item) => (
                  <li key={`${item.label}-${item.hex}`} className="flex items-center gap-3 text-sm">
                    <span className="swatch" style={{ background: item.hex }} />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {isOwner && (
          <SimulationPanel
            analysisId={analysis.id}
            colors={rec?.useColors || ["#E63946", "#457B9D", "#BC6C25"]}
          />
        )}

        {isStaff && analysis.status !== "APPROVED" && (
          <ConsultantReviewForm
            analysisId={analysis.id}
            seasons={seasons}
            currentSeasonId={
              analysis.overrideSeasonId || analysis.seasonId
            }
          />
        )}
      </section>
    </main>
  );
}
