"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { LANDING_IMAGES, LANDING_IMAGE_QUALITY } from "@/lib/landing-images";

const ALTS = [
  "Retrato minimalista com luz suave",
  "Rosto em close com expressão calma",
  "Beleza natural em fundo limpo",
  "Retrato suave com contraste leve",
] as const;

export function LandingLooks() {
  return (
    <section id="looks" className="shell scroll-mt-24 py-12 md:py-20">
      <motion.h2
        className="text-center font-display text-3xl md:text-4xl"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45 }}
      >
        Looks e cores no rosto
      </motion.h2>
      <motion.p
        className="mx-auto mt-3 max-w-lg text-center text-[var(--muted)]"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        Referências leves de contraste e pele — inspiração simples para a sua
        análise.
      </motion.p>

      <div className="landing-gallery landing-gallery--minimal mt-10">
        {LANDING_IMAGES.gallery.map((src, i) => (
          <motion.div
            key={src}
            className="landing-gallery__item"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.24) }}
          >
            <Image
              src={src}
              alt={ALTS[i] ?? "Retrato minimalista"}
              fill
              quality={LANDING_IMAGE_QUALITY}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
