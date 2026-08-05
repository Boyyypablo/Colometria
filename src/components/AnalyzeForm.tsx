"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ANALYSIS_GOAL_OPTIONS,
  DEFAULT_ANALYSIS_GOALS,
  type AnalysisGoalId,
} from "@/lib/color/goals";
import { PHOTO_QUALITY_TIPS } from "@/lib/color/photo-tips";

export function AnalyzeForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<AnalysisGoalId[]>([
    ...DEFAULT_ANALYSIS_GOALS,
  ]);
  const [intention, setIntention] = useState("");
  const [tipsOk, setTipsOk] = useState(false);

  function toggleGoal(id: AnalysisGoalId) {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (intention.trim().length < 8) {
      setError(
        "Conte o que você quer trabalhar (ex.: valorizar o olhar, suavizar olheiras).",
      );
      return;
    }
    if (goals.length === 0) {
      setError("Selecione pelo menos um objetivo para a análise.");
      return;
    }
    if (!tipsOk) {
      setError("Confirme o checklist de qualidade da foto antes de enviar.");
      return;
    }
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set(
      "biometricConsent",
      fd.get("biometricConsent") === "on" ? "true" : "false",
    );
    fd.set("photoTipsConfirmed", "true");
    fd.set("intention", intention.trim());
    for (const g of goals) {
      fd.append("goals", g);
    }

    const res = await fetch("/api/analyses", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Não foi possível concluir a análise.");
      return;
    }
    router.push(`/analyses/${data.analysis.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5">
      <div>
        <label className="label" htmlFor="image">
          Foto do rosto (luz natural, sem maquiagem pesada)
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          required
          className="input"
        />
      </div>

      <fieldset className="space-y-3 rounded-xl border border-[var(--line)] p-4">
        <legend className="label px-1">Checklist da foto</legend>
        <p className="text-sm text-[var(--muted)]">
          Boa foto = cores que fazem sentido. Confira antes de analisar.
        </p>
        <ul className="space-y-2 text-sm">
          {PHOTO_QUALITY_TIPS.map((tip) => (
            <li key={tip.id} className="flex gap-2">
              <span aria-hidden className="text-[var(--accent)]">
                ·
              </span>
              <span>{tip.label}</span>
            </li>
          ))}
        </ul>
        <label className="flex items-start gap-2 pt-1 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={tipsOk}
            onChange={(e) => setTipsOk(e.target.checked)}
            required
          />
          <span>Confirmei que a foto segue essas condições.</span>
        </label>
      </fieldset>

      <div>
        <label className="label" htmlFor="intention">
          O que você quer trabalhar?
        </label>
        <p className="mb-2 text-sm text-[var(--muted)]">
          A consultora IA usa isso para decidir o que suavizar, exaltar ou
          manter — não é um checklist fixo.
        </p>
        <textarea
          id="intention"
          name="intention"
          className="input min-h-[96px]"
          required
          minLength={8}
          maxLength={600}
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          placeholder="Ex.: quero valorizar o olhar e suavizar olheiras sem parecer maquiada demais"
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="label">Áreas de foco (opcional)</legend>
        <p className="text-sm text-[var(--muted)]">
          Marque o que importa agora. Isso ajuda a IA e filtra a paleta —
          olheiras/manchas só entram se você pedir.
        </p>
        <ul className="space-y-2">
          {ANALYSIS_GOAL_OPTIONS.map((opt) => {
            const checked = goals.includes(opt.id);
            return (
              <li key={opt.id}>
                <label className="flex cursor-pointer items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={checked}
                    onChange={() => toggleGoal(opt.id)}
                  />
                  <span>
                    <span className="font-medium">{opt.label}</span>
                    <span className="mt-0.5 block text-[var(--muted)]">
                      {opt.hint}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div>
        <label className="label" htmlFor="context">
          Contexto da recomendação
        </label>
        <p className="mb-2 text-sm text-[var(--muted)]">
          Isso filtra sugestões de roupa para o dia a dia, trabalho ou noite.
        </p>
        <select id="context" name="context" className="input" defaultValue="casual">
          <option value="casual">Casual</option>
          <option value="trabalho">Trabalho</option>
          <option value="noite">Noite</option>
        </select>
      </div>
      <label className="flex items-start gap-2 text-sm text-[var(--muted)]">
        <input name="biometricConsent" type="checkbox" className="mt-1" required />
        <span>
          Autorizo o uso da foto do meu rosto para colorimetria, simulação e,
          quando necessário, análise por IA de visão (para personalizar o plano
          de traços/pele). As imagens ficam privadas (não são públicas).
        </span>
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Analisando…" : "Analisar foto"}
      </button>
    </form>
  );
}
