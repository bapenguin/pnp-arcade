# Jimmy X: port notes

*Jimmy X: "the next generation in the Jimmy line of games"*, by Nick Puleo and David Paul
(P&P), mid-1990s. The main menu calls it *Memories.. and other stuff I remember*. It's a
menu-driven RPG: Jimmy wanders a small land, fights timed battles, buys weapons, armor,
magic and potions, and levels up. The goal is to destroy Bob, who never appears (see
J7 below).

**Status, 2026-10-06:**
- **Done (J1-J6):** the original is ported and playable, with saves.
- **Next (J7):** the missing story, waiting on your input.

## The original

| | |
|---|---|
| **Source** | `legacy/JIMMYX.BAS`, ~2,050 lines of QuickBASIC. `legacy/JIMMYXNEW.BAS` is a later copy adapted for QB64: `_DELAY` timing, the `DIM` fix, setup removed, and battles changed to typed input (see below) |
| **Screens** | `SCREEN 0` text, 80x25. Room text is centred by `puts`, and answers are typed on the bottom row by `choice`. The intro uses `SCREEN 13` (320x200x256) |
| **Battles** | `ON KEY` traps on 1-4 (or the keypad), with a 10-second countdown at the top. When it runs out, the enemy strikes |
| **Sound** | Sound Blaster clips via `SHELL "play x.voc"` (`legacy/PLAY.EXE`, third-party, not shipped), plus PC-speaker `PLAY` for the win jingle and the enemy's hit |
| **Saves** | `name.JIM` text files with 17 stats and 20 item slots |
| **Data** | All in code. `src/data.ts` collects it (enemies, weapons, armor, items, spells, which enemies roam which room) |

**Base version.** The port follows `JIMMYX.BAS`, keeping the timed battles that
`JIMMY.INS` describes, and takes these from `JIMMYXNEW.BAS`:
- the `DIM enemy()` fix
- the intro always showing "P&P Presents.."
- its delay timing as a guide

### Map

```
                 rich side (18) --?
                        |  toll $20
 dark forest (7) - forest edge (2) - field (1) - Regelt SW (3) - weapon shop (4)
   |  climb            road N (17)      |            |  talk: healer (6)
 elves' town (14)                    valley (11)  Regelt NW (8) - armor shop (10)
   shop (15), elf (16)                 cave (12)       |  guild (9)
   |  south
 creek (13) - hermit's door (19)
```

## Deliberate changes

Each is marked "The original…" in `src/`.

**Freezes and dead ends**
- **Knocking on the hermit's door froze the game.** The empty `hermit:` label fell through
  the next rooms' loops and back forever. Nobody answers yet; J7 fills it in.
- **The elf's rumour.** Its `GOSUB`s fell into each other, so the clips and the text
  repeated two or three times.
- **Backing out of the battle magic menu** left the battle keys switched off, so Jimmy
  had to wait out the countdown.

**Combat**
- **Enemy rolls fell through.** Several enemies lacked a `RETURN` and fell into the next
  one's encounter roll, adding enemies to rooms that didn't list them:
  - the orangutan put the Evil Ninja in the field and at the forest edge, a fight a
    level-1 Jimmy can't win
  - the stone giant added the bearded lady and the raptor
- **The bear was unreachable.** The enemy scan stopped at slot 10 before reading it, so
  the creek's bear never appeared.
- **Enemy strikes used stale strengths.** An enemy that struck first (time up, or after a
  spell) hit with the previous enemy's strength, or 0 at the start of a game.
- **The magic menu listed the wrong spells.** `CASE IS = 1 OR 2` means `CASE 3`, and cases
  fell through. It now lists exactly the spells Jimmy can cast.
- **Mp checks.** Windbolt and Earthquake didn't check Mp, so Mp could go negative.
- **Items in battle.** Using one drew the menu over the item list without clearing it.

**Shops and items**
- **Chain Mail** cost 125 (`sp = 350`, a typo for `ap`). The armor list also showed
  5-7, which were copies of Iron Armor.
- **Regelt's weapon shop.** After a visit to the elves, every purchase jumped to the elves'
  price list (`shop` was never reset).
- **Wrong sales on a bad answer.** An answer other than Y/N when selling armor (or to the
  elves) went on to sell Jimmy's weapon instead.
- **Mega Poffite and Mega Hoffite** did nothing when used. They now restore 20 (the plain
  ones restore 10).
- **The sleep potion** was never used up, so one potion meant endless free hits.
- **Buying items** printed every slot's contents (a debug leftover), and said "Not enough
  room" when the item went into the last slot.

**Readability**
- **Pauses.** `CALL delay(x)` was an empty loop as long as the PC was fast. It's now x/4
  seconds, and any key skips it (the QB64 copy used x/10).
- **Messages that were cleared before they could be read** now get a short pause:
  - "Here comes a bad guy"
  - "You are healed"
  - "Jimmy gets the raptor claw!!"
  - the HELP reply
- **The instructions** dropped the first line of the NumLock note (a `CR` with text after it).

**Modern extras**
- **Sound starts on.** The original's Options switch started off; the page has its own
  mute button.
