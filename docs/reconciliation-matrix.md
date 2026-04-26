# Reconciliation Matrix

Track every platform-specific claim in the plugin against researched facts in
`docs/platforms/*.md`. Goal: accuracy and consistency across all domains.

**Research sources:** `docs/platforms/` (sourced, cited) and
`docs/research_sources.md` (URL index).

**Status key:** Correct | Wrong | Missing | Needs review | Fixed

---

## 1. References (`lib/references/`)

### platform-mappings.md — Table 2: Tool Name Mapping

| Cell | Current value | Research says | Status |
|------|--------------|---------------|--------|
| Codex / Edit | `apply_patch` | `apply_patch` | Fixed |
| Codex / WebFetch | `(N/A — use MCP)` | No direct equivalent (use MCP) | Fixed |
| Codex / TodoWrite | `update_plan` | `update_plan` | Correct |
| Codex / Task | `spawn_agent` | `spawn_agent` | Correct |
| Codex / Skill | `(N/A)` | Native loading via `$skill-name` | Needs review |
| Gemini / Task | `@agent-name` | `dispatch_agent` or `@agent-name` | Needs review |
| Gemini / all others | Various | Verify against tool-names.ts source | Needs review |
| OpenClaw / all | Various | Verify against research | Needs review |
| Antigravity / all | Same as Claude | Verify against research | Needs review |

### platform-mappings.md — Table 3: Hook Event Mapping

| Cell | Current value | Research says | Status |
|------|--------------|---------------|--------|
| All Codex events | Mapped | Full hook system exists behind feature flag | Fixed |
| Codex / SessionStart | `SessionStart` | `SessionStart` (same name) | Fixed |
| Codex / PreToolUse | `PreToolUse` | `PreToolUse` (same name) | Fixed |
| Codex / PostToolUse | `PostToolUse` | `PostToolUse` (same name) | Fixed |
| Codex / UserPromptSubmit | `UserPromptSubmit` | `UserPromptSubmit` (same name) | Fixed |
| Codex / Stop | `Stop` | `Stop` (same name) | Fixed |
| Codex / PermissionRequest | Listed | New event, no Claude equivalent | Fixed |
| All Antigravity events | `N/A` | Confirmed no hooks | Correct |
| Gemini / mapped events | 7 mapped | 7 events exist (BeforeModel, AfterModel, BeforeToolSelection, BeforeTool, AfterTool, PreCompress, Notification) | Fixed |
| Gemini / SubagentStart | `(N/A)` | Verify | Needs review |
| Table 3 notes | Updated | Reflects Codex hooks behind feature flag | Fixed |

### platform-mappings.md — Table 7: Hook Format Rules

| Cell | Current value | Research says | Status |
|------|--------------|---------------|--------|
| Codex row | Added | Codex hooks use same JSON protocol as Claude Code | Fixed |
| Codex event case | PascalCase | PascalCase (same as Claude Code) | Fixed |
| Codex timeout unit | seconds | Seconds | Fixed |
| Codex async | no (strip) | Verified | Fixed |
| Codex structure | nested | Nested (same as Claude Code) | Fixed |
| Gemini hooks location | "settings.json or extension manifest" | Can also be in extension manifest and hooks.json | Fixed |

### platform-mappings.md — Table 8: Skill Output Directory

| Cell | Current value | Research says | Status |
|------|--------------|---------------|--------|
| Gemini / Agents Path | `agents/` | `agents/` (confirmed) | Correct |
| Codex / Skills Path | `.agents/skills/` | Verify against research | Needs review |
| All others | Various | Verify | Needs review |

### platform-mappings.md — Table 13: MCP Configuration

| Cell | Current value | Research says | Status |
|------|--------------|---------------|--------|
| Codex | `.mcp.json` or `config.toml [mcp]` | Supported via `config.toml` and `.mcp.json` | Fixed |
| Gemini | `gemini-extension.json` → `mcpServers` | Supported via extensions | Fixed |
| Antigravity | "MCP not supported via config file" | Verify | Needs review |

### gemini-tools.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Subagent support | Full subagent support documented | Full subagent support (generalist, cli_help, codebase_investigator + custom agents) | Fixed |
| Tool names | Listed mappings | Verify each against tool-names.ts | Needs review |
| Additional tools | 5 listed | Research may show more | Needs review |

