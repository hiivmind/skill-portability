# Skill Restructuring: bp-assess Pattern Adoption

**Date:** 2026-04-23
**Status:** Approved
**Scope:** Restructure `uplifting-a-plugin` and `auditing-plugin-portability` skills to follow the bp-assess exemplar pattern

## Problem

Both skills use flat step numbering, inline templates (~350 lines of sidecar content), prose logic descriptions, and duplicated detection algorithm. The result is an 866-line uplifting skill that is hard to navigate and maintain.

## Exemplar

`/home/nathanielramm/git/hiivmind/hiivmind-blueprint/skills/bp-assess/SKILL.md` demonstrates:
- Numeric hierarchical headings: `Phase N` → `Step N.M`
- Externalised references in `patterns/` directories
- Pseudocode blocks instead of prose logic
- Rich frontmatter with `allowed-tools`, `inputs`, `outputs`
- Reference documentation and state flow sections

## Solution

Restructure both skills to match the bp-assess pattern. Extract shared content to `lib/`. Convert prose to pseudocode. No functional changes.

---

## Directory Structure

```
skill-portability/
  lib/
    references/
      copilot-tools.md
      codex-tools.md
      gemini-tools.md
    templates/
      hooks/
        session-start.sh
        run-hook.cmd
    patterns/
      detection-algorithm.md
  skills/
    uplifting-a-plugin/
      SKILL.md
      patterns/
        manifest-generation.md
        hook-merging.md
        bootstrapping.md
    auditing-plugin-portability/
      SKILL.md
      patterns/
        injection-checks.md
```

---

## Uplifting Skill: Phase Hierarchy

### Frontmatter

```yaml
---
name: uplifting-a-plugin
description: >
  Add multi-platform portability to any plugin. Accepts any starting state —
  Claude, Cursor, Gemini, OpenCode, npx skills, or bare SKILL.md files. Detects
  what exists, infers canonical metadata, emits every missing platform artifact.
  Optionally generates session-start bootstrapping hooks.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
inputs:
  - name: plugin_path
    type: string
    required: true
    description: Path to the plugin root directory
outputs:
  - name: report
    type: object
    description: Summary of created, skipped, and flagged files
---
```

### Phase Mapping

| Phase | Current Steps | New Hierarchy | Description |
|-------|---------------|---------------|-------------|
| **Phase 1: Detect** | D1-D4, Step 1 | 1.1-1.4 | Scan metadata, score, elect canonical, print summary |
| **Phase 2: Inventory** | Steps 2-3 | 2.1-2.2 | Inventory assets, check conflicts |
| **Phase 3: Generate** | Steps 4-15 | 3.1-3.8 | Write manifests, context files, sidecars |
| **Phase 4: Bootstrap** | Steps 17-24 | 4.1-4.7 | Opt-in session-start injection |
| **Phase 5: Report** | Step 25 | 5.1 | Final summary |

### Phase 1: Detect

References `lib/patterns/detection-algorithm.md` for the full D1-D4 algorithm. SKILL.md contains:

```pseudocode
DETECT(plugin_path):
  # See lib/patterns/detection-algorithm.md for full algorithm
  computed.sources = scan_metadata_sources(plugin_path)        # D1
  IF len(computed.sources) == 0:
    DISPLAY "No recognisable plugin signals found in {plugin_path}."
    EXIT

  computed.canonical = elect_canonical(computed.sources)        # D2
  computed.metadata = build_metadata_model(computed.sources)    # D3
  print_inference_summary(computed.metadata)                    # D4
```

### Phase 2: Inventory

```pseudocode
INVENTORY(plugin_path, computed):
  computed.skills = Glob(plugin_path + "/skills/*/SKILL.md")
  computed.commands = Glob(plugin_path + "/commands/*.md")
  computed.agents = Glob(plugin_path + "/agents/*.md")
  computed.existing_hooks = read_json_if_exists(plugin_path + "/hooks/hooks.json")

  computed.created = []
  computed.skipped = []
  computed.flagged = []
```

### Phase 3: Generate