- **Saves:**
  - three named browser slots instead of `.JIM` files
  - an autosave each time Jimmy changes room, so "6 - Resume your game" works after
    closing the tab
  - a death clears the autosave, as the original's `notsaved = 0` did
- **Battle controls:** the menu lines can be clicked or tapped, and on phones the rail
  shows big 1-4 buttons that act at once, like the original's keys.
- **All answers are case-insensitive**, as the original's `UCASE$` already made most of them.

**Kept as they were**
- **The raptor claw:** the valley's cave hands it to a level-1 Jimmy (weapon 8, worth
  $25,000), which makes the game easy from then on.
- **Shop and toll quirks:**
  - selling to Regelt's weapon shop turns the shop blinking magenta (`COLOR 21`)
  - the $20 toll has no money check
- **Unbuilt places:**
  - "go South/East" in Regelt and "Recieve a magic lesson" do nothing
  - the rich side of the land sends Jimmy back to the field (until J7)
- **Odd numbers:**
  - HELP always says "Sorry, You're on your own." (`points` is never earned)
  - the pond in the field turns up 1 time in 20, not 2 (`CASE IS = 9 OR opp = 5`)
- **Every typo** in the text.
- **Screen scrolling:** a new line on row 25 scrolls the whole screen, as in QB. That's
  why room text sits two rows higher than its `t$()` numbers, and why the intro's smiley
  leaves a diagonal trail on the last row.

## Sound

`npm run sounds` (`tools/convert-sounds.mjs`) converts `legacy/*.VOC`/`*.WAV` to
`public/sfx/*.wav` and needs no ffmpeg.
- **Fake VOCs:** some "VOCs" are really WAVs, and are copied as they are.
- **8-bit PCM VOCs** are unpacked.
- **4-bit ADPCM (`MYDAY`, `CLOTHES`)** is decoded with the Sound Blaster's step tables.
  `MYDAY.VOC`'s steps lean upwards, so a clamped decode climbs into the ceiling. It's
  decoded unclamped, the drift is filtered out (a 40 Hz high-pass), and the level is
  normalised.
- **Used by the game:** `myday`, `backoff`, `meanswar` (encounters), `ouch` (death),
  `thankyou` (shops), `hello` + `army` (the elf), `toll`.
- **Unused, available for J7:** `hermit`, `quick`, `crushed`, `clothes`, `gun`, `arty`,
  `fart`, `intro`, `beavhuh1`, `butthuh1`, `snd07`, `shoot`.

## Balance (simulated, always attacking, 4,000 fights each)

| Jimmy | Wins against |
|---|---|
| Level 1, fists | rat, dog, thief, stone giant: 100%. Bear 39%, bearded lady 23%, orangutan 19%. Ninja, vulture, raptor: 0% |
| Level 1, axe + leather clothes | everything except the ninja, vulture and raptor: 100% |
| Level 1, raptor claw | everything but the vulture: 100% |
| Level 4, claw + iron armor | everything: 100% |

Running always works, so a fresh Jimmy survives by running from the orangutan and the
bearded lady in the starting field. The claw from the cave is the big jump. J7's new
enemies (and Bob) need to be tuned against these numbers.

## J7: finishing the story (draft, for review)

The original sets up Bob and never delivers him: the elf's rumour, the toll road to "the
rich part of the land", and a hermit whose clip (`HERMIT.VOC`, 17 s) was recorded but never
used. Here's an outline to react to. The writing should sound like you two, so treat
every line here as a placeholder.

1. **The hermit (room 19).** Plays `HERMIT.VOC`. He knew Jimmy from Jimmy 2's temple and
   says Bob survived the sword. Bob's army camps past the rich side of the land, and only
   the *Dragons Sword* (or a trusted army) can get through its gate. He sells the last
   spell lesson, finally making the guild's "magic lesson" do something.
2. **The rich side (room 18).** A walled town with a pricier shop tier (the Dragons Sword
   and Cannon), a bank (`QUICK.VOC`?), and the gate to Bob's camp, guarded by a captain.
3. **Bob's camp (2-3 new rooms).** New enemies (soldiers, a war machine with `ARTY.VOC` and
   `GUN.VOC`), tuned so a level 5-6 Jimmy with good gear wins about 70% of the time.
4. **Bob.** The boss fight, in the same timed-battle style, with a twist from the Jimmy 1
   ending (he disappears and must be found).
5. **The ending.** A `SCREEN 13` sequence like the intro ("The first one's second sequal's
   ending"?), then credits.

**Open questions for you:**
- Did you two plan anything for Bob's army, the rich side, or the hermit back then?
- Should "go South/East" from Regelt lead somewhere new?
- Should the raptor claw stay a free gift in the cave? It makes everything after it easy.
  Moving it behind the stone giant would keep the original's fun but add a fight.

## Testing

`window.__qb` (Host) and `window.__jx` (the game: stats, `roomnum`, `rng`) in dev.
- `__qb.clock.turbo = true` skips waits; battles still wait for a key.
- A bot that presses `1` whenever `__qb.qb.waiting === 'inkey'`, Enter on `sleep`/`key`,
  and feeds menu answers on `input` can tour every room in seconds.
- Battle odds: import `/src/battle.ts` and `/src/data.ts` in the page and roll fights.
