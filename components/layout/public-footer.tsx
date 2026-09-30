import Link from "next/link";
import { LogoLockup } from "@/components/brand/logo";

export function PublicFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="page-shell flex flex-col gap-7 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <LogoLockup />
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            A place to share what you know and learn from another person.
          </p>
        </div>
        <nav
          aria-label="Legal"
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-muted"
        >
          <Link className="hover:text-ink" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="hover:text-ink" href="/terms">
            Terms & Conditions
          </Link>
          <a className="hover:text-ink" href="mailto:hello@skillo.app">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
