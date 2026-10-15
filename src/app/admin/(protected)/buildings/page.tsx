import { Building2, Pencil } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BuildingDialog } from "@/components/admin/BuildingDialog";
import { BuildingStatusButton } from "@/components/admin/BuildingStatusButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminBuildings } from "@/features/admin/queries";

export const metadata = { title: "Buildings" };

async function BuildingsContent() {
  const buildings = await getAdminBuildings();
  const activeCount = buildings.filter((building) => building.is_active).length;

  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader
        title="Buildings"
        description={`Only active buildings (${activeCount} of ${buildings.length}) appear at registration and checkout.`}
        action={<BuildingDialog />}
      />

      {buildings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-mint text-forest">
            <Building2 className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-3 font-semibold text-gray-900">No buildings yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add the societies you deliver to, then mark them active.</p>
          <div className="mt-4 flex justify-center">
            <BuildingDialog />
          </div>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {buildings.map((building) => (
            <li
              key={building.id}
              className="flex flex-col gap-3 border-b border-border px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                  building.is_active ? "bg-mint text-forest" : "bg-red-50 text-destructive"
                }`}
                aria-hidden="true"
              >
                <Building2 className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-gray-900">{building.name}</h2>
                  <Badge className={building.is_active ? "bg-mint text-forest" : "bg-red-50 text-destructive"}>
                    {building.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {building.address ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{building.address}</p>
                ) : (
                  <p className="mt-0.5 text-xs text-muted-foreground">No sub text</p>
                )}
              </div>
              <div className="grid w-full grid-cols-2 gap-2 sm:w-55 sm:shrink-0">
                <div className="min-w-0">
                  <BuildingDialog
                    building={{ id: building.id, name: building.name, address: building.address }}
                    trigger={
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 w-full justify-center border-forest/30 px-3 text-sm font-medium text-forest"
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Edit
                      </Button>
                    }
                  />
                </div>
                <BuildingStatusButton buildingId={building.id} isActive={building.is_active} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminBuildingsPage() {
  return <BuildingsContent />;
}
