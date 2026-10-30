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

type StackComp = {
  state: Record<string, unknown>;
  setState: (s: Record<string, unknown>, cb?: () => void) => void;
  componentDidUpdate?: (...a: unknown[]) => void;
  componentWillUnmount?: () => void;
};

/**
 * Puts a screen's inner views (an open message, a settings section, a step) on the phone's back stack, so swiping
 * back (or the browser's Back) returns to the view before, not the previous page. Called once from componentDidMount
 * with the state keys that make up "the view". Closing a view from the screen itself steps the history back too.
 */
export function skStack(comp: StackComp, keys: string[]) {
  if (typeof window === "undefined") return;
  const id = "v" + Math.random().toString(36).slice(2, 8);
  const pick = (s: Record<string, unknown>) => Object.fromEntries(keys.map((k) => [k, s[k]]));
  const same = (a: Record<string, unknown>, b: Record<string, unknown>) => keys.every((k) => JSON.stringify(a[k] ?? null) === JSON.stringify(b[k] ?? null));
  const stack = [pick(comp.state)];
  let restoring = false;

  const onPop = (e: PopStateEvent) => {
    const at = (e.state?.__sk ?? {})[id];
    const idx = typeof at === "number" ? at : 0;
    if (idx >= stack.length) return;
    stack.length = idx + 1;
    if (same(pick(comp.state), stack[idx])) return;
    restoring = true;
    comp.setState({ ...stack[idx] }, () => (restoring = false));
  };
  window.addEventListener("popstate", onPop);

  const didUpdate = comp.componentDidUpdate;
  comp.componentDidUpdate = function (this: StackComp, ...a: unknown[]) {
    didUpdate?.apply(this, a);
    if (restoring) return;
    const now = pick(this.state);
    if (same(now, stack[stack.length - 1])) return;
    // closed from the screen (back to the view before): step the history back instead of adding to it
    if (stack.length > 1 && same(now, stack[stack.length - 2])) {
      stack.pop();
      window.history.back();
      return;
    }
    stack.push(now);
    const st = window.history.state ?? {};
    window.history.pushState({ ...st, __sk: { ...(st.__sk ?? {}), [id]: stack.length - 1 } }, "", window.location.href);
  };
  const willUnmount = comp.componentWillUnmount;
  comp.componentWillUnmount = function (this: StackComp) {
    window.removeEventListener("popstate", onPop);
    willUnmount?.call(this);
  };
}

/** Light/dark lives in a cookie so the server renders the same mode the browser will (no flash, no mismatch). */
export function saveMode(mode: string) {
  try {
    window.localStorage.setItem("sk-mode", mode);
  } catch {}
  document.cookie = `sk-mode=${mode}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.dataset.mode = mode;
}
