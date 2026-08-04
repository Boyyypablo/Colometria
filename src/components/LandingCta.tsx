"use client";

import Image from "next/image";
import Link from "next/link";
import { LANDING_IMAGES, LANDING_IMAGE_QUALITY } from "@/lib/landing-images";
import { LandingReveal } from "@/components/LandingReveal";

type Props = {
  loggedIn: boolean;
};

export function LandingCta({ loggedIn }: Props) {
  return (
    <section id="comecar" className="shell scroll-mt-24 py-8 md:py-14">
      <div className="relative overflow-hidden rounded-[2.5rem]">
        <div className="absolute inset-0">
          <Image
            src={LANDING_IMAGES.cta}
            alt="Modelos com maquiagem em tons contrastantes"
            fill
            quality={LANDING_IMAGE_QUALITY}
            className="object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[rgba(15,23,42,0.82)] via-[rgba(15,23,42,0.55)] to-[rgba(15,23,42,0.35)]"
            aria-hidden
          />
        </div>
        <LandingReveal className="relative z-10 flex flex-col gap-6 p-8 md:flex-row md:items-end md:justify-between md:p-12 lg:p-16">
          <div>
            <h2 className="max-w-md font-display text-3xl text-white md:text-4xl">
              Pronto para a sua cartela?
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75">
              Uma foto. Sua estação. Cores que fazem sentido em você.
            </p>
          </div>
          <Link href={loggedIn ? "/analyze" : "/register"} className="btn btn-on-photo">
            {loggedIn ? "Nova análise" : "Criar conta"}
          </Link>
        </LandingReveal>
      </div>
    </section>
  );
}