Table-driven manifest generation. Schemas documented in `patterns/manifest-generation.md`:

```pseudocode
GENERATE_MANIFESTS(computed):
  manifests = [
    { target: ".claude-plugin/plugin.json",      schema: "claude-plugin"      },
    { target: ".claude-plugin/marketplace.json",  schema: "claude-marketplace" },
    { target: "CLAUDE.md",                        schema: "claude-context"     },
    { target: ".cursor-plugin/plugin.json",       schema: "cursor-plugin"      },
    { target: "gemini-extension.json",            schema: "gemini-extension"   },
    { target: "GEMINI.md",                        schema: "gemini-context"     },
    { target: "AGENTS.md",                        schema: "agents-context"     },
    { target: "package.json",                     schema: "opencode-package"   },
    { target: ".opencode/plugins/{{name}}.js",    schema: "opencode-shim"      },
  ]

  FOR manifest IN manifests:
    resolved = substitute(manifest.target, computed.metadata)
    IF file_exists(resolved):
      computed.skipped.append(resolved)
      CONTINUE
    content = render_schema(manifest.schema, computed.metadata)
    Write(resolved, content)
    computed.created.append(resolved)

GENERATE_SIDECARS(computed):
  platforms = ["copilot-tools.md", "codex-tools.md", "gemini-tools.md"]
  FOR skill IN computed.skills:
    FOR platform IN platforms:
      target = "skills/" + skill.name + "/references/" + platform
      IF NOT file_exists(target):
        source = Read("lib/references/" + platform)
        Write(target, source)
        computed.created.append(target)

VALIDATE_FRONTMATTER(computed):
  FOR skill IN computed.skills:
    frontmatter = parse_yaml_frontmatter(skill.content)
    IF NOT frontmatter.name OR NOT frontmatter.description:
      computed.flagged.append(skill.path + " — missing frontmatter")

PORT_HOOKS(computed):
  # See patterns/hook-merging.md for event mapping and merge logic
  IF computed.existing_hooks:
    generate_cursor_hooks(computed.existing_hooks)
```

### Phase 4: Bootstrap

Opt-in. Logic documented in `patterns/bootstrapping.md`:

```pseudocode
BOOTSTRAP(computed):
  IF file_exists("skills/using-" + computed.metadata.name + "/SKILL.md"):
    computed.bootstrap_status = "already-configured"
    RETURN

  response = ASK "Generate session-start bootstrapping hooks? (y/n)"
  IF response == "no":
    computed.bootstrap_status = "declined"
    RETURN

  # See patterns/bootstrapping.md for full generation logic
  generate_using_skill(computed)                    # 4.1
  generate_using_sidecars(computed)                 # 4.2
  generate_session_start(computed)                  # 4.3 — from lib/templates/hooks/
  generate_run_hook_cmd(computed)                   # 4.4 — from lib/templates/hooks/
  merge_session_start_hooks(computed)               # 4.5 — see patterns/hook-merging.md
  enhance_opencode_plugin(computed)                 # 4.6
  update_gemini_md(computed)                        # 4.7
  computed.bootstrap_status = "configured"
```

### Phase 5: Report

```pseudocode
REPORT(computed):
  DISPLAY "# Uplift Report: {computed.metadata.name} v{computed.metadata.version}"
  DISPLAY "Metadata inferred from: {computed.canonical.source}"
  DISPLAY ""
  DISPLAY "## Created"
  FOR path IN computed.created:
    DISPLAY "  " + path
  DISPLAY ""
  DISPLAY "## Skipped (already exists)"
  FOR path IN computed.skipped:
    DISPLAY "  " + path
  DISPLAY ""
  DISPLAY "## Needs manual review"
  FOR item IN computed.flagged:
    DISPLAY "  " + item
  DISPLAY ""
  DISPLAY "## Session-start bootstrapping"
  DISPLAY "  Status: " + computed.bootstrap_status
```

---

## Auditing Skill: Phase Hierarchy

### Frontmatter

