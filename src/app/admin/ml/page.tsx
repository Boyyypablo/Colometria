import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { auth } from "@/lib/auth";
import { computeMlMetrics } from "@/lib/ml/metrics";

function pct(n: number | null): string {
  if (n == null) return "—";
  return `${Math.round(n * 100)}%`;
}

export default async function AdminMlPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const m = await computeMlMetrics();

  return (
    <main>
      <AppHeader />
      <section className="shell space-y-6 py-8">
        <div>
          <p className="badge">Admin · ML</p>
          <h1 className="mt-2 font-display text-3xl">Dataset e concordância</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Combustível do treino: labels gold, feedback e taxa de concordância
            predito vs label. Export:{" "}
            <code className="text-xs">npm run ml:export</code>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["Análises", String(m.analysesTotal)],
              ["Samples", String(m.samplesTotal)],
              ["Rotulados", String(m.labeledSamples)],
              ["Pronto p/ treino (≥50)", m.readyForTrainFloor ? "sim" : "não"],
              ["Label consultora", String(m.consultantLabeled)],
              ["Label usuária", String(m.userFeedbackLabeled)],
              ["Concordância", pct(m.concordanceRate)],
              ["Feedback total", String(m.feedbackTotal)],
              ["👍 Ajudou", String(m.feedbackHelped)],
              ["👎 Não ajudou", String(m.feedbackDidNotHelp)],
              ["Detector fraco", pct(m.detectorFallbackRate)],
              ["NEEDS_REVIEW", pct(m.needsReviewRate)],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="space-y-1 border-b border-[rgba(28,25,23,0.08)] pb-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                {label}
              </p>
              <p className="font-display text-2xl">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-display text-xl">Top HELPED</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {m.topHelpedTargets.length === 0 ? (
                <li className="text-[var(--muted)]">Sem dados ainda</li>
              ) : (
                m.topHelpedTargets.map((t) => (
                  <li key={t.target} className="flex justify-between gap-4">
                    <span className="truncate">{t.target}</span>
                    <span>{t.count}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-xl">Top DID_NOT_HELP</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {m.topDidNotHelpTargets.length === 0 ? (
                <li className="text-[var(--muted)]">Sem dados ainda</li>
              ) : (
                m.topDidNotHelpTargets.map((t) => (
                  <li key={t.target} className="flex justify-between gap-4">
                    <span className="truncate">{t.target}</span>
                    <span>{t.count}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
