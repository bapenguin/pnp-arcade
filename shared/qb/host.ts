// The page around a QuickBASIC port: the screen scaled to fit, a top bar (back to the
// arcade, mute, fullscreen), and on phones a rail of buttons plus tappable menu lines.
//
// Menus in these games are lines like "press 1 to attack" or "2) Buy". While INPUT is
// waiting, each such line on screen becomes a button that types its key and Enter, so
// nothing needs typing on a phone, and mouse users can click them too. While the game
// reads single keys (INKEY$, e.g. a timed battle menu), the buttons type just the key.

import './host.css';
import { Clock } from './clock';
import { GLYPH_H, loadFont } from './font';
import { KeyBuffer } from './keys';
import { Synth } from './play';
import { QB, type Waiting } from './qb';
import { BORDER, Renderer, SRC_H, SRC_W, TEXT_W } from './render';
import { TextScreen } from './screen';
import { Sfx } from './sfx';

export interface HostOptions {
  /** Shown in the top bar, e.g. "Jimmy (1994)". */
  title: string;
  /** The DOS directory and program shown at the boot prompt, e.g. ['JIMMY', 'JIM']. */
  dir: string;
  exe: string;
  /** Where the back link goes. */
  arcadeUrl?: string;
  /** Sound clips by name, for `qb.clip(name)`. */
  sounds?: Record<string, string>;
}

