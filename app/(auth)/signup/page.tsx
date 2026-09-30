import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user)
    redirect(user.profile?.onboardingComplete ? "/home" : "/onboarding");

  return (
    <AuthShell
      asideTitle="Being useful is enough to begin."
      asideBody="You can teach the basics while still learning more yourself. Skillo is built for generous peers, not perfect experts."
    >
      <SignupForm />
    </AuthShell>
  );
}
