# Reference Verification Gates

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add LOAD_AND_VERIFY gates to every phase in SKILL.md that depends on external references, ensuring the LLM reads each file, proves it read it, and follows its instructions.

**Architecture:** A `LOAD_AND_VERIFY` pseudocode pattern inserted before each phase's logic. Each gate names the file, forces a Read, extracts a proof value, displays a checkpoint, and halts if the file is missing or unreadable. No changes to the external reference files themselves.

**Tech Stack:** Pseudocode in SKILL.md.

---

## The Pattern

```pseudocode
LOAD_AND_VERIFY(path, proof):
  content = Read(path)
  IF content IS empty OR unreadable:
    HALT "Cannot proceed: {path} not found or empty"
  extracted = proof(content)
  DISPLAY "Loaded {path}: {extracted}"
```

The `proof` function is phase-specific — it extracts something that can only
come from actually reading the file.

---

## Gates by Phase

### Phase 1: Detect

Currently says: `Follow lib/patterns/detection-algorithm.md.`

Replace with:

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

### Phase 2: Inventory

Currently says: `Follow lib/patterns/inventory.md.`

Replace with:

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

### Phase 0b: Uplift Target

Currently references UPLIFT_TARGETS inline. Add a gate:

```pseudocode
INTENT_UPLIFT_TARGET(computed):
  IF intent.mode != "uplift": RETURN

  LOAD_AND_VERIFY("lib/references/uplift-targets/registry.md",
    proof: UPLIFT_TARGETS contains 3 entries:
      skill-first, full-portable-plugin, curated-note-only)

  # Derive recommendation from shape (unchanged)
  ...
```

### Phase 3: Score

Currently says: `References lib/rubrics/rubric-framework.md and lib/rubrics/*.yaml.`

Replace with:

```pseudocode
SCORE(computed, platforms):
  LOAD_AND_VERIFY("lib/rubrics/rubric-framework.md",
    proof: content contains scoring formula with critical_pass/critical_count
      threshold and 4 bands: strong, viable, partial, weak)

  FOR platform IN platforms:
    LOAD_AND_VERIFY("lib/rubrics/" + platform + ".yaml",
      proof: file parses as YAML with categories containing conditions
        with id, type, check fields)

    rubric = load_yaml("lib/rubrics/" + platform + ".yaml")
    ...
```

### Phase 5: Generate

Currently uses `allowed_categories()` and `template_for_path()`. Add gates:

```pseudocode
GENERATE(computed, intent):
  LOAD_AND_VERIFY("lib/references/uplift-targets/registry.md",
    proof: allowed_categories(computed.uplift_target) returns a non-empty list)

  LOAD_AND_VERIFY("lib/references/templates/registry.md",
    proof: TEMPLATE_REGISTRY contains 12 entries)

  LOAD_AND_VERIFY("lib/patterns/manifest-generation.md",
    proof: content contains 3 rendering modes: plain, conditional, builder
      and per-schema GENERATE functions)

  allowed = allowed_categories(computed.uplift_target)
  ...
```

### Phase 6: Port

Currently says: `lib/patterns/hook-merging.md`

Replace with:

```pseudocode
PORT(computed, intent):
  IF "4_hooks" NOT IN allowed: SKIP

  LOAD_AND_VERIFY("lib/patterns/hook-merging.md",
    proof: content contains GENERATE_CURSOR_HOOKS,
      GENERATE_CODEX_HOOKS, GENERATE_GEMINI_HOOK_GUIDANCE)

  # Execute hook porting as defined in hook-merging.md
```

### Phase 7: Document

Currently says: `lib/templates/install-docs/`

Replace with:

```pseudocode
DOCUMENT(computed, intent):
  LOAD_AND_VERIFY("lib/templates/install-docs/",
    proof: directory contains install doc templates;
      list files found)

  # Generate install documentation per platform from templates
```

### Phase 8: Bootstrap

Currently says: `lib/patterns/bootstrapping.md`

Replace with:

```pseudocode
BOOTSTRAP(computed, intent):
  IF computed.uplift_target == "curated-note-only": SKIP

  LOAD_AND_VERIFY("lib/patterns/bootstrapping.md",
    proof: content contains steps 4.1 through 4.8)

  # Execute bootstrapping as defined in bootstrapping.md
```

---

## What Does NOT Change

- **External reference files** — No changes to patterns, rubrics, registries, or templates
- **Phase pseudocode summaries** — The brief algorithm outlines stay as orientation
- **External references index** — The `> **External references:**` block at the top of SKILL.md stays

---

## Verification

After all edits:

1. Every phase that previously said "Follow ..." or "References ..." now has a `LOAD_AND_VERIFY` block
2. `grep -c 'LOAD_AND_VERIFY' skills/plugin-portability/SKILL.md` returns at least 10
3. No phase begins executing logic before its gate passes
4. Each gate's proof value is specific enough that it can only be satisfied by reading the actual file
