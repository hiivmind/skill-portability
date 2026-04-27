# Shape & Template Registries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create Uplift Target and Template registries in `lib/references/`, then update all consumer files to use registry lookups instead of inline data.

**Architecture:** Two new registry files (type + data + functions each), then consumer edits in SKILL.md, inventory.md, and manifest-generation.md. Each task is self-contained.

**Tech Stack:** Markdown pseudocode.

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `lib/references/uplift-targets/registry.md` | Create | UpliftTarget type, 3 entries, 2 functions |
| `lib/references/templates/registry.md` | Create | TemplateEntry type, 12 entries, 3 functions |
| `skills/plugin-portability/SKILL.md` | Modify | Phase 0b options, Phase 5 ALLOWED_CATEGORIES, resolve_target_path |
| `lib/patterns/inventory.md` | Modify | Sidecar strategy branching |
| `lib/patterns/manifest-generation.md` | Modify | Schema-to-Template table → registry reference |
| `docs/reconciliation-matrix.md` | Modify | Add items for registries |

---

### Task 1: Create Uplift Target Registry

**Files:**
- Create: `lib/references/uplift-targets/registry.md`

- [ ] **Step 1: Create the directory and registry file**

Create `lib/references/uplift-targets/registry.md` with this exact content:

````markdown
# Uplift Target Registry

Structured data and lookup functions for uplift target behavior.
Each target defines which rubric categories it generates artifacts for
and how tool-mapping sidecars are organized.

---

## Type

```pseudocode
TYPE UpliftTarget = {
  id:                 string,
  description:        string,
  allowed_categories: List[string],
  sidecar_strategy:   "per-skill" | "shared" | "none",
}
```

---

## Data

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

---

## Lookup Functions

```pseudocode
FUNCTION allowed_categories(uplift_target)
  RETURNS list of category IDs this target generates artifacts for.
  RETURN UPLIFT_TARGETS[uplift_target].allowed_categories

FUNCTION sidecar_strategy(uplift_target)
  RETURNS how tool-mapping sidecars are organized for this target.
  RETURN UPLIFT_TARGETS[uplift_target].sidecar_strategy
```
````

- [ ] **Step 2: Verify**

Run: `test -f lib/references/uplift-targets/registry.md && echo OK`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add lib/references/uplift-targets/registry.md
git commit -m "Create Uplift Target Registry with 3 entries and 2 lookup functions"
```

---

### Task 2: Create Template Registry

**Files:**
- Create: `lib/references/templates/registry.md`

- [ ] **Step 1: Create the directory and registry file**

Create `lib/references/templates/registry.md` with this exact content:

````markdown
# Template Registry

Structured data and lookup functions for manifest and context-file templates.
Maps schema names to template paths, target paths, platforms, and rendering modes.

---

## Type

```pseudocode
TYPE TemplateEntry = {
  schema:        string,
  platform:      string,
  mode:          "plain" | "conditional" | "builder",
  template_path: string,
  target_path:   string,
}
```

---

## Data

```pseudocode
TEMPLATE_REGISTRY: List[TemplateEntry] = [
  { schema: "claude-plugin",       platform: "claude-code", mode: "plain",
    template_path: "lib/templates/manifests/claude-plugin/plugin.json.tmpl",
    target_path:   ".claude-plugin/plugin.json" },

  { schema: "claude-marketplace",  platform: "claude-code", mode: "plain",
    template_path: "lib/templates/manifests/claude-plugin/marketplace.json.tmpl",
    target_path:   ".claude-plugin/marketplace.json" },

  { schema: "claude-context",      platform: "claude-code", mode: "plain",
    template_path: "lib/templates/context-files/CLAUDE.md.tmpl",
    target_path:   "CLAUDE.md" },

  { schema: "cursor-plugin",       platform: "cursor",      mode: "conditional",
    template_path: "lib/templates/manifests/cursor-plugin/plugin.json.tmpl",
    target_path:   ".cursor-plugin/plugin.json" },

  { schema: "cursor-marketplace",  platform: "cursor",      mode: "plain",
    template_path: "lib/templates/manifests/cursor-plugin/marketplace.json.tmpl",
    target_path:   ".cursor-plugin/marketplace.json" },

  { schema: "gemini-extension",    platform: "gemini-cli",  mode: "plain",
    template_path: "lib/templates/manifests/gemini-extension.json.tmpl",
    target_path:   "gemini-extension.json" },

  { schema: "gemini-context",      platform: "gemini-cli",  mode: "builder",
    template_path: "lib/templates/context-files/GEMINI.md.tmpl",
    target_path:   "GEMINI.md" },

  { schema: "agents-context",      platform: "all",         mode: "builder",
    template_path: "lib/templates/context-files/AGENTS.md.tmpl",
    target_path:   "AGENTS.md" },

  { schema: "codex-plugin",        platform: "codex",       mode: "plain",
    template_path: "lib/templates/manifests/codex-plugin/plugin.json.tmpl",
    target_path:   ".codex-plugin/plugin.json" },

  { schema: "codex-marketplace",   platform: "codex",       mode: "plain",
    template_path: "lib/templates/manifests/codex-plugin/marketplace.json.tmpl",
    target_path:   ".agents/plugins/marketplace.json" },

  { schema: "antigravity-package", platform: "antigravity",  mode: "plain",
    template_path: "lib/templates/manifests/antigravity/package.json.tmpl",
    target_path:   "package.json" },

  { schema: "openclaw-plugin",     platform: "openclaw",     mode: "plain",
    template_path: "lib/templates/manifests/openclaw/openclaw.plugin.json.tmpl",
    target_path:   "openclaw.plugin.json" },
]
```

---

## Lookup Functions

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
````

- [ ] **Step 2: Verify**

Run: `test -f lib/references/templates/registry.md && echo OK`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add lib/references/templates/registry.md
git commit -m "Create Template Registry with 12 entries and 3 lookup functions"
```

