import { redirect } from "next/navigation";

// Old address shape (/inbox/<id>); the inbox opens one item with ?open=.
export default async function MessagePage({ params }: PageProps<"/inbox/[messageId]">) {
  const { messageId } = await params;
  redirect("/inbox?open=" + encodeURIComponent(messageId));
}
