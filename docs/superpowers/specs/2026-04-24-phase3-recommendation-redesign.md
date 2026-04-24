# Phase 3 Recommendation Redesign: Shape-Gated Generation + Platform Selection

**Date:** 2026-04-24
**Status:** Draft
**Scope:** Fix five bugs in the uplift and assessment recommendation logic, redesign Phase 3 as an interactive step with shape-based recommendations and explicit platform targeting.

## Problem

### Bug 1: Uplift has no general RECOMMEND_TARGET
Manifest generation for Claude Code, Cursor, Gemini CLI, OpenCode, and Copilot CLI is unconditional. For a `bare-skill-repo`, the uplift generates full plugin manifests (`.claude-plugin/plugin.json`, `.cursor-plugin/plugin.json`, etc.) even though the user may only want skill-level portability (sidecars + context files). Shape detection exists and runs in Phase 1, but Phase 4 ignores it.

### Bug 2: Uplift Codex RECOMMEND — chicken-and-egg default
The Codex recommendation only selects `native-plugin-packaging` if `.codex-plugin/plugin.json` already exists in the skipped list. For repos that don't have it yet (the entire point of uplifting), the ELSE branch defaults to `native-skill-discovery`, and the manifest generation condition `codex_rec == 'native-plugin-packaging'` is never true. Result: `.codex-plugin/` is never created.

### Bug 3: Assessment RECOMMEND_TARGET — shape string mismatches
The assessment's `RECOMMEND_TARGET` compares against truncated shape names (`"single-platform"`, `"multi-platform"`, `"curated"`) that never match the detection algorithm's output (`"single-platform-plugin"`, `"multi-platform-source"`, `"curated-distribution"`). Every non-bare shape falls to the ELSE branch.

### Bug 4: Assessment RECOMMEND_CODEX — multi-platform misclassified
For `multi-platform-source` repos, the assessment's `RECOMMEND_CODEX` falls to the ELSE → `curated-package-note` because multi-platform isn't in the `["bare-skill-repo", "single-platform"]` check (which also has the string mismatch from Bug 3).

### Bug 5: Codex excluded from install docs (secondary)
Since no Codex artifacts are created or skipped (Bug 2), `"codex"` never appears in `platforms_with_artifacts`, so Codex install docs are silently omitted from Phase 6 output.

## Solution

### Part A: Interactive Phase 3 with platform selection

Redesign the uplift skill's Phase 3 from a silent computation into two interactive prompts.

#### Step 3.1: Recommend and confirm uplift target

```pseudocode
RECOMMEND_AND_CONFIRM(computed):
  # Derive recommendation from shape
  IF computed.shape == "bare-skill-repo":
    IF len(computed.skills) <= 3:
      recommended = "skill-first"
      rationale = "This repo has " + len(computed.skills) + " skill(s) and no platform manifests. Skill-first generates sidecars and context files without full plugin packaging."
    ELSE:
      recommended = "full-portable-plugin"
      rationale = "This repo has " + len(computed.skills) + " skills. Full plugin packaging gives each platform a native manifest for better discoverability."

  ELIF computed.shape == "single-platform-plugin":
    recommended = "full-portable-plugin"
    rationale = "This repo already has one platform manifest. Full plugin packaging adds the remaining platforms."

  ELIF computed.shape == "multi-platform-source":
    recommended = "full-portable-plugin"
    rationale = "This repo already targets multiple platforms. Full plugin packaging fills the remaining gaps."

  ELIF computed.shape == "curated-distribution":
    recommended = "curated-note-only"
    rationale = "This repo is a marketplace distribution without upstream skills. Only install documentation and notes will be generated."

  ELSE:
    recommended = "full-portable-plugin"
    rationale = "Repo shape could not be classified. Defaulting to full plugin packaging."

  # Present to user
  DISPLAY "## Uplift Target"
  DISPLAY "Shape: " + computed.shape
  DISPLAY "Recommendation: **" + recommended + "**"
  DISPLAY rationale
  DISPLAY ""
  DISPLAY "Options:"
  DISPLAY "  1. skill-first — sidecars, context files, AGENTS.md only (no platform manifests)"
  DISPLAY "  2. full-portable-plugin — all platform manifests + context files + sidecars + install docs"
  DISPLAY "  3. curated-note-only — install notes only"

  response = ASK "Accept recommendation (" + recommended + "), or choose 1/2/3?"

  IF response confirms recommendation:
    computed.uplift_target = recommended
  ELSE:
    computed.uplift_target = parse_choice(response)  # "skill-first", "full-portable-plugin", or "curated-note-only"
```

