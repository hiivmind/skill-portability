# Verification Gates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add LOAD_AND_VERIFY and GLOB_AND_VERIFY gates to every phase in SKILL.md that depends on external references, ensuring the LLM reads each file and proves it did.

**Architecture:** Single file change — all edits in `skills/plugin-portability/SKILL.md`. Each task adds gates to one phase. The gate patterns (LOAD_AND_VERIFY for files, GLOB_AND_VERIFY for directories) are introduced in a new section before Phase 0a, then used throughout.

**Tech Stack:** Markdown pseudocode.

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `skills/plugin-portability/SKILL.md` | Modify | Add gate pattern definitions + gates to 8 phases |

---

### Task 1: Add gate pattern definitions

**Files:**
- Modify: `skills/plugin-portability/SKILL.md` (between External references block and Overview table)

- [ ] **Step 1: Insert the gate patterns section**

Find (lines 26-29):

```
---

## Overview
```

Replace with:

```
---

## Verification Gates

Every phase that depends on an external reference must read the file and
prove it was loaded before executing phase logic. Two patterns:

```pseudocode
LOAD_AND_VERIFY(path, proof):
  content = Read(path)
  IF content IS empty OR unreadable:
    HALT "Cannot proceed: {path} not found or empty"
  extracted = proof(content)
  DISPLAY "Loaded {path}: {extracted}"

GLOB_AND_VERIFY(pattern, proof):
  files = Glob(pattern)
  IF files IS empty:
    HALT "Cannot proceed: no files matching {pattern}"
  extracted = proof(files)
  DISPLAY "Found {pattern}: {extracted}"
```

---

## Overview
```

- [ ] **Step 2: Verify**

Run: `grep -n 'LOAD_AND_VERIFY\|GLOB_AND_VERIFY' skills/plugin-portability/SKILL.md | head -5`
Expected: lines showing the pattern definitions

- [ ] **Step 3: Commit**

```bash
git add skills/plugin-portability/SKILL.md
git commit -m "Add LOAD_AND_VERIFY and GLOB_AND_VERIFY gate pattern definitions"
```

---

### Task 2: Add gate to Phase 1 (Detect)

**Files:**
- Modify: `skills/plugin-portability/SKILL.md`

- [ ] **Step 1: Replace Phase 1 content**

Find:

```
## Phase 1: Detect

Follow `lib/patterns/detection-algorithm.md`.

```pseudocode
DETECT(plugin_path):
  computed.sources  = scan_metadata_sources(plugin_path)
  IF len(computed.sources) == 0: DISPLAY "No plugin signals found."; EXIT
  computed.canonical = elect_canonical(computed.sources)
  computed.metadata  = build_metadata_model(computed.sources)
  computed.shape     = classify_shape(computed.sources)
  print_inference_summary(computed.metadata, computed.canonical)
```
```

Replace with:

```
## Phase 1: Detect

```pseudocode
DETECT(plugin_path):
  LOAD_AND_VERIFY("lib/patterns/detection-algorithm.md",
    proof: content contains FUNCTION definitions for
      SCAN_METADATA_SOURCES, ELECT_CANONICAL, BUILD_METADATA_MODEL,
      PRINT_INFERENCE_SUMMARY, CLASSIFY_SHAPE)

  # Execute the algorithm as defined in detection-algorithm.md
  computed.sources  = scan_metadata_sources(plugin_path)
  IF len(computed.sources) == 0: DISPLAY "No plugin signals found."; EXIT
  computed.canonical = elect_canonical(computed.sources)
  computed.metadata  = build_metadata_model(computed.sources)
  computed.shape     = classify_shape(computed.sources)
  print_inference_summary(computed.metadata, computed.canonical)
```
```

- [ ] **Step 2: Verify**

Run: `grep -A1 'Phase 1: Detect' skills/plugin-portability/SKILL.md`
Expected: no "Follow" line — gate is inside the pseudocode block

- [ ] **Step 3: Commit**

```bash
git add skills/plugin-portability/SKILL.md
git commit -m "Add LOAD_AND_VERIFY gate to Phase 1 (Detect)"
```

---

### Task 3: Add gate to Phase 2 (Inventory)

**Files:**
- Modify: `skills/plugin-portability/SKILL.md`

- [ ] **Step 1: Replace Phase 2 content**

Find:

```
## Phase 2: Inventory

Follow `lib/patterns/inventory.md`. Populates:

- `computed.skills`, `computed.agents`, `computed.commands`, `computed.hooks`
- `computed.manifest_results`, `computed.context_results`, `computed.sidecar_results`
- `computed.frontmatter_results`, `computed.hook_results`, `computed.injection_results`
- `computed.existing_files` (for conflict detection during uplift)
```

