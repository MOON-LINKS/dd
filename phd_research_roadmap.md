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

---
---

# UPDATE — 28 Sep 2026 (new sections only; everything above is unchanged)

---

## Proposed PhD Title

**Toward Autonomous, Zero-Day-Aware IoT Security: Belief-Driven Reinforcement Learning from Single Networks to Federated Fleets**

**Why this title (Title 2 of three considered):**
- Compact, and works with either version of Paper 3 (twin + XAI, or Idea F self-play), so that slot can stay open.
- "Autonomous" and "belief-driven" are used instead of "agentic" in the title, because "agentic" now collides with the LLM-agent literature (including Amamou et al.). Reserve "agentic" for framing text.
- "From Single Networks to Federated Fleets" maps directly onto Paper 1 (single network) and Paper 2 (fleet).

**Thesis story (one sentence):**
> This thesis develops an autonomous defense agent for IoT networks that treats zero-day detection as inference under partial observability, and then scales that agent across a vendor's device fleet without centralizing raw traffic.

**Terms to define precisely (committee-proofing):**
- **"Detecting" undersells the work.** Detection is what RAIDEN already did. The contribution is *believe and act*: the agent holds a belief about unseen threats, including zero-days, and takes graded responses.
- **"Self-learning"** = policy improvement from interaction (PPO) plus fleet-level knowledge sharing (Paper 2). It does not mean fully unsupervised. If Paper 3 becomes self-play (Idea F), it gains a third meaning: the agent finds its own blind spots.
- **"Private"** = raw traffic stays on-device. Federated learning alone does not guarantee privacy, since model updates can leak information. Either scope the claim to "raw data stays local" or plan secure aggregation / differential privacy as a bounded add-on.

**Thesis arc:** Believe (Paper 1) -> Scale (Paper 2) -> Harden (Paper 3, open).

---

## Novelty Check: Prior Work on Zero-Day / Novelty Beliefs (first pass, not a systematic review)

**Headline:** the individual pieces exist, but no single paper found combines (1) a belief over hidden states, (2) novelty as an explicit hidden state or calibrated observation, and (3) graded actions, in IoT. This rests on absence of evidence; verify with the search protocol below before wording the Paper 1 contribution.

