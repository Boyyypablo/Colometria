"use client";

type Props = {
  items: Array<{ href: string; label: string }>;
};

export function AnalysisNav({ items }: Props) {
  if (items.length === 0) return null;
  return (
    <nav className="analysis-nav" aria-label="Seções do resultado">
      {items.map((item) => (
        <a key={item.href} href={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
