# Skill Restructuring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure both skills to follow the bp-assess exemplar pattern — hierarchical phases, pseudocode, externalised references.

**Architecture:** Extract shared content to `lib/`, per-skill detail to `patterns/`, then rewrite both SKILL.md files as concise orchestrators. All content already exists inline — this is extraction + reformatting, not new functionality.

**Tech Stack:** Markdown skill files with pseudocode blocks.

---

## File Structure

| File | Action | Source |
|------|--------|--------|
| `lib/references/copilot-tools.md` | Create | Extract from uplifting SKILL.md lines 384-437 |
| `lib/references/codex-tools.md` | Create | Extract from uplifting SKILL.md lines 441-542 |
| `lib/references/gemini-tools.md` | Create | Extract from uplifting SKILL.md lines 546-580 |
| `lib/patterns/detection-algorithm.md` | Create | Extract from uplifting SKILL.md lines 40-107 |
| `lib/templates/hooks/session-start.sh` | Create | Extract from uplifting SKILL.md lines 647-687 |
| `lib/templates/hooks/run-hook.cmd` | Create | Extract from uplifting SKILL.md lines 695-735 |
| `skills/uplifting-a-plugin/patterns/manifest-generation.md` | Create | Extract from uplifting SKILL.md lines 143-324 |
| `skills/uplifting-a-plugin/patterns/hook-merging.md` | Create | Extract from uplifting SKILL.md lines 326-359, 739-776 |
| `skills/uplifting-a-plugin/patterns/bootstrapping.md` | Create | Extract from uplifting SKILL.md lines 592-833 |
| `skills/auditing-plugin-portability/patterns/injection-checks.md` | Create | Extract from auditing SKILL.md lines 117-138 |
| `skills/uplifting-a-plugin/SKILL.md` | Rewrite | Complete rewrite using phase hierarchy |
| `skills/auditing-plugin-portability/SKILL.md` | Rewrite | Complete rewrite using phase hierarchy |

---

### Task 1: Extract platform tool references to lib/references/

**Files:**
- Create: `lib/references/copilot-tools.md`
- Create: `lib/references/codex-tools.md`
- Create: `lib/references/gemini-tools.md`

- [ ] **Step 1: Create lib/references/ directory**

```bash
mkdir -p /home/nathanielramm/git/github/plugin-portability/lib/references
```

- [ ] **Step 2: Write copilot-tools.md**

Extract the content from uplifting SKILL.md lines 384-437 (the content inside the markdown code block, without the surrounding triple backticks). Write verbatim to `lib/references/copilot-tools.md`. The file starts with `# Copilot CLI Tool Mapping` and ends with the GitHub MCP tools table row.

- [ ] **Step 3: Write codex-tools.md**

Extract the content from uplifting SKILL.md lines 441-542 (the content inside the markdown code block). Write verbatim to `lib/references/codex-tools.md`. The file starts with `# Codex Tool Mapping` and ends with the Codex App Finishing section.

- [ ] **Step 4: Write gemini-tools.md**

Extract the content from uplifting SKILL.md lines 546-580 (the content inside the markdown code block). Write verbatim to `lib/references/gemini-tools.md`. The file starts with `# Gemini CLI Tool Mapping` and ends with the `enter_plan_mode` / `exit_plan_mode` table row.

- [ ] **Step 5: Verify all three files exist and have content**

```bash
wc -l lib/references/*.md
```

Expected: ~54 lines for copilot, ~102 lines for codex, ~35 lines for gemini.

- [ ] **Step 6: Commit**

```bash
git add lib/references/
git commit -m "refactor: extract platform tool references to lib/references/"
```

---

### Task 2: Extract detection algorithm to lib/patterns/

**Files:**
- Create: `lib/patterns/detection-algorithm.md`

- [ ] **Step 1: Create lib/patterns/ directory**

```bash
mkdir -p /home/nathanielramm/git/github/plugin-portability/lib/patterns
```

- [ ] **Step 2: Write detection-algorithm.md**

Create `lib/patterns/detection-algorithm.md` with the detection algorithm content converted to pseudocode format. Source is uplifting SKILL.md lines 40-107 (the Detection Algorithm section with Steps D1-D4). Convert the prose + tables into pseudocode while preserving all detail:

```markdown
# Detection Algorithm

Shared by `uplifting-a-plugin` and `auditing-plugin-portability`. Run once at start.

---

## Step D1: Scan for Metadata Sources

```pseudocode
SCAN_METADATA_SOURCES(plugin_path):
  sources = []

  source_definitions = [
    {
      path: ".claude-plugin/plugin.json",
      fields: ["name", "description", "version", "author.name", "author.email",
               "homepage", "repository", "license", "keywords"]
    },
    {
      path: ".cursor-plugin/plugin.json",
      fields: ["name", "displayName", "description", "version", "author.name",
               "author.email", "homepage", "repository", "license", "keywords"]
    },
    {
      path: "gemini-extension.json",
      fields: ["name", "description", "version"]
    },
    {
      path: "package.json",
      fields: ["name", "version", "description"]
    },
    {
      path: "AGENTS.md",
      fields: ["name", "description"],
      parse: "name from first H1 heading, description from first non-heading paragraph"
    },
    {
      path: "skills/*/SKILL.md",
      fields: ["name", "description"],
      parse: "YAML frontmatter name: field (or directory name fallback), description: field"
    }
  ]

  FOR def IN source_definitions:
    IF file_exists(plugin_path + "/" + def.path):
      content = Read(plugin_path + "/" + def.path)
      parsed = extract_fields(content, def.fields)
      populated = count_non_empty(parsed)
      sources.append({ path: def.path, fields: parsed, score: populated })

  RETURN sources
```

If no sources found, stop and report:
> "No recognisable plugin signals found in `<plugin_path>`. Provide at least one platform manifest or one `skills/*/SKILL.md` with `name` and `description` frontmatter."

---

## Step D2: Score and Elect Canonical Source

```pseudocode
ELECT_CANONICAL(sources):
  # Sort by score descending
  sorted = sort(sources, key=score, descending=true)

  # Tie-breaking order (highest priority first)
  tie_break_order = [
    ".claude-plugin/plugin.json",
    ".cursor-plugin/plugin.json",
    "gemini-extension.json",
    "package.json",
    "AGENTS.md",
    "skills/*/SKILL.md"   # first alphabetically by directory name
  ]

  IF len(sorted) > 1 AND sorted[0].score == sorted[1].score:
    # Break tie using priority order
    FOR priority_path IN tie_break_order:
      FOR source IN sorted WHERE source.score == sorted[0].score:
        IF source.path matches priority_path:
          RETURN source

  RETURN sorted[0]
