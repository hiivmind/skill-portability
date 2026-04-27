# Shape & Template Registries

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create two new structured registries — Uplift Targets and Templates — following the same pattern as the Platform API, to eliminate scattered inline data and enable deterministic lookups.

**Architecture:** Each registry gets its own directory under `lib/references/` with a `registry.md` file containing the type definition, data entries, and lookup functions. Consumer files replace inline data with registry lookups.

**Tech Stack:** Markdown pseudocode.

---

## File Structure

```
lib/references/
  platform-api.md                    # existing
  platforms/                         # existing
  uplift-targets/
    registry.md                      # NEW: UpliftTarget type + data + functions
  templates/
    registry.md                      # NEW: TemplateEntry type + data + functions
```

---

## Part 1: Uplift Target Registry

### New file: `lib/references/uplift-targets/registry.md`

Contains the type, 3 data entries, and 2 lookup functions.

#### Type

```pseudocode
TYPE UpliftTarget = {
  id:                 string,
  description:        string,
  allowed_categories: List[string],
  sidecar_strategy:   "per-skill" | "shared" | "none",
}
```

#### Data

```pseudocode
UPLIFT_TARGETS: Dict[string, UpliftTarget] = {
  "skill-first": {
    id: "skill-first",
    description: "Sidecars, tool mapping, context files only.",
    allowed_categories: ["2_skills", "3_context", "5_toolmap", "6_install"],
    sidecar_strategy: "per-skill",
  },
  "full-portable-plugin": {
    id: "full-portable-plugin",
    description: "Manifests, context, hooks, install docs — everything.",
    allowed_categories: ["1_manifest", "2_skills", "3_context", "4_hooks",
                         "5_toolmap", "6_install", "7_runtime"],
    sidecar_strategy: "shared",
  },
  "curated-note-only": {
    id: "curated-note-only",
    description: "Documentation only. No generated artifacts.",
    allowed_categories: ["6_install"],
    sidecar_strategy: "none",
  },
}
```

#### Functions

```pseudocode
FUNCTION allowed_categories(uplift_target)
  RETURNS list of category IDs this target generates artifacts for.
  RETURN UPLIFT_TARGETS[uplift_target].allowed_categories

FUNCTION sidecar_strategy(uplift_target)
  RETURNS how tool-mapping sidecars are organized for this target.
  RETURN UPLIFT_TARGETS[uplift_target].sidecar_strategy
```

### Consumer changes

**1. SKILL.md Phase 0b (lines 143-158) — Option list**

Current: Inline list of 3 options with hardcoded labels and descriptions.

Replace option construction with:

```pseudocode
  options = []
  FOR id, target IN UPLIFT_TARGETS:
    options.append({ label: title_case(id), description: target.description })
```

The `(Recommended)` suffix logic and reordering stays — it uses `recommended`
which is derived from the shape classification (3-line IF/ELIF/ELSE, unchanged).

**2. SKILL.md Phase 5 (lines 222-228) — ALLOWED_CATEGORIES**

Current:

```pseudocode
ALLOWED_CATEGORIES = {
  "skill-first":          ["2_skills", "3_context", "5_toolmap", "6_install"],
  "full-portable-plugin": ["1_manifest", "2_skills", "3_context", "4_hooks",
                           "5_toolmap", "6_install", "7_runtime"],
  "curated-note-only":    ["6_install"]
}
```

Replace with:

```pseudocode
allowed = allowed_categories(computed.uplift_target)
```

Line 239 (`allowed = ALLOWED_CATEGORIES[computed.uplift_target]`) becomes
redundant and is removed.

**3. SKILL.md Phase 5 skip checks (lines 262, 266)**

Current:

```
Skipped if `"4_hooks" NOT IN allowed`.
Always runs (`"6_install"` is in all allowed sets).
```

These are prose comments referencing `allowed` — they stay as-is since `allowed`
is still the variable name.

**4. inventory.md (lines 60, 68) — Sidecar strategy branching**

Current:

