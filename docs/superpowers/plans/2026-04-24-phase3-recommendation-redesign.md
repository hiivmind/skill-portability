# Phase 3 Recommendation Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix five recommendation bugs and redesign the uplift skill's Phase 3 as an interactive step with shape-based target recommendation and explicit platform selection.

**Architecture:** Two SKILL.md files contain pseudocode that guides LLM execution. Changes are text edits to pseudocode blocks — no compiled code, no tests. Verification is done by running the skills against the repo itself (dogfooding).

**Tech Stack:** Markdown with pseudocode blocks, YAML frontmatter

---

### Task 1: Fix assessment RECOMMEND_TARGET shape strings (Bug 3)

**Files:**
- Modify: `skills/assessing-plugin-portability/SKILL.md:288-306`

- [ ] **Step 1: Fix shape string in single-platform branch**

In `skills/assessing-plugin-portability/SKILL.md`, find the `RECOMMEND_TARGET` pseudocode block (around line 288). Change:

```pseudocode
  ELIF computed.shape == "single-platform":
```

to:

```pseudocode
  ELIF computed.shape == "single-platform-plugin":
```

- [ ] **Step 2: Fix shape string in multi-platform branch**

In the same block, change:

```pseudocode
  ELIF computed.shape == "multi-platform":
    computed.recommendation = "hybrid"
```

to:

```pseudocode
  ELIF computed.shape == "multi-platform-source":
    computed.recommendation = "full-portable-plugin"
```

Note: the recommendation value also changes from `"hybrid"` to `"full-portable-plugin"` — the spec's uplift target options are `skill-first`, `full-portable-plugin`, and `curated-note-only`. There is no `"hybrid"` option.

- [ ] **Step 3: Fix shape string in curated branch**

In the same block, change:

```pseudocode
  ELIF computed.shape == "curated":
```

to:

```pseudocode
  ELIF computed.shape == "curated-distribution":
```

- [ ] **Step 4: Commit**

```bash
git add skills/assessing-plugin-portability/SKILL.md
git commit -m "fix: assessment RECOMMEND_TARGET shape strings match detection output"
```

---

### Task 2: Fix assessment RECOMMEND_CODEX logic (Bug 4)

**Files:**
- Modify: `skills/assessing-plugin-portability/SKILL.md:310-318`

- [ ] **Step 1: Replace RECOMMEND_CODEX pseudocode block**

In `skills/assessing-plugin-portability/SKILL.md`, find the `RECOMMEND_CODEX` pseudocode block (around line 311). Replace the entire block:

```pseudocode
RECOMMEND_CODEX(computed):
  IF ".codex-plugin/plugin.json" PRESENT in computed.manifest_results:
    computed.codex_rec = "native-plugin-packaging"
  ELIF computed.shape IN ["bare-skill-repo", "single-platform"] AND len(computed.skills) > 0:
    computed.codex_rec = "native-skill-discovery"
  ELSE:
    computed.codex_rec = "curated-package-note"
```

with:

```pseudocode
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

- [ ] **Step 2: Commit**

```bash
git add skills/assessing-plugin-portability/SKILL.md
git commit -m "fix: assessment RECOMMEND_CODEX handles multi-platform and uses correct shape strings"
```

---

### Task 3: Add `platforms` input parameter to uplift frontmatter (Part B)

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md:1-18`

- [ ] **Step 1: Add platforms input to frontmatter**

In `skills/uplifting-a-plugin/SKILL.md`, find the `inputs:` section in the YAML frontmatter. After the `plugin_path` input entry, add:

```yaml
  - name: platforms
    type: string
    required: false
    description: >
      Comma-separated list of target platforms. If omitted, the skill presents
      an interactive checklist. Valid values: claude-code, cursor, gemini-cli,
      opencode, copilot-cli, codex, all.
```

- [ ] **Step 2: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "feat: add optional platforms input parameter to uplift skill"
```

---

### Task 4: Rewrite uplift Phase 3 with interactive recommendation and platform selection

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md:127-144` (Phase 3 section)

- [ ] **Step 1: Replace Phase 3 header and description**

In `skills/uplifting-a-plugin/SKILL.md`, find the Phase 3 section (around line 127). Replace from `## 3. Phase 3: Recommend` through the closing of the `RECOMMEND` pseudocode block (around line 144) with:

