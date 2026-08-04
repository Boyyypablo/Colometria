"use client";

import Image from "next/image";
import { LANDING_IMAGES, LANDING_IMAGE_QUALITY } from "@/lib/landing-images";
import { LandingReveal } from "@/components/LandingReveal";

const services = [
  "Análise de estação (12 cartelas)",
  "Cores de roupa e maquiagem",
  "Simulação visual na sua foto",
  "Revisão opcional por consultora",
];

export function LandingServices() {
  return (
    <section className="shell py-8 md:py-12">
      <div className="relative overflow-hidden rounded-[2.5rem]">
        <div className="absolute inset-0">
          <Image
            src={LANDING_IMAGES.services}
            alt="Close-up de maquiagem artística com cores vibrantes"
            fill
            quality={LANDING_IMAGE_QUALITY}
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[rgba(15,23,42,0.45)]" aria-hidden />
        </div>
        <div className="relative z-10 p-6 md:p-10 lg:p-12">
          <LandingReveal className="grid max-w-4xl gap-6 rounded-[2rem] bg-white/95 p-6 shadow-xl backdrop-blur-sm md:grid-cols-[1.2fr_0.8fr] md:p-8">
            <div>
              <h2 className="font-display text-3xl text-[var(--ink)]">
                Na prática
              </h2>
              <ul className="mt-5 space-y-3 text-sm text-[var(--muted)]">
                {services.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-[1.5rem] md:aspect-auto md:min-h-[220px]">
              <Image
                src={LANDING_IMAGES.servicesInset}
                alt="Maquiagem colorida em close"
                fill
                quality={LANDING_IMAGE_QUALITY}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 30vw"
              />
            </div>
          </LandingReveal>
        </div>
      </div>
    </section>
  );
}
