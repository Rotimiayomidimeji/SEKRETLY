import type { Metadata } from "next";
import Contact from "@/components/sk/Contact";
import { contactEmail } from "@/lib/contact";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Contact Sekretly" };

export default async function ContactPage() {
  return <Contact mode={await getMode()} email={contactEmail()} />;
}
