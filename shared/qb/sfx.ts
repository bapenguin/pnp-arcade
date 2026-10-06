// Sound Blaster clips: what the original did with SHELL "play hello.wav" (an external
// player that held the program until the clip finished). Clips are fetched and decoded
// on first use, and play through the synth's output so the mute button covers them.

import type { Clock } from './clock';
import type { Synth } from './play';

export class Sfx {
  private cache = new Map<string, Promise<AudioBuffer | null>>();

  /** `urls` maps a clip name (e.g. 'hello') to its file URL. */
  constructor(
    private synth: Synth,
    private clock: Clock,
    private urls: Record<string, string> = {},
  ) {}

  register(urls: Record<string, string>): void {
    Object.assign(this.urls, urls);
  }

  /** Plays a clip and resolves when it ends (at once if sound isn't available). */
  async play(name: string): Promise<void> {
    const audio = this.synth.audio;
    if (!audio || this.clock.turbo) return;
    const buffer = await this.load(name, audio.ctx);
    if (!buffer) return;
    const src = audio.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(audio.out);
    src.start();
    await this.clock.wait(buffer.duration * 1000);
  }

  private load(name: string, ctx: AudioContext): Promise<AudioBuffer | null> {
    let p = this.cache.get(name);
    if (!p) {
      const url = this.urls[name];
      p = url
        ? fetch(url)
            .then((r) => r.arrayBuffer())
            .then((b) => ctx.decodeAudioData(b))
            .catch(() => null)
        : Promise.resolve(null);
      this.cache.set(name, p);
    }
    return p;
  }
}
