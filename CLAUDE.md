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
| `games/jimmy1/` | Jimmy (1994), ported to TypeScript on the shared QB runtime. Its own `package.json`, `PLAN.md` (changes from the original) and `CLAUDE.md` |
| `games/jimmyx/` | Jimmy X, the QuickBASIC RPG, on the same runtime. Its own `package.json`, `PLAN.md` (changes, balance, the new J7 story content) and `CLAUDE.md`. Its sound clips are converted by `npm run sounds` |
| `games/jimmy2/` | Jimmy 2. Only `legacy/` so far (the original source, read-only) |
| `shared/qb/` | The QuickBASIC text-mode runtime the Jimmy ports share: screen, VGA font, INPUT/SLEEP/PLAY, phone controls. See its `README.md` |
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

## Testing (for Claude)

- **Dev servers:** each game has its own: `npm run dev` in `games/<slug>`. By convention
  MoF runs on 5173, Jimmy on 5174 and Jimmy X on 5175. `.claude/launch.json` is gitignored.
- **Test the deployed layout:** assemble `_site/` as the workflow does, and serve it
  under `/pnp-arcade/`. This catches path problems (the games' back links go to `../../`).
- **Phones:** `?touch=1` forces the phone layout. Emulate a landscape phone that fits the
  pane (e.g. 667x375), since screenshots of bigger emulated viewports come out wrong.
- **Shell quirks:** don't put JS template literals inside `node -e` in the Bash tool, as
  bash expands the backticks and `${}`. Use the editor tools.

## Deploying

- **On push to `main`:** `.github/workflows/build.yml` builds each game, copies the hub on
  top, and publishes to Pages. Adding a game means a build step plus a `cp` line there.
- **Pages setting:** Repo Settings → Pages → Source must be **GitHub Actions**.
- **Paths:** each game builds with `base: './'`, so it runs from `/games/<slug>/`. The site
  shares the `bapenguin.github.io` origin with the old MoF URL, so MoF's `localStorage`
  saves carry over.
