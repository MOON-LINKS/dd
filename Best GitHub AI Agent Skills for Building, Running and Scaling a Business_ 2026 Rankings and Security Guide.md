# The Best GitHub-Hosted AI Agent Skills for Building, Running and Scaling a Business (Claude Skills, Claude Code Skills, SKILL.md Collections and Plugins)

**Research date:** November 5, 2026. Star counts come from GitHub repository page snapshots or named star trackers captured between October and November 2026. Each figure says where it came from. Treat every number as a point-in-time snapshot and re-check it before relying on it.

The strongest business starter kit right now is a small set of mostly free, vendor-maintained or highly reputable repos: **anthropics/skills** (documents, slides, brand), **anthropics/knowledge-work-plugins** (legal, sales, finance, marketing, support, product), **coreyhaines31/marketingskills** (marketing, copy, SEO, CRO, cold email), **obra/superpowers** (thinking, planning, engineering), **nextlevelbuilder/ui-ux-pro-max-skill** plus **vercel-labs/agent-skills** (design and frontend), and **heygen-com/hyperframes** or **remotion-dev/skills** (video). Add specialist packs only where you have a real need, and vet every one before installing.

---

## TL;DR

- **Start with five free collections.** anthropics/skills (~187k stars), anthropics/knowledge-work-plugins (33.6k), coreyhaines31/marketingskills (58.5k), obra/superpowers (~312k) and nextlevelbuilder/ui-ux-pro-max-skill (~145k). Together they cover documents, legal/sales/finance workflows, marketing, critical thinking/engineering and UI/UX.\[1\]\[2\]\[3\]\[4\] Add HyperFrames (78.8k, Apache-2.0) or Remotion's skills for video.\[5\]\[6\]
- **Stars are not proof of quality or safety.** Snyk's February 2026 ToxicSkills audit of 3,984 skills found 36.82% had at least one security flaw and 76 had confirmed malicious payloads.\[7\]\[8\]\[9\] Separately, Island's research (reported by Help Net Security on July 21, 2026) found about 7,600 malicious GitHub repos, more than 800 of them posing as AI skills or MCP servers, in a wave that peaked in April 2026. Prefer official/vendor repos, read every SKILL.md and script, and pin versions.
- **There are real gaps.** I found no strong, well-reviewed skills for Metricool-native scheduling, fundraising, HR/hiring, accounting, e-commerce, translation, menus/stationery, or dedicated mental-models thinking. For those, combine the general document/brand skills with Anthropic's role plugins, and keep a qualified professional in the loop, especially for legal and financial work.

---

## 1. Executive Summary

The SKILL.md "Agent Skills" format grew fast from Anthropic's October 2025 launch into a cross-agent standard. Claude Code, Codex, Cursor, Gemini CLI, Copilot and others now read the same skill folders. The ecosystem is enormous and noisy: the GitHub `claude-skills` topic alone lists over 14,000 public repositories.\[10\] A handful of collections dominate on both stars and real-world mentions.

For a cost-conscious founder: install official/vendor skills first (Anthropic, Vercel, Expo, Callstack, HashiCorp, Trail of Bits, Remotion, HeyGen, Firecrawl), add one or two highly reputable community packs (Corey Haines, Superpowers, UI UX Pro Max), and use mega-aggregators of thousands of unvetted skills only as browsing catalogs.

### Top picks at a glance

| # | Field | Best pick | Owner type | Stars (snapshot) | Cost |
|---|---|---|---|---|---|
| 1 | Social media strategy & management | social-media-skills/skills (106 skills) | Community | Not verified | Free (publishing via your own scheduler) |
| 2 | Reels / short-form video | heygen-com/hyperframes | Vendor (HeyGen) | 78.8k (GitHub page, Nov 2026) | Free, Apache-2.0; optional Pro tier |
| 3 | Post creation (captions, carousels, hooks) | blacktwist/social-media-skills + coreyhaines31/marketingskills | Community | Not verified / 58.5k | Free |
| 4 | Marketing (CRO, SEO, ads, copy) | coreyhaines31/marketingskills | Community (known practitioner) | 58.5k (GitHub page, Nov 2026) | Free, MIT |
| 5 | Creative thinking / ideation | obra/superpowers (brainstorming skill) | Community | ~312.3k (star-history, Nov 4, 2026) | Free, MIT |
| 6 | Critical thinking / decisions | coreyhaines31/makerskills + Superpowers | Community | 880 / ~312k | Free |
| 7 | Business strategy & operations | anthropics/knowledge-work-plugins | Official (Anthropic) | 33.6k (GitHub page, Nov 2026) | Free, Apache-2.0 |
| 8 | Law & legal | anthropics/knowledge-work-plugins → legal plugin | Official (Anthropic) | 33.6k | Free; not legal advice |
| 9 | Web / frontend design | vercel-labs/agent-skills + Anthropic frontend-design | Vendor / Official | 33.5k / ~187k | Free, MIT |
| 10 | Mobile app design & dev | Expo official skills + callstackincubator/agent-skills | Vendor | Not verified | Free |
| 11 | UI/UX | nextlevelbuilder/ui-ux-pro-max-skill | Community | ~145k (GitHub page, Nov 2026) | Free, MIT; paid Premium exists |
| 12 | Three.js / WebGL / parallax | CloudAI-X/threejs-skills | Community | 4.0k (GitHub page) | Free (license disputed) |
| 13 | Backend engineering | obra/superpowers + addyosmani/agent-skills | Community | ~312k / ~99k | Free |
| 14 | Security / DevSecOps | trailofbits/skills | Vendor (security firm) | ~7.4k–8k (trackers, Oct 2026) | Free, CC-BY-SA-4.0 |
| 15 | Server / DevOps / IaC | hashicorp/agent-skills | Vendor (HashiCorp) | Not verified | Free, MPL-2.0 |
| 16 | Sales (solo → management) | coreyhaines31/marketingskills (sales skills) + Anthropic sales plugin | Community / Official | 58.5k / 33.6k | Free |
| 17 | Scaling / architecture / design systems | obra/superpowers + vercel composition patterns + UI UX Pro Max | Community / Vendor | see above | Free |
| 18 | Web scraping | firecrawl/skills (official) | Vendor | Not verified | Skill free; Firecrawl API is paid/credit-based |
| 19 | Research / PhD / academic | Imbad0202/academic-research-skills | Community | ~49.5k–55.3k (trackers, conflicting) | Free, MIT |
| 20 | Documents (PDF, PPTX, DOCX, XLSX) | anthropics/skills | Official (Anthropic) | ~187k (GitHub page, Nov 2026) | Free to use; check per-skill license |

---

## 2. How Skills Were Ranked, and How to Vet and Install Them Safely

### Ranking method

I ranked on three signals together, never stars alone:

1. **GitHub stars and forks**, recorded with the snapshot date and source. Where GitHub's own page couldn't be read directly, I used named trackers (star-history.com, skillsllm, githublb) and say so. Conflicting numbers are shown as a range or flagged.
2. **Reputation and provenance.** Official/vendor repos rank above anonymous community packs. Named practitioners (for example Corey Haines, founder of Conversion Factory, who writes the Swipe Files newsletter to 30,000+ subscribers) rank above anonymous authors.\[11\]
3. **Evidence of real use.** Independent write-ups from Snyk, InfoQ, Artificial Lawyer, the HashiCorp blog and the Callstack blog; Hacker News threads; and install counts on the skills.sh registry where available.

### Honesty notes

