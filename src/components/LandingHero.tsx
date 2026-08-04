"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { LANDING_IMAGES, LANDING_IMAGE_QUALITY } from "@/lib/landing-images";

type Props = {
  loggedIn: boolean;
  showAuthLinks?: boolean;
};

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 * i,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
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
        <motion.p
          className="font-brand landing-hero__brand text-6xl text-white md:text-8xl lg:text-[7.5rem]"
          custom={0}
          variants={fade}
          initial="hidden"
          animate="show"
          aria-label="Colorimetria"
        >
          Colorimetria
        </motion.p>
        <motion.h1
          className="mt-4 max-w-xl text-2xl font-bold leading-tight tracking-tight text-white md:text-4xl"
          custom={1}
          variants={fade}
          initial="hidden"
          animate="show"
        >
          Cores que{" "}
          <span className="landing-accent-word landing-accent-word--on-dark">
            combinam
          </span>{" "}
          com você
        </motion.h1>
        <motion.p
          className="mt-4 max-w-lg text-base leading-relaxed text-white/80 md:text-lg"
          custom={2}
          variants={fade}
          initial="hidden"
          animate="show"
        >
          Colorimetria pessoal com cartela sazonal, recomendações e simulação
          visual — em tons que valorizam o seu contraste.
        </motion.p>
        <motion.div
          className="mt-8 flex flex-wrap gap-3"
          custom={3}
          variants={fade}
          initial="hidden"
          animate="show"
        >
          <Link href={primaryHref} className="btn btn-on-photo">
            {primaryLabel}
          </Link>
          <a href="#paletas" className="btn btn-ghost-on-photo">
            Ver paletas
          </a>
        </motion.div>
      </div>
    </section>
  );
}
