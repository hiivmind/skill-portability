# Rubric Framework

Shared scoring model for plugin portability assessment. Used by `assessing-plugin-portability`.
Per-platform conditions are in `platforms/<platform>.yaml`.
Lookup tables are in `lib/references/platform-mappings.md`.

---

## Condition Structure

Each condition in a platform rubric YAML file:

```yaml
- id: {platform}.{category_num}_{category_short}.{component}.{check_name}
  type: checkable | judgement
  component: {component_tag}
  critical: true | false
  points: 1
  check: |
    pseudocode (checkable) or prose description (judgement)
  template: optional — path to template that fixes this condition
```

### Condition ID Format

```
{platform}.{category_num}_{category_short}.{component}.{check_name}
```

Examples:
```
cursor.1_manifest.plugin_json.required_fields
gemini.5_toolmap.sidecar.task_to_at_agent
codex.2_skills.frontmatter.spawn_agent_documented
```

### Condition Types

| Type | Meaning | Evaluation |
|------|---------|------------|
| `checkable` | Deterministic — file exists, field matches table, pattern present | LLM generates a read-only script from pseudocode, executes it, records pass/fail from exit code |
| `judgement` | Requires interpretation — content quality, documentation adequacy | LLM reads referenced files, applies its interpretation, records pass/fail with reasoning |

### Condition Fields

| Field | Required | Purpose |
|-------|----------|---------|
| `id` | yes | Stable identifier. Referenced by assessment AND uplift (`# fixes:` annotations) |
| `type` | yes | `checkable` or `judgement` |
| `component` | yes | Tag for filtering by component type within a category |
| `critical` | yes | If `true`, gates score levels (must pass for Score 2+) |
| `points` | yes | Weight within category (typically 1) |
| `check` | yes | Pseudocode block (checkable) or prose description (judgement) |
| `template` | no | Path to template in `lib/templates/` that resolves this condition |

---

## Scoring Scale

Seven categories per platform, each scored 0-3.

### Category List

| # | Category | What it measures | Component Tags |
|---|----------|-----------------|---------------|
| 1 | Manifest Packaging | Platform manifest present, correct schema, complete fields | `plugin_json`, `marketplace_json`, `extension_json`, `package_json`, `openclaw_json` |
| 2 | Skill Compatibility | Skills discoverable, frontmatter correct, no unresolved tool assumptions | `frontmatter`, `discovery`, `tool_refs` |
| 3 | Context Delivery | Platform context file present, accurate, includes all skills | `claude_md`, `agents_md`, `gemini_md`, `rules_mdc` |
| 4 | Hook Portability | Hooks adapted to platform format, correct event names, cross-platform scripts | `hooks_json`, `scripts`, `event_names`, `output_format` |
| 5 | Tool Mapping | Sidecars, tool name translation, subagent communication | `sidecar`, `model_mapping`, `subagent_syntax` |
| 6 | Install Readiness | Install docs exist, match actual structure, include verification steps | `install_docs`, `publishing`, `verification` |
| 7 | Runtime Adapters | MCP, agents, commands, rules, policies, marketplace | `mcp`, `agents`, `commands`, `rules`, `policies`, `subagents` |

### Scoring Formula

Per category, per platform:

```pseudocode
critical_count  = number of conditions where critical == true
optional_count  = number of conditions where critical == false
critical_pass   = number of critical conditions that pass
optional_pass   = number of optional conditions that pass

# Guard: every scored category MUST have at least 1 critical condition.
# If a category has 0 critical conditions, it scores N/A (see below).

IF critical_pass == critical_count:
  IF optional_count == 0 OR optional_pass / optional_count >= 0.75:
    score = 3
  ELSE:
    score = 2
ELIF critical_pass / critical_count >= 0.50:
  score = 1
ELSE:
  score = 0
```

**Edge cases:**
- Category with 0 critical conditions → N/A (prevents vacuous truth inflation)
- Category with 0 total conditions → N/A
- `optional_count == 0` and all critical pass → Score 3
- `critical_count == 1` → binary: Score 2+ (passes) or Score 0 (fails)

---

## Bands

```pseudocode
scored_categories = [c for c in categories if c.score != N/A]
scored_count      = len(scored_categories)
actual_score      = sum(c.score for c in scored_categories)
max_score         = scored_count * 3
percentage        = actual_score / max_score

IF scored_count < 3:
  band = min(band, "partial")  # Cap: too few categories to claim Strong/Viable

IF percentage >= 0.85: band = "strong"
ELIF percentage >= 0.60: band = "viable"
ELIF percentage >= 0.35: band = "partial"
ELSE: band = "weak"
```

| Band | Percentage | Interpretation |
|------|-----------|----------------|
| Strong | >= 85% | Platform fully supported |
| Viable | >= 60% | Moderate gaps, straightforward to complete |
| Partial | >= 35% | Significant work needed |
| Weak | < 35% | Minimal or no support |

---

## Blocker Detection

Blockers override raw scores. A repo with a decent score may still have one critical structural problem.

| Blocker | Severity | Detection |
|---------|----------|-----------|
| No trustworthy metadata source | Critical | All metadata fields from hard fallbacks only |
| Unresolved tool assumptions | Major | Skill references platform-specific tools with no sidecar in `references/` |
| Hook env hard-coding | Major | Hook scripts reference `CLAUDE_PLUGIN_ROOT` without env branching |
| Docs/structure mismatch | Major | Install docs describe paths that don't exist in repo |
| Whole-repo assumption | Minor | Repo requires whole-repo install but only documents single-skill copying |
| Missing subagent translation | Minor | Skills dispatch via `Task`/`Agent` but no codex-tools or gemini-tools sidecar |
| Gemini import gaps | Minor | `GEMINI.md` exists but missing `@` includes for some skills |

---

## JIT Code Generation

When evaluating checkable conditions, the LLM may generate a read-only script
from the condition's pseudocode and execute it, rather than manually interpreting
each check. The pseudocode operations (`read_json`, `file_exists`,
`parse_frontmatter`, `glob`) map to read-only filesystem queries.

This skill is used by plugin authors on their own repos. JIT scripts are
read-only checks — they do not modify files or access paths outside the
plugin root.

---

## Report Format

The assessment report must include all of these sections:

1. Repo shape classification
2. Canonical metadata source with extracted fields
3. Per-platform scores (7 categories each, with individual condition pass/fail)
4. Blockers with severity
5. Uplift recommendation (skill-first, full-portable-plugin, or curated-note-only)
6. Codex-specific recommendation (native-skill-discovery or native-plugin-packaging)
7. Required uplift artifacts list (mapped to condition IDs)
8. Session-start injection status

---

## Uplift Linkage

### `# fixes:` Annotations

Every uplift action (template rendering, hook porting, sidecar creation) carries
a `# fixes:` annotation linking it to the condition IDs it resolves.

### Drift Detection

```pseudocode
rubric_ids  = collect all condition IDs from lib/patterns/platforms/*.yaml
uplift_ids  = collect all "fixes:" references from skills/uplifting-a-plugin/
template_ids = collect all "fixes:" references from lib/templates/

orphan_conditions = rubric_ids - (uplift_ids | template_ids)
phantom_fixes     = (uplift_ids | template_ids) - rubric_ids
```

### Incremental Uplift

When assessment shows a platform already VIABLE (>= 60%), uplift only fixes
failing conditions instead of regenerating all artifacts.
