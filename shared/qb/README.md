# QB: the QuickBASIC text-mode runtime

The shared engine for the Jimmy ports and any other DOS QuickBASIC game. A port is
mostly content: it imports `Host`, then writes the game as an async function that calls
`qb.print`, `qb.input` and so on.

```ts
import { Host } from '../../../shared/qb/host';
new Host({ title: 'Jimmy (1994)', dir: 'JIMMY', exe: 'JIM' }).run(async (qb) => {
  qb.cls();
  qb.print('JIMMY ENTERS THE HALL PRESS');
  const move = (await qb.input()).toUpperCase();
});
```

| File | What |
|---|---|
| `qb.ts` | The statements: `print`/`write` (PRINT with or without `;`), `tab`, `cls`, `color`, `locate`, `input`, `sleep`, `play`, `end`. Numbers print with QB's spacing (`" 455 "`) |
| `screen.ts` | `SCREEN 0`: the 80x25 buffer, 16-colour palette, border, wrapping at column 80, scrolling rows 1-24 |
| `render.ts` | Draws the buffer to a canvas (cursor, blink, border), scaled "sharp bilinear" |
| `font.ts`, `font/` | The VGA 8x16 font, read from the Web437 webfont into exact bitmaps at startup |
| `cp437.ts` | The IBM PC character set ↔ Unicode |
| `play.ts` | `PLAY` on a Web Audio square wave. Octave 3 starts at middle C; settings carry over between calls, as in QB |
| `keys.ts`, `clock.ts` | The keyboard buffer; a clock that stops while the tab is hidden |
| `host.ts`, `host.css` | The page: layout (4:3 on desktop, square pixels on phones), top bar, DOS boot prompt, tappable menu lines, the phone rail |

**Menu detection.** While `INPUT` waits, lines printed since the last answer that look like
choices (`press 1 to…`, `1) Buy`, `x to go left`, `(Y/N)`) become clickable. On phones
their keys also show as big buttons in the rail. If a new game words its menus another
way, add a pattern in `host.ts`.

**Not built yet** (add when a port needs it):
- `SCREEN 1` / `SCREEN 13` graphics (Jimmy 2, Jimmy X)
- `INKEY$` and `ON KEY` timed input (Jimmy X's battles)
- `SOUND`/`BEEP`
- VOC/WAV clips

## Font licence

`font/Web437_IBM_VGA_8x16.woff` is from the Ultimate Oldschool PC Font Pack by VileR
(https://int10h.org/oldschool-pc-fonts/), licensed CC BY-SA 4.0 (`font/LICENSE.txt`).
Credit it wherever it's shown. The hub's footer does.