- **Reddit, Quora, Facebook and Instagram:** I did not find specific, citable Reddit or Quora threads in this research pass. Community evidence comes mainly from Hacker News and developer/security blogs. Many YouTube and Instagram "top 10 skills" posts were promotional and are not used as evidence.
- **Vendor-written comparisons are flagged.** Examples: the Hyper (hyperfx.ai) marketing comparison, Composio's sales list and Firecrawl's skills list. Useful leads, not neutral.
- **Paid "skill bundles"**, such as Gumroad packs of "167 battle-tested" marketing skills, are marketing-driven and excluded.\[12\]
- **Very fast star growth is a reason to verify, not proof of fakery.** UI UX Pro Max went from 32,431 stars in a February 2026 tracker snapshot to ~145k in November 2026.\[4\]\[13\] I found no credible report of fake stars in any repo recommended here. Still, the "Six Million (Suspected) Fake Stars on GitHub" study (CMU, NC State and Socket, presented at ICSE 2026) identified 6.0 million fake stars and 18,617 repositories running fake-star campaigns between July 2019 and December 2024, which is why stars alone aren't trusted here.

### The security reality

- **Snyk ToxicSkills (February 5, 2026):** of 3,984 skills from ClawHub and skills.sh, 1,467 (36.82%) had at least one security flaw, 534 (13.4%) had a critical-level issue, and 76 contained manually confirmed malicious payloads aimed at credential theft and backdoors.\[7\]\[9\]\[14\] Snyk added that "at least eight manually confirmed malicious skills remain publicly installable on clawhub.ai as of publication."
- **Koi Security (ClawHub, the OpenClaw skill marketplace):** 341 malicious skills out of 2,857 reviewed, 335 traced to a single coordinated campaign ("ClawHavoc"). Antiy counted at least 1,184 malicious ClawHub skills from 12 accounts.\[8\]\[14\]\[15\]
- **Palo Alto Networks Unit 42 (June 23, 2026):** documented a malicious ClawHub skill called "omnicogg." Its payload sits at the start of the file, "followed by 22 MB of padding characters," and it got past both ClawScan and VirusTotal.
- **Island's "AgentBaiting"/FakeGit research, reported by Help Net Security (July 21, 2026):** about 7,600 malicious GitHub repos, more than 800 posing as AI skills or MCP servers, from about 6,600 accounts. They delivered SmartLoader and then StealC malware and logged over 14 million downloads across about 200 repos. AI assistants recommended them too: Claude Code independently surfaced a campaign repo, and when asked for a Walmart MCP server, both Gemini and ChatGPT recommended a malicious one. One repo copied the name and layout of a legitimate 67k-star project.
- **Fake clone example:** a malware clone of the popular "Everything Claude Code" collection (`arabicapp/everything-claude-code`) bundled a hidden loader.\[16\]

### Vetting checklist (do this for every skill)

1. **Check the owner.** Is it the real vendor org (`anthropics`, `vercel-labs`, `expo`, `hashicorp`, `trailofbits`, `remotion-dev`, `heygen-com`, `firecrawl`)? Typosquats and clones are the top attack.
2. **Read SKILL.md fully.** Look for instructions to fetch remote content, run `curl | bash`, decode base64, read `~/.ssh`, `.env` or credential files, or "ignore previous instructions".
3. **Read every script** in `scripts/`. One independent scan of Trail of Bits' (reputable) repo still found 9 installer scripts, one of which edits your shell profile.\[17\]
4. **Prefer skills with no scripts** for non-technical work like copywriting or strategy.
5. **Pin a commit or tag.** Don't auto-update from `main`.
6. **Scan before installing.** Free scanners named in independent guides include NVIDIA's SkillSpector and Cisco AI Defense's skill-scanner.\[18\] Scanners don't replace reading: the "Cloak and Detonate" study tested 8 scanners against 1,613 real malicious ClawHub skills and found one packing technique got past every scanner more than 90% of the time.
7. **Run untrusted skills in a sandbox, container or throwaway VM**, with no production credentials.
8. **Use mega-aggregators for discovery only.** Copy individual skills you've read instead of installing thousands at once.

### How installation works (verified patterns)

- **skills CLI (cross-agent):** `npx skills add <owner>/<repo>` (add `--skill <name>` for one skill, `-a claude-code` to target Claude Code, `--list` to preview). Corey Haines' README warns that running it from inside an agent session may install only to `.agents/skills/`, which Claude Code doesn't read, so pass `-a claude-code` explicitly.\[19\]\[20\]
- **Claude Code plugin marketplace:** `claude plugin marketplace add <owner>/<repo>`, then `claude plugin install <plugin>@<marketplace>`, or use `/plugin` in an interactive session (not available in Claude Code on the web or GitHub Actions).\[2\]\[21\]
- **Manual:** clone and copy skill folders into `~/.claude/skills/` (global) or `.claude/skills/` (project).\[22\]\[23\]\[24\]\[25\]
- **Claude app (Claude.ai / Desktop):** skills can be uploaded as a zip under Settings, but large repos may not fit. UI UX Pro Max's README says its checkout exceeds Claude's 200-file upload limit.\[4\]\[26\] Anthropic's knowledge-work plugins are built mainly for Cowork in the Claude desktop app and also work in Claude Code.\[21\]

---

## 3. Major Multi-Field Collections, Awesome Lists and Marketplaces

| Repo | Owner type | Stars (snapshot) | License | What it contains | Install vs browse? |
|---|---|---|---|---|---|
| anthropics/skills | Official | ~187.4k (GitHub page, Nov 2026) | Mixed; check per skill | Document skills (docx, pdf, pptx, xlsx), skill-creator, frontend-design, brand-guidelines, creative and example skills, the Agent Skills spec | Install: `/plugin marketplace add anthropics/skills`\[3\] |
| anthropics/knowledge-work-plugins | Official | 33.6k (fetched GitHub page, Nov 2026) | Apache-2.0 | Role plugins: Productivity, Enterprise Search, Sales, Finance, Data, Legal, Marketing, Customer Support, Product Management, Biology Research | Install: `claude plugin marketplace add anthropics/knowledge-work-plugins` |
| anthropics/claude-plugins-official | Official | 46.1k (GitHub page) | Apache-2.0 | Anthropic-managed plugin directory, incl. vetted community plugins (e.g. Expo) | Install via marketplace\[27\] |
| obra/superpowers | Community | ~312.3k (star-history, Nov 4, 2026) | MIT | Brainstorming, planning, TDD, debugging, code review | Install |
| nextlevelbuilder/ui-ux-pro-max-skill | Community | ~145.1k (GitHub page) | MIT | UI/UX design intelligence | Install |
| coreyhaines31/marketingskills | Community | 58.5k (GitHub page) | MIT | Marketing, CRO, SEO, ads, copy, email, sales enablement | Install |
| alirezarezvani/claude-skills | Community | ~28.7k–29.3k (GitHub page/topic) | MIT (unverified on repo) | ~410 skills: engineering, marketing, product, compliance, C-level advisory, finance, ops | Install selectively\[10\]\[28\]\[29\]\[30\]\[31\] |
| addyosmani/agent-skills | Community (well-known Google engineer) | ~99.3k (githublb tracker, undated) | Not verified | Production-grade engineering skills\[31\]\[32\] | Install |
| vercel-labs/agent-skills | Vendor | 33.5k (GitHub page) | MIT | React/Next.js performance, web design guidelines, composition patterns, React Native | Install |
| wshobson/agents | Community | ~39.2k (cached GitHub topic page; may be stale) | Not verified | Multi-harness plugin marketplace across dev and ops | Install selectively |
| K-Dense-AI/scientific-agent-skills | Community/company | ~56.1k (GitHub topic page) | Not verified | 163 science skills, 100+ scientific databases | Install selectively |
| VoltAgent/awesome-agent-skills | Community | ~36.1k–36.8k | MIT | Curated list of 1,000+ skills | **Browse** |
| sickn33/agentic-awesome-skills | Community | ~49.1k (GitHub topic page) | Not verified | 2,884+ aggregated skills | **Browse only**\[29\] |
| ComposioHQ/awesome-claude-skills | Vendor-run list (Composio) | Conflicting: ~41.8k to ~75.8k | Apache-2.0 | Curated list | **Browse** |
| hesreallyhim/awesome-claude-code | Community | ~54.6k–56.2k | Not verified | Skills, hooks, commands, plugins | **Browse** |
| travisvn/awesome-claude-skills | Community | ~15.6k–15.7k | Not verified | Skills-focused list with security notes | **Browse** |
| shanraisshan/claude-code-best-practice | Community | ~68.5k (GitHub topic page) | Not verified | Best-practice guide | Read\[29\] |
| mattpocock/skills | Community (well-known TS educator) | **Unverified; conflicting:** 130k vs "255k+" (Firecrawl blog) | Not verified | Personal skill set, incl. "grill me" | Install selectively |

