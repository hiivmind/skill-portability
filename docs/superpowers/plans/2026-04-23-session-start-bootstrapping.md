# Session-Start Bootstrapping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full superpowers-style session-start injection to the uplifting-a-plugin and auditing-plugin-portability skills.

**Architecture:** Extend both SKILL.md files with new checklist steps. All templates are embedded inline (no external template files). The uplifting skill gains 9 new steps (17-25) for bootstrapping generation. The auditing skill gains 1 new step (8) for bootstrapping infrastructure checks.

**Tech Stack:** Markdown skill files with embedded templates (bash, JavaScript, JSON).

---

## File Structure

| File | Change |
|------|--------|
| `skills/uplifting-a-plugin/SKILL.md` | Add steps 17-25, update "What this skill produces" table |
| `skills/auditing-plugin-portability/SKILL.md` | Add step 8, update report section |

---

### Task 1: Update "What this skill produces" table

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md:13-26`

- [ ] **Step 1: Add bootstrapping row to the produces table**

Find the table in "What this skill produces" section and add a new row after "npx skills compat":

```markdown
| Session-start bootstrapping | `skills/using-<name>/SKILL.md`, `hooks/session-start`, `hooks/run-hook.cmd` (opt-in) |
```

- [ ] **Step 2: Verify the edit**

Read back lines 13-30 of the file to confirm the row was added correctly.

- [ ] **Step 3: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "docs(uplifting): add bootstrapping to produces table"
```

---

### Task 2: Add Step 17 — Prompt for bootstrapping

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md` (after Step 16)

- [ ] **Step 1: Add Step 17 after existing Step 16**

Insert after the `- [ ] **Step 16: Emit final report**` section ends (after line 599):

```markdown

- [ ] **Step 17: Prompt for bootstrapping** (after Step 16, before final report)

After completing Steps 1-15 but before emitting the final report, ask:

> "Would you like to generate session-start bootstrapping hooks? This creates a `using-{{name}}` skill that gets force-injected at session start on Claude Code, Cursor, Copilot CLI, OpenCode, and Gemini CLI. (y/n)"

If the user declines, skip Steps 18-24 and proceed to Step 25 (final report).

If `skills/using-{{name}}/SKILL.md` already exists, skip the prompt and all bootstrapping steps — the user has already configured bootstrapping (possibly with custom content).
```

- [ ] **Step 2: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "docs(uplifting): add step 17 bootstrapping prompt"
```

---

### Task 3: Add Step 18 — Generate using-<plugin>/SKILL.md

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md`

- [ ] **Step 1: Add Step 18**

Insert after Step 17:

```markdown

- [ ] **Step 18: Generate `using-<plugin>/SKILL.md`** (if bootstrapping enabled)

Create `<plugin-path>/skills/using-{{name}}/` directory. Build the skill table by reading each skill's SKILL.md frontmatter from Step 2.

Write to `<plugin-path>/skills/using-{{name}}/SKILL.md`:

```markdown
---
name: using-{{name}}
description: Session-start bootstrapping for {{name}}. Lists available skills and platform-specific invocation instructions.
---

# Using {{displayName}}

This plugin provides the following skills:

| Skill | Description |
|-------|-------------|
{{skillTable}}

## How to Invoke Skills

**Claude Code / Cursor:** Use the `Skill` tool with the skill name.

**Copilot CLI:** Use the `skill` tool with the skill name.

**Gemini CLI:** Use the `activate_skill` tool with the skill name.

**Codex / Other:** Skills are auto-discovered. Follow the SKILL.md instructions directly.

## Tool Name Mapping

Skills use Claude Code tool names. See each skill's `references/` directory for platform-specific equivalents.
```

Where `{{skillTable}}` is built from the skills inventoried in Step 2:
```
| `<skill-name>` | <description from frontmatter> |
```

One row per skill, excluding `using-{{name}}` itself.
```

- [ ] **Step 2: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "docs(uplifting): add step 18 generate using-plugin skill"
```