```

---

## Step D3: Build Canonical Metadata Model

```pseudocode
BUILD_METADATA_MODEL(sources):
  canonical = ELECT_CANONICAL(sources)
  metadata = copy(canonical.fields)

  # Fill gaps from remaining sources in descending score order
  remaining = sort(sources - canonical, key=score, descending=true)
  FOR field IN all_fields:
    IF metadata[field] is empty:
      FOR source IN remaining:
        IF source.fields[field] is not empty:
          metadata[field] = source.fields[field]
          BREAK

  # Hard fallbacks (only when not found in any source)
  hard_fallbacks = {
    name:         basename(plugin_path),
    displayName:  title_case(metadata.name),    # replace - and _ with spaces, capitalise
    description:  "",                            # flag as missing
    version:      "0.1.0",
    author_name:  "",                            # flag as missing
    author_email: "",                            # flag as missing
    homepage:     "",
    repository:   "",
    license:      "MIT",
    keywords:     []
  }

  FOR field, fallback IN hard_fallbacks:
    IF metadata[field] is empty:
      metadata[field] = fallback

  # Always derive (never read from sources)
  metadata.marketplaceName = metadata.name + "-dev"
  metadata.opencodeMain = ".opencode/plugins/" + metadata.name + ".js"

  RETURN metadata
```

---

## Step D4: Print Inference Summary

```pseudocode
PRINT_INFERENCE_SUMMARY(metadata, canonical):
  DISPLAY "## Metadata inferred"
  DISPLAY "  canonical source: {canonical.path}  ({canonical.score} fields)"
  FOR field IN metadata:
    IF field.value is empty OR field.is_fallback:
      DISPLAY "  {field.name}: [{field.source_info}]"
    ELSE:
      DISPLAY "  {field.name}: {field.value}  (from {field.source})"
```

Example output:

```
## Metadata inferred
  canonical source: .claude-plugin/plugin.json  (9 fields)
  name:          my-plugin        (from .claude-plugin/plugin.json)
  description:   Does X for Y.   (from .claude-plugin/plugin.json)
  version:       1.2.0            (from .cursor-plugin/plugin.json)
  author.name:   [missing — not found in any source]
  author.email:  [missing — not found in any source]
  homepage:                       (empty string — not found)
  repository:                     (empty string — not found)
  license:       MIT              (hard fallback)
  keywords:      []               (hard fallback)
```
```

- [ ] **Step 3: Verify the file**

```bash
wc -l lib/patterns/detection-algorithm.md
```

Expected: ~130 lines.

- [ ] **Step 4: Commit**

```bash
git add lib/patterns/
git commit -m "refactor: extract detection algorithm to lib/patterns/"
```

---

### Task 3: Extract hook templates to lib/templates/hooks/

**Files:**
- Create: `lib/templates/hooks/session-start.sh`
- Create: `lib/templates/hooks/run-hook.cmd`

- [ ] **Step 1: Create lib/templates/hooks/ directory**

```bash
mkdir -p /home/nathanielramm/git/github/plugin-portability/lib/templates/hooks
```

- [ ] **Step 2: Write session-start.sh**

Extract the bash script content from uplifting SKILL.md lines 647-687 (the content inside the bash code block). Write verbatim to `lib/templates/hooks/session-start.sh`. The file starts with `#!/usr/bin/env bash` and ends with `exit 0`. All `{{name}}` placeholders remain as-is — they are substituted at generation time.

- [ ] **Step 3: Write run-hook.cmd**

Extract the polyglot script from uplifting SKILL.md lines 695-735 (the content inside the batch code block). Write verbatim to `lib/templates/hooks/run-hook.cmd`. The file starts with `: << 'CMDBLOCK'` and ends with `exec bash "${SCRIPT_DIR}/${SCRIPT_NAME}" "$@"`.

- [ ] **Step 4: Commit**

```bash
git add lib/templates/
git commit -m "refactor: extract hook templates to lib/templates/hooks/"
```

---

### Task 4: Create manifest-generation.md pattern

**Files:**
- Create: `skills/uplifting-a-plugin/patterns/manifest-generation.md`

- [ ] **Step 1: Create patterns directory**

```bash
mkdir -p /home/nathanielramm/git/github/plugin-portability/skills/uplifting-a-plugin/patterns
```

- [ ] **Step 2: Write manifest-generation.md**

Create the file containing all 9 manifest schemas extracted from uplifting SKILL.md Steps 4-12 (lines 143-324). Each schema is a named section with the exact template content. Format:

```markdown
# Manifest Generation Schemas

Templates for each platform manifest. All `{{fields}}` are substituted from the canonical metadata model (see `lib/patterns/detection-algorithm.md` Step D3).

---

## claude-plugin

**Target:** `.claude-plugin/plugin.json`

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

Omit `"agents"` key if `agents/` doesn't exist. Omit `"commands"` key if `commands/` doesn't exist.

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

Build from inventoried assets. File contains only `@` include directives:

```pseudocode
BUILD_GEMINI_MD(computed):
  lines = []
  FOR skill IN computed.skills:
    lines.append("@./skills/" + skill.name + "/SKILL.md")
    lines.append("@./skills/" + skill.name + "/references/gemini-tools.md")
  FOR agent IN computed.agents:
    lines.append("@./agents/" + agent)
  FOR command IN computed.commands:
    lines.append("@./commands/" + command)
  RETURN join(lines, "\n")
```

---

## agents-context

**Target:** `AGENTS.md`

```markdown
# {{displayName}}

{{description}}

## Skills

This plugin provides the following skills. Read the SKILL.md files listed to understand how to invoke each skill:

{{skillBulletList}}

## Commands

{{commandBulletList}}

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

Where:
- `{{skillBulletList}}` = one `- skills/<name>/SKILL.md` per skill
- `{{commandBulletList}}` = one `- commands/<file>.md` per command (omit Commands section entirely if none)

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

