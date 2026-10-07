// The graphics screens, both 320x200 with PRINT in the 8x8 font on a 40x25 grid:
//  - SCREEN 13: 256 colours, in the VGA's default palette.
//  - SCREEN 1: CGA's 4 colours. Colour 0 is the background (any of the 16, set with
//    COLOR bg), and 1-3 come from palette 0 or 1 (COLOR , pal). PRINT always uses 3.
// LINE (with B, BF and a line style), PSET, CIRCLE, PAINT and GET/PUT behave as in
// QuickBASIC, which is enough for the Jimmy intros.

import type { Glyphs } from './font';

export const GFX_W = 320;
export const GFX_H = 200;
const COLS = 40;
const ROWS = 25;

/** The VGA's power-on 256-colour palette, as [r, g, b] (0-255). */
export const VGA_PALETTE: [number, number, number][] = (() => {
  const six = (v: number) => Math.round((v * 255) / 63);
  const p: [number, number, number][] = [];
  // 0-15: the 16 text colours.
  const ega = [
    [0, 0, 0], [0, 0, 42], [0, 42, 0], [0, 42, 42], [42, 0, 0], [42, 0, 42], [42, 21, 0], [42, 42, 42],
    [21, 21, 21], [21, 21, 63], [21, 63, 21], [21, 63, 63], [63, 21, 21], [63, 21, 63], [63, 63, 21], [63, 63, 63],
  ];
  for (const [r, g, b] of ega) p.push([six(r), six(g), six(b)]);
  // 16-31: a grey ramp.
  for (const v of [0, 5, 8, 11, 14, 17, 20, 24, 28, 32, 36, 40, 45, 50, 56, 63]) p.push([six(v), six(v), six(v)]);
  // 32-247: nine runs of 24 hues (blue → magenta → red → yellow → green → cyan), at three
  // brightnesses with three levels of saturation each.
  for (const [hi, lo] of [[63, 0], [63, 31], [63, 45], [28, 0], [28, 14], [28, 20], [16, 0], [16, 8], [16, 11]]) {
    const [, s1, s2, s3] = [0, 1, 2, 3].map((k) => Math.round(lo + ((hi - lo) * k) / 4));
    const n = (v: number, k: number) => Array<number>(k).fill(v);
    // Index 0 of each run is blue, 4 magenta, 8 red, 12 yellow, 16 green, 20 cyan.
    const r = [lo, s1, s2, s3, ...n(hi, 9), s3, s2, s1, ...n(lo, 8)];
    const g = [...n(lo, 9), s1, s2, s3, ...n(hi, 9), s3, s2, s1];
    const b = [...n(hi, 5), s3, s2, s1, ...n(lo, 9), s1, s2, s3, ...n(hi, 4)];
    for (let i = 0; i < 24; i++) p.push([six(r[i]), six(g[i]), six(b[i])]);
  }
  // 248-255: black.
  while (p.length < 256) p.push([0, 0, 0]);
  return p;
})();

/** CGA's palettes in SCREEN 1, as VGA shows them: the high-intensity sets. */
const CGA_PALETTES = [
  [10, 12, 14], // 0: light green, light red, yellow
  [11, 13, 15], // 1: light cyan, light magenta, white
];

/** A GET (x1,y1)-(x2,y2) image, for PUT. */
export interface Sprite {
  w: number;
  h: number;
  pixels: Uint8Array;
}

export class Gfx {
  readonly pixels = new Uint8Array(GFX_W * GFX_H);
  row = 1;
  col = 1;
  fore: number;
  /** SCREEN 1: the background colour (0-15) and the palette (0 or 1). */
  back = 0;
  palette = 1;
  dirty = true;
  private pendingWrap = false;

  constructor(
    private glyphs: Glyphs,
    readonly mode: 1 | 13 = 13,
  ) {
    this.fore = mode === 1 ? 3 : 15;
  }

  cls(): void {
    this.pixels.fill(0);
    this.row = 1;
    this.col = 1;
    this.pendingWrap = false;
    this.dirty = true;
  }

  /** SCREEN 13: COLOR fore. SCREEN 1: COLOR background, palette (odd = palette 1). */
  color(a?: number, b?: number): void {
    if (this.mode === 13) {
      if (a !== undefined) this.fore = a & 255;
      return;
    }
    if (a !== undefined) this.back = a & 15;
    if (b !== undefined) this.palette = b & 1;
    this.dirty = true;
  }

  /** The [r, g, b] a pixel value shows as. */
  rgb(c: number): [number, number, number] {
    if (this.mode === 13) return VGA_PALETTE[c];
    return VGA_PALETTE[c & 3 ? CGA_PALETTES[this.palette][(c & 3) - 1] : this.back];
  }

