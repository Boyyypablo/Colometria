"use client";

import Image from "next/image";
import { LANDING_IMAGES, LANDING_IMAGE_QUALITY } from "@/lib/landing-images";
import { LandingReveal } from "@/components/LandingReveal";

const steps = [
  {
    title: "Sua foto",
    text: "Quando puder, envie uma selfie com luz suave e natural, de preferência de frente e sem filtros fortes. Assim fica mais fácil cuidar bem das suas cores.",
  },
  {
    title: "Sua cartela",
    text: "Com carinho, indicamos a estação que mais combina com você entre as 12 cartelas — e as cores que ajudam a valorizar o seu contraste.",
  },
  {
    title: "No seu ritmo",
    text: "Depois, use o que fizer sentido para o seu dia: sugestões de roupa, maquiagem e simulação visual, apenas no que você escolher explorar.",
  },
];

export function LandingSteps() {
  return (
    <section id="como" className="shell scroll-mt-24 py-16 md:py-24">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
        <LandingReveal className="relative aspect-square overflow-hidden rounded-[2.5rem]">
          <Image
            src={LANDING_IMAGES.about}
            alt="Pessoa com maquiagem e cabelo volumoso"
            fill
            quality={LANDING_IMAGE_QUALITY}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </LandingReveal>

        <div>
          <LandingReveal
            as="h2"
            className="font-display text-3xl text-[var(--ink)] md:text-4xl"
          >
            Como utilizar
          </LandingReveal>
          <LandingReveal
            as="p"
            delay={0.05}
            className="mt-4 max-w-xl leading-relaxed text-[var(--muted)]"
          >
            É simples e sem pressa. Estamos aqui para acompanhar você na
            descoberta das cores que mais valorizam o seu rosto.
          </LandingReveal>
          <div className="mt-10 grid gap-8">
            {steps.map((step, i) => (
              <LandingReveal key={step.title} delay={0.08 * i}>
                <p className="landing-step-num">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-2xl text-[var(--ink)]">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                  {step.text}
                </p>
              </LandingReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
