// The QuickBASIC statements a port calls, on top of the text screen, keyboard buffer,
// clock and synth. Game code reads close to the original:
//
//   qb.cls(); qb.print('JIMMY ENTERS THE HALL PRESS'); const move = await qb.input();
//
// PRINT, CLS, COLOR, LOCATE and TAB are immediate; INPUT, SLEEP, PLAY and the key reads
// are awaited. SCREEN 1 and 13 switch PRINT and friends to the graphics screen (`gfx`).

import { cp437Byte } from './cp437';
import type { Glyphs } from './font';
import { Gfx } from './gfx';
import type { Clock } from './clock';
import type { KeyBuffer } from './keys';
import type { Synth } from './play';
import type { Sfx } from './sfx';
import { qbNum, type TextScreen } from './screen';

/** What the program waits for: a line (INPUT), any key (SLEEP, "press any key"), or a single key (INKEY$). */
export type Waiting = 'run' | 'input' | 'sleep' | 'key' | 'inkey';
type Part = string | number;

const join = (parts: Part[]) => parts.map((p) => (typeof p === 'number' ? qbNum(p) : p)).join('');

export class QB {
  /** What the program is waiting for, so touch controls can offer the right buttons. */
  waiting: Waiting = 'run';
  /** Called whenever `waiting` changes. */
  onWait: (w: Waiting) => void = () => {};
  /** The graphics screen (SCREEN 1 or 13) while it's showing, else null (text mode). */
  gfx: Gfx | null = null;
  /** Set by the host: the 8x8 font for the graphics screens. */
  glyphs8: Glyphs | null = null;

  constructor(
    readonly screen: TextScreen,
    readonly keys: KeyBuffer,
    readonly clock: Clock,
    readonly synth: Synth,
    readonly sfx: Sfx,
  ) {}

  /** PRINT a; b; c (numbers get QB's spacing: " 455 "). */
  print(...parts: Part[]): void {
    this.write(...parts);
    if (this.gfx) this.gfx.newline();
    else this.screen.newline();
  }

  /** PRINT a; b; c;  (no line break). */
  write(...parts: Part[]): void {
    if (this.gfx) this.gfx.write(join(parts), cp437Byte);
    else this.screen.write(join(parts));
  }

  /** PRINT TAB(col); (text mode) */
  tab(col: number): void {
    this.screen.tab(col);
  }

  cls(): void {
    if (this.gfx) this.gfx.cls();
    else this.screen.cls();
  }

  color(fore?: number, back?: number, border?: number): void {
    // In SCREEN 1 the two arguments are the background colour and the palette.
    if (this.gfx) this.gfx.color(fore, back);
    else this.screen.color(fore, back, border);
  }

  locate(row?: number, col?: number): void {
    if (this.gfx) this.gfx.locate(row, col);
    else this.screen.locate(row, col);
  }

  /** SCREEN 0, 1 or 13. Whichever it is, the screen starts blank, as on the PC. */
  setScreen(mode: 0 | 1 | 13): void {
    if (mode) {
      this.gfx = new Gfx(this.glyphs8!, mode);
    } else {
      this.gfx = null;
      this.screen.color(7, 0, 0);
      this.screen.cls();
    }
    this.screen.dirty = true;
  }

  /** INPUT [prompt;] a$: prints "prompt? ", lets the player type a line, returns it trimmed. */
  async input(prompt = '', question = true): Promise<string> {
    this.write(prompt, question ? '? ' : '');
    let line = '';
    this.setWaiting('input');
    this.screen.cursorVisible = true;
    for (;;) {
      await this.clock.until(() => this.keys.length > 0);
      const k = this.keys.shift()!;
      if (k === 'Enter') break;
      if (k === 'Backspace') {
        if (line) {
          line = line.slice(0, -1);
          this.screen.backspace();
        }
      } else if (k === 'Escape') {
        while (line) {
          line = line.slice(0, -1);
          this.screen.backspace();
        }
      } else if (line.length < 255) {
        line += k;
        this.screen.write(k);
      }
      this.screen.dirty = true;
    }
    this.screen.cursorVisible = false;
    this.screen.newline();
    this.setWaiting('run');
    return line.trim();
  }

  /** INPUT a (a number): anything that isn't one gets QB's "Redo from start". Empty is 0. */
  async inputNumber(prompt = '', question = true): Promise<number> {
    for (;;) {
      const s = await this.input(prompt, question);
      if (s === '') return 0;
      if (/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return Number(s);
      this.print('Redo from start');
    }
  }

  /**
   * SLEEP [seconds]: waits, or until a key is pressed (no argument: just for a key).
   * The original SLEEP left that key in the buffer for the next INPUT to read. Here an
   * Enter (or a tap) is used up, so "Press ENTER" doesn't also answer the next question;
   * other keys still carry over, so typing a menu choice during a pause works as it did.
   */
  async sleep(seconds = 0): Promise<void> {
    const start = this.keys.presses;
    this.setWaiting('sleep');
    await this.clock.wait(seconds > 0 ? seconds * 1000 : Infinity, () => this.keys.presses > start);
    if (this.keys.presses > start && this.keys.last() === 'Enter') this.keys.dropLast();
    this.setWaiting('run');
  }

  /** INKEY$, waited on for up to `ms`: the next key pressed, or '' if none came. */
  async inkey(ms: number): Promise<string> {
    if (!this.keys.length) {
      this.setWaiting('inkey');
      await this.clock.wait(ms, () => this.keys.length > 0);
      this.setWaiting('run');
    }
    return this.keys.shift() ?? '';
  }

  /** PLAY mml$. */
  play(mml: string): Promise<void> {
    return this.synth.play(mml);
  }

  /** SHELL "play name.voc": a Sound Blaster clip; resolves when it ends. */
  clip(name: string): Promise<void> {
    return this.sfx.play(name);
  }

  /** What QB showed when a program reached END: waits for any key. */
  async end(): Promise<void> {
    if (this.gfx) this.setScreen(0);
    this.color(7, 0);
    this.locate(25, 1);
    this.screen.write('Press any key to continue');
    await this.anyKey();
  }

  /** Waits for any key and uses it up (WHILE INKEY$ = "": WEND). */
  async anyKey(): Promise<void> {
    this.keys.clear();
    this.setWaiting('key');
    await this.clock.until(() => this.keys.length > 0);
    this.keys.clear();
    this.setWaiting('run');
  }

  private setWaiting(w: Waiting): void {
    this.waiting = w;
    this.onWait(w);
  }
}
