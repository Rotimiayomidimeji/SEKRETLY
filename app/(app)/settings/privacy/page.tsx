import { redirect } from "next/navigation";

// Old address; Settings opens a section with ?s=.
export default function SettingsPrivacyPage() {
  redirect("/settings?s=privacy");
}
