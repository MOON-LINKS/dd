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

# UPDATE 6 — 1 Oct 2026 (new section only; everything above is unchanged)

## B0/B1 Clarified, and a Non-Radar Alternative: Bayesian Entity Resolution

**Status:** exploratory. Notebook: `b0_b1_pmb_entityres_comparison.ipynb`.

### What B0 and B1 actually are (clarifying a conflation in earlier notebooks)

Earlier toy notebooks used a single "naive" baseline (distinct `id_hint` count), which behaves like **B0 at zero corruption** (where `id_hint` happens to equal the true label) and degrades toward a weak **B1** as corruption rises. This update separates them properly:

- **B0 (oracle):** reads the device's *true* identity directly. **Not a real, deployable method** — in practice there is no ground truth to read. It exists only as a mathematical ceiling: the best possible performance if identity were never a problem. The gap between B0 and B1 is the quantified *cost of identity ambiguity*.
- **B1 (naive/identity-first):** trusts whatever identity hint is attached to each measurement (in reality: a MAC address, a fingerprint-derived guess, etc.). This is what a real "resolve identity, then detect" pipeline becomes.

### Does a spoofing/masking attacker get "detected" by B0 or B1?

**No, and the mechanism matters:**

- **B0 is immune by construction, not by detection.** It never looks at the identity signal an attacker could manipulate — it reads ground truth, which only exists in a simulation. A real attacker is not caught by B0; B0 simply isn't attackable because it isn't a real pipeline.
- **B1 is directly vulnerable.** It is not "detecting" spoofing/masking; it is *being misled by it*, which is exactly the vulnerability this thesis direction targets. Confirmed on the toy simulation (15 seeds, cardinality MAE):

| corruption | B0 (oracle) | B1 (naive) | PMB | EntityRes |
|---|---|---|---|---|
| 0.0 | 0.292 | 0.292 | 1.159 | 1.159* |
| 0.3 | 0.268 | 0.403 | 0.997 | 0.965 |
| 0.6 | 0.249 | 0.686 | 0.869 | 0.894 |
| 0.9 | 0.304 | 1.264 | 1.046 | 1.096 |

(*The identical value at corruption 0.0 is coincidental — verified the underlying per-timestep estimates are not identical, just close in aggregate mean on this run.)

B0 stays flat regardless of corruption (immune by construction). B1 climbs steadily (0.292 → 1.264) — this is the real, quantified effect of an identity-trusting pipeline being spoofed. PMB and EntityRes both stay comparatively flat, since neither reads the identity hint at all.

**Caveat on PMB/EntityRes:** flat performance here is specific to *identity-hint corruption* (relabeling). A more sophisticated attacker mimicking a legitimate device's behavioral signature (the measurement itself, not just its claimed identity) would be a different, harder attack not tested by this notebook.

### A non-radar alternative: Bayesian online entity resolution

Built and tested a filter motivated by **Bayesian/streaming record linkage** (Fellegi & Sunter, 1969; Taylor, Kaplan & Betancourt, *"Fast Bayesian Record Linkage for Streaming Data Contexts,"* 2023) rather than target tracking — a genuinely separate field (statistics/databases, originating in census and survey-matching work), with its own streaming/sequential variant that maintains a posterior over the number of distinct entities as data arrives.

**Why this matters for the "you used a radar method" attack:** it doesn't need rebutting if the underlying math comes from a different field entirely. Record linkage has zero radar lineage.

**Implementation caveat:** this is a cheap, greedy, single-MAP-assignment approximation (entities compete for each measurement via a popularity-weighted — CRP-like — likelihood, with stale entities dropped via "blocking," a standard record-linkage technique). The real papers use full posterior inference (Gibbs/SMC sampling over the partition structure). This captures the idea, not a faithful implementation.

**Result:** EntityRes performs comparably to PMB (within noise of each other across corruption levels) — not a clear win either way on this toy model. Interesting mainly because it reaches similar robustness through a completely different, non-tracking lineage.

### A natively-networking piece, for the measurement layer (not the belief layer)

Searched specifically for IoT/networking-native identity techniques. Found: clock-skew and TCP/IP-stack fingerprinting (Kohno et al., *"Remote Physical Device Fingerprinting"*), the established technique for counting/distinguishing devices behind a shared NAT/IP using hardware clock deviations — genuinely IoT/networking-native, zero radar lineage. But its own literature states counting hosts behind a NAT is unstable over time, as devices may enter and leave a network — i.e., it's a snapshot estimator, not a sequential belief tracker.

**Proposed combination:** use clock-skew/TCP fingerprinting as the *measurement model* (produces identity evidence each timestep) feeding a *sequential belief core* (PMB or the entity-resolution filter). This grounds the measurement layer in native networking literature and the belief-update layer in either tracking (PMB) or record linkage (EntityRes) — not in radar sensing itself, since the "sensor" is now a network fingerprinting technique. Not yet built or tested.

UPDATE 7 — 2 Oct 2026 (new section only; everything above is unchanged)
Formal Decision: Hybrid Filter — Entity-Resolution Front End + Shared Bayesian Core

Status: working decision, based on a toy simulation with properly, independently tuned filters, including a grid-edge correction that was missed in Update 5. Notebook: hybrid_pmb_entityres_tuned_comparison.ipynb.

Grid-edge correction (fixes the open item flagged in Update 5/6)

Update 5 flagged that both LMB's and PMB's tuned birth_var landed on 4.0, the edge of that grid, and should be re-checked. Re-checked here: the true plateau for both PMB and EntityRes sits around birth_var ≈ 24, not 4.0. Confirmed by sweeping birth_var from 8 up to 64 and observing MAE stop improving meaningfully past ~24. The earlier Update 5 tuned parameters (birth_var=4.0 for both LMB and PMB) should be considered superseded for PMB; re-tune LMB the same way before quoting its Update 5 numbers as final.

Fair comparison, final tuned parameters
PMB: birth_var=24.0, birth_weight=0.72, gate_spawn=0.05
EntityRes: birth_var=24.0, conc=1.8, max_stale=5
corruption	B0 (oracle)	B1 (naive)	PMB (tuned)	EntityRes (tuned)
0.0	0.292	0.292	0.812	0.822
0.3	0.268	0.403	0.774	0.749
0.6	0.249	0.686	0.692	0.742
0.9	0.304	1.264	0.770	0.774

(Cardinality MAE, mean over 15 fresh seeds; tuning used separate seeds 1000+.)

Result: PMB and EntityRes are statistically tied at every corruption level — the earlier apparent PMB-vs-EntityRes difference (Update 6) was a tuning artifact, not a real effect, consistent with the general lesson that LMB's earlier apparent weakness (Update 5) was real but PMB/EntityRes's relative ordering was not yet settled until both were fairly tuned.

Why this result changes the recommendation, not just the numbers

PMB's and EntityRes's update() methods share identical math for the existence/state recursion (Kalman gain, likelihood-vs-clutter ratio, the r update formula). The only functional difference is the association and birth layer: PMB's nearest-neighbor matching plus a Poisson "undetected" pool (multi-object-tracking lineage) versus EntityRes's popularity-weighted, CRP-style matching plus blocking-based pruning (Bayesian/streaming record-linkage lineage, zero radar heritage). Since performance is tied, the choice between them is a framing and defensibility question, not a performance question.

Formal decision

Adopt the entity-resolution-style association/birth front end as the primary design, on the shared Bayesian-filtering core.

