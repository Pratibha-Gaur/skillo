import { cn } from "@/lib/cn";

const categoryStyles: Record<string, string> = {
  Technology: "border-[#C9DED4] bg-[#EAF3EE] text-[#24583F]",
  Creative: "border-[#F1D3C8] bg-[#FCF0EB] text-[#864434]",
  Design: "border-[#D6E0EB] bg-[#EEF3F8] text-[#3E5E7A]",
  Languages: "border-[#E8DDBE] bg-[#FAF4E4] text-[#715A1F]",
  Music: "border-[#D9E4D3] bg-[#F0F5EC] text-[#49613C]",
  Business: "border-[#D7DFE3] bg-[#EFF3F4] text-[#43545B]",
  Communication: "border-[#E9D9D0] bg-[#F8F0EB] text-[#715044]",
  "Life skills": "border-[#D9E5DA] bg-[#EFF6EF] text-[#426044]",
};

export function SkillTag({
  name,
  category,
  className,
}: {
  name: string;
  category?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-1 text-[0.8rem] font-bold",
        categoryStyles[category ?? ""] ?? "border-line bg-[#F1F2EE] text-muted",
        className,
      )}
    >
      {name}
    </span>
  );
}
