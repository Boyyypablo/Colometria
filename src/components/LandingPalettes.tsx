"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { SEASON_PALETTES } from "../../data/palettes/seasons";

type Props = {
  loggedIn: boolean;
};

export function LandingPalettes({ loggedIn }: Props) {
  const href = loggedIn ? "/analyze" : "/register";

  return (
    <section id="paletas" className="shell scroll-mt-24 py-8 md:py-12">
      <div className="landing-panel landing-panel--navy">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-[#7EB8DA] uppercase">
              12 estações
            </p>
            <h2 className="mt-2 font-display text-3xl text-white md:text-4xl">
              Paletas de colorimetria
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
              Exemplos das cartelas quentes e frias. Na análise, descobrimos
              qual combina com o seu contraste.
            </p>
          </div>
          <Link href={href} className="btn btn-primary shrink-0">
            Descobrir a minha
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SEASON_PALETTES.map((season, i) => (
            <motion.div
              key={season.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.32) }}
            >
              <Link href={href} className="landing-palette-card h-full">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold leading-snug text-white">
                    {season.namePt}
                  </h3>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white/80 uppercase">
                    {season.temperature === "cool" ? "Fria" : "Quente"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {season.useColors.slice(0, 6).map((hex) => (
                    <span
                      key={`${season.id}-${hex}`}
                      className="swatch"
                      style={{ background: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
