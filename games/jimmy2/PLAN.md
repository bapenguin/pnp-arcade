# Jimmy 2: The Final Voyage: port notes

*Jimmy 2: The Final Voyage* by Nick Puleo and David Paul (P&P Enterprises). A QuickBASIC
text adventure: after killing Bob at the temple in Jimmy 1, Jimmy has to take a statue of
FORGON (or FARGAN) to BESTAW (or BASTEW) on another planet, and is lost in a jungle.

**Status:** ported, and the unfinished story completed (2026-10-07). Playable start to
finish. Waiting on a real-phone check.

## The original

| | |
|---|---|
| Source | `legacy/JIMMY2.BAS`, ~490 lines, last saved May 1996. No compiled `.EXE` survives |
| Docs | `legacy/JIMMY.DOC` is Jimmy 1's doc (one typo apart). Its hints (the underground door, the castle) are for Jimmy 1 |
| Screen | `SCREEN 0` 80x25 text. The intro flashes two pictures in `SCREEN 1` (CGA, 320x200, 4 colours), cycling the background colour |
| Input | `INPUT` for every choice. `SLEEP` / `SLEEP n` for pauses |
| Sound | PC speaker `PLAY`: two spooky tunes in the intro, played `MB` (in the background) |
| Saves | None |

### How it's structured

The same shape as Jimmy 1: labels joined by `GOTO`, `GOSUB`s that never `RETURN`, and
fall-through. `src/jimmy2.ts` has one block per label. `time` is the story flag
(0 = start, 1 = has the bow, 2 = has the monkey; the new content adds 3 = passed the
trial, 4 = crossed the chasm, 5 = got past the chief, 15 = won).

**Where the original stops:** at the Well of Elders, "go right" printed " DIE", "take a
sip" printed " YOU die", and the temple's three choices were empty labels that ran on into
both. Then the code fell into the item list, whose `RETURN` went back to the last open
`GOSUB`: the menu at the well, or the one outside the temple. So the game never ended.
Jimmy died, checked his pockets and stood at the temple again, forever.

