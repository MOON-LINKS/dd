# Radar Anti-Jamming Research Notes: RL, MBRL, POMDP & Cognitive Radar

Context for continuation: this document captures a from-scratch learning thread building toward a research contribution in cognitive radar anti-jamming, combining Model-Based Reinforcement Learning (MBRL), POMDP-based state estimation, and Fisher Information as a reward signal. Background: the author already runs RAIDEN, a DDoS defense system using MMPP + Markov chains + GRU/DL models, which is where the mathematical intuition originated before being applied here to radar.

---

## 1. Core Reinforcement Learning Concepts

### AGI vs. AI Agent
- **AGI (Artificial General Intelligence)**: about the *breadth/depth of intelligence itself* — a hypothetical system that reasons across any domain at human level, including novel problems it wasn't trained for. Does not exist today (contested claims exist, e.g. OpenAI re: GPT-6 Astra, but not consensus).
- **AI Agent**: about *how a system acts* — any AI model wrapped with the ability to autonomously take actions/tool calls in a loop (observe → decide → act → repeat) toward a goal. Independent axis from AGI — a narrow, non-general model can be an agent; an AGI need not act autonomously.

### MDP (Markov Decision Process)
The formal framework underlying most RL. Defined by:
- **States**: the situation the agent is in
- **Actions**: choices available
- **Transition probabilities**: chance of moving state→state given an action
- **Reward**: feedback signal
- **Core assumption**: the agent *knows its current state with certainty*.

Example: "I know I'm in State 1. There's a 20% chance I move to State 2, 80% I stay."

### POMDP (Partially Observable MDP)
Same as MDP, plus one extra layer: the agent **does not know its true state for certain** — it only has noisy observations, and maintains a **belief state** (a probability distribution over possible true states), updated as new observations arrive.

Example: "I believe I'm 30% in State 1, 70% in State 2. If truly in State 1: 20%→State 2, 80%→stay. If truly in State 2: 40%→State 1, 60%→stay." The belief gets updated as new evidence (radar returns) comes in.

**Why POMDP fits radar/jamming**: the jammer's true internal mode (idle/spot/sweep/barrage/deceptive) is never directly observed — only noisy radar returns caused by that hidden mode are seen. Assuming MDP (full observability) here would be a false assumption baked into the system.

### DTMC / CTMC / MMPP / Semi-Markov — four related but distinct tools
| Tool | What it models | Note |
|---|---|---|
| **DTMC** (Discrete-Time Markov Chain) | State transitions at fixed, regular time steps | Assumes evenly spaced steps |
| **CTMC** (Continuous-Time Markov Chain) | State transitions with continuous, exponentially-distributed timing | Used to model the jammer switching between modes (idle→sweep→barrage etc.) at random real-world times |
| **MMPP** (Markov-Modulated Poisson Process) | A Poisson *arrival/burst* process whose rate is controlled by an underlying Markov chain | Models *how fast interference pulses arrive* while in a given jammer state (e.g., barrage = fast pulse arrivals) |
| **Semi-Markov Process (SMP)** | Like DTMC, but the *dwell time itself* is a random variable (not fixed ticks) | This is what you get once PRI jitter (randomized pulse timing) is introduced — technically no longer a strict DTMC |

**Important distinction**: MDP = agent decision-making framework. MMPP/CTMC = tools for modeling how an *environment's* events arrive/transition over time. They solve different problems and are not interchangeable — MMPP does not decide agent actions, it models jammer behavior which the agent then reacts to.

---

## 2. Neural Network Architectures

### LSTM (Long Short-Term Memory)
A recurrent neural network (RNN) architecture that processes sequences step-by-step, carrying forward a hidden state as memory. Uses three gates (forget, input, output) to control what's remembered/forgotten, solving the "vanishing gradient" problem of plain RNNs (forgetting things from many steps back).

### GRU (Gated Recurrent Unit)
A simplified LSTM — two gates instead of three, fewer parameters, often comparable performance, faster to train. **This is the architecture used in this project's belief estimator.**

