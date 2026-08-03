"use client";

import { useEffect, useState } from "react";

type Props = {
  analysisId: string;
  colors: string[];
};

export function SimulationPanel({ analysisId, colors }: Props) {
  const [hex, setHex] = useState(colors[0] || "#E63946");
  const [type, setType] = useState<"COLOR_DRAPE" | "BLOUSE_TONE">("COLOR_DRAPE");
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [outputPath, setOutputPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    const t = setInterval(async () => {
      const res = await fetch(`/api/simulations?id=${jobId}`);
      const data = await res.json();
      if (!res.ok) return;
      setStatus(data.job.status);
      if (data.job.status === "COMPLETED") {
        setOutputPath(data.job.outputPath);
        setLoading(false);
        clearInterval(t);
      }
      if (data.job.status === "FAILED") {
        setError(data.job.errorMessage || "Falha na simulação");
        setLoading(false);
        clearInterval(t);
      }
    }, 1200);
    return () => clearInterval(t);
  }, [jobId]);

  async function start() {
    setLoading(true);
    setError(null);
    setOutputPath(null);
    setStatus("QUEUED");
    const res = await fetch("/api/simulations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId, targetColorHex: hex, type }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro");
      setLoading(false);
      return;
    }
    setJobId(data.job.id);
  }

  return (
    <div className="card space-y-4">
      <h2 className="font-display text-xl">Simulação visual</h2>
      <p className="text-sm text-[var(--muted)]">
        Visualize um drape de cor sob o queixo ou um tom de blusa na sua foto.
      </p>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
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
      <div className="flex flex-wrap gap-3">
        <select
          className="input max-w-xs"
          value={type}
          onChange={(e) =>
            setType(e.target.value as "COLOR_DRAPE" | "BLOUSE_TONE")
          }
        >
          <option value="COLOR_DRAPE">Drape de cor</option>
          <option value="BLOUSE_TONE">Tom de blusa</option>
        </select>
        <input
          className="input max-w-[9rem]"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={start}
          disabled={loading}
        >
          {loading ? `Gerando… (${status})` : "Ver esta cor em mim"}
        </button>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {outputPath && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/uploads/${outputPath}`}
          alt="Simulação"
          className="max-h-[420px] rounded-xl border border-[var(--line)] object-contain"
        />
      )}
    </div>
  );
}
