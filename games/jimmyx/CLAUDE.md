# Jimmy X: project memory

The QuickBASIC RPG, ported onto the shared QB runtime (`../../shared/qb/`, see its
README). `PLAN.md` has the original's structure, the map, every deliberate change, the
battle odds and the new story content (J7: everything marked "New (J7)" in `src/`). Read it before changing behaviour.

**Layout**
- `src/jimmyx.ts` mirrors `legacy/JIMMYX.BAS`: one method per room or menu label, with the
  original text kept exactly.
- `GOTO MMenu` and `GOTO chkroom` are the exceptions `ToMenu` and `ToRoom`.
- Tables are in `src/data.ts`; the combat maths is in `src/battle.ts` (pure, so it can be
  simulated).

**Sounds:** `npm run sounds` regenerates `public/sfx/` from `legacy/`, with no extra tools.

**Testing:**
- **Dev server:** `npm run dev` (port 5175 by convention).
- **Hooks:** `window.__qb` and `window.__jx`. `PLAN.md` has the bot pattern.
- **Battles** read single keys (`waiting === 'inkey'`); everything else is INPUT.
- **Balance:** check changes by simulating fights, not by reasoning.
