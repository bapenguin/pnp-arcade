# Retro Arcade: project brief

*Working name, still to be decided.* A browser arcade of mini-games ported from early-2000s
originals: VB6 + DirectX era games like *Massacre of the Fairies* (P&P Enterprises, ~2004).
This brief carries over what worked, and what went wrong, on **nightnibbler.cc** (a
concert-themed browser arcade) and the **MoF** port (`E:\GIT\MoF`), so this site starts
from those lessons instead of rediscovering them.

Drop it into the new repo as a starting `CLAUDE.md` or `PLAN.md`, and trim it as decisions get made.

---

## 1. The idea

- A **hub page** shows every game as a screen on a wall. Click one to play.
- Each game is a **faithful port** of an original, plus optional modern extras
  (touch controls, saves, difficulty, stars) clearly marked as additions.
- The original source and media stay in the repo as read-only reference, so every port
  can be checked against the real thing.

**First game:** Massacre of the Fairies. Its port is finished and live at
https://bapenguin.github.io/MoF/. It currently lives in its own repo. Decide whether it
moves in here or gets linked from the hub (see section 3).

---

## 2. What to carry over from nightnibbler.cc

### The hub

nightnibbler.cc's hub is a **"monitor wall"**: a grid of tilted CRT screens, each a game.
It's the part of that site people react to, and it fits a retro arcade even better.

- **Each screen is a unit:** a bezel, a screen with scanlines and a slight flicker, a
  small plate underneath (`TERM–01`), and a cable hanging down. A live game shows its
  title, a one-line hook, and a "Play now" button.
- **Slight random tilt per screen** (between −2.3° and 2.3°, set with a `--tilt` CSS
  variable) makes the wall feel physical rather than a tidy grid.
- **No empty screens.** The owner didn't want "offline" placeholders. When there are fewer
  games than slots, fill the gaps with decorative screens (nightnibbler uses "crowd cam"
  photos with a blinking REC light). For this site that could be attract-mode loops of
  each original, box art, or old screenshots.
- **Keep the wall a full grid.** nightnibbler is 4 across. Add games by replacing a
  decorative screen, or add a whole row.
- **A slogan that names the games.** nightnibbler's is "Doors at eight. Chaos by
  eight-oh-one." with a subline that name-checks each game. Write one for this site's theme.
- The hub stays a **plain static page** with no build step. It's the one page that should
  never break.

### Every game page

- Its own colour palette in `:root` CSS variables. Games don't have to share a look.
- A **breadcrumb link back to the hub** in its top bar, styled with that game's palette.
- The **shared favicon** set. Generate it once and reuse it everywhere.
- Pauses itself when the tab is hidden.

### Habits worth keeping

- **Validate balance and design changes with real data, not reasoning.** Simulate many
  runs through a debug hook, or playtest, before calling something balanced. Several
  nightnibbler "fixes" that sounded right made things worse.
- **Keep reusable scripts in `tools/`**, never as one-offs. nightnibbler's image scripts
  sat in a temp folder for weeks and were nearly lost. Check scripts reproduce the shipped
  files byte-for-byte, so anyone can rebuild an asset exactly.
- **A maintainer's handbook** (deploy steps, tunables, art pipeline, gotchas) kept current
  as the site changes.

---

## 3. Decisions to make first

Each comes with a recommendation from what the two projects learned.

### Stack: plain HTML or a build step?

| | nightnibbler.cc | MoF |
|---|---|---|
| Approach | One self-contained HTML file per game, no build | TypeScript + Vite + Canvas 2D + Web Audio |
| Good for | Small original games written from scratch | Porting real legacy code with sprites, sound and data files |
| Pain points | Large files get hard to manage; no type checking | Needs Node; a build before deploying |

**Recommendation:** keep the **hub as plain HTML** and build **each port with TypeScript +
Vite**, like MoF. A VB6 game has modules, forms, data files and dozens of sprites;
TypeScript's structure and checking pay off quickly when translating that logic. Build
each game with `base: './'` so it works from any subfolder (`/games/<slug>/`).

Vite also **fingerprints asset filenames** with content hashes. That removes
nightnibbler's biggest recurring problem (stale cached art, section 6) without any manual
version bumping.

### Hosting

| | nightnibbler.cc | MoF |
|---|---|---|
| Host | cPanel shared hosting behind Cloudflare | GitHub Pages |
| Deploy | Push to a cPanel-tracked remote, which rsyncs to `public_html` | Push to `main`; a GitHub Actions workflow builds and publishes |
| Pain points | Permission resets, no `--delete`, aggressive edge caching, manual server restarts | Pages must be set to "GitHub Actions" or it serves raw source |

