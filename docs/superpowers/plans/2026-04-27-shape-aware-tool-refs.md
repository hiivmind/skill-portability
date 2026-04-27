# Shape-Aware Tool Reference Placement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make tool reference placement shape-aware across rubrics, patterns, and our own repo. Closes #11 and #12.

**Architecture:** The key insight is: plugin-shaped repos have context files (CLAUDE.md, GEMINI.md, AGENTS.md) that make shared references reachable; bare-skill repos don't, so they need per-skill sidecars. We split rubric conditions by shape, update the inventory pattern, clean up our own repo's pointer files, and write the research document.

**Tech Stack:** YAML (rubrics), Markdown (patterns, research, context files). No code.

---

### Task 1: Write research document (#12)

**Files:**
- Create: `docs/research/per-platform-context-loading.md`

- [ ] **Step 1: Create the research document**

Create `docs/research/per-platform-context-loading.md` with the following content. This documents the 17 findings from our existing platform research docs.

```markdown
# Per-Platform Context Loading in Different Deployment Shapes

Research for GitHub issue #12. All findings sourced from `docs/platforms/*.md`.

## Key Finding

No platform has per-skill context isolation (except opt-in fork mode on
Claude Code and Cursor). In plugin mode, shared references are always
reachable via context files. In bare-skill mode, only the skill directory
and its siblings (scripts/, references/, assets/) are visible.

## Summary Table

| Platform | Context file | `@` includes? | Per-skill isolation? | Shared refs reachable (plugin)? | Shared refs reachable (bare-skill)? |
|----------|-------------|--------------|---------------------|-------------------------------|-------------------------------------|
| Claude Code | CLAUDE.md | Yes | No | Yes | No |
| Cursor | AGENTS.md | Yes | No (except fork) | Yes | No |
| Gemini CLI | GEMINI.md | Yes (`@` syntax) | No | Yes | No |
| Codex | AGENTS.md | No native `@` | No | Yes | No |
| Antigravity | AGENTS.md (highest priority) | Yes (`@` in rules) | No | Yes | No |
| OpenClaw | AGENTS.md | No native `@` | No | Yes | No |

## Per-Platform Findings

### Claude Code

**Q: CLAUDE.md always loaded — shared references reachable?**
Yes. CLAUDE.md is loaded by walking up the directory tree. All discovered files
are concatenated. Plugin skills share one context with no per-skill isolation.
(docs/platforms/claude-code.md lines 198-237)

**Q: Per-skill context isolation?**
No. All CLAUDE.md files, rules, and plugin content share one context. The only
isolation is `context: fork` on individual skills. (line 237)

### Cursor

**Q: Plugin install context loading?**
AGENTS.md is loaded if present. Plugin manifest components (skills, rules,
agents, commands) are loaded. Files referenced via `@` syntax are included.
(docs/platforms/cursor.md lines 266-308)

**Q: .cursor/rules/*.mdc as tool mapping channel?**
No. Rules provide AI guidance, not tool definitions. They are passive
guardrails. (line 287)

**Q: Per-skill isolation?**
No (except fork mode). All rules and skills load into the same context.
(lines 303-307)

### Gemini CLI

**Q: GEMINI.md loading — single blob or independent discovery?**
Single blob. GEMINI.md is loaded via `contextFileName` in the manifest. Per-skill
reference files are NOT discovered independently — they are reached only through
`@` include directives in GEMINI.md. (docs/platforms/gemini-cli.md lines 243-294)

**Q: Shared reference path — does `@./lib/references/` work?**
Yes. The `@` include syntax resolves relative paths from GEMINI.md's location.
`@./lib/references/gemini-tools.md` works identically to
`@./skills/{name}/references/gemini-tools.md`. (lines 243-260)

**Q: Per-skill isolation?**
No. All extension content loads into one shared context window. (lines 181-241)

### Codex

**Q: Skill-discovery mode — what files are visible?**
Only SKILL.md + siblings within the skill directory (scripts/, references/,
assets/). The entire repo is NOT visible. On startup, Codex reads only name,
description, and file path. (docs/platforms/codex.md lines 204-225)

**Q: AGENTS.md scoping in native-plugin mode?**
No per-skill scoping. AGENTS.md is loaded hierarchically from global → project
root → CWD. One concatenated result for all skills. (lines 284-296)

**Q: references/ at repo root discovered?**
No auto-discovery. Skills discover their own `references/` subdirectory.
Shared references at repo root need explicit inclusion from AGENTS.md or
SKILL.md body. (lines 201-210)

### Antigravity

**Q: Context file priority?**
AGENTS.md has highest priority (universal standard). GEMINI.md is
Antigravity-native, loaded if present but lower priority than AGENTS.md.
(docs/platforms/antigravity.md lines 144-150)

**Q: Skill-only distribution — what's visible?**
The skill directory structure including optional scripts/, examples/,
references/, assets/. These are loaded on demand. (lines 112-125)

**Q: .agent/rules/ content loading?**
Yes. Rules in `.agents/rules/` (plural, preferred) are loaded alongside skill
content. They support `@filename` references. (lines 156-167)

### OpenClaw

**Q: skills[] array affecting file visibility?**
The `agents.list[].skills` array restricts which skills are visible to each
agent. Non-empty list is the final set — no merging with defaults.
(docs/platforms/openclaw.md lines 106-127)

**Q: AGENTS.md scope?**
Plugin-wide. AGENTS.md is loaded once for all agents/skills at session start.
Sub-agents receive only AGENTS.md and TOOLS.md. (lines 210-235)

**Q: Tool mapping from manifest?**
No. configSchema and manifest fields don't provide tool mapping. Tools are
registered via the TypeScript Plugin SDK. (lines 69-72, 334-346)

## Implications for Shape-Aware Design

**Plugin shape (`full-portable-plugin`):**
- Context files always exist and are loaded
- Shared `lib/references/` or root `references/` is reachable via `@` includes
  (Gemini, Antigravity) or inline content (AGENTS.md for Codex/Cursor/OpenClaw,
  CLAUDE.md for Claude Code)
- Per-skill sidecars are redundant — shared references suffice

**Bare-skill shape (`bare-skill-repo`, `skill-first`):**
- No context files are installed alongside the skill
- Only the skill directory and its siblings are visible
- Per-skill sidecars in `references/` are the only way to provide tool mappings
- These must be full files, not pointer files (no `lib/` to point to)
```

- [ ] **Step 2: Verify the directory exists and commit**

```bash
mkdir -p docs/research
git add docs/research/per-platform-context-loading.md
git commit -m "docs: per-platform context loading research (closes #12)"
```

---

### Task 2: Make Gemini rubric shape-aware

**Files:**
- Modify: `lib/rubrics/gemini-cli.yaml`

The Gemini rubric has 4 sidecar conditions that all hardcode per-skill paths. Split them into shape-aware variants.

- [ ] **Step 1: Read and understand current conditions**

Read `lib/rubrics/gemini-cli.yaml` and find the 4 sidecar conditions:
- `gemini.5_toolmap.sidecar.exists` (critical) — checks `skills/{name}/references/gemini-tools.md`
- `gemini.5_toolmap.sidecar.read_mapping` — checks `read_file` in per-skill sidecar
- `gemini.5_toolmap.sidecar.edit_mapping` — checks `replace` in per-skill sidecar
- `gemini.5_toolmap.sidecar.bash_mapping` — checks `run_shell_command` in per-skill sidecar

Also find `gemini.3_context.gemini_md.at_includes_sidecars` which checks that GEMINI.md `@` includes per-skill sidecars.

- [ ] **Step 2: Replace sidecar.exists with shape-aware conditions**

Replace the single `gemini.5_toolmap.sidecar.exists` condition with two:

```yaml
    - id: gemini.5_toolmap.sidecar.per_skill
      type: checkable
      component: sidecar
      critical: true
      points: 1
      check: |
        # Only for bare-skill-repo / skill-first shapes
        IF shape IN ["bare-skill-repo", "skill-first"]:
          for skill_dir in glob_dirs("skills/*/"):
            name = basename(skill_dir)
            assert file_exists(f"skills/{name}/references/gemini-tools.md"), \
              f"skills/{name}/references/gemini-tools.md sidecar missing"
        ELSE:
          SKIP  # plugin shape — shared references checked below

    - id: gemini.5_toolmap.sidecar.shared_reachable
      type: judgement
      component: sidecar
      critical: true
      points: 1
      check: |
        # Only for full-portable-plugin shape
        IF shape == "full-portable-plugin":
          Verify Gemini tool mapping content is reachable via GEMINI.md.
          Check that GEMINI.md contains an @ include pointing to a file
          with "read_file", "replace", and "run_shell_command" mappings.
          The file can be at any path (shared lib/references/ or per-skill).
        ELSE:
          SKIP  # bare-skill shape — per-skill sidecars checked above
