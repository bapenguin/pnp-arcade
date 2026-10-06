// QuickBASIC's PLAY statement on a Web Audio square wave, which is close to what the
// PC speaker sounded like. The music macro language: notes A-G (+ or # sharp, - flat,
// optional length and dots), N0-84, P/pause, O0-6 and < >, L1-64, T32-255, and
// MN/ML/MS (note sounds 7/8, all, or 3/4 of its length), MF/MB (wait for the music, or
// keep running while it plays). As in QB, all of these settings carry over from one PLAY
// to the next. Octave 3 starts at middle C; the defaults are O4 L4 T120 MN MF.

import type { Clock } from './clock';

const SEMITONE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const MIDDLE_C = 261.6256;

interface Note {
  freq: number; // 0 = rest
  /** Seconds the note occupies. */
  len: number;
  /** Fraction of it that sounds. */
  sound: number;
}

export class Synth {
  private octave = 4;
  private length = 4;
  private tempo = 120;
  private articulation = 7 / 8;
  private background = false;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  // The PC speaker's level under the master (mute) gain; sound clips play at full level.
  private speaker: GainNode | null = null;
  // When the queued music ends: in game-clock ms (for waiting) and audio time.
  private endClock = 0;
  private endAudio = 0;
  private muted = false;

  constructor(private clock: Clock) {
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) void this.ctx.suspend();
      else void this.ctx.resume();
    });
  }

  /** Call from a user gesture: browsers only allow sound after one. */
  unlock(): void {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(this.ctx.destination);
      this.speaker = this.ctx.createGain();
      this.speaker.gain.value = 0.12;
      this.speaker.connect(this.master);
    }
    void this.ctx.resume();
  }

  /** The audio context and output (after `unlock`), for sound clips to share. */
  get audio(): { ctx: AudioContext; out: AudioNode } | null {
    return this.ctx && this.master ? { ctx: this.ctx, out: this.master } : null;
  }

  /** Back to the defaults, as when a program starts. */
  reset(): void {
    this.octave = 4;
    this.length = 4;
    this.tempo = 120;
    this.articulation = 7 / 8;
    this.background = false;
  }

  setMuted(m: boolean): void {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 1;
  }

  /** PLAY mml$. Resolves when the music has finished (MF) or at once (MB). */
  async play(mml: string): Promise<void> {
    const notes = this.parse(mml);
    const now = this.clock.now();
    let at = Math.max(now, this.endClock);
    let audioAt = this.ctx ? Math.max(this.ctx.currentTime + 0.02, this.endAudio) : 0;
    for (const n of notes) {
      if (n.freq > 0 && !this.clock.turbo) this.tone(n.freq, audioAt, n.len * n.sound);
      at += n.len * 1000;
      audioAt += n.len;
    }
    this.endClock = at;
    this.endAudio = audioAt;
    if (!this.background) await this.clock.wait(at - now);
  }

  private tone(freq: number, at: number, dur: number): void {
    if (!this.ctx || !this.speaker || dur <= 0) return;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    // A few milliseconds of fade at each end stop the clicks a hard cut makes.
    const fade = Math.min(0.004, dur / 4);
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(1, at + fade);
    env.gain.setValueAtTime(1, at + dur - fade);
    env.gain.linearRampToValueAtTime(0, at + dur);
    osc.connect(env).connect(this.speaker);
    osc.start(at);
    osc.stop(at + dur + 0.01);
  }

  private parse(mml: string): Note[] {
    const s = mml.toUpperCase();
    const notes: Note[] = [];
    let i = 0;
    const num = (): number | null => {
      const m = /^\d+/.exec(s.slice(i));
      if (!m) return null;
      i += m[0].length;
      return Number(m[0]);
    };
    const dots = (): number => {
      let f = 1, add = 0.5;
      while (s[i] === '.') {
        f += add;
        add /= 2;
        i++;
      }
      return f;
    };
    const whole = () => (4 * 60) / this.tempo; // seconds per whole note
    while (i < s.length) {
      const c = s[i++];
      if (c in SEMITONE) {
        let semi = SEMITONE[c];
        if (s[i] === '+' || s[i] === '#') {
          semi++;
          i++;
        } else if (s[i] === '-') {
          semi--;
          i++;
        }
        const l = num() ?? this.length;
        const len = (whole() / l) * dots();
        notes.push({ freq: MIDDLE_C * 2 ** (this.octave - 3 + semi / 12), len, sound: this.articulation });
      } else if (c === 'N') {
        const n = num() ?? 0;
        const len = (whole() / this.length) * dots();
        // N1 is the C at the bottom of octave 0.
        notes.push({ freq: n === 0 ? 0 : MIDDLE_C * 2 ** ((n - 1) / 12 - 3), len, sound: this.articulation });
      } else if (c === 'P' || c === 'R') {
        const l = num() ?? this.length;
        notes.push({ freq: 0, len: (whole() / l) * dots(), sound: 0 });
      } else if (c === 'O') {
        this.octave = Math.min(6, Math.max(0, num() ?? this.octave));
      } else if (c === '<') {
        this.octave = Math.max(0, this.octave - 1);
      } else if (c === '>') {
        this.octave = Math.min(6, this.octave + 1);
      } else if (c === 'L') {
        this.length = Math.min(64, Math.max(1, num() ?? this.length));
      } else if (c === 'T') {
        this.tempo = Math.min(255, Math.max(32, num() ?? this.tempo));
      } else if (c === 'M') {
        const m = s[i++];
        if (m === 'N') this.articulation = 7 / 8;
        else if (m === 'L') this.articulation = 1;
        else if (m === 'S') this.articulation = 3 / 4;
        else if (m === 'F') this.background = false;
        else if (m === 'B') this.background = true;
      }
      // Anything else (spaces, stray characters) is skipped.
    }
    return notes;
  }
}
