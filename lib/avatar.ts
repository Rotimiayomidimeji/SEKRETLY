// The background behind a member's animal: their own colour (a hue picked in Profile) or the animal's own.

const ANIMAL_BG: Record<string, string> = {
  fox: "linear-gradient(135deg,#ffb35c,#ff5f8f)",
  panda: "linear-gradient(135deg,#7ef0c1,#3aa0ff)",
  frog: "linear-gradient(135deg,#d6ff6b,#22c4a0)",
  octopus: "linear-gradient(135deg,#ffd0f0,#a46bff)",
  unicorn: "linear-gradient(135deg,#9fe7ff,#ff9ad5)",
  koala: "linear-gradient(135deg,#ffe48a,#ff8a5c)",
};

/** Same formula as the Profile screen's colour slider. */
export const hueBg = (h: number) => `linear-gradient(135deg,hsl(${h},90%,66%),hsl(${(h + 40) % 360},85%,48%))`;

export const avatarBg = (avatar: string, hue: number | null | undefined) => (hue == null ? ANIMAL_BG[avatar] ?? ANIMAL_BG.fox : hueBg(hue));
