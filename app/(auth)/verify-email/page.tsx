import type { Metadata } from "next";
import { redirect } from "next/navigation";

import Verify from "@/components/sk/Verify";
import { resendVerifyCode, verifyEmail } from "@/features/auth/actions";
import { requireUser } from "@/lib/auth/session";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Verify your email" };

export default async function VerifyEmailPage() {
  const user = await requireUser("/verify-email");
  if (!user.recoveryEmail) redirect("/onboarding");
  return <Verify mode={await getMode()} email={user.recoveryEmail} verified={!!user.emailVerifiedAt} verify={verifyEmail} resend={resendVerifyCode} />;
}