Removes the "why did you import radar tracking math" vulnerability at zero measured performance cost — record linkage descends from census/survey-matching statistics (Fellegi & Sunter, 1969), not radar.
The Bayesian filtering core itself (Kalman-style sequential state estimation) is not radar-specific to begin with — it's domain-general probability theory, used across finance, robotics, and GPS.
Reframed novelty claim: record-linkage-style identity association combined with multi-object Bayesian state estimation, applied to compromised-device tracking. This combination, not either ingredient alone, is the thing to check for novelty and the thing to describe in the eventual paper.
PMB is not discarded. It remains the literature-grounded reference point (PMBM is the literature's own "more accurate than LMB" claim) and a documented alternative front end on the same shared core.
Open items
New novelty-search entry: whether this specific hybrid (record-linkage association + multi-object Bayesian state estimation, for device-compromise tracking) has prior art — not yet checked; add to the expanded search protocol (Update 5) alongside the existing PMBM/LMB/record-linkage terms.
Re-tune LMB with the corrected, wider grid before trusting its Update 5 comparison numbers against PMB.
Both front ends still use a single-point (greedy MAP) approximation of their respective full methods (full PMBM multi-hypothesis; full Bayesian record-linkage posterior sampling). The upgrade path applies to the shared core regardless of which front end is chosen.
This remains a toy synthetic simulation. The real decision point is still the Stage 1 CICIoT2023 go/no-go experiment.
Title implication: given this decision, the working title's filter reference should move from "PMB" (Update 5) toward something that names the hybrid, or stays deliberately generic (e.g., "identity-robust belief") until the Stage 1 result confirms which front end — or whether the hybrid framing itself — survives contact with real data.


---
---

# UPDATE 8 — 2 Oct 2026 (new sections only; everything above is unchanged)

## Correction: Moving Away from "Better Identity Resolution" as the Core Gap

**What changed:** earlier updates (6–7) treated identity-robust device tracking (LMB/PMB/EntityRes) as the central novel contribution. Checked against the current IoT security literature directly, and that framing doesn't hold up as the lead contribution.

**Why:** device identification is an active, sophisticated arms race, not a stable target to outperform:
- Current methods already use rich, multi-dimensional signals (RF fingerprinting, hardware-behavior sequences via LSTM-CNN, packet-sequence signatures) — far beyond the single-scalar anomaly measurement used in the toy filters built here.
- Attackers are already adaptive, not just relabeling: a 2026 paper shows a collusion-driven impersonation attack (VAE-generated synthetic signals) defeating RF fingerprinting, long considered one of the hardest identifiers to spoof. Standard ML evasion (FGSM/PGD/UAP) against fingerprinting classifiers is already a studied, partly-successful attack class.
- Defenders are already racing on exactly this problem: a 2026 game-theoretic MAC-obfuscation defense holds attackers to near-random-guess accuracy, with its own documented limits against an adaptive attacker.
- The toy `EntityResolutionFilter`/`PMBFilter` built here were never tested against an adaptive/mimicry attacker — only against static identity-hint relabeling, a much easier threat model than the field actually studies.

**Corrected framing:** don't compete with fingerprinting specialists. Instead, treat whatever identification signal is deployed (fingerprinting or otherwise) as an **unreliable, potentially adversarial sensor**, and make the POMDP belief state explicitly represent confidence in that sensor itself. When identification confidence degrades (e.g., under an active evasion attack on the fingerprinting layer), the belief and the resulting policy should reflect that — not trust a possibly-compromised signal blindly. This is a decision-under-unreliable-evidence contribution, not an identification contribution, and it still uses the belief/POMDP infrastructure already built, just retargeted.

**Still open:** build and run the adaptive/mimicry-attack test against the toy filters (proposed, not yet built) to get a real number for "does belief-aware trust degrade gracefully vs. a plain detector."

## A Broader, Better-Evidenced Gap: Cross-Protocol Lateral Movement

Found while deliberately broadening the search past identity/fingerprinting, per explicit request to not over-fit to one narrow angle.

**The gap, with evidence:**
- A 2017 paper demonstrates a real, working cross-protocol pivot: compromising a smart TV over WiFi (via a known CVE), then using it to attack a Zigbee smart lock on the same home hub's other protocol segment.
- A 2026 Z-Wave dataset paper reviewing 30 IoT datasets explicitly lists **lack of support for multi-protocol analysis** as one of 22 concrete shortcomings — current datasets don't support studying mixed-protocol interactions.
- A 2026 paper (BRIDGE/TCH-Net) built the first formal cross-domain benchmark for IoT botnet detection specifically because the field lacks a reliable answer to how well detection generalizes across network environments — their baseline (mean LODO F1 ≈ 0.56) confirms detection degrades substantially when the network environment shifts.
- Enterprise lateral-movement detection is mature (graph neural networks on authentication logs) but nothing found applies a belief-driven/POMDP approach to a device pivoting across IoT protocol boundaries specifically (Zigbee → hub → WiFi → 5G).

**Why it fits the existing stack:** the MMPP/POMDP spread model already tracks infection propagation; extending it to track propagation *across* protocol/domain boundaries is a natural extension, not a new pillar. It also connects back to the identity problem rather than replacing it: a Zigbee-to-WiFi hub is exactly where device identity becomes most ambiguous (many devices aggregated behind one identity) **and** exactly the chokepoint an attacker must cross to pivot — the two gaps meet at the same physical point.

**Status:** promising, but only checked with ~3 targeted searches so far — needs the same systematic sweep (IEEE Xplore/ACM DL/Scopus, not just general web search) before being trusted as confirmed novel, same standard applied to the PMB/LMB checks earlier.

## Paper 2: Contribution Candidates (moving beyond "federated version of Paper 1")

**Closest related work found:** FRL-IPS (federated DDQN intrusion-prevention for multi-domain SDN, Flower framework, explicit IID vs. non-IID evaluation). Key quoted finding: *federated training can reach prevention behavior comparable to centralized training at steady state, but requires more training to stabilize, with heterogeneity further increasing transient variability and stabilization time.* No POMDP/belief, no novelty/zero-day state, no identity ambiguity — the clearest differentiation points.

**Candidate 1 (lead candidate): MBRL sample-efficiency vs. federated convergence cost.** FRL-IPS uses model-free DDQN, which needs real interaction per update. Paper 1's core is model-based (GRU world model), which can train on simulated rollouts instead. Testable question: **does MBRL's sample efficiency reduce the federated non-IID stabilization-time penalty FRL-IPS documents for model-free methods?** Concrete, has a real baseline (FRL-IPS's own stabilization-time numbers) to compare against, reuses existing Paper 1 infrastructure.

**Candidate 2: Byzantine-robust belief fusion.** Standard federated learning defends against poisoned weights; nothing found defends against poisoned *beliefs* — a compromised fleet device lying about its own existence/compromise probability. Proposed: KL-divergence-based downweighting of local beliefs that diverge sharply from consensus (echoes the consensus-LMB/secure-fusion idea from early roadmap notes, never built). Natural companion to whichever identity-robustness result Stage 1 produces, not a replacement.

**Candidate 3 (lower priority / future): cross-protocol generalization.** Report LODO-style (leave-one-domain-out) results the way BRIDGE/TCH-Net does, with the fleet explicitly spanning heterogeneous protocols/domains rather than one vendor's homogeneous devices. Overlaps with the cross-protocol direction above; treat as a stretch/future extension rather than folding into Paper 2 now.

**Two other papers checked and ruled out as off-topic:**
- "Toward Improved Deep Learning-based Vulnerability Detection" (and similar) — source-code static analysis (finding CVE-level bugs in code, e.g. ReVeal/DeepWukong/LineVul), a different field entirely (software engineering, not network/device compromise detection). Not relevant unless the thesis explicitly pivots toward firmware/source-level vulnerability discovery.
- "Context-Aware Reinforcement Hyper-Heuristic Allocation for Dynamic Wireless Resource Management" — exact paper not located by search; the general area (context-aware RL for wireless bandwidth/power/channel allocation) is a real, populated field but is about resource-allocation efficiency, not security. Tangential at best; revisit if a specific link/detail is found.

## Non-IID Conditions, Defined

**IID** (Independent and Identically Distributed): the standard assumption that every data point is drawn independently from the same underlying distribution — no client's data is systematically different from any other's.

**Non-IID** breaks this, in several distinct ways relevant to a fleet:
| Type | Meaning | Example in the fleet |
|---|---|---|
| Label skew | Different clients see different proportions of attack types | A camera sees mostly recon traffic; a lock never sees DDoS |
| Feature skew | Same label, different underlying traffic pattern | "Compromised" traffic looks different on a lock vs. a camera even under the same attack family |
| Quantity skew | Very different data volumes per client | A gateway generates far more traffic than a battery sensor |
| Temporal/concept drift | Same event, experienced at different times by different clients | A new attack hits 3 devices in one region before the rest of the fleet sees it (already the Paper 2 example in the roadmap) |

**Why it matters:** plain FedAvg implicitly assumes near-IID data to converge cleanly; under non-IID conditions, local models drift toward what each client individually sees, and averaging drifted models can converge more slowly or less stably (this is why FedProx — used in Amamou et al. — adds a proximal term to limit local drift). FRL-IPS's own results confirm the practical cost directly: non-IID didn't break their system, but it did increase instability and stabilization time.

**Required for Paper 2's lead contribution (Candidate 1 above):** the experiment needs an explicit non-IID condition to test against — an all-IID run can't show whether MBRL handles heterogeneity better, only that both approaches work when there's nothing hard to handle. Plan: report both an artificial IID split (shuffled, random per-client slices) and a natural non-IID split (partitioned by device type/category) for both the MBRL and the model-free baseline, and compare stabilization time and final performance the same way FRL-IPS did.

## Datasets: Real and Freely Accessible (not simulated)

Confirmed by direct check, not memory:

- **CICIoT2023** — free direct download from the University of New Brunswick (https://www.unb.ca/cic/datasets/iotdataset-2023.html), also mirrored on Kaggle; ~13 GB uncompressed CSV, raw pcap also available; only requirement is citation. 105 devices, 33 attacks across 7 categories, per-device identifiers present (already the Stage 1 basis in the roadmap).
- **Edge-IIoTset** — free (Kaggle and IEEE DataPort), and purpose-built by its own authors for a centralized-vs-federated-learning comparison specifically, with existing shared federated-preprocessing notebooks on Kaggle as a starting point.

**What's real vs. what you still build yourself:**
| Piece | Source |
|---|---|
| Raw traffic, attack labels, device identifiers | Real — from the dataset |
| IID client split (shuffled random per-client slices) | **You construct this** — no dataset ships pre-split |
| Non-IID client split (grouped by device type/category) | **You construct this** — group real rows by device identifier, assign groups to simulated clients |
| Attack traffic patterns within each split | Real — regrouped, not invented |

No dataset comes pre-packaged as "client 1 / client 2 / ..." — the federated client-splitting protocol (how many clients, which devices go where, IID vs. non-IID assignment) is something to design on top of real data, the same way the Stage 1 identity-corruption protocol was designed on top of real CICIoT2023 data.

**Suggested split of labor between the two datasets:** Edge-IIoTset for the federated-mechanics/non-IID validation (its authors already established an IID/non-IID precedent to extend), CICIoT2023 for the Stage 1 identity/zero-day work already scoped in earlier updates.

## Working Title (unresolved, two open decisions)

Candidate: **"Belief-Driven Zero-Day Defense via Federated Reinforcement Learning in Heterogeneous IoT Networks"**

Two decisions still needed before this is final:
1. **MARL vs. federated RL** — "MARL" claims real-time coordination between agents (Backup A's territory). Everything scoped for Paper 2 so far (including the FRL-IPS comparison and Candidate 1 above) is **federated RL** — independent agents, shared training, no real-time coordination. Use "federated reinforcement learning," not "MARL," unless Backup A's coordination is deliberately folded in as a scope decision.
2. **"Heterogeneous" is ambiguous** — could mean heterogeneous protocols (the cross-protocol gap above), heterogeneous device types/non-IID data (already in scope for Paper 2), or heterogeneous network domains (BRIDGE/TCH-Net-style cross-dataset generalization, the lower-priority Candidate 3). Pick which one(s) the title is claiming before finalizing.


### Open items

1. Whether Bayesian record linkage has itself been applied to IoT/device-compromise tracking is unconfirmed (same unresolved novelty question as PMB, moved to a different method) — add "record linkage" / "entity resolution" to the expanded search protocol (Update 5).
2. EntityRes vs. PMB needs independent per-filter tuning (as was done for LMB vs. PMB in Update 5) before any performance claim between them is trustworthy.
3. The clock-skew-fingerprinting + sequential-belief combination described above is proposed, not built.
4. None of this replaces the Stage 1 CICIoT2023 go/no-go experiment.

## Colab Notebooks (updated)

- `lmb_stage0_sanity_check.ipynb`, `lmb_vs_alternatives_comparison.ipynb`, `lmb_vs_pmb_tuned_comparison.ipynb` — as before.
- `b0_b1_pmb_entityres_comparison.ipynb` (new) — proper B0 (oracle) vs. B1 (naive) separation, PMB, and the new Bayesian entity-resolution filter, with a written explanation of why spoofing defeats B1 but not B0 (and why that's not the same as B0 being a real defense).


---
---

# UPDATE 9 — 2 Oct 2026 (new section only; everything above is unchanged)

## Clarified: MARL/CTDE vs. Federated RL vs. Non-IID (terminology lock-in)

Resolved a recurring conflation from this session, worth recording precisely so it doesn't resurface:

- **Non-IID** is a property of the *data* (does each device's local traffic look statistically different from the others'?). **Heterogeneous traffic** is the real-world *cause* of non-IID (different device types naturally produce different traffic) — the two are cause and effect, not synonyms, and should be kept textually distinct in the eventual paper.
- **Federated** is a property of *how knowledge is shared for training* (weights/gradients, not raw traffic).
- **CTDE/MARL** is a property of *training architecture and runtime coordination* (a central critic sees joint information during training; at runtime, agents may or may not genuinely affect each other's decisions).
- These three axes are independent and stackable in one environment (a federated, CTDE-coordinated fleet operating on heterogeneous, non-IID traffic is a coherent, buildable design — not a contradiction).
- **The one unresolved fork that matters, carried over from Update 8 and still open:** does Paper 2's fleet involve agents whose actions genuinely affect each other at runtime (real CTDE, requiring some resolution of the joint-observation/privacy tension) — or do devices simply train together and act independently (federated RL, mislabeled as MARL if called otherwise)? This determines what Candidate 1's eventual result can actually claim credit for, and must be settled before Paper 2's methodology section is written.

## Corrected, De-Overclaimed Unified Description of Papers 1 + 2

The following consolidates this session's work into one accurate running description (Paper 1 + Paper 2 combined), with the earlier overclaim removed:

> The RL agent maintains a belief state (POMDP) over hidden network conditions, including an explicit zero-day/unknown-attack latent state, updated via a model-based world model combining MMPP (traffic arrival dynamics) with a DL RNN (GRU). PPO updates the policy from this belief. The system is trained in a federated environment across a fleet of heterogeneous IoT devices, whose differing traffic naturally produces non-IID data across clients. Privacy is partial, not absolute: only weights/gradients are shared, raw traffic stays local, but this does not fully rule out information leakage through model updates (gradient inversion / membership inference), and should be stated as such rather than as a full privacy guarantee.

**Explicitly NOT claimed (corrected from an earlier overclaim this session):** that the POMDP/MMPP/PPO architecture *automatically* handles non-IID heterogeneity well. This is restated as **Candidate 1**, an open, testable research question: *does MBRL's sample efficiency reduce the federated non-IID stabilization-time penalty FRL-IPS documents for model-free (DDQN) methods?* — to be tested against FRL-IPS's own measured stabilization-time numbers, not assumed.

## Structural Status: Papers 1 + 2 Near-Settled as the Core; 3rd/4th Contribution Still Open

Papers 1 and 2, as described above, are considered near-accepted as the thesis's technical core. This satisfies two of the advisor's required 3–4 contributions. **The remaining contribution(s) are not yet chosen.** Three candidates currently sit in the document, unassigned to a decided slot:

1. **Candidate 2 — Byzantine-robust belief fusion.** Defends against a fleet device that *lies* about its own existence/compromise belief (as opposed to standard federated defenses, which only guard against poisoned weights). Proposed mechanism: KL-divergence-based downweighting of local beliefs that diverge sharply from fleet consensus. Natural companion to Paper 2 regardless of which identity-robustness result Stage 1 produces — not a replacement for it.
2. **Candidate 3 — Cross-protocol generalization / lateral movement.** The broader, independently-evidenced gap found in Update 8 (smart-TV-to-Zigbee-lock pivot precedent, the 2026 Z-Wave dataset paper's explicit "no multi-protocol analysis support" finding, BRIDGE/TCH-Net's cross-domain generalization benchmark). Extends the existing MMPP/POMDP spread model across protocol boundaries rather than adding a new pillar. Currently flagged as lower priority / stretch rather than core, pending further scoping.
3. **Paper 3 — Twin-in-the-loop + interpretable belief states (XAI).** The original main-path idea, already scoped in detail (first section of this document), already has a known differentiation requirement against IDS-agent (OpenReview 2025) on file. Previously assessed as the weakest of the original three mains — worth re-weighing now against Candidates 2 and 3 rather than defaulting to it.

**Status:** none of the three is yet chosen or ruled out. Next step: deep-search Candidate 2 (Byzantine-robust belief fusion) specifically, to establish novelty/evidence the same way Candidate 1, PMB/LMB, and the cross-protocol gap were each checked earlier in this document, before deciding between the three.

## Open Items From This Update

1. Settle the real-CTDE-vs-federated-RL fork (carried from Update 8) before Paper 2's methodology is finalized.
2. Run a dedicated literature sweep on Candidate 2 (Byzantine-robust belief fusion / lying-device detection via KL-divergence belief downweighting) — search terms to add: "Byzantine robust federated reinforcement learning," "poisoned belief," "lying agent detection consensus," "KL divergence belief fusion security."
3. Once Candidate 2 is checked, weigh it head-to-head against Candidate 3 and Paper 3 (twin+XAI) to decide the thesis's 3rd (and possible 4th) contribution.
4. Carry forward all still-open items from Updates 1–8 (Mitchell-et-al.-style full reads, Zigbee dataset verification, 6G dataset search, Stage 1 CICIoT2023 experiment) — none are superseded by this update.


---
---

# UPDATE 10 — 2 Oct 2026 (replaces any earlier Update 10 draft; everything above is unchanged)

## Candidate 3 (Cross-Protocol Lateral Movement): Closest Prior Work, Corrected Novelty Wording, and Datasets

**Verification levels used below:** READ = full text or abstract seen directly. SECOND-HAND = known only through the Shafi thesis's own summary of it. UNVERIFIED = not found or not checked.

### 1. Closest prior work found (first pass, not a systematic review)

**1a. Shafi, M. (2024), York University MSc thesis — READ (abstract, literature review, synthesis, motivation, start of Sec. 3.2; NOT read: graph construction, dataset chapter, results).**
*"Intruders' Behavior Unveiled: A Dual-Tier Behavior-driven Model for Malicious Activity Detection in IoT Network Using Graph Learning."* Supervisor: Prof. Arash Habibi Lashkari. https://yorkspace.library.yorku.ca/items/475a57b3-e449-4909-9f95-fb086f5aefd5
- Dual-tier detector using (i) the hub's internet-facing traffic and (ii) internal device-to-device traffic, with a graph-learning component and threshold-based zero-day detection.
- Dataset created by the author: 50+ devices, 100+ attack scenarios, five months of capture; Wi-Fi/IP plus Z-Wave (feature tables labeled "IP-based" and "IoT-Zwave-based"). Zigbee not evidenced.
- **Relation to Candidate 3:** adjacent, not on target. The two tiers appear to be parallel streams combined at the decision step, with no evidence of tracking a compromise crossing a protocol boundary through the hub. Figure captions place IP-based attacks (week 16) and Z-Wave-based attacks (week 20) in separate weeks, which suggests single-protocol attacks and no labeled pivots (inference from captions, not read directly).
- Its own shortcomings list (Sec. 2.3) includes missing Z-Wave/Zigbee consideration (#3), missing multi-modal data (#7) and missing protocol-specific attacks (#8); it does not list lateral movement or pivoting. Consistent with the gap.
- **Dataset release status: unknown** (not stated in the portion read). Check the CIC/UNB site and contact the author.

**1b. MS-ZeroWall — abstract READ via search snippets; full text UNVERIFIED. (This is ref [67] in Shafi's thesis; match on VAE + dual-domain + AHMM description is strong.)**
Li, T., Hong, Z., Feng, W., Yu, L., Wen, Z., *"MS-ZeroWall: Detecting Zero-Day Multi-Step Attack in Smart Home Using VAE and HMM,"* IEEE Transactions on Vehicular Technology, vol. 73, no. 9, pp. 13278–13291, 2024. DOI: 10.1109/TVT.2024.3392793.
- Lightweight multi-step attack prediction for smart homes: a VAE-based dual-domain strategy (DVAE) for unknown multi-step threats, HMM + VAE to model multi-step attacks automatically, and an aggregated HMM (AHMM) for low-delay prediction.
- **Why it matters:** it is the closest thing found to sequential, belief-like inference over attack stages in smart homes. It is HMM-based, not POMDP/RL, and I have no evidence it handles protocol boundaries, but any "no sequential state inference for smart-home attack progression" claim is false.
- **Dataset used: not found.** Needs the full text.

**1c. Ramapatruni, S., Narayanan, S. N., Mittal, S., Joshi, A., Joshi, K. (2019) — READ (abstract) (ref [74] in Shafi's thesis).**
*"Anomaly Detection Models for Smart Home Security,"* 2019 IEEE 5th Intl. Conf. on Big Data Security on Cloud / HPSC / IDS, pp. 19–24. HMM trained on network-level sensor data from the authors' own smart-home testbed; reported 97% accuracy. Dataset: own testbed; public release not indicated.

**1d. Papers known only through Shafi's summaries (SECOND-HAND; titles/authors/venues UNVERIFIED — look these up from his bibliography):**
- **GODIT** (Graph-based Outlier Detection in the IoT): represents smart-home traffic as a real-time graph stream with shingling-based graph sketching; evaluated on real smart-home IoT traffic with ARP spoofing, Ping of Death and Smurf attacks (mostly DoS). Dataset not named in the summary.
- **GCN-Ensemble fusion model** (ref [14]): GCN + deep learning for IoT intrusion detection. Datasets named in the summary: BoT-IoT, ToN-IoT, CIC-IDS2018, NF-UQ-NIDS.
- **MAGPIE** (ref [23]): described as the first smart-home IDS using reinforcement learning to adapt its anomaly models, using both cyber and physical data sources. Dataset not named in the summary. Needs a full read as the only RL-in-smart-home-IDS precedent found.
- **Ref [28]** (title/authors not captured): anomaly correlation across network resources, evaluated on simulated Zigbee and WiFi subnetworks. The only cross-subnetwork Zigbee/WiFi correlation precedent found in this pass; simulated only.
- **Z-IoT** (ref [6]): device-class fingerprinting from packet inter-arrival times on 39 Zigbee and Z-Wave devices, >91% average precision and recall. Relevant to the measurement layer idea in Update 6.

### 2. Corrected novelty wording for Candidate 3

**Do not write:**
- "No graph learning applied to smart-home hub/IoT traffic" (false: Shafi, GODIT, GCN-based work).
- "No sequential state inference over multi-step smart-home attacks" (false: MS-ZeroWall, Ramapatruni et al.).
- "No RL in smart-home intrusion detection" (MAGPIE, pending full read).

**Defensible, pending a systematic sweep:** no work found that (a) models a compromise **crossing a protocol boundary through the hub** (e.g., Wi-Fi device -> hub -> Zigbee/Z-Wave device) as the object of detection, (b) maintains a belief over it that updates over time, and (c) drives graded responses from that belief. Graph methods in this space classify or profile behavior; HMM methods infer attack stages but not boundary-crossing; the RL precedent adapts classifiers rather than reasoning about pivots.

### 3. Datasets

**3a. Newly found and verified: "Smart Home Intrusion Detection Dataset" — multi-stage attacks (READ, full data article).**
Das, V. & Nair, B. B., *"A novel multi-stage attack dataset for smart home intrusion detection,"* Data in Brief, vol. 66, art. 112770, 2026. DOI: 10.1016/j.dib.2026.112770. Data: Mendeley Data, DOI 10.17632/x95b37z2vy.1 (https://data.mendeley.com/datasets/x95b37z2vy/1). License: CC BY. Plain CSV.
- 178,831 samples (148,959 train / 29,872 test); normal traffic plus 7 multi-stage attack scenarios generated with MITRE Caldera mapped to ATT&CK tactics (defense evasion, exfiltration, discovery, collection, staging, etc.); 23 flow features; per-target files (Device_1, Device_2, Device_win, Device_all); training and testing captured independently; baseline Random Forest (binary F1 0.927, multiclass accuracy 0.775).
- **Fit:** good for the *multi-stage / temporal* side (sequential attack stages, MITRE-grounded; a natural testbed for belief-over-stages ideas, and a benchmark against MS-ZeroWall-style methods). **Not** a cross-protocol dataset: Wi-Fi only, attacker inside the LAN.
- **Limitations that matter for a GNN:** IP addresses and ports were deliberately removed from the tables, so a device communication graph cannot be rebuilt from the CSVs (only coarse per-target grouping); raw filtered PCAP samples are provided only as a subset. No host-level data; imbalanced classes; small device set (about 10).

**3b. Previously listed, still the main candidates for the cross-protocol side:**

| Dataset | Use for Candidate 3 | Status |
|---|---|---|
| CICIoT2023 | Main graph basis: 105 devices, 33 attacks, hub-mediated Zigbee/Z-Wave devices (38 behind 5 hubs); free download | Verified earlier; hub-side edges only inferable |
| CIC IoT Dataset 2022 | Real multi-protocol hub topology (Wi-Fi/Zigbee/Z-Wave via a Vera Plus hub); 48 features, raw pcaps | Attack coverage and labels unchecked |
| Shafi / York smart-home dataset | Multi-protocol (IP + Z-Wave) benign and attack data, hub + internal traffic | Release status unknown |
| Song & Lin, Zigbee Dataset for Smart Home and Security Analysis (IEEE Dataport, 2024) | Zigbee plus the IP side (Home Assistant) of the same home | Subscription required; attack labels unknown |
| ZigBeeNet (Zenodo, 2024) | Zigbee-side topology only, 15 devices, 20 days | Likely benign only |

**3c. Datasets named in the related work (SECOND-HAND, via Shafi's summary of the GCN-Ensemble paper):** BoT-IoT, ToN-IoT, CIC-IDS2018, NF-UQ-NIDS. Flow datasets with IPs, so usable for a *graph-method sanity baseline*, but none has Zigbee/Z-Wave or cross-protocol structure. MS-ZeroWall, GODIT and MAGPIE datasets: UNVERIFIED.

**Bottom line:** still no dataset with labeled cross-protocol pivots. Realistic plan: real benign multi-protocol topology (CICIoT2023, CIC IoT 2022, York if released) + injected, documented pivots, with the Das & Nair data as the real-data benchmark for the multi-stage/temporal component.

### 4. Evaluation protocol (design, not yet built)
1. **Graph construction:** nodes = devices + hub(s); edges = communications per time window with protocol as an edge attribute; hub as an explicit protocol-boundary node.
2. **Benign baseline:** learn normal structure from real multi-protocol benign traffic.
3. **Pivot injection:** insert cross-protocol edges following documented patterns (compromised Wi-Fi device -> hub -> unseen Zigbee/Z-Wave target) with ground-truth labels; vary fan-out, timing, stealth, hop count; keep injection styles held out from training.
4. **Baselines:** new-edge/new-neighbor heuristic vs. GNN (the "why a GNN" justification), plus an HMM stage-tracker in the style of MS-ZeroWall/Ramapatruni et al. as the sequential-inference baseline.
5. **Multi-stage benchmark:** run the belief/temporal component on the Das & Nair data against the Random Forest baseline and MS-ZeroWall-style HMM.
6. **Honest framing:** injected pivots are synthetic evidence on real topology (same simulation-trust category as earlier objections); report sensitivity sweeps; use real held-out data wherever it exists.

### 5. Open items
1. Read the York thesis Sec. 3.2 onward (graph construction, dataset chapter, results); confirm whether the model is cross-protocol and whether the dataset is public.
2. Read MS-ZeroWall in full: dataset, whether any protocol boundary is modeled, how its HMM differs from a POMDP belief.
3. Look up GODIT, the GCN-Ensemble paper, MAGPIE and ref [28] from Shafi's bibliography (titles, authors, datasets).
4. Download the Das & Nair dataset and confirm whether per-target files allow any usable graph structure.
5. Check CIC IoT 2022 attack coverage; check whether CICIoT2023 pcaps allow hub-side edge reconstruction.
6. Run the systematic sweep (IEEE Xplore/ACM DL/Scopus) for: cross-protocol / multi-protocol lateral movement, pivot, hub, Zigbee, Z-Wave, smart home, combined with graph, HMM, POMDP, belief.
7. Carry forward the GNN-vs-heuristic justification and the GNN-to-POMDP evidence interface from earlier discussion.

---
---

# UPDATE 11 — 5 Oct 2026 (new section only; everything above is unchanged)

## Potential Proposal PPT Blueprint (10-13 slides, topic outline only — not drafted content)

Structure requested: Problem → Gaps → Significance of Study → Literature Review window → Contributions → close. Slide 10 deliberately shows the leading pair plus one demoted backup rather than a forced single answer — this reflects the actual, evidence-driven state of the roadmap and should not be resolved further before the real literature sweep is done.

**Leading pairing for the 3rd/4th contribution, corrected this update:** Candidate 3 (cross-protocol lateral-movement belief tracking) + Paper 3 (twin-in-the-loop + belief-state XAI). Candidate 2 (Byzantine-robust belief fusion) is demoted to backup/contingency only — crowded field, real risk of a "just combining existing models" attack, per Update 9's own assessment.

**Slide 1 — Title**
- Working title (per Update 8), presented as a research direction under review, not a finished thesis

**Slides 2–3 — The Problem**
- IoT devices multiply faster than security keeps pace; most defenses are detection-only, not decision-making
- Zero-day attacks defeat classification-based detection by definition, no known signature to match
- Fleet-scale deployments need coordinated defense without centralizing private raw traffic
- Real-world device identity is unreliable (MAC rotation, hub aggregation, spoofing), yet pipelines assume clean IDs
- Attackers pivot across protocols (Zigbee/WiFi/5G) through shared hubs, largely unwatched by any single-protocol defense

**Slide 4 — The Gaps**
- No work found combines a belief over hidden state + an explicit novelty/zero-day latent state + graded actions, in IoT
- Federated defense exists but is mostly model-free (DDQN); MBRL's sample-efficiency advantage under non-IID fleets is untested (Candidate 1)
- Enterprise has solved graph-based lateral-movement detection; IoT has not, and no work applies belief-driven RL to protocol-crossing pivots (Candidate 3)
- IoT IDS explainability exists at the alert level (LLM-narrated); nothing explains belief-state dynamics themselves (Paper 3 / XAI)
- Byzantine-robust federated learning defends poisoned *weights*, not a device lying about its own *belief* — a real gap, but one already closely approached by existing work (SF-CABD); kept as backup, not a primary gap claim

**Slide 5 — Significance of the Study**
- Moves IoT defense from "detect and classify" to "believe and act under uncertainty" — a structurally different, more generalizable paradigm
- Fleet-scale learning without centralizing raw traffic — privacy-relevant at real deployment scale
- Treats identity ambiguity and protocol-crossing attacks as first-class problems rather than assuming them away
- Belief-state interpretability gives operators a reason to trust/act on the agent's decisions, not just a black-box alert

**Slides 6–7 — Literature Review Window**
- Closest methodological precedent: Hammar & Stadler (POMDP + PPO, OT intrusion response), no zero-day layer
- Closest zero-day+PPO precedent: Siamese-similarity + PPO IDS, no belief state
- Closest Paper 2 overlap: Amamou et al. (AINA 2026) — FedProx + GRU + Agentic AI; needs explicit differentiation
- Closest lateral-movement work: enterprise GNN-based detection (Rabbani 2024) — not IoT, not belief-driven
- Closest XAI precedent: IDS-agent (OpenReview 2025) — LLM-narrated alerts, not belief-state dynamics
- Closest Byzantine-adjacent work (backup only): SF-CABD (Byzantine-robust + non-IID combined) — defends weights, not beliefs
- One summary comparison table (belief / novelty-state / PPO / domain) across the closest 8-10 papers

**Slide 8 — Contribution 1: Zero-Day-Aware Belief Agent (Paper 1)**
- POMDP belief + explicit "unknown attack" latent state + MMPP/GRU world model + PPO
- Status: core technical asset, near-settled

**Slide 9 — Contribution 2: Federated Fleet-Scaling (Paper 2)**
- Federated (weights, not raw data) sharing across a device fleet
- MBRL vs. model-free convergence under non-IID — Candidate 1, explicit open research question, benchmarked against FRL-IPS
- Status: near-settled, differentiator vs. Amamou et al. prepared

**Slide 10 — Contribution 3/4: Leading Pair + Backup**
- **Primary: Cross-protocol lateral-movement belief tracking (Candidate 3)** — GNN + POMDP; cleanest gap found across all candidates checked; requires building and justifying a new model family (GNN), higher build cost than Papers 1-2
- **Primary: Twin-in-the-loop with belief-state XAI (Paper 3)** — original main-path idea, already scoped; differentiator vs. IDS-agent already on file (belief-state dynamics specifically, not LLM-narrated alerts); self-assessed weakest of the original three mains, worth re-confirming now against stronger literature footing
- **Backup only: Byzantine-robust belief fusion (Candidate 2)** — demoted from primary pairing; crowded field (SF-CABD, fault-tolerant FRL for IoT already close); real risk of a "you're just combining existing models" attack; held in reserve in case Candidate 3 or Paper 3 falls through under deeper search
- Status: Candidate 3 + Paper 3 is the working primary pair; final confirmation still pending a dedicated literature sweep on each

**Slide 11 — Evaluation Plan / Methodology Snapshot**
- Datasets: CICIoT2023 (identity/zero-day), Edge-IIoTset (federated/non-IID)
- Stage 0/1 go/no-go experiment design for the identity question, with a pre-registered decision rule
- FRL-IPS's own stabilization-time numbers as the Candidate 1 benchmark to beat

**Slide 12 — Roadmap / Timeline**
- Paper 1 → Paper 2 → 3rd/4th contribution confirmation → validation → writing

**Slide 13 — Conclusion / Ask**
- What's being asked of the committee today: feedback on the Candidate 3 + Paper 3 pairing specifically, not approval of a finished plan

## Open Items From This Update

1. Dedicated literature sweep to confirm Candidate 3's gap more rigorously (IEEE Xplore/ACM DL/Scopus, not just the general searches run so far)
2. Re-confirm Paper 3's differentiation against IDS-agent holds up under the same depth of check applied to Candidate 3
3. Build actual slide content/visuals once both legs of the primary pair are confirmed
4. Everything from Updates 1-9's open items remains outstanding and unaffected by this correction


## Section 12 — Potential Committee Questions (Summary)

| Question | Recommended answer (summary) |
|---|---|
| Is IID universal, or a RAIDEN-specific term? | Universal — basic statistics terminology, decades old, owned by no paper or system. |
| What does "heterogeneous" mean — which field? | Ambiguous as currently used. "Heterogeneous networks" already means HetNets in telecom (macro/micro/pico/femto cells) — a different meaning than heterogeneous protocols (WiFi/Zigbee/5G) or heterogeneous data (non-IID). Must disambiguate at first use in the thesis. |
| MAPPO vs IPPO vs PPO vs BF-PPO — which applies where? | PPO = single-agent foundation. BF-PPO (Hammar & Stadler) = closest precedent for Paper 1 (PPO + approximate belief). IPPO = independent PPO per client, federated via weight averaging — this is what Paper 2 actually is. MAPPO = centralized critic + decentralized actors = CTDE proper — only use this term if Backup A's real coordination is folded in. |
| Why MBRL in IoT, not plain RL, if simulation is cheap? | Two reasons: (1) MBRL minimizes *real* interaction needed, which matters because real deployment interaction isn't cheap/safe the way a lab simulator is; (2) the world model isn't just an RL convenience — the GRU's prediction residual IS the POMDP's observation/anomaly signal. Structural necessity, not a performance nice-to-have. |
| What is OT, and how does it compare to IoT? | OT = Operational Technology (SCADA/PLCs — power, water, manufacturing). Differs from IoT in protocols (Modbus/DNP3 vs Zigbee/BLE/WiFi), lifecycle (decades vs years), stakes (physical safety vs mostly data/privacy), threat actors (nation-state APTs vs opportunistic botnets), and scale/diversity (fewer, standardized vs massive, heterogeneous). Hammar & Stadler's POMDP/PPO work is OT — closest precedent, not a direct match; say this explicitly when citing. |
| Cross-protocol attack — concrete example and defense? | Example: WiFi camera compromised via firmware CVE → shared hub bridges WiFi/Zigbee → attacker issues Zigbee commands through the trusted camera → unlocks a Zigbee smart lock never directly reachable from the internet. Defense: same core belief-update engine (POMDP/Bayesian filtering) across protocols, but protocol-specific measurement/feature extraction (Zigbee and WiFi traffic look nothing alike) and a new graph-structured propagation layer across the bridge point (not independent per-device beliefs). Extension of existing infrastructure, not a separate system. |
| Is XAI a real contribution or an add-on? | Mostly an add-on as currently scoped (roadmap already flagged Paper 3 as weakest of the three). IDS-agent already occupies generic "LLM-narrated IDS explanation." Only defensible angle: explaining belief-state dynamics specifically. Useful for deployability/SOC trust, not a PhD-level pillar on its own — position as a trust layer on top of the core contribution. |
| "I have zero contributions, just linking papers together" | Test: does the combination solve something the pieces don't solve separately, for a structural reason? Passes here: (1) Paper 1's GRU residual IS the POMDP observation — causal dependency, not decoration; (2) genuine open empirical questions exist (MBRL vs FRL-IPS's federated stabilization cost — nobody has published this comparison); (3) already produced one real finding (LMB/PMB/EntityRes statistically tied once fairly tuned, correcting an earlier unfair comparison). Committees expect a well-motivated problem + coherent approach + credible validation plan at proposal stage, not finished novel theorems. The insurance policy: the identity-corruption and non-IID splitting protocols are themselves citable benchmark artifacts regardless of headline results (same framing BRIDGE/TCH-Net uses for itself). |

---

## Section 13 — Federated Learning Algorithms: FedAvg, FedProx, FedPPO-PG

**FedAvg (Federated Averaging)** — McMahan et al., 2017. The foundational algorithm. Each client trains locally for a few steps on its own data, sends updated *weights* (never raw data) to a server. The server averages them (typically weighted by each client's data volume) and redistributes the averaged model. Every other federated algorithm is a variation on this loop. Implicitly assumes near-IID data to converge cleanly and smoothly.

**FedProx** — the standard fix for non-IID data (and the method Amamou et al. use). Adds a proximal term to each client's local loss function, penalizing local weights for drifting too far from the current global model during local training. Doesn't eliminate the non-IID slowdown, but bounds how far local training can diverge before averaging — directly relevant given the label/feature/quantity/temporal skew expected across a real device fleet.

**FedPPO-PG** — a federated multi-agent PPO framework (smart-grid domain, *not* the SDN/FRL-IPS paper — that one uses DDQN; see the correction logged in Update 8). Coordination via periodic federated averaging of PPO actor weights, combined with centralized, critic-guided advantage estimation during training, while preserving decentralized execution at deployment. The closest found algorithmic precedent for *federating a PPO-based agent specifically* — useful as an implementation reference for Paper 2's agent, separately from FRL-IPS's role as the closest *security/non-IID-evaluation* precedent.

**For this thesis:** FedAvg is the baseline to compare against; FedProx is the realistic implementation given known non-IID conditions; FedPPO-PG is the closest reference for federating PPO mechanics specifically (Paper 1's agent is PPO-based, not DDQN like FRL-IPS).

**Implementation note:** Flower (`flwr`) is the library to use — framework-agnostic, wraps an arbitrary local training loop (needed for a PPO/MBRL update step, unlike libraries assuming standard supervised gradient descent), and is the same tool FRL-IPS itself used. Its Simulation Engine runs multiple virtual clients in a single process, suited to Colab prototyping. `flwr-datasets`' `DirichletPartitioner` (alpha parameter controls heterogeneity — lower alpha = more non-IID) gives a ready-made, continuous IID→non-IID sweep for the FRL-IPS-style stabilization-time comparison, rather than needing a hand-built device-type split.



---
---

# UPDATE 12 —  (new sections only; everything above is unchanged)

## Section 14 — Deployment Architecture: Three Layers, and Where MBRL/Federation/CTDE Each Apply

**The question that triggered this:** is this built for a single smart home (devices A, B, C), a vendor's fleet across many homes (Home 1, Home 2, ...), or a smart city — and does CTDE help at each scale? Answer: these aren't the same problem at different scales, they're three structurally different layers, and MBRL/federation/CTDE each answer a different one.

### The three layers

| Layer | What it is | Mechanism | Coordination needed? |
|---|---|---|---|
| **1 — within one home** | Devices A, B, C on one network/hub; real-time pivot risk between them | MBRL/POMDP/PPO agent(s) — granularity TBD (see below) | **Yes, if per-device agents and devices share a bridge point; no, if a single per-home agent is used** |
| **2 — vendor fleet across homes** | Home 1, Home 2, ... — same device type, structurally similar but physically independent | Federated RL (independent IPPO instances + FedAvg/FedProx) | No — homes share no infrastructure, nothing to coordinate in real time |
| **3 — smart city** | Many homes/buildings, possibly multiple vendors | **Hybrid**: MARL/CTDE within adjacency clusters that share infrastructure + federated RL across clusters that don't | **Depends on shared infrastructure, not on scale** (see decision rule below) |

### MBRL's role

MBRL is fundamentally a **Layer 1** concept — it's about how one agent learns efficiently from its own local world model (the GRU). It doesn't change shape across layers; it's the thing running locally at whichever granularity is chosen. It does not, by itself, decide whether coordination across agents is needed — that's a separate question, answered below.

**Open granularity decision (not yet resolved):** per-device agents (one GRU/POMDP/PPO per physical device) vs. per-home agents (one agent observing/acting across all devices in a home via a joint feature vector). Per-home is simpler (no multi-agent machinery, single bigger observation/action space). Per-device matches Paper 1's original framing more directly but only pays off if real-time cross-device coordination (CTDE) is actually used — otherwise it's unnecessary complexity. **This decision determines whether CTDE is relevant at Layer 1 at all**, and should be made explicitly rather than left implicit.

### The decision rule for when coordination (CTDE/MARL) is justified

Not a function of scale. Coordination is justified when, and only when, entities:
1. **Share infrastructure an attacker could pivot through**, and/or
2. **Face infection/attack spread faster than a federated round-trip could catch** (federated aggregation happens in rounds; real-time coordination doesn't wait for a round).

If neither holds, independent federated clients are sufficient and cheaper — CTDE's centralized-critic cost isn't justified by scale alone, and doesn't scale cleanly to thousands of agents regardless.

### Layer 3 (smart city), corrected

Initial framing treated Layer 3 as uniformly federated-only, reasoning by analogy to Layer 2 (independent homes). **This was wrong** — it implicitly assumed city-scale entities are as mutually isolated as separate vendor-fleet households, which is usually false: city entities commonly share real infrastructure (municipal WiFi mesh, neighborhood 5G cell/RSU, shared substation), which is a genuine pivot point by the decision rule above.

**Corrected architecture:** hierarchical, not flat — **MARL/CTDE nested inside each adjacency cluster** (entities sharing a gateway/substation/mesh), **federated aggregation across clusters** that share no infrastructure. This is also a practical necessity: clustering by shared infrastructure is what keeps the coordinated (CTDE) portion computationally tractable, since a single centralized critic cannot scale to city-wide agent counts directly.

---

## Section 15 — Cross-Protocol Lateral Movement Is the Concrete Justification for CTDE/MARL

**Not a separate idea from the architecture above — it's the mechanism that activates the CTDE branch of Section 14's decision rule.**

Checking the cross-protocol scenario (WiFi camera compromised → shared hub bridges WiFi/Zigbee → attacker reaches a Zigbee lock never directly internet-reachable) against the two-part decision rule:
- **Shared infrastructure?** Yes — the hub is exactly that.
- **Real-time pivot risk?** Yes — the attack is one continuous sequence, not spread over a timescale a federated round could catch.

This is the textbook case the decision rule describes. **Without a scenario like this, "why pay for CTDE instead of pure federated agents everywhere" has no good answer — cross-protocol pivoting is that answer.**

**Important scope limit — this does not mean CTDE applies broadly:**
1. **Protocol-specific measurement models** (Zigbee vs. WiFi/TCP feature extraction) are a feature-engineering problem, needed regardless of coordination scheme — not itself a CTDE question.
2. **Graph-structured belief propagation across the bridge point** (a WiFi-segment device's rising compromise probability should influence the Zigbee-segment belief in real time) — this *is* the CTDE-relevant part, and it applies **only within one hub's/cluster's reach**.

Two homes, each with their own independent hub, do not need real-time coordination *with each other* — Home 1's camera-to-lock pivot has no effect on Home 2, since they share no bridging infrastructure. Across homes: still federated RL, consistent with Layer 2/Section 14.

**One-line defense framing:** *"Cross-protocol pivoting is why coordination is needed at all — it's not an academic add-on, it's the specific attack that makes a purely federated, non-coordinating design insufficient."*

### Open items from this update
1. Resolve the per-device vs. per-home agent granularity decision (Section 14) — this also finally settles whether "CTDE" belongs in the thesis title, an open question since early in this roadmap.
2. Define the adjacency-clustering criterion concretely for the smart-city case (what counts as "shared infrastructure" — same hub? same gateway? same subnet?) before this becomes experimental design.
3. This remains architectural reasoning, not yet validated against data or a simulation — no experiment has tested whether round-trip federated aggregation is actually too slow to catch a real cross-protocol pivot; that latency comparison is itself a testable future experiment, not yet designed.


---
---

# UPDATE 13 — 8 Oct 2026 (new section only; everything above is unchanged)

## New Recommendation: Three-Paper Path, "Believe → Scale → Coordinate"

**Status:** recommendation for further study, not a final decision. It restructures the 3 main papers around one dependency chain. Items marked (suggestion) are my additions, not decisions already in the roadmap. Items marked (verify) were not checked against full text.

### 1. The three papers

| Paper | Name | What it does | Depends on |
|---|---|---|---|
| **1** | Believe | POMDP + PPO (or BF-PPO) agent with an explicit zero-day/unknown-attack belief, using an MMPP + GRU world model (MBRL) | Nothing, it is the base |
| **2** | Scale | The same Paper 1 agent trained federated across homes/devices, evaluated under non-IID traffic (Candidate 1: does MBRL reduce the federated stabilization-time penalty that FRL-IPS reported for model-free DDQN?) | Paper 1 |
| **3** | Coordinate | MARL/CTDE for cross-protocol defense inside a home (Wi-Fi to hub to Zigbee/Z-Wave pivots), built on the federated model from Paper 2 | Papers 1 and 2 |

**Thesis arc:** Believe (Paper 1) → Scale (Paper 2) → Coordinate (Paper 3).

### 2. What changes versus the earlier roadmap

- **Digital twin + belief-state XAI (old Paper 3) is no longer a core paper.** It becomes an optional extension. This removes the weakest paper and the overlap with IDS-agent.
- **Candidate 3 (cross-protocol) and the MARL/CTDE question merge into one paper (the new Paper 3).** This matches Section 15: cross-protocol pivoting is the concrete reason coordination is needed.
- **The GNN is now optional, not assumed.** Under MARL, agents could share beliefs directly instead of a separate graph model scoring the hub. Decide whether the GNN stays (see question 4 below).
- **Candidate 2 (Byzantine-robust belief fusion) stays a backup only** (crowded field, "just combining models" attack risk).
- Updates 11's PPT blueprint (Slide 10 pairing of Candidate 3 + XAI paper) would need revising if this structure is adopted.

### 3. Recommendation

Adopt Believe → Scale → Coordinate as the working structure, with XAI/twin as an optional extension and Candidate 2 as backup. Reasons:
1. Each paper strictly builds on the previous one, so the path reads as one system, not four separate ideas.
2. Federation and MARL both appear in the thesis, which resolves the earlier worry that Candidate 3 and the XAI paper contained neither.
3. CTDE gets a concrete justification (shared-hub pivoting) instead of being asserted.
4. It drops the two papers with the weakest novelty position (XAI/IDS-agent overlap, Byzantine/SF-CABD overlap).

For the committee, present the whole system as the vision, and keep the build order (1 → 2 → 3) honest on the roadmap slide.

### 4. Decisions to settle before writing (with potential answers)

**Q1. What is the "agent" unit: per device or per home?**
- *Per-device agents:* needed for Paper 3 (several agents inside one home must exist to coordinate). Paper 1 should then be designed per-device from the start.
- *Per-home agent:* simpler, but then there is no multi-agent coordination inside a home and Paper 3 loses its CTDE justification.
- *Potential answer (suggestion):* design Paper 1's agent so it can run per device, and evaluate it first on a single network. Record this choice explicitly, because it also decides whether "CTDE" belongs in the title.

**Q2. How does the federated model reach the MARL agents in Paper 3?**
- *Potential answer (suggestion):* the federated global model is each device agent's starting point, then CTDE training teaches the agents to share beliefs across the hub.
- Decide and record whether the federated weights are frozen or fine-tuned during Paper 3.

**Q3. Is it CTDE/MARL or federated RL?**
- Rule from the roadmap: CTDE only fits when agents' actions affect each other (shared infrastructure, or spread faster than a federated round-trip).
- *Potential answer:* Paper 2 is federated RL (independent PPO agents, shared weights, no real-time coordination, IPPO-style). Paper 3 is the CTDE/MARL part (MAPPO-style shared critic during training), limited to devices sharing a hub. Across separate homes the design stays federated.

**Q4. Does the GNN stay?**
- *Keep it* if the agents need structural evidence about who connects to whom through the hub.
- *Drop it* if shared beliefs between agents carry that information already.
- *Potential answer (suggestion):* start without the GNN, and add it only if a simple new-neighbor heuristic baseline performs poorly. This also gives the "why a GNN" justification a measured basis.

**Q5. What is the unit of "stabilization time" for Candidate 1?**
- The roadmap quotes FRL-IPS as needing "more training to stabilize" but I only have that one line (verify). The unit could be training rounds, episodes, or environment steps.
- *Potential answer:* read the paper's experiment section, then define your metric in the same unit so the comparison is fair. If the cost is mostly real interaction, MBRL's imagined rollouts could plausibly reduce it; if it is rounds, they may not.

### 5. Likely committee questions and potential answers

**Why federated learning at all?**
- Federation has real costs (slower convergence, update leakage). Justify it only where centralizing is undesirable: continuous per-device traffic is behaviorally sensitive, expensive to ship at fleet scale, and constrained by data-minimization expectations (verify the exact legal framing for your target regions).
- Include a **centralized baseline** to measure exactly what federation costs and buys.
- Weak point to prepare for: RAIDEN already uses arrival-rate summaries, so the privacy argument is weaker than for raw packets. Lean on scale and data-minimization, and state privacy narrowly.

**Is it private?**
- Say: raw traffic never leaves the device (data minimization); no formal privacy guarantee is claimed; update leakage (gradient inversion, membership inference) is a known risk, addressed as a bounded extension using secure aggregation and/or differential privacy.
- Note that differential privacy noise slows convergence, which interacts with Candidate 1. Decide whether to run Candidate 1 without DP, or include a DP arm.
- Attack and defense references (Zhu et al., Bonawitz et al., McMahan et al.) come from background knowledge (verify titles and years before citing).

**Why model-based RL (MBRL) here?**
- It reduces the real interaction needed, and the GRU world model's prediction residual is also the POMDP's anomaly/observation signal. Frame the federated benefit as a hypothesis (Candidate 1), not a guaranteed property.

**Is MARL the contribution?**
- No. CTDE for IoT defense already exists (for example H-MARL on CAGE-4). The contribution is cross-protocol belief propagation inside the hub's reach, justified by the pivot scenario.

**How do you get data for cross-protocol pivots?**
- No dataset with labeled cross-protocol pivots was found. Plan: real benign multi-protocol topology (CICIoT2023, CIC IoT 2022) plus injected, documented pivots, with sensitivity sweeps and held-out injection styles. State plainly that injected pivots are synthetic evidence on real topology.

**How is Paper 2 different from Amamou et al. (AINA 2026)?**
- They federate the weights of a detector inside an agentic system. This thesis federates a belief-driven, decision-making agent with an explicit unknown-attack belief and tests the non-IID cost of model-based vs. model-free learning. Re-verify against their full text.

**"You are just combining existing models."**
- Test: does the combination solve something the pieces cannot for a structural reason? Paper 1's GRU residual is the POMDP observation (a dependency, not decoration), and Candidate 1 is an open empirical question with a published baseline to beat.

**What if a paper fails?**
- Paper 2's result is meaningful either way (MBRL helps, or it does not and you report the cost). Paper 3 is the riskiest empirically, so keep Candidate 2 (Byzantine-robust belief fusion) and the XAI/twin extension as fallbacks.

### 6. Main risks

1. **Paper 3's evidence:** synthetic pivots, no labeled data, and the "federated round-trip is too slow to catch a pivot" claim is untested.
2. **Agent-unit mismatch (Q1):** if Paper 1 is built per-network and Paper 3 needs per-device agents, work gets redone.
3. **Search depth:** all novelty claims come from open-web and single-index searches, not a systematic IEEE Xplore/ACM DL/Scopus sweep.
4. **Scope:** keep XAI/twin and Candidate 2 out of the main plan unless a core paper falls through.

### 7. Open items from this update

1. Decide Q1 to Q5 above and record the answers.
2. Revise the PPT blueprint (Update 11) to match the Believe → Scale → Coordinate structure.
3. Read FRL-IPS's experiment section to fix the unit of stabilization time.
4. Run the systematic literature sweep for cross-protocol / hub-mediated lateral movement with MARL/CTDE (Section 15 reasoning is architectural only, not yet tested).
5. Carry forward all open items from Updates 1 to 12; none are superseded by this update.

---
---

# UPDATE 14 — 8 Oct 2026 (new section only; everything above is unchanged)

## Likely Committee Questions on Federated Learning: Federated vs. Centralized, Scale and Bandwidth, then Privacy

**Status:** study notes with prepared answers. Items marked (verify) come from my background knowledge or a single quoted line and were not checked against full text. Real-life analogy used throughout: a pizza chain whose shops keep their own receipts.

---

### Part A. Federated vs. Centralized (vs. Decentralized)

**Q1. What is the difference between centralized, federated and decentralized training?**

| Setup | Who trains | What travels over the network | Central server? |
|---|---|---|---|
| **Centralized** | One server, on pooled data | All raw traffic | Yes |
| **Federated** | Each device or home trains locally | Only weight updates | Yes, but it only averages weights |
| **Decentralized (peer-to-peer)** | Each device trains locally | Weights swapped directly between neighbors | No |

- **Smart-home example:** in centralized training, 10 devices upload raw traffic (source, destination, timing) to one server that sees everything. In federated training, each device keeps its raw traffic, trains locally, and sends only weight updates. The device still uses source, destination and timing locally; it just never ships them out.
- **Pizza analogy:** centralized = every shop mails all its receipts to head office, which writes one recipe book from the pile. Federated = each shop tweaks the recipe locally and mails only the tweak.
- **Terminology trap:** "decentralized" has two meanings. In CTDE, "decentralized execution" means each agent acts on its own at runtime. In the table above, "decentralized" describes the training communication layout (no central server). A federated system can have decentralized execution without being peer-to-peer.

**Q2. What does this have to do with IID and non-IID?**

- **IID** = Independent and Identically Distributed: every device's data looks statistically alike.
- **Non-IID**: devices' data genuinely differs (different device types, usage patterns, attack mixes).
- Centralized training pools and shuffles everything, so the mixture behaves like IID data and **non-IID does not hurt it**. Federated training keeps data separated, so each device's skew shows up as **client drift** (local models specialize in what they individually see, and averaging them gives a temporarily worse blended model).

| | Data location | Does non-IID hurt? |
|---|---|---|
| Centralized | Pooled in one place | No (pooling smooths differences) |
| Federated, IID | Stays local, devices look alike | Barely |
| Federated, non-IID | Stays local, devices differ | Yes: slower and shakier |

- **Why centralized is the baseline:** it is the "no-problem" reference. The gap between centralized and federated-under-non-IID is the exact cost of choosing federation.
- Non-IID types for the fleet: label skew (camera sees mostly recon, lock mostly access attempts), feature skew (same attack looks different on different devices), quantity skew (gateway vs. battery sensor), temporal drift (new attack hits some devices first).
- Heterogeneous traffic is the real-world *cause*; non-IID is the resulting statistical property. Keep the two terms distinct in the thesis.

**Q3. What is the weakness of federated learning that Paper 2 targets?**

- Quoted finding from FRL-IPS (federated DDQN intrusion prevention across SDN domains), the only line I have: federated training reaches prevention behavior comparable to centralized training at steady state, but needs more training to stabilize, and heterogeneity increases transient variability and stabilization time.
- Plain reading: it works eventually, but the journey is slower and shakier.
- **Do not claim more than this.** I do not know whether the paper measures stabilization in rounds, episodes or environment steps (verify from the experiment section). That unit decides what Candidate 1 measures and how MBRL's imagined rollouts could help.
- **Candidate 1 stays a hypothesis:** MBRL's imagined rollouts may reduce the non-IID stabilization penalty relative to a model-free agent. It is not a guaranteed property of the architecture. Frame it as a research question benchmarked against FRL-IPS.

**Q4. Is a federated agent just a weaker version of a centralized one?**

- Prepared answer: federation costs convergence speed, and I do not claim it beats centralized training. I include a centralized baseline to measure exactly what federation costs and what it buys. The Paper 2 question is whether a model-based agent shrinks that cost.

---

### Part B. Why Federated at All? Scale and Bandwidth

**Q5. Why use federated learning anyway?**

Federated learning is justified only when centralizing the data is a problem. Name which problem. Pizza analogy: head office should collect receipts unless that is too costly, forbidden, or distrusted.

| Reason | Argument | Strength / caveat |
|---|---|---|
| **Scale and bandwidth** | At fleet scale, continuously shipping raw traffic from every device becomes a bottleneck. Weight updates are sent periodically. | Strong in general. But the saving depends on model size and number of rounds, so **measure communication cost** instead of assuming it. RAIDEN's inputs are already small arrival-rate summaries, which weakens this argument for RAIDEN specifically. |
| **Data sensitivity** | IoT traffic patterns reveal behavior (when a lock talks shows when someone is home). Centralizing builds a database of household routines. | Strong, but see Part C: weights are not private by guarantee. |
| **Regulation / data minimization** | Rules such as GDPR's data-minimization principle push toward not moving personal data unless necessary; some jurisdictions restrict cross-border transfer. | (verify) exact legal framing for the regions you target before citing. |
| **Trust and ownership** | If devices belong to customers, they are more willing to participate when raw data stays home. | Soft argument; use as support, not as the lead. |
| **User preference / policy** | Some deployments or users prefer or require keeping data local. | Valid as an additional layer. |

**Q6. "Your devices already phone home to the vendor's servers. Why not send the traffic there too?"**

- Phoning home for firmware updates or control is not the same as uploading continuous behavioral traffic: different volume, different sensitivity.
- Do not lean mainly on privacy for this scope. Bandwidth and data-minimization are the safer arguments, and privacy should be stated narrowly.

**Q7. "RAIDEN uses arrival rates, already compressed summaries. Why federate?"**

- Honest answer: per-device arrival-rate series can still reveal usage patterns (occupancy, schedules), and per-device streams still scale poorly. But concede that this makes the privacy argument weaker than for raw packets. This is another reason to lean on scale and data-minimization.

**Prepared answer (say it out loud):**

> "Federated learning isn't free: it converges more slowly and update leakage is a known risk, so I don't claim it's better than centralized training. I use it where centralizing is undesirable: continuous per-device traffic is behaviorally sensitive, expensive to ship at fleet scale, and increasingly constrained by data-minimization expectations. I include a centralized baseline to measure exactly what that choice costs, and my Paper 2 question is whether a model-based agent can shrink that cost."

**Framing to decide before the meeting:** is federation central to the thesis claim or a deployment choice? Candidate 1 treats it as central (non-IID stabilization is the experiment), so the honest framing is that Paper 2 studies the *cost* of federation and how to reduce it, not that federation is inherently superior.

---

### Part C. Privacy

**Q8. Why isn't it accurate to call federated learning "private"?**

- Plain version: sharing weights instead of raw data is **data minimization, not a privacy guarantee**. A weight update is computed *from* the local data, so it carries a compressed fingerprint of it. Pizza analogy: a recipe tweak saying "use less anchovy, double the garlic" tells head office what the neighborhood likes, and with effort could be worked backward toward individual orders.
- Known leakage mechanisms (names from background knowledge, (verify) before citing):
  1. **Gradient inversion / reconstruction:** gradients are mathematically tied to the training examples that produced them, and training samples can sometimes be reconstructed from them (Zhu et al., "Deep Leakage from Gradients" is the usual reference). Typical attacker: the server, or anyone who intercepts the update.
  2. **Membership inference:** deciding whether a specific record was in the training data.
  3. **Property inference:** learning a property of local data (for example "this home has night-time activity" or "this fleet is mostly cameras") without recovering any single record.
  4. **Memorization:** networks can memorize rare examples.
- **Why it matters in IoT:** traffic patterns reveal behavior (occupancy, routines).
- **Honest nuance for RL:** most leakage research targets supervised models. Leakage from RL policy or value weights is less studied, which means thinner evidence in both directions. State it as an open point, not as a claim either way.

**Q9. What would make it genuinely more private?**

| Defense | Plain meaning | Protects against | Cost |
|---|---|---|---|
| **Secure aggregation** | Updates are cryptographically masked so the server sees only the sum | A curious server reading individual updates | Communication overhead, trouble with dropped devices |
| **Differential privacy (DP)** | Clip each update and add calibrated noise, with a measurable privacy budget (ε) | Membership and reconstruction attacks, even from the aggregate | Trades accuracy and convergence speed for privacy |
| **Homomorphic encryption** | Server averages encrypted updates | Server and eavesdroppers | Heavy compute, hard on constrained IoT devices |
| **Trusted execution environments** | Aggregation runs inside a hardware-isolated enclave | Server operators | Hardware dependency, enclave side channels |

- Common practical pairing: **secure aggregation + DP**. Secure aggregation hides individual updates; DP bounds what even the aggregate reveals.

**Q10. Does adding privacy interact with your experiments?**

- **DP and Candidate 1:** DP noise slows convergence, which makes the non-IID stabilization problem worse. Decide deliberately: either run Candidate 1 without DP and state the privacy claim narrowly, or include a DP variant as an explicit second experimental arm.
- **CTDE and privacy:** a centralized critic wants joint observations across agents, which pushes against "raw data stays local." Secure aggregation helps for weights, but a critic that sees joint states is a bigger leak. This is another reason to keep CTDE limited to devices sharing a hub (Paper 3), where the critic can live on the home hub and raw data never leaves the home.

**Q11. How should the privacy claim be worded in the proposal?**

Instead of "the system is private," use:

> "Raw traffic never leaves the device (data minimization). We do not claim formal privacy guarantees; update leakage via gradient inversion and membership inference is a known risk, which we scope out of the core contribution and address as a bounded extension using secure aggregation and/or differential privacy."

---

### Open items from this update

1. Read FRL-IPS's experiment section to fix the unit of stabilization time (rounds, episodes or environment steps), then define Candidate 1's metric in the same unit.
2. Add a **communication-cost measurement** to Paper 2 (bytes per round and total to stabilize, federated vs. centralized), so the bandwidth argument is measured instead of assumed.
3. Decide whether Paper 2 includes a differential-privacy arm or states the privacy claim narrowly without one.
4. Verify the legal framing (data minimization, cross-border transfer) for the regions you target before citing it.
5. Verify the leakage and defense references (Zhu et al., Bonawitz et al., McMahan et al.) for exact titles and years.
6. Decide whether federation is the thesis's central claim or a deployment choice, and word the title and abstract to match.


---
---

# UPDATE 15 — 8 Oct 2026 (new sections only; everything above is unchanged)

## Working Title Candidates

**Recommended (option 1):**
**Belief-Driven Defense Against Novel Attacks in IoT: Federated and Multi-Agent Reinforcement Learning Across Heterogeneous Devices and Protocols**

**Other candidates:**
2. Zero-Day-Aware, Belief-Driven IoT Defense: Federated and Multi-Agent Reinforcement Learning from Single Networks to Cross-Protocol Fleets
3. Belief-Driven Federated Multi-Agent Defense for Heterogeneous IoT Networks (short version, for speaking)

**Changes from the earlier draft ("0 day attack belief using federated MARL in heterogeneous environments and cross protocol"):**
1. "Belief" alone is a noun with nothing attached. "Belief-driven defense" says what the system does and keeps the word that separates it from detection-only work.
2. "Heterogeneous environments and cross protocol" says the same thing twice (protocol difference is one kind of heterogeneity). Update 13 defines two kinds: device and traffic differences (Paper 2, non-IID) and protocol differences (Paper 3). The title names both once, and the abstract defines them.
3. "Federated multi-agent" is accurate for the whole system only. Paper 2 is federated RL (independent per-home agents, shared weights). MARL/CTDE enters in Paper 3, inside one home. The abstract must say this.
4. "0-day" is replaced by "novel attacks". The claim is novelty relative to training, not true zero-day detection.

**Conditions:** this is a working title. Two things could change it: (a) Paper 3's evidence (injected, synthetic pivots; the "federated round-trip is too slow to catch a pivot" claim is untested), and (b) whether the agent-unit decision below holds up.

## Q1 Decision: What Is the "Agent" Unit?

**Decision (resolves Q1 from Update 13):**
- **Paper 1:** one agent per home, observing the whole home through a joint feature vector.
- **Paper 2:** each home is one federated client, so the clients are per-home agents.
- **Paper 3:** each home's agent is split into **one agent per protocol segment (pipeline)**, for example Wi-Fi, Zigbee/Z-Wave, 5G. CTDE applies among the agents inside one home. Across homes it stays federated.

**Wording:** say "per protocol segment" or "per pipeline", not "per port". A committee will read "port" as a TCP/UDP port or a physical port.

**Why this is a good structure:**
1. **Each step follows from the last.** Per-home (Paper 1) gives clean federated clients (Paper 2), then splits by protocol where coordination is justified (Paper 3).
2. **It is a natural Dec-POMDP.** Each protocol agent sees only its own segment, so partial observability becomes structural. A hub bridging two segments is also the shared-infrastructure case from the Update 9 decision rule.
3. **It matches an existing architecture pattern.** MARL frameworks with one agent per multi-protocol gateway exist in the IoT communications literature (resource allocation and data collection, not security; verify). The security application is the gap.
4. **MARL stays out of Papers 1 and 2**, so those papers carry no multi-agent complexity.

**Consequences and risks:**
1. **Design Paper 1's observation vector grouped by protocol segment from the start**, so it can be factored later. Otherwise Paper 3 means redoing Paper 1's design.
2. **Update to Q2:** Paper 2's federated per-home weights do not transfer directly to Paper 3's per-protocol agents, because the observation and action spaces differ. Options: initialize each protocol agent's encoder from the matching slice of the federated model; or train Paper 3 from Paper 1's features. This is another reason to soften the Paper 2 → Paper 3 dependency and treat federated initialization as an ablation.
3. **The 5G leg has a data gap.** CICIoT2023 covers Wi-Fi plus Zigbee/Z-Wave devices behind hubs (not true radio-layer data). 5G-NIDD is a separate dataset with no co-located devices. Evaluate the Wi-Fi ↔ Zigbee/Z-Wave pivot first, and treat the 5G agent as an extension with synthetic or cross-dataset evidence.
4. **Action spaces differ per protocol.** A Zigbee agent's real actions (key rotation, blocking joins, isolation at the hub) are not the same as a Wi-Fi agent's (flow rules, firewall). How a policy decision becomes a protocol-specific action is still unspecified (carried over from the missed-spots list).
5. **Agent placement is still undecided**: on the device, on the hub, or in the cloud. This determines whether the GRU/MBRL inference fits real compute limits.
6. **Title:** "multi-agent" is accurate only for Paper 3. The abstract must make that explicit.

### Open items
1. Add the cross-protocol MARL related-work notes (closest neighbors: Andreou et al. 2025 CTDE cross-slice defense; multi-protocol-gateway MARL papers; HAMARL; Landolt et al. survey) and the narrower novelty wording: no work found combining MARL, security, and hub-mediated cross-protocol pivots. Based on two snippet-level searches, not a database sweep.
2. Decide how Paper 3's agents are initialized (see Q2 update above).
3. Run the latency test (is a federated round-trip too slow to catch a pivot?) before building any MARL.
4. Define the observation-vector layout by protocol segment for Paper 1.
5. Decide agent placement (device, hub, cloud) and check inference cost.
6. Carry forward all open items from Updates 1 to 14.



---

## ⚠️ IMPORTANT DESIGN CONSTRAINT — Paper 1 Must Be Built Factorable by Protocol Segment (8 Oct 2026)

**Check this before Paper 1's design is frozen. If it is missed, the cost shows up in Paper 3.**

**The constraint:** Paper 1's per-home agent must take its observation as **fixed, named slots grouped by protocol segment** (for example Wi-Fi, Zigbee/Z-Wave, 5G), not as one flat feature vector. Paper 3 splits each home's agent into one agent per protocol segment, so Paper 1's input has to be divisible along those lines without redesign.

**Why it matters:**
1. If Paper 1 uses a flat vector, Paper 3 requires redoing the feature design, retraining, and re-running Paper 1's baselines. That is a late and expensive change.
2. The Paper 3 split only works if each segment's features are already separable.
3. A fixed layout probably also helps Paper 2. Homes with different device mixes can still share identical weight shapes, which FedAvg needs (reasoning, not tested).

**What to build into Paper 1 now:**
- **Fixed segment slots.** Each segment gets its own block in the observation, in a fixed order, even if Paper 1 only populates one or two of them at first.
- **A presence mask per segment.** A home with no Zigbee devices gets a masked slot, not a different input size.
- **Segment-specific feature extraction feeding a common anomaly signal.** Zigbee and Wi-Fi/TCP traffic look nothing alike, so each segment needs its own front end. Keep the extractors separate from the shared belief/policy core.
- **An action layout that can be factored the same way.** If the observation splits by segment but the action space is one flat set, Paper 3 hits the same problem on the output side. Define per-segment action slots early, even if only some are used in Paper 1.
- **The Paper 1 ablation still runs on the single per-home agent.** Factoring the layout must not change Paper 1's claims, only its structure.

**Checkpoint (tick before Paper 1 design freeze):**
- [ ] Observation is grouped into named segment slots with a fixed order
- [ ] Missing segments handled by a mask, not a changed input size
- [ ] Per-segment feature extractors are separate from the shared core
- [ ] Action space has a factorable layout
- [ ] A short note records which segments Paper 1 actually populates (likely Wi-Fi plus hub-mediated Zigbee/Z-Wave, since CICIoT2023 covers those, and 5G is a later extension)

**Related risks this note does not solve:** how a policy decision maps to protocol-specific actions, where the agent runs (device, hub, cloud), and whether federated weights can initialize Paper 3's per-protocol agents. See Update 15's open items.



---
---

# UPDATE 16 — 8 Oct 2026 (new section only; everything above is unchanged)

## Paper 3, Redrafted: Method + Comparison + Simulation Benchmark for Cross-Protocol Defense

**Status:** working draft for further study, not a final decision. Items marked (verify) rest on snippet-level searches or background knowledge and were not checked against full text. Items marked (suggestion) are my additions.

### 1. What changed

Old Paper 3 framings (twin + XAI; "MARL because cross-protocol exists") are replaced. New Paper 3 has three parts that must all be present:
1. **Method:** a cross-protocol belief-sharing defense with one agent per protocol segment inside a home.
2. **Comparison:** that method against Paper 2's per-home federated RL agent and against a single factored agent, on accuracy, speed, scale and communication.
3. **Simulation benchmark:** documented cross-protocol pivot environments built on real benign topology, released as a citable artifact.

**Why not comparison only:** a bare result like "MARL wins when pivots exist, federated RL wins when homes are independent" nearly restates the Update 9 decision rule and reads as confirming the obvious. The contribution must be a **crossover map** (where exactly the winner flips) plus a **proposed method**, with the benchmark as a by-product.

**Dependency:** Paper 2's agent is now a baseline in Paper 3, not a prerequisite. This softens the Paper 2 → Paper 3 chain.

### 2. Research questions

- **RQ1:** Under what conditions (pivot speed, detection delay, number of segments, communication loss) does per-protocol multi-agent belief sharing beat a single per-home agent?
- **RQ2:** Does a single factored agent (one agent, per-segment slots) match the multi-agent design? If yes, where does separation still pay?
- **RQ3:** What do accuracy, speed, scale and communication cost look like as segments and homes grow?

### 3. Arms to compare

| Arm | Description | Role |
|---|---|---|
| **A0** | Paper 2's per-home federated agent (flat or slotted observation) | Baseline from Paper 2 |
| **A1** | One factored agent per home (per-segment observation/action slots, one policy) | The obvious challenge to splitting by protocol; **must be included** |
| **A2** | Per-protocol agents, no communication (independent) | Floor; isolates the value of sharing |
| **A3** | Per-protocol agents with belief sharing, CTDE-trained (proposed method) | Proposed |
| **A4** | Cloud streaming reference (optional) | Latency comparison only; gives up the privacy/bandwidth reasons for federation |

All arms federate across homes. The difference is only inside the home.

### 4. Proposed method (A3)

- One agent per protocol segment (Wi-Fi, Zigbee/Z-Wave, 5G where data exists). Say "protocol segment" or "pipeline", not "port".
- **Protocol-specific feature extractors** feed a common anomaly signal into a shared belief/policy core.
- **Training:** centralized critic on the home hub during training (MAPPO-style CTDE). **Execution:** decentralized.
- **Important:** CTDE execution is decentralized, so real-time sharing needs an **explicit belief-sharing channel** (message: per-segment compromise probability, novelty/unknown-attack belief, confidence, bridge-dependency flag). CTDE alone does not provide it.
- **Cross-segment propagation:** a segment's rising compromise belief should raise the belief of segments sharing a bridge (hub). Whether a GNN is needed stays optional: start without it; add only if a simple new-neighbor heuristic baseline performs poorly (Q4 from Update 13).
- **Action mapping per segment is still unspecified** (e.g. Zigbee key rotation or blocked joins vs. Wi-Fi flow rules). Must be defined before any simulation.

### 5. Why separate agents rather than one factored policy (must be defended explicitly)

If one hub runs everything, protocol agents see the same data over a very fast local link, so one factored agent could do the same job with less complexity. Separation is justified only where something real separates the segments:
1. **Different boxes or owners:** Wi-Fi access point, Zigbee coordinator and 5G modem are often separate devices, sometimes from different vendors, with no shared memory.
2. **Different action authority:** only the Zigbee side rotates Zigbee keys; only the Wi-Fi side changes flow rules.
3. **Compute limits:** a small coordinator may not run the full model.

**Treat this as an ablation (A1 vs. A3), not a premise.** If A1 wins, report it and limit the multi-agent claim to deployments where separation is physical.

### 6. Environments (fix before running; publish)

Choose environments by varying what the decision rule depends on, not arbitrarily:

| Env | Setup | Expected (hypothesis, not result) |
|---|---|---|
| **E1** | Independent homes, no shared hub | Federated per-home agent does fine; coordination adds cost |
| **E2** | One hub, fast pivots | Belief sharing helps |
| **E3** | One hub, slow pivots | Federation may suffice (latency test) |
| **E4** | Shared neighborhood gateway across homes | Hierarchical case (Update 9) |
| **E5 (optional)** | 5G leg | Weakest on data; extension only |

Parameters to sweep: pivot speed, Wi-Fi detection delay, segments per home, devices per segment, bridge sharing, in-home message delay and loss, attacker type.

### 7. Metrics

| Axis | Measures |
|---|---|
| Accuracy | Containment success, detection, **false isolation rate** |
| Speed | Time to contain; time-to-warn on the downstream segment; training time to stabilize (define the unit: rounds, episodes or environment steps; check FRL-IPS) |
| Scale | Agents and segments; critic cost growth; per-agent inference time on target hardware |
| Communication | Federated bytes per round; in-home belief bytes; total to stabilize |

Include a **centralized baseline** to show what federation costs.

### 8. Fairness protocol (lessons from earlier updates)

- Equal tuning budget, same observation information, same compute for every arm. MARL has more parameters and a centralized critic, so unequal tuning would bias results.
- **Grid-edge check on every tuned parameter.** The earlier PMB tuning stopped at the edge of its grid (birth_var 4.0 while the true plateau was near 24). Widen until the winner sits inside the range.
- Separate tuning seeds from evaluation seeds; report mean and spread over many seeds.
- Pre-register hypotheses and the decision rules below before running.

### 9. Decision rules (suggestion)

- **A3 clearly beats A1 and A0 in E2, and A0 matches it in E1/E3:** report the crossover map; the multi-agent claim stands where pivots are fast and the hub is shared.
- **A1 matches A3 everywhere:** report that; scope multi-agent to physically separated deployments; contribution becomes the benchmark and crossover map.
- **Neither beats A0 anywhere:** report as a negative result; Paper 3 reduces to the benchmark and the latency finding.

### 10. Simulation and data design

- **No dataset with labeled cross-protocol pivots was found** (Z-Wave dataset review, 2026, lists lack of multi-protocol analysis support as a shortcoming; BRIDGE/TCH-Net shows cross-domain generalization is weak, mean LODO F1 about 0.56; both verify).
- Plan: real benign multi-protocol topology (CICIoT2023; CIC IoT 2022) plus **injected, documented pivots**. State plainly that injected pivots are synthetic evidence on real topology.
- **Calibrate the MMPP/traffic model against real traces** (the earlier simulator-trust rejection still applies); validate on held-out injection styles and, where possible, real held-out attacks.
- CICIoT2023 covers Wi-Fi plus Zigbee/Z-Wave devices behind hubs, not true radio-layer data. 5G-NIDD is a separate dataset with no co-located devices, so the 5G agent stays an extension with synthetic or cross-dataset evidence.
- The pivot-injection protocol and environments are themselves a citable benchmark artifact.

### 11. Latency kill test — first result (notebook: `latency_kill_test.ipynb`)

**What it is:** a Monte Carlo timing model (seed 42, N = 20,000), not a measurement of real systems. Assumed parameters: pivot delay lognormal (sigma 1.0), Wi-Fi detection median 10 s (sigma 0.5), Zigbee action median 1 s, Zigbee own-detection median 10 s, hub link median 70 ms, cloud median 300 ms, federated = wait until next round plus 60 s processing.

**Prevention rate (fraction of pivots where the downstream protective action is in place before the attacker lands):**

| Median pivot delay | Federated, 1 h round (best case) | Federated, 24 h round | Hub-local sharing | Cloud streaming |
|---|---|---|---|---|
| 10 s | 0.00 | 0.00 | 0.45 | 0.44 |
| 30 s | 0.00 | 0.00 | 0.81 | 0.80 |
| 60 s | 0.01 | 0.00 | 0.94 | 0.94 |
| 1 h | 0.75 | 0.07 | 1.00 | 1.00 |
| 6 h | 0.99 | 0.34 | 1.00 | 1.00 |
| 24 h | 1.00 | 0.77 | 1.00 | 1.00 |

Independent agents: 0 prevention by construction (floor, not a finding).

**Sensitivity (pivot median 30 s, hub-local):** Wi-Fi detection median 2 s → 0.98; 10 s → 0.82; 20 s → 0.62; 40 s → 0.39; 80 s → 0.18.

**Findings:**
1. Federated is too slow for fast pivots but adequate for slow ones. If real pivots take hours, the latency argument for coordination weakens.
2. Hub-local and cloud are nearly identical: link latency is negligible next to detection delay. The test supports needing **a real-time channel**, not MARL/CTDE specifically, and does not separate hub-local from cloud on latency (that separation rests on privacy and bandwidth).
3. **Detection delay is the real bottleneck**, which ties Paper 3 directly to Paper 1's detection speed.

**Limits:** the pivot-delay distribution is an assumption with no sourced data; the federated row is generous (weight averaging does not carry a live alert); all timings must be replaced with measured values (inference time on target hardware, real hub LAN latency, real action times).

### 12. Threat model (must be written; decides E2 vs. E3)

Attacker type sets pivot speed: automated malware may pivot in seconds; human-operated intrusions can take far longer (no sourced numbers yet). State attacker capability, knowledge and goals as one explicit section, including whether the attacker can observe or evade the belief-sharing channel (adversarial robustness of the shared beliefs is untested; Byzantine-robust fusion remains a backup).

### 13. Q1 decision recap and design constraint

- Paper 1: one agent per home. Paper 2: each home is one federated client. Paper 3: each home's agent split per protocol segment.
- **Paper 1 must be built factorable:** fixed named segment slots with a presence mask, separate per-segment feature extractors feeding a shared core, and a factorable action layout. Otherwise Paper 3 means redoing Paper 1's design. Check before design freeze.
- Federated per-home weights do not transfer directly to per-protocol agents (different observation/action spaces). Options: initialize each segment encoder from the matching slice of the federated model, or train from Paper 1's features. Treat federated initialization as an ablation.

### 14. Heterogeneity vs. non-IID (clarification)

Heterogeneity is the cause; non-IID is the statistical effect.
- **Device** heterogeneity → feature skew, quantity skew. **Traffic** heterogeneity → label skew, temporal drift. Both are standard non-IID (Paper 2; FedAvg/FedProx apply).
- **Protocol** heterogeneity is not just non-IID: features differ in kind, so clients may not share an input format. It needs protocol-specific feature extraction, not FedProx (Paper 3).
- **System** heterogeneity (compute, memory, bandwidth) causes stragglers and dropped rounds, a separate issue.
- Flower's `DirichletPartitioner` splits by a label column, so it produces label skew only. Feature skew from device type must be built from device identifiers. Combine both for a stronger design.
- In the thesis, define each kind of "heterogeneous" at first use. "Heterogeneous networks" also means HetNets in telecom.

### 15. Related work found (snippet-level searches; verify before citing)

| Work | Relevance | Gap versus Paper 3 |
|---|---|---|
| Andreou et al. (2025), CTDE multi-agent moving target defense against cross-slice lateral movement in 6G NFV/SDN | **Closest** on CTDE + lateral movement across a boundary | Virtual network slices, not heterogeneous IoT protocols |
| Landolt et al. (2025), MARL in cybersecurity survey | MARL for lateral movement containment is established | Enterprise-style networks, cyber gyms |
| HAMARL (2025) | Hierarchical adversarially resilient MARL for CPS security | Industrial CPS; no protocol-boundary pivoting |
| MARL on multi-protocol gateways (NSF PAR) and multi-protocol federated matching | Precedent for gateway-as-agent architecture | Spectrum access and data collection, not security |
| RESTRAIN | Attack/defense MARL in trigger-action IoT, defense actions pass through the hub | Rule-injection attacks, not protocol pivots |
| Decentralized MARL intrusion detection for IoT (2023) | Inter-agent communication for IoT IDS | Single-domain detection |
| RL adaptive Zigbee key rotation | Zigbee-side RL actions are a real target | One protocol, single agent |
| GAZETA (IEEE TIFS) | Game-theoretic zero-trust authentication vs. lateral movement in 5G IoT | Game theory, not MARL (title only; unread) |

**Narrower novelty claim:** no work found combining MARL, security, and hub-mediated cross-protocol pivots. Based on two snippet-level web searches, not an IEEE Xplore/ACM/Scopus sweep.
**Correction to Update 13:** its sentence citing H-MARL on CAGE-4 as CTDE for IoT defense is inaccurate (CAGE-4 is simulated enterprise defense, not IoT). Andreou et al. is the better citation.

### 16. Likely committee questions on Paper 3

| Question | Prepared answer |
|---|---|
| Why not one agent with a factored policy? | Arm A1 tests it directly; separate agents are claimed only where segments are physically separate boxes, owners or action authorities. |
| Isn't the result obvious? | The contribution is the crossover map and the method, not "coordination helps when pivots are fast." |
| Is MARL the contribution? | No. MARL for lateral movement exists. The contribution is belief propagation across a protocol bridge, justified by the pivot scenario and tested against alternatives. |
| Your pivots are synthetic. | Yes: injected on real benign topology, with calibrated MMPP, held-out injection styles, and sensitivity sweeps; stated as simulated evidence. |
| Why not cloud streaming for real-time sharing? | Latency alone does not separate them (latency test); the case against cloud rests on privacy and bandwidth, which must be measured. |
| Does it scale? | Report scaling curves in agents and segments, not extrapolation from three agents. |

### 17. Risks

1. Simulation trust: injected pivots, no labeled cross-protocol data.
2. Environments chosen after seeing results look cherry-picked: fix them first.
3. Unequal tuning between arms; MARL training instability and non-stationarity.
4. The 5G leg has no co-located device data.
5. Undefined: policy-to-protocol action mapping, reward/cost model for graded actions, novelty-state calibration, agent placement (device, hub, cloud).
6. All novelty claims rest on shallow searches.
7. Detection delay (Paper 1) caps what Paper 3 can achieve.

### 18. Rating

About 8/10 for the whole three-paper path (my judgment, not a measurement). It would move to about 8.5 if the A1-vs-A3 justification holds, the threat model fixes the pivot-speed assumption, and the novelty sweep comes back clean. It drops if A1 wins everywhere and the benchmark is the only surviving contribution.

### 19. Test and check list (in order; cheap kill tests first)

1. Write the threat model (attacker type, pivot speed, evasion of the belief channel).
2. Replace latency-test timings with measured values; add sourced pivot-delay data if any exists.
3. Define the policy-to-protocol action mapping and the reward/cost model.
4. Build the minimal cross-protocol simulator and fix environments E1–E4 and hypotheses before running.
5. Run a small A1 vs. A3 pilot to see whether separation shows any signal.
6. Check FRL-IPS's experiment section for the unit of stabilization time.
7. Decide agent placement (device, hub, cloud) and measure inference cost on target-class hardware.
8. Run the systematic IEEE Xplore/ACM/Scopus sweep (cross-protocol + MARL/CTDE; Andreou et al.; gateway-MARL papers; also PMBM/entity-resolution items still pending from Updates 5–7).
9. Verify all (verify) items and the related-work table against full text.
10. Carry forward all open items from Updates 1 to 15.

# UPDATE 17 — 8 Oct 2026 (new section only; everything above is unchanged)

## Paper 3 claim narrowed: the price of separation

**Status:** working draft. Items marked (verify) rest on press releases or snippets, not full text.

**Trigger:** pilot with hand-built threshold policies (one tuning seed) showed a factored single agent (A1) is the ceiling for per-protocol agents with belief sharing (A3) inside one box. Same function class at zero delay and loss, so A3 cannot beat A1 there.

**Old claim (dropped):** A3 beats a single per-home agent.
**New claim:** separation has a price (belief-channel delay and loss). Paper 3 maps where that price is small (crossover map), gives a method for operating where separation is forced, and releases a cross-protocol pivot benchmark.

### Revised research questions
- RQ1: under what pivot speed, detection delay and message delay/loss does per-protocol sharing stay close to A1, and when does it collapse toward independence (A2)?
- RQ2 (replaces old RQ2): what is the cost of physical separation, loss(A3) - loss(A1), as a function of pivot speed, channel delay, loss pattern, coordinator compute and action authority? Where does it approach zero?
- RQ3: when separation is forced, which belief-sharing designs (message content, rate, staleness handling) minimize that cost?
- RQ4: does the crossover map survive learned policies (IPPO/MAPPO) and measured timings?

### Revised decision rules
- A3 within a small margin of A1 across realistic delay/loss: separation is cheap; method validated for physically separate deployments.
- A3 degrades toward A2 at fast pivots with realistic delay: report the boundary; recommend A1 wherever one box can host everything.
- A3 beats A1 only under a physical constraint (smaller model on coordinator, bursty loss, restricted action authority): the only claimable multi-agent advantage; state the constraint.
- Federated matches everything for slow pivots: honest negative for coordination; benchmark and latency finding survive.

## Pivot-delay evidence (first sourcing; none is IoT-specific)

| Source | Figure | Caveat |
|---|---|---|
| CrowdStrike 2026 Global Threat Report (Feb 2026), press release | Average eCrime breakout time (initial access to lateral movement) 29 min in 2025, down from 48 min in 2024; fastest observed 27 s | Enterprise intrusions, not IoT hubs; vendor telemetry; press release, not full report (verify) |
| Fastly blog on IoT threats (2017) | Infected/exposed IoT device launched an attack within about 6 min of exposure; probed about 800 times per hour | Vendor blog, honeypot-style measurement; exposure-to-attack, not hub pivot |
| Antonakakis et al., "Understanding the Mirai Botnet" (USENIX Security 2017) | Mirai scanning/infection mechanics and growth | Abstract/snippet seen only; no per-pivot timing extracted (verify) |

**Reading:** pivot speed spans seconds (automated, scripted) to tens of minutes (average human-operated). No source gives hub-mediated Wi-Fi-to-Zigbee pivot timing. That number remains an assumption; the threat model must state it as a scenario parameter, not a fact.

## Latency test, recalibrated (script: latency_pivot_calibrated.py; Monte Carlo, seed 42, N = 200,000)

Same structure as Section 11 (Wi-Fi detection median 10 s, Zigbee action median 1 s, hub link 70 ms, cloud 300 ms, federated = wait for next 1 h round + 60 s). Pivot delay lognormal; medians anchored on the sourced figures above. Prevention rate:

| Median pivot delay | Federated (1 h round) | Hub-local | Cloud |
|---|---|---|---|
| 27 s (fastest breakout), sigma 1.0 | 0.00 | 0.78 | 0.78 |
| 2 min | 0.04 | 0.98 | 0.98 |
| 29 min (average eCrime), sigma 1.0 | 0.53 | 1.00 | 1.00 |
| 1 h | 0.75 | 1.00 | 1.00 |
| 6 h | 0.99 | 1.00 | 1.00 |

Bursty loss (hub-local, retry every 5 s, 27 s pivot): loss 0 / 0.3 / 0.6 / 0.9 gives 0.79 / 0.74 / 0.65 / 0.36. At a 29 min pivot, loss does not matter.
Detection-delay sweep (29 min pivot, hub-local): detection median 10 s / 60 s / 300 s / 900 s / 1800 s gives 1.00 / 1.00 / 0.94 / 0.72 / 0.49.

**Findings**
1. Even at the 29 min average, a 1 h federated round misses about half of pivots; real-time sharing is justified for anything faster than hours.
2. Hub-local and cloud are indistinguishable on latency; the case against cloud is privacy/bandwidth, not speed.
3. The price of separation (delay, loss) only bites for pivots in the seconds range. At the 29 min average it is negligible, which supports the narrowed claim: separation is cheap except against automated fast pivots.
4. Detection delay remains the dominant term; it ties Paper 3 to Paper 1's detection speed.

**Limits:** pivot-delay distributions come from enterprise data and are anchors, not IoT measurements; all component timings are still assumed; this is a timing model, not learned MARL.

# Threat model (one page, draft for the proposal)

**Scope:** a home (or small site) with one hub bridging Wi-Fi and Zigbee/Z-Wave segments; Paper 3 agents sit per protocol segment.

**Attacker goal:** reach a protected downstream device (for example a Zigbee lock) that is not directly internet-reachable, by compromising an upstream Wi-Fi device and pivoting through the hub.

**Attacker capability (scenarios, not facts):**
- S1 automated: scripted pivot, median pivot delay seconds (anchor: 27 s fastest breakout).
- S2 human-operated: median pivot delay tens of minutes (anchor: 29 min average).
- S3 slow/stealthy: hours; low-and-slow behavior to stay under detector thresholds.

**Attacker knowledge:** knows device inventory and hub topology; does not know policy parameters or thresholds (S1/S2). S3 variant may probe the detector's response.

**Attacker can:** compromise one upstream device via a known or novel (zero-day) exploit; send protocol-valid commands through the hub; mimic benign traffic statistics for the compromised device.

**Attacker cannot (assumed):** physically access the hub; break the hub-local channel's authentication; compromise the agents themselves in the core experiments.

**Out of scope for core papers (stated as extensions):** attacks on the belief-sharing channel (message injection, replay, suppression, jamming) and poisoning of training. Byzantine-robust belief fusion is the backup contribution that would address these.

**Defender assumptions:** agents see only their own segment plus shared beliefs; belief messages carry per-segment compromise probability, novelty belief, confidence and bridge-dependency flag; actions per segment are protocol-specific (Zigbee key rotation or blocked joins; Wi-Fi flow rules or isolation) and mapping from policy output to these actions is still undefined.

**Success metrics:** containment before the downstream compromise, time to contain, false isolation rate, communication cost.

**Known weak points:** pivot timing in IoT is unmeasured; injected pivots are synthetic evidence on real benign topology; the evasion-resistance of belief sharing is untested.

# Remaining open items
1. Source IoT- or hub-specific pivot timing (smart-home attack papers, Mirai-variant propagation studies, lab measurements); if none, measure in a testbed.
2. Replace assumed component timings with measured ones (GRU inference on Pi-class hardware; hub LAN latency; Zigbee action times).
3. Pilot with physical-separation parameters: smaller coordinator model, bursty loss, restricted action authority.
4. Repeat the pilot with learned policies (IPPO/MAPPO), multiple seeds, grid-edge checks.
5. Define policy-to-protocol action mapping and reward/cost model.
6. Database novelty sweep (IEEE Xplore, ACM DL, Scopus): needs library access; query strings can be prepared.
7. Check Paper 1 factorable-observation checklist before design freeze.
8. Revise PPT Slide 10 to Believe -> Scale -> Coordinate.


# UPDATE 18 — 8 Oct 2026 (new section only; everything above is unchanged)

## Novelty Sweep: Belief-Driven MBRL + PPO/BF-PPO in Federated Non-IID IoT, and Cross-Protocol MARL

**Status:** first-pass web sweep (about 9 searches, including a targeted MBRL query), not an IEEE Xplore/ACM/Scopus database sweep. Verification levels: READ = abstract or snippet seen; UNVERIFIED = not checked. Nothing below was read in full text. "Not found" means not found in these searches, not "does not exist".

## 1. Question asked
Is there prior work combining: (a) model-based RL (world model), (b) PPO or BF-PPO, (c) POMDP belief with an explicit unknown/zero-day attack state, (d) federated non-IID training, for IoT? And as extension: (e) cross-protocol defense, (f) comparison with MARL?

## 2. Headline
**No single paper found combining (a)+(b)+(c)+(d) in security.** Several papers cover two or three legs. The MBRL leg needs a nuanced statement (see section 4): federated model-based RL exists in general RL, but none was found in security.

## 3. Closest-work table (abstract/snippet level; UNVERIFIED beyond that)

| Work | Belief / POMDP | PPO | Model-based | Zero-day / novelty | Federated | non-IID | Gap versus this thesis |
|---|---|---|---|---|---|---|---|
| Q-BIRD (V2X cyber defense, arXiv 2606.07796) | Yes (belief over attacker intent, fed to PPO) | Yes | No | No (intent, not novelty) | No | No | Closest on belief + PPO; V2X; single agent; no world model |
| Hammar & Stadler (OT intrusion response; BF-PPO) | Yes | Yes | No | No | No | No | Closest method for Paper 1; OT domain (from earlier roadmap, not re-verified) |
| FedAtten-DRL (IoT NIDS, ACM) | No | Yes | No | Yes (aims at zero-day) | Yes | Not clear from abstract | Closest federated + PPO + zero-day; detection-style DRL; no belief, no world model |
| Siamese + PPO zero-day IDS (arXiv 2609.26115; ScienceDirect) | No | Yes (PPO over DQN/SAC) | No | Yes | No | No | Main "zero-day + PPO" overlap; no belief, not federated |
| FMARL intrusion detection (Comput. Commun. 2026) | No | No (DQN) | No | Not the focus | Yes (class-level FedAvg) | Yes | Classification framing; one agent per attack type + decision agent |
| FMADRL moving-target defense, UAV swarms (arXiv 2506.07392) | Yes (multi-agent POMDP) | Policy gradient | No | No (DoS) | Yes (reward-weighted aggregation) | Not clear | Federated multi-agent POMDP defense exists; not IoT zero-day; no world model |
| Trust-aware DQN for FL defense (arXiv 2510.01261) | Yes (client trust as latent state) | No (DQN) | No | No | Defends FL itself | n/a | POMDP over client trust; relevant to Candidate 2, not Paper 1/2 |
| Fed-DTCN, Jogunola et al., Belarbi et al. | No | No | No | Yes | Yes | Yes | Federate detectors, not decision policies; one study reports large non-IID performance drops |
| FRL-IPS (from roadmap) | No | No (DDQN) | No | No | Yes | Yes (IID vs non-IID) | Benchmark for Candidate 1 stabilization time |
| Federated Ensemble Model-based RL (general RL, not security) | No | n/a | Yes (federated dynamics-model ensemble, policy trained on the model) | No | Yes | Heterogeneous users | Shows federated MBRL sample-efficiency idea exists outside security |
| FedHPD / Federated RL across heterogeneous environments (general RL) | No | n/a | No | No | Yes | Heterogeneous agents/environments | General FedRL theory and heterogeneity results to cite |
| Amamou et al., AINA 2026 | ? (abstract: none mentioned) | ? | ? | ? | Yes (FedProx) | ? | Abstract only; full text unread; see earlier note |

## 4. What this means for each claim
- **Paper 1 (belief + PPO + novelty state):** Q-BIRD and Hammar & Stadler cover belief + PPO; Siamese+PPO and FedAtten-DRL cover zero-day + PPO. The explicit unknown-attack latent state inside the belief, combined with a GRU/MMPP world model, was not found together. Differentiator stands, still unconfirmed by a database sweep.
- **Paper 2 / Candidate 1 (MBRL vs model-free under federated non-IID):** the general idea "federated + model-based RL improves sample efficiency" already exists (Federated Ensemble Model-based RL, continuous-control benchmarks). **Do not claim "first federated MBRL".** Defensible narrower claim: first test (if the sweep confirms) of whether model-based learning reduces the federated non-IID stabilization penalty for a belief-driven security agent, benchmarked against FRL-IPS. Read that paper's theory/experiments and cite it as the general-RL precedent.
- **Federated + POMDP defense:** FMADRL (UAV MTD) shows federated multi-agent POMDP defense is publishable. Position Paper 2 around the belief with novelty state and the MBRL/non-IID question, not around federated POMDP alone.
- **FedAtten-DRL and RL-IoTIDS:** RL-IoTIDS (single DQN IDS) names federated RL as future work, so the topic is open for decision-making agents, but FedAtten-DRL is already a federated DRL zero-day IDS and must be differentiated explicitly (no belief state, no world model, detection/classification framing).

## 5. Extension: cross-protocol defense and MARL
- No paper found applying MARL (or federated MARL) to hub-mediated cross-protocol pivots in IoT security.
- What exists: MARL in cybersecurity survey (lateral-movement containment in enterprise networks and cyber gyms); cross-tier MARL anti-jamming across FANET-IoT-IoV (jamming, not pivots; agents include IoT gateways); a multi-agent SDN-IoT defense whose agents are trained independently (explicitly not centralized MARL); H-MARL on CAGE-4 (simulated enterprise); Andreou et al. cross-slice CTDE defense (from the earlier roadmap).
- Narrower novelty wording (unchanged in spirit from Update 16): no work found combining MARL, security, and hub-mediated cross-protocol pivots.
- **Federated MARL comparison arm:** FMARL (Comput. Commun. 2026) and FMADRL (UAV) are the nearest federated-multi-agent baselines to cite; neither addresses protocol boundaries.

## 6. Do-not-claim list (added)
- "First federated RL for IoT zero-day" (FedAtten-DRL).
- "First belief-conditioned PPO in cyber defense" (Q-BIRD, Hammar & Stadler).
- "First federated multi-agent POMDP defense" (FMADRL, UAV).
- "First federated model-based RL" (Federated Ensemble Model-based RL, general RL).

## 7. Limits and open items
1. Snippet-level only; none of the table rows were read in full. FedAtten-DRL, Q-BIRD, FMADRL and Federated Ensemble MBRL should be read first.
2. Run the database sweep with these strings (IEEE Xplore, ACM DL, Scopus):
   - ("model-based" OR "world model") AND ("federated") AND ("reinforcement learning") AND (intrusion OR "cyber defense" OR IoT)
   - ("POMDP" OR "belief state") AND ("federated") AND (intrusion OR "cyber defense" OR IoT) AND (PPO OR "policy gradient")
   - ("zero-day" OR "unknown attack" OR "novel attack") AND ("federated reinforcement learning") AND (IoT OR IIoT)
   - ("multi-agent reinforcement learning" OR MARL OR CTDE) AND ("lateral movement" OR pivot) AND (IoT OR "smart home" OR Zigbee OR "multi-protocol")
   - ("federated") AND ("multi-agent reinforcement learning") AND (intrusion OR "cyber defense") AND ("non-IID")
3. Re-check Amamou et al. full text for RL or belief components (their group also published Big-IDS, decentralized MARL).
4. Update the comparison table in Update 1 and the PPT literature slide with Q-BIRD, FedAtten-DRL, FMARL, FMADRL and Federated Ensemble MBRL.
5. Carry forward all open items from Updates 1 to 17.
