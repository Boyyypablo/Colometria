import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { SimulationPanel } from "@/components/SimulationPanel";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { SkinCorrectionSection } from "@/components/SkinCorrectionSection";
import { ConsultantPlanSection } from "@/components/ConsultantPlanSection";
import {
  ConsultantReviewForm,
  RequestReviewButton,
} from "@/components/ReviewActions";
import { auth } from "@/lib/auth";
import { buildSkinCorrection } from "@/lib/color/skin-correction";
import { formatConfidence } from "@/lib/color/confidence";
import {
  ANALYSIS_GOAL_OPTIONS,
  parseAnalysisGoals,
  wantsSkinCorrection,
} from "@/lib/color/goals";
import { parseConsultantPlan } from "@/lib/ai/consultant";
import {
  consultantChangeTarget,
  type ConsultantPlanMeta,
} from "@/lib/ai/consultant-plan-schema";
import { prisma } from "@/lib/db/prisma";
import type { SkinCorrectionBlock } from "@/lib/color/skin-correction";
import { getVtoRuntimeInfo } from "@/lib/vto/simulate";

type Params = { params: Promise<{ id: string }> };

const statusLabelUser: Record<string, string> = {
  PENDING: "Processando",
  READY: "Pronto",
  NEEDS_REVIEW: "Em revisão",
  APPROVED: "Validado",
};

const statusLabelStaff: Record<string, string> = {
  PENDING: "Processando",
  READY: "Pronto (sem revisão)",
  NEEDS_REVIEW: "Em revisão",
  APPROVED: "Validado pela consultora",
};

