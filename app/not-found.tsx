import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { buttonClassName } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-canvas">
      <header className="page-shell flex h-[72px] items-center">
        <Logo />
      </header>
      <div className="page-shell flex min-h-[calc(100vh-72px)] max-w-2xl flex-col items-start justify-center pb-20">
        <p className="text-sm font-extrabold text-brand">Page not found</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
          There is nothing to learn here yet.
        </h1>
        <p className="mt-5 max-w-lg text-lg leading-8 text-muted">
          The page may have moved, or the link may no longer be available.
        </p>
        <Link href="/" className={buttonClassName("primary", "mt-8")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Skillo
        </Link>
      </div>
    </main>
  );
}
