import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Main from "@/components/sk/Main";
import { adsFlag } from "@/features/admin/settings";
import { checkUsername } from "@/features/auth/actions";
import { loadLinkPage } from "@/features/links/queries";
import { joinAndSend, sendMessage } from "@/features/messages/actions";
import { getCurrentUser } from "@/lib/auth/session";

// A shared link: sekretlyy.vercel.app/<owner>/<key>/<theme>/<topic slug>

export async function generateMetadata({ params }: PageProps<"/[username]/[key]/[theme]/[topic]">): Promise<Metadata> {
  const { username } = await params;
  return { title: `Send @${username.toLowerCase()} an anonymous message · Sekretly` };
}

export default async function LinkPage({ params }: PageProps<"/[username]/[key]/[theme]/[topic]">) {
  const { username, key, theme, topic } = await params;
  const viewer = await getCurrentUser();
  const link = await loadLinkPage({ username, key, theme, slug: topic }, viewer);
  if (!link) notFound();
  return (
    <Main
      {...link}
      ads={await adsFlag("sent")}
      send={sendMessage}
      joinAndSend={joinAndSend}
      checkUsername={checkUsername}
    />
  );
}