**Target:** `.opencode/plugins/{{name}}.js`

Minimal version (without bootstrapping):

```javascript
// OpenCode plugin registration for {{name}}
// Skills are loaded from ./skills/ by the OpenCode runtime.
export default {
  name: "{{name}}",
  description: "{{description}}",
  skills: "./skills/",
};
```
```

- [ ] **Step 3: Commit**

```bash
git add skills/uplifting-a-plugin/patterns/manifest-generation.md
git commit -m "refactor: extract manifest schemas to patterns/manifest-generation.md"
```

---

### Task 5: Create hook-merging.md pattern

**Files:**
- Create: `skills/uplifting-a-plugin/patterns/hook-merging.md`

- [ ] **Step 1: Write hook-merging.md**

Create the file with hook event mapping and merge logic extracted from uplifting SKILL.md Steps 13 and 22:

```markdown
# Hook Merging

Event name mapping and merge logic for porting hooks across platforms.

---

## Event Name Mapping

| Claude Code event | Cursor event |
|---|---|
| `SessionStart` | `sessionStart` |
| `UserPromptSubmit` | `userMessage` |
| `PostToolUse` | `postToolUse` |
| `Stop` | `agentStop` |

---

## Generate Cursor Hooks from Claude Hooks

```pseudocode
GENERATE_CURSOR_HOOKS(hooks_json_content):
  claude_hooks = parse_json(hooks_json_content)
  cursor_hooks = { version: 1, hooks: {} }

  event_map = {
    "SessionStart":      "sessionStart",
    "UserPromptSubmit":  "userMessage",
    "PostToolUse":       "postToolUse",
    "Stop":              "agentStop"
  }

  FOR event_name, entries IN claude_hooks.hooks:
    cursor_event = event_map[event_name]
    IF cursor_event is null:
      SKIP   # Unknown event — cannot map
    cursor_hooks.hooks[cursor_event] = []
    FOR entry IN entries:
      cursor_hooks.hooks[cursor_event].append({ command: entry.command })

  Write("hooks/hooks-cursor.json", to_json(cursor_hooks))

  # Flag any commands containing $CLAUDE_PLUGIN_ROOT
  FOR event, entries IN claude_hooks.hooks:
    FOR entry IN entries:
      IF "$CLAUDE_PLUGIN_ROOT" IN entry.command:
        computed.flagged.append(
          entry.command + " — uses $CLAUDE_PLUGIN_ROOT, needs manual review for Cursor"
        )
```

If no hooks exist, write empty hooks-cursor.json:

```json
{
  "version": 1,
  "hooks": {}
}
```

---

## Merge SessionStart into Existing Hooks

Used by bootstrapping (Phase 4). Adds SessionStart entry without overwriting existing hooks.

```pseudocode
MERGE_SESSION_START_HOOKS(computed):
  # --- hooks.json (Claude Code / Copilot CLI) ---
  IF file_exists("hooks/hooks.json"):
    hooks = parse_json(Read("hooks/hooks.json"))
  ELSE:
    hooks = { hooks: {} }

  session_start_entry = {
    command: "hooks/run-hook.cmd session-start",
    matcher: "startup|clear|compact"
  }

  IF "SessionStart" NOT IN hooks.hooks:
    hooks.hooks["SessionStart"] = [session_start_entry]
  ELSE:
    existing = find(hooks.hooks["SessionStart"], WHERE command contains "session-start")
    IF existing:
      existing.command = session_start_entry.command
      existing.matcher = session_start_entry.matcher
    ELSE:
      hooks.hooks["SessionStart"].append(session_start_entry)

  Write("hooks/hooks.json", to_json(hooks))

  # --- hooks-cursor.json (Cursor) ---
  IF file_exists("hooks/hooks-cursor.json"):
    cursor = parse_json(Read("hooks/hooks-cursor.json"))
  ELSE:
    cursor = { version: 1, hooks: {} }

  cursor_entry = { command: "hooks/run-hook.cmd session-start" }

  IF "sessionStart" NOT IN cursor.hooks:
    cursor.hooks["sessionStart"] = [cursor_entry]
  ELSE:
    existing = find(cursor.hooks["sessionStart"], WHERE command contains "session-start")
    IF existing:
      existing.command = cursor_entry.command
    ELSE:
      cursor.hooks["sessionStart"].append(cursor_entry)

  Write("hooks/hooks-cursor.json", to_json(cursor))
```
```

- [ ] **Step 2: Commit**

```bash
git add skills/uplifting-a-plugin/patterns/hook-merging.md
git commit -m "refactor: extract hook merging logic to patterns/hook-merging.md"
```

---

### Task 6: Create bootstrapping.md pattern

**Files:**
- Create: `skills/uplifting-a-plugin/patterns/bootstrapping.md`

- [ ] **Step 1: Write bootstrapping.md**

Create the file with all bootstrapping generation logic extracted from uplifting SKILL.md Steps 18-24:

```markdown
# Bootstrapping Generation

Session-start injection infrastructure. All steps below run only when user opts in during Phase 4.

---

## Step 4.1: Generate using-plugin Skill

```pseudocode
GENERATE_USING_SKILL(computed):
  skill_dir = "skills/using-" + computed.metadata.name
  mkdir(skill_dir)

  # Build skill table from inventoried skills (Phase 2)
  skill_table = ""
  FOR skill IN computed.skills:
    IF skill.name == "using-" + computed.metadata.name:
      CONTINUE
    frontmatter = parse_yaml_frontmatter(skill.content)
    skill_table += "| `" + frontmatter.name + "` | " + frontmatter.description + " |\n"

  content = render_template("using-skill", {
    name: computed.metadata.name,
    displayName: computed.metadata.displayName,
    skillTable: skill_table
  })

  Write(skill_dir + "/SKILL.md", content)
  computed.created.append(skill_dir + "/SKILL.md")
```

### using-skill Template

```markdown
---
name: using-{{name}}
description: Session-start bootstrapping for {{name}}. Lists available skills and platform-specific invocation instructions.
---

# Using {{displayName}}

This plugin provides the following skills:

| Skill | Description |
|-------|-------------|
{{skillTable}}

## How to Invoke Skills

**Claude Code / Cursor:** Use the `Skill` tool with the skill name.

**Copilot CLI:** Use the `skill` tool with the skill name.

**Gemini CLI:** Use the `activate_skill` tool with the skill name.

**Codex / Other:** Skills are auto-discovered. Follow the SKILL.md instructions directly.

## Tool Name Mapping

Skills use Claude Code tool names. See each skill's `references/` directory for platform-specific equivalents.
```

