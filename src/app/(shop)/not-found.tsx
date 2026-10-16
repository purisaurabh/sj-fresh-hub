import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ShopNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">The page you requested is not available.</p>
      <Button asChild className="h-11 bg-forest">
        <Link href="/">Back to shop</Link>
      </Button>
    </div>
  );
}