---

### Task 4: Add Step 19 — Generate using-<plugin> sidecars

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md`

- [ ] **Step 1: Add Step 19**

Insert after Step 18:

```markdown

- [ ] **Step 19: Generate `using-<plugin>/references/` sidecars** (if bootstrapping enabled)

Create `<plugin-path>/skills/using-{{name}}/references/` directory. Write the same three sidecar files as Step 15 uses:
- `copilot-tools.md` (same template as Step 15)
- `codex-tools.md` (same template as Step 15)
- `gemini-tools.md` (same template as Step 15)

These are identical to other skills' sidecars — reuse the templates from Step 15.
```

- [ ] **Step 2: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "docs(uplifting): add step 19 generate using-plugin sidecars"
```

---

### Task 5: Add Step 20 — Generate hooks/session-start

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md`

- [ ] **Step 1: Add Step 20**

Insert after Step 19:

```markdown

- [ ] **Step 20: Generate `hooks/session-start`** (if bootstrapping enabled)

Create `<plugin-path>/hooks/` directory if needed. Write to `<plugin-path>/hooks/session-start`:

```bash
#!/usr/bin/env bash
# SessionStart hook for {{name}} plugin

set -euo pipefail

# Determine plugin root directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Read using-{{name}} content
using_content=$(cat "${PLUGIN_ROOT}/skills/using-{{name}}/SKILL.md" 2>&1 || echo "Error reading using-{{name}} skill")

# Escape string for JSON embedding
escape_for_json() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\"/\\\"}"
    s="${s//$'\n'/\\n}"
    s="${s//$'\r'/\\r}"
    s="${s//$'\t'/\\t}"
    printf '%s' "$s"
}

using_escaped=$(escape_for_json "$using_content")
session_context="<IMPORTANT>\nThis plugin uses the superpowers portability pattern.\n\n${using_escaped}\n</IMPORTANT>"

# Output context injection as JSON.
# Cursor hooks expect additional_context (snake_case).
# Claude Code hooks expect hookSpecificOutput.additionalContext (nested).
# Copilot CLI and others expect additionalContext (top-level, SDK standard).
if [ -n "${CURSOR_PLUGIN_ROOT:-}" ]; then
  printf '{\n  "additional_context": "%s"\n}\n' "$session_context"
elif [ -n "${CLAUDE_PLUGIN_ROOT:-}" ] && [ -z "${COPILOT_CLI:-}" ]; then
  printf '{\n  "hookSpecificOutput": {\n    "hookEventName": "SessionStart",\n    "additionalContext": "%s"\n  }\n}\n' "$session_context"
else
  printf '{\n  "additionalContext": "%s"\n}\n' "$session_context"
fi

exit 0
```

Make the file executable: `chmod +x hooks/session-start`
```

- [ ] **Step 2: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "docs(uplifting): add step 20 generate session-start script"
```

---

### Task 6: Add Step 21 — Generate hooks/run-hook.cmd

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md`

- [ ] **Step 1: Add Step 21**

Insert after Step 20:

```markdown

- [ ] **Step 21: Generate `hooks/run-hook.cmd`** (if bootstrapping enabled)

Write to `<plugin-path>/hooks/run-hook.cmd`:

```batch
: << 'CMDBLOCK'
@echo off
REM Cross-platform polyglot wrapper for hook scripts.
REM On Windows: cmd.exe runs the batch portion, which finds and calls bash.
REM On Unix: the shell interprets this as a script (: is a no-op in bash).

if "%~1"=="" (
    echo run-hook.cmd: missing script name >&2
    exit /b 1
)

set "HOOK_DIR=%~dp0"

REM Try Git for Windows bash in standard locations
if exist "C:\Program Files\Git\bin\bash.exe" (
    "C:\Program Files\Git\bin\bash.exe" "%HOOK_DIR%%~1" %2 %3 %4 %5 %6 %7 %8 %9
    exit /b %ERRORLEVEL%
)
if exist "C:\Program Files (x86)\Git\bin\bash.exe" (
    "C:\Program Files (x86)\Git\bin\bash.exe" "%HOOK_DIR%%~1" %2 %3 %4 %5 %6 %7 %8 %9
    exit /b %ERRORLEVEL%
)

REM Try bash on PATH
where bash >nul 2>nul
if %ERRORLEVEL% equ 0 (
    bash "%HOOK_DIR%%~1" %2 %3 %4 %5 %6 %7 %8 %9
    exit /b %ERRORLEVEL%
)

REM No bash found - exit silently (plugin still works, just without SessionStart injection)
exit /b 0
CMDBLOCK

# Unix: run the named script directly
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT_NAME="$1"
shift
exec bash "${SCRIPT_DIR}/${SCRIPT_NAME}" "$@"
```

Make the file executable: `chmod +x hooks/run-hook.cmd`
```

- [ ] **Step 2: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "docs(uplifting): add step 21 generate run-hook.cmd"
```

---

### Task 7: Add Step 22 — Merge SessionStart into hooks

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md`

- [ ] **Step 1: Add Step 22**

Insert after Step 21:

```markdown

- [ ] **Step 22: Merge SessionStart into hooks** (if bootstrapping enabled)

**For `hooks/hooks.json`:**

If file exists, parse it and add/update the SessionStart entry while preserving other hooks. If file doesn't exist, create it.

Target structure:
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

Merge logic: If `hooks.SessionStart` array exists, check if an entry with command containing `session-start` exists. If yes, update it. If no, append to the array. If `hooks.SessionStart` doesn't exist, create it.

**For `hooks/hooks-cursor.json`:**

Same merge logic, but with Cursor's schema:
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

Note the lowercase `sessionStart` for Cursor.
```

- [ ] **Step 2: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "docs(uplifting): add step 22 merge hooks"
```

---

### Task 8: Add Step 23 — Enhance OpenCode plugin

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md`

- [ ] **Step 1: Add Step 23**

Insert after Step 22:

```markdown

- [ ] **Step 23: Enhance OpenCode plugin** (if bootstrapping enabled)

If `.opencode/plugins/{{name}}.js` exists, warn:
> "Bootstrapping will regenerate `.opencode/plugins/{{name}}.js` with session-start injection. Existing content will be replaced. Continue? (y/n)"