Replace with:

```
## Phase 2: Inventory

```pseudocode
INVENTORY(plugin_path, computed):
  LOAD_AND_VERIFY("lib/patterns/inventory.md",
    proof: content contains substeps 2.1 through 2.8)

  # Execute the inventory as defined in inventory.md
  # Populates: computed.skills, computed.agents, computed.commands,
  # computed.hooks, computed.manifest_results, computed.context_results,
  # computed.sidecar_results, computed.frontmatter_results,
  # computed.hook_results, computed.injection_results,
  # computed.existing_files
```
```

- [ ] **Step 2: Verify**

Run: `grep -A1 'Phase 2: Inventory' skills/plugin-portability/SKILL.md`
Expected: no "Follow" line

- [ ] **Step 3: Commit**

```bash
git add skills/plugin-portability/SKILL.md
git commit -m "Add LOAD_AND_VERIFY gate to Phase 2 (Inventory)"
```

---

### Task 4: Add gate to Phase 0b (Uplift Target)

**Files:**
- Modify: `skills/plugin-portability/SKILL.md`

- [ ] **Step 1: Insert gate after the mode check**

Find:

```
INTENT_UPLIFT_TARGET(computed):
  IF intent.mode != "uplift": RETURN

  # Derive recommendation from shape
```

Replace with:

```
INTENT_UPLIFT_TARGET(computed):
  IF intent.mode != "uplift": RETURN

  LOAD_AND_VERIFY("lib/references/uplift-targets/registry.md",
    proof: UPLIFT_TARGETS contains 3 entries:
      skill-first, full-portable-plugin, curated-note-only)

  # Derive recommendation from shape
```

- [ ] **Step 2: Verify**

Run: `grep -A5 'INTENT_UPLIFT_TARGET' skills/plugin-portability/SKILL.md | grep 'LOAD_AND_VERIFY'`
Expected: one line with the uplift-targets gate

- [ ] **Step 3: Commit**

```bash
git add skills/plugin-portability/SKILL.md
git commit -m "Add LOAD_AND_VERIFY gate to Phase 0b (Uplift Target)"
```

---

### Task 5: Add gates to Phase 3 (Score)

**Files:**
- Modify: `skills/plugin-portability/SKILL.md`

- [ ] **Step 1: Replace Phase 3 intro and pseudocode opening**

Find:

```
## Phase 3: Score

Always runs full scoring. References `lib/rubrics/rubric-framework.md` and `lib/rubrics/*.yaml`.

```pseudocode
SCORE(computed, platforms):
  FOR platform IN platforms:
    rubric = load_yaml("lib/rubrics/" + platform + ".yaml")
```

Replace with:

```
## Phase 3: Score

Always runs full scoring.

```pseudocode
SCORE(computed, platforms):
  LOAD_AND_VERIFY("lib/rubrics/rubric-framework.md",
    proof: content contains scoring formula with critical_pass/critical_count
      threshold and 4 bands: strong, viable, partial, weak)

  LOAD_AND_VERIFY("lib/references/platform-api.md",
    proof: content contains TYPE PlatformSpec and FUNCTION definitions for
      tool_name, hook_event, strip_fields, supported_tools)

  FOR platform IN platforms:
    LOAD_AND_VERIFY("lib/references/platforms/" + platform + ".md",
      proof: content contains REGISTRY[platform] with tools, hooks,
        manifest, frontmatter sections)

    LOAD_AND_VERIFY("lib/rubrics/" + platform + ".yaml",
      proof: file parses as YAML with categories containing conditions
        with id, type, check fields)

    rubric = load_yaml("lib/rubrics/" + platform + ".yaml")
```

- [ ] **Step 2: Verify**

Run: `grep -c 'LOAD_AND_VERIFY' skills/plugin-portability/SKILL.md`
Expected: count increased (should be at least 8 at this point)

- [ ] **Step 3: Commit**

```bash
git add skills/plugin-portability/SKILL.md
git commit -m "Add LOAD_AND_VERIFY gates to Phase 3 (Score) including platform API"
```

---

### Task 6: Add gates to Phase 5 (Generate)

**Files:**
- Modify: `skills/plugin-portability/SKILL.md`

- [ ] **Step 1: Insert gates before the allowed_categories call**

Find:

```
### Phase 5: Generate

```pseudocode
allowed = allowed_categories(computed.uplift_target)
```

Replace with:

```
### Phase 5: Generate

```pseudocode
LOAD_AND_VERIFY("lib/references/uplift-targets/registry.md",
  proof: allowed_categories(computed.uplift_target) returns a non-empty list)

LOAD_AND_VERIFY("lib/references/templates/registry.md",
  proof: TEMPLATE_REGISTRY contains 12 entries)

LOAD_AND_VERIFY("lib/patterns/manifest-generation.md",
  proof: content contains 3 rendering modes: plain, conditional, builder
    and per-schema GENERATE functions)

allowed = allowed_categories(computed.uplift_target)
```

- [ ] **Step 2: Verify**

Run: `grep -B1 -A1 'allowed = allowed_categories' skills/plugin-portability/SKILL.md`
Expected: LOAD_AND_VERIFY lines above the allowed= line

- [ ] **Step 3: Commit**

```bash
git add skills/plugin-portability/SKILL.md
git commit -m "Add LOAD_AND_VERIFY gates to Phase 5 (Generate)"
```

---

### Task 7: Add gates to Phases 6, 7, 8

**Files:**
- Modify: `skills/plugin-portability/SKILL.md`

- [ ] **Step 1: Replace Phase 6 (Port)**

Find:

```
### Phase 6: Port -- `lib/patterns/hook-merging.md`

Skipped if `"4_hooks" NOT IN allowed`.
```

Replace with:

```
### Phase 6: Port

```pseudocode
PORT(computed, intent):
  IF "4_hooks" NOT IN allowed: SKIP

  LOAD_AND_VERIFY("lib/patterns/hook-merging.md",
    proof: content contains GENERATE_CURSOR_HOOKS,
      GENERATE_CODEX_HOOKS, GENERATE_GEMINI_HOOK_GUIDANCE)

  # Execute hook porting as defined in hook-merging.md
```
```

- [ ] **Step 2: Replace Phase 7 (Document)**

Find:

```
### Phase 7: Document -- `lib/templates/install-docs/`

Always runs (`"6_install"` is in all allowed sets).
```

Replace with:

```
### Phase 7: Document

```pseudocode
DOCUMENT(computed, intent):
  GLOB_AND_VERIFY("lib/templates/install-docs/**/*.md",
    proof: list template files found, at least one per target platform)

  FOR platform IN intent.platforms:
    LOAD_AND_VERIFY install doc template for platform
    # Generate install documentation from template
