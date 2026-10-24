import { redirect } from "next/navigation";

// The admin account changes its password and recovery email in Settings › Account.
export default function AdminAccountPage() {
  redirect("/settings?s=account");
}
