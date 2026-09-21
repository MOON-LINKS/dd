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

### Deeper literature check (second search pass) — corrections and stronger evidence
- **Correction to Contribution #2 (FIM-as-reward)**: the original "no paper found" claim was too confident. Found real adjacent/likely-overlapping prior art: Mitchell et al. (2018), cited in cognitive multi-function radar literature, uses FIM-based **cost functions** (very close to reward functions) in this exact domain; a separate paper uses **mutual information** (a close information-theoretic cousin of FIM) as an actual RL reward in multi-agent Q-learning waveform design; another (2024) uses FIM directly in adversarial radar sensing-plan decisions. **Action: read Mitchell et al. 2018 in full before claiming this contribution as novel** — the real differentiation, if any survives, is likely narrower: FIM-as-reward specifically *within* an MBRL+POMDP+MMPP jammer-modeling pipeline, not FIM-as-reward in general.
- **MMPP applied to radar/jamming specifically**: held up across two independent search passes — still no hits found. This remains the strongest, most defensible gap claim of the set.
- **PRI-jitter / temporal-structure contribution — independently strengthened, not just self-inferred**: a 2026 ScienceDirect paper states directly that existing RL-based anti-jamming approaches "remain predominantly confined to carrier-frequency decisions and seldom exploit the temporal structure of radar emissions." This is published, citable confirmation of the exact gap the PRI-jitter contribution addresses.
- **Other related work surfaced worth knowing before finalizing the related-work section**: an AlphaZero/Monte-Carlo-Tree-Search-based dual-agent radar-jammer evolution paper (2026); several Markov-game and game-theoretic (Stackelberg, counterfactual regret minimization) formulations, a more mature adjacent paradigm than the MBRL/POMDP framing used here; a domain-knowledge-enhanced online convex optimization approach, an alternative to RL entirely worth acknowledging in related work.

### Papers to read in full before finalizing the specific contribution claim
1. **Mitchell et al. 2018** (FIM-based cost functions in cognitive multi-function radar) — likely closest prior art to Contribution #2, read before claiming novelty there
2. The 2026 "Knowledge-Aided Model-Based RL for Anti-Jamming Strategy Learning" (IEEE) — closest existing MBRL work; note its actual mechanism is parameterizing *known jamming strategies* as prior knowledge via neural networks, which differs from this proposal's MMPP-based generative jammer model — worth confirming this distinction holds once read in full
3. The May-2026 DMC-PPG POMDP paper — closest existing POMDP/policy-gradient work
4. The 2026 ScienceDirect cover-pulse paper (the one confirming the temporal-structure gap) — useful both as related work and as a citable motivation source



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

## 11. Multi-Radar Shared Learning: Centralized Training, Decentralized Execution (CTDE)

### The problem
In a naive fully-independent multi-radar setup (4 radars, each running its own separate MBRL/PPO policy), each radar's policy only updates from **its own** (state, action, reward) experience. If Radar A's fusion-layer cross-check confirms a DRFM attack (a detection/mismatch the other radars didn't see), that insight lives only in Radar A's own training data. Radars B, C, D do not automatically become any better at recognizing that same DRFM pattern — they stay exactly as capable as before, since nothing in their own experience stream changed.

### The fix: CTDE (Centralized Training, Decentralized Execution)
A well-established pattern in multi-agent RL, splitting **learning** from **acting**:

- **Training time (can be slower, offline, pooled, safe)**: all radars' experiences are pooled into one shared training process. A confirmed DRFM detection by Radar A becomes a labeled training example that updates a **shared policy** (or is copied into the other radars' individual training data), so all radars benefit from what any one of them learned.
- **Deployment time / real operation (must stay fast, independent)**: each radar still acts fully independently in real time — no live inter-radar coordination needed for split-second decisions. This preserves the "no single point of failure" property and avoids reopening the coordination-link-as-attack-surface risk discussed earlier.

