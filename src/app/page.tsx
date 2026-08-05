import { LandingHeader } from "@/components/LandingHeader";
import { LandingHero } from "@/components/LandingHero";
import { LandingSteps } from "@/components/LandingSteps";
import { LandingServices } from "@/components/LandingServices";
import { LandingLooks } from "@/components/LandingLooks";
import { LandingPalettes } from "@/components/LandingPalettes";
import { LandingValue } from "@/components/LandingValue";
import { LandingFaq } from "@/components/LandingFaq";
import { LandingCta } from "@/components/LandingCta";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  const loggedIn = Boolean(session?.user);

  return (
    <main className="landing">
      <LandingHeader />
      <LandingHero loggedIn={loggedIn} />
      <LandingSteps />
      <LandingServices />
      <LandingLooks />
      <LandingPalettes loggedIn={loggedIn} />
      <LandingValue />
      <LandingFaq />
      <LandingCta loggedIn={loggedIn} />
      <footer className="shell py-10 text-sm text-[var(--muted)]">
        <p className="font-brand text-2xl text-[var(--ink)]">Colorimetria</p>
        <p className="mt-1 text-xs">
          Colorimetria pessoal. Dados tratados conforme a LGPD.
        </p>
      </footer>
    </main>
  );
}
