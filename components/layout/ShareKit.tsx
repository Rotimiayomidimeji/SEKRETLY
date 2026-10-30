"use client";

import { useEffect } from "react";

// One way to share a link (and optionally images) from any screen: window.skShare.open(dest, { url, text, files }).
// Each app opens on its own "pick who to send to" screen with the link filled in. Instagram and TikTok have no web
// share address, so they go through the phone's share sheet (with the story images when there are some), or the
// link is copied and the app opened to paste it.
// The icons live in /public/brand/<dest>.svg; the ported screens show them as plain round buttons, no labels.

export type ShareDest = "wa" | "ig" | "sc" | "x" | "fb" | "tg" | "tt" | "sms" | "more" | "copy" | "save";
export type ShareResult = "opened" | "shared" | "copied" | "saved" | "cancelled" | "failed";
type Payload = { url: string; text?: string; files?: File[] };

declare global {
  interface Window {
    skShare?: { open: (dest: ShareDest, p: Payload) => Promise<ShareResult>; DESTS: { id: ShareDest; name: string; icon: string }[] };
  }
}

export const DESTS: { id: ShareDest; name: string; icon: string }[] = [
  { id: "wa", name: "WhatsApp", icon: "/brand/whatsapp.svg" },
  { id: "ig", name: "Instagram", icon: "/brand/instagram.svg" },
  { id: "sc", name: "Snapchat", icon: "/brand/snapchat.svg" },
  { id: "tt", name: "TikTok", icon: "/brand/tiktok.svg" },
  { id: "x", name: "X", icon: "/brand/x.svg" },
  { id: "fb", name: "Facebook", icon: "/brand/facebook.svg" },
  { id: "tg", name: "Telegram", icon: "/brand/telegram.svg" },
  { id: "sms", name: "Messages", icon: "/brand/sms.svg" },
  { id: "copy", name: "Copy link", icon: "/brand/copy.svg" },
  { id: "more", name: "More", icon: "/brand/more.svg" },
];

const mobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const ios = () => /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

/** The link with a ?s= tag so Link insights can count where visitors came from. */
const tagged = (url: string, dest: ShareDest) => {
  const tag = dest === "wa" || dest === "ig" || dest === "sc" ? dest : "";
  if (!tag) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("s", tag);
    return u.toString();
  } catch {
    return url;
  }
};

const go = (href: string) => {
  // a new tab on desktop; on phones the same tab, so the app's universal link opens the app itself
  if (mobile()) window.location.href = href;
  else window.open(href, "_blank", "noopener,noreferrer");
};

const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const t = document.createElement("textarea");
    t.value = text;
    t.style.position = "fixed";
    t.style.opacity = "0";
    document.body.appendChild(t);
    t.select();
    const ok = document.execCommand("copy");
    t.remove();
    return ok;
  }
};

const download = (files: File[]) =>
  files.forEach((f, i) =>
    setTimeout(() => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(f);
      a.download = f.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }, i * 400),
  );

/** The phone's share sheet: images when given (and the phone can share them), else the text and link. */
async function sheet(p: Payload, url: string): Promise<ShareResult | null> {
  if (!navigator.share) return null;
  const files = p.files?.length && navigator.canShare?.({ files: p.files }) ? p.files : null;
  try {
    await navigator.share(files ? { files, text: p.text ? p.text + " " + url : url } : { text: p.text, url });
    return "shared";
  } catch (e) {
    return (e as Error)?.name === "AbortError" ? "cancelled" : null;
  }
}

async function open(dest: ShareDest, p: Payload): Promise<ShareResult> {
  const url = tagged(p.url, dest);
  const text = p.text ?? "";
  const msg = (text ? text + " " : "") + url;
  const e = encodeURIComponent;
  switch (dest) {
    case "wa":
      if (p.files?.length) return (await sheet(p, url)) ?? (go("https://wa.me/?text=" + e(msg)), "opened");
      go("https://wa.me/?text=" + e(msg));
      return "opened";
    case "tg":
      go("https://t.me/share/url?url=" + e(url) + (text ? "&text=" + e(text) : ""));
      return "opened";
    case "x":
      go("https://x.com/intent/post?text=" + e(text) + "&url=" + e(url));
      return "opened";
    case "fb":
      go("https://www.facebook.com/sharer/sharer.php?u=" + e(url));
      return "opened";
    case "sc":
      if (p.files?.length) {
        const r = await sheet(p, url);
        if (r) return r;
      }
      go("https://www.snapchat.com/share?link=" + e(url));
      return "opened";
    case "sms":
      window.location.href = (ios() ? "sms:&body=" : "sms:?body=") + e(msg);
      return "opened";
    case "ig":
    case "tt": {
      const r = await sheet(p, url);
      if (r) return r;
      await copy(msg);
      if (mobile()) window.location.href = dest === "ig" ? "instagram://story-camera" : "snssdk1233://";
      else window.open(dest === "ig" ? "https://www.instagram.com/" : "https://www.tiktok.com/upload", "_blank", "noopener,noreferrer");
      return "copied";
    }
    case "save":
      if (p.files?.length) {
        download(p.files);
        return "saved";
      }
      return (await copy(msg)) ? "copied" : "failed";
    case "copy":
      return (await copy(url)) ? "copied" : "failed";
    case "more":
    default:
      return (await sheet(p, url)) ?? ((await copy(msg)) ? "copied" : "failed");
  }
}

/** Exposes window.skShare. Renders nothing. */
export function ShareKit() {
  useEffect(() => {
    window.skShare = { open, DESTS };
  }, []);
  return null;
}
