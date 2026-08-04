"use client";

import Image from "next/image";
import { LANDING_IMAGES, LANDING_IMAGE_QUALITY } from "@/lib/landing-images";
import { LandingReveal } from "@/components/LandingReveal";

const ALTS = [
  "Retrato minimalista com luz suave",
  "Rosto em close com expressão calma",
  "Beleza natural em fundo limpo",
  "Retrato suave com contraste leve",
] as const;

export function LandingLooks() {
  return (
    <section id="looks" className="shell scroll-mt-24 py-12 md:py-20">
      <LandingReveal
        as="h2"
        className="text-center font-display text-3xl md:text-4xl"
      >
        Looks e cores no rosto
      </LandingReveal>
      <LandingReveal
        as="p"
        delay={0.05}
        className="mx-auto mt-3 max-w-lg text-center text-[var(--muted)]"
      >
        Referências leves de contraste e pele — inspiração simples para a sua
        análise.
      </LandingReveal>

      <div className="landing-gallery landing-gallery--minimal mt-10">
        {LANDING_IMAGES.gallery.map((src, i) => (
          <LandingReveal
            key={src}
            className="landing-gallery__item"
            delay={Math.min(i * 0.06, 0.24)}
          >
            <Image
              src={src}
              alt={ALTS[i] ?? "Retrato minimalista"}
              fill
              quality={LANDING_IMAGE_QUALITY}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </LandingReveal>
        ))}
      </div>
    </section>
  );
}
