# RAIDEN — Project Context & Roadmap

**Purpose of this file:** This document is a full technical handoff of the RAIDEN project — a security system against DDoS attacks in IoT systems. It is meant to be pasted into a new AI chat (or read by a new collaborator) so they immediately understand the architecture, what has been built, what design decisions were made and why, and what remains to be built. Treat this as the single source of truth for the project's current state.

---

## 1. High-Level Concept

RAIDEN is a full-stack DDoS defense system for IoT environments, built as a **closed adaptive feedback loop** (not a one-shot pipeline). It combines:

- **Analytical modeling** (Markov Modulated Poisson Process / MMPP, Hidden Markov Models)
- **Deep learning** (GRU-based sequence models)
- **Reinforcement learning** (for mitigation decision-making, and eventually for adaptive traffic modeling)

The system is designed to work across different IoT deployment scales (e.g., a small smart-room system vs. a large hospital IoT system), and to remain robust to legitimate traffic surges (e.g., a hospital during a mass-casualty event) that could otherwise be misclassified as an attack. This distinction — **statistical anomaly vs. adversarial attack** — is a core design theme throughout the project.

---

## 2. Architecture Overview (Pipeline Order)

```
[1] Traffic Capture / ML Metrics Layer
        ↓ (lambdas, P matrix)
[2] MMPP Analytical Layer (P → Q conversion, equilibrium equations)
        ↓ (steady-state features + lambdas)
[3] Prediction Layer — GRU #1 (early prediction using MMPP-derived features)
        ↓
[4] Detection Layer — GRU #2 (real-time attack detection)
        ↓ (severity score + traffic features)
[5] Mitigation Decision — RL Agent (NOT YET BUILT)
        ↓ (chosen action)
[6] Mitigation Execution Module (NOT YET BUILT)
        ↓ (SUCCESS / FAIL outcome)
[7] Feedback loop → back into RL agent (and eventually into layer [1])
```

This is a continuous adaptive loop, not a single forward pass — outcomes from mitigation feed back to improve future decisions.

---

## 3. Layer-by-Layer Detail

### 3.1 Traffic Capture / ML Metrics Layer (COMPLETE)
- Captures traffic and computes **lambdas** (arrival rate parameters) using an HMM learning library.
- Produces a **P transition matrix** (discrete-time state transition probabilities).
- **Data situation:** No public MMPP-labeled dataset was available. The team built **20 synthetic datasets**:
  - 10 datasets with only **2 states** (normal, suspicious — no attack state present)
  - 10 datasets with **all 3 states** (normal, suspicious, attack)
  - Datasets were designed to cover multiple traffic regimes: bursty vs. non-bursty, large-scale systems (e.g., hospital IoT), and small/medium systems (e.g., smart room).
  - Each dataset has 2 input dimensions: **time (second/tick)** and **lambda value**.
  - A regression-style algorithm (referred to informally as "deviation tree" — likely a decision-tree-style regressor; **exact algorithm name needs to be confirmed and stated precisely** for defense purposes) was trained to **infer the missing 3rd (attack-state) lambda** when absent from a 2-state dataset.

**Known open item:** These 20 datasets are proof-of-concept scale only. They are sufficient for demonstrating the pipeline but are not a statistically robust training set on their own.

### 3.2 MMPP Analytical Layer (COMPLETE, with a known technical risk)
- Converts the discrete-time **P matrix into a continuous-time generator matrix Q**.
- Uses Q + lambdas to build the **equilibrium (steady-state) equations** of the Markov chain.
- Equilibrium probabilities serve as a **model-based statistical prior/baseline** — an analytical signal that is independent of and complementary to the learned GRU signal.

**Known open item / risk (flagged for future defense and for continued diligence):**
The P → Q conversion is mathematically nontrivial. This is known as the **embedding problem for Markov chains** — not every valid discrete-time stochastic matrix P has a corresponding valid continuous-time generator Q. A naive matrix-logarithm approach can produce an invalid Q (negative off-diagonal entries). The project should either:
  (a) estimate Q directly from continuous inter-arrival timestamps rather than deriving it from P, or
  (b) explicitly handle/regularize cases where the embedding fails.
  **This needs to be verified/resolved in the current implementation if not already handled.**

