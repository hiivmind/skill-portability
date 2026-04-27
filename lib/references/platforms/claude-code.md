# Claude Code Platform Specification

```pseudocode
REGISTRY["claude-code"] = {

  id: "claude-code",
  display_name: "Claude Code",

  # ── Tools ──

  tools: {
    "file.read":          { name: "Read",             notes: null },
    "file.write":         { name: "Write",            notes: null },
    "file.edit":          { name: "Edit",             notes: null },
    "shell.execute":      { name: "Bash",             notes: null },
    "search.content":     { name: "Grep",             notes: null },
    "search.files":       { name: "Glob",             notes: null },
    "subagent.dispatch":  { name: "Agent",            notes: "also Task for background dispatch" },
    "task.track":         { name: "TodoWrite",        notes: null },
    "skill.invoke":       { name: "Skill",            notes: null },
    "web.search":         { name: "WebSearch",        notes: null },
    "web.fetch":          { name: "WebFetch",         notes: null },
    "user.ask":           { name: "AskUserQuestion",  notes: null },
  },

  extra_tools: [
    { name: "Monitor",       purpose: "run background command, stream output lines back" },
    { name: "NotebookEdit",  purpose: "modify Jupyter notebook cells" },
    { name: "LSP",           purpose: "code intelligence: jump to def, find refs, type errors" },
    { name: "EnterWorktree", purpose: "create/switch to git worktree" },
    { name: "ExitWorktree",  purpose: "return to main worktree" },
    { name: "CronCreate",    purpose: "schedule recurring/one-shot prompt" },
    { name: "TaskCreate",    purpose: "create task in session checklist" },
    { name: "ToolSearch",    purpose: "search and load deferred tools" },
  ],

  # ── Hooks ──

  hooks: {
    system: "file",
    config_path: "hooks/hooks.json",
    event_case: "PascalCase",
    timeout_unit: "seconds",
    async_support: true,
    structure: "nested",
    output_key: "hookSpecificOutput.additionalContext",

    events: {
      "session.start":        { name: "SessionStart",        can_block: false, notes: null },
      "tool.before":          { name: "PreToolUse",          can_block: true,  notes: null },
      "tool.after":           { name: "PostToolUse",         can_block: false, notes: null },
      "tool.after_failure":   { name: "PostToolUseFailure",  can_block: false, notes: null },
      "subagent.start":       { name: "SubagentStart",       can_block: false, notes: null },
      "subagent.stop":        { name: "SubagentStop",        can_block: false, notes: null },
      "compact.before":       { name: "PreCompact",          can_block: false, notes: null },
      "session.stop":         { name: "Stop",                can_block: false, notes: null },
      "prompt.before_submit": { name: "UserPromptSubmit",    can_block: false, notes: null },
    },

    extra_events: [],
  },

  # ── Context ──

  context: {
    primary_file: "CLAUDE.md",
    secondary_files: [],
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
    path: ".claude-plugin/plugin.json",
    marketplace_path: ".claude-plugin/marketplace.json",
    required_fields: ["name", "version", "description", "author.name", "author.email"],
  },

  # ── Frontmatter ──

  frontmatter: {
    strip: [],
    keep: ["disable-model-invocation", "allowed-tools", "user-invocable"],
    model_format: "claude-shortname",
    # opus, sonnet, haiku
  },

  # ── MCP ──

  mcp: {
    config_path: ".mcp.json",
    notes: "dot-prefixed; supports resources and tools",
  },

  # ── Path Variables ──

  paths: {
    plugin_root: "${CLAUDE_PLUGIN_ROOT}",
    hooks_scripts: "/hooks/scripts/",
  },
}
```
