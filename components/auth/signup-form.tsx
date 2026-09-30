"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to create your account.");
      router.push(data.redirectTo);
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to create your account.",
      );
      setPending(false);
    }
  }

  return (
    <div className="w-full">
      <p className="text-sm font-extrabold text-brand">Start with two skills</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl">
        What can you share?
      </h1>
      <p className="mt-3 leading-7 text-muted">
        Create your account. Next, tell us one thing you can teach and one thing
        you want to learn.
      </p>

      <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
        <div>
          <label className="field-label" htmlFor="name">
            Name
          </label>
          <input
            className="field"
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={60}
            placeholder="Your name"
          />
        </div>
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
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              className="field pr-11"
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              aria-describedby="password-help"
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
          <p id="password-help" className="mt-2 text-xs leading-5 text-muted">
            Use at least 8 characters. Your password is securely hashed.
          </p>
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
          disabled={pending}
        >
          {pending ? "Creating account..." : "Continue"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>
      <p className="mt-7 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-extrabold text-brand hover:text-brand-dark"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
