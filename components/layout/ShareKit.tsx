"use client";

import { useEffect } from "react";

// One way to share a link (and optionally images) from any screen: window.skShare.open(dest, { url, text, files }).
// Tapping an app's icon goes to that app, never the phone's share sheet (that's what "More" is for):
//   · links: WhatsApp, Telegram, Snapchat, X and Facebook open their own "post / send to" screen with the link filled
//     in. Instagram and TikTok can't take a link from a website, so it's copied and the app opened to paste it.
//   · images: no website can hand a picture straight to an app, so they're saved to the phone and the app opened to
//     pick them from the gallery (iPhones save to Files rather than Photos, so there they go through the share sheet).
// On Android the app is opened with an intent (the website if the app isn't installed); on iPhones with the app's own
// address, falling back to the website when nothing answers.
// The icons live in /public/brand/<dest>.svg; the ported screens show them as plain round buttons, no labels.

export type ShareDest = "wa" | "ig" | "sc" | "x" | "fb" | "tg" | "tt" | "sms" | "more" | "copy" | "save";
export type ShareResult = "opened" | "shared" | "copied" | "saved" | "cancelled" | "failed";
type Payload = { url: string; text?: string; files?: File[] };
type AppDest = "wa" | "ig" | "sc" | "x" | "fb" | "tg" | "tt";

declare global {
  interface Window {
    skShare?: {
      open: (dest: ShareDest, p: Payload) => Promise<ShareResult>;
      /** Opens an app on its main or camera screen (after the images were saved). "app" on phones, "web" elsewhere. */
      app: (dest: AppDest, delay?: number) => "app" | "web";
      DESTS: { id: ShareDest; name: string; icon: string }[];
    };
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

const android = () => /Android/i.test(navigator.userAgent);

/** Where an app opens: Android intent, iPhone address, and the website for computers (and as the fallback). */
type Target = { android: string; ios: string; web: string };
const intent = (path: string, scheme: string, pkg: string, web: string) =>
  "intent://" + path + "#Intent;scheme=" + scheme + ";package=" + pkg + ";S.browser_fallback_url=" + encodeURIComponent(web) + ";end";

/** The app on its own (to pick saved images): a new post, story camera or chat list. */
const APP: Record<AppDest, Target> = {
  wa: { android: intent("send", "whatsapp", "com.whatsapp", "https://web.whatsapp.com/"), ios: "whatsapp://send", web: "https://web.whatsapp.com/" },
  ig: { android: intent("story-camera", "instagram", "com.instagram.android", "https://www.instagram.com/"), ios: "instagram://story-camera", web: "https://www.instagram.com/" },
  sc: { android: intent("", "snapchat", "com.snapchat.android", "https://web.snapchat.com/"), ios: "snapchat://", web: "https://web.snapchat.com/" },
  tt: { android: intent("", "snssdk1233", "com.zhiliaoapp.musically", "https://www.tiktok.com/upload"), ios: "snssdk1233://", web: "https://www.tiktok.com/upload" },
  x: { android: intent("post", "twitter", "com.twitter.android", "https://x.com/compose/post"), ios: "twitter://post", web: "https://x.com/compose/post" },
  fb: { android: intent("feed", "fb", "com.facebook.katana", "https://www.facebook.com/"), ios: "fb://feed", web: "https://www.facebook.com/" },
  tg: { android: intent("", "tg", "org.telegram.messenger", "https://web.telegram.org/"), ios: "tg://", web: "https://web.telegram.org/" },
};

/** Opens a target: the app on phones (the website if it isn't installed), a new tab on computers. */
function launch(t: Target, delay = 0): "app" | "web" {
  if (!mobile()) {
    window.open(t.web, "_blank", "noopener,noreferrer");
    return "web";
  }
  setTimeout(() => {
    if (android()) {
      window.location.href = t.android;
      return;
    }
    // iPhones: nothing happens when the app isn't there, so the website follows if the page is still showing
    window.location.href = t.ios;
    setTimeout(() => {
      if (document.visibilityState === "visible") window.location.href = t.web;
    }, 1600);
  }, delay);
  return "app";
}

/** Saves the images, then opens the app to pick them (iPhones: the share sheet, see the note at the top). */
async function imagesTo(dest: AppDest, p: Payload, url: string): Promise<ShareResult> {
  if (ios()) return (await sheet(p, url)) ?? "failed";
  download(p.files!);
  launch(APP[dest], p.files!.length * 400 + 700);
  return "saved";
}

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
  if (p.files?.length && dest in APP) return imagesTo(dest as AppDest, p, url);
  switch (dest) {
    case "wa":
      go("https://wa.me/?text=" + e(msg));
      return "opened";
    case "tg":
      go("https://t.me/share/url?url=" + e(url) + (text ? "&text=" + e(text) : ""));
      return "opened";
    case "x": {
      const web = "https://x.com/intent/post?text=" + e(text) + "&url=" + e(url);
      launch({ android: intent("post?message=" + e(msg), "twitter", "com.twitter.android", web), ios: "twitter://post?message=" + e(msg), web });
      return "opened";
    }
    case "fb": {
      const web = "https://www.facebook.com/sharer/sharer.php?u=" + e(url);
      launch({ android: intent("www.facebook.com/sharer/sharer.php?u=" + e(url), "https", "com.facebook.katana", web), ios: "fb://facewebmodal/f?href=" + e(web), web });
      return "opened";
    }
    case "sc":
      go("https://www.snapchat.com/share?link=" + e(url));
      return "opened";
    case "sms":
      window.location.href = (ios() ? "sms:&body=" : "sms:?body=") + e(msg);
      return "opened";
    case "ig":
    case "tt":
      // no way to hand these apps a link: it's copied, and the app opens (story camera / new post) to paste it
      await copy(msg);
      launch(APP[dest], 150);
      return "copied";
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
    window.skShare = { open, app: (dest, delay) => launch(APP[dest], delay), DESTS };
  }, []);
  return null;
}
