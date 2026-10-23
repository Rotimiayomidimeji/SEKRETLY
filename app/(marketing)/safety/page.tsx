import type { Metadata } from "next";
import Safety from "@/components/sk/Safety";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Safety and Community Rules" };

export default async function SafetyPage() {
  return <Safety mode={await getMode()} />;
}
