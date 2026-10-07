// New (J7): the ending, after Bob. The original never got this far. It's built like the
// intro (SCREEN 13, text fading through the grey ramp), and closes the way Jimmy 1 did:
// "LOOK FOR JIMMY 2!"

import type { QB } from '../../../shared/qb/qb';
import { saves } from './saves';

const LOGO = [
  '████████ █ █      █ █      █ ██      ██',
  '   ██    █ ███  ███ ███  ███   ██  ██  ',
  '   ██    █ █  ██  █ █  ██  █     ██    ',
  '██ ██    █ █      █ █      █     ██    ',
  ' ███     █ █      █ █      █     ██    ',
];

export async function ending(qb: QB, game: { notsaved: number; soundon: number }): Promise<void> {
  const wait = (s: number) => qb.clock.wait(s * 1000);
  const fade = async (text: string, row: number, col: number, stay = false) => {
    for (let a = 16; a <= 30; a++) {
      qb.color(a);
      await wait(0.1);
      qb.locate(row, col);
      qb.print(text);
    }
    qb.color(15);
    qb.locate(row, col);
    qb.print(text);
    await wait(1.2);
    if (stay) return;
    for (let b = 0; b <= 13; b++) {
      qb.color(30 - b);
      await wait(0.1);
      qb.locate(row, col);
      qb.print(text);
    }
    qb.cls();
  };

  // The fight's last screen first: BOB goes down.
  qb.color(15);
  qb.print();
  qb.print(' BOB staggers back, blind and confused, and walks straight into');
  qb.print(" his own War Machine. It's a very short walk, and a very long fall.");
  qb.print();
  qb.color(6);
  qb.print(" BOB: You haven't seen the last of meeeeeeee...");
  qb.color(7);
  qb.print();
  qb.print(' Press ENTER...');
  await qb.anyKey();
  if (game.soundon) void qb.play('mB t140 o4 l2 cf o5 l1c o4 l4 b-ag o5 l3 f l1 c o4 l4 b-ag o5 l3 f l1 c l4 b-ab- l1 g');

  qb.setScreen(13);
  for (const [text, row, col] of [
    ['BOB is dead.', 13, 15],
    ['Again.', 13, 18],
    ['No, really this time.', 13, 10],
    ['Probably.', 13, 16],
  ] as const) {
    await fade(text, row, col);
  }
  for (let b = 0; b < LOGO.length; b++) await fade(LOGO[b], 6 + b, 1, true);
  await fade('X', 12, 20, true);
  await fade('A Game by David Paul and Nick Puleo', 15, 2, true);
  await fade('Started in the 90s. Finished in 2026.', 17, 2, true);
  await fade('(The third one)', 19, 13, true);
  qb.color(40);
  qb.locate(23, 12);
  qb.print('LOOK FOR JIMMY 4!');
  await qb.anyKey();
  qb.setScreen(0);

  // The game is over: there's nothing to resume.
  game.notsaved = 0;
  saves.putAuto(null);
}
