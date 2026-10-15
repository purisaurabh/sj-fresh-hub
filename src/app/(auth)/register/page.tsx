import { Suspense } from "react";
import { BrandLoader } from "@/components/feedback/BrandLoader";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { EmptyState } from "@/components/shop/EmptyState";
import { getActiveBuildings } from "@/features/buildings/queries";

export const metadata = { title: "Register" };

async function RegisterContent() {
  const buildings = await getActiveBuildings();
  if (buildings.length === 0) {
    return (
      <EmptyState
        title="Registration is not open yet"
        description="Active buildings have not been published. Please check back after the shop finishes setup."
      />
    );
  }

  return <RegisterForm buildings={buildings} />;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<BrandLoader />}>
      <RegisterContent />
    </Suspense>
  );
}
