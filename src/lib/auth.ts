import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import type { Role } from "@prisma/client";
import { clientIp, rateLimit } from "@/lib/rate-limit";

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: Role;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    roleCheckedAt?: number;
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(raw, request) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const ip = request ? clientIp(request) : "unknown";
        const email = parsed.data.email.toLowerCase();
        const rlIp = rateLimit(`login:ip:${ip}`, 30, 15 * 60 * 1000);
        const rlEmail = rateLimit(`login:email:${email}`, 10, 15 * 60 * 1000);
        if (!rlIp.ok || !rlEmail.ok) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.roleCheckedAt = Date.now();
        return token;
      }
      // Revalida role periodicamente (demote/ban)
      const checkedAt =
        typeof token.roleCheckedAt === "number" ? token.roleCheckedAt : 0;
      if (token.id && Date.now() - checkedAt > 15 * 60 * 1000) {
        const dbUser = await prisma.user.findUnique({
          where: { id: String(token.id) },
          select: { role: true },
        });
        if (!dbUser) {
          // usuário removido — invalida sessão
          token.id = "";
          return token;
        }
        token.role = dbUser.role;
        token.roleCheckedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