If user confirms (or file doesn't exist), write to `<plugin-path>/.opencode/plugins/{{name}}.js`:

```javascript
// OpenCode plugin for {{name}} with session-start bootstrapping
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginRoot = join(__dirname, '../..');
const bootstrapContent = readFileSync(
  join(pluginRoot, 'skills/using-{{name}}/SKILL.md'), 'utf8'
);

export default {
  name: "{{name}}",
  description: "{{description}}",
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

This replaces the minimal shim from Step 12 with a version that injects the using-{{name}} skill at session start.
```

- [ ] **Step 2: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "docs(uplifting): add step 23 enhance OpenCode plugin"
```

---

### Task 9: Add Step 24 — Update GEMINI.md

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md`

- [ ] **Step 1: Add Step 24**

Insert after Step 23:

```markdown

- [ ] **Step 24: Update GEMINI.md** (if bootstrapping enabled)

If `GEMINI.md` exists, warn:
> "Bootstrapping will regenerate `GEMINI.md` with `using-{{name}}` included first. Existing content will be replaced. Continue? (y/n)"

If user confirms (or file doesn't exist), regenerate `GEMINI.md` with the using-{{name}} skill first:

```
@./skills/using-{{name}}/SKILL.md
@./skills/using-{{name}}/references/gemini-tools.md
{{otherSkillIncludes}}
{{agentIncludes}}
{{commandIncludes}}
```

Where `{{otherSkillIncludes}}` contains all skills except `using-{{name}}`, in the same format as Step 9.
```

- [ ] **Step 2: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "docs(uplifting): add step 24 update GEMINI.md"
```

---

### Task 10: Update Step 16 to become Step 25

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md`

- [ ] **Step 1: Renumber existing Step 16 to Step 25 and add bootstrapping status**

Find `- [ ] **Step 16: Emit final report**` and change to:

```markdown
- [ ] **Step 25: Emit final report**

Print a summary with five sections:

**Metadata inferred:**
Repeat the D4 inference summary. List any fields that fell back to hard defaults or were left blank.

**Created:**
Every file written in this run, relative to `<plugin-path>`.

**Skipped (already exists):**
Every file that was present and therefore not overwritten.

**Needs manual review:**
- Any hook command containing `$CLAUDE_PLUGIN_ROOT`
- Any skill with missing `name` or `description` frontmatter
- Any metadata field that could not be inferred from any source

**Session-start bootstrapping:**
If bootstrapping was enabled:
> "Session-start injection configured. Generated: `using-{{name}}/SKILL.md`, `hooks/session-start`, `hooks/run-hook.cmd`, hook entries in `hooks.json` and `hooks-cursor.json`, OpenCode message transform, GEMINI.md updated."

If bootstrapping was declined:
> "Session-start injection: not configured (user declined)"

If bootstrapping was skipped (using-{{name}} already existed):
> "Session-start injection: already configured (using-{{name}} exists)"
```

- [ ] **Step 2: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "docs(uplifting): renumber step 16 to 25, add bootstrapping status"
```

---

### Task 11: Add Step 8 to auditing skill — Check session-start injection

**Files:**
- Modify: `skills/auditing-plugin-portability/SKILL.md`

- [ ] **Step 1: Add Step 8 before existing Step 8 (Print report)**

Find `- [ ] **Step 8: Print report**` and insert before it:

```markdown
- [ ] **Step 8: Check session-start injection** (only if `using-<name>` exists)

If `skills/using-{{name}}/SKILL.md` does not exist, skip this step entirely — bootstrapping is not configured.

If it exists, check all bootstrapping infrastructure:

| Component | Check |
|-----------|-------|
| `skills/using-{{name}}/SKILL.md` | File exists |
| `skills/using-{{name}}/references/gemini-tools.md` | File exists |
| `hooks/session-start` | File exists and is executable |
| `hooks/run-hook.cmd` | File exists and is executable |
| `hooks/hooks.json` | File exists and contains `SessionStart` entry with command containing `session-start` |
| `hooks/hooks-cursor.json` | File exists and contains `sessionStart` entry with command containing `session-start` |
| `.opencode/plugins/{{name}}.js` | File exists and contains `experimental.chat.messages.transform` |
| `GEMINI.md` | File exists and first `@./skills/` include is `using-{{name}}` |

Report status for each:
- `PRESENT` — component exists and is correctly configured
- `MISSING` — component does not exist
- `NO_TRANSFORM` — OpenCode plugin exists but lacks message transform
- `NOT_FIRST` — GEMINI.md exists but using-{{name}} is not the first skill include

```

- [ ] **Step 2: Renumber existing Step 8 to Step 9**

Change `- [ ] **Step 8: Print report**` to `- [ ] **Step 9: Print report**`

- [ ] **Step 3: Commit**

```bash
git add skills/auditing-plugin-portability/SKILL.md
git commit -m "docs(auditing): add step 8 check session-start injection"
```

---

### Task 12: Update auditing report section

**Files:**
- Modify: `skills/auditing-plugin-portability/SKILL.md`

- [ ] **Step 1: Add session-start injection section to report template**

Find the report template in Step 9 (formerly Step 8) and add after `## Hooks`:

```markdown

## Session-start injection
(Only shown if `skills/using-{{name}}/SKILL.md` exists)

using-{{name}}/SKILL.md                    PRESENT
using-{{name}}/references/gemini-tools.md  PRESENT
hooks/session-start                        PRESENT
hooks/run-hook.cmd                         PRESENT
hooks/hooks.json (SessionStart)            PRESENT
hooks/hooks-cursor.json (sessionStart)     PRESENT
.opencode/plugins/{{name}}.js (transform)  NO_TRANSFORM
GEMINI.md (using-{{name}} first)           NOT_FIRST

Session-start injection: PARTIAL (6 of 8 components)
```

- [ ] **Step 2: Update Summary section**

Add to the Summary output:

```markdown
Session-start injection: COMPLETE / PARTIAL (N of 8) / NOT CONFIGURED
```

- [ ] **Step 3: Commit**

```bash
git add skills/auditing-plugin-portability/SKILL.md
git commit -m "docs(auditing): add session-start injection to report"
```

---

### Task 13: Validation — Run auditing skill on plugin-portability itself

**Files:**
- Test target: `/home/nathanielramm/git/github/plugin-portability`

- [ ] **Step 1: Run the auditing skill**

Invoke: "Use the auditing-plugin-portability skill on /home/nathanielramm/git/github/plugin-portability"

- [ ] **Step 2: Verify output**

Expected:
- Should report `skills/using-plugin-portability/SKILL.md` as MISSING (bootstrapping not configured)
- Should skip the session-start injection section entirely
- All other platform manifests should show PRESENT

- [ ] **Step 3: Document any issues found**

If the skill produces errors or unexpected output, create a follow-up fix task.

---

### Task 14: Final commit — Update skill descriptions

**Files:**
- Modify: `skills/uplifting-a-plugin/SKILL.md:1-4`
- Modify: `skills/auditing-plugin-portability/SKILL.md:1-4`

- [ ] **Step 1: Update uplifting skill description frontmatter**

Change the description to mention bootstrapping:

```yaml
---
name: uplifting-a-plugin
description: Use when you need to add multi-platform portability to a plugin. Accepts any starting state — a Claude plugin, a Cursor plugin, a Gemini extension, an npx skills repo, or a bare directory of SKILL.md files. Detects what is already present, infers a canonical metadata model, and emits every missing platform artifact. Optionally generates session-start bootstrapping hooks for forced skill injection across all platforms.
---
```

- [ ] **Step 2: Update auditing skill description frontmatter**

Change the description to mention bootstrapping:

```yaml
---
name: auditing-plugin-portability
description: Use when you want to check a plugin for multi-platform portability gaps without making any changes. Accepts any starting state — Claude, Cursor, Gemini, npx skills repos, or bare SKILL.md files. Detects what metadata is available, infers the canonical plugin identity, then reports PRESENT or MISSING for every platform artifact including session-start bootstrapping infrastructure.
---
```

- [ ] **Step 3: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md skills/auditing-plugin-portability/SKILL.md
git commit -m "docs: update skill descriptions to mention bootstrapping"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Update produces table | uplifting SKILL.md |
| 2 | Add Step 17 — bootstrapping prompt | uplifting SKILL.md |
| 3 | Add Step 18 — generate using-plugin skill | uplifting SKILL.md |
| 4 | Add Step 19 — generate sidecars | uplifting SKILL.md |
| 5 | Add Step 20 — generate session-start | uplifting SKILL.md |
| 6 | Add Step 21 — generate run-hook.cmd | uplifting SKILL.md |
| 7 | Add Step 22 — merge hooks | uplifting SKILL.md |
| 8 | Add Step 23 — enhance OpenCode plugin | uplifting SKILL.md |
| 9 | Add Step 24 — update GEMINI.md | uplifting SKILL.md |
| 10 | Renumber Step 16 → 25, add status | uplifting SKILL.md |
| 11 | Add Step 8 — check injection | auditing SKILL.md |
| 12 | Update auditing report | auditing SKILL.md |
| 13 | Validation run | (test) |
| 14 | Update frontmatter descriptions | both SKILL.md |