### codex-tools.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Edit mapping | `apply_patch` | `apply_patch` | Fixed |
| WebSearch | `WebSearch` | Verify | Needs review |
| WebFetch | No direct equivalent | "Not directly equivalent — use MCP" | Fixed |
| spawn_agent details | Documented | Verify accuracy | Needs review |
| Hooks section | Added | Documents hook availability and feature flag | Fixed |

### cursor-tools.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| All tool names | Same as Claude Code | Confirmed same | Correct |
| Hook format | Documented | Verify against cursor.com/docs/hooks | Needs review |
| Subagent support | Not documented | Has full subagent support with model/readonly/background config | Missing |

### antigravity-tools.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| All tool names | Same as Claude Code | Verify against research | Needs review |
| No hooks | Documented | Confirmed no hooks | Correct |
| Frontmatter stripping | model, tools, disable-model-invocation, allowed-tools | Verify completeness | Needs review |

### openclaw-tools.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| No Task/Agent tool | Documented | Verify against research | Needs review |
| No TodoWrite | Documented | Verify | Needs review |
| Hook SDK details | Documented | Verify event names and API | Needs review |
| Bundle auto-detection | Documented | Confirmed: loads .claude-plugin/, .codex-plugin/, .cursor-plugin/ | Correct |

---

## 2. Rubrics (`lib/rubrics/`)

### codex.yaml

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| `hooks_path: hooks.json` | Hook system with feature flag | Codex has hooks (behind feature flag) | Fixed |
| Hook conditions | 4 conditions added | Should have hook portability conditions | Fixed |
| MCP conditions | Verify | Codex supports MCP | Needs review |

### gemini-cli.yaml

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| `hooks_path: null` | "settings.json, not file-based" | Hooks can be in extension manifest | Needs review |
| Subagent conditions | Verify | Gemini has full subagent support | Needs review |

### cursor.yaml

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Subagent conditions | Verify | Full subagent support with async, model, readonly | Needs review |

### antigravity.yaml

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| `hooks_path: null` | No hooks | Confirmed | Correct |
| Workflow conditions | Verify | Workflows in .agents/workflows/ | Needs review |

### openclaw.yaml

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| `hooks_path: null` | TypeScript SDK hooks | Confirmed SDK-based | Correct |
| Context file conditions | Verify | 7+ context files (AGENTS.md, SOUL.md, TOOLS.md, etc.) | Needs review |

### rubric-framework.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Category definitions | 7 categories | Verify completeness against research | Needs review |
| Scoring formula | Documented | No platform-specific claims | Correct |

---

## 3. Patterns (`lib/patterns/`)

### hook-merging.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Codex hooks | Generation section added | Should generate Codex hooks | Fixed |
| Gemini hooks | "settings.json or extension manifest" | Can also be in extension manifest | Fixed |
| Antigravity/OpenClaw | "no dedicated hooks file format" | Correct for Antigravity; OpenClaw uses SDK | Correct |
| Cursor hook generation | Documented | Verify format against research | Needs review |

### manifest-generation.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Gemini manifest fields | Optional fields documented | Verify against research (new fields: hooksDir, skillsDir, settings) | Fixed |
| Codex manifest fields | Documented | Verify against research | Needs review |
| All template references | Listed | Verify templates exist and match | Needs review |

### detection-algorithm.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Platform signal detection | Various file checks | Verify signals match actual platform artifacts | Needs review |

### bootstrapping.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Session-start per platform | Documented | Verify hook format per platform | Needs review |

### inventory.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Skill discovery paths | Per platform | Verify against research | Needs review |
| Hook discovery | Per platform | Codex hooks now exist | Fixed (hook-merging.md updated) |

---

## 4. Templates (`lib/templates/`)

### templates/manifests/

| Template | Current | Research says | Status |
|----------|---------|---------------|--------|
| `gemini-extension.json.tmpl` | Has fields | May need hooksDir, skillsDir, settings | Needs review |
| `codex-plugin/plugin.json.tmpl` | Has fields | Verify against research schema | Needs review |
| `openclaw/openclaw.plugin.json.tmpl` | Has fields | Verify against research schema | Needs review |
| `antigravity/package.json.tmpl` | Has fields | Verify against research schema | Needs review |
| `claude-plugin/plugin.json.tmpl` | Has fields | Verify against research schema | Needs review |
| `cursor-plugin/plugin.json.tmpl` | Has fields | Verify against research schema | Needs review |

