"use client";

import { LandingReveal } from "@/components/LandingReveal";

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
    <LandingReveal className="analysis-section" id="plano">
      <p className="badge">Consultora</p>
      <h2 className="analysis-section__title">Plano personalizado</h2>
      <p className="analysis-section__hint">
        Decisões sob medida a partir da sua intenção e da colorimetria medida.
      </p>

      <div className="analysis-panel space-y-5">
        {intention ? (
          <p className="analysis-body--muted">
            Sua intenção:{" "}
            <span className="font-medium text-[var(--ink)]">{intention}</span>
          </p>
        ) : null}
        <p className="analysis-body">{plan.assessment}</p>
        <p className="analysis-body--muted">{plan.seasonAlignment}</p>
        {plan.needsHumanReview && (
          <p className="analysis-body text-[var(--warn)]">
            Esta análise pediu revisão humana — uma consultora pode refinar o
            plano.
          </p>
        )}

        <div>
          <h3 className="analysis-kicker">Prioridades</h3>
          <ul className="analysis-priority-grid mt-3">
            {plan.priorities.map((p) => (
              <li key={`${p.trait}-${p.action}`} className="analysis-priority">
                <span className="font-medium">
                  {ACTION_LABEL[p.action]} · {p.trait}
                </span>
                <span className="mt-1.5 block text-[var(--muted)]">{p.why}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="analysis-kicker">Mudanças sugeridas</h3>
          <ul className="mt-2">
            {plan.changes.map((c) => (
              <li key={c.id} className="analysis-change">
                <div>
                  <p className="analysis-kicker uppercase tracking-wide">
                    {c.area}
                  </p>
                  <p className="mt-1.5 text-lg font-medium leading-snug">
                    {c.suggestion}
                  </p>
                  {c.colors.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
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
                </div>
                <div className="space-y-2 analysis-body--muted">
                  <p>
                    <span className="font-medium text-[var(--ink)]">Fazer: </span>
                    {c.do}
                  </p>
                  <p>
                    <span className="font-medium text-[var(--ink)]">Evitar: </span>
                    {c.dont}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {(metaStatus || usedVision) && (
          <p className="text-sm text-[var(--muted)]">
            {usedVision ? "Com leitura da foto · " : "Só fatos medidos · "}
            {metaStatus === "ok" ? "gerado agora" : metaStatus}
          </p>
        )}
      </div>
    </LandingReveal>
  );
}
