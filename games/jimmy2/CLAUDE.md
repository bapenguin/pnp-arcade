# Jimmy 2: The Final Voyage: project memory

The QuickBASIC text adventure the authors never finished, ported onto the shared QB
runtime (`../../shared/qb/`, see its README) and completed with new content. `PLAN.md` has
the original's structure, where it stops, the walkthrough, every deliberate change and
the new story. Read it before touching `src/`.

- **Port style:** `src/jimmy2.ts` mirrors `legacy/JIMMY2.BAS` label for label, keeping the
  original's text exactly (typos included). Change behaviour only with a "The original…"
  comment and a line in `PLAN.md`; mark new content "New".
- **Files:** `src/intro.ts` is `SUB INTRO` (its two flashes use `SCREEN 1`).
  `src/effects.ts` is `SUB flash` and `SUB magic`, which the original never called.
- **Dev server:** `npm run dev` (port 5176 by convention).
- **Testing:** use the `window.__qb` hooks (see `PLAN.md`). Read
  `__qb.screen.rowText()` rather than trusting a screenshot.