---

## Step 4.2: Generate using-plugin Sidecars

```pseudocode
GENERATE_USING_SIDECARS(computed):
  ref_dir = "skills/using-" + computed.metadata.name + "/references"
  mkdir(ref_dir)
  platforms = ["copilot-tools.md", "codex-tools.md", "gemini-tools.md"]
  FOR platform IN platforms:
    source = Read("lib/references/" + platform)
    Write(ref_dir + "/" + platform, source)
    computed.created.append(ref_dir + "/" + platform)
```

---

## Step 4.3: Generate session-start Script

```pseudocode
GENERATE_SESSION_START(computed):
  template = Read("lib/templates/hooks/session-start.sh")
  content = substitute(template, computed.metadata)
  Write("hooks/session-start", content)
  chmod("+x", "hooks/session-start")
  computed.created.append("hooks/session-start")
```

---

## Step 4.4: Generate run-hook.cmd

```pseudocode
GENERATE_RUN_HOOK_CMD(computed):
  template = Read("lib/templates/hooks/run-hook.cmd")
  Write("hooks/run-hook.cmd", template)   # No substitution needed — generic wrapper
  chmod("+x", "hooks/run-hook.cmd")
  computed.created.append("hooks/run-hook.cmd")
```

---

## Step 4.5: Merge SessionStart Hooks

See `patterns/hook-merging.md` → MERGE_SESSION_START_HOOKS.

---

## Step 4.6: Enhance OpenCode Plugin

```pseudocode
ENHANCE_OPENCODE_PLUGIN(computed):
  target = ".opencode/plugins/" + computed.metadata.name + ".js"

  IF file_exists(target):
    response = ASK "Bootstrapping will regenerate {target} with session-start injection. Continue? (y/n)"
    IF response == "no":
      RETURN

  content = render_template("opencode-bootstrap", computed.metadata)
  Write(target, content)
  computed.created.append(target)
```

### opencode-bootstrap Template

```javascript
// OpenCode plugin for {{name}} with session-start bootstrapping
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginRoot = join(__dirname, '../..');
const bootstrapContent = readFileSync(
  join(pluginRoot, 'skills/using-{{name}}/SKILL.md'), 'utf8'
);

export default {
  name: "{{name}}",
  description: "{{description}}",
  skills: "./skills/",
  experimental: {
    chat: {
      messages: {
        transform: (messages) => {
          if (messages.length > 0 && messages[0].role === 'user') {
            messages[0].content = bootstrapContent + '\n\n' + messages[0].content;
          }
          return messages;
        }
      }
    }
  }
};
```

---

## Step 4.7: Update GEMINI.md

```pseudocode
UPDATE_GEMINI_MD(computed):
  IF file_exists("GEMINI.md"):
    response = ASK "Bootstrapping will regenerate GEMINI.md with using-{name} first. Continue? (y/n)"
    IF response == "no":
      RETURN

  # Rebuild with using-plugin first
  lines = []
  lines.append("@./skills/using-" + computed.metadata.name + "/SKILL.md")
  lines.append("@./skills/using-" + computed.metadata.name + "/references/gemini-tools.md")

  FOR skill IN computed.skills:
    IF skill.name == "using-" + computed.metadata.name:
      CONTINUE
    lines.append("@./skills/" + skill.name + "/SKILL.md")
    lines.append("@./skills/" + skill.name + "/references/gemini-tools.md")

  FOR agent IN computed.agents:
    lines.append("@./agents/" + agent)
  FOR command IN computed.commands:
    lines.append("@./commands/" + command)

  Write("GEMINI.md", join(lines, "\n"))
```
```

- [ ] **Step 2: Commit**

```bash
git add skills/uplifting-a-plugin/patterns/bootstrapping.md
git commit -m "refactor: extract bootstrapping logic to patterns/bootstrapping.md"
```

---

### Task 7: Rewrite uplifting-a-plugin/SKILL.md

**Files:**
- Rewrite: `skills/uplifting-a-plugin/SKILL.md`

- [ ] **Step 1: Read current file to confirm content**

```bash
wc -l skills/uplifting-a-plugin/SKILL.md
```

Expected: 866 lines (current).

- [ ] **Step 2: Write the new SKILL.md**

Replace the entire file with the restructured version. The complete content follows:

```markdown
---
name: uplifting-a-plugin
description: >
  Add multi-platform portability to any plugin. Accepts any starting state —
  Claude, Cursor, Gemini, OpenCode, npx skills, or bare SKILL.md files. Detects
  what exists, infers canonical metadata, emits every missing platform artifact.
  Optionally generates session-start bootstrapping hooks.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
inputs:
  - name: plugin_path
    type: string
    required: true
    description: Path to the plugin root directory
outputs:
  - name: report
    type: object
    description: Summary of created, skipped, and flagged files
---

# Uplifting a Plugin to Multi-Platform Portability

Transform any plugin into a fully portable plugin following the superpowers portability pattern.
No platform is assumed to already exist — Claude Code manifests are an equally valid target as
Cursor or Gemini manifests.

> **Detection Algorithm:** `lib/patterns/detection-algorithm.md`
> **Manifest Schemas:** `patterns/manifest-generation.md`
> **Hook Merging:** `patterns/hook-merging.md`
> **Bootstrapping:** `patterns/bootstrapping.md`
> **Platform References:** `lib/references/copilot-tools.md`, `codex-tools.md`, `gemini-tools.md`
> **Hook Templates:** `lib/templates/hooks/session-start.sh`, `run-hook.cmd`

---

## Overview

| Phase | Description |
|-------|-------------|
| **Phase 1: Detect** | Scan metadata sources, elect canonical, build metadata model |
| **Phase 2: Inventory** | List skills, commands, agents, existing hooks; init tracking |
| **Phase 3: Generate** | Write missing manifests, context files, sidecars; port hooks |
| **Phase 4: Bootstrap** | Opt-in session-start injection across all platforms |
| **Phase 5: Report** | Summary of created, skipped, and flagged files |

