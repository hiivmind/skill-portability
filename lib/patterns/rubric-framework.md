# Rubric Framework

Shared scoring model for plugin portability assessment. Used by `assessing-plugin-portability`.
Per-platform scoring rules are in `platforms/<platform>.md`.

---

## Scoring Scale

Every category on every platform uses this scale:

| Score | Meaning |
|-------|---------|
| 0 | Missing — no artifact or capability present |
| 1 | Partial — exists but fragile, incomplete, or tightly coupled to one platform |
| 2 | Usable — works but has gaps (missing fields, incomplete coverage) |
| 3 | Strong — fully portable, complete, correctly structured |

---

## Categories

Seven categories, applied per-platform, each scored 0-3:

| # | Category | What it measures |
|---|----------|-----------------|
| 1 | Manifest packaging | Platform manifest present, correct schema, complete fields |
| 2 | Skill compatibility | Skills discoverable, frontmatter correct, no unresolved tool assumptions |
| 3 | Context delivery | Platform context file present, accurate, includes all skills |
| 4 | Hook portability | Hooks adapted to platform format, correct event names, cross-platform scripts |
| 5 | Tool mapping | Per-skill sidecar present, tool name translation documented |
| 6 | Install readiness | Install docs exist, match actual structure, include verification steps |
| 7 | Runtime adapters | MCP, agents, commands adapted or documented for the platform |

---

## Bands

Per-platform total out of 21:

| Band | Score | Interpretation |
|------|-------|----------------|
| Strong | 18-21 | Platform fully supported |
| Viable | 13-17 | Moderate gaps, straightforward to complete |
| Partial | 8-12 | Significant work needed |
| Weak | 0-7 | Minimal or no support for this platform |

```pseudocode
FUNCTION CLASSIFY_BAND(total):
  IF total >= 18: RETURN "strong"
  ELIF total >= 13: RETURN "viable"
  ELIF total >= 8: RETURN "partial"
  ELSE: RETURN "weak"
```

---

## Blocker Severity

Blockers override raw scores. A repo with a decent score may still have one critical structural problem.

| Level | Meaning |
|-------|---------|
| Critical | Uplift cannot proceed safely without resolving first |
| Major | Uplift can proceed but output will be partial or fragile |
| Minor | Uplift can proceed normally |

---

## Blocker Detection Rules

| Blocker | Severity | Detection |
| ------- | -------- | --------- |
| No trustworthy metadata source | Critical | All metadata fields from hard fallbacks only |
| Unresolved tool assumptions | Major | Skill references platform-specific tools with no sidecar in `references/` |
| Hook env hard-coding | Major | Hook scripts reference `CLAUDE_PLUGIN_ROOT` or similar without env branching |
| Docs/structure mismatch | Major | Install docs in README describe paths that don't exist in repo |
| Whole-repo assumption | Minor | Repo requires whole-repo install but only documents single-skill copying |
| Missing subagent translation | Minor | Skills dispatch via `Task`/`Agent` but no codex-tools or copilot-tools sidecar |
| Gemini import gaps | Minor | `GEMINI.md` exists but missing `@` includes for some skills |

---

## Report Format

The assessment report must include all of these sections. If any are missing, the assessment is incomplete.

1. Repo shape classification
2. Canonical metadata source with extracted fields
3. Per-platform scores (7 categories each)
4. Blockers with severity
5. Uplift recommendation (skill-first, full-portable-plugin, hybrid, or curated-note-only)
6. Codex-specific recommendation (native-skill-discovery, native-plugin-packaging, or curated-package-note)
7. Required uplift artifacts list
8. Session-start injection status
