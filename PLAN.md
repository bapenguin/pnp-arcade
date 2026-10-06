# P&P Enterprises Classic Arcade: plan

Builds on `BRIEF.md`. That brief assumed the games would be VB6/DirectX like
MoF. **The Jimmy games are older: DOS QuickBASIC, text mode, PC speaker and Sound
Blaster.** This plan adjusts the brief for that and lays out the first ports.

**Status:** draft. Decisions so far:
- **Site:** *P&P Enterprises Classic Arcade*, in one combined repo.
- **MoF:** moves in, after its standalone version is archived (section 0).
- **Jimmy X base:** the timed battles from `JIMMYX.BAS`, with the fixes from `JIMMYXNEW.BAS`.
- **Missing story:** fill it in as new content.
- **Saves:** a modern save system.
- **Font:** a free retro font.
- **Video:** skipped.
- **Next ports:** Jimmy 1, then Jimmy 2.

**Progress:** **J0 is done (2026-10-06).**
- MoF is archived (section 0).
- `pnp-arcade` is created, with MoF imported along with its history.
- The legacy files are in `games/*/legacy`, and the art is in `art/`.
- A placeholder hub and the deploy workflow are in place.

**Jimmy 1 is ported (2026-10-06).** It runs on the new shared QuickBASIC runtime
(`shared/qb/`: text screen, VGA font, `PLAY`, phone controls); this covers J3 for text
mode. It's on the hub as TERM-02, and the details are in `games/jimmy1/PLAN.md`.

**Jimmy X is ported (2026-10-06): J1-J6 are done.** That covers:
- the timed battles
- the Sound Blaster clips, converted with no ffmpeg (including 4-bit ADPCM)
- the `SCREEN 13` intro
- browser saves with autosave

The runtime gained graphics, `inkey`, clips and numeric input. It's on the hub as
TERM-03. **Next: J7, the missing story.** `games/jimmyx/PLAN.md` has a draft outline and
questions for Nick.

---

## 0. Archiving standalone MoF

Keep a complete, working copy of MoF as it is today, before anything moves.

1. **Tag it.** Put an annotated tag `mof-standalone-v1` on the current `main` (84b7bab) and
   push it. That commit can then always be checked out, whatever happens to `main` later.
2. **Make a GitHub Release from the tag** and attach the built `dist/` zip. Workflow
   artifacts expire after 90 days, but release files don't, so the playable build is kept
   too.
3. **Make an offline backup.** `git bundle create MoF-standalone.bundle --all` writes
   the whole repo, every commit and tag, into one file. Keep it outside git (e.g. cloud
   storage). `git clone MoF-standalone.bundle` restores it.
4. **Leave `bapenguin/MoF` and its live site alone.** Once the arcade's copy of MoF is
   live, the old repo can be *archived* on GitHub: read-only, still public, and the URL
   keeps working. The README then points to the arcade. Don't delete it.
5. **Import with full history.** The arcade repo pulls MoF in with
   `git subtree add --prefix=games/mof <MoF repo> main` (not `--squash`). Every MoF commit
   stays in the arcade's history too.

The untracked inspiration and game folders now sitting in the MoF working copy
(`jimmy*/`, `jimmy comic/`, the logos, the brief and this plan) move into the arcade repo.
They never get committed to MoF.

## 0.5 The site

- **Name:** P&P Enterprises Classic Arcade. Repo: `bapenguin/pnp-arcade`, served
  at `bapenguin.github.io/pnp-arcade/` until there's a custom domain.
- **Brand art:**
  - the new chrome-and-blue *P&P Enterprises* logo, for the hub header and the favicon
    source
  - the old 2000s `banner.jpg` with the two of you, for an "about P&P" corner
- **The comic** (*Star Detours* starring Jimmy, 1993, restored 2005): 14 original pencil
  pages plus the cleaned-up `new_` scans and the coloured cover. It's a natural fit for
  the monitor wall:
  - **Decorative screens:** the `BOOM` splash pages, the *Star Detours* cover, and the
    *Jimmy O's* cereal ad and *Prince Jimmy of Persia* ad, shown as fake "commercials"
    with a CRT flicker.
  - **A "P&P Comics" screen** that opens a page-flip reader for the whole comic.
  - **Character cut-outs** (Jimmy, Bob) beside each Jimmy game on the wall, and Jimmy as
    the 404 page.
  - **X-Wing War** pairs naturally with the *Star Detours* art.
  - The comic is lined notebook paper, so the hub can mix CRTs with "taped-up sketch"
    cards.
