import type { Metadata } from "next";

import Forgot from "@/components/sk/Forgot";
import { checkReset, finishReset, startReset } from "@/features/auth/actions";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Reset your password" };

export default async function ForgotPasswordPage() {
  return <Forgot mode={await getMode()} startReset={startReset} checkReset={checkReset} finishReset={finishReset} />;
}
