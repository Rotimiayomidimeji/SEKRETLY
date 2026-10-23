import type { Metadata } from "next";

import MyLinks from "@/components/sk/MyLinks";
import { deleteLink, resetLinks, setAllPaused, setLinkPaused } from "@/features/links/actions";
import { loadMyLinks } from "@/features/links/queries";
import { appOrigin } from "@/features/links/topics";
import { requireUser } from "@/lib/auth/session";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · My links" };

export default async function MyLinksPage() {
  const user = await requireUser("/links");
  const data = await loadMyLinks(user.id);
  return (
    <MyLinks
      mode={await getMode()}
      username={data.username}
      linkKey={data.key}
      links={data.links}
      origin={appOrigin().replace(/^https?:\/\//, "")}
      setPaused={setLinkPaused}
      deleteLink={deleteLink}
      setAllPaused={setAllPaused}
      resetLinks={resetLinks}
    />
  );
}
