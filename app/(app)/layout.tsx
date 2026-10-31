import { PushPrompt } from "@/components/layout/PushPrompt";
import { Realtime } from "@/components/layout/Realtime";
import { getCurrentUser } from "@/lib/auth/session";
import { avatarBg } from "@/lib/avatar";

// Member screens: live updates for whoever is logged in, and one ask for notifications on this phone.
export default async function MemberLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  return (
    <>
      {children}
      {user && <Realtime userId={user.id} />}
      {/* the menu's Profile button shows the member's own animal on their colour */}
      {user && <style>{`:root{--me-img:url("/sk/${user.avatar}.png");--me-bg:${avatarBg(user.avatar, user.avatarHue)}}`}</style>}
      <PushPrompt />
    </>
  );
}
