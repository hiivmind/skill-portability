# Shape-Aware Tool Reference Placement — Design Spec

**Goal:** Make tool reference file placement shape-aware in rubrics, generation
patterns, and our own repo structure. Closes GitHub issues #11 and #12.

**Context:** The plugin-portability skill analyzes and uplifts external repos.
Those repos can be bare-skill-repos (just skills, no manifests/context files) or
full-portable-plugins (manifests + context files). Where tool reference files
should live depends on the target repo's shape — not a hardcoded convention.

---

## Part 1: Research Document (#12)

Write `docs/research/per-platform-context-loading.md` documenting findings from
existing platform research (`docs/platforms/*.md`). Key findings:

### Summary table

| Platform | Context file | `@` includes? | Per-skill isolation? | Shared refs reachable (plugin)? | Shared refs reachable (bare-skill)? |
|----------|-------------|--------------|---------------------|-------------------------------|-------------------------------------|
| Claude Code | CLAUDE.md | Yes | No | Yes | No — only skill dir visible |
| Cursor | AGENTS.md | Yes | No (except fork) | Yes | No |
| Gemini CLI | GEMINI.md | Yes (`@` syntax) | No | Yes | No |
| Codex | AGENTS.md | No native `@` | No | Yes (AGENTS.md loaded) | No — only SKILL.md + siblings |
| Antigravity | AGENTS.md (highest), GEMINI.md | Yes (`@` syntax) | No | Yes | No — only skill dir + references/ |
| OpenClaw | AGENTS.md | No native `@` | No | Yes (plugin-wide load) | No |

### Key insight

**No platform has per-skill context isolation** (except fork mode). In plugin
mode, shared references are always reachable via context files. In bare-skill
mode, only the skill directory is visible — per-skill sidecars are required.

---

## Part 2: Rubric Changes (#11)

### Current problem

The `5_toolmap.sidecar.*` conditions hardcode one placement pattern:
- Gemini rubric: requires per-skill `skills/{name}/references/gemini-tools.md`
- Codex rubric: requires shared `references/codex-tools.md`

Neither is shape-aware. The Gemini rubric forces per-skill sidecars even for
plugins where GEMINI.md `@` includes make shared refs reachable.

### New shape-aware conditions

Each platform's `5_toolmap.sidecar.*` conditions get a shape branch:

```yaml
# For bare-skill-repo / skill-first targets:
- id: {platform}.5_toolmap.sidecar.per_skill
  type: checkable
  check: |
    IF shape == "skill-first":
      for skill in skills:
        assert file_exists("skills/{name}/references/{platform}-tools.md")

# For full-portable-plugin targets:
- id: {platform}.5_toolmap.sidecar.shared_reachable
  type: judgement
  check: |
    IF shape == "full-portable-plugin":
      Verify tool mapping content is reachable via context file
      (GEMINI.md @ includes, AGENTS.md inline, CLAUDE.md inline)
      or via shared references/ directory
```

The existing `sidecar.exists` conditions become the `per_skill` variant.
New `shared_reachable` conditions are added for the plugin variant.

### Platforms with specific changes

**gemini-cli.yaml:**
- `gemini.5_toolmap.sidecar.exists` → split into per_skill (bare) and shared (plugin)
- `gemini.3_context.gemini_md.at_includes_sidecars` → rename to
  `at_includes_tool_refs` — checks for `@` include of gemini-tools.md at ANY
  path (per-skill or shared), not hardcoded per-skill

**codex.yaml:**
- `codex.5_toolmap.sidecar.exists` → already shared-friendly; add per_skill
  variant for bare-skill-repos

**cursor.yaml, antigravity.yaml, openclaw.yaml:**
- Add `5_toolmap.sidecar.shared_reachable` condition for plugin shape
- These platforms currently have no sidecar conditions — they rely on
  AGENTS.md tool mapping section (which is correct for plugins)

---

## Part 3: Generation Logic

Update `lib/patterns/inventory.md` sidecar checks:

**Section 2.4 (Check Per-Skill Sidecars):**
- Add shape awareness: only check per-skill sidecars if shape is
  `bare-skill-repo` or `skill-first`
- For `full-portable-plugin`: check shared references instead

Update `lib/patterns/manifest-generation.md` or create a new pattern for
tool-ref placement:
- `bare-skill-repo` → generate `skills/{name}/references/{platform}-tools.md`
  (full content, not pointers)
- `full-portable-plugin` → generate shared `lib/references/{platform}-tools.md`
  or `references/{platform}-tools.md` + context file `@` includes

---

## Part 4: Clean Up Our Own Repo

This repo is a `full-portable-plugin`. Per-skill pointer files are unnecessary.

### Delete pointer files (10 files)

```
skills/using-plugin-portability/references/gemini-tools.md
skills/using-plugin-portability/references/codex-tools.md
skills/using-plugin-portability/references/cursor-tools.md
skills/using-plugin-portability/references/antigravity-tools.md
skills/using-plugin-portability/references/openclaw-tools.md
skills/plugin-portability/references/gemini-tools.md
skills/plugin-portability/references/codex-tools.md
skills/plugin-portability/references/cursor-tools.md
skills/plugin-portability/references/antigravity-tools.md
skills/plugin-portability/references/openclaw-tools.md
```

### Update GEMINI.md

Change `@` includes from per-skill paths:
```
@./skills/using-plugin-portability/references/gemini-tools.md
@./skills/plugin-portability/references/gemini-tools.md
```

To shared path (once):
```
@./lib/references/gemini-tools.md
@./lib/references/codex-tools.md
@./lib/references/cursor-tools.md
@./lib/references/antigravity-tools.md
@./lib/references/openclaw-tools.md
```

### Update reconciliation matrix

Replace the section 6 (Per-Skill Sidecars) "Theatre (issue #11)" note with
"Resolved — pointer files removed, shared references used".

---

## Part 5: Fix Antigravity Context File Priority

Research found AGENTS.md is highest priority in Antigravity, not GEMINI.md.

Fix `lib/references/antigravity-tools.md` line 42:
```
- `GEMINI.md` takes higher priority when both exist
```
→
```
- `AGENTS.md` has highest priority (universal standard)
- `GEMINI.md` is Antigravity-native, loaded if present
```

---

## Exclusions

- No changes to SKILL.md pseudocode (Phase 5 ALLOWED_CATEGORIES already correct)
- No changes to template files themselves (they generate correct output)
- No changes to install docs
- Hook templates/patterns not affected

---

## Success Criteria

- Research document written with all 17 findings
- Rubric `5_toolmap` conditions are shape-aware
- Inventory pattern is shape-aware
- 10 pointer files deleted from our repo
- GEMINI.md uses shared `@` includes
- Antigravity context priority corrected
- Issues #11 and #12 closeable
