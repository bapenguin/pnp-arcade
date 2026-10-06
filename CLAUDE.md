# P&P Enterprises Classic Arcade: project memory

A browser arcade of games Nick Puleo and David Paul (P&P Enterprises) made in the 90s and
2000s: faithful ports plus marked modern extras, under one hub page.
**Live:** https://bapenguin.github.io/pnp-arcade/ (deployed from `main`).

- `PLAN.md`: the working plan, covering the archive, the site, the game roster, the
  Jimmy X port phases and the open decisions. Keep its status lines current.
- `BRIEF.md`: lessons carried over from nightnibbler.cc and the MoF port (hub design,
  porting playbook, gotchas). It's background reading; `PLAN.md` overrides it where they differ.
- Each game has its own `CLAUDE.md`/`PLAN.md` (MoF's: `games/mof/CLAUDE.md`).

## Layout

| Path | What |
|---|---|
| `index.html`, `assets/` | The hub: plain HTML, no build. `assets/` is made by `npm run hub-assets` from `art/` |
| `games/mof/` | Massacre of the Fairies (TypeScript + Vite), imported with full history via `git subtree`. Its own `package.json`; it builds and plays on its own |
| `games/jimmy1/`, `jimmy2/`, `jimmyx/` | The QuickBASIC Jimmy games. Only `legacy/` so far (the original source and data, read-only) |
| `art/` | Full-size source art, not deployed: `brand/` (logos, the 2000s banner), `comic/` (*Star Detours* scans, 1993 originals + 2005 restorations) |
| `tools/` | Site-wide scripts |
| `intake/` | **Gitignored.** The original folders exactly as they were handed over, including third-party files that mustn't ship (DOS sound/FLI players, the QB PDS runtime, a stray Doom backup, the Jimmy X gameplay video). P&P files were copied from here into `games/*/legacy` and `art/` |

## Archive of standalone MoF

Before the move, MoF was archived:
- **Tag:** `mof-standalone-v1` in `bapenguin/MoF`.
- **Backups:** `E:\GIT\MoF-standalone.bundle` (the full repo) and
  `E:\GIT\MoF-standalone-v1-web.zip` (the built site).
- **`bapenguin/MoF`:** still live at https://bapenguin.github.io/MoF/. Archive it on GitHub
  only once the arcade's copy is confirmed live.

MoF's day-to-day work now happens in `games/mof/`.

## Conventions

- **Faithful port first:** see `BRIEF.md` section 4 and MoF's conventions. Comment every
  deliberate change with "The original…" and log it in the game's `PLAN.md`.
- **`legacy/` folders are read-only**, and raw media stays out of git.
- **Commit and push only when Nick asks.** He reviews each step first.
- **Windows:** PowerShell 5.1's `Set-Content -Encoding utf8` adds a BOM. Write files with the
  editor tools or node instead. In `git commit -m` here-strings, use single quotes in the
  message.

## Deploying

- **On push to `main`:** `.github/workflows/build.yml` builds each game, copies the hub on
  top, and publishes to Pages. Adding a game means a build step plus a `cp` line there.
- **Pages setting:** Repo Settings → Pages → Source must be **GitHub Actions**.
- **Paths:** each game builds with `base: './'`, so it runs from `/games/<slug>/`. The site
  shares the `bapenguin.github.io` origin with the old MoF URL, so MoF's `localStorage`
  saves carry over.
