"use client";

import { LandingReveal } from "@/components/LandingReveal";

const blocks = [
  {
    title: "12 estações",
    text: "Cartelas quentes e frias para achar a harmonia do seu contraste.",
    tone: "landing-panel--ice" as const,
  },
  {
    title: "Simulação visual",
    text: "Veja cores de roupa e teste de tecido aplicadas na sua foto.",
    tone: "landing-panel--rose" as const,
  },
  {
    title: "Consultora",
    text: "Opção de revisão humana quando quiser validar o resultado.",
    tone: "landing-panel--teal" as const,
  },
  {
    title: "LGPD",
    text: "Foto e dados tratados com consentimento, em servidor próprio.",
    tone: "landing-panel--ice" as const,
  },
];

export function LandingValue() {
  return (
    <section className="shell py-12 md:py-20">
      <LandingReveal as="h2" className="font-display text-3xl md:text-4xl">
        Feito para colorimetria pessoal
      </LandingReveal>
      <LandingReveal
        as="p"
        delay={0.05}
        className="mt-3 max-w-xl text-[var(--muted)]"
      >
        Do upload à cartela: clareza no relatório, sem ruído técnico.
      </LandingReveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {blocks.map((block, i) => (
          <LandingReveal
            key={block.title}
            className={`landing-panel ${block.tone}`}
            delay={0.06 * i}
          >
            <h3 className="font-display text-2xl">{block.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {block.text}
            </p>
          </LandingReveal>
        ))}
      </div>
    </section>
  );
}
