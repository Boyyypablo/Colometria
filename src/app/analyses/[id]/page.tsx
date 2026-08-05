import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { SimulationPanel } from "@/components/SimulationPanel";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { SkinCorrectionSection } from "@/components/SkinCorrectionSection";
import { ConsultantPlanSection } from "@/components/ConsultantPlanSection";
import { AnalysisAtmosphere } from "@/components/analysis/AnalysisAtmosphere";
import { AnalysisNav } from "@/components/analysis/AnalysisNav";
import { LandingReveal } from "@/components/LandingReveal";
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

type RecItem = { hex: string; label: string; why?: string };

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
    clothing?: RecItem[];
    lipstick?: RecItem[];
    eyeshadow?: RecItem[];
    base?: RecItem[];
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

  const useColors = rec?.useColors || [];
  const avoidColors = rec?.avoidColors || [];
  const ambientColors = [
    ...useColors,
    ...(rec?.clothing || []).map((c) => c.hex),
    ...(rec?.lipstick || []).map((c) => c.hex),
  ].filter((hex, i, arr) => Boolean(hex) && arr.indexOf(hex) === i);

  const simulationColors = [
    ...(rec?.rankedUse || []).map((c) => c.hex),
    ...useColors,
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

  const lookGroups: Array<{ title: string; items: RecItem[] }> = [
    { title: "Roupas", items: rec?.clothing || [] },
    { title: "Batons", items: rec?.lipstick || [] },
    {
      title: "Sombras e base",
      items: [...(rec?.eyeshadow || []), ...(rec?.base || [])],
    },
  ].filter((g) => g.items.length > 0);

  const navItems = [
    consultantPlan ? { href: "#plano", label: "Plano" } : null,
    useColors.length > 0 ? { href: "#paleta", label: "Paleta" } : null,
    coachingBlocks.length > 0 ? { href: "#orientacoes", label: "Orientações" } : null,
    lookGroups.length > 0 ? { href: "#looks", label: "Looks" } : null,
    isOwner && simulationColors.length > 0
      ? { href: "#simular", label: "Simular" }
      : null,
    isOwner ? { href: "#feedback", label: "Feedback" } : null,
  ].filter(Boolean) as Array<{ href: string; label: string }>;

  const railColors = ambientColors.slice(0, 8);

  return (
    <main className="analysis-result">
      <AnalysisAtmosphere colors={ambientColors} />
      <AppHeader />
      <section className="shell space-y-2 pb-16 pt-6">
        <LandingReveal className="analysis-hero">
          <div className="analysis-hero__frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/uploads/${analysis.imagePath}`}
              alt="Foto enviada"
              className="analysis-hero__photo"
            />
            {railColors.length > 0 && (
              <div className="analysis-hero__rail" aria-hidden>
                {railColors.map((hex) => (
                  <span key={hex} style={{ background: hex }} />
                ))}
              </div>
            )}
          </div>

          <div className="analysis-hero__copy">
            <p className="badge">{statusLabels[analysis.status]}</p>
            <h1 className="analysis-hero__season">
              {season?.namePt || "Análise"}
            </h1>
            <p className="analysis-hero__lede">
              {rec?.description || season?.description}
            </p>

            <div className="analysis-meta-chips">
              {analysis.undertoneLabel && (
                <span className="analysis-meta-chip">
                  Subtom {analysis.undertoneLabel}
                </span>
              )}
              {goalLabels.slice(0, 3).map((g) => (
                <span key={g} className="analysis-meta-chip">
                  {g}
                </span>
              ))}
              {analysis.consultantApproved && (
                <span className="analysis-meta-chip" style={{ color: "var(--ok)" }}>
                  Validado
                  {analysis.reviews[0]?.reviewer?.name
                    ? ` · ${analysis.reviews[0].reviewer.name}`
                    : ""}
                </span>
              )}
            </div>

            {rec?.undertoneHint && (
              <p className="mt-4 analysis-body--muted">
                {rec.undertoneHint}
              </p>
            )}
            {rec?.coaching?.sisterNote && (
              <p className="mt-3 analysis-body--muted">
                {rec.coaching.sisterNote}
              </p>
            )}
            {analysis.intention && !consultantPlan && (
              <p className="mt-3 analysis-body--muted">
                Intenção: {analysis.intention}
              </p>
            )}
            {consultantMeta?.status === "error" && (
              <p className="mt-3 analysis-body text-[var(--warn)]">
                A consultora não concluiu o plano — mostramos a paleta medida.
              </p>
            )}
            {consultantMeta?.status === "skipped" && (
              <p className="mt-3 analysis-body--muted">
                Plano personalizado indisponível — entregamos a colorimetria
                medida.
              </p>
            )}
            {analysis.reviews[0]?.notes && (
              <p className="mt-4 rounded-2xl bg-[rgba(154,52,18,0.06)] p-4 analysis-body leading-relaxed">
                <span className="font-medium">Notas da consultora: </span>
                {analysis.reviews[0].notes}
              </p>
            )}
            {!isStaff &&
              confidenceUi &&
              confidenceUi.band === "baixa" && (
                <p className="mt-3 analysis-body text-[var(--warn)]">
                  Estimativa com baixa certeza — uma consultora pode revisar.
                </p>
              )}
            {isStaff && confidenceUi && (
              <p className="mt-3 analysis-body--muted">
                Confiança (interno): {confidenceUi.percent}% · {confidenceUi.band}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {isOwner && analysis.status === "READY" && (
                <RequestReviewButton analysisId={analysis.id} />
              )}
            </div>

            {(quality?.warnings?.length || quality?.failedTips?.length) && (
              <div className="mt-5 space-y-2 analysis-body">
                {quality.warnings && quality.warnings.length > 0 && (
                  <ul className="list-disc space-y-1 pl-5 text-[var(--warn)]">
                    {quality.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                )}
                {quality.failedTips && quality.failedTips.length > 0 && (
                  <div className="rounded-2xl bg-[rgba(154,52,18,0.06)] p-4">
                    <p className="font-medium">Para a próxima foto</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-[var(--muted)]">
                      {quality.failedTips.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </LandingReveal>

        <AnalysisNav items={navItems} />

        {consultantPlan && (
          <ConsultantPlanSection
            plan={consultantPlan}
            intention={analysis.intention}
            metaStatus={consultantMeta?.status}
            usedVision={consultantMeta?.usedVision}
          />
        )}

        {useColors.length > 0 && (
          <LandingReveal className="analysis-section" id="paleta" delay={0.05}>
            <h2 className="analysis-section__title">Paleta em você</h2>
            <p className="analysis-section__hint">
              Cores que harmonizam com o subtom medido — e as que costumam
              competir.
            </p>
            <div className="analysis-palette">
              {useColors.map((c) => (
                <span
                  key={c}
                  className="analysis-palette__swatch"
                  style={{ background: c }}
                  title={isStaff ? c : undefined}
                />
              ))}
            </div>
            <div className="analysis-palette__meta">
              {(rec?.rankedUse || []).length > 0 && (
                <ul className="space-y-3 analysis-body--muted">
                  {(rec?.rankedUse || []).slice(0, 4).map((r) => (
                    <li key={r.hex} className="flex items-start gap-3">
                      <span
                        className="swatch mt-0.5 shrink-0"
                        style={{ background: r.hex }}
                      />
                      <span>{r.why}</span>
                    </li>
                  ))}
                </ul>
              )}
              {avoidColors.length > 0 && (
                <div>
                  <h3 className="analysis-kicker text-[var(--ink)]">
                    Evitar perto do rosto
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {avoidColors.map((c) => (
                      <span
                        key={c}
                        className="swatch"
                        style={{ background: c }}
                        title={isStaff ? c : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </LandingReveal>
        )}

        {isStaff && (
          <div className="analysis-panel border-dashed">
            <h2 className="font-display text-xl">Painel técnico</h2>
            <p className="mt-2 analysis-body--muted">
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
                ? ` · Consultora ${consultantMeta.status}${consultantMeta.usedVision ? "+foto" : ""}`
                : ""}
            </p>
            {consultantMeta?.error && (
              <p className="mt-1 text-sm text-[var(--warn)]">
                {consultantMeta.error}
              </p>
            )}
          </div>
        )}

        {coachingBlocks.length > 0 && (
          <LandingReveal
            className="analysis-section"
            id="orientacoes"
            delay={0.05}
          >
            <h2 className="analysis-section__title">Orientações</h2>
            <p className="analysis-section__hint">
              Como usar contraste, estilo e make a favor da sua estação.
            </p>
            <div className="analysis-panel space-y-5">
              {rec?.coaching?.contrastTip && !isStaff && (
                <p className="analysis-body--muted">
                  {rec.coaching.contrastTip.includes("—")
                    ? rec.coaching.contrastTip.split("—")[0].trim() + "."
                    : rec.coaching.contrastTip}
                </p>
              )}
              {rec?.coaching?.contrastTip && isStaff && (
                <p className="analysis-body--muted">
                  {rec.coaching.contrastTip}
                </p>
              )}
              {coachingBlocks.map(([title, tips]) => (
                <div key={title}>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 analysis-body--muted">
                    {(tips || []).map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </LandingReveal>
        )}

        {skinCorrection && (
          <LandingReveal className="analysis-section space-y-3">
            <SkinCorrectionSection block={skinCorrection} />
            <p className="analysis-body--muted text-base">
              {rec?.ethicalNote ||
                "Não é diagnóstico dermatológico nem substitui consultoria presencial."}
            </p>
          </LandingReveal>
        )}

        {lookGroups.length > 0 && (
          <LandingReveal className="analysis-section" id="looks" delay={0.05}>
            <h2 className="analysis-section__title">Looks sugeridos</h2>
            <p className="analysis-section__hint">
              Peças e maquiagem alinhadas à cartela — com o porquê de cada tom.
            </p>
            <div className="space-y-8">
              {lookGroups.map((group) => (
                <div key={group.title} className="analysis-look-row">
                  <h3 className="analysis-look-row__label">{group.title}</h3>
                  <ul className="analysis-look-row__items">
                    {group.items.map((item) => (
                      <li
                        key={`${item.label}-${item.hex}`}
                        className="analysis-look-item"
                      >
                        <span
                          className="swatch"
                          style={{ background: item.hex }}
                        />
                        <span>
                          <span className="font-medium text-lg">{item.label}</span>
                          {item.why ? (
                            <span className="mt-1 block analysis-body--muted">
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
          </LandingReveal>
        )}

        {isOwner && simulationColors.length > 0 && (
          <LandingReveal className="analysis-section" id="simular">
            <SimulationPanel
              analysisId={analysis.id}
              colors={simulationColors}
              vtoProvider={vto.provider}
              aiReady={vto.aiReady}
            />
          </LandingReveal>
        )}

        {isOwner &&
          (analysis.status === "READY" ||
            analysis.status === "NEEDS_REVIEW" ||
            analysis.status === "APPROVED") &&
          season && (
            <LandingReveal className="analysis-section" id="feedback">
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
            </LandingReveal>
          )}

        {isStaff && analysis.status !== "APPROVED" && (
          <div className="analysis-section">
            <ConsultantReviewForm
              analysisId={analysis.id}
              seasons={seasons}
              currentSeasonId={analysis.overrideSeasonId || analysis.seasonId}
            />
          </div>
        )}
      </section>
    </main>
  );
}
