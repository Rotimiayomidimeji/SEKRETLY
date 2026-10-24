import "server-only";

import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

// App-wide switches kept in AppSetting: report categories (Admin › Categories) and ad slots (Admin › Ads).

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db.appSetting.findUnique({ where: { key } });
  return row ? { ...fallback, ...(row.value as object) } : fallback;
}

export async function setSetting(key: string, value: unknown) {
  await db.appSetting.upsert({ where: { key }, create: { key, value: value as Prisma.InputJsonValue }, update: { value: value as Prisma.InputJsonValue } });
}

export const BASE_CATEGORIES = ["Abusive", "Harassment", "Bullying", "Insults", "Threats", "Intimidation", "Hate speech", "Racism", "Tribalism", "Religious hate", "Sexism", "Body shaming", "Disability mockery", "Sexual content", "Unwanted nudity", "Explicit photo", "Explicit video", "Non-consensual image", "Unwanted advances", "Creepy or inappropriate", "Grooming concern", "Underage concern", "Stalking", "Doxxing / private info", "Exposing secrets", "Blackmail", "Extortion", "Impersonation", "Scam", "Fraud", "Phishing link", "Malware link", "Spam", "Flooding", "Advertising", "Selling things", "Gambling promo", "Drugs", "Weapons", "Violence", "Graphic gore", "Self-harm", "Suicide talk", "Misinformation", "False rumour", "Defamation", "Trolling", "Mocking", "Profanity", "Other harmful"];
export const BASE_SERIOUS = ["Threats", "Grooming concern", "Underage concern", "Non-consensual image", "Blackmail", "Extortion", "Self-harm", "Suicide talk", "Weapons"];

export type CategoryConfig = {
  minS: number;
  maxS: number;
  extraCats: string[];
  inactive: Record<string, boolean>;
  seriousOver: Record<string, boolean>;
  added: Record<string, string[]>;
  deleted: Record<string, Record<string, boolean>>;
};
export const DEFAULT_CATEGORIES: CategoryConfig = { minS: 5, maxS: 10, extraCats: [], inactive: {}, seriousOver: {}, added: {}, deleted: {} };

export const categoryConfig = () => getSetting("categories", DEFAULT_CATEGORIES);

/** The categories reporters can pick from right now. */
export async function activeCategories() {
  const c = await categoryConfig();
  return { list: [...BASE_CATEGORIES, ...c.extraCats].filter((x) => !c.inactive[x]), min: c.minS, max: c.maxS };
}

export async function isSerious(category: string) {
  const c = await categoryConfig();
  return c.seriousOver[category] !== undefined ? c.seriousOver[category] : BASE_SERIOUS.includes(category);
}

/** The warning wording for a category, picked at random from the admin's set (same templates as Admin › Categories). */
export async function warningText(category: string, receiver: string, n: number) {
  const c = await categoryConfig();
  const T = [
    "Your message to {receiver} was reported as “" + category + "”.",
    "{receiver} flagged something you sent as “" + category + "”.",
    "Heads up: a message you sent was marked “" + category + "” by the person who got it.",
    "A message you sent to {receiver} was reported for “" + category + "”.",
    "{receiver} reported one of your messages as “" + category + "”.",
  ];
  const S = [" This is warning {n} of 3.", " After 3 warnings, the next report blocks you from messaging {receiver}.", " Keep it respectful.", " Think before you send next time.", " Warning {n} of 3. You can still message others as normal."];
  const all = T.flatMap((t) => S.map((x) => t + x)).concat(c.added[category] ?? []).filter((t) => !c.deleted[category]?.[t]);
  const pick = all[Math.floor(Math.random() * all.length)] ?? T[0] + S[0];
  return pick.replace(/\{receiver\}/g, "@" + receiver).replace(/\{n\}/g, String(n));
}

/** Ad slots (Admin › Ads). Nothing shows until the master switch is on. */
export type AdsConfig = { master: boolean; slots: Record<string, boolean> };
export const DEFAULT_ADS: AdsConfig = {
  master: process.env.NEXT_PUBLIC_ADS === "on",
  slots: { sent: true, paused: true, inbox: true, home: true, rail: true, lobby: true, over: true, list: true, notif: false, settings: true, content: true, quiz: true, hint: true, insights: true, studio: true, notfound: false },
};
export const adsConfig = () => getSetting("ads", DEFAULT_ADS);

/** "on" or "off" for a screen's data-ads attribute. */
export async function adsFlag(slot: string) {
  const a = await adsConfig();
  return a.master && a.slots[slot] !== false ? "on" : "off";
}
