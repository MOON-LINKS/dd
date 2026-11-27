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



---
---

# UPDATE 19 — 9 Oct 2026 (new section only; everything above is unchanged)

## Whole-PhD Framing, Gap Survey, and Cross-Protocol (G9) Deep Dive

**Status:** working notes for further study, not final decisions. Verification levels: READ = abstract or snippet seen directly; UNVERIFIED = not checked. About ten web searches this session, snippet-level, not an IEEE Xplore/ACM/Scopus sweep. Items marked (suggestion) are my additions. Authors' own limitation statements are weaker evidence than a field consensus.

### 1. Change of framing: proposal for the whole PhD, not a paper list

- The proposal describes one research problem and its supporting threads. Paper breakdown comes later.
- Earlier updates are tracking notes. These items are kept for later papers or future work, not in the current proposal: the LMB/PMB/PMBM/EntityRes comparison (Updates 3-7), Byzantine-robust belief fusion (Candidate 2), XAI/digital twin, self-play (Idea F), and the identity-robust tracking line.
- The title must name the field (IoT, multi-protocol, novel attacks, autonomous response), not only the concepts.

### 2. Gap survey (what the literature itself says is missing)

| # | Gap | Evidence (source) | Tie to our approach | Support |
|---|---|---|---|---|
| G1 | Detectors are tested in closed worlds | BRIDGE/TCH-Net (arXiv 2604.11324): most IoT detectors are evaluated on one benchmark, performance drops outside it, and the field lacks a reliable answer on cross-environment generalization. "Dataset-centric evaluation of federated IDS in IoT" (Sci Rep 2026, PMC12824137): most FL-IDS evaluations rely on a single dataset | Evaluate across environments, protocols and time | Two independent sources |
| G2 | "Zero-day" is loosely defined; anomaly detection is noisy | ZAID (arXiv 2602.16098) defines zero-day as unseen attack families, not unknown vulnerabilities; BRIDGE: anomaly detection avoids the signature blind spot but gives many false positives because diverse IoT behavior makes a single baseline inadequate; a 2026 review (Iraqi J. Comput. Informatics 52(1)) lists unknown-attack handling, lightweight real-time models and generalization as gaps | Calibrated novelty belief; claim "novel relative to training" | Three sources |
| G3 | Detection dominates, response is thin | FRL-IPS abstract (supplied by you): most SDN security work focuses on detection; prevention needs timely network-wide mitigation | Graded response from belief (throttle before isolate) | Single source |
| G4 | RL for cyber defense: methodological pitfalls and sim-to-real gap | SoK on DRL pitfalls (arXiv 2602.08690): 11 pitfalls; gap between simulated and operational reality can give a false sense of security; cyber tasks break fixed-dynamics and full-observability assumptions. "Beyond Rewards in RL for Cyber Defence" (arXiv 2602.04809): real adversaries are not turn-based and adapt; environments modeling this remain open | Calibrate the traffic model to real traces; validate on real held-out data (the earlier MMPP rejection) | Several sources |
| G5 | Partial observability under-treated | Drexel thesis "Strategic reinforcement learning agents for autonomous cyber defense": four fundamental flaws including state-space observability and fixed-size state space; arXiv 2509.20008 compares partial-observability techniques against plain PPO, but for penetration testing (offense) | POMDP belief on the defense side in IoT | Moderate; IoT defense side not covered |
| G6 | Device sets change; policies assume fixed inputs | Entity-based RL for ACD (arXiv 2410.17647): fixed-size inputs clash with devices joining and leaving (enterprise setting) | Fixed protocol-segment slots with presence masks (see Paper 1 design constraint, Update 15) | One source; IoT extension is my inference |
| G7 | Environments are enterprise-shaped | Automated Cyber Defence review (arXiv 2303.04926): CAGE challenges are enterprise environments; "Building Better Environments for ACD" (arXiv 2604.08805): CAGE 2 is the standard benchmark but has fundamental issues; a healthcare-IoT RL environment exists but is built on CyberBattleSim (exploit-chain oriented, from earlier notes) | An IoT, multi-protocol defense environment is missing | Several sources |
| G8 | Federated IDS: heterogeneity, poisoning, no standard benchmarks | LCU 2025 survey: poisoning and inference attacks, client heterogeneity, non-IID, missing standardized benchmarks; Sci Rep 2026 benchmark: federated models approach centralized performance in-domain (FedAvg, FedProx, FedNova; Edge-IIoTset, CIC-IoT2023, TII-SSRC-23) | Open question shifts from in-domain accuracy to cross-environment behavior and the cost of federation for decision-making agents | Several sources |
| G9 | Cross-protocol pivoting | See section 4 (revised) | Hub-mediated pivots | Moderate |
| G10 | Defender agents can be exploited | DRL for autonomous cyber operations survey (arXiv 2310.07745) critiques methods for limiting exploitability | Robustness of belief and policy (future work) | One source |

**Strongest (independent sources agree):** G1, G4, G7, G8. **Single-source:** G3, G10. **Partly my inference:** G6.

### 3. How the gaps link into one thesis (three threads, not papers)

1. **Decision under uncertainty about novelty** (G2, G3, G5, G6): a belief-driven agent that responds in graded steps.
2. **Learning across heterogeneous, shifting IoT environments** (G1, G8): federated training, with the cost of federation measured and cross-environment generalization tested.
3. **Realistic evaluation** (G4, G7, G9): an IoT environment with multi-protocol structure, calibrated to real traces.

**Candidate umbrella (suggestion, to be chosen):** an autonomous agent that responds to novel attacks in multi-protocol IoT networks, trained federated, and evaluated across environments.
- **Option A (response under uncertainty first):** threads 1 and 2 lead, thread 3 supports. Closest to work already done.
- **Option B (environment and benchmark first):** thread 3 leads. More independent support, less existing work behind it.
- **Decision pending.**

### 4. G9 deep dive: cross-protocol pivoting

**Corrections to earlier updates:**
1. The Z-Wave dataset review cited in Updates 8 and 10 is from **2025, not 2026** (article identifier S2542660525…; York announcement dated 10 Nov 2025). Update 8's "2026" was wrong. Its statement is about dataset coverage at the time it was written; recency does not prove the gap.
2. **The data gap is closing.**
   - BCCC-IoT-IDS-Zwave-2025 (York): IP traffic, Z-Wave communication, device logs, MQTT; 88 attack scenarios, 110+ devices; attack scenarios were designed per data source, which suggests single-protocol attacks (verify).
   - SHARP (Cardiff; Alosaimi, Rana, Perera; IEEE DataPort, DOI 10.21227/ray1-ag27; released 20 Sep 2026): one occupied two-bedroom flat; router/IP and Wi-Fi over-the-air captures, Zigbee captures, Z-Wave logs, telemetry (4.4 million rows); normal period 20 Jun-5 Jul 2025, attack campaign 13 Aug 2025; 36 documented attacks (ledger A001-A035, A038). No individual observation carries a verified attack-effect label. Subscription required; 172 GB. **Whether any SHARP or BCCC attack crosses protocols is unverified**; SHARP's attack guide could not be retrieved (404).
3. Update 10's "no dataset with labeled cross-protocol pivots found" should read: none *verified*; SHARP and BCCC need checking.

**What exists:**

| Layer | What exists | Source |
|---|---|---|
| Attacks | Cross-technology pivoting: a compromised device becomes a stepping stone to attack other wireless technologies (Cayre et al., poster "Cross-protocol attacks: weaponizing a smartphone by diverting its Bluetooth controller", demonstrated against Zigbee and others). Philips Hue Zigbee flaw CVE-2020-6007 (Check Point, 2020): bulb compromise, then bridge compromise, then malware on the bridge connected to the home network. SSTIC 2026, "Flicker and Fall: rooting the Philips Hue Bridge both remotely and wirelessly": a Zigbee-reachable vulnerability on the Hue Bridge | Strong, recent |
| Static modeling | Ge, Hong, Alzaid, Kim (2017), "Security Modeling and Analysis of Cross-Protocol IoT Devices": per-protocol security models combined via cross-protocol devices to compute hidden attack paths. Salayma (2024), dynamic attack graphs for IoT (Frontiers in IoT, doi 10.3389/friot.2024.1306465). Flores et al. (Entropy 2022, doi 10.3390/e24050668): Bayesian-network risk model for smart homes from an attack graph, parameters from simulated attacks | Design-time risk analysis |
| Runtime, probabilistic | RAGIIoT (Li and Liu, IEEE/ACM IWQoS 2025, poster): static attack graphs converted to probabilistic ones weighted by real-time anomalies, CVSS and MITRE ATT&CK, for IIoT | **Closest neighbor**; risk prioritization, not RL response; abstract only |
| Bayesian attack graph inference | arXiv 1510.02427: exact inference for Bayesian attack graphs, including dynamic analysis | Background |
| Runtime detection | Shafi (York 2024 thesis): dual-tier detection using the hub's internet traffic and internal device traffic. ZMAD (Nkuba et al., IEEE Access 2023): lightweight Z-Wave IDS | Detection, not pivot tracking |

**Refined gap statement (suggested wording; replaces "cross-protocol interaction is unstudied"):** cross-protocol pivoting is a documented attack class (2017-2026) and is modeled statically; I found no runtime defense that keeps a sequential belief over a pivot as it unfolds and chooses graded, learned responses, and the multi-protocol datasets are not verified to label pivots. Support: moderate (about eight searches, snippets only).

**Design implications:**
1. **Pivots run both ways.** The Hue cases go from a Zigbee device through the bridge into the IP network. The threat model (Update 17) assumes Wi-Fi to Zigbee to a lock; add the Zigbee-to-IP direction, with the hub as the weak link.
2. **Attack graphs could structure the belief** (suggestion): a graph like Ge et al.'s defines which segments influence which, replacing an ad hoc cross-segment propagation layer. Differentiate from RAGIIoT and Bayesian attack graph work on: sequential belief updating, learned graded response, and multi-protocol scope.
3. **Novelty wording must change** wherever the roadmap says cross-protocol is "unstudied" or "no work found". Safer: "no runtime belief-based defense found for hub-mediated pivots".

### 5. Open items

1. Read Ge et al. (2017) in full; read RAGIIoT, Salayma (2024) and arXiv 1510.02427.
2. Obtain SHARP through institutional IEEE DataPort access; read the attack ledger and guides for any cross-protocol attack. Do the same for BCCC-IoT-IDS-Zwave-2025.
3. Add the Zigbee-to-IP pivot direction to the threat model.
4. Run the database sweep (IEEE Xplore, ACM DL, Scopus). Query strings still to be written, covering: cross-protocol or multi-protocol AND (pivot OR lateral movement OR attack graph) AND (smart home OR IoT) AND (belief OR POMDP OR Bayesian OR reinforcement learning).
5. Decide umbrella Option A vs. Option B (section 3) before drafting the title.
6. Fix earlier wording: Update 8's "2026" for the Z-Wave review and "unstudied" wherever it appears; Update 10's dataset statement.
7. Carry forward all open items from Updates 1 to 18.

---
---

# UPDATE 20 — 9 Oct 2026 (new section only; everything above is unchanged)

## Paper 3: Cross-Protocol Pivot Defense (headline, related work, claims, arms, evaluation)

**Status:** working draft for further study, not a final decision. Related-work findings come from about six snippet and abstract-level searches, not a database sweep. Items marked (verify) were not read in full or come from general knowledge. Items marked (suggestion) are my additions.

### 1. Headline of Paper 3

> *Tracking and responding to an attack as it crosses from one protocol to another inside a smart home, using a belief that updates over time, without needing a known exploit.*

**Working title (suggestion, not final):** *Belief-Driven Defense Against Cross-Protocol Pivoting in Multi-Protocol IoT Networks.*

**Plain example:** a house has a Wi-Fi gate and a Zigbee back door, with a hub as the hallway between them. A normal alarm rings only after something breaks. A guard with a running belief says "someone got through the gate 20 seconds ago, so the back door is now at risk", and responds in steps: watch closely, then lock, then shut everything down. Pivots run both ways: Wi-Fi to hub to Zigbee, and Zigbee to hub to IP (the Philips Hue Bridge cases).

**What changed versus Updates 15 to 17:** the CTDE-vs-single-agent comparison is no longer the headline. It becomes one pre-registered arm. If separation is not physical, "multi-agent" comes out of the title (Update 15 title option 1 currently contains "Multi-Agent", so mark it conditional).

### 2. Why CTDE vs. single agent is not the headline

1. **The pilot result is close to true by construction.** The pilot (Update 17) used hand-built threshold policies and one tuning seed. With zero delay and loss, a factored single agent (A1) and per-protocol agents with belief sharing (A3) have the same information, so A3 cannot beat A1. Treat "A1 matches or beats A3 in one box" as a sanity check, not a finding.
2. **The box may not be separate.** (verify) Many smart-home hubs host the Zigbee or Z-Wave radios and the IP side in one device. If so, one agent sees everything and a protocol split has no physical basis.
3. **A paper whose story needs MARL to win is fragile.** MARL training is unstable and costs more to tune fairly.

### 3. Corrected novelty wording

Updates 16, 19 and my earlier Update 20 draft say no runtime belief-based defense was found for hub-mediated pivots. That is too strong. **IoTHaven** (Alam, UNC Charlotte dissertation 2024) is a POMDP-based real-time defense (DRQN) for hub-mediated injection chains in partially observable smart homes.

**Corrected wording:** I found no work that (a) treats a compromise crossing a protocol boundary (Wi-Fi, Zigbee, Z-Wave) as the tracked object, (b) carries a per-segment belief that includes an unknown-attack state, and (c) drives graded responses from it. Also correct earlier wording that says cross-protocol is "unstudied": pivoting is a documented attack class (2017 to 2026) and is modeled statically.

### 4. Paper 3 related-work table

| Work | Venue / year | What it does | Overlap with Paper 3 | Gap versus Paper 3 |
|---|---|---|---|---|
| IoTHaven (Alam) | UNC Charlotte dissertation, 2024 | POMDP + DRQN defense for remote injection attacks in partially observable trigger-action smart homes | Closest: POMDP, runtime, smart home, hub-mediated chain, learned response | Injection through trigger-action rules, not protocol crossing (abstract does not mention protocol boundaries, verify); no novelty belief, no federation, no world model |
| IoTWarden (Alam et al.) | WCNC 2024, arXiv 2401.08141 | DQN real-time defense for injection attacks, MDP | Learned runtime response | Fully observable framing; same attack type |
| RESTRAIN (Alam et al.) | arXiv 2503.09513 | Platform-independent multi-agent online defense, trigger-action IoT | Multi-agent, defense through the hub | Same attack type; dissertation outline mentions competitive MARL (verify), not cooperative CTDE |
| Signal Emulation Attack and Defense for Smart Home IoT (Zhang et al.) | IEEE TDSC 2022 | Wi-Fi device emulates a ZigBee signal to control a ZigBee device; proposes two defenses | A real Wi-Fi to ZigBee cross-protocol attack with defense | Physical-layer attack and defense; no sequential belief or learned response (defense details not seen, verify) |
| RAGIIoT (Li, Liu) | IWQoS 2025 poster | Probabilistic attack graph updated by real-time anomalies, CVSS and MITRE ATT&CK mapping | Belief-like inference over threat propagation at runtime | IIoT, risk prioritization, relies on known vulnerability mappings, no RL response (abstract only) |
| Iota (Fang et al.) | IEEE TMC 2022 | System-level attack graphs across devices, protocols, cloud, apps | Models attack paths across components | Design-time analysis; scans for known vulnerabilities |
| Dynamic attack graphs (Salayma) | Front. IoT 2024 | Attack paths when devices join and leave | Dynamic IoT topology | Threat modeling, not runtime defense |
| Bayesian attack graphs for IoT (Wakam Younang, Sen) | IEEE TDSC 2025 | Risk assessment with complex probabilities | Probabilistic path reasoning | Risk assessment, not runtime |
| HMM multi-stage detection (Zhang et al. 2022; Wang et al. 2024; Moudoud et al. 2022; MS-ZeroWall 2024) | Various | Sequential inference over attack stages | Sequential state over an unfolding attack | Mostly enterprise or single protocol; no RL response |
| RL adaptive Zigbee key rotation (Fang et al.) | Sci Rep 2024 | RL on the Zigbee side only | Zigbee-side RL actions exist | Single protocol, single agent |
| RL + fingerprinting for MTD against zero-day (Celdran et al.) | arXiv 2212.14647 | RL selects moving-target defenses on a real Raspberry Pi | Zero-day framing with RL | Single device, no pivot |

### 5. What Paper 3 claims, and what it does not

**Does not claim (inherited from Papers 1 and 2):** the unknown-attack belief, the MMPP/GRU world model, PPO, federated training. State this in the paper so Paper 3 is not read as repeating Paper 1.

**Claims (suggestion):**
1. **Method:** a segment-structured belief where each segment keeps Paper 1's belief (including the unknown-attack state), plus a cross-segment propagation term across the hub and graded responses, with pivots in both directions.
2. **Key differentiator:** defense against pivots that do not depend on a known exploit. Attack-graph methods lean on known vulnerability data (RAGIIoT and Iota abstracts), and IoTHaven has no novelty state. A compromise by an unseen exploit should still raise downstream risk through the unknown-attack belief. Untested; this is the claim that must be demonstrated.
3. **Benchmark:** documented pivot scenarios on real benign topology, released with the environment code.
4. **Evidence map:** when separating agents costs little (CTDE arm), reported as an ablation, not the headline.

**One-sentence contribution (draft):** a runtime defense that tracks a compromise as it crosses a protocol boundary and responds in graded steps, without needing a known exploit.

**Attack-graph structure (suggestion):** a graph like Ge et al. (2017) can define which segments influence which, replacing an ad hoc propagation layer. Differentiate from RAGIIoT and Bayesian attack-graph work on sequential belief updating, learned graded response, multi-protocol scope and the novelty state. Read those papers in full before claiming it.

**Where separation could be real (suggestion, unverified):** across ecosystems rather than protocols inside one box. A home often has a bridge from one vendor, a different hub, a router and a voice assistant, run by vendors that do not share raw data. Not checked: whether this is studied, how common it is, and what vendors expose.

### 6. Arms and ablations (each removes one piece so each piece has to earn its place)

| Arm | What it is | What it tests |
|---|---|---|
| A0 | Paper 2's per-home agent | Baseline from Paper 2 |
| A1 | Factored single agent, per-segment slots | Whether separation is needed at all |
| A2 | Independent per-segment agents | Value of belief sharing (floor) |
| A3 | Per-segment agents with belief sharing (CTDE) | Tested only where separation is forced: delayed or lossy links, smaller coordinator model, restricted action authority |
| IH | IoTHaven-style DRQN POMDP agent (suggestion) | Whether an explicit belief with a novelty state beats a recurrent hidden state |
| AG | Non-learned attack-graph propagation baseline (suggestion) | Whether learning is needed at all |
| NK | Proposed method with the novelty state removed (known-attack belief only) | Whether the novelty state matters for pivots |

### 7. Evaluation protocol

- Real benign multi-protocol topology plus injected pivots, both directions, varied speed, hop count and stealth.
- **Held-out exploit families:** train pivot behavior on some exploit families and test on others. The novelty claim lives or dies here, and it is the hardest part to build credibly.
- Metrics: containment before downstream compromise, time to contain, false isolation rate (per direction), communication cost.
- Equal tuning budget across arms, grid-edge checks on every tuned parameter, separate tuning and evaluation seeds, pre-registered decision rules.
- Timing: use the latency tests from Update 17 as a design aid only; replace assumed timings with measured ones.

### 8. Hypotheses (pre-register; not results)

1. The proposed method beats IH and AG on held-out exploit families.
2. NK performs close to the proposed method on known exploits and worse on held-out ones.
3. A1 matches or beats A3 in one-box settings.
4. A3 stays close to A1 unless pivots are in the seconds range or the channel is badly degraded.
5. Any real multi-agent advantage comes from a physical constraint, not from the architecture.
6. Federated per-home agents suffice for slow pivots (hours) and fail for fast ones.

### 9. Decision rules (fix before running)

| Outcome | What Paper 3 claims |
|---|---|
| Proposed method beats IH and AG on held-out exploits, and NK is clearly worse | Belief with novelty state helps against pivots without known exploits; main claim stands |
| A3 beats A1 and A0 under a stated physical constraint | Multi-agent advantage exists, limited to that constraint |
| A3 stays close to A1 across realistic delay and loss | Separation is cheap; method validated for physically separate deployments |
| A1 matches or beats A3 everywhere | Drop the multi-agent claim, remove "multi-agent" from the title, keep the method and benchmark |
| Method does not beat IH or AG on held-out exploits | Paper 3 reduces to the benchmark plus the A1-vs-A3 map |
| Federated matches everything for slow pivots | Honest negative for coordination; benchmark and latency finding survive |

### 10. Risks

1. Inherits Paper 1's novelty calibration. If that belief is weak, hypothesis 2 fails.
2. Injected pivots are synthetic evidence on real benign topology. No dataset is verified to label cross-protocol pivots (SHARP and BCCC-IoT-IDS-Zwave-2025 still unchecked).
3. IoTHaven's environment may cover more protocols than the abstract suggests (verify).
4. Pivot timing in IoT is unmeasured; sourced figures are enterprise anchors (Update 17).
5. Detection delay (Paper 1) caps what Paper 3 can achieve.
6. Policy-to-protocol action mapping, the reward/cost model for graded actions and agent placement are still undefined.
7. All novelty claims rest on snippet-level searches.

### 11. Open items

1. Read IoTHaven (dissertation chapter 6) and check whether any environment spans more than one protocol.
2. Read Zhang et al. (TDSC 2022) for what its two defenses are. Read RAGIIoT in full if accessible, and Ge et al. (2017) before the attack-graph claim goes into any draft.
3. Implement IH and AG as baselines before building the main method.
4. Define held-out exploit families and the pivot-injection protocol.
5. Add the separation parameters (smaller coordinator model, bursty loss, restricted action authority) to the pilot and check whether A3 ever differs from A1 (cheapest next test). Repeat later with learned policies (IPPO/MAPPO), several seeds and grid-edge checks.
6. Check whether common hubs really host both radio stacks, and whether cross-ecosystem belief sharing is studied.
7. Add the Zigbee-to-IP pivot direction to the threat model (Update 17 assumes Wi-Fi to Zigbee only).
8. Replace the novelty lines in Update 19 section 4 and Update 16 section 15 with the corrected wording in section 3, and mark Update 15's title option 1 as conditional on "multi-agent."
9. Carry forward all open items from Updates 1 to 19.



# UPDATE — 12/10 (12 Oct 2026) (new section only; everything above is unchanged)

## Clarification: Where the Model Lives, Where Learning Happens, and What Federated Training Actually Does

**Status:** terminology and design clarification, not a new experiment. It resolves a recurring confusion: "the model is at home level, but federated is not learning?"

### 1. The core distinction
- **The model** (belief, world model, policy) lives in each home. It is the agent that acts.
- **Learning happens locally**: PPO updates from the home's own traffic, plus imagined rollouts from the world model (MBRL).
- **Federated training is not a second model or a separate learner.** It is the rule for combining what the homes learned.
- **The server holds a global model but never sees data and never trains on any.** It improves only by averaging what the homes send.
- Wording to use: "federated is not a separate learner," not "federated is not learning."

| Piece | What it is | Where |
|---|---|---|
| Model (belief, world model, policy) | The agent that acts | Each home |
| Local learning | PPO updates plus imagined rollouts, from the home's own traffic | Each home |
| Federated training | The rule for combining the homes' learned weights | Coordinated by the server |
| Global model | The average of the homes' weights | Held by the server, sent back to homes |

### 2. What travels: weights, not a dataset
- **Weights** = the numbers inside the model after learning. They go to the server.
- **Dataset / raw traffic** never leaves the home.
- Returning the averaged weights is **automatic, part of the training loop**, not a manual push to each home.
- Federation is about **sharing knowledge across homes**, not mainly about faster retraining. Example: a new attack seen on 3 homes is carried in their weights; after averaging, all homes benefit without seeing that traffic.

### 3. The training loop (repeated in rounds)
1. **Local training:** each home trains its own model on its own traffic.
2. **Upload:** each home sends its weights to the server.
3. **Averaging:** the server averages the weights into one global model (FedAvg, or FedProx under non-IID).
4. **Return:** the server sends the global model back to every home.
5. **Repeat:** each home continues from the global model.

Analogies: pizza shops improving their own recipes while head office only averages the tweaks; or students each writing a summary from their own textbook while a teacher averages the summaries into one study guide (the teacher never reads the textbooks).

### 4. Open design choice: what does a home run after each round?
| Option | Behavior | Trade-off |
|---|---|---|
| **A. Use the global model as is** | Every home runs the same averaged weights | Simple; weak if a home's traffic differs from the fleet's (non-IID) |
| **B. Fine-tune locally after each round** (suggestion) | Home starts from the global model and adapts to itself | Fits each home better; local copy can drift; a poisoned local update has more influence |

**Not yet decided. Record the choice.** It matters most under non-IID, so it connects directly to Candidate 1 (MBRL vs. model-free stabilization under non-IID). Related question: do homes keep learning after deployment, or is training frozen at deployment?

### 5. Prepared answers (committee)
- **Where does learning happen?** At the homes. The server only averages.
- **Do homes keep learning after deployment?** Open; see options A and B.
- **What does the server's model do?** It is a combined starting point for the homes.
- **One-paragraph version:** "The agent lives in each home and learns from that home's data. Federated learning is the training procedure: homes periodically send weights, the server averages them, and the averaged model goes back. The server never sees traffic and never learns from data directly."

### 6. Open items from this update
1. Decide option A vs. B (global as is vs. local fine-tuning) and record it; consider running both as arms in the Candidate 1 experiment.
2. Decide whether homes keep learning after deployment.
3. Carry forward all open items from Updates 1 to 18.


# UPDATE — 13 Oct 2026 (new section only; everything above is unchanged)

## Part 1. Future Work: PRI Jitter (recommendation only)

**What PRI is:** Pulse Repetition Interval, the time between radar pulses. PRI jitter is random variation in that time (radar uses it so the pulse pattern is hard to predict or fake).

**Recommendation: do NOT add it as a core part of the thesis. Park it as future work or a small ablation.**
- It is a signal property, not an algorithm. It is only useful as a feature, an observation model, or an attacker setting.
- IoT versions of the same idea: devices that send regular heartbeats (like a steady PRI), botnet "beaconing" that attackers jitter to hide, and several periodic devices mixed together behind a hub (radar "deinterleaving" is like separating them).
- MMPP already models changes in arrival rate. Whether interval-regularity features add anything extra is an open question, so test it as an ablation: GRU with and without interval-regularity inputs.
- Not novel by itself (inter-arrival-time and beaconing features are common in intrusion detection), so it should not be presented as a contribution.
- Possible later links: attacker timing jitter in the self-play idea (Idea F), and device separation at hubs (identity thread).

**Status:** paused. Revisit only after Papers 1 and 2 are stable.

---

## Part 2. Quick Q&A for Meeting Prep (plain English)

Marked **[Decided]** where the roadmap already settled it, **[Suggestion]** where it is my proposal, **[Open]** where nobody has decided yet.

### Q1. The agent has 3 states (normal, attack, 0-day). How does it know the attack type (DoS, Mirai, etc.)?
- Three states is too few. Use: normal, a few attack families (DoS/DDoS, recon, spoofing, Mirai/malware), and "unknown" (the 0-day state). Families, not every variant. [Suggestion]
- The agent never sees the true state. It sees signals and builds a **belief** (probabilities over the states). That is why it is a POMDP, not a plain MDP. [Decided]
- "Unknown" = traffic looks odd (big prediction error from the GRU) but no known family explains it.
- The action depends on the whole belief, not on a lookup table. Example: mostly one known family means a family-specific response; high "unknown" means a cautious step like throttling.
- The federated weights are the numbers inside the networks that form the belief and pick the action. They do not store "DoS means block".

### Q2. Why MBRL and not plain RL, if simulation is cheap?
- Cost alone is a weak argument; a committee will say so.
- Reason 1: the simulator is only a model (MMPP), so a policy trained there can fail on real homes. Real interaction is not cheap (blocking a device annoys the user). A world model learned from real traffic cuts the real interaction needed.
- Reason 2 (the strong one): the GRU's prediction error IS the "something is unusual" signal the POMDP uses. A model-free agent has no such signal.
- Be honest: include a recurrent model-free PPO baseline. Whether MBRL helps is tested in Candidate 1. If experiments are simulation-only, the cost argument mostly disappears and Reason 2 carries the case.

### Q3. Why federated? (the order of reasons)
- 1st: **bandwidth and scale** (sending all raw traffic from a whole fleet is expensive; weights are sent only each round). Measure it, do not assume it.
- 2nd: **data-minimization rules** in many countries (verify the exact legal wording for your countries before citing).
- 3rd: **privacy**, said narrowly: raw traffic stays at home, but weights can leak some information, so no formal privacy guarantee is claimed.
- Weak point: RAIDEN already uses small arrival-rate summaries, so the bandwidth argument is weaker than for raw packets. [Decided order; wording is mine]

### Q4. The POMDP already uses a Markov chain. Will MMPP use the same states? Where do the arrival rates come from?
- Simplest design: keep them as two separate parts of one hidden state. [Suggestion]
  - Threat state: normal, known families, unknown.
  - Traffic regime: the MMPP phase (for example low-rate vs burst).
- The belief covers both. Do not force MMPP phases to also mean threat states.
- Rates and thresholds: **fit them from real traces** (CICIoT2023, N-BaIoT) with maximum likelihood or EM, not by hand. Per-device-type fits may be needed. The agent then uses the model's likelihood/residual, not fixed cutoffs.
- [Open] whether the fitted rates are shared across homes in federation or kept local.

### Q5. What does the word "model" mean here?
It means several different things. Say which one:
- **World model:** predicts what happens next (the GRU). This is the "model" in model-based RL.
- **Traffic model:** MMPP, the statistical description of arrivals.
- **Policy:** maps belief to action (the PPO network).
- **Belief/POMDP model:** the hidden states, observations and transitions.
- **Weights:** the numbers inside the networks. These are what federated learning averages.
- **Global model:** the server's averaged copy of the weights.
Tip for the proposal: always write "world model", "traffic model", "policy network" or "global model", never just "model".

### Q6. Where does the model run? Which layer is federated learning for?
- The MBRL agent runs **in the home** (most likely on the hub), learns there, and acts there. [Open: hub vs device vs cloud; measure inference cost]
- The server only **averages weights**. It never sees traffic and never runs the agent.
- Layers (from Update 12): inside one home = MBRL agent; across many homes = federated learning; smart city = coordination only inside clusters that share infrastructure, federated across clusters that do not.
- Running the agent in the cloud is a bad fit: it means sending raw traffic out (loses the bandwidth and rules reasons) and adds delay. Speed alone is not the argument, since cloud delay is small next to detection delay.
- One sentence: "The agent runs and learns in each home. Federated learning is the periodic exchange of weights through a server that only averages."

### Q7. Is the model one per home, or one for Zigbee and one for Wi-Fi talking to each other?
- Papers 1 and 2: **one agent per home**. [Decided]
- Paper 3: the home's agent is split per protocol segment (Wi-Fi, Zigbee/Z-Wave) and they share beliefs. [Decided]
- But the pilot showed a single combined agent is the ceiling inside one box. Splitting is justified only when the segments are really separate boxes, owners, or action authorities.

### Q8. Does PPO update automatically online, or manually when we want?
- Neither extreme. [Suggestion]
- Train in rounds: local updates at each home, then federated merging on a schedule.
- Keep the deployed policy frozen between rounds, and test an update before it replaces the running one.
- Avoid constant per-step learning in a real home: a bad update could cut off legitimate devices, and a poisoned update would have more influence.

### Q9. Who runs PPO: the home or the cloud? (a common mix-up)
- **The home.** PPO runs locally on that home's traffic and imagined rollouts.
- The cloud server does **not** run PPO and does not see simulations or feedback. It only averages the weights the homes send.
- The "Claude v1 to v2" picture fits the release process (new version replaces old one), not the training: the homes do the learning.

### Q10. So each home is upgraded twice?
- Yes, as "upgraded", not "trained twice":
  1. **Local upgrade:** the home's PPO improves its own model (this is where learning happens).
  2. **Global upgrade:** the server averages the homes' weights into a new global model that replaces the home's model (option A) or becomes its starting point for more local training (option B).
- Order each round: local first, global second, then the next local round starts from the global model.
- The server merges (usually averages, often weighted by data amount). It does not judge each home's weights one by one. Screening suspicious updates is an extra add-on (Byzantine-robust aggregation), not the base design.
- "Better" is not guaranteed: the average can be better for the fleet and worse for one home, especially when homes differ (non-IID). That is what Candidate 1 tests.

### Q11. Before releasing a new global model, do we test it? Is the per-home check manual or automatic?
- Yes, test before release. [Suggestion]
- Automatic, server side: run the candidate in the twin and on held-out data for several home types (for example camera-heavy, lock-heavy, many-device). Set the pass thresholds BEFORE running (no home type worse by more than a margin; false-isolation rate under a limit).
- Automatic, on the device: the home runs the candidate in "shadow mode" (it scores traffic but does not act) and adopts it only if it is not worse than the current model.
- Manual: a person signs off the release and keeps a rollback to the previous version.
- The server cannot check real home data (it never sees it), so the real per-home check has to run inside the home.
- Limits: fixed thresholds can miss a home type nobody profiled; quiet homes may not give enough data for a reliable comparison; option A (use global as is) conflicts with a home rejecting a candidate.
- Caution: "better in the twin" is simulated evidence, not proof. Use held-out real data where possible and report per-home results, not only the average.

### Q12. What is still undecided (say this honestly in the meeting)
1. After each round, does a home run the global model as is (A) or fine-tune locally (B)? Do homes keep learning after deployment?
2. Where the agent runs: hub, device, or cloud.
3. What exactly is federated: only the policy, or also the world model and belief parts.
4. Whether MMPP rates are shared across homes or local.
5. Whether the release gate and shadow-mode check are adopted.

## Open items from this update
1. Record decisions for the five items in Q12.
2. Park PRI jitter until Papers 1 and 2 are stable; if revisited, run it as an ablation only.
3. Carry forward all open items from Updates 1 to 18 and the 12/10 section.


# UPDATE — 13 Oct 2026, Part 2 (new section only; everything above is unchanged)

## More Likely Committee Questions, Short Plain-English Answers

**Status:** meeting-prep notes. Answers are short and honest. Where the roadmap has not decided something, the answer says so. Claims about prior work rest on abstract/snippet-level searches, not a full database sweep.

---

### A. The idea and the novelty

**Q. What is new here? Isn't this just combining existing models?**
Each piece exists, but the combination solves something the pieces do not solve alone. The GRU's prediction error IS the POMDP's "unusual traffic" signal, so one depends on the other. And Candidate 1 asks an open question: does model-based learning reduce the extra training time that federation costs under non-IID data? Not yet confirmed by a full database search.

**Q. How is this different from existing zero-day IDS papers?**
Most detect or classify. This agent holds a belief, including an explicit "unknown attack" state, and takes graded actions (throttle before isolate). The closest papers (Q-BIRD, FedAtten-DRL, Siamese + PPO) each lack part of that, as far as the abstracts show.

**Q. Is a zero-day really detected?**
Not truly. The honest wording is "novel relative to training". Leave-one-family-out tests attack-class shift, not real zero-days, so also use temporal and cross-dataset splits.

---

### B. The method

**Q. Why a POMDP and not a plain MDP?**
The agent never sees the true state, only partial signals like traffic stats. A belief over hidden states handles that.

**Q. Why PPO and not DQN?**
PPO updates the policy more stably, and there is precedent in belief-based defense (BF-PPO). Present it as a choice to test, not a proven win.

**Q. How does the agent act when it is not sure?**
It uses graded actions tied to confidence: for example throttle when the belief is mixed, isolate only when it is high. The cost of a wrong action sits in the reward.

**Q. What is the reward?**
[Open] Not defined yet. It needs a cost for missed attacks, for false isolation of legitimate devices, and for disruption from responses.

---

### C. Data and evidence

**Q. Your data is simulated. Why trust it?**
It is calibrated against real traces (CICIoT2023, N-BaIoT), and final results must come from real held-out data. Simulation is used for training, not as proof.

**Q. Static datasets cannot respond to actions. How do you train RL on them?**
They cannot, so the MMPP simulator or twin is the interactive environment. The datasets calibrate it and evaluate on held-out real attacks.

**Q. No dataset has cross-protocol pivots. Is that a problem?**
Yes. The plan is real benign multi-protocol topology plus injected, documented pivots, with sensitivity sweeps. State plainly that this is synthetic evidence on real topology.

---

### D. Federation

**Q. Isn't federated learning worse than centralized?**
Often it converges slower, so a centralized baseline measures exactly what federation costs. Paper 2 asks whether a model-based agent shrinks that cost.

**Q. What does non-IID mean here?**
Different homes see different traffic, so their local models drift apart. Averaging drifted models can be slower or less stable.

**Q. Is it private?**
Only partly. Raw traffic stays local, but weights can leak information. Secure aggregation or differential privacy are bounded extensions; no formal guarantee is claimed.

**Q. What if a home lies or is compromised?**
Not covered in the core papers. Byzantine-robust belief fusion is the backup contribution.

---

### E. Paper 3 and deployment

**Q. Why multi-agent at all?**
Only for pivots across a shared hub that outrun a federated round. The pilot showed a single combined agent is the ceiling in one box, so splitting is justified only where segments are physically separate.

**Q. Can a small IoT device run this?**
[Open] Unknown. Measure GRU inference time on hub-class hardware before choosing hub, device or cloud.

**Q. What if detection is too slow?**
Then Paper 3 matters less. The latency test showed detection delay is the main bottleneck, so Paper 1's speed caps everything.

---

### F. The thesis as a whole

**Q. Is this too much for one PhD?**
It is large. The path is three papers, with the twin, XAI and Byzantine ideas held back as extensions, and Paper 1 is the core.

**Q. What if a result is negative?**
That is acceptable and planned for. Candidate 1 is meaningful either way: either MBRL helps, or you report the cost.

**Q. What would you do first?**
Run the database novelty sweep, read FedAtten-DRL and Q-BIRD, build Paper 1 on CICIoT2023, and write the threat model.

---

### Open items from this update
1. Define the reward and cost model (Q: What is the reward?).
2. Measure inference cost on hub-class hardware.
3. Carry forward all open items from Updates 1 to 18, 12/10 and 13/10 Part 1.



# UPDATE 19 — 15 Oct 2026 (new section only; everything above is unchanged)

## Proposal Blueprint (4 to 5 pages): Gaps First, Each Gap Tied to the Paper That Pointed to It

**Status:** the thesis topic is accepted; this section is the outline for the written proposal sent to the security and PhD doctoral school. It replaces the "Proposal PPT Blueprint" focus of Update 11 with a written-proposal focus on gaps and evidence.

**Honesty rule for every row below:** READ = abstract/snippet seen or text seen in this roadmap; VERIFY = authors, numbers or wording must be checked against the full text before they go into the proposal. Nothing here was read in full text. Where a paper's "simulation output" is quoted, it is the figure the source reported, not something re-run here. A reviewer who checks one wrong number will distrust the rest, so verify first.

**Working title (from Update 15, not final):** *Belief-Driven Defense Against Novel Attacks in IoT: Federated and Multi-Agent Reinforcement Learning Across Heterogeneous Devices and Protocols*

---

## 0. Page budget

| Section | Pages | Content |
|---|---|---|
| 1. Introduction and real use cases | 0.75 | Scenario, why now, what RAIDEN already did |
| 2. Problem statement, aims, objectives | 0.75 | One problem, four research questions, objectives |
| 3. Gaps and the papers that opened them | 1.5 to 2 | Four gaps, each with evidence, source and what it leaves open |
| 4. Proposed approach (short) | 0.5 | Main path and the three comparisons |
| 5. Expected outputs and contributions | 0.5 | Comparative results, benchmark, system |
| 6. Plan and risks, references | 0.5 | Timeline, validation gate, key references |

If it runs long, cut section 4 first; sections 3 and 5 are what the professor asked for.

---

## 1. Introduction (points to build the text from)

**Real-time use cases to open with (pick two, keep them concrete):**
1. **Hub pivot in one home:** a Wi-Fi device (camera or smart TV) is compromised through a known flaw, then used to reach a Zigbee smart lock that is not directly internet-reachable. A 2017 demonstration of exactly this chain (smart TV over Wi-Fi to a Zigbee lock) is in the roadmap (Update 8); authors and title still need to be looked up (VERIFY).
2. **Fleet of one vendor's devices:** 500 smart locks in 500 homes; a new attack seen on 3 devices should help the other 497, without raw traffic leaving any home (Paper 2 example).
3. **Botnet spread:** Mirai-style spread across devices; RAIDEN's own setting (MMPP traffic model plus GRU detecting malware spread).
4. **Identity confusion at the hub:** many devices appear as one stream behind a hub or NAT; 38 Zigbee/Z-Wave devices sit behind 5 hubs in CICIoT2023.

**Introduction flow:**
- IoT devices multiply; most defenses detect and classify, they do not decide and act under uncertainty.
- Novel attacks have no known signature; detectors trained on known classes degrade on shift.
- Real homes mix protocols (Wi-Fi, Zigbee, Z-Wave) through shared hubs, yet defenses are mostly single-protocol.
- Vendors want fleet-scale learning without centralizing raw traffic.
- Baseline already completed: RAIDEN (MMPP traffic model plus GRU for malware-spread detection); this thesis extends it from detection to belief and action.

---

## 2. Problem, aims, objectives

**Problem statement (one sentence):** IoT defenses cannot yet decide, under partial observability, how to respond to novel attacks that may cross protocol boundaries inside a home, and it is unknown what it costs to scale such a defender across a fleet or to split it across protocols.

**Aim:** design and evaluate a belief-driven defense agent for IoT that (a) holds an explicit belief about unseen and novel attacks, (b) defends against cross-protocol pivots inside a home, and (c) scales across a device fleet, with measured accuracy and cost trade-offs at every step.

**Research questions (ordered as the professor's four ideas):**
- **RQ1, zero-day belief:** can a POMDP agent with an explicit "unknown attack" belief state, a GRU/MMPP world model and PPO policy take better graded actions on novel attacks than detection-only or belief-free baselines?
- **RQ2, cross-protocol:** can it defend a home against a compromise that crosses a protocol boundary through the hub (Wi-Fi to Zigbee/Z-Wave), where single-protocol defenses see nothing?
- **RQ3, federation:** what does federating this agent across homes gain and cost compared with centralized training, under non-IID traffic?
- **RQ4, RL vs MARL (and model-based vs model-free):** inside one smart home, does splitting the agent per protocol segment (MARL) beat a single agent (RL), and at what cost? Does model-based RL reduce the cost of federation compared with model-free RL?

**Objectives:**
1. Build the belief-driven agent (POMDP, PPO or BF-PPO, GRU/MMPP world model) and evaluate it on real datasets with leave-one-family-out, temporal and cross-dataset zero-day protocols.
2. Define a threat model and build a cross-protocol pivot benchmark (real benign multi-protocol topology plus documented injected pivots) and evaluate defenses on it.
3. Train the agent federated across homes with IID and non-IID client splits; compare to centralized training.
4. Run three controlled comparisons (MBRL vs RL, MARL vs RL, federated vs centralized) with one shared accuracy-and-cost protocol.
5. Gate every federated release through a shadow check or a twin test before deployment.

---

## 3. Gaps and the papers that opened them

For each gap: what the proposal says, the source, what the source reported, and what it leaves open.

### Gap 1: Novel-attack decisions without a belief over hidden state
**Claim to write:** detection-style zero-day systems and belief-based defenders exist separately; none found combines an explicit novelty state in the belief with graded actions in IoT.

| Source | What it reported / does | What it leaves open | Status |
|---|---|---|---|
| Hammar and Stadler, operational-technology intrusion response (POMDP, PPO variants including belief-based BF-PPO) | Closest method: POMDP formulation with PPO solvers | OT domain, no zero-day layer, not federated | Seen in roadmap (Update 1); VERIFY full text |
| Siamese network + PPO cross-dataset zero-day IDS (2025/26) | Zero-day IDS with PPO adaptive-defense policy; reported 2.21% false-positive rate | No belief state, not federated | Snippet-level; VERIFY number |
| Q-BIRD, belief-conditioned PPO for V2X cyber defense (arXiv 2606.07796) | PPO driven by belief over attacker intent in a partially observable setting | V2X, single agent, no world model, novelty not a state | Snippet-level |
| DQN-IDS; DeepEdgeIDS; CyDER 2.0 | Anomaly or uncertainty used as a feature or framing with RL | Novelty is a feature, not a hidden state | Snippet-level; read CyDER 2.0 and DQN-IDS first |
| Open-set and held-out-label IDS (MI2DAS; Jahangir et al.) | Reject held-out classes as unknown | Classification, not sequential decisions | Snippet-level |

**Honest limit to state in the proposal:** leave-one-family-out tests shift between attack classes, not true zero-day behavior; combine it with temporal and cross-dataset splits.

### Gap 2: Cross-protocol compromise inside the home is open
**Claim to write:** a compromise crossing from a Wi-Fi device to a Zigbee/Z-Wave device through the hub is a documented real attack, but datasets, detectors and RL defenses do not cover it.

| Source | What it reported / does | What it leaves open | Status |
|---|---|---|---|
| 2017 demonstration: smart TV compromised over Wi-Fi, then used against a Zigbee smart lock on the same hub | A working cross-protocol pivot | Attack shown, no defense or dataset | Authors/title not captured; VERIFY |
| 2026 Z-Wave dataset paper reviewing 30 IoT datasets | Lists lack of support for multi-protocol analysis among 22 shortcomings | Gap stated by the dataset community itself | Snippet-level; VERIFY authors |
| Shafi (2024), York University MSc thesis, dual-tier graph-learning detector for IP and Z-Wave traffic | Own multi-protocol dataset; its own shortcomings list names missing Zigbee/Z-Wave consideration, multi-modal data and protocol-specific attacks; lateral movement or pivoting not listed | Parallel streams, no tracking of a compromise crossing the hub; dataset release status unknown | Read in part (Update 10) |
| BRIDGE/TCH-Net (2026), cross-domain IoT botnet benchmark | Detection degrades across network environments; baseline mean leave-one-domain-out F1 about 0.56 | Cross-environment weakness shown, not cross-protocol pivots | Snippet-level; VERIFY |
| Das and Nair (2026), multi-stage smart-home attack dataset | 178,831 samples, 7 MITRE-Caldera multi-stage scenarios, baseline RF multiclass accuracy 0.775 | Wi-Fi only, attacker inside the LAN, IPs/ports removed so no device graph | Read (Update 10) |
| Andreou et al. (2025), CTDE multi-agent moving-target defense against cross-slice lateral movement (6G) | MARL against lateral movement across a boundary | Network slices, not heterogeneous IoT protocols | Snippet-level; closest MARL neighbor |
| Landolt et al. (2025), MARL in cybersecurity survey | MARL for lateral-movement containment is established | Enterprise networks and cyber gyms | Snippet-level |
| Hierarchical MARL on CAGE-4 | Simulated enterprise defense | Not IoT, no protocol boundary | Snippet-level |

**Not found in these searches:** any work combining MARL, security and hub-mediated cross-protocol pivots. This is a first-pass web sweep, not a database sweep; state it as "none found" and run the sweep before submission.

**Evidence the pivot speed matters (use carefully):** enterprise breakout time averaged 29 minutes in 2025 with a fastest case of 27 seconds (CrowdStrike 2026 Global Threat Report, press-release level; VERIFY against the report). No IoT or hub-specific pivot timing was found, so say the pivot speed is a scenario parameter.

### Gap 3: What federation costs for a decision-making defender under non-IID traffic
**Claim to write:** federated IDS work mostly federates detectors; the cost of federating a decision-making agent, and whether model-based learning reduces it, is not measured in security.

| Source | What it reported / does | What it leaves open | Status |
|---|---|---|---|
| FRL-IPS, federated DDQN intrusion prevention across SDN domains (Flower framework, IID and non-IID) | Federated training reached prevention comparable to centralized at steady state, but needed more training to stabilize, and heterogeneity increased instability and stabilization time | Model-free; no belief, no zero-day, no identity ambiguity; unit of "stabilization time" not yet checked | Quoted line only (Update 8); read experiment section |
| Belarbi et al., federated deep learning for IoT intrusion detection | Reports sizable performance loss under non-IID data (about 50% in the snippet) | Detection only | Snippet-level; VERIFY the figure |
| Federated Ensemble Model-based RL (general RL, around 2021, VERIFY) | Federated dynamics-model ensemble with the policy trained on the model | Not security, not belief-based, not non-IID security traffic | Abstract-level; cite as general precedent |
| FedAtten-DRL (federated DRL for IoT NIDS, with PPO) | Federated DRL with zero-day aim | No belief or world model; detection-style | Snippet-level |
| FMARL (Computer Communications, 2026) | Federated multi-agent RL for intrusion detection, non-IID | Classification framing, DQN | Snippet-level |
| FMADRL moving-target defense for UAV swarms (arXiv 2506.07392) | Federated multi-agent POMDP defense | UAV DoS, not IoT zero-day | Snippet-level |
| Amamou et al., AINA 2026 | Federated learning (FedProx), GRU and an agentic component for IoT attack detection (from the abstract) | Full text unread; no belief or RL mentioned in the abstract | Abstract only; get the PDF |
| FedPPO-PG (smart grid) | Federating PPO with centralized critic | Not security | Seen in roadmap (Section 13) |

**Do not claim:** first federated RL for IoT zero-day (FedAtten-DRL), first belief-conditioned PPO in cyber defense (Q-BIRD, Hammar and Stadler), first federated multi-agent POMDP defense (FMADRL), first federated MBRL (Federated Ensemble MBRL).

### Gap 4: The price of splitting the defender by protocol (RL vs MARL), unmeasured
**Claim to write:** MARL is established for network defense, but no one has measured, for a single smart home, what splitting the defender per protocol segment gains or costs against one combined agent.

| Source | What it reported / does | What it leaves open | Status |
|---|---|---|---|
| MARL cybersecurity survey; H-MARL on CAGE-4; Andreou et al. | MARL defense works in simulated enterprise and slice settings | No single-vs-split comparison in a multi-protocol home | Snippet-level |
| MARL on multi-protocol gateways (resource allocation, data collection) | Gateway-as-agent architecture has precedent | Not security | Snippet-level |
| Own pilot (this roadmap, Update 16 follow-up, toy threshold policies, one tuning seed) | A single combined agent is the ceiling for split agents with sharing when delay and loss are zero; separation costs delay, which bites only for fast pivots | Hand-built policies, assumed timings; needs learned policies and measured costs | Own result; treat as motivation, not evidence |

---

## 4. Proposed approach (half a page, points only)

**Main path:**
1. **Believe:** per-home agent with POMDP belief including an unknown-attack state; GRU/MMPP world model; PPO or BF-PPO. Observation grouped into fixed protocol-segment slots with a presence mask so it can be split later (Update 15 constraint).
2. **Defend across protocols:** extend the belief to a compromise crossing the hub; threat model with three attacker scenarios (automated seconds-scale, human-operated minutes-scale, slow and stealthy).
3. **Scale:** train federated across homes (FedAvg or FedProx) with IID and non-IID splits.
4. **Validation gate before every federated release:** shadow check (the home scores traffic with the candidate model but takes no actions, adopts only if not worse) and a twin or held-out test across home types, with a human sign-off and rollback. [Interpretation: "shadow learning" is read here as shadow mode; confirm with the professor if you meant something else.]

**Three controlled comparisons, one shared protocol:**

| Comparison | Arms | Setting |
|---|---|---|
| **MBRL vs RL** | World-model agent vs recurrent model-free PPO | Centralized and federated, IID and non-IID |
| **MARL vs RL** | Per-protocol agents with belief sharing vs one factored agent vs independent agents (floor) | One smart home with a shared hub |
| **Federated vs centralized** | Same agent trained both ways (FedAvg, FedProx) | Non-IID client splits |

**Shared accuracy-and-cost protocol (answers "higher accuracy, at what cost"):**
- Accuracy side: detection, time to contain, false isolation rate of legitimate devices, novel-attack performance (leave-one-family-out, temporal, cross-dataset).
- Cost side: training time to stabilize (define the unit: rounds, episodes or environment steps, after checking FRL-IPS), communication bytes (federated per round and in-home belief messages), inference time and memory on hub-class hardware, and critic or training cost as agents grow.
- Fairness: equal tuning budget and same information for every arm, separate tuning and evaluation seeds, many seeds with spread reported, and a grid-edge check on every tuned parameter (lesson from the PMB tuning).

**Data:** CICIoT2023 (zero-day and identity work), Edge-IIoTset (federated and non-IID), CIC IoT 2022 and Das and Nair (multi-protocol and multi-stage); injected, documented pivots on real benign topology for the cross-protocol benchmark. State plainly that injected pivots are synthetic evidence on real topology.

---

## 5. Expected outputs and contributions (points)

1. **Belief-driven agent for novel attacks (main path):** a POMDP/PPO agent with an explicit unknown-attack belief and graded responses, evaluated with three zero-day protocols on real data.
2. **Cross-protocol pivot benchmark and defense:** documented pivot scenarios on real multi-protocol topology, with a threat model and a defense evaluated on it. Citable artifact even if headline results are modest.
3. **MBRL vs RL under non-IID:** measured accuracy and cost, benchmarked against the stabilization behavior reported by FRL-IPS. Meaningful whichever way it comes out.
4. **Federated vs centralized:** a quantified price of federation (accuracy, stabilization time, bytes) for a decision-making defender.
5. **MARL vs RL in a smart home:** a crossover map showing when splitting by protocol costs little or helps, and when one combined agent is better.
6. **Release-gate procedure:** shadow-mode and twin check before each federated release, with per-home results.
7. **Open artifacts:** the non-IID splitting protocol, the identity or pivot injection protocols, and the comparison scripts.

**Honest framing for readers:** a negative or mixed result in any comparison is still a contribution, and the proposal should say that up front.

---

## 6. Plan, risks, references (points)

**Risks to state in the proposal (they show the plan is credible):**
1. Simulation trust: injected pivots and the MMPP simulator; mitigated by calibration to real traces, held-out injection styles and real held-out validation (an earlier MMPP dataset was rejected by the committee as untrusted).
2. No labeled cross-protocol pivot data exists.
3. Novelty claims rest on a first-pass web sweep; the IEEE Xplore, ACM and Scopus sweep is pending.
4. Detection delay caps what the cross-protocol defense can achieve; Paper 1's speed matters.
5. Scope is large; twin and XAI, Byzantine-robust fusion and the LMB/PMB identity work are held back as extensions.

**Reference list to assemble (VERIFY each: authors, year, venue):** Hammar and Stadler; Siamese+PPO zero-day IDS; Q-BIRD; CyDER 2.0; DQN-IDS; DeepEdgeIDS; FRL-IPS; Federated Ensemble MBRL; FedAtten-DRL; FMARL (2026); FMADRL (UAV); Amamou et al. (AINA 2026); FedPPO-PG; Belarbi et al.; Shafi (York, 2024); Das and Nair (2026); BRIDGE/TCH-Net; the 2026 Z-Wave dataset review; the 2017 smart-TV-to-Zigbee-lock demonstration; Andreou et al. (2025); Landolt et al. (2025); CrowdStrike 2026 report; CICIoT2023, Edge-IIoTset, CIC IoT 2022 dataset papers; RAIDEN.

---

## 7. Ordering decision to record

You listed the ideas as: (1) zero-day belief, (2) cross-protocol, (3) federated, (4) RL vs MARL. The earlier roadmap build order was Believe (Paper 1) then Scale (federated, Paper 2) then Coordinate (cross-protocol with MARL, Paper 3). Suggestion: write the proposal in your listed order (problem-driven, strongest gaps first), and keep the build order from Update 13 for the work plan. [Open: confirm with the professor.]

## 8. Open items from this update
1. Look up and verify every source in the gap tables against full text, starting with Hammar and Stadler, FRL-IPS (fix the unit of stabilization time), FedAtten-DRL, Q-BIRD, Amamou et al., Das and Nair, Shafi (rest of the thesis) and BRIDGE/TCH-Net.
2. Run the IEEE Xplore, ACM and Scopus novelty sweep (query strings in Update 18) before the proposal is finalized.
3. Confirm the meaning of "shadow learning" with the professor.
4. Decide the per-home policy choice (global as is vs local fine-tuning) and the reward and cost model; both are still open.
5. Convert sections 1 to 5 into proposal prose at the page budget; keep the gap tables as the core of section 3.
6. Carry forward all open items from Updates 1 to 18, 12/10 and 13/10.



# UPDATE 20 — 16 Oct 2026 (new section only; everything above is unchanged)

## Note for Later: Small Conference-Paper Ideas With a Small Math Core and a Cheap Test

**Status:** parked ideas, not part of the proposal's core scope. Each one is small enough for a short conference or workshop paper, has a compact mathematical core, and has a cheap test with a pass/fail rule fixed before running (same style as the B0/B1/PMB spoofing checklist in Updates 6 and 7). Everything marked "toy" or "idea only" is untested on real data. Related-work claims are first-pass and need the database sweep before any novelty is claimed.

**Rules for all checklists below (carry over from earlier lessons):**
- [ ] Set numeric pass/fail thresholds before running anything.
- [ ] Separate tuning seeds from evaluation seeds; report mean and spread over many seeds.
- [ ] Grid-edge check on every tuned parameter (widen until the winner is inside the range).
- [ ] Equal tuning budget and equal information for every arm.
- [ ] Label simulation results as simulation; validate on real held-out data where it exists.
- [ ] A negative result is allowed and still reportable.

---

## Idea 1. Oracle vs identity-trusting vs identity-free belief under spoofing (already has toy results)

**Core question:** how much does a pipeline lose when it trusts device identity, and does an identity-free belief filter recover it?
**Small math:** cardinality error |N_hat - N| for the estimated vs true number of compromised devices; the gap between B0 (oracle, reads true identity) and B1 (trusts the identity hint) is the cost of identity ambiguity.
**Existing toy result (Updates 6 and 7):** B0 flat, B1 rises with corruption (0.29 to 1.26 MAE), PMB and EntityRes stay flat and are statistically tied after fair tuning; PMB beat LMB after independent tuning.
**Checklist for a paper-grade version:**
- [ ] Replace the toy simulator with real CICIoT2023 identities and controlled corruption knobs (rotation rate, hub aggregation size, spoof-duplicate fraction, hidden-device fraction, fingerprinting error).
- [ ] Add an adaptive attacker that mimics the measurement itself, not only the identity label (the toy test never covered this; Update 8 says so).
- [ ] Add the independent per-device Bernoulli baseline (B3) to test whether the multi-object machinery is needed at all.
- [ ] Re-tune LMB with the corrected wide grid (open item from Update 7).
- [ ] Report OSPA or an equivalent multi-object distance, label switches, and false isolation rate.
**Status:** toy results exist; real-data test not run. Positioning note: the claim is "identity as an unreliable sensor", not "better identification" (Update 8 correction).

## Idea 2. Hub-visibility test: what the hub can and cannot attribute (idea only)

**Core question:** at the hub, which sources can the model attribute (IP, MAC, timing) and where does attribution fail (IP change, MAC spoofing or randomization, cloud-relayed commands, simultaneous requests)?
**Small math:** attribution accuracy as a function of the corruption knobs from Idea 1; for the IP-then-Zigbee chain, the probability that a Zigbee command is linked to the right triggering IP request when k requests arrive within the same window (ambiguity grows with k).
**Checklist:**
- [ ] Define the chain-linking rule (time window, ordering) and its failure cases.
- [ ] Build a small testbed or simulation with controlled concurrent requests.
- [ ] Measure linking accuracy versus window length and concurrency.
- [ ] Compare against a no-linking baseline (each segment judged alone).
**Status:** idea only.

## Idea 3. Cross-protocol pivot latency: when does real-time sharing become necessary? (toy result exists)

**Core question:** at what pivot speed and detection delay does a federated round-trip fail, and when is hub-local sharing needed?
**Small math:** a prevention event happens when t_detect + t_share + t_act < t_pivot; with lognormal delays, P(prevent) = P(t_detect + t_share + t_act < t_pivot). For federated sharing, t_share is dominated by waiting for the next round (uniform over the round length), plus processing.
**Existing toy result (Update 17):** with pivot-delay anchors from enterprise data (27 s fastest, 29 min average), federated prevention is 0.00 at 27 s and about 0.53 at 29 min for a 1 h round; hub-local is about 0.78 and 1.00; detection delay is the dominant term.
**Checklist:**
- [ ] Replace assumed timings with measured ones (GRU inference time on hub-class hardware, hub LAN latency, Zigbee/Z-Wave action times).
- [ ] Source IoT-specific pivot timing, or measure it in the home testbed (Idea 6).
- [ ] Add bursty loss and stale-belief decay to the sharing channel.
- [ ] Report the crossover point (pivot speed where hub-local stops beating federated).
**Status:** toy model only; all timings assumed except the cited enterprise anchors (press-release level, verify).

## Idea 4. Price of separation: single agent vs split agents vs rule-based sharing (toy result exists)

**Core question:** inside one smart home, what does splitting the agent per protocol cost compared with one combined agent, and does learned coordination beat a simple rule?
**Small math:** price of separation = loss(A3) - loss(A1), as a function of delay, loss rate, coordinator compute limit and action authority. With zero delay and loss, A3 and A1 are the same function class, so A3 cannot beat A1 (Update 16 follow-up).
**Arms:** A1 combined agent (ceiling), A2 independent agents (floor), A3 split agents with belief sharing, A5 hand-written rule ("if one segment's belief is high, tighten the other"), optional A4 third hub decider.
**Checklist:**
- [ ] Add the rule-based arm A5; if learned A3 cannot beat A5, MARL is optional.
- [ ] Add physical-separation parameters: a smaller model on the coordinator, bursty loss, restricted action authority.
- [ ] Repeat with learned policies (IPPO or MAPPO) over many seeds.
- [ ] Define the message content (per-segment compromise probability, novelty belief, confidence, bridge flag) and its size.
- [ ] Report accuracy and cost together (training time, message bytes, inference time).
**Status:** toy result with hand-built threshold policies and one tuning seed only; not evidence about learning.

## Idea 5. Cost of federating a decision-making defender: MBRL vs model-free under non-IID (idea only)

**Core question:** does a world model reduce the stabilization time that federation adds under non-IID traffic?
**Small math:** define stabilization time as the first round at which return stays within epsilon of its final value for w rounds; compare federated vs centralized, and MBRL vs recurrent model-free PPO, at each non-IID level. Non-IID level controlled by the Dirichlet alpha for label skew, plus device-type partition for feature skew.
**Checklist:**
- [ ] Read FRL-IPS's experiment section and use the same unit of stabilization time (rounds, episodes or environment steps).
- [ ] Include the recurrent model-free PPO baseline and a centralized baseline.
- [ ] Sweep alpha from near-IID to strongly non-IID; report mean and spread.
- [ ] Compare FedAvg and FedProx.
- [ ] Count communication bytes per round and in total.
- [ ] Decide global-as-is vs local fine-tuning (12/10 decision) and run both as arms if cheap.
**Status:** idea only; general federated MBRL exists outside security (do not claim "first federated MBRL").

## Idea 6. Home testbed with real labeled pivots (idea only; most valuable single artifact)

**Core question:** can a small isolated home testbed produce real, labeled cross-protocol traffic and real pivot timings?
**Setup (suggestion):** isolated router or VLAN, local hub (Home Assistant) with a Zigbee USB stick, a few Zigbee devices (plug, bulb, door sensor), a Wi-Fi camera or plug; a laptop or Raspberry Pi plays the already-compromised IP device ("assume breach") and sends commands to the hub; use a plug as the lock stand-in.
**Checklist:**
- [ ] Get supervisor or ethics approval in writing.
- [ ] Keep the test network isolated and short-range; own devices only.
- [ ] Log IP-side traffic, hub logs and, if available, Zigbee-side traffic with timestamps and ground-truth labels.
- [ ] Record benign days first (baseline), then scripted pivots at varied speeds and times.
- [ ] Release a small documented dataset with its limits stated (one home, few devices).
**Status:** idea only.

## Idea 7. Shadow-mode release gate for federated updates (idea only)

**Core question:** does a shadow-mode check plus a twin test catch bad global models before they reach homes?
**Small math:** adoption rule per home: adopt candidate theta_new only if a score on recent local data satisfies S(theta_new) >= S(theta_current) - delta, with S including false isolation rate; server-side gate: no home profile may degrade by more than a margin versus the previous version.
**Checklist:**
- [ ] Fix delta and the profile margin before running.
- [ ] Inject a deliberately bad candidate (poisoned or over-averaged) and measure how often the gate blocks it.
- [ ] Measure false blocks of good candidates.
- [ ] Test quiet homes with little data (shadow comparison may be unreliable there).
- [ ] Report per-home results, not only the mean.
**Status:** idea only; "shadow learning" is read here as shadow mode, to be confirmed with the professor.

## Idea 8. Lying agents and poisoned beliefs (Byzantine extension; idea only)

**Core question:** can a KL-divergence check between local beliefs and fleet or neighbor consensus detect and down-weight a lying agent?
**Small math:** for belief distributions p_i and consensus q, flag agent i when KL(p_i || q) exceeds a threshold tau; weight w_i decreases as KL grows.
**Checklist:**
- [ ] Extend the threat model to include lying agents or poisoned updates (currently out of scope).
- [ ] Choose attack types: constant "all normal", random, and slowly drifting lies.
- [ ] Measure detection rate vs false down-weighting of honest but unusual homes (non-IID homes can look like liars).
- [ ] Compare with standard robust aggregation (median or trimmed mean).
**Status:** idea only; crowded field (backup contribution).

## Idea 9. Interval-regularity features (PRI-style jitter) as an ablation (idea only)

**Core question:** do inter-arrival regularity or jitter features add information beyond MMPP rate states for novelty detection?
**Small math:** per device, compute the coefficient of variation of inter-arrival times over a window; a jittered beacon raises it while a rigid heartbeat keeps it near zero.
**Checklist:**
- [ ] Run the GRU with and without interval-regularity inputs on CICIoT2023 or N-BaIoT.
- [ ] Test an attacker that adds timing jitter to a beacon.
- [ ] Do not present as a contribution on its own (inter-arrival features and beaconing detection are common).
**Status:** parked; recommendation from the 13 Oct update.

---

## Quick ranking for choosing a first small paper (suggestion, my judgment)

| Idea | Math core | Cost to test | Existing toy result | Fit for a short paper |
|---|---|---|---|---|
| 1. Identity oracle vs PMB/EntityRes | Small | Low | Yes | Strong, needs real-data test and adaptive attacker |
| 3. Pivot latency crossover | Small | Low | Yes | Good once timings are measured |
| 4. Price of separation | Small | Medium | Yes (hand-built policies) | Good, needs the rule-based arm |
| 6. Home testbed dataset | None | Medium (hardware) | No | Strong as a dataset or short data paper |
| 5. MBRL vs model-free under non-IID | Small | Medium to high | No | Candidate 1; may belong in Paper 2 |
| 7. Release gate | Small | Medium | No | Possible workshop paper |
| 8. Lying agents | Small | Medium | No | Backup |
| 2. Hub visibility | Small | Medium | No | Pairs with Idea 6 |
| 9. Interval features | Small | Low | No | Ablation only |

## Open items from this update
1. Pick which ideas stay inside the thesis papers and which become separate short papers, to avoid splitting the same result across two publications.
2. Run the database novelty sweep for each idea before claiming novelty.
3. Carry forward all open items from Updates 1 to 19, 12/10 and 13/10.


# UPDATE 21 — 16 Oct 2026 (new section only; everything above is unchanged)

## More Small Conference/Workshop Ideas, Each Linked to the Proposal

**Status:** parked ideas, continuing the numbering of Update 20 (Ideas 1 to 9). None is strong enough alone for a main publication; each is a small study with a compact math core and a cheap test, and most can also live as an ablation inside a thesis paper. All are untested; related-work claims need the database sweep first. The shared rules checklist from Update 20 applies to every idea here (thresholds fixed before running, separate tuning and evaluation seeds, grid-edge check, equal tuning budget, simulation labeled as simulation, negative results allowed).

**Link key:** P1 = zero-day belief agent, P2 = federation, P3 = cross-protocol and RL vs MARL, GATE = release gate, BENCH = cross-protocol benchmark.

---

## Idea 10. Is the "unknown attack" probability calibrated? (links P1)
**Question:** when the belief says "unknown = 0.6", is the traffic really novel about 60% of the time?
**Small math:** expected calibration error, ECE = sum over bins of (n_b / n) * |accuracy_b - confidence_b|; test with temperature scaling on the novelty output.
**Checklist:**
- [ ] Build held-out sets with known-novel and known-familiar traffic (leave-one-family-out, plus temporal and cross-dataset splits).
- [ ] Report reliability diagrams and ECE before and after calibration.
- [ ] Check calibration drift when the traffic regime shifts.
**Why it helps the proposal:** graded actions only make sense if the belief numbers mean something.

## Idea 11. Reward and cost sensitivity: false isolation vs missed attack (links P1, P3)
**Question:** how much does the learned policy change as the cost ratio between a false isolation and a missed attack changes?
**Small math:** reward R = -c_miss * (missed compromise) - c_fi * (false isolation) - c_dis * (disruption); sweep the ratio c_fi / c_miss and plot the Pareto front of containment time vs false isolation rate.
**Checklist:**
- [ ] Fix the sweep range before running.
- [ ] Compare the learned policy with a fixed-threshold baseline at matched false isolation.
- [ ] Report the policy's graded actions per region of the front.
**Why it helps the proposal:** closes the open reward and cost model item.

## Idea 12. Belief-message size vs defense quality (links P3)
**Question:** how small can the in-home belief message be before coordination breaks?
**Small math:** quantize each belief value to b bits; message size = segments x fields x b; plot defense loss vs bits per message.
**Checklist:**
- [ ] Define the message fields (compromise probability, novelty belief, confidence, bridge flag).
- [ ] Sweep bits and update rate; include a no-sharing floor and full-precision ceiling.
- [ ] Combine with the loss and delay sweep from Update 17.
**Why it helps the proposal:** gives the cost side of the MARL vs RL comparison a concrete number.

## Idea 13. Stale beliefs: how fast should shared confidence decay? (links P3)
**Question:** when the sharing channel drops messages, how should the receiver treat an old belief?
**Small math:** decay confidence as c(t) = c0 * exp(-t / tau); search tau against defense loss; compare with "keep last value" (the Update 16 pilot flattered loss this way).
**Checklist:**
- [ ] Add bursty loss, not just independent loss.
- [ ] Compare keep-last, exponential decay and drop-to-prior.
- [ ] Report loss vs tau and check the optimum is not at the edge of the grid.
**Why it helps the proposal:** fixes a known weakness of the pilot (message loss looked mild only because the receiver kept the last value).

## Idea 14. What exactly should be federated? (links P2)
**Question:** share only the world model, only the policy, or both?
**Small math:** compare three arms by stabilization time, final return and bytes per round; bytes = rounds x (parameters shared) x bytes per parameter x 2 (up and down).
**Checklist:**
- [ ] Use identical local training, rounds and seeds across arms.
- [ ] Test under IID and non-IID splits.
- [ ] Include a no-federation arm (each home alone) and a centralized arm.
**Why it helps the proposal:** answers the open item "what exactly is federated" and feeds Candidate 1.

## Idea 15. Which kind of non-IID hurts the agent most? (links P2)
**Question:** label skew, feature skew, quantity skew or temporal drift: which one slows or destabilizes a federated belief agent most?
**Small math:** vary one skew at a time (Dirichlet alpha for label skew; device-type partition for feature skew; unequal client sizes for quantity skew; staggered attack arrival for temporal drift) and report the stabilization-time penalty vs the IID case.
**Checklist:**
- [ ] Fix the skew levels before running.
- [ ] Use the same unit of stabilization time as FRL-IPS (check its experiment section).
- [ ] Repeat for FedAvg and FedProx.
**Why it helps the proposal:** turns "non-IID" from one word into a measured breakdown.

## Idea 16. When does federation save bandwidth? (links P2)
**Question:** at what fleet size and round length does federating beat streaming raw summaries to a central server?
**Small math:** federated bytes per home = R x 2 x M (rounds x 2 directions x model size); streaming bytes per home = r x T (summary rate x time). Federation is cheaper when R x 2 x M < r x T, which gives a break-even time T* = 2 R M / r.
**Checklist:**
- [ ] Use RAIDEN's real summary rate and the real model size.
- [ ] Include compression and partial-model sharing (Idea 14).
- [ ] Report the break-even point honestly, even if it shows streaming is cheaper for tiny summaries.
**Why it helps the proposal:** tests the bandwidth argument instead of assuming it (it is the first reason to use federation). Known weak point: RAIDEN's summaries are already small.

## Idea 17. Cold start: how many benign days before the belief is reliable? (links P1, GATE)
**Question:** how much benign data does a new home need before false alarms settle?
**Small math:** plot false isolation rate and novelty-score variance against days of baseline data; define "ready" as the day the rate stays under a preset limit.
**Checklist:**
- [ ] Use real benign captures cut into increasing prefixes.
- [ ] Compare local-only start vs starting from the federated global model.
- [ ] Report the shadow-mode period needed before the agent is allowed to act.
**Why it helps the proposal:** gives a concrete answer to "what happens in the first days" and shapes the release gate.

## Idea 18. Slow and stealthy attacker vs belief threshold vs a classic sequential test (links P1, P3, threat model S3)
**Question:** does the belief-driven agent catch a low-and-slow pivot better than a simple CUSUM detector?
**Small math:** CUSUM statistic S_t = max(0, S_{t-1} + x_t - k), alarm when S_t > h; compare detection delay vs false alarm rate against the belief threshold at matched false alarms.
**Checklist:**
- [ ] Define the stealthy attacker (stays under a per-window threshold) and fix its parameters first.
- [ ] Match false alarm rates across methods.
- [ ] Report detection delay distributions, not only means.
**Why it helps the proposal:** gives the S3 scenario a real baseline, and connects to the optimal-stopping idea (Idea H) without needing its full theory.

## Idea 19. Compute budget on hub-class hardware (links P1, P3, deployment)
**Question:** can the GRU belief agent run fast enough on a hub-class device that inference time stays small against detection delay?
**Small math:** latency budget: inference time + sharing delay + action time must stay well below the pivot time; report per-step latency, memory and energy per decision.
**Checklist:**
- [ ] Measure on a Raspberry Pi-class device with the real model size.
- [ ] Test quantized and smaller GRU variants (also feeds the "smaller model on the coordinator" case in Idea 4).
- [ ] Report accuracy lost for each size reduction.
**Why it helps the proposal:** replaces assumed timings with measured ones and informs where the agent runs.

---

## Ranking for choosing small papers or thesis ablations (my judgment)

| Idea | Best as | Cost to test | Strongest link |
|---|---|---|---|
| 16. Federation bandwidth break-even | Short paper or Paper 2 section | Low (arithmetic plus real sizes) | Why federated |
| 13. Stale belief decay | Short paper or Paper 3 ablation | Low | Fixes a known pilot weakness |
| 18. Stealthy attacker vs CUSUM | Short paper | Low to medium | Threat model S3 |
| 10. Calibration of the unknown belief | Paper 1 ablation or short paper | Medium | Credibility of graded actions |
| 15. Which non-IID hurts most | Paper 2 section | Medium | Candidate 1 |
| 14. What to federate | Paper 2 ablation | Medium | Open decision |
| 11. Cost sensitivity | Paper 1 section | Medium | Open reward item |
| 19. Compute budget | Short paper or deployment section | Medium (hardware) | Where the agent runs |
| 12. Message size | Paper 3 ablation | Low | Cost side of MARL vs RL |
| 17. Cold start | Paper 1 or GATE ablation | Medium | First-days question |

## Open items from this update
1. Decide which ideas stay as ablations inside the three thesis papers and which become separate short papers; do not publish the same result twice.
2. Run the database sweep for each idea you keep.
3. Carry forward all open items from Updates 1 to 20, 12/10 and 13/10.


# Dempster-Shafer Theory for 0-Day Attack Detection — Study Notes & Paper Direction

This is a standalone research direction, separate from RAIDEN — a new model-based RL (MBRL) architecture for 0-day/novel attack detection, using Dempster-Shafer (DS) evidence theory to fuse multiple uncertain sources into a POMDP belief state.

## 1. Origin

Sourced mathematically from a 2015 PhD thesis on underwater seabed mapping (Ridha Fezzani, Université de Bretagne Occidentale/ENSTA Bretagne), which fuses two noisy sonar sensors (multibeam echosounder + interferometric side-scan sonar) into one confident depth map using belief-function theory (the EVEREG model — Petit-Renaud & Denoeux). The thesis itself is **not** about cybersecurity — the mathematical machinery (mass functions, belief/plausibility, Dempster's combination rule, discounting by reliability) is being deliberately repurposed here for attack detection, the same way MMPP's queueing-theory math was repurposed for RAIDEN.

This repurposing is not a novel leap — a literature search confirmed Dempster-Shafer theory is an established, published approach for intrusion detection, malware detection, insider-threat detection, and explicitly for the "day-zero"/anomaly-detection problem (DS theory's capacity to represent honest ignorance, rather than forcing a binary classification, is the specific property that makes it suited to detecting attacks with no known signature).

## 2. Proposed Paper Direction — Comparative Analysis Contribution

A comparative-analysis contribution (in the same spirit as RAIDEN's Contribution 1) comparing belief-representation/fusion approaches for 0-day-style uncertainty, before proposing the DS-based MBRL model as the answer to gaps found:

- **Plain Bayesian belief (standard POMDP default)** — forces all belief onto specific, named states; cannot represent "evidence doesn't match any known category" without arbitrarily splitting probability across known options.
- **Dempster-Shafer / belief-function theory** — allows belief to sit on *groups* of states (including the full set = total ignorance), and tracks source conflict explicitly during combination.
- **Fuzzy Set Theory / Possibility Theory** — handles vagueness/degree-of-membership rather than DS's belief/plausibility structure; the source thesis actually combines fuzzy sets *with* DS theory (EVEREG), so a worked hybrid precedent already exists.
- **Subjective Logic** — an extension of DS theory for trust/reputation modeling (belief, disbelief, uncertainty, base rate), used in network security contexts.
- **Evidential Deep Learning / Dirichlet-based uncertainty models** — a modern DL-native approach: network outputs Dirichlet distribution parameters instead of a forced softmax, separating "how much evidence do I have" from "how is it distributed" — conceptually parallel to DS theory but implemented directly as a neural network output layer.

**Planned finding/motivation (to be validated):** plain Bayesian/softmax-based approaches structurally cannot represent genuine "I don't recognize this" evidence without distorting it into a forced split between known classes — which is precisely the gap a 0-day detector needs to close. DS theory (or an evidential-DL equivalent) is proposed to fill that gap.

## 3. Core DS Theory — What Was Learned (Q&A Progression)

### 3.1 Mass Function (Basic Belief Assignment)
The foundational object everything else is built from. Unlike plain probability, mass can be assigned to a **group/subset** of possibilities, not only to single, specific outcomes — representing honest, evidence-grounded ambiguity rather than forced-but-baseless splitting.

$$\sum_{A \subseteq \Omega} m(A) = 1$$

**Key distinction clarified:** mass on a group (e.g., m({attack, unknown}) = 0.6) is **not** the same as "I don't know anything" — it represents *real, positive evidence* that narrows things down to that group, just without further basis to split within it. True "total ignorance" is the separate, specific case of mass sitting on the *entire* frame of discernment with no exclusions at all.

### 3.2 Belief and Plausibility
$$Bel(A) = \sum_{B \subseteq A} m(B) \qquad Pl(A) = \sum_{B \cap A \neq \emptyset} m(B)$$

- **Belief** = pessimistic/guaranteed floor — only mass entirely contained within A.
- **Plausibility** = optimistic/possible ceiling — any mass that overlaps A at all.
- The gap [Bel(A), Pl(A)] is itself a direct, honest measure of remaining uncertainty — narrow gap = sharp evidence, wide gap = genuinely inconclusive evidence. A single probability number cannot express this.
- Relationship: $Pl(A) = 1 - Bel(\neg A)$ — plausibility of A is bounded only by how strongly evidence rules A *out*.

### 3.3 Dempster's Combination Rule
$$m_{1\cap2}(A) = \sum_{B \cap C = A} m_1(B)\cdot m_2(C)$$

Merges two independent sources' mass functions by pairing every subset from source 1 against every subset from source 2, intersecting, multiplying their masses, and summing by resulting intersection. Mass landing on the empty set (∅) represents genuine **conflict** between sources and is explicitly tracked, then removed via normalization:

$$m(A) = \frac{m_{1\cap2}(A)}{1 - m_{1\cap2}(\emptyset)}$$

Worked numerically with a two-witness example; confirmed that agreeing sources reinforce each other post-normalization while conflicting sources pull against each other — the conflict is never silently averaged away.

### 3.4 Relationship to POMDP (not a replacement, a swap-in)
POMDP is a framework/skeleton (hidden state, actions, observations, belief state) — it does not dictate *how* belief must be mathematically represented. Standard POMDPs default to belief-as-probability-distribution, updated via Bayes' rule, forcing all belief onto specific named states.

**DS-theory integration = swapping what the POMDP's belief state IS, not adding a parallel process.** The belief state becomes a mass function (allowing grouped/unresolved belief, including an explicit "unknown/0-day" category) instead of a probability vector, and it's updated via Dempster's combination rule instead of Bayes' rule. This is a recognized research direction sometimes called an "evidential POMDP."

### 3.5 Does the 0-day/"unknown" state replace a Markov state?
No — it is not a fourth physical state added to a Markov/MMPP-style state machine. It is better understood as a property of the **belief**, not a new row in a transition matrix: it emerges from evidence sources collectively failing to confidently resolve into a known, named state (normal / known-attack), either because all sources report high individual ignorance or because sources actively conflict with each other (non-zero mass on ∅ pre-normalization). The underlying Markov/MMPP state structure stays as defined; "unknown" surfaces at the belief-fusion layer on top of it.

### 3.6 DS theory alone vs. DS + POMDP/MDP
DS theory alone answers "what do I currently believe" — a one-shot (or repeatedly re-run) evidence-fusion/classification tool, with no concept of actions, sequential decisions, or reward (this is exactly how several published malware/insider-threat-detection papers use it standalone). It has no way to decide what to *do* about a belief. POMDP/MDP + RL is what adds sequential decision-making and action selection on top. The two are complementary, not competing: DS theory is well-suited to the **detection** half of the problem; POMDP/MBRL is needed for the **decision/mitigation** half.

### 3.7 "Viewers" — what they are and where they come from
A "viewer" (evidence source) is any independent model/signal already present in the system that can be converted into a mass function. Not an external input — these are designed/chosen from existing architecture components. For a model-based RL (MBRL) system specifically, each component of a hybrid dynamics model (e.g., a Markov/CTMC-based component, a physics-based component, a DL-based component) naturally serves as its own independent viewer, since each has different strengths and different failure modes — which is precisely why fusing them (rather than relying on one monolithic model) helps genuine collective uncertainty surface explicitly as the "unknown" mass, instead of being hidden inside one overconfident model's single output number.

Each viewer needs two things to participate in DS fusion: (1) a way to convert its raw output into a mass function over the relevant states (including grouped/unresolved categories), and (2) a reliability/discounting factor (how much to trust that source) — this second part (discounting) is the next concept queued for study.

## 4. Architecture Sketch (for this new, separate model)

```
Viewer 1 (Markov/CTMC component) ─┐
Viewer 2 (Physics-based component) ─┼─> Dempster's combination rule ─> fused mass function
Viewer 3 (DL/learned component)   ─┘         (= POMDP belief state)
                                                      │
                                                      v
                                        MBRL planning / RL policy (action selection)
```

## 5. Still to Study (queued)
- **Stage 4 — Discounting (source reliability)**: how to weight a more-trusted viewer more heavily in the combination.
- Full worked numerical example translating the car-witness example into a 3-viewer (Markov/physics/DL) attack-detection scenario.
- Formal comparison methodology for Section 2's proposed contribution (Bayesian vs. DS vs. Subjective Logic vs. Evidential DL) — what task/metric would make this a fair, measurable comparison, following the same rigor lessons learned from the MMPP-vs-XGBoost comparison in RAIDEN (avoid circular targets, define a shared evaluation metric, confirm train/test separation where applicable).



---

## UPDATE — 26 October 2026

### 6. What was added since the last update

**6.1 Naming (important for the paper)**
- **DS = Dempster–Shafer**: the framework (also called evidence theory or belief function theory).
- **Dempster's rule** and **Yager's rule** are two *combination rules inside* DS. They are alternatives to each other, not alternatives to DS.
- Correct wording in a paper: "DS evidence fusion with Dempster's rule" or "DS evidence fusion with Yager's rule".
- In the Fezzani thesis, Yager appears **only** as Yager's smooth normalization for fuzzy focal elements, not as Yager's conflict rule. The thesis uses discounting, then Dempster's rule, then pignistic decision. A Dempster-vs-Yager comparison is therefore new work, not something the thesis already did.

**6.2 The grid (table) method for combining two viewers**
- Rows are the groups viewer 1 gives mass to, and columns are the groups viewer 2 gives mass to. Include Ω (the full set) in both.
- Each cell holds the overlap of its row group and column group. Its mass is the product of the two masses.
- Each row sums to viewer 1's mass for that group, and each column sums to viewer 2's. All cells sum to 1.
- Add up the cells with the same overlap to get the combined mass of that group.
- Overlap = ∅ means the two viewers disagree. The total mass on ∅ is the **conflict K**.
- Only the overlaps are used, because the masses already carry the weight.

**6.3 Dempster's rule and the Zadeh problem**

$$m(X)=\frac{\sum_{B\cap C=X} m_1(B)\,m_2(C)}{1-K},\qquad K=\sum_{B\cap C=\emptyset} m_1(B)\,m_2(C)$$

- Dividing by 1−K rescales what is left so the masses sum to 1 again.
- **Zadeh paradox**: doctor 1 says meningitis 0.99 / tumor 0.01, and doctor 2 says concussion 0.99 / tumor 0.01. Then K = 0.9999, and m(tumor) = 0.0001 / 0.0001 = 1. Dempster's rule gives 100% on the one outcome both considered nearly impossible.
- Lesson: **K must always be reported**. A high K means "my viewers disagree", and the output should not be trusted blindly.

**6.4 Yager's rule**
- The conflict is not divided away. It is moved to Ω (ignorance): m(Ω) = m₁(Ω)·m₂(Ω) + K. No division is done.
- Result: high conflict becomes "I don't know" instead of false confidence. This fits 0-day detection better.
- It replaces only the normalization step of Dempster's rule. The grid and the rest of the DS framework stay the same.
- Trade-off: it is not associative, so the order of combining several viewers matters.
- A full numeric comparison of the two rules is in Section 7.

**6.5 Discounting (concept only, not yet practised)**
- A viewer with reliability α has its masses scaled: m^α(A) = α·m(A) for A ≠ Ω, and m^α(Ω) = 1 − α + α·m(Ω).
- It is done **before** combining. The less reliable viewer then says "I'm less sure" and counts for less.
- Cross-protocol idea to test: a viewer trained on WiFi gets a lower α when it is looking at 5G traffic.

**6.6 Pignistic transformation**
- BetP(x) = Σ over groups B containing x of m(B)/|B|, which splits each group's mass equally among its members.
- It is used **only at the final decision step**, never before combining, because it throws away the ignorance and conflict information.
- It is a design choice, not a law of the theory.

**6.7 Uncertainty readouts from the final belief**
- Ignorance (mass on Ω, or the Bel–Pl gap) and conflict (K, or strife) are both outputs. Together they can signal "possible 0-day".

### 7. Worked example — Dempster's rule, then Yager's rule

Frame Ω = {A, B, C}. Two viewers each give a mass function.

#### Part A — viewers agree (no conflict)

- Viewer 1: m₁({A,B}) = 0.5, m₁(Ω) = 0.5
- Viewer 2: m₂({A,C}) = 0.6, m₂(Ω) = 0.4

Grid (cell = overlap, mass = product):

| | {A,C} = 0.6 | Ω = 0.4 |
|---|---|---|
| **{A,B} = 0.5** | {A} → 0.30 | {A,B} → 0.20 |
| **Ω = 0.5** | {A,C} → 0.30 | Ω → 0.20 |

- No cell is empty, so **K = 0**.
- Dempster: divide by 1−0 = 1, so nothing changes. m({A}) = 0.30, m({A,B}) = 0.20, m({A,C}) = 0.30, m(Ω) = 0.20.
- Yager: K = 0, so nothing moves to Ω. The result is **identical**.
- Lesson: when viewers don't clash, the two rules are the same. They differ only when K > 0.

#### Part B — viewers clash

- Viewer 1: m₁({A}) = 0.7, m₁({A,B}) = 0.2, m₁(Ω) = 0.1
- Viewer 2: m₂({C}) = 0.6, m₂({B,C}) = 0.3, m₂(Ω) = 0.1

Grid (∅ = empty overlap = disagreement):

| | {C} = 0.6 | {B,C} = 0.3 | Ω = 0.1 |
|---|---|---|---|
| **{A} = 0.7** | ∅ → 0.42 | ∅ → 0.21 | {A} → 0.07 |
| **{A,B} = 0.2** | ∅ → 0.12 | {B} → 0.06 | {A,B} → 0.02 |
| **Ω = 0.1** | {C} → 0.06 | {B,C} → 0.03 | Ω → 0.01 |

All cells sum to 1.00.

**Conflict:** K = 0.42 + 0.21 + 0.12 = **0.75**. The two viewers disagree on 75% of the mass.

**Dempster's rule.** Throw away ∅ and divide the rest by 1−K = 0.25:

| Group | Calculation | Mass |
|---|---|---|
| {A} | 0.07 / 0.25 | 0.28 |
| {B} | 0.06 / 0.25 | 0.24 |
| {A,B} | 0.02 / 0.25 | 0.08 |
| {C} | 0.06 / 0.25 | 0.24 |
| {B,C} | 0.03 / 0.25 | 0.12 |
| Ω | 0.01 / 0.25 | 0.04 |

Total = 1.00. Ignorance m(Ω) is only 0.04. The result looks sharp even though 75% of the evidence clashed.

**Yager's rule.** Keep the non-conflict cells as they are, and put K on Ω:

| Group | Mass |
|---|---|
| {A} | 0.07 |
| {B} | 0.06 |
| {A,B} | 0.02 |
| {C} | 0.06 |
| {B,C} | 0.03 |
| Ω | 0.01 + 0.75 = **0.76** |

Total = 1.00. Most of the mass now says "don't know".

**Side by side** (for A):

| | Dempster | Yager |
|---|---|---|
| Bel({A}) | 0.28 | 0.07 |
| Pl({A}) | 0.28 + 0.08 + 0.04 = 0.40 | 0.07 + 0.02 + 0.76 = 0.85 |
| Ignorance m(Ω) | 0.04 | 0.76 |
| Gap Pl − Bel | 0.12 (narrow) | 0.78 (wide) |

**Reading it:**
- Dempster hides the clash. The surviving 25% is blown back up to 100%, so the output looks confident.
- Yager keeps the clash visible as ignorance.
- For 0-day detection, high K or a high m(Ω) is exactly the "my viewers can't agree, treat as unknown" signal.
- Always report K with either rule.
- Pignistic (BetP) is applied only after combining, and only if a final hard decision is needed.

### 8. Belief-method alternatives (merged table)

| # | Method | Idea | Handles "unknown"? | Role in my work |
|---|---|---|---|---|
| 1a | Bayesian POMDP, known states only | probability vector, Bayes update | No, it must pick among known states | **Must**: baseline |
| 1b | Bayesian POMDP with an explicit "unknown" state | same, plus one extra state with a prior I choose (priors sum to 100%) | Yes, but it depends on my prior | **Must**: baseline |
| 2 | DS (Dempster / Yager) | mass on groups, plus Ω for ignorance | Yes, as a property of the belief | **Must**: core method |
| 3 | Subjective logic | belief, disbelief, uncertainty, base rate; fusion operators | Yes | Related work only |
| 4 | Evidential deep learning | the network outputs Dirichlet parameters | Yes | Nice to have (DL-native option) |
| 5 | Fuzzy / possibility theory | membership degrees, min/max | Vagueness, not conflict | Skip or mention only |

Decision for the IoT cross-protocol MBRL work: core comparison is 1a vs 1b vs DS (Dempster and Yager). Evidential DL is optional if time allows. Subjective logic and fuzzy are related work only.
Hypothesis to test, not a claim: DS may handle protocol shift better, because unfamiliar traffic can stay as unresolved belief instead of being forced onto a known class. If 1b performs as well as DS, that is also a finding.

### 9. Experiment plan (before any claims)
- Datasets: CICIoT2023 (WiFi/Zigbee smart home) and 5G-NIDD (5G). No public LTE-M attack dataset, so use an OMNeT++ simulation there. Train and validate per environment, with separate result tables.
- Fair comparison: same viewers, same way of turning viewer outputs into masses, held-out data, and K reported. For 0-day, hold out one attack class during training and treat it as unseen.
- Metrics: precision, recall, F1/F2, FPR, FNR, ROC-AUC, plus how often "unknown/high ignorance" fires on the held-out attack vs on normal traffic.
- Still open: how a viewer's output becomes a mass function. This will probably decide the results, so it is the next concept after discounting.

### 10. Next steps
1. Learn discounting with a worked example (the thesis has a distance-based version).
2. Learn how viewer outputs become mass functions.
3. Extend the Section 7 toy comparison (Dempster vs Yager) to three viewers, with and without discounting.
4. Then run on CICIoT23 and 5G-NIDD.
5. RAIDEN homework still open (separate thread): Q5 ground truth by injecting known attack points, and fixing the P→Q explanation in the paper to Qij = Pij/Δt.

### 11. Evidential Deep Learning (EDL)

**11.1 What it is**
- EDL = Evidential Deep Learning (Sensoy et al., 2018; verify the citation before using it in the paper).
- It is the DL-native alternative to DS for representing "I don't know". A reviewer will ask "why not just use evidential DL?", so it is worth including if time allows.
- Fair framing: Bayesian 1b and DS can also represent "unknown". The methods differ in **where the unknown number comes from**, not in whether they can express it.

| Method | Where "unknown" comes from |
|---|---|
| 1b Bayesian | An extra state whose prior I choose (a guess, since a 0-day has no training examples) |
| DS | Mass on Ω, built by hand from each viewer's output |
| EDL | Learned by the network, per input |

**11.2 The one idea**
- A normal classifier (softmax) always outputs percentages that add to 100%, so it must pick among the known classes. It can say "DDoS 97%" on a 0-day.
- EDL instead outputs **evidence**: non-negative counts per class (0, 5, 40...), not forced to add to 100.
- Example (classes: normal, DDoS, scan):
  - [0, 40, 1]: lots of evidence, all for DDoS. Confident.
  - [0, 0, 0]: no evidence. "I don't know."
  - [4, 4, 4]: little evidence, spread out.
- Ignorance: u = K / (K + total evidence), with K = number of classes.
  - [0, 40, 1] → 3/44 ≈ 0.07
  - [0, 0, 0] → 3/3 = 1.0
  - [4, 4, 4] → 3/15 = 0.2

**11.3 The [20, 20, 20] case (limitation of u alone)**
- [20, 20, 20] gives u = 3/63 ≈ 0.05, which is low.
- u only measures **how much evidence there is in total**. It does not measure whether the evidence agrees.
- [20, 20, 20] means plenty of evidence, spread evenly across all classes. That is **conflict/ambiguity**, not ignorance.
- So two readouts are needed:

| Readout | [0,40,1] | [0,0,0] | [20,20,20] |
|---|---|---|---|
| Ignorance u | 0.07 low | 1.0 high | 0.05 low |
| Class probabilities (e+1)/S | peaked | flat | flat |
| Reading | confident DDoS | unknown | conflicting / ambiguous |

- u high = unknown (the 0-day signal). u low + flat probabilities = conflict. u low + peaked = confident.
- DS separates ignorance (mass on Ω) from conflict (K) explicitly. In EDL, conflict must be read from the flat shape.

**11.4 Where the numbers come from (the Dirichlet)**
- Poll analogy: two polls both say 60% yes, one asked 5 people, the other 5,000. Same percentage, very different trust. A Dirichlet is a belief about what the true probability vector is: wide for a small "poll", narrow for a large one.
- Parameters: α_k = e_k + 1 (the +1 means "start from knowing nothing"), strength S = Σα, expected probability p_k = α_k / S, ignorance u = K / S.
- The poll is **not** a viewer. The poll size (S) is how much evidence sits behind **one** viewer's belief for the current input.
- Viewers run at the same time on the same traffic, and each has its own S. A viewer that recognizes the pattern gives a lot of evidence, and one that doesn't gives little. This is why discounting and fusion matter.

**11.5 Link to DS (important for the design)**
- From the same evidence: belief per class b_k = e_k / S and ignorance u = K / S. Check on [0, 40, 1] (S = 44): b = [0, 0.91, 0.02], u = 0.07, total 1.
- That is a **mass function** with mass on single classes plus Ω. Subjective logic uses the same triple (belief, ignorance, base rate).
- Difference from full DS: no mass on groups like {A,B}.
- So an EDL viewer can plug into DS fusion: network → evidence → (b, u) → discount → Dempster or Yager. For this kind of viewer it answers the open question of how a viewer's output becomes a mass function.

**11.6 Does EDL need an "unknown" state?**
- No extra class. The network has outputs only for the known classes.
- "Unknown" is a **readout**: the ignorance u (the Ω mass). A threshold on u decides "possible 0-day". The threshold is a design choice to tune and test on held-out attacks.
- Adding an "unknown attack" output node would need training examples of unknown attacks, and a 0-day has none. That is the same problem as the Bayesian 1b prior.

**11.7 How the network is trained**
1. Replace the softmax layer with a layer that outputs non-negative numbers (ReLU, softplus or exp). Those are the evidence values.
2. Loss rewards evidence on the correct class.
3. A KL regularizer pushes evidence on wrong classes toward zero ("back to flat, I don't know"). Its weight is usually increased gradually over training.
4. Result: loud when right, quiet when unsure.

**11.8 Honest caveats**
- Training never shows a 0-day. It only teaches "stay quiet when unsure" on known data. Whether that carries over to unseen attack classes is an experiment, not a guarantee. Some later papers criticize how reliable EDL's uncertainty is.
- A network can output high evidence on traffic it has never seen.
- It needs a trained network, which is heavier than DS or Bayes arithmetic. That matters for IoT.

**11.9 Comparison**

| | 1b Bayesian | DS | EDL |
|---|---|---|---|
| Where "unknown" comes from | chosen prior | hand-built masses | learned by the network, per input |
| Ignorance | prior on "unknown" state | m(Ω) | u = K/S |
| Conflict | not shown | K | not shown, read from flat probabilities |
| Fuses several viewers | yes | yes | not by itself, but its output can feed DS |

**11.10 Next**
- Add EDL as an optional viewer/comparison arm in the held-out-attack experiment on CICIoT23 (and 5G-NIDD).
- Readouts to report for EDL: u and the class-probability shape, on the held-out attack vs on normal traffic.


---

## UPDATE — 27 October 2026

Today was a slower, step-by-step recap with deeper detail: first the Bayesian belief with an unknown state (Section 12), then DS in more depth (Section 13), then EDL steps E1–E2 (Section 14). Sections 6–11 from 26 October stay as they are. Section 14 extends Section 11.

### 12. Bayesian belief with an "unknown attack" state — in depth

**12.1 State vs observation**
- **State** (hidden): normal, DDoS, scan, unknown attack. We never see it directly.
- **Observation**: what we measure in this time window.
- An attack is a state, not a spike. A spike is one thing we can observe. Some attacks cause spikes, and some normal traffic (a flash crowd, a firmware update) does too.
- The observation can have as many types as we choose: low / medium / spike, or a real number such as packets per second. "Spike / no spike" was only a small example.

**12.2 The filter has two steps per window**
1. **Predict:** move the last belief forward using the transition matrix ("if I was in A, where am I now?"). Result: the prior, meaning the belief before looking at this window.
2. **Update:** observe the window, then correct the belief using the likelihood table.

**12.3 The update, with numbers**
- Prior: normal 0.90, DDoS 0.04, scan 0.04, unknown 0.02.
- Observation: spike. Spike column of the likelihood table: 0.05, 0.90, 0.30, 0.50.
- Multiply state by state: 0.045, 0.036, 0.012, 0.010.
- **Divide by the sum of those four products** (0.103), not by a "spike value". New belief: normal 0.44, DDoS 0.35, scan 0.12, unknown 0.10.
- Why multiply: a state is the right explanation only if it was already plausible (prior) **and** it explains the observation (likelihood). Count picture: of 1,000 windows, 103 show a spike, and 36 of those are DDoS, so 36/103 = 35%.
- Why divide: the products are leftover pieces that add up to 0.103, not 1. Rescaling does not change the comparison between states.
- The total (0.103) is also a health check. If it is persistently tiny, nothing in the model explains the traffic.

**12.4 The likelihood table**

| State | low | medium | spike | Row total |
|---|---|---|---|---|
| normal | 0.70 | 0.25 | 0.05 | 1.00 |
| DDoS | 0.02 | 0.08 | 0.90 | 1.00 |
| scan | 0.30 | 0.40 | 0.30 | 1.00 |
| unknown | 0.20 | 0.30 | 0.50 | 1.00 |

- Each **row** adds up to 1, because a state must produce something. The **columns** do not add up to 1 and don't need to. We use only the column of what was actually observed.
- The table is **fixed**: learned once from labelled data and reused every cycle. The belief changes, and the table does not.
- A frozen table assumes the world matches the training data. A new protocol or environment can make it wrong.

**12.5 Chaining over time**
- The belief after clue 1 becomes the prior for clue 2. So the running belief is the original prior × all old clues, and it is never the original prior alone.
- The predict step lets states change, so old clues slowly fade.
- Example (no state change): two spikes in a row move DDoS from 35% to about 75%.

**12.6 Why the prior is needed (the clue alone is worse)**
- The likelihoods answer "how well does each state explain a spike?", not "how likely is each state?".
- Clue alone would say DDoS 51% (and unknown 29%). With the prior it is normal 44%, DDoS 35%. Of the 103 spike windows only 36 were DDoS, so the clue-only answer would be wrong about two-thirds of the time (the base-rate mistake).

**12.7 The unknown row is a guess**
- Changing the unknown likelihood from 0.50 to 0.05 moves "unknown" from about 10% to about 1%, with the same traffic.
- The drop comes from my assumption, not from evidence. A 1% unknown does not mean the model is sure it's a known pattern. It means I told the model that 0-days rarely cause spikes.

**12.8 What if the table is wrong**
It is a developer job. Possible fixes:
- Validate on held-out labelled data (does "DDoS 35%" correspond to about 35% real DDoS?).
- Build it from enough samples, and use smoothing so no value is exactly 0.
- Monitor the total from the divide step in production.
- Re-estimate per environment (WiFi, 5G, LTE-M) and on newer data.
- Sensitivity test: change the guessed numbers and see whether the decision changes.

**12.9 Why DS (what plain Bayes cannot express)**
1. **No idea vs evenly split.** [0.25, 0.25, 0.25, 0.25] can mean "no evidence" or "real, balanced evidence". Bayes writes them the same way.
2. **A group.** "Attack, but I can't tell whether A or B" must become something like A = 10%, B = 10%, which adds a split nobody had evidence for. DS puts 0.20 on {A, B}.
3. **The unknown row needs invented numbers.**
- Poisoning of the table is a different, real problem and affects every learned method.
- If every viewer puts mass only on single states, Dempster's rule gives exactly the Bayesian multiply-and-divide.

### 13. DS in more depth (steps 3 to 8)

**13.1 Mass, belief, plausibility (step 3)**
- Frame: N (normal), D (DDoS), S (scan), Ω = {N, D, S}.
- Example viewer: m({D}) = 0.3, m({D, S}) = 0.4, m(Ω) = 0.3. Mass on {D, S} is real evidence ("attack, can't tell which").
- Bel(A) = floor (groups entirely inside A). Pl(A) = ceiling (groups that overlap A). Check: Pl(A) = 1 − Bel(not A).

| Group | Bel | Pl |
|---|---|---|
| {D} | 0.3 | 1.0 |
| {S} | 0 | 0.7 |
| {N} | 0 | 0.3 |
| {D, S} | 0.7 | 1.0 |

- All mass on Ω gives [0, 1] for every state, the widest gap, which is total ignorance. Evenly split single-state evidence (⅓ each) gives Bel = Pl = ⅓ with no gap.

**13.2 The grid and Dempster's rule (step 4)**
- Rows = groups of viewer 1, columns = groups of viewer 2. Cell = **intersection** of the two groups (decides *where* the mass goes). Cell mass = **product** (decides *how much*, since both independent claims hold).
- Example: viewer 1 {D} 0.3, {D, S} 0.4, Ω 0.3; viewer 2 {D, S} 0.5, Ω 0.5. Combined: {D} 0.30, {D, S} 0.55, Ω 0.15. K = 0, so no division is needed.
- Effect of agreement: ignorance falls from 0.30 to 0.15, and Bel({D, S}) rises from 0.70 to 0.85.

**13.3 Why divide by 1 − K**
- K is the mass in cells with an empty overlap (contradictions). The empty set contains no state, so those cases are discarded and the rest is rescaled to 1, the same move as Bayes' divide.
- Example (viewer 1 {D} 0.6, Ω 0.4; viewer 2 {N} 0.5, Ω 0.5): K = 0.30. Dempster gives D 0.43, N 0.29, Ω 0.29.

**13.4 Conflict and the Zadeh problem (step 5)**
- Viewer 1: {D} 0.99, {S} 0.01. Viewer 2: {N} 0.99, {S} 0.01. K = 0.9999, and only {S} survives (0.0001).
- Dempster divides by 0.0001 and gives m({S}) = 1.0, the answer both viewers thought nearly impossible.
- Lesson: **always report K**. High K means "my viewers disagree", which is the situation where something new may be happening.

**13.5 Yager's rule (step 6)**
- Same grid, no division. Conflict goes to Ω: m(Ω) = m₁(Ω)·m₂(Ω) + K.
- Zadeh window: {S} 0.0001, Ω 0.9999 ("unknown"), which is the behaviour wanted for 0-day detection.
- K = 0.30 example: D 0.30, N 0.20, Ω 0.50.
- When K = 0, both rules give the same answer.
- Alternative design: Dempster plus a K threshold ("if K is high, output unknown"). Yager is the smooth version.
- Costs: more cautious on every clash (risk of alert fatigue), and non-associative (the order of combining several viewers can change the result).

**13.6 Discounting (step 7)**
- Reliability α between 0 and 1. Every group except Ω: m^α(A) = α·m(A). Ω: m^α(Ω) = 1 − α + α·m(Ω). α = 1 means fully trusted, α = 0 means ignored.
- Example: {D} 0.3, {D, S} 0.4, Ω 0.3 with α = 0.5 becomes {D} 0.15, {D, S} 0.20, Ω 0.65.
- Example: {A} 0.2, {A, B} 0.8, no mass on Ω, α = 0.8 gives {A} 0.16, {A, B} 0.64, Ω 0.20. Ω is not a new field, since its entry was 0.
- Effect when combining: with viewer 2 at α = 0.5, K drops from 0.30 to 0.15, and Dempster gives D 0.53, N 0.12, Ω 0.35 (instead of 0.43 / 0.29 / 0.29).
- Discount **before** combining, never after.
- α must be chosen by the designer: validation accuracy, accuracy per environment, a drift detector, or tuning. It does not help against a viewer that is confidently wrong about something it has never seen.
- Open check question: what α should a WiFi-trained viewer get on 5G traffic, and why is that hard to know in advance?

**13.7 Decision and readouts (step 8)**
- Pignistic: BetP(x) = Σ m(B)/|B| over groups B containing x. On {D} 0.30, {D, S} 0.55, Ω 0.15: D 0.625, S 0.325, N 0.05.
- Apply it **only at the end**. On the Yager Zadeh result it gives about ⅓ each, which hides the problem. Only the Ω = 0.9999 reveals it.
- Readouts: ignorance (m(Ω) or the Bel–Pl gap), conflict (K), and best guess (BetP).
- Decision rule (thresholds are a design choice to tune and report): if K or m(Ω) is high, output "unknown / possible 0-day" and take the cautious action. Otherwise take the highest BetP state.

### 14. EDL — steps E1 and E2

**14.1 E1: the idea**
- A normal classifier (softmax) always outputs percentages that add to 100%, so it has the same "no idea vs evenly split" weakness and can say "DDoS 97%" on a 0-day.
- EDL changes only the last layer. It outputs **evidence**: one non-negative number per class (not forced to add up to anything).

| Traffic | Evidence | Meaning |
|---|---|---|
| Clear flood | [0, 40, 1] | lots of evidence, all for DDoS |
| Unfamiliar traffic | [0, 0, 0] | no evidence, "I don't know" |
| Mixed traffic | [20, 20, 20] | lots of evidence, spread equally (conflict) |

- There is no extra "unknown" class. Unknown appears as how little total evidence there is.
- "Weights" are the network's internal parameters. What it outputs is evidence.

**14.2 E2: from evidence to belief and ignorance**
- α_k = e_k + 1 (the +1 means "start from knowing nothing").
- S = sum of α = (sum of evidence) + K, with K = number of classes.
- Ignorance u = K / S. Belief b_k = e_k / S (adds up to 1 − u). Probability p_k = α_k / S (adds up to 1).
- p_k = b_k + u/K, so p is b with the ignorance split equally, which is exactly the pignistic idea.

| | [0, 0, 0] | [0, 40, 1] | [20, 20, 20] |
|---|---|---|---|
| α | [1, 1, 1] | [1, 41, 2] | [21, 21, 21] |
| S | 3 | 44 | 63 |
| u | 1.0 | 0.07 | 0.05 |
| b | [0, 0, 0] | [0, 0.91, 0.02] | [0.32, 0.32, 0.32] |
| p | [⅓, ⅓, ⅓] | [0.02, 0.93, 0.05] | [⅓, ⅓, ⅓] |

- **b and u together are a DS mass function** (mass on single classes, plus u on Ω). So [0, 0, 0] is m(Ω) = 1. Difference from full DS: no mass on groups like {D, S}.
- b feeds DS fusion. p is the "if I must pick one" answer, used for choosing the class and for accuracy metrics, and for comparing with softmax.

### 15. Next steps
1. **E3:** how the network is trained to output evidence (loss, the regularizer that pushes wrong-class evidence to zero).
2. **E4:** reading the outputs: u plus the shape of p (u low + flat p = conflict).
3. **E5:** EDL as a viewer feeding DS (discount, then Dempster or Yager).
4. **E6:** limits and what to test (does a held-out attack class really give low evidence?).
5. Open question from step 7: how to choose α for a viewer on a new protocol.
6. Still open from before: how to turn a non-EDL viewer's output into a mass function; Q5 ground truth for RAIDEN; P→Q fix in the RAIDEN paper.

**14.3 E3: how the network is trained to output evidence**

- Setup: traffic features → network → last layer forced to be ≥ 0 (ReLU, softplus or exp) → evidence e → α = e + 1. The training data is labelled (normal, DDoS, scan).
- **Part 1, reward evidence on the right class.** The loss compares p = α / S with the true label, and adds a penalty that is smaller when there is more total evidence. For a window labelled DDoS:

| Network output | Evidence | p | Loss (approx.) | Verdict |
|---|---|---|---|---|
| Confident and right | [0, 40, 1] | [0.02, 0.93, 0.05] | 0.01 | best |
| Knows nothing | [0, 0, 0] | [⅓, ⅓, ⅓] | 0.83 | middling |
| Confident and wrong | [30, 2, 0] | [0.89, 0.09, 0.03] | 1.63 | worst |

  Ordering: confident-and-right beats ignorant, and ignorant beats confident-and-wrong.
- **Part 2, regularizer on wrong-class evidence (KL to the flat [1, 1, 1] case).** It looks only at evidence on the wrong classes and pulls it back toward "no evidence". Plain words: be loud only about the right thing. Its weight starts small and grows during training, because a heavy penalty early would teach the network to output zero evidence for everything.
- **Result:** loud for the correct class when it recognizes the input, quiet (low evidence, high u) when it can't.
- **Why ignorant beats confident-and-wrong:** a confidently wrong output either blocks legitimate users (false positive) or lets an attack continue with no alarm, and the output looks sure, so nothing warns you. An ignorant output (u = 1) is visible, and the system can react to it.
- **Ignorance is not free.** If the system stays silent on an unknown, a real attack still goes on. "Unknown" must trigger a **cautious action** (alert, rate-limit, more checking, ask other viewers), not "do nothing".
- **Honest limits:** training never shows a 0-day. It only teaches "stay quiet when unsure" on the known classes. Whether that carries over to an unseen class is not guaranteed, and a held-out attack class is the test. It still needs labelled data, but there is no table of invented unknown-state numbers.

**14.4 E4: reading the outputs (u and the shape of p together)**

| Evidence | u = K / S | p (shape) | Reading |
|---|---|---|---|
| [0, 40, 1] | 0.07 (low) | [0.02, 0.93, 0.05] peaked | Confident: DDoS |
| [0, 0, 0] | 1.0 (high) | [⅓, ⅓, ⅓] flat | Unknown: no evidence |
| [20, 20, 20] | 0.05 (low) | [⅓, ⅓, ⅓] flat | Conflict: lots of evidence, no winner |
| [3, 1, 0] | 0.43 (middle) | [0.57, 0.29, 0.14] leaning | Weak: leaning normal, not sure |
| [10, 10, 0] | 0.13 (low) | [0.48, 0.48, 0.04] two-way tie | Narrow conflict: torn between two classes, third ruled out |

- Remember S = (sum of evidence) + K. For [10, 10, 0]: S = 20 + 3 = 23, u = 3/23, α = [11, 11, 1], p = [11/23, 11/23, 1/23].
- **Reading routine:**
  1. Check u first. High means "I don't know" (possible 0-day), so take the cautious action. Low means continue.
  2. Check the shape of p, for example the gap between the highest and second-highest p. Big gap: act on the top class. Small gap: conflict or ambiguity, so ask other viewers or act cautiously.
- DS link: u is the mass on Ω. A flat p with low u is conflict **inside one network**, which is not the K between two viewers.
- A two-way tie is "one of these two, can't tell which" in DS (a group such as {N, D}). EDL has no group mass, so it shows it as two separate beliefs.
- Cautions: the thresholds on u and on the p gap are design choices to tune and report. Low u does not prove the traffic is familiar, because a network can still produce a lot of evidence on something new.

**14.5 E5: EDL as a viewer inside DS fusion**

- Pipeline: traffic → EDL network → evidence e → mass function (b, u) → discount (α) → combine with the other viewers (Dempster or Yager) → readouts (K, Ω, BetP) → decision.
- EDL gives masses straight out of the network. For non-EDL viewers, the way to build masses is still an open design question.
- **Example** (states N, D, S):
  - Viewer 1, EDL: evidence [3, 9, 0], S = 15, u = 0.2. Mass: {N} 0.2, {D} 0.6, Ω 0.2.
  - Viewer 2, physics/Markov: {N} 0.2, {D, S} 0.5, Ω 0.3.
  - Grid (cell = overlap, mass = product): {N}·{N} → {N} 0.04; {N}·{D,S} → ∅ 0.10; {N}·Ω → {N} 0.06; {D}·{N} → ∅ 0.12; {D}·{D,S} → {D} 0.30; {D}·Ω → {D} 0.18; Ω·{N} → {N} 0.04; Ω·{D,S} → {D,S} 0.10; Ω·Ω → Ω 0.06.
  - K = 0.22. Collected: {N} 0.14, {D} 0.48, {D, S} 0.10, Ω 0.06 (total 0.78).

| | Dempster (÷ 0.78) | Yager (K to Ω) |
|---|---|---|
| {N} | 0.18 | 0.14 |
| {D} | 0.62 | 0.48 |
| {D, S} | 0.13 | 0.10 |
| Ω | 0.08 | 0.28 |

  - Pignistic on the Dempster result: D ≈ 0.70, N ≈ 0.20, S ≈ 0.09. Readouts: K = 0.22, ignorance 0.08 (Dempster) or 0.28 (Yager). Thresholds decide between "act on DDoS" and "cautious action".
- **With discounting:** if the EDL network sits in a new environment and gets α = 0.8, its masses become {N} 0.16, {D} 0.48, Ω 0.36. Combining again: K drops to 0.18, and Yager's {D} falls from 0.48 to 0.38. The EDL viewer pulls less.
- **Cautions:**
  - Dempster's and Yager's rules assume the viewers give **independent** evidence. If the viewers were trained on the same data or use the same features, they are not independent and the result becomes overconfident.
  - EDL puts mass only on single classes and Ω, while other viewers can use groups such as {D, S}. The grid handles both.

### 15. Next steps (replaces the earlier Section 15)
1. **E6:** limits of EDL and what to test (does a held-out attack class really give low evidence? how sensitive is it to the regularizer weight?).
2. Choose α for a viewer on a new protocol (open question from the discounting step).
3. How to turn a non-EDL viewer's output into a mass function.
4. Test the independence assumption between viewers.
5. Experiment plan: Bayesian 1a / 1b vs DS (Dempster, Yager) vs EDL, with a held-out attack class on CICIoT2023 and 5G-NIDD.
6. Still open from before: Q5 ground truth for RAIDEN; the P→Q fix in the RAIDEN paper.


---

## UPDATE — 29 October 2026

Today: a quick recap of EDL (E6, limits), then **Subjective Logic (SL) from zero, step by step** (Sections 17 to 23), then a refresher on DS (Dempster and Yager). Sections 6 to 15 from earlier updates stay as they are. Section 16 closes the EDL thread from Section 14.

### 16. EDL E6 — limits and what to test

**Central issue:** training never shows the network a 0-day. It only teaches "stay quiet when unsure" on known data. Whether it stays quiet on a new attack is an experiment, not a guarantee. Far from the training data, a ReLU network can still output large evidence, so low u can look like "familiar" when it isn't.

| Limit | Meaning | Test |
|---|---|---|
| Unseen-class overconfidence | A held-out attack may still get high evidence | Hold out one attack family; compare u on held-out attack vs normal vs known attacks; report AUROC of u as a "novel or not" detector |
| Regularizer sensitivity | Too weak = overconfident; too strong = u high on everything | Sweep the regularizer weight with a grid-edge check; report held-out AUROC and known-class accuracy together |
| u is not true distance from training | u measures how much evidence the network learned to produce, not real novelty. Some later papers criticize EDL's uncertainty reliability (verify before citing) | Compare against softmax max-probability and a plain ensemble on the same task |
| Calibration | Does u = 0.6 really mean about 60% novel? | ECE with reliability plots (Idea 10) |
| No separate conflict number | Conflict is only visible as flat p with low u, inside one network | Report the u and p-gap pair (E4) |
| Independence when fused | Viewers trained on the same data or features are not independent, so Dempster and Yager become overconfident | Measure correlation between viewers' evidence before fusing |

**Cost:** inference is about the same as a normal classifier (only the last layer changes). Extra work is in training and tuning.
**Pre-register:** held-out attack family, u threshold chosen on a validation split (not test), and the pass rule (for example EDL's AUROC must beat softmax max-probability by a margin set in advance). A failure is still a reportable result.

### 17. Subjective Logic, Step 1 — the problem and the three numbers

**Problem:** two restaurants both show 4.5 stars, one from 2 reviews and one from 5,000. A single number cannot show "how much evidence is behind me". SL describes a belief with three numbers instead of one.

For one yes/no claim, an **opinion** is (b, d, u):
- **b** belief: evidence for
- **d** disbelief: evidence against
- **u** uncertainty: evidence missing ("I don't know yet")
- b + d + u = 1 (one bar: green / red / grey)

| Situation | b | d | u |
|---|---|---|---|
| No evidence at all | 0 | 0 | 1 |
| 1,000 diners, 500 happy, 500 not | ~0.50 | ~0.50 | ~0 |

A single probability says "50%" for both rows, but they are opposite situations: "no idea" vs "strong evidence it is a coin flip". u keeps them apart.

**Security example, claim "device X is compromised":** a brand-new device is (0, 0, 1), so watch it closely. A device watched for a week behaving normally is about (0.02, 0.95, 0.03), so leave it alone.

(Note: the rough numbers in my first Step 1 table were illustrations. The exact computation is in Step 3 below.)

### 18. Step 2 — evidence counts give the opinion (the first main equation)

Count evidence: **r** = pieces for, **s** = pieces against.

$$b=\frac{r}{r+s+2}\qquad d=\frac{s}{r+s+2}\qquad u=\frac{2}{r+s+2}$$

The "+2" is a starting amount of doubt (two imaginary reviews' worth). Real evidence slowly pushes it out.

| | Happy | Unhappy | b | d | u |
|---|---|---|---|---|---|
| 5 reviews | 4 | 1 | 0.57 | 0.14 | 0.29 |
| 1,000 reviews | 800 | 200 | 0.80 | 0.20 | 0.002 |

Same 80% happy, very different opinions. 0 reviews gives u = 1. 1 happy review gives b = 1/3, u = 2/3. More evidence means u shrinks toward 0.

### 19. Step 3 — base rate and the single probability (the second main equation)

**Base rate a** = how likely the claim is before any evidence (restaurant: 0.5; random IoT device compromised: about 0.01).

$$P = b + a\cdot u$$

The grey part is filled in using the base rate.

- No evidence, a = 0.02: P = 0 + 0.02 × 1 = **0.02** (new device falls back to the base rate).
- Same evidence (b = 0.2, d = 0.4, u = 0.4), different base rates: a = 0.01 gives P = 0.204; a = 0.5 (network under attack) gives P = 0.40.
- Few reviews: base rate pulls the answer strongly. Many reviews: u is tiny, so the base rate fades.

**Warning:** P loses the "how much evidence" information. Keep the full opinion as long as possible and compute P only at the final decision (same idea as pignistic in DS).

### 20. Step 4 — more than two outcomes (K states)

With K states (normal, DDoS, scan, ...), disbelief disappears as a separate number (against one state = in favor of the others). An opinion becomes **(b₁, ..., b_K, u)**, with one shared u, all adding to 1.

$$b_k=\frac{r_k}{K+\sum r}\qquad u=\frac{K}{K+\sum r}$$

- **r_k** = a count of evidence seen for state k (windows a viewer called normal, DDoS-like, scan-like; or an EDL network's evidence output). SL starts after you have the counts; how a window gets classified is outside SL.
- u depends only on **how much** evidence (Σr), not on **what** it says: 10 normal and 4 normal + 3 DDoS + 3 scan both give u = 3/13.
- Check: Σb_k + u = 1 always (same denominator).

Examples (K = 3):
- 6 normal, 3 DDoS, 1 scan (10 windows): b = 6/13, 3/13, 1/13, u = 3/13.
- Same 60/30/10 split with 1,000 windows: b = 0.6, 0.3, 0.1, u = 0.003.
- 4 normal, 1 DDoS, 0 scan (5 windows): b = 4/8, 1/8, 0, u = 3/8. **b_scan = 0 means "no evidence for scan yet", not "impossible"**; with a_scan = 0.03, P_scan = 0.03 × 0.375 ≈ 0.011.

Per-state probability with per-state base rates (sum to 1, e.g. normal 0.90, DDoS 0.07, scan 0.03):

$$P_k = b_k + a_k\cdot u$$

Example (6/3/1, u = 0.23): P = 0.67, 0.25, 0.08 (sum 1). A brand-new device gives P_k = a_k.

**Honest note on the "+K":** using K as the starting doubt (and u = K / (K + Σr)) is the EDL convention and matches a uniform base rate. In the standard multinomial SL literature the non-informative prior weight is usually 2 regardless of K. Verify which convention to use before writing formulas in the paper.

### 21. Step 5 — combining viewers (fusion)

Two friends who ate at the same restaurant 3 and 2 times together have seen 5 meals. Averaging opinions loses that. Counting evidence keeps it.

**Cumulative fusion (viewers saw different events): add the counts, then recompute.**
- Viewer 1 (4, 1, 0) + Viewer 2 (3, 2, 0) = (7, 3, 0), bottom 13: b = 7/13, 3/13, 0, u = 3/13 (smaller than 3/8 for viewer 1 alone).
- Disagreement example: A (2, 0, 0) + B (0, 2, 0) = (2, 2, 0): b = 2/7, 2/7, 0, u = 3/7. Beliefs tie, u is still fairly high (each alone had u = 3/5).

**Limit:** SL has no separate conflict number like K in Dempster's rule. Read the fused opinion with two questions:
- tie + high u: not enough evidence yet, keep watching
- tie + low u: viewers genuinely disagree, investigate (e.g. 200 vs 200 gives u about 0.007)

**Averaging fusion (viewers saw the SAME events): average the counts, then recompute.**
- Detector 1 (3, 1, 0), Detector 2 (1, 3, 0), same 4 windows. Average (2, 2, 0): b = 2/7, 2/7, 0, u = 3/7.
- Adding would give (4, 4, 0), u = 3/11, which says "8 windows seen" when only 4 happened (overconfident).
- Rule of thumb: different events = add; same events = average; partly overlapping = no clean answer, state the assumption.

**Caution:** this is the intuition via counts. SL defines these operators formally on opinions (b, u), with more variants (for example for conflicting viewers). Verify the formal definitions in the literature before citing formulas.

### 22. Step 6 — trust (discounting a viewer)

Like a friend with bad taste: you don't turn their opinion into "bad restaurant", you turn it into "I'm less sure what this tells me". Discounting moves belief into uncertainty, not disbelief.

Trust t in [0, 1] (1 = fully trusted, 0 = ignored):

$$b_k' = t\cdot b_k \qquad u' = 1 - t\sum b_k$$

- Example: b = (0.5, 0.125, 0), u = 0.375, t = 0.5 gives (0.25, 0.0625, 0), u' = 0.6875.
- Example: b = (0.6, 0.2, 0), u = 0.2, t = 0.5 gives (0.3, 0.1, 0), u' = 0.6.
- Shortcut: u' = 1 minus the beliefs that remain.
- t = 1: no change. t = 0: all belief gone, u = 1 (viewer ignored).
- Same idea as DS discounting (Section 13.6). SL gives the mechanism, not the value of t. Choosing t (for example a WiFi-trained viewer on 5G) is still the open question from Section 13.6.

### 23. Step 7 — how SL connects to DS and EDL

- An SL opinion is a **DS mass function** with mass on single states plus Ω. **u = m(Ω).**
- **EDL = SL formulas.** EDL's evidence e_k is SL's r_k; b_k = e_k / S, u = K / S with S = K + Σe. EDL is a network that produces the counts, SL is the framework that interprets them.
- With a uniform base rate a_k = 1/K: P_k = b_k + u/K = (e_k + 1)/S, which is exactly EDL's p_k = α_k / S. SL generalizes this to unequal base rates (important for security, where attacks are rare).

| | DS | Subjective logic | EDL |
|---|---|---|---|
| Mass on groups like {D, S} | Yes | Basic version: no | No |
| Base rate | No | Yes | Implicitly uniform (1/K) |
| Combining viewers | Dempster / Yager | Cumulative / averaging fusion | Not by itself |
| Trust | Discounting | Discounting | No |
| Conflict number K | Yes | No | No |

Caution: SL count-based fusion is not the same operation as Dempster's rule, so answers can differ.

### 24. DS refresher — Dempster and Yager (recap from Section 13)

- Mass functions give mass to groups (including Ω = "don't know"). Combine with the grid: cell = overlap (where) and product (how much); empty overlap = conflict K.
- **Dempster:** discard K and divide the rest by 1 − K. Can give false confidence (Zadeh: K = 0.9999 gives tumor = 1.0).
- **Yager:** no division; add K to Ω. High conflict becomes "don't know" (Zadeh: Ω = 0.9999). Same answer as Dempster when K = 0.
- Always report K. Yager's behavior fits 0-day detection better; cost is more alerts and non-associativity (order of combining can matter).
- Worked example (viewer 1 {N} 0.6, Ω 0.4; viewer 2 {D} 0.5, Ω 0.5): K = 0.30. Dempster gives N 0.43, D 0.29, Ω 0.29. Yager gives N 0.30, D 0.20, Ω 0.50.

### 25. Reference answers for pending checks (not yet answered by me in the session)

- **EDL [2, 0, 1], K = 3:** S = 6, b = (1/3, 0, 1/6), u = 1/2, P = b + u/3 = (1/2, 1/6, 1/3), sums to 1.
- **DS check** (viewer 1 {D} 0.4, Ω 0.6; viewer 2 {N} 0.5, Ω 0.5): cells ∅ 0.20, {D} 0.20, {N} 0.30, Ω 0.30; K = 0.20. Dempster (÷ 0.8): D 0.25, N 0.375, Ω 0.375. Yager: D 0.20, N 0.30, Ω 0.50.

### 26. Next steps
1. **SL Step 8:** apply SL to the IoT work (which viewers give the counts, where fusion and trust fit, what to test).
2. Decide the SL prior-weight convention (K vs 2) and check the formal fusion operators (cumulative, averaging, conflicting) in the literature before using any formula in the paper.
3. Remaining belief methods from the Section 8 table: Bayesian 1a/1b comparison design, fuzzy/possibility theory (related work only).
4. Open from before: choosing t (or α) for a viewer on a new protocol; turning a non-EDL viewer's output into a mass function or evidence counts; testing independence between viewers.
5. Experiment plan: Bayesian 1a / 1b vs DS (Dempster, Yager) vs SL vs EDL, with a held-out attack class on CICIoT2023 and 5G-NIDD.
6. Still open from before: Q5 ground truth for RAIDEN; the P→Q fix in the RAIDEN paper.
---

## UPDATE — 29 October 2026 (continued, new sections only; everything above is unchanged)

### 27. The four jobs in a belief pipeline (why the new methods do not replace what was studied)


| Already studied | Job it does | What it needs from the others |
|---|---|---|
| DS (Dempster, Yager) | 3 (fuse) | Needs masses as input, so job 2 must be done first |
| Subjective logic | 2 and 3 | Needs evidence counts r_k from a viewer |
| Bayesian belief | 2, 3, a bit of 4 | Needs likelihood tables (and a guessed prior for an "unknown" state) |
| EDL | 1 and 2 | Does not fuse several viewers by itself |

**Key point:** DS, EDL, SL and Bayesian are each complete, but at different jobs. The methods in Section 28 mostly do **job 1** (produce an "unfamiliar" signal) or act as **baselines** for it.

**Example (one window, three viewers):** Viewer A = EDL network, gives evidence directly (mass {D} 0.6, {N} 0.2, Omega 0.2). Viewer B = GRU prediction residual, outputs "error 3x normal". Viewer C = Mahalanobis distance, outputs "9.2". B and C give numbers, not masses. DS cannot fuse a number, so a conversion rule is needed (for example, larger distance = more mass on Omega). The conversion rule shown is an illustration; choosing it is the open design item.

**Where they also compete:** the planned test "does EDL's u fire on a held-out attack?" can be answered by Mahalanobis or an ensemble with no special training. If a simple score beats EDL's u, EDL's added complexity is not justified.

### 28. Algorithms that can be added over EDL / DS / SL / Bayesian

Verdicts: **STUDY** = step-by-step like SL; **KNOW** = short overview, enough to defend as a baseline; **SKIP** = not for this work; **RELATED** = mention in related work only. Items marked (bg) come from my background knowledge, not the search; verify before citing.

| # | Method | Job | One-line idea | Verdict | What to know | Role in my experiments |
|---|---|---|---|---|---|---|
| 1 | Softmax max-probability | 1 | Low top probability = unfamiliar | KNOW | Simplest "unknown" baseline. A 2026 IoT botnet paper found classifier confidence anti-correlated with zero-day traffic (AUROC 0.32) | Mandatory baseline |
| 2 | Energy score | 1 | Log-sum-exp of the logits replaces confidence | KNOW | Free from a trained classifier; already used in IoT-traffic OOD work | Mandatory baseline |
| 3 | Mahalanobis / KNN distance | 1 | Distance of the window's features from known traffic | KNOW | Density-style score; DA-DCC-IDS (IEEE Access 2026) uses a per-device Mahalanobis density for open-set IoT detection | Mandatory baseline, and a candidate viewer |
| 4 | Deep ensembles | 1 | Train several networks; disagreement = uncertainty | KNOW | Often better uncertainty than MC dropout but costs several models (hub compute) | Mandatory baseline for EDL |
| 5 | MC dropout | 1 | Keep dropout on at test time, run many passes | KNOW | Cheap; the IoT botnet paper's uncertainty gate reached AUROC 0.66 (weak, so a low bar) | Baseline |
| 6 | Conformal prediction | 1 (wraps any viewer) | Output a prediction SET with a coverage guarantee; large or empty set = unfamiliar | **STUDY** | Guarantee assumes calibration data resembles test data, which a true 0-day breaks. Used for IoT drift (FIRCE 2026) and botnet detection. Set size could be a POMDP observation | Strong complementary method; test with and without it |
| 7 | Reconstruction error + uncertainty (autoencoder / VAE) | 1 | High reconstruction error = unusual | KNOW | Same idea as the GRU residual already in the design | Compare the GRU residual against it |
| 8 | Single-pass UQ (SNGP, DUQ, DDU) | 1 | Uncertainty from distance in feature space, one forward pass | KNOW (optional) | Fits hub compute limits; no IoT-security use found | Only if compute becomes the constraint |
| 9 | Prior Networks (Dirichlet) | 1, 2 | Like EDL but trained to output a flat Dirichlet on out-of-distribution data | KNOW | Needs OOD training data, which a 0-day does not provide. Close cousin of EDL | Related work |
| 10 | Bayesian neural nets (HMC, Laplace) | 1 | Weights as distributions | SKIP | Principled but heavy | Mention only |
| 11 | Gaussian-process OOD | 1 | Uncertainty from a GP over scores | SKIP | Needs only in-distribution data but scales poorly | Mention only |
| 12 | Particle filters (bg) | 2, 3 | Belief as weighted samples for non-linear updates | SKIP for now | Found only in cyber-physical systems; revisit if the belief update becomes non-linear | Mention only |
| 13 | HMM / deep HMM (attack stages) | 2, 3 | Hidden stage with sequential belief | RELATED | HMM stage estimation degrades under interleaved attacks; the POMDP already generalizes it | Sequential baseline |
| 14 | Credal sets / credal and evidential networks / TBM | 2, 3 | Sets of probabilities; belief-function cousins | RELATED | Compared with DS in infrastructure security assessment, not IoT intrusion; TBM underlies the pignistic step | Related work only |
| 15 | Other DS combination rules (Murphy averaging, Dubois-Prade, PCR5) | 3 | Alternatives to Dempster and Yager for conflict | KNOW | One paragraph in the paper; many lose associativity or commutativity | Optional extra arm |
| 16 | Hybrid fusion pipelines (ZeroDefense-style) | 1 to 3 | Several detectors plus a low-confidence fallback | RELATED | Engineering pattern; reports about 5.76% of flows flagged for zero-day review | Related work |
| 17 | Fuzzy / possibility theory | 2 | Degrees of membership for vague statements | **PENDING (not yet studied)** | Handles vagueness, not conflict or missing evidence; Fezzani thesis (EVEREG) combines fuzzy sets with DS. EDL survey notes the two could be integrated by representing fuzzy memberships as subjective opinions | One-page overview next |

**Priority order:** (1) cheap baselines 1 to 5, (2) conformal prediction (step by step), (3) fuzzy overview, (4) everything else only if a reviewer asks.

### 29. Papers close to this work (first-pass, snippet or abstract level)

Verification: READ = abstract/snippet seen; VERIFY = authors, numbers or wording must be checked against full text. None read in full.

| # | Paper | What it did | Relevance | Gap versus my work | Status |
|---|---|---|---|---|---|
| 1 | Purkaystha, Gandhi, Kumar, "Uncertainty-Aware Zero-Day Botnet Detection for IoT Networks with Real-World Edge Deployment", Sensors 26(18) 5863, 2026 | MC-dropout gate; softmax confidence AUROC 0.32 on zero-day traffic, gate AUROC 0.66, Mirai catch rate 13.75%; edge hardware tests | Shows overconfidence and a low bar for uncertainty baselines | MC dropout only; no belief fusion | READ; VERIFY numbers |
| 2 | Fawaz et al., "Detecting Zero-Day Attacks via Reconstruction of Explanation-Driven Reconstruction Error and Predictive Uncertainty", IEEE TNSM, 2026 | Combines reconstruction error and predictive uncertainty (epistemic) for zero-day identification | Same job as the GRU residual plus uncertainty | Single pipeline, no multi-viewer belief | READ (snippet); VERIFY title and authors |
| 3 | Talpini, Sartori, Savi, "Enhancing Trustworthiness in ML-Based NIDS with Uncertainty Quantification", J. Reliable Intelligent Environments 10(4), 2024 (arXiv 2310.10655) | Compares uncertainty-aware models and open-set classifiers for NIDS; proposes a Bayesian NN model | Closest UQ comparison for NIDS | One dataset; neural-network UQ, not belief-fusion theories | READ |
| 4 | Corsini and Yang, "Are Existing Out-Of-Distribution Techniques Suitable for Network Intrusion Detection?" (arXiv 2308.14376) | Studies six OOD techniques for NIDS | Warns that OOD methods may not transfer to network traffic | Not belief theories | READ |
| 5 | "Neurosymbolic AI for Robust NIDS" (arXiv 2506.04454) | Evaluates UQ methods for misclassification detection and open-set recognition on CIC-IDS-2017 and ACI-IoT-2023 | Closest multi-dataset UQ comparison found | Unknown whether EDL, DS or SL are included; check | READ (snippet); read in full first |
| 6 | Barrett, Li, Dorai, Rajaganapathy, "FIRCE", arXiv 2605.01962, 2026 | Conformal evaluation plus drift detection for IDS on a 10-device IoT testbed | Conformal prediction in IoT | Drift and retraining, not belief | READ |
| 7 | "Comprehensive Botnet Detection ... Conformal Layers" (arXiv 2409.00667) | Conformal layer rejects incorrect predictions (58.20% on ISCX, 98.94% on ISOT) | Conformal prediction in NIDS | Not zero-day belief | READ; VERIFY figures |
| 8 | "A Comprehensive Survey on Evidential Deep Learning and Its Applications" (arXiv 2409.04720) | Conceptual comparison of EDL with DS, subjective logic, imprecise Dirichlet model, fuzzy logic | Best theory-level comparison of my methods | No intrusion datasets | READ |
| 9 | "Evidential Deep Learning for Multi-Modal Anti-UAV Detection" (EviDS-UAV, arXiv 2609.01742) | EDL objective improved accuracy; DS fusion did not beat probability averaging when conflict was nearly absent | Warning for my DS/Yager arms | Drone detection, not security | READ |
| 10 | DS-based hybrid IDS evaluated on NGIDS-DS and 5G-NIDD plus a 5G testbed (98.67% accuracy; Dempster's rule over three feature types) | DS alone applied to 5G data | Closest 5G + DS | Compared only to ordinary IDS baselines. The snippet mixed several papers, so find the exact title and authors | READ (snippet); VERIFY |
| 11 | Debicha and Debatty, "Efficient Intrusion Detection Using Evidence Theory" (arXiv 2103.08585) | Contextual discounting by source reliability and distinguishing ability | Directly relevant to the open question of choosing alpha or t | Not IoT-specific | READ |
| 12 | Yu and Frincke, "Alert Confidence Fusion in IDS with Extended Dempster-Shafer Theory", ACMSE 2005 | Exponentially weighted DS for alert fusion | Early DS fusion for IDS | DARPA data, old | READ |
| 13 | Chen and Venkataramanan (verify), "Dempster-Shafer Theory for Intrusion Detection in Ad Hoc Networks", IEEE Internet Computing 2005 | DS vs Bayesian for combining unreliable observing nodes | Early DS vs Bayesian argument | Old; ad hoc networks | READ (snippet); VERIFY authors |
| 14 | Kent (MSc thesis, University of Windsor), DDoS alert fusion with DS and subjective logic | Combines DS rule and subjective logic with an IDS reliability factor | Only SL + DS intrusion work found | Thesis, not a benchmark | READ |
| 15 | Hamda, Hadjali, Lagha, "Multisensor Data Fusion in IoT Environments in DS Setting", Sensors 23(11) 5141, 2023 | Improved evidence-distance combination for conflicting IoT evidence | Alternative conflict handling for IoT | Sensor fusion, not intrusion | READ |
| 16 | Smarandache and Dezert (verify), PCR rule paper (arXiv cs/0408010) | Compares Dempster, Yager, Dubois-Prade, Murphy, PCR rules | Reference for combination rules | General fusion | READ (snippet); VERIFY authors |
| 17 | Dinesh et al., "DA-DCC-IDS", IEEE Access, 2026 | Open-set rejection with per-device Mahalanobis density; AUROC 0.961 / 0.973 / 0.946 on TON_IoT / IoT-23 / N-BaIoT | Multi-dataset IoT zero-day baseline with leak-free protocol | Compared with deep-learning baselines, not belief theories | READ; VERIFY |
| 18 | "BRIDGE and TCH-Net" (arXiv 2604.11324, 2026) | Cross-domain IoT botnet benchmark; mean LODO F1 about 0.56 | Cross-environment evaluation protocol to borrow | Not belief | READ |
| 19 | Malinin and Gales (verify), "Prior Networks for Detection of Adversarial Attacks" (arXiv 1812.02575) | Dirichlet prior network needing OOD training data | EDL cousin | Needs OOD data | READ (snippet) |
| 20 | "Architectures for Detecting Interleaved Multi-stage Network Attacks Using HMMs" (arXiv 1807.09764) | HMM stage belief; accuracy degrades with interleaving | Sequential-belief baseline | Not IoT-specific | READ |

### 30. Findings and cautions from this search

1. **No paper found that compares Bayesian, DS (Dempster/Yager), subjective logic and EDL head to head on several IoT, 5G and other datasets and selects a best method.** Not found in these searches; this is not proof it does not exist.
2. **This comparison is therefore a candidate contribution** (matches Section 2), if a database sweep confirms.
3. **Warning from paper 9:** DS fusion did not beat probability averaging when conflict was nearly absent. Include a probability-averaging baseline, report K, and test on data where viewers actually disagree.
4. **Warning from paper 1:** softmax confidence can be anti-correlated with zero-day traffic, and an MC-dropout gate reached only 0.66 AUROC. Weak baselines are easy to beat, so use strong ones (ensemble, energy, Mahalanobis, conformal).
5. **No paper found placing any of these belief methods inside a POMDP belief update for IoT** (shallow search; verify).
6. Everything above is from snippet-level searches. Read papers 3, 5 and 10 in full first.

### 31. Next steps

1. Decide with the supervisor whether the multi-method belief comparison is a contribution or only an ablation.
2. Run the database sweep: ("Dempster-Shafer" OR "subjective logic" OR "evidential deep learning") AND ("intrusion detection" OR "zero-day") AND (comparison OR benchmark); also ("conformal") AND (IoT) AND ("zero-day" OR "novel attack").
3. Learn briefly: energy, Mahalanobis, ensembles, MC dropout (baselines).
4. Study step by step: conformal prediction.
5. One-page fuzzy / possibility overview (item 17 in Section 28), then close the method list.
6. Open from before: how a non-EDL viewer's output becomes a mass function or evidence counts; choosing trust t or alpha per environment; testing independence between viewers; SL Step 8 (applying SL to the IoT pipeline); SL prior-weight convention (K vs 2).
7. Carry forward all open items from earlier sections.

---

## UPDATE — 30 October 2026 (new section only; everything above is unchanged)

Today: fuzzy logic from zero, in 7 short steps (Section 32). It closes the method list from Section 28 (item 17).

### 32. Fuzzy logic — what it is and where it fits

**Core idea:** Bayesian, DS, SL and EDL deal with *not knowing* something (missing evidence, conflicting viewers). Fuzzy logic deals with a different problem: **words with no sharp edge** ("hot", "high traffic rate"). It lets a statement be **partly true**.

**Step 1 — membership degree.** Every value gets a number μ (mu) in [0, 1]: how much it fits a vague word. 1 = fully fits, 0 = does not fit, in between = partly fits.
- "28 degrees is hot": a yes/no rule at 30 degrees calls 29.9 "not hot" and 30.1 "hot". Fuzzy says 28 is hot to degree 0.6.
- **Not probability:** a person exactly 1.75 m tall is "tall to degree 0.6". There is no uncertainty about the height; the *word* is vague. Probability would mean "I am unsure of the facts".

| | What it handles |
|---|---|
| Bayesian | uncertainty about which state is true |
| DS / SL / EDL | missing evidence and conflict between sources |
| Fuzzy | vagueness in the meaning of a word |

**Step 2 — membership functions (where μ comes from).** μ is not an opinion from anyone. It is a formula applied to a measured number, using a hand-drawn shape with cut-off points that are **design choices** (expert-set or tuned on data).
- Ramp for "high rate": μ = 0 at or below 200 packets/s, μ = 1 at or above 1,000, straight line between.
  μ_high(700) = (700 − 200) / (1000 − 200) = 500 / 800 = **0.625** (700 is 62.5% of the way from "not high" to "fully high").

| Rate (packets/s) | μ(high) |
|---|---|
| 200 | 0 |
| 400 | 0.25 |
| 600 | 0.5 |
| 700 | 0.625 |
| 1,000 | 1 |

- Triangle for "medium" (peak 600, zero at 200 and 1,000): μ_medium(700) = 1 − 100/400 = **0.75**. Words overlap: 700 is "medium" to 0.75 and "high" to 0.625 at once.
- Peers (= number of other devices contacted in the window, not people): "many" = ramp from 5 to 25, so μ_many(20) = 15/20 = **0.75**; "few" = the opposite ramp, μ_few(20) = **0.25**.
- A different expert choosing 300 and 800 as cut-offs would get a different μ. This is the main weakness (see caveats).

**Step 3 — AND, OR, NOT (standard min/max version).**

| Operator | Rule | Example (μ_high = 0.625, μ_many = 0.75) |
|---|---|---|
| AND | smaller value (min) | min(0.625, 0.75) = 0.625 |
| OR | larger value (max) | max(0.625, 0.75) = 0.75 |
| NOT | 1 minus the value | 1 − 0.625 = 0.375 |

AND = "as true as the weakest part". Other versions exist (for example product instead of min).

Worked checks (device with rate 700 and 20 new peers, μ_high = 0.625, μ_few = 0.25, μ_many = 0.75):
- NOT(μ_high) = 1 − 0.625 = **0.375**
- OR(μ_high, μ_few) = max(0.625, 0.25) = **0.625**
- Reference answers for the follow-up check (not yet answered by me in the session): AND(μ_high, μ_few) = min(0.625, 0.25) = **0.25**; NOT(μ_many) = 1 − 0.75 = **0.25**, which equals μ_few because "few" was defined as the opposite of "many".

**Step 4 — IF-THEN rules.** Rules are written the way an operator talks. Each gets a **firing strength** = AND of its conditions.
- Rule 1: IF rate is high AND peers are many THEN suspicion is high. Strength = min(0.625, 0.75) = **0.625**.
- Rule 2: IF rate is medium AND peers are few THEN suspicion is low. Strength = min(0.75, 0.25) = **0.25**.
- Both rules fire at once, to different degrees. That is normal.

**Step 5 — back to one number (defuzzification).** Give each rule's output a typical value (high suspicion = 0.9, low = 0.1) and take a weighted average by firing strength:
suspicion = (0.625 × 0.9 + 0.25 × 0.1) / (0.625 + 0.25) = 0.5875 / 0.875 ≈ **0.67**.
This is one common method (weighted average); the centroid method gives similar results.

**Step 6 — comparison with the methods already studied.**

| | Handles | Output | Conflict number | Evidence amount |
|---|---|---|---|---|
| Fuzzy | vague words | degrees of fit (μ) | No | No |
| Bayesian | which state is true | probabilities | No | No |
| DS | grouped belief, conflict | masses, K | Yes | No |
| SL | amount of evidence | (b, u) | No | Yes (u) |
| EDL | learned evidence | (b, u) | No | Yes (u) |

A fuzzy 0.6 is not a probability, so it cannot be fed into Bayes' rule directly.

**Step 7 — what it means for this work.**
- **Possible use as a converter (my suggestion, untested):** membership degrees (for example μ_high of the GRU residual) could be turned into masses or evidence counts. This touches the open question "how does a non-EDL viewer's output become a mass function?". The EDL survey (arXiv 2409.04720) notes that fuzzy memberships can be represented as subjective opinions, so a bridge exists in principle.
- **Readable rules:** "IF rate high AND peers many THEN suspicious" can be read by an operator, which helps explainability.
- **Fezzani link (from earlier notes):** the thesis (EVEREG) combines fuzzy sets with DS, so a worked fuzzy + DS hybrid precedent exists. A reviewer who knows it may ask.

**Caveats / weaknesses for 0-day detection:**
- Membership shapes and cut-offs are hand-chosen from knowledge of known traffic, the same kind of weakness as the guessed "unknown" prior in Bayesian 1b.
- It has no "how much evidence" number (no u) and no conflict measure (no K).
- Fuzzy intrusion-detection literature was **not searched**, so I cannot say how crowded that area is. Verify before any novelty claim.

**Verdict: KNOW, not a core method.** Keep as an optional converter (number to belief) and as related work next to the other belief theories.

### 33. One-line summary table (fuzzy)

| Step | One line |
|---|---|
| 1 | μ in [0, 1] says how much a value fits a vague word (not a probability) |
| 2 | μ comes from hand-drawn shapes (ramp, triangle) with chosen cut-offs |
| 3 | AND = min, OR = max, NOT = 1 − μ |
| 4 | IF-THEN rules get a firing strength |
| 5 | A weighted average turns the rules back into one number |
| 6 | Fuzzy = vagueness, not uncertainty or conflict |
| 7 | Useful as a converter and for readable rules, not as a core 0-day method |

### 34. Status of the method list and next steps

1. **Method list closed:** Bayesian, DS (Dempster, Yager), EDL, SL and fuzzy are all studied. Section 28 (extra methods) is the reference for what remains.
2. **Next topics, in suggested order:** (a) cheap baselines (softmax max-probability, energy, Mahalanobis, ensembles, MC dropout), short overviews; (b) conformal prediction, step by step.
3. Open from before: how a non-EDL viewer's output becomes a mass function or evidence counts (fuzzy is now one candidate converter, untested); choosing trust t or alpha per environment; testing independence between viewers; SL Step 8 (applying SL to the IoT pipeline); SL prior-weight convention (K vs 2).
4. Run the database novelty sweep before claiming novelty for the multi-method belief comparison (Section 30), and add a fuzzy + intrusion detection query to it.
5. Carry forward all open items from earlier sections.


---

## UPDATE — 2 November 2026 (new sections only; everything above is unchanged)

Today: a recap of all belief methods with one small example each (Section 35), a check of what is left after fuzzy (Section 36), and how Fezzani combined fuzzy sets with Dempster-Shafer, with why it does not fit the IoT case (Sections 37 to 42). Sections 27 to 34 (29 and 30 October) stay as they are.

### 35. Recap of the belief methods, one small example each

**Corrections to my own recap (checked with Claude):**
1. The groups of states in DS are called **focal elements** (sets), not "ensembles".
2. Mass on {A,B} is **not** confusion. It is real evidence that narrows things down to the group. Only mass on **Omega** (the whole set) means "I don't know".
3. Keep two ideas apart: **ignorance** = mass on Omega, **conflict** = K, the mass on empty overlaps between viewers. Yager turns conflict into ignorance, but they start as different things.
4. The paradox is spelled **Zadeh**. It happens because Dempster divides by 1 − K, so when K is close to 1 it blows up what is left.
5. Subjective logic with K states is (b1, ..., bK, u), summing to 1. It also has a base rate, fusion and trust, and its formulas are the same as EDL's.
6. Fuzzy is not the next level of the same chain. It solves a different problem: vague words.

| Method | Small example |
|---|---|
| Bayesian | Prior normal 0.9, DDoS 0.1. Chance of a spike: normal 0.05, DDoS 0.9. Multiply: 0.045 and 0.09, sum 0.135, so normal 0.33, DDoS 0.67. Weakness: (1/3, 1/3, 1/3) can mean "no idea" or "real even split" |
| DS combination | Viewer 1: {D,S} 0.6, Omega 0.4. Viewer 2: {D} 0.5, Omega 0.5. Grid (overlap, product): {D} 0.30 + 0.20 = 0.50, {D,S} 0.30, Omega 0.20. K = 0, ignorance fell to 0.20 |
| Dempster vs Yager (clash) | Viewer 1: {N} 0.6, Omega 0.4. Viewer 2: {D} 0.5, Omega 0.5. K = 0.30. Dempster (divide by 0.7): N 0.43, D 0.29, Omega 0.29. Yager (K to Omega): N 0.30, D 0.20, Omega 0.50. Zadeh: K = 0.9999 gives Dempster tumor = 1.0 vs Yager Omega = 0.9999 |
| EDL | K = 3, S = sum of evidence + K, b = e/S, u = K/S. [0,30,2]: S = 35, b = (0, 0.857, 0.057), u = 0.086 (confident). [0,0,0]: u = 1 (unknown). [30,30,30]: S = 93, b = 0.32 each, u = 0.03 (conflict) |
| Subjective logic | Yes/no: 4 happy, 1 unhappy gives b = 4/7, d = 1/7, u = 2/7. K = 3 with counts 6, 3, 1: S = 13, b = (6/13, 3/13, 1/13), u = 3/13. Base rate: P_k = b_k + a_k u. Fusion: different events = add counts, same events = average. Trust t: multiply b by t, rest goes to u |
| Fuzzy | Rate 700 packets/s with "high" a ramp from 200 to 1,000 gives mu_high = 500/800 = 0.625. 20 new peers (other devices contacted) with "many" a ramp from 5 to 25 gives mu_many = 0.75. AND = min, OR = max, NOT = 1 - mu |

**One-line memory aid:** Bayesian = probability per state, no "don't know". DS = mass on groups, Omega for ignorance, K for conflict. Yager = conflict goes to Omega. EDL = a network outputs evidence, giving (b, u). SL = the same (b, u) from counts, plus base rate, fusion, trust. Fuzzy = partial truth for vague words (not uncertainty or conflict).

### 36. Is any belief algorithm left after fuzzy?

- **No required one.** The list from Section 8 (Bayesian 1a/1b, DS with Dempster and Yager, subjective logic, EDL, fuzzy) is fully studied.
- **Still to do (not new theories):** cheap baselines (softmax max-probability, energy, Mahalanobis, ensembles, MC dropout) as short overviews; conformal prediction step by step.
- **Optional, only if a reviewer asks:** possibility theory (close cousin of fuzzy, one paragraph), other DS combination rules (Murphy, Dubois-Prade, PCR), credal sets / transferable belief model, Prior Networks, HMM and particle filters (the POMDP already covers the sequential role).
- **Caveat:** "closed" refers to my list and snippet-level searches. The database sweep is still pending.

### 37. Fezzani: how fuzzy sets were integrated with DS

**Source and caution:** read from the English guide to the thesis (R. Fezzani, UBO / ENSTA Bretagne, defended 8 Dec 2015; Chapter 4 detailed, other chapters summarized, equation numbers match the French original). This is a guide, not the thesis text itself. Algorithm source: EVEREG (called EVREG in some Denoeux papers), Petit-Renaud and Denoeux (2004), originally a regression method.

**Problem:** two sonars measure seabed depth. The MBES is precise but narrow, the ISSS is wide but noisy. Goal: one fused depth at each grid point plus a quality map. This is a **regression** problem (the unknown is a continuous number), which is why fuzzy sets appear.

**The one idea:** a focal element can be a **fuzzy set** (here a fuzzy number) instead of a crisp set. Each value is inside the set to a degree mu in [0, 1], not just in or out.

**Step 1 — each sounding becomes a mass function (eq. 4.18 and 4.19).** A sounding has position y_i, depth z_i, precision sigma_i (from the Ifremer quality factor) and reliability p_i. It becomes: mass p_i on a fuzzy number F_i, mass 1 - p_i on Z (the whole depth range, "may be meaningless"). The fuzzy number is a bell: F(u) = exp(-0.5 ((u - z)/sigma)^2).
- Example z = 20, sigma = 0.1: F(20.0) = 1, F(20.1) = 0.61, F(20.2) = 0.14.
- Here fuzzy describes how precise a measurement is, not a vague word like "high".

**Step 2 — discount by distance (eq. 4.20, 4.31).** phi(d) = 0.99 exp(-d^2 / theta^2), theta = 1 in the thesis. A sounding 0.5 away: phi = 0.99 x 0.78 = 0.77, so 0.77 stays on F_i and 0.23 moves to Z. Far soundings end up with almost all mass on Z (ignorance) and stop influencing the result.

**Step 3 — combine the k = 5 nearest soundings of each sensor (eq. 4.22).** Conjunctive rule: fuzzy intersection = pointwise minimum, masses multiply. The **height** of an overlap, the maximum of the minimum, measures how much two fuzzy sets really overlap. In crisp DS an empty intersection is full conflict; in fuzzy DS it is partial.

**Step 4 — combine the two sensors with Dempster's rule, then Yager's smooth normalization (eq. 4.24).**
- Important: this "Yager" is **not** the conflict-to-Omega rule from Section 24. It only fixes **sub-normal** fuzzy sets (height below 1): rescale each focal element to height 1, weight each mass by m(A) x h(A), renormalize. Weaker agreement loses weight.

**Step 5 — decide (eq. 4.23, 4.25, 4.26).** Pignistic density: each fuzzy set shares its mass over values in proportion to membership, BetP(z) = sum over A of m*(A) x A(z) / |A|, with |A| = sum of memberships. Point estimate = mass-weighted center of gravity. Mass left on Z goes to the mid-range depth, so ignorance pulls the estimate toward the middle.

**Step 6 — quality measures (eq. 4.15 to 4.17).** Non-specificity N (high when mass is on wide sets or on Z), strife S (high when sources conflict), total uncertainty N + S. These map directly onto the two readouts used in this thesis: **ignorance (m(Omega))** and **conflict (K)**. In the thesis, where no data exists mass stays on Z so N is high; where soundings disagree (sand ripples) strife is high.

**Parameters used:** grid step 20 cm, k = 5, theta = 1, alpha = 0.99, p_i = 1 for both sensors.

**Worked example (my own computation using the thesis formulas, not from the thesis):** A = Gauss(20, 0.1), B = Gauss(19.4, 0.1), each discounted to 0.77 on the fuzzy set and 0.23 on Z.
- Grid: A and B overlap 0.594, A alone 0.177, B alone 0.177, Z 0.052.
- The two bells cross at 19.7 with height exp(-4.5) = 0.011, so the overlap is almost conflict.
- Smooth normalization (mass x height, renormalized): A 0.429, B 0.429, Z 0.127, overlap 0.016.
- Crisp Dempster (overlap treated as empty, K = 0.594, divide by 0.406): A 0.436, B 0.436, Z 0.129. Close, because the overlap is tiny; with large overlaps the fuzzy version keeps much more of the agreement.
- Point estimate about 19.8 (frame [18, 23], ignorance mass pulls toward mid-range 20.5).

**Thesis results (from the guide):** on simulated data, residual against truth shrank from [-0.96, 1.12] m (raw) to [-0.34, 0.43] m (fused, then CHARM cleaning); the fused map filled the ISSS shadows and nadir gap; non-specificity flagged missing data; strife was high over sand ripples. Real data: one survey, DAURADE AUV, Bay of Douarnenez.

**Caveats found in the guide:**
1. p_i = 1 for both sensors, so the reliability mechanism existed in the model but was effectively switched off in the results.
2. One global theta and k = 5, because leave-one-out tuning was too slow.
3. The author names computation time as the main drawback (matters for edge devices).
4. Results are seabed bathymetry, so they say nothing about attack detection.

### 38. What changes when fuzzy is added to DS (crisp vs fuzzy)

| | Crisp DS | Fuzzy DS |
|---|---|---|
| Focal element | {A,B} = 0.30: A in, B in, C out | (A 1, B 0.5, C 0) = 0.30: "mostly A, somewhat B" |
| Intersection | exact set, possibly empty | pointwise minimum, with a height between 0 and 1 |
| Conflict | all or nothing | partial: depends on the overlap height |

**Example:** viewer 1 (A 1, B 0.5, C 0) mass 0.6; viewer 2 (A 0, B 0.5, C 1) mass 0.5. Fuzzy intersection = (0, 0.5, 0), height 0.5. Grid: overlap 0.30, viewer 1 set 0.30, viewer 2 set 0.20, Omega 0.20. Smooth normalization weights the overlap by 0.5 (0.15); total 0.85.

| Result | Fuzzy | Crisp {A} vs {C} | Crisp {A,B} vs {B,C} |
|---|---|---|---|
| mass on {B} (agreement) | 0.18 | 0 | 0.30 |
| viewer 1's set | 0.35 | 0.43 | 0.30 |
| viewer 2's set | 0.24 | 0.29 | 0.20 |
| Omega | 0.24 | 0.29 | 0.20 |

Fuzzy lands between the two crisp choices: it keeps partial agreement instead of discarding it or fully trusting it. (Illustration of the idea, not the thesis's exact computation.)

**The bigger reason it was needed:** his frame is a continuous depth. With crisp sets you must pick hard edges ("between 19.9 and 20.1"), so 20.11 is totally outside and tiny changes flip results. A bell says "the further from 20, the less it fits".

### 39. The "50/50 split" and the fuzzy pignistic

- DS itself never says {A,B} is 50/50. The equal split comes from the **pignistic transform**, applied only at the decision step.
- Fezzani uses the same transform with membership degrees as weights (eq. 4.23): each state gets mass in proportion to its membership. For the depth estimate he uses the center of gravity (eq. 4.26), a membership-weighted average.
- Crisp DS is the special case where every membership is 0 or 1, so the weights are equal and you get 50/50.
- Example: (A 1, B 0.5) with mass 0.30: crisp {A,B} gives A 0.15, B 0.15; fuzzy gives A 0.30 x 1/1.5 = 0.20 and B 0.30 x 0.5/1.5 = 0.10.
- Reference answer for the check (not answered by me in the session): (D 0.8, S 0.4, N 0) with mass 0.5, total membership 1.2: D = 0.5 x 0.8 / 1.2 = 0.333, S = 0.5 x 0.4 / 1.2 = 0.167 (sum 0.5).
- The fuzzy split is not extra knowledge. The viewer must supply the degrees (for example from the bell width sigma); wrong degrees give a wrong split.

### 40. Why fuzzy focal elements do not fit this IoT work

| Reason | Detail |
|---|---|
| Categories, not a number line | His unknown is a depth, where 20.1 m is close to 20.0 m. Normal, DDoS and scan have no natural axis, so a bell around "what?" has no meaning |
| Degrees would be invented | In the thesis degrees come from physics (quality factor gives a real sigma). My viewers produce (b, u) or a residual with no calibrated spread, so the degrees would be hand-made guesses |
| Crisp DS already covers it | "Mostly D, somewhat S" = m({D}) 0.15 + m({D,S}) 0.15, giving D 0.225 and S 0.075 vs fuzzy 0.20 and 0.10. Little gain for a short list of states |
| Task and cost | His method is spatial regression with neighbor discounting; mine is detection over time with a decision. He names compute time as the main drawback; the agent must run on hub-class hardware |

**Where a fuzzy number could fit (idea only, untested):** a viewer that estimates a continuous quantity with a spread, for example the arrival rate behind the MMPP ("about 700 packets/s, plus or minus 50"). That is a different layer from the state belief.

**Verdict:** know the idea, use fuzzy at most as a converter (membership degree to crisp mass, "Way A"), and cite Fezzani and the Petit-Renaud and Denoeux EVEREG work as related work ("Way B", fuzzy focal elements).

**Sentence for a reviewer:** "Fezzani's EVEREG combines fuzzy sets with DS by allowing fuzzy focal elements for a continuous depth. Our frame is categorical, so we use ordinary crisp masses, and at most fuzzy memberships as a converter."

### 41. Literature found on fuzzy + DS (snippet level, verify before citing)

| Work | What it contributes |
|---|---|
| Petit-Renaud and Denoeux (2004), Int. J. Approximate Reasoning 35(1) | EVEREG: output is a fuzzy belief assignment; neighbors are discounted by distance and pooled with Dempster's rule |
| Petit-Renaud and Denoeux (1999), ECSQARU | Fuzzy belief structure approach to regression |
| Yen (1990), IEEE Trans. SMC | Generalizes DS to fuzzy sets by decomposing fuzzy focal elements into non-fuzzy components and generalizing Dempster's rule |
| Denoeux, belief functions induced by random fuzzy sets (arXiv 2004.11638) and epistemic random fuzzy sets (arXiv 2202.08081) | A possibility distribution models certain but fuzzy evidence; a DS mass function models uncertain crisp evidence. Dempster's rule does not preserve possibility structure, so a generalized product-intersection rule covers both |
| Xu, Wen and Li (2009), J. Electron. (China) 26 | Constructing non-consonant fuzzy focal elements via random sets |

### 42. Reference answers for pending checks (not yet answered by me in the session)

- Gaussian fuzzy number z = 20, sigma = 0.2: F(20.2) = exp(-0.5) = 0.607; F(20.4) = exp(-2) = 0.135.
- Distance discount with Delta = 1, theta = 1: phi = 0.99 x exp(-1) = 0.364.
- Fuzzy checks from 30 October: AND(mu_high, mu_few) = min(0.625, 0.25) = 0.25; NOT(mu_many) = 1 - 0.75 = 0.25 (equals mu_few).
- Check still open for me: name one thing in my pipeline that is a continuous number with a spread (where a fuzzy number could fit) and one that is a category (where it could not).

### 43. Next steps

1. Fuzzy is closed. Start the **cheap baselines** (softmax max-probability, energy, Mahalanobis, ensembles, MC dropout) as short overviews.
2. Then **conformal prediction**, step by step.
3. Open from before: how a non-EDL viewer's output becomes a mass function or evidence counts (fuzzy membership is one candidate converter, untested); choosing trust t or alpha per environment; testing independence between viewers; SL Step 8 (applying SL to the IoT pipeline); SL prior-weight convention (K vs 2).
4. Run the database novelty sweep (Section 31, plus a fuzzy + intrusion detection query) before claiming novelty for the multi-method belief comparison.
5. Read Fezzani's thesis itself (French original) to confirm the details taken from the English guide before citing any equation.
6. Carry forward all open items from earlier sections.


---

## UPDATE — 2 November 2026 (continued, new sections only; everything above is unchanged)

Today: overview of the cheap baselines and conformal prediction (Section 44), how they relate to the belief frameworks already studied (Section 45), and how to run a fair comparison (Sections 46 to 48). Sections 35 to 43 stay as they are. Library names and APIs are from background knowledge and were not checked against current versions; verify before the real runs.

### 44. Cheap baselines and conformal prediction: overview

All of these answer the same job (job 1 from Section 27): **how unfamiliar is this window?** Each one turns a trained classifier into a number where higher means more novel. The test is whether that number separates the held-out attack family from known traffic, measured by AUROC.

**Shared setup for every snippet:**

```python
# model: a classifier trained on KNOWN classes (normal, DDoS, scan, ...)
# x: a batch of traffic-window features, shape (N, features)
logits = model(x)          # shape (N, K), K = number of known classes

from sklearn.metrics import roc_auc_score
# y_novel = 1 for held-out attack windows, 0 for known traffic
auroc = roc_auc_score(y_novel, score.detach().cpu().numpy())
```

**44.1 Softmax max-probability (MSP)**
- Idea: take the top softmax probability. If even the best class gets a low probability, the window looks unfamiliar.
- Weakness: a network can say "DDoS 97%" on traffic it has never seen. The 2026 IoT botnet paper (Section 29, paper 1) found confidence anti-correlated with zero-day traffic (AUROC 0.32; verify). Mandatory, weakest baseline.
- Library: plain PyTorch; `pytorch-ood` has a `MaxSoftmax` detector (check API).

```python
import torch.nn.functional as F
probs = F.softmax(logits, dim=1)
score = 1 - probs.max(dim=1).values   # high = more novel
```

**44.2 Energy score**
- Idea: same logits, different compression. Take the log-sum-exp of the raw logits instead of softmax. Familiar inputs give large logits and low energy; unfamiliar inputs give higher energy. No retraining needed.
- Library: plain PyTorch (`torch.logsumexp`), or `pytorch-ood` `EnergyBased`.

```python
T = 1.0
score = -T * torch.logsumexp(logits / T, dim=1)   # high energy = more novel
```

**44.3 Mahalanobis (or KNN) distance**
- Idea: ignore the classifier's opinion and measure how far the window's features are from known traffic. Per class: a mean and a shared covariance. Score = distance to the nearest class. Works on penultimate-layer features or directly on traffic features.
- Why it matters: a density-style score that does not depend on softmax, and a candidate viewer for the DS pipeline.
- Libraries: `scikit-learn` (`EmpiricalCovariance`; `NearestNeighbors` for KNN), `numpy`.

```python
import numpy as np
from sklearn.covariance import EmpiricalCovariance

classes = np.unique(y_train)
means = {c: feats_train[y_train == c].mean(0) for c in classes}
centered = np.vstack([feats_train[y_train == c] - means[c] for c in classes])
cov = EmpiricalCovariance(assume_centered=True).fit(centered)

def maha_score(feats):
    d = np.stack([cov.mahalanobis(feats - means[c]) for c in classes], axis=1)
    return d.min(axis=1)          # high = far from all known classes
```

**44.4 Deep ensembles**
- Idea: train several copies with different seeds. They agree on familiar traffic and tend to disagree on unfamiliar traffic; the disagreement is the signal. Often the strongest simple baseline, so EDL must beat it to justify its complexity.
- Cost: N models at inference (matters on hub-class hardware).
- Library: plain PyTorch.

```python
models = [train_one(seed=s) for s in range(5)]
probs = torch.stack([F.softmax(m(x), dim=1) for m in models])   # (5, N, K)
mean_p = probs.mean(0)
entropy_total = -(mean_p * mean_p.clamp_min(1e-12).log()).sum(1)
entropy_each  = -(probs * probs.clamp_min(1e-12).log()).sum(2).mean(0)
score = entropy_total - entropy_each    # mutual information = disagreement
```

**44.5 MC dropout**
- Idea: a cheap ensemble from one network. Keep dropout on at test time and run the same window T times; the spread of the answers is the uncertainty.
- Caution: the botnet paper's MC-dropout gate reached only AUROC 0.66 (verify), so it is a weak, easy-to-beat baseline.
- Library: plain PyTorch.

```python
import torch.nn as nn
model.eval()
for m in model.modules():
    if isinstance(m, nn.Dropout):
        m.train()                          # re-enable only dropout layers

T = 30
probs = torch.stack([F.softmax(model(x), dim=1) for _ in range(T)])   # (T, N, K)
mean_p = probs.mean(0)
entropy_total = -(mean_p * mean_p.clamp_min(1e-12).log()).sum(1)
entropy_each  = -(probs * probs.clamp_min(1e-12).log()).sum(2).mean(0)
score = entropy_total - entropy_each
```

**44.6 Conformal prediction (to be studied step by step; only the overview is done)**
- Idea: instead of one class, output a **set of classes** guaranteed to contain the true class with probability at least 1 − alpha (e.g. 90%). Calibrate once on held-out labeled data.

| Set | Meaning |
|---|---|
| One class | Confident |
| Several classes | Ambiguous |
| Empty set | Nothing fits, possibly unfamiliar |

- The set size can become an observation for the POMDP.
- **Limit of the guarantee:** it assumes calibration data resembles test data (exchangeability). A true 0-day breaks this, so the coverage promise does not hold for novel attacks. Use conformal as a complementary signal and test it, not as proof of safety. It fits IoT drift well (FIRCE-style work, Section 29 paper 6).
- Libraries: `MAPIE` (scikit-learn style; API changed in v1, check version), `crepes` (lightweight), `TorchCP` (PyTorch), or by hand (about 10 lines, best for learning):

```python
import numpy as np

cal_probs = softmax_probs_cal            # (n, K), held-out labeled data
cal_true  = y_cal                        # (n,)
alpha = 0.10                             # target 90% coverage

scores = 1 - cal_probs[np.arange(len(cal_true)), cal_true]   # nonconformity
n = len(scores)
q = np.quantile(scores, np.ceil((n + 1) * (1 - alpha)) / n, method="higher")

test_probs = softmax_probs_test          # (m, K)
pred_sets = test_probs >= 1 - q          # boolean (m, K)
set_size = pred_sets.sum(axis=1)         # 0 nothing fits, 1 sure, >1 ambiguous
novel_score = (set_size != 1).astype(float)
```

**Summary**

| Method | Where the "unfamiliar" signal comes from | Extra cost | Library |
|---|---|---|---|
| Softmax max-prob | Top class probability | None | PyTorch (`pytorch-ood`) |
| Energy | Log-sum-exp of logits | None | PyTorch (`pytorch-ood`) |
| Mahalanobis / KNN | Distance in feature space | Store means and covariance | scikit-learn, numpy |
| Deep ensembles | Disagreement between N networks | N x training and inference | PyTorch |
| MC dropout | Disagreement between T passes | T x inference | PyTorch |
| Conformal | Size of the prediction set | Needs a calibration split | MAPIE, crepes, TorchCP, or by hand |

### 45. How these relate to Bayesian, DS, SL, EDL, fuzzy

**Two different kinds of method:**
- **Belief frameworks (Bayesian, DS, SL, EDL, fuzzy):** ways of *representing and combining* uncertainty (what the numbers mean, how viewers merge, how ignorance and conflict stay apart).
- **Novelty scores (softmax, energy, Mahalanobis, ensembles, MC dropout, conformal):** ways of *producing one number* saying "this window looks unfamiliar". No theory of fusion, trust or conflict.
- Analogy: the scores are thermometers; the belief frameworks are the doctor's way of reasoning from several readings.

**Where each fits in the four jobs (Section 27):**

| Job | What it does | Who does it |
|---|---|---|
| 1. Produce an "unfamiliar" signal | Window to novelty number | Softmax, energy, Mahalanobis, ensembles, MC dropout, conformal, **and EDL** |
| 2. Turn the signal into a belief | Give it meaning: mass, (b, u), probability | DS, SL, Bayesian (EDL also does this) |
| 3. Fuse several viewers | Merge with conflict and trust | DS (Dempster/Yager), SL fusion, Bayesian |
| 4. Decide | Pick an action | POMDP/PPO (+ pignistic/BetP) |

**EDL is the overlap:** it is the only studied method that also produces the novelty signal itself (its u). So it competes directly with the baselines in job 1. The other baselines are not rivals of DS; they are **inputs** to DS.

**Where "unknown" comes from, per method:**

| Method | Source of "unknown" |
|---|---|
| Softmax / energy | Shape of the logits (no special training) |
| Mahalanobis | Distance from known traffic in feature space |
| Ensembles / MC dropout | Disagreement between passes |
| EDL | Network learns to output low evidence, giving high u |
| Bayesian 1b | Extra state with a guessed prior |
| DS | Mass on Omega, built by hand from each viewer |
| Conformal | Size of the prediction set (a wrapper, not a score from the model itself) |

### 46. Two separate comparisons (do not mix them)

**Comparison A, which signal best spots a novel attack? (job 1)**
- Competitors: softmax, energy, Mahalanobis, ensembles, MC dropout, conformal, EDL's u.
- Fairness: same data, same held-out attack family, same backbone architecture, same metric (AUROC), thresholds chosen on validation not test.
- EDL exception: it needs a different last layer and loss; keep the architecture otherwise identical.
- Decision rule (set before running): if a cheap score beats EDL's u by the pre-set margin, EDL's extra complexity is not justified.

**Comparison B, which framework handles the signals best? (jobs 2 and 3)**
- Competitors: Bayesian 1a/1b, DS (Dempster and Yager), SL, fuzzy as a converter.
- Fairness: every framework receives the same viewers' outputs (same signals, same split), converts them into its own format, fuses them and produces a decision.
- Report: K, ignorance (m(Omega) or u), and a **probability-averaging baseline** (paper 9 in Section 29: DS did not beat averaging when conflict was nearly absent).
- Test on data where viewers actually disagree.

**Order:** A first (it picks the viewers), then B. B can only be judged fairly after A.

### 47. Do all signals plug into all frameworks? Not directly

Each signal has a different shape, so each needs a converter. This is the open "how does a viewer's output become a mass function?" item.

| Signal | What it looks like | Natural fit | Needs conversion for |
|---|---|---|---|
| Softmax probs | Distribution over known classes | Bayesian | DS and SL (no evidence amount in it) |
| Energy, Mahalanobis | One scalar | Nothing directly | Everything (e.g. calibrated score to mass on Omega) |
| Ensemble | Several distributions plus disagreement | SL (votes as counts) | DS |
| MC dropout | Same as ensemble | SL | DS |
| EDL | (b, u), already evidence | DS and SL | Almost nothing |
| Conformal | A set of classes | DS (a set maps to mass on a group like {D,S}; my suggestion, untested) | Bayesian |

Example: Mahalanobis gives "9.2". A conversion rule (larger distance means more mass on Omega) turns it into a mass function, which DS then fuses with the EDL viewer's (b, u).

### 48. The catch: the converter can decide the result

If Mahalanobis scores well inside DS only because of how distance was mapped to Omega mass, the experiment measures the converter, not the framework. Rules:
- [ ] Fix each signal's conversion rule before looking at test results.
- [ ] Give every arm an equal tuning budget.
- [ ] Run a sensitivity check: change the conversion rule and see whether the ranking flips.
- [ ] Separate tuning and evaluation seeds; grid-edge check on every tuned parameter.
- [ ] Choose all thresholds on validation, never test.
- [ ] A negative result (cheap baseline beats EDL, or averaging beats DS) is reportable.

### 49. Next steps

1. Step-by-step conformal prediction walkthrough (only the overview exists).
2. Draft the experiment table for Comparison A and Comparison B (arms, data split, held-out family, metrics, thresholds, pass rule).
3. Decide the converter rule for each non-EDL signal before any test run.
4. Verify library APIs and versions (`pytorch-ood`, MAPIE v1, crepes, TorchCP).
5. Open from before: choosing trust t or alpha per environment; testing independence between viewers; SL Step 8; SL prior-weight convention (K vs 2); database novelty sweep.
6. Carry forward all open items from earlier sections.


**Worked example (illustrative numbers):** states N, D, S. MMPP viewer: {N} 0.1, {D,S} 0.5, Omega 0.4. GRU viewer: {D,S} 0.6, Omega 0.4. Grid: {N}x{D,S} = empty 0.06; {N}xOmega = {N} 0.04; {D,S}x{D,S} = {D,S} 0.30; {D,S}xOmega = {D,S} 0.20; Omega x{D,S} = {D,S} 0.24; OmegaxOmega = Omega 0.16. K = 0.06.
- Dempster (divide by 0.94): {N} 0.04, {D,S} 0.79, Omega 0.17.
- Yager (K to Omega): {N} 0.04, {D,S} 0.74, Omega 0.22.
- Reading: attack-like, cannot tell DDoS from scan, a little unknown. The policy can learn "throttle, not isolate".

**Conversion of each viewer's output into a mass function (open design item; suggestions to test):**

| Viewer | Raw output | Candidate conversion |
|---|---|---|
| MMPP | likelihood under a model | One MMPP per known class gives one likelihood per class, normalized into masses on single states; if the window is unlikely under all of them, the leftover goes to Omega |
| GRU | prediction residual | Compare the residual with its distribution on normal validation data: low percentile = mass on {N}, very high = mass on {not normal}, in between = Omega |
| EDL head | evidence | Direct: (b, u) is already a mass function |
| Mahalanobis, ensemble spread | a score | Same percentile approach |

**Cautions:**
1. **Independence:** Dempster's rule assumes independent evidence; GRU and MMPP are correlated, so Dempster may become overconfident. Measure the correlation between viewers; compare Dempster, Yager and plain averaging.
2. **Circularity:** if the simulator generates traffic from an MMPP and the MMPP viewer is fitted to that same process, the viewer looks perfect for the wrong reason. Fit viewers on real CICIoT2023 normal and known traffic; test on real held-out attacks.
3. **One viewer means nothing to fuse.** A single mass function still gives Omega, but fusion needs at least two.

**Design choices to record:** viewers are trained first and **frozen** while PPO trains (otherwise the policy chases a moving input); the temporal rule from Section 45 item 4.

### 48. DS and EDL: how they work together

- **Different jobs (see Section 27):** EDL is a viewer (it produces evidence, then (b, u)); DS is the fusion rule (it combines mass functions). EDL's (b, u) is already a mass function on single states plus Omega, so EDL can feed DS. It is not either/or.
- **Why examples used groups like {D,S}:** EDL alone cannot put mass on groups; other viewers, after conversion, can. The DS grid handles both.
- **Example (EDL as a viewer):** EDL gives {N} 0.2, {D} 0.6, Omega 0.2. Another viewer gives {D,S} 0.5, Omega 0.5. Grid: {N}x{D,S} = empty 0.10; {N}xOmega = {N} 0.10; {D}x{D,S} = {D} 0.30; {D}xOmega = {D} 0.30; Omega x{D,S} = {D,S} 0.10; OmegaxOmega = Omega 0.10. K = 0.10. Dempster (divide by 0.9): {N} 0.11, {D} 0.67, {D,S} 0.11, Omega 0.11. Yager: {N} 0.10, {D} 0.60, {D,S} 0.10, Omega 0.20.
- **Correction to earlier framing:** "DS vs Bayesian vs EDL" treated them as rivals, but they sit at different layers. Cleaner setup: (a) same viewers with different fusion rules (Dempster, Yager, Bayesian with an unknown state, probability averaging); (b) EDL standalone; (c) hybrid arm with EDL as one viewer inside DS.
- **Caution:** an EDL head trained on the same data as the GRU is not independent evidence.

### 49. MBRL cost caution and the RL vs MBRL cost/performance/accuracy experiment (E2)

**What the caution means:** MBRL first learns a world model (the GRU), then trains the policy partly on imagined traffic. The benefit is fewer real interactions, which only matters when real interactions are expensive. A cheap simulator (the MMPP) produces traffic almost for free, so MBRL then only adds cost: world-model training, extra compute, and the risk of learning from a wrong model.

**Where MBRL could still pay off:** (1) a real home with little data (a few days of traffic); (2) federated training, where fewer steps may mean fewer communication rounds (Candidate 1); (3) the GRU residual as the "something is unusual" signal (the stronger argument).

**Crucial ablation:** train the GRU as a separate predictor, feed its prediction error into model-free PPO, and never train the policy on imagined rollouts. If that matches MBRL, the benefit came from the GRU feature, not from MBRL.

**Circularity trap:** if the GRU learns from MMPP-generated traffic and is evaluated on the same simulator, the test is circular (same issue as RAIDEN). Report final numbers on real held-out CICIoT2023 data.

**Arms:**

| Arm | What it is |
|---|---|
| A | Model-free PPO on window features |
| B | Recurrent PPO (GRU inside the policy, no explicit belief) |
| C | Model-free PPO plus the separately trained GRU residual as an input |
| D | MBRL: policy trained on imagined rollouts from the GRU/MMPP world model (mixed with real) |
| E | DQN baseline |

Each arm is also run with and without the DS belief as input, so belief and MBRL effects can be separated.

**Two data regimes:** (1) unlimited simulator (shows the cost MBRL adds when real data is free); (2) limited real data, N real windows mimicking a new home (where MBRL has a chance).

**Measures:**

| Axis | Metrics |
|---|---|
| Cost | Real environment steps to reach a target return, training wall-clock (including world-model training), memory, inference time per decision on Raspberry Pi-class hardware, later bytes per federated round |
| Performance | Return, time to contain, false-isolation rate, missed attacks |
| Accuracy | Detection AUROC on held-out attacks, per-class accuracy on known attacks, calibration |
| Robustness | A novel attack the world model never saw: do imagined rollouts mislead the policy? |

**Fairness:** equal tuning budget, same information for every arm, many seeds with spread reported, separate tuning and evaluation seeds, grid-edge check, rules fixed before running.

**Decision rules (suggestion, set numeric thresholds first):**
- C matches D: the gain is the GRU feature; use model-free RL plus a predictor and say so.
- D reaches the target with far fewer real steps and total compute stays reasonable: MBRL pays, in the limited-data regime.
- A or B matches everything: use normal RL; MBRL becomes a documented negative result.

### 50. Roadmap (durations are estimates; adjust to available hours)

| Phase | When | Tasks | Done when |
|---|---|---|---|
| 0. Before the meeting | This week | One page on exactly what the CICIoT2023 DS run did, plus the missing numbers from Section 44. Rough 2-page POMDP definition. List of decisions for the supervisor. Skim Hammar and Stadler, Q-BIRD, FedAtten-DRL (abstract and method only) | The result can be defended in 2 minutes |
| 1. Foundations | Weeks 2 to 4 | PPO/DQN/variants mini-review (2-page table). Calibrate MMPP; build a Gym-style environment and a replay harness. Freeze: observation layout by protocol segment with presence masks, action set, reward v1, zero-day protocol (leave-one-family-out, temporal, cross-dataset), metrics and pass/fail rules. Choose the DS temporal rule and the viewer conversion rules. Repo, configs, seeds, logging. Start the database novelty sweep | A design document; a random policy runs end to end |
| 2. Paper 1 experiments | Weeks 5 to 10 | Cheap kill tests first: world model (MMPP vs GRU vs both), belief input vs recurrent hidden state vs both, the belief comparison (Section 46). Then E2 (Section 49) | A table answering: does belief help, does MBRL pay, which world model |
| 3. Write Paper 1 | Weeks 11 to 16 | Paper plus the related-work table and threat model (reused later) | Submitted |
| 4. Paper 2 (federated) | Months 5 to 8 | Flower, Edge-IIoTset, IID vs non-IID splits, centralized baseline, FedAvg vs FedProx, FRL-IPS stabilization unit, global vs local fine-tuning, shadow-mode gate as a small ablation | Cost of federation measured |
| 5. Paper 3 (cross-protocol) | Months 9 to 14 | Pivot benchmark, measured timings, baselines (single factored agent, IoTHaven-style, attack graph); MARL only if separation is physical | Crossover map |
| Extensions | Only if time | XAI, twin, Byzantine fusion, conformal, home testbed | |

If the DS advantage disappears under the fair test, the belief comparison becomes an honest ablation, and the contribution rests on the agent and the explicit unknown state.

### 51. Easy-to-miss parts (check before starting)

- Environment, action set and reward design (the largest hidden piece).
- Observation layout fixed by protocol segment now, so Papers 2 and 3 do not force a redo.
- Held-out evaluation on real data, not only the simulator.
- The DS temporal update rule and the viewer-to-mass conversion rules.
- Independence between viewers (measure it).
- Compute cost on real hub-class hardware.
- A database novelty sweep before any "first" claim.
- Federated-ready code from the start (weights that serialize cleanly).
- Experiment logging, seeds, and a pre-registered pass/fail rule per comparison.
- Starting the writing early (related-work table and threat model are reused).

### 52. Open questions and next steps

1. Which viewers and rule (Dempster or Yager) did the CICIoT2023 DS run use, and how was "believing new attacks" measured?
2. Weekly hours, proposal or defense deadline, GPU access, library access (IEEE Xplore, ACM, Scopus)?
3. Is the belief comparison part of Paper 1 or a separate short paper?
4. Decide: DS temporal rule; viewer conversion rules; action set; reward v1; which PPO variants to include.
5. Reference answers for pending checks (not answered by the user in the session): (a) energy vs softmax: softmax only sees the ratio of the logits, energy also sees their size, so (10, 10, 10) has softmax max 0.33 like (1, 1, 1) but energy -11.1 vs -2.1. (b) MMPP viewer circularity: if the simulator generates traffic from the same MMPP, the viewer fits perfectly because it learned the generator itself, whereas real CICIoT2023 traffic is not exactly MMPP, so the fit is worse and more honest. (c) Continuous number with a spread: arrival rate, GRU residual; category: the attack state.
6. Paused (resume later): cheap baselines (softmax, energy, Mahalanobis, ensembles, MC dropout) and conformal prediction step by step (Section 28 and 29 material).
7. Carry forward all open items from earlier sections.

---

## UPDATE — 5 November 2026 (new sections only; everything above is unchanged)

Today: how EDL and DS work together (Section 53), how fuzzy would fit in (Section 54), and a correction to my own framing of the roles of EDL, DS and fuzzy (Section 55). These extend Sections 47 and 48 (3 November). Items marked (suggestion) are mine, not decisions.

### 53. EDL and DS together in more detail

**The connection in one line:** EDL's output (b, u) is already a DS mass function (mass b_k on each single state, u on Omega). DS then does what EDL cannot do alone: fuse it with other viewers and report conflict.

Conversion for K = 3: S = 12 + 3 = 15, b = e/S = (0.133, 0.600, 0.067), u = 3/15 = 0.2 (sum 1).

**Worked example:** a second viewer (the MMPP, after conversion) gives {D,S} 0.5, Omega 0.5.

| | {D,S} 0.5 | Omega 0.5 |
|---|---|---|
| {N} 0.133 | empty 0.067 | {N} 0.067 |
| {D} 0.600 | {D} 0.300 | {D} 0.300 |
| {S} 0.067 | {S} 0.033 | {S} 0.033 |
| Omega 0.200 | {D,S} 0.100 | Omega 0.100 |

K = 0.067.

| | Dempster (divide by 0.933) | Yager (K to Omega) |
|---|---|---|
| {N} | 0.071 | 0.067 |
| {D} | 0.643 | 0.600 |
| {S} | 0.071 | 0.067 |
| {D,S} | 0.107 | 0.100 |
| Omega | 0.107 | 0.167 |

Pignistic on the Dempster result (group mass shared equally): D about 0.73, S about 0.16, N about 0.11. Reading: most likely DDoS, with a little room for scan and for unknown.

**What each part contributes:**

| | EDL | DS |
|---|---|---|
| Learns from data | Yes (the network learns evidence per input) | No learning of its own |
| Mass on groups like {D,S} | No | Yes (from other viewers) |
| Conflict number K | No | Yes |
| Fuses several viewers | No | Yes |
| Trust | No | Discounting |

**Trust example:** on a new protocol, discount the EDL viewer with t = 0.5: masses become {N} 0.067, {D} 0.30, {S} 0.033, Omega 0.60. Fusing again with Yager gives {D} 0.30 (instead of 0.60) and K falls to 0.033. The EDL viewer pulls half as hard.

**Cautions:**
1. DS does not fix EDL's own weakness. If EDL gives high evidence on a brand-new attack, DS inherits that confident mistake. Fusion helps only when another viewer disagrees, which then shows up as K.
2. Independence: an EDL head trained on the same data as the GRU is not independent evidence, so Dempster may become overconfident.
3. Thresholds on K and m(Omega) are design choices, tuned on validation data and tested on held-out attacks.
4. In the anti-UAV study (Section 29, paper 9), EDL helped but DS fusion added nothing when conflict was rare. Test the hybrid arm against plain probability averaging.

### 54. Adding fuzzy (EDL + DS + fuzzy)

**Status:** I found no established recipe for this three-way combination in IoT intrusion detection. Everything below is a suggestion. Fuzzy is used as a **converter** ("Way A", Section 40), not as Fezzani's fuzzy focal elements ("Way B").

**Where fuzzy fits:** EDL already gives masses directly. Viewers that do not (GRU residual, Mahalanobis, rate-based rules) need a conversion, and fuzzy ramps can do it.

**Example (GRU residual is 3 times its normal level):** "high" ramp from 1x to 4x: mu_high = (3 - 1) / (4 - 1) = 0.667, mu_low = 0.333. Cap the total belief with a reliability rho = 0.8 so some mass stays on Omega: m({D,S}) = 0.8 x 0.667 = 0.533, m({N}) = 0.8 x 0.333 = 0.267, Omega = 0.2. The ramp endpoints and rho are design choices; a better way to set them is from percentiles of the residual on normal validation data.

**Fusing the EDL viewer with the fuzzy-converted GRU viewer:** EDL {N} 0.133, {D} 0.600, {S} 0.067, Omega 0.2. Fuzzy GRU {N} 0.267, {D,S} 0.533, Omega 0.2. Conflict cells: {N}x{D,S}, {D}x{N}, {S}x{N}. K = 0.249.

| | Dempster (divide by 0.751) | Yager |
|---|---|---|
| {N} | 0.154 | 0.116 |
| {D} | 0.586 | 0.440 |
| {S} | 0.065 | 0.049 |
| {D,S} | 0.142 | 0.107 |
| Omega | 0.053 | 0.289 |

Pignistic on Dempster: D about 0.67, S about 0.15, N about 0.17.

**Reading it:** K = 0.25 (EDL says DDoS, the GRU viewer partly leans normal). Dempster hides that behind a confident-looking 0.59 on {D}; Yager keeps it visible as Omega = 0.29. For 0-day detection the Yager reading is the one wanted.

**Honest assessment of what fuzzy adds:**
- Once a ramp is calibrated against validation percentiles, it behaves like a smooth calibration curve (isotonic calibration does something similar). Fuzzy mainly adds readable rules and a familiar vocabulary, not accuracy.
- Fuzzy rules ("IF rate is high AND peers are many THEN suspicious") could serve as an extra viewer whose firing strength becomes a mass. That helps explainability and ties to the XAI extension.
- Fezzani's fuzzy focal elements do not apply, because the states are categorical (Section 40).

**Where each goes in the experiments:**

| Arm | Tier (Section 46) |
|---|---|
| EDL as one viewer inside DS (Dempster and Yager) | Core hybrid arm |
| Same, with fuzzy converters for the GRU and MMPP viewers | Extended arm |
| Fuzzy-rule viewer for explainability | Extension, tied to XAI |

**Test against the simplest alternative first:** a percentile-based converter with no fuzzy vocabulary. If both perform the same, say so in the paper and keep the simpler one.

### 55. Correction: roles of EDL, DS and fuzzy (clarified in the session)

1. **EDL adds the learning.** It is the viewer that learns from data (traffic window to evidence to (b, u)). DS itself has no learning.
2. **DS is the fusion layer and the backbone of the belief, but "Yager" is not settled as the main rule.** Dempster and Yager are two rules inside DS. Yager fits 0-day detection better in theory (conflict becomes "unknown"), but it is untested on my data. Run both as arms, let the result decide, and always report K.
3. **Fuzzy and the {A,B} split (two different uses, do not mix them):**
   - The unequal split inside a group (for example A 80%, B 40% instead of 50/50) only exists with **fuzzy focal elements** (Fezzani's way, "Way B"). The degrees are not percentages that add to 100 (0.8 + 0.4 = 1.2 is fine); the split happens only at the decision step as degree divided by total degree.
   - Example: fuzzy focal element (A 0.8, B 0.4) with mass 0.30: A = 0.30 x 0.8 / 1.2 = 0.20, B = 0.30 x 0.4 / 1.2 = 0.10. Crisp {A,B} gives 0.15 each.
   - In my pipeline's use of fuzzy ("Way A", a converter from a number to ordinary crisp masses), {D,S} stays a crisp group and its pignistic split stays 50/50.
   - **An unequal split without fuzzy:** put separate masses on {D} and on {D,S}. Example: m({D}) = 0.20 and m({D,S}) = 0.10 gives D = 0.20 + 0.05 = 0.25 and S = 0.05.

**Corrected summary:**

| Part | Role in the pipeline |
|---|---|
| EDL | learns evidence, produces (b, u), one of the viewers |
| DS (Dempster and Yager) | fuses viewers, reports K and ignorance; both rules tested |
| Fuzzy (Way A) | converts a number to crisp masses, mostly for readability |
| Fuzzy (Way B, Fezzani) | unequal split inside a group; needs a numeric axis, so not for categorical states |

### 56. Reference answer for the pending check

- In the fused example K = 0.249. A high K means the viewers disagree (EDL says DDoS, the fuzzy GRU viewer leans normal), which may signal something new. Yager shows it because it adds K to Omega (0.289), while Dempster divides K away and rescales (Omega drops to 0.053), hiding the disagreement. Always report K with either rule.

### 57. Next steps

1. Moving on to a new part (to be chosen by the user). Paused from before: cheap baselines and conformal prediction (Sections 28 and 29).
2. Open design items: viewer-to-mass conversion rules (Section 47); DS temporal rule (Section 45 item 4); which viewers and rule the CICIoT2023 DS run used (Section 44); independence between viewers (measure it).
3. Test the hybrid arm "EDL as one viewer inside DS" against probability averaging and against the percentile converter without fuzzy.
4. Carry forward all open items from earlier sections.

---

## UPDATE — 5 November 2026 (continued; new sections only; everything above is unchanged)

This continues the earlier 5 November update (Sections 53 to 57). Today's second part: the study plan for what comes after the belief, then Session 0, which closes the belief loose ends (frame, conversion recipes, offline test, temporal rule). Items marked (suggestion) are mine, not decisions. Items marked (verify) have not been checked against sources.

### 58. Study plan after the belief (recommended order)

**Why this order:** the belief has no consumer yet. The agent decides what the belief must contain (its size, what feeds it, how often it updates), so coding the belief first and learning RL later may force a rebuild. The belief gets one short closing session, then the topics follow the data flow: belief, policy, learning algorithm, world model, evaluation.

| # | Topic | Why now | What it unblocks in code | Depth |
|---|---|---|---|---|
| 0 | Belief loose ends: (a) viewer-to-mass conversion rules, (b) the temporal rule (reset each window, or discount the old belief and fuse it as one more source) | Last open belief decisions | The belief module can be coded and frozen | STUDY (1 session; done, see Sections 59 to 66) |
| 1 | POMDP agent loop and problem definition: observation, action set, reward, episode, what a "step" is; a toy 3-state example on paper | The roadmap's biggest hidden piece; nothing can be coded without it | Environment interface, action list, reward v1 | STUDY (next) |
| 2 | RL basics up to PPO: value, advantage, policy gradient, PPO clipping and why it is stable, small numeric examples | PPO is the chosen algorithm | The training loop | STUDY |
| 3 | PPO vs DQN, on-policy vs off-policy: where each is stable, where each is sample-efficient | The "small literature" item; DQN is a baseline arm | Which arms to build and how to compare them | KNOW |
| 4 | Belief inside PPO: feed-forward vs recurrent PPO vs belief-based PPO (BF-PPO, Hammar and Stadler; verify details) | Connects the belief to the policy | The policy input layout | STUDY |
| 5 | World models and MBRL basics: learn a model, train on imagined rollouts (Dyna idea), how the GRU and MMPP fit | Needed for the RL vs MBRL cost experiment (E2) | The MBRL arm and the "GRU feature only" ablation | STUDY |
| 6 | Reward and cost design, plus experiment design: graded actions, false isolation, seeds, confidence intervals, pre-registered rules | The fair-comparison protocol keeps coming up | The evaluation harness | STUDY |
| later | Federated (FedAvg, FedProx, Flower), MARL/CTDE (MAPPO), XAI, twin, conformal prediction and cheap baselines | Not needed until Papers 2 and 3 or the extended belief arms | Nothing in Paper 1 | Postpone |

- **Postponed on purpose:** MAPPO and CTDE (Paper 3; learning them early blurs the single-agent picture), federated learning (study right before Paper 2), conformal prediction and cheap baselines (quick to learn when the extended belief arms are built).
- **Alternatives:** fastest path to a running agent = do 0, 1, 2 and 4, then code, and study 3, 5 and 6 while the first experiments run. Safest path = do all of 0 to 6 first. Suggested: safe for 0 and 1, fast for the rest.
- **One non-study item that affects coding:** fix the observation layout by protocol segment with presence masks during session 1; it also shapes the belief vector.
- **Not re-verified:** PPO, DQN, BF-PPO and MBRL claims; each session should include a short check of the key papers.
- **Open question for session 2's depth:** how much RL is already known (did RAIDEN use DQN; has a policy been trained before)?

### 59. Session 0, Step 1: the conversion problem and the frame

**Problem (plain):** the DS grid needs masses, but a viewer gives a number (like a smoke detector reading 0.7). The conversion rule decides what mass that number becomes. A good rule: masses are non-negative and sum to 1; a stronger signal puts more mass on a specific claim; a weak or unreliable signal leaves its mass on Omega.

**First decision: the frame (the list of states).**

| Option | States | Where "unknown attack" lives |
|---|---|---|
| F1 | {N, D, S} | Only as high Omega or high conflict K |
| F2 | {N, D, S, U} | U = "an attack from a family never seen" |

**Why F2 is more logical (plain):** a doctor who knows flu, cold, allergy meets a new disease. The F1 doctor must write "something wrong, fits no known pattern" as "flu or cold", which is a false claim. The F2 doctor writes it as "something wrong, could be known or something else". F1 forces every window to be one of the listed states; a 0-day is not.

**Omega is not U:**

| | Meaning | Action it suggests |
|---|---|---|
| Omega | "I have no evidence about anything", total ignorance (can include normal) | gather more data |
| U | "Something is wrong, and it is not any family I know" | be careful, contain |

In F1, "abnormal but unmatched" has nowhere to go except {D,S} (a false claim) or Omega (mixed with ignorance).

**Pignistic example (N 0.1, abnormal 0.7, Omega 0.2; group mass shared equally):**

| | F1: abnormal = {D,S} | F2: abnormal = {D,S,U} |
|---|---|---|
| N | 0.167 | 0.150 |
| D | 0.417 | 0.283 |
| S | 0.417 | 0.283 |
| U | n/a | 0.283 |
| Mass on known attacks | 83% | 57% |

F2 value for D: 0.7 / 3 = 0.233 (three states share the group) plus Omega's share 0.2 / 4 = 0.05, total 0.283. In F1: 0.7 / 2 = 0.35 plus 0.2 / 3 = 0.067, total 0.417.

**Caveats:** U gets no direct evidence from a score viewer; it gains mass only through sets that contain it (but see recipe A below, which can point at U directly). F1 can partly imitate F2 by reading unknown from Omega and K, so give F1 the same readouts in the test. F2 can cost accuracy on known attacks. The equal split of U is an assumption, like the 50/50 split earlier.

**Status:** F2 is the working choice (more logical), F1 is kept as a comparison arm, and an offline test decides (Section 63).

### 60. Session 0, Step 2: conversion recipes per viewer type (suggestions to test)

**Weights (trust) for viewers:** each viewer gets one number between 0 and 1 (its trust, equal to the reliability rho used in the recipes; use one number per viewer, do not apply it twice). At 1.0 its claim passes fully; at 0.5 half passes and the other half becomes "I don't know". A weight above 1 would create belief from nothing, so a more important viewer is not boosted above 1; less reliable viewers are turned down. Set the weights from validation reliability (accuracy and calibration), on known traffic only, never on the held-out attack. Other datasets are pure tests of whether a weight transfers (feature alignment across datasets is real work; BRIDGE builds a shared 46-feature vocabulary, see Section 29).

**Recipe 1: score viewer (GRU residual, Mahalanobis, ensemble spread; higher = more unusual).**
1. On real normal validation windows take two percentiles p_low (for example 90th) and p_high (for example 99th).
2. a = clip((s - p_low) / (p_high - p_low), 0, 1).
3. Choose reliability rho.
4. m({abnormal}) = rho x a, m({N}) = rho x (1 - a), Omega = 1 - rho, with "abnormal" = {D,S,U} in F2.

Example (p_low 1.5, p_high 3.0, rho 0.8): s = 1.0 gives N 0.80, abnormal 0, Omega 0.20; s = 2.4 gives a = 0.6, N 0.32, {D,S,U} 0.48, Omega 0.20; s = 5.0 gives a = 1, N 0, {D,S,U} 0.80, Omega 0.20. Check example: p_low 2.0, p_high 4.0, rho 0.9, s = 3.0: a = 0.5, m({N}) = 0.45, m({D,S,U}) = 0.45, Omega = 0.10 (sum 1).
Cautions: take the percentiles from real normal traffic (not simulator output, or circular); p_low, p_high and rho are hyperparameters tuned with equal budget per viewer; this ramp is the fuzzy ramp of Way A with percentile calibration.

**Recipe 2: per-class likelihood viewer (the MMPP).** One model per known case (normal, DDoS, scan) says how typical the window is for its class, f_k in [0, 1], measured against validation windows. If every model says "never seen this", that is information: mass goes to U. (This corrects my earlier statement that no viewer can point at U.)
- m(k) = rho x f_k / (sum f + c), m(U) = rho x c / (sum f + c), Omega = 1 - rho; c = how much fit counts as enough.
- Example (c 0.1, rho 0.8): fits (0.60, 0.05, 0.02) give N 0.623, D 0.052, S 0.021, U 0.104, Omega 0.20. Fits (0.01, 0.02, 0.01) give N 0.057, D 0.114, S 0.057, U 0.571, Omega 0.20.
- Check example: fits N 0.20, D 0.20, S 0.10, c 0.1, rho 0.8: denominator 0.6, m(N) = 0.267, m(D) = 0.267, m(S) = 0.133, m(U) = 0.133, Omega = 0.200 (sum 1.000).
- Caution: "nothing fits" can also mean poor class models, so a normal window the MMPP models badly would be flagged as new. Fit the models and set c on real normal traffic.

**Recipe 3: probability-output viewer (classifier with softmax).** A witness who always answers, even when clueless; the probabilities carry no information about how much it really knows. Add a confidence check: put the max probability on a ramp (validation percentiles) to get confidence c in [0, 1], then m(k) = rho x c x p_k, Omega = leftover. Example (ramp 0.4 to 0.9, rho 0.9): probabilities (0.50, 0.30, 0.20) give c = 0.2, masses 0.090, 0.054, 0.036, Omega 0.82; probabilities (0.95, 0.03, 0.02) give c = 1, masses 0.855, 0.027, 0.018, Omega 0.10. Caution: softmax can be confidently wrong on a new attack (an IoT study found confidence anti-correlated with zero-days, Section 29 paper 1); this viewer never points at U, it can only go quiet.

**Recipe 4: EDL.** Already a mass function: (b, u) gives masses on single states and u on Omega. Variant arm to test (untested): send part of u to U instead (little evidence on a new attack may mean "something new").

**0-day example for F2 (EDL viewer {N} 0.1, {D} 0.1, Omega 0.8; residual viewer s = 2.4 gives {N} 0.32, {D,S,U} 0.48, Omega 0.20):**
Grid: {N}x{N} = {N} 0.032; {N}x{D,S,U} = empty 0.048; {N}xOmega = {N} 0.020; {D}x{N} = empty 0.032; {D}x{D,S,U} = {D} 0.048; {D}xOmega = {D} 0.020; Omega x{N} = {N} 0.256; Omega x{D,S,U} = {D,S,U} 0.384; OmegaxOmega = Omega 0.160. K = 0.08. Dempster (divide by 0.92): {N} 0.335, {D} 0.074, {D,S,U} 0.417, Omega 0.174. Yager adds 0.08 to Omega instead. Reading: most mass sits on "abnormal, family unclear"; no known family wins. Under F1 the same fusion would say "{D,S}: DDoS or scan", mislabeling a 0-day as a known family. U appears by exclusion.

### 61. Roles of the components (MMPP, GRU, EDL, DS) and the world-model question

| Component | Job 1: world model (predicts and generates traffic) | Job 2: viewer (a claim about a window) |
|---|---|---|
| MMPP | Yes (bursty arrival model; action effects must be added by hand, for example "throttle scales the rate down") | Yes (recipe 2) |
| GRU | Yes (learned prediction of next traffic) | Yes (prediction error, recipe 1) |
| EDL | No (it only labels a window; it cannot forecast) | Yes (recipe 4) |
| DS | No | No: it is the fusion layer that combines viewers into the belief the agent acts on |

- **Plain picture:** a world model is a simulator in the agent's head (give it the situation and an action, it predicts the next traffic), like a weather forecast. EDL is a doctor labelling today's symptoms, not a forecaster.
- **Valid design (the user's):** GRU plus MMPP as the world model, and MMPP plus EDL (plus the GRU residual) as viewers. EDL is only a viewer, and DS is the main belief layer. "MMPP as world model, no GRU" is also valid and should be an arm (MMPP only, GRU only, both). What would be lost without the GRU: it cannot learn non-MMPP behavior, action effects are hand-written rather than learned, and the "prediction error as unusual signal" idea disappears.
- **How MMPP and GRU combine as a world model (open; test as ablation):** side by side (MMPP generates the regime, GRU predicts finer details given the regime) or correction (MMPP gives the baseline, GRU learns what the MMPP gets wrong).
- **Cautions:** (1) the same component plays two roles (generator and judge), so imagined traffic looks natural to it; evaluate on real held-out data and give attack traffic its own generator; (2) independence: MMPP and GRU read the same window and learn from the same normal traffic, so they are correlated; EDL is the most independent (it is trained with labels); (3) weights between 0 and 1 (Section 60).

### 62. States vs labels, and why Step 3 is ML and not RL

- **State** = the real situation in the network (normal, DDoS, scan, something new); the belief outputs masses over states. **Label** = the answer key in the dataset, used to grade the belief and to train label-trained viewers (EDL). Exam picture: the belief is the student, the label is the teacher's key.
- **Labels to states:** CICIoT2023 has 33 attacks in 7 categories (per earlier notes). Group them into the states; that grouping is a design choice and must be written down.
- **Where U comes from:** U has no label in training. Hide one attack family from training; at test time that family's windows are marked "should be U". U exists only in the answer key at test time.
- **ML, not RL:** the offline test checks if the belief is right about a window; there are no actions, rewards or environment. Whether it makes the agent act better is a separate question for the simulation. The offline test is the cheap one that comes first.

### 63. Session 0, Step 3: offline test of F1 vs F2 and of the conversions (plain ML)

**Setup:** real CICIoT2023, the same train and validation splits, the same held-out families for every arm; a standard supervised classifier (for example the EDL network) and a residual viewer trained on normal traffic only. The only difference between F1 and F2 is the frame and how "abnormal" is written ({D,S} vs {D,S,U}). Give F1 the same readouts as F2 (m(Omega) + K) so a win for F2 cannot be explained by the readout alone. F2 also gets Pl(U) (suggestion).

**Protocol:** (1) leave one attack family out of training; repeat for several different families (not just one); (2) fit percentiles, rho and other settings on the validation split of known classes only (one family can serve as a separate tuning family; the rest are used only for testing); (3) test on held-out attacks plus known and normal test traffic; (4) at least 5 seeds, report mean and spread.

**Metrics:**

| Question | Check |
|---|---|
| Does it catch the new attack? | AUROC of the novelty score (held-out family vs everything else) |
| Does it wrongly cry "new"? | False-U rate on normal and known windows (false-alarm rate) at a fixed detection rate |
| Is it still right on known attacks? | Accuracy or macro-F1 on known classes, using the pignistic result |
| Do the numbers mean what they say? | Calibration: among windows with m(U) around 0.6, about how many are truly novel? |
| Which part helped? | Each viewer alone vs fused |

**Decision rule (set numeric thresholds first):** choose F2 only if novelty AUROC improves by at least a margin and known-class macro-F1 drops by no more than a small tolerance. If the difference is within noise, keep the simpler F1.

**Worked metric example (200 test windows: 100 known, 100 from the hidden family):**
- First case: 80 of 100 hidden flagged, 15 of 100 known flagged: detection 80%, false-alarm rate 15%, precision 80 / (80 + 15) = 84%.
- Second case: 80 hidden flagged, 40 known flagged: detection 80%, false-alarm rate 40 / 100 = 40%, precision 80 / (80 + 40) = 66.7%. Same detection, far more false alarms. Check answer to the user's attempt: precision = correct detections (true positives, 80) divided by all detections (80 + 40); the 40 are the false positives, not the correct detections.
- Compare methods at the same false-alarm rate, not at whatever threshold each uses. Precision depends on how common attacks are (the 50% new-attack mix flatters it); report detection rate and false-alarm rate, which do not depend on the mix.

**Things that could go wrong:** F2 moves some mass away from D and S, which may lower known-class accuracy (the earlier DS run on CICIoT2023 showed the same trade-off: strongest on new attacks, second on known). If all viewers say "abnormal, family unclear" about everything unusual, F1 and F2 may look nearly identical. A hidden family may partly resemble a known one (a new flood that looks like DDoS), so the "should be U" key is fuzzy: repeat with several families and report each. A U can come from weak models, not from a truly new attack (the false-U rate and calibration catch this). There is no single accuracy to maximize; report the pair (novelty detection, known accuracy) and fix the pass/fail rule before running. The test shows which frame is a better belief frame, not whether the agent acts better; one confirmation inside the simulation is still needed.

### 64. Session 0, Step 4: the temporal rule (what the belief carries to the next window)

**Plain idea:** a doctor watching a patient through the night. A doctor who forgets each hourly result treats every test in isolation; one who remembers becomes more sure with each reading, but lets old results fade so a fever that drops at 5 a.m. is not kept alarming by the 2 a.m. result.

| Option | What it does |
|---|---|
| Reset | Build the belief from the current window only |
| Carry with fading | Multiply the old belief's masses by a keep factor k in [0, 1] (the rest moves to Omega, same as discounting), then fuse it with the new window as one more source |

Name: use k for the keep factor to avoid confusion with RL's discount gamma. This is a belief-module design that can be tested now, without RL.

**Example 1 (attack continues):** old {D} 0.5, Omega 0.5, k = 0.6, so faded old = {D} 0.3, Omega 0.7. New window {D} 0.4, Omega 0.6. Grid: {D}x{D} = {D} 0.12, {D}xOmega = {D} 0.18, Omega x{D} = {D} 0.28, OmegaxOmega = Omega 0.42, K = 0. Carry: {D} 0.58, Omega 0.42. Reset: {D} 0.40.

**Example 2 (attack ends):** same faded old. New window {N} 0.6, Omega 0.4. Grid: {D}x{N} = empty 0.18, {D}xOmega = {D} 0.12, Omega x{N} = {N} 0.42, OmegaxOmega = Omega 0.28, K = 0.18. Dempster (divide by 0.82): {D} 0.146, {N} 0.512, Omega 0.341. Yager: {D} 0.12, {N} 0.42, Omega 0.46. The belief swings back to normal with a small trace of the old attack; a smaller k forgets faster.

**Check (k = 0.5, old {D} 0.6, Omega 0.4, new {D} 0.3, Omega 0.7):** faded old: {D} = 0.5 x 0.6 = 0.3, Omega = 0.7. Grid: {D}x{D} 0.09, {D}xOmega 0.21, Omega x{D} 0.21, OmegaxOmega 0.49. Result: {D} = 0.09 + 0.21 + 0.21 = 0.51, Omega = 0.49, K = 0, so Dempster and Yager agree. Reset would give {D} 0.3; carrying memory raises it to 0.51. (The 0.5 in this check is the keep factor k, not the conflict K.)

**Cautions:** sliding windows overlap; if consecutive windows share traffic, fusing them counts some evidence twice and makes the belief overconfident; check how windows are built. k must be tuned on known validation traffic, never on the held-out attack, with equal budget for every arm. It is not known whether CICIoT2023 windows are time-ordered per device; this is needed to test the temporal rule offline (check first).

**Two kinds of memory in the agent:** memory in the belief (this carry-forward rule, decided now) and memory inside the policy (a recurrent network in PPO, part of the RL design). Arms for later: reset belief with a recurrent policy, carried belief with a feed-forward policy, both. PPO's own parameters (learning rate, clip range, epochs) come in the RL study sessions and are unrelated to the belief module.

### 65. Dempster vs Yager when there is conflict (worked checks)

**Plain idea:** K is the share of evidence that contradicts itself. Dempster throws the contradictory part out and scales the rest back to 100% (like removing disqualified ballots and recounting the valid ones). Yager does not throw it out: a contradiction means "we could not agree", so it counts as "I don't know" and goes to Omega. When K = 0 the two rules give the same answer (as in the check above, where both sources only mentioned {D} or Omega).

**Order of steps for both rules:** (1) multiply cell by cell, the overlap decides where the mass goes; (2) add up all cells that share the same overlap (for {D} that includes {D}x{D}, {D}xOmega and Omega x{D}, not only {D} times {D}); (3) handle conflict: Dempster divides by 1 - K, Yager adds K to Omega.

**Example (raw grid {D} 0.31, K = 0.20, Omega 0.49):** Dempster divides by 0.8: {D} 0.3875, Omega 0.6125 (sum 1). Yager: {D} 0.31, Omega 0.49 + 0.20 = 0.69 (sum 1). Without conflict the same case gave {D} 0.51, Omega 0.49. Dempster ends more sure of {D} (0.3875) than Yager (0.31); a mild version of the Zadeh effect (with K = 0.9 the gap would be large). Always report K with the result.

**Reference answer for the pending check (raw grid {D} 0.30, {N} 0.20, empty 0.25, Omega 0.25; not answered by the user in the session):** K = 0.25. Dempster (divide by 0.75): {D} 0.400, {N} 0.267, Omega 0.333 (sum 1.000). Yager: {D} 0.30, {N} 0.20, Omega 0.25 + 0.25 = 0.50 (sum 1.00).

### 66. Decisions and open items from Session 0

**Decisions (working, pending tests):**
1. Frame: F2 {N, D, S, U} is the working choice; F1 stays as a comparison arm; the offline test (Section 63) decides.
2. Viewers: MMPP (recipe 2), GRU residual (recipe 1), EDL (recipe 4), optionally a softmax viewer (recipe 3); each with one trust weight in [0, 1], set on known validation traffic.
3. World model arms: MMPP only, GRU only, both (Section 61).
4. Temporal rule: test reset vs carry with fading (keep factor k) offline first.
5. Fusion rules: Dempster and Yager both as arms; always report K and m(Omega).
6. Step 3 and the F1 vs F2 comparison are plain ML on real CICIoT2023 (several hidden families), not RL.

**Open items:**
1. How the grouping from fine labels to states is defined (CICIoT2023 has 33 attacks in 7 categories).
2. Which viewers and which rule did the earlier CICIoT2023 DS run use, and how was "believing new attacks" measured (carried from Section 44)?
3. Are CICIoT2023 windows time-ordered per device (needed for the temporal-rule test)? How are windows built (overlap)?
4. How to set each viewer's trust weight and whether it transfers to other datasets (BRIDGE-style feature alignment).
5. The U-from-u variant of EDL (send part of u to U) is untested.
6. Reference answers for pending checks not yet answered by the user: the Dempster vs Yager check in Section 65; the Step 3 quick check (answered above: false-alarm rate 40%, precision 66.7%).
7. Hypothesis flags: all conversion recipes, the percentile choices, the constant c and the keep factor k are my suggestions to test, not established methods; no literature check was done on them.

### 67. Next steps

1. Session 1 of the study plan: POMDP agent loop and problem definition (observation, action set, reward, episode, what a step is; toy 3-state example; observation layout by protocol segment with presence masks).
2. Code the belief module (viewers, recipes, DS fusion with both rules, temporal rule) and run the offline F1 vs F2 test; this chat is for understanding, the coding happens elsewhere using this md.
3. Carry forward all open items from earlier sections, including the paused topics (cheap baselines and conformal prediction, Sections 28 and 29).

The window block is split into fixed protocol-segment slots (for example Wi-Fi, Zigbee/Z-Wave, 5G). A missing segment is zero-filled with a "not present" flag (the presence mask). This is the design constraint from the notes, so Papers 2 and 3 do not force a redo.

**Trade-offs:** more inputs mean a bigger network and more data needed; raw features and the belief together may duplicate information (test belief only vs window only vs both); the layout must stay fixed across homes or federated averaging breaks.

**Check answer:** an agent isolates a device at step 5 and sees zero traffic at step 6; it could confuse this with "the attack ended" or with the device simply being idle or offline; the last-action block lets it see that the silence is its own doing.

### 74. PPO, GRU/LSTM and the model-based path are separate topics

- **PPO is the training method; GRU/LSTM is a possible building material for the policy network.** They answer different questions. "Recurrent PPO" means PPO training a policy that has a recurrent network inside.
- **Plain picture (chef and coach):** the chef's brain is the policy; PPO is the coach ("do a bit more of what worked better than expected, but do not change too much at once"). The coach does not care how the brain is wired: a brain with no memory (feed-forward) or with memory (GRU/LSTM). Same coach.

| | PPO with a feed-forward policy | PPO with a recurrent policy |
|---|---|---|
| Policy network | a few ordinary layers | the same plus a GRU or LSTM layer |
| Input at each step | the current observation | the observation plus a hidden memory vector from the last step |
| Training | steps can be shuffled | steps kept in order inside an episode; memory reset at each episode start |
| The PPO update rule | unchanged | unchanged |

- **Three different GRUs (name them separately in experiments):**

| GRU as | Job | Trained by |
|---|---|---|
| World model (GRU-wm) | predicts the next traffic, used for imagined rollouts (MBRL) | prediction error on traffic data |
| Viewer (GRU-viewer) | its prediction error becomes a mass function | the same, trained on normal traffic |
| Inside the policy (GRU-policy) | gives the policy memory | PPO, together with the rest of the policy |

- **PPO is independent of the model-based choice; the only link is where it gets its practice data.** Model-free: practice in the real kitchen (replay or simulator traffic). Model-based: also practice in an imagined kitchen (traffic invented by the world model). Independent: PPO update rule, policy network, belief module and viewers. Not independent: the data PPO trains on. (Suggestion: write PPO once behind a clean interface, "give me batches of observation, action, reward from some environment", then swap the environment between real replay, the MMPP simulator and the world model's imagination.)
- **Caveats for the MBRL arm (suggestions):** PPO learns from fresh experience, so imagined traffic must be regenerated as the policy changes, not stored and reused; a world model's mistakes pile up over long imagined episodes, so imagined rollouts are usually kept short or mixed with real data.
- **What is frozen before PPO:** the viewers (EDL, GRU-viewer, MMPP) and the world model; the belief rules (k, conversion settings) are fixed beforehand and tuned separately. PPO trains only the policy network.
- **Correction (PPO trains in an environment, not directly on recorded data):** recorded traffic cannot react to the agent's actions (if the agent throttles a device, the dataset's next window does not change). PPO practices in an environment built from the real data: traffic comes from replay or from the MMPP/world model, and the effect of each action is modeled. Real data calibrates that environment and is used to test the result. The world model can also be refreshed with new data; "frozen" is a simplifying choice.
- **Check answer:** in "belief as input plus a feed-forward policy", the memory lives in the belief (carry-forward rule with keep factor k); PPO changes only the policy network's weights.

### 75. PPO: library or from scratch, the variants, and a correction on BF-PPO

**Verdict: use a library.** PPO has many fiddly implementation details (the CleanRL authors published a well-known guide to them; verify), and silent mistakes ruin results. Write it from scratch only to learn, or if a change no library supports is needed.

| Goal | Tool | Note |
|---|---|---|
| Understand PPO | CleanRL `ppo.py` | CleanRL is single-file implementations (all details of an algorithm variant in one standalone file) and is not meant to be imported as a library |
| Run experiments | Stable-Baselines3 `PPO` | standard baseline, easy to defend |
| Recurrent policy (arm B) | `RecurrentPPO` from sb3-contrib (PPO with an LSTM policy; listed as experimental in the contrib package) | pass the LSTM states and episode-start flags correctly when calling `predict()` |
| Invalid actions | `MaskablePPO` from sb3-contrib | useful when an action does not exist in a segment or to forbid rung 3 before rung 2 |
| DQN baseline arm | not checked in this session | verify what Stable-Baselines3 offers |
| Paper 3 (multi-agent) | see below | choose when Paper 3 starts |

**What the user writes versus what the library provides:** the library provides the learning algorithm; the user writes the environment, the belief module, the viewers and the reward.
```python
from stable_baselines3 import PPO
env = MyIoTDefenseEnv(...)      # YOUR code: replay or simulator, belief module,
                                # viewers, action effects, reward
model = PPO("MlpPolicy", env)   # library: the PPO recipe
model.learn(total_timesteps=1_000_000)
# recurrent arm: RecurrentPPO("MlpLstmPolicy", env)
```
The environment must follow the Gymnasium interface (`reset` and `step`, where `step` returns observation, reward and an end flag). Most of the work is the environment, the belief module and the reward, which is why Session 1 matters more than the PPO library. Code not run in the session; versions and behavior with a custom belief input not checked.

**The variants decoded:**

| Name | What it changes | Where it fits |
|---|---|---|
| PPO | the baseline | Arm A |
| Recurrent PPO | the policy has LSTM memory | Arm B (`RecurrentPPO`) |
| BF-PPO | PPO whose input is a belief from a filter | the belief arms |
| IPPO | one independent PPO per agent | Papers 2 and 3 |
| MAPPO | several agents, each with its own actor, one shared critic during training (centralized critic, decentralized actors); the only difference from IPPO is the central critic | Paper 3 |
| MaskablePPO | forbids invalid actions | action masks |

MAPPO libraries found (not compared): EPyMARL (includes IPPO and MAPPO), MARLlib (built on Ray/RLlib), the original authors' `marlbenchmark/on-policy` code, CleanMARL (includes an LSTM variant).

**Correction to the notes (BF-PPO attribution):** earlier notes (Section 29 and the novelty table) and my earlier replies attributed BF-PPO to Hammar and Stadler. The paper found in this session, "Learning Optimal Defender Strategies for CAGE-2 using a POMDP Model" by Duc Huy Le and Rolf Stadler (arXiv 2509.06539), introduces BF-PPO (Belief Filter Policy Proximal Optimisation), which combines PPO with a particle filter, evaluated in the CybORG environment. Same KTH group; the CAGE-2 setting is a simulated enterprise network, not IoT or OT. BF-PPO is ordinary PPO plus a belief as input: the same pattern as this plan, with the DS belief in place of the particle filter, so no special PPO needs to be implemented. Fix the attribution in the comparison tables and verify from the paper itself.

**Check answer:** for the arm "DS belief as input with a feed-forward policy", the user writes the environment, belief module, viewers and reward; the library provides the PPO learning algorithm.

### 76. Step 4: what the agent can do (the action ladder)

**Plain picture (traffic officer at a busy junction):** watch; wave cars slower (cheap, easy to undo); close one lane for ten minutes; close the road and call the city. Two rules: higher rungs hurt more innocent drivers if he is wrong, and higher rungs are harder to undo, so he climbs only when confident.

| Rung | Action | What it does | If the agent is wrong |
|---|---|---|---|
| 0 | Wait / watch | nothing changes | an attack continues, no harm to innocents |
| 1 | Rate-limit | caps the device's traffic | slows a legitimate device |
| 2 | Temporary block | blocks the device for a set time | a legitimate device goes dark for a while |
| 3 | Blacklist (better named "isolate and alert the operator", since a permanent block should involve a person) | blocked until a human reviews | dark until someone notices |

**The belief decides how high to climb (hand-written illustration; PPO learns the real mapping):** mostly Normal = rung 0; abnormal with much ignorance or U = rung 1 (cheap, reversible); strongly abnormal with viewers agreeing (K low) = rung 2; strongly abnormal for several steps in a row = rung 3. A hand-written version of this table becomes the rule-based baseline in Step 7.

**Two designs for moving on the ladder:**

| Design | Plain version | Strength | Weakness |
|---|---|---|---|
| A: pick a rung directly | each step choose 0, 1, 2 or 3 | reacts in one step | can jump straight to rung 3 |
| B: step up, hold, or step down | each step move one rung (or stay) | smooth escalation and de-escalation | slow against a fast attack; needs the current rung in the observation (already in the last-action block) |

(Suggestion: start with design A and forbid rung 3 unless the agent has already been at rung 2, using an action mask; compare design B as an arm.)

**Time-limited blocks:** needs a duration. Simplest start: a fixed duration, for example 60 s (12 steps at Delta = 5 s), then the block expires and the agent decides again. Letting the agent choose short, medium or long multiplies the actions; test later. **Side effect:** while a device is blocked the agent sees zero traffic from it and gets no evidence on whether the attack stopped; the old belief fades toward "I do not know" (Omega) during the block, and the first windows after expiry act as a probe. This is why the last-action block matters.

**Reward and penalty do not move the action up or down while the agent runs.** Reward only shapes training; after training the frozen policy picks the rung from the belief.

**Three things the environment needs, or it hits a wall later:**
1. What each action does to traffic: per rung, how much attack traffic and how much legitimate traffic survive (for example a rate-limit might cut both by half). These numbers are assumptions and need a justification; results are only as trustworthy as they are.
2. Which device an action applies to: the agent is per home, actions apply to one device. Options: (i) the agent picks the rung and a fixed rule picks the device (the one with the most abnormal mass), or (ii) the agent outputs a rung per device, which makes the action size change with the number of devices and breaks the fixed layout federated averaging needs. (Suggestion: start with (i); open decision for the supervisor.)
3. Protocol-specific meaning: "block an IP" does not exist on Zigbee (the equivalent might be blocking a join or rotating a key). The four rungs stay abstract for now; the real mapping per protocol is still open (flagged earlier).

### 77. Reaction time against false positives (Delta = 5 s vs Delta = 2 s)

**Time to reach the top rung under design B (one rung per step):** Delta = 5 s gives rung 1 at 5 s, rung 2 at 10 s, rung 3 at 15 s. Delta = 2 s gives 2 s, 4 s, 6 s (less than half). Under design A the top rung could be reached in one step (5 s or 2 s).
- **Each rung is also a test:** the agent rate-limits and, in the next window, sees whether the traffic dropped; if the device was legitimate and traffic returns to normal it can step down, if the attack continues it climbs. The officer waves cars slower first and sees whether the jam clears before closing the road.
- **Risk if the attack is fast:** if damage happens in under 15 s, design B reacts too late. IoT attack speed is unknown; treat it as a scenario parameter (see the anchor in Section 71, verify).
- **Fixes to test (suggestions):** bigger jumps only when the belief is strongly abnormal and the viewers agree (low K); shorter steps during escalation (every 1 to 2 s once the belief rises); design A with a mask.

**The user's concern (a high spike without an attack becoming a false positive within 6 seconds) and the twist:** a spike and an attack differ by persistence (burnt toast beeps once, a fire keeps beeping). The belief has memory, so one spike window raises it a little (rung 1, cheap and reversible), a normal next window lets it fall back (step down), and several abnormal windows in a row keep it climbing. PPO learns not to climb on a single window once false isolations are punished in the reward.

**One-window spike timeline (agent rate-limits for one step, then steps down):**

| | Delta = 2 s | Delta = 5 s |
|---|---|---|
| Agent sees the spike | t = 2 s | t = 5 s |
| Device rate-limited | 2 s to 4 s | 5 s to 10 s |
| Time the legitimate device is limited | 2 s | 5 s |
| Time to react to a real attack | 2 s | 5 s |

A short step reacts faster and also recovers faster. (In practice the agent may hold the rung one extra step while the belief is still elevated.) **Costs of the short step:** 2.5 times more steps to train; noisier windows if the window shrinks with the step (normal bursts look more like spikes, so more frequent but shorter false alarms); a subtle blind spot while limited (calmer traffic hides whether the spike ended, so step down only after a normal-looking window; if W stays 5 s with an update every 2 s, windows overlap and the belief double-counts).

**What decides Delta:** a measurement, not an argument: sweep Delta in {1, 2, 5, 10} s and plot time to contain a real attack against harm to legitimate devices (seconds of limited traffic per hour of normal operation); pick where the curve bends. The reward (Section 78) turns the trade-off into one number.

### 78. Step 5: the reward

**Plain picture (a guard's performance review):** at the end of each shift the guard gets a score and is never told what to do. Three things move it: a burglary got through (bad), he stopped an innocent person (bad, usually less than a burglary), and heavy measures cost effort each time. Over many shifts he learns when to act and when to wait. PPO is that learning; the reward is the score.

**Where it comes from:** the environment computes it each step from what actually happened (the simulator knows the true state; the agent does not). It exists only for training; at deployment nobody computes it and the frozen policy simply acts.

**Three parts (suggestion):**

| Part | Meaning | Symbol |
|---|---|---|
| Missed-attack cost | attack traffic that got through this step | M |
| False-block cost | legitimate traffic that was cut this step | F |
| Action cost | a small price per rung (rung 3 involves a human, so the biggest) | A |

Per step: reward = -(M x attack that survived) - (F x legitimate traffic lost) - (A x rung number).

**Example (M = 1, F = 1, A = 0.2):**

| Rung | Attack traffic surviving | Legitimate traffic lost (if the device is innocent) | Action cost |
|---|---|---|---|
| 0 wait | 1.0 | 0 | 0 |
| 1 rate-limit | 0.5 | 0.5 | 0.2 |
| 2 block | 0 | 1.0 | 0.4 |

Over 3 steps: policy "wait" scores -3 on a real attack (-1 -1 -1) and 0 on a false alarm. Policy "act" (rung 1, then rung 2, then rung 2) scores -1.5 on a real attack ((0.5 + 0.2) + 0.4 + 0.4) and -3.5 on a false alarm ((0.5 + 0.2) + (1 + 0.4) + (1 + 0.4)). Acting is far better against a real attack and far worse against an innocent device; neither wins everywhere, which is why the agent needs a belief.

**How the reward becomes "how sure must I be" (q = probability the device is attacking):** expected cost of waiting = 3q; of acting = 1.5q + 3.5(1 - q) = 3.5 - 2q. Acting is better when 3.5 - 2q < 3q, so q > 0.7. With F = 2 the false-alarm cost becomes 1.2 + 2.4 + 2.4 = 6.0, so acting costs 6 - 4.5q and the threshold is q > 0.8. With F = 0.5 the false-alarm cost is 0.45 + 0.9 + 0.9 = 2.25, so acting costs 2.25 - 0.75q and the threshold is q > 0.6. The ratio between F and M is the "caution dial" (surgeon analogy: the riskier the surgery, the surer he must be).

**Things that can go wrong:** attacks are rare, so "never act" scores well most steps if the missed-attack cost is too small (the agent learns to sit still); the reverse, if false blocks are cheap the agent blocks everything; the weights are judgment calls and belong in the threat model (sweep them and report the trade-off curve of missed attacks against false blocks, not one magic setting); unknown attack families need realistic damage in the simulator or the agent has no reason to deal with U; the belief must be calibrated or it misleads the agent; rung costs (rung 3 is operator time) have no real numbers.

### 79. Reference answers for pending checks (not answered by the user in the session)

- Step 4 check (design B, Delta = 5 s, attack starts, agent wants rung 3): 15 s; risk: a fast attack finishes first. With Delta = 2 s: 6 s (the user computed this).
- Rate-limit timeline check: Delta = 2 s gives 2 s of limiting, Delta = 5 s gives 5 s (the user's reading was correct).
- Last-action check (one sentence): the agent needs the last action because calm traffic from a limited device could mean "the attack ended" or "my own limit is working".
- Step 5 check (if F = 2, more or less sure?): more sure; threshold q > 0.8 (up from 0.7).

### 80. Openings from today's questions, open items and next steps

**Openings that came out of the questions:**
1. The belief pays off only if one window is ambiguous: keep arm A (pretend MDP) against the belief arms, and add an oracle arm in simulation as the upper bound.
2. Sweep Delta in {1, 2, 5, 10} s (and the window) as an experiment: time to contain vs harm to legitimate devices; overlap as an ablation (double counting).
3. Define memory in seconds and derive k from Delta.
4. The environment needs assumed action-effect numbers (how much attack and legitimate traffic survive per rung), a device-selection rule and a protocol mapping; ask the supervisor early.
5. PPO trains in an environment built from real data, not directly on recorded data; write PPO once behind a clean environment interface.
6. Name GRU-wm, GRU-viewer and GRU-policy separately.
7. Library plan: Stable-Baselines3 PPO (arm A), sb3-contrib RecurrentPPO (arm B) and MaskablePPO (action masks, such as forbidding rung 3 before rung 2); CleanRL to read and understand PPO; MARL libraries only when Paper 3 starts.
8. Correct the BF-PPO attribution in the earlier tables (Le and Stadler, CAGE-2); verify from the paper.
9. Reward weights and rung costs are a threat-model decision; sweep and report the trade-off; unknown attacks need realistic damage in the simulator.

**Open items:**
1. Session 1 Steps 6, 7, 8 (episode end and the U response; baseline policies and environment sanity checks; the one-page design document).
2. Decisions listed in Section 68 (window, action list, reward weights, U response, episode length).
3. Questions still open to the user (Section 68): RL background, window and overlap in the CICIoT2023 run, operator actions.
4. Verify: attack-speed anchors (CrowdStrike, enterprise); the PPO implementation-details guide; what Stable-Baselines3 offers for a DQN arm; library versions and the behavior of RecurrentPPO with a custom belief input.
5. Paused from before: cheap baselines and conformal prediction (Sections 28 and 29).
6. Carry forward all open items from earlier sections, including Section 66 (Session 0) and Section 44 (the CICIoT2023 DS run).

**Next time:** continue with Session 1, Step 6 (when does an episode end, and what does the agent do when the belief says "something new").


---

## UPDATE — 12 November 2026 (new sections only; everything above is unchanged)

Today: a full recap of the belief layer, then clarifications that came out of the questions: what Omega, K and U each mean, how EDL, SL, DS and fuzzy relate, which viewers form the panel and what each does, how the GRU and fuzzy fit together, what softmax is, and which states the system uses and how it grows. These sections are the reference for building the belief module and the simulation. Sections 68 to 80 (9 November) stay as they are. Items marked (suggestion) are mine, not decisions. Items marked (verify) have not been checked against sources.

### 81. Recap: belief states and the 7 belief methods

**Belief, in plain words:** the agent cannot see what is really happening in the network, only traffic numbers. So it keeps a running guess (the belief) and acts from the guess, not from the last window alone. It is the guard's notebook. Example: after a spike the belief is Normal 0.5, DDoS 0.2, Unknown 0.1, Omega 0.2; one more unusual window moves it to Normal 0.2, DDoS 0.3, Unknown 0.3, Omega 0.2; the agent acts on that shift, not on one spike.

| # | Method | Plain idea | Tiny example | Weak spot |
|---|---|---|---|---|
| 1 | Bayesian (known states only) | One percentage per state. Multiply the previous belief by how well each state explains the clue, then rescale | Prior N 0.9, D 0.1; a spike has likelihood 0.05 under N and 0.9 under D; products 0.045 and 0.09; result N 0.33, D 0.67 | Cannot say "I do not know": (1/3, 1/3, 1/3) can mean no idea or a real even split |
| 2 | Bayesian with an Unknown state | Add a state U with a guessed prior and guessed likelihoods | Prior N 0.88, D 0.10, U 0.02; spike likelihoods 0.05, 0.9, 0.5; products 0.044, 0.09, 0.01; result N 0.31, D 0.63, U 0.07 | U's numbers are guesses, since a 0-day has no examples |
| 3 | DS with Dempster | Mass on groups of states; Omega holds ignorance; combine viewers in a grid (overlap decides where the mass goes, the product decides how much) | Viewer 1 {D,S} 0.6, Omega 0.4; viewer 2 {D} 0.5, Omega 0.5; result {D} 0.50, {D,S} 0.30, Omega 0.20 | Conflict K is thrown away and the rest scaled up, which can give false confidence (Zadeh) |
| 4 | DS with Yager | Same grid; conflict K is added to Omega instead of divided away | Viewer 1 {N} 0.6, Omega 0.4; viewer 2 {D} 0.5, Omega 0.5; K = 0.30; Dempster: N 0.43, D 0.29, Omega 0.29; Yager: N 0.30, D 0.20, Omega 0.50 | More cautious, so more "unknown" alerts |
| 5 | EDL | A network outputs evidence per class (counts); ignorance u = K/S | K = 3: [0,30,2] gives u = 0.09 (confident); [0,0,0] gives u = 1 (unknown); [30,30,30] gives u = 0.03 with b = 0.32 each (conflict) | Can be confidently wrong on a brand-new attack, because training never shows one |
| 6 | Subjective logic | The same (b, u) built from counts, plus a base rate, fusion and trust | Counts 6, 3, 1 (K = 3): S = 13, b = (0.46, 0.23, 0.08), u = 0.23 | No conflict number K, no mass on groups |
| 7 | Fuzzy | A value fits a vague word to a degree between 0 and 1 (about vague words, not about uncertainty) | 700 packets per second on a "high" ramp from 200 to 1,000 gives mu = 500/800 = 0.625 | No "how much evidence" number, no conflict number |

**Shared ideas:**
- **Omega** = "I have no evidence". **K** = "my sources disagree". **U** (frame F2) = "something is wrong and it is not any family I know". Three different things.
- **Trust** is a number from 0 to 1 per viewer; multiplying the masses by 0.5 moves half of the viewer's belief into "I do not know" (Omega).
- **Frame F2** = {N, D, S, U}: lets "abnormal, family unclear" be written as {D,S,U} instead of falsely as {D,S}.
- **Memory:** the old belief fades by a keep factor k and is fused with the new window (Section 64).

### 82. Omega, K, U and Yager: clarifications

- **Omega is not an equal split.** Plain picture: three witnesses. "I was not there, no idea" = Omega 1. "I looked carefully and it is truly equally likely to be any of them" = mass 1/3 on each single state. "Witness 1 says N, witness 2 says D" = conflict K. Behavior when fused with a third viewer Z = {D} 0.6, Omega 0.4:
  - the "no idea" witness (Omega = 1) changes nothing: result {D} 0.6, Omega 0.4. Omega is neutral, it adds no opinion;
  - the "even split" witness (1/3 each) gives cells {N}x{D} empty 0.2, {N}xOmega = {N} 0.133, {D}x{D} = {D} 0.2, {D}xOmega = {D} 0.133, {S}x{D} empty 0.2, {S}xOmega = {S} 0.133; K = 0.4; Dempster (divide by 0.6): N 0.22, D 0.56, S 0.22. It argues against Z.
  - Check (viewer 1 Omega = 1, viewer 2 {D} 0.5, Omega 0.5): K = 0 and the result is viewer 2 unchanged, {D} 0.5, Omega 0.5.
- **Why they get confused:** at the decision step the pignistic transform shares Omega equally among the states, so Omega = 1 and (1/3, 1/3, 1/3) end up with the same decision numbers. They are different beliefs and behave differently the moment they are fused with anything else. Plain Bayesian numbers cannot tell them apart.
- **K is not "I do not know".** K says the sources contradict each other. That is information and often points to something new (two viewers that normally agree started to disagree). "Conflict means don't know" is Yager's choice: Dempster throws K away and scales the rest up (K leaves the belief, but report it anyway); Yager adds K to Omega.
- **Yager does have an "I do not know" state: it is Omega, made bigger.** Omega_final = Omega1 x Omega2 + K. Example (viewer 1 {N} 0.6, Omega 0.4; viewer 2 {D} 0.5, Omega 0.5): ignorance part 0.4 x 0.5 = 0.20; K = 0.30; Dempster Omega = 0.20 / 0.7 = 0.29; Yager Omega = 0.20 + 0.30 = 0.50.
- **Downside of Yager:** after adding K you cannot tell how much of Omega is ignorance and how much is conflict. Save both numbers before adding them: report K and the ignorance part separately, keep the combined Omega for the belief.

| Symbol | Means | Where it comes from |
|---|---|---|
| Omega | no evidence | what a viewer reports about itself |
| K | the viewers disagree | what the fusion grid measures |
| U | something wrong that fits no known family | a state added in frame F2 |

### 83. EDL vs DS, SL and fuzzy: how they relate

**EDL is not a belief language like DS, SL or Bayes; it is a belief producer.** Plain picture (a court case): EDL is a trained witness who reports how much evidence it found for each class; DS, SL and Bayesian are the court's rules for writing testimony down and weighing several witnesses.

| Layer | Job | Members |
|---|---|---|
| Source (viewer) | turns a window into a signal or evidence | EDL, GRU residual, MMPP likelihood, softmax, ensembles |
| Belief language | how a claim and its uncertainty are written | Bayesian probabilities, DS masses, SL opinions |
| Fusion and trust | combines several viewers | Dempster, Yager, SL fusion, Bayes, averaging, discounting |

EDL sits in the first layer, but its output is written in the language of the second (an SL opinion or a DS mass function). Tables that mix the layers need a "layer" column. For a fair experiment, compare within a layer: viewers against viewers (EDL vs softmax vs ensemble vs MC dropout); fusion rules against fusion rules (Dempster vs Yager vs SL fusion vs Bayes vs plain averaging); plus the hybrid arm "EDL as a viewer inside DS fusion".

**The user's EDL vs DS comparison, checked:** right that EDL is a DL model and learns; right that DS allows mass on groups like {A,B} (call them masses; "weights" usually means trust); both give a full set of numbers per viewer, but only DS allows groups; Omega is not a difference, because EDL's ignorance u is the mass on Omega.

| | EDL | DS |
|---|---|---|
| What it is | a neural network (a viewer) | a way to represent and combine belief |
| Learns from data | yes | no |
| Mass on groups like {D,S} | no | yes |
| Omega ("no evidence") | yes, as u | yes |
| Fuses several viewers | no | yes |
| Conflict number K | no | yes |

**SL in one hook:** star rating plus a "how many reviews" bar. An opinion for a yes/no claim is (b, d, u) with b + d + u = 1, from counts: b = r/(r+s+2), d = s/(r+s+2), u = 2/(r+s+2). 5 reviews (4 happy, 1 unhappy): b 0.57, d 0.14, u 0.29; 1,000 reviews (800, 200): b 0.80, d 0.20, u 0.002. With K states disbelief disappears (against one state means for the others): (b1, ..., bK, u), b_k = r_k/(K + sum r), u = K/(K + sum r). SL is DS restricted to single states plus Omega (u is Omega); it adds a base rate (P = b + a x u), fusion (different events: add the counts; the same events: average them) and trust (multiply b by t, the rest goes to u); it has no K and no groups. One sentence: SL is EDL's formula done by counting, with a base rate attached.

**EDL vs SL:** the formulas are the same; the difference is who does the counting. SL: you count real observations (6 normal, 3 DDoS-like, 1 scan-like in 10 windows). EDL: a network predicts the evidence from the features of one window, trained on many past windows. EDL's evidence is a learned strength interpreted as counts, not literally observed counts, and whether it stays quiet on a brand-new attack is an experiment, not a guarantee. EDL's probability implicitly uses equal base rates; SL allows unequal ones.

**Fuzzy in one hook:** CSS opacity, a slider instead of a checkbox. A value fits a vague word to a degree: a rate of 700 makes "high" about 62% opaque. It is not a probability (the rate is known exactly; the word is soft). The ramp is a clamp: mu_high = clamp((x - 200) / (1000 - 200), 0, 1); AND = min, OR = max, NOT = 1 - mu. Fezzani let the DS groups themselves be fuzzy because his unknown was a depth along a line (Section 37); categorical states do not need that. One sentence: the other methods measure how sure you can be; fuzzy measures how well something fits a vague word.

**Memory hooks:** Bayesian = a probability per state, no "don't know". DS = a ballot with groups on it, Omega as "abstain", K as "the voters disagree". EDL = a network that outputs how much evidence it found. SL = star rating plus a "how many reviews" bar. Fuzzy = opacity, not a checkbox.

### 84. Viewer types, panel and candidates

**Plain picture (a panel of experts):** a hospital panel is strong when the experts differ (a radiologist reads images, a lab specialist reads blood tests, a nurse reads the history). Three radiologists reading the same scan add little. Each viewer should have its own specialty, its own input and its own way of failing.

| Type | What it knows | Task in the system | Candidates |
|---|---|---|---|
| Label-trained classifier | known attack families | says which known family and how much evidence | EDL, LightGBM, an MLP |
| Normality model | what normal looks like | says "abnormal" without a family; the main source of U | GRU residual, autoencoder, Mahalanobis |
| Traffic-process model | burst and arrival structure | says how plausible the window's timing and rate are per class, and "nothing fits" | MMPP |
| Structure and context | who talks to whom | fan-out or new-neighbor signals (Paper 3) | graph heuristic, GNN |

**Suggested core panel (three different specialties; hypothesis, not established): EDL (known families, trained with labels), GRU residual (normality), MMPP (burst structure and "nothing fits").** Add a fourth (Mahalanobis, LightGBM) only as an ablation. More than about five is rarely worth it: each viewer needs its own conversion rule and tuning, correlations grow, and each adds ways for fusion to go wrong.

| Idea | Verdict | Why |
|---|---|---|
| EDL, GRU with fuzzy, MMPP | good core design | three different specialties |
| EDL with fuzzy | not needed | EDL already outputs masses; fuzzy only converts a number into masses |
| GRU with or without fuzzy | a valid ablation | fuzzy ramp vs percentile mapping vs logistic calibration; a calibrated ramp is nearly the same as a percentile mapping |
| LightGBM instead of the GRU | not a swap | LightGBM is a label-trained classifier (EDL's type), the GRU is a normality model; replacing the GRU removes the main source of U |
| LightGBM plus EDL | correlated | both learn from the same labels and features; use one in the core panel |
| Another RNN or DL model instead of the GRU | fine | same role, test as an arm |
| MMPP replaced or dropped | possible | its unique role is the mathematical burst structure (the RAIDEN baseline); something else must cover the timing view |

**Independence is the real measure of a good panel.** Give viewers different inputs (for example EDL on flow-statistics features, the GRU on the time series of rates, the MMPP on arrival counts) and measure the correlation between their outputs on validation data before trusting a fusion.

**Precedent (verify):** DA-DCC-IDS (IEEE Access 2026, Section 29 paper 17) builds its novelty score from a per-device Mahalanobis density fitted on a projection of LightGBM leaf indicators, so LightGBM can feed novelty detection, but through extra processing.

**Fusing three or more viewers with Yager:** Yager is not associative, so fusing pair by pair makes the result depend on the order. Suggestion: combine all viewers' masses at once, collect the total conflict and add it to Omega once. This is my reading of how Yager's rule extends to many sources; verify before coding it.

**A learned-combiner baseline arm (suggestion):** a small learned combiner (for example logistic regression on the viewers' outputs) learns the importance automatically. If DS fusion cannot beat it, that is worth knowing.

### 85. Label-trained classifier vs normality model (different logic, different blind spots)

**Plain picture (two security guards):** Guard 1 studied a book of wanted posters and asks "which poster does this person match?" (answers with a name or "none"). Guard 2 studied only what a normal crowd looks like and asks "does this person look like the crowd I know?" (answers normal or odd, cannot name the person).

| | Label-trained classifier (Guard 1) | Normality model (Guard 2) |
|---|---|---|
| Trained on | normal and attacks, with labels | only normal traffic, no labels |
| Question | which known family is this? | does this look like normal? |
| Answer | a family and its evidence | one "how odd" score |
| Strong on | attacks it has studied | anything different from normal, including new attacks |
| Weak on | new attacks (no poster: it guesses or stays quiet) | naming the family; unusual-but-harmless traffic also looks odd |

| Situation | Classifier | Normality model |
|---|---|---|
| Known attack | good | good (it is odd) |
| New attack | unreliable | good (it is odd) |
| Harmless but unusual traffic (a firmware update) | may say "normal" | flags it as odd (a false alarm) |
| Which family? | yes | no |

Fused, "no poster matches" plus "odd" is exactly the {D,S,U} situation. A one-class classifier trained only on normal is a normality model; here the EDL has attack labels, the GRU never sees one.

**The three guards in the 0-day story (illustrative masses, frame F2):**
- GRU (odd): {N} 0.10, {D,S,U} 0.70, Omega 0.20. EDL (no poster matches): {N} 0.10, {D} 0.10, Omega 0.80. MMPP (nothing fits): {N} 0.06, {D} 0.11, {S} 0.06, {U} 0.57, Omega 0.20.
- GRU x EDL grid: {N}x{N} = {N} 0.01; {N}x{D} empty 0.01; {N}xOmega = {N} 0.08; {D,S,U}x{N} empty 0.07; {D,S,U}x{D} = {D} 0.07; {D,S,U}xOmega = {D,S,U} 0.56; Omega x{N} = {N} 0.02; Omega x{D} = {D} 0.02; OmegaxOmega = Omega 0.16. K = 0.08. Dempster: {N} 0.11, {D} 0.09, {D,S,U} 0.56, Omega 0.16 (before dividing by 0.92). Yager: Omega = 0.24. Fusing the MMPP next gives mass on {U} (its {U} meets {D,S,U}); the third step was not computed in the session.
- Reading: the viewers agree it is abnormal, none points to a known family, the MMPP says nothing known fits; the fused belief concentrates on U and the abnormal groups.

**What the DS output can and cannot claim:**
1. It does not say "0-day attack" with certainty; it says a large share of belief sits on U and the abnormal groups. A threshold on that mass (set on validation data) turns it into an alarm.
2. U can be a false alarm: "odd and unknown" also describes a firmware update, a new device or an unusual legitimate burst. DS cannot tell a malicious unknown from a harmless one, so the response is a graded, gentle action (watch, then rate-limit), not an instant block.
3. The viewers are not independent (the GRU and MMPP both learned from normal traffic), so two "odd" votes are weaker evidence than they look and Dempster may exaggerate.
4. It only works if the viewers are calibrated (a GRU ramp set too low makes normal bursts trigger it).
5. The test comes from hidden families (Section 63).

**Mixed case:** GRU says normal, EDL says no poster matches, MMPP says nothing fits: the disagreement matters more than the U mass. The GRU's {N} contradicts the MMPP's {U}, so K rises. Read K and Omega, not the U mass alone. Most likely one viewer is miscalibrated or the traffic is odd but harmless, so respond gently.

### 86. What each viewer outputs, and the GRU, MMPP and fuzzy details

**Correction to earlier wording: the GRU is a predictor (regression), not a classifier.** Plain picture: a weather forecaster who studied only normal days; each morning you compare his forecast with what happened; a small gap means a normal day, a big gap means something strange. The GRU is trained on normal traffic only to predict the next window's numbers (no attack label ever). At run time it predicts the next window, the real one arrives, and the gap is the signal. The "normal or odd" verdict is made afterwards, by turning the gap into masses. (The earlier shorthand "GRU says normal or odd" squeezed those two steps together.)

**The MMPP is not a state tracker in this recipe.** It is a per-class likelihood viewer: how well the window's timing and rate pattern fits each known class's process. A good fit for N means normal; a poor fit for every class means "nothing I know explains this", which points at U (recipe 2, Section 60). The MMPP and EDL are viewers; neither is a belief language.

**Fuzzy is not inside the GRU; it is a step after it:**
```
past windows -> GRU -> predicted next window (numbers)
actual window arrives
   -> residual: one number, "how far off, in units of normal error"
   -> ramp (fuzzy or percentile) -> degree of "high" in [0, 1]
   -> masses on {N}, {D,S,U}, Omega
```
Example: the GRU predicts a rate of 100, the actual rate is 220, normal error sigma = 50, so the residual = 120 / 50 = 2.4. The ramp runs from 1.5 to 3.0 (percentiles of normal residuals): degree "high" = (2.4 - 1.5) / 1.5 = 0.6. With reliability rho = 0.8: m({N}) = 0.8 x 0.4 = 0.32, m({D,S,U}) = 0.8 x 0.6 = 0.48, Omega = 0.20. Checks (answered by the reference): s = 1.8 gives degree 0.2, N 0.64, {D,S,U} 0.16, Omega 0.20; prediction 80, actual 170, sigma 40 gives residual 2.25, degree 0.5, N 0.40, {D,S,U} 0.40, Omega 0.20.

**With many features:** first combine the per-feature errors into one number (for example the average of the normalized errors, or a Mahalanobis-style distance); this choice is open and to be tested. Without fuzzy the same ramp is called a percentile mapping and the arithmetic is identical.

**Will fuzzy plus the GRU work?** It runs and can work, but set expectations carefully:
1. A ramp is a monotone transformation of the score, and ranking metrics such as AUROC ignore monotone changes; the clipping at the ends even creates ties (residuals of 3.5 and 5.0 give the same masses). So the benefit appears in fusion and calibration (masses that combine sensibly with EDL's), not in the viewer's own detection accuracy.
2. The ramp endpoints decide everything: take them from percentiles of real normal residuals, never from simulator output (circularity).
3. Bursty normal traffic produces large residuals and false "abnormal" claims; endpoints may be needed per device or per protocol.
4. It cannot say which family: all the abnormal mass goes to {D,S,U}, the honest answer from a residual.
5. How to find out: compare the fuzzy ramp against (a) a percentile mapping with no fuzzy wording (the same thing, so expect the same results) and (b) a plain logistic calibration; judge the fused belief's novelty AUROC, false-alarm rate and calibration. If they match, keep the simplest.

### 87. Softmax, libraries, and where "importance" lives

**Softmax is a small function, not a library or a valuation method:** it turns raw scores into percentages that add to 100% (a vote-share converter). Scores (2, 1, 0): e^2 = 7.39, e^1 = 2.72, e^0 = 1, sum 11.11, result (0.665, 0.245, 0.090). Weakness: it always adds up to 100%, so (10, 10, 10) and (0, 0, 0) both become (1/3, 1/3, 1/3); it cannot tell "lots of evidence, evenly split" from "no evidence". EDL replaces it with non-negative evidence outputs so that "no evidence" can exist.

| Where softmax appears | Role |
|---|---|
| Inside a normal classifier (LightGBM, MLP) | turns scores into class probabilities |
| As a cheap baseline viewer | the max probability becomes a novelty score (recipe 3, Section 60) |
| In EDL | replaced by evidence outputs |
| At the end of the PPO policy network | turns action scores into action probabilities (same function, different job) |

**DS never uses softmax.** DS only multiplies and intersects masses. Softmax lives inside some viewers; it takes no part in the fusion or the trust. Libraries (PyTorch `torch.softmax`, SciPy `scipy.special.softmax`) only compute it.

**Three separate steps (clearing the confusion about "importance"):**
```
Step 1: each viewer makes its claim (masses)       <- libraries and models work here
Step 2: each claim is discounted by trust alpha     <- importance lives here
Step 3: DS multiplies and intersects (the grid)     <- fusion; it has no notion of importance
```
Step 2 example: the MMPP says {D,S,U} 0.8, Omega 0.2; with trust alpha = 0.9: {D,S,U} = 0.9 x 0.8 = 0.72, Omega = 1 - 0.9 + 0.9 x 0.2 = 0.28 (sum 1.00). If the conversion recipe already contains a reliability rho, that is the trust; do not apply it twice.

| Where | What | Tools |
|---|---|---|
| Inside a viewer (step 1) | train it, produce scores and probabilities | PyTorch (EDL, GRU), LightGBM or scikit-learn (classifiers), NumPy and SciPy for MMPP fitting (custom code expected; a ready library was not verified) |
| Ready-made novelty scores (extra viewers) | produce a "how unfamiliar" score | pytorch-ood (detectors such as EnergyBased, MaxSoftmax, Mahalanobis, KNN, MC dropout); each score still needs a conversion recipe to masses |
| Setting trust numbers (step 2) | measure reliability per viewer | scikit-learn `brier_score_loss`, `calibration_curve`, `roc_auc_score`, `CalibratedClassifierCV` (standard functions, not run here) |
| Fusion (step 3) | the grid | your own code (a few dozen lines) |

**Choosing the trust numbers (suggestion):** (1) measure each viewer on known validation data (accuracy, calibration, and on a separate tuning family how well it flags novelty); (2) turn the results into one alpha between 0 and 1 per viewer, tuned with the same budget for each; (3) never tune on the held-out attack, and check that the best value is not at the edge of the search grid; (4) trust may differ per protocol or environment, so check how it transfers.

### 88. The states (frame) of the system: option C chosen

**All viewers share one list of states, but each speaks at the resolution it can see** (a panel of witnesses describing the same suspects: one says only "tall or short", one says "I recognize him from the poster", one says "never seen him"). What a viewer cannot resolve goes on a group or on Omega, which is why DS handles groups.

| Viewer | What it can say about the shared states |
|---|---|
| EDL | evidence for each known state (normal and each known family); no output for U |
| GRU | only "normal" vs "not normal"; its claim sits on the group of all attack states plus U |
| MMPP | how well the window fits each known class, and "nothing fits", which points at U |
| DS result | masses over all states, groups and Omega |

| Option | States | For | Against |
|---|---|---|---|
| A: coarse | {Normal, Known attack, Unknown} | tiny and cheap; a new family never changes the frame | EDL and MMPP lose per-family detail; no family-specific response; weaker "no poster matches" signal |
| B: fine | Normal, DoS, DDoS, Mirai, Scan, ..., U (one per attack) | rich, family-specific responses | many rare classes (CICIoT2023 has 33 attacks and heavy imbalance), classes that overlap, more tuning |
| **C: middle (chosen by the user and Claude)** | **Normal + one state per attack category + U** | **enough detail for the viewers and for response, manageable size; each category shares a similar pattern** | needs a design choice on how to group the attacks |

**Decision (working, pending tests): option C.** For CICIoT2023 the 7 categories are, as far as I recall, DDoS, DoS, Recon, Web-based, Brute force, Spoofing and Mirai (verify), giving 9 states: Normal, those 7, and U. DS has up to 2^n groups (512 for 9 states), but in practice each viewer uses only a few (single states, the "abnormal" group, Omega), so the grid stays small. Option A can be run as a comparison arm in the offline test (Section 63), like F1 vs F2.

### 89. Upgrading the frame when a new attack appears

- **A new state is not added automatically.** The system never knows "this is a 0-day"; it only sees a lot of belief on U. A new wanted poster exists only once someone has studied the criminal.
- **Upgrade cycle (suggestion, not an established procedure):** (1) U gets high belief, the agent responds gently and the windows are saved; (2) a person or an analysis confirms it is a real new attack family (it could be harmless); (3) the saved windows are labeled as a new family X; (4) the label-trained viewers are extended (EDL gets a new output and is retrained; the MMPP gets a new class model); (5) the frame becomes version 2 (the old states plus X); (6) the policy is updated and the update is tested in shadow mode before release.
- **The GRU needs no change:** it was trained on normal traffic only and has no attack output. This is a real advantage of a normality model.
- **Cost of adding a state:** the belief vector grows, the EDL output size changes, and the PPO policy input changes; a changed shape forces retraining. In federated learning, a frame change in one home but not another breaks the weight averaging.
- **Two ways to soften it (suggestions):** (1) give the policy a fixed-size summary of the belief (total mass on Normal, on known attacks, on U, plus Omega and K), so adding a family does not change its input (price: family-specific actions are lost); (2) reserve spare "future family" slots with a presence flag, the same trick as the protocol-segment masks (Section 73), so the frame can grow without changing any shapes up to the reserved limit.
- **Link to the hidden-family test:** hiding a family from training simulates the situation before X is added; a later experiment can add it and measure how fast the system adapts (future work).

### 90. PPO recap (what works inside it)

- **PPO is the coach**: it decides how the policy gets updated after each experience ("do more of what worked better than expected, but do not change too much at once"). It is not the thing that decides.
- **What PPO trains** (standard PPO knowledge, to be covered properly in Session 2): the policy network (the actor) that picks the action, and a value network (the critic) that estimates how good the current situation is so PPO can tell whether an action did better than expected.

| Part | Job | Frozen? |
|---|---|---|
| Viewers (EDL, GRU-viewer, MMPP) | turn a window into a claim | yes |
| World model (GRU-wm + MMPP) | predicts and invents traffic for the model-based arm | yes (simplifying choice) |
| Belief module (DS, k, conversion rules) | builds the belief | rules fixed beforehand |
| Policy and value networks | decide and judge | no, PPO trains these |

- The policy network can be feed-forward or contain a GRU or LSTM for memory (arm B, `RecurrentPPO`). The GRU appears in three roles: GRU-wm, GRU-viewer, GRU-policy (Section 74).
- The agent sees the belief, the current window by protocol segment, its last action and context; it acts on the ladder (watch, rate-limit, temporary block, isolate and alert); it is scored by a reward that charges for missed attacks, for wrongly cut traffic and for heavy actions (acting pays off once the agent is more than about 70% sure in the example numbers, Section 78); it practices in an environment built from real data, because recorded traffic cannot react to actions.
- BF-PPO is ordinary PPO with a belief as input (Le and Stadler, CAGE-2), which is our pattern with DS as the belief (Section 75). MAPPO and IPPO come later for Paper 3.

### 91. Reference answers for pending checks (not answered by the user in the session)

- Panel check: replacing the GRU by LightGBM loses the normality-model type (the main source of U); LightGBM plus EDL are both label-trained and learn from the same labels and features, so they are correlated and not both needed in the core panel.
- Two-guards check: a new attack that fits no known poster but looks very odd is flagged by the normality model (Guard 2); the label-trained classifier (Guard 1) could only say "no match" or "I do not know".
- Mixed-case check (GRU says normal, EDL says no poster, MMPP says nothing fits): the disagreement matters more; the GRU's {N} contradicts the MMPP's {U}, so K rises; read K and Omega, not the U mass alone; respond gently.
- Frame-upgrade check: the GRU needs no retraining when a new family X is added because it is trained only on normal traffic and has no attack output; the EDL has one output per known class and is trained with labels, so a new family changes its output size and needs labeled examples (and the MMPP needs a new class model).
- DS check from the Omega discussion: viewer 1 Omega = 1 and viewer 2 {D} 0.5, Omega 0.5 give K = 0 and viewer 2 unchanged.

### 92. Open items, hypothesis flags and next steps

**Decisions recorded today (working, pending tests):**
1. Core viewer panel: EDL (known families), GRU residual (normality), MMPP (burst structure); other models as ablations (Section 84).
2. Frame: option C (Normal + one state per attack category + U), with option A as a possible comparison arm (Section 88).
3. Fusion: DS with Dempster and Yager both as arms; report K and the ignorance part separately before adding K to Omega.
4. Viewer layer vs fusion layer are compared within their own layer (Section 83).
5. Fuzzy only as an optional converter for number-output viewers (the GRU, scores); not for EDL.

**Open items:**
1. Define the category grouping for CICIoT2023 and verify the 7 categories.
2. Define how per-feature GRU errors are combined into one residual; whether ramp endpoints are per device or per protocol.
3. Measure the correlation between viewers on validation data (independence).
4. Verify how Yager extends to three or more sources (all at once, total K added to Omega once).
5. Add the learned-combiner baseline (for example logistic regression) and the percentile and logistic-calibration alternatives to fuzzy.
6. How to set each viewer's trust number and whether it transfers to other datasets or protocols.
7. Frame versioning: fixed-size belief summary vs spare slots; how federated averaging handles a frame change.
8. Verify: the DA-DCC-IDS precedent; scikit-learn and pytorch-ood function names (not run); the MMPP fitting library (custom code expected).
9. Hypothesis flags: the core panel, option C, the upgrade cycle, the learned-combiner arm and all conversion details are suggestions to test, not established methods.
10. Carry forward all open items from earlier sections, including Section 92's predecessors (Sections 66 and 80), Section 44 (the CICIoT2023 DS run) and the paused topics (cheap baselines and conformal prediction, Sections 28 and 29).

**Next steps:**
1. Continue Session 1, Step 6 (when does an episode end, and what does the agent do when the belief says "something new"), then Steps 7 and 8.
2. Code the belief module (viewers, recipes, DS fusion with both rules, temporal rule) and run the offline tests (F1 vs F2, option A vs C, fuzzy vs percentile vs logistic); the coding happens elsewhere using this md.

---

## UPDATE — 16 November 2026 (new sections only; everything above is unchanged)

Today: after the presentation, a recap of the PPO path, then clarifications on how the PPO arms are built and compared (axes, the G1 to G5 grid, what "belief in PPO" really means, which RNN, how the belief enters the policy, the model-based arm), then a deep-search novelty and venue check of the conference-paper idea, and what it changes in the plan. Sections 81 to 92 (12 November) stay as they are. Items marked (suggestion) are mine, not decisions. Items marked (verify) have not been checked against sources. Items marked (deep-search report) come from the report the user pasted from another AI model and were not verified by me; open every DOI and link before citing.

### 93. Recap: the PPO path so far

**Picture:** the agent is a guard in a POMDP. It cannot see the true state, so it keeps a belief (the notebook), reads the belief plus a few extras each step, picks a rung on an action ladder and receives a reward score. PPO is the coach that improves the guard's decision rule during practice. Practice happens in a simulated environment built from real data.

| Session 1 step | Where we landed |
|---|---|
| 1. What is a POMDP | state hidden, observation = clue, belief = running guess, action = what it does; the agent acts on its belief |
| 2. One step in time | window W and step Delta; start with Delta = W (no overlap) and sweep 1, 2, 5, 10 s; define memory in seconds and derive the keep factor k |
| 3. What it sees | belief block, current window by protocol segment (presence masks), last action, context |
| 4. What it can do | ladder: wait, rate-limit, temporary block, isolate and alert a human; start with "pick a rung" and mask rung 3 until rung 2; test "step up or down" as an arm |
| 5. Reward | penalty for missed attack traffic, for legitimate traffic cut, and for heavy actions; the cost ratio sets how sure the agent must be before acting (about 70% in the example numbers) |
| 6, 7, 8 | still to do: episode end and the U response; sanity checks (random, rule-based, oracle policies); one-page design document |

**PPO-specific points:** PPO is the training method, not the decider; it trains in an environment, not directly on recorded data (recorded traffic cannot react to actions); it runs during training and upgrades, not in the live loop; use a library (Stable-Baselines3 PPO, sb3-contrib RecurrentPPO with an LSTM policy, MaskablePPO; CleanRL only to read and understand; multi-agent libraries only for Paper 3).

| Part | Role | Trained by | Frozen? |
|---|---|---|---|
| Policy network (actor) | picks the action | PPO | No |
| Value network (critic) | judges how good the situation is | PPO | No |
| GRU-policy (optional) | memory inside the policy | PPO | No |
| Viewers (EDL, GRU-viewer, MMPP) | produce claims | trained beforehand | Yes |
| World model (GRU-world-model + MMPP) | invents traffic for the model-based arm | trained beforehand | Yes (simplifying choice) |
| Belief module (DS, k, conversion rules) | builds the belief | fixed rules, tuned separately | Yes |

**Suggested simulation order (to adjust):** (1) build the environment (replay or simulator traffic, action effects, reward); (2) sanity checks with a random policy, a hand-written rule policy and an oracle that sees the true state; (3) plain PPO; (4) add the belief, then recurrence; (5) the model-based arm and DQN; (6) sweeps (Delta, reward weights, action effects, held-out families).

### 94. Choice axes, "arms", and the G1 to G5 grid

**Picture:** designing one guard from independent decisions. An arm is one experimental setup (one option from each axis); arms are run and compared. An arm is neither a component inside one PPO nor a category chosen once. Some options stack (belief plus recurrent plus a mask in one agent); some are alternatives (feed-forward or recurrent, PPO or DQN).

| Axis | Options | Plain meaning |
|---|---|---|
| Learning method | PPO or DQN | how the coach trains him |
| What is on his desk (input) | window only, or window plus the belief | what he sees |
| His memory | feed-forward or recurrent (GRU/LSTM) | what his brain is made of |
| Where he practices | real or simulated traffic only, or also imagined traffic | model-free or model-based |
| Rules of the job | no mask or an action mask | which actions are allowed |
| Team size | one agent or several (IPPO, MAPPO) | Papers 2 and 3 |

**Belief PPO vs normal PPO:** the PPO algorithm is identical; only the input is wider (belief block added) and the environment must compute the belief at every step. Recurrent PPO (memory of the past) and model-based PPO (imagination of the future) are independent, giving a 2x2 grid; they are not the same thing.

**The grid (the user's three arms plus the missing baseline):**

| | No belief | With belief |
|---|---|---|
| Feed-forward policy | G1 (the missing baseline: window features and last action only, the "pretend it is an MDP" arm) | G3 |
| Recurrent policy | G2 | G4 |

G1 is the old arm A and G2 the old arm B. The old arms C (GRU residual as an input to plain PPO), D (model-based practice) and E (DQN) stay as extras after the core grid.

**What each comparison answers:**

| Compare | Isolates | Question |
|---|---|---|
| G1 vs G2 | memory, no belief | does a recurrent brain help when there is no notebook? |
| G1 vs G3 | belief, no memory | does the DS notebook help a policy without memory? |
| G2 vs G4 | belief, memory fixed | does the belief add anything on top of a recurrent brain? |
| G3 vs G4 | memory, belief fixed | does recurrence add anything on top of the belief? |

Hypothesis (to test): memory helps a lot without the belief and much less with it, because the belief already carries memory. If G4 is about G3 is about G2, a simpler agent is enough, and that is a valid result.

**G5, the control (suggestion):** same viewers as G3, but their raw outputs are stacked as policy input with no DS fusion. G3 vs G5 tests whether DS fusion itself helps; G1 vs G5 tests whether the extra pretrained viewer outputs help at all. Without G5 the claim "the belief helps" is confounded (the gain may come from pretrained features, not from fusion). **G6 (suggestion):** G5 plus a recurrent policy, to complete the factorial.

| Arm | Policy input beyond window features and last action |
|---|---|
| G1 | nothing |
| G5 | the viewers' raw outputs stacked (EDL (b, u), GRU residual, MMPP fits); no DS fusion, no K, no memory rule |
| G3 | the fused DS belief |

**Fairness rules:** the POMDP (environment, reward, ladder, step size, episode rules) is identical in every arm and frozen before comparing, never adjusted to favor one arm; identical raw information, training budget and tuning budget; several seeds with mean and spread; held-out attack families and real data for evaluation. The belief arms receive the belief plus the raw window features by default; "belief only" can be an ablation.

**Check answers:** the two comparisons isolating the belief with memory held fixed are G1 vs G3 and G2 vs G4; G3 vs G5 tests DS fusion itself; G1 vs G5 tests the extra pretrained viewers.

### 95. What "belief in PPO" means (clarified after confusion)

**Direct answer: there is no belief model inside PPO.** PPO contains only a policy network and a value network. The belief is computed outside PPO by the viewers and DS fusion and handed to the policy as extra input numbers. The policy learns how to react to those numbers.

**Picture (manager and morning report):** a shop manager decides each morning (do nothing, call a technician, close a machine). The viewers are three specialists who inspect the shop; DS is the committee that merges their notes into one summary sheet (the belief); the policy is the manager who reads the sheet; PPO is his boss giving feedback after each decision. The boss trains the manager; the boss does not write the sheet or change how the committee works.

**One step with numbers (illustrative):** EDL says "no known attack matches", the GRU says "traffic is odd", the MMPP says "nothing I know explains the timing". DS merges them into Normal 0.15, Known attack 0.20, U 0.45, Omega 0.20, K = 0.05. These go into the policy with the raw window features and the last action. The policy outputs wait 0.10, rate-limit 0.60, block 0.25, isolate 0.05 and picks rate-limit; a reward arrives and PPO nudges the policy weights. The policy has learned a rule like "much mass on U and some Omega means take the cheap, reversible step".

| Changed by PPO | Never changed by PPO |
|---|---|
| the policy's weights | the viewers |
| the value network's weights | the DS rules and the memory rule |

**The three managers:** G1 receives only raw traffic numbers (no specialists); G5 receives three separate notes and must combine them in its own head (learned); G3 receives one merged sheet from the committee.

**Three different things share the word "belief":**

| # | What | Where | Made by |
|---|---|---|---|
| 1 | the theoretical POMDP belief (the ideal distribution over the hidden state given all history) | math on paper | not computed exactly in practice |
| 2 | our DS belief module (masses from frozen viewers, fusion, carry-forward rule) | the agent's perception, outside PPO | hand-designed and tuned beforehand |
| 3 | the recurrent hidden state | inside the policy | learned by PPO (implicit, unreadable) |

G3: PPO has no belief model of its own; it reads the DS numbers. G2: the only belief-like object is the hidden state. G4: both exist and are different objects. The POMDP environment has no belief at all (it holds the true hidden state, which the simulator knows and never gives to the agent). Rules: the belief module may read only observations (windows), never the true state (only the oracle baseline reads it); the identical belief code must run in training and deployment.

**The worry "PPO learns once, offline, so it is bad practice":** offline training fixes the policy's weights (its habits), not the beliefs or inputs. At every live step the frozen viewers run on the new window, the DS belief updates, and a recurrent policy's hidden state changes; the manager reads a fresh report every morning. G5 is therefore not bad practice (feeding pretrained features to a policy is a common design); its job here is to be the control.

**Why the viewers and DS module are frozen during PPO training:** if the committee changed its report format while the manager was learning, the same numbers would mean different things from week to week and the policy could never settle on a rule (the policy chases a moving input). Check answer: in G5 the policy network itself does the merging (it must learn the combination), so G3 vs G5 measures whether the hand-designed DS fusion helps beyond letting the policy learn the combination.

**"If PPO does not change the belief models, did we do nothing?"** No: PPO learns to use the belief (altimeter picture: the pilot does not rebuild the altimeter in flight but learns to fly with its readings). Whether the dashboard helps is exactly what G1 vs G3 measures; if G1 matches, the belief adds nothing, and that is a valid result. Training everything jointly is possible but harder to control; keep it as a later option.

### 96. Which RNN, how the belief enters the policy, which viewers

**LSTM or GRU for the recurrent policy (suggestion):**

| | LSTM | GRU |
|---|---|---|
| Parameters at the same size | 4 weight blocks | 3 weight blocks (about 25% fewer; general knowledge, not tested) |
| Typical quality | usually comparable | usually comparable |
| Library support | sb3-contrib `RecurrentPPO` is PPO with an LSTM policy ("MlpLstmPolicy") | not seen in that library; custom code, or adapt CleanRL's `ppo_atari_lstm.py` (verify) |
| Fit for a hub | heavier | lighter |

Plan: start with the LSTM (library-supported, defensible as a standard implementation), run a GRU as a small ablation of G2 and G4 (hub-cost argument), skip Transformers and state-space models (heavy, episodes are short). Hidden size 32 to 128 as a first range to tune. Practical details of recurrent PPO: pass the saved state and an episode-start flag to `predict()` so the hidden state resets at episode boundaries; training batches keep steps in order inside an episode. The GRU inside the policy (GRU-policy) is a different network from the viewer GRU and the world-model GRU; name them separately.

**Belief block options (what the policy receives):**

| Option | Contents | Size | Notes |
|---|---|---|---|
| Full mass vector | masses on Normal + 7 categories + U (9), the "abnormal" group, Omega, K | 12 | suggested; keeps groups and conflict |
| Pignistic summary | 9 decision probabilities, Omega, K | 11 | loses group information |
| Fixed-size summary | mass on Normal, on known attacks (total), on U, Omega, K | 5 | unchanged when a new family is added |
| Full vector plus each viewer's own masses | the full vector plus every viewer's claim | grows with viewers | see below |

```
[ belief block, 12 numbers ]   masses on Normal + 7 categories + U (9),
                               the "abnormal" group, Omega, K
[ window block ]               traffic features by protocol segment, presence masks
[ last-action block ]          which rung, and how long ago
[ context block ]              device type and so on
```
Actor and critic read the same observation in the standard setup. Memory placement: in G3 the memory is only in the belief's fading rule; in G4 memory exists in two places (belief and RNN), so G4 is expected to gain little over G3 (hypothesis).

**Three viewers in the policy: two ways.** Fused first (the main design): one DS belief block, fixed size however many viewers, adding a viewer changes no shape, the policy cannot re-weight viewers itself. Raw viewers stacked (G5): the network learns its own weighting, the size grows with the viewers, and the input breaks if a viewer is swapped.

### 97. The model-based arm: world model vs viewer

- "Model-based PPO" and "MBRL" are the same arm. The viewer GRU and the world-model GRU have different jobs:

| | GRU-viewer | GRU-world-model |
|---|---|---|
| Trained on | normal traffic only | traffic including attacks |
| Inputs | past windows | past windows plus the action taken |
| Output | forecast used as a residual signal | next window after the action, used to invent episodes |
| Why | tells "is this normal" | the agent must learn "what happens if I throttle" |

The world model needs the action as an input and attack traffic in training, so it cannot be the viewer GRU reused as it is; they may share an architecture or starting weights, but keep them as separate networks, trained before PPO and then frozen.
- **Limit:** CICIoT2023 is a passive recording (no defender ever throttled or blocked anything), so the real effect of an action cannot be learned from it. Action effects are hand-written assumptions (for example "a rate-limit halves the rate"); a world model trained on a simulator with those effects only learns the assumptions back. What it can learn from real data is the traffic dynamics (burst patterns). This is another reason the model-based arm may not pay off, and why the old arm C (GRU residual as a feature, no imagination) is the important ablation.
- The MMPP can serve both as a scorer and as a generator, but sharing it creates circularity (imagined traffic always looks natural to a viewer built from the same model); give imagined traffic its own generator where possible.
- **Check answers:** (a) the GRU inside the policy is on the memory axis, (b) the GRU that invents traffic is on the "where he practices" axis, (c) the belief block is on the "what is on his desk" axis. A world model needs (1) the action as an input and (2) training on traffic that includes attacks; the action effect cannot be learned from CICIoT2023 because the recording is passive.

### 98. The conference-paper idea and the deep-search prompt

**Idea:** a controlled comparative study (mathematical and simulated) of PPO agents (G1 to G5) in an IoT-defense POMDP, with a Dempster-Shafer (Dempster and Yager) fused belief from several frozen viewers, an explicit unknown-attack state, Omega and K, a graded action ladder, and held-out-family evaluation on CICIoT2023 (plus cross-dataset tests); metrics: novelty AUROC, false-alarm rate at a fixed detection rate, known-class accuracy, cost.

**Prompt sent to the deep-search model (condensed record):** role = critical novelty and venue checker, never invent citations, state read level (full text, abstract, snippet) for every paper. Questions: (1) prior controlled comparisons of recurrent vs belief-input PPO in cyber-defense POMDPs, plus the general POMDP-RL literature (for example Ni et al., ICML 2022); (2) Dempster-Shafer, Yager, subjective logic or evidential deep learning used as an RL belief or observation, including "evidential POMDP" and "belief function POMDP"; (3) explicit unknown or novel-attack state plus RL response policy (BF-PPO, Hammar and Stadler, Q-BIRD, FedAtten-DRL, Siamese+PPO, IoTHaven, CyDER 2.0, DQN-IDS, DeepStage, H-MARL); (4) graded response ladders learned by RL; (5) whether the stacked-viewers-vs-fused-belief control (G5 vs G3) is a known design; (6) a novelty verdict split into comparison design, evidential belief, and evaluation protocol. Search protocol: IEEE Xplore, ACM DL, Scopus, Web of Science, arXiv, Semantic Scholar, Google Scholar, DBLP; 2018 to 2026; boolean combinations of POMDP, PPO, recurrent, belief, Dempster-Shafer, evidential, intrusion, IoT, zero-day; snowballing; list the exact queries. Output: table of the 15 closest papers, verdicts with evidence and "do not claim" list, at least 8 reviewer attacks, differentiators and a minimal extra-experiment list, 6 target venues with deadlines (flag unverified), and the least-sure claims.

### 99. Deep-search results (report pasted by the user; not verified by me)

**Bottom line (deep-search report):** in its current framing the paper is borderline for a workshop or a second-tier conference. The controlled comparison has been partly done in cyber defense; held-out families on CICIoT2023 have been published; the one defensible contribution is the specific combination: a Dempster/Yager-fused, multi-viewer evidential belief with an explicit unknown-attack state, ignorance mass Omega and conflict K, fed to a PPO response policy for IoT. Publishable only if framed as "does evidential fusion add value beyond memory and beyond its raw inputs, and when?", with a closed-loop environment and a non-RL threshold baseline.

**Search coverage (the report's own honesty statement):** 15 successful general web searches (arXiv, IEEE, ACM, Springer, Elsevier, MDPI, Semantic Scholar pages) plus one sub-agent for venue CFPs; no access to IEEE Xplore advanced search, Scopus, Web of Science, Google Scholar or DBLP query interfaces; three searches failed; the stopping rule was not reached. Every "not found" means "not found in a limited search". Under-searched: subjective-logic-state RL, "evidential POMDP" as a formal term, leave-one-family-out on CICIoT2023.

**Verdicts:**
- (a) Comparison design: low to moderate novelty. Q-BIRD already compares PPO without belief, PPO-LSTM, DRQN and PPO with Bayesian belief; Believer (ICML 2023), a 2024 railway-maintenance Machine Learning paper and Ni et al. (ICML 2022) do belief vs recurrent in general RL. Possibly new: the full factorial including G4 and the G5 control, and the interaction effect (does belief help only without memory?). Enough for a workshop, not alone for a main-track security conference.
- (b) Evidential belief for POMDP RL in IoT defense: moderate novelty, the best card, but no "first". Close neighbours: SHIELD (evidential vacuity driving intrusion detection and escalation) and a vehicular reputation paper using DS-combined evidence as a DRL state.
- (c) Evaluation protocol: low novelty, high validity risk. Held-out classes on CIC-IoT-2023 (OpenTriIDS), family-held-out RL zero-day (DQN-IDS), cross-dataset zero-day with PPO (Siamese+PPO). The critical flaw: CICIoT2023 is a static flow dataset, so response actions do not change future observations unless a simulator is built; without one the "POMDP" is a contextual bandit or detection problem and the memory-vs-belief question loses its meaning. Expect this to be the main reviewer attack (this matches our Session 1 priority: the environment comes first).

**The 15 closest papers (condensed; all from the report; verify):**

| # | Paper | Relevance | Gap versus this plan |
|---|---|---|---|
| 1 | Q-BIRD, Shah et al., arXiv 2606.07796 (2026 preprint) | PPO with belief over attacker intent; baselines no belief, PPO-LSTM, DRQN, Bayesian belief; 10 seeds; graded actions; cost-aware | no recurrent+belief arm (the report read only part of the paper), no G5, no evidential fusion, no Omega or K, V2X not dataset zero-day |
| 2 | DeepStage, Phan et al., arXiv 2603.16969 (2026) | LSTM stage estimator and LSTM belief encoder feeding hierarchical PPO (a G4-type agent); APT | no ablation grid, not IoT, no DS |
| 3 | BF-PPO, Le and Stadler, CNSM 2025 (arXiv 2509.06539) | PPO plus particle-filter belief on CAGE-2 (G3-type) | exact model, no memory comparison, not IoT, no unknown class |
| 4 | Hammar and Stadler, Intrusion Prevention through Optimal Stopping, IEEE TNSM 2022 | Bayesian belief, threshold structure | binary intrusion state, theory-driven |
| 5 | Hammar and Stadler, Learning Near-Optimal Intrusion Responses Against Dynamic Attackers, IEEE TNSM 2023 | game-theoretic belief | rigorous POMDP standard reviewers will cite |
| 6 | Ni, Eysenbach, Salakhutdinov, ICML 2022 (PMLR 162) | recurrent model-free RL matches specialized methods on 18 of 21 environments | sets the bar for G2 (careful tuning) |
| 7 | Believer, ICML 2023 (PMLR 202) | learned belief vs recurrent PPO baseline | general POMDP |
| 8 | Railway maintenance, Machine Learning (Springer) 2024 | belief-input beat LSTM and Transformer agents | general precedent for G2 vs G3 |
| 9 | SHIELD, Wasif et al., USENIX VehicleSec 2026 | evidential vacuity drives trust, intrusion detection and human escalation; over 80% compromised agents detected at under 15% false positives | no DS fusion of several viewers, not IoT traffic; its RL role not confirmed |
| 10 | DRL dynamic reputation policy in 5G vehicular networks (IEEE Xplore 9428520) | DS-combined feedback as the DRL state | venue and year not confirmed |
| 11 | IoTHaven, Alam, Rahman, Wang (2024) | POMDP with DRQN in trigger-action IoT (G2-type) | no belief comparison; venue not verified |
| 12 | Siamese+PPO zero-day IDS, ICT Express 12:752-757, 2026 (arXiv 2609.26115) | cross-dataset zero-day, PPO/DQN/SAC | no POMDP belief, no memory ablation |
| 13 | DQN-IDS, Alkasassbeh et al. (IEEE Xplore 11192261, about Jan 2025) | whole ransomware families held out (UGRansome) | precedent for family-held-out RL evaluation |
| 14 | H-MARL on CAGE-4, AAMAS 2025 | field standard is a simulator closed loop | not IoT |
| 15 | OpenTriIDS, Sensors 26(20):6369, 2026 | held-out classes on Edge-IIoTset and CIC-IoT-2023 | no RL; precedent for the protocol |

**Graded response ladders already exist (do not claim novelty):** Q-BIRD (monitor, alert, throttle, isolate), FedTrans-AgriIDS (Springer Discover AI 2026, MAPPO; five rungs almost identical to this ladder), an SDN-IoT two-timescale RL paper with LLM governance (arXiv 2604.01127), DeepEdgeIDS (arXiv 2511.18240), DeepStage, DeepAir (IEEE TNSM 2022), CAGE action spaces.

**G5 vs G3:** concatenation vs DS fusion comparisons are standard in supervised multimodal learning (for example a KAIS 2024 EDL/DS late-fusion paper); not found in RL security. Present G5 as rigor, not novelty.

**Claims NOT to make:** first PPO/DRL agent for POMDP-based IoT or network defense; first comparison of recurrent vs belief-input PPO in cyber defense; first to show recurrent model-free RL is a strong POMDP baseline; first belief-state PPO for cyber defense; first learned graded response actions; first use of Dempster-Shafer in intrusion detection; first evidential or subjective-logic uncertainty driving RL security response; first family-held-out or open-set evaluation on CICIoT2023; first RL zero-day IoT defense with cross-dataset tests. **Safer wording (still hedged):** "to our knowledge, the first controlled study of whether Dempster-Shafer-fused evidential beliefs with explicit ignorance and conflict add value over memory and over unfused inputs for PPO-based IoT response".

**Likely reviewer attacks (12):** (1) not a POMDP, actions do not affect observations (static replay); (2) the memory-vs-belief comparison is already done (Q-BIRD, railway paper, Believer); (3) the recurrent baseline is under-tuned (Ni et al.; equal tuning budget and context-length sweeps); (4) why DS and not a Bayesian or particle-filter belief (and Dempster's rule under high conflict is counter-intuitive); (5) gains come from extra pretrained features, not fusion (G5 helps, plus "G5 + memory" and "EDL alone" arms); (6) the unknown-attack signal is just an OOD detector and RL adds nothing (must beat a non-RL threshold policy on m(U), Omega, K); (7) graded response is not new; (8) the zero-day protocol is standard and held-out variants may be near-duplicates (held-out families must be semantically distinct); (9) the cost function is arbitrary (sensitivity analysis); (10) statistical rigor (Q-BIRD used 10 seeds by 80 test episodes); (11) frozen viewers leak test information if trained on overlapping data; (12) cross-dataset feature mismatch.

**Differentiators to emphasize:** the interaction effect (does belief help only without memory?); an uncertainty decomposition the policy can use (Omega vs K vs m(U)) with causal ablations that zero Omega or K at test time; Dempster vs Yager under conflict (Yager should give more conservative actions on novel traffic).

**Minimal extra experiments:** (1) a closed-loop environment where actions modify subsequent flows, parameterized from CICIoT2023 statistics (otherwise drop the "POMDP" framing); (2) a non-RL threshold baseline on m(U), Omega and K mapped to the ladder; (3) a Bayesian-fusion arm (product of experts or a calibrated ensemble) and a learned-fusion arm (small MLP over viewer outputs); (4) G6 (stacked raw outputs into an LSTM policy); (5) an oracle-belief upper bound and an asymmetric-critic variant; (6) equal-budget hyperparameter search for all arms, at least 10 seeds, interquartile-mean and bootstrap confidence intervals; (7) a leave-one-family-out rotation over all CICIoT2023 families plus one cross-dataset test with a documented feature mapping (CIC IoT-DIAD 2024 or Edge-IIoTset); (8) binary-block vs ladder ablation; (9) action-cost sensitivity sweep; (10) calibration of Omega (does it rise on held-out families?), with reliability diagrams for the EDL viewer.

**Target venues (deadlines per the report, unverified by me; today is 16 November 2026):**

| Venue | Fit | Deadline per report | Status |
|---|---|---|---|
| IEEE/IFIP NOMS 2027 (Montreal, 10 to 14 May 2027) | network management, RL for security | 30 Nov 2026 per the official homepage (aggregators still list 9 Nov, already passed) | confirm on the official CFP; page limits secondhand (8 pp full, up to 12) |
| IEEE WoWMoM 2027 (Irvine, 21 to 24 Jun 2027) | IoT, wireless security | 1 Dec 2026 | secondhand; official page unverified |
| IEEE EuroS&P 2027 workshops | security workshops | per-workshop, about late Feb or early Mar 2027 | exact dates not yet published |
| ACM AISec (CCS workshop) | best thematic fit (ML and security) | 2027 date unverified (2026 edition was 24 Jul 2026) | expect mid-2027 |
| IFIP/IEEE CNSM | venue of BF-PPO and Hammar and Stadler work | 2027 unverified (2026 edition was 29 Jun 2026) | expect mid-2027 |
| IEEE CNS | network security | 2027 unverified | |

My assessment (suggestion): the closed-loop environment is not built yet (Session 1 is unfinished), so a 30 Nov 2026 or 1 Dec 2026 deadline is not realistic; AISec 2027 or CNSM 2027 (audiences that understand POMDP framing) give time to run the extra experiments. The report itself conditions NOMS or WoWMoM on the simulator being ready within about two weeks.

**Least-sure claims in the report (its own list):** that Q-BIRD has no recurrent+belief arm (partial read); that BF-PPO has no recurrent component (abstract and intro only); the NOMS 2027 deadline; SHIELD's RL role; the vehicular DS+DRL paper's venue and year; Siamese+PPO dataset names; venue and year of DQN-IDS, FedAtten-DRL and IoTHaven; that no "evidential POMDP" or subjective-logic-state RL paper exists (the relevant query failed); that the railway paper's "belief-input wins" generalizes; WoWMoM and WiSec dates.

**Corrections to earlier notes from the report:**
1. **CyDER 2.0 is a cyber-range simulator, not a defense algorithm.** In the cited multi-agent framework (Scientific Reports 2026, s41598-026-45937-9) the attackers use DQN and the defenders use anomaly detection plus rules. Earlier tables (Section 1 novelty check and the closest-ten table) listed it as "RL + anomaly detection, defender framed as a POMDP"; do not cite it as an RL defender (verify).
2. BF-PPO is confirmed as Le and Stadler, CNSM 2025 (arXiv 2509.06539), consistent with Section 75.
3. FedAtten-DRL is RL used as a detector (classification as RL), not a responder.
4. Q-BIRD is a 2026 preprint; peer-reviewed venue not verified.

### 100. What changes in the plan

1. **Reframe the paper question:** "does evidential fusion add value beyond memory and beyond its raw inputs, and when?", including the interaction effect (G2 vs G4, G1 vs G3).
2. **The closed-loop environment is mandatory** (actions must modify subsequent traffic); it was already the top priority of Session 1 and now also decides whether the conference paper exists. Parameterize it from CICIoT2023 statistics and document the action-effect assumptions.
3. **Extend the arm list:** G1 to G5 plus G6; the old extras (GRU-residual feature, model-based, DQN); a non-RL threshold baseline on m(U), Omega, K; Bayesian-fusion and learned-fusion arms; oracle-belief upper bound; optional asymmetric critic; binary-block vs ladder; cost sensitivity.
4. **Rigor:** equal tuning budget with a strong G2 (context-length and architecture sweeps), at least 10 seeds, bootstrap intervals, leave-one-family-out rotation with semantically distinct families, viewers trained without the held-out families, a cross-dataset test with a documented feature mapping.
5. **Mechanism tests:** zero Omega or K at test time; Dempster vs Yager.
6. **Claims discipline:** use the safer wording above; no "first" claims.
7. **Run the real database sweep** (Scopus, IEEE Xplore, ACM, Web of Science), especially "evidential POMDP", belief-function or subjective-logic states in RL, and leave-one-family-out on CICIoT2023; open and verify every DOI and link in Section 99.

### 101. Open items and next steps

**Open items:**
1. Session 1 Steps 6, 7, 8 (episode end and the U response; sanity-check baselines; one-page design document).
2. Decisions from Section 68 (window, action list, reward weights, U response, episode length); the environment's action-effect numbers, device-selection rule and per-protocol mapping.
3. Questions still open to the user: RL background; window and overlap in the CICIoT2023 run (and whether windows are time-ordered per device); which actions a real hub or operator can take; the user's CICIoT2023 DS run details (Section 44).
4. Verify: every paper, link and deadline in Section 99; the "recurrent is strong" and "belief wins" claims (general POMDP RL); GRU-vs-LSTM parameter claims; library behavior with a custom belief input.
5. Decide whether the conference paper is planned for AISec 2027 or CNSM 2027, or a workshop first; talk to the supervisor before committing to a deadline.
6. A note the user started to add at the end of the message ("note that:") was not received; add it here when provided.
7. Paused from before: cheap baselines and conformal prediction (Sections 28 and 29).
8. Carry forward all open items from earlier sections, including Sections 66, 80 and 92.

for conference paper idea:
# Novelty and Venue Check: Belief-Input vs Recurrent PPO with Evidential (Dempster–Shafer) Beliefs for IoT Defense

**Bottom line: in its current framing, the paper is a borderline workshop or second-tier conference paper.** Its controlled 2×2+1 comparison has already been partly done in cyber defense: a 2026 V2X preprint (Q-BIRD) compares PPO without belief, PPO-LSTM, DRQN and PPO with a Bayesian belief. The idea of using CICIoT2023 with held-out attack families to simulate zero-days has also been published. The one contribution that still looks defensible is the specific one: a Dempster–Shafer/Yager-fused, multi-viewer evidential belief, with an explicit unknown-attack state, ignorance mass Ω and conflict K, fed to a PPO response policy for IoT. Even that has close neighbours: evidential (Dirichlet) uncertainty already drives intrusion response and escalation in a 2026 USENIX VehicleSec paper (SHIELD), and Dempster–Shafer-fused evidence has been used as a DRL state in vehicular reputation management. The paper is publishable only if it is framed as "does evidential fusion add value beyond memory and beyond its raw inputs, and when?". It also needs a closed-loop environment and a non-RL threshold baseline.

## TL;DR
- **(a) The comparison design is not novel as a concept.** Recurrent-vs-belief-input studies exist in general POMDP RL (Ni et al., ICML 2022; the "Believer" paper, ICML 2023; a 2024 *Machine Learning* journal paper on railway maintenance) and in cyber defense (Q-BIRD 2026, DeepStage 2026, BF-PPO at CNSM 2025). The only plausibly new elements are the full factorial including G4 (recurrent + belief) and the G5 "stacked raw viewer outputs" control. I found no RL-for-security paper with a G5-style control, but my search was not exhaustive.
- **(b) The evidential belief for POMDP RL in IoT defense is the strongest novelty claim, but you cannot say "first".** I found no paper that feeds Dempster/Yager-combined mass functions with an explicit unknown-attack hypothesis, Ω and K into a PPO response policy on IoT traffic. Two close precedents exist. SHIELD (Wasif et al., USENIX VehicleSec 2026) uses evidential vacuity to drive intrusion detection and human escalation. "Deep Reinforcement Learning Based Dynamic Reputation Policy in 5G Based Vehicular Communication Networks" (IEEE) uses DS-combined evidence as a DRL state.
- **(c) The evaluation protocol is not novel, and it carries a serious validity risk.** Held-out-class open-set evaluation on CIC-IoT-2023 (OpenTriIDS, *Sensors* 2026), family-held-out zero-day RL-IDS evaluation (the DQN-IDS on UGRansome) and cross-dataset zero-day RL (Siamese+PPO) all exist. The bigger problem is that CICIoT2023 is a static flow dataset, so response actions cannot change future observations unless you build a simulator. Expect this to be the main reviewer attack.

## Key Findings

### What the search actually covered (honesty statement)
- **The full requested protocol was not executed.**
  - I had no access to IEEE Xplore advanced search, Scopus or Web of Science boolean interfaces, Google Scholar or DBLP query interfaces.
  - I ran 15 successful web searches over general web indexes covering arXiv, IEEE, ACM, Springer, Elsevier, MDPI and Semantic Scholar pages. Three more searches failed because the tool budget ran out.
  - One research sub-agent ran separately and verified venue CFPs.
  - Snowballing was partial: I read references only inside the pages I opened. The stopping rule ("two consecutive rounds with no new relevant paper") was **not** reached; new relevant papers were still appearing in the last rounds.
- **Treat every "no prior work found" statement below as "not found in a limited search", not as proof of absence.**
- **Exact queries executed (successful):**
  1. `Le Stadler belief-free PPO CAGE-2 partially observable cyber defense`
  2. `Recurrent Model-Free RL Can Be a Strong Baseline for Many POMDPs Ni ICML 2022`
  3. `Hammar Stadler intrusion prevention POMDP optimal stopping`
  4. `Dempster-Shafer belief state reinforcement learning intrusion response`
  5. `evidential deep learning reinforcement learning uncertainty subjective logic policy`
  6. `"belief function" POMDP evidential Dempster-Shafer partially observable`
  7. `evidential deep learning intrusion detection unknown attacks open-set CICIoT2023`
  8. `Q-BIRD V2X intrusion response reinforcement learning zero-day`
  9. `IoTHaven reinforcement learning IoT defense`
  10. `FedAtten-DRL federated attention deep reinforcement learning intrusion`
  11. `CyDER 2.0 cyber defense reinforcement learning`
  12. `DeepStage APT stage reinforcement learning defense`
  13. `hierarchical multi-agent reinforcement learning CAGE-4 cyber network defense`
  14. `belief state input vs recurrent policy model-free RL comparison partially observable`
  15. `reinforcement learning IoT SDN mitigation rate limiting quarantine isolate graded response actions`
  16. `Dempster-Shafer fusion state representation deep reinforcement learning agent`
  17. `"evidential" reinforcement learning intrusion response uncertainty unknown attack policy`
  18. `DeepAir deep reinforcement learning adaptive intrusion response software-defined networks Phan Bauschert`
- **Queries that failed (budget exhausted, no results):**
  - `subjective logic opinion state reinforcement learning agent uncertainty-aware decision POMDP`
  - `CICIoT2023 leave-one-attack-family-out zero-day evaluation`
  - `IEEE NOMS 2027 call for papers deadline`
- **Coverage gaps:** subjective-logic-state RL, "evidential POMDP" as a formal term, and leave-one-family-out on CICIoT2023 specifically were **under-searched**. Run these yourself on Scopus/IEEE Xplore before submission.

### Verification of the works you named
- **Ni, Eysenbach, Salakhutdinov — VERIFIED.**
  - Title: "Recurrent Model-Free RL Can Be a Strong Baseline for Many POMDPs", ICML 2022, PMLR vol. 162, pp. 16691–16723 (arXiv:2110.05038).
  - Key result: with careful architecture and hyperparameter choices, recurrent model-free RL matched or beat six specialized methods on 18 of 21 environments.
- **BF-PPO — VERIFIED.**
  - Le and Stadler, "Learning Optimal Defender Strategies for CAGE-2 using a POMDP Model", accepted at CNSM 2025 (arXiv:2509.06539).
  - Method: PPO plus a particle-filter belief. It is compared against CARDIFF, the top method on the CAGE-2 leaderboard.
- **Hammar and Stadler — VERIFIED (several papers):**
  - "Learning Intrusion Prevention Policies through Optimal Stopping", CNSM 2021.
  - "Intrusion Prevention through Optimal Stopping", IEEE TNSM 19(3):2333–2348, 2022 (arXiv:2111.00289).
  - "Learning Near-Optimal Intrusion Responses Against Dynamic Attackers", IEEE TNSM 2023, DOI 10.1109/TNSM.2023.3293413.
  - "Scalable Learning of Intrusion Response through Recursive Decomposition" (arXiv:2309.03292).
  - Hammar, Dhir and Stadler, C-POMCP for CAGE-2 (arXiv:2407.11070).
- **Q-BIRD — VERIFIED.** Shah et al., "Amplitude-Belief Reinforcement Learning for Adaptive Cyber Defense in Partially Observable V2X Networks", arXiv:2606.07796 (2026 preprint; peer-reviewed venue not verified).
- **FedAtten-DRL — VERIFIED.**
  - Title: "A Federated Learning Framework with Self-Attention and Deep Reinforcement Learning for IoT Intrusion Detection", ACM, DOI 10.1145/3708635.3708649. I did not verify the proceedings name or year.
  - Method: PPO + multi-head attention + federated learning. RL is used as a **detector** (classification as RL), not a responder.
- **Siamese+PPO zero-day IDS — VERIFIED.**
  - Title: "A cross-dataset based zero-day intrusion detection system by integrating siamese network and reinforcement learning", by Hossain, Turja, Tasnim, Juboraj and Hossain, *ICT Express* 2026, vol. 12, pp. 752–757 (ScienceDirect pii S2405959526000731). The bibliographic details come from a citation in MDPI *Computers* (doi 10.3390/computers15090599). A preprint version is arXiv:2609.26115.
  - Reported results: 93.94% zero-day detection ratio and a 2.21% false-positive rate. PPO, DQN and SAC were all evaluated.
- **IoTHaven — VERIFIED as a paper; venue not verified.**
  - Alam, Rahman and Wang, "IoTHaven: An Online Defense System to Mitigate Remote Injection Attacks in Trigger-action IoT Platforms" (2024, Semantic Scholar record).
  - Method: POMDP with a DRQN/LSTM function approximator, applied to trigger-action IoT.
- **CyDER 2.0 — MIS-CHARACTERIZED in your list.**
  - CyDER 2.0 is an open-source cloud cyber-range **simulator**, not a defense algorithm.
  - The relevant paper is "Artificial intelligence driven multi agent framework for adaptive cyber attack simulation and automated incident response in cyber range environments", *Scientific Reports* (2026), article s41598-026-45937-9.
  - In that paper the **attackers** use DQN, while the defenders use supervised/unsupervised anomaly detection plus rule-based response. Do not cite it as an RL defender.
- **DQN-IDS — VERIFIED as "A Self-Adaptive Intrusion Detection System for Zero-Day Attacks Using Deep Q-Networks"** by Alkasassbeh, Omoush, Almseidin and Aldweesh (IEEE Xplore document 11192261). A ResearchGate record (396188562) dates it to January 2025 as an IEEE publication; the journal or venue name is not confirmed.
  - Its "zero-day split" excludes whole ransomware families from training on UGRansome.
  - Reported accuracy on the zero-day split: 95.9% binary and 92.0% multiclass.
- **DeepStage — VERIFIED.** Phan, Nguyen and Bauschert, "DeepStage: Learning Autonomous Defense Policies Against Multi-Stage APT Campaigns", arXiv:2603.16969 (2026). Follow-ups:
  - DeepXplain, arXiv:2603.21296, stated to be under review at GLOBECOM 2026.
  - DeepFaith, arXiv:2607.24348.
- **H-MARL on CAGE-4 — VERIFIED.**
  - Singh, Rathbun, Graham, Oakley, Boboila, Oprea and Chin, "Hierarchical Multi-agent Reinforcement Learning for Cyber Network Defense" (arXiv:2410.17351).
  - Published as an AAMAS 2025 paper (ACM DL 10.5555/3709347.3743999) and in the RL Journal/RLC 2025.

### Q1 — Recurrent PPO vs belief-input PPO comparisons
- **In cyber defense, the closest prior work is Q-BIRD.**
  - Its defender is PPO conditioned on a belief over hidden attacker intent (benign, probing, attack, evasion).
  - Its baselines are no mitigation, rule-based IDS, DQN, DRQN, PPO without belief, PPO-LSTM, PPO with Bayesian belief, and moving-target defense, evaluated over 10 seeds.
  - That already covers your G1 (PPO without belief), G2 (PPO-LSTM) and G3 (PPO + belief).
  - From the sections I read, it has no recurrent+belief arm (your G4) and no raw-feature-stacking control (your G5).
  - It reports a damage reduction from 36.0±5.5 to 28.0±3.0 versus PPO with Bayesian belief.
- **DeepStage is effectively a G4-type agent in an APT setting:**
  - an LSTM stage estimator produces a probability vector over MITRE ATT&CK stages;
  - that vector is concatenated with GNN graph embeddings;
  - a further LSTM belief encoder (b_t = f_LSTM(b_{t-1}, o_t)) feeds a hierarchical PPO.
  - It reports F1 0.887 and 84.7% mitigation success.
- **BF-PPO is a G3-type agent** (particle-filter belief → PPO) on CAGE-2.
- **General POMDP RL:**
  - **Ni et al. 2022** is the key "recurrent is strong" reference.
  - **"Learning Belief Representations for Partially Observable Deep RL" (Believer, ICML 2023, PMLR v202)** separates belief learning from the policy objective. It compares against recurrent PPO and asymmetric actor-critic (Pinto et al. 2018; Baisero and Amato 2022).
  - A 2024 *Machine Learning* (Springer) paper, "POMDP inference and robust solution via deep reinforcement learning: an application to railway optimal maintenance" (DOI 10.1007/s10994-024-06559-2), compares LSTM and Transformer model-free agents with a "belief-input" feed-forward agent. It found that **the belief-input method outperformed** both.
  - **Do results transfer?** Partly, and with opposite signs depending on how good the belief model is:
    - When the belief comes from a correct generative model (railway, BF-PPO), belief-input wins.
    - When memory is well tuned and no good model exists (Ni et al.), recurrent agents are competitive.
  - Your evidential belief is neither an exact Bayesian filter nor learned end-to-end. The literature therefore does not predict your result, which is good for the paper's motivation, provided you frame the study as testing this question.

### Q2 — Dempster–Shafer / Yager / subjective logic / EDL as an RL belief or observation
- **In security, the evidence is close but not identical:**
  - **SHIELD** (Wasif, Moore, Yoon, Lim, Kim, Nelson and Cho, 4th USENIX VehicleSec 2026, pp. 19–38) is the strongest prior art for "EDL uncertainty → security response".
    - Per its abstract, "evidential vacuity, derived from Dirichlet-based perception, jointly drives inter-agent trust modulation, intrusion detection, and human escalation". It reports detecting "over 80% of compromised agents with under 15% false positives".
    - It also has an embedded intrusion response system (quarantine, safe-mode).
    - The PDF text says it "augments deep reinforcement learning with evidential perception", but the abstract does not mention DRL.
  - **"Deep Reinforcement Learning Based Dynamic Reputation Policy in 5G Based Vehicular Communication Networks"** (IEEE Xplore 9428520; NSF PAR 10295357) states that "feedbacks from vehicles are combined in vehicular edge computing (VEC) servers using Dempster-Shafer theory… VEC then uses deep reinforcement learning to determine the optimum reputation update policy". A related paper is "A Multi-Level Dempster-Shafer and Reinforcement Learning-Based Reputation System for Connected Vehicle Security" (IEEE Xplore 10454856).
  - Dempster–Shafer for IDS alert fusion, without RL, is old: "Prioritizing intrusion analysis using Dempster-Shafer theory" (AISec 2011, DOI 10.1145/2046684.2046694), alert-confidence fusion with extended DS (DOI 10.1145/1167253.1167289), and "Dempster-Shafer for Anomaly Detection" (arXiv:0803.1568).
- **In other domains:**
  - RL has been used *on* DS evidence, for example a Q-learning MDP for conflict management in multi-sensor DS fusion (*Entropy* 2021, PMC8469061) and RL-based deceptive-evidence detection in belief-function fusion (*Information Fusion*, pii S1566253523004189). This is the inverse direction: RL manages the fusion rather than consuming the fused belief.
  - A 2024 EDL survey (arXiv:2409.04720) explicitly discusses "evidential policy networks", so EDL inside RL policies is an existing line.
  - EDL itself goes back to Sensoy et al. 2018 (arXiv:1806.01768), grounded in subjective logic.
- **"Evidential POMDP" / "belief-function POMDP":** this query returned only generic POMDP/DS material, with no paper using that term. I did not run the subjective-logic-state query (budget exhausted). **Unresolved; search Scopus for it.**

### Q3 — Explicit unknown/novel-attack state plus an RL response policy
- **Closest works:**
  - **Siamese+PPO** (cross-dataset anomaly correlation feeding PPO/DQN/SAC adaptive defense).
  - **DQN-IDS** (family-held-out zero-day split).
  - **Q-BIRD** (hidden intent states, but no "unknown" class).
  - **DeepStage** (stage index 0 = benign; no unknown class).
  - **Hammar and Stadler** (intrusion/no-intrusion hidden state).
  - **IoTHaven** (POMDP over device compromise).
- **The gap that remains:** none of these, in what I read, represents "unknown attack" as an explicit hypothesis in the belief **together with** a separate ignorance mass Ω and a conflict K that the policy can act on. That combination is your defensible differentiator.
- **Open-set detection without RL is mature:**
  - **OpenTriIDS** (*Sensors* 26(20):6369, 2026) holds out classes on Edge-IIoTset and CIC-IoT-2023. Held-out classes enter only the test set. It reports macro-F1 of 76.81% on CIC-IoT-2023, against an RF open-set baseline of 52.72%.
  - Others: "Detecting Unknown Attacks in IoT Environments: An Open Set Classifier…" (arXiv:2309.07461), VAEMax (arXiv:2403.04193) and a 2026 contrastive-loss zero-day NIDS (arXiv:2601.09902).

### Q4 — Graded or escalating response ladders learned by RL
**Prior work clearly exists; do not claim novelty here.**
- **Q-BIRD:** monitoring, alerting, throttling, isolation, with cost-aware PPO.
- **FedTrans-AgriIDS** (*Discover AI*, Springer, 2026; MAPPO): (0) normal monitoring, (1) alert, (2) rate-limiting, (3) deep packet inspection, (4) gateway isolation. This is almost exactly your ladder.
- **SDN-IoT two-timescale RL with LLM governance** (arXiv:2604.01127): ALLOW, ALERT, MIRROR, RATE_LIMIT, DROP_FLOW, QUARANTINE, with per-action controller costs.
- **DeepEdgeIDS** (arXiv:2511.18240): rate limiting, throttling, blocking, source filtering.
- **DRL energy-aware IoT intrusion prevention** (IIETA): Allow, Drop, Quarantine, Reroute.
- **DeepStage:** monitoring → access control → containment → remediation tiers.
- **DeepAir** (IEEE TNSM 19(3):2207–2218, 2022, DOI 10.1109/TNSM.2022.3158468): adaptive DRL intrusion response in SDN.
- **CAGE action spaces** (Monitor/Analyse/Remove/Restore/Decoy; CAGE-4 adds Allow/BlockTraffic).

### Q5 — Is the "stacked viewer outputs vs fused belief" control (G5 vs G3) known?
- **In supervised multimodal learning, yes:** comparing concatenation fusion against DS fusion is standard. For example, an adaptive late-fusion EDL/DS framework (*Knowledge and Information Systems*, DOI 10.1007/s10115-024-02150-2) reports beating a DS-only fusion model by 7.075%, with concatenation fusion as another comparator.
- **In RL for security, I did not find it.** Q-BIRD compares belief *types* (amplitude vs Bayesian), not "fused belief vs its raw ingredients".
- **Assessment:** G5 is a sound, reviewer-pleasing control. It is "standard good practice applied in a new place", not a methodological contribution. Present it as rigor, not novelty.

## Details

### A. Table of the 15 closest papers

| # | Citation | Venue / year | Link / DOI | Read level | Belief type | RL algorithm | Memory | Domain | Unknown-attack handling | Datasets / env | Gap vs your plan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Shah et al., Q-BIRD: Amplitude-Belief RL for Adaptive Cyber Defense in PO V2X Networks | arXiv preprint, 2026 | https://arxiv.org/abs/2606.07796 | Full text, partial (abstract, Sec. I–V.C, conclusion) | Amplitude (complex-valued) belief over attacker intent, vs Bayesian belief baseline | PPO | Feed-forward + belief; baselines include PPO-LSTM, DRQN | V2X / IoV | Hidden intent states; no explicit unknown class | SUMO-OMNeT++/Veins simulation | Already compares no-belief vs LSTM vs belief PPO; lacks G4, G5, evidential fusion, Ω/K, dataset-based zero-day |
| 2 | Phan, Nguyen, Bauschert, DeepStage | arXiv preprint, 2026 | https://arxiv.org/abs/2603.16969 | Full text, partial (to Sec. IV.G) | LSTM stage-probability vector + LSTM belief embedding | Hierarchical PPO | Recurrent (LSTM) | Enterprise APT | None explicit (stage 0 = benign) | CALDERA testbed | G4-like agent; no ablation grid, not IoT, no DS |
| 3 | Le and Stadler, Learning Optimal Defender Strategies for CAGE-2 using a POMDP Model (BF-PPO) | CNSM 2025 | https://arxiv.org/abs/2509.06539 | Abstract + intro (snippet of PDF) | Particle-filter Bayesian belief | PPO | Belief input (no RNN reported in what I read) | Enterprise (CAGE-2) | None | CybORG CAGE-2 | G3-type with exact model; no memory comparison, not IoT, no unknown class |
| 4 | Hammar and Stadler, Intrusion Prevention through Optimal Stopping | IEEE TNSM 19(3), 2022 | https://arxiv.org/abs/2111.00289 | Snippet | Bayesian belief (threshold structure) | T-SPSA / PPO comparisons | Belief-based | IT infrastructure | Binary intrusion state | Emulation + simulation | Theory-driven stopping; binary-ish actions; no evidential belief |
| 5 | Hammar and Stadler, Learning Near-Optimal Intrusion Responses Against Dynamic Attackers | IEEE TNSM, 2023 | DOI 10.1109/TNSM.2023.3293413 | Abstract | Belief in optimal-stopping game | T-FP (fictitious self-play) | Belief-based | IT infrastructure | Dynamic attacker, no unknown class | Emulation + simulation | Game-theoretic; reviewers will cite as the rigorous POMDP standard |
| 6 | Ni, Eysenbach, Salakhutdinov, Recurrent Model-Free RL Can Be a Strong Baseline for Many POMDPs | ICML 2022 (PMLR 162) | https://proceedings.mlr.press/v162/ni22a.html | Abstract | None (implicit memory) | Recurrent TD3/SAC-style model-free | Recurrent | General POMDP benchmarks | n/a | 21 envs | Justifies G2 strength; tuning burden for your G2/G4 |
| 7 | Wang et al., Learning Belief Representations for Partially Observable Deep RL (Believer) | ICML 2023 (PMLR 202) | https://proceedings.mlr.press/v202/wang23p/wang23p.pdf | Snippet | Learned belief with state supervision | Model-free with belief; recurrent PPO baseline | Both | General POMDP | n/a | Grid/visual benchmarks | Direct general-RL precedent for belief vs recurrent PPO |
| 8 | POMDP inference and robust solution via DRL: railway optimal maintenance | Machine Learning (Springer), 2024 | DOI 10.1007/s10994-024-06559-2 | Abstract snippet | Model-based Bayesian belief | Deep model-free RL | LSTM, Transformer vs belief-input FF | Infrastructure maintenance | n/a | Real railway data | Shows belief-input > LSTM/Transformer; precedent for G2 vs G3 |
| 9 | Wasif, Moore, Yoon, Lim, Kim, Nelson, Cho, SHIELD | USENIX VehicleSec 2026, pp. 19–38 | https://www.usenix.org/system/files/vehiclesec26-wasif-shield.pdf | Snippet + abstract | Evidential vacuity (Dirichlet / subjective logic) driving trust, intrusion detection and human escalation | Deep RL per PDF text (algorithm not read; abstract does not mention DRL) | Not read | Human-swarm / UAV security | Uncertainty-driven escalation, quarantine; >80% compromised agents detected at <15% FP | Simulation (not read) | Closest evidential-uncertainty→security-response precedent; no DS fusion of multiple viewers, not IoT traffic |
| 10 | Deep Reinforcement Learning Based Dynamic Reputation Policy in 5G Based Vehicular Communication Networks | IEEE (Xplore doc. 9428520); NSF PAR record | https://par.nsf.gov/servlets/purl/10295357 | Snippet | Dempster–Shafer combined vehicle feedback as RL state | Deep RL (algorithm not read) | Not read | Vehicular networks | Not addressed | Simulation | Precedent for DS-fused evidence as DRL state in security |
| 11 | Alam, Rahman, Wang, IoTHaven | 2024 (venue not verified) | https://www.semanticscholar.org/paper/cb28fa52eeff0934572c24b54c0b022f0feca2cf | Abstract (S2 + dissertation abstract) | None explicit; POMDP handled by memory | DRQN | Recurrent (LSTM) | Trigger-action IoT | None | PEEVES-derived simulation | G2-type IoT POMDP defender; no belief comparison |
| 12 | Hossain et al., A cross-dataset based zero-day IDS integrating Siamese network and RL | ICT Express 12:752–757, 2026; arXiv:2609.26115 | https://www.sciencedirect.com/science/article/pii/S2405959526000731 | Snippet | Anomaly-correlation scores (not a belief) | PPO (also DQN, SAC) | Not reported in what I read | IoT | Cross-dataset unknown-attack detection | Multiple datasets (names not read) | Unknown-attack + PPO response exists; no POMDP belief, no memory ablation |
| 13 | Alkasassbeh, Omoush, Almseidin, Aldweesh, A Self-Adaptive IDS for Zero-Day Attacks Using Deep Q-Networks | IEEE, Jan 2025 (Xplore doc. 11192261; journal not confirmed) | https://ieeexplore.ieee.org/document/11192261/ | Abstract | None | DQN | No | Ransomware / network | Whole families held out ("zero-day split") | UGRansome | Precedent for family-held-out zero-day RL evaluation |
| 14 | Singh et al., Hierarchical Multi-agent RL for Cyber Network Defense (H-MARL) | AAMAS 2025 / RLC 2025 | https://arxiv.org/abs/2410.17351 | Abstract | None explicit (custom observation) | Hierarchical PPO (MARL) | Not stated in abstract | Enterprise (CAGE-4) | None | CybORG CAGE-4 | Shows field standard is simulator-based closed loop; not IoT |
| 15 | OpenTriIDS: Confidence-Guided Open-Set Intrusion Triage for Unknown Attack Detection in IoT Devices | MDPI Sensors 26(20):6369, 2026 | https://www.mdpi.com/1424-8220/26/20/6369 | Snippet | Confidence + prototype distance (not evidential) | None | n/a | IoT | Held-out classes, explicit unknown routing | Edge-IIoTset, CIC-IoT-2023 | Precedent for your held-out-family CICIoT2023 protocol; no RL |

**Also relevant but outside the top 15** (read level in brackets):
- FedAtten-DRL, DOI 10.1145/3708635.3708649 [abstract].
- CyDER 2.0 paper, *Scientific Reports* 2026, s41598-026-45937-9 [snippet].
- DeepAir, IEEE TNSM 2022, DOI 10.1109/TNSM.2022.3158468 [abstract].
- FedTrans-AgriIDS, Springer *Discover AI* 2026, https://link.springer.com/article/10.1007/s44163-026-01694-2 [snippet].
- SDN-IoT LLM-governed RL, arXiv:2604.01127 [snippet].
- DeepEdgeIDS, arXiv:2511.18240 [snippet].
- C-POMCP, arXiv:2407.11070 [abstract].
- DeepXplain, arXiv:2603.21296 [abstract].
- Belief-State RWKV, arXiv:2604.09671 [snippet; pilot study only].
- Zomlot et al., AISec 2011, DOI 10.1145/2046684.2046694 [abstract].
- Sensoy et al., EDL, arXiv:1806.01768 [snippet].
- EDL survey, arXiv:2409.04720 [snippet].
- Open-set IoT NIDS, arXiv:2309.07461 [snippet].
- Autonomous RL-based IDS for IoT on CICIoT2023 and CIC IoT-DIAD 2024, MDPI *Digital* 6(2):41 [snippet].

### B. Novelty verdict

**(a) Comparison design: LOW–MODERATE novelty.**
- **Evidence against:**
  - Q-BIRD already runs PPO-no-belief vs PPO-LSTM vs DRQN vs PPO-with-Bayesian-belief in a cyber-defense POMDP.
  - The railway paper and Believer do the belief-input vs recurrent comparison in general RL.
  - Ni et al. set the recurrent-baseline bar.
- **Evidence for:**
  - I found no security paper with the full 2×2 factorial (memory × belief) plus a G5 "raw inputs, no fusion" control.
  - The factorial lets you estimate an *interaction effect*: does belief help only when memory is absent? That is a real empirical question.
- **Verdict:** sufficient for a workshop. It is not sufficient alone for a main-track security conference.

**(b) Evidential belief for POMDP RL in IoT defense: MODERATE novelty — your best card.**
- **Evidence for:** I found no work combining these elements:
  - several frozen heterogeneous viewers (an EDL classifier, a GRU forecast residual, an MMPP traffic model);
  - Dempster and Yager combination;
  - an explicit unknown-attack focal element plus Ω and K;
  - all fed to a PPO response policy on IoT traffic.
- **Evidence against:**
  - SHIELD (evidential vacuity → DRL + intrusion-response escalation).
  - DS-combined evidence as a DRL state for vehicular reputation.
  - A survey documenting "evidential policy networks".
  - Decades of DS-based IDS alert fusion.
- **Verdict:** novel as a *specific combination*. The paper must show empirically that Ω and K carry decision-relevant information that raw viewer outputs (G5) and memory (G2) do not.

**(c) Evaluation protocol: LOW novelty, HIGH validity risk.**
- **Evidence:**
  - Held-out classes on CIC-IoT-2023 (OpenTriIDS).
  - Family-held-out zero-day RL (DQN-IDS on UGRansome).
  - Cross-dataset zero-day + PPO (Siamese+PPO).
  - RL-IDS on CICIoT2023 and CIC IoT-DIAD 2024 (MDPI *Digital*).
- **Your metrics are standard.** Novelty AUROC, FPR@fixed TPR, known-class accuracy and cost add nothing new.
- **The critical flaw:** in a replayed static dataset, rate-limit or isolate actions do not change future traffic. The "POMDP" is then really a contextual-bandit or detection problem, which undermines the whole memory-vs-belief question.

**Claims you must NOT make:**
- "First PPO/DRL agent for POMDP-based IoT/network defense" (IoTHaven, DeepStage, BF-PPO, Hammar and Stadler).
- "First comparison of recurrent vs belief-input PPO in cyber defense" (Q-BIRD).
- "First to show recurrent model-free RL is a strong POMDP baseline" (Ni et al. 2022).
- "First belief-state PPO for cyber defense" (BF-PPO, Q-BIRD, DeepStage).
- "First graded/escalating response actions learned by RL" (Q-BIRD, FedTrans-AgriIDS, SDN-IoT governance, DeepEdgeIDS, DeepStage, DeepAir).
- "First use of Dempster–Shafer in intrusion detection" (AISec 2011 and earlier).
- "First use of evidential/subjective-logic uncertainty to drive RL-based security response" (SHIELD).
- "First zero-day evaluation with held-out attack families" or "first open-set evaluation on CICIoT2023" (DQN-IDS, OpenTriIDS).
- "First RL-based zero-day IoT defense with cross-dataset tests" (Siamese+PPO).
- **Safer wording:** "to our knowledge, the first controlled study of whether Dempster–Shafer-fused evidential beliefs with explicit ignorance and conflict add value over memory and over unfused inputs for PPO-based IoT response". Even this should be hedged.

### C. Likely reviewer attacks (with the evidence they would cite)
1. **"This is not a POMDP; actions do not affect observations."**
   - The dataset is static CICIoT2023 replay.
   - Reviewers will cite CAGE-2/CAGE-4 (BF-PPO, H-MARL), Hammar and Stadler's emulation-plus-simulation methodology, and Q-BIRD's closed-loop co-simulation as the expected standard.
2. **"The memory-vs-belief comparison is already done."** Q-BIRD (PPO-LSTM, DRQN, PPO-no-belief, PPO-Bayesian-belief), the railway *Machine Learning* 2024 paper, Believer (ICML 2023).
3. **"Your recurrent baseline is under-tuned."** Ni et al. 2022 show recurrent model-free RL matches specialized methods on 18/21 environments when properly designed. Expect demands for equal tuning budgets and architecture/context-length sweeps for G2/G4.
4. **"Why Dempster–Shafer instead of a Bayesian or particle-filter belief?"**
   - BF-PPO uses a particle filter.
   - Q-BIRD compares against Bayesian belief.
   - Without a Bayesian-fusion or learned-fusion arm, the DS choice looks arbitrary.
   - Expect the classic critique that Dempster's rule is counter-intuitive under high conflict; this is why conflict-management literature exists (*Entropy* 2021).
5. **"Gains come from extra pretrained features, not fusion."** G5 addresses this, but reviewers will also want "G5 + memory" and "EDL viewer alone" arms.
6. **"The unknown-attack signal is just an OOD detector; RL adds nothing."**
   - Open-set IDS papers (OpenTriIDS, arXiv:2309.07461, VAEMax) already detect unknowns.
   - You must beat a non-RL threshold policy on m(unknown), Ω and K.
7. **"Graded response is not new."** Q-BIRD, FedTrans-AgriIDS, SDN-IoT governance (arXiv:2604.01127), DeepEdgeIDS, DeepAir.
8. **"The zero-day protocol is standard, and CICIoT2023 families are easy or near-duplicate."**
   - Cite OpenTriIDS and DQN-IDS.
   - Reviewers may argue that holding out one DDoS variant while keeping its siblings is not a real zero-day; held-out *families* must be semantically distinct.
9. **"Cost function is arbitrary."** Q-BIRD and the SDN-IoT paper use explicit per-action cost models (for example, controller overhead κ(a)). Reviewers will ask for sensitivity analysis.
10. **"Statistical rigor."** Q-BIRD uses 10 seeds × 80 test episodes. Fewer seeds, or no confidence intervals, will be attacked.
11. **"Frozen viewers leak test information."** If viewers are trained on data that overlaps held-out families or test windows, the zero-day claim collapses.
12. **"Cross-dataset feature mismatch."** CICIoT2023 features differ from other datasets. Reviewers will ask how viewers transfer without retraining.

### D. Differentiators and minimal extra experiments

**Differentiators to emphasize:**
- An *interaction-effect* question: does explicit evidential belief help **only** without memory (G3 > G1 but G4 ≈ G2)? Either answer is publishable if rigorous.
- An *uncertainty decomposition* that the policy can use: Ω (ignorance) vs K (conflict) vs m(unknown). Show that each channel causally changes ladder choices, for example via an ablation that zeroes Ω or K at test time.
- *Dempster vs Yager* under conflict: Yager moves conflict mass to Ω, which should produce more conservative actions on novel traffic. That is a testable, mechanism-level claim.

**Minimal extra experiment list:**
1. **A closed-loop environment.** At minimum, a traffic simulator where actions modify subsequent flows (rate-limit lowers attacker and benign throughput; isolate removes a device), parameterized from CICIoT2023 statistics. Without this, drop the "POMDP" framing.
2. **A non-RL threshold baseline** on m(unknown), Ω and K, mapped to the ladder. RL must beat it.
3. **A Bayesian-fusion arm** (product-of-experts or a calibrated softmax ensemble) and a **learned-fusion arm** (a small MLP over viewer outputs, trained end-to-end). Together these separate "DS helps" from "any fusion helps".
4. **G5 + memory** (stacked raw outputs into LSTM-PPO), to complete the factorial.
5. **An oracle-belief upper bound** (true class or state as input) and an **asymmetric-critic variant**, which Believer-style reviewers will expect.
6. **Equal-budget hyperparameter search** for all arms (per Ni et al.), with at least 10 seeds, IQM and bootstrap CIs.
7. **Leave-one-family-out rotation** over all CICIoT2023 families (not one split), plus one cross-dataset test with documented feature mapping. CIC IoT-DIAD 2024 or Edge-IIoTset are the obvious candidates.
8. **A binary-block vs ladder ablation**, to show the ladder's value under the same cost model.
9. **A cost-sensitivity sweep** over action costs.
10. **Calibration of Ω** (does Ω rise on held-out families?), with reliability diagrams for the EDL viewer.

### E. Target venues (deadlines verified by sub-agent; status flagged)

| Venue | Fit | Typical length | Most recent deadline found | Verification status |
|---|---|---|---|---|
| IEEE/IFIP NOMS 2027 (Montréal, May 10–14, 2027) | Network management, RL-for-security tracks; Hammar/Stadler-style work fits | Full: 8 pp + refs/appendix (max 12); short: 4 pp (max 6), IEEE 2-col | Official noms2027.ieee-noms.org homepage: "30 Nov 2026 Paper Submission Deadline: (firm)"; notification 15 Feb 2027, camera-ready 28 Feb 2027. WikiCFP and callforpaper.org still list 9 Nov 2026 for technical session papers. Demo, dissertation-digest and experience-session papers due 23 Nov 2026 (experience papers max 6 pp incl. refs) | Official homepage date; page limits secondhand; treat 30 Nov as authoritative |
| IEEE WoWMoM 2027 (Irvine, Jun 21–24, 2027) | IoT / wireless / mobile security | Up to 10 pp incl. refs, IEEE 2-col, double-blind | 1 Dec 2026 | Secondhand (WikiCFP / DBWorld); official CFP page UNVERIFIED |
| IEEE EuroS&P 2027 Workshops (Madrid, Jul 2027) | Security workshops (e.g., ML/AI security workshops, if accepted) | Set per workshop, IEEE format | Late Feb / early Mar 2027 (per-workshop CFPs due by 11 Dec 2026) | Confirmed on official page (full fetch); exact workshop deadlines not yet published |
| ACM AISec (CCS workshop) | Best thematic fit: ML + security, uncertainty, RL defense | Max 10 pp ACM 2-col + 2 pp refs/appendix (12 max) | 2026 edition: 24 Jul 2026 (passed; workshop held 15 Nov 2026). 2027 deadline UNVERIFIED (expect ~July 2027) | 2026 confirmed (official snippet) |
| IEEE CNS | Network security, applied RL defense | Page limit UNVERIFIED | CNS 2026: 18 May 2026 (extended; passed). CNS 2027 CFP not found (UNVERIFIED) | 2026 confirmed (official snippet) |
| IFIP/IEEE CNSM | Venue of BF-PPO and Hammar/Stadler papers; ideal audience | Full max 9 pp incl. refs; short max 5 pp, IEEE 2-col | CNSM 2026: 29 Jun 2026 (extended; passed). CNSM 2027 UNVERIFIED (expect ~June 2027) | 2026 confirmed (official snippet) |

**Alternatives:**
- **IEEE ICC 2027 CISS symposium:** deadline 30 Oct 2026, now passed; page limit UNVERIFIED.
- **ACSAC 2026:** 26 May 2026, passed; 11 pp + appendices, 16 pp max. Too competitive for the current scope.
- **ACM WiSec 2027:** cycle 1 on 18 Nov 2026 per secondhand source only, UNVERIFIED. Wireless focus makes it a weaker fit.
- **IEEE GLOBECOM security symposia:** not verified.

**Recommendation:**
- If the closed-loop simulator is ready within two weeks, target **NOMS 2027** (30 Nov 2026 per the official homepage; aggregators still show 9 Nov) or **WoWMoM 2027** (1 Dec 2026).
- Otherwise aim at **AISec 2027** or **CNSM 2027**. Their audience (Stadler group, CAGE community) will understand the POMDP framing, and they give you time to run the extra experiments.

## Caveats

### F. Claims in this answer I am least sure about
1. **That Q-BIRD has no recurrent+belief (G4) arm.** I read its baseline list and sections I–V.C, not the full results and ablation section.
2. **That BF-PPO uses no recurrent component.** I read only the abstract and intro snippets.
3. **The NOMS 2027 deadline.** The official homepage says 30 Nov 2026 (firm), while WikiCFP and callforpaper.org still list 9 Nov 2026 for technical session papers. Confirm on the official CFP page.
4. **SHIELD's role for DRL.** Authors and venue are confirmed (Wasif et al., USENIX VehicleSec 2026, pp. 19–38). However, its abstract mentions only evidential vacuity driving trust, intrusion detection and human escalation, not DRL. The DRL link comes from PDF text I read only as a snippet, and I do not know its RL algorithm.
5. **The vehicular DS+DRL paper's exact venue and year.** It is identified as "Deep Reinforcement Learning Based Dynamic Reputation Policy in 5G Based Vehicular Communication Networks" (IEEE Xplore 9428520), but I did not confirm the conference name or year.
6. **The Siamese+PPO paper's dataset names.** I did not read them; the journal (*ICT Express* 12:752–757, 2026) comes from a secondary citation.
7. **The venue and year of DQN-IDS (IEEE Xplore 11192261), FedAtten-DRL and IoTHaven.** DQN-IDS is dated January 2025 only via ResearchGate.
8. **That no "evidential POMDP" or subjective-logic-state RL paper exists.** The relevant query failed for budget reasons, so this is the largest search gap.
9. **That the railway *Machine Learning* 2024 paper's "belief-input outperforms" result holds generally.** I read only the abstract and section snippets.
10. **WoWMoM 2027 and WiSec 2027 dates,** which are from secondhand sources only.



---

## UPDATE — 17 November 2026 (new sections only; everything above is unchanged)

Today: a recap of the PPO path and the G1 to G5 table, a status check of what is left to study for PPO, and the start of Session 2 (reinforcement learning from zero up to PPO), Steps 1 and 2 plus clarifications on the discount, the horizon and episodes. Decision: the rest of Session 1 (Steps 6 to 8) is skipped for now and Session 2 starts from zero. Sections 93 to 101 (16 November) stay as they are. Items marked (suggestion) are mine, not decisions. Items marked (verify) have not been checked against sources.

### 102. Recap of the PPO path and the G1 to G5 comparison table

**Done in Session 1 (Steps 1 to 5):** POMDP basics (hidden state, observation, belief, action); window and step Delta (start with Delta = W, sweep 1, 2, 5, 10 s); what the agent sees (belief block, window features by protocol segment, last action, context); the action ladder (wait, rate-limit, temporary block, isolate and alert a human); the reward (costs for missed attacks, wrongly cut traffic, heavy actions; the cost ratio decides how sure the agent must be before acting).

**PPO points learned so far:** PPO is the coach (it trains the policy network and a value network), not the decider; it trains in an environment because recorded traffic cannot react to actions; it runs during training and upgrades, not in the live loop; the viewers, the world model and the belief module are trained beforehand and frozen, and PPO learns to use the belief without changing it; use a library (Stable-Baselines3, with sb3-contrib for the recurrent and masked versions); the user writes the environment, belief module and reward.

**The comparison table (all arms share the identical environment, reward, ladder, step size, tuning budget and several seeds; the POMDP is frozen so nothing favors one arm):**

| Arm | Memory | Policy receives (beyond window features and last action) | What it tests |
|---|---|---|---|
| G1 | none (feed-forward) | nothing extra | baseline: "pretend it is an MDP" |
| G2 | recurrent (LSTM first, GRU as an ablation) | nothing extra | does memory alone help? |
| G3 | none | the fused DS belief | does the belief help a policy with no memory? |
| G4 | recurrent | the fused DS belief | does the belief add anything on top of memory? |
| G5 | none | the viewers' raw outputs stacked, no DS fusion | control: is it fusion that helps, or just extra pretrained features? |

(G6, a suggestion: G5 with a recurrent policy, to complete the grid.)

| Comparison | Answers |
|---|---|
| G1 vs G2 | memory, with no belief |
| G1 vs G3 and G2 vs G4 | the belief, with memory held fixed |
| G3 vs G4 | memory, with the belief held fixed |
| G3 vs G5 | whether DS fusion itself helps |
| G1 vs G5 | whether the extra pretrained viewers help at all |

**Conference-paper check (unverified deep-search report, Section 99):** the comparison idea is partly done already (Q-BIRD, a 2024 railway-maintenance paper, Believer, Ni et al.); the defensible part is the evidential (Dempster/Yager) multi-viewer belief with an explicit unknown state, Omega and K; a closed-loop environment (actions must change subsequent traffic) is mandatory, otherwise it is not really a POMDP.

### 103. What is left to study for PPO (status)

| # | Topic | Status |
|---|---|---|
| 1 | Session 1, Steps 6 to 8 (episode end and the U response; sanity checks with random, rule-based and oracle policies; one-page design) | Skipped by the user for now; decisions stay open and will be taken when the environment is built |
| 2 | RL basics up to PPO (value, advantage, policy gradient, clipping, small numeric examples) | In progress: Session 2, Steps 1 and 2 done |
| 3 | PPO's settings (learning rate, clip range, epochs, batch and rollout length, discount, entropy) | Not studied; needed to tune G1 to G5 fairly (a reviewer will attack an under-tuned G2) |
| 4 | PPO vs DQN, on-policy vs off-policy | Not studied; DQN is a baseline arm and this affects the sample-efficiency argument for MBRL |
| 5 | Belief inside PPO | Covered informally (Section 95), needs a short formal recap |
| 6 | World models and MBRL basics | Partly covered (roles and limits, Section 97); imagination mechanics not studied |
| 7 | Evaluation and experiment design (seeds, confidence intervals, sweeps) | Partly covered |
| later | IPPO and MAPPO, federated PPO | Postponed (Papers 2 and 3) |

**Background of the user:** no RL or DQN used in RAIDEN so far; starting RL from zero with baby steps and plain examples, explaining even basic terms.

### 104. Session 2 plan: reinforcement learning up to PPO (11 steps)

| Step | Plain question | Status |
|---|---|---|
| 1 | What is RL, and what are its pieces? (agent, environment, observation, action, reward) | Done |
| 2 | What is a score over time? (episode, return, discount) | Done (with clarifications below) |
| 3 | What is a policy? (the decision rule; why it outputs probabilities) | Next |
| 4 | How does trial and error work? (exploration vs exploitation) | Left |
| 5 | What is a value? (how good is this situation; the critic) | Left |
| 6 | How does the policy improve? (policy gradient: "do more of what worked") | Left |
| 7 | What is an advantage? ("better than expected") | Left |
| 8 | Why do big updates break learning? (the reason PPO exists) | Left |
| 9 | What is PPO's clip trick? | Left |
| 10 | The whole PPO loop and its settings (the knobs) | Left |
| 11 | Connect it to the IoT agent, and wrap up as an md section | Left |

### 105. Step 1: what is RL and what are its pieces

**Picture (teaching a dog to sit):** you cannot explain it in words and there is no answer key. The dog does something; you give a treat when it is good and nothing when it is not; over many tries it learns which behavior earns treats. Nobody told the dog "sitting is the answer": it found out from scores that came after its choices. That is reinforcement learning.

| | Supervised learning (EDL, GRU, classifiers) | Reinforcement learning |
|---|---|---|
| Feedback | the correct answer for each example | only a score for what you did |
| When feedback arrives | immediately | often later |
| What it learns | "which label is right" | "which actions lead to good scores" |
| Data | a fixed dataset | experience the agent creates by acting |

Because the data depends on what the agent does, recorded traffic alone cannot train the defender (its actions would change the traffic, and a recording cannot react).

**The five pieces:**

| Piece | Dog | IoT agent | Plain meaning |
|---|---|---|---|
| Agent | the dog | the defender | the one that decides |
| Environment | you, the room, the treats | the devices, the traffic and the attacker | everything the agent does not control |
| Observation | what the dog sees and hears | the traffic window (and our belief) | what the agent gets to know |
| Action | sit, jump, bark | wait, rate-limit, block, isolate | what it chooses to do |
| Reward | treat or no treat | the score from missed attacks, cut traffic and heavy actions | the feedback number |

(The state is the hidden truth; the observation is the part the agent can see; RL needs both words.)

**The loop:** (1) the agent sees an observation; (2) it picks an action; (3) the environment reacts; (4) the agent receives a reward and a new observation; (5) back to 1. Every RL algorithm, including PPO, is a way of improving step 2 using the rewards from step 4.

**Tiny example (illustrative numbers):** an attack is underway against a device. Step 1: observation = traffic spike, action = wait, reward = -1.0 (the attack traffic passed through). Step 2: spike continues, action = rate-limit, reward = -0.7 (half the attack was cut, and half the legitimate traffic too). Step 3: traffic back to normal, action = wait, reward = 0. Total over the three steps = -1.7.

**Two ideas to keep:** (1) delayed credit: the reward for an action can show up later, and the hard part of RL is working out which earlier action deserved the credit (Steps 2 and 6); (2) the agent's job is not "be correct once" but "get the best total score over time", so it may take a small loss now to avoid a bigger one later.

**Check (answered by the user):** a hub rate-limits device A; the next window shows A's traffic halved; the step score is -0.6. Observation = A's traffic halved; action = rate-limiting; reward = -0.6; environment = the devices, the traffic and the attacker. Correction: the hub is where the agent lives; the environment is everything the agent does not control.

### 106. Step 2: score over time (episode, return, discount)

**Picture:** a security guard's boss judges the whole shift, not one decision (a guard who stops a thief at 9 p.m. but sleeps through three break-ins later has not done well). The agent tries to get the best total score over a stretch of time.

| Word | Plain meaning | Everyday picture |
|---|---|---|
| Episode | one complete run, from a start to an end | one game round, one shift, one attack scenario |
| Return | the total score collected from now until the end of the episode | the final score at the end of the game |
| Discount (gamma) | how much later rewards count compared with rewards now | money today is worth a little more than the same money next year |

**For the IoT agent:** an episode could be 10 minutes of traffic that contains one attack (about 120 steps with Delta = 5 s). The return is the sum of the rewards. Exactly when an episode ends is one of the postponed Session 1 decisions.

**Examples:** the three steps above have return -1.7. Two policies over 3 steps on a real attack (illustrative numbers from the reward step): "wait, wait, wait" gives -1, -1, -1, return -3; "rate-limit, then block, then block" gives -0.7, -0.4, -0.4, return -1.5. Step 1 alone shows the two policies are close; the whole episode shows how different they are.

**Discounted return:** return = r0 + gamma x r1 + gamma^2 x r2 + ..., with gamma between 0 and 1. Example (gamma = 0.9, rewards -1.0, -0.7, 0): -1.0 + 0.9 x (-0.7) + 0 = -1.63.

**Why not simply add everything up:** the future is uncertain (what happens in 10 minutes depends on things the agent cannot predict); an endless task would sum to infinity without a discount; sooner is better (stopping an attack now is worth more than stopping it later).

**Patient vs short-sighted (X: do nothing = reward 0 now then -5 later; Y: rate-limit = -0.5 now then 0):** gamma = 0.9 gives X = 0 + 0.9 x (-5) = -4.5 and Y = -0.5, so the agent picks Y (correct); gamma = 0 gives X = 0 and Y = -0.5, so it picks X (wrong, it ignores the future). A gamma near 1 makes the agent accept a small loss now to avoid a bigger one later, which is what a defender must do.

**The goal is the expected return:** attacks and traffic are random, so the same policy gets a different return each episode; the agent maximizes the average return over many episodes.

**Check (rewards -1, -2, -4, gamma = 0.5), answered by the user:** -1 + (-2 x 0.5) + (-4 x 0.25) = -3. Reference for gamma = 0.9: -1 - 1.8 - 3.24 = -6.04, more negative than -3 because a larger gamma makes the agent feel the later losses more (nothing changed in the world; returns are only comparable with the same gamma).

### 107. Clarifications on gamma, the horizon and episodes (from the user's questions)

**Gamma = 0.5 is not patient; it is short-sighted.** Picture: gamma near 1 is someone saving for a car (the future counts almost fully); gamma near 0 is someone who spends everything today. Weights by how far ahead a reward is:

| gamma | now | 1 step later | 2 steps later | 3 steps later |
|---|---|---|---|---|
| 0.5 | 1 | 0.5 | 0.25 | 0.125 |
| 0.9 | 1 | 0.9 | 0.81 | 0.73 |
| 0.99 | 1 | 0.99 | 0.98 | 0.97 |

**Why a small gamma looks "better" but is not:** with gamma = 0.1 the rewards -1, -2, -4 give -1 - 0.2 - 0.04 = -1.24, which looks better than -3, but the losses still happen in reality; the agent just stopped caring. We choose gamma (it is a design setting, the agent does not).

**Why a patient agent may accept a negative reward now:** from the example, waiting costs 0 now and -5 later while rate-limiting costs -0.5 now and 0 later: gamma = 0.9 gives -4.5 vs -0.5 (rate-limits); gamma = 0.05 gives -0.25 vs -0.5 (waits, the wrong choice).

**"Why is the first value always better than the next ones?"** It is not: the first reward is only weighted at full size, later ones are scaled down, but a big later penalty still dominates (rewards -0.5 now and -5 later with gamma = 0.9 give -0.5 + 0.9 x (-5) = -5.0). The discount says "sooner is a bit better and the future is uncertain", not "the future is unimportant".

**Choosing gamma (rule of thumb, general knowledge, to tune): the agent looks about 1 / (1 - gamma) steps ahead.**

| gamma | looks about this many steps ahead | weight of a reward 20 steps away |
|---|---|---|
| 0.90 | 10 | 0.12 |
| 0.95 | 20 | 0.36 |
| 0.99 | 100 | 0.82 |

With Delta = 5 s, a 60 s temporary block lasts 12 steps: with gamma = 0.9 the end of the block counts only 0.9^12 = 0.28; with gamma = 0.99 it counts 0.99^12 = 0.89. So gamma about 0.95 to 0.99 fits (the default in the RecurrentPPO signature is gamma = 0.99; Stable-Baselines3 PPO uses the same default, verify). If Delta gets shorter gamma must go up to look at the same real time (at Delta = 2 s, covering about 100 s needs 50 steps, so gamma is about 0.98). Sweep {0.9, 0.95, 0.99} with the same sweep for every arm.

**The user's formula, gamma = (S - 1) / S:** with a 10-minute episode and a 5-second step, 600 / 5 = 120 steps (steps, not seconds), so gamma = 119/120 = 0.9917. This is the "looks ahead about 1 / (1 - gamma) steps" rule turned around: to care about the next H steps, set gamma = 1 - 1/H. Weights with gamma = 0.9917: 12 steps (60 s, end of a block) 0.90; 60 steps (5 min) 0.60; 120 steps (10 min, end of the episode) 0.37.

| Steps to care about (H) | Real time at Delta = 5 s | gamma = 1 - 1/H |
|---|---|---|
| 12 | 1 min | 0.917 |
| 24 | 2 min | 0.958 |
| 60 | 5 min | 0.983 |
| 120 | 10 min | 0.992 |

**Caution:** the whole episode is not automatically the right horizon. Choose H by asking how long after an action its consequences still matter (a block lasts 60 s, an attack may evolve over a minute or two; something 9 minutes later is probably not caused by this step's action). A longer horizon also makes learning harder (more steps between an action and its outcome make credit assignment harder, Steps 6 and 7). H = 120 (gamma = 0.992) is a valid candidate; shorter ones (0.95 to 0.98) may learn faster. Sweep {0.95, 0.98, 0.99, 0.992} for every arm. If Delta changes, the number of steps for the same real time changes, and gamma must change with it.

**When does an episode end? The environment decides during training, not the agent.**

| Kind | Plain version | Example for this agent (suggestion, not decided) |
|---|---|---|
| Natural end | something happened that finishes the game | a device is fully compromised or a damage limit is hit |
| Time limit | the clock runs out | 10 minutes = 120 steps at Delta = 5 s |

A simple design (suggestion): each training episode is 10 minutes of traffic that is either all normal or contains one attack starting at a random time, with an early stop if the damage cap is hit. After an episode ends the environment is reset: a fresh scenario starts, and the belief memory and any recurrent memory are cleared. In deployment there are no episodes (the system runs continuously); episodes only exist to make training possible. A detail for Step 5: a time-limit cut is not a real end of the world, so the value estimate must treat it differently from a natural end (the library handles it).

### 108. Reference answers for pending checks (not answered by the user in the session)

- Step 2 follow-up (rewards -1, -2, -4 with gamma = 0.9): -6.04, more negative than -3 because a larger gamma weights the later losses more.
- With Delta = 2 s and a wish to care about the next 120 s: H = 120 / 2 = 60 steps, gamma = 1 - 1/60 = 0.983.
- One-sentence version of "why a patient agent may accept a negative reward now": because a small loss now can avoid a much bigger loss later, and only a gamma close to 1 lets the agent feel the later loss.

### 109. Open items and next steps

**Next steps (PPO study):**
1. Session 2, Step 3: the policy (what the decision rule is; why it outputs probabilities instead of one fixed action).
2. Then Steps 4 to 11 as listed in Section 104 (exploration vs exploitation; value; policy gradient; advantage; the problem of big updates; the clip trick; the whole PPO loop and its settings; connection to the IoT agent and the wrap-up).
3. After Session 2: PPO vs DQN and on-policy vs off-policy; formal recap of the belief inside PPO; world models and MBRL basics; experiment design.

**Open items:**
1. Postponed Session 1 decisions: episode end and the response to U; sanity-check baselines (random, rule-based, oracle); the one-page design; the action-effect numbers, device-selection rule and per-protocol mapping; window and step; reward weights.
2. Gamma and the horizon: sweep {0.95, 0.98, 0.99, 0.992}; decide the episode length and the end rule.
3. Questions still open to the user: the window and overlap used in the CICIoT2023 run (and whether windows are time-ordered per device); which actions a real hub or operator can take; the CICIoT2023 DS run details (Section 44).
4. Verify: SB3 PPO default gamma; the rule of thumb "looks about 1 / (1 - gamma) steps ahead" (general knowledge, to check in a reference); every paper, link and deadline in Section 99.
5. Paused from before: cheap baselines and conformal prediction (Sections 28 and 29).
6. Carry forward all open items from earlier sections.

   
---

## UPDATE — 17 November 2026 (continued, new sections only; everything above is unchanged)

Today (second part): Session 2 continued. Step 3 (the policy), Step 4 (exploration vs exploitation) and Step 5 (value) are covered, plus a clarification on where exploration lives and what a world model adds. Sections 102 to 109 stay as they are. Items marked (suggestion) are mine, not decisions. Items marked (verify) have not been checked against sources.

### 110. Session 2 status

| Step | Topic | Status |
|---|---|---|
| 1 | What is RL and its pieces | Done (Section 105) |
| 2 | Return, episode, discount | Done (Sections 106 and 107) |
| 3 | What is a policy | Done (Section 111) |
| 4 | Exploration vs exploitation | Done (Section 112) |
| 5 | What is a value (the critic) | Explained, checks still open (Section 114) |
| 6 | Policy gradient | Next |
| 7 | Advantage | Left |
| 8 | Why big updates break learning | Left |
| 9 | PPO's clip trick | Left |
| 10 | The whole PPO loop and its settings | Left |
| 11 | Connect to the IoT agent, wrap up | Left |

### 111. Step 3: what is a policy

**Picture:** a guard's rule in his head, "when I see X, I do Y". It is not the score and not the belief; it is the decision rule.

> **Policy = a rule that takes what the agent sees and says what to do.** Written pi(a | s): the probability of action a given what the agent sees.

In our system: input = the observation (belief block, window features, last action, context); output = a choice on the ladder (wait, rate-limit, block, isolate). In PPO the policy is a neural network (the policy network, or actor) and its weights are what PPO trains.

| Kind | Output | Example |
|---|---|---|
| Fixed rule | one action | "if U mass > 0.4, rate-limit" (our non-RL threshold baseline) |
| Probabilistic | a probability per action | wait 0.10, rate-limit 0.60, block 0.25, isolate 0.05 (what PPO uses) |

**How the network makes probabilities:** it ends in a softmax (Section 87). Raw scores (logits) become percentages that add to 100%. Example with scores (2.0, 1.0, 0.5, -1.0): e^x gives 7.39, 2.72, 1.65, 0.37, sum 12.13, so probabilities wait 0.61, rate-limit 0.22, block 0.14, isolate 0.03. (The scores are made-up numbers to show the arithmetic.) The agent then samples an action from these probabilities.

**Why probabilities and not one fixed action:**
1. Exploration: a policy that always does one thing never tries anything else.
2. Smooth learning: training can nudge 0.25 to 0.27, but cannot nudge "always block" by a small amount; a fixed action gives nothing to improve.
3. It can show when two actions are nearly equally good.

**Training vs deployment:** during training, sample from the probabilities. At deployment, often pick the top action (more predictable and easier to explain). This is a design choice (suggestion).

**Untrained network:** raw scores (0, 0, 0, 0) give 25% each: undecided, and training moves the probabilities toward a preference.

**All arms G1 to G5 have the same kind of policy and the same softmax output over the ladder.** They differ only in the input (and G2, G4 have an LSTM inside for memory).

### 112. Step 4: exploration vs exploitation

**Picture:** a new city, one decent restaurant found. Exploit = go back to it; explore = try a new place. Only exploiting may miss the best one; only exploring never enjoys the good one.

| | Exploit | Explore |
|---|---|---|
| What it does | pick the action that looks best so far | try something else |
| Gain | good score now | information about what else works |
| Risk | stuck with a mediocre habit | a bad score on this try |

**In our agent:** early on "wait" scores fine on normal traffic. Rate-limiting at the first sign of U may look bad on a few tries (it cut some legitimate traffic), so without exploration the agent would drop it too soon and never learn it saves damage during an attack (illustrative: real attack, wait -3.0 vs rate-limit then block -1.5).

**Where it lives:** in the policy, through its probabilities and sampling. A 0.60 action is chosen most of the time (exploit); a 0.05 action is still chosen about 1 time in 20 (explore). There is no separate switch between modes. As training goes on, good actions gain probability and the distribution sharpens, so exploring fades on its own.

**Entropy bonus (a PPO setting, Step 10):** if the distribution collapses too early (for example 0.97 on one action), exploring stops and the agent can get stuck. PPO adds a small bonus for keeping probabilities spread. Entropy is high when probabilities are even (0.25 each) and low when one action dominates. A higher entropy coefficient means more exploring for longer.

**Why exploring is safe in training only:** in the simulator a bad action harms nobody; in a real home blocking a legitimate device annoys a user. At deployment exploration is usually turned off.

### 113. Clarification: who explores, and what a world model adds

- **There is one thing, the policy.** The policy network holds the explore/exploit balance; sampling draws the action; PPO trains the network, and its entropy bonus keeps some exploring alive.
- **Exploitation is not "look up old records"**: it is the policy's current best guess, learned from past experience and stored in its weights. **Exploration is not "use a GRU-predicted outcome"**: it is sampling a lower-probability action by chance. No separate model is assigned to either.
- **G1 explores** with no world model at all, through the sampling.
- **The world model belongs to a different axis** (model-based vs model-free, "where he practices", Section 94). In the model-based arm (old arm D) the GRU-world-model supplies extra practice episodes ("what if I throttled here?") on imagined traffic, alongside real or simulated traffic. The agent still decides by sampling the same policy. The world model does not explore; it gives more places to explore without touching the real environment.
- **Corrections to my own wording of it:** the extra practice is not unlimited (imagined traffic is only as good as the model, and its errors pile up over long imagined episodes, Section 97), and it is not a separate learning step (the learning is the same PPO update on more data).

> One line: the policy holds the explore/exploit balance; PPO trains the policy; a world model, if used, only supplies extra practice data and takes no part in the choice.

### 114. Step 5: what is a value

**Picture:** in chess, "how good is your position?" asked before you move. A strong player can say "winning" or "in trouble" without choosing a move.

> **Value = the return the agent expects to collect from this situation onward, if it keeps following its policy.** It is the Step 2 return, but as a prediction made before the episode finishes.

| Situation | Expected return from here (made-up numbers) |
|---|---|
| Normal traffic, belief Normal 0.95 | about 0 |
| Belief U 0.45, device getting busier | about -2.0 |
| Attack half through, device still open | about -4.0 |

The value is a number attached to a **situation**, not to an action.

**The critic:** PPO trains two networks.

| Network | Output | Job |
|---|---|---|
| Policy (actor) | probabilities over actions | decides |
| Value (critic) | one number | judges how good the situation is |

In the standard setup both read the same observation. The critic is trained by comparison: if it predicted -2.0 and the real return was -3.0, it adjusts toward -3.0; over many episodes its predictions become accurate.

**Why it is needed:** the step reward says what happened this step, not whether the situation was good or bad. If the critic expected -3.0 from a situation and the action got -0.5 plus a calm future, the action did better than expected. That "better than expected" is the **advantage** (Step 7), which tells the policy which actions to make more likely. The value is the yardstick.

**Value vs return:** the return is what actually happened (known at the end); the value is what the critic predicts will happen (known now).

### 115. Reference answers for pending checks (not answered by the user in the session)

- Step 4, check 1 (policy at wait 0.97, others 0.01): a problem, because the agent almost never tries the other actions, so it can get stuck with a habit it never tests (the entropy bonus exists for this).
- Step 4, check 2 (wild exploring in the simulator vs a real home): in the simulator a bad action harms nobody; in a real home it cuts off a legitimate user.
- Step 5, check 1 (critic predicted -2.0, real return -0.5): better than expected, by 1.5 (-0.5 minus -2.0 = +1.5). This difference is the idea behind the advantage.
- Step 5, check 2: the value is a property of a situation, not of an action.

### 116. Open items and next steps

**Next steps:**
1. Answer the two Step 5 checks (reference answers above), then Step 6: policy gradient (how the policy improves: "do more of what worked").
2. Then Steps 7 to 11 as listed in Section 110.
3. After Session 2: PPO vs DQN (on-policy vs off-policy), formal recap of the belief inside PPO, world models and MBRL basics, experiment design.

**Open items:**
1. Carry forward all open items from Sections 102 to 109 (postponed Session 1 decisions, gamma and horizon sweep, window and overlap questions, CICIoT2023 DS run details, verification items).
2. Verify (general knowledge, not checked against a reference): that actor and critic read the same observation in the standard setup; that exploration is usually turned off at deployment.

---

## UPDATE — 19 November 2026 (new sections only; everything above is unchanged)

Today: Session 2 finished (Steps 6 to 11): policy gradient with its math, advantage and GAE, why big updates break learning, PPO's clip, the full loop with its knobs, and the connection to the IoT agent. Items marked (suggestion) are mine. Items marked (verify) are general knowledge not checked against a reference; defaults and formulas should be checked in the PPO paper and the Stable-Baselines3 docs.

### 117. Step 6: policy gradient ("do more of what worked")

- Goal: maximize J(theta) = E[G(tau)], the average return; theta = policy weights, tau = one episode.
- J = sum over tau of P(tau; theta) G(tau); theta lives only in P. The gradient of P is not an average, so use the log trick: grad P = P grad log P. Then grad J = E[grad log P(tau) G(tau)], an average we can sample.
- P(tau) = p(s0) x product of pi(a_t|s_t) p(s_{t+1}|s_t,a_t). The log turns the product into a sum; start and environment terms contain no theta, so they vanish: grad log P = sum of grad log pi(a_t|s_t). No model of traffic reaction is needed (model-free).
- Result: grad J = E[ sum_t grad log pi(a_t|s_t) G ].
- For a softmax policy, d log pi(a) / d z_k = 1[k=a] - pi(k). Example (wait 0.60, rate-limit 0.40, sampled rate-limit): direction (-0.60, +0.60).
- Update: theta <- theta + alpha grad J. Numeric example: logits (0.405, 0), weight +1.5, alpha 0.1 moves probabilities from 0.60/0.40 to about 0.556/0.444 (illustrative).
- The log divides by pi(a): rarely chosen actions get a bigger push when they work.
- Fix 1, reward-to-go: use G_t (return from step t on), because earlier rewards are noise. Fix 2, baseline: subtract b(s); no bias because E_a[grad log pi] b(s) = b(s) grad(sum_a pi) = 0. With b(s) = V(s), the weight G_t - V(s) is the advantage.
- Why it matters: all our returns are negative, so without a baseline even a better action (-1.5) would be pushed down.

### 118. Step 7: advantage and GAE

- Advantage = how much better or worse an action did than the critic expected. Simplest: A_t = G_t - V(s_t).
- One-step form (TD): delta_t = r_t + gamma V(s_{t+1}) - V(s_t). Low noise, some bias (V can be wrong). Example (gamma 0.9): V(s_t) = -3.0, r_t = -0.5, V(s_{t+1}) = -1.0 gives +1.6.
- GAE (Schulman et al., 2015; verify): A_t = delta_t + (gamma lambda) delta_{t+1} + (gamma lambda)^2 delta_{t+2} + ... lambda = 0: one-step only; lambda = 1: G_t - V. Common default about 0.95 (verify).
- Advantages are normalized across the batch.
- Reference checks: delta = -1.0 + 0.9 x (-0.5) - (-2.0) = +0.55; lambda = 0 means one-step only (low noise, more bias).

### 119. Steps 8 and 9: big updates and the clip

- Problem: data and advantages belong to the old policy; a big update makes them stale, gives a worse policy, which collects worse data; performance can collapse.
- Ratio r = pi_new(a|s) / pi_old(a|s). Objective L = min(r A, clip(r, 1-eps, 1+eps) A), eps about 0.2.
- Examples (eps 0.2): A +1.5, r 1.5 gives 1.80 (capped); A -1.5, r 0.5 gives -1.20 (still penalized). Checks: A +2.0, r 1.4 gives 2.4; A -2.0, r 1.4 gives -2.8 (min keeps the full penalty).
- The clip removes the incentive for big changes rather than forbidding them. It allows several epochs on one batch.

### 120. Step 10: the PPO loop and knobs

- Loop: collect rollout, critic values, GAE advantages (normalized), several epochs of minibatch updates, discard the batch, repeat.
- Loss = -(clipped objective) + c1 (value loss) - c2 (entropy).
- Knobs (typical starts, verify): learning rate 3e-4, n_steps 2048, minibatch 64, epochs 10, clip 0.2, gamma 0.99, lambda 0.95, entropy 0 to 0.01, value coef 0.5, network 64x64.
- For our agent: 2048 steps is about 17 episodes of 120 steps; sweep gamma {0.95, 0.98, 0.99, 0.992}; same tuning budget for every arm with a grid-edge check; recurrent arms need extra tuning care; at least 10 seeds with bootstrap intervals; monitor return, value loss, entropy and clip fraction.

### 121. Step 11: connection to the IoT agent

- Chain: window -> frozen viewers -> DS belief -> observation [belief | window by segment | last action | context] -> actor -> softmax over ladder -> action -> environment -> reward -> critic -> GAE -> clipped update. PPO trains only actor and critic.
- Arms G1 to G5 differ only in observation content and memory.
- Tools: Stable-Baselines3 PPO, sb3-contrib RecurrentPPO and MaskablePPO (verify masks and recurrence can be combined).

### 122. Open items and next steps

1. Study next: PPO vs DQN (on-policy vs off-policy), formal belief-in-PPO recap, world models and MBRL, experiment design (possible Session 3 layout: DQN vs PPO plus belief recap).
2. Postponed Session 1 decisions: episode end and U response, window and step, action-effect numbers, device-selection rule, per-protocol mapping, reward weights, sanity-check baselines (random, rule-based, oracle).
3. Verify all defaults and formulas against the PPO paper and SB3 docs.
4. Carry forward all open items from earlier sections.


---

## UPDATE — 19 November 2026 (continued, new section only; everything above is unchanged)

### 123. PPO QUICK REFERENCE (plain words first; read this section when asked about PPO)

**Status:** consolidates Session 2 (Sections 105 to 121) into one fast reference, with the points that caused confusion fixed. Numbers in examples are made up to show the idea (illustrative). Items marked (verify) are general knowledge not checked against the PPO paper or Stable-Baselines3 docs.

---

#### A. PPO in five sentences

1. The agent plays many episodes and gets scores.
2. For each action it asks: was this better or worse than I normally expect in this situation? (the advantage)
3. Better than expected: make that action more likely. Worse: less likely.
4. Do this in small steps so the policy never changes too much at once (the clip).
5. Repeat.

Everything else in PPO is detail to make these five sentences precise.

---

#### B. The glossary (one line each)

| Word | Plain meaning | Where from |
|---|---|---|
| Policy (actor) | the decision rule: observation in, probability per action out (softmax) | Step 3 |
| Episode | one complete run, e.g. 10 min = 120 steps at 5 s | Step 2 |
| Return | the total score of the episode, discounted by gamma | Step 2 |
| Gamma | patience factor: return = r1 + r2 x gamma + r3 x gamma^2 + ... | Step 2 |
| Value (critic) | the critic's prediction: "from this situation I expect a total score of about X" | Step 5 |
| Advantage | real score minus the critic's expectation | Step 7 |
| Ratio | new probability of the action divided by old probability | Step 9 |
| Clip | speed limit: no extra credit for moving an action's probability more than about 20% per update | Step 9 |
| Entropy | how spread out the probabilities are; high = still exploring | Step 4 |
| Rollout / batch | the block of steps collected before each update | Step 10 |

---

#### C. Two names that must NOT be mixed

| Symbol | Job |
|---|---|
| **gamma** (0.9, 0.99) | the patience factor: later rewards count less. Return = N1 + N2 x 0.9 + N3 x 0.9^2 ... This is the "0.9" factor. |
| **lambda** | a noise-vs-accuracy dial used only inside the advantage estimate (GAE). Ignore it until tuning; default about 0.95 (verify). |

Rule of thumb for gamma: gamma = 1 - 1/H, where H = how many steps ahead the consequences still matter (H = 120 gives 0.992). Sweep {0.95, 0.98, 0.99, 0.992}.

---

#### D. Where the advantage comes from (nobody gives it)

> **Advantage = what actually happened - what the critic expected.**

Example: an attack is underway; the critic expects -3.0 from this situation.

| Action tried | Real score after it | Expected | Advantage |
|---|---|---|---|
| wait | -3.0 | -3.0 | 0 (as expected) |
| rate-limit | -1.5 | -3.0 | +1.5 (better) |
| block | -2.0 | -3.0 | +1.0 (better) |

- The real score comes from the environment's reward (costs for missed attack traffic, cut legitimate traffic, heavy actions).
- The expectation comes from the critic, a network that learns "in this kind of situation scores usually come out around X".
- Early in training the critic guesses badly, so advantages are noisy; later they become meaningful. This is why actor and critic are trained together.
- Why subtract at all: all our scores are negative, so without subtraction even the best action (-1.5) looks bad and would be pushed down. Subtracting recenters scores around "normal".
- Check answer: expected -2.0, real -2.5 gives advantage -0.5, so the policy pushes that action down.

---

#### E. Why the update divides by the action's probability (the "fairness" idea)

Say the policy has 3 actions: wait 0.6, rate-limit 0.3, block 0.1. Over 100 episodes they are tried about 60, 30 and 10 times.

**Case 1: all equally good (advantage +1).** Push = tries x advantage = 60, 30, 10. Wait gets 6 times more push than block only because it is tried more; the policy would drift toward wait for no reason. Dividing by the probability: 60/0.6 = 30/0.3 = 10/0.1 = 100. Equal, which is correct.

**Case 2: not equally good (advantages wait +1, rate-limit +2, block +3).**

| Action | Tries | Push without the fix | Push with the fix (divide by probability) |
|---|---|---|---|
| wait | 60 | 60 | 100 |
| rate-limit | 30 | 60 | 200 |
| block | 10 | 30 | 300 |

Without the fix the best action gets the smallest push, only because it is rarely tried. With the fix the push follows how good each action is.

This division is the "grad log pi" (divided-by-itself) term in the math. "Average" means doing this over many episodes so luck cancels out. (Simplified picture: the real formula pushes the network's raw scores (logits) rather than probabilities directly, but the idea of the division is the same. The library computes it.)

Check (not yet answered by the user): probabilities 0.5, 0.4, 0.1 and all advantage +1: tries 50, 40, 10; push after dividing 50/0.5 = 40/0.4 = 10/0.1 = 100.

---

#### F. How one update changes the probabilities (the nudge)

Example: wait 0.60, rate-limit 0.40; the agent sampled rate-limit and it had advantage +1.5. The weights move a little toward making rate-limit likelier: probabilities become about wait 0.56, rate-limit 0.44. Over thousands of updates the policy might settle near wait 0.10, rate-limit 0.85. The size of the nudge follows the size of the advantage: a big win moves the probabilities more than a small one. (Illustrative.)

For a softmax policy the direction on the raw scores is: (1 for the chosen action, 0 for the others) minus (the current probabilities). Example (wait 0.60, rate-limit 0.40, sampled rate-limit): wait -0.60, rate-limit +0.60.

---

#### G. Why big updates break learning, and the clip

**Problem:** the batch and its advantages describe the old policy. If one update changes the policy a lot, they no longer apply; the new policy is worse, collects worse data, and learning can spiral down and not recover. (Picture: a guard who panics after one bad night and rewrites his whole routine.)

**Fix:** measure the change with the ratio r = new probability / old probability (r = 1.2 means 20% likelier). PPO's clip (eps about 0.2) stops rewarding changes beyond about +-20%, so the policy cannot run far from the policy that collected the data. The clip removes the incentive; it does not strictly forbid a big move. Side benefit: the same batch can be reused for several passes (epochs).

| Case (eps 0.2) | Advantage | Ratio | Value used | Meaning |
|---|---|---|---|---|
| good action, small change | +1.5 | 1.1 | 1.65 | still learning |
| good action, moved a lot | +1.5 | 1.5 | 1.80 | capped: no extra credit |
| bad action, moved a lot (down) | -1.5 | 0.5 | -1.20 | still penalized |
| good action, ratio 1.4 | +2.0 | 1.4 | 2.4 | capped |
| bad action made likelier | -2.0 | 1.4 | -2.8 | min keeps the full penalty |

The min keeps the objective pessimistic: it never lets clipping make a mistake look better than it is.

---

#### H. The loop

1. Collect: run the current policy for N steps, saving observation, action, reward and the action's probability.
2. Critic gives a value for every step.
3. Compute advantages (GAE, then normalized across the batch).
4. Update for several epochs on small minibatches: policy loss (clipped) + value loss + entropy bonus.
5. Throw the batch away (PPO is on-policy: after the update the policy moved, so the old batch is stale) and repeat.

Loss = -(clipped objective) + c1 x (value loss) - c2 x (entropy).

---

#### I. The knobs (starting points to tune; verify against SB3 docs)

| Knob | Typical start | Meaning |
|---|---|---|
| learning rate | 3e-4 | size of each weight step |
| n_steps (rollout) | 2048 | steps collected per update (about 17 episodes of 120 steps for us) |
| minibatch size | 64 | steps per gradient step |
| epochs | 10 | passes over each batch |
| clip range | 0.2 | allowed ratio change |
| gamma | 0.99 (sweep ours) | patience |
| GAE lambda | 0.95 | advantage noise/bias dial |
| entropy coef | 0 to 0.01 | exploring pressure; raise it if entropy collapses early |
| value coef | 0.5 | weight of the critic loss |
| network | 64 x 64 | hidden layers |

Fairness rules for G1 to G5: same tuning budget and search ranges for every arm; grid-edge check on every tuned value; recurrent arms need extra care (hidden size, sequence length); at least 10 seeds with bootstrap intervals; monitor return, value loss, entropy and clip fraction.

---

#### J. How it connects to our IoT agent

```
traffic window -> frozen viewers (EDL, GRU residual, MMPP)
   -> DS belief module (fusion, K, Omega, memory k)
   -> observation = [belief | window by segment | last action | context]
   -> actor -> softmax over the ladder -> action
   -> environment reacts -> reward + next window
   -> critic V -> advantage -> clipped PPO update of actor and critic
```

- PPO trains only the actor and the critic. The viewers, DS rules and memory rule are frozen and tuned beforehand; PPO learns to use the belief, not to change it.
- Arms G1 to G5 differ only in the observation (nothing extra, fused belief, raw viewer outputs) and memory (feed-forward or LSTM). Same PPO, same loop, same ladder.
- Exploration lives in the policy (sampling plus the entropy bonus), not in a separate model. A world model, if used (model-based arm), only supplies extra practice data.
- Tools: Stable-Baselines3 PPO (G1, G3, G5), sb3-contrib RecurrentPPO (G2, G4), MaskablePPO for action masks (verify that masks and recurrence can be combined). The real work is the Gymnasium environment: traffic source, action effects, device-selection rule, reward, episode end, belief module.

---

#### K. Optional: the equations (not needed to use PPO; the library computes them)

- Goal: maximize J = average return. Policy gradient: grad J = E[ sum over steps of grad log pi(a|s) x weight ].
- The log appears because grad P = P x grad log P turns a sum back into an average we can sample, and because the log of a product is a sum, so the environment terms vanish (the method is model-free).
- The weight is the advantage A (reward-to-go minus a baseline V(s); subtracting a baseline adds no bias on average and removes noise).
- One-step advantage: delta = r + gamma x V(next) - V(now). GAE blends one-step, two-step ... versions with lambda: A = delta_t + (gamma lambda) delta_{t+1} + (gamma lambda)^2 delta_{t+2} + ...
- Clipped objective: L = min( r A , clip(r, 1-eps, 1+eps) A ), r = pi_new / pi_old.
- Reference: Schulman et al. (PPO 2017, GAE 2015) (verify citations).

---

#### L. Fast answers to likely questions

| Question | Short answer |
|---|---|
| Does PPO contain exploration? | No separate part: exploration is the policy's sampling; PPO's entropy bonus keeps it alive. |
| Does PPO contain the belief? | No. The belief is computed outside PPO and fed in as input numbers. |
| Does PPO change the viewers or DS? | No. They are frozen; PPO changes only actor and critic weights. |
| Where does the advantage come from? | Real score minus the critic's expectation. Nobody provides it. |
| Is the discount gamma or lambda? | Gamma. Lambda is only the advantage-estimation dial. |
| Why a critic? | To give the "expected score" that turns raw negative scores into better/worse-than-usual. |
| Why train in a simulator? | Recorded traffic cannot react to actions, and bad exploratory actions harm nobody there. |
| Why throw the batch away? | The policy has moved; old data and advantages are stale (on-policy). |
| Is PPO run live in the hub? | No. It runs during training and upgrades; the frozen policy acts live (usually picking the top action). |
| PPO vs DQN? | Not studied yet (planned Session 3). |

---

#### M. Open items

1. Study next: PPO vs DQN (on-policy vs off-policy) and the formal belief-in-PPO recap (possible Session 3); then world models and MBRL; then experiment design.
2. Postponed Session 1 decisions: episode end and U response, window and step, action-effect numbers, device-selection rule, per-protocol mapping, reward weights, sanity-check baselines (random, rule-based, oracle).
3. The user reported low confidence in Steps 9 to 11 and the policy-gradient math; revisit with one tiny example per idea (the nudge, the advantage, the clip) if still unclear.
4. Verify all defaults and formulas against the PPO paper and SB3 docs.
5. Carry forward all open items from earlier sections.


---

## UPDATE — 20 November 2026 (new section only; everything above is unchanged)

### 124. 6G: what was found, what is safe to use, and where it fits the PhD

**Status:** first-pass research (about six web searches, snippet and abstract level, nothing read in full). Verification levels: READ = abstract or snippet seen; VERIFY = check against full text or the 3GPP document before citing. Items marked (suggestion) are my reasoning, not findings. Earlier 6G notes in this chat (speed, delay, density figures) came from memory and are NOT sourced.

#### A. Corrections to earlier statements
1. The "security layer that tests graded actions" idea is the roadmap's digital twin (old Paper 3), not 6G's AI. Do not attribute it to 6G.
2. "6G AI is mostly for performance, not security" was too narrow. The literature treats AI in 6G as both a performance tool and a security tool, and also as a new attack surface ("double-edged sword").
3. Starlink-type low-orbit satellites have much lower delay than old high-orbit ones (my earlier "long delay" was outdated; figures from memory, VERIFY). Satellite internet (a dish plus router) and 3GPP non-terrestrial networks (satellite as a cell tower for small devices) are different things.
4. A bandwidth cap works best against floods. It fails against exploits (small harmful message) and botnets (many small senders). This is why the agent reads behavior, not only volume.

#### B. Timeline (READ; VERIFY against 3GPP before citing)
| Item | Finding | Source |
|---|---|---|
| Release 20 | 6G scenarios and requirements study approved at RAN#112 in June 2026 (TR 38.914); working-group studies conclude June 2027; 14 6G study items | 3GPP Rel-20 highlights (Samsung, Oct 2026); ComSoc blog 16 Jun 2026 |
| Release 21 | first 6G specifications plus 5G-Advanced; 6G Work Item for 6G Radio due March 2027 | ComSoc; Qualcomm OnQ (June 2026) |
| Core network | 6G core architecture (signaling, security, AI-native core) in Stage-2, due June 2028 | ComSoc |
| Spec freeze | 2029 | Qualcomm |
| Commercial | estimate: first networks late 2028 to early 2029, worldwide 2029 to 2030 | arXiv 2407.09398 (estimate, not a commitment) |
| Radio | one new, non-backward-compatible 6G radio; bandwidths 3 to 400 MHz; 5G channel codes largely reused | Rel-20 highlights; ComSoc |

Sources disagree slightly in wording on freeze milestones; quote the 3GPP page itself. Plain meaning of "non-backward-compatible": the 6G radio does not have to work with old devices, so 5G and 6G will run side by side for years; old LTE-M and NB-IoT devices stay in the field (suggestion).

#### C. Technology notes
- **Reviews of early 3GPP work:** AI has become a primitive across every stage; non-terrestrial access has moved from overlay to substrate (arXiv 2610.05694, abstract level).
- **ISAC (radio also senses like radar):** 23 ISAC use cases accepted in Rel-20 6G studies; Rel-20 5G-Advanced includes UAV sensing with a base station in monostatic mode; ISAC over NTN is not in the Rel-20 SA2 6G study scope (arXiv 2604.11593). Use cases from 3GPP SA1: factory robot guidance, contactless health monitoring. Link to us (suggestion, untested): sensing could become an extra viewer; sensing also raises privacy risk.
- **Ambient IoT (battery-free, energy harvesting):** Rel-18 study, Rel-19 study plus work item (indoor inventory and command), Rel-20 extends to higher-power device types (up to a few hundred microwatts) and outdoor cases (arXiv 2312.06569, 2506.11828, 2412.21077). No security analysis of ambient IoT found.
- **Digital twin:** real-time mirror of the network used to simulate and test decisions before deploying them (arXiv 2506.01609); what-if and policy experimentation (ATIS Next G panel, April 2026); survey splits passive monitoring twins from active control twins (arXiv 2608.12267). A network twin simulates the network; our world model simulates traffic reactions to defense actions (related, not the same).
- **NTN:** satellites as part of the same network; see correction 3.

#### D. 6G security literature (READ at abstract level; VERIFY full text)
| Work | What it does | Relation to our work |
|---|---|---|
| Barua et al., unified security and privacy framework for AI-native 6G (arXiv 2607.01019, Jul 2026) | cross-layer threat taxonomy (includes identity spoofing, adversarial AI in zero-trust, key compromise) | supports Backup D and the spoofing thread |
| Hussain et al., AI-native closed-loop security for 6G cyber-physical systems (arXiv 2606.08173, Jun 2026, survey of 128 studies, submitted to IEEE COMST) | sense, detect, mitigate, learn loop at edge and radio tiers | conceptually closest to "believe and act"; operator and CPS focus; read full text |
| Damasceno et al., zero-day attack detection in 6G with tree-based models (SMC 2026) | notes aggregate metrics can hide poor zero-day performance and single datasets limit generalization | supports the held-out-family and cross-dataset protocol |
| Siamese + PPO zero-day IDS (arXiv 2609.26115) | already in roadmap | main "zero-day + PPO" overlap |
| MARL anomaly detection over 6G V2X (MUET) | MARL on 6G vehicular network | not IoT-home; related work |
| Edge learning for 6G-enabled IoT survey (arXiv 2306.10309) | centralized, federated and distributed learning for 6G-IoT security | supports Paper 2 motivation |

**Datasets:** no 6G-native labeled attack dataset found. 6G papers use existing ones (Kitsune, 5G-NIDD, UNSW-NB15, CSE-CIC-IDS2018). This confirms the dataset map: 6G is a portability test, not the base.

#### E. What is safe to use, and where
| Use | Where | Safe wording (suggestion) |
|---|---|---|
| Motivation: 6G will connect massive numbers of constrained IoT devices (ambient IoT in 3GPP) that cannot run defenses on board | proposal introduction | cite the 3GPP ambient-IoT work; avoid density numbers until TR 38.914 is read |
| New networks have no attack history, so novel attacks are the normal case | Paper 1 motivation | my reasoning; label as an argument, not a finding |
| Federated learning and digital twins are recognized 6G themes | Paper 2 and extension motivation | cite the surveys above |
| Cross-slice and cross-segment lateral movement | Paper 3 related work | Andreou et al. 2025 (CTDE cross-slice 6G, from earlier roadmap, VERIFY) |
| Adversarial AI as a 6G threat | Backup D | cite Barua et al. |
| Portability claim | title and abstract | "access-technology-agnostic, evaluated on Wi-Fi/IoT and 5G data, 6G as a motivating future case" |

**Do not claim:** that 6G is deployed or has data; any speed, delay or density number (not retrieved); that no 6G security work uses RL or belief (closed-loop and RL papers exist); "first" for anything in 6G security before the database sweep.

#### F. Positioning against 6G AI-native security
Operator-side AI security works on the network's view (call records, radio tiers). Our agent works at the home or device level with a belief, an explicit unknown state and graded response. In the snippets read, none combines these for IoT, but this is abstract-level only. Position the work as a response layer that complements the network's own AI, not a replacement.

#### G. Open items
1. Read TR 38.914 and the 3GPP Rel-21 timeline page; fix the requirement numbers (speed, delay, density) with sources.
2. Read Hussain et al. (closed-loop, arXiv 2606.08173) and Barua et al. (arXiv 2607.01019) in full; check whether any belief or unknown-state layer exists.
3. Search 6G or 5G/6G IoT security work using POMDP, belief, evidential or federated RL (database sweep, with the query strings from earlier updates).
4. Check ambient-IoT security and any 6G testbed or dataset again (5G-NIDD only so far).
5. Verify Starlink and 3GPP NTN delay figures and direct-to-device IoT status.
6. Decide where 6G sits: motivation paragraph, portability experiment (train on Wi-Fi/IoT, test on 5G-NIDD), or Paper 3 environment.
7. Carry forward all open items from earlier sections.

   
---
---

# UPDATE — 20 November 2026 (continued; new sections only; everything above is unchanged)

Three sections on 6G. Section 125 = what is known (sourced). Section 126 = literature motivation and assumptions. Section 127 = what we have in hand and how to link the thesis to 6G. This replaces the earlier draft Section 125. Verification: READ = text seen directly; ABSTRACT = abstract or snippet only; VERIFY = check before citing. Items marked (suggestion) are my reasoning, not findings.

---

## Section 125 — KNOWN: sourced facts about 6G (3GPP TR 38.914, NTN, ISAC)

### 125.1 The document and timeline (READ)
- 3GPP TR 38.914 "Study on 6G Scenarios and Requirements", Release 20, current version V20.1.0 (2026-09). Change history: v1.0.0 approved at RAN#112 (June 2026), 20.0.0, then an editorial-only 20.1.0 at RAN#113.
- It is a requirements document: it specifies targets, not algorithms. 3GPP says it can be shared with ITU-R as input to IMT-2030.
- Release 21 timeline agreed in June 2026 and carries the first normative 6G work (C114 report, secondhand). Open architecture and migration points were pushed to RAN#113 (Sept 2026, Madrid); I did not check what was decided. Spec-freeze and commercial dates remain estimates.

### 125.2 Numbers fixed from the report (READ)
| Item | Value |
|---|---|
| Connection density | minimum 10^6 devices per km² (urban massive-connection scenario) |
| User-plane latency | 4 ms (immersive), 1 ms (hyper-reliable low-latency); one-way, radio only, unloaded |
| Control-plane latency | 20 ms |
| Peak data rate | 36 Gbit/s down, 18 Gbit/s up (theoretical) |
| Reliability | 1 − 10^-5 for 32 bytes within 1 ms (indoor factory) |
| Sensing | detection probability 95%, false-alarm probability 5% (indoor factory, urban macro); localization 2 m (factory), 5 m (urban macro); velocity 2 and 4 m/s |
| Bandwidth | at least 400 MHz maximum; operation supported down to a 3 MHz allocation |
| Massive IoT (5.4.3) | FR1; at least 10 Mbps each way for the lowest-tier device; should not overlap Ambient IoT and NB-IoT; must coexist with NB-IoT and eMTC (LTE-M); no 2G/3G interworking |
| Lowest-tier device | 1 antenna; 20 MHz baseband and RF bandwidth |
| NTN orbits | VLEO (300–600 km) up to GSO; transparent or regenerative payload; TN and NTN design to be harmonized |

Do not use the 1 ms and 4 ms figures as hub-to-cloud delay: they are radio-interface targets only.

### 125.3 What the report says about security, privacy and AI (READ)
- Security (5.3.7): only integrity and confidentiality protection of control-plane and user-plane traffic over the air interface. Nothing on behavior-based detection of compromised devices.
- Privacy (5.2): collection of AI/ML and sensing data must be under operator control, with user consent, privacy and anonymity preserved.
- AI (5.1.18, 5.4.5): two directions, "Network for AI" (the network helps AI applications) and "AI for network" (AI improves the radio). Both are "should", with no numeric KPI. 5.4.5 is stronger: the architecture shall support efficient mechanisms for AI applications and shall support a lifecycle-management (LCM) framework. LCM is named but not defined in the report.
- Sensing (5.4.4): shall support detection and tracking of passive objects (UAV, human, vehicle, AGV); the sensing target is not connected to the network.
- The terms "digital twin" and "belief" do not appear in the sections I read (the document text was complete).

### 125.4 Starlink (Direct-to-Cell) vs 3GPP NTN — what is established
Technology only, not about any person. Main source: Wang et al., arXiv 2605.05843 (May 2026, TU Kaiserslautern/DFKI), full text read. One paper plus trade blogs; some of its figures have no clear source (VERIFY).
- **Direct-to-Cell (D2C), Starlink and AST SpaceMobile:** market-driven overlay that uses existing terrestrial mobile spectrum leased from operators (US FCC "supplemental coverage from space" framework) and unmodified 4G/5G handsets. Each satellite acts as a moving base station ("space tower").
- **3GPP NTN (Rel-17 to Rel-19):** standards-based, dedicated satellite spectrum (S-band, L-band, later Ka), needs NTN-aware chipsets, supports NB-IoT and eMTC over satellite, transparent and regenerative payloads.
- **The paper's comparison figures (VERIFY):** D2C latency 150–250 ms gateway-routed, 50–100 ms with inter-satellite links; NTN about 60 ms transparent, about 25 ms regenerative with inter-satellite links; uplink link margin 7.2 dB (D2C) vs 10.2 dB (NTN) in its own example budget.
- **Security (paper, citing two IEEE S&P papers; secondhand):** D2C has location leakage through timing-advance side channels and IMSI-catcher-style risks; NTN adds satellite-specific authentication.
- **Commercial status (trade sources, VERIFY):** about 650 Starlink direct-to-cell satellites and roaming in 32 countries (March 2026 trade blog); a battery-powered IoT tracker connected to Starlink D2C via One New Zealand (Feb 2026, vendor press release); Starlink states IoT is part of its D2C roadmap.
- **Correction flag:** that paper's release table labels Release 20 as "full 6G NTN integration, planned 2028". 3GPP's own pages (above) say Rel-20 is the 6G study plus 5G-Advanced, and Rel-21 carries the first normative 6G. Do not copy that table.
- **Plain difference:** D2C = a satellite pretending to be a cell tower for ordinary phones; NTN = a standard that treats the satellite as part of the network, with devices built for it. 6G aims to harmonize terrestrial and non-terrestrial (report 5.4.13), so the two are expected to converge, not compete forever.

### 125.5 ISAC (integrated sensing and communication) — what it is
- Plain picture: the network's radio signals bounce off objects, and the network reads the echoes like a radar while still carrying data. A base station can notice a drone or a person moving without that person carrying a phone.
- 6G reports sensing KPIs in radar language (detection probability, false alarm, localization, velocity), see 125.2.
- Privacy (Günlü et al., arXiv 2605.28325, ABSTRACT): sensing-derived data sorted into three levels: location and environment, behavior, physiology; challenges include consent, transparency, data ownership, profiling and exposure of bystanders.
- Security (Thapa and Nepal, arXiv 2601.01455, ABSTRACT): the dual-function waveform creates new risks, such as sensing targets acting as eavesdroppers; the security goal shifts toward trustworthiness of physical perception, not only data confidentiality.
- "Not Until It Is Secure" (arXiv 2503.15243, ABSTRACT): current security methods mostly protect the communication channel and overlook the sensing side.

### 125.6 Digital twins in 6G — what is known
- Used to monitor, simulate and test policies and AI models before deployment (O-RAN security review, arXiv 2603.21211).
- Same review: twins add attack surface. If the synchronization link is poisoned, replayed or time-distorted, the twin drifts from the real network and gives wrong risk assessments or unsafe control decisions.
- Model-poisoning attacks on distributed network twins are demonstrated, with a proposed defense (Zhang et al., IEEE IoT-J 2024).
- A digital-twin survey lists data tampering, low-quality data and desynchronization as twin threats (arXiv 2301.13350).
- Precedent for twin plus POMDP: Hammar and Stadler's CSLE platform estimates its observation distributions from digital-twin data (arXiv 2604.15590, ABSTRACT level).

### 125.7 Corrections to earlier notes
1. Radio bandwidth: "3 to 400 MHz" (Section 124) → at least 400 MHz maximum bandwidth, with a 3 MHz minimum allocation supported.
2. "6G AI is mostly for performance, not security": the report frames AI as "AI for network" and "network for AI" with no security-specific AI requirement.
3. Starlink delay was earlier given from memory; now only the paper's figures above, still VERIFY.
4. The "security layer that tests graded actions" is the roadmap's digital twin, not a 6G AI feature.

---

## Section 126 — LITERATURE MOTIVATION AND ASSUMPTIONS (what supports the thesis, and what is only assumed)

### 126.1 Motivation we can use (with the evidence level)
1. **Link protection is not behavioral protection.** The radio security requirement covers integrity and confidentiality over the air; a compromised but authenticated device is outside it (reading of 5.3.7; quote the clause exactly).
2. **Massive IoT keeps growing and stays heterogeneous.** 10^6 devices/km² target; 6G IoT is a mid-tier class, while NB-IoT, LTE-M and ambient IoT remain separate. Fleet scale and mixed device types are in the standard's own scenarios.
3. **New networks have no attack history.** My argument, not a finding: a new protocol or access type has no labeled attacks, so novel attacks are the normal case (supports Paper 1).
4. **Privacy and data minimization have a standards-side anchor.** The privacy and operator-control principle for AI/sensing data supports "raw traffic stays local". It does not endorse federated learning.
5. **AI lifecycle management is a recognized requirement.** Our train, shadow-check, release gate, rollback cycle is an instance of lifecycle management (analogy until the 3GPP LCM text is read).
6. **Satellite IoT is arriving.** NTN supports NB-IoT and eMTC; D2C trackers are demonstrated. Satellite-reached devices are remote, unattended and behind long links, which favors local decision-making (suggestion).

### 126.2 Weaknesses of the 6G story and how the thesis answers each
| Potential weakness | Evidence | How the thesis fixes it or complements it | Honest limit |
|---|---|---|---|
| "AI for network / network for AI" sounds like marketing | 5.1.18 is "should" with no numeric KPI; LCM is named but undefined | Treat as a placeholder; use only 5.4.5's concrete clauses (efficient AI mechanisms, LCM, privacy-preserving data collection) | We cannot claim 3GPP specifies AI security |
| 6G AI is itself an attack surface | GenAI/federated-learning poisoning in 6G (Son et al., ABSTRACT); twin and model poisoning (Zhang et al.) | Release gate (shadow mode plus twin test), frozen viewers, Byzantine-robust belief fusion as backup | Our own core papers exclude training poisoning from the threat model |
| Twin drift and simulation trust | O-RAN review; twin survey; the earlier MMPP dataset rejection | Calibrate the MMPP and action effects on real traces; use the twin for training augmentation only; final results on real held-out data; on-device shadow mode as an independent check that does not rely on the twin | Action effects are assumed (CICIoT2023 is passive) |
| The home scenario is not 6G-native | A Wi-Fi/Zigbee hub reaches 6G via fixed wireless access or a cellular uplink (report 5.4.8) | 6G is the motivating future case; the agent is access-technology-agnostic; evaluate on Wi-Fi/Zigbee and 5G data | No 6G dataset exists |
| 6G radio latency numbers invite misuse | Radio-only, unloaded | Our latency tests use end-to-end timing; detection delay dominates (Update 17) | Timings still assumed |
| Federated learning is not private | Update leakage is known | State privacy narrowly; optional secure aggregation or DP arm | No formal guarantee |
| ISAC adds data the thesis does not cover | Sensing data is a new privacy class | Say explicitly that raw-traffic locality does not cover sensing data; sensing is a possible extra viewer later | Out of core scope |
| Satellite links change timing | D2C 150–250 ms, NTN tens of ms (paper, VERIFY) | Still small next to detection delay in our latency model (Update 17); supports a local agent | Needs measured values |

### 126.3 "No belief algorithm" — the careful version
- TR 38.914 is a requirements document and names no algorithm for anything, so its silence proves nothing.
- Belief-based defense already exists in general cyber defense: POMDP intrusion response (Hammar and Stadler line, including an OT intrusion-response paper, arXiv 2609.10298, authors not captured), BF-PPO (Le and Stadler, CAGE-2, particle-filter belief), and Q-BIRD (non-Bayesian amplitude belief with PPO, vehicular).
- What I did not find, in this first-pass web search: belief-based defense in the 6G/IoT security papers read, with an explicit unknown-attack state. Safe wording: "not found in the 6G security work I reviewed", never "6G has no belief algorithm".
- Still unread in full: Hussain et al. (6G closed-loop security, 2606.08173) and Barua et al. (6G AI-native security, 2607.01019). They are the most likely to change this wording.

### 126.4 Assumptions we are making (flag each in the thesis)
1. 6G motivation is future-looking: no 6G deployment, dataset or attack record exists.
2. A home hub bridging Wi-Fi and Zigbee remains a valid scenario in 6G-era homes.
3. Novel attacks will be common on new access technologies (argument).
4. Pivot speed and satellite timing are scenario parameters, not measurements.
5. The 10^6/km² and sensing numbers are evaluation targets, not deployed performance.
6. Starlink/NTN figures come from one comparison paper and trade sources.
7. Twin results are simulated evidence until validated on real held-out data.

### 126.5 Corrections found in this round
- **Q-BIRD title:** arXiv 2606.07796 currently shows the title "Belief-Space Quantum-Inspired Reinforcement Learning for Partially Observable Autonomous Cyber Defense in the Internet of Vehicles" (method name Q-BIRD); earlier notes used a different title ("Amplitude-Belief …"). Verify against the arXiv page before citing. It reports that earlier IoV defenses used classical Bayesian belief models, which supports a "non-Bayesian belief" slot, relevant to our DS belief.
- The Wang et al. release table conflicts with 3GPP's own timeline (see 125.4).

---

## Section 127 — WHAT WE HAVE IN HAND, AND HOW TO LINK THE THESIS TO 6G

### 127.1 Assets we already have (map to 6G themes)
| Our asset | Where it came from | 6G link |
|---|---|---|
| Belief-driven agent, explicit unknown state, graded ladder | Papers 1 and belief sessions | Response layer for behavioral compromise, which radio security (5.3.7) does not cover |
| Federated training, non-IID study | Paper 2 | "Network for AI": periodic weight updates the network must carry; privacy principle in 5.2 |
| Release gate: twin test plus on-device shadow mode, rollback | Update 12/13 notes | Matches AI lifecycle management (5.4.5); shadow mode guards against twin drift |
| Cross-protocol pivot defense | Paper 3 | Heterogeneous access (Wi-Fi, Zigbee, cellular, satellite) behind one hub |
| Access-technology-agnostic features | Dataset design principle | Portability: train on Wi-Fi/IoT, test on 5G-NIDD, 6G as future case |
| Latency kill test | Update 17 | Satellite and cloud links add tens to hundreds of ms; detection delay still dominates |
| DS belief with Omega, K, U | Belief sessions | Fits "behavior of authenticated devices is not what the radio checks" |
| Radar background (Pd, Pfa, birth/death/clutter) | Earlier LMB and identity work | Same vocabulary as 6G sensing KPIs; possible sensing viewer (extension) |
| Byzantine-robust belief fusion (backup) | Candidate 2 | Answers poisoning of AI in the network and of federated updates |

### 127.2 Where 6G sits in the thesis (recommendation, suggestion)
- Introduction: one motivation paragraph (126.1).
- Paper 1: novelty argument for new networks (item 3), cited as an argument.
- Paper 2: "network for AI" framing of federated rounds; measure bytes per round (Idea 16 break-even).
- Paper 3: heterogeneous access behind a hub; satellite as one more access type in the threat model.
- Evaluation: portability test Wi-Fi/IoT to 5G-NIDD; 6G only as a stated future case.
- Not Paper 3's environment and not a dataset claim.

### 127.3 The twin — the important part
1. **What the twin is for us:** a simulator of the home and its traffic where defense actions can be tried safely; it supplies the interactive environment that static datasets cannot (Paper 1 environment) and is also the server-side half of the release gate.
2. **Why it is a weak point:** (a) simulation trust, the same objection as the earlier MMPP dataset; (b) twin drift if its data feed is poisoned or stale; (c) the twin itself becomes an attack surface.
3. **How the design answers it:** calibrate MMPP and action effects against real traces; keep the twin as training augmentation, never as the final proof; final numbers on real held-out data; independent on-device shadow mode so a drifted twin cannot approve a bad model alone; report per-home results.
4. **Precedent:** Hammar and Stadler's platform builds its POMDP observation distributions from a digital twin; 6G twin literature shows the same pattern at network level.
5. **Open:** how the twin is refreshed from real data without opening a poisoning path.

### 127.4 AI weakness — the honest version
- 6G AI (and ours) can be attacked: poisoned training data, poisoned federated updates, manipulated twin data, evasion by an adaptive attacker.
- Our core papers currently exclude training poisoning and attacks on the belief channel. That must be stated as a limit, with Backup D (robustness of the defender) and Candidate 2 (lying beliefs) as the planned extensions.
- The adaptive-mimicry attacker has not been tested against the toy filters or the belief module.

### 127.5 Radar-like ISAC and the thesis (suggestions, untested)
- Same language as our radar background (detection, false alarm, localization, tracking); the earlier PMB/LMB identity line used the same ideas.
- Possible later viewer: sensing-derived presence or motion as an extra independent evidence source in the belief panel.
- Risk: sensing data is more privacy-sensitive than traffic summaries, so federation does not make it harmless; the privacy claim must stay narrow.
- Not in the core plan: our scenario is a home hub, not a base station.

### 127.6 Privacy — wording to use
"Raw traffic stays on the device or hub (data minimization). No formal privacy guarantee is claimed. Federated updates can leak information, and 6G sensing data (location, behavior, physiology) is an additional privacy class not covered by this work."

### 127.7 Starlink vs 6G NTN — how it touches the thesis
- Satellite-reached IoT devices are remote and unattended: a local agent that keeps a belief fits better than one that needs a cloud round trip (suggestion).
- Satellite and cloud links add delay, but our latency test says detection delay is the dominant term; measure real satellite round trips before claiming anything.
- D2C and NTN will converge (report 5.4.13; Wang et al.), so the agent should not assume one access type: another reason for access-agnostic features.
- Security difference (D2C location leakage vs NTN authentication, secondhand) is a motivation for a behavioral layer; not a result of ours.

### 127.8 Presentation ideas (slides)
1. **6G in one slide:** what is fixed (TR 38.914, June 2026) and what is not (security algorithms, AI mechanisms).
2. **The gap slide:** radio protects the link, nobody checks behavior of authenticated devices.
3. **AI cuts both ways:** 6G AI helps and is itself an attack surface (poisoning, twin drift); our release gate and shadow mode answer it.
4. **Federated rounds are AI traffic:** network for AI; bytes per round as a measured cost.
5. **Twin slide:** what it gives, how it can drift, how we validate on real data.
6. **ISAC slide:** radar-like sensing, a new privacy class, scoped out of the core.
7. **Satellite slide:** D2C vs NTN in two lines, with the timing caveat.
8. **Honest limits slide:** no 6G dataset, assumed timings, no "first" claims.

### 127.9 Likely committee questions (short answers)
| Question | Answer |
|---|---|
| Is this about 6G? | No. The agent is access-agnostic; 6G is the motivating future case and a portability test on 5G data. |
| Isn't "AI for network" already covering security? | In TR 38.914 it targets radio performance and has no security requirement; I quote the clauses and do not claim more. |
| Isn't your twin just a simulator you trust? | Calibrated to real traces, used for training only, final results on real held-out data, plus an on-device shadow check. |
| What if the AI itself is attacked? | Stated limit; backup contributions cover poisoning and lying beliefs. |
| Why not use the 6G network's own AI? | It optimizes the radio; our agent responds to device compromise at the home level. They complement. |
| Do 6G latency numbers help your latency argument? | No: they are radio-only; our test uses end-to-end timing. |
| Does ISAC threaten your privacy claim? | Yes, a new data class; stated as outside the claim. |

### 127.10 Forgotten or newly flagged points
1. A bandwidth cap works against floods but not exploits or botnets; this is why the agent reads behavior.
2. The 6G radio numbers are not end-to-end numbers.
3. Home hubs are not 6G-native; 6G reaches them via fixed wireless access or cellular uplink.
4. The report has no numeric AI target; treat "AI" clauses carefully.
5. Wi-Fi sensing in homes exists as an idea, but I did not verify it here; do not mention it without a source.
6. Starlink-type satellite internet (dish plus router) and 3GPP NTN for small devices are different things; keep them apart in the text.
7. The earlier Q-BIRD title mismatch needs checking.

### 127.11 Open items
1. Read Hussain et al. (2606.08173) and Barua et al. (2607.01019) in full; search again for 6G IoT security work with belief, POMDP, evidential or federated RL (database sweep).
2. Read the 3GPP LCM description to source the lifecycle stages.
3. Check RAN#113 outcomes (architecture, migration).
4. Verify the Starlink and NTN figures and the Wang et al. security claims against the IEEE S&P papers it cites.
5. Verify the Q-BIRD title and the OT intrusion-response paper (arXiv 2609.10298) authorship.
6. Measure real satellite and hub round-trip times before using them in the latency model.
7. Decide whether ISAC sensing stays an extension or is dropped from the plan.
8. Carry forward all open items from earlier sections.

---

## UPDATE — 23 November 2026 (new section only; REPLACES Section 124; everything else above is unchanged)

### 125. 6G: consolidated reference (numbers, timeline, security literature, sources, what we explained)

**Status:** research notes, not final claims. This replaces Section 124, which contained numbers from memory that turned out wrong. Verification levels used below:
- **READ-FULL**: full text read in this chat.
- **READ-PART**: part of the full text read (the fetch tool truncates long PDFs).
- **ABSTRACT/SNIPPET**: only an abstract or search snippet seen.
- **MEMORY**: from my background knowledge, not checked.

**Rule for the proposal:** cite standards documents (3GPP TR 38.914, ITU-R M.2160) for numbers, never survey papers. Even the surveys disagree with each other on the headline numbers.

---

#### A. Corrections to things said earlier in this chat

| # | Earlier statement | Correction |
|---|---|---|
| 1 | "6G target: 1 Tbps peak rate" | 1 Tbps is a common target in the literature, not the ITU or 3GPP number. The 3GPP minimum is 36 Gbit/s downlink. |
| 2 | "0.1 ms latency" | 0.1 to 1 ms is the ITU research range over the air. The 3GPP minimum is 4 ms (immersive) and 1 ms (hyper-reliable low latency), and it is the radio's contribution only, not end-to-end. |
| 3 | "10^7 devices per km^2" | The 3GPP minimum is 10^6 per km^2, the same as the 5G figure. The ITU range is 10^6 to 10^8, as research targets. |
| 4 | "6G IoT will be denser and lower power" | Not supported as a 3GPP minimum. See section D. Battery-free and low-power devices stay on separate technologies (ambient IoT, NB-IoT, eMTC). |
| 5 | "No security analysis of ambient IoT found" | Wrong. 3GPP SA3 has Rel-19 and Rel-20 ambient-IoT security work (section D). |
| 6 | "6G AI is mostly for performance, not security" | Too narrow. The literature treats AI in 6G as a performance tool, a security tool and an attack surface. |
| 7 | "Security layer that tests graded actions" attributed to 6G | That was the roadmap's digital twin idea (old Paper 3), not 6G AI. |
| 8 | "Long satellite delay" | Outdated for low-orbit constellations (figures from MEMORY, not verified). Satellite internet (dish plus router) and 3GPP non-terrestrial networks (satellite as a cell tower for small devices) are different things. |
| 9 | "Andreou et al. = CTDE cross-slice defense" | Only the abstract was seen. The keywords say MAD-DPG, and the abstract does not say CTDE. The setting is virtualized SDN clouds, not IoT. |
| 10 | "A Z-Wave dataset review is from 2026" (Update 8) | It is from 2025 (already noted in Update 19). |
| 11 | "Damasceno et al." as author of the 6G zero-day tree-based paper (Section 124) | The author name was not verified. The source is an SMC 2026 PDF at www.cin.ufpe.br/~amb4/assets/smc2026Gabi.pdf. Cite by title only until checked. |

---

#### B. Verified numbers (3GPP TR 38.914 V20.1.0, Sept 2026, READ-FULL)

The report is a study report. Its KPI targets combine targets from the draft ITU-R performance-requirements report with 3GPP-specific requirements. The ITU final minimum requirements are still being defined.

| KPI | 3GPP minimum (TR 38.914) | ITU research target (M.2160, via secondary sources) |
|---|---|---|
| Theoretical peak data rate | DL 36 Gbit/s, UL 18 Gbit/s (derived assuming 600 MHz aggregated bandwidth; the bandwidth itself is not part of the requirement) | 50 / 100 / 200 Gbit/s as examples; 5G was 20 Gbit/s |
| Peak spectral efficiency | DL 60 bit/s/Hz, UL 30 bit/s/Hz | 1.5x to 3x of 5G |
| 5th percentile user rate | Dense urban: DL 300 Mbit/s, UL 50 Mbit/s | not retrieved |
| Area traffic capacity | DL 40 Mbit/s/m^2 (indoor hotspot) | 30 and 50 Mbit/s/m^2 (5G: 10) |
| User-plane latency | 4 ms for immersive communication, 1 ms for hyper-reliable low-latency; radio contribution only, unloaded | 0.1 to 1 ms over the air (5G: 1 ms) |
| Control-plane latency | 20 ms | not retrieved |
| Connection density | 10^6 devices per km^2 (urban massive-connection scenario) | 10^6 to 10^8 per km^2 (1 to 100 times 5G) |
| Reliability | 1 - 10^-5 for a 32-byte packet within 1 ms, at coverage edge, indoor factory | 1 - 10^-5 to 1 - 10^-7 |
| Mobility | classes up to high-speed vehicular (120 to 500 km/h); airplane class 500 to 1000/1200 km/h (3GPP internal KPI) | 500 to 1000 km/h |
| Bandwidth | at least 400 MHz (6G channel); the 7 GHz base station supports 400 MHz | not retrieved |
| Positioning (horizontal) | indoor factory 0.75 m, urban macro 6 m; vertical 3 m (80%) | not retrieved |
| Sensing | detection 95%, false alarm 5%; localization 2 m (factory) / 5 m (urban macro); velocity 2 / 4 m/s | not retrieved |
| Coverage | reuse the 5G 3.5 GHz site grid at about 7 GHz; basic coverage MaxCL 143 dB; extended 153 dB | not retrieved |

**Reading the table (honest summary):**
- On paper the 3GPP minimums are a moderate step over 5G: peak rate about 1.8x, 400 MHz channels, higher spectral efficiency, sensing and AI requirements, harmonized terrestrial and satellite design. The "Tbps, 0.1 ms, 10^7" figures are vision targets, not minimum requirements.
- ITU itself says the target ranges apply only to some usage scenarios and may not be reached simultaneously.
- Not retrieved: 4G (LTE-A) comparison figures. The earlier 4G column is unverified.

**Massive IoT in 6G (TR 38.914 clauses 5.3.2, 5.4.3, 5.1.20):**
- Supported in FR1; the lowest-tier device has minimum 1 antenna and a PHY peak rate of 10 Mbit/s in each direction.
- It should not overlap with ambient IoT and NB-IoT. 6G must coexist with NB-IoT and eMTC.
- The smallest maximum device channel bandwidth is 20 MHz (TDD with 30 kHz SCS, or FD-FDD with 15 kHz SCS).
- Extended coverage MaxCL 153 dB for the lowest-tier IoT device, in sub-3 GHz frequencies.
- Security requirement is generic: integrity and confidentiality protection for control and user plane over the radio interface (clause 5.3.7).

**Orbit types in the report (non-terrestrial networks):** VLEO 300 to 600 km, LEO 600 to 2000 km, MEO 2000 to about 35,000 km, GSO about 35,786 km.

---

#### C. Timeline (3GPP Rel-20 highlights, Oct 2026; READ-FULL, but the PDF is a draft with editor notes: "edits not yet OK'd")

| Item | Date |
|---|---|
| TR 38.914 (6G scenarios and requirements) approved | RAN#112, June 2026 |
| Rel-20 working-group 6G studies conclude | June 2027 |
| Rel-20 5G-Advanced Stage-3 freeze | March 2027 |
| 6G work item approval (Rel-21) | RAN#115, March 2027 |
| Rel-21 Stage 1 freeze | March 2027 |
| Rel-21 Stage 2: 80% checkpoint / freeze | March 2028 / June 2028 |
| Rel-21 Stage 3 freeze | December 2028 |
| Rel-21 ASN.1/OpenAPI freeze | March 2029 |
| 3GPP submission to ITU: partial self-evaluation / final self-evaluation | June 2028 / February 2029; specifications submitted in 2030 |
| RAN#114 (December 2026) | decides migration study scope; approves self-evaluation study |
| Commercial launch | estimate only: late 2028 to 2030 (arXiv 2407.09398); not a standard commitment |

**Migration and compatibility (READ-FULL):**
- 6G radio is one new, non-backward-compatible radio with standalone architecture.
- Multi-RAT spectrum sharing (MRSS) lets 5G NR and 6G share a carrier; 5G devices keep being served. Control-channel sharing keeps the overhead increase to a few percentage points in the reported inputs.
- Interworking with 3G and 2G is not supported; 6G must support inter-RAT mobility with NR, idle-mode mobility with LTE, and coexistence with LTE up to 20 MHz.
- Plain meaning of non-backward-compatible: old devices cannot use the new radio directly, so 5G and 6G run side by side for years, and old LTE-M, NB-IoT and ambient-IoT devices stay in the field.

---

#### D. Technology notes

- **ISAC (radio also senses like a radar):** Rel-20 5G-Advanced includes UAV sensing with a base station in monostatic mode. The 6G report has quantitative sensing requirements and requires detection and tracking of passive objects (UAV, human, vehicle, AGV). 23 ISAC use cases were accepted in the Rel-20 6G studies; ISAC over non-terrestrial networks is not in the Rel-20 SA2 6G study scope (arXiv 2604.11593, ABSTRACT/SNIPPET). SA3 defines security and privacy mechanisms for sensing.
  - Plain use: the same signal and hardware carry data and also detect movement from echoes.
  - Link to us (suggestion, untested): sensing could become an extra viewer; it also adds a privacy risk.
- **Ambient IoT (battery-free, energy harvesting):** Rel-18 study, Rel-19 study plus work item (indoor inventory and command), Rel-20 extends it (arXiv 2312.06569, 2506.11828, 2412.21077, ABSTRACT/SNIPPET). Security: Rel-19 covers authentication, credential protection, confidentiality, integrity, replay protection and temporary identifiers for the first device type in isolated private networks; Rel-20 extends to more device capabilities (3GPP highlights, READ-FULL).
- **Digital twin:** a real-time mirror of the network used to simulate and test decisions before deploying them (arXiv 2506.01609); what-if and policy experimentation (ATIS Next G panel); passive monitoring twins versus active control twins (arXiv 2608.12267). 3GPP SA5 is studying network digital twins and closed control loops for 6G management. A network twin simulates the network; our world model simulates traffic reactions to defense actions (related, not the same).
- **AI in 6G:** the 6G report requires support for "Network for AI" and "AI for network". 3GPP SA2 views are divided on AI agents in the architecture, and SA3 is studying device AI-agent security. AI is both a performance tool, a security tool and an attack surface (adversarial ML, poisoning, model extraction).
- **Non-terrestrial networks (NTN):** satellites, HAPS and UAVs as part of the same network; Rel-20 includes NB-IoT NTN security via the EPC. Satellite internet (Starlink-type, dish plus router, just another uplink) is different from 3GPP NTN (satellite acts as a tower for small standard devices). Starlink delay figures are MEMORY and unverified.

---

#### E. Plain-language explanations given in this chat (kept for meeting prep)

1. **Bandwidth cap versus attack type** (the lion and the door analogy):
   - A bandwidth cap works best against floods (DoS): the harm is volume, and capping volume blunts it. This is exactly the rate-limit rung of the action ladder.
   - It fails against exploits (a tiny harmful message fits through any narrow door) and against botnets (many small senders, each under the cap). A distributed flood from a botnet is a mix: the per-device cap fails, but the combined flood still hurts the target.
   - The size of the door does not decide safety; the guard does (lock, monitoring, speed limit). This is why the agent reads behavior, not just volume.
2. **Why small IoT devices do not need speed:** a sensor sends tiny messages, so it needs low power and a weak antenna, not 100 Mbit/s. "Faster" is not the IoT bottleneck.
3. **Will 6G AI make the thesis obsolete?** Not from this evidence. Operator-side AI security works on the network's view (call records, radio tiers) and mostly targets cyber-physical systems. Our agent works at home or device level with a belief and graded response. Position the work as a response layer that complements the network's AI.
4. **Why the agent must run on a hub:** tiny battery or battery-free devices cannot run defenses on board. The Hussain survey puts on-device detection at under 1 ms, edge (MEC) at 1 to 10 ms and cloud at 80 to 120 ms (quoted from its cited sources, SECONDARY).

---

#### F. Security literature (what was found and how much was read)

| Work | Read level | What it does | Relation to our thesis |
|---|---|---|---|
| Hussain, Bilal, Li, Pervaiz, Tang, Du, Ahmad, Azhar, Zhang, "AI-Native Closed-Loop Security for 6G-Enabled Cyber-Physical Systems" (arXiv 2606.08173, 2026) | READ-PART (to Sec. VII-A of IX) | Sense, detect, mitigate, learn loop at the edge; 128 studies; latency contract per slice; scope excludes generic enterprise IT and pure-IoT settings | Closest conceptual neighbour at operator level; supports false-block cost, reversibility and type-aware actions; shows RL orchestrators exist |
| Munir, Proddatoori, Muralidhara, Dena, Saad, Han, Shetty, "A Trust-By-Learning Framework for Secure 6G Wireless Networks Under Native Generative AI Attacks" (IEEE OJCOMS vol. 6, 2025, DOI 10.1109/OJCOMS.2025.3591535) | READ-FULL | DS-inspired trust model (belief over a power set of network metrics, evidence from a Bayesian belief network, plausibility as uncertainty) plus multi-agent meta-RL with centralized training and decentralized execution | Closest DS + RL work found. See differentiation below |
| Barua, Khan, Ye, Papanastasiou, Liu, Bidikar, Moulds, McCann, Yadav, "Toward a Unified Security and Privacy Framework for AI-Native 6G Networks" (arXiv 2607.01019, Jul 2026) and the related version "Beyond Fragmented Standards" (systronlab.github.io) | arXiv: ABSTRACT only. Related version: READ-PART (to Sec. V-B) | Cross-layer threat taxonomy; ZTA with embedded AI and dynamic trust; lightweight security for low-power devices; NTN autonomous defense | Background; no belief or POMDP seen in the part read; its KPI numbers do not match ITU or 3GPP |
| Andreou, Mavromoustakis, Aslam, Markakis, "Coordinated Multi-Agent Moving Target Defense Against Cross-Slice Lateral Movement in Virtualized SDN Clouds" (IEEE NFV-SDN 2025) | ABSTRACT | Multi-agent (MAD-DPG) MTD; reports latency under 50 ms and under 20 flow changes per minute | Closest cross-boundary lateral-movement defense; virtual slices, not IoT protocols |
| QuantumGuard (thesai.org, vol. 17 no. 6, paper 94) | SNIPPET | POMDP formulation of attacker engagement, solved with a recurrent PPO agent, for 6G cyber-physical environments | Shows POMDP + recurrent PPO in 6G exists (deception setting) |
| "6G Sensing Security: Distributed Game-Theoretic RL for Urban Beamforming and Attacker Detection" (arXiv 2607.06115) | SNIPPET | Bayesian-like belief that each user is malicious, discretized to 5 levels, fed to Q-learning | Belief + RL in 6G exists (beam and sensing setting) |
| Tree-based zero-day detection in 6G (SMC 2026, www.cin.ufpe.br/~amb4/assets/smc2026Gabi.pdf; authors not verified) | SNIPPET | Notes that aggregate metrics can hide weak zero-day performance and single datasets limit generalization | Supports held-out-family and cross-dataset protocol |
| Rifa-Pous et al., "Security, Trust and Privacy challenges in AI-driven 6G Networks" (arXiv 2409.10337) | SNIPPET | AI helps security and is also a risk | Background |
| Edge learning for 6G-enabled IoT survey (arXiv 2306.10309); Siamese + PPO zero-day IDS (arXiv 2609.26115); MARL anomaly detection over 6G V2X (MUET); Hammar-Stadler-line OT intrusion response (arXiv 2609.10298) | SNIPPET | Earlier roadmap items | See earlier updates |
| Others seen in searches: arXiv 2511.15206 (Trustworthy GenAI over 6G), arXiv 2610.30436 (Secure agentic AI in 6G), arXiv 2602.19942 (Secure communications, sensing, computing), arXiv 2512.22721 (long NextG security text), arXiv 2604.07212 (analysis of TR 38.914) | SNIPPET | Background | Open only if needed |

**Datasets:** no 6G-native labeled attack dataset found. 6G papers reuse Kitsune, 5G-NIDD, UNSW-NB15, CSE-CIC-IDS2018, CICDDoS2019, Bot-IoT and TON_IoT. Hussain et al. lists only three public sets with native 5G or O-RAN provenance (5G-NIDD about 1.22 M flows, NANCY, NetsLab-5GORAN-IDD), and says operator CDR data has no attack labels.

**Differentiation against Trust-By-Learning (Munir et al.):**

| | Trust-By-Learning | Our plan |
|---|---|---|
| Threat | GenAI poisoning of network metrics (RSRP, CQI) | Novel attacks, device compromise in IoT traffic |
| DS use | DS-inspired trust; evidence from a Bayesian network; no Dempster/Yager fusion of several viewers seen in the text read | Masses from several frozen viewers; Dempster and Yager as arms; Omega and K reported |
| Unknown-attack state | not seen | explicit state U |
| RL | multi-agent meta-RL, CTDE, LSTM, policy gradient with advantage and entropy (no PPO seen) | PPO; G1 to G5 arms |
| Reward and action | CQI-weighted trust score; trust decision on service aggregation | defense-cost reward; graded action ladder |
| Data | open 5G channel-metrics set, attacks generated by autoencoder, VAE, GAN | real held-out attack families |
| Reported results | trust scores (0.972 / 0.922 / 0.892) and dependency replication | detection, false-alarm rate at fixed detection, cost |

My reading, not a quote: the reported numbers measure how well generated data replicates dependencies, not detection or false alarms on real attacks, so they are not comparable with our metrics.

---

#### G. What Hussain et al. supports in our design (all READ-PART)

- A false positive on safety-critical traffic can cost more than a missed attack. This supports the reward cost-ratio sweep.
- Mitigation needs a reversibility path: every action has an inverse that must be reachable in a comparable time budget. This supports the ladder and the temporary-block design.
- A generic "alert then rate-limit" reflex can be harmful, so mitigation must be type-aware (the per-segment action mapping is still open for us).
- Report under-reported metrics: calibrated false-positive rate, tail latency (p99) and energy per decision.
- Accuracy near 99% on saturated public benchmarks versus about 91 to 98% on real operator data is a benchmark artifact. This supports the real-data rule.
- RL orchestrators over (primitive, tier, intensity) already exist, and RL-driven attackers that adapt to the defender are reported. The second point supports Idea F.
- Latency anchors for the latency test: on-device under 1 ms, edge 1 to 10 ms, cloud 80 to 120 ms (replace the assumed 300 ms cloud value); an xApp-based detector reported 90 ms detection at 132 Msg3/s on a testbed (SECONDARY, from a cited work).
- The loop itself (sense, detect, mitigate, learn) has the same shape as MAPE-K and OODA. The survey says its novelty is the latency contract. So the loop idea is not ours to claim.

---

#### H. Use in the PhD

**Safe to use:**
- Motivation: new networks have no attack history, so novel attacks are the normal case (my argument, label it as such).
- 6G coexists with NB-IoT, eMTC and ambient IoT, so the device fleet stays mixed for years; the agent sits above the access layer.
- Federated learning and digital twins are recognized 6G themes (cite the surveys).
- Adversarial AI is a listed 6G threat (supports Backup D).
- Portability claim: "access-technology-agnostic, evaluated on Wi-Fi/IoT and 5G data, with 6G as a motivating future case".
- Cite the TR 38.914 numbers in section B, not the vision numbers.

**Do not claim:**
- Any "first" for belief-based RL, DS-based RL, POMDP + PPO or federated RL in 6G security (Trust-By-Learning, QuantumGuard, the sensing-security paper, Siamese + PPO and the Hussain-cited RL orchestrators exist).
- That 6G has data (no 6G-native labeled attack dataset found).
- That 6G IoT is "lower power" or "denser" as a minimum requirement.
- Any speed, latency or density figure not in section B.
- That no belief or POMDP appears in the Hussain or Barua surveys (only part of each was read).

**Suggested scope (my judgment):** use 6G as one motivation paragraph and a portability test, not as a pillar.

---

#### I. NOTE: search for more sources (the current list is not exhaustive)

This list comes from about 12 web searches plus a handful of full-text fetches, not a database sweep. Before relying on any claim above, run these.

1. **Databases:** IEEE Xplore, ACM DL, Scopus, Web of Science, arXiv, Semantic Scholar, Google Scholar, DBLP. Prioritize 2025 and 2026.
2. **Standards first-hand:**
   - Read TR 22.870 (SA1 6G use cases), TR 33.801-01 (6G security study), TR 23.801-01 (6G architecture), TR 32.801-01 (6G management) and TR 33.703 (post-quantum). Check whether they mention anomaly detection, response automation or an attacker model.
   - Read ITU-R M.2160-0 itself and the ITU report on minimum technical performance requirements when published.
   - Re-fetch TR 38.914 after RAN#114 (December 2026) in case values change.
3. **Query strings to run:**
   - ("6G" OR "beyond 5G") AND (POMDP OR "belief state" OR "partially observable") AND (security OR intrusion OR "cyber defense")
   - ("6G" OR "5G") AND ("Dempster-Shafer" OR "evidential" OR "subjective logic") AND (intrusion OR attack OR anomaly) AND ("reinforcement learning" OR PPO)
   - ("6G" OR "5G") AND IoT AND ("zero-day" OR "unknown attack" OR "novel attack") AND ("reinforcement learning" OR "federated")
   - ("lateral movement" OR pivot) AND (multi-protocol OR "cross-protocol" OR "cross-slice") AND (IoT OR "smart home") AND (MARL OR CTDE OR "belief")
   - ("ambient IoT" OR "zero-energy") AND (security OR attack OR "intrusion detection")
   - ("ISAC" OR "integrated sensing") AND (security OR privacy OR attack) AND IoT
   - ("digital twin") AND ("reinforcement learning") AND ("intrusion response" OR "cyber defense") AND ("6G" OR "5G")
   - "6G" AND (dataset OR benchmark OR testbed) AND (intrusion OR attack) AND (labeled OR "attack labels")
4. **Read in full (not done yet):** the arXiv full text of Barua et al.; the last sections of Hussain et al. (open challenges, five directions); Andreou et al. (full text); the SMC 2026 zero-day paper (verify authors); QuantumGuard and the 6G sensing-security paper beyond the snippet.
5. **Check later:** Starlink and 3GPP NTN delay figures, direct-to-device IoT status, and 4G (LTE-A) comparison figures.
6. **Process note:** the fetch tool truncates long PDFs and has a rate limit; re-run with higher limits or fetch by page ranges when needed.

---

#### J. Study-plan status at this point

- Session 2 (RL up to PPO): finished (Sections 105 to 123; the quick reference is Section 123).
- Session 1 Steps 6 to 8: still skipped (episode end and U response, sanity-check baselines, one-page design).
- Possible Session 3 layout (suggestion, not decided): DQN vs PPO plus the formal belief-in-PPO recap; then world models and MBRL; then experiment design.
- The user reported low confidence in PPO Steps 9 to 11 and the policy-gradient math; revisit with one tiny example per idea (the nudge, the advantage, the clip).
- The 6G topic was a side study; next 6G step is the search in section I, then decide where 6G sits (motivation paragraph, portability experiment, or Paper 3 environment).

#### K. Open items

1. Run the search plan in section I and update this section; remove any claim that a sweep contradicts.
2. Decide where 6G sits in the proposal (suggestion: motivation plus portability test).
3. Verify author names and venues for every row marked ABSTRACT/SNIPPET before citing.
4. Replace assumed latency values in the latency test with the anchors in section G, and with measured values on hub-class hardware when available.
5. Carry forward all open items from earlier sections (Sections 66, 80, 92, 109, 122 and the earlier updates).


---
---

# UPDATE — 23 November 2026, Part 2 (new sections only; everything above is unchanged)

Today: the two belief algorithms that were missing from the list in Section 8 and Section 28 were studied from zero, step by step: TBM (Transferable Belief Model) and possibility theory. Sections 81 to 92 (12 November) stay as they are. Items marked (suggestion) are mine, not decisions. Items marked (verify) are general knowledge or my reasoning, not checked against a source. No literature search was run today.

## 128. THE TWO SYMBOLS TO NEVER MIX (memorize this first)

| Symbol | Plain meaning | One-line picture |
|---|---|---|
| **Omega** | **"I don't know, I have no idea."** No evidence. Comes from one viewer. Neutral: fusing it with another viewer changes nothing. | A witness who was not there |
| **K (conflict)** | **Disagreement between viewers.** Each is sure, but about different things. | One witness says red, another says blue |
| **U** (a state in the frame) | "A real attack from a family I never trained on." A viewer must point at it. | A suspect not on the poster wall |

- High Omega suggests: gather more data, watch.
- High K suggests: investigate; a viewer may be miscalibrated, the protocol may have shifted, or something new is happening.
- Check example: viewer 1 {N} 0.9, viewer 2 {D} 0.9 is a K problem (K = 0.81), not an Omega problem.
- Yager blurs the two (it adds K into Omega), so always save K and the ignorance part separately before adding them.

## 129. TBM (Transferable Belief Model)

**Status:** studied in 3 steps. Source of the model: Smets (from memory, verify the references before citing).

**Plain idea:** a multiple-choice exam. Closed world: the right answer is always printed (A, B or C). Open world: the right answer may not be printed. Dempster's rule and plain Bayes assume a closed world. TBM is DS with one change: **mass is allowed on the empty set, and that mass means "the truth is outside my list, or my viewers contradict each other".**

**How it combines:** the same grid as Dempster (cell = overlap, mass = product), **with no division**. The empty cell keeps its mass.

Example 1 (two viewers clash): viewer 1 {N} 0.9, Omega 0.1; viewer 2 {D} 0.9, Omega 0.1.

| Rule | Result |
|---|---|
| Dempster (divide by 0.19) | N 0.47, D 0.47, Omega 0.05 (looks like a confident 50/50; hides that 81% clashed) |
| Yager (K goes to Omega) | N 0.09, D 0.09, Omega 0.82 (reads as "I don't know"; loses the difference between no evidence and contradiction) |
| **TBM (keep it)** | **empty 0.81**, N 0.09, D 0.09, Omega 0.01 (conflict and ignorance stay separate) |

**Three or more viewers:** the same operation applied again. The rule does not depend on order: (a x b) x c = a x (b x c). It can also be done in one big grid. (Yager is the exception: its conflict-to-Omega step breaks the order independence.)

Example 2 (three viewers): A {N} 0.6, Omega 0.4; B {D} 0.5, Omega 0.5; C {N} 0.5, Omega 0.5.
- A x B: empty 0.30, N 0.30, D 0.20, Omega 0.20. Then x C: **empty 0.40, N 0.40, D 0.10, Omega 0.10.** Combining in a different order gives the same numbers.
- Dempster divides by 0.6: N 0.67, D 0.17, Omega 0.17.

**Relation to Dempster:** TBM divided by (1 - empty) equals Dempster exactly. So the two agree on how the non-conflicting mass is shared, and differ only on what they say about the conflict.

**Correction to an observation made in the session:** the difference between TBM and Dempster does **not** come from the number of viewers. It comes from how much conflict has accumulated. Two viewers that clash badly give a huge gap (the Zadeh case); three viewers that agree give none. More viewers tends to widen the gap because there are more chances to clash and the empty-set mass can only grow, but conflict is the cause. Whether the gap really becomes large with three or more viewers on real traffic is a hypothesis for the simulation, not a finding.

**Safe wording for the paper (suggestion):** "TBM and Dempster's rule agree on how the non-conflicting mass is shared. They differ in what they say about the conflict, and the difference grows as conflict accumulates, which tends to happen as viewers are added."

**Property to remember: the empty-set mass can only grow.** Once mass lands on it, nothing moves it back out. With more viewers, or with a memory that carries the old belief forward, it piles up. Design question (not tested): read it fresh each window, or let it fade like the keep factor k (suggestion).

**Decision step:** apply the pignistic transform on the non-empty part, i.e. divide by (1 - empty) first. Class ranking is therefore identical to Dempster's. What TBM adds is the conflict kept as its own number (an alarm signal), not a different class decision.

**TBM with a U state in the frame: does it become the same as Dempster?** No.
- With U in the frame the list looks complete, so the open-world argument weakens.
- The two rules still treat the clash differently: Dempster divides it away, TBM keeps it. In the clash example, U gets no mass at all (no viewer pointed at it) while the empty set holds 0.30.
- U and the empty set catch different things. U = a viewer positively says "nothing known fits". Empty set = viewers contradict each other (this can also come from a miscalibrated viewer or a protocol shift). With both you keep both signals.
- My view (hypothesis): TBM with U is practically "Dempster or Yager plus K reported separately", with a cleaner open-world interpretation. TBM without U is the cleaner test of whether U is needed.

## 130. Possibility theory

**Status:** studied in 3 steps. Source (from memory, verify): Zadeh 1978, Dubois and Prade. It is a relative of fuzzy logic and a simpler cousin of DS.

**Step 1, the idea ("how surprised would I be?"):** a detective's list of suspects. Instead of "how likely is each?", ask "how surprised would I be if it were this one?". Not surprised at all = possibility 1; shocked, it cannot be = 0.

Example (one viewer): Normal 1.0, DDoS 0.7, Scan 0.2, U 0.1.

Three differences from probability and DS masses:
1. The numbers do **not** add to 1. Several states can be fully possible at once (Normal 1.0 and DDoS 1.0 means "can't tell between these two"; a probability would have to split 50/50).
2. At least one state must be 1 (normalization): the best explanation always scores 1.
3. A group scores as its **best** member: possibility of "attack" = max(DDoS, Scan, U) = 0.7.

Total ignorance = 1 for every state ("nothing is ruled out"), the same role as Omega, with no separate symbol.

**Where the numbers come from:** design choices, the same way as fuzzy ramps (for example a function of how far the GRU residual is from normal). They are not counted evidence. This is the same weakness we saw in fuzzy.

**Where is the conflict? (fusion).** Take the **minimum**, state by state: a state stays possible only if both viewers allow it.

| | Normal | DDoS | Scan |
|---|---|---|---|
| Viewer 1 | 1.0 | 0.3 | 0.1 |
| Viewer 2 | 0.2 | 1.0 | 0.1 |
| **Min** | 0.2 | 0.3 | 0.1 |

> **Conflict = 1 - (the best score after the min).** Here 1 - 0.3 = **0.7.** If the viewers agree (the best score stays 1) the conflict is 0.

- The all-1s distribution (total ignorance) is neutral under the min, like Omega.
- The same temptation as Dempster: scaling the result back up so the best score is 1 hides the clash. Save the conflict number before scaling, as in TBM.
- The min does not depend on order, so any number of viewers can be fused. The best score can only fall, so conflict can only grow, like the empty-set mass in TBM.

**Step 2, certainty (the mirror number):** possibility asks "can I not rule this out?"; certainty asks "have I ruled out everyone else?".

> **Certainty of a claim = 1 - the highest possibility among everything else.**

Using Normal 1.0, DDoS 0.7, Scan 0.2, U 0.1:

| Claim | Possibility | Certainty |
|---|---|---|
| Normal | 1.0 | 0.3 |
| DDoS | 0.7 | 0 |
| "Some attack" | 0.7 | 0 |
| "Not U" | 1.0 | 0.9 |

Each claim gets [certainty, possibility], a lower and an upper bound, the same shape as [belief, plausibility] in DS. All 1s gives [0, 1] (total ignorance); one clear winner gives a narrow gap (for example Normal 1.0, all others 0.1 gives Normal [0.9, 1.0]).

**Relation to DS (general knowledge, verify):** possibility corresponds to plausibility and certainty to belief, but only when the evidence groups are nested ({A}, {A,B}, {A,B,C}). That is why it is a simpler cousin: it cannot express arbitrary groups such as {D,S} as separate evidence.

**Step 3, strengths and limits (brief):**
- **No reinforcement from agreement.** The min is idempotent: two viewers that both say 0.3 give 0.3, not a stronger belief. DS multiplies, so agreeing viewers reinforce each other. For us this is double-edged: it is safe when viewers are correlated (the GRU and MMPP learn from the same normal traffic, so their agreement is weaker evidence than it looks), but it also cannot become more confident when viewers truly agree. (Reasoning, verify.)
- **No "amount of evidence" number.** Like fuzzy, it has no u or Omega-from-counts; ignorance is only the all-1s distribution.
- **No groups as evidence** (only nested), and the numbers are design choices.
- **Decision:** rank states by certainty or possibility; a tie at 1.0 means "can't tell". It does not need a pignistic step.
- **Use in the pipeline (suggestion, untested):** (a) as an extra fusion-rule arm (cheap: a min per state); (b) as a converter, since the fuzzy ramps already produce possibility-like numbers (a "high residual" ramp is essentially a possibility distribution).

## 131. Where each algorithm sits (updated comparison)

| Method | Layer | Handles | Conflict number | Ignorance | Groups |
|---|---|---|---|---|---|
| Bayesian | belief language | probability per state | no | prior on a U state (guessed) | no |
| DS (Dempster) | belief language + fusion | mass on groups | K, then divided away | mass on Omega | yes |
| DS (Yager) | fusion | same | K, moved to Omega | mass on Omega (blurred with K) | yes |
| **TBM** | belief language + fusion | same, open world | **empty-set mass, kept** | mass on Omega | yes |
| EDL | viewer | learned evidence | no | u | no |
| Subjective logic | belief language | (b, u) from counts | no | u | no |
| Fuzzy | converter | vague words | no | no | no |
| **Possibility** | belief language + fusion | "what is still possible" | **1 - best score after min** | all-1s distribution | nested only |

Order of strength (my opinion, untested): TBM and Dempster/Yager are the richest for fusion; possibility is the simplest and cheapest; none is "stronger" on class accuracy by default. The held-out-family test decides.

## 132. Experiment arms to add (suggestion)

Add to the offline belief tests (Section 63, Section 46):
1. **TBM with U** and **TBM without U**, next to Dempster, Yager and plain probability averaging (the same viewers and converters for all).
2. **Possibility-min fusion** as one more fusion arm on the same viewers.
3. Reports for every arm: novelty AUROC on held-out families, false-alarm rate at a fixed detection rate, known-class accuracy (pignistic or certainty-based ranking), calibration, **and the conflict readout** (empty-set mass for TBM, 1 - best score for possibility, K for Dempster/Yager).
4. A rule for how the empty-set mass (and the possibility conflict) behaves over time: read fresh each window, or fade (test both).
5. Expected from reasoning (hypotheses only): TBM ranks classes like Dempster; its gain is the extra alarm signal. Possibility may be more robust to correlated viewers but cannot reinforce agreement. Miscalibrated viewers inflate the conflict readouts and cause false alarms, so viewer calibration decides more than the algorithm.
6. Same fairness rules as before: equal tuning budget, separate tuning and evaluation seeds, grid-edge check, thresholds chosen on validation, held-out families never used for tuning.

## 133. Open items and next steps

1. Check the references for TBM (Smets) and possibility theory (Zadeh, Dubois and Prade) and the DS/possibility nesting statement before citing.
2. Check literature for TBM or possibility theory applied to intrusion detection or RL belief (not searched); add to the database sweep: ("transferable belief model" OR "possibility theory") AND (intrusion OR IoT OR "zero-day").
3. Decide the time rule for the empty-set mass (fresh vs fading).
4. Decide whether possibility is used only as a fusion arm or also as the converter for number-output viewers.
5. Carry forward all open items from earlier sections, including Sections 66, 92 and 122.
6. Next study (suggested order): the postponed Session 1 decisions, then Session 3 (PPO vs DQN plus the formal belief-in-PPO recap), then world models and MBRL, then experiment design.


---
---

# UPDATE — 23 November 2026, Part 3 (new sections only; everything above is unchanged)

Today: a literature check on whether anyone compared PPO, DQN and DDQN with a belief algorithm in a POMDP for zero-day attacks in IoT, and the decision to record this as a **candidate second conference paper**. Items marked (suggestion) are mine, not decisions. Items marked (verify) have not been checked against full text. Verification levels: SNIPPET = a search snippet or abstract only; none of the papers below was read in full.

## 134. Where this sits: two conference papers, one dependency

| | Conference paper 1 (first) | Conference paper 2 (this candidate) |
|---|---|---|
| Question | Which **belief algorithm** is best for novel (zero-day) attacks in a POMDP? | Which **RL algorithm** (PPO, DQN, DDQN, and variants) works best on top of a belief, for the same problem? |
| What varies | The belief: Bayesian (with and without U), Dempster, Yager, TBM, possibility, subjective logic, EDL, fuzzy as converter (Sections 8, 28, 81, 129 to 132) | The learning algorithm: PPO, DQN, DDQN, plus memory and multi-agent variants |
| What is fixed | Viewers, environment, reward, ladder, held-out protocol | The belief (the winner or top two from paper 1), the environment, reward, ladder, held-out protocol |
| Output | A ranked comparison of belief algorithms (novelty AUROC, false alarms, known accuracy, calibration, cost) | A ranked comparison of RL algorithms with the same belief (return, containment time, false isolation, sample efficiency, cost) |

**Dependency:** paper 2 uses paper 1's result to fix the belief. If paper 1 shows no clear winner, paper 2 runs on the top two (suggestion). The same environment, viewers, reward and evaluation protocol are reused, so the engineering is shared.

**Relation to the earlier conference-paper idea (Sections 98 to 100):** that idea was "does the evidential belief help beyond memory (G1 to G5)". It overlaps with both new papers. Open decision: does the G1 to G5 grid (memory vs belief) become part of paper 2, a third short paper, or an ablation inside paper 1? (suggestion: keep the belief-vs-memory arms inside paper 1 as a control, and keep paper 2 purely about the RL algorithm.)

## 135. Candidate paper 2: the idea

**Working question:** with the belief fixed, does the choice of RL algorithm change containment of novel attacks, false isolations and cost, and does the answer change when the data is scarce (a new home), when the policy has memory, or when several agents are used?

**Why it is not obvious:**
- Papers that compare PPO and DQN in security mostly use no belief and mostly report PPO winning (section 136), but one smart-grid study reports DQN training much faster.
- Belief is almost always paired with PPO in the papers found, so "DQN or DDQN with a belief input" appears to be an unfilled slot (not found in a limited search).
- DQN reuses old experience (off-policy), so it may win when real data is scarce; PPO is usually more stable. Which effect dominates here is an open empirical question.

**Arms (suggestion):**

| Arm | Learning algorithm | Memory | Policy receives | Purpose |
|---|---|---|---|---|
| P1 | PPO | none | fused belief | the reference (same as G3) |
| P2 | PPO | recurrent (LSTM; GRU as ablation) | fused belief | memory on top of belief (same as G4) |
| D1 | DQN | none | fused belief | the main challenger |
| D2 | DDQN | none | fused belief | fixes DQN's value over-estimation |
| D3 | DRQN or recurrent DDQN | recurrent | fused belief | recurrent value-based arm (recurrent Q-learning is built for partial observability, per the Q-BIRD baseline description) |
| N1 to N3 | PPO, DQN, DDQN | none | **no belief** (window features and last action only) | measures how much of each algorithm's result comes from the belief |
| R | rule-based threshold on m(U), Omega, K | none | belief | non-RL baseline; RL must beat it |
| O | PPO | none | oracle (true state) | upper bound, simulation only |

**Possible extension arms (suggestion, only if time):** IPPO, MAPPO, independent DQN and QMIX-style value decomposition for the per-protocol agents (Paper 3 territory; not needed for a first paper 2). Multi-agent versions of DQN and DDQN exist (independent Q-learning, value-decomposition methods; names from memory, verify).

**Two data regimes (the important design choice):**
1. **Plenty of simulated data:** shows steady-state quality and stability.
2. **Limited real data** (a new home, a few days of traffic): where DQN's reuse of old experience could help. This is the regime where an off-policy method has a real chance, and where the earlier MBRL argument also lives.

## 136. What the literature check found (4 searches, SNIPPET level; verify)

**Not found:** any paper that compares PPO, DQN and DDQN, each with a belief state, in a POMDP for zero-day attacks in IoT. This is "not found in a limited search", not proof of absence.

**1. PPO vs DQN for zero-day in IoT, no belief:**
- Hossain et al., cross-dataset zero-day IDS with a Siamese network and RL (arXiv 2609.26115; ICT Express 2026 per a secondary citation): PPO 99.07% accuracy, 93.94% zero-day detection, 0.50 ms; DQN 98.8%, 93.1%, 0.65 ms; SAC 96.32%, 84.1%. The text calls DQN cheaper in memory and faster to train but prone to value over-estimation, and says PPO converged most stably. **Inconsistency to check:** the text quotes a 7.57% lower unseen accuracy for DQN, while the table gap is much smaller; read the full text before using either number.
- Alemayehu et al., real-time DDoS detection in industrial IoT (preprint 202601.0081, **not peer-reviewed**): DQN, Double DQN, Duelling DQN, DDPG and PPO on KDDCup99, CIC-DDoS2019 and Edge-IIoT; PPO reported faster to converge and more sample-efficient. Binary detection, not a POMDP.
- HoneyIoT (arXiv 2305.06430): PPO converged fastest and earned the best average reward among the algorithms tried. Honeypot task, not a belief POMDP.
- The author of a DQN-based IoT IDS (J. Intell. Informatics, Networking and Cybersecurity, Univ. of Babylon) argues DQN suits binary instantaneous decisions and that PPO's complexity is not needed there (an author's opinion, not a comparison).

**2. Belief with PPO, DQN used only as a baseline:**
- Q-BIRD (arXiv 2606.07796; v1 titled "Belief-Space Quantum-Inspired Reinforcement Learning for Partially Observable Autonomous Cyber Defense in the Internet of Vehicles", later version "Amplitude-Belief Reinforcement Learning for Adaptive Cyber Defense in Partially Observable V2X Networks"): baselines DQN, DRQN, PPO without belief, PPO-LSTM, PPO with Bayesian belief; belief is attached only to PPO; V2X, not IoT. Reported damage 36.0 to 28.0 vs PPO with Bayesian belief.
- Belief aggregation and rollout (arXiv 2507.15163, Hammar and Stadler's group, authors not verified): estimates a belief and compares against Cardiff, C-POMCP, PPO, PPG, DQN; says its method needs less offline compute than the deep RL methods.
- OT intrusion response (arXiv 2609.10298): PPO and BF-PPO (particle-filter belief). No DQN arm seen.
- Penetration-testing partial observability study (arXiv 2509.20008): PPO variants (frame stacking, history, recurrent, transformers) against vanilla PPO with per-algorithm hyperparameter search. Offense, PPO only.

**3. DQN-family agents that use uncertainty or memory as input:**
- DQN-IDS (NDSS-hosted paper, Tiwari et al.): CNN features plus a DQN whose state is softmax confidence, probability gap and entropy; open-set known vs unknown on CICIDS-2017 and UNSW-NB15; reported binary F1 97.8%. Uncertainty as a state feature, not a belief filter.
- DeepEdgeIDS and AutoDRL-IDS (arXiv 2511.18240): autoencoder anomaly score feeding a DQN, and an LSTM-DQN.
- DRQN-CMDP audit scheduling (arXiv 2607.17305): a GRU layer in a dueling double Q-network that maintains a belief over a hidden node type, compared with PPO among 13 methods. Closest design to "value-based agent with belief", but a blockchain-audit domain; results not seen.

**4. DQN can beat PPO on some axes:** ROAM, smart-grid moving-target defense (arXiv 2610.12730): DQN trained substantially faster (up to 4.5 times on the largest system) and chose a different defense posture; PPO and DQN were compared on an identical task. Not IoT, not zero-day.

**Pattern (my reading):** in security comparisons that include both, PPO usually wins on stability and zero-day quality; DQN wins on training speed and memory. Belief is almost always paired with PPO. Value-based agents with a belief input look under-explored.

## 137. Novelty wording and the "do not claim" list

**Do not claim:**
- "First comparison of PPO and DQN for zero-day IoT defense" (Hossain et al. and others).
- "First belief-based PPO for cyber defense" (BF-PPO, Q-BIRD).
- "First DRL agent with an uncertainty-state input" (DQN-IDS).
- "First recurrent value-based agent for a security POMDP" (the audit-scheduling paper, and DRQN used as a baseline in Q-BIRD).

**Safer wording (suggestion, still hedged):** "To our knowledge, the first controlled comparison of PPO, DQN and DDQN agents that share one fused evidential belief, evaluated on held-out attack families in an IoT-defense POMDP." It rests on four searches, so run the database sweep before using it.

## 138. Fairness rules, hypotheses and risks

**Fairness (same lessons as before):**
- The environment, reward, ladder, step size and episode rules are frozen and identical for every arm.
- Equal tuning budget, same search ranges, grid-edge check on every tuned value; PPO and DQN have different knobs (PPO: learning rate, clip, epochs, batch; DQN: replay size, target-update interval, exploration schedule), so give each family a comparable budget and report it.
- At least 10 seeds, bootstrap intervals, separate tuning and evaluation seeds, held-out families never used for tuning.
- Report cost as well as quality: real steps to reach a target return, wall-clock, inference time on hub-class hardware, memory (replay buffer size counts).
- A strong recurrent baseline is needed (a reviewer will attack an under-tuned recurrent arm).

**Hypotheses to pre-register (not results):**
1. PPO is more stable and gives lower variance across seeds (literature pattern, not tested here).
2. DQN or DDQN reaches a target return with fewer real steps in the limited-data regime.
3. DDQN beats DQN (over-estimation fix), and the gap is small.
4. Removing the belief hurts all three algorithms; the algorithm ranking may change with and without it.
5. A hand-written rule on m(U), Omega, K may beat some RL arms; if so, say so.

**Risks:**
1. The best belief from paper 1 may be borderline; paper 2 then depends on a weak result.
2. DQN's discrete actions fit the ladder well; PPO's advantage may shrink with a small action set (reasoning, verify).
3. Off-policy replay with a belief that changes with the keep factor k can mix old and new belief semantics; keep the belief module frozen and identical during training.
4. Simulation trust (action effects are assumed) applies equally to both papers.
5. If results are close, the paper reduces to "the choice of algorithm barely matters with a good belief", a negative result that is still reportable.
6. Overlap with the earlier G1 to G5 idea: avoid publishing the same result twice.

## 139. Open items and next steps

1. Decide the home of the G1 to G5 memory-vs-belief arms (inside paper 1, inside paper 2, or a third short paper).
2. **Possible mix-up in earlier notes:** two different papers are called "DQN-IDS". Section 29 and the novelty tables describe a softmax-confidence-state DQN (the NDSS-hosted Tiwari et al. paper, CICIDS-2017 and UNSW-NB15), while the 16 November deep-search report attributes a family-held-out DQN-IDS to Alkasassbeh et al. (UGRansome). Verify which is which before citing either.
3. Read in full: Hossain et al. (resolve the 7.57% vs table gap), the audit-scheduling paper (what the recurrent Q-network with belief achieves vs PPO), and the belief-aggregation paper (arXiv 2507.15163, confirm authors).
4. Study DQN from zero (Q-value, replay memory, target network, Double DQN's fix) before building the DQN arms; then compare on-policy vs off-policy in the limited-data regime. (Planned Session 3.)
5. Run the database sweep with queries such as: (DQN OR "Double DQN" OR DDQN) AND (belief OR POMDP OR "partially observable") AND (intrusion OR "cyber defense" OR IoT) AND ("zero-day" OR "unknown attack"); and PPO AND DQN AND (belief OR POMDP) AND IoT.
6. Pick the target venue and timeline only after paper 1's environment and belief results exist (see Section 99 for the venue list; deadlines unverified).
7. Carry forward all open items from earlier sections.


---
---

# UPDATE — 23 November 2026, Part 4 (new section only; everything above is unchanged)

Today: a consolidated list of useful datasets, 2019 and later only, with attack and benign traffic. It merges what the roadmap already verified with five new searches run today. Verification levels: SEARCH = a snippet or abstract seen today; NOTES = verified earlier in this roadmap; MEMORY = my own knowledge, not checked. Nothing below was downloaded or inspected. Items marked (suggestion) are mine, not decisions.

## 140. DATASET MAP (2019 and later)

> **NOTE (important): this list is probably incomplete.** It comes from five snippet-level searches plus earlier notes, not from a systematic sweep. Datasets in new venues, 2025 to 2026 releases, and region-specific testbeds are the most likely to be missing. The double-check protocol is in 140.9. Do not state "no dataset exists for X" anywhere in a paper before that check is done.

### 140.1 Filter and conventions
- Included: datasets released or published 2019 or later. Excluded by the year filter: N-BaIoT (2018), Kitsune (2018), UNSW-NB15 (2015), CIC-IDS2017/2018, AWID2 (2016), the Car-Hacking dataset (listed as 2018).
- Years differ between sources for some datasets (TON_IoT, Bot-IoT). Use the dataset's own paper for the final citation.
- "States" here means two things: device operating states (power-up, idle, active) and attack stages (multi-stage scenarios). They are rare; see 140.7.

### 140.2 A. IoT multi-device, attack and benign (the core group)

| Dataset | Year | What it has | Info source |
|---|---|---|---|
| CICIoT2023 | 2023 | Real IoT traffic, flow-based; 7 attack categories. Notes: 105 devices, 33 attacks, per-device identifiers, free download | SEARCH + NOTES |
| CIC IoT 2022 | 2022 | 81 IoT devices over Wi-Fi, Zigbee and Z-Wave (SEARCH). Earlier notes said about 60 devices, so the count conflicts. Attack coverage and labels unchecked | SEARCH + NOTES |
| IoT-23 | 2020 | Labeled malicious and benign IoT traffic (Stratosphere) | SEARCH |
| TON_IoT | 2019 to 2021 depending on source; main paper 2020 | IoT and IIoT, hybrid traffic, 9 attack types, flow and packet data | SEARCH |
| Edge-IIoTset | 2022 | 14 attacks, 61 features, about 2.2M samples. Built for centralized and federated learning, so the Paper 2 candidate | SEARCH |
| TII-SSRC-23 | 2022 to 23 | 8.6M bidirectional flows, 75 features, emulated testbed, raw captures plus statistics | SEARCH |
| ACI-IoT-2023 | 2023 | IoT, hybrid, 4 attack types, flow and packet data | SEARCH |
| MQTTset | 2020 | 33 features, 5 attacks, about 20M samples | SEARCH |
| LATAM-DDoS-IoT | 2022 | 49M bidirectional flows, real and emulated, large IoT testbed; DDoS only | SEARCH |
| MedBIoT | about 2020 (year not seen) | 80 simulated plus 3 real devices; botnets Mirai, BashLite, Torii | SEARCH |
| CIC-BCCC-NRC TabularIoTAttack-2024 | 2024 | A derived collection that relabels nine earlier IoT datasets (2019 to 2024) as benign vs attack types. Convenient for cross-dataset tests, but derived, not raw | SEARCH |
| CIC IoT-HCRL-2019 | 2019 | The 2019 IoT network intrusion dataset, listed in the same collection | SEARCH |
| Gotham | year not seen | Large reproducible capture of real heterogeneous IoT device traffic | SEARCH (snippet only) |
| Bot-IoT | 2018 data, 2019 paper | One table lists it as 2019 (73M flows); earlier notes said 2018. Borderline for the year filter | SEARCH + NOTES |
| IoTID20, RT-IoT2022, CICIoV2024 | not checked | Possible extras | MEMORY |

### 140.3 B. IIoT and industrial

| Dataset | Year | What it has | Info source |
|---|---|---|---|
| X-IIoTID | 2021 | 820,834 instances (421,417 normal, 399,417 attack), 68 features, several label levels, connectivity- and device-agnostic | SEARCH |
| WUSTL-IIoT | 2021 | 41 features, 4 attacks, about 1M samples | SEARCH |
| DataSense | 2025 | Sensor-based IIoT testbed, benign and malicious traffic | SEARCH |

### 140.4 C. Multi-protocol and radio (Wi-Fi, Zigbee, Z-Wave, BLE): the cross-protocol group

| Dataset | Year | What it has | Info source |
|---|---|---|---|
| BCCC-IoT-IDS-Zwave-2025 (York) | 2025 | Five sources: IP traffic, Z-Wave data, device logs, MQTT traffic, MQTT logs; 81 IP classes and 24 Z-Wave classes; 20 TB, more than a billion records, over 110 devices, 88 attack scenarios | SEARCH |
| York smart-home dataset (Shafi thesis) | 2024 | Over 50 devices, more than 100 attack scenarios, five months. Release status unknown (contact the author, check the CIC/UNB and York BCCC sites) | SEARCH + NOTES |
| SHARP (Cardiff) | captured 2025, released Sept 2026 per notes | Wi-Fi and router traffic, Wi-Fi over the air, Zigbee, Z-Wave logs, telemetry from one home: 1,677 captures, 17 Z-Wave logs, about 4.4M telemetry records. Normal 20 June to 5 July 2025, attack campaign 13 August 2025. Subscription needed (notes). Cross-protocol attacks unverified | SEARCH + NOTES |
| CICIoMT2024 | 2024 | Benign and attack captures for BLE, Wi-Fi and MQTT medical IoT devices, with train and test splits; 18 attacks on 40 devices (notes) | SEARCH + NOTES |
| BLE advertisement dataset | 2026 | 12-hour benign baseline plus sessions of spoofed BLE spam at different intervals | SEARCH |
| ZMAD Z-Wave traffic | about 2023 | Normal and attack traffic from known Z-Wave vulnerabilities and fuzzing, 17 real devices | SEARCH + NOTES |
| Das and Nair multi-stage | 2026 | 178,831 samples, 7 MITRE-Caldera multi-stage scenarios; Wi-Fi only, IPs removed | NOTES |
| ZBDS2023, ZigBeeNet (2024), Song and Lin Zigbee dataset (2024) | various | Zigbee-side data; size, labels and access still unchecked | NOTES (unverified) |
| AWID3 | 2021 | Wi-Fi-specific attacks (deauth, disassociation) | MEMORY |

**None of these is verified to label cross-protocol pivots.** Realistic plan (from Update 10): real benign multi-protocol topology plus injected, documented pivots.

### 140.5 D. 5G and cellular

| Dataset | Year | What it has | Info source |
|---|---|---|---|
| 5G-NIDD | dataset 2022, descriptor 2025 (IEEE Data Descriptions) | 1,215,890 records (477,737 benign, 738,153 malicious). Attacks: ICMP, UDP, SYN and HTTP flood, slow-rate DoS, plus SYN, TCP-connect and UDP scans. Real 5G test network in Oulu, two base stations, each with an attacker node and benign users. Open access. The paper says nine intrusion types while the tables show eight (check) | SEARCH |
| NetsLab-5GORAN-IDD, NANCY | not checked | Named in the Hussain survey | NOTES |
| LTE-M, NB-IoT, 6G | none | No public labeled attack dataset found (earlier notes). Simulation (for example OMNeT++) would be needed | NOTES |

### 140.6 E. Benign-only and device-state data (for MMPP calibration and identity work)

| Dataset | Year | What it has | Info source |
|---|---|---|---|
| Deakin IoT Traffic | 2024 to 2025 | 24 IoT devices over 119 days, over 110M packets, a CSV mapping devices to MAC addresses and CSVs on device states, benign only, CC-BY | SEARCH |
| Dalhousie NIMS benign | 2024 | 9 consumer IoT devices captured in three states (power-up, idle, active), Wi-Fi 2.4 GHz | SEARCH |
| NIMS converged test set | 2024 | 5 hours of converged traffic where all 9 devices run concurrently | SEARCH |
| NIMS attack dataset | 2025 | Companion dataset for evaluating models trained on the benign set; contents not read | SEARCH |

### 140.7 F. Enterprise-style, 2019 and later (sanity checks only)
CICDDoS2019 (MEMORY) and NF-UNSW-NB15 (2020, 20 attack types, flow-based, SEARCH). Not IoT; useful only for generic sanity checks.

### 140.8 Mapping to the plan (suggestion)

| Part of the plan | Datasets |
|---|---|
| Paper 1 and conference paper 1 (belief, held-out families) | CICIoT2023 as the main set. Cross-dataset: Edge-IIoTset, TII-SSRC-23 or the TabularIoTAttack-2024 collection (needs a documented feature mapping; earlier notes mention a shared 46-feature vocabulary built by BRIDGE as a possible template) |
| Portability test (Wi-Fi/IoT to 5G) | 5G-NIDD |
| MMPP and benign calibration, device states | Deakin IoT Traffic, NIMS benign (device states), NIMS converged set |
| Identity thread (MAC to device mapping) | Deakin (device-MAC map), CICIoT2023 (per-device identifiers) |
| Paper 2 (federated, non-IID) | Edge-IIoTset; TON_IoT and X-IIoTID as extras |
| Paper 3 (cross-protocol) | BCCC-IoT-IDS-Zwave-2025, SHARP, CIC IoT 2022, CICIoMT2024, Shafi (if released) |
| Attack stages and the temporal belief rule | Das and Nair, SHARP's attack ledger |
| Conference paper 2 (PPO vs DQN vs DDQN) | Same as conference paper 1 (same environment and splits) |

**Rule of thumb (suggestion):** one main dataset per experiment, one different dataset for the cross-dataset test, and one benign dataset for calibration. Do not tune on the held-out family or on the cross-dataset test set.

### 140.9 What each dataset must be checked for (before relying on it)

- [ ] License, access route and whether it needs an account or subscription (IEEE DataPort, Mendeley, Zenodo, Kaggle, UNB/CIC, York BCCC, UNSW).
- [ ] Size, format (pcap, flow CSV, both) and whether raw pcap is available (needed to rebuild windows for the viewers).
- [ ] Per-device identifiers, and whether hub-aggregated traffic can be separated (identity and cross-protocol work).
- [ ] Time ordering per device and window construction (needed to test the carry-forward memory rule; see open item in Section 66).
- [ ] Benign share and benign diversity (a benign-poor dataset gives poor normality viewers).
- [ ] Attack families, so held-out families can be semantically distinct (not near-duplicate variants).
- [ ] Real traffic vs emulated; label noise; known class overlap.
- [ ] Feature mismatch across datasets (a mapping is needed for cross-dataset tests).
- [ ] Whether attack stages or protocol boundaries are labeled.

### 140.10 DOUBLE-CHECK PROTOCOL (datasets may be missing)

1. **Surveys to read for their dataset tables** (found today at snippet level): Haque et al., "A Systematic Review of Data-Driven Attack Detection Trends in IoT" (Sensors 2023); a 2026 Frontiers in Big Data dataset-centric review of IoT and IIoT intrusion datasets with a realism score; the continuous collaborative survey of intrusion detection datasets (arXiv 2408.02521); "Network Intrusion Datasets: A Survey, Limitations, and Recommendations" (arXiv 2502.06688); Stanco et al., novel datasets and traffic-generation tools for IoT intrusion detection (CNSM 2025); the IIoT/OT malicious-traffic dataset review (arXiv 2405.04866); Abdulkareem et al., IoT and non-IoT NID survey (IEEE Access 2024). Verify each citation before use.
2. **Repositories to search directly:** UNB CIC and York BCCC dataset pages, IEEE DataPort, Zenodo, Mendeley Data, Kaggle, Stratosphere IPS, UNSW Canberra and Deakin pages, GitHub, Papers With Code, HuggingFace datasets.
3. **Query strings:**
   - ("IoT" OR "smart home") AND dataset AND (benign OR normal) AND (attack OR malicious) AND (pcap OR flow) with year filters 2024, 2025, 2026
   - (Zigbee OR "Z-Wave" OR BLE OR Thread OR Matter) AND dataset AND (attack OR intrusion)
   - ("multi-protocol" OR "cross-protocol" OR hub) AND dataset AND (smart home OR IoT) AND (lateral OR pivot OR "multi-stage")
   - ("5G" OR "6G" OR "O-RAN" OR "NB-IoT" OR "LTE-M") AND dataset AND (intrusion OR attack OR anomaly)
   - ("zero-day" OR "unknown attack" OR "novel attack") AND IoT AND dataset
   - "digital twin" AND IoT AND (dataset OR testbed) AND (attack OR intrusion)
   - ("device identification" OR "device state") AND IoT AND dataset AND (benign OR attack)
   - ("Matter" OR "Thread") AND dataset AND security (newer smart-home protocols; not searched today)
4. **Likely gaps from today's search (suggestion):** Matter and Thread datasets; Wi-Fi 6 and Wi-Fi 7 IoT attack data; labeled cross-protocol pivot data; LTE-M and NB-IoT attack data; adaptive or mimicry attacker traces; datasets with defender actions (a closed loop), which would make the simulator less assumption-heavy.
5. **Record the date and exact queries** of each check in this section so the claim "no dataset exists for X" is auditable.

## 141. Corrections and flags from today's search

1. CIC IoT 2022 device count: 81 devices (search) vs about 60 (earlier notes). Check the dataset page.
2. 5G-NIDD: nine intrusion types (paper text) vs eight (tables and attack list). Check the descriptor.
3. TON_IoT and Bot-IoT years differ across sources. Cite each dataset's own paper.
4. Earlier notes called CIC IoT 2022 "attack coverage and labels unchecked"; that is still true.
5. The TabularIoTAttack-2024 collection is a derived relabeling of earlier datasets; do not count it as an independent dataset in cross-dataset claims (its sources overlap with the sets it would be tested against).

## 142. Open items and next steps

1. Run the double-check protocol in 140.10 and update this section; mark any dataset added or removed.
2. Check the items in 140.9 for the shortlisted datasets: CICIoT2023, Edge-IIoTset, TII-SSRC-23, 5G-NIDD, Deakin, NIMS, BCCC-IoT-IDS-Zwave-2025, SHARP, CICIoMT2024, CIC IoT 2022.
3. Decide the cross-dataset feature mapping before any cross-dataset experiment.
4. Confirm whether the York smart-home dataset (Shafi) is released and whether SHARP and BCCC contain any cross-protocol attack.
5. Carry forward all open items from earlier sections.

---
---

# UPDATE — 24 November 2026 (new section only; everything above is unchanged)

## 143. SEVERE NOTE: WORKING STANDARDS FOR RESEARCH AND SIMULATION (read before every experiment and every submission)

**Why this exists:** my first paper received many reviewer comments, partly from inexperience, and the back-and-forth cost a lot of time. The rule from now on: find the weaknesses myself, in a structured way, before a reviewer or a bad result finds them for me. This note has two halves: a review gate for papers, and a working discipline for experiments. Both apply to every paper in this roadmap and to the simulator PC.

### 143.1 Pre-submission review gate (papers, proposals)
1. Run a reviewer-style critique **before** submission: novelty, soundness, baselines, statistics, reproducibility, claims vs evidence, related work, writing.
2. Fix major findings first, then minor ones, then run the review again.
3. Keep a list of every past reviewer comment and make each one a permanent check item.
4. Check every claim against the "do not claim" lists in this roadmap (no "first" claims without the database sweep).
5. Verify every citation, number and venue deadline against its source.
6. Get one human read (supervisor or colleague) after the review pass.

### 143.2 The mindset (important)
- A model is trained to think the way we think. If we can see something is wrong in an output, the model can be taught to see it too. So a weak result is a signal to investigate, not a verdict.
- Results can almost always be improved **in ethical ways**. There are many legitimate levers (143.7), and a small tweak or a smart swap can change the whole outcome. The same logic can be coded in thousands of ways.
- **Working stance: assume a fix exists until a test shows otherwise.** "It won't change" or "that is a limitation" is never an answer by itself. It becomes an answer only after a concrete test has been run and the evidence recorded.
- Troubleshooting is never wasted time. Every run, good or bad, shows a pattern, and the pattern points to the weak part. Working logically takes more time at the start and scales much better, especially because this project is a **sequence of models linked together**: no single stage may be allowed to flop silently.
- "Test this, test that and hope it works" is replaced by: look at the evidence, form a hypothesis, predict what a change will do (including what it might break), change one thing, rerun, log.

### 143.3 Two versions of every pipeline: label-aware reference and deployable
Keep two versions of the same experiment and compare them.

| | Label-aware reference version | Deployable version |
|---|---|---|
| Does each window (tuple) carry its true label into the code? | Yes (it knows the label) | No. It sees only what a real system would see |
| Purpose | A diagnostic and an upper bound: shows what is possible if a given stage worked perfectly | The real system; the only version whose results are reported as results |
| Typical use | Swap one stage at a time with its label-aware counterpart (for example true labels instead of a viewer's output) to see which stage loses the most | Everything else |

- The gap between the two versions locates the loss: in the viewer, in the conversion to masses, in the fusion rule, in the windowing, or in the labels themselves.
- **Hard rule:** the label-aware version is never reported as a result and never shares code paths that could leak labels into the deployable one. Interpretation note: this reading of "the persistent version where the tuple knows the label" is mine; correct it if you meant something different.

### 143.4 Clean pipeline order (every dataset, every time)
1. **Read** the dataset and write down what it contains (classes, devices, time order, benign share).
2. **Clean** it (duplicates, missing values, inconsistent labels, infinite values) and log what was removed.
3. **Audit before touching anything:** class percentages overall, per window, per step; per-device counts; duplicate windows; whether windows overlap.
4. **Split first** (train, validation, held-out families, test), with the held-out families chosen before any tuning and never used for tuning.
5. **Preprocess** on the training split only (scalers, encoders, feature selection), then apply to the others.
6. **Imbalance check:** is oversampling (for example SMOTE) needed or are class weights, a different loss or a different window enough? Oversampling is applied **only to the training split**, never before the split, and its effect is compared against the alternatives and logged.
7. **Seeds:** fix the seed protocol, run enough seeds, keep tuning seeds separate from evaluation seeds.
8. **Tune on validation only**, with a grid-edge check on every tuned value.
9. **Run, then troubleshoot** (143.5).

### 143.5 The troubleshooting loop (after every run or Colab output)
1. **Record** the result next to the exact settings (window, step, seed, model, loss, parameters) in a results ledger.
2. **Read the pattern, not only the headline number:** per class, per attack family, per window size, per device, confusion matrix, calibration, false alarms at a fixed detection rate, and the state percentages inside each window.
3. **Name the cause:** state which parameter or combination of parameters produced the output ("this belief is weak because the window is too short for scan traffic and the viewer sees only 3% of that class"). A cause that cannot be tested is only a guess.
4. **Predict the side effects** before changing anything: if this fixes problem A, can it create problem B, and could it make things worse overall?
5. **Change one thing at a time** (or a planned small set), rerun, compare against the ledger.
6. **Stop-and-think rule:** if three fixes in a row do not move the result, stop tuning and move one level up: question the window, the labels, the model family or the framing.
7. **Escalate when a stage is weak:** check the stage on its own first (does this viewer alone work?), then the link to the next stage (does its output mean what the next stage expects?), then the whole chain.

### 143.6 What results to look at (not accuracy alone)
Accuracy can look high for the wrong reason, especially with imbalance. Report macro-F1, per-class recall, false-alarm rate at a fixed detection rate, novelty AUROC on held-out families, calibration, R2 where a regression-type output exists, and cost. A high number is only accepted after the sanity checks in 143.8.

### 143.7 Legitimate levers when a stage is weak (a checklist to think outside the box)
- **Data side:** window size and step; overlap; feature set and aggregation; scaler; label grouping into states; class weights, oversampling or undersampling (train split only); device-level or time-aware splits.
- **Model side:** model family and depth (for example a shallower or deeper network, a recurrent vs a feed-forward model, a different architecture for the same role); loss function; regularization; learning rate and schedule; early stopping; calibration (temperature scaling).
- **Belief side:** the viewer panel (swap one viewer for another of the same role); the conversion recipe and its endpoints; trust weights; the fusion rule; the memory keep factor; the decision thresholds, chosen on validation.
- **Framing side:** whether the target classes are the right ones; whether the task as defined has a different, easier formulation.
- Combinations matter: a small tweak in one place can fix the whole logic, and a "fix" in one place can break another, which is why step 4 of the loop exists.

### 143.8 Ethical rules (no data manipulation, ever)
- Never tune on the held-out families or the test split. Never alter labels or drop hard examples to raise a score. Never select seeds or runs after seeing results.
- Report every variant tried, including the ones that failed, and keep the ledger as part of the evidence.
- **Leakage checks before believing any good number:** duplicate or near-duplicate windows across splits; overlapping windows across train and test; the same device or session on both sides; scaler or feature selection fitted on the full data; labels encoded in features. A quick test: shuffle the labels and confirm the score drops to chance; train on half the devices and test on the others.
- Improvements must come from better modeling, not from a more forgiving evaluation.

### 143.9 Ceiling check (the honest part)
- Not every limit is fixable: label noise, classes that overlap in feature space, or information that is simply not in the window can cap what any model can do.
- So before declaring a result final, estimate the ceiling: the label-aware reference (143.3), a simple strong baseline, a repeat with different windows, and a look at confusion between specific classes.
- If the ceiling is low, the fix is in the framing (windows, classes, features, task definition), not in massaging numbers. If the ceiling is high and the system is far below it, a fix exists and the troubleshooting loop will find it.

### 143.10 Instruction for the simulator-side assistant (Claude Code or any coding assistant)
When working on this project:
1. **Do not answer "the outcome won't change" or "this is a limitation" without a test.** Run the smallest experiment that checks it and report the evidence.
2. **Treat the user's logical reasoning as a hypothesis to test immediately**, not to argue against. Assume a fix exists until a test shows otherwise, then report what the test showed.
3. **Think beyond the obvious fix:** propose at least two or three alternatives (a different window, a swapped component, a different loss, a different split of the problem) and say what each might break.
4. Follow the pipeline order (143.4) and the troubleshooting loop (143.5); keep a change log and the results ledger.
5. Never use label information in the deployable path; never tune on held-out or test data; never hide failed variants.
6. When a stage is weak, isolate it first (stage alone, then link to the next stage, then the whole chain).

### 143.11 Open items
1. Paste the past reviewer comments here and turn them into a personal checklist (143.1, item 3).
2. Decide whether to save a reusable reviewer skill (a fixed checklist and report format) for pre-submission critiques.
3. Start the results ledger on the simulator PC (settings, seed, result, hypothesis, outcome), so every fix is traceable.
4. Define the label-aware reference version for each stage of the belief pipeline (viewers, conversion, fusion) so the gap can be measured stage by stage.
5. Carry forward all open items from earlier sections.

---

## UPDATE — 24 November 2026 (new section only; everything above is unchanged)

### 126. DQN study, Steps 1 to 10 (plain-words reference; read this when asked about DQN)

**Status:** Session 3 (DQN vs PPO) finished. All numbers in examples are made up to show the idea (illustrative). Items marked (verify) are from memory or from an earlier reading and were not checked against the DQN papers or the Stable-Baselines3 docs. The arm names D1, D2, D3 are my inference from the session text, which refers to a "Section 135" that is not in the md I have; also note that in Section 94 of the roadmap the old arm D was the model-based arm and the old arm E was DQN, so check the naming before using it.

#### A. Plan of the session
1. What is a Q-value? 2. Acting from Q-values. 3. How Q is learned (Bellman). 4. Why a table fails, how a network replaces it. 5. Replay memory. 6. Target network. 7. The whole DQN loop and its knobs. 8. Over-optimism and Double DQN. 9. DQN and DDQN vs PPO. 10. Connection to our agent and the arms D1, D2, D3. All ten are done.

#### B. Step 1: what is a Q-value
- Picture: a menu with a score for each dish. PPO's critic scores the situation; a Q-value scores each action in the situation.
- **Q(situation, action) = the total future score expected if this action is taken now and the agent plays well afterwards.** Same kind of number as the discounted return (gamma), tied to one action.
- Example (belief U about 0.45): wait -3.0, rate-limit -1.5, temporary block -2.0, isolate and alert -2.6. All negative because every outcome has some cost; only the ranking matters. Best: rate-limit.
- **Difference from PPO:** PPO learns the behavior directly (actor outputs probabilities; the critic only helps). DQN learns only the scores and derives the behavior: pick the highest Q. There is no separate actor.
- Fit: needs a small discrete action set (our 4-rung ladder), not a continuous action. The network takes the same observation as the PPO policy; the last layer has one output per action and no softmax (scores, not probabilities).

#### C. Step 2: acting from Q-values (epsilon-greedy)
- Always taking the best score never tries the others, and early scores are guesses. **Epsilon-greedy:** with probability epsilon pick a random action, otherwise the highest Q.
- Example (epsilon 0.1, 4 actions): best action chosen 0.9 + 0.025 = 92.5%; each other action 2.5%.
- **Schedule:** start high (1.0 = fully random), decay to a floor (e.g. 0.05). Linear example: 1.0 to 0.05 over 100,000 steps; at step 50,000, epsilon = 1.0 - 0.95 x 0.5 = 0.525.
- **Epsilon is a setting we choose (hyperparameter), not learned.** From memory, SB3 DQN starts at 1.0, ends at 0.05 and decays over the first 10% of training (verify). Consequence: epsilon start, end and decay length are extra knobs that need a fair search; PPO has no counterpart.
- The Q-BIRD DQN baseline reportedly lists a linear-decay schedule, a 50,000-transition replay buffer, a target update every 500 steps and 64 units per layer (from an earlier reading of arXiv 2606.07796, verify).
- **At deployment exploration is off** (epsilon about 0): the live agent picks the best Q, which is deterministic and easier to explain.
- **Difference from PPO:** PPO explores by sampling its own probabilities (guided, plus the entropy bonus). DQN's random actions are blind and hand-tuned.
- **Masks:** for a forbidden action (e.g. block before rate-limit) set its Q to a very low value before choosing; random exploration must also skip masked actions.

#### D. Step 3: how the scores are learned (Bellman idea)
- **Q(situation, action) = reward just received + gamma x best Q of the next situation.** The agent does not wait for the episode to end; after every step it forms a better guess (the target) and moves the old guess toward it.
- Example (gamma 0.9): guess -1.5, reward -0.7, best next Q -0.2. Target = -0.7 + 0.9 x (-0.2) = -0.88. Gap (TD error) = 0.62. Learning rate 0.1: new Q = -1.5 + 0.1 x 0.62 = -1.438.
- **Bootstrapping:** the "-0.2" in the target is itself an estimate, so the agent learns from its own guesses. Fast, but it is the root of the problems fixed in Steps 5, 6 and 8.
- Same shape as the PPO one-step advantage (reward + gamma x value(next) - value(now)); the difference is what is done with the gap: PPO turns it into a push on the action's probability; DQN uses it to correct the score number.
- The max in the target makes DQN **off-policy**: it learns the value of the best behavior even while exploring randomly.
- **When epsilon and the correction happen:** epsilon is used when choosing the action; the Bellman correction is used afterwards, when learning from the result. Epsilon does not appear in the correction.
- Worked example: scores wait -3.0, rate-limit -1.5, block -2.0, isolate -2.6; epsilon 0.1, gamma 0.9. Random draw 0.04 (below 0.1) so a random action, isolate, is taken. Reward -1.2, best next Q -0.5. Target = -1.2 + 0.9 x (-0.5) = -1.65. Gap = -1.65 - (-2.6) = +0.95. New score = -2.6 + 0.1 x 0.95 = -2.505. Only the taken action's score changes. The correction is the same whether the action was random or greedy, which is why exploring pays off.
- At deployment both epsilon and the learning step are off.

#### E. Step 4: why a table fails, what replaces it
- A table needs one row per situation. Our observation is continuous: even 12 belief numbers cut into 10 levels each give 10^12 rows, and the agent would almost never see the same situation twice.
- **A neural network replaces the table ("Deep" in DQN):** input = observation, output = one Q per action (4 numbers), small size (e.g. 2 hidden layers of 64 units). Similar situations (U 0.45 and 0.47) give similar outputs, so learning generalizes.
- Learning: push the output for the action taken toward the target. Example: network said -2.6, target -1.65, error 0.95, squared loss 0.9025; gradient descent adjusts the weights. Only the taken action's output enters the loss.
- Catch: one weight change moves many situations at once, and the target comes from the network's own guesses, so learning can be unstable. Two fixes follow.

#### F. Step 5: replay memory
- Problem: consecutive steps look alike (20 attack steps in a row), so learning in order pushes the network in one direction, and each experience is used once and discarded.
- **Replay memory:** after every step save a card (situation, action, reward, next situation, episode-ended flag) in a fixed-size memory (e.g. 50,000; oldest overwritten). Each update samples a random batch (e.g. 64), builds targets with the Step 3 formula and does one gradient step. Training usually starts after a warm-up.
- Example: 6 cards (3 calm, 3 attack). Without replay the network sees A1, A2, A3 and drifts to "everything is an attack"; with replay a random batch of 4 mixes calm and attack.
- **Episode-ended flag:** when an episode ends there is no next situation, so the target is just the reward.
- Gains: breaks streaks; reuses data (sample-efficient, a reason DQN could win in a limited-data regime, which is a hypothesis to test); smoother updates.
- Allowed because DQN is off-policy (old cards are fine since the target uses the best next score). PPO cannot do this: its update assumes data from the current policy, so it discards the batch.
- Catches: rare events can be sampled too rarely (prioritized replay samples large-error cards more often; Rainbow DQN bundles it with dueling networks and multi-step learning, verify); memory size is a knob; stale cards matter in multi-agent settings (Paper 3); a recurrent version (D3) needs sequences, not single steps, in the memory.
- Sizing: 50,000 cards = about 416 episodes of 120 steps.

#### G. Step 6: target network
- Problem: the target uses the same network that is being trained, so every weight change moves the target (a student grading his own exam against an opinion that changes as he learns).
- **Two networks:** the online network (trained every update, picks actions) and a **target network** (a frozen copy used only to compute the "best next score" inside the target, overwritten with a copy of the online network every N steps; N = 500 in the Q-BIRD baseline, verify).
- Example (gamma 0.9, reward -0.7): without a target network the next best score moves from -0.20 to -0.40 after one gradient step, so the target jumps from -0.88 to -1.06 with no new experience. With a frozen copy it stays at -0.88 for the whole interval.
- Gains: much more stable; costs one extra small network.
- Catches: slower to pass lessons on (a longer interval is steadier but slower); a "soft update" variant drifts the target slowly toward the online network each step (general knowledge, verify the default); the interval is a knob that can matter as much as the learning rate.
- The two fixes together: replay fixes which data the network sees, the target network fixes what it chases. (DQN history, 2013 and 2015 work, is from memory; verify citations.)

#### H. Step 7: the whole DQN loop
1. See the situation. 2. Choose an action: highest Q, or random with probability epsilon (online network, epsilon). 3. Environment returns reward and next situation. 4. Save the card. 5. If the memory has enough cards and it is a learning step, sample a random batch. 6. Build each target with the frozen network: reward + gamma x best next score (skip the second part if the episode ended). 7. One gradient step on the online network. 8. Every N steps copy online into target. 9. Shrink epsilon. 10. Repeat. Steps 5 to 8 are not done at every step (warm-up, train frequency).

| Knob | Controls |
|---|---|
| learning rate | size of each weight change |
| gamma | how much the future counts |
| epsilon start, end, decay length | how long and how much it explores |
| replay memory size | how many past cards are kept |
| warm-up steps | cards collected before learning starts |
| batch size | cards per update |
| train frequency | one update every how many steps |
| target update interval | how often the frozen copy is refreshed |
| network size | layers and units |
| loss and gradient clipping | how big errors are treated |

- From memory SB3's DQN defaults are epsilon 1.0 to 0.05 over the first 10% of training, a very large buffer and a large target interval (verify before tuning).
- Fairness: DQN has more interacting knobs than PPO, so it needs a real search budget (same budget as the PPO arms, with the grid-edge check).
- Trace (warm-up 100, learn every 4th step, target refresh every 500): steps 1 to 100 act and save only; step 104 first update (64 random cards); step 108 another; step 500 refresh.

#### I. Step 8: over-optimism and Double DQN
- **Problem:** the target uses the max over the next situation's scores. Those scores are the network's guesses, with errors, and the max of noisy numbers is biased upward (the best-looking error wins). The optimistic target then spreads through bootstrapping.
- Example: all four next actions truly worth -1.0, network estimates -1.3, -0.7, -1.1, -0.9. The max is -0.7, which is 0.3 too optimistic, every time.
- **Why it may matter for our agent (reasoning, not tested):** rare situations (high U) have few cards and noisy estimates, so over-optimism is strongest where decisions matter most, and the agent could overrate heavy actions such as isolate, which would raise false isolations.
- **Double DQN fix:** the online network chooses the next action, the target network scores it. Target = reward + gamma x (target network's score for the action the online network picked). The two networks have different errors, so the luck that made one pick an action does not carry into the other's score. In the example, if the online network cannot tell the actions apart, the scores average to -1.0, the true value, instead of the max's -0.7.
- Cost: one line of code; no extra network. It does not remove the bias completely and can sometimes underestimate; how much it helps depends on the task, so it is tested as its own arm (D2 vs D1).
- Library catch (from memory, verify): SB3's DQN is probably the plain version and does not offer Double DQN or the other extensions, so D2 may need another library (a single-file implementation you can edit) or a small custom change.
- Origin: van Hasselt and colleagues' Double DQN work (from memory, verify the citation).
- Reference answers to the Step 8 checks: all four true -2.0 and estimates (-2.4, -1.6, -2.2, -1.8): the normal max gives -1.6, 0.4 too optimistic. In Double DQN the online network chooses and the target network scores.

#### J. Step 9: DQN and DDQN vs PPO
- **On-policy vs off-policy:** PPO needs data from the policy being improved (its update uses the ratio new/old probability and advantages for the old policy) so it discards the batch after the update. DQN's target uses the best next score whoever chose the action, so cards from any past agent stay valid.
- **Data reuse:** PPO example: collect 2048 steps, 10 epochs, discard (each step used about 10 times, once). DQN example: learn every 4 steps with batches of 64, so each new step buys 64 / 4 = 16 sample slots, and a card can be sampled over many updates for as long as it stays in the memory. DQN is often called more sample-efficient (fewer real environment steps) but costs more computation per step. In our simulator steps are cheap, so the advantage matters mainly in the limited-data regime (a new home with a few days of traffic). This is a hypothesis.
- **Stability:** PPO's safety is the clip; DQN's are the replay memory and target network. DQN's weak spots: over-optimism, sensitivity to target interval, memory size and epsilon. PPO needs a good critic and tuning but has fewer interacting knobs. The mix of bootstrapping, off-policy data and a neural network is known as risky (general knowledge, verify), which is why DQN needs its two fixes.

| Topic | PPO | DQN |
|---|---|---|
| What is learned | behavior plus critic | scores; behavior = highest score |
| Exploration | sampling plus entropy bonus (guided) | epsilon schedule (blind, hand-tuned) |
| Data | batch discarded after the update | replay memory reuses cards |
| Actions | discrete or continuous | discrete only (fine for the 4-rung ladder) |
| Memory over time | RecurrentPPO is simple | recurrent DQN needs sequences in replay (arm D3), harder |
| Multi-agent (Paper 3) | IPPO and MAPPO are the usual family | old cards can describe a world other learners changed, so people lean to PPO-style methods (general knowledge, verify) |
| Federated (Paper 2) | federate actor and critic weights | federate the online network; each home keeps its own replay memory |

- **Roadmap link:** FRL-IPS, the Candidate 1 benchmark, uses a federated Double DQN (from the roadmap), so D2 is needed for Paper 2 anyway.
- **Literature (thin, snippet-level, verify):** Q-BIRD compared DQN, DRQN and PPO variants; a Siamese + PPO zero-day paper reports PPO over DQN and SAC for its task. Each is one task, abstracts only. Treat "PPO wins" and "DQN wins" as both unproven for our agent.
- Reference answers to the Step 9 checks: (1) DQN can learn from an old card because its target uses the best next score regardless of who chose the action; PPO's update depends on the old policy's ratio and advantages, so old batches are stale. (2) In the limited-data case DQN or DDQN is hypothesized to help more because replay reuses every card; test with the same small budget of real windows for every arm, measuring the return reached and the real steps needed to hit a target return, over at least 10 seeds.

#### K. Step 10: connection to our agent and the arms
- **Same everything except the learner:** the same environment, observation, reward, ladder, masks and step size as the PPO arms. Only the learning method changes. The viewers and belief module stay frozen; only the online network learns. The network has 4 outputs; masked actions get a very low score.

| Arm | What it is | Change from the one before |
|---|---|---|
| D1 | DQN | baseline of the DQN family |
| D2 | Double DQN | one line in the target (online picks, target scores) |
| D3 | Recurrent DQN | memory in the network; sequences stored in the replay memory |

- **Belief axis:** each arm can be run with window features only, or with the fused DS belief added, mirroring G1 vs G3. A core subset to start with (suggestion): D1 and D2, each with and without belief; D3 optional.
- **Hypotheses to test (not claims):** DQN or DDQN needs fewer real steps in the limited-data regime; PPO is steadier across seeds; DDQN lowers false isolations in rare high-U situations; belief input helps both families; D3 is harder to tune than RecurrentPPO.
- **Fairness rules:** same environment, reward, ladder, step size, observation and masks for every arm; same tuning budget and search ranges, with the grid-edge check (DQN has more knobs, so equal effort, not equal number of settings); report real environment steps to a target return and also wall-clock or gradient updates (DQN trades environment steps for compute); at least 10 seeds with bootstrap intervals; same held-out evaluation; report failed or unstable runs.
- **Decisions still open:** budget per arm; which subset to run; how D3 stores sequences; which library implements D2 and D3 (see Step 8 catch).

#### L. Fast answers to likely questions
| Question | Short answer |
|---|---|
| Does DQN have a policy network? | No. It learns Q-scores and acts on the highest one. |
| Where does exploration live in DQN? | In a hand-set epsilon schedule, separate from learning. |
| Why a replay memory? | To break streaks of similar steps and reuse data. |
| Why a target network? | To keep the Bellman target from moving with every update. |
| What does Double DQN fix? | Over-optimism from taking the max of noisy guesses. |
| Why not just DQN for everything? | More interacting knobs, over-optimism, harder recurrent and multi-agent versions; whether it beats PPO for our agent is an experiment. |
| Is DQN on-policy? | No, off-policy: it learns from old cards. PPO is on-policy. |
| Does epsilon appear in the Bellman correction? | No. Epsilon only picks the action; the correction runs afterwards. |

#### M. Open items
1. Check the arm names D1, D2, D3 against the roadmap's "Section 135" and against the old arm names (Section 94: D = model-based, E = DQN).
2. Verify against the DQN papers and the SB3 docs: defaults, Double DQN support, Rainbow components, soft-update default, Q-BIRD DQN settings, and all citations given from memory.
3. Next study topics (suggestion): the formal belief-in-PPO recap, world models and MBRL basics, experiment design; then back to the postponed Session 1 decisions (episode end and U response, sanity-check baselines, action-effect numbers, reward weights).
4. The user reported earlier low confidence in PPO Steps 9 to 11; revisit with one tiny example each (the nudge, the advantage, the clip) if still unclear.
5. Carry forward all earlier open items.

---

## UPDATE — 26 November 2026 (new sections only; everything above is unchanged)

Today: a plain-words recap of DQN and PPO (kept separate), how to test them fairly, how to read the first simulation result (DDQN above PPO, then PPO with perfect perception at 0.93), the oracle-as-ceiling framing, a plan for a harder second simulation, and a list of new contribution candidates. Items marked (suggestion) are my proposals, not decisions. Items marked (verify) were not checked against sources. Numbers in examples are illustrative unless marked "reported by the user", and the user's numbers are from memory (no code available in the chat), so treat them as unverified.

**Working rules for this chat (recorded):** coding and running simulations happen elsewhere; this chat builds structure, basis and contributions. The md is written only when the user asks, or when the context is about to run out.

### 127. DQN and PPO in plain words (kept separate on purpose)

#### A. DQN, the score keeper
Picture: a waiter with a menu where every dish has a score for tonight; he orders the best-scored dish.
1. Learns a score for each action in each situation (e.g. rate-limit here is worth -1.5, wait -3.0).
2. Acts by picking the highest score. Nothing else decides. There is no separate policy.
3. Explores by picking a random action a small percent of the time (epsilon). The percent starts big, shrinks, and is set by hand.
4. Learns after each step: "what did I get, plus what do I expect next?", then nudges the old score toward that answer (the Bellman idea: new score = reward + gamma x best next score).
5. Problem 1, similar steps in a row. Fix: the replay memory (a box of past experiences, learned from in random mixed batches).
6. Problem 2, the target moves because it is built from its own guesses. Fix: the target network (a frozen copy, refreshed now and then).
7. Problem 3, scores come out too high, because the best of noisy guesses is the luckiest one. Fix: Double DQN (one network picks the action, the other scores it).
8. Reuses old experiences again and again, so it is often good with little data.
9. Limits: only a small list of actions (our 4-rung ladder is fine) and many settings that interact.
10. When deployed: no random picks and no learning; it takes the highest score.

One-paragraph version: DQN is a score keeper, not a policy and not a coach. It scores each action, takes the best (with a small shrinking random addition), learns the scores with the Bellman equation, and needs two fixes (replay memory and target network). Double DQN fixes over-optimism. It reuses old data (off-policy), but has more knobs than PPO.

Corrections to the user's own draft of this paragraph: "policy coach" describes PPO, not DQN; "cost and positive outputs" was read as over-optimism (scores come out too high).

#### B. PPO, the habit coach
Picture: a guard with a habit for each situation, and a coach who improves the habits after each block of shifts.
1. Learns the habits themselves: for each situation, how likely each action is (e.g. wait 10%, rate-limit 60%).
2. Acts by rolling the dice with those chances. Good actions are likelier, others still happen sometimes.
3. Explores through the chances themselves; a small bonus (entropy) stops them collapsing to 100% too early.
4. A helper network (the critic) judges "how good is this situation?", which gives the yardstick for better or worse than expected.
5. Learns by playing a batch, asking per action "better or worse than expected?", and making better ones likelier and worse ones less likely.
6. Safety rule: each update may change the chances only a little (the clip).
7. Uses a batch for a few passes, then throws it away (on-policy).
8. Strengths: usually steady, fewer settings, handles memory networks easily.
9. Limits: needs more fresh experience; depends on a good critic.
10. When deployed: no learning; usually takes its most likely action.

Clarification: PPO acts like a chance-based chooser, using learned probabilities that add to 100%. Say "probability", not "possibility": in the belief-method study, possibility theory is the fuzzy family with its own meaning.

#### C. Side by side
| | DQN | PPO |
|---|---|---|
| What it learns | scores for actions | habits (chances per action) |
| How it picks | highest score | rolls the dice by its chances |
| Exploring | random percent, hand-set (epsilon) | built into the chances |
| Old data | kept and reused (replay) | thrown away after the update |
| Stability tools | replay memory, target network | the small-update rule (clip) |
| Usually | efficient with data, fussy to tune | steadier, needs more fresh data |
| In our design | arms D1, D2, D3 (names to be checked, see Section 126) | arms G1 to G5 |

Memory aids: DQN = "learn the scores, order the best, sometimes try something random." PPO = "improve the habits a little at a time, never change too much at once." Same for both: same environment, observation, reward and ladder, and the same fair tuning effort.

### 128. Testing DQN vs PPO fairly: how to get PPO's best score honestly

Stance recorded: the goal is to make sure PPO is tuned as well as it can be, not to make PPO win. A comparison where PPO gets many more tuning trials than DQN (or the reverse) proves nothing.

**PPO tuning checklist** (defaults are starting points; verify against the SB3 docs):
| What to do | Why it helps |
|---|---|
| Normalize observations and rewards (SB3 has a wrapper for this, VecNormalize, verify) | our rewards are all negative costs and inputs have very different scales (belief 0 to 1, traffic rates in the thousands); unscaled inputs make the critic and advantages noisy |
| Sweep gamma {0.95, 0.98, 0.99, 0.992} | sets how far ahead the agent looks |
| Watch entropy; raise the entropy coefficient if it collapses early (near zero in the first 5% of training) | exploration stops too early otherwise |
| Learning rate (lower, or decayed) | too high gives unstable, jumpy learning |
| n_steps and parallel environments | a batch should cover many episodes, calm and attack |
| Clip range and epochs | if many samples are clipped or the policy drifts, lower epochs or clip |
| GAE lambda about 0.9 to 0.97 | noise versus bias dial of the advantage |
| Network size (e.g. 64x64 vs 128x128) | too small underfits, too big overfits |
| Action masks (MaskablePPO) | stops wasted exploring of forbidden actions |
| Train long enough | check that the return curve has flattened |
| Recurrent arms (G2, G4) | need extra care (hidden size, sequence length); reviewers attack an under-tuned recurrent baseline |

Monitor while training: return curve, entropy, value loss, fraction of clipped samples.

**Fairness rules:**
- Same tuning budget for both. DQN has more knobs (epsilon schedule, memory size, target interval, train frequency), so give equal effort, not an equal number of settings.
- Tune on separate seeds, evaluate on fresh seeds; never pick the best setting by looking at test results.
- Grid-edge check on every tuned value (widen the range if the best sits at the edge).
- Same environment, reward, observation, ladder and masks for every arm.
- At least 10 seeds with bootstrap intervals; report failed or unstable runs, not only the best.
- Report real environment steps and compute (DQN trades one for the other).
- Evaluate both with the same deterministic choice (highest score for DDQN, most likely action for PPO), not sampled PPO against greedy DDQN.
- Include sanity baselines: random policy, a hand-written threshold rule on U, Omega and K, an oracle. Also run gamma = 0: if the gap does not change, the sequential part helped neither method.

**What to accept up front:** PPO may not win. In a limited-data case (a new home with a few days of traffic), DQN or DDQN may do better because replay reuses every card. That is a result, not a failure.

### 129. First simulation result and how to read it

**Reported by the user (from memory; no code available in the chat; unverified):**
- In the first simulation on CICIoT2023, the best option was DDQN with a higher score than all PPO arms: about 0.23 versus PPO about 0.12.
- The user first recalled the metric as F1, then corrected it: the score is **normalized return**, not F1.
- A PPO setup with a "possibility belief algorithm" reached 0.4, and a setup with perfect perception reached 0.93.
- The environment details (replay of dataset rows versus a simulator where actions change later traffic) were not confirmed.

**Correction to my own earlier answer:** I had argued that F1 is a classification score, so replay favours DDQN. That reasoning does not apply to normalized return. The question of whether the environment is closed-loop is still open and still matters.

**Likely reading of the numbers (to be confirmed by the user):**
| Number | Likely meaning |
|---|---|
| 0.93 | PPO with perfect perception: the oracle ceiling (the agent sees the true state) |
| 0.4 | PPO with the possibility-based belief, or the best arm overall (unclear) |
| 0.23 and 0.12 | DDQN and PPO from the earlier test (unclear which belief each used) |

**What can be said now:** in the first simulation DDQN scored higher than the PPO arms; with perfect perception PPO reaches 0.93, so the task is solvable and PPO can learn it. It cannot yet be said that PPO is better than DDQN (or the reverse) in general, because DDQN's oracle and belief-based scores are unknown and tuning effort is unknown.

**Checks before trusting 0.23 versus 0.12:**
1. What exactly is the number (return, normalized how)? Is higher better for both?
2. Is the gap larger than the noise (seeds, spread; one run each can differ by that much)?
3. Did both get the same tuning effort (defaults for PPO, no normalization, entropy collapse)?
4. Is the environment closed-loop? If it replays dataset rows, actions do not change the next window and the task is close to a contextual bandit, where off-policy value methods often look good. Quick test: gamma = 0 for both.
5. Is evaluation on held-out traffic and attack families, with viewers also trained without them (replay memory can memorize training windows)?
6. Same evaluation mode (deterministic for both)?
7. Where do the scores sit against random, threshold-rule and oracle baselines?
8. Same reward, masks, observation, belief or no belief, episode length and training steps?

**Open questions to the user:**
- How is normalized return defined (e.g. (return - random) / (oracle - random))? If random is 0 and oracle is 1 by definition, 0.93 cannot be the oracle.
- Is "possibility belief" fuzzy/possibility theory, or did the user mean probability? If possibility theory, label it as its own arm against the Dempster-Shafer belief.
- Which score belongs to which setup, and how many seeds?
- Does the simulation replay rows or change traffic after actions?

### 130. Part 2 plan: why PPO might help for our task, and a harder simulation

Context: the professor does not accept "PPO is better" while DDQN scored higher, and the user wanted to show PPO's advantage. Advice recorded: do not engineer a PPO win; state hypotheses, test them in environments where they should show, and report whatever comes out. Part 1 claim that is safe: "in a static replay setting, DDQN did better".

**Hypotheses about why PPO might be better (hypotheses, not facts; literature is mixed: FRL-IPS uses DDQN, a Siamese zero-day paper picked PPO, Q-BIRD compared both):**
| # | Hypothesis | Why PPO might win | Where it should show |
|---|---|---|---|
| H1 | actions have delayed consequences | credit must flow across many steps; replay-based learning suits steps that stand alone | closed-loop environment |
| H2 | attacker adapts or traffic drifts | old replay cards describe a world that no longer exists; PPO trains on fresh data | shifting attacker or MMPP parameters |
| H3 | agent needs memory (partial observability) | RecurrentPPO is simple; recurrent DQN needs sequences in replay and is harder to tune | noisy or ambiguous observations |
| H4 | steadier and easier to tune | fewer interacting knobs; clip limits damage | many seeds, spread and failed runs |
| H5 | better for later papers | IPPO and MAPPO are the usual multi-agent family; continuous actions (exact rate limits) work | Papers 2 and 3, a design argument not a result |

H1 to H4 are testable now; H5 is a design argument.

**Environment ladder (write the predicted winner before running):**
| Level | What changes | Tests | Prediction |
|---|---|---|---|
| E0 (done) | replay, no action effects | baseline | DDQN |
| E1 | actions change future traffic (rate-limit lowers the rate, block removes the device) | H1 | open question |
| E2 | damage grows over steps; attacks have stages | H1 | PPO may close the gap |
| E3 | attacker or MMPP parameters shift during training and testing | H2 | PPO may win |
| E4 | noisy or ambiguous observations, with and without the belief | H3 | recurrent PPO versus recurrent DDQN |
| E5 | held-out attack families and a small-data regime | generalization | DDQN may win again |

**Outcomes and what to claim:**
| Outcome | Claim |
|---|---|
| PPO wins in E1 to E3 | PPO is better under those conditions, with evidence |
| DDQN wins everywhere | use DDQN as the main algorithm; the core contribution (belief with unknown state, graded ladder) works with any learner and the Paper 2 benchmark (FRL-IPS) already uses DDQN |
| Mixed | a crossover map showing where each wins, which is a result in itself |

**What to tell the professor (wording suggestion):** "In static replay, DDQN scored higher. PPO's expected advantages (delayed consequences, adaptive attackers, memory, stability) only appear in closed-loop settings, so I test them in environments E1 to E5 with equal tuning, and report where each method wins." A negative result for PPO is still publishable; forcing a PPO win is not.

### 131. The oracle as a ceiling: how to present "PPO reaches 43% of its potential"

The framing is legitimate with three adjustments.

**What can be said:** with perfect perception PPO reaches 0.93, so the task is solvable and the learner works; with the user's belief it reaches 0.40, about 43% of the ceiling (0.40 / 0.93).

**Adjustments:**
1. **Compute the share of the gap closed against a random baseline:** (score - random) / (oracle - random). Example (illustrative): random 0.05 gives (0.40 - 0.05) / (0.93 - 0.05) = about 40%. If normalized return already sets random to 0 and the oracle to 1, say so explicitly.
2. **Say "ceiling of this environment", not "potential of the method".** The oracle uses information no real system has; present it as an upper bound, never as a result.
3. **Do not claim "it can be developed more" without evidence.** More data helps only if the gap comes from too little data; it may come from limited information in the viewers, a belief that carries too little signal, or too little PPO tuning.

**Tests that show where the gap comes from:**
| Test | What it tells you |
|---|---|
| learning curve (does the score still rise at the end of training?) | if flat, more training steps will not help |
| training-set size sweep (viewers and policy on 25%, 50%, 100% of data) | whether more data raises the score |
| perception sweep (score as perception goes from perfect to the real belief, adding noise in steps) | where the loss comes from and how good the viewers must become |
| tuning sweep (the PPO checklist in Section 128) | whether part of the gap is just tuning |

**The claim "PPO reaches 43% of its ceiling" is about PPO alone; it does not show PPO beats DDQN.** The comparison needs DDQN with the same belief and the same oracle:
| | No belief | Your belief | Perfect perception |
|---|---|---|---|
| PPO | ? | 0.40 (reported) | 0.93 (reported) |
| DDQN | ? | ? | ? |

How to read it: if DDQN also reaches about 43% with the same belief, the belief is the story, not the algorithm (a good result for the thesis, because the contribution is the belief and the graded response); if PPO beats DDQN only in noisy-belief columns, that is a finding to test further with equal tuning and several seeds; if DDQN also reaches about 0.93 with perfect perception, the learners are equal there.

Suggested wording: "With perfect perception the agent reaches 0.93, so the task is solvable. Using our belief it reaches 0.40, closing about X% of the gap above a random policy. We test whether the remaining gap is due to data, viewer quality or tuning, and compare against DDQN under identical conditions."

### 132. New contribution candidates (structure and basis; no coding in this chat)

Novelty is judged from snippet-level searches only; every candidate needs the database sweep before any claim. None needs new theory.

| # | Candidate | Question it answers | Why it might be new | Cost | Risk |
|---|---|---|---|---|---|
| 1 | Perception-gap benchmark | how much of the oracle gap does each belief close, and does that depend on the learner (PPO vs DDQN)? | an oracle already exists (0.93); a "fraction of gap closed" protocol across belief types and learners is a clean, reusable evaluation | low | may look like only an evaluation method |
| 2 | Evidential belief with unknown state, used causally | do U, Omega and K carry decision-relevant information beyond the raw viewers (G3 vs G5) and beyond memory (G4)? | multi-viewer Dempster/Yager fusion, explicit U and graded ladder for IoT not found together, but Trust-By-Learning, Q-BIRD and SHIELD are close | medium | DS advantage may vanish under a fair test (reported once in anti-UAV work) |
| 3 | Learner-versus-environment crossover map | when does DDQN win and when does PPO win (static replay, closed loop, drift, memory)? | gives the honest answer to "which is better" as a map | medium | result could be "DDQN everywhere" (still reportable) |
| 4 | Active evidence-gathering action | when the belief says unknown (high U or Omega), should the agent take a cheap probing action (extra inspection, challenge a device, ask another viewer) before containing? | the ladder only contains; a probe rung treats unknown as a POMDP information problem | medium | needs a defensible effect model for the probe |
| 5 | K-driven viewer trust under shift | can high conflict K automatically lower a viewer's trust when it meets a new protocol or environment? | answers the open question of how to choose alpha; cheap offline test first | low to medium | K may not rise reliably under shift |
| 6 | Cost-conditioned policy ("caution dial") | can one trained agent follow an operator's setting for how costly a false block is, without retraining? | operators differ in tolerance; one policy plus a dial is practical | medium | multi-objective RL adds complexity |
| 7 | Calibrated unknown belief | does m(U) mean what it says, and does calibration improve graded actions? | graded actions only make sense if the number is trustworthy | low | mostly an ablation |
| 8 | Closed-loop IoT defense environment, released | a documented environment with calibrated traffic, action effects and held-out families | the gap survey found environments are enterprise-shaped | high | simulator-trust attack |

**Recommendation (suggestion):** combine 1 + 2 + 3 as one story: "In IoT defense, perception matters more than the learner, and an evidential belief with an explicit unknown state closes more of the oracle gap than plain features or stacked viewers, for both PPO and DDQN." It fits the existing result (belief at 0.40 against oracle at 0.93) and turns PPO versus DDQN from a fight into a controlled factor. Add 5 (cheaper, offline) or 4 (more original, needs a probe model) as the extension.

**Test every contribution against:** (1) the closest paper that could kill it; (2) a numeric pass/fail rule written before running; (3) what is reported if it fails.

**Settle first:** run the database sweep for candidates 2, 4 and 6; fill the PPO/DDQN x (no belief / belief / oracle) table with seeds and equal tuning; resolve whether "possibility belief" means possibility theory or probability, because it decides how candidate 2 is worded.

### 133. Next-step options and recommendation (as discussed)

| # | Option | Why now | What it unblocks |
|---|---|---|---|
| 1 | Session 1 Steps 6 to 8: episode end and the response to U, sanity-check baselines (random, rule-based, oracle), one-page design | the postponed decisions; the environment cannot be built without them | the Gymnasium environment for all arms |
| 2 | Experiment design: seeds, equal tuning budget, grid-edge check, confidence intervals, pre-registered pass/fail rules | the full answer to "how to test PPO vs DQN fairly" | a fair comparison protocol written before any run |
| 3 | World models and MBRL basics | needed for the model-based arm and Candidate 1 in Paper 2 | the model-based arm |
| 4 | Belief-in-PPO recap (short) | ties the belief module to the policy input | clear observation layout |
| 5 | PPO confidence repair: one tiny example each for the nudge, advantage and clip | the user reported Steps 9 to 11 felt odd | confidence before tuning |
| 6 | 6G and novelty search (query plan in Section 125 I) | decides positioning claims | safe wording in the proposal |

Recommended order (suggestion): 1, then 2, then 5 and 4 in short form, then 3, with the 6G search in parallel when library access is available. Question to settle first if option 1 is picked: how long is a training episode and what ends it (earlier suggestion: 10 minutes, 120 steps at 5 s, early stop if a damage cap is hit). The user chose a plain recap of DQN and PPO first (Section 127) and then moved to the simulation results and contributions (Sections 129 to 132); option 1 is still open.

### 134. Open items

1. Confirm what the user's simulation measures (normalized return definition), whether it replays dataset rows or changes traffic after actions, and which score belongs to which setup (0.23, 0.12, 0.4, 0.93).
2. Fill the table PPO and DDQN x (no belief / real belief / perfect perception) with at least 10 seeds and equal tuning; add random, threshold-rule and oracle baselines and the gamma = 0 check.
3. Resolve "possibility belief": possibility theory or probability; if possibility, run it as its own arm against the Dempster-Shafer belief.
4. Run the tests in Section 131 (learning curve, data-size sweep, perception sweep, tuning sweep) before claiming the gap "can be developed more".
5. Decide the contribution direction (suggestion: 1 + 2 + 3, with 5 or 4 as the extension) and run the database sweep for each chosen candidate.
6. Design environments E1 to E5 (Section 130) with predicted winners written before running.
7. Postponed Session 1 decisions: episode end and U response, sanity-check baselines, action-effect numbers, device-selection rule, per-protocol mapping, reward weights, window and step.
8. Check the DQN arm names D1, D2, D3 against the roadmap's "Section 135" and the old arm names (Section 94: D = model-based, E = DQN).
9. Carry forward all earlier open items (Sections 66, 80, 92, 109, 122, 125 and 126).


---

## UPDATE — 27 November 2026 (new section only; everything above is unchanged)

### [number to assign] Contribution candidates in plain words, and the new ideas that came out of the discussion

**Status:** structure and basis only (no coding in this chat). Items marked (suggestion) are my proposals, not decisions. Items marked (verify) were not checked against sources. Novelty is judged from snippet-level searches only; no database sweep has been run for any candidate below. All numbers in examples are made up to show the idea. The user mentioned a recent attack on French blood fridges (temperature raised, blood packages ruined); I could not verify it, so it is used only as an illustration of the logic.

#### A. The 8 candidates in plain words (from Section 132, one line each, with an everyday example)
| # | Candidate | Plain idea | Everyday example |
|---|---|---|---|
| 1 | Perception-gap benchmark | measure how much of the gap between the real belief and the perfect-perception ceiling each way of "seeing" closes, and whether it depends on the learner (PPO vs DDQN) | a guard with a perfect feed catches almost everything, with the blurry real feed 40%; three fixes close 60%, 30% and 10% of the gap |
| 2 | Evidential belief with an unknown state | the agent keeps belief, ignorance and disagreement as separate numbers, with a state for "something new"; show these numbers help the decision | odd traffic fits no known attack, so the agent shows high "unknown" and takes a gentle step |
| 3 | Learner-versus-environment crossover map | map where PPO wins and where DDQN wins instead of arguing one is better | two drivers tested on dry road, rain and ice |
| 4 | Active evidence-gathering action (probe) | when unsure, take a cheap "look closer" action before containing | a smart lock acts strangely; the agent checks identity first and only escalates if the check fails |
| 5 | Conflict-driven trust | lower a viewer's weight automatically when disagreement rises (new protocol or environment) | two weather apps usually agree; one starts giving odd forecasts abroad, so trust it less |
| 6 | Cost-conditioned policy (caution dial) | one trained agent that follows an operator setting for how costly a false block is | hospital monitors: very cautious; smart lights: act fast |
| 7 | Calibrated unknown belief | "60% unknown" should be right about 60% of the time | a weather app saying 60% rain should be right on 60 of 100 such days |
| 8 | Closed-loop environment, released | a documented practice world where actions change later traffic | a flight simulator for defenders |

Groups: evaluation story (1, 3); belief story (2, 5, 7); new actions (4, 6); infrastructure (8). Suggested core (from Section 132): 1 + 2 + 3 as one story, with 5 or 4 as the extension. Updated ranking after this discussion is in section F.

#### B. Candidate 4: the probe action (refined)
**A plain ping is weak:** a spoofer on the same network can answer a ping as well as the real device. A useful probe tests something hard to fake.
| Probe type | What it checks | Catch |
|---|---|---|
| ask a stronger detector or another viewer to look at the flow | nothing is sent to the device | costs compute, not traffic |
| re-check the IP-to-MAC link (ARP or neighbor check) | whether two devices claim one identity | only catches simple spoofing |
| timing or clock-skew fingerprint of the replies (the idea from Update 6) | whether it is the same physical hardware | needs enough replies |
| challenge-response or rejoin (e.g. Zigbee rejoin, re-key) | whether it holds the real key | only works if the device supports it |
- Risks (general knowledge, not tested here): extra traffic and delay; an unauthenticated probe can itself be abused; a probe can tell the attacker they were noticed.
- **Scope widens to spoofing and MAC masking**, not only malware-spread defense. This connects to the identity-uncertainty thread (Updates 2 to 8). Keep it as one scenario inside the probe experiment, not a new pillar (suggestion).
- **Fit in the agent:** the probe is one more action (wait, probe, rate-limit, block, isolate) with a small cost; its answer arrives next step as new evidence, like an extra viewer. In POMDP terms this is a sensing action. Rule of thumb (suggestion): probe when Omega (ignorance) or K (conflict) is high.
- **Simulation needs (assumptions, state them openly):** a chance that a genuine device passes the probe and a spoofer fails (illustrative 90% and 20%). The CICIoT2023 spoofing category and the identity-corruption knobs (Update 2, section 8) can feed this.

#### C. Candidate 5: flexible discounting (user idea) and its caveats
- Discounting already exists (trust alpha per viewer, Section 13.6). The candidate is only about **how alpha is set**. User idea: re-set each viewer's alpha every N steps (e.g. 100) from that viewer's recent accuracy.
- **Three versions to test (suggestion):** (a) fixed alpha; (b) accuracy-based update every N steps; (c) label-free update (agreement between viewers or K).
- Caveats: (1) accuracy-based needs labels; in simulation the truth is known, live it is not (labels could arrive late from operator feedback). (2) 100 steps is noisy, because attacks are rare and a window may hold almost no attack samples; use a rolling average with a minimum number of attack samples. (3) **K trap:** K also rises when a real new attack makes viewers legitimately disagree, which is exactly the 0-day signal to keep, so down-weighting viewers because of K could hide it. A safer label-free signal (untested suggestion): one viewer disagreeing with the others while the traffic looks normal.

#### D. Candidate 6: criticality-aware policy, VIP list and VIP VLAN (user ideas)
**Problem found:** if a "caution dial" says never block the heart monitor, an attacker who spoofs the monitor's MAC gets protection (logic holds whatever the real incident was).

**Design fixes (suggestions):**
1. The dial changes the **kind** of action, not whether to act. For critical devices: block commands or the attacker's path, keep read-only telemetry, switch to a safe local mode, alert a human.
2. Criticality raises both costs (wrong block and missed attack), so the dial sets two numbers, not one.
3. Criticality comes from the operator's inventory tied to a verified identity, never from what the device claims.
4. The dial's range is limited: it can never turn the response fully off.
5. Test it as an attack: a spoofer impersonates a critical device to induce caution.

**VIP list and alarm (user idea, refined):**
- VIP-ness is a known flag from the operator's inventory, so it goes into the observation like device type; the "alarm" is a mode the system enters plus a request for a human check.
- MAC alone is spoofable, so the VIP entry must be tied to a stronger identity: physical port or switch location, certificate or key, or the timing fingerprint from Update 6.
- The human check must go **out-of-band** (e.g. is the real monitor still reporting from its own port?). Two sources claiming one MAC is strong evidence of spoofing.
- Humans are slow and attacks are not, so while waiting the system takes an immediate, reversible, safe step (restrict write or command traffic from the suspicious source, keep real telemetry, alert).
- The alarm itself can be abused (an attacker spoofs a VIP MAC on purpose so the system cuts the real device); therefore isolate the suspicious source or path, never the genuine device.
- Too many alarms cause alert fatigue, so a false alarm needs a cost in the reward.
- **Human verification as a sensing action:** a request with a cost, a delay (illustrative 5 to 30 steps) and a chance of a correct answer (illustrative 95%); the answer arrives later as new evidence, like a slow, expensive viewer.

**VIP VLAN (user idea):** a separate network segment for VIP devices is standard practice for medical-device segmentation (general knowledge, verify before citing).
- Benefits: fewer attack paths (limits lateral movement, the Paper 3 pivot problem); a clean signal (a VIP MAC seen **outside** the VIP VLAN is suspicious by itself, a ready-made spoofing alarm); a new graded action, **move a suspicious device to a quarantine VLAN**, between rate-limit and block (network access control does this in practice, verify).
- The hub-based agent still reaches the traffic if it is the gateway between VLANs, sees a mirror (SPAN) port, or runs on the switch or firewall. Being the gateway is best, because it can also enforce policy.
- Cautions: (1) assigning VLAN membership by MAC lets a spoofer into the VIP VLAN; assign by physical port or 802.1X authentication; (2) VLANs can be bypassed if misconfigured (VLAN hopping), so they reduce risk but do not remove it; (3) consumer hubs and routers mostly lack VLANs, so this fits hospitals, offices and smart buildings better than the "one hub per home" framing; state which setting is assumed; (4) do not quarantine the genuine VIP device, quarantine the suspicious source; (5) CICIoT2023 probably does not label VLANs (unverified), so VLAN would be a simulator feature, not a dataset feature.
- Fit in the design: observation gets "which segment is this device in" and "is this MAC seen on the wrong segment"; action ladder (suggestion): wait, probe or request human verification, rate-limit, move to quarantine VLAN, block, isolate and alert; alarm rule: a VIP MAC outside the VIP segment triggers the alarm state directly; simulation: VLAN as a flag per device and an assumed action effect (e.g. quarantine halves reach to other devices and keeps basic internet).
- **Novelty note:** VLAN segmentation, quarantine and access control are known tools. A possible contribution is the combination: a belief-driven agent choosing when to escalate through probe, quarantine and block using VIP status and wrong-segment evidence. No search was run for prior work on this combination.

#### E. Candidate 7 correction, and candidate 8 demotion
- **Three different numbers (do not mix):** detection rate (the belief catches 40% of 0-days); calibration (when it says "70% unknown", is it truly unknown about 70% of the time?); prevalence (how many 0-days really exist).
- User idea was to multiply the real 0-day share by 40%. Correction: **divide, not multiply.** If the belief flagged 8 and catches 40%, the real count is about 8 / 0.4 = 20; if 2 of the 8 were false alarms, about (8 - 2) / 0.4 = 15 (general knowledge, verify). This assumes the 40% would hold on future 0-days, a big assumption, and it measures prevalence, not calibration.
- **Candidate 8 demoted** from a headline contribution to a documented by-product. A real-time simulator is not needed: a time-stepped Python simulation (replayed CICIoT2023 windows plus the MMPP plus hand-written action effects such as "rate-limit halves the rate") runs free on a laptop or Colab.

#### F. Viewers and models: two parallel models, one decision-maker (user question)
**Question:** can two parallel algorithms run in the same MBRL, one for known and one for unknown attacks, or should one algorithm hold both?
**Answer (suggestion):** two parallel **perception models**, one **decision-maker**. The known-attack viewer and the normality viewer already run side by side on the same window; their outputs go into the belief; one policy reads the belief and picks the action.
- Reasons not to use two separate RL agents: known and unknown are two kinds of evidence, not two different jobs; both end at the same ladder; a referee would be needed for clashes, which is exactly where the decision matters; two agents double the tuning and each sees only part of the picture.
- One real reason to split on the **action** side: a known attack often has a known best response (a playbook), an unknown one has none.
| Arm | Design | Role |
|---|---|---|
| A1 | one policy reads the whole belief (known families, U, Omega, K) | main design |
| A2 | hard rule table on the two viewers | easy-to-explain baseline |
| A3 | playbook for known families plus RL only for unknown and clash cases | hybrid |
| A4 | two separate RL agents plus a referee | optional, to show whether splitting helps at all |
Hypothesis: A1 is enough (to test, not a claim). (Arm names A1 to A4 are new here; do not confuse them with the G1 to G5 and D1 to D3 arms.)

**User's rule logic (truth table), kept as baseline A2 with three adjustments:**
| Normality viewer | Known-attack viewer | Reading |
|---|---|---|
| odd | no known match (low evidence) | 0-day |
| normal | attack X | known attack X |
| normal | normal | normal |
| odd | attack X | clash |
- It is a hard-rule version of what DS fusion does softly; keep it as an extra baseline because it is easy to explain.
- "Low % on known attacks" is a weak signal if the classifier is confidently wrong on a new attack; use the known-attack viewer's own ignorance (EDL's u) as well.
- "The 0-day wins every clash" would create many false 0-days (a known attack with an odd pattern would be called new). Treat a clash as "abnormal, family unclear" and answer with a gentle step or a probe.
- The user's observation that unknown attacks often look weird and get misclassified as a known attack is exactly the case where the known-attack viewer is confident and wrong, so keep its ignorance reading in the fusion.

**The user's build:** three viewers (normality, known-attack types, MMPP). The same setup works with the truth-table arm: the rules just use two of them, and the MMPP supplies the burst-structure evidence.

#### G. World model versus viewers (the MB in MBRL)
- **Viewers = perception** (what is happening in this window). **World model = prediction** (what the next windows look like if this action is taken), used to practice on imagined episodes.
- Its job is the same in every arm (three-viewer setup or two-model rule setup): produce the next windows after an action, then run the same frozen viewers and belief on those imagined windows, so perception is identical in real and imagined data.
| Part | Job |
|---|---|
| MMPP | burst and arrival structure of the traffic |
| Learned network (GRU) | what the MMPP gets wrong, and how traffic reacts to the action |
| Action effects | hand-written assumptions, since CICIoT2023 never recorded a defender acting |
- Cautions (from earlier sections): keep the normality GRU (viewer) and the world-model GRU separate (the world model must see the action and attack traffic); if the MMPP is both viewer and generator, imagined traffic always looks natural to it, so use separate fits; DQN can add imagined cards to its replay memory, while PPO must regenerate imagined data as the policy changes (general knowledge, verify).
- **Limit:** imagined practice cannot contain a true 0-day (the world model only imagines what it has seen data for). 0-day results must come from real held-out families; the self-play idea (Idea F) is a possible way to generate unknown attacks.

#### H. The new ideas as a list (what to add to the roadmap)
| # | Idea | Type | From |
|---|---|---|---|
| 1 | probe action with hard-to-fake probes; widens scope to spoofing and MAC masking | refinement of candidate 4 | user |
| 2 | flexible discounting every N steps by each viewer's recent accuracy; three versions; label and K caveats | refinement of candidate 5 | user |
| 3 | VIP list and alarm state tied to verified identity | new, merges into candidate 6 | user |
| 4 | VIP VLAN, wrong-segment alarm, quarantine-VLAN action | new, extends candidate 6 | user |
| 5 | spoof-the-caution attack as a test scenario | new test | user |
| 6 | calibration versus detection rate versus prevalence (divide, not multiply) | correction to candidate 7 | user |
| 7 | human verification as a delayed, costly sensing action | new, merges 4 and 6 | discussion |
| 8 | two parallel perception models, one decision-maker; arms A1 to A4 | new design comparison | user |
| 9 | rule truth table as baseline A2 | new baseline arm | user |
| 10 | world model is one model with the same job in every arm; imagined practice has no true 0-day | clarification | discussion |
| 11 | environment demoted to a by-product (time-stepped Python simulation) | change to candidate 8 | user |
| 12 | candidates 4 and 6 now merge into one: sensing and criticality-aware escalation (probe, human verification, quarantine VLAN) | roadmap update | discussion |

**Updated recommendation (suggestion):** core story stays 1 + 2 + 3; the extension is now "sensing and criticality-aware escalation" (merged 4 + 6), with 5 as a cheaper offline extension. Ranking of risk: 6 (as an on/off dial) is the riskiest; as a verified-VIP policy with quarantine it is much safer.

#### I. Open items
1. Deepen candidates 4 and 6 together: the exact research question, the closest papers that could kill it, the effect model (probe pass and fail chances, human-check delay and accuracy, quarantine effect), and a numeric pass/fail rule written before running.
2. Run the database sweep for candidates 2, 4 and 6 (with spoofing, MAC randomization, network access control, quarantine VLAN, sensing actions in POMDPs, human-in-the-loop escalation as query terms). Closest neighbors found so far: Trust-By-Learning, Q-BIRD, SHIELD.
3. Decide the setting for candidate 6 (hospital, building or home with a VLAN-capable gateway) and state it.
4. Settle whether to include the alarm and human verification in the first simulation or in a later one (they need extra environment features: VIP flag, segment flag, delayed observation).
5. Check that the VLAN and spoofing claims (general knowledge) hold against references before citing.
6. Resolve the open items from Section 134 (the user's simulation numbers, the meaning of "possibility belief", the table PPO and DDQN by no belief, real belief and perfect perception).
7. Carry forward all earlier open items.
