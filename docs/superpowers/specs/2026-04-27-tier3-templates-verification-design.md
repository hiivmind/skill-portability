# Tier 3: Templates & Install Docs Verification — Design Spec

**Goal:** Verify every "Needs review" and "Missing" item in section 4
(Templates) and the remaining item in section 5 (Skill Logic) of the
reconciliation matrix. Fix discrepancies. Clear all "Needs review" from
the entire matrix.

**Context:** Final verification tier. Tiers 1 and 2 locked down references,
rubrics, and patterns. Tier 3 verifies the output artifacts (templates and
install docs) that those patterns generate.

**Method:** Same as Tiers 1 and 2 — compare against `docs/platforms/*.md`,
fix in place, update matrix.

---

## Verification Items (~30 total)

### Manifest templates (6 items) — all Correct

Each template verified against its platform research doc:

| Template | Required fields | Template has | Verdict |
|----------|----------------|-------------|---------|
| `gemini-extension.json.tmpl` | name, version, description, contextFileName | All present | Correct |
| `codex-plugin/plugin.json.tmpl` | name, version, description | All present + skills, hooks | Correct |
| `openclaw/openclaw.plugin.json.tmpl` | id, configSchema | All present + name, description, version, skills | Correct |
| `antigravity/package.json.tmpl` | name, displayName, version, description, publisher | All present | Correct |
| `claude-plugin/plugin.json.tmpl` | name, description, version | All present + author, homepage, etc. | Correct |
| `cursor-plugin/plugin.json.tmpl` | name, description, version | All present + paths for conditional removal | Correct |

Note: Gemini optional fields (hooksDir, skillsDir, settings, mcpServers) are
handled by the manifest-generation pattern (verified in Tier 2), not the base
template. Template is intentionally minimal.

### Hook templates (2 items) — 1 fix, 1 not needed

| Template | Issue | Action |
|----------|-------|--------|
| `hooks-cursor.json.tmpl` | Missing `"version": 1` | **Fix** — add version field |
| Gemini hooks template | Doesn't exist | **Not needed** — Gemini hooks are settings-based, no file to generate |

The Cursor hooks template currently has `{ "hooks": {} }` but research
(`docs/platforms/cursor.md` line 353) shows Cursor hooks.json requires
`"version": 1` at root. The hook-merging pseudocode already generates
this field, but the empty skeleton template doesn't include it.

### Context file templates (3 items) — all Correct/Not needed

| Template | Verdict | Details |
|----------|---------|---------|
| `GEMINI.md.tmpl` | Correct | `@` includes rendered by builder (Mode 3) |
| `AGENTS.md.tmpl` | Correct | Universal fallback with tool mapping table |
| OpenClaw context templates | Not needed | SOUL.md, TOOLS.md etc. are user workspace files at `~/.openclaw/workspace/`, not plugin output |

### Install docs (18 items) — all Correct

All commands and paths verified against platform research docs:

- **claude-code.md**: `claude plugin install`, `claude --plugin-dir`, `claude plugin list` — correct
- **cursor.md**: `/add-plugin`, `~/.cursor/plugins/local/`, restart required — correct
- **gemini-cli.md**: `gemini extensions install`, `gemini extensions list` — correct
- **codex.md**: `codex marketplace add`, symlink to `~/.agents/skills/`, feature flags — correct
- **antigravity.md**: Copy to `.agents/skills/` or `~/.gemini/antigravity/skills/`, `--install-extension` — correct
- **openclaw.md**: `openclaw plugins install`, npm alternative, bundle detection — correct
- **adding-platform/* (6)**: Local dev paths match main docs — correct
- **publishing/* (6)**: Marketplace/registry info matches research — correct

### Skill logic (1 item) — Correct

Phase 5 ALLOWED_CATEGORIES uses: `1_manifest`, `2_skills`, `3_context`,
`4_hooks`, `5_toolmap`, `6_install`, `7_runtime`. These match the 7
categories in `lib/rubrics/rubric-framework.md` (verified Tier 2).

---

## Files Changed

| File | Action |
|------|--------|
| `lib/templates/hooks/hooks-cursor.json.tmpl` | Add `"version": 1` |
| `docs/reconciliation-matrix.md` | Update all ~30 items, add Tier 3 summary |

---

## Success Criteria

- Zero "Needs review" or "Missing" items remain in the entire matrix
- All sections (1-6) fully resolved
