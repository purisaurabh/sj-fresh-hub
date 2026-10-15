import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Poppins } from "next/font/google";
import { AppLoader } from "@/components/feedback/AppLoader";
import { RouteProgress } from "@/components/feedback/RouteProgress";
import { SyncPushSubscription } from "@/components/notifications/SyncPushSubscription";
import { FirstVisitPrompts } from "@/components/shop/FirstVisitPrompts";
import { Toaster } from "@/components/ui/sonner";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const siteUrl = getSiteUrl();
const description = "Fresh vegetables and fruits delivered to selected buildings. Cash on Delivery.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SJ Fresh Hub",
    template: "%s · SJ Fresh Hub",
  },
  description,
  applicationName: "SJ Fresh Hub",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "SJ Fresh Hub",
    description,
    type: "website",
    locale: "en_IN",
    siteName: "SJ Fresh Hub",
  },
  twitter: {
    card: "summary",
    title: "SJ Fresh Hub",
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14611e",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className={`${poppins.className} flex min-h-full flex-col`}>
        {children}
        <FirstVisitPrompts />
        <SyncPushSubscription />
        <RouteProgress />
        <AppLoader />
        <Toaster />
      </body>
    </html>
  );
}
