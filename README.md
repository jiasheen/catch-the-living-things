# Catch the Living Things 🧺

A small, data-driven **arcade sorting game** for K–12 classrooms. Items fall from
the top of the screen; the player slides a basket to **catch the ones in the
target category and skip the rest**. Three rounds, getting faster, then a score
and accuracy summary.

It ships with three ready-made topics — **Animals**, **Healthy Foods**, and
**Round Shapes** — but the whole point is that _all_ content lives in one data
file, so a teacher (or you) can add a new subject in a couple of minutes without
touching the game code.

**▶ Play it live:** https://jiasheen.github.io/catch-the-living-things/

> Built with AI-pair-programming assistance from Anthropic's Claude, then
> reviewed and tuned by hand.

---

## Table of contents

- [Tech stack (and why)](#tech-stack-and-why)
- [Run it locally](#run-it-locally)
- [Data-driven content: adding a topic](#data-driven-content-adding-a-topic)
- [Accessibility](#accessibility)
- [How it's put together](#how-its-put-together)
- [Deploying (GitHub Pages)](#deploying-github-pages)
- [Requirements checklist](#requirements-checklist)

---

## Tech stack (and why)

| Tool | Role | Why it's here |
| --- | --- | --- |
| **[Phaser 3](https://phaser.io/)** (3.90) | Game / canvas engine | A mature, batteries-included 2D game framework. It gives us the game loop, an arcade physics system (moving items + overlap detection), input handling, and a scene system — all the things that are tedious to hand-roll on a raw `<canvas>`. |
| **[Vite](https://vite.dev/)** | Build tool + dev server | Instant hot-reloading during development and an optimised, minified production bundle. Zero-config TypeScript, and one setting (`base`) makes it deploy cleanly to a GitHub Pages sub-path. |
| **[GSAP](https://gsap.com/)** | Animation library | Drives the UI motion: score pop-ups, panel entrances, and the win celebration. GSAP can tween _any_ JavaScript object, so the same library animates both HTML overlay elements and Phaser game objects. (GSAP is now fully free, including all its plugins.) |
| **[TypeScript](https://www.typescriptlang.org/)** | Language | Types across the content model, scoring, and scenes catch mistakes at build time. The CI build runs a strict type-check and fails the deploy if anything is off. |
| **GitHub Actions** | CI/CD | On every push to `main`, the project is type-checked, built, and auto-deployed to GitHub Pages. No manual build-and-upload step. |

### Why a hybrid canvas + HTML design?

The fast, visual gameplay (falling items, the basket, catch effects) is drawn by
**Phaser on a `<canvas>`**. Everything the player _reads or clicks_ — the menu,
the HUD, the results screen, the pause dialog — is a **real HTML/CSS overlay**.

That split is deliberate: HTML buttons and text are focusable, screen-reader
friendly, and trivially responsive, which makes the game far more accessible than
menus painted into a canvas would be. GSAP animates that overlay.

---

## Run it locally

Requires **Node.js 20.19+ or 22+** (Vite 8's baseline).

```bash
npm install      # install dependencies
npm run dev      # start the dev server (hot reload) → http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check (tsc --noEmit) + production build → dist/
npm run preview  # serve the production build locally to sanity-check it
npm run typecheck
```

---

## Data-driven content: adding a topic

**Every piece of content is in one file: [`src/data/topics.ts`](src/data/topics.ts).**
The engine in `src/game/*` knows nothing about animals or shapes — it just reads
this data. Adding a subject requires editing _only_ that file; the menu button,
the gameplay, the HUD labels, and the feedback are all generated from it.

A topic looks like this:

```ts
{
  id: 'planets',                 // unique id (lowercase, no spaces)
  title: 'Planets',              // shown on the menu button
  icon: '🪐',
  prompt: 'Catch the planets — dodge the space junk!',
  targetLabel: 'Planets',        // the category to CATCH  (shown in the HUD)
  avoidLabel: 'Not planets',     // the category to AVOID
  items: [
    { emoji: '🌍', label: 'Earth',     correct: true  },
    { emoji: '🪐', label: 'Saturn',    correct: true  },
    { emoji: '☄️', label: 'comet',     correct: false },
    { emoji: '🚀', label: 'rocket',    correct: false },
  ],
  feedback: {
    correct: 'Yes — that is a planet!',
    wrong:   'Not a planet. Let that one drift past!',
  },
},
```

Add that object to the `TOPICS` array and it appears on the menu automatically.
A ready-to-uncomment copy of this example lives at the bottom of `topics.ts`.

Difficulty is data too: the shared `ROUNDS` array (also in `topics.ts`) defines
how long each round lasts, how often items spawn, and how fast they fall. Add a
round to make the game longer, or tune the numbers to change the challenge.

**Tips:** aim for 6–8 correct items and 5–7 distractors so rounds feel fair, and
give every item a plain-language `label` — it's used for accessibility so nothing
ever depends on colour alone.

---

## Accessibility

Built for a wide range of classroom devices and learners:

- **Keyboard _and_ touch controls.** Arrow keys or `A`/`D` to move; drag with a
  finger or mouse. Keyboard shortcuts: `P` / `Esc` to pause, `M` to mute.
- **Never colour-alone.** Correct/wrong feedback always pairs colour with a `✓`
  or `✗` and words; every item has a written label; HUD goals read
  "Catch: …" / "Avoid: …".
- **Respects `prefers-reduced-motion`.** GSAP animations and the drifting clouds
  scale back or switch off; feedback still appears, just without the movement.
- **Focusable, labelled controls** with clear high-contrast focus rings, and
  focus is moved to the sensible first control when a screen opens.
- **Pause and mute** are always available (buttons + shortcuts); the mute choice
  is remembered between sessions.
- **No rapid flashing**, high-contrast text throughout, and a responsive layout
  that scales from phones to Chromebooks to desktops.

---

## How it's put together

```
catch-the-living-things/
├─ .github/workflows/deploy.yml   # CI: build + deploy to GitHub Pages
├─ index.html                     # #game (canvas) + #ui (overlay) containers
├─ vite.config.ts                 # base path for Pages + build settings
├─ src/
│  ├─ main.ts                     # wires overlay + Phaser together, entry point
│  ├─ style.css                   # all overlay styling + design tokens
│  ├─ data/
│  │  └─ topics.ts                # ⭐ ALL game content lives here
│  ├─ core/                       # framework-agnostic logic
│  │  ├─ types.ts                 # shared TypeScript types
│  │  ├─ scoring.ts               # pure scoring rules (no Phaser/DOM)
│  │  ├─ settings.ts              # mute (persisted) + pause + reduced-motion
│  │  ├─ audio.ts                 # tiny Web Audio sound effects (no files)
│  │  └─ context.ts               # services shared with the scenes
│  ├─ ui/                         # the HTML overlay + animation
│  │  ├─ overlay.ts               # HUD, menu, results, pause (accessible DOM)
│  │  ├─ animations.ts            # GSAP helpers (reduced-motion aware)
│  │  └─ theme.ts                 # canvas-side design tokens
│  └─ game/                       # the Phaser side
│     ├─ gameConfig.ts            # Phaser.Game configuration
│     ├─ constants.ts             # design resolution
│     └─ scenes/
│        ├─ BackgroundScene.ts    # ambient drifting clouds
│        └─ GameScene.ts          # the actual gameplay
```

The gameplay never touches the DOM and the overlay never touches Phaser — they
communicate through a small shared `GameContext`. That keeps each side easy to
reason about (and the scoring rules are a pure module you could unit-test on
their own).

There are **no image or audio asset files** — items are emoji drawn as text, and
sound effects are generated with the Web Audio API. That keeps the download tiny
and fast on low-powered school laptops.

---

## Deploying (GitHub Pages)

The workflow in `.github/workflows/deploy.yml` builds and publishes on every push
to `main`. To turn it on for your repo:

1. Push this project to a repo named **`catch-the-living-things`** (the name must
   match `base` in `vite.config.ts`). If you use a different repo name, update
   that one line to `'/<your-repo-name>/'`.
2. In the repo: **Settings → Pages → Build and deployment → Source →
   "GitHub Actions"**.
3. Push to `main` (or run the workflow manually from the **Actions** tab). When it
   finishes, the site is live at `https://<user>.github.io/<repo>/`.

The build step runs `npm run build`, which type-checks first — so a type error
fails the deploy instead of shipping a broken build.

---

## Requirements checklist

This sample was built to demonstrate a specific set of front-end skills:

- **A game / canvas library** → Phaser 3 (`src/game/`)
- **An animation library** → GSAP (`src/ui/animations.ts`)
- **A modern build tool** → Vite (`vite.config.ts`)
- **CI/CD** → GitHub Actions auto-deploy to Pages (`.github/workflows/deploy.yml`)
- **Written in TypeScript**, strict mode
- **Data-driven** and easy to extend (`src/data/topics.ts`)
- **Accessible and responsive** for classroom devices

---

_Made for a K–12 ed-tech front-end portfolio._