**Role in this project**: the GRU's hidden state acts as a *learned, compressed approximation of the true Bayesian belief state* that exact POMDP math would require (computing this exactly via Bayesian filtering is often computationally intractable in real time). The GRU learns, from data, a function that does roughly the same job the exact math would do.

### Transformer / LLM (for contrast)
Modern LLMs (Claude, GPT-6 Astra) use Transformers, not LSTMs — key difference: Transformers process the whole sequence in parallel using **attention** (looking directly at every earlier token) rather than a compressed sequential hidden state. This parallelism is what made training models at LLM-scale computationally feasible.

**Why GRU/LSTM (not Transformer) is the right choice for this radar project**: streaming, real-time, low-latency sensor data with limited compute is exactly GRU/LSTM's strength — one timestep in, small fixed-size state out, no need to hold a full sequence in memory the way a Transformer does.

---

## 3. Training Techniques: RLHF, RLAIF, PPO

### RLHF (Reinforcement Learning from Human Feedback)
1. Pretrained base model generates multiple responses to a prompt
2. **Human raters** rank responses best→worst
3. A **reward model** is trained to predict what score a human would give any response
4. RL (typically PPO) fine-tunes the base model to produce responses that score higher against that reward model

### RLAIF (Reinforcement Learning from AI Feedback)
Same pipeline, except step 2's ranking is done by **another AI model** guided by written principles (a "constitution"), rather than human raters. Exists because human labeling is slow/expensive/hard to scale; AI feedback scales further, though it inherits the judge model's own biases.

- **Anthropic (Claude)**: publicly known for Constitutional AI (their RLAIF implementation)
- **OpenAI (ChatGPT)**: popularized RLHF; recent models reportedly use AI-assisted supervision at scale too (deliberative alignment / Model Spec)
- In practice, frontier labs use a **hybrid** of both — proprietary exact ratios not published.

**Important**: RLHF/RLAIF shape a model's *behavior/alignment*, not its raw capability — they steer an already-capable model toward preferred outputs, they don't add new knowledge.

**Important distinction that caused early confusion**: RLHF/RLAIF happen once, *offline*, before deployment (using a fixed batch of past rankings). They are NOT a live loop reacting to a given conversation in real time. A deployed chatbot's weights are frozen during any single conversation — nothing in a chat session live-trains the model.

### PPO (Proximal Policy Optimization)
A **policy-gradient** RL algorithm — directly adjusts the network that outputs actions, rather than learning action-values indirectly (like Q-learning/DQN).

**Problem it solves**: earlier policy-gradient methods were unstable — one bad update could collapse the policy.

**Mechanism, step by step**:
1. Collect a **batch** of trajectories (states, actions, rewards) using the current policy
2. Estimate an **advantage** per action: was this action better/worse than average for that state? (commonly via GAE)
3. Compute the ratio of new-policy-probability vs. old-policy-probability for each action
4. **Clip** that ratio (commonly ±20%) so the policy can't move too far in one update — PPO's signature trick, hence "Proximal"
5. Update the policy network via gradient descent, within that clipped range
6. Repeat with the newly updated policy

**Key clarification reached**: PPO's update size is NOT proportional to whether a reward number is numerically "high" or "low." It's proportional to the **advantage/surprise** — how far the actual outcome was from what the policy expected. A "low but expected" outcome causes little change; an unexpectedly bad (or good) outcome causes a large update.

**PPO is model-free by default** (no learned environment model) — but it *can* be paired with a separately-learned world model (see MBRL below) to form a hybrid pipeline; PPO itself doesn't become "model-based," it's two separable pieces bolted together.

---

## 4. RL vs. MBRL vs. RLHF vs. RLAIF — comparison

These are not four parallel alternatives — RL is the umbrella; MBRL is a subtype within it; RLHF/RLAIF are specific applications of RL to language-model alignment.

