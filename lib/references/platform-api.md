# Platform API

Structured type system and deterministic lookup functions for cross-platform
portability. Each platform declares a `PlatformSpec` dictionary in
`lib/references/platforms/<platform>.md`. This file defines the schema and API.

---

## Types

```pseudocode
TYPE ToolEntry = {
  name:  string | null,   # platform-native tool name; null = not supported
  notes: string | null,   # brief clarification when needed
}

TYPE HookEvent = {
  name:      string | null,   # platform-native event name; null = no equivalent
  can_block: bool,            # whether this hook can block execution
  notes:     string | null,
}

TYPE PlatformSpec = {
  id:           string,       # "gemini-cli", "codex", "cursor", "antigravity", "openclaw", "claude-code"
  display_name: string,

  # ── Tools ──
  tools:        Dict[Operation, ToolEntry],
  extra_tools:  List[{ name: string, purpose: string }],

  # ── Hooks ──
  hooks: {
    system:        "file" | "sdk" | "none",
    config_path:   string | null,
    event_case:    "PascalCase" | "camelCase" | "snake_case" | null,
    timeout_unit:  "seconds" | "milliseconds" | null,
    async_support: bool,
    structure:     "nested" | "flat" | "sdk" | null,
    output_key:    string | null,
    events:        Dict[CanonicalEvent, HookEvent],
    extra_events:  List[HookEvent],
  },

  # ── Context ──
  context: {
    primary_file:    string,
    secondary_files: List[string],
    priority_note:   string | null,
  },

  # ── Skills ──
  skills: {
    path:        string,
    agents_path: string,
    invocation:  string,
  },

  # ── Manifest ──
  manifest: {
    path:             string | null,
    marketplace_path: string | null,
    required_fields:  List[string],
  },

  # ── Frontmatter ──
  frontmatter: {
    strip:        List[string],
    keep:         List[string],
    model_format: string | null,
  },

  # ── MCP ──
  mcp: {
    config_path: string | null,
    notes:       string | null,
  },

  # ── Path Variables ──
  paths: {
    plugin_root:   string | null,
    hooks_scripts: string | null,
  },
}
```

---

## Canonical Enums

```pseudocode
Operation = ENUM(
  "file.read",
  "file.write",
  "file.edit",
  "shell.execute",
  "search.content",
  "search.files",
  "subagent.dispatch",
  "task.track",
  "skill.invoke",
  "web.search",
  "web.fetch",
  "user.ask",
)

CanonicalEvent = ENUM(
  "session.start",
  "tool.before",
  "tool.after",
  "tool.after_failure",
  "subagent.start",
  "subagent.stop",
  "compact.before",
  "session.stop",
  "prompt.before_submit",
)
```

---

## Registry

```pseudocode
REGISTRY: Dict[string, PlatformSpec] = {}
  # Populated by per-platform data files in lib/references/platforms/.
```

---

## Lookup Functions

```pseudocode
# ── Core lookups ──

FUNCTION tool_name(platform, op)
  RETURNS the platform-native tool name for a canonical operation, or null.
  LOOKUP REGISTRY[platform].tools[op].name

FUNCTION hook_event(platform, event)
  RETURNS the platform-native hook event name, or null.
  LOOKUP REGISTRY[platform].hooks.events[event].name

FUNCTION hook_can_block(platform, event)
  RETURNS whether the hook for this event can block execution.
  entry = REGISTRY[platform].hooks.events[event]
  RETURN entry.name IS NOT null AND entry.can_block

# ── Bulk queries ──

FUNCTION supported_tools(platform)
  RETURNS list of canonical operations this platform supports.
  FOR EACH op, entry IN REGISTRY[platform].tools:
    INCLUDE op WHERE entry.name IS NOT null

FUNCTION unsupported_tools(platform)
  RETURNS list of canonical operations this platform cannot perform.
  FOR EACH op, entry IN REGISTRY[platform].tools:
    INCLUDE op WHERE entry.name IS null

FUNCTION has_hooks(platform)
  RETURN REGISTRY[platform].hooks.system != "none"

FUNCTION strip_fields(platform)
  RETURN REGISTRY[platform].frontmatter.strip

# ── Cross-platform ──

FUNCTION platforms_supporting(op)
  RETURNS all platform IDs that support a given operation.
  FOR EACH pid, spec IN REGISTRY:
    INCLUDE pid WHERE spec.tools[op].name IS NOT null

FUNCTION tool_mapping_table(op)
  RETURNS { platform_id: tool_name } for one operation across all platforms.
  FOR EACH pid, spec IN REGISTRY:
    EMIT pid -> spec.tools[op].name

FUNCTION diff_from(source, target)
  RETURNS what changes when porting from source to target platform.
  src = REGISTRY[source]
  tgt = REGISTRY[target]
  renamed_tools:
    FOR EACH op IN Operation
      WHERE src.tools[op].name != tgt.tools[op].name
        AND tgt.tools[op].name IS NOT null:
      EMIT op -> { from: src.tools[op].name, to: tgt.tools[op].name }
  lost_tools:
    FOR EACH op IN Operation
      WHERE src.tools[op].name IS NOT null
        AND tgt.tools[op].name IS null:
      EMIT op
  strip_fields: tgt.frontmatter.strip
  model_format: tgt.frontmatter.model_format

# ── Reverse lookups ──

FUNCTION platform_for_spec(filename)
  RETURNS platform ID from a spec filename like "codex.md" → "codex".
  FOR EACH pid IN REGISTRY:
    IF filename == pid + ".md": RETURN pid

FUNCTION platform_for_hooks(path)
  RETURNS platform ID from a hooks file path.
  IF "cursor" IN path: RETURN "cursor"
  RETURN "claude-code"
```