```yaml
---
name: auditing-plugin-portability
description: >
  Check a plugin for multi-platform portability gaps without making changes.
  Accepts any starting state. Reports PRESENT or MISSING for every platform
  artifact including session-start bootstrapping infrastructure.
allowed-tools: Read, Glob, Grep
inputs:
  - name: plugin_path
    type: string
    required: true
    description: Path to the plugin root directory
outputs:
  - name: audit
    type: object
    description: Complete portability audit with per-file status
---
```

### Phase Mapping

| Phase | Current Steps | New Hierarchy | Description |
|-------|---------------|---------------|-------------|
| **Phase 1: Detect** | D1-D4, Step 1 | 1.1 | Run shared detection algorithm |
| **Phase 2: Audit** | Steps 2-8 | 2.1-2.6 | Check all artifact categories |
| **Phase 3: Report** | Step 9 | 3.1 | Print audit report |

### Phase 1: Detect

```pseudocode
DETECT(plugin_path):
  # See lib/patterns/detection-algorithm.md
  computed.sources = scan_metadata_sources(plugin_path)
  IF len(computed.sources) == 0:
    DISPLAY "No recognisable plugin signals found in {plugin_path}."
    EXIT
  computed.canonical = elect_canonical(computed.sources)
  computed.metadata = build_metadata_model(computed.sources)
  print_inference_summary(computed.metadata)
```

### Phase 2: Audit

```pseudocode
AUDIT_MANIFESTS(computed):
  checks = [
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    ".cursor-plugin/plugin.json",
    "gemini-extension.json",
    "GEMINI.md",
    "AGENTS.md",
    "CLAUDE.md",
    "package.json",
    ".opencode/plugins/{{name}}.js",
    "hooks/hooks-cursor.json",
    "hooks/run-hook.cmd"
  ]
  computed.manifest_results = []
  FOR path IN checks:
    resolved = substitute(path, computed.metadata)
    status = IF file_exists(resolved) THEN "PRESENT" ELSE "MISSING"
    computed.manifest_results.append({ path: resolved, status: status })

AUDIT_SIDECARS(computed):
  platforms = ["copilot-tools.md", "codex-tools.md", "gemini-tools.md"]
  computed.sidecar_results = []
  FOR skill IN computed.skills:
    FOR platform IN platforms:
      target = "skills/" + skill.name + "/references/" + platform
      status = IF file_exists(target) THEN "PRESENT" ELSE "MISSING"
      computed.sidecar_results.append({ skill: skill.name, file: platform, status: status })

AUDIT_CONTEXT_FILES(computed):
  # Check GEMINI.md includes all skills
  # Check AGENTS.md references all skills
  computed.context_results = check_context_completeness(computed)

AUDIT_FRONTMATTER(computed):
  computed.frontmatter_results = []
  FOR skill IN computed.skills:
    frontmatter = parse_yaml_frontmatter(skill.content)
    IF frontmatter.name AND frontmatter.description:
      status = "COMPATIBLE"
    ELSE:
      status = "MISSING FRONTMATTER"
    computed.frontmatter_results.append({ skill: skill.name, status: status })

AUDIT_HOOKS(computed):
  computed.hook_results = check_hook_portability(computed)

AUDIT_INJECTION(computed):
  # See patterns/injection-checks.md for 8-component verification
  IF NOT file_exists("skills/using-" + computed.metadata.name + "/SKILL.md"):
    computed.injection_status = "NOT CONFIGURED"
    RETURN
  computed.injection_results = check_injection_components(computed)
```

### Phase 3: Report

Report template format (like bp-assess Phase 5):

