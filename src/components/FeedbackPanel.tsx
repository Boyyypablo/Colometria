"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export type FeedbackVote = {
  target: string;
  kind: "HELPED" | "DID_NOT_HELP";
};

type RecItem = { hex: string; label: string };
type CorrectionItem = { hex: string; label: string; target: string };

type Props = {
  analysisId: string;
  seasonName: string;
  clothing: RecItem[];
  lipstick: RecItem[];
  eyeshadow: RecItem[];
  base: RecItem[];
  corrections?: CorrectionItem[];
  initialVotes: FeedbackVote[];
};

function voteMap(votes: FeedbackVote[]): Record<string, FeedbackVote["kind"]> {
  const map: Record<string, FeedbackVote["kind"]> = {};
  for (const v of votes) map[v.target] = v.kind;
  return map;
}

function VoteButtons({
  target,
  label,
  hex,
  current,
  busy,
  onVote,
}: {
  target: string;
  label: string;
  hex?: string;
  current?: FeedbackVote["kind"];
  busy: boolean;
  onVote: (target: string, kind: FeedbackVote["kind"]) => void;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(28,25,23,0.08)] py-2 last:border-0">
      <span className="flex items-center gap-2 text-sm">
        {hex ? <span className="swatch" style={{ background: hex }} /> : null}
        {label}
      </span>
      <span className="flex gap-1">
        <button
          type="button"
          className={`btn btn-ghost px-2 py-1 text-xs ${
            current === "HELPED" ? "ring-1 ring-[var(--ok)]" : ""
          }`}
          disabled={busy}
          aria-pressed={current === "HELPED"}
          onClick={() => onVote(target, "HELPED")}
        >
          Ajudou
        </button>
        <button
          type="button"
          className={`btn btn-ghost px-2 py-1 text-xs ${
            current === "DID_NOT_HELP" ? "ring-1 ring-[var(--warn)]" : ""
          }`}
          disabled={busy}
          aria-pressed={current === "DID_NOT_HELP"}
          onClick={() => onVote(target, "DID_NOT_HELP")}
        >
          Não ajudou
        </button>
      </span>
    </li>
  );
}

export function FeedbackPanel({
  analysisId,
  seasonName,
  clothing,
  lipstick,
  eyeshadow,
  base,
  corrections = [],
  initialVotes,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [votes, setVotes] = useState(() => voteMap(initialVotes));
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busyTarget, setBusyTarget] = useState<string | null>(null);

  async function onVote(target: string, kind: FeedbackVote["kind"]) {
    setError(null);
    setBusyTarget(target);
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analysisId,
        kind,
        target,
        note: note.trim() || undefined,
      }),
    });
    setBusyTarget(null);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "Não foi possível salvar o feedback.");
      return;
    }
    setVotes((prev) => ({ ...prev, [target]: kind }));
    startTransition(() => router.refresh());
  }

  const groups: Array<{ title: string; prefix: string; items: RecItem[] }> = [
    { title: "Roupas", prefix: "clothing", items: clothing },
    { title: "Batons", prefix: "lipstick", items: lipstick },
    { title: "Sombras", prefix: "eyeshadow", items: eyeshadow },
    { title: "Base", prefix: "base", items: base },
  ];

  return (
    <section className="space-y-4" aria-labelledby="feedback-heading">
      <div>
        <h2 id="feedback-heading" className="font-display text-2xl">
          Isso ajudou você?
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          Seu feedback calibra recomendações futuras — o que combina com você, não só a estação.
        </p>
      </div>

      <ul className="space-y-0">
        <VoteButtons
          target="season"
          label={`Estação: ${seasonName}`}
          current={votes.season}
          busy={pending || busyTarget === "season"}
          onVote={onVote}
        />
      </ul>

      {groups.map((group) =>
        group.items.length === 0 ? null : (
          <div key={group.title} className="space-y-1">
            <h3 className="text-sm font-semibold">{group.title}</h3>
            <ul>
              {group.items.map((item) => {
                const target = `${group.prefix}:${item.hex}`;
                return (
                  <VoteButtons
                    key={target}
                    target={target}
                    label={item.label}
                    hex={item.hex}
                    current={votes[target]}
                    busy={pending || busyTarget === target}
                    onVote={onVote}
                  />
                );
              })}
            </ul>
          </div>
        ),
      )}

      {corrections.length > 0 ? (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Cuidados com a pele</h3>
          <ul>
            {corrections.map((item) => (
              <VoteButtons
                key={item.target}
                target={item.target}
                label={item.label}
                hex={item.hex}
                current={votes[item.target]}
                busy={pending || busyTarget === item.target}
                onVote={onVote}
              />
            ))}
          </ul>
        </div>
      ) : null}

      <label className="block space-y-1 text-sm">
        <span className="text-[var(--muted)]">
          Comentário opcional (enviado com o próximo voto)
        </span>
        <input
          className="input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={1000}
          placeholder="Ex.: o coral ficou ótimo no dia a dia"
        />
        <span className="text-xs text-[var(--muted)]">
          Será enviado junto com o próximo “Ajudou” ou “Não ajudou”.
        </span>
      </label>

      {error ? <p className="text-sm text-[var(--warn)]">{error}</p> : null}
    </section>
  );
}
