"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AnalyzeForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set(
      "biometricConsent",
      fd.get("biometricConsent") === "on" ? "true" : "false",
    );

    const res = await fetch("/api/analyses", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Falha na análise");
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
      <div>
        <label className="label" htmlFor="context">
          Contexto da recomendação
        </label>
        <select id="context" name="context" className="input" defaultValue="casual">
          <option value="casual">Casual</option>
          <option value="trabalho">Trabalho</option>
          <option value="noite">Noite</option>
        </select>
      </div>
      <label className="flex items-start gap-2 text-sm text-[var(--muted)]">
        <input name="biometricConsent" type="checkbox" className="mt-1" required />
        <span>
          Consentimento biométrico: autorizo o processamento da imagem do meu
          rosto apenas para colorimetria e simulação neste serviço. Imagens
          ficam em armazenamento privado do servidor (não público).
        </span>
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Analisando…" : "Analisar coloração"}
      </button>
    </form>
  );
}
