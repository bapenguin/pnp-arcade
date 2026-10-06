# Jimmy (1994): port notes

*Jimmy* by Nick Puleo and David Paul (P&P Enterprises), © 1994. A QuickBASIC text
adventure: Jimmy wakes in a castle, meets a lizard, kills a hobbit (by accident), pays a
toll into Canen, and is sent by Bob on a run of errands that ends with Bob unmasked as
the villain at a mountain temple. "LOOK FOR JIMMY 2!"

**Status:** ported, playable start to finish (2026-10-06). Waiting on a real-phone check.

## The original

| | |
|---|---|
| Source | `legacy/JIM.BAK`: QuickBASIC's automatic backup of `JIM.BAS`, ~1,020 lines. No `.BAS` survives. `legacy/JIM.EXE` is the compiled game (needs the QB PDS 7 runtime `BRT70ENR.EXE`, kept in `intake/` only) |
| Docs | `legacy/JIMMY.DOC`: "Caps lock MUST be pressed throug the WHOLE game", plus hints (the password rhymes with DOOR) |
| Screen | `SCREEN 0` 80x25 text. `COLOR fg, bg, border` (the border flashes green on the title and in Bob's dialogue) |
| Input | `INPUT` for every choice. `SLEEP` / `SLEEP n` for pauses |
| Sound | PC speaker `PLAY`: the title tune (`star$`), `death$`, `win$`, `jump$`, and the guard's M16 |
| Saves | None |

### How it's structured

There's no structure as such: ~120 labels joined by `GOTO`, by `GOSUB` that never
`RETURN`s, and by code that falls off the end of one label into the next. `TIME` is the
story flag (0 = start, 1 = met Bob, 6 = guardian dead, 7 = has chainsaw, 9 = met the flame
monster, 11 = Resset, 12 = Leia, 14 = magic sword, 15 = won). Several story beats only work
because of fall-through (searching the hobbit falls into leaving for town; the password
falls into Resset), so the port keeps the original's shape: `src/jimmy1.ts` has one block
per label, each returning the label to go to next.

## The walkthrough

Castle hall: X (left) → lizard: talk → stairwell: up (knife) → hobbit: attack → search →
fork: left → gate: talk (toll $11) → Canen: buy leather armor, sell the crossbow, buy the
spear → talk to someone (Bob) → leave north → tree guardian: fight, attack again → back to
town, talk (Bob: the woodcutter) → bar (chainsaw) → north → tree: down the road west →
flame monster: talk → castle hall: Y (right) → cave: X → caverns: `FLOOR` (or the door) →
Resset: talk to the girl ("what's your name", yes) → magician (yes) → ferry (yes) → temple:
lunge, try again, use magic.

## Deliberate changes

Each is marked "The original…" in `src/jimmy1.ts`.

**Input**
- **Answers are case-insensitive.** The original compared with uppercase "X", "Y", "Q",
  "FLOOR" (so Caps Lock had to be on) but with lowercase "y"/"n" for Leia, the magician and
  the ferry, which Caps Lock then made unmatchable.
- **Anything that isn't a listed choice asks again.** In the original it often fell
  through into whatever came next:
  - buying the knife, a wooden shield or more armor
  - selling to the weapon shop
  - dying in the wolves' den or to Bob
  - at the castle hall and in the caverns, going back to line 10, which wiped all
    progress
- **`SLEEP` uses up the Enter (or tap) that ends it.** The original left the key in the
  buffer, so "Press ENTER" also answered the next question with a blank line. Other keys
  still carry over to the next `INPUT`, so typing a choice during a pause works as it did.

**Hangs and softlocks**
- **Bob froze the game.** Talking to someone at `TIME` 5, 7, 9 or later looped back to
  `BOB:` forever. It now says "No one is around".
- **The poem** repeated the slap forever with no way out. It now returns to the girl.
- **A wrong cavern password** went back to the hall, where `TIME` 10 left no way down. Only
  a death could get you out. It now asks again.
- **The cave's "go back"** went via line 10, wiping progress. It now goes back to the hall.
- **"Nobody around"** (talking in Resset after Leia) fell into talking to the girl anyway.
  It now returns to town.

**Mis-wired logic**
- **The knife** was `WEAPON = 1 AND MONEY = MONEY - 100`, which BASIC evaluates as a
  comparison: no knife, no charge.
- **The toll's payment** sat inside the "not enough money" `IF`, so it was never paid. It's
  now $11 once, then free (`NOMO`).
- **Selling armor** set `sheild = 0` (a typo), so the same armor could be sold forever.
- **Buying the Magic Shield** fell into "Sorry chump… stupid!!!!".
- **The magician**: "no magic here" went on to teach the trick and give the sword anyway.
  The trick now costs the $250 it asks for (the original's payment block was empty); a
  player who can't pay is turned away.
- **The fallen trees**: the chainsaw was never checked (Bob's tip alone let Jimmy "pull out
  his chainsaw"), and the tree was sliced twice.
- **The guardian**: heading north before meeting Bob (`TIME` 0) dropped Jimmy into the
  fight without the guardian appearing. Its intro now shows from `TIME` 0.
- **The guardian's spear death** played `die$`, which was never set (silent). It now plays
  `death$`.

**Readability**
- **Lines cleared before they could be read** get a short pause (a key skips it):
  - "There you go", "you don't have enough money", "Alrighty-then", "Thank you very much",
    "Thank you, kind sir"
  - the pit, "your pretty", "here is the trick", "I don't know you", "no magic here",
    "nobody around"
  - the end credits, which were cleared the instant they were printed, so only "LOOK FOR
    JIMMY 2!" was ever seen
- **The poem** was also cleared before its 15-second pause. It now shows during the pause.

**Kept as they were**
- the typos and the authors' spelling ("Prees", "Thenks a bellion", "gaurdian", "Resset"
  vs "Ressest")
- the jokes and the deaths
- the hobbit's "$311" (Jimmy gets $455)
- the guardian's "$55" (+$50, though that search is unreachable anyway)
- the ferry's "200 dollars" (it takes 250, and can leave Jimmy in debt)
- "go back" in the caverns being a fatal fall
- the trick falling straight into the bar scene
- the unreachable blocks (`Turnleft`, `MENU2`, `serchguard`: nothing sets `TIME` to 3, 4 or 5)

## Modern extras (additions)

- **DOS boot prompt** (`C:\JIMMY>JIM`). It's also the first tap browsers need before they
  allow sound.
- **"Press any key to continue"** after `END`, as in QuickBASIC, then back to the prompt.
- **Clickable/tappable menu lines.** On phones, the current menu's keys also appear as big
  buttons in the right rail, with Enter, the keyboard, mute and fullscreen.
- **Pauses** when the tab is hidden.

## Testing

`window.__qb` (dev only) is the `Host`.
- `__qb.clock.turbo = true` skips every pause and tune.
- `__qb.keys.push('X', 'Enter')` types.
- `__qb.qb.waiting` says what the game waits for.
- `__qb.screen.rowText(r)` reads a screen row.

A bot that feeds the walkthrough's answers whenever `waiting === 'input'` reaches
"CONGRATULATIONS" in a couple of seconds.
