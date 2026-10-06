// Draws the text screen onto a canvas: 640x400 of 8x16 glyphs inside a border (the
// overscan area COLOR's third argument sets). The source image is scaled up "sharp
// bilinear": first by a whole number with no smoothing, then smoothly to the final
// size, so text stays crisp at any window size without uneven pixel widths.

import { GLYPH_H, GLYPH_W, type Glyphs } from './font';
import { COLS, PALETTE, ROWS, type TextScreen } from './screen';

export const TEXT_W = COLS * GLYPH_W; // 640
export const TEXT_H = ROWS * GLYPH_H; // 400
export const BORDER = 16;
export const SRC_W = TEXT_W + BORDER * 2;
export const SRC_H = TEXT_H + BORDER * 2;

// The VGA cursor and blink attribute flip roughly every 16 and 32 frames at 70 Hz.
const CURSOR_MS = 230;
const BLINK_MS = 460;

export class Renderer {
  private src = document.createElement('canvas');
  private srcCtx: CanvasRenderingContext2D;
  private image: ImageData;
  private mid = document.createElement('canvas');
  private midCtx: CanvasRenderingContext2D;
  private ctx: CanvasRenderingContext2D;
  private lastCursor = false;
  private lastBlink = false;

  constructor(
    readonly canvas: HTMLCanvasElement,
    private screen: TextScreen,
    private glyphs: Glyphs,
  ) {
    this.src.width = SRC_W;
    this.src.height = SRC_H;
    this.srcCtx = this.src.getContext('2d')!;
    this.image = this.srcCtx.createImageData(SRC_W, SRC_H);
    this.midCtx = this.mid.getContext('2d')!;
    this.ctx = canvas.getContext('2d')!;
    const frame = () => {
      this.draw();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /** Sizes the canvas's backing store to its on-screen size in device pixels. */
  resize(cssW: number, cssH: number): void {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.style.width = `${cssW}px`;
    this.canvas.style.height = `${cssH}px`;
    this.canvas.width = Math.round(cssW * dpr);
    this.canvas.height = Math.round(cssH * dpr);
    const k = Math.max(1, Math.ceil(Math.max(this.canvas.width / SRC_W, this.canvas.height / SRC_H)));
    this.mid.width = SRC_W * k;
    this.mid.height = SRC_H * k;
    this.screen.dirty = true;
  }

  private draw(): void {
    const t = performance.now();
    const cursor = this.screen.cursorVisible && Math.floor(t / CURSOR_MS) % 2 === 0;
    const blink = Math.floor(t / BLINK_MS) % 2 === 0;
    if (!this.screen.dirty && cursor === this.lastCursor && blink === this.lastBlink) return;
    this.screen.dirty = false;
    this.lastCursor = cursor;
    this.lastBlink = blink;
    this.paint(cursor, blink);
    this.srcCtx.putImageData(this.image, 0, 0);
    this.midCtx.imageSmoothingEnabled = false;
    this.midCtx.drawImage(this.src, 0, 0, this.mid.width, this.mid.height);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.drawImage(this.mid, 0, 0, this.canvas.width, this.canvas.height);
  }

  private paint(cursor: boolean, blink: boolean): void {
    const s = this.screen;
    const d = this.image.data;
    const [br, bgc, bb] = PALETTE[s.border];
    for (let i = 0; i < d.length; i += 4) {
      d[i] = br;
      d[i + 1] = bgc;
      d[i + 2] = bb;
      d[i + 3] = 255;
    }
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cell = row * COLS + col;
        const glyph = this.glyphs[s.chars[cell]];
        let fore = s.fg[cell];
        if (fore >= 16) fore = blink ? fore - 16 : s.bg[cell];
        const [fr, fgc, fb] = PALETTE[fore & 15];
        const [kr, kg, kb] = PALETTE[s.bg[cell]];
        const isCursor = cursor && row === s.row - 1 && col === s.col - 1;
        const x0 = BORDER + col * GLYPH_W;
        const y0 = BORDER + row * GLYPH_H;
        for (let gy = 0; gy < GLYPH_H; gy++) {
          let p = ((y0 + gy) * SRC_W + x0) * 4;
          for (let gx = 0; gx < GLYPH_W; gx++, p += 4) {
            // The DOS cursor: an underline on the last two scanlines of the cell.
            const on = glyph[gy * GLYPH_W + gx] === 1 || (isCursor && gy >= GLYPH_H - 2);
            d[p] = on ? fr : kr;
            d[p + 1] = on ? fgc : kg;
            d[p + 2] = on ? fb : kb;
          }
        }
      }
    }
  }
}
