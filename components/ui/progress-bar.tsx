export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div>
      {label && (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-ink">{label}</span>
          <span className="text-muted">{safeValue}%</span>
        </div>
      )}
      <div
        className="h-2 overflow-hidden rounded-full bg-[#E5E8E2]"
        aria-label={`${safeValue}% complete`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeValue}
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-500"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
