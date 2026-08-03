import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <main>
      <AppHeader />
      <section className="shell grid gap-10 py-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="space-y-5">
          <p className="badge">Produto · imagens primeiro</p>
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Colorimetria pessoal com base científica e simulação visual
          </h1>
          <p className="max-w-xl text-[1.05rem] leading-relaxed text-[var(--muted)]">
            Envie uma foto do rosto, receba sua estação sazonal (12 cartelas),
            recomendações de roupa e maquiagem, e visualize cores na sua imagem.
            Consultora pode revisar e validar o resultado.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={session ? "/analyze" : "/register"}
              className="btn btn-primary"
            >
              {session ? "Começar análise" : "Criar conta e analisar"}
            </Link>
            <Link href="/login" className="btn btn-ghost">
              Já tenho conta
            </Link>
          </div>
        </div>
        <div className="card space-y-4">
          <h2 className="font-display text-xl">Como funciona</h2>
          <ol className="space-y-3 text-sm leading-relaxed text-[var(--muted)]">
            <li>
              <strong className="text-[var(--ink)]">1. Foto neutra</strong> —
              luz natural, sem maquiagem pesada, rosto centralizado.
            </li>
            <li>
              <strong className="text-[var(--ink)]">2. Análise CIELAB</strong> —
              temperatura, valor e croma → uma das 12 estações.
            </li>
            <li>
              <strong className="text-[var(--ink)]">3. Relatório</strong> —
              paleta, usar/evitar, make e combinações por contexto.
            </li>
            <li>
              <strong className="text-[var(--ink)]">4. Simulação</strong> —
              drape de cor ou tom de blusa na sua foto.
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}
