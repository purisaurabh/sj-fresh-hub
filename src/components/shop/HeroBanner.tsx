type HeroBannerProps = {
  shopName: string;
  isOpen: boolean;
  shopPhone?: string | null;
};

export function HeroBanner({ shopName, isOpen, shopPhone }: HeroBannerProps) {
  return (
    <section className="overflow-hidden rounded-xl bg-linear-to-br from-forest to-leaf text-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-end md:justify-between md:p-8">
        <div className="max-w-xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-sunshine">
            FARM FRESH • GOOD FOOD GOOD MOOD
          </p>
          <h1 className="mt-2 text-lg font-semibold leading-tight md:text-4xl">
            Fresh, Healthy & Tasty Produce Delivered to Your Home
          </h1>
          <p className="mt-2 text-sm text-white/90 md:text-base">
            {shopName} brings vegetables and fruits to approved residential buildings.
          </p>
        </div>
        <aside className="rounded-xl bg-white/10 p-4 text-sm backdrop-blur-sm">
          <p className="font-medium">{isOpen ? "Ordering is open" : "Ordering is currently closed"}</p>
          <p className="mt-1 text-white/80">Selected buildings · Cash on Delivery</p>
          {shopPhone ? (
            <a className="mt-2 inline-flex min-h-11 items-center font-medium underline-offset-2 hover:underline" href={`tel:${shopPhone}`}>
              Call {shopPhone}
            </a>
          ) : null}
        </aside>
      </div>
      <div className="h-1.5 bg-sunshine" />
    </section>
  );
}
