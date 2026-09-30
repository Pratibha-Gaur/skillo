import "server-only";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

const buckets = new Map<string, { count: number; resetAt: number }>();

type RateLimitOptions = {
  limit?: number;
  windowMs?: number;
};

export function rateLimit(
  request: Request,
  scope: string,
  options: RateLimitOptions = {},
) {
  const limit = options.limit ?? 30;
  const windowMs = options.windowMs ?? 60_000;
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const key = `${scope}:${forwarded ?? "local"}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (bucket.count >= limit) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((bucket.resetAt - now) / 1000)),
        },
      },
    );
  }

  bucket.count += 1;
  return null;
}

export function rejectCrossSiteMutation(request: Request) {
  const origin = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return null;

  try {
    if (new URL(origin).host !== host) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  }

  return null;
}

export async function authenticatedUser() {
  const user = await getCurrentUser();
  return user ?? null;
}

export function cleanText(value: string, maxLength: number) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLength);
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
