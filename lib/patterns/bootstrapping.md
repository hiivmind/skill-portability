# Bootstrapping

Session-start injection logic for **always-present** plugins. Generates the `using-<plugin>` skill and associated hooks that force-inject plugin context at session start across all platforms.

**On-demand plugins skip this entirely.** The archetype gate in Phase 8 prevents bootstrapping from running for on-demand plugins. Hooks and using-skills are context injection — they are NOT required for plugin discovery on any platform. All 6 platforms discover plugins/skills via directory scanning.

**When bootstrapping is valuable:** Plugins that govern workflows and must intercept every interaction (e.g., superpowers, single-purpose OpenClaw agents). The using-skill ensures the agent treats the plugin's skills as mandatory workflow gates.

**When bootstrapping is unnecessary:** Plugins invoked explicitly when needed (e.g., portability assessment, code generation tools). These rely on directory auto-discovery and save context budget by not injecting on every session.

---

## Step 4.1: Prompt for Bootstrapping (Step 17)

```
IF intent.archetype == "on-demand" THEN
  skip_bootstrapping = true
  reason = "on-demand archetype — hooks and using-skill not applicable"
  skip to Step 4.8 (final report note)
END

IF skills/using-{{name}}/SKILL.md exists THEN
  skip_bootstrapping = true
  reason = "already configured"
  skip to Step 4.8 (final report note)
END

ask: "Would you like to generate session-start bootstrapping hooks?
This creates a `using-{{name}}` skill that gets force-injected at session
start on Claude Code, Cursor, Gemini CLI, Antigravity, Codex, and OpenClaw. (y/n)"

IF user declines THEN
  skip_bootstrapping = true
  reason = "user declined"
  skip to Step 4.8 (final report note)
END
```

---

## Step 4.2: Generate `using-<plugin>/SKILL.md` (Step 18)

```
mkdir -p <plugin-path>/skills/using-{{name}}/

Build skillTable:
  FOR each skill inventoried in Step 2 (name, description from frontmatter):
    IF skill name != "using-{{name}}" THEN
      append "| `<skill-name>` | <description> |" to skillTable
    END
  END

Write <plugin-path>/skills/using-{{name}}/SKILL.md using the template at
lib/templates/context-files/using-skill.md.tmpl, substituting:
  - {{name}} = plugin name
  - {{usingSkillDescription}} = generated from plugin purpose
  - {{skillTable}} = markdown table built from discovered skills
```

---

## Step 4.3: Generate `using-<plugin>/references/` Sidecars (Step 19)

```
mkdir -p <plugin-path>/skills/using-{{name}}/references/

  # Per-skill sidecars are no longer generated. Shared platform specs
  # in lib/references/platforms/ are loaded via context file @includes.
```

---

## Step 4.4: Generate `hooks/session-start` (Step 20)

```
mkdir -p <plugin-path>/hooks/

Write <plugin-path>/hooks/session-start with the template below,
substituting {{name}}.

chmod +x <plugin-path>/hooks/session-start
```

### session-start Template

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

# Output format per platform — see REGISTRY[platform].hooks.output_key
# and REGISTRY[platform].hooks.structure for the authoritative mapping.
if [ -n "${CURSOR_PLUGIN_ROOT:-}" ]; then
  printf '{\n  "additional_context": "%s"\n}\n' "$session_context"
elif [ -n "${CLAUDE_PLUGIN_ROOT:-}" ]; then
  printf '{\n  "hookSpecificOutput": {\n    "hookEventName": "SessionStart",\n    "additionalContext": "%s"\n  }\n}\n' "$session_context"
else
  printf '{\n  "additionalContext": "%s"\n}\n' "$session_context"
fi

exit 0
```

---

## Step 4.5: Generate `hooks/run-hook.cmd` (Step 21)

```
Write <plugin-path>/hooks/run-hook.cmd with the template below.
No substitutions needed — this is a static cross-platform polyglot wrapper.

chmod +x <plugin-path>/hooks/run-hook.cmd
```

### run-hook.cmd Template

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

---

## Step 4.6: Merge SessionStart Hooks (Step 22)

Merge logic is handled by `patterns/hook-merging.md`. Apply that pattern for both files below.

**For `<plugin-path>/hooks/hooks.json`:**

```
target_entry = {
  "command": "hooks/run-hook.cmd session-start",
  "matcher": "startup|clear|compact"
}
event_key = "SessionStart"

Apply merge logic from hook-merging.md:
  IF hooks.json exists THEN
    parse JSON
    IF hooks.SessionStart exists THEN
      IF any entry has command containing "session-start" THEN
        update that entry with target_entry
      ELSE
        append target_entry to hooks.SessionStart array
      END
    ELSE
      set hooks.SessionStart = [target_entry]
    END
  ELSE
    create hooks.json:
      {
        "hooks": {
          "SessionStart": [target_entry]
        }
      }
  END
```

**For `<plugin-path>/hooks/hooks-cursor.json`:**

```
target_entry = {
  "command": "hooks/run-hook.cmd session-start"
}
event_key = "sessionStart"   # lowercase for Cursor

Apply same merge logic with:
  - key "sessionStart" (not "SessionStart")
  - required "version": 1 at root if creating new file

New file structure:
  {
    "version": 1,
    "hooks": {
      "sessionStart": [target_entry]
    }
  }
```

---

## Step 4.7: Update GEMINI.md (Step 23)

```
IF GEMINI.md exists THEN
  warn: "Bootstrapping will regenerate `GEMINI.md` with `using-{{name}}`
         included first. Existing content will be replaced. Continue? (y/n)"
  IF user declines THEN skip this step END
END

Regenerate GEMINI.md placing using-{{name}} first:

  @./skills/using-{{name}}/SKILL.md
  @./lib/references/platforms/gemini-cli.md
  {{otherSkillIncludes}}
  {{agentIncludes}}
  {{commandIncludes}}

Where:
  - {{otherSkillIncludes}} = all skills except using-{{name}}, same format
    as the GEMINI.md generation step (one @./skills/<name>/SKILL.md line per
    skill, with its platform spec if present)
  - {{agentIncludes}} = agent includes in same format as original generation
  - {{commandIncludes}} = command includes in same format as original generation
```

---

## Step 4.8: Final Report Note (Step 24 contribution)

Append to the final report's "Session-start bootstrapping" section:

```
IF skip_bootstrapping AND reason == "already configured" THEN
  "Session-start injection: already configured (using-{{name}} exists)"

ELSE IF skip_bootstrapping AND reason == "user declined" THEN
  "Session-start injection: not configured (user declined)"

ELSE
  "Session-start injection configured. Generated:
    - using-{{name}}/SKILL.md
    - using-{{name}}/references/ (shared platform specs from lib/references/platforms/)
    - hooks/session-start
    - hooks/run-hook.cmd
    - hooks/hooks.json (SessionStart entry merged)
    - hooks/hooks-cursor.json (sessionStart entry merged)
    - GEMINI.md (updated with using-{{name}} first)"
END
```
