import type { Metadata } from "next";
import { redirect } from "next/navigation";

import Login from "@/components/sk/Login";
import { login } from "@/features/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const user = await getCurrentUser();
  if (user) redirect(user.onboardedAt ? "/home" : "/onboarding");
  const next = (await searchParams).next;
  return <Login mode={await getMode()} login={login} next={typeof next === "string" ? next : ""} />;
}