#### Step 3.2: Select target platforms

```pseudocode
SELECT_PLATFORMS(computed):
  all_platforms = ["claude-code", "cursor", "gemini-cli", "opencode", "copilot-cli", "codex"]

  # Pre-select based on uplift target and existing state
  IF computed.uplift_target == "skill-first":
    # Skill-first: pre-select all platforms — sidecars and context files are
    # useful everywhere. Platforms with existing manifests are annotated in
    # the checklist so the user can see what already exists.
    preselected = all_platforms
  ELIF computed.uplift_target == "curated-note-only":
    # Curated: pre-select platforms that already have manifests (install docs only)
    preselected = [p FOR p IN all_platforms
                   IF any(s.platform == p FOR s IN computed.skipped)]
    IF len(preselected) == 0:
      preselected = all_platforms  # no manifests to anchor on, default to all
  ELSE:  # full-portable-plugin
    preselected = all_platforms  # all pre-selected

  # Present checklist
  DISPLAY "## Target Platforms"
  DISPLAY ""
  FOR p IN all_platforms:
    marker = "[x]" IF p IN preselected ELSE "[ ]"
    existing = " (manifest exists)" IF any(s.platform == p FOR s IN computed.skipped) ELSE ""
    DISPLAY "  " + marker + " " + p + existing
  DISPLAY ""

  response = ASK "Confirm platforms, or list the ones you want (e.g. 'claude-code, cursor, gemini-cli')?"

  IF response confirms:
    computed.target_platforms = preselected
  ELSE:
    computed.target_platforms = parse_platform_list(response)

  # Validate: at least one platform required
  IF len(computed.target_platforms) == 0:
    DISPLAY "At least one platform must be selected."
    GOTO SELECT_PLATFORMS  # re-prompt
```

#### Step 3.3: Derive Codex path (no longer interactive)

```pseudocode
DERIVE_CODEX_PATH(computed):
  IF "codex" NOT IN computed.target_platforms:
    computed.codex_rec = None  # not targeting codex
    RETURN

  IF computed.uplift_target == "skill-first":
    computed.codex_rec = "native-skill-discovery"
  ELIF computed.uplift_target == "curated-note-only":
    computed.codex_rec = "curated-package-note"
  ELSE:
    computed.codex_rec = "native-plugin-packaging"
```

### Part A impact on downstream phases

#### Early exit for curated-note-only

`curated-note-only` skips Phases 4, 5, and 7 entirely. Only Phase 6 (install docs) runs.

```pseudocode
IF computed.uplift_target == "curated-note-only":
  SKIP Phase 4 (Generate)
  SKIP Phase 5 (Port)
  RUN  Phase 6 (Document) — install docs only, for selected platforms
  SKIP Phase 7 (Bootstrap)
  RUN  Phase 8 (Report)
  RETURN
```

#### Phase 4.1: Filter manifest table by target platforms

```pseudocode
GENERATE_MANIFESTS(computed):
  # curated-note-only never reaches here (short-circuited above)

  manifests = [
    { target: ".claude-plugin/plugin.json",      platform: "claude-code", ... },
    { target: ".claude-plugin/marketplace.json", platform: "claude-code", ... },
    { target: "CLAUDE.md",                       platform: "claude-code", ... },
    { target: ".cursor-plugin/plugin.json",      platform: "cursor",      ... },
    { target: "gemini-extension.json",           platform: "gemini-cli",  ... },
    { target: "GEMINI.md",                       platform: "gemini-cli",  ... },
    { target: "package.json",                    platform: "opencode",    ... },
    { target: ".opencode/plugins/{{name}}.js",   platform: "opencode",    ... },
    { target: ".codex-plugin/plugin.json",       platform: "codex",
      condition: "computed.codex_rec == 'native-plugin-packaging'"        },
    { target: "AGENTS.md",                       platform: "cross",       ... },
    { target: ".github/copilot-instructions.md", platform: "copilot-cli", ... },
  ]

  FOR manifest IN manifests:
    # NEW: skip if platform not targeted (cross-platform always included)
    IF manifest.platform != "cross" AND manifest.platform NOT IN computed.target_platforms:
      CONTINUE

    # Existing: skip if condition fails
    IF manifest.condition AND NOT eval(manifest.condition):
      CONTINUE

    # Existing: skip if file already exists
    resolved = substitute(manifest.target, computed.metadata)
    IF any(s.path == resolved FOR s IN computed.skipped):
      CONTINUE

    # Skill-first: skip platform manifests, only generate context files
    IF computed.uplift_target == "skill-first" AND is_manifest(manifest.schema):
      CONTINUE

    # ... rest of generation logic unchanged
```