| | RL (model-free) | MBRL | RLHF | RLAIF |
|---|---|---|---|---|
| **How trained** | Acts directly in environment, updates policy from real reward. No model of dynamics. | Learns a **world model** of environment dynamics first; trains policy on imagined rollouts + real data | Humans rank responses → reward model → PPO | Same as RLHF, AI does the ranking |
| **Best for** | Cheap, plentiful interaction (games, simulators) | Expensive/slow/dangerous real interaction (robotics, radar/EW) | Subjective alignment needing human judgment | Same, but needing far more scale than humans can label |
| **Strength** | Simple, stable | Sample-efficient; can plan ahead; can simulate rare/dangerous scenarios safely | Captures genuine human values | Scales massively, consistent |
| **Weakness** | Sample-hungry (needs huge real interaction) | Wrong world model → confidently optimizes against fake reality ("model exploitation") | Slow, expensive, doesn't scale, rater disagreement | Inherits judge model's biases |

**Practical takeaway**: choice is driven by (a) whether you can measure success directly/objectively, and (b) how expensive real interaction is. Radar/jammer → objective reward, expensive real trials → **MBRL**. Chatbot alignment → cheap generation, no objective reward → **RLHF/RLAIF**.

**Radar zero-day defense conclusion reached**: MBRL structurally suits zero-day defense better than plain/model-free RL, because a learned model of "normal" system behavior enables **anomaly detection** (deviation from learned-normal, no prior labeling needed) rather than **classification** of known attack signatures (which cannot generalize to a truly novel attack by definition). Real production defense should still be **layered**: anomaly detection (MBRL world model) → RL/MBRL response-decision layer → human-in-the-loop for high-confidence novel anomalies before drastic automated action.

**Where the MBRL model helps in practice — two live roles, not just training**:
1. **Training-time**: imagined rollouts for cheap, sample-efficient PPO training (role ends once training is done)
2. **Deployment-time, continuous**: live belief-state estimation from real observations (like a Kalman filter, but learned) — this is the GRU's ongoing job during real operation
3. **Deployment-time, optional**: short-horizon live planning (Model Predictive Control style) — simulate a few candidate actions forward before committing, trading latency for better-informed decisions (tunable based on available compute/time budget)

---

## 5. Fisher Information (FIM) & Cramér-Rao Bound (CRLB / BCRLB)

**Plain definition**: Fisher Information is a number describing **how much a given measurement tells you about an unknown parameter** — i.e., how precise/trustworthy an estimate is, NOT the estimate's value itself, and NOT which state you're in.

**Analogy**: guessing someone's weight from across a room (low FI) vs. reading it off a scale (high FI) — same "measurement," very different confidence.

### FIM parameters relevant to radar
- **Range** — from return pulse time delay
- **Velocity (Doppler)** — from frequency shift of the return
- **Angle** (azimuth/elevation) — from phase differences across the antenna array
- **Amplitude / RCS** — from return signal strength (less central, useful for target classification confidence)

Each has a **Cramér-Rao Lower Bound (CRLB)** — the theoretical best-possible estimation precision achievable given the current waveform/conditions. **FIM is mathematically the inverse of the CRLB** — higher FIM = lower possible error.

**Trade-off**: no single waveform maximizes FIM for all four parameters simultaneously (e.g., tight range resolution often costs Doppler resolution) — this trade-off is what the RL policy has to navigate.

### Where FIM fits in the pipeline (this took several correction passes to nail down precisely)
FIM is **an output, a computed value — never a state, never an action, never the reward itself.** It's computed via a mathematical formula, fed by: current belief state (from GRU) + waveform used + noise/interference conditions.

FIM appears **twice** in the pipeline, doing two different jobs:
1. **Predicted FIM** (before acting): using the current belief state, the system computes "if I use Waveform A, predicted FIM ≈ high; Waveform B, predicted FIM ≈ low" → **helps choose the action**
2. **Actual FIM** (after acting): computed from the real returned signal after transmission → **feeds into the reward function** that trains PPO