```

- [ ] **Step 3: Update the mapping-content conditions**

Replace the 3 individual mapping conditions (read, edit, bash) with one combined condition that works for both shapes:

```yaml
    - id: gemini.5_toolmap.sidecar.mapping_content
      type: checkable
      component: sidecar
      critical: false
      points: 1
      check: |
        # Find all gemini-tools.md files (per-skill or shared)
        sidecars = glob("**/gemini-tools.md")
        assert len(sidecars) > 0, "No gemini-tools.md found anywhere"
        for sidecar in sidecars:
          content = read(sidecar)
          assert "read_file" in content, f"{sidecar}: missing Read → read_file"
          assert "replace" in content, f"{sidecar}: missing Edit → replace"
          assert "run_shell_command" in content, f"{sidecar}: missing Bash → run_shell_command"
```

- [ ] **Step 4: Update the GEMINI.md includes condition**

Find `gemini.3_context.gemini_md.at_includes_sidecars` and replace it:

```yaml
    - id: gemini.3_context.gemini_md.at_includes_tool_refs
      type: checkable
      component: gemini_md
      critical: true
      points: 1
      check: |
        # Only for full-portable-plugin shape
        IF shape == "full-portable-plugin":
          content = read("GEMINI.md")
          assert "@" in content and "gemini-tools.md" in content, \
            "GEMINI.md must @ include a gemini-tools.md (shared or per-skill)"
        ELSE:
          SKIP  # bare-skill — no GEMINI.md to check
