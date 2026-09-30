import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";

const COOKIE_NAME = "skillo_session";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 7;
const configuredSecret = process.env.AUTH_SECRET;
if (
  process.env.NODE_ENV === "production" &&
  (!configuredSecret || configuredSecret.length < 32)
) {
  throw new Error(
    "AUTH_SECRET must contain at least 32 characters in production.",
  );
}
const secret = new TextEncoder().encode(
  configuredSecret ?? "development-only-secret-change-before-production",
);

type SessionPayload = {
  userId: string;
  role: string;
};

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_AGE_SECONDS}s`)
    .sign(secret);
}

export async function setSessionCookie(userId: string, role: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, await createSessionToken({ userId, role }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.userId !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  return db.user.findUnique({
    where: { id: session.userId },
    include: { profile: true },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireOnboardedUser() {
  const user = await requireUser();
  if (!user.profile?.onboardingComplete) redirect("/onboarding");
  return user;
}
