import { notFound, redirect } from "next/navigation";

import { joinCrew } from "@/features/crews/actions";
import { requireUser } from "@/lib/auth/session";

// A crew invite link: joins the crew and opens it.
export default async function JoinCrewPage({ params }: PageProps<"/crews/join/[id]">) {
  const { id } = await params;
  await requireUser("/crews/join/" + id);
  const r = await joinCrew(id);
  if (!r.ok) notFound();
  redirect("/crews?pick=" + id);
}
