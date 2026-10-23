import { redirect } from "next/navigation";

// Old address shape (/create/know-me); Create link now takes the topic as ?topic=.
export default async function CreateTypePage({ params }: PageProps<"/create/[type]">) {
  const { type } = await params;
  redirect("/create?topic=" + encodeURIComponent(type));
}
