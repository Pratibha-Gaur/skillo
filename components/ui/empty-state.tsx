import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-y border-line py-14 text-center">
      <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="text-lg font-extrabold tracking-tight text-ink">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        {body}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
