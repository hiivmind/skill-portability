# Tier 2: Rubrics & Patterns Verification — Design Spec

**Goal:** Verify every "Needs review" claim in rubric YAMLs (`lib/rubrics/`),
the rubric framework (`lib/rubrics/rubric-framework.md`), and pattern docs
(`lib/patterns/`) against the researched platform docs (`docs/platforms/*.md`).
Fix discrepancies in place. Update the reconciliation matrix.

**Context:** This is the second of three verification tiers. Tier 1 locked down
the canonical reference files. Tier 2 verifies the rubric conditions and pattern
logic that consume those references. Tier 3 (templates/install docs) follows.

**Method:** For each item: read the claim in the plugin file → read the
corresponding section of the research doc → compare → fix or confirm → update
matrix status to "Correct" or "Fixed".

**Research source:** `docs/platforms/*.md` only. No new web searches.

---

## Verification Items (11 total)

### A. Rubrics (6 items)

#### 1. codex.yaml — MCP conditions

Check whether `codex.yaml` has MCP-related conditions under a `5_toolmap` or
similar category. Research (`docs/platforms/codex.md`) confirms Codex supports
MCP via `.mcp.json` and `config.toml [mcp]`. If conditions are missing, add them
following the pattern used in other rubric YAMLs.

#### 2. gemini-cli.yaml — hooks_path and subagent conditions

Two sub-items:

**a) `hooks_path: null`:** Current value says "settings.json (user-configured,
not file-based)". Research (`docs/platforms/gemini-cli.md`) says hooks can also
be in extension manifest `hooks` field. Verify whether `hooks_path` should be
updated or if the null + comment is appropriate (since hooks aren't a standalone
file but embedded in settings.json or manifest).

**b) Subagent conditions:** Check whether `gemini-cli.yaml` has conditions
verifying subagent syntax (`@agent-name`, custom agents in `agents/`). Research
confirms full subagent support. If conditions are missing or incomplete, add them.

#### 3. cursor.yaml — Subagent conditions

Check whether `cursor.yaml` has conditions for subagent support. Research
(`docs/platforms/cursor.md`) confirms full subagent support with async execution,
model selection, readonly mode, and background config. If conditions are missing,
add them following the existing pattern.

#### 4. antigravity.yaml — Workflow conditions

Check workflow conditions under `7_runtime` category. Research
(`docs/platforms/antigravity.md`) confirms workflows live in
`.agents/workflows/` as Markdown files (not TOML). Verify the conditions match.

#### 5. openclaw.yaml — Context file conditions

Check context file conditions. Research (`docs/platforms/openclaw.md`) documents
7+ context files: AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md, USER.md,
HEARTBEAT.md, MEMORY.md, BOOTSTRAP.md. Current rubric may only reference
AGENTS.md. If conditions are incomplete, expand them.

#### 6. rubric-framework.md — Category definitions

Verify that the 7 rubric categories (Manifest, Skills, Context, Hooks, Tools,
Install, Runtime) cover all platform-specific assessment dimensions. This is a
meta-check — no platform-specific claims, just completeness of the framework.

---

### B. Patterns (5 items)

#### 7. hook-merging.md — Cursor hook generation format

Verify the GENERATE_CURSOR_HOOKS pseudocode against `docs/platforms/cursor.md`
hooks section. Check: camelCase events, flat structure (no nested hooks[] array),
version field, per-script options (failClosed, loop_limit, type).

#### 8. manifest-generation.md — Codex manifest fields and template refs

Two sub-items:

**a) Codex manifest fields:** Verify the documented Codex manifest schema
against `docs/platforms/codex.md`. Check required fields, optional fields.

**b) Template references:** Verify that all template paths referenced in the
generation pattern actually exist in `lib/templates/manifests/`.

#### 9. detection-algorithm.md — Platform signal detection

Verify that the platform artifact paths used for detection match actual platform
artifacts documented in research:
- Claude: `.claude-plugin/plugin.json`
- Cursor: `.cursor-plugin/plugin.json`
- Codex: `.codex-plugin/plugin.json`
- Gemini: `gemini-extension.json`
- Antigravity: no manifest (detect via `.agents/` directory)
- OpenClaw: `openclaw.plugin.json`

#### 10. bootstrapping.md — Per-platform hook output format

Verify the session-start script's platform branching logic:
- Cursor: outputs `additional_context` (snake_case)
- Claude Code: outputs nested `hookSpecificOutput.additionalContext`
- Codex: same as Claude Code (same JSON protocol)
- Gemini/Antigravity/OpenClaw: verify expected output format

#### 11. inventory.md — Skill discovery paths per platform

Verify the skill discovery globs match researched paths:
- Claude Code / Cursor: `skills/*/SKILL.md`
- Codex: `.agents/skills/*/SKILL.md`
- Antigravity: `.agents/skills/*/SKILL.md` (preferred), `.agent/skills/*/SKILL.md` (legacy)
- Gemini: `skills/*/SKILL.md` (or custom `skillsDir`)
- OpenClaw: `skills/*/SKILL.md`

---

## Files Changed

| File | Action |
|------|--------|
| `lib/rubrics/codex.yaml` | Add MCP conditions if missing |
| `lib/rubrics/gemini-cli.yaml` | Fix hooks_path comment, add subagent conditions if missing |
| `lib/rubrics/cursor.yaml` | Add subagent conditions if missing |
| `lib/rubrics/antigravity.yaml` | Fix workflow conditions if wrong |
| `lib/rubrics/openclaw.yaml` | Expand context file conditions if incomplete |
| `lib/rubrics/rubric-framework.md` | Fix category definitions if incomplete |
| `lib/patterns/hook-merging.md` | Fix Cursor generation format if wrong |
| `lib/patterns/manifest-generation.md` | Fix Codex fields, verify template refs |
| `lib/patterns/detection-algorithm.md` | Fix signal paths if wrong |
| `lib/patterns/bootstrapping.md` | Fix hook output format if wrong |
| `lib/patterns/inventory.md` | Fix skill paths if wrong |
| `docs/reconciliation-matrix.md` | Update all 11 items to Correct or Fixed |

---

## Exclusions

- Template files (Tier 3)
- Install docs (Tier 3)
- SKILL.md pseudocode
- Per-skill sidecar pointer files (issues #11/#12)
- New web research

---

## Success Criteria

- Every "Needs review" item in sections 2 (Rubrics) and 3 (Patterns) of the
  reconciliation matrix is resolved to "Correct", "Fixed", or "Unverifiable"
- Zero "Needs review" cells remain in sections 2 and 3
- All fixes are consistent with `docs/platforms/*.md` research docs
