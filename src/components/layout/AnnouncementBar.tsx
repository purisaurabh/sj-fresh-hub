type AnnouncementBarProps = {
  announcement: string;
  deliveryArea: string;
};

export function AnnouncementBar({ announcement, deliveryArea }: AnnouncementBarProps) {
  return (
    <div className="bg-forest text-white">
      <div className="mx-auto flex max-w-[1250px] flex-col items-center justify-between gap-1 px-4 py-2 text-center text-xs font-medium sm:flex-row sm:text-sm md:px-6">
        <p>{announcement}</p>
        <p className="rounded-full bg-sunshine px-3 py-1 text-xs font-semibold text-gray-900">
          {deliveryArea}
        </p>
      </div>
    </div>
  );
}
