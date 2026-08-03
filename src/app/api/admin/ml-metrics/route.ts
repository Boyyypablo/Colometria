import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { computeMlMetrics } from "@/lib/ml/metrics";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticada." }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const metrics = await computeMlMetrics();
  return NextResponse.json({ metrics });
}
