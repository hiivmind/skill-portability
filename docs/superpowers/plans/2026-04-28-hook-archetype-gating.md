# Hook & Using-Skill Archetype Gating Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make hooks and using-skill generation conditional on plugin archetype (always-present vs on-demand), remove them from this on-demand repo, and create a using-skill template modelled on superpowers.

**Architecture:** Four sequential phases: (1) delete hooks/using-skill from this repo, (2) add archetype question + Phase 8 gate to the skill, (3) create using-skill template, (4) update patterns, references, and CI.

**Tech Stack:** Markdown, YAML pseudocode, GitHub Actions YAML, bash

---

### Task 1: Delete hooks and using-skill from this repo

**Files:**
- Delete: `skills/using-plugin-portability/SKILL.md`
- Delete: `hooks/hooks.json`
- Delete: `hooks/hooks-cursor.json`
- Delete: `hooks/session-start`
- Delete: `hooks/run-hook.cmd`
- Modify: `GEMINI.md:7`

- [ ] **Step 1: Delete the using-skill directory**

Run:

```bash
git rm -r skills/using-plugin-portability/
```

- [ ] **Step 2: Delete the hooks directory**

Run:

```bash
git rm -r hooks/
```

- [ ] **Step 3: Remove using-skill include from GEMINI.md**

In `GEMINI.md`, remove line 7:

```
@./skills/using-plugin-portability/SKILL.md
```

So the Skills section becomes:

```markdown
## Skills

@./skills/plugin-portability/SKILL.md
```

- [ ] **Step 4: Verify deletions**

Run: `ls skills/using-plugin-portability 2>/dev/null; ls hooks/ 2>/dev/null; grep "using-plugin-portability" GEMINI.md`

Expected: all three commands produce no output (directory not found, directory not found, no grep match).

- [ ] **Step 5: Commit**

```bash
git add GEMINI.md
git commit -m "feat: remove hooks and using-skill from on-demand plugin"
```

---

### Task 2: Remove hooks check from CI

**Files:**
- Modify: `.github/workflows/ci.yml:107-113`

- [ ] **Step 1: Remove the Session-Start Hook check block**

In `.github/workflows/ci.yml`, remove lines 106-113 (the `=== Session-Start Hook ===` block):

```yaml
          echo ""
          echo "=== Session-Start Hook ==="
          if [ ! -x hooks/session-start ]; then
            echo "FAIL: hooks/session-start does not exist or is not executable"
            errors=$((errors + 1))
          else
            echo "OK: hooks/session-start (executable)"
          fi
```

- [ ] **Step 2: Verify CI file is valid YAML**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"`

Expected: no output (valid YAML).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: remove hooks/session-start check (on-demand plugin has no hooks)"
```

---

### Task 3: Add archetype question to skill intent-gathering

**Files:**
- Modify: `skills/plugin-portability/SKILL.md:70-116` (Phase 0a: Intent)

- [ ] **Step 1: Add Q3 archetype question after Q2**

In `skills/plugin-portability/SKILL.md`, find the line:

```
  RETURN { mode, platforms }
```

Replace it with:

```pseudocode
  # Q3: Archetype
  archetype = AskUserQuestion(
    question: "What is this plugin's invocation pattern?",
    header: "Archetype",
    options: [
      { label: "On-demand",      description: "Called explicitly when the user needs it (e.g., portability tools, code generators)" },
      { label: "Always-present", description: "Governs workflows on every session — needs context injection (e.g., superpowers, single-purpose agents)" }
    ],
    multiSelect: false
  )

  RETURN { mode, platforms, archetype }
```

- [ ] **Step 2: Add archetype gate to Phase 8**

In `skills/plugin-portability/SKILL.md`, find the Phase 8 block:

```pseudocode
BOOTSTRAP(computed, intent):
  IF computed.uplift_target == "curated-note-only": SKIP

  LOAD_AND_VERIFY("lib/patterns/bootstrapping.md",
    proof: content contains steps 4.1 through 4.8)

  # Execute bootstrapping as defined in bootstrapping.md
```

Replace with:

```pseudocode
BOOTSTRAP(computed, intent):
  IF computed.uplift_target == "curated-note-only": SKIP
  IF intent.archetype == "on-demand":
    REPORT "Bootstrapping: skipped (on-demand plugin — hooks and using-skill not applicable)"
    SKIP

  LOAD_AND_VERIFY("lib/patterns/bootstrapping.md",
    proof: content contains steps 4.1 through 4.8)

  # Execute bootstrapping as defined in bootstrapping.md
