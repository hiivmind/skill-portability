# Pattern File Platform Deduplication

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace 9 hardcoded platform data instances in pattern files with REGISTRY lookups, so platform facts are stated once (in PlatformSpec) and consumed everywhere.

**Architecture:** Add 2 reverse-lookup helpers to platform-api.md. Replace inline tables and hardcoded lists in 5 pattern files with REGISTRY-derived expressions. Executable bash templates stay as-is — only pseudocode and prose commentary change.

**Tech Stack:** Markdown pseudocode, YAML-adjacent structured data in platform-api.md.

---

## New platform-api.md Functions

Two reverse-lookup helpers needed by inventory.md:

```pseudocode
FUNCTION platform_for_spec(filename)
  RETURNS platform ID from a spec filename like "codex.md" → "codex"
  FOR EACH pid IN REGISTRY:
    IF filename == pid + ".md": RETURN pid

FUNCTION platform_for_hooks(path)
  RETURNS platform ID from a hooks file path
  IF "cursor" IN path: RETURN "cursor"
  RETURN "claude-code"
```

---

## PlatformSpec Prerequisites

Before pattern file edits, update the type system and platform data:

**1. Add `marketplace_path` to PlatformSpec.manifest in platform-api.md:**
```
manifest: {
  path:             string | null,
  marketplace_path: string | null,    # NEW
  required_fields:  List[string],
}
```

Populate in platform spec files:
- claude-code: `".claude-plugin/marketplace.json"`
- cursor: `".cursor-plugin/marketplace.json"`
- codex: `".agents/plugins/marketplace.json"`
- gemini-cli, antigravity, openclaw: `null`

**2. Add `GEMINI.md` to Antigravity secondary_files:**

In `lib/references/platforms/antigravity.md`, change:
```
secondary_files: [".agents/rules/*.md"],
```
to:
```
secondary_files: ["GEMINI.md", ".agents/rules/*.md"],
```

This moves `GEMINI.md` from prose-only `priority_note` to machine-readable
`secondary_files`, enabling REGISTRY-derived context checks to capture it.

---

## Changes by File

### hook-merging.md (3 changes)

**1. Event Name Mapping table (lines 9-26)**

Replace the 20-line cross-platform event mapping table and the Cursor-only / Codex-only event prose with a REGISTRY reference and lookup example.

Current (lines 9-27):
```
| Claude Code event | Cursor event | Codex event | Notes |
|---|---|---|---|
| `SessionStart` | `sessionStart` | `SessionStart` | |
[... 10 more rows ...]

Cursor-only events (no Claude Code equivalent):
`sessionEnd`, `beforeShellExecution`, ...

Codex-only events (no Claude Code equivalent):
`PermissionRequest`
```

Replace with:
```
Event mappings are derived from REGISTRY. To get the platform-native name
for any canonical event:

  hook_event(platform, canonical_event)

Example: hook_event("cursor", "session.start") → "sessionStart"

For platform-specific events beyond the canonical set, see
REGISTRY[platform].hooks.extra_events.
```

**2. GENERATE_CODEX_HOOKS hardcoded event list (lines 102-103)**

Current:
```
  codex_events = ["SessionStart", "PreToolUse", "PostToolUse",
                   "UserPromptSubmit", "Stop", "PermissionRequest"]
```

Replace with:
```
  codex_events = [entry.name FOR event, entry IN REGISTRY["codex"].hooks.events
                  WHERE entry.name IS NOT null]
                + [entry.name FOR entry IN REGISTRY["codex"].hooks.extra_events]
```

**3. GENERATE_GEMINI_HOOK_GUIDANCE inline event map (lines 238-244)**

Current:
```
  gemini_event_map = {
    "SessionStart":    "SessionStart",
    "PreToolUse":      "BeforeTool",
    "PostToolUse":     "AfterTool",
    "PreCompact":      "PreCompress",
    "Stop":            "AfterAgent",
  }
```

Replace with:
```
  FOR canonical_event IN CanonicalEvent:
    gemini_name = hook_event("gemini-cli", canonical_event)
    IF gemini_name IS null: SKIP
    claude_name = hook_event("claude-code", canonical_event)
```

And update the loop body (lines 250-265) to use `gemini_name` and
`claude_name` instead of looking up from the map.

### inventory.md (3 changes)

**4. manifest_checks hardcoded list (lines 28-38)**

Current:
```
  manifest_checks = [
    { platform: "claude-code",  path: ".claude-plugin/plugin.json" },
    { platform: "claude-code",  path: ".claude-plugin/marketplace.json" },
    { platform: "cursor",       path: ".cursor-plugin/plugin.json" },
    ...
  ]
```

