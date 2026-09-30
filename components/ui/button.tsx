import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const buttonStyles = {
  primary:
    "bg-brand text-white hover:bg-brand-dark shadow-[0_1px_0_rgba(0,0,0,0.08)]",
  secondary:
    "border border-line bg-surface text-ink hover:border-brand/40 hover:bg-brand-soft",
  tertiary: "bg-transparent text-muted hover:bg-black/[0.04] hover:text-ink",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
};

export function buttonClassName(
  variant: keyof typeof buttonStyles = "primary",
  className?: string,
) {
  return cn(
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] px-4 py-2 text-sm font-bold transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    buttonStyles[variant],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonStyles;
};

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, className)}
      {...props}
    />
  );
}
