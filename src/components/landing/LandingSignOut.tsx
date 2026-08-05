import { signOut } from "@/lib/auth";

export function LandingSignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button type="submit" className="lp-nav-link">
        Sair
      </button>
    </form>
  );
}
