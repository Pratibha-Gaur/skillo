import Link from "next/link";
import { cn } from "@/lib/cn";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="11" fill="currentColor" />
      <path
        d="M12.2 18.2c.9-4.1 4.1-6.7 8.1-6.7 3 0 5.5 1.4 7 3.8"
        stroke="#F8F6EF"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="m26.3 10.8 1.2 4.9-4.9.3"
        stroke="#F8F6EF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27.8 21.8c-.9 4.1-4.1 6.7-8.1 6.7-3 0-5.5-1.4-7-3.8"
        stroke="#F2B84B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="m13.7 29.2-1.2-4.9 4.9-.3"
        stroke="#F2B84B"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  href = "/",
  compact = false,
  responsiveCompact = false,
}: {
  href?: string;
  compact?: boolean;
  responsiveCompact?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2.5 rounded-lg text-brand outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4"
      aria-label="Skillo home"
    >
      <LogoMark className="h-9 w-9 transition-transform duration-200 group-hover:-rotate-3" />
      {!compact && (
        <span
          className={cn(
            "text-[1.2rem] font-extrabold tracking-[-0.045em] text-ink",
            responsiveCompact && "hidden sm:inline",
          )}
        >
          SKILLO
        </span>
      )}
    </Link>
  );
}

export function LogoLockup({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-[1.2rem] font-extrabold tracking-[-0.045em] text-ink">
        SKILLO
      </span>
    </div>
  );
}
