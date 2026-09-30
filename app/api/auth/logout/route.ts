import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { rejectCrossSiteMutation } from "@/lib/api";

export async function POST(request: Request) {
  const crossSite = rejectCrossSiteMutation(request);
  if (crossSite) return crossSite;
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
