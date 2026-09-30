import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { apiError, rateLimit, rejectCrossSiteMutation } from "@/lib/api";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  if (process.env.DEMO_MODE !== "true")
    return apiError("Demo mode is not enabled.", 404);
  const limited = rateLimit(request, "demo", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;

  const user = await db.user.findUnique({
    where: { email: "demo@skillo.app" },
  });
  if (!user)
    return apiError("Demo data is not available. Run npm run db:seed.", 503);

  await setSessionCookie(user.id, user.role);
  return NextResponse.json({ ok: true, redirectTo: "/home" });
}
