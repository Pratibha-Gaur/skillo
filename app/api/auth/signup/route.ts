import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { setSessionCookie } from "@/lib/auth";
import {
  apiError,
  cleanText,
  rateLimit,
  rejectCrossSiteMutation,
} from "@/lib/api";
import { db } from "@/lib/db";

const signupSchema = z.object({
  name: z.string().min(2).max(60),
  email: z
    .email()
    .max(200)
    .transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8).max(100),
});

function usernameBase(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 20) || "learner"
  );
}

export async function POST(request: Request) {
  const limited = rateLimit(request, "signup", {
    limit: 6,
    windowMs: 30 * 60_000,
  });
  if (limited) return limited;
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;

  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const passwordIssue = parsed.error.issues.some(
      (issue) => issue.path[0] === "password",
    );
    return apiError(
      passwordIssue
        ? "Use at least 8 characters for your password."
        : "Check your name and email, then try again.",
    );
  }

  const name = cleanText(parsed.data.name, 60);
  if (name.length < 2) return apiError("Enter your name.");
  if (await db.user.findUnique({ where: { email: parsed.data.email } })) {
    return apiError("An account with this email already exists.", 409);
  }

  const base = usernameBase(name);
  let username = base;
  let suffix = 1;
  while (await db.profile.findUnique({ where: { username } })) {
    username = `${base}${suffix}`;
    suffix += 1;
  }

  const user = await db.user.create({
    data: {
      email: parsed.data.email,
      passwordHash: await hash(parsed.data.password, 12),
      profile: {
        create: {
          name,
          username,
          onboardingComplete: false,
          avatarColor: "fern",
        },
      },
    },
  });

  await setSessionCookie(user.id, user.role);
  return NextResponse.json(
    { ok: true, redirectTo: "/onboarding" },
    { status: 201 },
  );
}