**Notes:**
- **anthropics/skills** is the baseline everyone recommends; one independent guide calls it "the trusted baseline for free Claude skills." Its document skills make Claude produce real Word, Excel, PowerPoint and PDF deliverables.\[33\]\[34\] License varies by skill.
- **anthropics/knowledge-work-plugins** is the most business-relevant official repo. Artificial Lawyer reported its launch as "11 open-source plugins built by Anthropic" spanning sales, finance, legal, marketing, support and product management.\[35\]
- **obra/superpowers** has the strongest grassroots reputation. On Hacker News one user wrote that "the superpowers plugin took my Claude Code experience from mostly frustrating to nearly-magical," and another said "Use the superpowers plugin. It's a game changer." A skeptic prefers "barebones Claude Code as much as possible."\[36\]\[37\]\[38\]

---

## 4. Field-by-Field Rankings

### 4.1 Social Media Strategy and Management

| Rank | Repo | Owner | Stars | License | What it does |
|---|---|---|---|---|---|
| 1 | social-media-skills/skills | Community | Not verified | Not verified | 106 skills: brand profile → voice → audience research → strategy → posts, video, design, platform growth, publishing, analytics; agency workflows\[39\] |
| 2 | blacktwist/social-media-skills | Community (BlackTwist, a scheduling-tool company) | Not verified | Not verified | Strategy, creation and analysis for LinkedIn, X, Threads, Bluesky, Facebook\[40\] |
| 3 | sergebulaev/instagram-skills (+ linkedin-, x-, youtube-, threads-, tiktok-, facebook-skills) | Community | Family claims "400+ stars" (self-claim) | MIT | Captions, Reels hooks, hashtags, carousel planner, weekly plan; optional publishing via Publora\[41\] |
| 4 | STGime/posta-skill | Community/vendor | Not verified | Not verified | Schedule and publish across 9 platforms; needs paid Posta service\[42\] |
| 5 | nadiem99/claude-linkedin-skills | Community | Not verified | Not verified | LinkedIn posts, carousels, planning, series, analytics\[43\] |
| — | mvanhorn/last30days-skill | Community | ~62.9k (githublb, undated) | Not verified | Trend research over the last 30 days\[32\] |

**Notes:** social-media-skills/skills is likely the "Social Media Skills plugin" mentioned earlier in your conversation, and the most complete strategy-to-publishing chain found. Install with `npx skills add social-media-skills/skills -g -a claude-code -s '*' -y` or `/plugin marketplace add social-media-skills/skills`.\[39\] Stars and reviews were not verified. **Metricool:** I found no verified Metricool-specific skill. Draft with these skills, then publish through your Metricool connector; skills wanting their own publishing service add a second paid tool.

**Best overall:** social-media-skills/skills. **Best free/easiest:** blacktwist/social-media-skills.

### 4.2 Reels, Short-Form Video and Video Creation/Editing

| Rank | Repo | Owner | Stars | License | What it does |
|---|---|---|---|---|---|
| 1 | heygen-com/hyperframes | Vendor (HeyGen) | 78.8k (GitHub page, Nov 2026) | Apache-2.0 | "Write HTML. Render video. Built for agents." Skills: /hyperframes, /hyperframes-cli, /gsap, /media-use, /figma, /slideshow, remotion-to-hyperframes; block catalog incl. an `instagram-follow` overlay\[5\]\[44\] |
| 2 | remotion-dev/skills | Vendor (Remotion) | 6.3k (GitHub page) | Unclear; Remotion has its own license terms | 12–13 skills: best practices, create, render, captions, maps, studio; ~3.2M installs per skillcritic\[45\]\[46\] |

**Notes:** HyperFrames is higher-starred and simpler (HTML rather than React), used in production at HeyGen with community examples from tldraw and TanStack.\[5\] HeyGen's site reports 1.5M weekly npm downloads (vendor figure).\[47\] Install: `npx skills add heygen-com/hyperframes` or `claude plugin marketplace add heygen-com/hyperframes`. Git LFS may be required. A "HyperFrames Pro" tier exists,\[5\]\[48\] and HeyGen avatars are paid. Remotion: `npx skills add remotion-dev/skills`;\[49\] **check Remotion's company license before commercial use.** Neither is a click-to-Reel app: Claude writes code that renders MP4s.\[50\] AI-generated footage still needs paid services (HeyGen, Higgsfield).

**Best overall:** HyperFrames. **Best free/easiest:** HyperFrames.

### 4.3 Post Creation: Captions, Carousels, Graphics, Hooks

| Rank | Repo | Owner | Stars | What it does | Cost/caveat |
|---|---|---|---|---|---|
| 1 | coreyhaines31/marketingskills (copywriting, marketing-ideas) | Community | 58.5k | Page copy, hooks, 140 SaaS marketing ideas | Free, MIT |
| 2 | blacktwist/social-media-skills (post-writer-sms, hook-writer-sms, carousel-writer-sms) | Community | Not verified | Post, hook and carousel scripts | Free |
| 3 | roscodetech/claude-carousel | Community | Not verified | Topic/URL → numbered PNG carousel slides for LinkedIn, IG, X, FB | Free; runs Python scripts\[51\] |
| 4 | itchernetski/threads-carousel-claude-skill | Community | Not verified | Text post → carousel images or PDF | Free |
| 5 | inferen-sh/skills → social-media-carousel | Vendor | 173 (claudemarketplaces) | Carousel design | Needs paid inference.sh CLI\[52\] |
| — | blader/humanizer | Community | ~52.2k (githublb, undated) | Removes "AI-sounding" patterns | Free |
| — | anthropics/skills → canvas-design / theme-factory / brand-guidelines | Official | ~187k | Visual and brand consistency | Free |

**Hook Forge** (mentioned earlier in your conversation): I could not verify a GitHub repo by that name. Treat it as unverified.

**Best overall:** marketingskills for words plus roscodetech/claude-carousel for slides. **Best free/easiest:** blacktwist/social-media-skills.

### 4.4 Marketing: General, Content, SEO, Ads, Brand, Growth, Copywriting

| Rank | Repo | Owner | Stars | License | What it does |
|---|---|---|---|---|---|
| 1 | coreyhaines31/marketingskills | Community (Corey Haines) | 58.5k; release v2.14.0 on Oct 30, 2026 | MIT | CRO, copywriting, SEO and programmatic SEO, AI-search/GEO, paid ads, analytics, email sequences, pricing, A/B tests, cold email, prospecting, RevOps\[53\]\[54\] |
| 2 | anthropics/knowledge-work-plugins → marketing | Official | 33.6k | Apache-2.0 | Content, campaigns, brand voice |
| 3 | alirezarezvani/claude-skills (marketing pods) | Community | ~29k | MIT (unverified) | ~48 marketing skills plus revenue ops\[55\] |
| 4 | BrianRWagner/ai-marketing-claude-code-skills | Community | Not verified | Free + paid Pro | Positioning, content, voice frameworks\[56\] |
| 5 | zubair-trabzada/ai-marketing-claude | Community | Not verified | MIT | Website audits and client reports\[56\] |
| 6 | hyperfx-ai/marketing-skills | Vendor (Hyper) | Not verified | MIT; needs paid Hyper service | Meta Ads via Hyper MCP. **Ranked by a vendor-written comparison.**\[56\] |

