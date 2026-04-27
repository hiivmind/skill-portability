# Antigravity Platform Specification

```pseudocode
REGISTRY["antigravity"] = {

  id: "antigravity",
  display_name: "Antigravity",

  # ── Tools ──

  tools: {
    "file.read":          { name: "view_file",              notes: null },
    "file.write":         { name: "write_to_file",          notes: null },
    "file.edit":          { name: "replace_file_content",   notes: "also multi_replace_file_content" },
    "shell.execute":      { name: "run_command",            notes: "PowerShell on Windows" },
    "search.content":     { name: "grep_search",            notes: "ripgrep-based" },
    "search.files":       { name: "find_by_name",           notes: "fd with glob patterns" },
    "subagent.dispatch":  { name: null,                     notes: "browser_subagent for browser tasks only" },
    "task.track":         { name: null,                     notes: null },
    "skill.invoke":       { name: null,                     notes: "skills auto-activate via semantic matching" },
    "web.search":         { name: "search_web",             notes: "with citations" },
    "web.fetch":          { name: "read_url_content",       notes: null },
    "user.ask":           { name: null,                     notes: null },
  },

  extra_tools: [
    { name: "codebase_search",       purpose: "semantic code search (not pattern-based)" },
    { name: "search_in_file",        purpose: "semantic search within a specific file" },
    { name: "view_code_item",        purpose: "view specific code node/function by name" },
    { name: "view_file_outline",     purpose: "show file structure/outline" },
    { name: "view_content_chunk",    purpose: "view document chunks by position" },
    { name: "list_dir",              purpose: "list directory contents" },
    { name: "command_status",        purpose: "check status of background terminal commands" },
    { name: "read_terminal",         purpose: "read terminal output by process ID" },
    { name: "send_command_input",    purpose: "send stdin to running processes" },
    { name: "generate_image",        purpose: "create or edit images from text prompts" },
    { name: "list_resources",        purpose: "show available MCP server resources" },
    { name: "read_resource",         purpose: "retrieve MCP resource contents" },
    { name: "browser_subagent",      purpose: "browser automation (click, scroll, type, screenshots, recording)" },
  ],

  # ── Hooks ──

  hooks: {
    system: "none",
    config_path: null,
    event_case: null,
    timeout_unit: null,
    async_support: false,
    structure: null,
    output_key: null,

    events: {
      "session.start":        { name: null, can_block: false, notes: null },
      "tool.before":          { name: null, can_block: false, notes: null },
      "tool.after":           { name: null, can_block: false, notes: null },
      "tool.after_failure":   { name: null, can_block: false, notes: null },
      "subagent.start":       { name: null, can_block: false, notes: null },
      "subagent.stop":        { name: null, can_block: false, notes: null },
      "compact.before":       { name: null, can_block: false, notes: null },
      "session.stop":         { name: null, can_block: false, notes: null },
      "prompt.before_submit": { name: null, can_block: false, notes: null },
    },

    extra_events: [],
  },

  # ── Context ──

  context: {
    primary_file: "AGENTS.md",
    secondary_files: ["GEMINI.md", ".agents/rules/*.md"],
    priority_note: "GEMINI.md is also loaded if present (Antigravity-native)",
  },

  # ── Skills ──

  skills: {
    path: ".agents/skills/",
    agents_path: ".agent/rules/",
    invocation: "auto-discover via semantic matching",
  },

  # ── Manifest ──

  manifest: {
    path: "package.json",
    marketplace_path: null,
    required_fields: ["name", "displayName", "version", "description", "publisher"],
  },

  # ── Frontmatter ──

  frontmatter: {
    strip: ["model", "tools", "disable-model-invocation", "allowed-tools", "user-invocable"],
    keep: [],
    model_format: null,
    # model field stripped entirely
  },

  # ── MCP ──

  mcp: {
    config_path: null,
    notes: "MCP configured via Antigravity settings UI, not file-based",
  },

  # ── Path Variables ──

  paths: {
    plugin_root: null,
    hooks_scripts: null,
  },
}
```

### Antigravity-specific notes

- ALL tool names differ from Claude Code (every single one is renamed).
- No hook system at all.
- Antigravity uses Workflows (`.agents/workflows/*.md`) for slash-command
  style invocation instead of `user-invocable` frontmatter.
- Skills auto-activate via semantic matching against descriptions.
- Legacy path `.agent/` (singular) also works but `.agents/` (plural)
  is preferred.