### 3.3 Prediction Layer — GRU #1 (COMPLETE)
- Consumes MMPP-derived features (equilibrium probabilities, lambda trajectories) to give an **early warning** of a likely transition toward an attack state, based on precursor/ramp-up patterns in traffic (e.g., botnet mobilization, reconnaissance-driven traffic changes).
- Important framing: this layer does **not** predict attacker intent. It predicts the probability of an imminent **state transition** in the traffic's statistical regime, based on precursor signatures. It will not catch instantaneous/zero-day floods with no ramp-up phase — that gap is intentionally covered by the detection layer.

### 3.4 Detection Layer — GRU #2 (COMPLETE, further refinement recommended)
- Consumes live traffic features + prediction layer output to detect an attack **currently in progress**.
- Combined accuracy of prediction + detection layers: **95%**.

**Planned refinement (not yet done, needed before RL integration):**
- Change GRU #2's output head from a **binary flag** (attack / no attack) to a **continuous severity score (0–1)**, plus ideally a separate **confidence score**. This is a small architectural change — the recurrent backbone does not need to be retrained from scratch; only the output layer needs retraining/fine-tuning.
- Optionally add a coarse **attack-type indicator** (e.g., volumetric vs. protocol-level vs. application-layer) if feasible, to help the RL agent map more precisely to mitigation type.
- Keep the MMPP equilibrium deviation signal **explicit and separate** from the GRU's internal representation, rather than folding it entirely into the GRU — this preserves an interpretable analytical feature alongside the black-box GRU output.

### 3.5 Source-IP / Traffic Feature Module (NEW — TO BE BUILT, not part of GRU)
This is **not** a change to the GRU's classification target. It is a **feature engineering addition**:

- **Feed as GRU #2 input features** (statistical, aggregate — not identifying individual IPs):
  - Source IP entropy / diversity
  - Top-N source IP traffic share (concentration)
  - New/unseen IP ratio in the current window
  - Geographic/ASN diversity (if available)
  - Per-source request rate distribution shape (uniform vs. skewed)

  Rationale: these features help distinguish a real traffic surge (e.g., hospital emergency — organic, diverse sources) from a botnet-driven DDoS (concentrated/spoofed sources), directly addressing the "war/hospital surge misclassified as attack" concern.

- **Separate, standalone module** (not a neural net — a ranking/aggregation function, e.g., top-N IPs by request count above a z-score threshold): produces the **actual list of suspicious IPs**. This is **not** a GRU output. It is computed directly from the traffic/metrics module and passed to the RL agent as part of its state, so that if the RL agent chooses IP blocking as an action, this list is the actual payload sent to the mitigation module.

