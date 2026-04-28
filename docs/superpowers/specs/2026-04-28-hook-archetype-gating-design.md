# Hook & Using-Skill Archetype Gating — Design Spec

**Date:** 2026-04-28
**Status:** Approved

## Problem

The plugin currently generates session-start hooks and a `using-plugin-portability` skill that get force-injected on every session start. Research confirms that hooks are NOT required for plugin/skill discovery on any platform — all 6 platforms use directory-based auto-discovery. Hooks are purely a "front-of-mind" context injection strategy.

This strategy makes sense for always-present plugins like superpowers (which govern workflow discipline and must intercept every interaction) but wastes context budget for on-demand plugins like plugin-portability (which are only relevant when explicitly invoked).

The current `using-plugin-portability` skill is a passive menu card that adds nothing beyond what auto-discovery already provides. Compare with superpowers' `using-superpowers`, which is an aggressive behaviour modifier with `<EXTREMELY-IMPORTANT>` directives, rationalization red flags, and decision flow graphs.

## Solution

Four changes:

1. **Remove hooks and using-skill from this repo** — plugin-portability is on-demand
2. **Add archetype gating to the skill** — always-present vs on-demand, controls whether Phase 8 (Bootstrap) runs
3. **Create a using-skill template** — modelled on superpowers, for always-present plugins only
4. **Update patterns and references** — bootstrapping, injection-checks, adding-a-platform guide

## Part 1: Cleanup This Repo

### Delete

| Path | Reason |
|------|--------|
| `skills/using-plugin-portability/` (directory) | On-demand plugin; no context injection needed |
| `hooks/hooks.json` | No session-start hook needed |
| `hooks/hooks-cursor.json` | No session-start hook needed |
| `hooks/session-start` | The injection script |
| `hooks/run-hook.cmd` | Windows wrapper |

The `hooks/` directory is removed entirely.

### Modify

| File | Change |
|------|--------|
| `GEMINI.md` | Remove `@./skills/using-plugin-portability/SKILL.md` include |
| `.github/workflows/ci.yml` | Remove or conditionalize the `hooks/session-start` executable check |

## Part 2: Archetype Gating in the Skill

### New question in intent-gathering (Phase 1)

Added after the platforms question (Q2), before any assessment/uplift work begins:

```pseudocode
archetype = AskUserQuestion(
  question: "What is this plugin's invocation pattern?",
  header: "Archetype",
  options: [
    { label: "On-demand",
      description: "Called explicitly when the user needs it (e.g., portability tools, code generators)" },
    { label: "Always-present",
      description: "Governs workflows on every session — needs context injection (e.g., superpowers, single-purpose agents)" }
  ],
  multiSelect: false
)
```

The answer is carried as `intent.archetype` alongside `intent.mode` and `intent.platforms`.

### Phase 8 (Bootstrap) gating

```pseudocode
BOOTSTRAP(computed, intent):
  IF computed.uplift_target == "curated-note-only": SKIP
  IF intent.archetype == "on-demand": SKIP

  LOAD_AND_VERIFY("lib/patterns/bootstrapping.md",
    proof: content contains steps 4.1 through 4.8)

  # Execute bootstrapping as defined in bootstrapping.md
```

On-demand plugins skip Phase 8 entirely. No using-skill, no hooks, no GEMINI.md injection.

### Assessment impact

When `intent.archetype == "on-demand"`, the assessment report should note: "Bootstrapping: skipped (on-demand plugin — hooks and using-skill not applicable)."

When `intent.archetype == "always-present"`, the existing Phase 8 flow runs as before, but uses the new template (Part 3).

## Part 3: Using-Skill Template

### File

Create: `lib/templates/context-files/using-skill.md.tmpl`

### Content model

Modelled on superpowers' `using-superpowers` skill. Fixed structural text (aggressive framing) with `{{mustache}}` variables for plugin-specific content.

### Variables

| Variable | Source | Example |
|----------|--------|---------|
| `{{name}}` | Plugin name | `my-plugin` |
| `{{usingSkillDescription}}` | Generated from plugin purpose | `Use when starting any conversation — establishes how to find and use skills...` |
| `{{skillTable}}` | Built from discovered skills | Markdown table of skill names and descriptions |

### Template structure

```
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

### Why this wording

This template is ONLY used for always-present plugins. The aggressive framing is the point — it ensures the agent treats the plugin's skills as mandatory workflow gates, not optional suggestions. On-demand plugins never see this template because the archetype gate prevents Phase 8 from running.

## Part 4: Pattern and Reference Updates

### `lib/patterns/bootstrapping.md`

- Add archetype check at the top of Step 4.1: `IF intent.archetype == "on-demand": SKIP` with explanation
- Add prose section explaining when bootstrapping is valuable vs unnecessary
- Update Step 4.2 to reference the template at `lib/templates/context-files/using-skill.md.tmpl` instead of inline content

### `lib/patterns/injection-checks.md`

- Add note at top: 8-component verification only applies to always-present plugins; on-demand plugins skip injection checks entirely

### `lib/references/templates/registry.md`

- Add entry for `using-skill.md.tmpl`: `{ schema: "using-skill", platform: "all", mode: "builder", template_path: "lib/templates/context-files/using-skill.md.tmpl", target_path: "skills/using-{{name}}/SKILL.md" }`

### `lib/principles/adding-a-platform.md`

- Update Phase 7 notes to mention hooks and using-skill are only generated for always-present archetype

### `docs/reconciliation-matrix.md`

- Update bootstrapping section to reflect archetype-conditional model

## File Impact Summary

| Action | File |
|--------|------|
| Delete | `skills/using-plugin-portability/` |
| Delete | `hooks/hooks.json` |
| Delete | `hooks/hooks-cursor.json` |
| Delete | `hooks/session-start` |
| Delete | `hooks/run-hook.cmd` |
| Create | `lib/templates/context-files/using-skill.md.tmpl` |
| Modify | `skills/plugin-portability/SKILL.md` (archetype question + Phase 8 gate) |
| Modify | `lib/patterns/bootstrapping.md` (archetype gate + template reference) |
| Modify | `lib/patterns/injection-checks.md` (archetype note) |
| Modify | `lib/references/templates/registry.md` (new entry) |
| Modify | `lib/principles/adding-a-platform.md` (archetype note) |
| Modify | `docs/reconciliation-matrix.md` (archetype update) |
| Modify | `GEMINI.md` (remove using-skill include) |
| Modify | `.github/workflows/ci.yml` (conditionalize hooks check) |