```
# Portability Audit: {computed.metadata.name} v{computed.metadata.version}
Metadata inferred from: {computed.canonical.source}

## Platform manifests
{FOR r IN computed.manifest_results}
{r.status}  {r.path}
{/FOR}

## Skill sidecars
{FOR skill_group IN computed.sidecar_results grouped by skill}
skills/{skill_group.skill}/
  {FOR r IN skill_group.results}
  {r.status}  references/{r.file}
  {/FOR}
{/FOR}

## npx skills compatibility
{FOR r IN computed.frontmatter_results}
skills/{r.skill}/SKILL.md   {r.status}
{/FOR}

## Context file completeness
{computed.context_results}

## Hooks
{computed.hook_results}

## Session-start injection
{IF computed.injection_status == "NOT CONFIGURED"}
Not configured (no using-{name} skill found)
{ELSE}
{FOR r IN computed.injection_results}
{r.component}  {r.status}
{/FOR}
Session-start injection: {computed.injection_summary}
{/IF}

## Summary
{computed.manifest_present} files present, {computed.manifest_missing} missing.
{computed.frontmatter_compatible} skills npx-compatible, {computed.frontmatter_missing} missing frontmatter.
Session-start injection: {computed.injection_summary}
Run the uplifting-a-plugin skill to generate all missing files automatically.
```

---

## Extracted Files

### `lib/patterns/detection-algorithm.md`

Contains the full D1-D4 algorithm with:
- Step D1: Metadata source table and scan logic
- Step D2: Field counting and tie-breaking order
- Step D3: Canonical model construction with hard fallbacks
- Step D4: Inference summary format

### `lib/references/copilot-tools.md`

Current inline copilot-tools.md template — extracted verbatim.

### `lib/references/codex-tools.md`

Current inline codex-tools.md template — extracted verbatim.

### `lib/references/gemini-tools.md`

Current inline gemini-tools.md template — extracted verbatim.

### `lib/templates/hooks/session-start.sh`

Current inline session-start bash script template with `{{name}}` placeholders.

### `lib/templates/hooks/run-hook.cmd`

Current inline polyglot CMD/bash wrapper — extracted verbatim.

### `skills/uplifting-a-plugin/patterns/manifest-generation.md`

JSON/markdown schemas for each manifest:
- `claude-plugin`: `.claude-plugin/plugin.json` template
- `claude-marketplace`: `.claude-plugin/marketplace.json` template
- `claude-context`: `CLAUDE.md` template
- `cursor-plugin`: `.cursor-plugin/plugin.json` template (with conditional agents/commands keys)
- `gemini-extension`: `gemini-extension.json` template
- `gemini-context`: `GEMINI.md` include-list builder
- `agents-context`: `AGENTS.md` template
- `opencode-package`: `package.json` template
- `opencode-shim`: `.opencode/plugins/<name>.js` template (minimal, non-bootstrap version)

### `skills/uplifting-a-plugin/patterns/hook-merging.md`

- Claude → Cursor event name mapping table
- Merge logic pseudocode for hooks.json and hooks-cursor.json
- SessionStart entry format for both platforms

### `skills/uplifting-a-plugin/patterns/bootstrapping.md`

- `using-<plugin>/SKILL.md` generation template and skill-table builder
- OpenCode enhanced plugin template (with message transform)
- GEMINI.md regeneration with using-plugin first
- Overwrite warning logic

### `skills/auditing-plugin-portability/patterns/injection-checks.md`

- 8-component verification table
- Status values: PRESENT, MISSING, NO_TRANSFORM, NOT_FIRST
- Summary computation: COMPLETE / PARTIAL (N of 8) / NOT CONFIGURED

---

## Size Estimates

| File | Before | After |
|------|--------|-------|
| `uplifting-a-plugin/SKILL.md` | 866 lines | ~300 lines |
| `auditing-plugin-portability/SKILL.md` | 163 lines | ~150 lines |
| `lib/` (new) | 0 | ~500 lines (across 6 files) |
| `patterns/` (new, per-skill) | 0 | ~550 lines (across 4 files) |
| **Total** | 1029 lines | ~1500 lines |

Total lines increase because templates were previously inline (counted once) and now exist as standalone referenceable files. The SKILL.md files themselves shrink dramatically.

## Non-Goals

- **Changing behavior**: This is a pure restructuring. The skills do exactly the same thing before and after.
- **Adding new features**: No new platform support, no new checks, no new templates.
- **Changing the auditing skill to write files**: It remains read-only.