**Why this separation matters**: it avoids conflating two things that have very different timescale/risk requirements — *learning* (can happen slower, pooled, safely, after the fact) vs. *acting* (must stay fast and independent in the moment, during an actual engagement).

### What this adds to the pipeline
The fusion/coordination layer's mismatch detection ("Radar A's target claim wasn't corroborated by Radar B — DRFM signature") becomes a **labeled event**, logged and periodically fed back into a shared training update — not just used live and then discarded.

### Important limitation to keep in the proposal, stated honestly
CTDE propagates the **lesson**, not the **live detection**. Radar B will not catch that *specific* DRFM attempt *in the moment* it happens purely because Radar A's policy got retrained later — unless the fusion layer's real-time cross-check flags it live (a separate, faster mechanism). CTDE improves everyone's *future* skill over time; it does not retroactively help with the *current* attack. **Both mechanisms are needed in the architecture and solve different timescales of the same problem**:
- **Live fusion-layer cross-checking** → immediate, in-the-moment detection
- **CTDE (shared training updates)** → long-term, cross-radar skill improvement

---

## 12. MARL and QMIX — terminology

- **MARL (Multi-Agent Reinforcement Learning)**: the general field where more than one learning agent acts in a shared environment. Any multi-radar setup is a MARL problem by definition; CTDE is one strategy *within* MARL, not a separate category.
- **QMIX**: a specific, established MARL algorithm. Each agent computes its own local value estimate; a small "mixing network" (used only during centralized training) combines these into one joint team value, enforcing monotonicity (each agent's value improving improves the team value). At execution, the mixing network is discarded — each agent acts purely on its own local value, fully decentralized. Several of the CTDE-for-jamming papers found (Section 17) use QMIX specifically.

---

## 13. Architecture Clarification: One Shared Model, Many Deployed POSMDP Instances

Resolved a real point of confusion worth keeping precise:

- **Training**: ONE shared underlying model (one GRU belief-estimator architecture, one policy network) is trained using **pooled experience from all radars combined** — not four separately-trained, independently-evolving models. This is standard "parameter sharing" in CTDE/MARL (used by the QMIX-style papers found).
- **Execution/deployment**: that one trained model is copied onto each radar. Each radar then runs its **own independent instance** — own local belief state (own running GRU hidden state, built from only its own observations), own local inputs (own position, own received signal). Same weights, different inputs → naturally different outputs per radar, same principle as one trained image classifier given two different photos.
- **Per tick, per radar**: each radar independently produces its own (waveform action, actual FIM, local belief state) triple. Four radars → four separate triples, computed independently using the shared model.
- **The fusion layer is NOT the MBRL/policy.** It is a separate component sitting *above* the radars, consuming their four independent outputs and cross-checking them against each other (ray-triangulation, FIM-weighted mismatch detection). It does not itself choose actions or run a POSMDP.
- **What earns the "Dec-" prefix in Dec-POSMDP**: not whether agents share identical weights, but whether there is a shared/joint training signal tying independently-executing agents together. Because CTDE pools training via the fusion layer's confirmed detections, the "Dec-" prefix is formally earned — without any shared training, it would just be "four unrelated POSMDPs," not a Dec-POSMDP.

---

## 14. DRFM Deception Taxonomy

### Gate Pull-Off vs. Gate Pull-In (the mechanism, plainly)
Radar tracking locks a narrow "gate" (tracking window) around the target's current believed position (in range or Doppler). A DRFM jammer first matches the true return closely enough for the gate to lock onto the fake signal too, then:
- **Pull-OFF**: gradually drags the fake return **away** from the true value, walking the gate off the real target entirely (jammer can then shut off, leaving the radar tracking empty space).
- **Pull-IN**: same coherent trick, fake return dragged **toward** the radar instead — same deception, opposite direction.

### Named techniques (confirmed via search)
| Abbreviation | Full name | Domain |
|---|---|---|
| RGPO | Range Gate Pull-Off | Range |
| RGPI | Range Gate Pull-In | Range |
| VGPO | Velocity Gate Pull-Off | Doppler/velocity |
| VGPI | Velocity Gate Pull-In | Doppler/velocity |
| RVGPO/RVGPI | Range-Velocity Gate Pull-Off/In | Combined |
| DFTJ | Dense False Target Jamming | Multiple false targets |
| ISFJ / ISRJ | Intermittent Sampling (and Repeat) Forwarding Jamming | Time-domain |

### Cross-eye jamming — confirmed OUT OF SCOPE, stated explicitly
Cross-eye jamming is a **fundamentally different attack surface** from RGPO/VGPO-style single-source DRFM:
- Requires **two physically separated transmit sources** working together, manipulating phase/amplitude relationships to distort a monopulse radar's own **internal angle-computation** — not a replayed/fabricated target the fusion layer can cross-check against another radar's report.
- The system's multi-radar fusion cross-checking (built to catch single-source DRFM fakes) does **not** automatically catch this, because there's no fabricated shared "target location" to compare — the deception happens inside one radar's own receive-channel geometry.
- **Possible extension (not required for v1, requires large radar geographic baseline to work)**: each radar reports its own raw angle-of-arrival estimate (not just its final target conclusion); fusion layer triangulates these independent rays. A genuine target's rays converge consistently; a cross-eye-deceived radar's ray likely won't. **Reuses the existing angle-FIM value** (already one of the four FIM parameters — range/velocity/angle/amplitude) as the fusion layer's confidence-weighted tolerance for what counts as a meaningful ray mismatch — extending an existing component's *use*, not adding a new parameter.
- **Explicitly state as a limitation in the proposal**: "This system defends against single-source DRFM range/velocity deception; cross-eye jamming, requiring coordinated dual-source angle attacks, is out of scope" (or, if pursued, requires the triangulation extension above, contingent on radar geographic separation).

---

## 15. Literature Cross-Check — Final Status of Each Contribution Claim (as of this session)

A second and third search pass was run specifically to stress-test each proposed contribution. Full paper list below; verdicts first.

### Verdict summary
| Contribution | Status | Notes |
|---|---|---|
| CTDE for multi-radar anti-jamming | **NOT novel — established** | Multiple 2023–2026 papers already do this (see list). Reframe as "we adopt established CTDE" not "we propose CTDE." |
| PRI jitter as anti-DRFM technique | **NOT novel — classical ECCM** | Decades-old radar technique, not original to this proposal. |
| Dec-POSMDP as the formal problem framing | **Likely still open** | The term exists (robotics/multi-agent planning literature — Omidshafiei et al.) but no evidence found of it being applied to radar/jamming specifically. Being first to formally frame this problem this way is a legitimate, citable framing contribution even though the components aren't new individually. |
| MMPP applied to radar/jamming specifically | **Held up — strongest single gap claim** | Zero hits across three independent search passes. MMPP is used extensively elsewhere (network traffic, queueing, ecology) but not found in radar-jamming literature. |
| Predicted-vs-actual FIM as anomaly/reward signal | **Held up against direct checks** | Checked against 2 specific 2026 multi-radar fusion papers (Tao et al. GCI-based fusion; an attention+LSTM uncertainty-weighted fusion paper) — neither does this comparison. Both use SNR/Doppler or *learned* (black-box) uncertainty, not physics-derived FIM/CRLB, and both target general tracking accuracy, not deception detection. Real differentiator: physics-grounded, interpretable uncertainty (FIM/CRLB) vs. learned/black-box uncertainty, applied specifically to deception detection vs. general tracking accuracy. |
| FIM-based cost functions in cognitive radar generally | **Correction — real adjacent prior art exists** | Mitchell et al. (2018) reportedly uses FIM-based cost functions in cognitive multi-function radar (cited in a 2025 ScienceDirect IRL paper). **Must read this paper in full before finalizing any FIM-as-reward novelty claim** — not yet done. |
| Multi-radar FIM-weighted fusion specifically for DRFM detection (the actual combined system contribution) | **Held up as the strongest integration claim** | The *specific combination* — independently-jittered radars, fused via FIM-weighted ray/measurement consistency checking, explicitly for deception detection — was not found assembled this way anywhere searched. Best framed as a systems/integration contribution (legitimate, common category), not a new-algorithm claim. |

### Full paper list found (all searches, this session)
**MBRL for anti-jamming:**
- "Knowledge-Aided Model-Based Reinforcement Learning for Anti-Jamming Strategy Learning" — Li, Liu, Jiu, Pu, Peng, Yan, IEEE TAES (2024) — parameterizes known jamming strategies as prior knowledge via neural nets (differs from this proposal's MMPP generative approach)
- "From Simulation to Semi-Physical Validation: An Intelligent Jammer-Assisted Radar Anti-Jamming Evolution Method" — Feng Xie et al., Sensors (2026) — AlphaZero/MCTS-based

**POMDP + CTDE for radar (directly overlapping with Contribution 1's individual components):**
- "Reinforcement Learning-based Anti-Jamming Strategy for Self-Defense Jammer-Aided Radar Systems" (2024) — explicit CTDE for radar collaboration
- "Improving anti-jamming decision-making strategies for cognitive radar via multi-agent deep reinforcement learning" — Jiang, Ren & Wang, ScienceDirect (2023) — POMDP + CTDE + DDPG
- "Coordinated Anti-Jamming Resilience in Swarm Networks via Multi-Agent Reinforcement Learning" (2026) — QMIX, formal CTDE guarantees
- "Joint Optimization of Jamming Type Selection and Power Control for Countering Multifunction Radar..." — Dec-POMDP + CTDE + MAPPO (jammer's side)
- "A cooperative jamming decision-making method based on multi-agent reinforcement learning" (MA-CJD) — Springer (2025) — QMix, jammer's side

**POMDP framing (non-CTDE):**
- "Airborne Radar Anti-Jamming Waveform Design Based on Deep Reinforcement Learning" — Zheng, Li & Zou, Sensors (2022) — MDP-based, D3QN
- "A Radar Anti-jamming Method under Multi-jamming Scenarios Based on Deep Reinforcement Learning in Complex Domains" — Feng Xie et al. (2023) — reward = SNR + track integrity, not FIM
- "Waveform Selection Method of Cognitive Radar Target Tracking Based on Reinforcement Learning" — CBO/ERQL methods

**FIM/CRLB-related:**
- "Information theory and radar waveform design" — mutual-information-based RL reward via multi-agent Q-network (close cousin of FIM-as-reward)
- "Fisher Information Approach for Masking the Sensing Plan: Applications in Multifunction Radars" — arXiv (2024) — FIM used adversarially, not in RL loop
- "Deep multi-intentional inverse reinforcement learning for cognitive multi-function radar inverse cognition" — ScienceDirect (2025) — cites **Mitchell et al. 2018** for FIM-based cost functions — MUST READ before finalizing FIM claim
- "Reinforcement Learning based Waveform Design for Cognitive Imaging Radar" — IEEE — notably already uses GRUs, architecturally close to this proposal's belief estimator, worth reading closely

**Multi-radar fusion (checked directly against the FIM predicted-vs-actual claim):**
- "Multi-Radar Distributed Fusion Algorithm Aided by Multi-Feature Information" — Tao, Lu, Tan, Li, Gao, Jiang, Appl. Sci. 2026, 16(7), 3159 — GCI-based fusion using Doppler/SNR features, general tracking accuracy, no jamming/FIM. **Useful as a citable fusion-mechanism foundation to build the FIM-weighted extension on top of.**
- Untitled/uncited paper (abstract only, title not captured) — end-to-end deep learning track fusion, attention+LSTM, "uncertainty weighting mechanism" for dynamic fusion-weight adjustment — confirmed this is *learned* uncertainty, not FIM/CRLB, and targets tracking-accuracy MAE, not deception detection. **Get full citation if this needs to be formally referenced later.**

**Alternative paradigms (related work, not direct competitors):**
- "Radar Anti-jamming Strategy Learning via Domain-knowledge Enhanced Online Convex Optimization" — arXiv 2402.16274
- "Learning an Opponent-aware Anti-jamming Strategy via Online Convex Optimization" — arXiv
- "Research on Efficient Reinforcement Learning for Adaptive Frequency-Agility Radar" — PMC — Markov Game framing

**DRFM/deception mechanics (background/reference):**
- "Advances in Anti-Deception Jamming Strategies for Radar Systems: A Survey" — arXiv (2025) — comprehensive RGPO/VGPO survey, good single source for background section
- "Anti-jamming radar waveform design for repeater jammer using reinforcement learning" — ScienceDirect (2024) — RL specifically against repeater/DRFM-style jammers
- Various US patents (US9069066B2, US20140354464A1) — RGPO/VGPO mechanism reference

**Dec-POSMDP background (not radar-specific, foundational terminology source):**
- "Decentralized Control of Partially Observable Markov Decision Processes using Belief Space Macro-actions" — Omidshafiei, Agha-mohammadi, Amato, How — introduces Dec-POSMDP for multi-robot planning
- "Continuous-Observation Partially Observable Semi-Markov Decision Processes for Machine Maintenance" — IEEE — POSMDP applied to maintenance scheduling
- "Optimal Control of Partially Observable Semi-Markovian Failing Systems" — Operations Research journal — POSMDP formalization

### Self-verification search queries (for running directly on Google Scholar / IEEE Xplore — more complete indexes than general web search)
Core combination: `DRFM detection multi-radar fusion PRI jitter` · `radar waveform diversity DRFM cross-radar triangulation detection` · `netted radar anti-DRFM waveform agility fusion` · `pulse repetition interval agility jammer detection multi-radar`

Dec-POSMDP framing: `"Dec-POSMDP" radar` · `"Dec-POSMDP" jamming OR anti-jamming` · `decentralized partially observable semi-Markov radar` · `semi-Markov decision process radar anti-jamming`

FIM/reward mechanism: `Fisher information reward reinforcement learning anti-jamming` · `Mitchell 2018 Fisher information cost function cognitive radar` · `CRLB anomaly detection zero-day jamming` · `predicted vs actual Fisher information radar detection`

MMPP gap re-check: `"Markov-modulated Poisson process" radar jamming` · `MMPP electronic warfare radar`

Broader/citation coverage: `cross-eye jamming multi-radar triangulation defense` · `angle deception detection netted radar geometry` · `radar network DRFM false target detection`

**Practical tip**: use Google Scholar's "Since 2024" filter (field moves fast); IEEE Xplore direct search catches paywalled papers general web search won't surface — this is the real gap between what this conversation could check and what a full literature review (ideally with university library access) requires.

---

## 16. VAML (Value-Aware Model Learning) — a refinement for how the world model itself is trained

**Source**: Farahmand, Barreto & Nikovski (2017), with an "Iterative VAML" follow-up (Farahmand, 2018). A real, established MBRL concept — not specific to radar, but directly applicable to this project's world model.

**Core idea**: standard world-model training optimizes the model to predict the environment accurately *everywhere* (maximum-likelihood reconstruction of every observation detail). VAML argues this is the wrong target — what actually matters is whether the model is accurate specifically **where it affects the decision/value the policy cares about**. A model can be slightly wrong about many irrelevant details and still yield great decisions, or be accurate on paper and still mislead the policy if its errors happen to fall exactly where reward/value is sensitive.

**Application to this project**: the GRU-based CTMC/MMPP world model doesn't need to perfectly reconstruct every nuance of jammer behavior. What matters is that it's accurate specifically where it affects **predicted FIM**, since that's what feeds the reward. A VAML-style training objective — optimizing the GRU to be accurate on "does this affect my FIM prediction" rather than "does this match the raw observation everywhere" — is a more targeted, sample-efficient training approach, and a legitimate, citable refinement for the methodology section (training loss = value-aware, not pure maximum-likelihood reconstruction).

---

## 17. Future Extension: Multi-Device / Multi-Jammer Scenarios

A real, significant extension beyond the current scope (v1: single radar/single jammer; the multi-radar/CTDE design so far: multiple radars, still **one** jammer). Explicitly scoped here as future work, not part of the current architecture — attempting to build this into v1 or v2 would meaningfully slow down getting the core, defensible contributions working and published first.

**What changes with multiple simultaneous jammers:**

1. **World model needs multiple simultaneous processes, not one.** Either N independent CTMC-MMPP processes running in parallel (one per jammer), or a single joint state space covering all combinations — which grows expensive quickly (combinatorial state growth).

2. **The GRU's single hidden state isn't naturally built for tracking multiple separate things at once.** A single compressed state vector suits "what is the one jammer doing." Tracking several jammers simultaneously is closer to a **multi-target tracking problem**. This is exactly where the Tao et al. fusion paper (Section 15) becomes directly relevant again — it uses **LMB (Labeled Multi-Bernoulli)**, a framework specifically built for tracking an uncertain, changing number of targets. Combining the GRU belief-estimator idea with an LMB-style multi-object structure is the natural extension path.

3. **FIM/SINR computation needs to account for combined interference.** With multiple jammers, the interference term in the FIM formula becomes an aggregate — the combined effect of all active jammers on the receiver, not one clean source (sum of interference powers, weighted by each jammer's frequency/geometric overlap with the chosen waveform).

4. **The fusion/triangulation layer needs data association.** With one jammer, "which ray belongs to which fake target" isn't a question. With multiple jammers, the fusion layer must first determine which radar's report corresponds to which jammer before it can check consistency — a classic, nontrivial multi-target association problem (again, LMB-adjacent).

**Recommended sequencing**: v1 (single radar, single jammer) → v2 (multi-radar CTDE + fusion, still single jammer — the scope this conversation has designed in depth) → v3 (multi-jammer, LMB-extended). Naming this explicitly as planned future work in the proposal signals forward thinking without overcommitting the initial contribution scope.

---

## Open items / next steps
- [ ] Pull full text of the two closest papers (2026 knowledge-aided MBRL; May-2026 DMC-PPG POMDP) before locking the final contribution claim
- [ ] Define exact v1 scope (single radar, single jammer, FIM-as-reward only) as a precise spec
- [ ] Decide target publication venue/deadline
- [ ] If proceeding to code: consider scoping a v1 module structure for Claude Code
- [ ] Decide CTDE update cadence (how often pooled training updates get pushed to each radar's policy) once multi-radar scope is reached
- [ ] **Read Mitchell et al. 2018 in full** (FIM-based cost functions, cognitive multi-function radar) — the single most important unresolved check before finalizing the FIM-as-reward/anomaly-signal contribution claim
- [ ] Get the full title/citation for the second fusion paper checked this session (attention+LSTM, "uncertainty weighting mechanism," MAE comparison vs. Kalman filter) — currently only have the abstract on record
- [ ] Run the self-verification search query list (Section 15) directly on Google Scholar and IEEE Xplore, ideally with university library access, to catch paywalled papers this conversation's web search couldn't reach
- [ ] Confirm with professor whether "Dec-POSMDP" has prior art specifically in radar/EW (open web search found none, but this is exactly the kind of claim that needs an expert or closed-database check, not just search)
- [ ] Once v1 code exists: design the specific held-out/unseen-jamming-mode experiment needed to empirically demonstrate the zero-day/anomaly-detection claim (currently an architectural argument, not yet a demonstrated result)
- [ ] If adopting VAML-style training: define the exact value-aware loss function for the GRU world model (Farahmand 2017/2018 as the starting reference)
- [ ] Multi-jammer extension (v3, future work): investigate combining the GRU belief estimator with an LMB (Labeled Multi-Bernoulli) multi-target framework, per Tao et al. 2026
