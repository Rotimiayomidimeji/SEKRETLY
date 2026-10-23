import type { Metadata } from "next";
import Legal from "@/components/sk/Legal";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Cookies and ads" };

export default async function CookiesPage() {
  return <Legal mode={await getMode()} tab="ads" />;
}
