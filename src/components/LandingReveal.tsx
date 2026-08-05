"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import type { ElementType, ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
  as?: "div" | "h1" | "h2" | "h3" | "p" | "section";
} & Omit<
  HTMLMotionProps<"div">,
  "children" | "initial" | "animate" | "whileInView" | "viewport" | "id"
>;

/**
 * Reveal ao scroll: só desloca no Y.
 * Mantém opacity:1 o tempo todo — evita texto invisível se o
 * IntersectionObserver falhar (túnel Cloudflare, etc.).
 */
export function LandingReveal({
  children,
  className,
  delay = 0,
  id,
  as = "div",
  ...rest
}: Props) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as ElementType;

  if (reduce) {
    const Static = as;
    return (
      <Static id={id} className={className}>
        {children}
      </Static>
    );
  }

  return (
    <Tag
      id={id}
      className={className}
      initial={{ y: 14 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