**Who actually computes FIM — critical clarification**: FIM/SNR/SINR are computed by the radar's own **classical signal-processing layer** (matched filtering, noise floor estimation, standard radar-engineering math — decades old, no RL/AI involved). RL does **not** compute these itself — RL only **receives** these numbers as inputs (state/reward) and **outputs** a decision (which waveform to transmit next). Clean mental model: signal processing = the instrument that measures; RL = the decision-maker that reads the measurements and chooses what to do next, never the one measuring.

### FIM in virtual (imagined) MBRL rollouts
Yes, FIM is computed in virtual training too — but from the **world model's predicted** signal characteristics rather than a real return. This is fast and useful for sample-efficient training, but carries the same "model exploitation" risk as MBRL generally: if the world model is wrong, it can confidently predict high FIM for an action that performs poorly in reality. Standard mitigation: mix imagined rollouts with periodic real rollouts, using real FIM results to correct the world model over time (Dyna-style).

---

## 6. Radar Fundamentals

### Frequency bands (low → high frequency = high → low wavelength)
| Band | Frequency | Typical use |
|---|---|---|
| HF/VHF | 3–300 MHz | Over-the-horizon radar |
| UHF | 300 MHz–1 GHz | Long-range surveillance |
| L-band | 1–2 GHz | Air traffic control |
| S-band | 2–4 GHz | Weather radar |
| **C-band** | **4–8 GHz** | Weather radar, some military — **longer wavelength, better range/weather penetration, less fine detail** |
| **X-band** | **8–12 GHz** | Military tracking / fire-control radar (classic precision-tracking band) — **shorter wavelength than C-band, finer detail, less range/weather penetration** |
| Ku/K/Ka-band | 12–40 GHz | High-res imaging, automotive radar |
| mmWave | 30–300 GHz | Automotive collision radar (~77GHz), very fine resolution, short range |

Rule: shorter wavelength (higher freq) = better detail, worse range/weather. Longer wavelength (lower freq) = worse detail, better range/weather. Real-world overlap note: 5G C-band rollout caused documented real interference concerns with aviation altimeters — radar and telecom bands aren't always cleanly separated.

### SNR vs. SINR
- **SNR** (Signal-to-Noise Ratio): signal vs. natural background noise only (thermal, atmospheric, receiver noise)
- **SINR** (Signal-to-Interference-plus-Noise Ratio): signal vs. natural noise **plus deliberate jamming interference**, combined
- **Why it matters for this project**: SNR alone ignores the jammer entirely — a signal can have great SNR while being unusable due to active jamming. SINR is the honest, relevant metric for radar-vs-jammer evaluation.

### The "Jamming Margin" trick (SNR_expected − SINR_actual)
- **Predicted/expected SNR** is *computed* (not measured) from the radar equation using known quantities (transmit power, antenna gain, range, expected noise floor) — "what SNR should be if nothing were jamming."
- **Actual SINR** is measured from the real received signal.
- **The gap between them signals jammer presence/strength** — large gap = strong jamming; near-zero gap = little/no jamming.
- This is a real technique (related to J/S ratio / jamming margin in EW).
- **Integration point**: feeds as an extra input feature to the GRU belief estimator (helping it converge faster/more reliably) AND is one of the raw ingredients in the FIM computation itself (FIM math depends on noise+interference level).
- **Caveat**: only as good as the expected-SNR baseline's calibration accuracy — must be calibrated against real no-jamming conditions.

### Radar action space (what the RL policy actually controls)
Not weapons/targeting — purely about **what/how the radar transmits**:
- **Waveform selection** — which pulse shape to transmit
- **Frequency hopping** — which frequency channel to use next
- **Power allocation** — transmit power level
- **PRI (Pulse Repetition Interval) / timing** — spacing between pulses
- **Beam steering / spatial nulling** — pointing sensitivity away from a jammer's direction
- **Cover-pulse / deception tactics** — decoy pulses to mislead the jammer's own sensing

