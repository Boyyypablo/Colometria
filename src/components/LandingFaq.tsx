"use client";

import { useId, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { LandingReveal } from "@/components/LandingReveal";

const FAQ_ITEMS = [
  {
    question: "Como funciona a análise de colorimetria?",
    answer:
      "Você envia uma foto do rosto (luz natural, sem maquiagem pesada), conta o que quer trabalhar e o sistema mede subtom e contraste para indicar a estação entre as 12 cartelas — com um plano personalizado de cores e mudanças.",
  },
  {
    question: "Minha foto fica pública?",
    answer:
      "Não. A imagem fica privada no serviço, com consentimento explícito no upload, e é usada só para colorimetria, simulação e personalização do plano. O tratamento segue a LGPD.",
  },
  {
    question: "Preciso de maquiagem ou consultora presencial?",
    answer:
      "Não para começar. A análise digital entrega cartela e orientações. Se quiser validar, você pode pedir revisão de uma consultora no próprio relatório.",
  },
  {
    question: "O que é o plano personalizado?",
    answer:
      "Além da estação, a consultora interpreta sua intenção (ex.: valorizar o olhar, suavizar olheiras) e sugere o que suavizar, exaltar ou manter — com cores e ações concretas, sem checklist genérico.",
  },
  {
    question: "Posso simular as cores na minha foto?",
    answer:
      "Sim. Depois do resultado, você escolhe tons da paleta e vê uma simulação visual aplicada na imagem enviada, para testar looks antes de comprar.",
  },
  {
    question: "E se o resultado não parecer certo?",
    answer:
      "Use o feedback “Ajudou / Não ajudou” em cada sugestão e, se quiser, solicite revisão humana. Foto com luz ruim ou filtros pode reduzir a certeza — o relatório avisa quando isso acontece.",
  },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

function PlusMinusIcon({ open }: { open: boolean }) {
  return (
    <span className="landing-faq__icon" aria-hidden>
      <span className="landing-faq__icon-bar landing-faq__icon-bar--h" />
      <motion.span
        className="landing-faq__icon-bar landing-faq__icon-bar--v"
        initial={false}
        animate={{
          rotate: open ? 90 : 0,
          scaleY: open ? 0 : 1,
          opacity: open ? 0 : 1,
        }}
        transition={{ duration: 0.28, ease: EASE }}
      />
    </span>
  );
}

function FaqItem({
  item,
  index,
  open,
  onToggle,
  baseId,
}: {
  item: (typeof FAQ_ITEMS)[number];
  index: number;
  open: boolean;
  onToggle: () => void;
  baseId: string;
}) {
  const reduce = useReducedMotion();
  const buttonId = `${baseId}-q-${index}`;
  const panelId = `${baseId}-a-${index}`;

  return (
    <motion.div
      className="landing-faq__row"
      initial={reduce ? false : { y: 12 }}
      whileInView={reduce ? undefined : { y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: EASE }}
    >
      <button
        type="button"
        id={buttonId}
        className="landing-faq__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="landing-faq__question">{item.question}</span>
        <PlusMinusIcon open={open} />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            className="landing-faq__panel"
            initial={
              reduce
                ? false
                : { height: 0, opacity: 0 }
            }
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.35, ease: EASE },
              opacity: { duration: 0.22, ease: EASE },
            }}
          >
            <div className="landing-faq__answer">{item.answer}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function LandingFaq() {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="perguntas" className="shell scroll-mt-24 py-12 md:py-20">
      <LandingReveal as="h2" className="font-display text-3xl md:text-4xl">
        Perguntas frequentes
      </LandingReveal>
      <LandingReveal
        as="p"
        delay={0.05}
        className="mt-3 max-w-xl text-[var(--muted)]"
      >
        Respostas diretas sobre foto, privacidade, cartela e o que acontece
        depois da análise.
      </LandingReveal>

      <div className="landing-faq mt-10">
        {FAQ_ITEMS.map((item, index) => (
          <FaqItem
            key={item.question}
            item={item}
            index={index}
            baseId={baseId}
            open={openIndex === index}
            onToggle={() =>
              setOpenIndex((prev) => (prev === index ? null : index))
            }
          />
        ))}
      </div>
    </section>
  );
}
