import { redirect } from "next/navigation";

// Onboarding is one screen now (see app/(auth)/onboarding/page.tsx).
export default function Page() {
  redirect("/onboarding");
}