**Minimum starting state:** At least one `skills/*/SKILL.md` with `name` + `description`
frontmatter, or any platform manifest file.

**Idempotent:** Running twice on the same repo produces no diff on the second run.

---

## Phase 1: Detect

Run the shared detection algorithm. See `lib/patterns/detection-algorithm.md` for full detail.

### Step 1.1: Scan and Infer

```pseudocode
DETECT(plugin_path):
  computed.sources = scan_metadata_sources(plugin_path)        # D1

  IF len(computed.sources) == 0:
    DISPLAY "No recognisable plugin signals found in {plugin_path}."
    DISPLAY "Provide at least one platform manifest or one skills/*/SKILL.md"
    DISPLAY "with name and description frontmatter."
    EXIT

  computed.canonical = elect_canonical(computed.sources)        # D2
  computed.metadata = build_metadata_model(computed.sources)    # D3
  print_inference_summary(computed.metadata, computed.canonical) # D4
```

---

## Phase 2: Inventory

### Step 2.1: Discover Assets

```pseudocode
INVENTORY(plugin_path):
  computed.skills = Glob(plugin_path + "/skills/*/SKILL.md")
  computed.commands = Glob(plugin_path + "/commands/*.md")
  computed.agents = Glob(plugin_path + "/agents/*.md")
  computed.existing_hooks = read_json_if_exists(plugin_path + "/hooks/hooks.json")

  computed.created = []
  computed.skipped = []
  computed.flagged = []
```

### Step 2.2: Check Conflicts

```pseudocode
CHECK_CONFLICTS(computed):
  targets = [
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    ".cursor-plugin/plugin.json",
    "gemini-extension.json",
    "GEMINI.md",
    "AGENTS.md",
    "CLAUDE.md",
    "package.json",
    ".opencode/plugins/" + computed.metadata.name + ".js",
    "hooks/hooks-cursor.json"
  ]

  FOR target IN targets:
    IF file_exists(target):
      computed.skipped.append(target)
```

---

## Phase 3: Generate

### Step 3.1: Write Platform Manifests

Table-driven generation. See `patterns/manifest-generation.md` for all schemas.

```pseudocode
GENERATE_MANIFESTS(computed):
  manifests = [
    { target: ".claude-plugin/plugin.json",      schema: "claude-plugin"      },
    { target: ".claude-plugin/marketplace.json",  schema: "claude-marketplace" },
    { target: "CLAUDE.md",                        schema: "claude-context"     },
    { target: ".cursor-plugin/plugin.json",       schema: "cursor-plugin"      },
    { target: "gemini-extension.json",            schema: "gemini-extension"   },
    { target: "GEMINI.md",                        schema: "gemini-context"     },
    { target: "AGENTS.md",                        schema: "agents-context"     },
    { target: "package.json",                     schema: "opencode-package"   },
    { target: ".opencode/plugins/{{name}}.js",    schema: "opencode-shim"      },
  ]

  FOR manifest IN manifests:
    resolved = substitute(manifest.target, computed.metadata)
    IF resolved IN computed.skipped:
      CONTINUE
    content = render_schema(manifest.schema, computed.metadata)
    Write(resolved, content)
    computed.created.append(resolved)
```

### Step 3.2: Seed Tool-Mapping Sidecars

```pseudocode
GENERATE_SIDECARS(computed):
  platforms = ["copilot-tools.md", "codex-tools.md", "gemini-tools.md"]
  FOR skill IN computed.skills:
    FOR platform IN platforms:
      target = "skills/" + skill.name + "/references/" + platform
      IF NOT file_exists(target):
        source = Read("lib/references/" + platform)
        Write(target, source)
        computed.created.append(target)
```

### Step 3.3: Port Hooks

See `patterns/hook-merging.md` for event mapping and merge logic.

```pseudocode
PORT_HOOKS(computed):
  IF computed.existing_hooks:
    generate_cursor_hooks(computed.existing_hooks)
    computed.created.append("hooks/hooks-cursor.json")
  ELSE:
    Write("hooks/hooks-cursor.json", '{ "version": 1, "hooks": {} }')
    computed.created.append("hooks/hooks-cursor.json")
```

### Step 3.4: Validate npx Skills Frontmatter

```pseudocode
VALIDATE_FRONTMATTER(computed):
  FOR skill IN computed.skills:
    frontmatter = parse_yaml_frontmatter(skill.content)
    IF NOT frontmatter.name OR NOT frontmatter.description:
      computed.flagged.append(
        skill.path + " — missing frontmatter field(s). Add name: and description: in YAML frontmatter."
      )
```

Do NOT auto-write — frontmatter descriptions require human authorship.

---

## Phase 4: Bootstrap (opt-in)

Session-start injection. See `patterns/bootstrapping.md` for full generation logic.

### Step 4.1: Prompt

```pseudocode
BOOTSTRAP(computed):
  IF file_exists("skills/using-" + computed.metadata.name + "/SKILL.md"):
    computed.bootstrap_status = "already-configured"
    RETURN

  response = ASK "Would you like to generate session-start bootstrapping hooks? " +
    "This creates a using-{name} skill that gets force-injected at session start " +
    "on Claude Code, Cursor, Copilot CLI, OpenCode, and Gemini CLI. (y/n)"

  IF response == "no":
    computed.bootstrap_status = "declined"
    RETURN

  # Execute bootstrapping steps — see patterns/bootstrapping.md
  generate_using_skill(computed)           # 4.2
  generate_using_sidecars(computed)        # 4.3
  generate_session_start(computed)         # 4.4 — from lib/templates/hooks/
  generate_run_hook_cmd(computed)          # 4.5 — from lib/templates/hooks/
  merge_session_start_hooks(computed)      # 4.6 — see patterns/hook-merging.md
  enhance_opencode_plugin(computed)        # 4.7
  update_gemini_md(computed)              # 4.8
  computed.bootstrap_status = "configured"
```

---

## Phase 5: Report

### Step 5.1: Emit Final Report

