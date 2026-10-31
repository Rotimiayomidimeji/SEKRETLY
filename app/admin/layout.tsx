import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/admin";

// Every admin page: the admin account only (everyone else sees "page not found"), and never listed by search engines.
// Each page checks again on its own, so a page can't be reached around this layout.
export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return children;
}
