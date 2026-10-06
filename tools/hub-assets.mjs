// Makes the hub's web-sized images from the full-size brand art in art/brand/
// (which isn't deployed). Outputs are committed, so the site builds without this.
//
//   npm run hub-assets

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const brand = path.join(root, 'art', 'brand');
const out = path.join(root, 'assets');
fs.mkdirSync(out, { recursive: true });

// The electric banner for the hub header, in two widths for phones and desktops.
for (const w of [800, 1600]) {
  await sharp(path.join(brand, 'pnp-banner.png')).resize({ width: w }).webp({ quality: 82 }).toFile(path.join(out, `pnp-banner-${w}.webp`));
}

// Icons from the square logo: the transparent background keeps the glow.
for (const s of [32, 180, 192, 512]) {
  await sharp(path.join(brand, 'pnp-logo.png')).resize(s, s).png().toFile(path.join(out, `icon-${s}.png`));
}

// The coloured Star Detours cover (2005 restoration) for a decorative screen.
await sharp(path.join(root, 'art', 'comic', 'special_cover.jpg')).resize({ width: 600 }).webp({ quality: 80 }).toFile(path.join(out, 'star-detours-cover.webp'));

// The VGA font (VileR, int10h.org, CC BY-SA 4.0) for the text-mode game screens.
fs.copyFileSync(path.join(root, 'shared', 'qb', 'font', 'Web437_IBM_VGA_8x16.woff'), path.join(out, 'Web437_IBM_VGA_8x16.woff'));

console.log(`Wrote the hub images to ${path.relative(root, out)}.`);