The `is_manifest()` predicate classifies schemas as packaging vs context:

```pseudocode
MANIFEST_SCHEMAS = [
  "claude-plugin", "claude-marketplace", "cursor-plugin",
  "gemini-extension", "opencode-package", "opencode-shim", "codex-plugin"
]
CONTEXT_SCHEMAS = [
  "claude-context", "gemini-context", "agents-context", "copilot-instructions"
]

FUNCTION is_manifest(schema):
  RETURN schema IN MANIFEST_SCHEMAS
```

Under `skill-first`, only context schemas are generated (plus sidecars). Under `full-portable-plugin`, both manifest and context schemas are generated.

#### Phase 4.2: Filter sidecars by target platforms

```pseudocode
GENERATE_SIDECARS(computed):
  sidecar_platform_map = {
    "copilot-tools.md": "copilot-cli",
    "codex-tools.md":   "codex",
    "gemini-tools.md":  "gemini-cli",
  }

  FOR skill IN computed.skills:
    FOR sidecar, platform IN sidecar_platform_map:
      IF platform NOT IN computed.target_platforms:
        CONTINUE
      # ... rest unchanged
```

#### Phase 5: Filter hook porting by target platforms

```pseudocode
PORT_HOOKS(computed):
  IF "cursor" IN computed.target_platforms:
    PORT_CURSOR_HOOKS(computed)
  IF "copilot-cli" IN computed.target_platforms:
    PORT_COPILOT_HOOKS(computed)
  IF "gemini-cli" IN computed.target_platforms:
    GEMINI_HOOK_GUIDANCE(computed)
  # Windows support always generated (cross-platform)
  PORT_WINDOWS_HOOKS(computed)
```

#### Phase 6: Filter install docs by target platforms

The existing `WRITE_INSTALL_DOCS` gates `.codex/INSTALL.md` on `codex_rec != 'native-skill-discovery'`.
This spec replaces that condition with a target-platform check so Codex install docs are always
generated when codex is a target platform, regardless of the packaging path.

```pseudocode
DETERMINE_PLATFORMS(computed):
  # Replace artifact-derived logic with explicit target list
  platforms_with_artifacts = computed.target_platforms

WRITE_INSTALL_DOCS(computed, sections, platforms_with_artifacts):
  # Codex: always gets its own install doc when targeted
  IF "codex" IN platforms_with_artifacts:
    Write(".codex/INSTALL.md", sections["codex"])
    computed.created.append({ path: ".codex/INSTALL.md", platform: "codex" })

  # Copilot: always gets its own install doc when targeted
  IF "copilot-cli" IN platforms_with_artifacts:
    Write(".github/INSTALL.md", sections["copilot-cli"])
    computed.created.append({ path: ".github/INSTALL.md", platform: "copilot-cli" })

  # Composite doc for remaining platforms
  remaining = [p FOR p IN platforms_with_artifacts IF p NOT IN ["codex", "copilot-cli"]]
  IF remaining:
    composite = join_sections([sections[p] FOR p IN remaining])
    Write("docs/INSTALL.md", composite)
    computed.created.append({ path: "docs/INSTALL.md", platform: "cross" })
```

Note: the old condition `computed.codex_rec != "native-skill-discovery"` is removed. The `codex_rec`
field now only controls whether `.codex-plugin/plugin.json` is generated (Phase 4), not whether
install docs are emitted.

#### Phase 7: Bootstrap filters

```pseudocode
BOOTSTRAP(computed):
  # Sidecar generation for using-skill filtered same as Phase 4.2
  # Hook merging for Claude/Cursor gated on platform targeting
  # OpenCode plugin enhancement gated on "opencode" in target_platforms
  # GEMINI.md update gated on "gemini-cli" in target_platforms
```

### Part B: Platforms input parameter

Add an optional `platforms` input to the uplift skill frontmatter:

```yaml
inputs:
  - name: plugin_path
    type: string
    required: true
    description: Path to the plugin root directory
  - name: platforms
    type: string
    required: false
    description: >
      Comma-separated list of target platforms. If omitted, the skill presents
      an interactive checklist. Valid values: claude-code, cursor, gemini-cli,
      opencode, copilot-cli, codex, all.
```

When `platforms` is provided:

