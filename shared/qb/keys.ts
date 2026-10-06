// The keyboard buffer, like the BIOS's: keys queue up until INPUT reads them, from
// the real keyboard, the phone's keyboard, or a tapped menu choice.

export type Key = string; // one printable character, or 'Enter' | 'Backspace' | 'Escape'

export class KeyBuffer {
  private queue: Key[] = [];
  /** Counts every key ever pressed, so SLEEP can wake on a new one. */
  presses = 0;

  push(...keys: Key[]): void {
    for (const k of keys) {
      this.queue.push(k);
      this.presses++;
    }
  }

  shift(): Key | undefined {
    return this.queue.shift();
  }

  get length(): number {
    return this.queue.length;
  }

  /** The most recently pressed key still waiting. */
  last(): Key | undefined {
    return this.queue[this.queue.length - 1];
  }

  dropLast(): void {
    this.queue.pop();
  }

  clear(): void {
    this.queue.length = 0;
  }

  /** Maps a keydown event to a buffer key, or null for keys BASIC never saw. */
  static fromEvent(e: KeyboardEvent): Key | null {
    if (e.ctrlKey || e.metaKey || e.altKey) return null;
    if (e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Escape') return e.key;
    if (e.key.length === 1 && e.key >= ' ' && e.key <= '~') return e.key;
    return null;
  }
}
