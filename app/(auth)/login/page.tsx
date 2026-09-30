import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user)
    redirect(user.profile?.onboardingComplete ? "/home" : "/onboarding");

  return (
    <AuthShell
      asideTitle="Pick up where the conversation left off."
      asideBody="Your learning plan, messages, and next practice step stay together, so it is easy to return without starting over."
    >
      <LoginForm demoEnabled={process.env.DEMO_MODE === "true"} />
    </AuthShell>
  );
}
