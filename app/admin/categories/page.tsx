import type { Metadata } from "next";

import AdminCategories from "@/components/sk/AdminCategories";
import { saveCategories } from "@/features/admin/actions";
import { categoryConfig } from "@/features/admin/settings";
import { requireAdmin } from "@/lib/auth/admin";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly admin · Report categories" };

export default async function AdminCategoriesPage() {
  await requireAdmin();
  return <AdminCategories mode={await getMode()} config={await categoryConfig()} save={saveCategories} />;
}
