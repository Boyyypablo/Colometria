import { LandingHome } from "@/components/landing/LandingHome";
import { LandingSignOut } from "@/components/landing/LandingSignOut";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  const loggedIn = Boolean(session?.user);

  return (
    <main>
      <LandingHome
        loggedIn={loggedIn}
        signOutSlot={loggedIn ? <LandingSignOut /> : undefined}
      />
    </main>
  );
}