```

- [ ] **Step 5: Commit**

```bash
git add lib/rubrics/gemini-cli.yaml
git commit -m "fix: gemini rubric — shape-aware sidecar conditions for plugin vs bare-skill"
```

---

### Task 3: Make Codex rubric shape-aware

**Files:**
- Modify: `lib/rubrics/codex.yaml`

The Codex rubric checks `references/codex-tools.md` at a shared path. Add a per-skill variant for bare-skill shapes.

- [ ] **Step 1: Replace sidecar.exists with shape-aware conditions**

Read `lib/rubrics/codex.yaml` and find `codex.5_toolmap.sidecar.exists`. Replace with:

```yaml
    - id: codex.5_toolmap.sidecar.per_skill
      type: checkable
      component: sidecar
      critical: true
      points: 1
      check: |
        IF shape IN ["bare-skill-repo", "skill-first"]:
          for skill_dir in glob_dirs("skills/*/") + glob_dirs(".agents/skills/*/"):
            name = basename(skill_dir)
            skill_path = skill_dir + "/references/codex-tools.md"
            assert file_exists(skill_path), \
              f"{skill_path} sidecar missing"
        ELSE:
          SKIP

    - id: codex.5_toolmap.sidecar.shared_reachable
      type: judgement
      component: sidecar
      critical: true
      points: 1
      check: |
        IF shape == "full-portable-plugin":
          Verify Codex tool mapping content is reachable — either via
          shared references/codex-tools.md, lib/references/codex-tools.md,
          or documented in AGENTS.md directly. Must contain "spawn_agent"
          and "apply_patch" mappings.
        ELSE:
          SKIP
