# Session-Start Bootstrapping for Uplifted Plugins

**Date:** 2026-04-23  
**Status:** Approved  
**Scope:** Enhance `uplifting-a-plugin` and `auditing-plugin-portability` skills to support full superpowers-style session-start injection

## Problem

The superpowers plugin uses a session-start injection pattern that guarantees the `using-superpowers` skill is delivered to the model before any user message is processed. This works across Claude Code, Cursor, Copilot CLI, OpenCode, and Gemini CLI via platform-specific adapters.

Currently, `uplifting-a-plugin` generates platform manifests, context files, and tool-mapping sidecars — but not the session-start injection infrastructure. Uplifted plugins lack the forced-injection guarantee that makes superpowers reliable.

## Solution

Extend both skills to support opt-in session-start bootstrapping:

1. **uplifting-a-plugin**: After metadata inference, prompt user whether to generate bootstrapping hooks. If yes, generate all required infrastructure.

2. **auditing-plugin-portability**: Check for bootstrapping infrastructure completeness when a `using-<plugin>` skill exists.

## User Interaction

After the detection algorithm (D1-D4) completes and before any file writes:

> "Would you like to generate session-start bootstrapping hooks? This creates a `using-<plugin>` skill that gets force-injected at session start on Claude Code, Cursor, Copilot CLI, OpenCode, and Gemini CLI. (y/n)"

## Generated Artifacts

When bootstrapping is enabled, the following are generated:

### 1. `skills/using-<plugin>/SKILL.md`

Auto-generated bootstrapping skill:

```markdown
---
name: using-<plugin>
description: Session-start bootstrapping for <plugin>. Lists available skills and platform-specific invocation instructions.
---

# Using <DisplayName>

This plugin provides the following skills:

| Skill | Description |
|-------|-------------|
| `<skill-1>` | <description from frontmatter> |
| `<skill-2>` | <description from frontmatter> |

## How to Invoke Skills

**Claude Code / Cursor:** Use the `Skill` tool with the skill name.

**Copilot CLI:** Use the `skill` tool with the skill name.

**Gemini CLI:** Use the `activate_skill` tool with the skill name.

**Codex / Other:** Skills are auto-discovered. Follow the SKILL.md instructions directly.

## Tool Name Mapping

Skills use Claude Code tool names. See each skill's `references/` directory for platform-specific equivalents.
```

The skill table is populated from frontmatter of all detected `skills/*/SKILL.md` files.

### 2. `skills/using-<plugin>/references/` sidecars

Standard tool-mapping sidecars (copilot-tools.md, codex-tools.md, gemini-tools.md) using the same templates as other skills.

### 3. `hooks/session-start`

Bash script that:
- Reads `skills/using-<plugin>/SKILL.md`
- Escapes content for JSON embedding
- Outputs platform-specific JSON based on environment variables:
  - `CURSOR_PLUGIN_ROOT` set → `{"additional_context": "..."}`
  - `CLAUDE_PLUGIN_ROOT` set (no `COPILOT_CLI`) → `{"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": "..."}}`
  - Otherwise → `{"additionalContext": "..."}`

### 4. `hooks/run-hook.cmd`

Polyglot wrapper valid as both CMD batch and bash:
- On Windows: finds Git Bash in standard locations, falls back to PATH, exits 0 silently if no bash
- On Unix: executes the named script directly

### 5. `hooks/hooks.json` (merged)

SessionStart hook entry added/updated:
```json
{
  "hooks": {
    "SessionStart": [
      {
        "command": "hooks/run-hook.cmd session-start",
        "matcher": "startup|clear|compact"
      }
    ]
  }
}
```

Existing hooks are preserved. If file doesn't exist, it's created with just SessionStart.

### 6. `hooks/hooks-cursor.json` (merged)

Cursor-format hook entry added/updated:
```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      { "command": "hooks/run-hook.cmd session-start" }
    ]
  }
}
```

Existing hooks are preserved.

### 7. `.opencode/plugins/<name>.js` (enhanced)

When bootstrapping is enabled, the OpenCode plugin includes message transform:

```javascript
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginRoot = join(__dirname, '../..');
const bootstrapContent = readFileSync(
  join(pluginRoot, 'skills/using-<name>/SKILL.md'), 'utf8'
);

export default {
  name: "<name>",
  description: "<description>",
  skills: "./skills/",
  experimental: {
    chat: {
      messages: {
        transform: (messages) => {
          if (messages.length > 0 && messages[0].role === 'user') {
            messages[0].content = bootstrapContent + '\n\n' + messages[0].content;
          }
          return messages;
        }
      }
    }
  }
};
```

