// "3 - Read instructions": SUB instruct, which reads legacy/JIMMY.INS. Its little markup,
// two characters at the start of each line:
//   "n " or "nn" (1-15)  set the colour, print the rest of the line
//   ";n " / ";nn"        set the colour, print the rest without a line break
//   CL                   clear the screen, print the rest
//   CR                   a blank line
//   WT                   wait for a key
//   two spaces           print the rest
// Anything else (blank lines, the closing ^Z) prints nothing.

import type { QB } from '../../../shared/qb/qb';
import INS from '../legacy/JIMMY.INS?raw';

export async function instructions(qb: QB): Promise<void> {
  for (let line of INS.split(/\r?\n/)) {
    line = line.replace(/ +$/, '');
    if (line.startsWith(';')) {
      const c = Number.parseInt(line.slice(1, 3), 10);
      if (c >= 1 && c <= 15) {
        qb.color(c);
        qb.write(line.slice(3));
      }
      continue;
    }
    const first = line.slice(0, 2);
    if (/^[1-9] $|^1[0-5]$/.test(first)) {
      const c = Number.parseInt(first, 10);
      qb.color(c);
      qb.print(line.slice(2));
    } else if (first === 'CL') {
      qb.cls();
      qb.print(line.slice(2));
    } else if (first === 'CR') {
      qb.print();
      // The original printed only the blank line, dropping the rest: the first line of
      // the note about NumLock ("CRNOTE: if you are having problems...") never showed.
      if (line.length > 2) qb.print(line.slice(2));
    } else if (first === 'WT') {
      await qb.anyKey();
    } else if (first === '  ') {
      qb.print(line.slice(2));
    }
  }
  await qb.sleep();
}
