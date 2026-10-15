"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import { logoutUser } from "@/features/auth/actions";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnreadNotifications } from "@/features/notifications/unread-store";
import { withActionOverlay } from "@/lib/ui/action-overlay";
import { useRouteTransition } from "@/lib/ui/route-transition";

type ProfileMenuProps = {
  name: string;
  phone?: string | null;
  showProfileLink?: boolean;
};

export function ProfileMenu({ name, phone, showProfileLink = false }: ProfileMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const startRoute = useRouteTransition((state) => state.start);
  const [, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showHoverName, setShowHoverName] = useState(false);
  const displayName = name.trim() || "My account";

  function closeMenu() {
    setMenuOpen(false);
    setShowHoverName(false);
  }

  function goToProfile() {
    closeMenu();
    if (pathname === "/profile") {
      return;
    }
    startRoute("/profile");
    startTransition(() => {
      router.push("/profile");
    });
  }

  return (
    <>
      <DropdownMenu
        open={menuOpen}
        onOpenChange={(open) => {
          setMenuOpen(open);
          if (open) {
            setShowHoverName(false);
          }
        }}
      >
        <span
          className="relative inline-flex"
          onMouseEnter={() => {
            if (!menuOpen) {
              setShowHoverName(true);
            }
          }}
          onMouseLeave={() => setShowHoverName(false)}
        >
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-forest outline-none hover:bg-mint focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label={`Account menu for ${displayName}`}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-mint ring-1 ring-forest/15">
                <UserRound className="size-4" />
              </span>
            </button>
          </DropdownMenuTrigger>
          {showHoverName && !menuOpen ? (
            <span
              className="pointer-events-none absolute top-full right-0 z-50 mt-1 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-md"
              aria-hidden="true"
            >
              {displayName}
            </span>
          ) : null}
        </span>
        <DropdownMenuContent align="end" className="w-56 min-w-56" onCloseAutoFocus={(event) => event.preventDefault()}>
          <DropdownMenuLabel className="px-2 py-2">
            <p className="text-sm font-semibold text-gray-900">{displayName}</p>
            {phone ? <p className="text-xs font-normal text-muted-foreground">{phone}</p> : null}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {showProfileLink ? (
            <DropdownMenuItem className="min-h-10 cursor-pointer" onSelect={goToProfile}>
              <UserRound className="size-4" />
              My profile
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            className="min-h-10 cursor-pointer text-destructive focus:text-destructive"
            onSelect={(event) => {
              event.preventDefault();
              closeMenu();
              setConfirmOpen(true);
            }}
          >
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirmOpen}
        title="Are you sure you want to log out?"
        confirmLabel="Log out"
        onOpenChange={setConfirmOpen}
        onConfirm={() => {
          setConfirmOpen(false);
          void (async () => {
            const result = await withActionOverlay(() => logoutUser());
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success(result.message ?? "Logged out successfully");
            useUnreadNotifications.getState().reset();
            router.push("/");
            router.refresh();
          })();
        }}
      />
    </>
  );
}
