type BrandLoaderProps = {
  label?: string;
  variant?: "page" | "overlay";
};

export function BrandLoader({ label = "Please wait", variant = "page" }: BrandLoaderProps) {
  const card = (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-white px-8 py-7 shadow-[0_18px_50px_rgba(20,97,30,0.16)]">
      <div className="relative size-14">
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-mint border-t-forest border-r-leaf" />
        <span className="absolute inset-2 flex items-center justify-center rounded-full bg-forest text-[10px] font-bold tracking-wide text-white">
          SJ
        </span>
      </div>
      <p className="text-sm font-medium text-forest">{label}</p>
    </div>
  );

  if (variant === "overlay") {
    return (
      <div
        className="fixed inset-0 z-80 flex items-center justify-center bg-forest/25 backdrop-blur-[2px]"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {card}
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite" aria-busy="true">
      {card}
    </div>
  );
}