**Notes:** Corey Haines' pack leads on stars, independent mentions (Medium's Design Bootcamp calls it "the most-used marketing skill pack right now") and author credibility.\[57\] Install: `npx skills add coreyhaines31/marketingskills -a claude-code`, or `claude plugin marketplace add coreyhaines31/marketingskills` then `claude plugin install marketing-skills@marketingskills`.\[2\]\[55\] Fill in the shared product-marketing context file first.\[19\] A promoted partner (Omnia) is optional and paid.\[19\]

**Best overall:** coreyhaines31/marketingskills. **Best free/easiest:** same.

### 4.5 Creative Thinking, Brainstorming, Ideation

| Rank | Repo | Owner | Stars | What it does |
|---|---|---|---|---|
| 1 | obra/superpowers (brainstorming) | Community | ~312k | Turns rough ideas into designs before work starts\[58\] |
| 2 | coreyhaines31/marketingskills → marketing-ideas | Community | 58.5k | 140 marketing ideas |
| 3 | Leonxlnx/taste-skill | Community | ~110k (author profile, Nov 2026) | Pushes agents away from generic output, mainly design\[59\] |
| 4 | anthropics/skills → canvas-design, algorithmic-art | Official | ~187k | Visual ideation |

**Reputation:** on Hacker News' "A Rave Review of Superpowers" thread, user tao_oat wrote: "I think that the brainstorming skill is great. It helps flesh out a rough early idea." Another commenter felt Superpowers "lacks flexibility."\[58\]\[60\]

**Best overall:** Superpowers. **Best free/easiest:** Superpowers' brainstorming skill alone.

### 4.6 Critical Thinking, Decision-Making, Mental Models

