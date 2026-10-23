import type { Metadata } from "next";
import Legal from "@/components/sk/Legal";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Privacy policy" };

export default async function PrivacyPage() {
  return <Legal mode={await getMode()} tab="privacy" />;
}
