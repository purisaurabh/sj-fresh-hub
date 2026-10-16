import { LoginForm } from "@/components/auth/LoginForm";
import { safeNextPath } from "@/lib/auth/next-path";

export const metadata = { title: "Log in" };

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  return <LoginForm next={safeNextPath(next)} />;
}
