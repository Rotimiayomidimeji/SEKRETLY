// Shrinks the UI kit's PNGs in public/sk in place (same names, so nothing that points at them changes).
//   node scripts/optimize-images.mjs
// The 3D emoji are shown at 96px at most, so 288px (3x for sharp phone screens) is plenty; the hero art keeps
// its size and is only recompressed. A file is replaced only when the new one is smaller.
import fs from "node:fs";
import path from "node:path";

import sharp from "sharp";

const DIR = path.join(process.cwd(), "public", "sk");
const MAX = 288;
let before = 0, after = 0;

for (const name of fs.readdirSync(DIR).filter((f) => f.endsWith(".png"))) {
  const file = path.join(DIR, name);
  const src = fs.readFileSync(file);
  const hero = name.startsWith("hero-");
  let img = sharp(src);
  const { width = 0, height = 0 } = await img.metadata();
  if (!hero && Math.max(width, height) > MAX) img = img.resize({ width: MAX, height: MAX, fit: "inside" });
  const out = await img.png(hero ? { compressionLevel: 9, effort: 10 } : { compressionLevel: 9, effort: 10, palette: true, quality: 92 }).toBuffer();
  before += src.length;
  if (out.length < src.length) {
    fs.writeFileSync(file, out);
    after += out.length;
  } else after += src.length;
}
console.log(`public/sk: ${(before / 1048576).toFixed(2)} MB -> ${(after / 1048576).toFixed(2)} MB`);
