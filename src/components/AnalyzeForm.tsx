"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import {
  ANALYSIS_GOAL_OPTIONS,
  DEFAULT_ANALYSIS_GOALS,
  type AnalysisGoalId,
} from "@/lib/color/goals";
import { PHOTO_QUALITY_TIPS } from "@/lib/color/photo-tips";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

export function AnalyzeForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<AnalysisGoalId[]>([
    ...DEFAULT_ANALYSIS_GOALS,
  ]);
  const [intention, setIntention] = useState("");
  const [tipsOk, setTipsOk] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [biometricConsent, setBiometricConsent] = useState(false);

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
      setTipsOpen(true);
      return;
    }
    if (!biometricConsent) {
      setError("Confirme o consentimento para processar a foto.");
      return;
    }
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("biometricConsent", "true");
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
      <div className="space-y-3">
        <Popover open={tipsOpen} onOpenChange={setTipsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-auto w-full justify-start gap-3 border-[color-mix(in_srgb,var(--warn)_50%,transparent)] bg-[color-mix(in_srgb,var(--warn)_12%,#fffdf9)] px-3 py-3 text-left whitespace-normal text-[var(--ink)] shadow-[inset_4px_0_0_0_var(--warn)] hover:bg-[color-mix(in_srgb,var(--warn)_18%,#fffdf9)] hover:text-[var(--ink)]"
            >
              <TriangleAlert
                className="size-5 shrink-0 text-[var(--warn)]"
                aria-hidden
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-display text-base text-[var(--warn)]">
                  Atenção — checklist da foto
                </span>
                <span className="text-sm font-normal text-[var(--muted)]">
                  {tipsOk
                    ? "Condições confirmadas. Toque para revisar."
                    : "Leia antes de enviar a foto — obrigatório para analisar."}
                </span>
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="bottom"
            sideOffset={8}
            className="w-[min(100vw-2rem,22rem)] gap-3 border-[color-mix(in_srgb,var(--warn)_35%,transparent)] bg-[#fffdf9] p-3.5 text-[var(--ink)]"
          >
            <PopoverHeader>
              <PopoverTitle className="font-display text-base text-[var(--warn)]">
                Boa foto = cores que fazem sentido
              </PopoverTitle>
              <PopoverDescription className="text-[var(--muted)]">
                Confira estes pontos antes de analisar.
              </PopoverDescription>
            </PopoverHeader>
            <ul className="space-y-2 text-sm leading-snug">
              {PHOTO_QUALITY_TIPS.map((tip) => (
                <li key={tip.id} className="flex gap-2">
                  <span aria-hidden className="font-bold text-[var(--warn)]">
                    !
                  </span>
                  <span>{tip.label}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-start gap-2 rounded-lg border border-[color-mix(in_srgb,var(--warn)_30%,transparent)] bg-[color-mix(in_srgb,var(--warn)_8%,white)] p-3">
              <Checkbox
                id="tipsOk"
                checked={tipsOk}
                onCheckedChange={(v) => {
                  const ok = v === true;
                  setTipsOk(ok);
                  if (ok) setTipsOpen(false);
                }}
                className="mt-0.5 border-[var(--warn)] data-checked:border-[var(--warn)] data-checked:bg-[var(--warn)]"
                required
              />
              <Label
                htmlFor="tipsOk"
                className="text-sm font-medium leading-snug text-[var(--ink)]"
              >
                Confirmei que a foto segue essas condições.
              </Label>
            </div>
          </PopoverContent>
        </Popover>

        <div>
          <Label htmlFor="image" className="label mb-2">
            Foto do rosto (luz natural, sem maquiagem pesada)
          </Label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            required
            className="input"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="intention" className="label mb-2">
          O que você quer trabalhar?
        </Label>
        <p className="mb-2 text-sm text-[var(--muted)]">
          A consultora usa isso para decidir o que suavizar, exaltar ou
          manter — não é um checklist fixo.
        </p>
        <Textarea
          id="intention"
          name="intention"
          className="min-h-24 bg-[#fffdf9]"
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
          Marque o que importa agora. Isso ajuda a consultora e filtra a
          paleta — olheiras/manchas só entram se você pedir.
        </p>
        <ul className="space-y-3">
          {ANALYSIS_GOAL_OPTIONS.map((opt) => {
            const checked = goals.includes(opt.id);
            const id = `goal-${opt.id}`;
            return (
              <li key={opt.id} className="flex items-start gap-3">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={() => toggleGoal(opt.id)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor={id}
                  className="block cursor-pointer items-start font-normal leading-snug"
                >
                  <span className="font-medium text-[var(--ink)]">
                    {opt.label}
                  </span>
                  <span className="mt-0.5 block text-sm font-normal text-[var(--muted)]">
                    {opt.hint}
                  </span>
                </Label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div>
        <Label htmlFor="context" className="label mb-2">
          Contexto da recomendação
        </Label>
        <p className="mb-2 text-sm text-[var(--muted)]">
          Isso filtra sugestões de roupa para o dia a dia, trabalho ou noite.
        </p>
        <select id="context" name="context" className="input" defaultValue="casual">
          <option value="casual">Casual</option>
          <option value="trabalho">Trabalho</option>
          <option value="noite">Noite</option>
        </select>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id="biometricConsent"
          checked={biometricConsent}
          onCheckedChange={(v) => setBiometricConsent(v === true)}
          className="mt-0.5"
          required
        />
        <Label
          htmlFor="biometricConsent"
          className="text-sm font-normal leading-snug text-[var(--muted)]"
        >
          Autorizo o uso da foto do meu rosto para colorimetria, simulação e
          personalização do plano de traços/pele neste serviço. As imagens
          ficam privadas (não são públicas).
        </Label>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Analisando…" : "Analisar foto"}
      </button>
    </form>
  );
}