---

### Task 3: Update SKILL.md Phase 0b — derive options from registry

**Files:**
- Modify: `skills/plugin-portability/SKILL.md:142-151`

- [ ] **Step 1: Replace the hardcoded options list**

Find:

```
  # Q3: Build options with "(Recommended)" suffix on derived choice
  options = [
    { label: "Skill-first",          description: "Sidecars, tool mapping, context files only." },
    { label: "Full portable plugin", description: "Manifests, context, hooks, install docs -- everything." },
    { label: "Curated note only",    description: "Documentation only. No generated artifacts." }
  ]
  FOR opt IN options:
    IF opt.label.lower().startswith(recommended.replace("-", " ")):
      opt.label += " (Recommended)"
      options = [opt] + [o for o in options if o != opt]
```

Replace with:

```
  # Q3: Build options from UPLIFT_TARGETS registry
  options = []
  FOR id, target IN UPLIFT_TARGETS:
    options.append({ label: title_case(id), description: target.description })
  FOR opt IN options:
    IF opt.label.lower().startswith(recommended.replace("-", " ")):
      opt.label += " (Recommended)"
      options = [opt] + [o for o in options if o != opt]
```

- [ ] **Step 2: Verify**

Run: `grep -n 'Sidecars, tool mapping, context files only' skills/plugin-portability/SKILL.md`
Expected: no output (description now comes from registry)

- [ ] **Step 3: Commit**

```bash
git add skills/plugin-portability/SKILL.md
git commit -m "Derive Phase 0b uplift options from UPLIFT_TARGETS registry"
```

---

### Task 4: Update SKILL.md Phase 5 — replace ALLOWED_CATEGORIES

**Files:**
- Modify: `skills/plugin-portability/SKILL.md:219-239`

- [ ] **Step 1: Replace the ALLOWED_CATEGORIES block and its lookup**

Find:

```
### Allowed categories by uplift target

```pseudocode
ALLOWED_CATEGORIES = {
  "skill-first":          ["2_skills", "3_context", "5_toolmap", "6_install"],
  "full-portable-plugin": ["1_manifest", "2_skills", "3_context", "4_hooks",
                           "5_toolmap", "6_install", "7_runtime"],
  "curated-note-only":    ["6_install"]
}
```
```

Replace with:

```
### Allowed categories by uplift target

Derived from `lib/references/uplift-targets/registry.md`.
```

- [ ] **Step 2: Replace the ALLOWED_CATEGORIES lookup in Phase 5**

Find:

```
allowed = ALLOWED_CATEGORIES[computed.uplift_target]
```

Replace with:

```
allowed = allowed_categories(computed.uplift_target)
```