```markdown
## 3. Phase 3: Recommend

Interactive uplift target recommendation and platform selection. Uses `computed.shape`
from Phase 1 to derive a recommendation, then asks the user to confirm and select
target platforms.

### 3.1 Recommend and Confirm Uplift Target

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

  # If platforms input was provided, auto-confirm
  IF inputs.platforms IS PROVIDED:
    computed.uplift_target = recommended
    RETURN

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
    computed.uplift_target = parse_choice(response)
`` `
```

Note: the triple backtick closing the pseudocode block above has a space inserted to avoid breaking the markdown in this plan. The actual file should use three backticks with no space.

- [ ] **Step 2: Add Step 3.2 — Select Target Platforms**

Immediately after the Step 3.1 pseudocode block, add:

```markdown
### 3.2 Select Target Platforms

```pseudocode
SELECT_PLATFORMS(computed):
  all_platforms = ["claude-code", "cursor", "gemini-cli", "opencode", "copilot-cli", "codex"]

  # If platforms input was provided, use it directly
  IF inputs.platforms IS PROVIDED:
    IF inputs.platforms == "all":
      computed.target_platforms = all_platforms
    ELSE:
      computed.target_platforms = parse_csv(inputs.platforms)
      validate_platform_names(computed.target_platforms)
    RETURN

  # Pre-select based on uplift target and existing state
  IF computed.uplift_target == "skill-first":
    preselected = all_platforms
  ELIF computed.uplift_target == "curated-note-only":
    preselected = [p FOR p IN all_platforms
                   IF any(s.platform == p FOR s IN computed.skipped)]
    IF len(preselected) == 0:
      preselected = all_platforms
  ELSE:
    preselected = all_platforms

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
    GOTO SELECT_PLATFORMS
`` `
```

- [ ] **Step 3: Add Step 3.3 — Derive Codex Path**

Immediately after Step 3.2, add:

```markdown
### 3.3 Derive Codex Path

```pseudocode
DERIVE_CODEX_PATH(computed):
  IF "codex" NOT IN computed.target_platforms:
    computed.codex_rec = None
    RETURN

  IF computed.uplift_target == "skill-first":
    computed.codex_rec = "native-skill-discovery"
  ELIF computed.uplift_target == "curated-note-only":
    computed.codex_rec = "curated-package-note"
  ELSE:
    computed.codex_rec = "native-plugin-packaging"
`` `
```

- [ ] **Step 4: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "feat: rewrite uplift Phase 3 with interactive recommendation and platform selection"
```

---

### Task 5: Add curated-note-only short-circuit and platform filtering to Phase 4

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md` (Phase 4 section, around lines 148-218)

- [ ] **Step 1: Add curated-note-only short-circuit before Phase 4**

Between the end of Phase 3 and the start of Phase 4, insert:

```markdown
### 3.4 Early Exit for Curated-Note-Only

```pseudocode
IF computed.uplift_target == "curated-note-only":
  SKIP Phase 4 (Generate)
  SKIP Phase 5 (Port)
  RUN  Phase 6 (Document) — install docs only, for selected platforms
  SKIP Phase 7 (Bootstrap)
  RUN  Phase 8 (Report)
  RETURN
`` `
```

- [ ] **Step 2: Add platform and skill-first filtering to GENERATE_MANIFESTS**

In the `GENERATE_MANIFESTS` pseudocode block, find the loop body that starts with:

```pseudocode
  FOR manifest IN manifests:
    IF manifest.condition AND NOT eval(manifest.condition):
      CONTINUE
    resolved = substitute(manifest.target, computed.metadata)
    IF any(s.path == resolved FOR s IN computed.skipped):
      CONTINUE
```

Replace it with:

```pseudocode
  FOR manifest IN manifests:
    # Skip if platform not targeted (cross-platform always included)
    IF manifest.platform != "cross" AND manifest.platform NOT IN computed.target_platforms:
      CONTINUE

    IF manifest.condition AND NOT eval(manifest.condition):
      CONTINUE

    resolved = substitute(manifest.target, computed.metadata)
    IF any(s.path == resolved FOR s IN computed.skipped):
      CONTINUE

    # Skill-first: skip platform manifests, only generate context files
    IF computed.uplift_target == "skill-first" AND is_manifest(manifest.schema):
      CONTINUE
