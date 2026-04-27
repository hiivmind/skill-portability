# Cursor Platform Specification

```pseudocode
REGISTRY["cursor"] = {

  id: "cursor",
  display_name: "Cursor",

  # ── Tools ──

  tools: {
    "file.read":          { name: "Read",             notes: null },
    "file.write":         { name: "Write",            notes: null },
    "file.edit":          { name: "Edit",             notes: null },
    "shell.execute":      { name: "Bash",             notes: null },
    "search.content":     { name: "Grep",             notes: null },
    "search.files":       { name: "Glob",             notes: null },
    "subagent.dispatch":  { name: "Agent",            notes: "also Task; full subagent support" },
    "task.track":         { name: "TodoWrite",        notes: null },
    "skill.invoke":       { name: "Skill",            notes: "/add-plugin installs, skills load natively" },
    "web.search":         { name: "WebSearch",        notes: null },
    "web.fetch":          { name: "WebFetch",         notes: null },
    "user.ask":           { name: "AskUserQuestion",  notes: null },
  },

  extra_tools: [],

  # ── Hooks ──

  hooks: {
    system: "file",
    config_path: "hooks/hooks-cursor.json",
    event_case: "camelCase",
    timeout_unit: "seconds",
    async_support: false,
    structure: "flat",
    output_key: "additional_context",

    events: {
      "session.start":        { name: "sessionStart",        can_block: false, notes: null },
      "tool.before":          { name: "preToolUse",          can_block: true,  notes: null },
      "tool.after":           { name: "postToolUse",         can_block: false, notes: null },
      "tool.after_failure":   { name: "postToolUseFailure",  can_block: false, notes: null },
      "subagent.start":       { name: "subagentStart",       can_block: true,  notes: null },
      "subagent.stop":        { name: "subagentStop",        can_block: false, notes: "can trigger followup_message" },
      "compact.before":       { name: "preCompact",          can_block: false, notes: null },
      "session.stop":         { name: "stop",                can_block: false, notes: "can trigger followup_message" },
      "prompt.before_submit": { name: "beforeSubmitPrompt",  can_block: true,  notes: null },
    },

    extra_events: [
      { name: "sessionEnd",           can_block: false, notes: "fire-and-forget" },
      { name: "beforeShellExecution",  can_block: true,  notes: "before shell command" },
      { name: "afterShellExecution",   can_block: false, notes: "after shell command" },
      { name: "beforeMCPExecution",    can_block: true,  notes: "before MCP tool call" },
      { name: "afterMCPExecution",     can_block: false, notes: "after MCP tool call" },
      { name: "beforeReadFile",        can_block: true,  notes: "before file read" },
      { name: "afterFileEdit",         can_block: false, notes: "after file edit" },
      { name: "afterAgentResponse",    can_block: false, notes: "after assistant message" },
      { name: "afterAgentThought",     can_block: false, notes: "after thinking block" },
      { name: "beforeTabFileRead",     can_block: true,  notes: "Tab: before file read" },
      { name: "afterTabFileEdit",      can_block: false, notes: "Tab: after file edit" },
    ],
  },

  # ── Context ──

  context: {
    primary_file: "AGENTS.md",
    secondary_files: [".cursor/rules/*.mdc"],
    priority_note: null,
  },

  # ── Skills ──

  skills: {
    path: "skills/",
    agents_path: "agents/",
    invocation: "Skill tool",
  },

  # ── Manifest ──

  manifest: {
    path: ".cursor-plugin/plugin.json",
    required_fields: ["name", "displayName", "description", "version", "author"],
  },

  # ── Frontmatter ──

  frontmatter: {
    strip: ["allowed-tools", "user-invocable"],
    keep: ["disable-model-invocation"],
    model_format: "inherit",
    # always "inherit" — defers to user's model selection
  },

  # ── MCP ──

  mcp: {
    config_path: "mcp.json",
    notes: "no dot prefix; no MCP Resources support",
  },

  # ── Path Variables ──

  paths: {
    plugin_root: "${CURSOR_PLUGIN_ROOT}",
    hooks_scripts: "/scripts/",
  },
}
```

### Cursor-specific notes

- Cursor hooks use `"version": 1` at top level of hooks-cursor.json.
- Flat hook structure: no nested `hooks[]` array; each entry has `event`,
  `matcher`, `command` at top level.
- Custom agents: `.cursor/agents/*.md` (project) or `~/.cursor/agents/`
  (global). Frontmatter fields: name, description, model, readonly,
  is_background.
- Built-in subagents: explore, bash, browser.
- Async subagents available in Cursor 2.5+.
