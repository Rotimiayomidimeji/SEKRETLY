"use client";

// The cookie choice from the landing page banner: "all", "essential", or a mix like "ads+stats" / "+stats".
// Kept for a year in localStorage and the sk-consent cookie. Before anyone chooses, nothing is blocked.

export function consentValue(): string | null {
  try {
    return window.localStorage.getItem("sk-consent") || /(?:^|; )sk-consent=([^;]*)/.exec(document.cookie)?.[1] || null;
  } catch {
    return null;
  }
}

export function allows(kind: "ads" | "stats") {
  const v = consentValue();
  if (!v || v === "all") return true;
  return v.split("+").includes(kind);
}
