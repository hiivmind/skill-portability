# Manifest Generation Schemas

Templates for each platform manifest. All `{{fields}}` are substituted from the canonical metadata model (see `lib/patterns/detection-algorithm.md` Step D3).

---

## claude-plugin

**Target:** `.claude-plugin/plugin.json`

Create `.claude-plugin/` directory if needed. `{{keywords}}` is a JSON array literal (e.g. `["ai", "skills"]`).

```json
{
  "name": "{{name}}",
  "description": "{{description}}",
  "version": "{{version}}",
  "author": {
    "name": "{{author.name}}",
    "email": "{{author.email}}"
  },
  "homepage": "{{homepage}}",
  "repository": "{{repository}}",
  "license": "{{license}}",
  "keywords": {{keywords}}
}
```

---

## claude-marketplace

**Target:** `.claude-plugin/marketplace.json`

```json
{
  "name": "{{marketplaceName}}",
  "description": "Development marketplace for {{name}}",
  "owner": {
    "name": "{{author.name}}",
    "email": "{{author.email}}"
  },
  "plugins": [
    {
      "name": "{{name}}",
      "description": "{{description}}",
      "version": "{{version}}",
      "source": "./",
      "author": {
        "name": "{{author.name}}",
        "email": "{{author.email}}"
      }
    }
  ]
}
```

---

## claude-context

**Target:** `CLAUDE.md`

```markdown
# {{displayName}}

{{description}}

This plugin is loaded via Claude Code's plugin system. Skills are invoked via the `Skill` tool.
```

---

## cursor-plugin

**Target:** `.cursor-plugin/plugin.json`

Create `.cursor-plugin/` directory if needed.

**Conditional logic:** Omit the `"agents"` key if `agents/` doesn't exist. Omit the `"commands"` key if `commands/` doesn't exist.

```json
{
  "name": "{{name}}",
  "displayName": "{{displayName}}",
  "description": "{{description}}",
  "version": "{{version}}",
  "author": {
    "name": "{{author.name}}",
    "email": "{{author.email}}"
  },
  "homepage": "{{homepage}}",
  "repository": "{{repository}}",
  "license": "{{license}}",
  "keywords": {{keywords}},
  "skills": "./skills/",
  "agents": "./agents/",
  "commands": "./commands/",
  "hooks": "./hooks/hooks-cursor.json"
}
```

---

## gemini-extension

**Target:** `gemini-extension.json`

```json
{
  "name": "{{name}}",
  "description": "{{description}}",
  "version": "{{version}}",
  "contextFileName": "GEMINI.md"
}
```

---

## gemini-context

**Target:** `GEMINI.md`

Build the include blocks from the skills/agents/commands lists inventoried during discovery. The file contains only `@` include directives and no other prose.

`{{skillIncludes}}` — one line per skill:
```
@./skills/<skillname>/SKILL.md
@./skills/<skillname>/references/gemini-tools.md
```

`{{agentIncludes}}` — one line per agent file (omit this block entirely if no agents):
```
@./agents/<agentfile>.md
```

`{{commandIncludes}}` — one line per command file (omit this block entirely if no commands):
```
@./commands/<commandfile>.md
```

Assembled result written to `GEMINI.md` contains only the `@` include directives — no prose, no headings.

---

## agents-context

**Target:** `AGENTS.md`

Build skill bullet list for `{{skillIncludes}}`:
```
- skills/<skillname>/SKILL.md
```

Build command bullet list for `{{commandIncludes}}` (omit the entire Commands section if no commands exist):
```
- commands/<commandfile>.md
```

```markdown
# {{displayName}}

{{description}}

## Skills

This plugin provides the following skills. Read the SKILL.md files listed to understand how to invoke each skill:

{{skillIncludes}}

## Commands

{{commandIncludes}}

## Tool Name Mapping

Skills use Claude Code tool names. Platform equivalents:

- `Read` → your platform's file-read tool
- `Write` → your platform's file-write tool
- `Edit` → your platform's file-edit tool
- `Bash` → your platform's shell/command tool
- `Grep` → your platform's content-search tool
- `Glob` → your platform's file-search tool
- `Skill` tool → your platform's skill-invoke tool (or follow instructions directly)
- `Task` tool → your platform's subagent-dispatch tool (if supported)

See each skill's `references/` directory for platform-specific tool mapping tables.
```

---

## opencode-package

**Target:** `package.json`

```json
{
  "name": "{{name}}",
  "version": "{{version}}",
  "type": "module",
  "main": "{{opencodeMain}}"
}
```

---

## opencode-shim

**Target:** `.opencode/plugins/<name>.js`

Create `.opencode/plugins/` directory if needed. This is the minimal non-bootstrap version of the OpenCode plugin shim.

```javascript
// OpenCode plugin registration for {{name}}
// Skills are loaded from ./skills/ by the OpenCode runtime.
export default {
  name: "{{name}}",
  description: "{{description}}",
  skills: "./skills/",
};
```

---

## codex-plugin

**Target:** `.codex-plugin/plugin.json`

Create `.codex-plugin/` directory if needed. Only generated when Codex recommendation is `native-plugin-packaging`.

```json
{
  "name": "{{name}}",
  "description": "{{description}}",
  "version": "{{version}}",
  "skills": "./skills/",
  "hooks": "./hooks/"
}
```

---

## copilot-instructions

**Target:** `.github/copilot-instructions.md`

Create `.github/` directory if needed.

```markdown
# {{displayName}}

{{description}}

## Skills

This project provides agent skills in the `skills/` directory. Skills follow the open SKILL.md standard and are auto-discovered by Copilot CLI.

## Tool Name Mapping

Skills use Claude Code tool names. Copilot CLI equivalents:

- `Read` → `view`
- `Write` → `create`
- `Edit` → `edit` / `apply_patch`
- `Bash` → `bash` / `powershell`
- `Grep` → `grep` / `rg`
- `Glob` → `glob`
- `Skill` → `skill`
- `Task` / `Agent` → subagent dispatch

See each skill's `references/copilot-tools.md` for detailed mapping.
```
