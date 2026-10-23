import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LinkDetail from "@/components/sk/LinkDetail";
import { deleteLinkAndReturn, setLinkPaused } from "@/features/links/actions";
import { loadLinkInsights } from "@/features/links/queries";
import { requireUser } from "@/lib/auth/session";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Link insights" };

export default async function LinkInsightsPage({ params }: PageProps<"/links/[id]">) {
  const { id } = await params;
  const user = await requireUser("/links/" + id);
  const data = await loadLinkInsights(user.id, id);
  if (!data) notFound();
  return <LinkDetail mode={await getMode()} data={data} setPaused={setLinkPaused} deleteLink={deleteLinkAndReturn} />;
}