```pseudocode
  IF computed.shape IN ["bare-skill-repo", "skill-first"]:
    # per-skill sidecars
  ELIF computed.shape == "full-portable-plugin":
    # shared sidecars
```

This check currently uses `computed.shape` (detected shape), but it should
use the uplift target's sidecar_strategy. After Phase 0b sets
`computed.uplift_target`, inventory can use:

```pseudocode
  strategy = sidecar_strategy(computed.uplift_target)
  IF strategy == "per-skill":
    # per-skill sidecars
  ELIF strategy == "shared":
    # shared sidecars
```

**Note:** In assess-only mode (no uplift target selected), inventory still runs.
The sidecar check needs a default. Derive it from shape:

```pseudocode
  IF computed.uplift_target IS NOT null:
    strategy = sidecar_strategy(computed.uplift_target)
  ELSE:
    # Assess mode: infer from shape
    IF computed.shape IN ["bare-skill-repo"]:
      strategy = "per-skill"
    ELSE:
      strategy = "shared"
```

---

## Part 2: Template Registry

### New file: `lib/references/templates/registry.md`

Contains the type, 12 data entries, and 3 lookup functions.

#### Type

```pseudocode
TYPE TemplateEntry = {
  schema:        string,
  platform:      string,
  mode:          "plain" | "conditional" | "builder",
  template_path: string,
  target_path:   string,
}
```

#### Data

```pseudocode
TEMPLATE_REGISTRY: List[TemplateEntry] = [
  { schema: "claude-plugin",      platform: "claude-code", mode: "plain",
    template_path: "lib/templates/manifests/claude-plugin/plugin.json.tmpl",
    target_path:   ".claude-plugin/plugin.json" },

  { schema: "claude-marketplace", platform: "claude-code", mode: "plain",
    template_path: "lib/templates/manifests/claude-plugin/marketplace.json.tmpl",
    target_path:   ".claude-plugin/marketplace.json" },

  { schema: "claude-context",     platform: "claude-code", mode: "plain",
    template_path: "lib/templates/context-files/CLAUDE.md.tmpl",
    target_path:   "CLAUDE.md" },

  { schema: "cursor-plugin",      platform: "cursor",      mode: "conditional",
    template_path: "lib/templates/manifests/cursor-plugin/plugin.json.tmpl",
    target_path:   ".cursor-plugin/plugin.json" },

  { schema: "cursor-marketplace", platform: "cursor",      mode: "plain",
    template_path: "lib/templates/manifests/cursor-plugin/marketplace.json.tmpl",
    target_path:   ".cursor-plugin/marketplace.json" },

  { schema: "gemini-extension",   platform: "gemini-cli",  mode: "plain",
    template_path: "lib/templates/manifests/gemini-extension.json.tmpl",
    target_path:   "gemini-extension.json" },

  { schema: "gemini-context",     platform: "gemini-cli",  mode: "builder",
    template_path: "lib/templates/context-files/GEMINI.md.tmpl",
    target_path:   "GEMINI.md" },

  { schema: "agents-context",     platform: "all",         mode: "builder",
    template_path: "lib/templates/context-files/AGENTS.md.tmpl",
    target_path:   "AGENTS.md" },

  { schema: "codex-plugin",       platform: "codex",       mode: "plain",
    template_path: "lib/templates/manifests/codex-plugin/plugin.json.tmpl",
    target_path:   ".codex-plugin/plugin.json" },

  { schema: "codex-marketplace",  platform: "codex",       mode: "plain",
    template_path: "lib/templates/manifests/codex-plugin/marketplace.json.tmpl",
    target_path:   ".agents/plugins/marketplace.json" },

  { schema: "antigravity-package", platform: "antigravity", mode: "plain",
    template_path: "lib/templates/manifests/antigravity/package.json.tmpl",
    target_path:   "package.json" },

  { schema: "openclaw-plugin",    platform: "openclaw",    mode: "plain",
    template_path: "lib/templates/manifests/openclaw/openclaw.plugin.json.tmpl",
    target_path:   "openclaw.plugin.json" },
]
```

