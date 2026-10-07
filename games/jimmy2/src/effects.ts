// SUB flash and SUB magic: two SCREEN 1 effects that JIMMY2.BAS declares but never calls
// (the game stops before it gets to any magic). The new content uses them: `magic` for
// the Trial of Asterixey, `flash` for the ending.

import type { QB } from '../../../shared/qb/qb';

/** SUB flash: the screen flashes through the background colours. */
export async function flash(qb: QB): Promise<void> {
  qb.setScreen(1);
  // The original looped x to 256 (adding 2 a time), but QB stops with "Illegal function
  // call" once the background passes 15, so the flash ends there.
  for (let x = 1; x <= 15; x += 2) {
    qb.color(x, x);
    qb.print();
    await qb.clock.wait(60);
  }
  qb.setScreen(0);
}

/** SUB magic: a magenta box jumps about the screen until a key is pressed. */
export async function magic(qb: QB, rnd: () => number = Math.random): Promise<void> {
  qb.setScreen(1);
  const g = qb.gfx!;
  let x1 = 0, y1 = 0;
  g.line(x1, y1, 10, 10, 2, 'BF');
  const box = g.get(x1, y1, 10, 10);
  // The original jumped as fast as the PC could loop; a jump per frame or two here.
  do {
    g.put(x1, y1, box, 'XOR');
    x1 = Math.round(rnd() * 300);
    y1 = Math.round(rnd() * 180);
    g.put(x1, y1, box);
  } while ((await qb.inkey(30)) === '');
  qb.setScreen(0);
}
