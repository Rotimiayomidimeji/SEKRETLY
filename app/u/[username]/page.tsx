import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Profile from "@/components/sk/Profile";
import { reportProfile } from "@/features/profile/actions";
import { loadProfile } from "@/features/profile/queries";
import { db } from "@/lib/db";
import { getMode } from "@/lib/sk/mode";

export async function generateMetadata({ params }: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  return { title: "@" + username.toLowerCase() + " · Sekretly" };
}

// The public profile printed on story cards: avatar, bio and live links (or a short note if it's private).
export default async function PublicProfilePage({ params }: PageProps<"/u/[username]">) {
  const { username } = await params;
  const user = await db.user.findUnique({ where: { username: username.toLowerCase() } });
  if (!user || user.status !== "ACTIVE") notFound();
  const profile = await loadProfile(user, "public");
  return <Profile mode={await getMode()} view="public" {...profile} reportProfile={reportProfile} />;
}
