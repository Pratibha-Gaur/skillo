import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Set up your Skill Wallet" };

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.profile?.onboardingComplete) redirect("/home");
  const skills = await db.skill.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: { id: true, name: true, category: true },
  });

  return (
    <main className="min-h-screen bg-canvas">
      <header className="page-shell flex h-[72px] items-center">
        <Logo />
      </header>
      <div className="page-shell grid gap-12 pb-16 pt-8 lg:grid-cols-[minmax(0,650px)_1fr] lg:items-center lg:pt-14">
        <OnboardingForm skills={skills} name={user.profile?.name ?? "there"} />
        <aside className="hidden rounded-[28px] bg-[#173E31] p-10 text-white lg:block">
          <p className="text-sm font-extrabold text-[#AED3C0]">
            A simple start
          </p>
          <p className="mt-4 font-display text-4xl font-semibold leading-tight tracking-[-0.025em]">
            One thing to share. One thing to learn.
          </p>
          <div className="mt-10 space-y-4 text-sm leading-6 text-[#C8DBD2]">
            <p className="border-l-2 border-[#E4AD42] pl-4">
              Skillo uses these choices to find relevant people and learning
              updates.
            </p>
            <p className="border-l-2 border-[#E96F55] pl-4">
              You stay in control of every proposal, plan, and connection.
            </p>
            <p className="border-l-2 border-[#8FC5AA] pl-4">
              Your skills can change as often as you do.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
