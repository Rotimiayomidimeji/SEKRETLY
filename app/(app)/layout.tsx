import { PushPrompt } from "@/components/layout/PushPrompt";
import { Realtime } from "@/components/layout/Realtime";
import { getCurrentUser } from "@/lib/auth/session";

// Member screens: live updates for whoever is logged in, and one ask for notifications on this phone.
export default async function MemberLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  return (
    <>
      {children}
      {user && <Realtime userId={user.id} />}
      <PushPrompt />
    </>
  );
}