```

- [ ] **Step 2: Update mapping content conditions**

Update `codex.5_toolmap.sidecar.spawn_agent_mapped` and `codex.5_toolmap.sidecar.update_plan_mapped` to search any codex-tools.md (not just `references/codex-tools.md`):

```yaml
    - id: codex.5_toolmap.sidecar.spawn_agent_mapped
      type: checkable
      component: sidecar
      critical: true
      points: 1
      check: |
        sidecars = glob("**/codex-tools.md")
        assert len(sidecars) > 0, "No codex-tools.md found"
        found = false
        for sidecar in sidecars:
          if "spawn_agent" in read(sidecar): found = true
        assert found, "No codex-tools.md documents Task/Agent → spawn_agent"

    - id: codex.5_toolmap.sidecar.update_plan_mapped
      type: checkable
      component: sidecar
      critical: false
      points: 1
      check: |
        sidecars = glob("**/codex-tools.md")
        if len(sidecars) > 0:
          found = false
          for sidecar in sidecars:
            if "update_plan" in read(sidecar): found = true
          assert found, "No codex-tools.md documents TodoWrite → update_plan"
```

- [ ] **Step 3: Commit**

```bash
git add lib/rubrics/codex.yaml
git commit -m "fix: codex rubric — shape-aware sidecar conditions for plugin vs bare-skill"
```

---

### Task 4: Add shared-reference conditions to Cursor, Antigravity, OpenClaw

**Files:**
- Modify: `lib/rubrics/cursor.yaml`
- Modify: `lib/rubrics/antigravity.yaml`
- Modify: `lib/rubrics/openclaw.yaml`

These rubrics currently have no sidecar conditions. Add a shared-reachable condition for plugin shape. For bare-skill shape, tool mappings are provided via the AGENTS.md tool mapping table (already generated by the AGENTS.md.tmpl template).

- [ ] **Step 1: Add to cursor.yaml**

Read `lib/rubrics/cursor.yaml` and find the `5_toolmap` conditions section. Add before the `model_mapping` conditions:

```yaml
    - id: cursor.5_toolmap.tool_refs.reachable
      type: judgement
      component: sidecar
      critical: false
      points: 1
      check: |
        Cursor uses the same tool names as Claude Code — no tool mapping
        sidecar is strictly required. However, verify that AGENTS.md or
        a cursor-tools.md reference documents any Cursor-specific
        differences (hook format, model handling, MCP path).
```

- [ ] **Step 2: Add to antigravity.yaml**

Read `lib/rubrics/antigravity.yaml` and find the `5_toolmap` conditions. Add before the `model_mapping` conditions:

```yaml
    - id: antigravity.5_toolmap.tool_refs.reachable
      type: judgement
      component: sidecar
      critical: true
      points: 1
      check: |
        Antigravity uses completely different tool names from Claude Code
        (view_file, run_command, grep_search, etc.). Verify that tool
        mapping content is reachable:
        IF shape == "full-portable-plugin":
          Via AGENTS.md tool mapping section, GEMINI.md @ includes, or
          shared antigravity-tools.md reference
        ELIF shape IN ["bare-skill-repo", "skill-first"]:
          Via per-skill references/antigravity-tools.md sidecar
```

- [ ] **Step 3: Add to openclaw.yaml**

Read `lib/rubrics/openclaw.yaml` and find the `5_toolmap` conditions. Add before the `model_mapping` conditions:

```yaml
    - id: openclaw.5_toolmap.tool_refs.reachable
      type: judgement
      component: sidecar
      critical: false
      points: 1
      check: |
        OpenClaw shares most tool names with Claude Code but has no
        Task/Agent or TodoWrite tools. Verify that AGENTS.md or an
        openclaw-tools.md reference documents these differences and
        the agents.list[] manifest-based agent dispatch pattern.
```

- [ ] **Step 4: Commit**

```bash
git add lib/rubrics/cursor.yaml lib/rubrics/antigravity.yaml lib/rubrics/openclaw.yaml
git commit -m "fix: cursor/antigravity/openclaw rubrics — add tool reference reachability conditions"
```

---

### Task 5: Make inventory pattern shape-aware

**Files:**
- Modify: `lib/patterns/inventory.md`

- [ ] **Step 1: Update section 2.4**

Read `lib/patterns/inventory.md` and find section 2.4 (Check Per-Skill Sidecars, around lines 62-72). Current code:

```
sidecar_files = ["codex-tools.md", "gemini-tools.md"]
computed.sidecar_results = []

