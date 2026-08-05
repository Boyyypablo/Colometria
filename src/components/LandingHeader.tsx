import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export async function LandingHeader() {
  const session = await auth();
  const loggedIn = Boolean(session?.user);
  const primaryHref = loggedIn ? "/analyze" : "/register";
  const primaryLabel = loggedIn ? "Nova análise" : "Começar agora";

  return (
    <header className="landing-header-float">
      <div className="shell">
        <nav className="landing-nav-capsule" aria-label="Principal">
          <Link href="/" className="font-brand landing-nav-brand">
            Colorimetria
          </Link>
          <div className="landing-nav-links hidden flex-wrap items-center justify-center gap-1 text-sm sm:flex md:gap-2">
            <a href="#como" className="landing-nav-link">
              Como funciona
            </a>
            <a href="#looks" className="landing-nav-link">
              Looks
            </a>
            <a href="#paletas" className="landing-nav-link">
              Paletas
            </a>
            <a href="#perguntas" className="landing-nav-link">
              Perguntas
            </a>
            <a href="#comecar" className="landing-nav-link">
              Começar
            </a>
            {loggedIn && (
              <Link href="/dashboard" className="landing-nav-link">
                Minhas análises
              </Link>
            )}
          </div>
          <div className="landing-nav-actions">
            {loggedIn ? (
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="btn btn-ghost-on-photo text-sm">
                  Sair
                </button>
              </form>
            ) : (
              <Link href="/login" className="btn btn-ghost-on-photo text-sm">
                Entrar
              </Link>
            )}
            <Link href={primaryHref} className="btn btn-on-photo text-sm">
              {primaryLabel}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
