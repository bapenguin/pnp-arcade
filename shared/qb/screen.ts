// SCREEN 0: the 80x25 text screen, as QuickBASIC's PRINT, LOCATE, COLOR and CLS saw it.
// Rows and columns are 1-based like in BASIC. Printing past column 80 wraps, and a new
// line on row 25 scrolls the whole screen up (the classic reason QB programs end a PRINT
// on the bottom row with a semicolon).

import { cp437Byte } from './cp437';

export const COLS = 80;
export const ROWS = 25;

/** The 16 text-mode colours (CGA/EGA/VGA defaults), as [r, g, b]. */
export const PALETTE: [number, number, number][] = [
  [0x00, 0x00, 0x00], [0x00, 0x00, 0xaa], [0x00, 0xaa, 0x00], [0x00, 0xaa, 0xaa],
  [0xaa, 0x00, 0x00], [0xaa, 0x00, 0xaa], [0xaa, 0x55, 0x00], [0xaa, 0xaa, 0xaa],
  [0x55, 0x55, 0x55], [0x55, 0x55, 0xff], [0x55, 0xff, 0x55], [0x55, 0xff, 0xff],
  [0xff, 0x55, 0x55], [0xff, 0x55, 0xff], [0xff, 0xff, 0x55], [0xff, 0xff, 0xff],
];

export class TextScreen {
  /** CP437 byte per cell, row-major. */
  readonly chars = new Uint8Array(COLS * ROWS);
  /** Foreground 0-31 (16+ blinks) per cell. */
  readonly fg = new Uint8Array(COLS * ROWS);
  /** Background 0-7 per cell. */
  readonly bg = new Uint8Array(COLS * ROWS);

  row = 1;
  col = 1;
  fore = 7;
  back = 0;
  border = 0;
  cursorVisible = false;
  /** Set on every change; the renderer clears it. */
  dirty = true;
  // After printing in column 80 the cursor waits there; the next character wraps.
  private pendingWrap = false;

  constructor() {
    this.cls();
  }

  cls(): void {
    this.chars.fill(32);
    this.fg.fill(this.fore);
    this.bg.fill(this.back);
    this.row = 1;
    this.col = 1;
    this.pendingWrap = false;
    this.dirty = true;
  }

  color(fore?: number, back?: number, border?: number): void {
    if (fore !== undefined) this.fore = fore & 31;
    if (back !== undefined) this.back = back & 7;
    if (border !== undefined) this.border = border & 15;
    this.dirty = true;
  }

  locate(row?: number, col?: number): void {
    if (row !== undefined) this.row = Math.min(Math.max(row, 1), ROWS);
    if (col !== undefined) this.col = Math.min(Math.max(col, 1), COLS);
    this.pendingWrap = false;
  }

  /** PRINT ...; (no line break). */
  write(text: string): void {
    for (const ch of text) {
      if (ch === '\n') {
        this.newline();
        continue;
      }
      if (this.pendingWrap) this.newline();
      const i = (this.row - 1) * COLS + (this.col - 1);
      this.chars[i] = cp437Byte(ch);
      this.fg[i] = this.fore;
      this.bg[i] = this.back;
      if (this.col === COLS) this.pendingWrap = true;
      else this.col++;
    }
    this.dirty = true;
  }

  /** PRINT ... (with a line break). */
  print(text = ''): void {
    this.write(text);
    this.newline();
  }

  /** TAB(n): move to column n, on the next line if the cursor is already past it. */
  tab(col: number): void {
    if (this.pendingWrap || this.col > col) this.newline();
    while (this.col < col) this.write(' ');
  }

  newline(): void {
    this.pendingWrap = false;
    this.col = 1;
    if (this.row < ROWS) this.row++;
    else this.scroll();
    this.dirty = true;
  }

  /** Moves the cursor back one cell and blanks it (INPUT's backspace). */
  backspace(): void {
    if (this.pendingWrap) this.pendingWrap = false;
    else if (this.col > 1) this.col--;
    else if (this.row > 1) {
      this.row--;
      this.col = COLS;
    }
    const i = (this.row - 1) * COLS + (this.col - 1);
    this.chars[i] = 32;
    this.dirty = true;
  }

  /** The text of a row (1-based), for finding menu choices on screen. */
  rowText(row: number): string {
    let s = '';
    for (let c = 0; c < COLS; c++) s += String.fromCharCode(this.chars[(row - 1) * COLS + c]);
    return s;
  }

  private scroll(): void {
    const n = (ROWS - 1) * COLS;
    this.chars.copyWithin(0, COLS);
    this.fg.copyWithin(0, COLS);
    this.bg.copyWithin(0, COLS);
    this.chars.fill(32, n, n + COLS);
    this.fg.fill(this.fore, n, n + COLS);
    this.bg.fill(this.back, n, n + COLS);
  }
}

/** How QB prints a number: a leading space for the sign, and a space after. */
export function qbNum(n: number): string {
  return `${n < 0 ? '-' : ' '}${Math.abs(n)} `;
}
