import type { Metadata } from "next";

import Onboarding from "@/components/sk/Onboarding";
import { completeOnboarding } from "@/features/auth/actions";
import { requireUser } from "@/lib/auth/session";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Welcome" };

// ?from=link&to=<owner> when someone made their account from a friend's link (wired in Phase 2).
export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const user = await requireUser("/onboarding");
  const { from, to } = await searchParams;
  return (
    <Onboarding
      mode={await getMode()}
      username={user.username}
      from={from === "link" ? "link" : ""}
      to={typeof to === "string" ? to : ""}
      complete={completeOnboarding}
    />
  );
}
