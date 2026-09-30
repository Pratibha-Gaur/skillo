"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoginForm({ demoEnabled = false }: { demoEnabled?: boolean }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [demoPending, setDemoPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to sign in.");
      router.push(data.redirectTo);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
      setPending(false);
    }
  }

  async function openDemo() {
    setError("");
    setDemoPending(true);
    try {
      const response = await fetch("/api/auth/demo", { method: "POST" });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to open the demo.");
      router.push(data.redirectTo);
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to open the demo.",
      );
      setDemoPending(false);
    }
  }

  return (
    <div className="w-full">
      <p className="text-sm font-extrabold text-brand">Welcome back</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
        Continue learning together.
      </h1>
      <p className="mt-3 leading-7 text-muted">
        Sign in to see your exchanges, feed, and next steps.
      </p>

      <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
        <div>
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            className="field"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-bold text-ink" htmlFor="password">
              Password
            </label>
            <span className="text-xs text-muted">At least 8 characters</span>
          </div>
          <div className="relative">
            <input
              className="field pr-11"
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        {error && (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}
        <Button
          className="min-h-12 w-full text-base"
          type="submit"
          disabled={pending || demoPending}
        >
          {pending ? "Signing in..." : "Sign in"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>

      {demoEnabled && (
        <>
          <div className="my-6 flex items-center gap-3 text-xs font-semibold text-muted">
            <span className="h-px flex-1 bg-line" />
            <span>or</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <Button
            variant="secondary"
            className="min-h-12 w-full text-base"
            onClick={openDemo}
            disabled={pending || demoPending}
          >
            {demoPending ? "Opening demo..." : "Explore the demo workspace"}
          </Button>
        </>
      )}
      <p className="mt-7 text-center text-sm text-muted">
        New to Skillo?{" "}
        <Link
          href="/signup"
          className="font-extrabold text-brand hover:text-brand-dark"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