```pseudocode
REPORT(computed):
  DISPLAY "# Uplift Report: {computed.metadata.name} v{computed.metadata.version}"
  DISPLAY "Metadata inferred from: {computed.canonical.path}"
  DISPLAY ""

  DISPLAY "## Metadata inferred"
  print_inference_summary(computed.metadata, computed.canonical)
  DISPLAY ""

  DISPLAY "## Created"
  FOR path IN computed.created:
    DISPLAY "  " + path
  DISPLAY ""

  DISPLAY "## Skipped (already exists)"
  FOR path IN computed.skipped:
    DISPLAY "  " + path
  DISPLAY ""

  DISPLAY "## Needs manual review"
  FOR item IN computed.flagged:
    DISPLAY "  " + item
  DISPLAY ""

  DISPLAY "## Session-start bootstrapping"
  SWITCH computed.bootstrap_status:
    CASE "configured":
      DISPLAY "  Session-start injection configured."
    CASE "declined":
      DISPLAY "  Session-start injection: not configured (user declined)"
    CASE "already-configured":
      DISPLAY "  Session-start injection: already configured"
```

---

## State Flow

```
Phase 1          Phase 2            Phase 3            Phase 4            Phase 5
──────────────────────────────────────────────────────────────────────────────────
computed         computed.skills    computed.created   computed           Report
 .sources        .commands          .skipped           .bootstrap        (displayed)
 .canonical      .agents            .flagged           _status
 .metadata       .existing_hooks
```

---

## Reference Documentation

- **Detection Algorithm:** `lib/patterns/detection-algorithm.md` (shared)
- **Manifest Schemas:** `patterns/manifest-generation.md` (local)
- **Hook Merging:** `patterns/hook-merging.md` (local)
- **Bootstrapping:** `patterns/bootstrapping.md` (local)
- **Copilot Tool Mapping:** `lib/references/copilot-tools.md` (shared)
- **Codex Tool Mapping:** `lib/references/codex-tools.md` (shared)
- **Gemini Tool Mapping:** `lib/references/gemini-tools.md` (shared)
- **Session-Start Template:** `lib/templates/hooks/session-start.sh` (shared)
- **Run-Hook Template:** `lib/templates/hooks/run-hook.cmd` (shared)

---

## Related Skills

- **Audit portability:** `skills/auditing-plugin-portability/SKILL.md`
```

- [ ] **Step 3: Verify line count**

```bash
wc -l skills/uplifting-a-plugin/SKILL.md
```

Expected: ~280-320 lines (down from 866).

- [ ] **Step 4: Commit**

```bash
git add skills/uplifting-a-plugin/SKILL.md
git commit -m "refactor: rewrite uplifting skill with phase hierarchy and pseudocode"
```

---

### Task 8: Create injection-checks.md pattern

**Files:**
- Create: `skills/auditing-plugin-portability/patterns/injection-checks.md`

- [ ] **Step 1: Create patterns directory**

```bash
mkdir -p /home/nathanielramm/git/github/plugin-portability/skills/auditing-plugin-portability/patterns
```

- [ ] **Step 2: Write injection-checks.md**

```markdown
# Injection Checks

8-component verification for session-start bootstrapping infrastructure.
Only runs when `skills/using-<name>/SKILL.md` exists.

---

## Components

| # | Component | Check | Status Values |
|---|-----------|-------|---------------|
| 1 | `skills/using-{{name}}/SKILL.md` | File exists | PRESENT / MISSING |
| 2 | `skills/using-{{name}}/references/gemini-tools.md` | File exists | PRESENT / MISSING |
| 3 | `hooks/session-start` | File exists and is executable | PRESENT / MISSING |
| 4 | `hooks/run-hook.cmd` | File exists and is executable | PRESENT / MISSING |
| 5 | `hooks/hooks.json` | Contains `SessionStart` entry with command containing `session-start` | PRESENT / MISSING |
| 6 | `hooks/hooks-cursor.json` | Contains `sessionStart` entry with command containing `session-start` | PRESENT / MISSING |
| 7 | `.opencode/plugins/{{name}}.js` | Contains `experimental.chat.messages.transform` | PRESENT / MISSING / NO_TRANSFORM |
| 8 | `GEMINI.md` | First `@./skills/` include is `using-{{name}}` | PRESENT / MISSING / NOT_FIRST |

---

## Verification Algorithm

```pseudocode
CHECK_INJECTION_COMPONENTS(computed):
  name = computed.metadata.name
  results = []

  # 1. using-skill SKILL.md
  results.append(check_file_exists("skills/using-" + name + "/SKILL.md"))

  # 2. using-skill gemini sidecar
  results.append(check_file_exists("skills/using-" + name + "/references/gemini-tools.md"))

  # 3. session-start script
  path = "hooks/session-start"
  IF file_exists(path) AND is_executable(path):
    results.append({ component: path, status: "PRESENT" })
  ELSE:
    results.append({ component: path, status: "MISSING" })

  # 4. run-hook.cmd
  path = "hooks/run-hook.cmd"
  IF file_exists(path) AND is_executable(path):
    results.append({ component: path, status: "PRESENT" })
  ELSE:
    results.append({ component: path, status: "MISSING" })

  # 5. hooks.json SessionStart entry
  IF file_exists("hooks/hooks.json"):
    content = Read("hooks/hooks.json")
    IF content contains "SessionStart" AND content contains "session-start":
      results.append({ component: "hooks/hooks.json (SessionStart)", status: "PRESENT" })
    ELSE:
      results.append({ component: "hooks/hooks.json (SessionStart)", status: "MISSING" })
  ELSE:
    results.append({ component: "hooks/hooks.json (SessionStart)", status: "MISSING" })

  # 6. hooks-cursor.json sessionStart entry
  IF file_exists("hooks/hooks-cursor.json"):
    content = Read("hooks/hooks-cursor.json")
    IF content contains "sessionStart" AND content contains "session-start":
      results.append({ component: "hooks/hooks-cursor.json (sessionStart)", status: "PRESENT" })
    ELSE:
      results.append({ component: "hooks/hooks-cursor.json (sessionStart)", status: "MISSING" })
  ELSE:
    results.append({ component: "hooks/hooks-cursor.json (sessionStart)", status: "MISSING" })

  # 7. OpenCode plugin with transform
  oc_path = ".opencode/plugins/" + name + ".js"
  IF file_exists(oc_path):
    content = Read(oc_path)
    IF "experimental" IN content AND "transform" IN content:
      results.append({ component: oc_path + " (transform)", status: "PRESENT" })
    ELSE:
      results.append({ component: oc_path + " (transform)", status: "NO_TRANSFORM" })
  ELSE:
    results.append({ component: oc_path + " (transform)", status: "MISSING" })

  # 8. GEMINI.md ordering
  IF file_exists("GEMINI.md"):
    content = Read("GEMINI.md")
    first_skill_include = first_line_matching(content, /^@\.\/skills\//)
    IF first_skill_include contains "using-" + name:
      results.append({ component: "GEMINI.md (using-" + name + " first)", status: "PRESENT" })
    ELSE:
      results.append({ component: "GEMINI.md (using-" + name + " first)", status: "NOT_FIRST" })
  ELSE:
    results.append({ component: "GEMINI.md (using-" + name + " first)", status: "MISSING" })

  RETURN results

COMPUTE_INJECTION_SUMMARY(results):
  present = count(r for r in results if r.status == "PRESENT")
  total = len(results)
  IF present == total:
    RETURN "COMPLETE"
  ELIF present == 0:
    RETURN "MISSING"
  ELSE:
    RETURN "PARTIAL (" + str(present) + " of " + str(total) + " components)"
```
```

- [ ] **Step 3: Commit**

```bash
git add skills/auditing-plugin-portability/patterns/
git commit -m "refactor: extract injection checks to patterns/injection-checks.md"
```

---

### Task 9: Rewrite auditing-plugin-portability/SKILL.md

**Files:**
- Rewrite: `skills/auditing-plugin-portability/SKILL.md`

- [ ] **Step 1: Write the new SKILL.md**

Replace the entire file with:

```markdown
---
name: auditing-plugin-portability
description: >
  Check a plugin for multi-platform portability gaps without making changes.
  Accepts any starting state. Reports PRESENT or MISSING for every platform
  artifact including session-start bootstrapping infrastructure.
