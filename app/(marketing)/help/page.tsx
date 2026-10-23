import type { Metadata } from "next";
import Help from "@/components/sk/Help";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Help and FAQ" };

export default async function HelpPage() {
  return <Help mode={await getMode()} />;
}