const qualityBandLabel: Record<string, string> = {
  boa: "boa",
  aceitavel: "aceitável",
  ruim: "ruim",
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
      feedbackEvents: {
        orderBy: { createdAt: "asc" },
        select: { target: true, kind: true },
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
    undertoneHint?: string;
    useColors?: string[];
    avoidColors?: string[];
    rankedUse?: Array<{ hex: string; score: number; why: string }>;
    clothing?: Array<{ hex: string; label: string; why?: string }>;
    lipstick?: Array<{ hex: string; label: string; why?: string }>;
    eyeshadow?: Array<{ hex: string; label: string; why?: string }>;
    base?: Array<{ hex: string; label: string; why?: string }>;
    skinCorrection?: SkinCorrectionBlock;
    ethicalNote?: string;
    coaching?: {
      sisterNote?: string | null;
      styleTips?: string[];
      makeupTips?: string[];
      hairTips?: string[];
      avoidNotes?: string[];
      offPaletteTips?: string[];
      contrastTip?: string | null;
      colorimetryHairNotes?: string[];
      attentionRedirectTips?: string[];
    };
  } | null;

  const features = analysis.features as {
    temperatureScore?: number;
    labUndertone?: { L: number; a: number; b: number };
    contrastScore?: number;
    contrastSource?: string;
    labHair?: unknown;
    labEyes?: unknown;
  } | null;

  const goals = parseAnalysisGoals(
    (rec as { goals?: string[] } | null)?.goals?.length
      ? (rec as { goals: string[] }).goals
      : analysis.goals,
  );

  const consultantPlan = parseConsultantPlan(analysis.consultantPlan);
  const consultantMeta =
    (analysis.consultantPlanMeta as ConsultantPlanMeta | null) ?? null;

  const skinCorrection: SkinCorrectionBlock | null = consultantPlan
    ? (rec?.skinCorrection as SkinCorrectionBlock | null | undefined) ?? null
    : (rec?.skinCorrection as SkinCorrectionBlock | null | undefined) ??
      (season && wantsSkinCorrection(goals)
        ? buildSkinCorrection({
            temperature: season.temperature === "cool" ? "cool" : "warm",
            temperatureScore: features?.temperatureScore,
            skinL: features?.labUndertone?.L,
            goals,
          })
        : null);

  const goalLabels = ANALYSIS_GOAL_OPTIONS.filter((o) =>
    goals.includes(o.id),
  ).map((o) => o.label);

  const seasons = await prisma.seasonPalette.findMany({
    select: { id: true, namePt: true },
    orderBy: { namePt: "asc" },
  });

  const quality = analysis.photoQuality as {
    warnings?: string[];
    faceDetected?: boolean;
    detectorProvider?: string;
    usedFaceFallback?: boolean;
    qualityBand?: "boa" | "aceitavel" | "ruim";
    failedTips?: string[];
  } | null;

  const confidenceUi =
    analysis.confidence != null
      ? formatConfidence(analysis.confidence)
      : null;

  const vto = getVtoRuntimeInfo();

  const simulationColors = [
    ...(rec?.rankedUse || []).map((c) => c.hex),
    ...(rec?.useColors || []),
    ...(rec?.clothing || []).map((c) => c.hex),
    ...(rec?.lipstick || []).map((c) => c.hex),
  ].filter((hex, i, arr) => Boolean(hex) && arr.indexOf(hex) === i);

  const statusLabels = isStaff ? statusLabelStaff : statusLabelUser;

  const attentionTitle = [
    goals.includes("olheiras") ? "olheiras" : null,
    goals.includes("manchas") ? "manchas" : null,
    goals.includes("vermelhidao") ? "vermelhidão" : null,
  ]
    .filter(Boolean)
    .join(", ");

  const coachingBlocks = (
    [
      ["Estilo e roupas", rec?.coaching?.styleTips],
      ["Maquiagem", rec?.coaching?.makeupTips],
      ["Cabelo", rec?.coaching?.hairTips],
      ...(isStaff
        ? ([["Colorimetria do fio", rec?.coaching?.colorimetryHairNotes]] as const)
        : []),
      [
        attentionTitle
          ? `Suavizar ${attentionTitle}`
          : "Suavizar manchas, espinhas ou olheiras",
        rec?.coaching?.attentionRedirectTips,
      ],
      ["Evitar", rec?.coaching?.avoidNotes],
      ["Cores fora da paleta", rec?.coaching?.offPaletteTips],
    ] as const
  ).filter(([, tips]) => (tips || []).length > 0);

  return (
    <main>
      <AppHeader />
      <section className="shell space-y-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="badge">{statusLabels[analysis.status]}</p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl">
              {season?.namePt || "Análise"}
            </h1>
            <p className="mt-2 max-w-2xl text-[var(--muted)]">
              {rec?.description || season?.description}
            </p>
            {analysis.intention && !consultantPlan && (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Intenção: {analysis.intention}
              </p>
            )}
            {goalLabels.length > 0 && (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Você pediu: {goalLabels.join(" · ")}
              </p>
            )}
            {consultantMeta?.status === "error" && (
              <p className="mt-2 text-sm text-[var(--warn)]">
                A consultora IA não concluiu o plano — mostramos a paleta
                medida. Tente de novo ou peça revisão.
              </p>
            )}
            {consultantMeta?.status === "skipped" && (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Plano IA indisponível neste ambiente — entregamos só a
                colorimetria medida.
              </p>
            )}
            {analysis.consultantApproved && (
              <p className="mt-2 text-sm font-medium text-[var(--ok)]">
                Validado pela consultora
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
            {quality?.failedTips && quality.failedTips.length > 0 && (
              <div className="rounded-xl bg-[rgba(154,52,18,0.06)] p-3 text-sm">
                <p className="font-medium">Para a próxima foto:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-[var(--muted)]">
                  {quality.failedTips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="card space-y-2">
              <h2 className="font-display text-xl">Seu resultado</h2>
              <p className="text-sm">
                Subtom: <strong>{analysis.undertoneLabel || "—"}</strong>
              </p>
              {rec?.undertoneHint && (
                <p className="text-sm text-[var(--muted)]">{rec.undertoneHint}</p>
              )}
              {isStaff && confidenceUi && (
                <p className="text-sm text-[var(--muted)]">
                  Confiança (interno): {confidenceUi.percent}% · {confidenceUi.band}
                </p>
              )}
              {!isStaff &&
                confidenceUi &&
                confidenceUi.band === "baixa" && (
                  <p className="text-sm text-[var(--warn)]">
                    Estimativa com baixa certeza — uma consultora pode revisar.
                  </p>
                )}
              {rec?.coaching?.sisterNote && (
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {rec.coaching.sisterNote}
                </p>
              )}
            </div>

            <div className="card space-y-3">
              <h2 className="font-display text-xl">Melhor em você</h2>
              {(rec?.useColors || []).length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  Harmonia de cores não foi pedida nesta análise.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {(rec?.useColors || []).map((c) => (
                      <span
                        key={c}
                        className="swatch"
                        style={{ background: c }}
                        title={isStaff ? c : undefined}
                      />
                    ))}
                  </div>
                  {(rec?.rankedUse || []).length > 0 && (
                    <ul className="space-y-2 pt-1 text-sm">
                      {(rec?.rankedUse || []).slice(0, 4).map((r) => (
                        <li key={r.hex} className="flex items-start gap-3">
                          <span
                            className="swatch mt-0.5 shrink-0"
                            style={{ background: r.hex }}
                          />
                          <span className="text-[var(--muted)]">{r.why}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <h3 className="pt-2 text-sm font-semibold">Evitar</h3>
                  <div className="flex flex-wrap gap-2">
                    {(rec?.avoidColors || []).map((c) => (
                      <span
                        key={c}
                        className="swatch"
                        style={{ background: c }}
                        title={isStaff ? c : undefined}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {consultantPlan && (
          <ConsultantPlanSection
            plan={consultantPlan}
            intention={analysis.intention}
            metaStatus={consultantMeta?.status}
            usedVision={consultantMeta?.usedVision}
          />
        )}

        {isStaff && (
          <div className="card space-y-2 border-dashed">
            <h2 className="font-display text-lg">Painel técnico</h2>
            <p className="text-sm text-[var(--muted)]">
              Contexto: {analysis.context}
              {features?.contrastScore != null
                ? ` · Contraste ${features.contrastScore.toFixed(0)}`
                : ""}
              {features?.contrastSource
                ? ` (${features.contrastSource})`
                : ""}
              {quality?.detectorProvider
                ? ` · Face ${quality.detectorProvider}`
                : ""}
              {quality?.qualityBand
                ? ` · Qualidade ${qualityBandLabel[quality.qualityBand] || quality.qualityBand}`
                : ""}
              {consultantMeta?.status
                ? ` · IA ${consultantMeta.status}${consultantMeta.usedVision ? "+visão" : ""}`
                : ""}
            </p>
            {consultantMeta?.error && (
              <p className="text-xs text-[var(--warn)]">{consultantMeta.error}</p>
            )}
          </div>
        )}

        {coachingBlocks.length > 0 && (
          <div className="card space-y-4">
            <h2 className="font-display text-xl">Orientações</h2>
            {rec?.coaching?.contrastTip && !isStaff && (
              <p className="text-sm text-[var(--muted)]">
                {rec.coaching.contrastTip.includes("—")
                  ? rec.coaching.contrastTip.split("—")[0].trim() + "."
                  : rec.coaching.contrastTip}
              </p>
            )}
            {rec?.coaching?.contrastTip && isStaff && (
              <p className="text-sm text-[var(--muted)]">
                {rec.coaching.contrastTip}
              </p>
            )}
            {coachingBlocks.map(([title, tips]) => (
              <div key={title}>
                <h3 className="text-sm font-semibold">{title}</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
                  {(tips || []).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {skinCorrection && (
          <div className="space-y-3">
            <SkinCorrectionSection block={skinCorrection} />
            <p className="text-xs text-[var(--muted)]">
              {rec?.ethicalNote ||
                "Não é diagnóstico dermatológico nem substitui consultoria presencial."}
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {(
            [
              ["Roupas", rec?.clothing],
              ["Batons", rec?.lipstick],
              [
                "Sombras / base",
                [...(rec?.eyeshadow || []), ...(rec?.base || [])],
              ],
            ] as const
          )
            .filter(([, items]) => (items || []).length > 0)
            .map(([title, items]) => (
              <div key={title} className="card space-y-3">
                <h2 className="font-display text-lg">{title}</h2>
                <ul className="space-y-2">
                  {(items || []).map((item) => (
                    <li
                      key={`${item.label}-${item.hex}`}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span
                        className="swatch mt-0.5 shrink-0"
                        style={{ background: item.hex }}
                      />
                      <span>
                        <span>{item.label}</span>
                        {"why" in item && item.why ? (
                          <span className="mt-0.5 block text-[var(--muted)]">
                            {item.why}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        {isOwner && simulationColors.length > 0 && (
          <SimulationPanel
            analysisId={analysis.id}
            colors={simulationColors}
            vtoProvider={vto.provider}
            aiReady={vto.aiReady}
          />
        )}

        {isOwner &&
          (analysis.status === "READY" ||
            analysis.status === "NEEDS_REVIEW" ||
            analysis.status === "APPROVED") &&
          season && (
            <FeedbackPanel
              analysisId={analysis.id}
              seasonName={season.namePt}
              clothing={rec?.clothing || []}
              lipstick={rec?.lipstick || []}
              eyeshadow={rec?.eyeshadow || []}
              base={rec?.base || []}
              corrections={(skinCorrection?.items || []).map((i) => ({
                hex: i.hex,
                label: i.label,
                target: i.target,
              }))}
              aiChanges={(consultantPlan?.changes || []).map((c) => ({
                id: c.id,
                label: c.suggestion,
                target: consultantChangeTarget(c.id),
                hex: c.colors[0],
              }))}
              initialVotes={analysis.feedbackEvents.map((e) => ({
                target: e.target,
                kind: e.kind as "HELPED" | "DID_NOT_HELP",
              }))}
            />
          )}

        {isStaff && analysis.status !== "APPROVED" && (
          <ConsultantReviewForm
            analysisId={analysis.id}
            seasons={seasons}
            currentSeasonId={analysis.overrideSeasonId || analysis.seasonId}
          />
        )}
      </section>
    </main>
  );
}
