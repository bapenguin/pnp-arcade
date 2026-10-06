// The game's clock: milliseconds that stop while the tab is hidden, so SLEEP and
// music pick up where they left off instead of skipping ahead.

export class Clock {
  private pausedAt: number | null = null;
  private pausedTotal = 0;
  /** Testing aid: waits finish at once. */
  turbo = false;

  constructor() {
    document.addEventListener('visibilitychange', () => (document.hidden ? this.pause() : this.resume()));
    if (document.hidden) this.pause();
  }

  get paused(): boolean {
    return this.pausedAt !== null;
  }

  now(): number {
    return (this.pausedAt ?? performance.now()) - this.pausedTotal;
  }

  pause(): void {
    if (this.pausedAt === null) this.pausedAt = performance.now();
  }

  resume(): void {
    if (this.pausedAt === null) return;
    this.pausedTotal += performance.now() - this.pausedAt;
    this.pausedAt = null;
  }

  /** Waits until `until()` is true or `ms` of game time pass (forever if ms is Infinity). */
  async wait(ms: number, until: () => boolean = () => false): Promise<void> {
    const end = this.now() + ms;
    while (!until() && !this.turbo && this.now() < end) await tick();
  }

  /** Waits for `cond()`, however long it takes (turbo doesn't skip it). */
  async until(cond: () => boolean): Promise<void> {
    while (!cond()) await tick();
  }
}

function tick(): Promise<void> {
  return new Promise((r) => setTimeout(r, 15));
}
