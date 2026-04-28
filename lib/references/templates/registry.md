# Template Registry

Structured data and lookup functions for manifest and context-file templates.
Maps schema names to template paths, target paths, platforms, and rendering modes.

---

## Type

```pseudocode
TYPE TemplateEntry = {
  schema:        string,
  platform:      string,
  mode:          "plain" | "conditional" | "builder",
  template_path: string,
  target_path:   string,
}
```

---

## Data

```pseudocode
TEMPLATE_REGISTRY: List[TemplateEntry] = [
  { schema: "claude-plugin",       platform: "claude-code", mode: "plain",
    template_path: "lib/templates/manifests/claude-plugin/plugin.json.tmpl",
    target_path:   ".claude-plugin/plugin.json" },

  { schema: "claude-marketplace",  platform: "claude-code", mode: "plain",
    template_path: "lib/templates/manifests/claude-plugin/marketplace.json.tmpl",
    target_path:   ".claude-plugin/marketplace.json" },

  { schema: "claude-context",      platform: "claude-code", mode: "plain",
    template_path: "lib/templates/context-files/CLAUDE.md.tmpl",
    target_path:   "CLAUDE.md" },

  { schema: "cursor-plugin",       platform: "cursor",      mode: "conditional",
    template_path: "lib/templates/manifests/cursor-plugin/plugin.json.tmpl",
    target_path:   ".cursor-plugin/plugin.json" },

  { schema: "cursor-marketplace",  platform: "cursor",      mode: "plain",
    template_path: "lib/templates/manifests/cursor-plugin/marketplace.json.tmpl",
    target_path:   ".cursor-plugin/marketplace.json" },

  { schema: "gemini-extension",    platform: "gemini-cli",  mode: "plain",
    template_path: "lib/templates/manifests/gemini-cli/gemini-extension.json.tmpl",
    target_path:   "gemini-extension.json" },

  { schema: "gemini-context",      platform: "gemini-cli",  mode: "builder",
    template_path: "lib/templates/context-files/GEMINI.md.tmpl",
    target_path:   "GEMINI.md" },

  { schema: "agents-context",      platform: "all",         mode: "builder",
    template_path: "lib/templates/context-files/AGENTS.md.tmpl",
    target_path:   "AGENTS.md" },

  { schema: "codex-plugin",        platform: "codex",       mode: "plain",
    template_path: "lib/templates/manifests/codex-plugin/plugin.json.tmpl",
    target_path:   ".codex-plugin/plugin.json" },

  { schema: "codex-marketplace",   platform: "codex",       mode: "plain",
    template_path: "lib/templates/manifests/codex-plugin/marketplace.json.tmpl",
    target_path:   ".agents/plugins/marketplace.json" },

  { schema: "antigravity-package", platform: "antigravity",  mode: "plain",
    template_path: "lib/templates/manifests/antigravity/package.json.tmpl",
    target_path:   "package.json" },

  { schema: "openclaw-plugin",     platform: "openclaw",     mode: "plain",
    template_path: "lib/templates/manifests/openclaw/openclaw.plugin.json.tmpl",
    target_path:   "openclaw.plugin.json" },

  { schema: "using-skill",          platform: "all",          mode: "builder",
    template_path: "lib/templates/context-files/using-skill.md.tmpl",
    target_path:   "skills/using-{{name}}/SKILL.md" },
]
```

---

## Lookup Functions

```pseudocode
FUNCTION template_for_schema(schema)
  RETURNS the TemplateEntry for a given schema name.
  FOR entry IN TEMPLATE_REGISTRY:
    IF entry.schema == schema: RETURN entry

FUNCTION template_for_path(template_ref)
  RETURNS the TemplateEntry matching a rubric template reference.
  Strips "?merge" suffix and prepends "lib/templates/" if needed.
  normalized = strip_suffix(template_ref, "?merge")
  full_path = "lib/templates/" + normalized
  FOR entry IN TEMPLATE_REGISTRY:
    IF entry.template_path == full_path: RETURN entry

FUNCTION templates_for_platform(platform)
  RETURNS all TemplateEntries for a given platform.
  FOR entry IN TEMPLATE_REGISTRY:
    IF entry.platform == platform OR entry.platform == "all":
      INCLUDE entry
```
