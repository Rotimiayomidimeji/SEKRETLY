import { cookies } from "next/headers";

export type Mode = "dark" | "light";

/** The visitor's light/dark choice, read on the server from the cookie that saveMode() writes. */
export async function getMode(): Promise<Mode> {
  const store = await cookies();
  return store.get("sk-mode")?.value === "light" ? "light" : "dark";
}