("Shoot the jammer" is a separate, unrelated fire-control/weapons-targeting problem — not part of this signal-processing/cognitive-radar research scope.)

### Decision cadence & inputs
The RL policy runs **once per PRI** (transmit-receive cycle) — not continuously or on arbitrary triggers. Each cycle's inputs: current belief state (GRU), predicted FIM per candidate waveform, current jamming-margin (SINR−SNR gap), and practical constraints (power budget, timing limits).

---

## 7. DRFM Jamming & Defenses

### DRFM (Digital Radio Frequency Memory) jamming
A real, hardware-based deceptive jamming technique: the chip **captures the radar's actual transmitted pulse**, then retransmits a modified copy — delayed (fakes range), frequency-shifted (fakes velocity/Doppler), or angle-shifted (fakes position).

**Critical property**: because it's a near-perfect replay of the radar's own signal, it does **not** produce low SNR/SINR — it looks clean and legitimate. SINR-based / signal-quality detection is specifically the wrong tool against DRFM.

### Real countermeasures
1. **Physical plausibility checks** — cross-check a target's kinematics against real physics (instant appearance, impossible acceleration/Doppler-vs-range consistency)
2. **"Too-perfect" correlation as the anomaly signal** — a digital replay can correlate with the transmitted pulse more cleanly than real physical reflection ever would
3. **Multi-sensor/multi-radar cross-checking** — a DRFM spoof aimed at one radar typically won't appear consistently from a second radar at a different physical vantage point; mismatch = detection signal. This happens in a fusion/coordination layer **above** each radar's individual RL loop, not inside it.
4. **Waveform/timing agility (the core research-relevant countermeasure)**: DRFM has a real physical **capture-then-retransmit delay**. If the radar unpredictably changes waveform/frequency/timing (exactly this project's action space), the DRFM's captured copy goes stale almost immediately — **unpredictability itself is the defense**, not signal-quality thresholding.

### Multi-radar / netted defense against DRFM
Each radar can run its own MBRL agent using a **different waveform** than its neighbors, so a DRFM copy captured against Radar A is useless against Radar B. Two design options:
- **Independent per-radar agents** — robust, no single point of failure, but harder to guarantee non-overlapping waveform choices
- **Centralized coordinator** — easier to guarantee non-overlap, but becomes a single point of failure / potential attack surface itself

### Multi-channel DRFM (the honest limitation)
A jammer *can* build multi-channel/wideband DRFM hardware to spoof multiple radars/channels at once. This is real. However:
- Multi-channel capture+replay costs real, escalating hardware complexity, bandwidth, and processing latency (not a free upgrade for the adversary)
- **The actual research framing this leads to**: the contribution is not "guarantees detection" (no system in the literature claims this against unlimited adversary resources) — it's "raises the cost/complexity/latency threshold required for an adversary to succeed," an arms-race framing that is both more honest and more credible to reviewers than an overclaim.
- **Defense must be genuinely unpredictable, not just "varied"** — a fixed/learnable hopping pattern can eventually be modeled and pre-adapted to by a capable adversary. This is itself an argument for keeping the waveform/timing choice RL-driven (harder to reverse-engineer) rather than a fixed rule-based schedule.

### PRI Jitter (randomizing pulse timing) — mechanism and integration
**What it does**: instead of firing at fixed, even intervals, the next PRI is drawn from a controlled random distribution / chosen by the RL policy each cycle, bounded by physical constraints (PRI lower/upper bounds are set by required max unambiguous range: `PRI ≈ 2 × max_range / speed_of_light` — not an arbitrary free choice).

**What it gives you**:
1. Defeats DRFM timing prediction
2. Breaks **Range-Gate Pull-Off (RGPO)** — a real deceptive technique that depends on predictable timing to gradually "walk" a fake return away from the true target's tracking gate
3. Reveals synchronized/repeater jammers via timing-slot mismatch

**Architectural consequence (important, not optional)**: introducing PRI jitter technically shifts the process from strict DTMC to a **semi-Markov process** (dwell time itself becomes a random variable). Two concrete required changes, not new subsystems:
1. **Action space** gains one more dimension: {waveform, frequency, next-PRI-value}
2. **GRU input** must explicitly include the actual elapsed delta-t between steps — otherwise the GRU implicitly (and now incorrectly) assumes even spacing between observations

Everything else (POMDP framing, GRU belief estimator, MBRL+PPO structure) stays structurally the same.

---

## 8. The Research Proposal

### Literature landscape found via search (2025–2026 papers)
- **POMDP framing for radar-vs-jammer**: well-established (e.g., multi-agent DRL under POMDP; a May-2026 paper using DMC-PPG, a PPO-family policy-gradient variant, for cover-pulse deception against smart jammers)
- **MBRL for anti-jamming**: emerging but thin — one 2026 IEEE paper ("Knowledge-Aided Model-Based RL for Anti-Jamming Strategy Learning") exists specifically to address model-free RL's sample-inefficiency
- **LSTM/GRU under POMDP uncertainty**: established (e.g., Ak & Brüggenwirth comparing DQN vs. LSTM under varying jammer-dynamics uncertainty)
- **FIM/CRLB-based waveform optimization**: a mature, *separate* subfield (beamforming/MIMO radar), consistently used as a standalone convex/Bayesian optimization objective — **not found integrated into an RL reward function** in any paper located
- **MMPP applied to radar/jamming specifically**: not found anywhere in the literature searched (heavily used in network traffic/queueing/ecology, but not this domain)

### The identified gap (core novelty claim)
No located paper combines an explicit **MMPP-based generative jammer model** (mode-switching as a doubly-stochastic process) with **FIM/CRLB used directly as an RL reward signal**. Existing work treats these as two disconnected toolchains: classical estimation theory (FIM/CRLB) vs. RL-based cognitive radar (POMDP/DQN/LSTM approaches using proxy rewards like SNR/track-quality/detection-probability).

### Proposed contributions, ranked by novelty/defensibility
1. **Primary**: a formal MMPP-driven generative jammer model + GRU trained to approximate its Bayesian belief state, feeding an MBRL policy — directly fills the located gap
2. **FIM-shaped reward**: integrating Fisher Information / CRLB directly into the RL reward function (rather than as a separate offline waveform-optimization step) — unifies classical estimation theory with RL-based cognitive radar
3. **Zero-day generalization benchmark**: explicitly testing against genuinely unseen jamming modes (not just known strategies the agent trained on) — addresses a real, repeatedly-flagged gap in the existing literature, and ties to the anomaly-detection (vs. classification) framing
4. **DRFM-specific threat model with waveform/timing-agility as built-in defense** — a concrete, named threat model strengthening the motivation section beyond generic "jammers are adaptive"
5. **Sim-to-real / model-exploitation analysis for radar MBRL specifically** — imported concern from general MBRL literature, not yet addressed in the radar-specific papers found

### Honest weaknesses to state directly in the proposal's motivation
- Most existing papers train/evaluate only against known, fixed jammer strategy sets — real generalization untested
- Sample efficiency remains a repeatedly-flagged open problem
- No paper found unifies FIM/CRLB with the RL reward loop — two separate toolchains currently
- Multi-agent/adversarial (radar vs. learning jammer) game-theoretic formulations are newer/less mature than single-agent anti-jamming

### Papers to read in full before finalizing the specific contribution claim
1. The 2026 "Knowledge-Aided Model-Based RL for Anti-Jamming Strategy Learning" (IEEE) — closest existing MBRL work
2. The May-2026 DMC-PPG POMDP paper — closest existing POMDP/policy-gradient work

*(Note: this was a solid initial search-based map, not an exhaustive systematic literature review — recommended next step is pulling full text/methodology of both papers above before locking the final contribution claim.)*

---

## 9. Full System Pipeline (end to end, as converged on)

1. Radar returns arrive (raw observations)
2. **GRU/POMDP belief estimator** updates belief over hidden jammer state, using observations **and** the SINR−SNR jamming-margin gap as an input feature, **and** the actual elapsed delta-t (once PRI jitter is introduced)
3. Using that belief, the system computes **predicted FIM** for each candidate action (waveform / frequency / PRI value)
4. **Policy (PPO, via MBRL)** selects an action — informed by predicted FIM and the belief state
5. Radar physically transmits (real) or the world model predicts an outcome (imagined rollout, for cheap MBRL training)
6. Classical signal-processing layer computes actual SNR, SINR, and **actual FIM** from the result — this step is NOT done by RL, it's standard radar-engineering math
7. Actual FIM (and/or track-quality/detection outcome) feeds the **reward**
8. **PPO** updates the policy using the batch of (state, action, reward, next-state) tuples — update magnitude driven by *advantage* (how surprising the outcome was vs. expected), not the raw reward value
9. Repeat, once per PRI cycle

At the multi-radar level: a separate fusion/coordination layer cross-checks detections across radars using different waveforms, catching DRFM spoofs that fool one radar but not others — this sits above, not inside, each radar's individual RL loop.

---

## 10. Implementation Plan

### Tools
| Purpose | Tool |
|---|---|
| Core language | Python |
| PPO implementation | Stable-Baselines3 (don't hand-roll PPO) |
| Environment interface | Gymnasium |
| Neural nets (GRU, world model) | PyTorch |
| Radar signal simulation | Custom Python (NumPy/SciPy) — simplified testbed, not full MATLAB Phased Array Toolbox fidelity |
| CTMC/MMPP jammer model | NumPy/SciPy (`scipy.stats`) |
| FIM/CRLB computation | NumPy/SciPy, implemented directly from formulas |
| Experiment tracking | Weights & Biases (free tier) or TensorBoard |
| Compute | Likely CPU-sufficient (small numeric state/action spaces, not image-based) — confirm early before assuming GPU is needed |

### Realistic timeline (single person, new to the domain, part-time alongside other projects)
1. Literature + exact problem spec on paper — 2–3 weeks
2. Base radar simulator (CTMC/MMPP jammer, waveform physics, SNR/SINR/FIM) — 3–4 weeks
3. POMDP/GRU belief estimator, tested in isolation — 2–3 weeks
4. MBRL + PPO integration, custom FIM-based reward — 3–4 weeks
5. Baseline reproductions (plain DQN, plain PPO) — 2 weeks (necessary for reviewers to judge improvement)
6. Training/tuning/ablations — 3–4 weeks (often the biggest time sink)
7. Zero-day + DRFM scenario testing — 2 weeks
8. Writing, figures, revisions — 2–3 weeks

**Total: ~4–6 months focused, ~6–9 months realistic part-time.**

**Recommendation**: scope a v1 minimum-viable version first — single radar, single jammer, core FIM-as-reward contribution only, skip multi-radar coordination and PRI jitter initially. Get that working and publishable, then expand, rather than attempting the full final vision in one pass.

### On using AI assistance to speed this up
Genuinely speeds up: simulator scaffolding, boilerplate (Gymnasium/Stable-Baselines3/PyTorch wiring), debugging.
Does NOT speed up: actual training/compute time (compute-bound, not typing-bound), deep comprehension of reference papers needed to correctly position the contribution, RL hyperparameter tuning's inherent trial-and-error cycle.

For a multi-week, multi-file codebase like this, **Claude Code** (rather than a single chat conversation) is the better tool — built for exactly this kind of ongoing, cross-file coding project with the ability to run/iterate on training scripts directly.

---

## Open items / next steps
- [ ] Pull full text of the two closest papers (2026 knowledge-aided MBRL; May-2026 DMC-PPG POMDP) before locking the final contribution claim
- [ ] Define exact v1 scope (single radar, single jammer, FIM-as-reward only) as a precise spec
- [ ] Decide target publication venue/deadline
- [ ] If proceeding to code: consider scoping a v1 module structure for Claude Code
