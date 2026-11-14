# Efail: the deterministic game engine built for AI agents

> Efail is a deterministic 2D and low-poly 3D game engine built for AI agents, written in Bend. A game is one file of pure functions. The engine handles the window, the clock, input, replays, screenshots and headless runs, so an agent only writes the game and checks it as text and PNGs.

*Efail* is Welsh for "smithy" and is said EV-ile. It is at v0, runs on Linux (X11 or XWayland) and is MIT licensed.

- Full 2D guide (the page an agent needs to write a game): __SITE_URL__/docs/2d.md
- Full 3D guide: __SITE_URL__/docs/3d.md
- Everything in one file: __SITE_URL__/llms-full.txt
- Source: https://github.com/typenx/efail

## Why an engine for agents

Agents making games spend most of their effort on the layer around the game: choosing a stack, wiring a renderer and input, building ways to see and test what they made, and fighting an editor GUI. Efail makes those choices up front.

- **One file of pure functions.** A game is `game.bend`: `init`, `step`, `draw` (or `scene` in 3D) and `show`. No game loop, renderer or input code.
- **Headless and deterministic.** `efail sim` runs any number of ticks with scripted keys in milliseconds and prints the state. The same seed and keys always give the same states and pixels.
- **Agents can see the game.** `efail shot` saves any frame as a PNG; `efail film` saves a labelled grid of frames in one PNG.
- **Human bugs replay exactly.** `efail run` records what the player did; `efail replay` reruns it headless.
- **Proven rules.** Through Bend's laws, a game states facts like "game over waits for Space" and `efail check` proves them.
- **One page of docs per mode.** AGENTS.md covers 2D, AGENTS3D.md covers 3D.

## The contract

```python
import Base
import ./efail/efail.bend as E

type State is Data:               # your state
  ...

def init(seed: U32) -> State:                  # the first state
def step(+input: E.Input, s: State) -> State:  # one tick; 60 a second
def draw(s: State) -> List<E.Shape>:           # what to show, back to front
def show(s: State) -> String:                  # one line for efail sim
```

All functions are pure: no IO, no time, no randomness except what is derived from the seed.

## Commands

| Command | What it does | Output |
| --- | --- | --- |
| `efail check` | Type-checks the game, checks the contract, proves its laws | Errors as text |
| `efail sim --ticks 300 --every 60` | Runs headless with scripted input | One `show(state)` line per sampled tick, plus each sound |
| `efail shot --ticks 120` | Runs, then saves one frame | `build/shot.png` |
| `efail film --ticks 120 --every 10` | Frames every N ticks in one image | `build/film.png`, each frame labelled with its tick |
| `efail run` | A human plays in a window (Esc quits) | `build/last.replay` |
| `efail replay --every 30` | Reruns what the human just did, headless | State lines |
| `efail web` | Builds the game as one self-contained web page | `build/game.html` |

3D games use `efail3d` with the same subcommands (`new`, `check`, `sim`, `shot`, `run`, `replay`, `bench`).

Example `efail sim` output from the Dodge example with no keys pressed:

```
tick 0: play x=150 blocks=0 score=0
tick 60: play x=150 blocks=2 score=60
tick 120: play x=150 blocks=4 score=120
tick 141: sound slide 440>60 400ms square
tick 141: sound beep 90 250ms noise
tick 180: over score=142 best=142
```

Input scripts and recorded replays share one plain-text format:

```
seed 42          # optional
0                # nothing held at tick 0
30 right         # right held from tick 30
90 right space   # space also goes down at tick 90
120              # all keys up
150 @100,60      # move the mouse pointer
160 mouse_left   # click
end 300
```

## Laws

```python
# LAW: the game-over screen waits for Space.
law over_waits:
  for +input: E.Input
  for score: U32
  for seed: U32
  for best: U32
  {E.pressed(input, E.space()) == False{} : Bool} ->
    {Game.step(input, Game.Over{score, seed, best})
      == Game.Over{score, seed, best} : Game.State}
```

`efail check` proves each law for every possible input.

## 2D and 3D

- **2D:** rectangles, circles, a built-in 3x5 pixel font, sprites written as text, keyboard and mouse input, seeded random, collision helpers, retro sound described as data, and export to a single web page.
- **3D (low-poly):** colored triangle rendering, depth, clipping, transformed primitive meshes, flat lighting, cameras, deterministic gravity, box and sphere collision, raycasts, screenshots and exact replay. Textures, imported models, skeletal animation, shadows and rigid-body joints are outside the first 3D release.

## Quick start

```sh
curl -fsSL https://bend-lang.com/install.sh | sh   # Bend 2 (needs clang)
git clone https://github.com/typenx/efail && cd efail
export PATH="$PWD/bin:$PATH"

efail new mygame && cd mygame
efail check
efail sim --ticks 300 --every 60           # headless, state as text
efail shot --ticks 120                     # build/shot.png
efail run                                  # play (Esc quits)
```

Then read `AGENTS.md` in the game folder (the same text as __SITE_URL__/docs/2d.md) and edit `game.bend`.

For 3D:

```sh
efail3d new my3dgame && cd my3dgame
efail3d check
efail3d sim --ticks 300 --every 60
efail3d shot --ticks 120
```

## FAQ

**What is Efail?** A deterministic 2D and low-poly 3D game engine built for AI agents, written in Bend. A game is one file, `game.bend`, made of pure functions.

**Why is it a good engine for AI coding agents?** Everything an agent needs to check is text or a PNG, every run is deterministic, there is no editor GUI, and the whole 2D API fits in one page of docs.

**How does an agent test a game without a screen?** It writes a plain-text input file, then runs `efail sim` (state as text), `efail shot` (one PNG) or `efail film` (a labelled grid of frames).

**What language are games written in?** Bend, a Python-shaped, strictly typed functional language. The engine is written in Bend too.

**Does it support 3D?** Yes, low-poly 3D through `efail3d`.

**Can games run in a browser?** Yes, for 2D: `efail web` writes one self-contained `build/game.html`. A playable example is at __SITE_URL__/play/dodge.html.

**What platforms?** Linux (X11 or XWayland) at v0. Headless commands need no display.

**Is it free?** Yes, MIT licensed.
