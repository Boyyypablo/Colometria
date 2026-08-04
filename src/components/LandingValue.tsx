"use client";

import { motion } from "motion/react";

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
      <motion.h2
        className="font-display text-3xl md:text-4xl"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45 }}
      >
        Feito para colorimetria pessoal
      </motion.h2>
      <motion.p
        className="mt-3 max-w-xl text-[var(--muted)]"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        Do upload à cartela: clareza no relatório, sem ruído técnico.
      </motion.p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {blocks.map((block, i) => (
          <motion.div
            key={block.title}
            className={`landing-panel ${block.tone}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.06 * i }}
          >
            <h3 className="font-display text-2xl">{block.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {block.text}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
