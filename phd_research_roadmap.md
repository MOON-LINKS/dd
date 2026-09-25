# PhD Research Roadmap — Agentic, Federated, Zero-Day-Aware IoT Security

**Baseline:** RAIDEN (Paper 0, completed, not yet submitted) — a defensive agent for IoT networks using MMPP as the traffic modeler and a GRU to predict and detect malware spread attacks.

**Overall throughline:** An agentic, federated, zero-day-aware AI framework for autonomous IoT security — evolving RAIDEN from single-network detection into a belief-driven, fleet-scale, self-explaining defense system.

---

## Main Path — 3 Papers

### Paper 1: Zero-Day-Aware MBRL/POMDP/PPO Defense Agent
**Core idea:** Replace RAIDEN's plain detect step with a single coherent decision pipeline: a GRU acts as the world-model inside a Model-Based RL (MBRL) loop, a POMDP formalizes the fact the agent never fully observes true network state (only partial signals like traffic stats), and PPO (instead of DQN) updates the policy in a more stable way. A zero-day/anomaly-detection layer (deviation-from-normal, not pattern-matching) feeds the POMDP's belief update directly — this is what makes it one paper, not two ideas glued together.

- **Example:** Device A's traffic doesn't match any known attack signature. The anomaly detector flags "unknown pattern, 70% confidence something's wrong" → the POMDP updates its belief ("probably compromised, not certain") → PPO decides "throttle, don't fully isolate yet, confidence too low."
- **Why it's one paper, not two:** detection output *is* the POMDP's observation input — there's a real dependency, not a forced pairing.
- **Status:** Strongest, most natural evolution of RAIDEN. Core technical asset of the whole thesis.

### Paper 2: Federated / CTDE Fleet-Scaling of the Paper 1 Agent
**Core idea:** Not generic cross-network federated learning — scoped to one IoT vendor's device fleet (e.g., one company's smart locks/cameras), where every device already talks to the same central servers and pushes updates back. This is closer to **CTDE (Centralized Training, Decentralized Execution)** than classic federated learning: a central point sees more during training, but each device acts independently at runtime.

- **Example:** 500 smart locks from the same vendor each run the Paper 1 agent locally. They all contribute to one shared global model, so a new attack pattern seen on 3 devices in one region gets learned by all 500 devices worldwide within hours — without any raw traffic leaving anyone's home.
- **Status:** Solid, self-contained scaling paper.
- ⚠️ **Read before finalizing:** Amamou et al., *"Agentic AI-Based Multi-agent System for IoT Cyberattack Detection"* (AINA 2026) — proposes a cooperative multi-agent system merging federated learning (FedProx), a GRU, and Agentic AI for decentralized IoT anomaly detection and proactive response while preserving privacy. This overlaps component-for-component with Papers 1+2 combined. Not fatal, but you need a clear, explicit differentiator ready (POMDP/MBRL depth, PPO stability, CTDE fleet framing) before a defense or submission.

### Paper 3: Twin-in-the-Loop Training + Interpretable Belief States (XAI)
**Core idea:** A digital twin isn't just a validation tool (that would be too thin alone) — push it into *training itself* (twin-in-the-loop RL), and pair it with genuine interpretability of the POMDP/GRU internal belief states (not just "SYN flood from device A/B/C, 200% traffic" — that's a detection report, not explainability). The pairing works because both naturally happen in the same sandbox: testing a decision safely and explaining why it was reached.

- **Example:** Before quarantining 40 devices for real, the agent tests it in the twin first. While running in the twin, the system extracts *"the POMDP's belief shifted because predicted vs. observed traffic diverged by X%, and these 3 devices' patterns triggered it."* Testing and explaining, same sandbox, same paper.
- **Applied deliverable:** A scoped-down, reusable twin/simulation "builder" prototype (not a generic MATLAB-style product) can live here as a demo artifact tied to this paper — not as a standalone product, which would be scope creep for a PhD.
- **Status:** Agreed as part of the main 3, but the **weakest of the three** by your own assessment — good candidate to push down in priority relative to backups if needed.
- ⚠️ **Read before finalizing:** *IDS-agent* — an LLM agent for explainable intrusion detection in IoT networks (OpenReview, 2025). This already stakes out the "LLM-narrated IDS explanation" space. Your differentiator needs to be explaining *belief-state dynamics* specifically, not just LLM-narrated alerts.