### 8. `GEMINI.md` (updated)

The `using-<plugin>` skill is included first, before other skills:

```
@./skills/using-<name>/SKILL.md
@./skills/using-<name>/references/gemini-tools.md
@./skills/<other>/SKILL.md
@./skills/<other>/references/gemini-tools.md
...
```

## Auditing Skill Updates

New step checks session-start injection infrastructure (only when `using-<plugin>` exists):

```
## Session-start injection
using-<name>/SKILL.md                    → PRESENT / MISSING
using-<name>/references/gemini-tools.md  → PRESENT / MISSING
hooks/session-start                      → PRESENT / MISSING
hooks/run-hook.cmd                       → PRESENT / MISSING
hooks/hooks.json (SessionStart entry)    → PRESENT / MISSING
hooks/hooks-cursor.json (sessionStart)   → PRESENT / MISSING
.opencode/plugins/<name>.js (transform)  → PRESENT / MISSING / NO_TRANSFORM
GEMINI.md (using-<name> first)           → PRESENT / MISSING / NOT_FIRST
```

Status values:
- `NO_TRANSFORM`: OpenCode plugin exists but lacks `experimental.chat.messages.transform`
- `NOT_FIRST`: GEMINI.md exists but doesn't include using-<name> before other skills

Summary line:
> "Session-start injection: COMPLETE / PARTIAL (N of 8 components) / NOT CONFIGURED"

## Checklist Updates

### uplifting-a-plugin (new steps after existing Step 16)

- [ ] **Step 17: Prompt for bootstrapping** — Ask user if they want session-start injection
- [ ] **Step 18: Generate `using-<plugin>/SKILL.md`** — Auto-generate from detected skills
- [ ] **Step 19: Generate `using-<plugin>/references/` sidecars** — Same templates as other skills
- [ ] **Step 20: Generate `hooks/session-start`** — Bash script with env-var branching
- [ ] **Step 21: Generate `hooks/run-hook.cmd`** — Polyglot wrapper
- [ ] **Step 22: Merge SessionStart into hooks** — Update both hooks.json and hooks-cursor.json
- [ ] **Step 23: Enhance OpenCode plugin** — Add message transform if bootstrapping enabled
- [ ] **Step 24: Update GEMINI.md** — Ensure using-<plugin> is included first
- [ ] **Step 25: Updated final report** — Include bootstrapping status

### auditing-plugin-portability (new step)

- [ ] **Step 8: Check session-start injection** — Full infrastructure audit (only if using-<plugin> exists)

## File Update Behavior

Bootstrapping requires updating existing files, not just creating missing ones:

| File | Behavior |
|------|----------|
| `hooks/hooks.json` | Merge: add SessionStart entry, preserve existing hooks |
| `hooks/hooks-cursor.json` | Merge: add sessionStart entry, preserve existing hooks |
| `.opencode/plugins/<name>.js` | Regenerate with transform if bootstrapping enabled (overwrites minimal shim) |
| `GEMINI.md` | Regenerate with using-<plugin> first (overwrites) |
| `skills/using-<plugin>/SKILL.md` | Create only (skip if exists — user may have customized) |

For files that are regenerated (OpenCode, GEMINI.md), the skill should warn before overwriting:
> "Bootstrapping will regenerate `.opencode/plugins/<name>.js` and `GEMINI.md`. Existing content will be replaced. Continue? (y/n)"

## Idempotency

The enhanced skills remain idempotent:
- Running twice produces no diff on the second run
- Existing hooks are merged (adding entries is idempotent)
- Regenerated files produce identical output when re-run

## Platform Coverage

| Platform | Injection Mechanism |
|----------|-------------------|
| Claude Code | `hooks/hooks.json` → `run-hook.cmd` → `session-start` |
| Cursor | `hooks/hooks-cursor.json` → `run-hook.cmd` → `session-start` |
| Copilot CLI | Same as Claude Code, env-var detection in `session-start` |
| OpenCode | `.opencode/plugins/<name>.js` message transform |
| Gemini CLI | `GEMINI.md` @-includes (using-<plugin> first) |
| Codex | Passive discovery only (no hook system) |

## Non-Goals

- **Codex forced injection**: Codex lacks a hook system. Bootstrapping relies on passive skill auto-discovery.
- **Custom bootstrapping content**: The generated `using-<plugin>` skill is minimal and auto-generated. Plugin authors can enhance it manually after generation.
- **Backward compatibility shims**: Existing hooks.json/hooks-cursor.json files are merged, not preserved as backups.
