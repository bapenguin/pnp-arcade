// The VGA 8x16 text-mode font as 256 one-bit glyphs, made at startup from the
// Web437_IBM_VGA_8x16 webfont (VileR, https://int10h.org/oldschool-pc-fonts/,
// CC BY-SA 4.0: see font/LICENSE.txt). The outline font is made of square pixel
// blocks, so it can be read back as exact bitmaps, and the screen then scales up with
// no blur from font smoothing.

import { CP437 } from './cp437';

export const GLYPH_W = 8;
export const GLYPH_H = 16;

/** glyphs[byte] is GLYPH_W * GLYPH_H bytes, 1 where the pixel is lit. */
export type Glyphs = Uint8Array[];

export async function loadFont(): Promise<Glyphs> {
  const url = new URL('./font/Web437_IBM_VGA_8x16.woff', import.meta.url).href;
  const face = new FontFace('QB VGA', `url(${url})`);
  await face.load();
  document.fonts.add(face);

  // Drawn 8x bigger and sampled at the centre of each 8x8 block. Browsers smear glyph
  // edges by about a pixel (Windows especially), which at 16px closes up the gaps in
  // letters like W; at 128px it only touches the outer rim of each block.
  const S = 8;
  const c = document.createElement('canvas');
  c.width = GLYPH_W * S * 2;
  c.height = GLYPH_H * S * 3;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.font = `${16 * S}px "QB VGA"`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff';

  // Calibrate where the font puts its cell: the full block fills all of it.
  const BASE = GLYPH_H * S * 2;
  const PAD = (GLYPH_W * S) / 2;
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
    const px = ctx.getImageData(0, 0, GLYPH_W * S, GLYPH_H * S).data;
    const g = new Uint8Array(GLYPH_W * GLYPH_H);
    for (let y = 0; y < GLYPH_H; y++) {
      for (let x = 0; x < GLYPH_W; x++) {
        const i = ((y * S + S / 2) * GLYPH_W * S + x * S + S / 2) * 4;
        g[y * GLYPH_W + x] = px[i + 3] > 127 ? 1 : 0;
      }
    }
    return g;
  });
}