### templates/hooks/

| Template | Current | Research says | Status |
|----------|---------|---------------|--------|
| `hooks.json.tmpl` | Claude Code format | Correct | Correct |
| `hooks-cursor.json.tmpl` | Cursor format | Verify camelCase, flat structure | Needs review |
| Codex hooks template | Not needed (same format as Claude Code) | Codex has hooks — shares hooks.json | Fixed |
| Gemini hooks template | Does not exist | May need extension-manifest hooks template | Needs review |

### templates/context-files/

| Template | Current | Research says | Status |
|----------|---------|---------------|--------|
| `CLAUDE.md.tmpl` | Exists | Correct | Correct |
| `GEMINI.md.tmpl` | Exists | Verify `@` include syntax | Needs review |
| `AGENTS.md.tmpl` | Exists | Verify universal fallback content | Needs review |
| OpenClaw context templates | None | OpenClaw has 7+ context files (SOUL.md, TOOLS.md, etc.) | Missing |

### templates/install-docs/

| Platform | Exists | Research says | Status |
|----------|--------|---------------|--------|
| claude-code.md | Yes | Verify commands | Needs review |
| cursor.md | Yes | Verify commands | Needs review |
| gemini-cli.md | Yes | Verify commands | Needs review |
| codex.md | Yes | Verify commands | Needs review |
| antigravity.md | Yes | Verify commands | Needs review |
| openclaw.md | Yes | Verify commands | Needs review |
| adding-platform/* | Yes (6) | Verify per-platform | Needs review |
| publishing/* | Yes (6) | Verify per-platform | Needs review |

---

## 5. Skill Logic (`skills/plugin-portability/SKILL.md`)

| Section | Claim | Research says | Status |
|---------|-------|---------------|--------|
| Phase 0a | Platform list (6) | Correct set | Correct |
| Phase 0b | Shape detection → uplift target | No platform-specific claims | Correct |
| Phase 3 | Loads rubric YAMLs per platform | Correct mechanism | Correct |
| Phase 5 | ALLOWED_CATEGORIES by shape | Verify category names match rubrics | Needs review |
| Phase 6 | Hook porting (skips if 4_hooks not allowed) | Codex now has hooks — hook-merging.md updated | Fixed |
| Phase 6 | References hook-merging.md | hook-merging.md now covers Codex | Fixed |

---

## 6. Per-Skill Sidecars (`skills/*/references/`)

| File | Current | Status |
|------|---------|--------|
| All 10 pointer files | One-liner redirects to lib/references/ | Theatre (issue #11) |

These are tracked under GitHub issues #11 and #12, not this matrix.

---

## Summary: Items Requiring Action

### Fixed (this batch)

1. ~~**Table 2**: Codex Edit → `apply_patch`~~ Fixed
2. ~~**Table 2**: Codex WebFetch → N/A~~ Fixed
3. ~~**Table 3**: All Codex events marked N/A~~ Fixed
4. ~~**Table 3 notes**: "Codex has no hook system"~~ Fixed
5. ~~**Table 7**: Codex omitted~~ Fixed
6. ~~**Table 13**: Codex MCP "not supported"~~ Fixed
7. ~~**gemini-tools.md**: "No subagent support"~~ Fixed
8. ~~**codex-tools.md**: Edit and WebFetch wrong~~ Fixed
9. ~~**codex.yaml**: `hooks_path: null`~~ Fixed
10. ~~**hook-merging.md**: No Codex hook generation~~ Fixed
11. ~~**hooks templates**: No Codex hook template~~ Fixed (not needed)
12. ~~**Table 3**: Gemini missing 4 hook events~~ Fixed
13. ~~**Table 7**: Gemini hooks location incomplete~~ Fixed
14. ~~**Table 13**: Gemini MCP claim~~ Fixed
15. ~~**manifest-generation.md**: Gemini manifest fields incomplete~~ Fixed

### Needs Systematic Verification

16. All remaining tool name mappings (Table 2) against source code refs
17. All manifest template schemas against researched schemas
18. All install doc commands against researched install methods
19. All rubric conditions against researched platform capabilities
20. All context file templates against researched context file formats
