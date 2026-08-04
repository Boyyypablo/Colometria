import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(80),
  lgpdConsent: z.literal(true),
});

export async function POST(request: Request) {
  try {
    const rl = rateLimit(`register:${clientIp(request)}`, 5, 15 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns minutos." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Dados inválidos. Aceite o termo de privacidade e use senha com 8+ caracteres.",
        },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });

    // Sempre hasheia (custo constante) — reduz timing + enumeração de e-mail.
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    if (!exists) {
      await prisma.user.create({
        data: {
          email,
          name: parsed.data.name,
          passwordHash,
          lgpdConsentAt: new Date(),
          role: "USER",
        },
      });
    }

    // Resposta idêntica exista ou não (anti-enumeração).
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar a conta." },
      { status: 500 },
    );
  }
}
