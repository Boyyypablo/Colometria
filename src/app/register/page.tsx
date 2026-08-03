"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      lgpdConsent: fd.get("lgpdConsent") === "on",
    };

    if (!payload.lgpdConsent) {
      setError("É necessário aceitar o consentimento LGPD.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, lgpdConsent: true }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Falha no cadastro");
      setLoading(false);
      return;
    }

    const login = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });
    setLoading(false);
    if (login?.error) {
      router.push("/login");
      return;
    }
    router.push("/analyze");
    router.refresh();
  }

  return (
    <main className="shell flex min-h-screen items-center justify-center py-10">
      <div className="card w-full max-w-md space-y-5">
        <div>
          <Link href="/" className="font-display text-2xl">
            Colometria
          </Link>
          <h1 className="mt-3 font-display text-3xl">Criar conta</h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="name">
              Nome
            </label>
            <input id="name" name="name" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="input"
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-[var(--muted)]">
            <input name="lgpdConsent" type="checkbox" className="mt-1" required />
            <span>
              Autorizo o tratamento dos meus dados pessoais e da imagem facial
              para colorimetria, conforme a LGPD. Posso solicitar exclusão
              posteriormente. Dados ficam em PostgreSQL próprio do projeto.
            </span>
          </label>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Criando…" : "Criar conta"}
          </button>
        </form>
      </div>
    </main>
  );
}
