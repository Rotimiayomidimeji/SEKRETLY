import type { Metadata } from "next";

import Profile from "@/components/sk/Profile";
import { navCounts } from "@/features/notifications/queries";
import { saveProfile } from "@/features/profile/actions";
import { loadProfile } from "@/features/profile/queries";
import { requireUser } from "@/lib/auth/session";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Profile" };

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const [profile, nav] = await Promise.all([loadProfile(user, "own"), navCounts(user.id)]);
  return <Profile mode={await getMode()} view="own" {...profile} {...nav} save={saveProfile} />;
}
