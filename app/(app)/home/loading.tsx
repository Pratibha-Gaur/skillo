export default function HomeLoading() {
  return (
    <div className="page-shell py-10" aria-label="Loading your home">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-black/[0.06]" />
      <div className="mt-9 h-40 animate-pulse rounded-2xl bg-black/[0.05]" />
      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,700px)_1fr]">
        <div className="space-y-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-40 animate-pulse border-b border-line bg-black/[0.025]"
            />
          ))}
        </div>
        <div className="h-56 animate-pulse rounded-xl bg-black/[0.04]" />
      </div>
    </div>
  );
}
