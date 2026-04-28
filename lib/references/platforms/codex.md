# Codex Platform Specification

```pseudocode
REGISTRY["codex"] = {

  id: "codex",
  display_name: "Codex",

  # ── Tools ──

  tools: {
    "file.read":          { name: "Read",              notes: "built-in, no named tool in some contexts" },
    "file.write":         { name: "Write",             notes: "uses apply_patch internally" },
    "file.edit":          { name: "apply_patch",       notes: "unified file write mechanism" },
    "shell.execute":      { name: "Bash",              notes: "sandboxed execution" },
    "search.content":     { name: "Grep",              notes: null },
    "search.files":       { name: "Glob",              notes: null },
    "subagent.dispatch":  { name: "spawn_agent",       notes: "generic roles: default, worker, explorer" },
    "task.track":         { name: "update_plan",       notes: null },
    "skill.invoke":       { name: null,                notes: "skills load natively via $skill-name" },
    "web.search":         { name: "WebSearch",         notes: "live or cached mode" },
    "web.fetch":          { name: null,                notes: "no direct equivalent; use MCP" },
    "user.ask":           { name: "AskUserQuestion",   notes: null },
  },

  extra_tools: [
    { name: "report_agent_job_result", purpose: "worker result reporting for CSV batch jobs" },
  ],

  # ── Hooks ──

  hooks: {
    system: "file",
    config_path: "hooks.json or config.toml [hooks]",
    event_case: "PascalCase",
    timeout_unit: "seconds",
    async_support: false,
    structure: "nested",
    output_key: "permissionDecision / decision",

    events: {
      "session.start":        { name: "SessionStart",       can_block: false, notes: null },
      "tool.before":          { name: "PreToolUse",         can_block: true,  notes: "permissionDecision: deny" },
      "tool.after":           { name: "PostToolUse",        can_block: true,  notes: "decision: block replaces output" },
      "tool.after_failure":   { name: null,                 can_block: false, notes: null },
      "subagent.start":       { name: null,                 can_block: false, notes: null },
      "subagent.stop":        { name: null,                 can_block: false, notes: null },
      "compact.before":       { name: null,                 can_block: false, notes: null },
      "session.stop":         { name: "Stop",               can_block: true,  notes: "decision: block continues session" },
      "prompt.before_submit": { name: "UserPromptSubmit",   can_block: false, notes: "matcher ignored" },
    },

    extra_events: [
      { name: "PermissionRequest", can_block: true, notes: "controls approval flow; no Claude Code equivalent" },
    ],
  },

  # ── Context ──

  context: {
    primary_file: "AGENTS.md",
    secondary_files: [".codex/INSTALL.md"],
    priority_note: null,
  },

  # ── Skills ──

  skills: {
    path: ".agents/skills/",
    agents_path: ".codex/agents/",
    invocation: "native loading via $skill-name",
  },

  # ── Manifest ──

  manifest: {
    path: ".codex-plugin/plugin.json",
    marketplace_path: ".agents/plugins/marketplace.json",
    required_fields: ["name", "version", "description"],
  },

  # ── Frontmatter ──

  frontmatter: {
    strip: ["disable-model-invocation", "allowed-tools", "user-invocable"],
    keep: [],
    model_format: "codex-native",
    # gpt-5.4, gpt-5.4-mini
  },

  # ── MCP ──

  mcp: {
    config_path: ".mcp.json or config.toml [mcp]",
    notes: "supports stdio and SSE transports",
  },

  # ── Path Variables ──

  paths: {
    plugin_root: null,
    hooks_scripts: null,
  },
}
```

## Codex-specific notes

- Hooks require `codex_hooks = true` feature flag in `config.toml`.
- Subagent dispatch requires `multi_agent = true` feature flag.
- See `lib/patterns/subagent-dispatch.md` for message framing and named
  agent dispatch patterns.
- Default hook timeout: 600 seconds (vs Claude Code's 60 seconds).
