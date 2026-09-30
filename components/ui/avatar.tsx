import { initials } from "@/lib/format";
import { cn } from "@/lib/cn";

const colorClasses: Record<string, string> = {
  fern: "bg-[#DCEBDD] text-[#24583F]",
  coral: "bg-[#FCE1D9] text-[#8C3F30]",
  sky: "bg-[#DDEAF6] text-[#315D83]",
  sun: "bg-[#F8E8BC] text-[#765817]",
  clay: "bg-[#E9DDD3] text-[#654B3D]",
  navy: "bg-[#DCE2EA] text-[#34485E]",
};

export function Avatar({
  name,
  color = "fern",
  size = "md",
  className,
}: {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-8 w-8 text-[0.68rem]",
    md: "h-10 w-10 text-xs",
    lg: "h-14 w-14 text-base",
    xl: "h-24 w-24 text-2xl",
  };

  return (
    <span
      aria-label={`${name}'s avatar`}
      role="img"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-extrabold tracking-tight",
        colorClasses[color] ?? colorClasses.fern,
        sizeClasses[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
