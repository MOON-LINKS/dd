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

### Backup E — Graph Neural Networks for Topology-Aware Botnet Detection (weaker — crowded field)
GNNs model device communication as a graph to capture botnet coordination patterns instead of treating each device as isolated. Technically sound and still active in 2026 (including newer quantum-GNN hybrids), but this is a **crowded, heavily-published area** already — harder to carve out a clearly novel angle compared to LMB or MARL. Listed for completeness, not recommended as a priority backup.

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
