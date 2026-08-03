import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

const statusLabel: Record<string, string> = {
  PENDING: "Processando",
  READY: "Pronto",
  NEEDS_REVIEW: "Aguarda consultora",
  APPROVED: "Aprovado pela consultora",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const analyses = await prisma.analysis.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { season: true, overrideSeason: true },
  });

  return (
    <main>
      <AppHeader />
      <section className="shell space-y-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl">Minhas análises</h1>
            <p className="mt-1 text-[var(--muted)]">
              Olá, {session.user.name || session.user.email}
            </p>
          </div>
          <Link href="/analyze" className="btn btn-primary">
            Nova análise
          </Link>
        </div>

        {analyses.length === 0 ? (
          <div className="card text-[var(--muted)]">
            Nenhuma análise ainda.{" "}
            <Link href="/analyze" className="underline">
              Envie sua primeira foto
            </Link>
            .
          </div>
        ) : (
          <ul className="grid gap-3">
            {analyses.map((a) => {
              const season = a.overrideSeason || a.season;
              return (
                <li key={a.id}>
                  <Link
                    href={`/analyses/${a.id}`}
                    className="card flex items-center justify-between gap-4 transition hover:border-[var(--accent)]"
                  >
                    <div>
                      <p className="font-medium">
                        {season?.namePt || "Em processamento"}
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        {new Date(a.createdAt).toLocaleString("pt-BR")} ·{" "}
                        {statusLabel[a.status] || a.status}
                        {a.consultantApproved ? " · selo consultora" : ""}
                      </p>
                    </div>
                    <span className="badge">{a.context}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