  /** GET (x1,y1)-(x2,y2), array. */
  get(x1: number, y1: number, x2: number, y2: number): Sprite {
    const [ax, bx] = [Math.min(x1, x2), Math.max(x1, x2)].map(Math.round);
    const [ay, by] = [Math.min(y1, y2), Math.max(y1, y2)].map(Math.round);
    const w = bx - ax + 1, h = by - ay + 1;
    const pixels = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) pixels[y * w + x] = this.pixels[(ay + y) * GFX_W + ax + x];
    return { w, h, pixels };
  }

  /** PUT (x,y), array[, action]. QB's default action is XOR, so a second PUT erases. */
  put(x: number, y: number, s: Sprite, action: 'XOR' | 'PSET' | 'PRESET' | 'AND' | 'OR' = 'XOR'): void {
    x = Math.round(x);
    y = Math.round(y);
    // QB stops with "Illegal function call" if the image would go off the screen.
    if (x < 0 || y < 0 || x + s.w > GFX_W || y + s.h > GFX_H) throw new Error('Illegal function call');
    const mask = this.mode === 1 ? 3 : 255;
    for (let sy = 0; sy < s.h; sy++) {
      for (let sx = 0; sx < s.w; sx++) {
        const i = (y + sy) * GFX_W + x + sx, p = s.pixels[sy * s.w + sx], d = this.pixels[i];
        this.pixels[i] =
          action === 'XOR' ? d ^ p : action === 'PSET' ? p : action === 'PRESET' ? ~p & mask : action === 'AND' ? d & p : d | p;
      }
    }
    this.dirty = true;
  }

  locate(row?: number, col?: number): void {
    if (row !== undefined) this.row = Math.min(Math.max(row, 1), ROWS);
    if (col !== undefined) this.col = Math.min(Math.max(col, 1), COLS);
    this.pendingWrap = false;
  }

  write(text: string, toByte: (ch: string) => number): void {
    for (const ch of text) {
      if (ch === '\n') {
        this.newline();
        continue;
      }
      if (this.pendingWrap) this.newline();
      this.glyph(toByte(ch), this.col - 1, this.row - 1);
      if (this.col === COLS) this.pendingWrap = true;
      else this.col++;
    }
    this.dirty = true;
  }

  newline(): void {
    this.pendingWrap = false;
    this.col = 1;
    if (this.row < ROWS) this.row++;
    else {
      // A new line on the bottom row scrolls the whole screen, as in text mode.
      this.pixels.copyWithin(0, GFX_W * 8);
      this.pixels.fill(0, GFX_W * 8 * (ROWS - 1));
    }
    this.dirty = true;
  }

  pset(x: number, y: number, c = this.fore): void {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= GFX_W || y >= GFX_H) return;
    this.pixels[y * GFX_W + x] = c;
    this.dirty = true;
  }

  /** LINE (x1,y1)-(x2,y2), c, [B|BF], style: style is a 16-bit on/off pattern. */
  line(x1: number, y1: number, x2: number, y2: number, c = this.fore, box?: 'B' | 'BF', style = 0xffff): void {
    if (box === 'BF') {
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) this.pset(x, y, c);
      return;
    }
    if (box === 'B') {
      this.line(x1, y1, x2, y1, c, undefined, style);
      this.line(x2, y1, x2, y2, c, undefined, style);
      this.line(x2, y2, x1, y2, c, undefined, style);
      this.line(x1, y2, x1, y1, c, undefined, style);
      return;
    }
    // Bresenham, with the style pattern applied pixel by pixel (top bit first).
    let x = Math.round(x1), y = Math.round(y1);
    const ex = Math.round(x2), ey = Math.round(y2);
    const dx = Math.abs(ex - x), dy = -Math.abs(ey - y);
    const sx = x < ex ? 1 : -1, sy = y < ey ? 1 : -1;
    let err = dx + dy, bit = 15;
    for (;;) {
      if ((style >> bit) & 1) this.pset(x, y, c);
      bit = (bit + 15) % 16;
      if (x === ex && y === ey) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
  }

  /** CIRCLE (x,y), r, c. SCREEN 13's pixels are taller than wide, so QB squashes y by 5/6. */
  circle(cx: number, cy: number, r: number, c = this.fore): void {
    const steps = Math.max(16, Math.ceil(r * 8));
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      this.pset(cx + Math.cos(a) * r, cy + Math.sin(a) * r * (5 / 6), c);
    }
  }

  /** PAINT (x,y), fill, border: flood-fills outwards until it meets the border colour. */
  paint(x: number, y: number, fill: number, border: number): void {
    const stack = [[Math.round(x), Math.round(y)]];
    const seen = new Uint8Array(GFX_W * GFX_H);
    while (stack.length) {
      const [px, py] = stack.pop()!;
      if (px < 0 || py < 0 || px >= GFX_W || py >= GFX_H) continue;
      const i = py * GFX_W + px;
      if (seen[i] || this.pixels[i] === border) continue;
      seen[i] = 1;
      this.pixels[i] = fill;
      stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
    }
    this.dirty = true;
  }

  private glyph(byte: number, col: number, row: number): void {
    const g = this.glyphs[byte];
    for (let gy = 0; gy < 8; gy++) {
      let i = (row * 8 + gy) * GFX_W + col * 8;
      for (let gx = 0; gx < 8; gx++, i++) this.pixels[i] = g[gy * 8 + gx] ? this.fore : 0;
    }
  }
}