---

## Backup Ideas (in case a main paper is rejected/contested)

Ranked roughly by strength/fit, based on live 2026 research landscape.

### Backup A — Multi-Agent RL (MARL) for Coordinated Cross-Device Defense ⭐ (strongest backup)
Multiple agents coordinate responses in real time — one device's belief update informs a neighbor's decision *during* an ongoing attack, not just via shared model weights (that's Paper 2). This is a well-populated, active research line, and PPO has been specifically shown to be effective in cooperative multi-agent games, giving a citable bridge from your single-agent Paper 1 work.

- **Example:** Devices A, B, C each independently suspect something's off but aren't individually confident enough to act. They share belief states in real time and reach a joint decision — "collectively 90% sure, act now" — instead of each dithering alone at 40%.
- **Why it's stronger than Paper 3:** it's a direct methodological extension of your strongest asset (Paper 1's POMDP/PPO core), not a bolted-on tool.

### Backup B — LLM-Empowered Cloud-Edge Detection for Heterogeneous IoT Traffic
An LLM-based orchestration layer sits between edge devices and cloud, routing different device types' traffic to specialized detectors instead of forcing one model to learn all traffic types. Distinct 2026 work exists here (cloud-edge LLM collaboration for heterogeneous IoT DDoS detection), making this a genuinely separate angle rather than a variant of your core idea.

- **Example:** A smart lock and a smart camera produce very different "normal" traffic. An LLM-based dispatcher recognizes device type and routes each to a specialized detector, then merges verdicts.
- **Value:** True fallback — doesn't overlap with anything else in your stack, in case Backup A also gets contested.

### Backup C — Labeled Multi-Bernoulli (LMB) Filter for Multi-Device Tracking ⭐ (plays to your radar background)
LMB comes from radar/multi-target tracking (Random Finite Set theory): it tracks an **unknown, time-varying number of targets**, each with a persistent label, as targets appear (birth), disappear (death), and get confused with clutter (false alarms). Maps almost directly onto IoT: instead of one hidden "network health" state, you have an unknown, changing number of *individually compromised devices* at any time.

- **Example:** Device A gets compromised (birth), device B recovers or drops off the network (death), some flagged anomalies are just noise, not real attacks (clutter). An LMB layer above your GRU/POMDP detectors tracks each suspected-compromised device individually with its own existence probability, rather than one blob of "network health."
- **Bonus:** Distributed/multi-sensor LMB (label matching across independent local filters) already exists in the tracking literature and maps closely onto your federated/CTDE fleet setting — a more rigorous version of Backup A.
- **Caveat:** Mathematically heavier (RFS/Bayes recursion) than POMDP/PPO — plays to your radar background but needs careful scoping as its own paper, not a bolt-on.

### Backup D — Adversarial Robustness of the RL/POMDP Defense Agent Itself
Your PPO/POMDP agent is itself a machine learning model, and ML models can be attacked: training-time poisoning (corrupting the agent's experience so it learns the wrong policy), backdoor attacks (a hidden trigger that misfires the agent on cue), and adversarial RL specifically studied under partial observability in autonomous network defense — which lines up directly with your POMDP framing.

- **Example:** An attacker can't beat your detector head-on, so instead they slowly feed it corrupted "normal" traffic during training so it later ignores their real attack when it happens. A robust version of Paper 1 needs to resist exactly this.
- **Value:** A meta-level contribution — "is your own defense agent trustworthy?" — genuinely different framing from detection/coordination papers.

### Backup E — Graph Neural Networks for Topology-Aware Botnet Detection (weaker alone — crowded field)
GNNs model device communication as a graph to capture botnet coordination patterns instead of treating each device as isolated. Technically sound and still active in 2026 (including newer quantum-GNN hybrids), but this is a **crowded, heavily-published area** already — harder to carve out a clearly novel angle as a standalone contribution.

- **Example:** A single compromised smart plug talking a bit more than usual looks fine in isolation. But drawn as a graph, if that plug suddenly connects to 50 other plugs across different homes it's never talked to before — a classic centralized botnet fan-out — a GNN catches that structural signature even when no single device's traffic volume looks abnormal.
- **Not recommended as a standalone paper**, but see the fusion note below — it may have more value as a *component* feeding Backup C than as its own contribution.

---

## Note: How GRU, GNN, and LMB Relate (not competitors — different axes)

These three model families answer different questions and can, in principle, be stacked into one pipeline rather than chosen between:

| | GRU (Paper 1's core) | GNN (Backup E) | LMB (Backup C) |
|---|---|---|---|
| **Axis reasoned over** | Time (one device's sequence) | Structure (who's connected to whom, one snapshot) | Time, across *many* objects of unknown/changing count |
| **Answers** | "How did this device's traffic change over time?" | "Who is this device newly/unusually connected to right now?" | "How many devices are compromised right now, which ones, and how confident am I in each?" |
| **Blind to** | Relationships between devices | How a device's behavior evolves over time | Structural relationships (it only tracks confidence/identity over time) |

**Possible fusion pipeline (an upgraded, more ambitious version of Backup C):**
1. GNN scans the network's connection graph at each timestep and produces a structural suspicion score per device (e.g., "this device just fanned out to 50 new peers").
2. That score becomes the *measurement* LMB consumes at each timestep — like a radar's raw detections feeding a tracking filter.
3. LMB decides whether the reading is a **new** compromised device (birth → new track), a **continuation** of a device already under suspicion (update existing track, raise confidence), or **noise** (clutter → discard) — maintaining a labeled, confidence-weighted track per device over time.
4. The GRU/POMDP core (Paper 1) still runs its own per-device temporal analysis in parallel, feeding its own signal into the same belief system.

- **Example:** At timestep 50 the GNN flags Device A's connection pattern as suspicious. LMB checks: is this consistent with a track already building on Device A since timestep 40 (reinforce it), or the first time A has looked odd (open a new low-confidence track), or a one-off blip matching nothing (treat as clutter)? Meanwhile Device B, suspicious for the last 10 timesteps, goes quiet — LMB lowers its existence probability gradually rather than deleting the track outright (it may just be idle, not cleaned).
- **Trade-off:** this three-signal fusion (temporal + structural + multi-object tracking) is a richer, more novel version of Backup C, but it's also a bigger, higher-risk paper — three model families to integrate and justify rather than one. Worth keeping as a stretch upgrade to Backup C rather than the default scope.

---

## Potential New Ideas (under active consideration, not yet slotted into main/backup)

### Idea F — Self-Play Attacker/Defender Co-Evolution Inside the Digital Twin (Adversarial MMPP Parameter Search)
**Core idea:** Instead of training the defender only against fixed/historical attack data, run two RL agents inside the twin: Agent 1 (attacker) learns to perturb MMPP transition/arrival-rate parameters to evade detection while continuing to spread; Agent 2 (defender) is the existing Paper 1 POMDP/PPO agent trying to catch it. As the defender adapts, the attacker is forced to find genuinely new evasive parameter regions — manufacturing synthetic "zero-day-like" attacks rather than relying on a fixed dataset of known ones.

- **Why it's grounded, not generic:** the attacker's action space is *MMPP parameter perturbation*, not an arbitrary traffic generator — this ties the idea directly to RAIDEN's own core model rather than bolting on an unrelated simulator.
- **Direct fix for the dataset-trust problem:** the attacker's allowed parameter ranges should be calibrated against real, published IoT traffic/attack datasets (e.g., CIC-IoT-2023, Bot-IoT, N-BaIoT — which contains real Mirai captures), so what it discovers is a realistic-but-unexplored region of a real, bounded parameter space — not invented data. This directly addresses why the earlier MMPP dataset was rejected as untrusted.
- **Existing tooling/precedent (but not IoT-specific):** CyberBattleSim and NASim already support RL-trained attacker/defender pairs; MARLon extends CyberBattleSim with a *trainable* (not just scripted) defender. A 2025 paper trains offensive/defensive agents via DQN in a simulated zero-sum network environment, explicitly studying attacker-defender co-evolution. Self-play attacker/defender co-evolution is also active in LLM safety alignment (2026 papers show the attacker is forced to innovate as the defender improves, producing measurably more novel, diverse attacks than static red-teaming).
- **The real gap:** none of the above is IoT-specific, flow/traffic-level (they're host/exploit-chain focused), or uses POMDP/MBRL depth on the defender side. Nobody has combined self-play co-evolution with an MMPP-grounded IoT traffic model and a digital twin.
- **Real output/deliverable:** not "the defender beat the self-play attacker" (that would be circular and repeat the earlier rejection). The output is a **catalog of discovered evasive MMPP parameter regions** — an empirically-derived weakness map of your own detector — plus a defender hardened by training partly on this discovered space.
- **Validation story (non-negotiable given prior rejection):** final evaluation must be against real, held-out, published attack data the defender never trained on (e.g., a real Mirai/Bashlite variant) — self-play is framed as a *training-augmentation* method, not the proof itself.
- **Known instability risk:** two-agent co-training is prone to collapse/oscillation (cited work flags reward shaping and training scheduling as critical). Mitigations: curriculum start (anchor the attacker near real historical attack parameters before letting it drift/explore further) and league/population-based training (keep a pool of past attacker checkpoints so the defender doesn't overfit to only the latest attacker — the technique that stabilized AlphaStar-style self-play).
- **Where it fits:** would most naturally replace/absorb Paper 3 (twin-in-the-loop), since it needs the same twin infrastructure but gives it a sharper, more novel purpose than "test before deploying."
- **Weaknesses:**
  1. Simulation-trust risk is the central one — same category of objection that sank the earlier MMPP dataset; the calibration-to-real-data step above is what must hold up, not an afterthought.
  2. Training instability is a real, non-trivial research risk on its own (this is also its strength — a genuine, hard, citable PhD-level problem, not a minor engineering detail).
  3. Evaluating whether a self-play-discovered "zero-day" is realistic (vs. an artifact of the game) is philosophically tricky and needs a clear methodology, not just "trust the process."
  4. Adds a third major technical pillar (game-theoretic self-play) on top of MBRL/POMDP/PPO and the twin — meaningfully increases scope/risk versus the original Paper 3.

---

### Idea G — LLM-Personified Threat-Actor Simulation (alternative/complementary fix for the trust problem)
**Core idea:** Instead of (or alongside) calibrating the attacker's MMPP parameter ranges purely from datasets (Idea F), use an LLM to translate qualitative, documented threat-actor personas (e.g., MITRE ATT&CK-style descriptions of real Mirai/Bashlite operator behavior — "a stealthy, patient attacker" vs. "a loud, fast-spreading botnet") into quantitative reward functions for training the attacker agent.

- **Why this matters for the trust problem specifically:** it gives a second, complementary defense against "how do we know this is realistic" — the attacker isn't discovering random evasion via blind RL exploration, it's being pushed toward behaviors grounded in real, documented attacker doctrine, translated by an LLM rather than invented as a simulation from scratch.
- **Precedent:** recent work (LLM-based reward design for DRL-driven autonomous cyber defense) shows a defender trained against an ensemble of LLM-generated attacker personas becomes robust across a broader range of realistic tactics than any single baseline model.
- **Relationship to Idea F:** not a replacement — could be combined (persona-guided reward shaping + MMPP-parameter-bounded action space) so the attacker is both mathematically grounded in RAIDEN's own model *and* behaviorally grounded in real threat-actor doctrine.
- **Weaknesses:**
  1. Adds LLM-reliability as a new dependency — the quality of the "translation" from persona to reward function is itself unvalidated and would need its own justification/evaluation.
  2. Harder to cleanly attribute credit in a paper: is the contribution the LLM-persona-to-reward pipeline, or the resulting hardened defender? Needs a clear framing before writing.

### Idea H — Optimal Stopping Theory Framing (a different mathematical lens, not RL-based)
**Core idea:** Frame the defense decision not as RL action selection, but as a classical **optimal stopping problem**: at every timestep, decide whether to keep watching (gather more evidence) or stop and intervene now, balancing the cost of waiting too long against the cost of a false alarm.

- **Why it's a genuinely different angle:** the rest of the stack (Papers 1–3, Idea F) is entirely RL-flavored (PPO, MBRL). Optimal stopping is classical sequential-decision theory that sits naturally on top of the existing POMDP belief state (the belief IS the accumulating evidence), but draws on a different toolkit (stopping-time theory, threshold policies) with strong theoretical guarantees.
- **Value:** a good complement if a committee pushes back on "just another deep RL paper" and wants to see theoretical rigor rather than only empirical performance.
- **Precedent:** existing work frames cyber defense as game-theoretic optimal stopping problems.
- **Weaknesses:**
  1. Classical stopping-time theory typically assumes simpler/cleaner state spaces than a full POMDP belief over complex traffic patterns — the theoretical guarantees may not survive the added complexity without real mathematical work.
  2. Positioning risk: could read as a step back in technical sophistication relative to the MBRL/POMDP/PPO core unless the theoretical contribution (e.g., proving a threshold policy is optimal under the POMDP belief dynamics) is made the explicit selling point.

### Supporting / Further Reading for Ideas F–H
- Czempin, P. & Gleave, A. — *"Reducing Exploitability with Population Based Training"* — evidence that self-play agents can look strong against regular opponents but fail catastrophically against an adversary trained specifically to exploit them, due to insufficient training-adversary diversity; motivates the league/population approach for Idea F.
- *CybORG* (Cyber Operations Research Gym, IJCAI 2021, cage-challenge) and *PoolFlip* (2026, multi-agent RL security environment) — additional tooling precedent alongside CyberBattleSim/NASim/MARLon, worth checking for adaptability before building a twin-integration from scratch.
- Li, K., Jiu, B., Pu, W., Liu, H., & Peng, X. — *"Neural fictitious self-play for radar anti-jamming dynamic game with imperfect information"*, IEEE Trans. Aerospace and Electronic Systems — direct precedent from the radar/EW domain applying self-play to an adversarial, partially-observable sensing problem; may offer a ready-made mathematical framework for Idea F rather than building the game-theoretic machinery from scratch.
- Chatterjee, S. et al. — work on LLM-based reward design translating qualitative attacker personas into quantitative reward functions for DRL-driven autonomous cyber defense — direct precedent for Idea G.

---

## Summary of Known Weaknesses / Risks

1. **Paper 2 vs. AINA 2026 (Amamou et al.):** near-identical component mix (FedProx + GRU + Agentic AI for decentralized IoT detection). Needs explicit differentiation before submission.
2. **Paper 3 vs. IDS-agent (OpenReview 2025):** LLM-based explainable IDS for IoT already exists. Your angle must center on belief-state interpretability specifically, not generic LLM-narrated alerts.
3. **Paper 3 is the weakest of the main three** by your own assessment — good candidate for de-prioritization if a stronger backup (A or C) needs to be promoted.
4. **The "generic twin builder" idea (topology-agnostic, reusable across any server/company type) is too broad for a PhD contribution on its own** — real difficulty lives in topology ingestion, synthetic traffic generation, and generalizing across very different device profiles. Recommended: scope it narrowly to your own experimental setting inside Paper 3, and treat a general-purpose tool as a possible side-artifact/appendix release after the core research, not a prerequisite.
5. **Backup C (LMB) is mathematically heavier** than the rest of the stack — a real strength given your radar background, but needs its own dedicated scoping rather than being folded into an existing paper.

## Required Reading Before Finalizing

- Amamou, R., Ktata, F. B., & Bessaad, F. — *"Agentic AI-Based Multi-agent System for IoT Cyberattack Detection"*, AINA 2026 (Springer LNDECT vol. 301).
- Li, Y., Xiang, Z., Bastian, N. D., Song, D., & Li, B. — *"IDS-agent: An LLM Agent for Explainable Intrusion Detection in IoT Networks"*, 2025 (OpenReview).
