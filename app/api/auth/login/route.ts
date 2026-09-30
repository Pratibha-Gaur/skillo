import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { setSessionCookie } from "@/lib/auth";
import { apiError, rateLimit, rejectCrossSiteMutation } from "@/lib/api";
import { db } from "@/lib/db";

const loginSchema = z.object({
  email: z
    .email()
    .max(200)
    .transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8).max(100),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, "login", {
    limit: 10,
    windowMs: 10 * 60_000,
  });
  if (limited) return limited;
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Enter a valid email and password.");

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    include: { profile: true },
  });
  if (!user || !(await compare(parsed.data.password, user.passwordHash))) {
    return apiError("The email or password is not correct.", 401);
  }

  await setSessionCookie(user.id, user.role);
  return NextResponse.json({
    ok: true,
    redirectTo: user.profile?.onboardingComplete ? "/home" : "/onboarding",
  });
}