**Never used:** `SUB flash` and `SUB magic` (a box jumping round the screen with
`GET`/`PUT XOR`) were declared but never called. They're ported in `src/effects.ts`, and
the new content uses both. The item list also knew items the game never handed out
(Lulu's Lance, the Magic Sword, Chain Mail, rope, a chainsaw, 500 pieces of wood, money):
it was copied from Jimmy 1's.

## The walkthrough

Edge of the jungle: 1 (bow), 3 (monkey), 2 (deeper) → the monkey spots the pit → 1 → 1
(right: "the opposite of the opposite of your right") → 2 (BANG on the door) → guess the
number (1-100, six tries) → the old man gives directions and Puleo's Pulverizer → 1 →
1 (the log: Paul's Armor) → 1 (attack the Mombizan warrior) → the Well of Elders → 1 →
the temple. This is where the original ends.

New from here: 1 (into the temple) → 1 (the gift shop): 5 (sell the knife, $25), 6 (sell
the shield, $250), 1 (Lulu's Lance, $225), 2 (rope, $50), 7 → 2 (the altar) → any key to
stop the magic → 1 (attack: the lance wins the Magic Sword) → 4 (leave) → 2 (right at the
temple) → 2 (swing across on the rope) → 1 (the chief: draw the Magic Sword) → 3 (shout
"I HAVE YOUR STATUE!") → Bestaw → the ending.

Deaths:
- deeper without the monkey (the pit)
- left in the jungle (lost forever)
- losing the number game (strained brain)
- talking to the warrior
- attacking him without the armor
- new: right at the well (soup night), a sip from the well (old age), the guardian
  without the lance, jumping the chasm, the chief without the Magic Sword, and talking to
  the chief

## Deliberate changes

Each is marked "The original…" in `src/`.

**Input**
- **Answers are case-insensitive** (only "PLAY INTRO?" takes a letter).
- **Anything that isn't a listed choice asks again.** The original fell through into the
  next block at the jungle's edge (finding a weapon), the hut's door, the log (searching
  it) and the warrior (talking: death).

**Mis-wired logic**
- **Looking for a weapon after finding the monkey lost the monkey.** `weap` checked
  `time = 1` and then set it, so with the monkey (`time = 2`) it showed a blank screen,
  quietly swapped the monkey for a bow, and the next walk ended in the pit. Now the bow is
  found once ("You already have a weapon" after that) and the monkey stays.

**Readability**
- **Lines cleared before they could be read** now get a pause:
  - the hunter's pit death
  - the strained brain death
  - "You knock on the door but know one answers"
- **"You walk deeper into the jungle"** was printed after the pause and cleared at once.
  It now shows during the pause.
- **Finding the monkey** no longer waits 4 seconds with nothing on screen first. The
  4-second pause is kept for "No one is around".
- **The intro's animations** (the colour flashes, the J and the 2 sliding together) ran
  as fast as the PC could loop. Each step now takes a frame or so (about 1 s per flash and
  per letter), the same on every machine.

**Kept as they were**
- the typos ("numdber", "know one answers", "a see a huge temple", "pulvorizer",
  "programed")
- "BANG on the door" printing "You knock on the door"
- winning the warrior's weapons swapping Puleo's Pulverizer for a Ginsu Knife
- the double pause after making the bow
- " DIE" and " YOU die" at the well, which now end the game after a reason each

## The finished story (new)

The original's own text says where it was going: the hut's old man says to "turn left at
the Well Of Elders and then turn right at the Temple of Asterixey" to find Bestaw. Jimmy X
(the sequel) already assumed Jimmy got there: Bestaw has had FORGON "staring at me" for two
years, and Bob says "You stole my statue". Nick didn't have the plans any more, so the
gaps were filled from the games' own material, in their voice. Every new block is marked
"New" in `src/jimmy2.ts`.

| Where | What |
|---|---|
| The well | "Go right" walks into a Mombizan cooking pot (" DIE"); a sip makes Jimmy an elder, fast (" YOU die") |
| Inside the temple | The Temple of Asterixey. It smells like feet. Brother Larry's gift shop by the door, a stone guardian at the altar, and the item list |
| The gift shop | Sells Lulu's Lance ($225) and rope ($50), and jokes about Chain Mail (Paul's Armor is better) and the Magic Sword ("the display model", $5000). Buys the Ginsu Knife ($25) and the Dragon's Skin Shield ($250). Jimmy 1's hint "sell the one you have" applies: one weapon at a time |
| The altar | The Trial of Asterixey: the guardian says "BEHOLD!" and `SUB magic` runs. Lulu's Lance outreaches its stone fists and wins the Magic Sword; anything else gets Jimmy sat on. Jimmy 1's blinding trick doesn't work on a statue |
| Right at the temple | A chasm. "BRIDGE OUT. SOMEBODY TOOK 500 PIECES OF WOOD" (Jimmy 1's wood). The rope swings Jimmy across |
| The Mombizan chief | Furious about his warrior's butt. The Magic Sword hums, and he remembers he left the oven on |
| Bestaw's hut | "GO AWAY. I'M A HERMIT." Knocking repeats the hut's "know one answers"; shouting about the statue gets the door open. Bestaw ("Not Bastew"), the guy in the bar who vanished, and PROPERTY OF BOB on the statue's base: the setup for Jimmy X. Something in the bushes "disapears" (Bob's move in Jimmy 1) |
| The ending | `SUB flash`, Jimmy 1's win tune, the credits in Jimmy 1's style, "LOOK FOR JIMMY X!", "CONGRATULATIONS" |

**No dead ends:** the jungle holds exactly $275 (the knife and the shield), which buys the
lance and the rope. Brother Larry takes the lance back at full price ("store credit"), and
won't buy the Magic Sword or sell the Chain Mail, so no order of purchases leaves the
game unwinnable. The chief and the chasm can be crossed back to the temple.

## Modern extras (additions)

The same as Jimmy 1: the DOS boot prompt (`C:\JIMMY>JIMMY2`), "Press any key to continue"
after `END`, clickable/tappable menu lines and the phone rail, and pausing when the tab is
hidden.

## Testing

`window.__qb` (dev only) is the `Host`; see Jimmy 1's `PLAN.md` for the hooks. Set
`Math.random = () => 0.5` before the hut and the number is 51.
- **Winning answers:** `N 1 3 2 1 1 2 51 1 1 1 1 1`, which reaches the temple, then
  `1 5 6 1 2 7 2 1 4 2 2 1 1 2 3`.
- **`SUB magic`** waits on `inkey`, so a bot must press a key when `waiting === 'inkey'`.
- **Bots:** only type an answer once `__qb.keys.length === 0`. In turbo mode, a `SLEEP`
  drops a queued Enter that arrives while it runs, which merges two answers into one.