```

- [ ] **Step 3: Verify the edits**

Run: `grep -n "archetype" skills/plugin-portability/SKILL.md`

Expected: hits for Q3 question, RETURN statement, and Phase 8 gate.

- [ ] **Step 4: Commit**

```bash
git add skills/plugin-portability/SKILL.md
git commit -m "feat: add archetype question and Phase 8 gate for on-demand plugins"
```

---

### Task 4: Create using-skill template

**Files:**
- Create: `lib/templates/context-files/using-skill.md.tmpl`

- [ ] **Step 1: Write the template**

Write to `lib/templates/context-files/using-skill.md.tmpl`:

```markdown
{{! fixes: bootstrap.using_skill }}
---
name: using-{{name}}
description: {{usingSkillDescription}}
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are
doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way
out of this.
</EXTREMELY-IMPORTANT>

## Instruction Priority

{{name}} skills override default system prompt behavior, but **user
instructions always take precedence**:

1. **User's explicit instructions** (CLAUDE.md, GEMINI.md, AGENTS.md, direct
   requests) — highest priority
2. **{{name}} skills** — override default system behavior where they conflict
3. **Default system prompt** — lowest priority

## How to Access Skills

**In Claude Code:** Use the `Skill` tool.

**In Cursor:** Use the `Skill` tool.

**In Gemini CLI:** Skills activate via the `activate_skill` tool.

**In other environments:** Check your platform's documentation for how skills
are loaded.

## Platform Adaptation

Skills use Claude Code tool names. Non-CC platforms: see `lib/references/`
for platform-specific tool equivalents.

# Using Skills

## The Rule

**Invoke relevant or requested skills BEFORE any response or action.** Even a
1% chance a skill might apply means you should invoke the skill to check. If
an invoked skill turns out to be wrong for the situation, you don't need to
use it.

## Available Skills

{{skillTable}}

## Red Flags

These thoughts mean STOP — you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |

## Skill Types

**Rigid** (TDD, debugging): Follow exactly. Don't adapt away discipline.

**Flexible** (patterns): Adapt principles to context.

The skill itself tells you which.

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip
workflows.
```

- [ ] **Step 2: Verify the template has the expected variables**

Run: `grep -c "{{name}}\|{{usingSkillDescription}}\|{{skillTable}}" lib/templates/context-files/using-skill.md.tmpl`

Expected: at least 5 (multiple `{{name}}` occurrences + 1 each for the others).

- [ ] **Step 3: Commit**

```bash
git add lib/templates/context-files/using-skill.md.tmpl
git commit -m "feat: add using-skill template modelled on superpowers"
```

---

### Task 5: Update bootstrapping.md

**Files:**
- Modify: `lib/patterns/bootstrapping.md:1-50`

- [ ] **Step 1: Add archetype gate and update description**

Replace lines 1-3 of `lib/patterns/bootstrapping.md`:

```markdown
# Bootstrapping

Session-start injection logic for generating the `using-<plugin>` skill and associated hooks that force-inject plugin context at session start across all platforms.
```

With:

```markdown
# Bootstrapping

Session-start injection logic for **always-present** plugins. Generates the `using-<plugin>` skill and associated hooks that force-inject plugin context at session start across all platforms.

**On-demand plugins skip this entirely.** The archetype gate in Phase 8 prevents bootstrapping from running for on-demand plugins. Hooks and using-skills are context injection — they are NOT required for plugin discovery on any platform. All 6 platforms discover plugins/skills via directory scanning.

**When bootstrapping is valuable:** Plugins that govern workflows and must intercept every interaction (e.g., superpowers, single-purpose OpenClaw agents). The using-skill ensures the agent treats the plugin's skills as mandatory workflow gates.

**When bootstrapping is unnecessary:** Plugins invoked explicitly when needed (e.g., portability assessment, code generation tools). These rely on directory auto-discovery and save context budget by not injecting on every session.
```

- [ ] **Step 2: Update Step 4.1 to add archetype check**

In `lib/patterns/bootstrapping.md`, find:

```
IF skills/using-{{name}}/SKILL.md exists THEN
```

Add before it:

```
IF intent.archetype == "on-demand" THEN
  skip_bootstrapping = true
  reason = "on-demand archetype — hooks and using-skill not applicable"
  skip to Step 4.8 (final report note)
END
```

- [ ] **Step 3: Update Step 4.2 to reference the template**

In `lib/patterns/bootstrapping.md`, find lines 41-42:

```
Write <plugin-path>/skills/using-{{name}}/SKILL.md with template below,
substituting {{name}}, {{displayName}}, {{skillTable}}.
```

Replace with:

```
Write <plugin-path>/skills/using-{{name}}/SKILL.md using the template at
lib/templates/context-files/using-skill.md.tmpl, substituting:
  - {{name}} = plugin name
  - {{usingSkillDescription}} = generated from plugin purpose
  - {{skillTable}} = markdown table built from discovered skills