```pseudocode
IF inputs.platforms == "all":
  computed.target_platforms = all_platforms
ELSE:
  computed.target_platforms = parse_csv(inputs.platforms)
  validate_platform_names(computed.target_platforms)
# Skip Step 3.2 interactive prompt
# Still run Step 3.1 to determine uplift_target, but auto-confirm recommendation
```

### Part C: Assessment bug fixes

#### Fix shape string mismatches (Bug 3)

In `assessing-plugin-portability/SKILL.md`, Phase 4.1 `RECOMMEND_TARGET`:

```pseudocode
# BEFORE (broken):
ELIF computed.shape == "single-platform":
ELIF computed.shape == "multi-platform":
ELIF computed.shape == "curated":

# AFTER (matches detection algorithm output):
ELIF computed.shape == "single-platform-plugin":
ELIF computed.shape == "multi-platform-source":
ELIF computed.shape == "curated-distribution":
```

#### Fix RECOMMEND_CODEX (Bug 4)

In `assessing-plugin-portability/SKILL.md`, Phase 4.2 `RECOMMEND_CODEX`:

```pseudocode
# BEFORE (broken):
RECOMMEND_CODEX(computed):
  IF ".codex-plugin/plugin.json" PRESENT in computed.manifest_results:
    computed.codex_rec = "native-plugin-packaging"
  ELIF computed.shape IN ["bare-skill-repo", "single-platform"] AND len(computed.skills) > 0:
    computed.codex_rec = "native-skill-discovery"
  ELSE:
    computed.codex_rec = "curated-package-note"

# AFTER (shape-driven, consistent with uplift):
RECOMMEND_CODEX(computed):
  IF ".codex-plugin/plugin.json" PRESENT in computed.manifest_results:
    computed.codex_rec = "native-plugin-packaging"
  ELIF computed.shape == "bare-skill-repo" AND len(computed.skills) > 0:
    computed.codex_rec = "native-skill-discovery"
  ELIF computed.shape IN ["single-platform-plugin", "multi-platform-source"]:
    computed.codex_rec = "native-plugin-packaging"
  ELIF computed.shape == "curated-distribution":
    computed.codex_rec = "curated-package-note"
  ELSE:
    computed.codex_rec = "native-plugin-packaging"
```

## Files changed

| File | Change |
|------|--------|
| `skills/uplifting-a-plugin/SKILL.md` | Rewrite Phase 3 (interactive recommend + platform select), add platform filtering to Phases 4-7, add `platforms` input parameter |
| `skills/assessing-plugin-portability/SKILL.md` | Fix shape strings in RECOMMEND_TARGET, fix RECOMMEND_CODEX logic |

## What does NOT change

- Phase 1 (detection algorithm) — shape classification is correct as-is
- Phase 2 (inventory) — conflict checks unchanged
- Phase 8 (report) — format unchanged, but now includes platform selection in output
- Assessment scoring — always reports all 6 platforms regardless of uplift targeting
- `lib/patterns/` — no changes to shared patterns
- `lib/templates/` — no template changes

## Edge cases

| Scenario | Behaviour |
|----------|-----------|
| User selects 0 platforms | Error: "At least one platform must be selected." Re-prompt. |
| User selects only codex with skill-first target | Generate sidecars + AGENTS.md + `.codex/INSTALL.md`. No `.codex-plugin/` manifest. `codex_rec` is `native-skill-discovery`; Phase 6 emits install docs regardless. |
| User selects codex with full-portable-plugin target | Generate `.codex-plugin/plugin.json` + sidecars + `.codex/INSTALL.md`. |
| `platforms` input provided but uplift_target not | Auto-confirm shape-based recommendation. |
| Plugin already has all manifests for selected platforms | All skipped, no writes. Report confirms "already portable for selected platforms." |
| curated-note-only with platforms selected | Phases 4, 5, 7 short-circuited. Only Phase 6 (install docs) runs for selected platforms. No manifests, sidecars, or hooks. |
| curated-note-only with 0 preselected (no existing manifests) | Preselection defaults to all platforms. User can narrow via checklist. |
| bare-skill-repo with skill-first confirmed | All platforms pre-selected for sidecars/context. No platform manifests generated (`is_manifest` filter). |

## Testing

Run self-assessment after implementation to verify:
1. Shape strings match between detection and recommendation
2. Codex manifest generated for multi-platform-source
3. bare-skill-repo with skill-first target produces no platform manifests
4. Platform filtering excludes unselected platforms from all phases
5. `platforms` input parameter bypasses interactive prompts
