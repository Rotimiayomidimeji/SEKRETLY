import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Create from "@/components/sk/Create";
import { saveLink } from "@/features/links/actions";
import { loadLinkForEdit } from "@/features/links/queries";
import { SLUG_TOPIC } from "@/features/links/topics";
import { requireUser } from "@/lib/auth/session";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Create link" };

// /create starts a new link (?topic=know-me preselects a topic); /create?edit=<id> edits one of yours.
export default async function CreatePage({ searchParams }: PageProps<"/create">) {
  const { edit, topic } = await searchParams;
  const user = await requireUser("/create");
  const initial = typeof edit === "string" ? await loadLinkForEdit(user.id, edit) : null;
  if (typeof edit === "string" && !initial) notFound();
  return (
    <Create
      mode={await getMode()}
      topic={typeof topic === "string" && SLUG_TOPIC[topic] ? topic : undefined}
      initial={initial ?? undefined}
      me={{ username: user.username, avatar: user.avatar }}
      save={saveLink}
    />
  );
}
