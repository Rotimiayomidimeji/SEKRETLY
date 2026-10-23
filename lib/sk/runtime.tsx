"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import ROUTES from "./routes.json";

const routes: Record<string, string> = ROUTES;

/** Turns a mockup board reference ("Inbox.dc.html#x") into an app path ("/inbox#x"). Anything else passes through. */
export function route(href: string | undefined | null): string {
  if (!href) return "#";
  const m = /^([A-Za-z]+)\.dc\.html(#.*)?$/.exec(href);
  if (!m) return href;
  const path = routes[m[1]] ?? "/not-found";
  return m[2] ? (path === "/" ? "/" : path) + m[2] : path;
}

/** In-app links use Next's client navigation; hashes and external links stay plain anchors. */
export function SkLink({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string }) {
  const to = route(href);
  if (to.startsWith("#") || /^(https?:|mailto:|tel:)/.test(to)) return <a href={to} {...rest} />;
  return <Link href={to} {...rest} />;
}

/** Light/dark lives in a cookie so the server renders the same mode the browser will (no flash, no mismatch). */
export function saveMode(mode: string) {
  try {
    window.localStorage.setItem("sk-mode", mode);
  } catch {}
  document.cookie = `sk-mode=${mode}; path=/; max-age=31536000; samesite=lax`;
}
