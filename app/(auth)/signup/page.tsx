import type { Metadata } from "next";
import { redirect } from "next/navigation";

import Signup from "@/components/sk/Signup";
import { checkUsername, signup } from "@/features/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Create your account" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.onboardedAt ? "/home" : "/onboarding");
  return <Signup mode={await getMode()} checkUsername={checkUsername} signup={signup} />;
}