**Division of responsibility (important, was a point of clarification during design):**
- Detection layer (GRU #2) = "is this an attack, and how severe" (continuous severity/confidence).
- Traffic/IP module = "who/what does it look like it's coming from" (concentration + suspicious IP list).
- RL agent = "given both, what do we do about it."

### 3.6 Mitigation Decision Layer — RL Agent (NOT YET BUILT — CURRENT FOCUS)

**Action space:**
- No action
- Rate limiting (ideally with intensity levels, not just on/off)
- IP blocking (top-N suspicious sources, from the module in 3.5)
- Resource reallocation
- Possibly a multi-discrete space if actions can combine

**State space (inputs to the RL agent):**
- Current lambda estimates per hidden state
- MMPP posterior state probabilities (equilibrium + instantaneous)
- GRU #1 (prediction) output score — continuous
- GRU #2 (detection) output score — continuous severity + confidence
- Source IP entropy / concentration + suspicious IP list (from 3.5)
- Time since last mitigation action, and what that action was (agent memory of recent moves)
- Current system load/resource utilization
- **Criticality tier** of the system (e.g., hospital vs. smart room) — should materially affect what a "safe" action looks like
- Recent outcome history (last N success/fail signals)

**Reward design (must be shaped, not a bare binary SUCCESS/FAIL):**
- Strong positive reward for confirmed attack mitigation
- Strong **negative** reward for false positives (blocking legitimate traffic) — weighted more heavily for high-criticality systems (e.g., hospital tier) than for low-criticality ones (e.g., smart room)
- Small negative reward per action taken, scaled by action severity/cost (rate limiting cheaper than IP blocking, cheaper than reallocation)
- Penalty for delay/latency between confirmed attack and action taken

**Known risks to manage (flagged for careful design, not yet resolved):**
- Sparse/delayed feedback: mitigation success may not be confirmable instantly.
- Exploration safety: an undertrained RL agent exploring live could block legitimate traffic (e.g., during hospital surges) — mitigate via simulator-first training, constrained action space, and/or human-in-the-loop override before any live deployment.

### 3.7 Mitigation Execution Module (NOT YET BUILT)
- Executes the action chosen by the RL agent (rate limiting, IP blocking, resource reallocation).
- Reports back a **SUCCESS/FAIL** outcome signal, which becomes the reward signal fed back to the RL agent, closing the loop described in Section 2.

### 3.8 Future Extension (documented for completeness, not started): Adaptive First-Stage RL
- Long-term idea: turn the Layer 3.1 lambda/P-matrix estimator into its own RL agent, driven by the same downstream SUCCESS/FAIL signal, so the system can adapt its own traffic metrics/thresholds over time (concept drift handling).
- Directly motivated by the "war/hospital surge" scenario: a static model trained on peacetime traffic will misclassify a legitimate emergency surge as an attack unless lambdas/P-matrix adapt.
- This creates a **two-agent RL system** (upstream lambda-tuning agent + downstream mitigation agent) with feedback between them — flagged as complex to stabilize. To be treated explicitly as future work, not a current build target.

---

## 4. Critical Design Decision: Why a Simulator, Not a Static CSV, for RL Training

This was a key point of clarification during design and should not be re-litigated without good reason:

- Supervised learning (the GRUs) trains on fixed (input → correct label) pairs — a CSV works fine for this.
- RL trains on **(state, action, reward, next_state)** trajectories, where next_state depends on which action the agent actually took. A static log/CSV only records what happened for the action that was actually taken historically — it cannot supply the counterfactual for actions not taken. Training RL directly on a static CSV will not produce a working policy.
- **Decision made:** Build a **simulator** around the existing MMPP formulation. The simulator exposes a `step(action)` function: given the current simulated traffic state and the RL agent's chosen action, it computes the next state and reward (e.g., attack traffic drops if the action was appropriate, false-positive penalty if not, traffic continues unaffected if no action was taken).
- **Role of the detection-layer CSVs going forward:** They are **not** training data for the RL agent directly. They are used to **calibrate the simulator's generative parameters** — i.e., extract realistic ranges/distributions for severity score behavior, IP concentration patterns, and how quickly severity ramps up before/during real attacks. The simulator then **samples** from these calibrated distributions per episode (domain randomization), rather than replaying fixed rows. The RL agent trains against the simulator's generated trajectories, not against CSV rows.
- This decision was chosen over "offline RL" (a valid alternative technique for training from purely historical logs without live interaction, e.g., Conservative Q-Learning) because the project already has the MMPP mathematical formulation needed to build a coherent simulator, and it keeps the project's analytical/generative story consistent across layers.

---

## 5. Immediate Next Steps (in order)

1. **Fix/finalize the detection layer's output datasets** — ensure GRU #2 output logs include continuous severity score, confidence score, and the newly added source-IP/concentration features (Section 3.5). These will serve as the **calibration reference** for the simulator, per Section 4.
2. **Retrain/fine-tune GRU #2's output head** from binary → continuous severity + confidence (backbone weights can likely be reused/fine-tuned, not retrained from scratch).
3. **Build the standalone suspicious-IP extraction module** (non-ML ranking/aggregation function).
4. **Build the RL simulator/environment**, using the MMPP lambda-generation logic as the generative core, calibrated against the detection-layer datasets from step 1. Implement `reset()` (sample a scenario/regime) and `step(action)` (return next_state, reward, done).
5. **Design and implement the RL agent** (algorithm choice — e.g., DQN if action space stays discrete, PPO if it becomes continuous/hybrid) — train against the simulator from step 4, with state/action/reward as defined in Section 3.6.
6. **Build the mitigation execution module** that carries out the RL agent's chosen action and reports SUCCESS/FAIL back as the reward signal, closing the loop.
7. (Future/stretch) Revisit Section 3.8 — adaptive first-stage RL for lambda/P-matrix estimation under concept drift.

---

## 6. Open Items / Things Not Yet Resolved (worth tracking explicitly)

- Confirm the exact name/nature of the "deviation tree" algorithm used to infer the missing 3rd lambda (Section 3.1) — needs a precise technical name.
- Verify how the P → Q matrix conversion is actually implemented and whether the Markov embedding problem (Section 3.2) has been handled or is still a latent risk.
- The 20 synthetic datasets are proof-of-concept scale; consider whether more scenarios/variety are needed before final evaluation claims.
- Reward function for the RL agent (Section 3.6) is designed conceptually but not yet implemented/tuned.
- Exploration safety strategy for the RL agent (avoiding harmful actions during training) is identified as a risk but not yet designed in detail.
