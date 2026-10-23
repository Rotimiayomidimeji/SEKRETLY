import type { Metadata } from "next";
import NotFound from "@/components/sk/NotFound";
import { getMode } from "@/lib/sk/mode";

// Shown by the service worker when there is no connection (wired up with the PWA in a later phase).
export const metadata: Metadata = { title: "Sekretly · You’re offline" };

export default async function OfflinePage() {
  return <NotFound mode={await getMode()} kind="offline" />;
}
