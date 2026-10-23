import type { Metadata } from "next";
import Legal from "@/components/sk/Legal";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Terms of use" };

export default async function TermsPage() {
  return <Legal mode={await getMode()} tab="terms" />;
}
