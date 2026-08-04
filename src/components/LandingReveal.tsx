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
  as?: "div" | "h1" | "h2" | "h3" | "p";
} & Omit<
  HTMLMotionProps<"div">,
  "children" | "initial" | "animate" | "whileInView" | "viewport"
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
  as = "div",
  ...rest
}: Props) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as ElementType;

  if (reduce) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Tag
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
