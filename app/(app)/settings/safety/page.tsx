import { redirect } from "next/navigation";

// Old address; Settings opens a section with ?s=.
export default function SettingsSafetyPage() {
  redirect("/settings?s=safety");
}