```

- [ ] **Step 3: Add is_manifest predicate after the GENERATE_MANIFESTS block**

After the closing of the `GENERATE_MANIFESTS` pseudocode block (after `computed.created.append(...)`) and before Section 4.2, add:

```markdown
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
`` `

Under `skill-first`, only context schemas are generated (plus sidecars). Under `full-portable-plugin`, both manifest and context schemas are generated.
```

- [ ] **Step 4: Add platform filtering to GENERATE_SIDECARS**

In the `GENERATE_SIDECARS` pseudocode block, replace:

```pseudocode
GENERATE_SIDECARS(computed):
  platforms = ["copilot-tools.md", "codex-tools.md", "gemini-tools.md"]
  FOR skill IN computed.skills:
    FOR platform IN platforms:
      target = skill.dir + "/references/" + platform
      IF NOT file_exists(target):
        source = Read("lib/references/" + platform)
        Write(target, source)
        computed.created.append({ path: target, platform: "cross" })
```

with:

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
      target = skill.dir + "/references/" + sidecar
      IF NOT file_exists(target):
        source = Read("lib/references/" + sidecar)
        Write(target, source)
        computed.created.append({ path: target, platform: platform })
```

- [ ] **Step 5: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "feat: add curated-note-only short-circuit and platform filtering to Phase 4"
```

---

### Task 6: Add platform filtering to Phase 5 (hooks)

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md` (Phase 5 section, around lines 220-281)

- [ ] **Step 1: Add platform guards to Phase 5 hook porting**

Find the Phase 5 section header. After the introductory text ("Adapt hooks from any source platform to all target platforms..."), before section 5.1, add:

```markdown
Hook porting is filtered by `computed.target_platforms`. Each subsection only
runs if its target platform is selected.
```

- [ ] **Step 2: Add platform guard to PORT_CURSOR_HOOKS**

At the start of the `PORT_CURSOR_HOOKS` pseudocode block, add as the first line inside the function:

```pseudocode
  IF "cursor" NOT IN computed.target_platforms:
    RETURN
```

- [ ] **Step 3: Add platform guard to PORT_COPILOT_HOOKS**

At the start of the `PORT_COPILOT_HOOKS` pseudocode block, add as the first line inside the function:

```pseudocode
  IF "copilot-cli" NOT IN computed.target_platforms:
    RETURN
```

- [ ] **Step 4: Add platform guard to GEMINI_HOOK_GUIDANCE**

At the start of the `GEMINI_HOOK_GUIDANCE` pseudocode block, add as the first line inside the function:

```pseudocode
  IF "gemini-cli" NOT IN computed.target_platforms:
    RETURN
```

- [ ] **Step 5: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "feat: add platform filtering to Phase 5 hook porting"
```

---

### Task 7: Fix Phase 6 install doc gating (Bug 5)

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md` (Phase 6 section, around lines 285-341)

- [ ] **Step 1: Replace DETERMINE_PLATFORMS logic**

In the `DETERMINE_PLATFORMS` pseudocode block, replace:

```pseudocode
DETERMINE_PLATFORMS(computed):
  all_records = computed.created + computed.skipped
  platforms_with_artifacts = deduplicate([
    r.platform FOR r IN all_records IF r.platform != "cross"
  ])
```

with:

```pseudocode
DETERMINE_PLATFORMS(computed):
  platforms_with_artifacts = computed.target_platforms
```

- [ ] **Step 2: Fix WRITE_INSTALL_DOCS Codex gate**

In the `WRITE_INSTALL_DOCS` pseudocode block, find:

```pseudocode
  # Codex gets its own install doc
  IF "codex" IN platforms_with_artifacts AND computed.codex_rec != "native-skill-discovery":
    Write(".codex/INSTALL.md", sections["codex"])
    computed.created.append({ path: ".codex/INSTALL.md", platform: "codex" })
```

Replace with:

```pseudocode
  # Codex: always gets its own install doc when targeted
  IF "codex" IN platforms_with_artifacts:
    Write(".codex/INSTALL.md", sections["codex"])
    computed.created.append({ path: ".codex/INSTALL.md", platform: "codex" })
```

- [ ] **Step 3: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "fix: Phase 6 install docs use target_platforms, remove codex_rec gate"
```

---

