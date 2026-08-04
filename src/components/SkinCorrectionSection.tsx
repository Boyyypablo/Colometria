import type { SkinCorrectionBlock } from "@/lib/color/skin-correction";

const roleLabel: Record<string, string> = {
  corretor: "Corretivo",
  base: "Base",
  iluminador: "Iluminador",
  evitar_local: "Evitar no teste de cores",
  foco_olhar: "Foco no olhar",
};

export function SkinCorrectionSection({
  block,
}: {
  block: SkinCorrectionBlock;
}) {
  return (
    <section className="space-y-4" aria-labelledby="correction-heading">
      <div>
        <h2 id="correction-heading" className="font-display text-2xl">
          Cuidados com a pele
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
          {block.intro}
        </p>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {block.items.map((item) => (
          <li
            key={item.target}
            className="flex gap-3 border-b border-[rgba(28,25,23,0.08)] pb-3 last:border-0 md:border-0 md:pb-0"
          >
            <span
              className="swatch mt-1 shrink-0"
              style={{ background: item.hex }}
              title={item.hex}
            />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium">
                {item.label}
                <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                  {roleLabel[item.role] || item.role}
                </span>
              </p>
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                {item.why}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