**Closest neighbours:**
- **POMDP + PPO for intrusion response.** Hammar & Stadler's group formalizes OT intrusion response as a POMDP with PPO solvers (k-Obs-PPO and BF-PPO, the latter using an approximate belief). Closest methodological precedent to Paper 1. OT setting, no zero-day layer.
- **POMDP + PPO, adjacent settings.** DeepStage (multi-stage APT defense, belief state, PPO); H-MARL on CAGE-4 (Dec-POMDP, hierarchical MARL; relevant to Backup A).
- **PPO + zero-day + IoT.** A recent cross-dataset zero-day IDS combines unsupervised anomaly detection, Siamese similarity and a PPO adaptive-defense policy (reported 2.21% false-positive rate). Main threat to a "zero-day + PPO" claim, but it has no belief state.
- **Anomaly-guided RL.** DeepEdgeIDS (label-free autoencoder DQN at IoT edge gateways); DQN-IDS (softmax uncertainty features + RL for open-set detection; novelty is a feature, not a state); CyDER 2.0 (RL + anomaly detection, defender's problem framed as a POMDP).
- **Federated + zero-day.** IDAC (federated sharing of autonomously labeled attack candidates); Jogunola et al. (federated zero-day botnet detection). Both federate detection, not a decision-making policy. Amamou et al. (AINA 2026) remains the main Paper 2 overlap.
- **Optimal stopping precedent (Idea H).** Stadler/Hammar's "Intrusion prevention through optimal stopping" (TNSM) already exists; seen as a reference only, needs a full read.

**Proposed differentiator:** novelty gets its own probability in the belief (an "unknown attack" latent state), and graded actions (throttle, then isolate) follow from it. Fed policies (Paper 2) share a belief-driven agent, not just a detector.

---

## Closest-Ten Comparison Table

"?" = only an abstract or snippet was seen; confirm from the full text before relying on the row.

| Paper | Belief / POMDP | Novelty modeled | PPO | Gap versus this thesis |
|---|---|---|---|---|
| Hammar & Stadler, OT intrusion response | Yes | No | Yes | Closest method to Paper 1; OT domain, no zero-day layer |
| Zhu et al., POMDP dynamic defense of large-scale networks | Yes | No | No | Classical online belief planning; older, not learning-based |
| DeepStage (APT defense) | Yes | No | Yes | Enterprise APTs, not IoT traffic |
| H-MARL on CAGE-4 | Yes | No | ? | Dec-POMDP hierarchical MARL; reference for Backup A |
| Siamese + PPO zero-day IDS | No | Yes (anomaly) | Yes | Main "zero-day + PPO" threat; no belief state |
| DeepEdgeIDS (Green DRL) | No | Yes (anomaly) | No (DQN) | Anomaly-guided DQN at IoT edge |
| DQN-IDS | No | Yes | No (DQN) | Uncertainty as a feature, not a state |
| CyDER 2.0 | Yes (framing) | ? | ? | Read full text: how do belief and novelty interact? |
| IDAC | No | Yes | No | Federates detection, not policy |
| Amamou et al., AINA 2026 | ? | ? | ? | From this roadmap; not re-verified; Paper 2 overlap |

**Open-set baselines to cite in evaluation:** MI2DAS (multi-layer IIoT IDS with open-set recognition and incremental learning); Jahangir et al., "An Adaptable Deep Learning-Based IDS to Zero-Day Attacks" (rejecting held-out labels as unknown).

**Read first:** Hammar & Stadler (OT), CyDER 2.0, DQN-IDS.

**Decision rule:** score each paper on (1) belief over hidden states, (2) explicit novelty state or calibrated novelty observation, (3) graded actions. All three = reframe the contribution. Two = differentiate on the third.

---

## Literature Search Protocol

**Concept blocks** (OR within a block, AND across blocks):
- **A, decision framework:** "POMDP", "partially observable", "belief state", "belief update", "Dec-POMDP"
- **B, learning method:** "reinforcement learning", "PPO", "model-based RL", "world model"
- **C, novelty:** "zero-day", "unknown attack", "novel attack", "open-set", "novelty detection", "out-of-distribution"
- **D, domain:** IoT, IIoT, "smart home", edge
- **E, fleet:** federated, CTDE, "centralized training decentralized execution", fleet

**Priority queries (most to least dangerous to the novelty claim):**
1. A AND C AND D (belief and novelty in IoT)
2. A AND B AND C (POMDP-RL with novelty, any domain)
3. C AND "hidden state" AND ("unknown class" OR "novelty state")
4. B AND C AND D AND E (Paper 2 overlap)
5. "Markov modulated Poisson" AND (botnet OR malware OR intrusion) (RAIDEN-specific)
6. ("GRU" OR "recurrent") AND ("world model" OR "model-based") AND "cyber defense"

**Sources:** IEEE Xplore, ACM DL, Scopus, arXiv, Semantic Scholar, Google Scholar. Venues to prioritize: NDSS (and its IoT workshops), IEEE TIFS, TNSM, IoT-J, Computers & Security, CAGE/CybORG literature. Weight 2025-2026 preprints heavily.

**Inclusion:** sequential decision-making or RL for defense under partial observability or uncertainty; explicit handling of unknown/novel attacks; network or traffic level.
**Exclusion:** pure supervised classifiers; LLM-narration-only work; host or exploit-chain simulators unless a POMDP is their core.

**Process:** title/abstract screen, then full text; snowball backward and forward from the closest ten; stop after two consecutive rounds with no new relevant papers; set citation alerts; re-run before every submission.

**Extraction fields:** belief/POMDP, novelty handling, RL algorithm, domain, fleet/federated, action granularity, zero-day evaluation method, datasets.

---

## Feasibility on CICIoT2023 and Design Constraints

**Verdict:** doable for Paper 1, with three things to plan for.

1. **Static data gives no closed loop.** Agent actions (throttle, isolate) do not change recorded traffic, so RL directly on a dataset degenerates toward a contextual bandit. The MMPP/twin must serve as the interactive environment. Datasets are used to *calibrate* the simulator and to *evaluate* on held-out real attacks, not as the training environment.
2. **Zero-day needs a protocol** (see next section).
3. **Malware spread is thinly represented.** CICIoT2023 is mostly DoS, DDoS, recon, spoofing and Mirai. Complement with Mirai/botnet-focused sources (N-BaIoT, IoT-23, Bot-IoT) for RAIDEN's spread dynamics.

**CICIoT2023 facts:** 105 devices, 33 attacks in 7 categories including Mirai, raw pcaps plus pre-extracted window features (47 features). 67 devices were directly involved in attacks; 38 Zigbee/Z-Wave devices sit behind 5 hubs, so it is **not** true 802.15.4 radio-layer data.

**For Paper 2:** per-device identifiers allow partitioning traffic by device to emulate a non-IID fleet. True fleet-scale behavior still needs simulation. Edge-IIoTset (built for centralized and federated learning) is a second option.

**Access-technology-agnostic design principle:** have the agent consume flow- and window-level statistics above the access layer (rates, inter-arrival times, fan-out), with the access technology as a context variable. This makes the agent portable across Wi-Fi, Zigbee (via hubs), 5G and later 6G by construction, and enables a cross-technology generalization experiment (train on Wi-Fi/IoT, test on 5G-NIDD).

---

## Dataset Map

"H2H" read as human-type traffic (phones, PCs) as opposed to M2M. Confirm this reading.

| Layer | Dataset | Notes |
|---|---|---|
| IoT, multi-device | CICIoT2023 | See above |
| | CIC IoT 2022 | ~60 devices across 802.11, Zigbee, Z-Wave |
| | CICIoMT2024 | 18 attacks on 40 medical IoT devices; Wi-Fi, MQTT, Bluetooth |
| | IoT-23, ToN_IoT, MQTT-IoT-IDS2020, X-IIoTID | Standard IoT/IIoT sets |
| | Edge-IIoTset | Built for centralized and federated learning; Paper 2 |
| | N-BaIoT, Bot-IoT | Mirai/Bashlite and botnet traffic |
| Wi-Fi (L2) | AWID2 / AWID3 | Wireless-specific attacks (deauth, disassociation) |
| Zigbee / 802.15.4 | ZBDS2023, ZigBeeNet, CRAWDAD cmu/zigbee-smarthome | Cited in the literature; size, labels and access terms NOT yet checked; labeled attack data is scarce |
| 5G | 5G-NIDD | 1,215,890 labeled flows, real 5G testbed; DoS floods and port scans (tests portability, not 5G-specific threats) |
| Vehicular | VDoS | UDP flood, SYN flood, Slowloris |
| H2H / general | CICIDS2017/2018, UNSW-NB15 | Enterprise baselines; already combined in CyDER for RL work |
| 6G | none found | No dedicated 6G search run yet; unconfirmed |

Note: in this pass N-BaIoT, Bot-IoT and the CICIDS family were confirmed only by name or citation, not by inspecting their pages.

---

## Zero-Day Evaluation Protocol

Leave-one-attack-family-out (train with a family hidden, test on it) tests **attack-class shift**, not true zero-day behavior with temporal novelty and unknown signatures. Use a combination:
1. **Leave-one-family-out** on CICIoT2023 (baseline, comparable to open-set literature).
2. **Temporal split** (train on earlier captures, test on later or newly introduced attack behavior).
3. **Cross-dataset** (train on CICIoT2023, test on another source such as 5G-NIDD, CICIoMT2024, or a held-out Mirai/Bashlite variant).
4. **Simulator-discovered attacks** (Idea F, if adopted) only as training augmentation, never as the final proof; final evaluation stays on real, held-out, published attack data.

---

## Open Actions From This Update

1. Run the novelty sweep (search protocol above) before fixing the Paper 1 contribution wording.
2. Read in full: Hammar & Stadler (OT), CyDER 2.0, DQN-IDS, Amamou et al.
3. Verify the Zigbee datasets (size, labels, licensing) and run a dedicated 6G dataset search.
4. Decide Paper 3 direction (twin + XAI vs. Idea F); the title works either way.
5. Then draft Paper 1's formal problem definition: observation model, action space, reward.

---
---

# UPDATE 2 — 28 Sep 2026 (new section only; everything above is unchanged)

---

## Potential New Idea to Be Used in Paper 2: Identity-Uncertain Multi-Object Belief (RFS / LMB) for Fleet Defense

**Status:** candidate, not adopted. It is gated by the go/no-go experiment below. If the experiment fails, fall back to the federated-RL fleet version of Paper 2 (see "Relation to federated learning and CTDE").

### 1. The idea in one paragraph

Instead of assuming every device has a reliable identity and the number of devices is known, the defender maintains a **joint belief over an unknown, changing set of devices**: which devices exist, which identity hypotheses are the same physical device, and how likely each is to be compromised. The belief is a random finite set (RFS), realized as a labeled multi-Bernoulli (LMB) filter. Each entry is (label, existence probability r, state density p(x)). The PPO/POMDP agent from Paper 1 consumes this multi-object belief instead of a single network-health belief.

### 2. The problem it targets (problem first, tool second)

**Problem:** IoT defense pipelines mostly resolve device identity first (MAC, IP, fingerprint) and then run detection on the resulting per-device streams. When identity is wrong or ambiguous, the errors flow silently into the detector, and nothing tracks how many devices there are, which are which, and which are compromised.

**Evidence gathered so far (narrow search; verify before relying on it):**
- MAC randomization can prevent an IoT device from being identified properly, which an IETF use-case document says may lead to quarantine and disrupted operations.
- MAC spoofing works because two devices sharing one MAC are treated as legitimate clients.
- Vendor documentation (Cisco DNA Center) notes that a client changing its MAC is treated as a new client, so rogue-client counts depend on how many MACs a device uses. This is a cardinality error.
- The current fix is de-randomization by fingerprinting, e.g. unsupervised clustering of probe-frame features (a 2026 study clusters 22 devices from six manufacturers). This produces a hard identity guess passed downstream.
- Devices behind hubs or NAT (e.g. the 38 Zigbee/Z-Wave devices behind 5 hubs in CICIoT2023) appear as aggregated traffic, so measurement-to-device association is genuinely ambiguous.

**Gap (to be confirmed by a dedicated literature sweep):** identity resolution and compromise detection are separate stages; no work found so far maintains a joint probabilistic belief over count, identity and compromise state for IoT defense. Not yet searched: IDS papers that model identity uncertainty explicitly.

### 3. Why an RFS/LMB and why it is not "just a radar tool"

Short answer for a committee:
> The defender's problem has the structure of multi-object tracking under identity uncertainty: unknown count, births, deaths, false alarms, and ambiguous measurement-to-object association. Current IoT pipelines resolve identity first and detect second, so identification errors corrupt detection. An RFS handles identity and compromise in one Bayesian recursion, and the framework has already moved beyond radar.

Supporting facts:
- Labeled RFS filters are applied in video tracking, cell lineage tracking, SLAM and space-debris tracking, not only radar.
- RFS filters natively model birth, death and clutter.
- Distributed/consensus LMB filters and a secure-fusion variant that detects false-data-injection attacks via KL divergence between LMB densities already exist in the tracking literature.
- When every measurement carries a unique, trustworthy ID, the standard approach reduces to parallel single-object Bernoulli filters. So the RFS machinery is justified only where identity is ambiguous. This is the central condition tested below.

### 4. Radar-to-IoT mapping

| Tracking concept | IoT-defense meaning |
|---|---|
| Object | A physical device that may be compromised |
| Birth | New infection, or a new/rogue/spoofed device appearing |
| Death | Recovery, quarantine, or device leaving the network |
| Clutter | Anomaly-score spikes that are noise, not attacks |
| Measurement | Anomaly score / traffic statistic (from the GRU residual), possibly aggregated over several devices |
| Label | Persistent identity hypothesis for a device |
| Existence probability r | Probability that this device is compromised (or exists, per model choice; define precisely in the formal model) |
| State density p(x) | E.g. MMPP hidden state or infection stage, tying back to the traffic model |
| Undiscovered objects | Devices compromised in ways the detector does not recognize (zero-day link) |

### 5. Complexity ladder (stop at any level without wasting work)

1. **Level 0:** single belief with a novelty state (Paper 1).
2. **Level 1:** one independent Bernoulli belief per device plus fleet aggregation. Simple; probably enough if identities are reliable.
3. **Level 2:** true RFS/LMB with identity ambiguity, hubs/NAT, spoofed and hidden devices. Only if the go/no-go test shows a real need.

### 6. Relation to federated learning and CTDE

- **Federated learning** decides how knowledge is shared for training (weights, not raw traffic). It can enter Paper 1 as a small extension: federate the GRU world model across simulated networks with a non-IID split.
- **CTDE** decides how multiple agents coordinate (central critic in training, local action at run time). Paper 2 devices as currently scoped do not interact, so that version is really **federated RL**, and labeling it CTDE invites an attack. Reserve CTDE for Backup A (coordinated cross-device defense).
- **RFS/LMB** decides what the agent believes. It is orthogonal to both and can be combined with them later.
- If federation is already in Paper 1, "we federated it" cannot carry Paper 2. This idea (or Backup A) has to.

### 7. Candidate contributions

1. A formulation of IoT fleet defense as a POMDP whose belief is a multi-object RFS with identity uncertainty and an undiscovered-device component.
2. An **identity-corruption benchmark**: real labeled traffic with known ground-truth device identities, corrupted in controlled steps. Real datasets normally lack this.
3. Integration of the multi-object belief as the PPO agent's input, with a comparison against identity-first pipelines.
4. Stretch: belief-level fusion across the fleet (consensus LMB) with robustness to lying/compromised devices, compared with weight-level federated learning.

### 8. Test plan: how to check whether it works

**Principle:** decide the pass/fail criteria before running anything, and allow a negative result. A negative result on Stage 1 is a cheap early exit, not a failure of the thesis.

#### Stage 0: sanity (days)
- Implement the plain per-device pipeline and verify it reproduces expected detection quality with ground-truth IDs on CICIoT2023.
- Implement the LMB filter on a toy simulation with known births/deaths to confirm the filter itself behaves (cardinality estimate tracks truth).

#### Stage 1: go/no-go experiment (the kill test)
**Question:** when identity is corrupted, does a per-device detector degrade badly, and does a joint identity-plus-compromise belief recover the loss?

**Data:** CICIoT2023 (per-device MAC ground truth; hub-mediated Zigbee/Z-Wave devices). Optional cross-check on CICIoMT2024 and other sets with device identifiers.

**Corruption knobs (each varied independently, plus combined):**
- MAC rotation rate: how often a device's identifier changes.
- Hub/NAT aggregation size: how many devices are merged into one observed stream.
- Spoof-duplicate fraction: how many devices share an identifier with another.
- Hidden/unknown-device fraction: devices that never appear with a usable identifier.
- Fingerprinting error rate: how often the identity-resolution stage assigns frames to the wrong device (models the imperfect de-randomization step).

**Methods compared:**
| ID | Method | Role |
|---|---|---|
| B0 | Per-device detector with oracle (ground-truth) IDs | Upper bound |
| B1 | Identity-first: fingerprint/cluster to get hard IDs, then per-device detector | Main baseline (current practice) |
| B2 | Network-level/aggregate detector ignoring identity | Identity-free baseline |
| B3 | Independent per-device Bernoulli beliefs on the (possibly wrong) IDs | Tests whether RFS is needed at all |
| P1 | Joint identity + compromise belief (multi-Bernoulli / LMB) | Proposed |

**Metrics:**
- Detection quality per true device (AUROC, F1) and time-to-detect.
- **Cardinality error:** estimated vs true number of compromised devices.
- Multi-object distance between estimated and true compromised-device sets (the OSPA metric is the standard in the tracking literature; confirm choice).
- Identity errors: label switches, fragmented/duplicated tracks.
- False isolation rate of legitimate devices (the operational cost that matters).
- Compute/latency as fleet size grows.

**Decision rule (set numeric thresholds before running; the fractions below are suggestions only):**
- **GO** if, at realistic corruption levels, B1 loses a substantial share of B0's performance **and** P1 recovers at least about half of that gap, **and** P1 beats B3 clearly.
- **DOWNGRADE to Level 1** if B3 matches P1: identity ambiguity is real but the RFS machinery adds nothing over independent per-device beliefs.
- **NO-GO** if B1 degrades gracefully: the problem is not severe enough to justify a paper. Fall back to federated-RL Paper 2 or Backup A.

#### Stage 2: policy integration (only after GO)
- In the MMPP/twin environment, train the PPO agent with (a) the multi-object belief as input vs (b) the identity-first belief vs (c) a recurrent-PPO agent with no explicit belief.
- Measure return, false isolations, containment time, and robustness as corruption increases.
- Include the Paper 1 ablation logic: explicit belief vs GRU hidden state vs both.

#### Stage 3: fleet fusion (optional stretch)
- Compare belief-level fusion (consensus LMB) against weight-level federated learning (FedAvg/FedProx) at equal communication budget.
- Add lying or poisoned devices; test whether KL-divergence-based checks between local beliefs detect and downweight them.
- Track communication cost, since the argument is that beliefs are smaller than weights.

#### Stage 4: real-data validation
- Final numbers on held-out real captures the agent never trained on; cross-dataset test (e.g. train on CICIoT2023, test on another source).
- Keep simulation-derived results labeled as such.

### 9. Threats to validity (state them in the paper)

1. **Synthetic corruption is an assumption.** Reviewers may say the corruption protocol is invented. Mitigation: calibrate knobs to published measurements of randomization behavior and fingerprinting accuracy, and report sensitivity across the whole range.
2. **Simulator trust** (same category as the earlier MMPP dataset rejection): calibrate against real traces; validate only on real held-out data.
3. **Scalability:** LMB/GLMB cost grows with the number of hypotheses. Plan gating, pruning and clustering for fleets of hundreds to thousands of devices.
4. **Model mismatch:** compromise is not a kinematic target. The birth model (infection dynamics) and measurement likelihood (anomaly score) must be justified and validated, not borrowed.
5. **Possible negative result:** B3 or B1 may be good enough. The plan above treats that as an acceptable outcome.

### 10. Expected reviewer attacks and prepared answers

| Attack | Prepared answer / required evidence |
|---|---|
| "This is a radar tool; why here?" | Structure argument in section 3, plus non-radar precedents; and the Stage 1 result showing identity-first pipelines break |
| "Why not clustering plus a per-device model?" | That is baseline B1; show it degrades and P1 recovers |
| "Why not independent per-device probabilities?" | That is baseline B3; show P1 beats it, or downgrade honestly |
| "Corruption is synthetic" | Calibrated knobs, sensitivity sweep, real held-out validation |
| "Does it scale?" | Fleet-size scaling curves with gating/pruning |
| "How is this different from Amamou et al.?" | They federate weights of a detector; this fuses beliefs of a decision-making agent under identity uncertainty |

### 11. Open items for this idea

1. Dedicated literature sweep: "identity uncertainty" / "device identification errors" combined with IDS, RL defense, and multi-object filtering. Add query strings to the search protocol.
2. Confirm the exact metric choice (OSPA or a variant) and how to define ground truth under aggregation.
3. Check which datasets expose usable identifiers and hub-aggregated traffic at the granularity needed for the corruption protocol (CICIoT2023 first; others unverified).
4. Formalize the state, birth/death and measurement models, and decide whether r means "exists" or "compromised" (or a joint mixture).
5. Prototype Stage 0 and Stage 1 before investing in Stages 2 to 4.

---
---

# UPDATE 3 — 29 Sep 2026 (new section only; everything above is unchanged)

## Working Title, Finalized Wording

**Federated MARL with LMB for Spoofed-Device IoT Defense**

- **MARL** = Multi-Agent Reinforcement Learning. CTDE is one of the three standard MARL training paradigms (the others being fully centralized training/execution and fully independent/decentralized training), so "Federated MARL" correctly nests CTDE underneath it without naming it in the title.
- Full formal statement (for the abstract, not the title):
  > A Dec-POMDP formulation trained via CTDE, where each agent's local belief is estimated with a labeled multi-Bernoulli (LMB) filter to handle spoofed or ambiguous device identity, and only weights/derived belief summaries — never raw traffic — are shared across the fleet.
- **Status: working title.** "Federated MARL" alone is not novel (federated MARL and CTDE-plus-federation already exist elsewhere, e.g. FedPPO-PG for smart grids, FMRL-LA). The LMB-for-spoofed-identity part is what must carry the novelty, and it is still gated behind the Paper 2 Stage 1 go/no-go test defined in Update 1.
- **Open scope question:** CTDE requires agents whose actions genuinely affect each other (this is why it needs a centralized critic during training). If fleet devices act independently and only share a trained model, the accurate term is federated RL, not CTDE Dec-POMDP — in that case this title implicitly folds Backup A (coordinated cross-device defense) into Paper 2. Decide and record which case actually applies before finalizing.
- **Privacy caveat to resolve:** a true centralized critic normally needs access to joint observations/actions across agents, which is in tension with "raw traffic never leaves the device." Federated MARL work resolves this by periodically averaging weights/gradients instead of sharing raw joint state, at some cost to coordination quality under non-IID data. State explicitly, in the eventual paper, what exactly the central point sees.

## LMB Prototype (Colab)

A first, didactic LMB filter prototype was built and tested: `lmb_stage0_sanity_check.ipynb`.

- **What it does:** simulates devices being compromised (birth) and recovering (death) with noisy detections and clutter; implements a simplified LMB filter (predict/associate-via-nearest-neighbor/update/prune); runs the Stage 0 sanity check (does cardinality estimate track the true count?); runs a toy, synthetic preview of Stage 1 (naive distinct-ID counting vs. LMB state-space association, as identity corruption increases).
- **What it is not:** not the full joint-association GLMB filter from the tracking literature, and not the real Stage 1 experiment (that needs CICIoT2023, real hub/NAT aggregation, real fingerprinting error, and the five-method comparison with GO/downgrade/NO-GO thresholds already defined in Update 1).
- **Observed behavior on first run:** cardinality estimate tracks the true count's rising/falling shape but is biased low in magnitude at default parameters (tuning candidates: lower `BIRTH_VAR`, raise `P_DETECT`, loosen `GATE_NLL`). The toy identity-corruption comparison is noisy on a single seed/short run; the naive method starts more accurate at zero corruption and the expected crossover is not yet clearly demonstrated — averaging over multiple seeds and longer runs is the next step before reading anything into it.
- **Next step:** treat this notebook as a mechanics check only. It does not validate or invalidate the LMB idea; that remains the job of the Stage 1 CICIoT2023 experiment.

---
---

# UPDATE 4 — 29 Sep 2026 (new section only; everything above is unchanged)

## Alternatives to LMB: Comparison and Open Scoping Decision

**Status:** open decision, not resolved. Explored two Colab notebooks: `lmb_stage0_sanity_check.ipynb` (multi-seed averaging added) and a new `lmb_vs_alternatives_comparison.ipynb`.

### Candidates considered

| Algorithm | Relation to LMB | Evidence found | New to IoT security? |
|---|---|---|---|
| **PHD / CPHD** | Simpler, cheaper; propagates an unlabeled intensity — gives count and rough state, but **no persistent per-device identity/track**. | Standard, well-established RFS baseline. | Not distinctive on its own |
| **PMBM (Poisson Multi-Bernoulli Mixture)** | Mathematically more rigorous: an exact closed-form conjugate prior for the standard multi-object model, whereas LMB is an approximation of it. Multiple comparative papers report PMBM has stronger accuracy and efficiency than LMB/GLMB. | Found applied to wireless sensor networks; not found applied to cybersecurity/IoT device-compromise tracking (narrow search only). | Likely, not yet confirmed by a dedicated sweep |
| **Belief-propagation multi-target tracking (BP-MTT)** | Not a competing state model — a more scalable way to solve the *association* step underneath LMB/GLMB/PMBM, via message passing on a factor graph instead of combinatorial search. Literature describes it as well suited to real-time operation on resource-limited devices. A named variant ("fast LMB using belief propagation", i.e. BP-LMB) speeds up LMB specifically rather than replacing it. Directly addresses the LMB/GLMB scalability weakness already flagged elsewhere in this roadmap. | One close prior-art paper found: BP-based multisensor tracking defending against false-data-injection and denial-of-service attacks on the tracking sensors themselves — adjacent, but not the same application (that paper protects the tracker; this thesis would use the tracker to find compromised devices). | Likely, but this is the closest prior art found so far and needs a dedicated check |

**Key references:** Xia, Granström, Svensson & Fatemi, *"Poisson Multi-Bernoulli Approximations for Multiple Extended Object Filtering,"* arXiv:1801.01353 (PMB — the cheap single-hypothesis approximation of PMBM, used in the notebook below); García-Fernández, Williams, Granström & Svensson, *"Poisson Multi-Bernoulli Mixture Filter: Direct Derivation and Implementation"* (full PMBM); Meyer et al., *"Message Passing Algorithms for Scalable Multitarget Tracking,"* Proc. IEEE, 2018 (BP-MTT); Meyer & Williams, *"A Fast Labeled Multi-Bernoulli Filter Using Belief Propagation"* (BP-LMB).

### Prototype comparison (toy simulation, not CICIoT2023)

Implemented and tested LMB, GM-PHD, and PMB (simplified single-hypothesis PMBM) filters on the same synthetic simulator as the Stage 0 notebook, plus the naive distinct-ID baseline.

**Clean-identity result (single run):** naive was most accurate (has real IDs to exploit), followed by PHD, then PMB, then LMB.

**Multi-seed, identity-corruption result (12 seeds):**

| corruption | naive | LMB | PHD | PMB |
|---|---|---|---|---|
| 0.0 | 0.31 | 2.15 | 0.84 | 1.58 |
| 0.3 | 0.41 | 1.81 | 0.73 | 1.28 |
| 0.6 | 0.74 | 1.71 | 0.74 | 1.13 |
| 0.9 | 1.22 | 1.90 | 0.84 | 1.40 |

(Cardinality MAE, mean over 12 seeds; parameters not separately tuned per filter — see caveats.)

**Observations:**
1. Naive degrades steadily with corruption, as expected.
2. LMB, PHD and PMB all stay roughly flat across corruption levels — none of their `update()` steps read `id_hint`, only the numeric measurement. This means the identity-robustness argument is a property of *identity-free state-space association in general*, not something unique to LMB specifically.
3. PHD was the most accurate of the three RFS filters on this toy model, including under corruption — but PHD has no persistent per-device track, so it cannot answer "which device," only "how many." Not a candidate replacement given the thesis's actual requirement.
4. PMB (the cheap PMBM approximation) did not clearly outperform LMB here; parameters were not independently tuned per filter, so this result should not be read as PMBM underperforming LMB in general — it contradicts the literature's reported PMBM-over-LMB accuracy edge, most likely due to tuning, not a real effect.

### Revised framing

- The differentiator to lead with is **identity-free state-space association for compromise tracking**, not "LMB" as a specific mechanism. LMB is the reference implementation of that idea that keeps per-device identity, which the thesis needs.
- **PMB/PMBM is the most credible upgrade path** if LMB's approximation quality becomes a limitation; both keep per-device tracks, so either is compatible with the thesis's actual requirement (PHD is not).
- **BP-MTT (or BP-LMB specifically) is the scalability upgrade**, to be considered after Stage 1, once fleet sizes make the LMB/PMBM combinatorial cost a real bottleneck, not before.

### Caveats on this comparison

1. Toy synthetic simulation only, single parameter set, not independently tuned per filter — do not read the specific numbers above as settled performance claims.
2. The "new to IoT" claims for PMBM and BP-MTT rest on narrow searches; a dedicated literature sweep (add to the search protocol: PMBM/BP-MTT combined with IoT, botnet, intrusion, device compromise) is still needed before claiming novelty in a paper.
3. None of this replaces the Stage 1 CICIoT2023 go/no-go experiment, which remains the real test using real identity ambiguity rather than a synthetic corruption knob.

## Colab Notebooks (updated)

- `lmb_stage0_sanity_check.ipynb` — Stage 0 mechanics check, toy Stage 1 preview, now with multi-seed averaging (Section 6) added on request.
- `lmb_vs_alternatives_comparison.ipynb` (new) — implements and compares LMB, GM-PHD, and PMB on the same simulator, with the clean-identity and multi-seed corruption experiments described above, plus a written discussion of what the results do and don't support.

---
---

# UPDATE 5 — 29 Sep 2026 (new section only; everything above is unchanged)

## Decision: LMB vs. PMB vs. PHD — Adopting PMB, With a Planned Upgrade to Full PMBM

**Status:** working decision, based on a toy simulation with independently tuned filters. Not yet validated on CICIoT2023 (Stage 1). Notebook: `lmb_vs_pmb_tuned_comparison.ipynb`.

### Why PHD is disqualified regardless of accuracy

PHD (and CPHD) propagate an unlabeled intensity: they estimate *how many* devices are compromised, never *which* devices. The thesis needs to isolate or throttle a specific device, so PHD cannot be the primary filter no matter how accurate its cardinality estimate is. Kept only as a cited lower-bound reference.

### Fair comparison: LMB vs. PMB, each independently tuned

Earlier comparisons (Update 4) gave LMB and PMB the same, LMB-tuned parameters, which is not a fair test. Each filter was given its own small grid search (birth variance, birth rate/weight, gating/spawn threshold), scored on clean-identity cardinality MAE over held-out tuning seeds, then evaluated on fresh seeds not used for tuning:

| corruption | naive | LMB (tuned) | PMB (tuned) |
|---|---|---|---|
| 0.0 | 0.29 | 1.81 | 1.16 |
| 0.3 | 0.40 | 1.54 | 1.00 |
| 0.6 | 0.69 | 1.43 | 0.87 |
| 0.9 | 1.26 | 1.60 | 1.05 |

(Cardinality MAE, mean over 15 seeds, corruption = probability a real device's identity hint is replaced by a shared hub id.)

**Result: PMB beat LMB at every corruption level after independent tuning**, by roughly 30–35% lower error — not a tuning artifact from Update 4's unfair comparison.

**Likely structural reason:** this LMB implementation pre-populates all candidate device labels with a small existence probability from the first timestep, so unborn devices compete for measurements immediately. PMB instead keeps a separate Poisson pool for "not yet detected" and only spawns a confirmed (Bernoulli) track once evidence justifies it — a more principled birth model. This is also consistent with the tracking literature's claim (Update 4) that PMBM/PMB is generally more accurate than LMB because PMBM is an exact conjugate prior while LMB is an approximation of it.

### Working decision

- **Adopt PMB as the current prototype filter.**
- **Keep LMB as a documented, weaker baseline** in the eventual paper/comparison.
- **Planned upgrade path: full PMBM** (multi-hypothesis, not the single-hypothesis PMB approximation used here) once fleet-scale testing shows whether PMB's simplification costs meaningful accuracy. Not built yet.
- **Title implication:** the working title should track this. Current working title said "...with LMB..." (Update 3); given this result, the more accurate near-term title is **"...with PMB..."**, with "eventual upgrade to PMBM" noted in the abstract rather than the title, since the title shouldn't need to change again if the upgrade happens.

### Novelty status (still open, not yet a confirmed claim)

Same finding as for LMB: PMBM/PMB appear across radar, autonomous driving, maritime surveillance, drone traffic monitoring, and LiDAR/vision tracking, but not in IoT security, botnet detection, or intrusion detection, across the searches run so far (a handful of keyword queries, not a full database sweep). This is suggestive of a gap in *RFS-based multi-object tracking applied to device-compromise detection generally* — which is encouraging, since the thesis direction doesn't depend on which specific filter (LMB, PMB, or PMBM) is ultimately used. **Not yet confirmed.** The expanded search protocol (method terms: PMBM, PMB, LMB, GLMB, MBM, RFS; domain terms: IoT, network security, intrusion, botnet, malware, compromised device, cybersecurity, device identification; sources: IEEE Xplore, ACM DL, Scopus, arXiv, Google Scholar) is now recorded in the notebook and should be run before this becomes a written novelty claim.

### Caveats

1. Toy synthetic simulation, single environment configuration; grid search is coarse (a handful of values per parameter) and only optimizes clean-identity MAE, not a fleet-scale or false-isolation-cost objective.
2. Tuning and evaluation seeds were kept separate to reduce (not eliminate) overfitting risk from the grid search.
3. This does not replace the Stage 1 CICIoT2023 go/no-go experiment, which remains the real decision point using real identity ambiguity.
4. **Grid-edge issue, confirmed on a second run (user-reproduced, identical results):** both filters' best `birth_var` landed on 4.0, the *widest* value in the grid, for both LMB and PMB. That means the search stopped at the edge of the range rather than finding an interior optimum, so the true best value may lie even higher. Before treating `(birth_var=4.0, birth_r=0.05, gate=16.0)` for LMB and `(birth_var=4.0, birth_weight=0.48, gate_spawn=0.02)` for PMB as final tuned parameters, widen the grid (e.g. add 6.0, 8.0 to the `birth_var` options) and re-run Section 4 of `lmb_vs_pmb_tuned_comparison.ipynb`. This is cheap to do and should be done before quoting these numbers anywhere final.

## Colab Notebooks (updated)

- `lmb_stage0_sanity_check.ipynb` — Stage 0 mechanics check, toy Stage 1 preview, multi-seed averaging.
- `lmb_vs_alternatives_comparison.ipynb` — first LMB/PHD/PMB comparison (shared, LMB-tuned parameters — superseded by the tuned version below for the LMB-vs-PMB question, but still the source for the PHD result).
- `lmb_vs_pmb_tuned_comparison.ipynb` (new) — independently-tuned grid search for LMB and PMB, final tuned comparison, and the expanded literature-search protocol to confirm or reject the "new to IoT" claim.

---
---

# UPDATE 6 — 29 Sep 2026 (new section only; everything above is unchanged)

## Stage 1 Go/No-Go: Code Built, Debugged, and First (Synthetic) Results

**Status:** Stage 1 code exists and runs end to end in Colab (`stage1_go_nogo.ipynb`). All results so far are on **synthetic, CICIoT2023-shaped data** and prove only that the pipeline works. **No real Stage 1 verdict exists yet.** Stage 2 to 4 remain gated behind it.

### 1. What was built

A `stage1/` Python package (written into Colab by the notebook), implementing the Update 2 test plan:

| File | Role |
|---|---|
| `corruption.py` | Identity-corruption knobs: MAC rotation, hub/NAT aggregation, spoof-duplicates, hidden devices (fingerprint error lives in `detector.py`) |
| `detector.py` | Swappable anomaly scorer (IsolationForest stand-in for the Paper 1 GRU) and B1's fingerprint resolver |
| `baselines.py` | B0 oracle IDs, B1 identity-first, B2 aggregate, B3 per-ID belief |
| `pmb_filter.py` | P1: simplified single-hypothesis PMB (Poisson pool plus confirmed Bernoulli tracks). Not full PMBM |
| `metrics.py` | Cardinality MAE, precision/recall/F1 mapped to true devices, false-isolation rate. **No OSPA yet** (metric choice still open) |
| `data.py` | Synthetic generator, `inspect_ciciot2023()`, and the real loader `load_ciciot2023()` |
| `run_stage1.py` | `run_one_condition()`, `decide()` (the pre-registered rule), `run_all()` |

### 2. Three bugs found by reading the code against this roadmap, and fixed

1. **Detector fitted on the wrong slice.** It was fitted on the first quarter of the *rows* (records are ordered device by device), so it trained on a few devices including attack windows. Now fitted on the earliest *windows by time*. Effect: B0 F1 went from 0.735 to 0.979.
2. **Decision-rule order.** DOWNGRADE was checked before NO-GO, so NO-GO was unreachable whenever P1 was close to B3. Now: NO-GO (B1 degrades gracefully) -> DOWNGRADE (P1 not clearly ahead of B3) -> GO (P1 recovers enough of the B0-B1 gap) -> otherwise NO-GO for PMB. Thresholds are constants at the top of `run_stage1.py`; `B1_LOSS_FRACTION_NEEDED = 0.10` is a new placeholder that **must be set by the author before real results are read**.
3. **B3 did not match its definition.** The roadmap says "independent per-device Bernoulli beliefs"; the code was a bare threshold. Now a per-ID recursive belief (same smoothing gain as P1) with no birth model, no existence probability, and no decay.

### 3. Synthetic results (pipeline check only)

Heavy-corruption condition, F1 mean ± std over 10 seeds:

| B0 | B1 | B3 | P1 |
|---|---|---|---|
| 0.989 ± 0.011 | 0.899 ± 0.052 | 0.810 ± 0.068 | 0.804 ± 0.065 |

Verdict at these thresholds: **NO-GO** (B1 loses only 9.1% of B0's F1, just under the 10% placeholder threshold; the verdict is sensitive to that threshold). P1 vs B3: no difference within noise at this corruption level.

**Severity sweep** (knobs scaled together from mild to extreme, 6 seeds), F1:

| severity | B0 | B1 | B3 | P1 |
|---|---|---|---|---|
| 0.00 | 0.990 | 0.990 | 0.995 | 0.994 |
| 0.25 | 0.990 | 0.931 | 0.790 | 0.891 |
| 0.50 | 0.990 | 0.876 | 0.512 | 0.658 |
| 0.75 | 0.990 | 0.865 | 0.295 | 0.501 |
| 1.00 | 0.990 | 0.817 | 0.141 | 0.251 |

Reading: P1 beats B3 by roughly 0.1 to 0.2 F1 from severity 0.25 upward, and the gap widens with corruption. This is consistent with Update 5, where PMB overtook the naive method between corruption 0.6 and 0.9 (linear crossover about 0.75 from the table; toy sim, cardinality MAE). P1 never beats B1 in this sweep. The severity sweep is **not yet in the notebook**.

### 4. Key caveats found

1. **B1 is unrealistically strong, so the P1-vs-B1 comparison is unreliable.** `fingerprint_resolve()` does not resolve identity: it returns the corrupted ID and occasionally swaps in a random wrong label. The evaluator also maps labels to true devices by majority vote using ground truth, which favors B1. Fix: replace it with a real resolver (e.g. clustering on traffic features) and score without ground-truth help. Until then, any NO-GO or DOWNGRADE that hinges on B1 is provisional.
2. **A NO-GO in Stage 1 does not mean PMB is bad.** It means the identity-corruption problem was not severe enough (against B1) to justify a paper. Only the DOWNGRADE branch is a statement about PMB itself.
3. **Our "heavy corruption" level is milder than the regime where Update 5 saw PMB win** (about 0.75+ identity-hint replacement). The default `run_all()` levels should be extended.
4. Synthetic corruption is an assumption, not calibrated to published MAC-randomization or fingerprinting-error rates (threat to validity 1 in Update 2).

### 5. Design idea from discussion: attack-gated hybrid (candidate, not adopted)

Run the cheap identity-first pipeline (B1) in normal operation and switch to the PMB filter only when identity trouble or spoofing is suspected. Supported by Update 5 (naive beats PMB at low corruption, PMB wins at high) and reduces compute (relevant to the LMB/PMBM scalability concern).
- **Trigger must be identity-free** (aggregate anomaly rate, surge of never-seen IDs, duplicate IDs), because identity is what is corrupted.
- **Cold start:** PMB has no history when switched on; keep a lightweight version warm or warm-start from the last device list.
- **Hysteresis** needed to avoid mode flapping.
- Identity corruption also occurs in normal operation (MAC randomization, hubs), so the gate should key on *identity trouble*, not only on "an attack was detected."
- Adds a fourth Stage 1 method: gated hybrid, expected to match B1 when clean and PMB when corrupted.

### 6. Real-data loader (CICIoT2023)

`inspect_ciciot2023(path)` reports file counts, CSV columns, identity-like columns, label values, and recommends a mode. `load_ciciot2023(path, mode='auto'|'csv'|'pcap', ...)` returns the same record shape as the synthetic generator.

- **CSV mode:** used only if a device-identifier column exists. To my recollection the pre-extracted CICIoT2023 CSVs (46 features + label) have **no** device/MAC/IP column; **verify with `inspect_ciciot2023` on the local copy.** If none, the loader raises a clear error.
- **pcap mode:** streams pcaps with `dpkt`, builds per-source-MAC time-window features (16 features: packet/byte rates, length mean/std, protocol fractions, SYN/ACK/RST fractions, unique dst IPs/ports, DNS/HTTP/HTTPS fractions, burst rate). These are **not** CICIoT2023's 47 official features. Benign pcaps are processed first so the earliest windows (the detector's fit slice) are benign; a warning fires if attack windows start in the first 25% of time.
- **Label semantics are a decision the author must own.** Default: in attack pcaps, windows from a source MAC never seen in the benign pcaps (attacker hosts), or listed in `attacker_macs`, are `is_attack=True`. This does **not** capture cases where IoT devices themselves attack (e.g. Mirai) unless `attacker_macs` is supplied, and it does not model "IoT device as compromised victim." Decide whether "compromised device" means attacker host, targeted victim, or infected IoT device before trusting any real-data result.
- Practical limits: `max_devices`, `max_packets_per_file`, `benign_max_files`, `attack_max_files`, `window_seconds` (default 5 s) exist because the full pcap set is very large.
- **Tested only on fake, CICIoT2023-shaped pcaps and CSVs** (a few devices, one attacker). Not yet run on the real dataset; pcap link-layer types or file naming in the real set may need adjustments (the benign/attack split relies on 'benign' appearing in the pcap filename).

### 7. Open actions from this update

1. Run `inspect_ciciot2023` on the local dataset; decide CSV vs pcap path; decide the compromised-device definition and set `attacker_macs` / `exclude_macs`.
2. Replace B1's stand-in resolver with a real one (feature clustering) and remove ground-truth help from its scoring.
3. Set the decision thresholds (`B1_LOSS_FRACTION_NEEDED`, `RECOVERY_FRACTION_NEEDED`, `B3_MARGIN_NEEDED`) **before** reading real results.
4. Add the severity sweep (extending past the current "heavy" level) and the attack-gated hybrid as a fourth method to the notebook.
5. Add the chosen multi-object metric (OSPA or variant) to `metrics.py`.
6. Then run the real Stage 1; only after a GO proceed to Stage 2.

## Colab Notebooks (updated)

- `stage1_go_nogo.ipynb` (new) — self-contained: writes the `stage1/` package, runs the synthetic dry run, a 10-seed heavy-corruption run, and (Section 4) the real-data inspect/load/run cells, which skip cleanly if `DATA_PATH` does not exist.

---
---

# UPDATE 7 — 29 Sep 2026 (new section only; everything above is unchanged)

## Alternatives to PMB: Literature Scan and Synthetic Comparison

**Status:** exploratory. Six targeted web searches (not a systematic review) plus implementation of the candidate methods in the Stage 1 harness (`stage1_go_nogo.ipynb`, Section 4). All numbers are on **synthetic data with a communication graph and spreading malware**. No dataset was available. Nothing here validates or rejects PMB on real data.

### 1. Candidates found (search areas)

| Family | Why it is relevant | What it does NOT do |
|---|---|---|
| **Bayesian nonparametric (Dirichlet-process) association** | Dependent-DP multi-object tracking handles an unknown, time-varying object count with unknown measurement association, as an alternative to RFS. Dirichlet-process IDS precedent exists (Heard & Rubin-Delanchy). | Usually MCMC (real-time cost); no application to identity+compromise in IoT found |
| **Multi-stream quickest change detection (CUSUM family)** | Unknown change time and unknown affected subset of streams; adaptive CuSum linear in number of streams; Byzantine variant for compromised sensors. Gives delay/false-alarm theory (relevant to Idea H). | Does not resolve identity |
| **Belief propagation / graph inference** | Guilt-by-association on device/host graphs (DeviceWatch; enterprise-infection BP). Scalable message passing; candidate engine for BP-MTT. | Assumes node identities are known |
| **MHT / JPDA** | The classical rivals to RFS (JPDA, MHT, RFS are the three mainstream multi-target paradigms). Expected reviewer baselines. | Not expected to beat PMBM logically |
| **Hawkes / SIR-Hawkes / epidemic inference** | Models spreading dynamics; suggests a self-exciting birth model for PMB. POMDP-based active node sampling exists as a neighbour of the POMDP framing. | Not an identity method |
| **Identity-side evidence** | MAC de-randomization by clustering probe-request features; BLE re-identification under randomization; a study found a single device can be misidentified as several devices (a cardinality error). | — |

### 2. What was implemented (all simplified)

`B1c` enrolled-fingerprint classifier (agglomerative clusters on early traffic, nearest centroid). `P2` PMB with Hawkes-style birth prior. `D1` sequential-CRP association (greedy, online, temporal decay; grid-tuned on separate seeds, interior optimum). `J1` JPDA-style soft association. `M1` MHT-lite (beam of 3 hypotheses, 2-window delayed decision). `C1` per-stream CUSUM. `H1` CUSUM/identity-gated hybrid (B1 when calm, PMB when the anomaly-rate CUSUM fires or id-churn exceeds 5%). `G1` loopy BP on the communication graph.
**Not implemented:** Byzantine-robust CUSUM, POMDP active node sampling, full dependent-DP via MCMC.

### 3. Results (synthetic; F1, heavy corruption, 5 seeds, mean ± std)

| B0 | B1 | B1c | B3 | P1 | P2 | D1 | J1 | M1 | C1 | H1 | G1 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.990 | 0.977 | 0.270 | 0.705 | 0.888 | 0.889 | 0.835 | 0.816 | 0.834 | 0.811 | 0.888 | 0.432 |

**Fingerprint-separability sweep** (heavy corruption, 3 seeds; smaller base_scale = device fingerprints harder to tell apart): D1/J1/M1 fall from about 0.83 to about 0.57 as separability shrinks, while P1 stays near 0.88 and C1 rises to about 0.90.

### 4. Findings

1. **Nothing beat the crude B1**, which is still the unrealistic stand-in (see Update 6). Do not read this table as "PMB wins".
2. **Fingerprint-based identity fails exactly on compromised devices.** B1c identified normal records 93% of the time and compromised records 0%, because compromised traffic no longer matches the device's enrolled fingerprint (the synthetic attack shift is large; real shifts vary). This is an argument for belief-based methods, but it rests on one classifier design.
3. **Feature-association methods (D1, J1, M1) are immune to ID corruption by construction** and are competitive only while fingerprints are separable. They degrade as separability shrinks, which is the realistic concern for CICIoT2023-type rate features.
4. **The CUSUM gate works as a trigger** (attack alarm one window after onset, zero false alarms before it in the seed-0 run), but in the harness the identity-trouble rule keeps the gate on under any corruption, so H1 equals P1. The hybrid's benefit (compute savings, B1 when calm) is not measured here.
5. **G1 (BP) raises false isolations** (0.23 on clean data in seed 0), the classic guilt-by-association cost, and collapses under hub/rotation corruption because its nodes are corrupted ids.
6. **P2 (Hawkes birth) is indistinguishable from P1** in this setup (0.889 vs 0.888).
7. **C1** has a high false-isolation rate on clean data (0.165, seed 0): a single global baseline for per-stream CUSUM is crude.

### 5. Caveats

- All results are synthetic; the graph generator builds in the homophily and spreading that G1 and P2 are meant to exploit. G1's graph edges are derived from ground-truth links at identity level.
- B1c's clustering multiplier was chosen on a tuning seed using cluster purity (mild ground-truth use). D1/J1/M1 were tuned; P1 and the others were not, so the comparison is not tuning-neutral.
- Cluster-to-device evaluation uses a ground-truth majority vote (as B1 already does); this can flatter association methods.
- Novelty is unchecked: no dedicated sweep for DP/JPDA/MHT/BP/CUSUM applied to IoT identity-plus-compromise tracking.

### 6. Open actions

1. Replace B1's stand-in resolver with the B1c-style design (or a stronger one) in the main Stage 1 comparison.
2. Test the strongest candidates (PMB, D1, CUSUM gate) on real data once CICIoT2023 pcaps or another dataset with device IDs is available; real feature separability decides the D1/PMB question.
3. Consider a Byzantine-robust CUSUM variant for the lying-devices stretch (Stage 3).
4. Add "dependent Dirichlet process", "JPDA", "MHT", "quickest change detection", "belief propagation" plus IoT/botnet/intrusion terms to the novelty-search protocol.