```

- [ ] **Step 4: Remove the inline using-skill template**

Delete the `### using-skill Template` section (the inline markdown template that follows Step 4.2) since it's now in `lib/templates/context-files/using-skill.md.tmpl`.

- [ ] **Step 5: Commit**

```bash
git add lib/patterns/bootstrapping.md
git commit -m "feat: add archetype gate to bootstrapping, reference external template"
```

---

### Task 6: Update injection-checks.md

**Files:**
- Modify: `lib/patterns/injection-checks.md:1-4`

- [ ] **Step 1: Add archetype note**

Replace lines 1-4 of `lib/patterns/injection-checks.md`:

```markdown
# Injection Checks

8-component verification for session-start bootstrapping infrastructure.
Only runs when `skills/using-<name>/SKILL.md` exists.
```

With:

```markdown
# Injection Checks

8-component verification for session-start bootstrapping infrastructure.
Only applies to **always-present** plugins (archetype gate). On-demand plugins
skip injection checks entirely — they have no using-skill or hooks.

Only runs when `skills/using-<name>/SKILL.md` exists.
```

- [ ] **Step 2: Commit**

```bash
git add lib/patterns/injection-checks.md
git commit -m "docs: note injection checks only apply to always-present plugins"
```

---

### Task 7: Update template registry

**Files:**
- Modify: `lib/references/templates/registry.md:72-73`

- [ ] **Step 1: Add using-skill template entry**

In `lib/references/templates/registry.md`, find the closing `]` of the `TEMPLATE_REGISTRY` list (line 73):

```pseudocode
]
```

Add before it:

```pseudocode

  { schema: "using-skill",          platform: "all",          mode: "builder",
    template_path: "lib/templates/context-files/using-skill.md.tmpl",
    target_path:   "skills/using-{{name}}/SKILL.md" },
```

- [ ] **Step 2: Commit**

```bash
git add lib/references/templates/registry.md
git commit -m "feat: add using-skill template to registry"
```

---

### Task 8: Update adding-a-platform guide and reconciliation matrix

**Files:**
- Modify: `lib/principles/adding-a-platform.md`
- Modify: `docs/reconciliation-matrix.md`

- [ ] **Step 1: Add archetype note to Phase 7 in adding-a-platform.md**

In `lib/principles/adding-a-platform.md`, find the Phase 7 section's "What to update" list. After the third item ("The 'All platforms' option description"), add:

```markdown

Note: hooks and the `using-<plugin>` skill are only generated for always-present plugins (archetype gate in Phase 8). If you are adding a platform that supports hooks, ensure `lib/patterns/hook-merging.md` documents the format, but do not assume every target plugin will use hooks.
```

- [ ] **Step 2: Update reconciliation matrix bootstrapping section**

In `docs/reconciliation-matrix.md`, find the `### bootstrapping.md` section. Add a row to its table:

```markdown
| Archetype gating | Bootstrapping runs unconditionally | On-demand plugins skip Phase 8 entirely; hooks/using-skill only for always-present | Fixed (archetype gate added) |
```

- [ ] **Step 3: Commit**

```bash
git add lib/principles/adding-a-platform.md docs/reconciliation-matrix.md
git commit -m "docs: update guide and matrix for archetype-conditional bootstrapping"
```

---

### Task 9: Final verification

- [ ] **Step 1: Verify hooks directory is gone**

Run: `ls hooks/ 2>/dev/null; echo "EXIT: $?"`

Expected: `EXIT: 2` (no such directory).

- [ ] **Step 2: Verify using-skill is gone**

Run: `ls skills/using-plugin-portability/ 2>/dev/null; echo "EXIT: $?"`

Expected: `EXIT: 2` (no such directory).

- [ ] **Step 3: Verify GEMINI.md has no using-skill reference**

Run: `grep "using-plugin-portability" GEMINI.md; echo "EXIT: $?"`

Expected: `EXIT: 1` (no match).

- [ ] **Step 4: Verify skill has archetype question and gate**

Run: `grep -c "archetype" skills/plugin-portability/SKILL.md`

Expected: at least 3 (Q3 question, RETURN, Phase 8 gate).

- [ ] **Step 5: Verify template exists with expected variables**

Run: `grep -c "{{name}}\|{{skillTable}}\|{{usingSkillDescription}}" lib/templates/context-files/using-skill.md.tmpl`

Expected: at least 5.

- [ ] **Step 6: Verify CI has no hooks check**

Run: `grep "session-start" .github/workflows/ci.yml; echo "EXIT: $?"`

Expected: `EXIT: 1` (no match).

- [ ] **Step 7: Verify bootstrapping.md has archetype gate**

Run: `grep "on-demand" lib/patterns/bootstrapping.md | head -3`

Expected: hits for archetype description and the skip condition.