```

Always runs (`"6_install"` is in all allowed sets).
```

- [ ] **Step 3: Replace Phase 8 (Bootstrap)**

Find:

```
### Phase 8: Bootstrap -- `lib/patterns/bootstrapping.md`

Skipped if `uplift_target == "curated-note-only"`.
```

Replace with:

```
### Phase 8: Bootstrap

```pseudocode
BOOTSTRAP(computed, intent):
  IF computed.uplift_target == "curated-note-only": SKIP

  LOAD_AND_VERIFY("lib/patterns/bootstrapping.md",
    proof: content contains steps 4.1 through 4.8)

  # Execute bootstrapping as defined in bootstrapping.md
```
```

- [ ] **Step 4: Verify total gate count**

Run: `grep -c 'LOAD_AND_VERIFY\|GLOB_AND_VERIFY' skills/plugin-portability/SKILL.md`
Expected: at least 12

- [ ] **Step 5: Verify no bare "Follow" or "References" directives remain**

Run: `grep -n '^Follow \|^References ' skills/plugin-portability/SKILL.md`
Expected: no output

- [ ] **Step 6: Commit**

```bash
git add skills/plugin-portability/SKILL.md
git commit -m "Add gates to Phases 6 (Port), 7 (Document), 8 (Bootstrap)"
```

---

### Task 8: Final verification

- [ ] **Step 1: Run all verification commands**

```bash
echo "=== 1. Gate count ===" && grep -c 'LOAD_AND_VERIFY\|GLOB_AND_VERIFY' skills/plugin-portability/SKILL.md
echo "=== 2. No bare Follow/References ===" && grep -n '^Follow \|^References ' skills/plugin-portability/SKILL.md
echo "=== 3. Pattern definitions present ===" && grep -n 'LOAD_AND_VERIFY(path, proof)' skills/plugin-portability/SKILL.md
echo "=== 4. GLOB pattern present ===" && grep -n 'GLOB_AND_VERIFY(pattern, proof)' skills/plugin-portability/SKILL.md
echo "=== 5. Platform API gate in Phase 3 ===" && grep -n 'platform-api.md' skills/plugin-portability/SKILL.md
echo "=== 6. GLOB in Phase 7 ===" && grep -n 'GLOB_AND_VERIFY.*install-docs' skills/plugin-portability/SKILL.md
echo "=== DONE ==="
```

Expected: check 1 returns >= 12, check 2 returns nothing, checks 3-6 each show at least one line.

- [ ] **Step 2: Commit verification passing (if any final fixups needed)**

No commit needed if all checks pass from Task 7.
