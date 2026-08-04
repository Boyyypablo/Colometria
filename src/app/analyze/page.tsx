import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { AnalyzeForm } from "@/components/AnalyzeForm";
import { auth } from "@/lib/auth";

export default async function AnalyzePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main>
      <AppHeader />
      <section className="shell max-w-2xl space-y-6 py-8">
        <div>
          <h1 className="font-display text-3xl">Nova análise</h1>
          <p className="mt-2 text-[var(--muted)]">
            Envie uma selfie com boa luz e escolha o que quer otimizar. A análise
            usa pele, cabelo e contraste para sugerir cores que fazem sentido
            para você.
          </p>
        </div>
        <AnalyzeForm />
      </section>
    </main>
  );
}