allowed-tools: Read, Glob, Grep
inputs:
  - name: plugin_path
    type: string
    required: true
    description: Path to the plugin root directory
outputs:
  - name: audit
    type: object
    description: Complete portability audit with per-file status
---

# Auditing Plugin Portability

Inspect a plugin repo and report portability gaps across all platforms. Makes no changes.
No platform is assumed to already be present — Claude Code manifests are checked just like
Cursor or Gemini manifests.

> **Detection Algorithm:** `lib/patterns/detection-algorithm.md`
> **Injection Checks:** `patterns/injection-checks.md`

---

## Overview

| Phase | Description |
|-------|-------------|
| **Phase 1: Detect** | Run shared detection algorithm, infer metadata |
| **Phase 2: Audit** | Check manifests, sidecars, context files, hooks, injection |
| **Phase 3: Report** | Print full audit report |

**Minimum starting state:** At least one `skills/*/SKILL.md` with `name` + `description`
frontmatter, or any platform manifest file.

---

## Phase 1: Detect

### Step 1.1: Scan and Infer

```pseudocode
DETECT(plugin_path):
  # See lib/patterns/detection-algorithm.md
  computed.sources = scan_metadata_sources(plugin_path)

  IF len(computed.sources) == 0:
    DISPLAY "No recognisable plugin signals found in {plugin_path}."
    EXIT

  computed.canonical = elect_canonical(computed.sources)
  computed.metadata = build_metadata_model(computed.sources)
  computed.skills = Glob(plugin_path + "/skills/*/SKILL.md")
  print_inference_summary(computed.metadata, computed.canonical)
```

---

## Phase 2: Audit

### Step 2.1: Check Platform Manifests

```pseudocode
AUDIT_MANIFESTS(computed):
  checks = [
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    ".cursor-plugin/plugin.json",
    "gemini-extension.json",
    "GEMINI.md",
    "AGENTS.md",
    "CLAUDE.md",
    "package.json",
    ".opencode/plugins/" + computed.metadata.name + ".js",
    "hooks/hooks-cursor.json",
    "hooks/run-hook.cmd"
  ]

  computed.manifest_results = []
  FOR path IN checks:
    status = IF file_exists(path) THEN "PRESENT" ELSE "MISSING"
    computed.manifest_results.append({ path: path, status: status })
```

### Step 2.2: Check Per-Skill Sidecars

```pseudocode
AUDIT_SIDECARS(computed):
  platforms = ["copilot-tools.md", "codex-tools.md", "gemini-tools.md"]
  computed.sidecar_results = []
  FOR skill IN computed.skills:
    FOR platform IN platforms:
      target = "skills/" + skill.name + "/references/" + platform
      status = IF file_exists(target) THEN "PRESENT" ELSE "MISSING"
      computed.sidecar_results.append({ skill: skill.name, file: platform, status: status })
```

### Step 2.3: Check Context File Completeness

```pseudocode
AUDIT_CONTEXT_FILES(computed):
  computed.context_results = []

  IF file_exists("GEMINI.md"):
    content = Read("GEMINI.md")
    FOR skill IN computed.skills:
      IF "@./skills/" + skill.name + "/SKILL.md" NOT IN content:
        computed.context_results.append("GEMINI.md missing include for " + skill.name)
      IF "@./skills/" + skill.name + "/references/gemini-tools.md" NOT IN content:
        computed.context_results.append("GEMINI.md missing gemini-tools include for " + skill.name)
  ELSE:
    computed.context_results.append("GEMINI.md: MISSING — cannot check includes")

  IF file_exists("AGENTS.md"):
    content = Read("AGENTS.md")
    FOR skill IN computed.skills:
      IF "skills/" + skill.name + "/SKILL.md" NOT IN content:
        computed.context_results.append("AGENTS.md missing reference for " + skill.name)
  ELSE:
    computed.context_results.append("AGENTS.md: MISSING — cannot check skill references")
```

### Step 2.4: Check Frontmatter Compatibility

```pseudocode
AUDIT_FRONTMATTER(computed):
  computed.frontmatter_results = []
  FOR skill IN computed.skills:
    frontmatter = parse_yaml_frontmatter(skill.content)
    IF frontmatter.name AND frontmatter.description:
      status = "COMPATIBLE"
    ELSE:
      status = "MISSING FRONTMATTER"
    computed.frontmatter_results.append({ skill: skill.name, status: status })
```

### Step 2.5: Check Hooks

