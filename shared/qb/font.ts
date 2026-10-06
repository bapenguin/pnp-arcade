// The PC's ROM fonts as 256 one-bit glyphs, made at startup from the Web437 webfonts
// (VileR, https://int10h.org/oldschool-pc-fonts/, CC BY-SA 4.0: see font/LICENSE.txt):
// the VGA 8x16 font for text mode, and the 8x8 font the graphics screens print with.
// The outline fonts are made of square pixel blocks, so they can be read back as exact
// bitmaps, and the screen then scales up with no blur from font smoothing.

import { CP437 } from './cp437';

export const GLYPH_W = 8;
export const GLYPH_H = 16;

/** glyphs[byte] is 8 * height bytes, 1 where the pixel is lit. */
export type Glyphs = Uint8Array[];

const FONTS = {
  16: new URL('./font/Web437_IBM_VGA_8x16.woff', import.meta.url).href,
  8: new URL('./font/Web437_IBM_EGA_8x8.woff', import.meta.url).href,
};

export async function loadFont(height: 16 | 8 = 16): Promise<Glyphs> {
  const family = `QB ${height}`;
  const face = new FontFace(family, `url(${FONTS[height]})`);
  await face.load();
  document.fonts.add(face);

  // Drawn 8x bigger and sampled at the centre of each 8x8 block. Browsers smear glyph
  // edges by about a pixel (Windows especially), which at native size closes up the
  // gaps in letters like W; at 8x it only touches the outer rim of each block.
  const S = 8;
  const W = GLYPH_W;
  const c = document.createElement('canvas');
  c.width = W * S * 2;
  c.height = height * S * 3;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.font = `${height * S}px "${family}"`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff';

  // Calibrate where the font puts its cell: the full block fills all of it.
  const BASE = height * S * 2;
  const PAD = (W * S) / 2;
  ctx.fillText('█', PAD, BASE);
  const probe = ctx.getImageData(0, 0, c.width, c.height).data;
  let top = -1, left = c.width;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (probe[(y * c.width + x) * 4 + 3] > 127) {
        if (top < 0) top = y;
        left = Math.min(left, x);
      }
    }
  }
  const dx = PAD - left, dy = BASE - top;

  return CP437.map((ch) => {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillText(ch, dx, dy);
    const px = ctx.getImageData(0, 0, W * S, height * S).data;
    const g = new Uint8Array(W * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < W; x++) {
        const i = ((y * S + S / 2) * W * S + x * S + S / 2) * 4;
        g[y * W + x] = px[i + 3] > 127 ? 1 : 0;
      }
    }
    return g;
  });
}
