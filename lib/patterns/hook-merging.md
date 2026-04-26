# Hook Merging

Event name mapping and merge logic for porting hooks across platforms.

---

## Event Name Mapping

| Claude Code event | Cursor event | Notes |
|---|---|---|
| `SessionStart` | `sessionStart` | |
| `PreToolUse` | `preToolUse` | |
| `PostToolUse` | `postToolUse` | |
| `PostToolUseFailure` | `postToolUseFailure` | |
| `SubagentStart` | `subagentStart` | |
| `SubagentStop` | `subagentStop` | |
| `PreCompact` | `preCompact` | |
| `Stop` | `stop` | |
| `UserPromptSubmit` | `beforeSubmitPrompt` | |

Cursor-only events (no Claude Code equivalent):
`sessionEnd`, `beforeShellExecution`, `afterShellExecution`, `beforeMCPExecution`, `afterMCPExecution`, `beforeReadFile`, `afterFileEdit`, `afterAgentResponse`, `afterAgentThought`

---

## Generate Cursor Hooks from Claude Hooks

```
GENERATE_CURSOR_HOOKS(plugin_path):
  source = read_json(plugin_path / "hooks/hooks.json")

  if source is missing or source.hooks is empty:
    write_json(plugin_path / "hooks/hooks-cursor.json", {
      "version": 1,
      "hooks": {}
    })
    return

  cursor_hooks = {}
  flags = []

  for claude_event, entries in source.hooks:
    cursor_event = EVENT_MAP[claude_event]  // see table above
    if cursor_event is undefined:
      skip  // unmapped event; note in report
      continue

    cursor_hooks[cursor_event] = []
    for entry in entries:
      cursor_hooks[cursor_event].append({ "command": entry.command })
      if entry.command contains "$CLAUDE_PLUGIN_ROOT":
        flags.append(entry.command)

  write_json(plugin_path / "hooks/hooks-cursor.json", {
    "version": 1,
    "hooks": cursor_hooks
  })

  if flags is not empty:
    report: "Needs manual review — these hook commands reference $CLAUDE_PLUGIN_ROOT,
             which is not available in Cursor. Replace with the Cursor equivalent:"
    for each flagged command: list it
```

If no hooks exist, write empty `hooks/hooks-cursor.json`:
```json
{
  "version": 1,
  "hooks": {}
}
```

---

## Merge SessionStart into Existing Hooks

### hooks.json (Claude Code schema)

```
MERGE_SESSION_START_HOOKS_CLAUDE(plugin_path):
  path = plugin_path / "hooks/hooks.json"

  if path exists:
    data = read_json(path)
  else:
    data = { "hooks": {} }

  new_entry = {
    "command": "hooks/run-hook.cmd session-start",
    "matcher": "startup|clear|compact"
  }

  if data.hooks.SessionStart exists:
    existing = data.hooks.SessionStart  // array
    match = find entry where entry.command contains "session-start"
    if match found:
      replace match with new_entry      // update in place
    else:
      append new_entry to existing      // add alongside other entries
  else:
    data.hooks.SessionStart = [new_entry]

  write_json(path, data)
```

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

### hooks-cursor.json (Cursor schema)

```
MERGE_SESSION_START_HOOKS_CURSOR(plugin_path):
  path = plugin_path / "hooks/hooks-cursor.json"

  if path exists:
    data = read_json(path)
  else:
    data = { "version": 1, "hooks": {} }

  new_entry = {
    "command": "hooks/run-hook.cmd session-start"
    // no matcher field — Cursor does not support matcher
  }

  if data.hooks.sessionStart exists:  // lowercase for Cursor
    existing = data.hooks.sessionStart
    match = find entry where entry.command contains "session-start"
    if match found:
      replace match with new_entry
    else:
      append new_entry to existing
  else:
    data.hooks.sessionStart = [new_entry]

  write_json(path, data)
```

Target structure:
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

Both merge operations must preserve all other existing hooks. Only the session-start entry is added or updated.

---

## Antigravity / OpenClaw Hook Notes

Antigravity and OpenClaw do not have a dedicated hooks file format. Both platforms
auto-discover `hooks/session-start` and execute it at session start if present.
No separate hook generation or merging step is needed for these platforms — the
Claude Code `hooks/hooks.json` and the session-start script cover their needs.

---

## Gemini Hook Guidance

Gemini CLI hooks are configured in user `settings.json`, not in the repo. The uplift skill generates guidance text for install docs instead of writing a hooks file.

```pseudocode
GENERATE_GEMINI_HOOK_GUIDANCE(claude_hooks):
  gemini_event_map = {
    "SessionStart":    "SessionStart",
    "PreToolUse":      "BeforeTool",
    "PostToolUse":     "AfterTool",
    "PreCompact":      "PreCompress",
    "Stop":            "AfterAgent",
  }

  guidance = "### Gemini CLI Hook Configuration\n\n"
  guidance += "Add the following to your `~/.gemini/settings.json`:\n\n"
  guidance += "```json\n{\n  \"hooks\": {\n"

  FOR event, entries IN claude_hooks.hooks:
    IF event NOT IN gemini_event_map:
      SKIP
    gemini_event = gemini_event_map[event]

    FOR entry IN entries:
      guidance += '    "' + gemini_event + '": [{\n'
      IF entry.matcher:
        guidance += '      "matcher": "' + entry.matcher + '",\n'
      guidance += '      "sequential": true,\n'
      guidance += '      "hooks": [{\n'
      guidance += '        "type": "command",\n'
      guidance += '        "command": "' + entry.hooks[0].command + '",\n'
      guidance += '        "timeout": ' + str(entry.hooks[0].timeout or 60000) + '\n'
      guidance += '      }]\n'
      guidance += '    }],\n'

  guidance += "  }\n}\n```\n"
  RETURN guidance
```

Key differences from Claude Code hooks:
- Hooks configured in `settings.json`, not a standalone JSON file
- Event names differ: `BeforeTool`/`AfterTool` not `PreToolUse`/`PostToolUse`
- `PreCompress` not `PreCompact`
- Timeout in milliseconds (default 60000), not seconds
- `matcher` field uses regex or exact match (similar to Claude Code)
- Exit code 2 = system block (same as Claude Code)
- Built-in migration: `gemini hooks migrate --from-claude`
