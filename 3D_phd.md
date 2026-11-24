# Scroll-Driven 3D Simulation — Build Spec

> **For the AI builder.** This document is the complete spec for one pinned, full-viewport Three.js section. It tells the story of an adaptive smart-home defense system. The story starts with a single belief algorithm and grows into a federated, cross-protocol, multi-agent network.
> Every algorithm name, label, number and color is a **variable** in config. The owner will swap models and palettes later, so nothing domain-specific may be hardcoded in scene code.

---

## 0. Rules for the builder (read first)

1. **Read the whole document before writing code.**
2. **Keep all content in config.** Domain content, names, numbers and colors live only in `src/config/*`. Scene code reads from config. Captions use template tokens like `{belief.name}`.
3. **Scroll animation is a pure function of scroll progress.** Scrubbing backwards must restore the exact previous state, so there are no fire-and-forget tweens in scroll logic. Only these run on time:
   - ambient loops (heartbeats, particles),
   - the **zero-day button simulation** (§11),
   - the **MAPPO/IPPO toggle** (§8, Step 12).
4. **Build in milestone order** (§17). Check each milestone against the acceptance criteria (§18) before moving on.
5. **Procedural geometry first.** Use external models only where §13 allows. If a custom Blender model would clearly be better, ask the owner using the Model Brief template (§13.4).
6. **When something is ambiguous**, take the stated default, keep going, and log the choice in `DECISIONS.md`.
7. **Ask the open questions in §19 before final polish.** All of them have defaults, so never block early work on them.
8. **Visual target:** professional, calm, precise, on a plain dark background. Creativity comes from light, motion, rhythm and composition, not decoration.

---

## 1. Concept and narrative

The whole experience happens inside **one pinned 100vh section** with **one canvas**. Scrolling scrubs through 14 steps in 3 phases.

