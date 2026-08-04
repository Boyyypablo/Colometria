"use client";

import { useEffect, useState } from "react";

type Props = {
  analysisId: string;
  colors: string[];
  vtoProvider?: "mock" | "fal" | "gemini" | "huggingface";
  aiReady?: boolean;
};

function sceneLabel(providerJobId?: string | null): string | null {
  if (!providerJobId) return null;
  if (providerJobId.includes("face_closeup")) {
    return "Selfie de rosto → simulação com corpo";
  }
  if (providerJobId.includes("garment_visible")) {
    return "Cor da roupa ajustada";
  }
  return null;
}

export function SimulationPanel({
  analysisId,
  colors,
  vtoProvider = "huggingface",
  aiReady = false,
}: Props) {
  const [hex, setHex] = useState(colors[0] || "#E63946");
  const [type, setType] = useState<"COLOR_DRAPE" | "BLOUSE_TONE">("BLOUSE_TONE");
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [providerJobId, setProviderJobId] = useState<string | null>(null);
  const [outputPath, setOutputPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const usingAi = vtoProvider !== "mock" && aiReady;
  const aiUnavailable = vtoProvider !== "mock" && !aiReady;

  useEffect(() => {
    if (!jobId) return;
    const t = setInterval(async () => {
      const res = await fetch(`/api/simulations?id=${jobId}`);
      const data = await res.json();
      if (!res.ok) return;
      setStatus(data.job.status);
      if (data.job.providerJobId) setProviderJobId(data.job.providerJobId);
      if (data.job.status === "COMPLETED") {
        setOutputPath(data.job.outputPath);
        setLoading(false);
        clearInterval(t);
      }
      if (data.job.status === "FAILED") {
        setError(
          data.job.errorMessage ||
            "Não foi possível concluir a simulação. Tente de novo em instantes.",
        );
        setLoading(false);
        clearInterval(t);
      }
    }, 1500);
    return () => clearInterval(t);
  }, [jobId]);

  async function start() {
    setLoading(true);
    setError(null);
    setOutputPath(null);
    setProviderJobId(null);
    setStatus("QUEUED");
    const res = await fetch("/api/simulations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId, targetColorHex: hex, type }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Não foi possível iniciar a simulação.");
      setLoading(false);
      return;
    }
    setJobId(data.job.id);
  }

  const modeHint = sceneLabel(providerJobId);

  return (
    <div className="card space-y-4">
      <h2 className="font-display text-xl">Simulação visual</h2>
      <p className="text-sm text-[var(--muted)]">
        {usingAi
          ? "Escolha uma cor e veja como fica em você. Se a foto for só o rosto, montamos um meio-corpo; se houver roupa, trocamos o tom."
          : aiUnavailable
            ? "Simulação com IA indisponível no momento. Tente mais tarde ou use outra análise."
            : "Prévia local da cor na sua foto."}
      </p>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            aria-label={`Usar cor ${c}`}
            onClick={() => setHex(c)}
            className="swatch"
            style={{
              background: c,
              outline: hex === c ? "2px solid var(--accent)" : undefined,
              outlineOffset: 2,
            }}
          />
        ))}
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-3">
          <select
            className="input max-w-xs"
            value={type}
            aria-label="Modo de simulação"
            onChange={(e) =>
              setType(e.target.value as "COLOR_DRAPE" | "BLOUSE_TONE")
            }
          >
            <option value="BLOUSE_TONE">Tom da blusa (detecção automática)</option>
            <option value="COLOR_DRAPE">Teste de cor (tecido no peito)</option>
          </select>
          <input
            className="input max-w-[9rem]"
            value={hex}
            aria-label="Cor em hexadecimal"
            onChange={(e) => setHex(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={start}
            disabled={loading || aiUnavailable}
          >
            {loading
              ? "Gerando…"
              : usingAi
                ? "Gerar simulação"
                : "Ver esta cor em mim"}
          </button>
        </div>
        <p className="text-xs text-[var(--muted)]">
          Blusa = recolorir a peça. Teste de cor = tecido sob o queixo.
        </p>
      </div>
      {status && loading && (
        <p className="text-sm text-[var(--muted)]">Status: processando…</p>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
      {outputPath && (
        <div className="space-y-2">
          {modeHint && (
            <p className="text-xs text-[var(--muted)]">{modeHint}</p>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/uploads/${outputPath}`}
            alt="Simulação"
            className="max-h-[420px] rounded-xl border border-[var(--line)] object-contain"
          />
        </div>
      )}
    </div>
  );
}