| Rank | Repo | Owner | Stars | What it does |
|---|---|---|---|---|
| 1 | coreyhaines31/makerskills | Community | 880 (GitHub profile) | Decisions, research, second-brain, scenario modeling, meta-skills\[11\]\[61\] |
| 2 | obra/superpowers | Community | ~312k | Plan → critique → execute discipline |
| 3 | mattpocock/skills → "grill me" | Community | Unverified | Agent interrogates your plan; Firecrawl's blog reports 1.1M installs (unverified)\[30\] |
| 4 | Imbad0202/academic-research-skills (devil's advocate / reviewer) | Community | ~49.5k–55.3k | Cross-model challenge of claims |

**Gap:** no strong dedicated "mental models" skill found (see Section 6).

**Best overall:** makerskills plus Superpowers. **Best free/easiest:** makerskills.

### 4.7 Business Strategy and Operations

| Rank | Repo | Owner | Stars | What it does |
|---|---|---|---|---|
| 1 | anthropics/knowledge-work-plugins (Productivity, Product Management, Finance, Data, Enterprise Search) | Official | 33.6k | Role workflows with connectors (Slack, Box, Jira, Microsoft 365) |
| 2 | alirezarezvani/claude-skills | Community | ~29k | C-level advisory, operations, commercial & finance, compliance\[28\] |
| 3 | firatcand/founder-skills | Community | Not verified | B2B SaaS GTM, positioning, PLG, channel strategy |
| 4 | ognjengt/founder-skills → go-to-market-plan | Community | Not verified | Three GTM strategies for your stage |

**Best overall:** knowledge-work-plugins. **Best free/easiest:** same.

### 4.8 Law and Legal for Companies: Contracts, Compliance, Privacy, Corporate

> **Important:** These skills do **not** replace a qualified lawyer. Laws vary by jurisdiction, and AI output can be wrong or out of date. Use them for first-pass triage and preparation, and have a licensed attorney review anything material.

| Rank | Repo | Owner | Stars | License | What it does |
|---|---|---|---|---|---|
| 1 | anthropics/knowledge-work-plugins → legal | Official | 33.6k | Apache-2.0 | /review-contract against your playbook (deviations, redlines, business impact), /triage-nda, /vendor-check, compliance, risk assessment, meeting briefs |
| 2 | evolsb/claude-legal-skill | Community | Not verified | MIT | CUAD-based contract review and redlines; self-described as "not a replacement for attorney review on material deals" |
| 3 | alirezarezvani/claude-skills (compliance) | Community | ~29k | MIT (unverified) | Compliance skills |
| 4 | borghei/Claude-Skills → legal-skills | Community | 325 (claudecowork.im) | Not verified | 17 **EXPERIMENTAL** skills: NDA, privacy, DPIA, breach response |

**Notes:** Install with `claude plugin marketplace add anthropics/knowledge-work-plugins` then `claude plugin install legal@knowledge-work-plugins`. Its README says it "does not provide legal advice" and tells non-US users to customize the playbook in `.claude/legal.local.md` for their jurisdiction.\[21\] Artificial Lawyer covered the launch as "Anthropic Moves Into Legal Tech," and a legal-tech contributor (UseJunior) submitted "UPL safety" changes, showing professional scrutiny.\[35\]\[62\]

**Best overall:** Anthropic legal plugin. **Best free/easiest:** same (write your playbook first).

### 4.9 Web Design and Frontend Design

| Rank | Repo | Owner | Stars | License | What it does |
|---|---|---|---|---|---|
| 1 | vercel-labs/agent-skills | Vendor (Vercel) | 33.5k | MIT | web-design-guidelines (100+ accessibility, forms, animation, typography, performance rules), react-best-practices (~70 rules), composition patterns |
| 2 | anthropics/skills → frontend-design | Official | ~187k | See repo | Aesthetic direction, avoids generic "AI look" |
| 3 | nextlevelbuilder/ui-ux-pro-max-skill | Community | ~145k | MIT | Searchable design database\[63\] |
| 4 | Leonxlnx/taste-skill | Community | ~110k | MIT (unverified) | Anti-"slop" frontend direction\[64\]\[65\] |

**Reputation:** InfoQ covered Vercel's react-best-practices, noting it complements linters.\[66\] Snyk's "Top 8 Claude Skills for UI/UX Engineers" ranks Vercel's guidelines and Anthropic's frontend-design highly.\[67\] One registry ranks web-design-guidelines the second most-copied original skill, behind frontend-design, so install from the original repo.\[68\] Install: `npx skills add vercel-labs/agent-skills`.\[66\]

**Best overall:** Vercel + Anthropic frontend-design. **Best free/easiest:** Anthropic frontend-design.

### 4.10 Mobile App Design and Development

| Rank | Repo / source | Owner | Stars | What it does |
|---|---|---|---|---|
| 1 | Expo official skills (via claude-plugins-official) | Vendor (Expo) | Not verified | expo-native-ui, expo-dom, expo-web-to-native, expo-brownfield, EAS; registers the Expo MCP server |
| 2 | callstackincubator/agent-skills | Vendor (Callstack) | Not verified | react-native-best-practices (27 skills at launch), testing, upgrades, brownfield migration |
| 3 | vercel-labs/agent-skills → react-native-skills | Vendor | 33.5k | List performance, animations, native modules |
| 4 | zakariaf/ReactNative-Skills | Community | Not verified | 79 "self-verifying" skills incl. Expo Router, i18n/RTL, accessibility, EAS releases |

**Install:** Expo: `claude plugin install expo@claude-plugins-official`.\[69\] Callstack: `npx skills@latest add callstackincubator/agent-skills --skill '*'`.\[70\] **Reputation:** Callstack's live test on a real React Native codebase found agent-driven Expo upgrades fast, but native build errors "still require developer judgment."\[71\] **Gap:** no strong native Swift/Kotlin design skill found.

**Best overall:** Expo + Callstack. **Best free/easiest:** Expo plugin.

### 4.11 UI/UX

| Rank | Repo | Owner | Stars | What it does |
|---|---|---|---|---|
| 1 | nextlevelbuilder/ui-ux-pro-max-skill | Community | ~145.1k (GitHub page) | 84 styles, 192 palettes, 74 font pairings, 192 product types, 98 UX guidelines, GSAP motion presets, 22 stacks (per its SKILL.md)\[63\] |
| 2 | vercel-labs/agent-skills → web-design-guidelines | Vendor | 33.5k | UX/accessibility audit |
| 3 | anthropics/skills → frontend-design | Official | ~187k | Creative direction |

**Notes:** Snyk calls UI UX Pro Max "the most comprehensive design intelligence skill in the current ecosystem," with accessibility ranked highest.\[67\] Install: `npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max`.\[63\] **Caveats:** runs a Python script; paid Premium exists; too large for Claude.ai upload;\[4\] verify given rapid star growth.

**Best overall:** UI UX Pro Max. **Best free/easiest:** Vercel web-design-guidelines (pure rules).

### 4.12 Three.js, WebGL, Parallax and Immersive/Animated Websites

| Rank | Repo | Owner | Stars | What it does |
|---|---|---|---|---|
| 1 | CloudAI-X/threejs-skills | Community | 4.0k (GitHub page) | 10 SKILL.md files on the r160+ API: scenes, materials, lighting, animation, GLTF loaders, shaders, post-processing. Last commit reported Oct 19, 2026. **License disputed**\[23\]\[25\]\[72\]\[73\] |
| 2 | Moh4696/open-3d-skills | Community | Not verified | 8 skills: three.js scenes, **scroll-scrubbed films** (parallax-style), transparent Safari video, cursor rigs, exploded views. MIT |
| 3 | dgreenheck/webgpu-claude-skill | Community (Three.js Roadmap educator) | Not verified | WebGPU + TSL shaders, aligned to r183+ |
| 4 | full-stack-skills/threejs-skills | Community | Not verified | 18 skills incl. WebXR |
| — | heygen-com/hyperframes → /gsap | Vendor | 78.8k | GSAP animation knowledge |

**Best overall:** CloudAI-X (fundamentals) plus open-3d-skills (scroll/parallax). **Best free/easiest:** CloudAI-X, but confirm the license.

### 4.13 Backend Engineering

| Rank | Repo | Owner | Stars | What it does |
|---|---|---|---|---|
| 1 | obra/superpowers | Community | ~312k | TDD, debugging, planning, code review\[74\] |
| 2 | addyosmani/agent-skills | Community | ~99.3k (tracker) | Production-grade engineering skills |
| 3 | wshobson/agents | Community | ~39.2k (possibly stale) | Backend and architecture agents |
| — | anthropics/skills → mcp-builder | Official | ~187k | Building MCP integrations |

**Gap:** no dominant framework-specific backend skill (Django, Rails, NestJS) with strong reviews; prefer your stack vendor's own skills.

**Best overall:** Superpowers. **Best free/easiest:** Superpowers.

### 4.14 Security: Backend, Application, DevSecOps

| Rank | Repo | Owner | Stars | License | What it does |
|---|---|---|---|---|---|
| 1 | trailofbits/skills | Vendor (Trail of Bits) | ~7,428 (independent scan, Oct 8, 2026) to ~7,987 (tracker) | CC-BY-SA-4.0 | Static analysis (CodeQL, Semgrep, SARIF), variant analysis, differential review, insecure-defaults, supply-chain-risk auditor, agentic-actions auditor, property-based testing |
| 2 | anthropics/claude-code-security-review | Official | ~6,664 (vibe-eval guide) | MIT | GitHub Action reviewing PR diffs (a tool, not a SKILL.md) |
| 3 | cloudflare/security-audit-skill | Vendor | Not verified | Not verified | Code security audits |
| — | NVIDIA/SkillSpector, cisco-ai-defense/skill-scanner | Vendor | Not verified | Not verified | **Scanners for vetting skills** (tools) |

**Notes:** Snyk calls Trail of Bits "the gold standard for security-focused Claude Skills." Install: `/plugin marketplace add trailofbits/skills`, then pick plugins.\[75\] An independent scan found 9 installer scripts (one edits your shell profile) and no security policy file.\[17\] For a small SaaS, `insecure-defaults` and `supply-chain-risk-auditor` are the practical picks.

**Best overall:** trailofbits/skills. **Best free/easiest:** claude-code-security-review on every PR.

### 4.15 Server Setup, DevOps, Infrastructure, Deployment

| Rank | Repo | Owner | Stars | What it does |
|---|---|---|---|---|
| 1 | hashicorp/agent-skills | Vendor (HashiCorp) | Not verified (288 in an early Feb 2026 snapshot) | 20 skills: Terraform (style guide, tests, modules, Stacks, providers, import) and Packer. MPL-2.0 |
| 2 | vercel-labs/agent-skills (deploy skills) | Vendor | 33.5k | Deploying on Vercel |
| 3 | Expo EAS skills | Vendor | — | Mobile build/release |
| 4 | wshobson/agents (infra plugins) | Community | ~39k | Kubernetes, cloud, CI/CD\[10\] |

**Install:** `claude plugin marketplace add hashicorp/agent-skills` then `claude plugin install terraform@hashicorp` (older docs use per-category IDs, since consolidated).\[76\]\[77\] HashiCorp's blog announced it, and a DevOps.dev reviewer tested it on real work for about ten days.\[77\]\[78\] **Gap:** no strong VPS/Linux hardening skill; use Trail of Bits' insecure-defaults plus provider docs.

**Best overall:** hashicorp/agent-skills. **Best free/easiest:** your hosting vendor's skill (Vercel or Expo EAS).

### 4.16 Sales: Solo, Founder-Led, Sales Management, Distribution, Channel

| Rank | Repo | Owner | Stars | What it does |
|---|---|---|---|---|
| 1 | coreyhaines31/marketingskills (cold-email, prospecting, revops, sales-enablement) | Community | 58.5k | Cold emails, prospect lists, lead lifecycle, pitch decks, objection docs, demo scripts |
| 2 | anthropics/knowledge-work-plugins → sales | Official | 33.6k | Prospect research to call follow-ups, connected to CRM |
| 3 | TheCraigHewitt/sales-skills | Community | Not verified | 21 skills: prospecting, deal execution, sales ops, sales comp. MIT. `claude plugin add thecraighewitt/sales-skills` |
| 4 | firatcand/founder-skills (sales-skill, prospecting, channel-expert) | Community | Not verified | MEDDPICC, negotiation, ICP, channel selection, CAC benchmarks |
| 5 | zubair-trabzada/ai-sales-team-claude | Community | Not verified | 14 skills + 5 agents: BANT/MEDDIC, outreach, proposals, PDF pipeline reports. MIT |
| — | explorium-ai/gtm-skills, vibeprospecting-plugin | Vendor | Not verified | Live contact data; **paid** |

**Flag:** Composio's "Top 10 sales skills" list is vendor-written. **Gap:** no strong reseller/channel-partner management skill; founder-skills' channel-expert is nearest.

**Best overall:** marketingskills + Anthropic sales plugin. **Best free/easiest:** TheCraigHewitt/sales-skills.

### 4.17 Scaling a Company and Long-Term Vision (Scalable from Day One)

There's no single "scale your company" skill. Scalability comes from combining layers:

| Layer | Best skill(s) | Why it supports scale |
|---|---|---|
| Code discipline | obra/superpowers; addyosmani/agent-skills | Plan-first, test-driven, reviewable changes |
| Component architecture | vercel-labs/agent-skills → composition patterns | Avoids "boolean prop explosion" |
| Design system | ui-ux-pro-max-skill | One consistent token/style system from day one |
| Infrastructure as code | hashicorp/agent-skills | Reproducible infrastructure |
| Security from day one | trailofbits/skills | Cheaper to fix early |
| Processes & org | knowledge-work-plugins (Productivity, Product Management); alirezarezvani C-level advisory | Repeatable workflows, PRDs, roadmaps |
| Reference | shanraisshan/claude-code-best-practice (~68.5k) | Structuring agent work as you grow\[29\] |

**Best overall:** Superpowers + composition patterns + UI UX Pro Max. **Best free/easiest:** Superpowers.

### 4.18 Web Scraping and Data Extraction

> **Legal/ToS note:** Scraping can breach terms of service, copyright or database rights, and privacy laws such as GDPR when personal data is involved. Respect robots.txt and rate limits, don't log in to scrape, avoid personal data without a lawful basis, and get legal advice for commercial lead scraping.

| Rank | Repo | Owner | Stars | What it does | Cost |
|---|---|---|---|---|---|
| 1 | firecrawl/skills | Vendor (Firecrawl) | Not verified | Search, scrape, crawl, map, interact, monitor, parse; "build" skills for app integration. `npx skills add firecrawl/skills` | Paid/credit-based API key |
| 2 | alexsmedile/firecrawl-lean | Community | Not verified | Single-file token-efficient version | Same API cost |
| 3 | apify/agent-skills → apify-lead-generation | Vendor (Apify) | Not verified | Leads from Google Maps, Instagram, TikTok, LinkedIn | Paid; **highest legal/ToS risk** |

**Notes:** the firecrawl/firecrawl library is a tool, not a skill,\[79\] and its star counts conflict across trackers. Self-hosted Firecrawl lacks cloud anti-bot features.\[80\] **Gap:** no strong free scraping skill; have Claude write Playwright or BeautifulSoup scripts instead.

**Best overall:** firecrawl/skills. **Best free/easiest:** none fully free; Firecrawl is easiest.

### 4.19 Research, PhD and Academic Skills

| Rank | Repo | Owner | Stars | License | What it does |
|---|---|---|---|---|---|
| 1 | Imbad0202/academic-research-skills | Community (researcher author) | ~49.5k (githublb) to ~55.3k (skillsllm) | MIT | Research → write → review → revise → finalize: Deep Research (13 agents), Academic Paper (12 agents), simulated peer review, citation-integrity gates |
| 2 | K-Dense-AI/scientific-agent-skills | Company/community | ~56.1k | Not verified | 163 science skills; literature review across PubMed, arXiv, bioRxiv, Semantic Scholar\[10\] |
| 3 | anthropics/skills → pdf, docx, xlsx | Official | ~187k | See repo | Reading papers, writing manuscripts |

**Notes:** Install with `/plugin marketplace add Imbad0202/academic-research-skills` then `/plugin install academic-research-skills`.\[81\] Its philosophy is "AI as copilot, not pilot," targeting hallucinated citations by checking claims against retrieved text.\[82\] K-Dense's "175,000+ scientists" claim is self-reported.\[10\] Check your institution's AI policy and verify every citation.

**Best overall:** academic-research-skills. **Best free/easiest:** same.

### 4.20 Documents: Email, PDF, PowerPoint, Proposals, Menus, Stationery, Books

| Rank | Repo | Owner | Stars | What it does |
|---|---|---|---|---|
| 1 | anthropics/skills → docx, pdf, pptx, xlsx | Official | ~187k | Word, PDF (forms, merge, extract), PowerPoint, Excel: proposals, reports, menus, price lists\[34\]\[83\] |
| 2 | anthropics/skills → brand-guidelines, theme-factory, canvas-design | Official | ~187k | Brand styling for decks, PDFs, stationery, menus |
| 3 | coreyhaines31/marketingskills → email sequences, cold-email, sales-enablement | Community | 58.5k | Business email, one-pagers, pitch decks |
| 4 | anthropics/skills → internal-comms / doc co-authoring | Official | ~187k | Company updates, structured drafting (verify current list) |
| 5 | cathrynlavery/diagram-design | Community | ~42.5k (githublb) | Diagrams for documents and decks\[32\] |

**Notes:** one guide says the official document skills "help Claude produce actual deliverables: contracts, reports, slides, spreadsheets, and extracted PDF data."\[34\] **Gaps:** no strong HTML email design skill (use frontend skills to build MJML or React Email templates), and no print-ready menu/stationery/book skill with bleed/CMYK (draft with pdf + canvas-design + brand-guidelines, finish in Canva or a print tool).

**Best overall:** anthropics/skills. **Best free/easiest:** same.

### 4.21 Other Business-Relevant Fields

| Field | Best available skill | Status / notes |
|---|---|---|
| Finance & accounting | knowledge-work-plugins → finance; alirezarezvani commercial & finance; xlsx | Analysis and models only; not a substitute for an accountant |
| Fundraising / investor decks | marketingskills sales-enablement + pptx | **Gap:** no dedicated fundraising skill |
| HR / hiring | Uhudsavasindankacanokcu2/recruiting-skills-for-claude | **Unverified, low signal.** santifer/career-ops (~53.9k) and MadsLorentzen/ai-job-search (~44k) serve job *seekers*\[31\]\[32\]\[84\] |
| Customer support | knowledge-work-plugins → customer-support | Best available |
| Product management | knowledge-work-plugins → product-management | Good |
| Data analysis | knowledge-work-plugins → data; xlsx; K-Dense | Good |
| Productivity / memory | knowledge-work-plugins → productivity; thedotmack/claude-mem (~113k) | claude-mem is a memory **tool**, not a skill\[10\] |
| Automation / integrations | anthropics/skills → mcp-builder; Composio | Composio is paid |
| Branding | brand-guidelines; marketingskills positioning | Good |
| E-commerce | — | **Gap** |
| Translation / localization | zakariaf/ReactNative-Skills (app i18n only) | **Gap** for marketing |
| Building your own skills | skill-creator; makerskills meta-skills; trailofbits workflow-skill-design | Recommended for filling gaps |

---

## 5. Suggested Starter Stack for a Small Business That Plans to Scale

**Phase 1: Content, brand, documents**
1. `anthropics/skills` (documents, brand-guidelines, frontend-design, skill-creator)
2. `coreyhaines31/marketingskills` (fill in the context file first)
3. `social-media-skills/skills` or `blacktwist/social-media-skills` for drafting; publish via **Metricool**
4. `heygen-com/hyperframes` for Reels (free; avatars are paid)

**Phase 2: Operating the company**
5. `anthropics/knowledge-work-plugins`: legal (playbook + lawyer review), sales, finance, support, product
6. `coreyhaines31/makerskills` + Superpowers brainstorming

**Phase 3: Building product**
7. `obra/superpowers`
8. `ui-ux-pro-max-skill` + `vercel-labs/agent-skills`
9. Expo + `callstackincubator/agent-skills` for mobile
10. `CloudAI-X/threejs-skills` + `Moh4696/open-3d-skills` for immersive sites only

**Phase 4: Hardening and scaling**
11. `trailofbits/skills` + `anthropics/claude-code-security-review`
12. `hashicorp/agent-skills` once on infrastructure-as-code
13. `firecrawl/skills` (paid API) only for real data needs

**Cost summary:** all free to install. Recurring costs come from Claude plus optional services: Firecrawl/Apify credits, HeyGen avatars/HyperFrames Pro, UI UX Pro Max Premium, publishing services, and Remotion company licensing if used.

---

## 6. Gaps: Where No Strong Skill Exists, and What to Use Instead

| Gap | What to use instead |
|---|---|
| Metricool-native scheduling | Draft with social skills; publish via Metricool connector |
| Mental models / critical thinking | Build your own with skill-creator (first principles, inversion, pre-mortem), paired with Superpowers and makerskills |
| Fundraising | pptx + sales-enablement; human advisors |
| HR / hiring (employer side) | Custom skill; humans make hiring decisions (bias, employment law) |
| Accounting / tax | xlsx + finance plugin; a qualified accountant |
| E-commerce | marketingskills (CRO, pricing, email) + platform docs |
| Marketing translation | Claude + native-speaker review |
| HTML email templates | Frontend skills generating MJML/React Email |
| Print design (menus, stationery, books) | pdf + canvas-design drafts; Canva or print tool to finish |
| Distribution / channel partners | founder-skills channel-expert + custom skill |
| VPS/Linux hardening | trailofbits insecure-defaults + provider docs |
| Free scraping | Claude-written Playwright scripts, within ToS/legal limits |

---

## 7. Caveats

- **Star counts are snapshots from mixed sources** that sometimes disagree widely (e.g. ComposioHQ/awesome-claude-skills 41.8k vs 75.8k; mattpocock/skills 130k vs "255k+").\[30\]\[31\]\[85\]\[86\] "Not verified" means I couldn't confirm a count, not that the repo is weak.
- **Licenses** for taste-skill, CloudAI-X/threejs-skills and alirezarezvani were not verifiable on the repo. Check LICENSE files before commercial use.
- **Activity:** most recommended repos showed October–November 2026 activity (e.g. marketingskills v2.14.0 on Oct 30, 2026; Superpowers updated Nov 3, 2026).\[53\]\[87\] Others were not verified.
- **Claude app vs Claude Code:** most skills target Claude Code and other coding agents; Anthropic's knowledge-work plugins target Cowork in the desktop app; simple Markdown-only skills can be zipped and uploaded to the Claude app.

## 8. Source Quality Notes

Highest-trust sources were GitHub repository pages and READMEs, official vendor posts (HashiCorp, Callstack, Expo, Anthropic), and independent coverage (Snyk, InfoQ, Artificial Lawyer, Help Net Security, Cloud Security Alliance, an arXiv paper on malicious skills). Star trackers, skill directories and Hacker News were medium-trust. Vendor-written rankings, marketplace "S-rank" ratings and Gumroad bundles were used only as leads.

## Sources

1. [obra/superpowers - 312.3k Stars · Global Rank #14](https://www.star-history.com/obra/superpowers/)
2. [GitHub - coreyhaines31/marketingskills: Marketing skills for Claude Code and AI agents. CRO, copywriting, SEO, analytics, and growth engineering. · GitHub](https://github.com/coreyhaines31/marketingskills)
3. [GitHub - anthropics/skills: Public repository for Agent Skills · GitHub](https://github.com/anthropics/skills)
4. [GitHub - nextlevelbuilder/ui-ux-pro-max-skill: An AI skill that provides design intelligence for building professional UI/UX across multiple platforms. · GitHub](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
5. [GitHub - heygen-com/hyperframes: Write HTML. Render video. Built for agents. · GitHub](https://github.com/heygen-com/hyperframes)
6. [HyperFrames Studio — HyperFrames](https://hyperframes.studio/studio)
7. [Malicious Agent Skills: Supply-Chain Risks for AI Agents](https://blog.silent4business.com/en/2026/06/15/malicious-agent-skills-supply-chain-risks/)
8. [Claude and AI agent skills: how to spot malicious ones](https://hard2bit.com/en/blog/malicious-ai-agent-skills-how-to-vet-before-installing/)
9. [Snyk Finds Prompt Injection in 36%, 1467 Malicious Payloads in a ToxicSkills Study of Agent Skills Supply Chain Compromise](https://app.daily.dev/posts/snyk-finds-prompt-injection-in-36-1467-malicious-payloads-in-a-toxicskills-study-of-agent-skills-s-0bdgmynfg)
10. [claude-skills · GitHub Topics · GitHub](https://github.com/topics/claude-skills)
11. [coreyhaines31 (Corey Haines) · GitHub](https://github.com/coreyhaines31)
12. [master marketing claude skills bundle](https://inflectual.gumroad.com/l/master-marketing-claude-skills-bundle)
13. [nextlevelbuilder/ui-ux-pro-max-skill](https://githublb.vercel.app/repo/nextlevelbuilder/ui-ux-pro-max-skill)
14. [AI Hub Supply Chain Weaponization](https://labs.cloudsecurityalliance.org/research/csa-research-note-huggingface-clawhub-malware-supply-chain-2/)
15. [SkillSieve: A Hierarchical Triage Framework for Detecting Malicious AI Agent Skills](https://arxiv.org/html/2604.06550v1)
16. [We Audited the Viral 213k-Star "Everything Claude Code" Repo — and Found a Malware Clone in the Wild - DEV Community](https://dev.to/joergmichno/we-audited-the-viral-213k-star-everything-claude-code-repo-and-found-a-malware-clone-in-the-wild-14hb)
17. [Trail of Bits Skills: Security Auditing Skills for Claude Code (GitHub, Scanned)](https://www.mrtechking.com/trail-of-bits-skills-github/)
18. [Security Skills on GitHub: 11 Repos Sorted by Job](https://vibe-eval.com/guides/security-skills-github/)
19. [marketingskills/README.md at main · coreyhaines31/marketingskills · GitHub](https://github.com/coreyhaines31/marketingskills/blob/main/README.md)
20. [How to Use Marketing Skills for Claude Code: A Practical AI Marketing Workflow for SaaS Teams](https://tosea.ai/blog/marketing-skills-claude-code-guide)
21. [knowledge-work-plugins/legal/README.md at main · anthropics/knowledge-work-plugins · GitHub](https://github.com/anthropics/knowledge-work-plugins/blob/main/legal/README.md)
22. [GitHub - dgreenheck/webgpu-claude-skill: A Claude skill for developing WebGPU applications with Three.js · GitHub](https://github.com/dgreenheck/webgpu-claude-skill)
23. [Three.js Skills — Accurate 3D Code for AI Agents](https://promptsrush.com/marketplace/skills/threejs-skills)
24. [Introducing Claude Skills](https://www.anthropic.com/news/skills)
25. [GitHub - CloudAI-X/threejs-skills · GitHub](https://github.com/cloudai-x/threejs-skills)
26. [Claude Skills are here — and they might be the smartest AI feature you’re not using yet](https://www.tomsguide.com/ai/claude-skills-are-here-and-they-might-be-the-smartest-ai-feature-youre-not-using-yet)
27. [GitHub - anthropics/claude-plugins-official: Official, Anthropic-managed directory of high quality Claude Code Plugins. · GitHub](https://github.com/anthropics/claude-plugins-official)
28. [GitHub - alirezarezvani/claude-skills: 380 Claude Code skills & agent skills & plugins (30+ Agents, 70+ custom commands, 380+ skills, customizable references, scripts)for Claude Code, Codex, Gemini CLI, Cursor, and 8 more coding agents — engineering, marketing, product, compliance, C-level advisory, research, business operations, commercial & finance, and your daily productivity skills.](https://github.com/alirezarezvani/claude-skills)
29. [claude-code-skills · GitHub Topics · GitHub](https://github.com/topics/claude-code-skills)
30. [14 Best Claude Code Skills for Developers in 2026](https://www.firecrawl.dev/blog/best-claude-code-skills)
31. [Top 10 Agent Skills by GitHub Stars](https://x.com/bibryam/article/2066652088029852098)
32. [Top 41 Claude Code Repositories by Stars](https://githublb.vercel.app/topic/claude-code)
33. [7 Best Free Claude Skill Repos on GitHub (2026)](https://ryandoser.com/best-free-claude-skill-repos/)
34. [Best Claude Skills: High-Star GitHub Picks](https://proxycc.cc/en/guide/claude-skills/)
35. [Anthropic Moves Into Legal Tech](https://www.artificiallawyer.com/2026/02/02/anthropic-moves-into-legal-tech/)
36. [Superpowers 6](https://news.ycombinator.com/item?id=48739459)
37. [Getting the most out of Opus 5.5 in Claude and Claude Code](https://news.ycombinator.com/item?id=49946567)
38. [Add https://github.com/obra/superpowers and then try again.](https://news.ycombinator.com/item?id=47027961)
39. [GitHub - social-media-skills/skills: 106 social media skills for AI agents - strategy, writing, video, design, platform growth, publishing, and analytics. Works with Claude, Cursor, OpenClaw, Hermes & 40+ agents. · GitHub](https://github.com/social-media-skills/skills)
40. [GitHub - blacktwist/social-media-skills: AI agent skills for social media content strategy, creation, and analysis across text-first platforms · GitHub](https://github.com/blacktwist/social-media-skills)
41. [GitHub - sergebulaev/instagram-skills: Instagram marketing skills for Claude Code and Codex: captions, carousels, hooks, hashtag strategy, and a weekly plan. Draft, humanize, and publish via Publora. MIT. Content engineering by Creative Content Crafts. · GitHub](https://github.com/sergebulaev/instagram-skills)
42. [GitHub - STGime/posta-skill: Claude Code plugin for social media content generation and scheduling via Posta · GitHub](https://github.com/STGime/posta-skill)
43. [GitHub - nadiem99/claude-linkedin-skills: Claude Code skills for LinkedIn — posts, carousels, coaching, planning, series, and analytics. Built for running a consistent LinkedIn presence alongside a writing publication. · GitHub](https://github.com/nadiem99/claude-linkedin-skills)
44. [hyperframes/README.md at main · heygen-com/hyperframes · GitHub](https://github.com/heygen-com/hyperframes/blob/main/README.md)
45. [GitHub - remotion-dev/skills: Agent Skills · GitHub](https://github.com/remotion-dev/skills)
46. [Remotion Agent Skills for Claude: Review, Install & Safety](https://skillcritic.com/skills/remotion-dev/skills/)
47. [HyperFrames: The video editor built for agents - HeyGen](https://hyperframes.heygen.com/)
48. [GitHub - wmtechti/heygen-hyperframes: Write HTML. Render video. Built for agents. · GitHub](https://github.com/wmtechti/heygen-hyperframes)
49. [remotion-dev/skills — Agent skills](https://www.skills.sh/remotion-dev/skills)
50. [HyperFrames: HTML to Video, a Free Remotion Alternative (70K Stars) - DEV Community](https://dev.to/itxtayab/hyperframes-html-to-video-a-free-remotion-alternative-70k-stars-3p25)
51. [GitHub - roscodetech/claude-carousel: Generate multi-slide social-media carousel posts (LinkedIn, Instagram, X, Facebook) as ready-to-upload PNG image sets — a Claude Code plugin. · GitHub](https://github.com/roscodetech/claude-carousel)
52. [Social Media Carousel](https://claudemarketplaces.com/skills/inferen-sh/skills/social-media-carousel)
53. [Releases · coreyhaines31/marketingskills · GitHub](https://github.com/coreyhaines31/marketingskills/releases)
54. [Marketing skills library for Claude Code · AI Marketing Insiders](https://www.skool.com/ai-marketing-insiders/marketing-skills-library-for-claude-code)
55. [Claude Marketing Skills: 32 Picks for Claude Code](https://www.aibuilderclub.com/blog/claude-code-for-growth-marketing-skills-guide)
56. [Best Marketing Skills GitHub Repos for AI Agents in 2026: Comparison Guide](https://www.hyperfx.ai/blog/best-marketing-skills-github-repos-2026)
57. [10 Best Claude Skill Repos for Marketing (2026)](https://medium.com/design-bootcamp/10-best-claude-skill-repos-for-marketing-2026-0e308c19514c)
58. [Online reviews indicate that Superpowers is best for people who are not already ...](https://news.ycombinator.com/item?id=47624814)
59. [Leonxlnx (Leon Lin) · GitHub](https://github.com/Leonxlnx)
60. [A Rave Review of Superpowers (For Claude Code)](https://news.ycombinator.com/item?id=47623101)
61. [GitHub - coreyhaines31/makerskills: AI agent skills for the personal operator's craft — decisions, research, second-brain, content rotation, scenario modeling, and meta-skills to author more. Works with Claude Code, Codex, Cursor. · GitHub](https://github.com/coreyhaines31/makerskills)
62. [How the Anthropic Legal Plugin Works (and How to Use It Without Claude Code)](https://usejunior.com/blog/anthropic-legal-plugin-how-it-works)
63. [ui-ux-pro-max Skill - nextlevelbuilder](https://www.ui-skills.com/skills/nextlevelbuilder/ui-ux-pro-max)
64. [Sponsor @Leonxlnx on GitHub Sponsors · GitHub](https://github.com/sponsors/Leonxlnx)
65. [\[Proposal\] Bundle taste-skill as a reference/adapter skill in OD · Issue #175 · nexu-io/open-design](https://github.com/nexu-io/open-design/issues/175)
66. [vercel react best practices](https://infoq.com/news/2026/02/vercel-react-best-practices)
67. [Top 8 Claude Skills for UI/UX Engineers](https://snyk.io/articles/top-claude-skills-ui-ux-engineers/)
68. [Web Design Guidelines Skill for Claude Code by Vercel](https://skillselion.com/skills/vercel-labs/agent-skills/web-design-guidelines)
69. [Expo Skills for AI agents - Expo documentation](https://docs.expo.dev/skills/)
70. [GitHub - callstackincubator/agent-skills: A collection of agent-optimized React Native skills for AI coding assistants. · GitHub](https://github.com/callstackincubator/agent-skills)
71. [Exploring Skills in Claude: A Live Walkthrough](https://www.callstack.com/events/exploring-dynamic-skills-in-claude)
72. [Three.js Skills — AI Agent Skill by CloudAI-X](https://agenticskills.io/skills/threejs-skills)
73. [threejs-skills: AI agents and LLM tools](https://goastro.website/forks/ai-agents/cloudai-x-threejs-skills/)
74. [GitHub - obra/superpowers-marketplace: Curated Claude Code plugin marketplace · GitHub](https://github.com/obra/superpowers-marketplace)
75. [Top 9 Claude Skills for Cybersecurity, Hacking, and Vulnerability Scanning](https://snyk.io/articles/top-claude-skills-cybersecurity-hacking-vulnerability-scanning/)
76. [GitHub - hashicorp/agent-skills: A collection of Agent skills and Claude Code plugins for HashiCorp products. · GitHub](https://github.com/hashicorp/agent-skills)
77. [HashiCorp Agent Skills: Bringing Terraform’s House Rules to AI Coding Agents](https://blog.devops.dev/hashicorp-agent-skills-bringing-terraforms-house-rules-to-ai-coding-agents-6b31739769fa?gi=eecb54ad2bf1)
78. [Introducing HashiCorp Agent Skills](https://www.hashicorp.com/en/blog/introducing-hashicorp-agent-skills)
79. [Top 10 Claude Skills for Web Scraping in 2026](https://www.browseract.com/blog/top-claude-skills-web-scraping-2026)
80. [firecrawl-scraper - Agent Skill for Claude Code, Cursor & Antigravity](https://agentpedia.codes/agent-skills/ai-tools/firecrawl-scraper)
81. [academic-research-skills - Data Processing on GitHub (55.3k★)](https://skillsllm.com/skill/academic-research-skills)
82. [Academic Research Skills — Claude Code Skill](https://paper-banana.org/paper-skills/academic-research-skills)
83. [awesome-claude-skills/document-skills/pdf/SKILL.md at master · ComposioHQ/awesome-claude-skills · GitHub](https://github.com/ComposioHQ/awesome-claude-skills/blob/master/document-skills/pdf/SKILL.md?plain=1)
84. [GitHub - GetBindu/awesome-claude-code-and-skills: A collection of Claude Skills · GitHub](https://github.com/GetBindu/awesome-claude-code-and-skills)
85. [Releases · ComposioHQ/awesome-claude-skills · GitHub](https://github.com/ComposioHQ/awesome-claude-skills/releases)
86. [ComposioHQ/awesome-claude-skills - 75.8k Stars · Global Rank #239](https://www.star-history.com/composiohq/awesome-claude-skills/)
87. [superpowers · GitHub Topics · GitHub](https://github.com/topics/superpowers)
