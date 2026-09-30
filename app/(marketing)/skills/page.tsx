import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { PublicFooter } from "@/components/layout/public-footer";
import { SkillTag } from "@/components/ui/skill-tag";
import { buttonClassName } from "@/components/ui/button";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Explore skills" };

export default async function PublicSkillsPage() {
  const skills = await db.skill.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    take: 24,
  });
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="page-shell flex h-[72px] items-center justify-between">
          <Logo />
          <div className="flex gap-2">
            <Link href="/login" className={buttonClassName("tertiary")}>
              Sign in
            </Link>
            <Link href="/signup" className={buttonClassName("primary")}>
              Start exchanging
            </Link>
          </div>
        </div>
      </header>
      <main className="page-shell py-14 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-extrabold text-brand">Explore skills</p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-tight tracking-[-0.04em] sm:text-6xl">
            What would you like to learn from another person?
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted">
            Career skills, creative skills, languages, hobbies, and useful
            everyday knowledge all belong here.
          </p>
        </div>
        <div className="mt-12 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <article key={skill.id} className="border-t border-line py-6">
              <SkillTag name={skill.name} category={skill.category} />
              <p className="mt-3 text-sm leading-6 text-muted">
                {skill.description}
              </p>
            </article>
          ))}
        </div>
        <section className="mt-14 flex flex-col justify-between gap-6 rounded-2xl bg-[#173E31] p-7 text-white sm:flex-row sm:items-center sm:p-9">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Know one of these? Start with that.
            </h2>
            <p className="mt-2 text-[#C6D9D0]">
              Add one skill to teach and one skill to learn. You can change both
              later.
            </p>
          </div>
          <Link
            href="/signup"
            className={buttonClassName(
              "secondary",
              "shrink-0 border-white/20 bg-white text-[#173E31] hover:bg-[#F1F4EF]",
            )}
          >
            Create your Skill Wallet
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
