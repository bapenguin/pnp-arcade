// "1 - Watch intro and then play game": SUB intro, in SCREEN 13. Credits fade in and out
// through the VGA's grey ramp (colours 16-30), the JIMMY logo fades in, a ship rises,
// a smiley eats the screen line by line, and fans of grey lines sweep in from the
// corners before "JIMMY" waits for a key.
//
// Timings follow JIMMYXNEW.BAS (the later version, tuned for a modern speed: 0.1 s per
// fade step). The original's busy loops ran as fast as the PC allowed; the smiley and
// the fans are paced here to take a few seconds each, as on a mid-90s machine.

import type { QB } from '../../../shared/qb/qb';

const LOGO = [
  '████████ █ █      █ █      █ ██      ██',
  '   ██    █ ███  ███ ███  ███   ██  ██  ',
  '   ██    █ █  ██  █ █  ██  █     ██    ',
  '██ ██    █ █      █ █      █     ██    ',
  ' ███     █ █      █ █      █     ██    ',
];
const SHIP = [
  '             ██▄    ▄██             ',
  '              ▀██▄▄██▀               ',
  '                ▐██▌               ',
  '              ▄██▀▀██▄           ',
  '             ██▀    ▀██              ',
];

export async function intro(qb: QB): Promise<void> {
  const wait = (s: number) => qb.clock.wait(s * 1000);

  const fadein = async (text: string, row: number, col: number) => {
    for (let a = 16; a <= 30; a++) {
      qb.color(a);
      await wait(0.1);
      qb.locate(row, col);
      qb.print(text);
    }
    qb.color(15);
    qb.locate(row, col);
    qb.print(text);
    await wait(0.5);
  };
  const fadeout = async (text: string, row: number, col: number) => {
    for (let b = 0; b <= 13; b++) {
      qb.color(30 - b);
      await wait(0.1);
      qb.locate(row, col);
      qb.print(text);
    }
    qb.cls();
  };

  qb.setScreen(13);
  // The original showed "P&P Presents.." only with sound on; the later version always does.
  for (const [text, row, col] of [
    ['P&P Presents..', 13, 13],
    ['A Game by David Paul and Nick Puleo', 13, 2],
    ['Yet another Jimmy Game', 13, 9],
    ["The first one's second sequal", 13, 5],
    ['(The third one)', 13, 14],
  ] as const) {
    await fadein(text, row, col);
    await fadeout(text, row, col);
  }
  for (let b = 0; b < LOGO.length; b++) await fadein(LOGO[b], 10 + b, 1);

  // The ship rises from the bottom (each PRINT a$(1), a$(2)… starts a new line, since a
  // 35-character line leaves no room for the next print zone on a 40-column screen).
  qb.color(40);
  for (let b = 1; b <= 7; b++) {
    qb.locate(24 - b, 1);
    for (let c = 0; c < Math.min(b, 5); c++) qb.print(SHIP[c]);
    for (let x = 1; x <= b - 5; x++) qb.print(' '.repeat(53));
    await wait(0.25);
  }

  // A smiley (CHR$(2)) eats its way across every row.
  qb.color(33);
  for (let b = 1; b <= 25; b++) {
    for (let c = 1; c <= 40; c++) {
      if (c === 1 && b !== 1) {
        qb.locate(b - 1, 40);
        qb.print(' ');
        qb.locate(b, 1);
        qb.print('');
      }
      if (c !== 1) {
        qb.locate(b, c - 1);
        qb.print(' ☻');
      }
      if (c % 10 === 0) await wait(0.02);
    }
  }

  // Fans of grey lines from each corner.
  const g = qb.gfx!;
  for (let z = 1; z <= 4; z++) {
    for (let x = 1; x <= 50; x++) {
      for (let c = 16; c <= 30; c++) {
        if (z === 4) {
          g.line(0, 0, 100, x + c, c);
          g.line(0, 0, 100, x + 2 * c, 46 - c);
        }
        if (z === 3) {
          g.line(200, 0, 100, x + c, c);
          g.line(200, 0, 100, x + 2 * c, 46 - c);
        }
        if (z === 2) {
          g.line(0, 200, 100, 175 - (x + c), c);
          g.line(0, 200, 100, 175 - (x + 2 * c), 46 - c);
        }
        if (z === 1) {
          g.line(200, 200, 100, 175 - (x + c), c);
          g.line(200, 200, 100, 175 - (x + 2 * c), 46 - c);
        }
      }
      if (x % 2 === 0) await wait(0.02);
    }
  }

  qb.color(7);
  qb.locate(10, 11);
  qb.write('     ');
  qb.locate(10, 11);
  qb.write('JIMMY');
  qb.color(30);
  qb.locate(10, 11);
  qb.write('JIMMY');
  await qb.anyKey();
  g.paint(1, 1, 0, 30);
  await wait(0.5);
  qb.setScreen(0);
}
