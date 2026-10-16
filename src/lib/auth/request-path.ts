import { headers } from "next/headers";

export async function requestPath(): Promise<string | null> {
  const headerStore = await headers();
  const pathname = headerStore.get("x-sj-pathname");
  if (!pathname?.startsWith("/") || pathname.startsWith("//")) {
    return null;
  }
  const search = headerStore.get("x-sj-search") ?? "";
  return `${pathname}${search}`;
}