```pseudocode
AUDIT_HOOKS(computed):
  IF file_exists("hooks/hooks.json"):
    computed.hook_status = "PRESENT"
    IF NOT file_exists("hooks/hooks-cursor.json"):
      computed.hook_issues = ["hooks/hooks-cursor.json: MISSING"]
    IF NOT file_exists("hooks/run-hook.cmd"):
      computed.hook_issues = ["hooks/run-hook.cmd: MISSING"]
  ELSE:
    computed.hook_status = "MISSING — no hooks to port"
    computed.hook_issues = []
```

### Step 2.6: Check Session-Start Injection

See `patterns/injection-checks.md` for the 8-component verification.

```pseudocode
AUDIT_INJECTION(computed):
  using_path = "skills/using-" + computed.metadata.name + "/SKILL.md"
  IF NOT file_exists(using_path):
    computed.injection_status = "NOT CONFIGURED"
    RETURN

  computed.injection_results = check_injection_components(computed)
  computed.injection_summary = compute_injection_summary(computed.injection_results)
```

---

## Phase 3: Report

### Step 3.1: Print Report

```
# Portability Audit: {computed.metadata.name} v{computed.metadata.version}
Metadata inferred from: {computed.canonical.path}

## Platform manifests
{FOR r IN computed.manifest_results}
{r.status}  {r.path}
{/FOR}

## Skill sidecars
{FOR skill_group IN computed.sidecar_results grouped by skill}
skills/{skill_group.skill}/
  {FOR r IN skill_group.results}
  {r.status}  references/{r.file}
  {/FOR}
{/FOR}

## npx skills compatibility
{FOR r IN computed.frontmatter_results}
skills/{r.skill}/SKILL.md   {r.status}
{/FOR}

## Context file completeness
{FOR issue IN computed.context_results}
{issue}
{/FOR}

## Hooks
hooks/hooks.json: {computed.hook_status}
{FOR issue IN computed.hook_issues}
  {issue}
{/FOR}

## Session-start injection
{IF computed.injection_status == "NOT CONFIGURED"}
Not configured (no using-{name} skill found)
{ELSE}
{FOR r IN computed.injection_results}
{r.component}  {r.status}
{/FOR}
Session-start injection: {computed.injection_summary}
{/IF}

## Summary
{present} files present, {missing} missing.
{compatible} skills npx-compatible, {incompatible} missing frontmatter.
Session-start injection: {computed.injection_summary}
Run the uplifting-a-plugin skill to generate all missing files automatically.
```

---

## State Flow

```
Phase 1          Phase 2                      Phase 3
──────────────────────────────────────────────────────
computed         computed.manifest_results    Report
 .sources         .sidecar_results           (displayed)
 .canonical       .context_results
 .metadata        .frontmatter_results
 .skills          .hook_status
                  .injection_results
                  .injection_summary
```

---

## Reference Documentation

- **Detection Algorithm:** `lib/patterns/detection-algorithm.md` (shared)
- **Injection Checks:** `patterns/injection-checks.md` (local)

---

## Related Skills

- **Uplift plugin:** `skills/uplifting-a-plugin/SKILL.md`
```

- [ ] **Step 2: Verify line count**

```bash
wc -l skills/auditing-plugin-portability/SKILL.md
```

Expected: ~180-200 lines (roughly same as before but better structured).

- [ ] **Step 3: Commit**

```bash
git add skills/auditing-plugin-portability/SKILL.md
git commit -m "refactor: rewrite auditing skill with phase hierarchy and pseudocode"
```

---

### Task 10: Final verification and push

- [ ] **Step 1: Verify directory structure**

```bash
find lib/ skills/*/patterns/ -type f | sort
```

Expected output:
```
lib/patterns/detection-algorithm.md
lib/references/codex-tools.md
lib/references/copilot-tools.md
lib/references/gemini-tools.md
lib/templates/hooks/run-hook.cmd
lib/templates/hooks/session-start.sh
skills/auditing-plugin-portability/patterns/injection-checks.md
skills/uplifting-a-plugin/patterns/bootstrapping.md
skills/uplifting-a-plugin/patterns/hook-merging.md
skills/uplifting-a-plugin/patterns/manifest-generation.md
```

- [ ] **Step 2: Verify SKILL.md sizes**

```bash
wc -l skills/*/SKILL.md
```

Expected: uplifting ~300, auditing ~190.

- [ ] **Step 3: Verify no content was lost**

Key checks:
- `lib/references/copilot-tools.md` contains "Copilot CLI Tool Mapping"
- `lib/references/codex-tools.md` contains "Named agent dispatch"
- `lib/references/gemini-tools.md` contains "No subagent support"
- `lib/patterns/detection-algorithm.md` contains "SCAN_METADATA_SOURCES"
- `skills/uplifting-a-plugin/patterns/manifest-generation.md` contains "claude-marketplace"
- `skills/uplifting-a-plugin/patterns/bootstrapping.md` contains "opencode-bootstrap"
- `skills/auditing-plugin-portability/patterns/injection-checks.md` contains "NO_TRANSFORM"

```bash
grep -l "Copilot CLI Tool Mapping" lib/references/copilot-tools.md && \
grep -l "Named agent dispatch" lib/references/codex-tools.md && \
grep -l "No subagent support" lib/references/gemini-tools.md && \
grep -l "SCAN_METADATA_SOURCES" lib/patterns/detection-algorithm.md && \
grep -l "claude-marketplace" skills/uplifting-a-plugin/patterns/manifest-generation.md && \
grep -l "opencode-bootstrap" skills/uplifting-a-plugin/patterns/bootstrapping.md && \
grep -l "NO_TRANSFORM" skills/auditing-plugin-portability/patterns/injection-checks.md && \
echo "All content verified"
```

- [ ] **Step 4: Push**

```bash
git push
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Extract platform tool references | 3 files in lib/references/ |
| 2 | Extract detection algorithm | lib/patterns/detection-algorithm.md |
| 3 | Extract hook templates | 2 files in lib/templates/hooks/ |
| 4 | Create manifest-generation pattern | uplifting patterns/ |
| 5 | Create hook-merging pattern | uplifting patterns/ |
| 6 | Create bootstrapping pattern | uplifting patterns/ |
| 7 | Rewrite uplifting SKILL.md | Complete rewrite |
| 8 | Create injection-checks pattern | auditing patterns/ |
| 9 | Rewrite auditing SKILL.md | Complete rewrite |
| 10 | Verify and push | Final checks |
