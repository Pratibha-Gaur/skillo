import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";

export function AuthShell({
  children,
  asideTitle,
  asideBody,
}: {
  children: ReactNode;
  asideTitle: string;
  asideBody: string;
}) {
  return (
    <main className="grid min-h-screen bg-surface lg:grid-cols-[0.95fr_1.05fr]">
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14">
        <Logo />
        <div className="mx-auto flex w-full max-w-[430px] flex-1 items-center py-12">
          {children}
        </div>
        <p className="text-center text-xs leading-5 text-muted">
          By continuing, you agree to our{" "}
          <Link
            className="underline underline-offset-2 hover:text-ink"
            href="/terms"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            className="underline underline-offset-2 hover:text-ink"
            href="/privacy"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </section>
      <aside className="relative hidden overflow-hidden bg-[#173E31] p-14 text-white lg:flex lg:flex-col lg:justify-end">
        <div
          className="absolute left-[18%] top-[14%] h-32 w-32 rounded-[38px] border border-white/15"
          aria-hidden="true"
        />
        <div
          className="absolute right-[13%] top-[29%] h-20 w-20 rounded-full bg-[#E4AD42]"
          aria-hidden="true"
        />
        <div
          className="absolute left-[34%] top-[38%] h-24 w-44 rotate-[-7deg] rounded-[28px] bg-[#EAF2ED]"
          aria-hidden="true"
        />
        <div className="relative max-w-xl pb-10">
          <p className="font-display text-5xl font-semibold leading-[1.05] tracking-[-0.03em]">
            {asideTitle}
          </p>
          <p className="mt-5 max-w-lg text-lg leading-8 text-[#C6D9D0]">
            {asideBody}
          </p>
        </div>
      </aside>
    </main>
  );
}
