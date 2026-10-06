# Jimmy (1994): project memory

The QuickBASIC text adventure, ported onto the shared QB runtime (`../../shared/qb/`,
see its README). `PLAN.md` has the original's structure, the walkthrough, and every
deliberate change. Read it before touching `src/jimmy1.ts`.

- **Port style:** `src/jimmy1.ts` mirrors `legacy/JIM.BAK` label for label, keeping the
  original's text exactly (typos included). Change behaviour only with a "The original…"
  comment and a line in `PLAN.md`.
- **Dev server:** `npm run dev` (Vite). The shared runtime is imported from two folders up
  (`server.fs.allow` in `vite.config.ts`).
- **Testing:** use the `window.__qb` hooks in `PLAN.md`. The preview pane only runs
  `requestAnimationFrame` while it's drawn, so the screen can look stale between tool
  calls; read `__qb.screen.rowText()` instead of trusting a screenshot.
