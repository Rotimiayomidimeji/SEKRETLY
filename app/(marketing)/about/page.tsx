import type { Metadata } from "next";
import About from "@/components/sk/About";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "About Sekretly" };

export default async function AboutPage() {
  return <About mode={await getMode()} />;
}
