import { redirect } from "next/navigation";

// Not part of the designed product (see design/mockup); kept as a redirect so old links still land somewhere useful.
export default function Page() {
  redirect("/");
}
