import type { Metadata } from "next";
import NotFound from "@/components/sk/NotFound";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Page not found" };

export default async function NotFoundPage() {
  return <NotFound mode={await getMode()} kind="notfound" />;
}
