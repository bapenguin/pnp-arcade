// SUB INTRO: two flashes in SCREEN 1 (CGA), "J2" sliding together in text mode, then
// the credits and Jimmy's story so far. The music is "MB" (background), so it plays on
// under everything else, as in QB.

import type { QB } from '../../../shared/qb/qb';

const SPOOKY = ' mB o1 l2 b o2 b l4 f+g e l3 e- l8 e l2 f+ l4 e l1 o1 b p2 ';
const SPOOK = 'mB o1 l2 b o2 l4 b o3 l3 c o2 l8 b l4 a g f+ e l1 f+';

// The two SCREEN 1 pictures, from the CP437 block characters in JIMMY2.BAS. SCREEN 1 is
// 40 columns wide, so the longer lines wrap onto the next row, as they did on the PC.
const PREPARE = [
  '                             ████',
  '                           █████   ',
  '                        ███ ██ █     ',
  '                       █   █    █',
  '                          █ █   ██   ',
  '   Prepare                  █   █   █    ',
  '     Yourself              █ █       █   ',
  '       For...            █         █ █   ',
  '                        █          █          ',
];
const PNP_GAME = [
  '             A           ',
  '',
  '     ██████▄     ▄▄▄          ██████▄',
  '     ██    ██   █   █         ██    ██',
  '     ██    ██   █  █          ██    ██',
  '     ██████▀     ▀█           ██████▀',
  '     ██         ▄▀ ▀▄   ▄     ██',
  '     ██        █     ▀▄▀      ██',
  '     ██       █      █▀▄      ██',
  '     ██        ▀▄▄▄▄▀    ▀▄   ██',
  '',
  '                  Game',
];
// j$(1, 10 TO 14) and To$(1, 10 TO 14): the J and the 2 that slide in.
const J = ['█████████', '    ██', '    ██', '██  ██', '  ██'];
const TWO = ['  █████     ', '██     ██', '   ▄██▀▀    ', ' ▄█▀       ', ' ████████'];

export async function intro(qb: QB): Promise<void> {
  // The original's animation loops ran as fast as the PC could go, which was a blink on a
  // 486. Each step gets a frame or so here so it can be seen (and is the same speed everywhere).
  const frame = (ms: number) => qb.clock.wait(ms);

  await qb.play(SPOOKY);
  await qb.play(SPOOKY);
  qb.setScreen(1);
  for (let x = 1; x <= 10; x++) {
    qb.color(x, 1);
    qb.locate(1, 1);
    for (const line of PREPARE) qb.print(line);
    await frame(120);
  }
  qb.setScreen(0);
  qb.color(0, 0, 0);
  qb.cls();
  await qb.sleep(5);
  qb.setScreen(1);
  for (let x = 1; x <= 10; x++) {
    qb.color(x, 3);
    qb.locate(1, 1);
    for (const line of PNP_GAME) qb.print(line);
    await frame(120);
  }
  qb.setScreen(0);

  // The J slides in from the left, a row at a time, rubbing out the cell it left behind.
  qb.cls();
  for (let z = 10; z <= 14; z++) {
    for (let x = 1; x <= 35; x++) {
      qb.color(5, 0, 0);
      qb.locate(z, x);
      qb.print(J[z - 10]);
      if (x > 1) {
        qb.locate(z, x - 1);
        qb.print(' ');
      }
      if (x % 2 === 0) await frame(8);
    }
  }
  // The 2 slides in from the right. Near the right edge its rows wrap round onto the next
  // line's left end, which is why the original wiped columns 1-10 of rows 10-20 every step.
  for (let z = 10; z <= 14; z++) {
    for (let x = 1; x <= 35; x++) {
      qb.color(14, 0, 0);
      const y = 81 - x;
      qb.locate(z, y);
      qb.print(TWO[z - 10]);
      if (y + 9 <= 80) {
        qb.locate(z, y + 9);
        qb.print(' ');
      }
      for (let g = 10; g <= 20; g++) {
        for (let b = 1; b <= 10; b++) {
          qb.locate(g, b);
          qb.print(' ');
        }
      }
      if (x % 2 === 0) await frame(8);
    }
  }
  await qb.play(SPOOK);
  // SCREEN 0 again: already in text mode, so nothing changes and the line prints under J2.
  qb.color(2, 0, 0);
  qb.print(' This game was created by two very smart people');
  await qb.sleep(6);
  qb.color(9, 0, 0);
  qb.cls();
  qb.print(' Created by');
  qb.print('     Nick Puleo');
  qb.print('         and');
  qb.print('            David Paul');
  await qb.sleep(5);
  qb.cls();
  await qb.play(SPOOKY);
  await qb.play(SPOOKY);
  qb.color(3, 0, 0);
  qb.print('   It was also programed by two very smart people');
  await qb.sleep(5);
  qb.cls();
  qb.color(5, 0, 8);
  qb.print(' Programed by');
  qb.print('     Nick Puleo');
  qb.print('         and');
  qb.print('            David Paul');
  await qb.sleep(5);
  qb.cls();
  qb.color(6, 0, 0);
  qb.print(' The Idea was also by two very smart people');
  await qb.sleep(4);
  qb.cls();
  qb.print(' You guessed it ');
  qb.print(' Idea by');
  qb.print('     Nick Puleo');
  qb.print('         and');
  qb.print('            David Paul');
  await qb.sleep(5);
  qb.cls();
  qb.color(5, 0, 0);
  qb.print('     Hello, I am Jimmy and you will be controlling me.');
  qb.print('If you played the first adventure and conquered it you');
  qb.print('I was at a temple when I killed BOB.  Well I went in the ');
  qb.print(' temple and found a statue.  It was a statue of some famous');
  qb.print(' GOD.  The name was like FORGON or FARGAN or something');
  qb.print(' like that.  Any way I was told to take the statue back to');
  qb.print(' an guy name BASTEW or BESTAW or something like that.');
  qb.print('  Now I am on his planet trying to find him. I am lost  ');
  qb.print(' somewhere in this jungle.  HELPPPPPPPPPP!!!!!!');
  await qb.sleep();
}