### Task 8: Add platform filtering to Phase 7 (bootstrap)

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md` (Phase 7 section, around lines 345-371)

- [ ] **Step 1: Add platform guards to bootstrap sub-steps**

In the `BOOTSTRAP` pseudocode block, find the sequence of function calls:

```pseudocode
  generate_using_skill(computed)
  generate_using_sidecars(computed)
  generate_session_start(computed)
  generate_run_hook_cmd(computed)
  merge_session_start_hooks(computed)
  enhance_opencode_plugin(computed)
  update_gemini_md(computed)
  computed.bootstrap_status = "configured"
```

Replace with:

```pseudocode
  generate_using_skill(computed)
  generate_using_sidecars(computed)        # filtered by target_platforms (same as Phase 4.2)
  generate_session_start(computed)
  generate_run_hook_cmd(computed)

  # Hook merging gated on platform targeting
  IF "claude-code" IN computed.target_platforms:
    merge_session_start_hooks_claude(computed)
  IF "cursor" IN computed.target_platforms:
    merge_session_start_hooks_cursor(computed)

  # Platform-specific enhancements
  IF "opencode" IN computed.target_platforms:
    enhance_opencode_plugin(computed)
  IF "gemini-cli" IN computed.target_platforms:
    update_gemini_md(computed)

  computed.bootstrap_status = "configured"
```

- [ ] **Step 2: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "feat: add platform filtering to Phase 7 bootstrap"
```

---

### Task 9: Update Phase 3 description in Overview table and State Flow

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md` (Overview table around line 39, State Flow around line 414)

- [ ] **Step 1: Update Overview table Phase 3 description**

In the Overview table, find:

```markdown
| **Phase 3: Recommend** | Choose uplift target and Codex packaging path |
```

Replace with:

```markdown
| **Phase 3: Recommend** | Recommend uplift target, confirm with user, select target platforms |
```

- [ ] **Step 2: Update State Flow diagram**

Find the State Flow section. Replace:

```
Phase 1          Phase 2              Phase 3          Phase 4–5            Phase 6            Phase 7            Phase 8
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
computed         computed.skills      computed         computed.created     platforms_with     computed           Report
 .sources         .commands           .codex_rec        .skipped             _artifacts         .bootstrap        (displayed)
 .canonical       .agents                               .flagged                                _status
 .metadata        .existing_hooks
 .shape
```

with:

```
Phase 1          Phase 2              Phase 3              Phase 4–5            Phase 6            Phase 7            Phase 8
──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
computed         computed.skills      computed              computed.created     platforms_with     computed           Report
 .sources         .commands           .uplift_target         .skipped             _artifacts         .bootstrap        (displayed)
 .canonical       .agents             .target_platforms      .flagged              (= target         _status
 .metadata        .existing_hooks     .codex_rec                                   _platforms)
 .shape
```

- [ ] **Step 3: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "docs: update overview table and state flow for Phase 3 redesign"
```

---

### Task 10: Verify by running self-assessment

**Files:**
- None modified (read-only verification)

- [ ] **Step 1: Run the assessment skill against this repo**

Run: `/plugin-portability:assessing-plugin-portability .`

Verify:
1. Shape is classified as `multi-platform-source` (not falling to ELSE)
2. `RECOMMEND_TARGET` outputs `full-portable-plugin` (not `hybrid`)
3. `RECOMMEND_CODEX` outputs `native-plugin-packaging` (not `curated-package-note`)
4. Codex appears in the Required Artifacts section with proper recommendations

- [ ] **Step 2: Inspect the uplift skill pseudocode for consistency**

Read `skills/uplifting-a-plugin/SKILL.md` and verify:
1. Phase 3 has three subsections (3.1, 3.2, 3.3) plus early exit (3.4)
2. Phase 4.1 loop has four CONTINUE guards: platform filter, condition, conflict, skill-first
3. Phase 4.2 uses `sidecar_platform_map` with platform filtering
4. Phase 5 has platform guards on all three hook porters
5. Phase 6 uses `computed.target_platforms` directly, no `codex_rec` gate on install docs
6. Phase 7 has per-platform guards on hook merging and enhancements
7. Frontmatter has `platforms` input parameter

- [ ] **Step 3: Commit plan as complete**

```bash
git add docs/superpowers/plans/2026-04-24-phase3-recommendation-redesign.md
git commit -m "docs: implementation plan for Phase 3 recommendation redesign"
```
