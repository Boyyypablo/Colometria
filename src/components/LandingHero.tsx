"use client";

import Image from "next/image";
import Link from "next/link";
import { LANDING_IMAGES, LANDING_IMAGE_QUALITY } from "@/lib/landing-images";

type Props = {
  loggedIn: boolean;
  showAuthLinks?: boolean;
};

export function LandingHero({ loggedIn }: Props) {
  const primaryHref = loggedIn ? "/analyze" : "/register";
  const primaryLabel = loggedIn ? "Nova análise" : "Começar agora";

  return (
    <section className="landing-hero landing-hero--photo">
      <Image
        src={LANDING_IMAGES.hero}
        alt="Perfis com maquiagem colorida — colorimetria no rosto"
        fill
        priority
        quality={LANDING_IMAGE_QUALITY}
        className="landing-hero__photo"
        sizes="100vw"
      />
      <div className="landing-hero__veil" aria-hidden />

      <div className="shell relative z-10 flex min-h-[min(92vh,860px)] flex-col justify-end pb-28 pt-28 md:justify-center md:pb-36 md:pt-24">
        <p
          className="font-brand landing-hero__brand landing-hero-anim landing-hero-anim--0 text-6xl text-white md:text-8xl lg:text-[7.5rem]"
          aria-label="Colorimetria"
        >
          Colorimetria
        </p>
        <h1 className="landing-hero-anim landing-hero-anim--1 mt-4 max-w-xl text-2xl font-bold leading-tight tracking-tight text-white md:text-4xl">
          Cores que{" "}
          <span className="landing-accent-word landing-accent-word--on-dark">
            combinam
          </span>{" "}
          com você
        </h1>
        <p className="landing-hero-anim landing-hero-anim--2 mt-4 max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
          Colorimetria pessoal com cartela sazonal, recomendações e simulação
          visual — em tons que valorizam o seu contraste.
        </p>
        <div className="landing-hero-anim landing-hero-anim--3 mt-8 flex flex-wrap gap-3">
          <Link href={primaryHref} className="btn btn-on-photo">
            {primaryLabel}
          </Link>
          <a href="#paletas" className="btn btn-ghost-on-photo">
            Ver paletas
          </a>
        </div>
      </div>
    </section>
  );
}
