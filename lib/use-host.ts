"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** This site's host ("sekretly.app", or localhost in dev) without a server/browser mismatch on first render. */
export function useHost(fallback = "sekretly.app") {
  return useSyncExternalStore(noop, () => window.location.host, () => fallback);
}