#### Functions

```pseudocode
FUNCTION template_for_schema(schema)
  RETURNS the TemplateEntry for a given schema name.
  FOR entry IN TEMPLATE_REGISTRY:
    IF entry.schema == schema: RETURN entry

FUNCTION template_for_path(template_ref)
  RETURNS the TemplateEntry matching a rubric template reference.
  Strips "?merge" suffix and prepends "lib/templates/" if needed.
  normalized = strip_suffix(template_ref, "?merge")
  full_path = "lib/templates/" + normalized
  FOR entry IN TEMPLATE_REGISTRY:
    IF entry.template_path == full_path: RETURN entry

FUNCTION templates_for_platform(platform)
  RETURNS all TemplateEntries for a given platform.
  FOR entry IN TEMPLATE_REGISTRY:
    IF entry.platform == platform OR entry.platform == "all":
      INCLUDE entry
```

**Note on rubric contract:** Rubric conditions carry `condition.template` values
like `manifests/gemini-extension.json.tmpl?merge` — a path relative to
`lib/templates/` with an optional `?merge` action suffix. `template_for_path()`
bridges this contract to the registry by normalizing the reference.

### Consumer changes

**1. manifest-generation.md — Schema-to-Template Mapping table (lines 64-78)**

Current prose table:

```
| Schema | Mode | Template file |
|--------|------|---------------|
| claude-plugin | Plain | `lib/templates/manifests/claude-plugin/plugin.json.tmpl` |
[... 9 more rows ...]
```

Replace with a reference:

```
Schema-to-template mappings are defined in `lib/references/templates/registry.md`.
Use `template_for_schema(schema)` to look up template path, target path, and
rendering mode for a given schema.
```

The per-schema prose sections (claude-plugin, cursor-plugin, etc.) stay — they
document conditional logic, field notes, and rendering details that don't belong
in the registry.

**2. manifest-generation.md — Rendering mode dispatch**

The `RENDER_WITH_CONDITIONALS` and `RENDER_WITH_BUILDER` functions stay as-is.
The dispatch logic can use `template_for_schema(schema).mode` to select which
renderer to call.

**3. SKILL.md Phase 5 — resolve_target_path**

`resolve_target_path(condition.template, platform)` can use
`template_for_path(condition.template).target_path` from the registry instead
of re-deriving the target path. The `?merge` suffix is stripped by the lookup.

---

## What Does NOT Change

- **detection-algorithm.md** — `CLASSIFY_SHAPE` is algorithm logic, not lookup data
- **Shape→target recommendation** in SKILL.md Phase 0b — 3-line IF/ELIF/ELSE stays inline
- **Rendering mode implementations** — `RENDER_WITH_CONDITIONALS`, `RENDER_WITH_BUILDER` are algorithms
- **Per-schema documentation sections** in manifest-generation.md — field notes, conditional logic docs
- **platform-api.md** — No changes; uplift targets and templates are separate concepts

---

## Verification

After all edits:

1. `test -f lib/references/uplift-targets/registry.md && echo OK` — registry exists
2. `test -f lib/references/templates/registry.md && echo OK` — registry exists
3. `grep -n 'ALLOWED_CATEGORIES' skills/plugin-portability/SKILL.md` returns 0 — replaced with `allowed_categories()`
4. `grep -n 'allowed_categories\|sidecar_strategy' skills/plugin-portability/SKILL.md` shows lookup calls
5. `grep -cP '^\| .*(claude-plugin|cursor-plugin|gemini-extension).*\|' lib/patterns/manifest-generation.md` returns 0 — prose table replaced with registry reference
6. `grep -n 'template_for_schema\|template_for_path\|templates_for_platform' lib/patterns/manifest-generation.md` shows lookup calls
7. Template registry has 12 entries — one per `.tmpl` file in `lib/templates/manifests/` + 2 context-file entries
8. Every non-null `template:` value in `lib/rubrics/*.yaml` resolves via `template_for_path()`