FOR skill IN computed.skills:
  FOR sidecar IN sidecar_files:
    target = "skills/" + skill.dir + "/references/" + sidecar
    status = IF file_exists(plugin_path + "/" + target) THEN "PRESENT" ELSE "MISSING"
    computed.sidecar_results.append({ skill: skill.dir, file: sidecar, status: status })
```

Replace with shape-aware version:

```
sidecar_files = ["codex-tools.md", "gemini-tools.md", "cursor-tools.md",
                 "antigravity-tools.md", "openclaw-tools.md"]
computed.sidecar_results = []

IF computed.shape IN ["bare-skill-repo", "skill-first"]:
  # Bare skills need per-skill sidecars — no context file to carry shared refs
  FOR skill IN computed.skills:
    FOR sidecar IN sidecar_files:
      target = "skills/" + skill.dir + "/references/" + sidecar
      status = IF file_exists(plugin_path + "/" + target) THEN "PRESENT" ELSE "MISSING"
      computed.sidecar_results.append({ skill: skill.dir, file: sidecar, status: status })

ELIF computed.shape == "full-portable-plugin":
  # Plugins have context files — check shared references instead
  shared_paths = ["lib/references/", "references/"]
  FOR sidecar IN sidecar_files:
    found = false
    FOR shared IN shared_paths:
      IF file_exists(plugin_path + "/" + shared + sidecar):
        found = true
        computed.sidecar_results.append({ skill: "(shared)", file: shared + sidecar, status: "PRESENT" })
        BREAK
    IF NOT found:
      computed.sidecar_results.append({ skill: "(shared)", file: sidecar, status: "MISSING" })
```

- [ ] **Step 2: Commit**

```bash
git add lib/patterns/inventory.md
git commit -m "fix: inventory pattern — shape-aware sidecar discovery (per-skill vs shared)"
```

---

### Task 6: Clean up our own repo

**Files:**
- Delete: 10 pointer files in `skills/*/references/`
- Modify: `GEMINI.md`

- [ ] **Step 1: Delete all 10 pointer files**

```bash
rm skills/using-skill-portability/references/gemini-tools.md
rm skills/using-skill-portability/references/codex-tools.md
rm skills/using-skill-portability/references/cursor-tools.md
rm skills/using-skill-portability/references/antigravity-tools.md
rm skills/using-skill-portability/references/openclaw-tools.md
rm skills/plugin-portability/references/gemini-tools.md
rm skills/plugin-portability/references/codex-tools.md
rm skills/plugin-portability/references/cursor-tools.md
rm skills/plugin-portability/references/antigravity-tools.md
rm skills/plugin-portability/references/openclaw-tools.md
```

If the `references/` directories are now empty, remove them too:

```bash
rmdir skills/using-skill-portability/references/ 2>/dev/null
rmdir skills/plugin-portability/references/ 2>/dev/null
```

- [ ] **Step 2: Update GEMINI.md**

Read `GEMINI.md`. Current content has 10 per-skill `@` includes for tool references (lines 8-12, 14-18). Replace with 5 shared includes pointing to `lib/references/`.

Replace the entire file content with:

```markdown
# Skill Portability

Make any plugin fully portable across all platforms. Accepts Claude Code, Cursor, Gemini, Codex, Antigravity, OpenClaw, or bare SKILL.md repos as input. Emits every missing platform artifact.

## Skills

@./skills/using-skill-portability/SKILL.md
@./skills/plugin-portability/SKILL.md

## Tool References

@./lib/references/gemini-tools.md
@./lib/references/codex-tools.md
@./lib/references/cursor-tools.md
@./lib/references/antigravity-tools.md
@./lib/references/openclaw-tools.md

## Platform Accuracy Constraint

Every platform-specific claim in this repo must be consistent with the researched
platform reference docs. Before changing any file that makes platform-specific
claims, cross-reference:

1. **Research docs** — `docs/platforms/*.md` (sourced, with inline citations)
2. **Reconciliation matrix** — `docs/reconciliation-matrix.md` (tracks known
   discrepancies and their fix status)
3. **Canonical lookup tables** — `lib/references/platform-mappings.md` (single
   source of truth consumed by rubrics)

If you find a conflict between these sources, trust the researched platform docs
(they have citations). Update the reconciliation matrix when fixing discrepancies
or discovering new ones.
```

- [ ] **Step 3: Verify shared references exist**

```bash
ls lib/references/gemini-tools.md lib/references/codex-tools.md lib/references/cursor-tools.md lib/references/antigravity-tools.md lib/references/openclaw-tools.md
```

Expected: all 5 files listed.

- [ ] **Step 4: Commit**

```bash
git add -A skills/using-skill-portability/references/ skills/plugin-portability/references/ GEMINI.md
git commit -m "fix: remove per-skill pointer files, use shared lib/references/ via GEMINI.md (closes #11)"
```

---

### Task 7: Fix Antigravity context file priority

**Files:**
- Modify: `lib/references/antigravity-tools.md`

- [ ] **Step 1: Fix the priority claim**

Read `lib/references/antigravity-tools.md` and find the Context files section (around line 60-64). Current:

```markdown
### Context files

- Primary: `AGENTS.md`
- `GEMINI.md` takes higher priority when both exist
- Additional: `.agent/rules/*.md` for rule-based agent bodies
```

The second line contradicts the first and contradicts research (docs/platforms/antigravity.md lines 144-150) which says AGENTS.md has highest priority.

Replace with:

```markdown
### Context files

- `AGENTS.md` has highest priority (universal standard)
- `GEMINI.md` is Antigravity-native, loaded if present
- Additional: `.agents/rules/*.md` for rule-based agent bodies
```

- [ ] **Step 2: Commit**

```bash
git add lib/references/antigravity-tools.md
git commit -m "fix: antigravity-tools — AGENTS.md has highest priority, not GEMINI.md"
```

---

### Task 8: Update reconciliation matrix and close issues

**Files:**
- Modify: `docs/reconciliation-matrix.md`

- [ ] **Step 1: Update section 6**

Read `docs/reconciliation-matrix.md` and find section 6 (Per-Skill Sidecars). Replace:

```markdown
## 6. Per-Skill Sidecars (`skills/*/references/`)

| File | Current | Status |
|------|---------|--------|
| All 10 pointer files | One-liner redirects to lib/references/ | Theatre (issue #11) |

These are tracked under GitHub issues #11 and #12, not this matrix.
```