// "press 1 to attack", "PRESS 1. TO SEARCH", "Prees 2 to talk", "press X to go down"
const PRESS = /\bpre+ss\s+([0-9a-z])\b/i;
// "1) Sell", "   2) Crossbow......$200"
const NUMBERED = /^\s*([0-9])\)/;
// "1 - attack", " 5- Earthquake", " 12 -poffite" (but not an empty " 3 - " item slot)
const DASHED = /^\s*([0-9]{1,2})\s*-\s*\S/;
// "x to go left", "0 to exit"
const LETTER_TO = /^\s*([a-z0-9])\s+to\s/i;
// "(M for more)"
const FOR_MORE = /\(([a-z]) for /i;
// "(Y/N)", "(y/N)", "(Y\N)", "[Y/N]"
const YES_NO = /[([]\s*y\s*[/\\]\s*n\s*[)\]]/i;

const mutedKey = 'pnp.qb.muted';

export class Host {
  readonly screen = new TextScreen();
  readonly keys = new KeyBuffer();
  readonly clock = new Clock();
  readonly synth = new Synth(this.clock);
  readonly sfx = new Sfx(this.synth, this.clock);
  readonly qb = new QB(this.screen, this.keys, this.clock, this.synth, this.sfx);
  readonly touch: boolean;

  private root = el('div', 'qb');
  private stage = el('div', 'qb-stage');
  private canvas = el('canvas', 'qb-screen');
  private hits = el('div', 'qb-hits');
  private kbd = el('input', 'qb-kbd');
  private rail = el('nav', 'qb-rail');
  private choices = el('div', 'qb-choices');
  private railButton: (label: string, title: string, onTap: () => void, cls?: string) => HTMLButtonElement = () => el('button', '');
  private muteButtons: HTMLButtonElement[] = [];
  private renderer: Renderer | null = null;
  private muted = false;

  constructor(private opts: HostOptions) {
    const flag = new URLSearchParams(location.search).get('touch');
    this.touch = flag === '1' || (flag !== '0' && matchMedia('(pointer: coarse)').matches);
    try {
      this.muted = localStorage.getItem(mutedKey) === '1';
    } catch {}
    this.synth.setMuted(this.muted);
    this.sfx.register(opts.sounds ?? {});
    this.build();
    this.qb.onWait = (w) => this.onWait(w);
  }

  /** Loads the font, then runs `game` forever: DOS prompt, the program, END. */
  async run(game: (qb: QB) => Promise<void>): Promise<void> {
    const [glyphs, glyphs8] = await Promise.all([loadFont(16), loadFont(8)]);
    this.qb.glyphs8 = glyphs8;
    this.renderer = new Renderer(this.canvas, this.screen, glyphs, () => this.qb.gfx);
    this.layout();
    if (import.meta.env.DEV) (window as unknown as { __qb: Host }).__qb = this;
    for (;;) {
      await this.boot();
      await game(this.qb);
      await this.qb.end();
    }
  }

  /** A DOS prompt that waits for the first key or tap: browsers need one before sound. */
  private async boot(): Promise<void> {
    const qb = this.qb;
    qb.color(7, 0, 0);
    qb.cls();
    qb.write(`C:\\${this.opts.dir}>`);
    this.screen.cursorVisible = true;
    qb.locate(25, 1);
    qb.color(8, 0);
    qb.write(this.touch ? 'Tap the screen to start' : 'Press any key to start');
    qb.color(7, 0);
    qb.locate(1, this.opts.dir.length + 5);
    await qb.anyKey();
    this.synth.unlock();
    qb.locate(25, 1);
    qb.write(' '.repeat(30));
    qb.locate(1, this.opts.dir.length + 5);
    for (const ch of this.opts.exe) {
      qb.write(ch);
      await this.clock.wait(90);
    }
    await this.clock.wait(250);
    this.synth.reset();
    this.screen.cursorVisible = false;
    qb.screen.newline();
  }

  private build(): void {
    const { root, stage, canvas, hits, kbd, rail } = this;
    root.classList.toggle('is-touch', this.touch);

    const bar = el('header', 'qb-bar');
    const back = el('a', 'qb-back');
    back.href = this.opts.arcadeUrl ?? '../../';
    back.textContent = '◂ P&P Arcade';
    const title = el('span', 'qb-title');
    title.textContent = this.opts.title;
    const tools = el('span', 'qb-tools');
    tools.append(this.muteButton(), this.fullscreenButton());
    bar.append(back, title, tools);

    stage.append(canvas, hits);
    kbd.type = 'text';
    kbd.autocomplete = 'off';
    kbd.setAttribute('autocapitalize', 'characters');
    kbd.setAttribute('autocorrect', 'off');
    kbd.spellcheck = false;
    kbd.setAttribute('aria-label', 'Type here');

    const main = el('div', 'qb-main');
    main.append(stage);
    if (this.touch) {
      this.buildRail();
      main.append(rail);
    } else {
      root.append(bar);
    }
    const rotate = el('div', 'qb-rotate');
    rotate.textContent = 'Turn your phone sideways to play';
    root.append(main, kbd, rotate);
    document.body.append(root);

    // Physical keyboards. Typing into the phone keyboard's hidden field arrives as
    // `input` events instead, except for Enter and Backspace.
    window.addEventListener('keydown', (e) => {
      const k = KeyBuffer.fromEvent(e);
      if (!k) return;
      if (e.target === kbd && k.length === 1) return;
      e.preventDefault();
      this.keys.push(k);
    });
    kbd.addEventListener('input', () => {
      for (const ch of kbd.value) if (ch >= ' ' && ch <= '~') this.keys.push(ch);
      kbd.value = '';
    });

    // A tap or click on the screen: a menu line types its choice; otherwise it
    // continues past a pause, or opens the phone keyboard for typing.
    stage.addEventListener('pointerdown', (e) => {
      const w = this.qb.waiting;
      if (w === 'sleep' || w === 'key') {
        e.preventDefault();
        this.keys.push('Enter');
      } else if (w === 'input' && this.touch && !(e.target as HTMLElement).closest('.qb-hit')) {
        kbd.focus();
      }
    });

    new ResizeObserver(() => this.layout()).observe(stage);
    window.addEventListener('resize', () => this.layout());
  }

  private buildRail(): void {
    const button = (label: string, title: string, onTap: () => void, cls = '') => {
      const b = el('button', `qb-rail-btn ${cls}`);
      b.type = 'button';
      b.textContent = label;
      b.title = title;
      // pointerdown, and no focus change, so the phone keyboard stays open.
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        onTap();
      });
      return b;
    };
    this.railButton = button;
    const back = el('a', 'qb-rail-btn qb-rail-back');
    back.href = this.opts.arcadeUrl ?? '../../';
    back.textContent = '◂';
    back.title = 'Back to the P&P Arcade';
    const utils = el('div', 'qb-utils');
    utils.append(
      back,
      button('⌨', 'Keyboard', () => (document.activeElement === this.kbd ? this.kbd.blur() : this.kbd.focus())),
      this.muteButton('qb-rail-btn'),
      this.fullscreenButton('qb-rail-btn'),
    );
    this.rail.append(this.choices, button('⏎', 'Enter', () => this.keys.push('Enter'), 'qb-enter'), utils);
  }

  /** The current menu's choices as big rail buttons (lines on screen are only ~14px tall on a phone). */
  private showChoices(keys: string[], mode: Waiting): void {
    this.choices.textContent = '';
    for (const k of keys) this.choices.append(this.railButton(k, `Choose ${k}`, () => this.choose(k, mode), 'qb-choice'));
  }

  private muteButton(cls = 'qb-tool'): HTMLButtonElement {
    const b = el('button', cls);
    b.type = 'button';
    const show = () => {
      b.textContent = this.muted ? '🔇' : '🔊';
      b.title = this.muted ? 'Sound off' : 'Sound on';
    };
    b.addEventListener('click', () => {
      this.muted = !this.muted;
      this.synth.setMuted(this.muted);
      try {
        localStorage.setItem(mutedKey, this.muted ? '1' : '0');
      } catch {}
      for (const m of this.muteButtons) m.dispatchEvent(new Event('qb-refresh'));
    });
    b.addEventListener('qb-refresh', show);
    show();
    this.muteButtons.push(b);
    return b;
  }

  private fullscreenButton(cls = 'qb-tool'): HTMLButtonElement {
    const b = el('button', cls);
    b.type = 'button';
    b.textContent = '⛶';
    b.title = 'Fullscreen';
    b.addEventListener('click', () => {
      if (document.fullscreenElement) void document.exitFullscreen();
      else void this.root.requestFullscreen?.().catch(() => {});
    });
    return b;
  }

  private layout(): void {
    if (!this.renderer) return;
    const r = this.stage.getBoundingClientRect();
    // The PC showed 640x400 text on a 4:3 tube, so pixels were taller than wide. Phones
    // keep square pixels: the text comes out bigger, which matters more there.
    const aspect = this.touch ? SRC_W / SRC_H : SRC_W / (SRC_H * 1.2);
    let w = r.width, h = r.width / aspect;
    if (h > r.height) {
      h = r.height;
      w = h * aspect;
    }
    w = Math.floor(w);
    h = Math.floor(h);
    this.renderer.resize(w, h);
    this.hits.style.width = `${w}px`;
    this.hits.style.height = `${h}px`;
    this.placeHits();
  }

  private onWait(w: Waiting): void {
    // Between reads the program briefly runs (a timed battle menu polls every second);
    // the buttons stay up through that rather than flickering.
    if (w !== 'run') this.placeHits();
    this.root.classList.toggle('is-waiting-key', w === 'sleep' || w === 'key');
  }

  /**
   * The menu lines for the question being asked: those printed since the previous
   * answer (a line starting "?"), so an older menu still on screen doesn't count.
   */
  private menuLines(): { row: number; key: string; text: string }[] {
    const found: { row: number; key: string; text: string }[] = [];
    if (this.qb.gfx) return found;
    for (let row = this.screen.row - 1; row >= 1; row--) {
      const text = this.screen.rowText(row);
      if (text.startsWith('?')) break;
      const m = PRESS.exec(text) ?? NUMBERED.exec(text) ?? DASHED.exec(text) ?? LETTER_TO.exec(text) ?? FOR_MORE.exec(text);
      if (m) found.unshift({ row, key: m[1].toUpperCase(), text: text.trim() });
      if (YES_NO.test(text)) found.push({ row: 0, key: 'Y', text }, { row: 0, key: 'N', text });
    }
    return found;
  }

  /** Types a choice: with Enter for INPUT, on its own for a single-key read. */
  private choose(key: string, mode: Waiting): void {
    if (mode === 'inkey') this.keys.push(key);
    else if (this.qb.waiting === 'input') this.keys.push(key, 'Enter');
  }

  private hitsFor = '';

  /** Puts a button over each menu line on screen while INPUT (or INKEY$) waits. */
  private placeHits(): void {
    const mode = this.qb.waiting;
    const lines = mode === 'input' || mode === 'inkey' ? this.menuLines() : [];
    const sig = `${mode === 'inkey' ? 'k' : 'i'}|${this.hits.style.width}|${lines.map((l) => `${l.row}:${l.key}`).join(',')}`;
    if (sig === this.hitsFor) return;
    this.hitsFor = sig;
    this.hits.textContent = '';
    if (this.touch) this.showChoices([...new Set(lines.map((l) => l.key))], mode);
    const sx = parseFloat(this.hits.style.width) / SRC_W;
    const sy = parseFloat(this.hits.style.height) / SRC_H;
    lines.forEach(({ row, key, text }) => {
      if (row === 0) return;
      const i = row - 1;
      const b = el('button', 'qb-hit');
      b.type = 'button';
      b.setAttribute('aria-label', text);
      b.style.left = `${BORDER * sx}px`;
      b.style.top = `${(BORDER + i * GLYPH_H) * sy}px`;
      b.style.width = `${TEXT_W * sx}px`;
      b.style.height = `${GLYPH_H * sy}px`;
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.choose(key, mode);
      });
      this.hits.append(b);
    });
  }
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = cls;
  return e;
}
