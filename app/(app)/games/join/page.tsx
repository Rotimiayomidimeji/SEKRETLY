import type { Metadata } from "next";

import JoinApp from "@/components/sk/JoinApp";
import { requireUser } from "@/lib/auth/session";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Join a game" };

export default async function JoinGamePage() {
  await requireUser("/games/join");
  return <JoinApp mode={await getMode()} />;
}