With:

```markdown
## 6. Per-Skill Sidecars (`skills/*/references/`)

| File | Current | Status |
|------|---------|--------|
| All 10 pointer files | Deleted — shared lib/references/ used via GEMINI.md @includes | Fixed (#11) |

Resolved: rubric conditions are now shape-aware. Plugins use shared references
via context files. Bare-skill repos use per-skill sidecars. Research documented
in `docs/research/per-platform-context-loading.md` (#12).
```

- [ ] **Step 2: Commit**

```bash
git add docs/reconciliation-matrix.md
git commit -m "fix: reconciliation matrix — mark per-skill sidecar issue resolved"
```

- [ ] **Step 3: Close GitHub issues**

```bash
gh issue close 12 --comment "Research completed in docs/research/per-platform-context-loading.md. Key finding: no platform has per-skill context isolation. Plugin shape → shared refs via context files. Bare-skill shape → per-skill sidecars required."

gh issue close 11 --comment "Implemented: rubric 5_toolmap conditions are now shape-aware. Plugin shape checks shared references via context files. Bare-skill shape checks per-skill sidecars. 10 pointer files removed from our repo, GEMINI.md updated to use shared lib/references/."
```

---

## Verification Checklist

After all tasks complete:

```bash
# Pointer files deleted
ls skills/*/references/*.md 2>/dev/null
# Expected: no output (or just non-pointer files)

# GEMINI.md uses shared includes
grep "@./lib/references/" GEMINI.md | wc -l
# Expected: 5

# No per-skill sidecar @ includes in GEMINI.md
grep "@./skills/.*/references/" GEMINI.md | wc -l
# Expected: 0

# Shared references all exist
ls lib/references/{gemini,codex,cursor,antigravity,openclaw}-tools.md | wc -l
# Expected: 5

# Research doc exists
ls docs/research/per-platform-context-loading.md
# Expected: file listed

# Issues closed
gh issue list --state open
# Expected: 0 open issues
```
