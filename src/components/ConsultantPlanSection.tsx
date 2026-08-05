"use client";

type Priority = {
  trait: string;
  action: "suavizar" | "exaltar" | "manter";
  why: string;
  confidence: number;
};

type Change = {
  id: string;
  area: string;
  suggestion: string;
  colors: string[];
  do: string;
  dont: string;
};

export type ConsultantPlanView = {
  assessment: string;
  priorities: Priority[];
  changes: Change[];
  seasonAlignment: string;
  needsHumanReview: boolean;
};

const ACTION_LABEL: Record<Priority["action"], string> = {
  suavizar: "Suavizar",
  exaltar: "Exaltar",
  manter: "Manter",
};

type Props = {
  plan: ConsultantPlanView;
  intention?: string | null;
  metaStatus?: string | null;
  usedVision?: boolean;
};

export function ConsultantPlanSection({
  plan,
  intention,
  metaStatus,
  usedVision,
}: Props) {
  return (
    <div className="card space-y-5">
      <div>
        <p className="badge">Consultora IA</p>
        <h2 className="mt-2 font-display text-xl">Plano personalizado</h2>
        {intention ? (
          <p className="mt-2 text-sm text-[var(--muted)]">
            Sua intenção: <span className="text-[var(--fg)]">{intention}</span>
          </p>
        ) : null}
        <p className="mt-3 text-sm leading-relaxed">{plan.assessment}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">{plan.seasonAlignment}</p>
        {plan.needsHumanReview && (
          <p className="mt-2 text-sm text-[var(--warn)]">
            Esta análise pediu revisão humana — uma consultora pode refinar o
            plano.
          </p>
        )}
        {(metaStatus || usedVision) && (
          <p className="mt-2 text-xs text-[var(--muted)]">
            {usedVision ? "Com leitura da foto · " : "Só fatos do motor · "}
            {metaStatus === "ok" ? "gerado agora" : metaStatus}
          </p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold">Prioridades</h3>
        <ul className="mt-2 space-y-2">
          {plan.priorities.map((p) => (
            <li
              key={`${p.trait}-${p.action}`}
              className="rounded-xl bg-[rgba(28,25,23,0.04)] px-3 py-2 text-sm"
            >
              <span className="font-medium">
                {ACTION_LABEL[p.action]} · {p.trait}
              </span>
              <span className="mt-1 block text-[var(--muted)]">{p.why}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold">Mudanças sugeridas</h3>
        <ul className="mt-3 space-y-4">
          {plan.changes.map((c) => (
            <li key={c.id} className="border-t border-[var(--line)] pt-3 first:border-0 first:pt-0">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                {c.area}
              </p>
              <p className="mt-1 text-sm font-medium">{c.suggestion}</p>
              {c.colors.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {c.colors.map((hex) => (
                    <span
                      key={hex}
                      className="swatch"
                      style={{ background: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              )}
              <p className="mt-2 text-sm text-[var(--muted)]">
                <span className="font-medium text-[var(--fg)]">Fazer: </span>
                {c.do}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                <span className="font-medium text-[var(--fg)]">Evitar: </span>
                {c.dont}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
