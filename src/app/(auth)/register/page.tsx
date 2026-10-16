import { RegisterForm } from "@/components/auth/RegisterForm";
import { EmptyState } from "@/components/shop/EmptyState";
import { getActiveBuildings } from "@/features/buildings/queries";
import { safeNextPath } from "@/lib/auth/next-path";

export const metadata = { title: "Register" };

type RegisterPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { next } = await searchParams;
  const buildings = await getActiveBuildings();
  if (buildings.length === 0) {
    return (
      <EmptyState
        title="Registration is not open yet"
        description="Active buildings have not been published. Please check back after the shop finishes setup."
      />
    );
  }

  return <RegisterForm buildings={buildings} next={safeNextPath(next)} />;
}
