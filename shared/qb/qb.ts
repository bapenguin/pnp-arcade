// The QuickBASIC statements a port calls, on top of the text screen, keyboard buffer,
// clock and synth. Game code reads close to the original:
//
//   qb.cls(); qb.print('JIMMY ENTERS THE HALL PRESS'); const move = await qb.input();
//
// PRINT, CLS, COLOR, LOCATE and TAB are immediate; INPUT, SLEEP and PLAY are awaited.

import type { Clock } from './clock';
import type { KeyBuffer } from './keys';
import type { Synth } from './play';
import { qbNum, type TextScreen } from './screen';

export type Waiting = 'run' | 'input' | 'sleep' | 'key';
type Part = string | number;

const join = (parts: Part[]) => parts.map((p) => (typeof p === 'number' ? qbNum(p) : p)).join('');

export class QB {
  /** What the program is waiting for, so touch controls can offer the right buttons. */
  waiting: Waiting = 'run';
  /** Called whenever `waiting` changes. */
  onWait: (w: Waiting) => void = () => {};

  constructor(
    readonly screen: TextScreen,
    readonly keys: KeyBuffer,
    readonly clock: Clock,
    readonly synth: Synth,
  ) {}

  /** PRINT a; b; c (numbers get QB's spacing: " 455 "). */
  print(...parts: Part[]): void {
    this.screen.print(join(parts));
  }

  /** PRINT a; b; c;  (no line break). */
  write(...parts: Part[]): void {
    this.screen.write(join(parts));
  }

  /** PRINT TAB(col); */
  tab(col: number): void {
    this.screen.tab(col);
  }

  cls(): void {
    this.screen.cls();
  }

  color(fore?: number, back?: number, border?: number): void {
    this.screen.color(fore, back, border);
  }

  locate(row?: number, col?: number): void {
    this.screen.locate(row, col);
  }

  /** INPUT [prompt;] a$: prints "prompt? ", lets the player type a line, returns it trimmed. */
  async input(prompt = ''): Promise<string> {
    this.write(prompt, '? ');
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

  /** PLAY mml$. */
  play(mml: string): Promise<void> {
    return this.synth.play(mml);
  }

  /** What QB showed when a program reached END: waits for any key. */
  async end(): Promise<void> {
    this.color(7, 0);
    this.locate(25, 1);
    this.screen.write('Press any key to continue');
    await this.anyKey();
  }

  /** Waits for any key and uses it up. */
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
