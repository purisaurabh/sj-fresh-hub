import Link from "next/link";

type LogoProps = {
  tone?: "default" | "onDark";
};

export function Logo({ tone = "default" }: LogoProps) {
  const onDark = tone === "onDark";

  return (
    <Link href="/" className="flex min-h-11 items-center gap-2 rounded-lg focus-visible:outline-none">
      <span
        className={`flex size-10 items-center justify-center rounded-xl text-sm font-bold tracking-wide ${
          onDark ? "bg-white text-forest" : "bg-forest text-white"
        }`}
      >
        SJ
      </span>
      <span className="leading-tight">
        <span className={`block text-lg font-semibold italic ${onDark ? "text-white" : "text-forest"}`}>fresh</span>
        <span className="-mt-1 block text-sm font-semibold">
          <span className="rounded-sm bg-sunshine px-1.5 text-gray-900">Hub</span>
        </span>
      </span>
      <span className="sr-only">SJ Fresh Hub home</span>
    </Link>
  );
}