**Recommendation:** **GitHub Actions + GitHub Pages**, with one workflow that builds every
game into one `dist/` and publishes the hub on top. It's free, it has HTTPS (needed for
installable offline play), and builds happen in CI rather than on a laptop. Attach `dist/`
as a workflow artifact too, so it can be uploaded to any other server later. If you'd
rather use a custom domain behind Cloudflare, read section 6 first.

### One repo or many?

**Recommendation:** **one repo** (a monorepo), one folder per game. Shared engine pieces
(loop, input, scaling, audio unlock, sprite hit masks) can be reused across ports instead
of being copied, and one deploy publishes everything. MoF's engine (`src/engine/` there)
is a good starting point to extract.

### Backends

**Avoid them unless a game truly needs one.** nightnibbler's one networked game needed a
Node process under pm2, a separate subdomain, a reverse proxy, Cloudflare DNS set to
"DNS only" (proxying broke WebSockets for real players), and a manual restart after every
server change. Static games with `localStorage` saves (like MoF's profiles and settings)
need none of that. Online leaderboards can come later as their own small project.

---

## 4. The porting playbook

MoF's approach, written up so every port follows it.

### Rules

- **Faithful port first.** Keep the original behaviour unless it was clearly a bug. Mark
  every deliberate change with a code comment starting "The original…" and log it in the
  game's `PLAN.md`, with the reason.
- **`legacy/` is read-only.** The original source and data stay exactly as they were.
- **Never hand-edit generated data.** Convert original data files (`.txt` scenarios, level
  files) to JSON with a script in `tools/`. Put balance and content changes in the
  converter (MoF has `RENAMES` and `PATCHES` tables), then regenerate.
- **Keep raw media out of git** (MoF's is ~180 MB of BMP/WAV/AVI). Commit the converted,
  web-ready versions so the site builds from a fresh clone, and note in the README where
  the raw originals live.
- **Log the original's bugs** as you find them, even ones you choose to keep.

### Technical translation

| Original (VB6 / DirectX 7) | Browser |
|---|---|
| Game loop tied to vsync | Fixed 60 Hz update with interpolation, so speed doesn't vary with refresh rate. Keep a scene clock that stops while paused, for gameplay timing |
| Fixed resolution (640×480, 800×600, 1024×768) | Keep the original logical resolution and letterbox-scale the canvas to fit |
| BMP sprites with black as transparent | PNG/WebP with black keyed to transparent, converted by a script |
| DirectX collision | Per-pixel hit masks from the sprite alpha, so clicks match what you see |
| WAV / DirectSound | MP3 via Web Audio. Unlock audio on the first tap or click |
| Mouse and keyboard only | Pointer events for mouse and touch, plus on-screen controls on phones (landscape) |
| Saves in local files | `localStorage`, with versioned keys and a migration path |
| VB forms for menus | An HTML overlay laid out in the game's logical coordinates |

### Modern extras (optional, marked as additions)

MoF added streak multipliers, a three-star rating per level, level replay, Easy / Normal /
Hard, shareable setup links, installable offline play (service worker), and 2× art for
phones. Pick per game, and keep the original playable as it was.

### Upscaling old art

Low-resolution art looks soft on phones. MoF's pipeline: Real-ESRGAN x4plus at 2×, after
"defringing" the black colour-key edges, with a **review page** to compare 1× and 2× before
committing. Small text in art smears when upscaled, so redraw those pieces as SVG instead.

---

## 5. New art (when a game needs it)

nightnibbler's art was generated with ChatGPT. What made that work:

- **Pick one style and anchor it.** Keep a reference image and restate the style in every
  prompt ("flat comic-book ink style, bold black outlines, flat cel-shaded colouring, not
  3D or painterly"). Results drift into 3D or painterly looks without it.
- **One thing per message**, in one long-running chat, so the style stays consistent.
- **Animations must be generated in one image.** Separately generated frames never line up
  (nightnibbler's first band animation jittered because the drummer moved between frames).
  Ask for every frame in one grid image from a fixed camera, then slice it with a script.
- **Modular parts beat one-off variants.** Separate heads, torsos and legs composited by
  script gave 24 outfits from 16 drawings. Insist that heads end at the bare neck so any
  head fits any torso.
- **Check every download** before using it. Retries sometimes download the previous image again.
- **Tight-crop sprites** so they all fill their on-screen box the same way.
- Keep **raw art in a deploy-excluded folder**, processed copies in the shipped assets folder.
- Watch for **real brand or band names** sneaking into generated backgrounds.

---

## 6. Gotchas to avoid

Each of these cost real time on nightnibbler.cc.

| Problem | What happened | Avoid it by |
|---|---|---|
| **Stale cached art** | Cloudflare kept serving old images for days after deploys; some files refreshed, others didn't | Hashed filenames (Vite does this), or a version query on every image URL bumped when art changes |
| **Deploy "succeeds" but site is down** | The cPanel host intermittently reset the web root to 750, a 403 for every visitor. Happened three times | Check the live site after every deploy, every time. GitHub Pages avoids this |
| **Deleted files stay online** | rsync without `--delete` never removes anything from the server | Deploy a fresh `dist/` each time (Pages does), or clean up by hand |
| **Half-committed changes** | `git add` with one missing path staged nothing, and the commit missed files | Check `git status` before committing, and confirm a known change is in `git show HEAD:<file>` |
| **Double-tap races** | A double tap sent two "start" messages; the game started twice and the player's sprite vanished | Lock buttons until the action completes; make "start" idempotent on both ends |
| **Stale DOM references** | Rebuilding a scene removed an element while the code still held a reference to it | Clear cached element references whenever their container is rebuilt |
| **Hidden-tab freeze in tests** | Background tabs don't run `requestAnimationFrame`, so automated tests saw nothing move | Shim `requestAnimationFrame` with `setTimeout` in test harnesses, or take a screenshot to let it run |
| **Local server that won't die (Windows)** | `HttpListener` ports report as owned by PID 4, so killing "the port owner" left old servers running and serving old pages | Stop dev servers by matching their command line. Vite's dev server avoids this |
| **Pushing from the wrong shell** | Git for Windows' SSH agent only worked from PowerShell | Push from PowerShell, or use HTTPS remotes |
| **Gameplay tells** | In a hide-and-seek game, the real player differed from look-alikes in size, speed and animation | List the rules that must hold and check new features against them |

---

## 7. Testing

- **Check in a real browser, not just the type checker.** Run the dev server and play.
- **Debug hooks** (`window.__dbg`, MoF's `window.__play`) let scripts drive the game: run
  hundreds of simulated levels to check balance in seconds. Remove them from release builds.
- **Bots for click games:** pick a target, find an opaque pixel with its hit mask, click it.
- **Phones:** emulate a landscape phone viewport, and force touch layouts with a URL flag
  (`?touch=1`).
- **Real devices before calling a change done**, especially touch, audio and anything
  networked. Emulation misses lag and how real players behave.
- In the Claude desktop preview browser, service workers and clipboard writes don't work.
  Check offline/install in real Chrome on the live site.

---

## 8. Suggested repo layout

```
/
├── index.html              Hub: the monitor wall (plain HTML, no build)
├── assets/                 Hub art, shared favicon set, decorative screen media
├── games/
│   └── <slug>/             One folder per port
│       ├── src/            TypeScript game
│       ├── public/         Converted, web-ready assets (committed)
│       ├── data/           Generated JSON (don't hand-edit)
│       ├── legacy/         Original source + data (read-only; raw media gitignored)
│       ├── tools/          Converters for this game's media and data
│       └── PLAN.md         Port plan, original's bugs, status log
├── shared/                 Engine pieces reused across ports (loop, input, scaling, audio)
├── tools/                  Site-wide scripts (build all games, image processing)
├── .github/workflows/      Build every game + hub, publish to Pages
└── CLAUDE.md               Working guide (start from this brief)
```

---

## 9. Per-game checklist

Copy into each game's `PLAN.md`.

- [ ] Original source and data copied into `legacy/`; raw media location noted in the README
- [ ] Original documented: resolution, frame rate, controls, data formats, known bugs
- [ ] Converters written: art (with colour key), sound, data → JSON
- [ ] Core loop on a fixed timestep, letterboxed at the original resolution
- [ ] Gameplay ported module by module, checked side by side against the original
- [ ] Every deliberate change commented ("The original…") and logged
- [ ] Mouse, keyboard and touch input; pauses on tab switch; audio unlocks on first input
- [ ] Saves in `localStorage` with versioned keys
- [ ] Breadcrumb back to the hub; shared favicon; the game's own palette
- [ ] Builds with `base: './'` and runs from its subfolder
- [ ] Hub screen added: title, one-line hook, plate number; slogan subline updated
- [ ] Played on a real phone and a real desktop before release

---

## 10. First steps

1. Pick the site name and theme, and write the slogan.
2. Create the repo with the layout above and a GitHub Actions workflow that publishes to Pages.
3. Build the hub wall with MoF as the first live screen and decorative screens for the rest.
4. Decide whether MoF moves into `games/mof/` or stays separate and gets linked.
5. Extract the reusable engine pieces from MoF into `shared/`.
6. List the other early-2000s games to port, with what each one needs (language, media,
   data formats), and pick the next one.
