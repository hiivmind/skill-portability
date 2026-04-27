# Tier 1: Core Reference Verification — Design Spec

**Goal:** Verify every "Needs review" claim in the canonical reference files
(`lib/references/`) against the researched platform docs (`docs/platforms/*.md`).
Fix discrepancies in place. Update the reconciliation matrix.

**Context:** This is the first of three verification tiers. Tier 1 covers the
canonical lookup tables that rubrics, patterns, and templates consume. Getting
these right first means Tier 2 (rubrics/patterns) and Tier 3 (templates/install
docs) can trust them.

**Method:** For each item: read the claim in the plugin file → read the
corresponding section of the research doc → compare → fix or confirm → update
matrix status to "Correct" or "Fixed".

**Research source:** `docs/platforms/*.md` only. No new web searches. If a claim
cannot be verified from existing research, mark it "Unverifiable" in the matrix
with a note.

---

## Verification Items (14 total)

### A. platform-mappings.md — Table 2: Tool Name Mapping (5 items)

| # | Cell | Current value | Verify against |
|---|------|--------------|----------------|
| 1 | Codex / Skill | `(N/A)` — "Native loading via `$skill-name`" | `docs/platforms/codex.md` — skill loading section |
| 2 | Gemini / Task | `dispatch_agent` or `@agent-name` | `docs/platforms/gemini-cli.md` — subagent section |
| 3 | Gemini / all others | Various mappings | `docs/platforms/gemini-cli.md` — tool-names.ts section |
| 4 | OpenClaw / all | Various mappings | `docs/platforms/openclaw.md` — tool mapping section |
| 5 | Antigravity / all | "Same as Claude" | `docs/platforms/antigravity.md` — tool section |

### B. platform-mappings.md — Table 3: Hook Event Mapping (1 item)

| # | Cell | Current value | Verify against |
|---|------|--------------|----------------|
| 6 | Gemini / SubagentStart | `(N/A)` | `docs/platforms/gemini-cli.md` — hooks section |

### C. platform-mappings.md — Table 8: Skill Output Directory (2 items)

| # | Cell | Current value | Verify against |
|---|------|--------------|----------------|
| 7 | Codex / Skills Path | `.agents/skills/` | `docs/platforms/codex.md` — skill/agent paths |
| 8 | All others | Various | All `docs/platforms/*.md` — skill output paths |

### D. platform-mappings.md — Table 13: MCP Configuration (1 item)

| # | Cell | Current value | Verify against |
|---|------|--------------|----------------|
| 9 | Antigravity | "MCP not supported via config file" | `docs/platforms/antigravity.md` — MCP section |

### E. gemini-tools.md (2 items)

| # | Claim | Verify against |
|---|-------|----------------|
| 10 | All tool name mappings in the Claude→Gemini table | `docs/platforms/gemini-cli.md` — tool-names.ts listing |
| 11 | Additional Gemini CLI tools list (completeness) | `docs/platforms/gemini-cli.md` — full tool inventory |

### F. codex-tools.md (2 items)

| # | Claim | Verify against |
|---|-------|----------------|
| 12 | WebSearch mapping | `docs/platforms/codex.md` — tool inventory |
| 13 | spawn_agent details (parameters, behavior) | `docs/platforms/codex.md` — subagent section |

### G. cursor-tools.md (1 item)

| # | Claim | Verify against |
|---|-------|----------------|
| 14 | Hook format documentation | `docs/platforms/cursor.md` — hooks section |

### H. antigravity-tools.md (2 items)

| # | Claim | Verify against |
|---|-------|----------------|
| 15 | All tool names same as Claude Code | `docs/platforms/antigravity.md` — tool section |
| 16 | Frontmatter stripping fields (model, tools, disable-model-invocation, allowed-tools) | `docs/platforms/antigravity.md` — frontmatter section |

### I. openclaw-tools.md (3 items)

| # | Claim | Verify against |
|---|-------|----------------|
| 17 | No Task/Agent tool | `docs/platforms/openclaw.md` — tool inventory |
| 18 | No TodoWrite | `docs/platforms/openclaw.md` — tool inventory |
| 19 | Hook SDK details (event names and API) | `docs/platforms/openclaw.md` — hooks section |

---

## Files Changed

| File | Action |
|------|--------|
| `lib/references/platform-mappings.md` | Fix any wrong cells in Tables 2, 3, 8, 13 |
| `lib/references/gemini-tools.md` | Fix tool names or additional tools if wrong |
| `lib/references/codex-tools.md` | Fix WebSearch and spawn_agent if wrong |
| `lib/references/cursor-tools.md` | Fix hook format if wrong |
| `lib/references/antigravity-tools.md` | Fix tool names or frontmatter if wrong |
| `lib/references/openclaw-tools.md` | Fix Task/TodoWrite/hook claims if wrong |
| `docs/reconciliation-matrix.md` | Update all 19 items to Correct or Fixed |

Note: The matrix lists 14 items but items 15-19 (antigravity-tools.md and
openclaw-tools.md) are also tracked. The matrix groups some as single rows
("all tool names", "all others") but each needs individual verification.

---

## Exclusions

- Rubric YAML conditions (Tier 2)
- Pattern docs: hook-merging, manifest-generation, detection, bootstrapping,
  inventory (Tier 2)
- All templates and install docs (Tier 3)
- New web research — use `docs/platforms/*.md` only
- Per-skill sidecar pointer files (tracked in issues #11/#12)
- Reconciliation matrix structure changes

---

## Success Criteria

- Every "Needs review" item in section 1 (References) of the reconciliation
  matrix is resolved to "Correct", "Fixed", or "Unverifiable"
- Zero "Needs review" cells remain in section 1
- All fixes are consistent with `docs/platforms/*.md` research docs
