// Accounts created by `npm run db:seed`. They share a publicly known password,
// so they must never be usable for password sign-in outside demo mode.
// Keep this list in sync with prisma/seed.ts.
const DEMO_EMAILS = new Set([
  "demo@skillo.app",
  "maya@skillo.app",
  "aarav@skillo.app",
  "rohan@skillo.app",
  "leena@skillo.app",
  "kabir@skillo.app",
]);

export function isDemoAccount(email: string): boolean {
  return DEMO_EMAILS.has(email.toLowerCase().trim());
}