| Phase | Mood | Story |
|---|---|---|
| **0 · Intro** | Neutral | A single point of light breathing in the dark. |
| **1 · Cognition** (the agent's mind) | Cool, focused | A **belief algorithm** fed by **3 viewers** estimates hidden malware-spread states. It sits inside a **POMDP**. A **PPO agent** wraps the POMDP and runs an endless MDP **heartbeat**: observe → update belief → graded action → learn. The agent **builds itself**, then gains **2–3 world models (MBRL)** that run a second, **imagined heartbeat**. |
| **2 · Collective** (the network) | Warm, communal | Zoom out: the agent lives in a hub inside **Home 1**, then **Home 1…N**. Homes connect to a **federated-learning server** that shares model updates only, never raw data. New models are validated on a **shadow server** before rollout. A **"Check 0-day attack"** button triggers a timed simulation on Home 2 that ends with the whole network immune. |
| **3 · Spectrum** (cross-protocol) | Crisp, technical | Zoom back into Home 1's **Zigbee hub**. The home speaks many protocols, and attacks pivot between them. The single PPO agent becomes a **multi-agent system (MAPPO or IPPO, toggleable)**. |

---

## 2. Concept → visual metaphor (use consistently)

| Concept | Visual | Notes |
|---|---|---|
| Belief `b(s)` | Glowing core sphere ringed by radial probability bars, one per hidden state | Bars always sum to 1. Core brightness = confidence = `1 − normalized entropy`. |
| Viewers (×3) | Three distinct "lenses" around the core, each streaming particles into it | Distinct glyphs: ring-lens, eye-dome, prism. Each has its own label chip. |
| Observation `o` | Small particle packets passing through the POMDP wall into the core | |
| POMDP | Glass box with bright edges, tuple labels on faces, faint interior fog | Fog = hidden state the agent can't see. |
| RL agent | Segmented chassis enclosing the POMDP box and the PPO module | |
| MDP loop / heartbeat | **∞ (lemniscate) light track** | Agent lobe + environment lobe; the crossing point = time step `t`. The pulse travels with an ECG "lub-dub" rhythm. |
| PPO | Actor and Critic twin blocks, a rollout-buffer bar, and a **clip-band gauge** | The ratio marker clamps at `1 ± ε`. |
| Graded actions | 5-segment arc gauge on a severity color ramp | Segment brightness = `π(a|b)`. The sampled action flashes. |
| World models (×2–3) | "Dream chambers" docked to the agent, with branching ghost trajectories inside | |
| Imagined heartbeat | Second ∞ track: dashed, ghost color, its own BPM | |
| Home | Low-poly cutaway house with the hub inside | |
| Federated server | Central slab tower with LED strips | |
| Model update `Δw` | Small cube packets on arcs, with a lock badge | Raw data never travels. |
| Shadow server | Ghost wireframe twin of the server | Champion vs challenger scoreboard. |
| Zero-day attack | Red, jagged particle swarm with an unknown `?` glyph | Shape and icon, never color alone. |
| Protocols | Stacked translucent strata, each with its own colored link mesh | |
| Multi-agent | The core splits into one agent per stratum; MAPPO adds a shared critic node | |

---

## 3. Tech stack

- **Vite + TypeScript**, vanilla, no framework. The module structure maps 1:1 to React Three Fiber if React is wanted later.
- **three** (latest stable) with `WebGLRenderer`. Do not start with WebGPU, for compatibility with the postprocessing library.
- **GSAP + ScrollTrigger** for pinning and scrub.
- **Lenis** for smooth scroll, synced to ScrollTrigger.
- **`postprocessing`** (pmndrs) for Bloom + SMAA + Vignette, merged into a single `EffectPass`.
- **KaTeX** to render the few equations in the DOM overlay.
- **`@fontsource`** to self-host fonts.
- Dev only, behind `?debug`: `lil-gui` and a stats panel.
- Tooling: `@gltf-transform/cli` for model optimization.

**One requestAnimationFrame for everything:** `gsap.ticker` drives both Lenis and rendering.

```ts
const lenis = new Lenis({ lerp: 0.1 });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => { lenis.raf(t * 1000); loop.frame(t); });
gsap.ticker.lagSmoothing(0);
```

---

## 4. Architecture

```
src/
  main.ts
  config/
    system.config.ts     # domain content: algorithms, states, viewers, world models, actions, metrics
    theme.config.ts      # palettes, phase moods, typography tokens
    timeline.config.ts   # steps, scroll weights, camera keyframes, captions
    perf.config.ts       # quality tiers and budgets
  core/
    Renderer.ts          # renderer, composer, resize, DPR clamp
    Loop.ts              # frame loop, pause when off-screen or tab hidden
    ScrollDirector.ts    # global progress → per-step progress; drives modules, camera, UI
    CameraRig.ts         # spherical keyframes, log-distance interpolation, dynamic near/far, view offset
    ThemeDirector.ts     # lerps phase palettes into shared uniforms + CSS variables
    HeartbeatClock.ts    # real and imagined beat phases, BPM easing
    QualityManager.ts    # adaptive quality tiers with hysteresis
    AssetLoader.ts       # GLTF + Meshopt (+ optional KTX2), lazy per phase
  sim/
    MockEngine.ts        # discrete belief filter + stochastic policy + PPO buffer (drives visuals)
    types.ts             # SimFrame contract
  scene/
    shared/  Particles.ts FresnelMaterial.ts PulseMaterial.ts Grid.ts Labels.ts
    phase1/  BeliefCore.ts Viewers.ts POMDPBox.ts AgentShell.ts HeartbeatTrack.ts
             PPOModule.ts ActionGauge.ts Assembly.ts WorldModels.ts
    phase2/  Home.ts Neighborhood.ts FederatedServer.ts Links.ts ShadowServer.ts ZeroDaySim.ts
    phase3/  HubInterior.ts ProtocolStrata.ts AttackPath.ts MultiAgent.ts
  shaders/   pulse.glsl fresnel.glsl particles.glsl
  ui/        Captions.ts PhaseRail.ts VitalsHUD.ts InfoPanel.ts Scoreboard.ts
             ZeroDayButton.ts AlgoToggle.ts Footnote.ts
  styles/    base.css tokens.css
public/      models/ textures/ posters/ traces/
DECISIONS.md  CREDITS.md
```

### 4.1 Module contract

Every scene module implements this interface:

```ts
export type StepId =
  | "intro" | "belief" | "pomdp" | "agent" | "assemble" | "mbrl"
  | "home" | "neighborhood" | "federation" | "shadow"
  | "hub" | "protocols" | "multiagent" | "outro";

export type ProgressMap = Record<StepId, number>; // each 0..1 (0 = before step, 1 = after step)

export interface SceneModule {
  readonly id: string;
  readonly group: THREE.Group;
  readonly steps: StepId[];                    // steps this module reacts to (used for visibility culling)
  setProgress(p: ProgressMap): void;           // pure + idempotent
  tick(dt: number, t: number, f: SimFrame): void; // ambient time-based animation only
  setTheme(u: ThemeUniforms): void;
  dispose(): void;
}
```

Rules for modules:

- `setProgress` derives every value from progress alone. Local GSAP timelines are fine if created `paused` and driven with `.progress(p)`.
- Modules whose steps are more than one step away from the current step get `visible = false`, and their `tick` is skipped.
- No per-frame allocations: reuse `Vector3`, `Color` and `Matrix4` instances.

### 4.2 Helper functions

```ts
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const seg = (p: number, a: number, b: number) => {           // sub-range → smoothstep 0..1
  const x = clamp01((p - a) / (b - a));
  return x * x * (3 - 2 * x);
};
const bump = (p: number, c: number, w: number) =>            // reversible "flash" at scroll position c
  Math.max(0, 1 - Math.abs(p - c) / w);
```

---

## 5. Content config — single source of truth

All values below are **defaults or placeholders**. The owner will replace names and models. Visuals must adapt automatically when the config changes: number of states, 2 or 3 world models, number of actions, number of homes, number of protocols.

```ts
// src/config/system.config.ts
export const SYSTEM = {
  project: {
    name: "PROJECT NAME",
    tagline: "Adaptive, collective defense for the smart home",
    cta: [
      { label: "Read the paper", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },

  belief: {
    name: "Belief Engine",                 // owner's algorithm name goes here
    shortLabel: "b(s)",
    description: "Maintains a probability distribution over hidden infection states of the home network.",
    inputs: "Observations from 3 viewers",
    outputs: "Belief vector b(s)",
    states: [
      { id: "clean",     label: "Clean" },
      { id: "probed",    label: "Probed" },
      { id: "infected",  label: "Infected" },
      { id: "spreading", label: "Spreading" },
    ],
    viewers: [
      { id: "v1", name: "Viewer A · Network Flow",       glyph: "ring",  weight: 0.40,
        description: "Packet and flow statistics across the home network." },
      { id: "v2", name: "Viewer B · Device Behavior",    glyph: "eye",   weight: 0.35,
        description: "Per-device behavioral baseline and drift." },
      { id: "v3", name: "Viewer C · Protocol Integrity", glyph: "prism", weight: 0.25,
        description: "Protocol-level anomalies (malformed frames, unexpected commands)." },
    ],
  },

  pomdp: {
    label: "POMDP",
    tuple: ["S", "A", "T", "R", "Ω", "O", "γ"],
    gamma: 0.99,
    description: "Decisions are made on beliefs, because the true state is hidden.",
  },

  agent: {
    algorithm: "PPO",                      // swappable label (e.g. "Recurrent PPO")
    heartbeatBpm: 60,
    attackBpm: 120,
    beatsPerLap: 1,                        // one MDP step per beat
    ppo: { clipEpsilon: 0.2, rolloutLength: 8, gaeLambda: 0.95 },
    actions: [                             // graded actions, ordered by severity
      { id: 0, label: "Observe" },
      { id: 1, label: "Alert" },
      { id: 2, label: "Rate-limit" },
      { id: 3, label: "Quarantine device" },
      { id: 4, label: "Isolate segment" },
    ],
    assemblyParts: [                       // Step 4 "the agent builds itself" (order = snap order)
      { id: "buffer",    label: "Rollout Buffer" },
      { id: "gae",       label: "Advantage (GAE)" },
      { id: "actor",     label: "Actor π_θ" },
      { id: "critic",    label: "Critic V_φ" },
      { id: "optimizer", label: "Optimizer" },
      { id: "reward",    label: "Reward Signal" },
    ],
    loopStations: ["Observe", "Belief update", "Policy π(a|b)", "Graded action", "Environment", "Reward"],
  },

  mbrl: {
    enabled: true,
    imaginedBpm: 90,
    horizon: 5,                            // imagined rollout length
    branches: 3,                           // imagined futures per real step
    worldModels: [                         // 2 or 3 entries; visuals adapt
      { id: "wm1", name: "World Model A · Dynamics", type: "e.g. Ensemble MLP / RSSM",
        description: "Predicts the next hidden state from belief + action." },
      { id: "wm2", name: "World Model B · Spread",   type: "e.g. Graph propagation model",
        description: "Predicts how an infection propagates between devices." },
      { id: "wm3", name: "World Model C · Risk",     type: "e.g. Reward/cost model",
        description: "Predicts damage and action cost of imagined futures." },
    ],
  },

  federation: {
    homes: 6,
    homesMobile: 4,
    aggregation: "FedAvg",
    roundEveryBeats: 4,
    privacyBadges: ["Model updates only", "Secure aggregation", "Differential privacy"],
  },

  shadow: {
    canaryHome: 3,
    outcome: "pass" as "pass" | "fail",
    metrics: [                             // illustrative values — UI must show "Simulated values"
      { id: "tpr", label: "Detection rate",      champion: 0.91, challenger: 0.96, higherIsBetter: true,  format: "pct" },
      { id: "fpr", label: "False-positive rate", champion: 0.04, challenger: 0.03, higherIsBetter: false, format: "pct" },
      { id: "ttc", label: "Time to contain (s)", champion: 42,   challenger: 18,   higherIsBetter: false, format: "num" },
    ],
  },

  zeroDay: {
    targetHome: 2,
    verifyHome: 4,
    entryDevice: "smart plug",
    attackLabel: "Unknown variant · no signature",
    durationScale: 1.0,
  },

  crossProtocol: {
    hubProtocol: "Zigbee",
    protocols: [
      { id: "zigbee", label: "Zigbee",        devices: ["Bulb", "Motion sensor", "Door sensor", "Plug"] },
      { id: "wifi",   label: "Wi-Fi",         devices: ["Router", "Camera", "TV"] },
      { id: "ble",    label: "BLE",           devices: ["Phone", "Smart lock", "Wearable"] },
      { id: "thread", label: "Thread/Matter", devices: ["Border router", "Thermostat"] },
      { id: "zwave",  label: "Z-Wave",        devices: ["Siren", "Water sensor"] },
    ],
    attackPath: [                          // illustrative pivot path across protocols
      { protocol: "ble",    device: "Smart lock" },
      { protocol: "ble",    device: "Phone" },
      { protocol: "wifi",   device: "Router" },
      { protocol: "zigbee", device: "Plug" },
    ],
    multiAgentAlgorithm: "MAPPO" as "MAPPO" | "IPPO",
    showToggle: true,
  },
} as const;
```

**Template tokens** in captions resolve against `SYSTEM`. Examples: `{belief.name}`, `{agent.algorithm}`, `{agent.ppo.clipEpsilon}`, `{mbrl.worldModels.length}`, `{crossProtocol.hubProtocol}`.

**InfoPanel:** every labeled 3D component is clickable or tappable. It opens a side drawer showing that config entry's `name`, `description`, `inputs`, `outputs` and `type`.

---

## 6. Theme and color system

### 6.1 Principles

- **Plain, professional base.** A near-constant dark background across all phases. The phase mood comes from the accent colors, a ±3% fog tint, bloom strength and motion pacing. The background itself never changes dramatically.
- **Semantic colors are global and never change per phase:** threat, warning, safe, imagined, model update.
- **The real heartbeat uses the current phase's primary color.** The imagined heartbeat always uses `semantic.imagined` and is dashed.
- **Restrained creative layer:**
  - a hairline dot or line grid,
  - a ~3% film-grain overlay (CSS),
  - a soft vignette,
  - generous negative space.
- **Color is never the only carrier of meaning.** Threat = red + jagged shape + `!`. Imagined = ghost color + dashes.
- **If the owner supplies a palette,** map it onto these token names and keep the semantic colors distinguishable.

### 6.2 Tokens

```ts
// src/config/theme.config.ts
export const PALETTES = {
  obsidianLab: {                                   // DEFAULT
    base: {
      bg: "#07090D", bgElevated: "#0E1218", grid: "#18202B",
      text: "#E7ECF3", textMuted: "#8B96A8", hairline: "rgba(231,236,243,0.08)",
    },
    semantic: {
      threat: "#FF3B4E", warning: "#FF9F1C", safe: "#3DDC97",
      imagined: "#C9CCFF", modelUpdate: "#FFFFFF",
    },
    severityRamp: ["#3DDC97", "#A8E05F", "#FFD23F", "#FF9F1C", "#FF3B4E"], // graded actions 0..4
    phases: {
      intro: { name: "Intro",      primary: "#C9D3E0", secondary: "#5C6B80", accent: "#FFFFFF", fog: "#07090D", bloom: 0.6, pace: 0.6 },
      p1:    { name: "Cognition",  primary: "#5CE1E6", secondary: "#7B8CFF", accent: "#D4F6FF", fog: "#07101A", bloom: 0.9, pace: 0.8 },
      p2:    { name: "Collective", primary: "#2EC4B6", secondary: "#F4B860", accent: "#FFE6BF", fog: "#0B0F0E", bloom: 0.7, pace: 1.0 },
      p3:    { name: "Spectrum",   primary: "#B6F23C", secondary: "#E8EDF5", accent: "#F7FFE0", fog: "#0A0A0D", bloom: 0.8, pace: 1.2 },
    },
    protocols: { zigbee: "#FFE066", wifi: "#4CC9F0", ble: "#7B61FF", thread: "#FF8FC7", zwave: "#F4A261" },
  },

  graphiteSignal: {                                // monochrome scene, one accent per phase
    base: { bg: "#0B0B0C", bgElevated: "#141416", grid: "#1E1E21", text: "#EDEDED", textMuted: "#8C8C8C", hairline: "rgba(237,237,237,0.07)" },
    phases: {
      p1: { primary: "#E6E6E6", secondary: "#4DA3FF", accent: "#4DA3FF" },
      p2: { primary: "#E6E6E6", secondary: "#FFB000", accent: "#FFB000" },
      p3: { primary: "#E6E6E6", secondary: "#C6F432", accent: "#C6F432" },
    },
    // semantic, severityRamp and protocols inherit from obsidianLab
  },

  paperLab: {                                      // light theme, bloom disabled
    base: { bg: "#F4F3EF", bgElevated: "#FFFFFF", grid: "#E2E0DA", text: "#15171C", textMuted: "#5E6573", hairline: "rgba(21,23,28,0.08)" },
    semantic: { threat: "#D7263D", warning: "#D9770B", safe: "#1F9D63", imagined: "#6C72D9", modelUpdate: "#15171C" },
    phases: {
      p1: { primary: "#0F7C8C", secondary: "#3D4BD9", bloom: 0 },
      p2: { primary: "#0E8A7E", secondary: "#C77D12", bloom: 0 },
      p3: { primary: "#5E8C00", secondary: "#2B2F38", bloom: 0 },
    },
    // On paperLab, "glow" = solid saturated color + soft halo sprite + thin outlines.
  },
};
export const ACTIVE_PALETTE: keyof typeof PALETTES = "obsidianLab";

export const TYPE = {
  display: "'Inter', system-ui, sans-serif",       // titles: 600 weight, tight tracking (-0.02em)
  body:    "'Inter', system-ui, sans-serif",       // 400 weight, 15–17px
  mono:    "'JetBrains Mono', ui-monospace, monospace", // labels/HUD: 500, uppercase, 11–12px, +0.08em
};
```

### 6.3 ThemeDirector

- Holds one shared `ThemeUniforms` object (`uPrimary`, `uSecondary`, `uAccent`, `uFog`, `uThreat`, `uImagined`, …) that every custom material references, so updating it once updates everything.
- Writes the same values to CSS variables (`--phase-primary`, etc.) so the DOM UI recolors in sync.
- **Phase transitions:** lerp colors in linear space over the last 15% of a phase's final step and the first 15% of the next phase's first step. Bloom strength and `pace` lerp over the same window.

---

## 7. Scroll system

### 7.1 Pinned section

```html
<header class="site-header">…</header>
<section id="sim" aria-label="Interactive walkthrough of the defense system">
  <canvas id="gl" aria-hidden="true"></canvas>
  <div id="ui"><!-- captions, phase rail, HUD, buttons, info panel, footnote --></div>
</section>
<footer class="site-footer">…</footer>
```

```css
#sim { position: relative; height: 100vh; height: 100svh; overflow: hidden; background: var(--bg); }
#gl  { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
#ui  { position: absolute; inset: 0; pointer-events: none; }
#ui .interactive { pointer-events: auto; }
```

```ts
ScrollTrigger.create({
  trigger: "#sim",
  pin: true,
  start: "top top",
  end: () => "+=" + (TIMELINE.totalWeight / 100) * window.innerHeight,
  scrub: true,                 // Lenis already smooths
  invalidateOnRefresh: true,
  onUpdate: (self) => director.setGlobalProgress(self.progress),
});
```

### 7.2 Steps and scroll weights

Weights are in vh of scroll and are configurable in `timeline.config.ts`. The default total is about 2,400vh.

| # | id | Phase | Weight | What happens |
|---|---|---|---|---|
| 0 | `intro` | 0 | 100 | Title; a dormant point of light breathing. |
| 1 | `belief` | 1 | 200 | Belief core forms; 3 viewers appear and feed it. |
| 2 | `pomdp` | 1 | 150 | Glass POMDP box forms around the belief. |
| 3 | `agent` | 1 | 200 | RL agent shell + PPO; ∞ heartbeat loop starts; graded actions. |
| 4 | `assemble` | 1 | 200 | The agent builds itself (components snap in). |
| 5 | `mbrl` | 1 | 200 | World models dock; imagined heartbeat. |
| 6 | `home` | 2 | 150 | Zoom out: the agent compresses into a hub inside Home 1. |
| 7 | `neighborhood` | 2 | 150 | Zoom out: Homes 1…N. |
| 8 | `federation` | 2 | 200 | Central server, links, FedAvg cycles; **0-day button appears**. |
| 9 | `shadow` | 2 | 200 | Shadow server, champion vs challenger, canary → rollout. |
| 10 | `hub` | 3 | 200 | Dive into Home 1 → Zigbee hub + mesh. |
| 11 | `protocols` | 3 | 150 | Protocol strata; cross-protocol attack path with blind spots. |
| 12 | `multiagent` | 3 | 200 | The agent splits into per-protocol agents; MAPPO/IPPO toggle. |
| 13 | `outro` | 3 | 100 | Final composition + CTA. |

### 7.3 ScrollDirector

```ts
const ranges = (() => {
  let acc = 0;
  const total = TIMELINE.steps.reduce((a, s) => a + s.weight, 0);
  return TIMELINE.steps.map((s) => {
    const r = { id: s.id, start: acc / total, end: (acc + s.weight) / total };
    acc += s.weight;
    return r;
  });
})();

function toProgressMap(g: number): ProgressMap {
  const m = {} as ProgressMap;
  for (const r of ranges) m[r.id] = clamp01((g - r.start) / (r.end - r.start));
  return m;
}
```

On each update, the director:

1. computes the progress map,
2. calls `setProgress` on every module,
3. updates the camera rig and ThemeDirector,
4. updates the UI (caption, phase rail, button visibility),
5. sets `visible` and active flags for culling.

### 7.4 Camera rig

**Keyframes are spherical.** Each step defines:

```ts
camera: {
  target: "beliefCore" | [x, y, z],   // named anchor or world point
  distance: 6,
  azimuth: 20,                        // degrees
  elevation: 12,                      // degrees
  fov: 35,
}
```

Each step may also define an in-step mid-keyframe.

**Interpolation:**

- Targets: Catmull-Rom across neighboring keys.
- **Distance: in log space**, so zooms feel uniform. Use `exp(lerp(log d0, log d1, t))`.
- Angles: shortest path.
- Smoothing: apply critically damped smoothing (factor ≈ 8/s) so fast scroll stays silky.

**Scale-rig zoom (powers-of-ten technique).** This keeps the large zoom from the agent to the neighborhood numerically safe:

- Each world keeps its own sensible units:
  - agent ≈ 14 units across,
  - house ≈ 10 units,
  - neighborhood radius ≈ 80 units.
- During `home`, the agent group scales from `1 → 0.01` onto the hub anchor.
- At the same time, camera distance is multiplied by the same scale factor (so on-screen size is unchanged), then dollied out in log space. On screen this reads as one continuous zoom-out.
- Phase 3 runs the same technique in reverse.

**Dynamic clipping planes:** set `near = distance × 0.01` and `far = distance × 60` every frame.

**Caption-safe framing:**

- Desktop: `camera.setViewOffset` shifts the subject about 12% to the right, leaving the left side for captions.
- Portrait mobile: the subject sits in the upper 60%, and captions use a bottom sheet.

### 7.5 Navigation

- **Phase rail:** click a step tick → `lenis.scrollTo(stepStartPx, { duration: 1.2 })`.
- **Keyboard:** PageDown / PageUp / arrow keys jump to the next or previous step start.
- **Snapping:** optional `snapToSteps` flag, off by default (scrub storytelling).

---

## 8. Step-by-step scene spec

Notation: `0.00–0.30` = sub-range of the step's local progress.
Ambient behavior runs on time, but **its visibility and intensity are gated by progress**.
Every caption has an eyebrow (`Phase N · Step k`), a title, a body, and an optional equation (KaTeX).

### Step 0 · `intro`
- **Scene:** dark field, faint dot grid, one dim point at center (the seed of the belief core). It breathes on the heartbeat.
- **Scrub:**
  - `0.00–0.70`: title and tagline visible; the point grows slightly.
  - `0.70–1.00`: title fades; the point brightens.
- **Caption:** `{project.name}` / `{project.tagline}` / "Scroll to begin" with a small animated chevron.

### Step 1 · `belief`
- **Scrub:**
  - `0.00–0.25`: the core forms. Particles converge, the icosphere fresnel fades in, and radial state bars (one per `belief.states`) rise to the engine's current belief.
  - `0.25–0.70`: viewers appear one per ~0.15, spaced 120° apart on a slightly tilted orbit. Each starts its particle stream into the core, and its label chip appears.
  - `0.70–1.00`: the belief-update equation appears; the bars visibly re-weight as observations land.
- **Ambient:**
  - the core breathes on the beat,
  - streams pulse on the beat,
  - bars ease to `SimFrame.beliefs`,
  - core brightness = `1 − entropy`.
- **Camera:** close orbit; the core fills about 35% of viewport height. Azimuth drifts 10° with scroll (not time).
- **Caption:**
  - Title: `{belief.name}`
  - Body: "Three viewers watch the home from different angles. The belief engine fuses what they see into a probability over hidden infection states. It never assumes it knows the truth."
  - Equation: `b'(s') = \eta \, O(o \mid s', a) \sum_{s} T(s' \mid s, a)\, b(s)`

### Step 2 · `pomdp`
- **Scrub:**
  - `0.00–0.40`: camera log-dolly out ×2.5; the box edges draw on progressively (line dash offset) around the core and viewers.
  - `0.40–0.80`: faces fade in (fresnel glass); tuple labels attach to edges and faces; interior fog fades in.
  - `0.80–1.00`: observation packets visibly cross the "Ω" face into the core.
- **Caption:**
  - Title: "The belief lives inside a POMDP"
  - Body: "The agent never sees the true state of the network, only observations. The POMDP makes that explicit: decisions are made on beliefs, not certainties."
  - Equation: `\langle S, A, T, R, \Omega, O, \gamma \rangle`

### Step 3 · `agent`
- **Scrub:**
  - `0.00–0.30`: pull back; the segmented chassis assembles around the POMDP box; Actor and Critic blocks appear beside it.
  - `0.30–0.60`: the **∞ heartbeat track** draws on.
    - The agent lobe sits inside the chassis.
    - The environment lobe extends outside to an "Environment" node (a tiny abstract house glyph).
    - Six stations from `agent.loopStations` sit on the track with labels.
  - `0.60–1.00`: the graded **action gauge** appears at the Policy station (segments labeled from config, severity ramp); the **rollout buffer** bar and the **clip-band gauge** appear near the PPO blocks.
- **Ambient (local progress ≥ 0.6):**
  - One pulse laps the ∞ per beat. Each station lights as the pulse passes.
  - At the Policy station, segment brightness = `π(a|b)`. The sampled action flashes and travels to the Environment lobe.
  - The buffer fills one slot per beat. When it reaches `rolloutLength`, a **PPO update** runs:
    - a pulse travels from the buffer to Actor and Critic,
    - both flash,
    - the clip-band marker moves and **clamps at `1±ε`**,
    - the Policy station briefly retints,
    - the buffer empties.
  - **VitalsHUD** fades in (§16).
- **Caption:**
  - Title: "A `{agent.algorithm}` agent, living on a heartbeat"
  - Body: "Each beat is one step of the loop: observe, update the belief, choose a graded action, learn from the result. Every `{agent.ppo.rolloutLength}` beats, `{agent.algorithm}` improves its policy, but only inside a safe trust region (ε = `{agent.ppo.clipEpsilon}`)."
  - Equation: `L^{CLIP}(\theta)=\mathbb{E}_t\big[\min(r_t(\theta)\hat A_t,\ \mathrm{clip}(r_t(\theta),1-\epsilon,1+\epsilon)\hat A_t)\big]`

### Step 4 · `assemble` (the agent builds itself)
- **Scrub:**
  - `0.00–0.85`: parts from `agent.assemblyParts` fly in from off-frame along curved paths, in config order, staggered evenly. Each snaps into a chassis slot with a label chip.
    - Each snap triggers a micro-flash `bump(p, snapAt, 0.04)` and a thin seam light-up. Because it's scroll-driven, it's reversible.
  - `0.85–1.00`: chassis seams glow in sequence and the system reads as "online". The heartbeat continues throughout.
- **Reverse scroll** disassembles exactly.
- **Caption:**
  - Title: "The agent builds itself"
  - Body: "Rollouts, advantage estimates, actor, critic and optimizer lock together into a loop that improves itself with every heartbeat."

### Step 5 · `mbrl`
- **Scrub:**
  - `0.00–0.50`: `mbrl.worldModels.length` dream chambers emerge and dock around the chassis at even angles, each labeled. The layout must work for both 2 and 3.
  - `0.50–0.80`: the **imagined ∞ track** (dashed, `semantic.imagined`) appears, linked through the chambers. It beats at `imaginedBpm`.
    - From the Policy station, `branches` ghost trajectories of length `horizon` fan out inside the chambers.
  - `0.80–1.00`: ghost packets from the imagined loop flow into the rollout buffer (Dyna-style), so the buffer visibly fills faster. The HUD shows **two ECG traces** (real and imagined) plus a **prediction-error** mini-gauge.
- **Caption:**
  - Title: "Model-based: it rehearses before it acts"
  - Body: "`{mbrl.worldModels.length}` world models simulate how an attack could unfold. A second, virtual heartbeat runs imagined futures between real ones, and the agent learns from both. When reality stops matching the models' predictions, that surprise is a warning sign."
  - Equation: `\hat s_{t+1} \sim p_\phi(\cdot \mid \hat s_t, a_t)`

### Step 6 · `home` (Phase 2 begins)
- **Scrub:**
  - `0.00–0.50`: the agent compresses. Parts fold inward and the chassis shrinks via the scale-rig zoom (§7.4).
    - **LOD swap at 0.30–0.40:** cross-fade from the detailed agent to `hubCore`, a small emissive sphere inside the hub.
    - The real and imagined heartbeats continue on the hub core as two tiny pulsing rings.
  - `0.30–0.80`: the Home 1 cutaway builds:
    - floor plate first, then walls rise, then the roof drops in,
    - devices pop in,
    - **wires from hub to devices** use the pulse shader, synced to the beat.
  - `0.80–1.00`: theme lerps to the `p2` mood.
- **Caption:**
  - Title: "Phase 2 · It lives in the home"
  - Body: "The whole agent runs on a hub inside the house, watching every connected device."

### Step 7 · `neighborhood`
- **Scrub:**
  - `0.00–0.60`: log-dolly out further; Homes 2…N rise from the ground, staggered (InstancedMesh). Each hub light beats with a small per-home phase offset, because each agent is independent.
  - `0.60–1.00`: "Home 1…N" labels appear; a ground disc with a subtle grid and thin roads.
- **Caption:**
  - Title: "Every home has its own agent"
  - Body: "Each one learns from its own traffic. On its own, an agent only knows what it has already seen."

### Step 8 · `federation`
- **Scrub:**
  - `0.00–0.30`: the central server tower rises at center, with LED strips on the beat.
  - `0.30–0.60`: arcs (quadratic Bézier tubes with the pulse shader) draw from each home to the server. Lock badges appear on the arcs.
  - `0.60–1.00`: federated rounds become visible.
- **Ambient (≥ 0.6), every `roundEveryBeats` beats:**
  1. `Δw` cube packets travel **up** the arcs.
  2. They **merge** at the server: a FedAvg ring collapses them into one larger glyph.
  3. The global packet travels **down** to every home.
  4. Home cores flash.
- **UI:** at local progress ≥ 0.6, **ZeroDayButton** slides in at bottom center. It stays visible through the end of `shadow` and hides elsewhere.
- **Caption:**
  - Title: "Federated learning: shared immunity, private data"
  - Body: "Homes share what they learned, never what they saw. Only model updates leave the house; the server averages them into a better global model."
  - Equation: `w_{t+1} = \sum_k \tfrac{n_k}{n}\, w^{k}_{t+1}`

### Step 9 · `shadow`
- **Scrub:**
  - `0.00–0.25`: a new global candidate (the **challenger**) forms at the server. Instead of descending, it diverts to the **shadow server**, a ghost wireframe twin rising beside the main one.
  - `0.25–0.70`: **mirrored traffic**: dotted copies of each home's stream curve to the shadow server. The **Scoreboard** (DOM, anchored near the shadow server) fills champion vs challenger bars progressively with scroll, using `shadow.metrics`.
  - `0.70–0.80`: verdict stamp: **PASS**, or **FAIL** if `shadow.outcome = "fail"`.
  - `0.80–1.00`:
    - On pass: canary deploy to `canaryHome` (its ring changes to the new model color), then propagate to all homes; the champion badge swaps.
    - On fail: the challenger dissolves, the champion stays, and the caption explains the rollback.
- **Caption:**
  - Title: "Nothing ships untested"
  - Body: "Each new global model runs silently in shadow against mirrored live traffic. It must beat the current model on every gate before a canary rollout. Otherwise it's discarded."

### Step 10 · `hub` (Phase 3 begins)
- **Scrub:**
  - `0.00–0.50`: the camera dives from the neighborhood into Home 1 through the cutaway opening (reverse scale-rig). Other homes and the servers fade out.
  - `0.50–1.00`: close-up on the hub, a **generic puck** with no brand resemblance.
    - An x-ray shell reveals the agent core inside, with both heartbeats still running.
    - The Zigbee mesh devices appear with mesh links in `protocols.zigbee` color (pulse shader).
    - Theme lerps to `p3`.
- **Caption:**
  - Title: "Phase 3 · Inside the `{crossProtocol.hubProtocol}` hub"
  - Body: "The agent first lives where the devices are: on the hub of the home's mesh network."

### Step 11 · `protocols`
- **Scrub:**
  - `0.00–0.50`: the home separates vertically into **strata**, one translucent plane per protocol, each with its devices and its own colored link mesh. Labels in mono type.
  - `0.50–1.00`: a red **attack path** (`crossProtocol.attackPath`) traces across strata.
    - Only the segments on the agent's own stratum render clearly.
    - Segments on other strata render dim with `?` markers: **blind spots**.
- **Caption:**
  - Title: "Attacks don't respect protocol boundaries"
  - Body: "A threat can enter over BLE, pivot through Wi-Fi and land on Zigbee. A single-protocol agent only sees one piece of the path."

### Step 12 · `multiagent`
- **Scrub:**
  - `0.00–0.40`: the core **splits** into one agent per stratum (instanced small cores), and each travels to its plane.
  - `0.40–0.70`: the algorithm visual appears, driven by `crossProtocol.multiAgentAlgorithm`:
    - **MAPPO:** a shared **centralized critic** node appears above the strata, with thin lines to every agent. Badge: "Centralized training · decentralized execution".
    - **IPPO:** each agent spawns its **own small critic**. There is no shared node. Badge: "Independent learners".
  - `0.70–1.00`: the attack path replays. Agents on every stratum respond together, each with its own graded action and severity colors, and cut the path at multiple points. The `?` blind spots resolve.
- **UI:** **AlgoToggle** (MAPPO | IPPO) appears at ≥ 0.4. Toggling runs a 0.6s time tween (an allowed exception). The selected value persists for the session.
- **Caption:**
  - Title: "From one agent to a team"
  - Body: "One agent per protocol, each acting on what it observes, learning to coordinate. `{crossProtocol.multiAgentAlgorithm}` decides how they share what they learn."
  - Equation:
    - MAPPO: `\pi_i(a_i \mid o_i),\; V(s)`
    - IPPO: `\pi_i(a_i \mid o_i),\; V_i(o_i)`

### Step 13 · `outro`
- **Scrub:** the strata collapse back into the home; the camera rises to a final composition showing the neighborhood, the server and every heartbeat. Then the CTA card appears (`project.cta`).
- **Caption:** `{project.name}` / "Belief → Agent → Imagination → Federation → Coordination."

---

## 9. Heartbeat system

### 9.1 HeartbeatClock

- Holds `realPhase` and `imaginedPhase` (0–1, wrapping).
- Advances each frame: `phase += dt × bpm / 60 × pace`.
- BPM eases toward its target with a time constant of about 0.8s (e.g. 60 → 120 during an attack).
- Exposes **one shared uniform object** that all pulse materials reference:

```ts
{ uBeatPhase: { value: 0 }, uImaginedPhase: { value: 0 } }
```

### 9.2 Pulse shader

Used for wires, arcs, the ∞ tracks and mesh links.

```glsl
// pulse.frag — light traveling along a tube; vUv.x runs 0→1 along its length
uniform float uBeatPhase;   // shared beat phase
uniform float uLength;      // tube length (world units)
uniform float uSpacing;     // world units between pulses (closed loops: uLength / integer)
uniform vec3  uBase;
uniform vec3  uPulse;
uniform float uIntensity;   // 0..1 from scroll progress
uniform float uDashed;      // 1.0 for imagined tracks
varying vec2 vUv;

float ecg(float p) {        // lub-dub within one beat
  float lub = exp(-pow((p - 0.06) / 0.018, 2.0));
  float dub = 0.55 * exp(-pow((p - 0.20) / 0.022, 2.0));
  return lub + dub;
}

void main() {
  float along = vUv.x * uLength / uSpacing;               // position measured in beats
  float e = ecg(fract(uBeatPhase - along));
  float dash = mix(1.0, step(0.5, fract(vUv.x * uLength * 4.0)), uDashed);
  vec3 col = uBase * 0.18 + uPulse * e * 3.0;             // > 1.0 → blooms
  float a = (0.25 + e) * dash * uIntensity;
  gl_FragColor = vec4(col * uIntensity, a);
}
```

Material and usage settings:

- `transparent: true`, `depthWrite: false`, `toneMapped: false`, additive blending.
- **Closed loops** (the ∞ tracks): set `uSpacing = uLength / beatsPerLap` so the loop wraps seamlessly.
- **Station highlights** are computed in JS from the same formula, `ecg(fract(beatPhase − stationU))`, so stations light exactly when the pulse passes.
- **Device LEDs** (meshes named `led_*`) use `ecg(beatPhase)` directly.

### 9.3 HUD ECG

A small 2D canvas in VitalsHUD draws a scrolling trace of `ecg(realPhase)` in the phase primary color. From the `mbrl` step onward it also draws `ecg(imaginedPhase)` as a dashed ghost trace. BPM readouts sit next to the traces.

---

## 10. Mock simulation engine

The engine makes the visuals behave coherently, and it is swappable for real data.

### 10.1 Data contract

```ts
export interface SimFrame {
  t: number;                 // beat index
  beliefs: number[];         // length = belief.states.length, sums to 1
  viewerSignals: number[];   // per viewer, 0..1
  policy: number[];          // π(a|b), length = actions.length
  action: number;            // sampled action id
  reward: number;
  entropy: number;           // normalized 0..1
  predictionError: number;   // world-model surprise, 0..1
  bpm: number;
  bufferFill: number;        // 0..rolloutLength
  updated: boolean;          // true on the beat a PPO update happens
}
```

### 10.2 Default engine

The engine steps once per real beat. It uses a seeded RNG (e.g. mulberry32) so the demo is repeatable.

- **Hidden true state:** a demo-only state, mostly "clean", with occasional "probed".
- **Prediction step:** `b̄ = bᵀ T(a)`.
  - Base transition matrix over the 4 default states (rows = from, columns = to):

    | from \ to | clean | probed | infected | spreading |
    |---|---|---|---|---|
    | clean | 0.92 | 0.08 | 0 | 0 |
    | probed | 0.10 | 0.70 | 0.20 | 0 |
    | infected | 0.05 | 0 | 0.70 | 0.25 |
    | spreading | 0.05 | 0 | 0.10 | 0.85 |

  - Action severity `k` multiplies recovery transitions by `(1 + 0.6k)` and spread transitions by `(1 − 0.18k)`. Renormalize each row afterward.
- **Correction step:** each viewer emits a low/medium/high signal sampled from the true state.
  - Update: `b ∝ b̄ ⊙ Π_v L_v(o_v | ·)^{w_v}`.
- **Policy:**
  - `threat = 0.3·b[probed] + b[infected] + 1.5·b[spreading]`
  - `logits_k = −(k − 4·threat)² / τ`, then softmax and sample. The policy is stochastic, which is visible in the gauge.
- **Reward:** `r = −cost[k] − 2·(b[infected] + b[spreading])`.
- **Prediction error:** distance between predicted and actual viewer signals. It spikes when the hidden state changes in a way the transition matrix doesn't predict, which happens during the zero-day sim.

The engine must handle any number of states, viewers and actions. If the owner changes the state list, generate a sensible default `T` and likelihoods and log that in `DECISIONS.md`.

### 10.3 Real traces

If `public/traces/*.json` exists (an array of `SimFrame`, e.g. exported from the owner's Python training), play it back instead of the mock. Enable with config flag `sim.source: "mock" | "trace"`.

**Disclosure:** the UI footnote always reads "Simulated values for illustration" unless the source is `trace`.

---

## 11. Zero-day attack simulation (button)

**Visibility:** the button is visible from `federation` at local progress 0.6 through the end of `shadow`.
**Label:** "Check 0-day attack". It has a subtle threat-colored outline and a pulsing `!` icon.

**On click:**

- call `lenis.stop()` (scroll locks),
- show **Skip** (also triggered by Esc) and a thin progress bar,
- set the caption region to `aria-live` updates,
- run a **time-based GSAP timeline**. Total ≈ 21s × `zeroDay.durationScale`.

**Storyboard:**

| t (s) | Event | Visual | Caption / HUD |
|---|---|---|---|
| 0.0 | Start | Camera eases (1.2s) to frame Home `{targetHome}` and the servers. | "`{zeroDay.attackLabel}`" |
| 1.2 | Entry | Red jagged swarm enters via `{zeroDay.entryDevice}`; that device turns red with `!`. | |
| 2.5 | Surprise | Home 2's world-model chambers flare; the **prediction-error** gauge spikes; belief bars shift toward Infected/Spreading; entropy rises; the core flickers. | "World-model surprise → novelty detected" |
| 4.0 | Response | BPM 60 → `{attackBpm}`; the action gauge escalates Observe → Alert → Quarantine → Isolate; the swarm is contained in a shrinking sphere. | "Graded response: contain without shutting the home down" |
| 7.0 | Local learning | PPO update flash in Home 2; a `Δw` packet with a lock badge forms. | |
| 8.0 | Share | The packet travels the arc to the server. | "Only model updates leave the home" |
| 10.0 | Aggregate | FedAvg merge at the server. | |
| 11.5 | Shadow test | Challenger → shadow server; mirrored traffic; scoreboard fills; **PASS** stamp. | "Validated in shadow before deployment" |
| 15.0 | Rollout | Canary home, then all homes; a shield ripple expands from each home. | |
| 18.0 | Verify | The same variant hits Home `{verifyHome}` and is blocked within one beat at Alert/Quarantine, with no spread. | "Home `{verifyHome}` was never attacked before, and it's already immune." |
| 21.0 | End | BPM returns to rest; end card: "Network immune · `X`s". Buttons: **Replay** and **Continue**. | `lenis.start()` |

**Rules:**

- The sim reuses the ShadowServer, Scoreboard, Links and engine components. The engine enters a scripted "attack" mode during the sim.
- **Skip:** jump to the end state, restore the scroll state, `lenis.start()`.
- **Navigation away** (e.g. via the phase rail) kills the timeline and resets Phase 2 visuals to the state for the current scroll progress.
- **Reduced motion:** the sim becomes a 6-card stepper with **Next** buttons and static states.

---

## 12. Swappable algorithms (design for change)

| Change | What must adapt automatically |
|---|---|
| Rename belief / viewers / world models | Labels, InfoPanel, captions (via tokens). |
| Number of belief states | Number of radial bars; engine matrices (defaults generated). |
| 2 ↔ 3 world models | Chamber layout angles, imagined-track routing, caption count. |
| Number of graded actions | Gauge segments and severity ramp (interpolate the ramp if more than 5). |
| `agent.algorithm` label (e.g. "Recurrent PPO") | Captions and HUD; visuals unchanged. |
| MAPPO ↔ IPPO | Shared critic node vs per-agent critics (§8, Step 12). |
| Protocol list | Strata count, colors (add defaults if missing), device sets, attack path. |
| Palette | Everything, via ThemeDirector. |

---

## 13. 3D assets

### 13.1 Procedural first (build in code)

| Component | Construction |
|---|---|
| Belief core | `IcosahedronGeometry(1, 3)` + fresnel shader; inner `Points` swirl. |
| State bars | `InstancedMesh` of thin boxes arranged radially. |
| Viewers | Ring-lens = torus + disc; eye-dome = sphere cap + iris disc; prism = 3-sided cone. |
| Particle streams | GPU `Points` along `CatmullRomCurve3`. |
| POMDP box | `BoxGeometry` + `EdgesGeometry` (progressive draw) + fresnel faces. **No transmission material.** |
| Agent chassis | Rounded-box segments; seams = thin emissive strips. |
| ∞ tracks | `TubeGeometry` along a lemniscate of Bernoulli: `x = a·cos t / (1 + sin² t)`, `y = a·sin t·cos t / (1 + sin² t)`; pulse shader. |
| Assembly parts | Beveled blocks with canvas-texture icon decals. |
| World models | Faceted spheres ("dream chambers") with ghost branching lines inside. |
| Home | Extruded floor plan + gable-roof prism, cutaway (one wall and roof half removed); low-poly. |
| Neighborhood | Instanced simplified homes, ground disc, plane roads. |
| Server / shadow server | Stacked slabs + LED strips; the shadow server is the same geometry with ghost wireframe material. |
| Hub + devices | Generic puck; simple bulb, sensor, plug, lock forms. **No brand resemblance.** |
| Strata | Large thin planes with grid shader + per-protocol link meshes. |

### 13.2 Optional external models (only for home detail and devices)

Allowed sources:

- **Kenney** (kenney.nl): CC0.
- **Quaternius** (quaternius.com): CC0.
- **Poly Pizza** (poly.pizza): license varies per model. Check each; CC-BY requires credit.
- **Poly Haven** (polyhaven.com): CC0 HDRIs, textures and some models.
- **Sketchfab** (sketchfab.com): only downloadable models with a compatible CC license. Credit them.

Rules:

- Record every asset with its license and author in `CREDITS.md`.
- **No branded products, logos or recognizable commercial device designs.** Use generic forms only.

### 13.3 Blender pipeline (if custom models are made)

- **Tool:** Blender (free, blender.org).
- **Conventions:**
  - 1 unit = 1 m, Y-up glTF export,
  - apply all transforms,
  - origin at the base center.
- **Mesh naming for code hooks:**
  - `hub_anchor` (empty): where the agent compresses to,
  - `wire_*`: gets the pulse material,
  - `led_*`: emissive, beat-synced,
  - `wall_cut_*`: hidden for the cutaway,
  - `device_<protocol>_<name>`.
- **Materials and lighting:**
  - at most 2 materials per model,
  - bake AO into vertex colors or one small texture,
  - no real-time-shadow dependence.
- **Polygon budget:** home ≤ 8k triangles; device ≤ 800 triangles.
- **Export and optimize:**

```bash
npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt --texture-compress webp
```

### 13.4 Model Brief (template for asking the owner)

```
Model: <name>
Purpose / step: <where it appears>
Size: <meters>, poly budget: <tris>
Required named parts: <hub_anchor, wire_*, led_*, …>
Style: low-poly, clean planes, matte, no brand features
Reference mood: <palette phase>
Needed by milestone: <M#>
```

---

## 14. Performance

### 14.1 Budgets

| Metric | Desktop (mid-range) | Mobile |
|---|---|---|
| FPS | 60 | 45–60 |
| Draw calls per frame | ≤ 120 | ≤ 80 |
| Visible triangles | ≤ 300k | ≤ 120k |
| GPU texture memory | ≤ 24 MB | ≤ 12 MB |
| Initial JS (gzip) | ≤ 350 KB | same |
| Device pixel ratio cap | `min(dpr, 2)` high / 1.5 medium / 1.25 low | 1.25 |

Phase 2–3 assets lazy-load while the user is in Phase 1.

### 14.2 Techniques

- **Instancing everywhere it repeats:** homes, devices, bars, particles, packets, assembly bolts.
- **Merge static geometry** per module with `mergeGeometries`.
- **Shared materials and uniform objects.** The beat and theme uniforms are single shared objects.
- **GPU-driven particles:** positions computed in the vertex shader from curve data (uniform arrays or a small `DataTexture`). No CPU per-particle updates.
- **No real-time shadows.** Use fake contact shadows (blurred radial texture planes).
- **Lighting:** `RoomEnvironment` through PMREM + one directional light. Glowing elements are unlit custom shaders.
- **No `MeshPhysicalMaterial` transmission.** Glass = fresnel shader.
- **Postprocessing:** one `EffectComposer` and one `EffectPass` containing:
  - Bloom: mipmap blur, luminance threshold ≈ 0.9, HDR emissive > 1,
  - SMAA,
  - Vignette.
  Bloom resolution scales with quality tier; bloom is off on the low tier and on `paperLab`.
- **Culling:** modules more than one step away get `visible = false` and skip `tick`.
- **Pause rendering** when `#sim` is off-screen (IntersectionObserver) or the tab is hidden.
- **Precompile shaders** with `renderer.compile(scene, camera)` after load, with all modules temporarily visible, to avoid mid-scroll hitches.
- **Preload the next phase's assets** when the current step passes 0.5.
- **DOM labels:**
  - pooled, at most ~16 visible,
  - positioned with `transform: translate3d`,
  - hidden when behind the camera or occluded by distance.
- **QualityManager:**
  - measures median frame time over 2s windows,
  - above 20ms, steps down one level, in this order: bloom off → DPR down → particles halved,
  - below 12ms for 6s, steps back up,
  - uses hysteresis so it never thrashes.

---

## 15. Responsive, accessibility, fallbacks

### 15.1 Breakpoints and mobile

- **Breakpoints:** ≥ 1024 desktop; 640–1023 tablet; < 640 mobile.
- **Per-aspect camera adjustments:** keyframes accept a `portrait: { distanceMul: 1.4, targetOffsetY }` override.
- **Mobile defaults:**
  - `federation.homesMobile`,
  - low quality tier by default,
  - captions as a bottom sheet,
  - HUD collapsed to a BPM chip.

### 15.2 Reduced motion (`prefers-reduced-motion`)

- no Lenis smoothing,
- ambient loops become gentle opacity pulses or static lit states,
- camera moves become short cross-fades between keyframes,
- the zero-day sim becomes the stepper version.

### 15.3 Keyboard and screen readers

- Phase rail ticks, buttons, the toggle and the InfoPanel are focusable, with visible focus rings in the phase primary color.
- Esc closes the InfoPanel and skips the sim.
- The canvas is `aria-hidden`.
- The caption container is `aria-live="polite"` and updates on step change.
- Every step has a full text summary.

### 15.4 Contrast and color meaning

- Text contrast ≥ 4.5:1.
- State is never encoded by color alone (see §6.1).

### 15.5 No WebGL or context lost

- Show **poster images** per step (`/public/posters/<stepId>.webp`) with the same captions.
- Generate the posters with a dev mode `?capture`, which steps through each step's 0.5 progress and saves the canvas.
- Handle `webglcontextlost` / `webglcontextrestored`.

---

## 16. UI overlay

| Element | Position | Behavior |
|---|---|---|
| Project mark | Top-left | Static, mono, small. |
| **PhaseRail** | Right edge, vertically centered | 3 phase groups with step ticks; the current tick uses the phase primary color; click to jump; phase names in mono uppercase. |
| **Captions** | Bottom-left card (desktop) / bottom sheet (mobile) | Eyebrow, title, body, KaTeX equation. Fades in over 0–0.1 and out over 0.9–1 of local progress; cross-fades on step change. Max width ≈ 420px. |
| **VitalsHUD** | Top-right, from `agent` onward | ECG canvas (real + imagined), BPM, belief entropy, current action chip (severity color), reward, prediction error (from `mbrl`). Mono, minimal, hairline borders. |
| **InfoPanel** | Right drawer | Opens on clicking any labeled component; shows config description, inputs, outputs, type. |
| **Scoreboard** | Anchored near the shadow server | Champion vs challenger metric bars; PASS/FAIL stamp. |
| **ZeroDayButton** | Bottom-center | Visible per §11. |
| **AlgoToggle** | Bottom-center | Shown in `multiagent` at ≥ 0.4. |
| **Footnote** | Bottom-right, tiny | "Simulated values for illustration" unless the sim source is `trace`. |
| Grain + vignette | Full overlay | CSS noise at 3% opacity; vignette via postprocessing. |

All UI reads the CSS variables set by ThemeDirector, so it recolors per phase.

---

## 17. Milestones (build in order)

1. **M1 · Skeleton.**
   - Vite + TS, renderer, pinned section, Lenis + ScrollTrigger, ScrollDirector, CameraRig,
   - placeholder primitives per step,
   - captions with template tokens, PhaseRail.
   - **Verify:** perfectly reversible scrub and correct step ranges.
2. **M2 · Phase 1.**
   - belief core, viewers, POMDP box, agent shell, ∞ track + pulse shader, HeartbeatClock,
   - MockEngine, action gauge, PPO buffer/update/clip visuals,
   - assembly, world models + imagined loop,
   - VitalsHUD.
3. **M3 · Phase 2.**
   - scale-rig zoom, home cutaway, neighborhood (instanced),
   - federated server + arcs + rounds,
   - shadow server + scoreboard + canary rollout.
4. **M4 · Zero-day simulation:** button, timeline, skip/replay, reduced-motion stepper.
5. **M5 · Phase 3:** dive into the hub, Zigbee mesh, strata, attack path with blind spots, multi-agent split, MAPPO/IPPO toggle, outro.
6. **M6 · Polish:**
   - palettes + ThemeDirector transitions, postprocessing,
   - optional external models, QualityManager, posters/fallbacks, accessibility pass,
   - performance pass against §14,
   - `CREDITS.md` and `DECISIONS.md` complete.

---

## 18. Acceptance criteria

- [ ] One canvas, one renderer, one RAF loop. The section is pinned for the full timeline.
- [ ] Scrubbing forward and backward at any speed always yields the identical state for the same scroll position. No drift, no orphaned tweens.
- [ ] Every name, number and color comes from config. Changing world models from 3 → 2, states from 4 → 5, or actions from 5 → 4 works without code changes.
- [ ] Real and imagined heartbeats are visible and rhythmically distinct (lub-dub). Stations, wires, LEDs and the HUD ECG are all in sync.
- [ ] A PPO update visibly happens every `rolloutLength` beats, with the clip-band clamp shown.
- [ ] The agent → home → neighborhood zoom feels like one continuous camera move, with no z-fighting or precision jitter. The Phase 3 dive is the reverse.
- [ ] Federated rounds show `Δw` up, merge, global down; the "model updates only" badge is visible.
- [ ] The shadow step shows champion vs challenger, a verdict, then canary → full rollout. The fail path works when configured.
- [ ] The 0-day button appears only in the specified range; the sim runs end-to-end; Skip, Replay and Continue work; scroll unlocks afterward.
- [ ] Phase 3 shows strata, blind spots, the split agents, and both MAPPO and IPPO visuals via the toggle.
- [ ] Palette switch (`ACTIVE_PALETTE`) recolors both the 3D scene and the DOM; phase moods transition smoothly.
- [ ] Meets the §14 budgets on a mid-range laptop and a recent phone; QualityManager degrades gracefully.
- [ ] Reduced motion, keyboard navigation, live-region captions and the poster fallback all work.
- [ ] The "Simulated values for illustration" footnote is present when using mock data.

---

## 19. Open questions for the owner

Ask these before M6. Use the defaults until answered.

1. Real names and one-line descriptions for the **belief algorithm** and its **3 viewers**. *Default: placeholders in §5.*
2. **Hidden states** of the belief. *Default: Clean / Probed / Infected / Spreading.*
3. **World models:** 2 or 3, with names and types. *Default: 3 placeholders.*
4. **Graded action** levels and labels. *Default: 5 levels in §5.*
5. **Palette:** default Obsidian Lab, another preset, or your own colors.
6. **Number of homes.** *Default: 6 desktop / 4 mobile.*
7. **Protocols for Phase 3.** *Default: Zigbee, Wi-Fi, BLE, Thread/Matter, Z-Wave.*
8. **Default multi-agent algorithm:** MAPPO or IPPO. The toggle stays either way. *Default: MAPPO.*
9. **Shadow demo:** pass or fail, and real metric values if available.
10. **Real training traces** (JSON `SimFrame[]`) to replace the mock engine?
11. **Custom Blender models** for the home and hub, or procedural only? *Default: procedural.*
12. **Outro CTA links:** paper, GitHub, contact.