Replace with:
```
  manifest_checks = []
  FOR pid, spec IN REGISTRY:
    IF spec.manifest.path IS NOT null:
      manifest_checks.append({ platform: pid, path: spec.manifest.path })
    IF spec.manifest.marketplace_path IS NOT null:
      manifest_checks.append({ platform: pid, path: spec.manifest.marketplace_path })
```

See PlatformSpec Prerequisites section above for the `marketplace_path` addition.

**5. context_checks hardcoded list (lines 47-55)**

Current:
```
  context_checks = [
    { platform: "claude-code",  path: "CLAUDE.md" },
    { platform: "cursor",       path: "AGENTS.md" },
    { platform: "gemini-cli",   path: "GEMINI.md" },
    ...
  ]
```

Replace with:
```
  context_checks = []
  FOR pid, spec IN REGISTRY:
    context_checks.append({ platform: pid, path: spec.context.primary_file })
    FOR secondary IN spec.context.secondary_files:
      context_checks.append({ platform: pid, path: secondary })
```

This captures Antigravity's `GEMINI.md` requirement (stored in `secondary_files`)
and any future secondary context files. The current hardcoded list explicitly
includes both `AGENTS.md` and `GEMINI.md` for Antigravity — the REGISTRY-derived
version preserves this via `secondary_files`.

**6. spec_platform() and hook_platform() helpers (lines 156-159)**

Current:
```
| `spec_platform(file)` | `"gemini-cli.md" → "gemini-cli"`, `"codex.md" → "codex"` |
| `hook_platform(path)` | `"hooks.json" → "claude-code"`, `"hooks-cursor.json" → "cursor"` |
```

Replace references in the pseudocode (line 143, 146) with calls to
`platform_for_spec(filename)` and `platform_for_hooks(path)` — the two
new functions added to platform-api.md. Update the Helper References table
to point to platform-api.md instead of defining inline.

### injection-checks.md (2 changes)

**7. Hardcoded "SessionStart" (line 52)**

Current:
```
    IF content contains "SessionStart" AND content contains "session-start":
```

Replace with:
```
    event_name = hook_event("claude-code", "session.start")
    IF content contains event_name AND content contains "session-start":
```

**8. Hardcoded "sessionStart" (line 62)**

Current:
```
    IF content contains "sessionStart" AND content contains "session-start":
```

Replace with:
```
    event_name = hook_event("cursor", "session.start")
    IF content contains event_name AND content contains "session-start":
```

### bootstrapping.md (1 change)

**9. Hook output format comment (lines 128-130)**

Current comment block:
```
# Output context injection as JSON.
# Cursor hooks expect additional_context (snake_case).
# Claude Code hooks expect hookSpecificOutput.additionalContext (nested).
# Other platforms expect additionalContext (top-level, SDK standard).
```

Replace with:
```
# Output format per platform — see REGISTRY[platform].hooks.output_key
# and REGISTRY[platform].hooks.structure for the authoritative mapping.
```

The bash code itself (lines 131-137) stays unchanged — it's executable
code, not pseudocode.

---

## What Does NOT Change

- **detection-algorithm.md** — `source_definitions` field lists serve metadata discovery (what *can* we extract?), not validation (what *must* be present?). Different purpose from `manifest.required_fields`.
- **manifest-generation.md** — Template rendering logic and builder functions. No platform data duplication.
- **publishing-and-discoverability.md** — Pure prose reference with no pseudocode.
- **report-template.md** — Template structure only.
- **subagent-dispatch.md** — Codex-specific patterns, already correct.
- **pseudocode-principles.md** — Meta-doc, no platform data.
- **Executable bash templates** — Real code stays as-is; only pseudocode and prose commentary change.

---

## Verification

After all edits:

1. `grep -cP '^\| .*(SessionStart|PreToolUse|PostToolUse).*\|' lib/patterns/hook-merging.md` returns 0 (no inline mapping table rows)
2. `grep -n 'codex_events = \[' lib/patterns/hook-merging.md` shows REGISTRY-derived expression
3. `grep -n 'gemini_event_map' lib/patterns/hook-merging.md` returns 0
4. `grep -c 'platform:.*path:' lib/patterns/inventory.md` returns 0 (no hardcoded check entries)
5. `grep -n 'spec_platform\|hook_platform' lib/patterns/inventory.md` returns 0 (replaced with platform_for_spec/platform_for_hooks)
6. `grep -n 'platform_for_spec\|platform_for_hooks' lib/references/platform-api.md` shows both new functions
7. Hardcoded event names in injection-checks.md replaced with hook_event() calls
