import type { Metadata } from "next";

import Settings from "@/components/sk/Settings";
import { adsFlag } from "@/features/admin/settings";
import { logout } from "@/features/auth/actions";
import { navCounts } from "@/features/notifications/queries";
import { changePassword, changeUsername, deleteAccount, setRecoveryEmail, unblockSender, updateSettings } from "@/features/settings/actions";
import { loadSettings } from "@/features/settings/queries";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getMode } from "@/lib/sk/mode";

export const metadata: Metadata = { title: "Sekretly · Settings" };

const SECTIONS = ["account", "privacy", "messages", "safety", "links", "notif", "look", "games", "help"];
const liveNow = () => new Date();

// /settings?s=safety opens one section (links from other screens).
export default async function SettingsPage({ searchParams }: PageProps<"/settings">) {
  const user = await requireUser("/settings");
  const { s } = await searchParams;
  const [settings, nav, heldCount] = await Promise.all([
    loadSettings(user),
    navCounts(user.id),
    db.message.count({ where: { recipientId: user.id, held: { not: null }, releasedAt: null, deletedAt: null, expiresAt: { gt: liveNow() } } }),
  ]);
  return (
    <Settings
      mode={await getMode()}
      ads={await adsFlag("settings")}
      startSection={typeof s === "string" && SECTIONS.includes(s) ? s : null}
      settings={settings}
      heldCount={heldCount}
      {...nav}
      save={updateSettings}
      changeUsername={changeUsername}
      changePassword={changePassword}
      setRecoveryEmail={setRecoveryEmail}
      unblock={unblockSender}
      deleteAccount={deleteAccount}
      logout={logout}
    />
  );
}
