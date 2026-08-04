import type { NextAuthConfig } from "next-auth";

/** Papéis sem importar @prisma/client (mantém o Edge bundle leve). */
export type AppRole = "USER" | "CONSULTANT" | "ADMIN";

/**
 * Config Edge-compatible para middleware.
 * Não importa Prisma, bcrypt nem Credentials — evita estourar o limite de 1 MB.
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role?: AppRole }).role ?? "USER";
        token.roleCheckedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = (token.role as AppRole) ?? "USER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