- [ ] **Step 3: Verify**

Run: `grep -n 'ALLOWED_CATEGORIES' skills/plugin-portability/SKILL.md`
Expected: no output

Run: `grep -n 'allowed_categories' skills/plugin-portability/SKILL.md`
Expected: one line with the function call

- [ ] **Step 4: Commit**

```bash
git add skills/plugin-portability/SKILL.md
git commit -m "Replace ALLOWED_CATEGORIES with allowed_categories() registry lookup"
```

---

### Task 5: Update SKILL.md Phase 5 — resolve_target_path

**Files:**
- Modify: `skills/plugin-portability/SKILL.md:247`

- [ ] **Step 1: Update resolve_target_path to use template registry**

Find:

```
    target_path = resolve_target_path(condition.template, platform)
```

Replace with:

```
    target_path = template_for_path(condition.template).target_path
```

- [ ] **Step 2: Update external references to include new registries**

Find:

```
> `lib/rubrics/*.yaml` | `lib/references/platform-api.md` | `lib/references/platforms/*.md` | `lib/patterns/manifest-generation.md`
```

Replace with:

```
> `lib/rubrics/*.yaml` | `lib/references/platform-api.md` | `lib/references/platforms/*.md` | `lib/patterns/manifest-generation.md`
> `lib/references/uplift-targets/registry.md` | `lib/references/templates/registry.md`
```

- [ ] **Step 3: Verify**

Run: `grep -n 'resolve_target_path' skills/plugin-portability/SKILL.md`
Expected: no output

Run: `grep -n 'template_for_path' skills/plugin-portability/SKILL.md`
Expected: one line

- [ ] **Step 4: Commit**

```bash
git add skills/plugin-portability/SKILL.md
git commit -m "Use template_for_path() for target path resolution, add registry references"
```

---

### Task 6: Update inventory.md — sidecar strategy branching

**Files:**
- Modify: `lib/patterns/inventory.md:60-68`

- [ ] **Step 1: Replace shape-based branching with strategy-based branching**

Find:

```
  IF computed.shape IN ["bare-skill-repo", "skill-first"]:
    # Bare skills need per-skill spec files — no context file to carry shared refs
    FOR skill IN computed.skills:
      FOR spec_file IN platform_spec_files:
        target = "skills/" + skill.dir + "/references/" + spec_file
        status = IF file_exists(plugin_path + "/" + target) THEN "PRESENT" ELSE "MISSING"
        computed.sidecar_results.append({ skill: skill.dir, file: spec_file, status: status })

  ELIF computed.shape == "full-portable-plugin":
```

Replace with:

```
  IF computed.uplift_target IS NOT null:
    strategy = sidecar_strategy(computed.uplift_target)
  ELSE:
    IF computed.shape IN ["bare-skill-repo"]:
      strategy = "per-skill"
    ELSE:
      strategy = "shared"

  IF strategy == "per-skill":
    # Per-skill spec files — no context file to carry shared refs
    FOR skill IN computed.skills:
      FOR spec_file IN platform_spec_files:
        target = "skills/" + skill.dir + "/references/" + spec_file
        status = IF file_exists(plugin_path + "/" + target) THEN "PRESENT" ELSE "MISSING"
        computed.sidecar_results.append({ skill: skill.dir, file: spec_file, status: status })

  ELIF strategy == "shared":
```

- [ ] **Step 2: Verify**

Run: `grep -n 'sidecar_strategy' lib/patterns/inventory.md`
Expected: one line with the function call

Run: `grep -n '"bare-skill-repo", "skill-first"' lib/patterns/inventory.md`
Expected: no output (old shape list gone)

- [ ] **Step 3: Commit**

```bash
git add lib/patterns/inventory.md
git commit -m "Replace shape-based sidecar branching with sidecar_strategy() lookup"
```

---

### Task 7: Update manifest-generation.md — replace prose table

**Files:**
- Modify: `lib/patterns/manifest-generation.md:64-78`

- [ ] **Step 1: Replace the Schema-to-Template Mapping table**

Find:

```
## Schema-to-Template Mapping

| Schema | Mode | Template file |
|--------|------|---------------|
| claude-plugin | Plain | `lib/templates/manifests/claude-plugin/plugin.json.tmpl` |
| claude-marketplace | Plain | `lib/templates/manifests/claude-plugin/marketplace.json.tmpl` |
| claude-context | Plain | `lib/templates/context-files/CLAUDE.md.tmpl` |
| cursor-plugin | Conditional | `lib/templates/manifests/cursor-plugin/plugin.json.tmpl` |
| cursor-marketplace | Plain | `lib/templates/manifests/cursor-plugin/marketplace.json.tmpl` |
| gemini-extension | Plain | `lib/templates/manifests/gemini-extension.json.tmpl` |
| gemini-context | Builder | `lib/templates/context-files/GEMINI.md.tmpl` |
| agents-context | Builder | `lib/templates/context-files/AGENTS.md.tmpl` |
| codex-plugin | Plain | `lib/templates/manifests/codex-plugin/plugin.json.tmpl` |
| codex-marketplace | Plain | `lib/templates/manifests/codex-plugin/marketplace.json.tmpl` |
```

Replace with:

```
## Schema-to-Template Mapping

Schema-to-template mappings are defined in `lib/references/templates/registry.md`.
Use `template_for_schema(schema)` to look up template path, target path, and
rendering mode for a given schema. Use `template_for_path(template_ref)` to
resolve a rubric `condition.template` value to its registry entry.
```

- [ ] **Step 2: Verify**

Run: `grep -cP '^\| .*(claude-plugin|cursor-plugin|gemini-extension).*\|' lib/patterns/manifest-generation.md`
Expected: `0`

Run: `grep -n 'template_for_schema\|template_for_path' lib/patterns/manifest-generation.md`
Expected: two lines

- [ ] **Step 3: Commit**

```bash
git add lib/patterns/manifest-generation.md
git commit -m "Replace Schema-to-Template prose table with registry reference"
```

---

### Task 8: Final verification and reconciliation matrix

- [ ] **Step 1: Run all verification commands**

```bash
echo "=== 1. uplift-targets registry ===" && test -f lib/references/uplift-targets/registry.md && echo OK
echo "=== 2. templates registry ===" && test -f lib/references/templates/registry.md && echo OK
echo "=== 3. No ALLOWED_CATEGORIES ===" && grep -n 'ALLOWED_CATEGORIES' skills/plugin-portability/SKILL.md
echo "=== 4. Registry lookups in SKILL.md ===" && grep -n 'allowed_categories\|sidecar_strategy\|template_for_path' skills/plugin-portability/SKILL.md
echo "=== 5. No prose table ===" && grep -cP '^\| .*(claude-plugin|cursor-plugin|gemini-extension).*\|' lib/patterns/manifest-generation.md
echo "=== 6. Registry refs in manifest-generation ===" && grep -n 'template_for_schema\|template_for_path' lib/patterns/manifest-generation.md
echo "=== 7. Template count ===" && grep -c 'schema:' lib/references/templates/registry.md
echo "=== DONE ==="
```

Expected: checks 1-2 print OK, check 3 returns nothing, check 4 shows lookup calls, check 5 returns 0, check 6 shows references, check 7 returns 12.

- [ ] **Step 2: Add reconciliation matrix items**

In `docs/reconciliation-matrix.md`, find:

```
### Verification status

All tiers, platform API restructure, rubric check alignment, and pattern deduplication: complete, zero gaps.
```

Replace with:

```
### Shape & Template Registries

50. ~~**SKILL.md Phase 0b**: Hardcoded uplift option labels/descriptions~~ Fixed — derived from UPLIFT_TARGETS registry
51. ~~**SKILL.md Phase 5**: Inline ALLOWED_CATEGORIES dict~~ Fixed — replaced with allowed_categories() lookup
52. ~~**SKILL.md Phase 5**: resolve_target_path re-derives target paths~~ Fixed — uses template_for_path().target_path
53. ~~**inventory.md**: Shape-based sidecar branching~~ Fixed — uses sidecar_strategy() lookup
54. ~~**manifest-generation.md**: 10-row Schema-to-Template prose table~~ Fixed — references lib/references/templates/registry.md

### Verification status

All tiers, platform API restructure, rubric check alignment, pattern deduplication, and shape/template registries: complete, zero gaps.
```

- [ ] **Step 3: Commit**

```bash
git add docs/reconciliation-matrix.md
git commit -m "Mark shape and template registry items 50-54 as fixed in reconciliation matrix"
```