- **Planned games:** in the table below. SCHAR stays its own project, and could get a
  link screen later.

| Game | Year | Source | Tech |
|---|---|---|---|
| Jimmy 1 | 1994 | `jimmy/JIM.BAK` (QB text, ~1,020 lines; `.BAK` is QuickBASIC's backup copy of `JIM.BAS`) + compiled `JIM.EXE` | Text adventure, `PLAY` music, no graphics |
| Jimmy 2: The Final Voyage | ~1994 | `jimmy1/JIMMY2.BAS` (~490 lines) | Text adventure, `PLAY`, a `SCREEN 1` (CGA 4-colour) "magic" effect with `GET`/`PUT XOR` |
| Jimmy X | mid-90s | `jimmyx/JIMMYX.BAS` | Text RPG, timed battles, VOC/WAV clips, `SCREEN 13` intro |
| X-Wing War | ? | not provided yet | ? |
| MoF | 2004 | done, moves in | TypeScript port |

Notes on the folders:
- `jimmy1/` holds a duplicate of Jimmy 1 plus Jimmy 2's source.
- `jimmy1/BACKUP.002`/`CONTROL.002` are an MS-DOS `BACKUP` of **`DOOM1_0.ZIP`**
  (shareware Doom), so it's not P&P material and won't ship.
- `BRT70ENR.*` is the QuickBASIC PDS 7 runtime, and `DIBENG.DLL` a stray Windows file.
- Jimmy 1's `.EXE` could also run in a DOS emulator as an optional "original" mode.

**Story order:** In Jimmy 1, Jimmy kills Bob. Jimmy 2 opens "I was at a temple when I
killed BOB", then follows a statue quest on another planet. Jimmy X says Bob is back. The
hub can present them as a trilogy, and the Jimmy X story fill-in (J7) can pay off threads
from 1 and 2.

**Runtime coverage this implies:** text mode and `PLAY` for all three, `SCREEN 1` +
`GET`/`PUT` for Jimmy 2, and `SCREEN 13` for Jimmy X. Jimmy 1 is the simplest, so it's
the best first port to prove the runtime on.

---

## 1. What Jimmy X is

*"Jimmy X: the next generation in the Jimmy line of games"*, by David Paul and Nick Puleo
(P&P), mid-1990s. It's titled "Memories.. and other stuff I remember" on its main menu.

| | |
|---|---|
| Language | QuickBASIC 4.5 (`JIMMYX.BAS`, ~2,050 lines, 63 `GOTO`s, 208 `GOSUB`s). `JIMMYXNEW.BAS` is a later reformatted copy with a few changes (below) |
| Genre | Menu-driven text RPG. Move between ~18 rooms by picking numbered choices; random encounters; shops, a guild, healer, magic, items, levelling |
| Screen | `SCREEN 0` 80Ã—25 text, 16 colours, centred lines. `SCREEN 13` (320Ã—200, 256 colours) only for the intro and the "you pulled a Jimmy!!" error screen |
| Input | `INPUT` (typed choice + Enter), plus `HELP`, `INFO`, `USE`, `Q` typed anywhere. Battles: `ON KEY` traps on 1â€“4 / numpad with a **10-second countdown**; let it run out and the enemy hits you |
| Sound | PC speaker `PLAY` strings (win jingle, hit sound, a Star Wars-ish `star$`); Sound Blaster clips played by shelling out to `PLAY.EXE` (`toll.voc`, `hello.wav`, `army.voc`, `thankyou.voc`, `myday.voc`, `backoff.wav`, `meanswar.wav`, `ouch.voc`) |
| Saves | `name.JIM` text files: 17 stats on one line, then 20 item counts. **`NICK.JIM` is a real save from back then** (level 4, $5,785, the raptor claw) |
| Data | All in code: 10 enemies (stat blocks), weapons, armour, spells, items, room text |

**Not used by the game:** the four `.CMF` FM-music files, `HERMIT.VOC`, `QUICK.VOC`,
`CRUSHED.VOC`, `CLOTHES.VOC`, `GUN.VOC`, `ARTY.VOC`, `FART.WAV`, `INTRO.WAV`, `BEAVHUH1`,
`BUTTHUH1`, `SND07.WAV`, and `FALLEN.DAT` (an 8-bit sample "I've fallen, and I can't get
up!" played by `RUNME.BAT` + `REPLAY.EXE`). `HERMIT.VOC` was probably meant for the empty
hermit room. Some may belong to other Jimmy games.

**Third-party files, don't ship:** `PLAY.EXE` + `LAY13.SDA` (SND_UTIL, a shareware VOC/WAV
player), `PLAY.TXT` (docs for an unrelated Trilobyte FLI player),
`SVGA.EXE`, `REPLAY.EXE`, `WHATS.NEW` (GL-View), `CALLME.NOW` (a 1990s BBS ad,
fun as an easter egg at most).

### It's unfinished

The instructions say the goal is to destroy Bob, but **Bob never appears**. The rich side
of the land (`rich`) bounces you back to the field, `hermit` is an empty label, and the
elf's rumour ("a small army assembling near here... I have a belief it is BOB") leads
nowhere. The port fills this in as marked new content (phase J7).

### Bugs in the original (log, then decide per bug)

- Missing `RETURN`s make enemies fall through: meeting a **bear** rolls for stone giant,
  bearded lady and raptor too; **orangutan** falls into ninja. `creek` falls into `hermit`
  then `elves`; `valley` falls into `field1`.
- `GOSUB initenemy` fills `enemy()` before `DIM enemy(20, 10)`, which in QB is "Array
  already dimensioned". `JIMMYXNEW` fixes this (moves the `DIM` up, makes it 20Ã—20).
- `sellweapon2` ends with `GOTO sellweapon` (the first town's shop).
- `RANDOMIZE TIMER` inside re-roll loops reseeds with the same second.
- `JIMMYX` reads `jinfo.jmm` but `JSETUP` writes `jinfo.jim`.
- Typos: "Theif", "Samori", "direcly", "dissapears", "breif".

### The two source versions

`JIMMYX.BAS` has the timed `ON KEY` battle that `JIMMY.INS` describes. `JIMMYXNEW.BAS`
swaps it for a plain `INPUT "Make a move"` (no timer), skips the `todir`/`jinfo` setup,
and fixes the `DIM`. See decision D1.

---

## 2. What changes from the brief

| Brief assumed | Jimmy X reality | Plan |
|---|---|---|
| VB6 + DirectX sprites | QuickBASIC text mode | Most new work is a **text-mode console**, not sprites |
| Per-pixel hit masks, click shooting | Numbered menus | **Tappable menu lines** and big buttons; no aiming |
| BMP â†’ WebP, Real-ESRGAN | No bitmap art at all | Art pipeline isn't needed. The look is an authentic VGA font + CGA palette, which stays crisp at any size |
| WAV â†’ MP3 | `.VOC`, `.WAV`, PC-speaker `PLAY` strings, `.CMF` FM music | Convert VOC/WAV with ffmpeg; **synthesize `PLAY` strings live** (square wave); CMF needs an OPL2 emulator (deferred, unused by Jimmy X) |
| Logical 1024Ã—768 | 80Ã—25 text = 640Ã—400 (or 720Ã—400) | Letterbox the text grid; on phones, landscape |

Everything else in the brief stands: faithful port first, `legacy/` read-only, "The
originalâ€¦" comments, a converter instead of hand edits, hub monitor wall, GitHub Pages.

---

## 3. Architecture

### Port by hand onto a shared "QB console" runtime (recommended)

Three ways to bring a QuickBASIC game to the browser:

1. **Emulate DOS (js-dos/DOSBox)** running QBasic and the original `.BAS`. The most authentic,
   and almost no work. But it has no touch UX, it's a heavy download, saves are awkward,
   and it would reproduce every crash. It could be an extra "original mode" later, not the
   main version.
2. **Write a QBasic interpreter** in TypeScript and run the `.BAS` files unchanged. It's
   reusable, but QB's `GOSUB` fall-through, `ON KEY`, `ON ERROR RESUME`, `SHELL` and
   `PLAY` semantics are a big project, and touch menus would still need per-game hooks.
3. **Hand-port to TypeScript** (MoF's approach) on a small runtime that mimics the QB
   statements the games use. **Recommended.** At 2,000 lines per game this is quick, and
   it turns the spaghetti into readable state. Each bug is fixed or kept on purpose and
   logged. It also gets real touch menus.

The runtime is the reusable part, so each later QB game is mostly content:

```
shared/
  engine/      loop, scaling, input, audio unlock      (extracted from MoF src/engine)
  qb/
    console.ts   80Ã—25 / 80Ã—50 text grid: CLS, LOCATE, COLOR fg/bg/blink, PRINT (with ; , TAB),
                 centred-line helper (Jimmy's `puts`), CP437 glyphs, cursor
    font/        Px437 IBM VGA 8x16 glyph atlas (CP437, CC BY-SA 4.0)
    input.ts     async INPUT / INKEY$ / key traps; tap-to-choose menu lines; on-screen keys
    screen13.ts  320Ã—200 indexed canvas, default VGA palette, PSET/LINE (BF, style)/CIRCLE/PAINT
    play.ts      the PLAY macro language (O L T MF MB MN ML MS < > notes, rests, dots) and SOUND/BEEP
                 â†’ Web Audio square wave, PC-speaker style
    voc.ts       (tools only) Creative Voice â†’ WAV for ffmpeg, if ffmpeg's VOC reader falls short
```

Game code is `async`: `await con.input()` and `await delay(5)` read like the original, and
the game's own clock pauses with the tab, as in MoF.

### Mobile

- The text grid renders at the original 80Ã—25 in landscape. An 844-pixel-wide phone gets
  about 10 px per column, which is readable in the VGA font.
- **Menu lines that start with a choice ("1 - Attack") become tap targets.** Tapping one
  sends the key, so the original layout stays and nothing needs typing.
- A slim rail on the right holds the commands you'd otherwise type (`HELP`, `INFO`,
  `USE`, `Q`) and Y/N when asked. The device keyboard only opens for naming a save.
- Battle: four big buttons plus the countdown, which is easier than the original keys.

### Repo

```
/index.html              hub wall (plain HTML)
/assets/                 logo, favicon set, comic pages + cut-outs (raw scans in a deploy-excluded art/ folder)
/shared/                 engine + qb runtime
/games/mof/              MoF, imported with full history (git subtree, section 0)
/games/jimmy1/  /games/jimmy2/  /games/jimmyx/
.github/workflows/       one build: every game â†’ dist/games/<slug>/, hub on top
```

---

## 4. Phases

**J0. Archive and repo**
- Archive MoF (section 0).
- Create `pnp-arcade`, import MoF, and move the inspiration and game folders in.
- Set up the workflow and a placeholder hub, and check that MoF plays from
  `/games/mof/`.

**Order of the ports.** Jimmy 1 comes first, as the pilot. It's the smallest, and it uses
only text and `PLAY`, so it proves the console runtime before Jimmy X. Then Jimmy X
(J1â€“J7 below), then Jimmy 2 (adds `SCREEN 1`). The phases below are written for Jimmy X;
Jimmy 1 and 2 run through J1â€“J6 the same way, just shorter.

**J1. Document the original**
- Copy `jimmyx/` to `games/jimmyx/legacy/`. The raw files are tiny (~9 MB with the video),
  so they can all go in git except the third-party EXEs.
- Write `PLAN.md`: the room graph (rooms, exits, encounter tables from `initenemy`), stat
  formulas, shop prices, spells, items, and the bug list above.
- The gameplay video is skipped for now. Viewing it needs ffmpeg, since browsers don't play MPEG-1.

**J2. Shared extraction**
Move MoF's `src/engine` pieces (loop, scaling, input, audio unlock, asset manifest) into
`shared/engine`, and point MoF at them. MoF must play exactly as before. Check this in
the browser.

**J3. QB console runtime**
- Text console, font, palette, async input, `PLAY` synth, `SCREEN 13` primitives.
- A test page that renders a known screen and plays `win$`, `star$` and the hit sound, so
  you can compare them with your memory or DOSBox.

**J4. Data + sound converters**
- `tools/convert.mjs`: VOC/WAV â†’ MP3, and the enemy, weapon, armour, spell, item and room
  tables extracted from the `.BAS` into JSON. Use a `PATCHES` table for typo and balance
  fixes, like MoF.

**J5. Port the game**
- Port in this order: main menu, rooms and travel, search, shops, guild, healer, battle
  (timer, attack/defence rolls, magic, flee, items), levelling, and a modern save system. Saves are versioned `localStorage` slots, with
  autosave on each room change and Continue on the main menu. The old `.JIM` files aren't
  carried forward. After those come the intro, help,
  instructions (`JIMMY.INS` is a tiny markup: `CL` clear, `WT` wait, `CR`, `;n` colour)
  and the error-screen animation as an easter egg.
- Simulation hook (`window.__jx`): run thousands of battles to check that the
  fixed-or-kept bugs and balance behave as intended. This is the brief's "real data, not
  reasoning" rule.

**J6. Touch and extras**
Tappable menus, the rail and the battle buttons. Possible extras: a bestiary, and a
"Classic mode" toggle that keeps the original bugs.

**J7. Finish the story** (new content, marked as additions)
Fill in what the original left empty, in its voice and screen style. Keep it as data so
it's easy to edit.
- **The hermit's house.** `HERMIT.VOC` was recorded for it. The hermit gives a quest that
  points toward Bob.
- **The rich side of the land**, past the toll: a town, a better shop tier, and the gate
  to Bob's territory.
- **Bob's army**, from the elf's rumour: an area with a new set of enemies, then **Bob**
  as the final boss, then an ending screen in `SCREEN 13`, like the intro.
- **The unused clips**, where they fit: `QUICK`, `CRUSHED`, `CLOTHES`, `GUN`, `ARTY`,
  `FART`. The `.CMF` music can join them once there's an OPL2 synth.
- **Who writes it:** I draft the room text, enemies and balance. You review it and rewrite
  it so it sounds like the two of you.
- **Balance:** checked with the simulation hook, so the level curve reaches Bob.

**J8. Hub**
- Monitor wall with the live games. The other slots are decorative screens: comic
  "commercials" (section 0.5), Jimmy X's intro as attract mode, and the BBS ad.
- The P&P Comics reader, the logo header, slogan, breadcrumbs and shared favicon.
- The hub can go live early, with only MoF, and grow as each port lands.

**J9. Real devices, then release.**

---

## 5. Decisions needed

- ~~D1. Base version.~~ **Decided:** `JIMMYX.BAS`'s timed battle, with `JIMMYXNEW`'s fixes.
- ~~D2. The missing ending.~~ **Decided:** fill in the missing content (J7).
- ~~D3. Repo.~~ **Decided:** one repo for *P&P Enterprises Classic Arcade*, with MoF
  archived first (section 0). Repo: `pnp-arcade`.
- ~~D4. Original saves.~~ **Decided:** a modern save system. `.JIM` saves aren't carried forward.
- ~~D5. Font.~~ **Decided:** a free retro font, **Px437 IBM VGA 8x16** from the *Ultimate
  Oldschool PC Font Pack* (int10h.org).
  - **Licence:** free, CC BY-SA 4.0. It needs a credit line on the about screen and in
    the README.
  - **Why this one:** it's the real DOS text-mode look, with the full CP437 set, which the
    intro's block-character logo needs.
  - **How it's drawn:** a `tools/` script renders it to a glyph atlas, so text stays
    pixel-sharp at any scale.
- ~~D6. Next games.~~ **Decided:** Jimmy 1 and Jimmy 2 (section 0.5).
  - **Open:** which port goes first. I recommend Jimmy 1 as the pilot.
  - **Open:** X-Wing War's source, when you find it.
