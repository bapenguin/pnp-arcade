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
| `qb.ts` | The statements: `print`/`write` (PRINT with or without `;`), `tab`, `cls`, `color`, `locate`, `input`, `inputNumber` (with "Redo from start"), `sleep`, `inkey(ms)` (a timed single-key read), `play`, `clip` (a Sound Blaster clip, for `SHELL "play x.voc"`), `setScreen(0 \| 1 \| 13)`, `end`. Numbers print with QB's spacing (`" 455 "`) |
| `screen.ts` | `SCREEN 0`: the 80x25 buffer, 16-colour palette, border, wrapping at column 80, and a new line on row 25 scrolling the whole screen (as in QB) |
| `gfx.ts` | The graphics screens, 320x200 with PRINT in the 8x8 font (40x25): `SCREEN 13` in the VGA's default 256 colours, and `SCREEN 1` in CGA's 4 (`COLOR bg, palette`). `line` (B, BF, style), `pset`, `circle`, `paint`, `get`/`put` (XOR by default). While one is showing, `qb.print`/`color`/`locate`/`cls` go to it |
| `render.ts` | Draws the text buffer (cursor, blink, border) or the graphics screen to a canvas, scaled "sharp bilinear" |
| `font.ts`, `font/` | The VGA 8x16 and 8x8 fonts, read from the Web437 webfonts into exact bitmaps at startup |
| `sfx.ts` | Clips: fetched and decoded on first use, through the same mute as `PLAY` |
| `cp437.ts` | The IBM PC character set ↔ Unicode |
| `play.ts` | `PLAY` on a Web Audio square wave. Octave 3 starts at middle C; settings carry over between calls, as in QB |
| `keys.ts`, `clock.ts` | The keyboard buffer; a clock that stops while the tab is hidden |
| `host.ts`, `host.css` | The page: layout (4:3 on desktop, square pixels on phones), top bar, DOS boot prompt, tappable menu lines, the phone rail |

**Menu detection.** While `INPUT` or `inkey` waits, lines printed since the last answer
that look like choices become clickable. The recognised forms are:
- `press 1 to…`
- `1) Buy`
- `1 - attack`
- `x to go left`
- `(M for more)`
- `(Y/N)` or `[Y/N]`

On phones their keys also show as big buttons in the rail. For `inkey`, a button types
just the key; for `INPUT`, the key and Enter. If a new game words its menus another way,
add a pattern in `host.ts`.

**Not built yet** (add when a port needs it):
- `SOUND`/`BEEP`
- `.CMF` FM music

## Font licence

`font/Web437_IBM_VGA_8x16.woff` is from the Ultimate Oldschool PC Font Pack by VileR
(https://int10h.org/oldschool-pc-fonts/), licensed CC BY-SA 4.0 (`font/LICENSE.txt`).
Credit it wherever it's shown. The hub's footer does.
