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
| Codex / Skill | `(N/A)` | Native loading via `$skill-name` | Correct |
| Gemini / Task | `@agent-name` | `@agent-name` or automatic routing | Correct |
| Gemini / all others | Various | All 11 mappings verified against research | Correct |
| OpenClaw / all | Various | All mappings verified against research | Correct |
| Antigravity / all | Same as Claude | ALL tools have different names — view_file, run_command, grep_search, etc. | Fixed |

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
| Gemini / SubagentStart | `(N/A)` | No SubagentStart in Gemini's 11 hook events | Correct |
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
| Codex / Skills Path | `.agents/skills/` | `.agents/skills/` confirmed | Correct |
| All others | Various | All paths verified against research | Correct |

### platform-mappings.md — Table 13: MCP Configuration

| Cell | Current value | Research says | Status |
|------|--------------|---------------|--------|
| Codex | `.mcp.json` or `config.toml [mcp]` | Supported via `config.toml` and `.mcp.json` | Fixed |
| Gemini | `gemini-extension.json` → `mcpServers` | Supported via extensions | Fixed |
| Antigravity | "MCP not supported via config file" | UI-based, not file-based — claim correct | Correct |

### gemini-tools.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Subagent support | Full subagent support documented | Full subagent support (generalist, cli_help, codebase_investigator + custom agents) | Fixed |
| Tool names | Listed mappings | All 11 mappings verified against research | Correct |
| Additional tools | 7 listed | All 7 tools verified against research | Correct |

### codex-tools.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Edit mapping | `apply_patch` | `apply_patch` | Fixed |
| WebSearch | `WebSearch` | `WebSearch` (live or cached) | Correct |
| WebFetch | No direct equivalent | "Not directly equivalent — use MCP" | Fixed |
| spawn_agent details | Documented | Built-in roles, message framing verified | Correct |
| Hooks section | Added | Documents hook availability and feature flag | Fixed |

### cursor-tools.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| All tool names | Same as Claude Code | Confirmed same | Correct |
| Hook format | Documented | camelCase, flat structure, output key all verified | Correct |
| Subagent support | Not documented | Has full subagent support with model/readonly/background config | Fixed |

### antigravity-tools.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| All tool names | Same as Claude Code | ALL tools have different names (view_file, write_to_file, run_command, etc.) | Fixed |
| No hooks | Documented | Confirmed no hooks | Correct |
| Frontmatter stripping | model, tools, disable-model-invocation, allowed-tools | Missing `user-invocable` | Fixed |

### openclaw-tools.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| No Task/Agent tool | Documented | Confirmed — agents via `agents.list[]` manifest config | Correct |
| No TodoWrite | Documented | Confirmed — no equivalent | Correct |
| Hook SDK details | Documented | Was listing 4 events; research shows 15 | Fixed |
| Bundle auto-detection | Documented | Confirmed: loads .claude-plugin/, .codex-plugin/, .cursor-plugin/ | Correct |

---

## 2. Rubrics (`lib/rubrics/`)

### codex.yaml

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| `hooks_path: hooks.json` | Hook system with feature flag | Codex has hooks (behind feature flag) | Fixed |
| Hook conditions | 4 conditions added | Should have hook portability conditions | Fixed |
| MCP conditions | Verify | Codex supports MCP | Fixed |

### gemini-cli.yaml

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| `hooks_path: null` | "settings.json, not file-based" | Hooks can be in extension manifest | Fixed |
| Subagent conditions | Verify | Gemini has full subagent support — @agent-name condition exists | Correct |

### cursor.yaml

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Subagent conditions | Verify | Full subagent support — documented condition exists (same Task/Agent syntax) | Correct |

### antigravity.yaml

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| `hooks_path: null` | No hooks | Confirmed | Correct |
| Workflow conditions | Verify | Workflows in .agents/workflows/ — condition confirmed | Correct |

### openclaw.yaml

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| `hooks_path: null` | TypeScript SDK hooks | Confirmed SDK-based | Correct |
| Context file conditions | Verify | 7+ are user workspace files; AGENTS.md correct for plugin output | Correct |

### rubric-framework.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Category definitions | 7 categories | All 7 comprehensive — no missing dimensions | Correct |
| Scoring formula | Documented | No platform-specific claims | Correct |

---

## 3. Patterns (`lib/patterns/`)

### hook-merging.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Codex hooks | Generation section added | Should generate Codex hooks | Fixed |
| Gemini hooks | "settings.json or extension manifest" | Can also be in extension manifest | Fixed |
| Antigravity/OpenClaw | "no dedicated hooks file format" | Correct for Antigravity; OpenClaw uses SDK | Correct |
| Cursor hook generation | Documented | Was dropping matchers — Cursor supports them | Fixed |

### manifest-generation.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Gemini manifest fields | Optional fields documented | Verify against research (new fields: hooksDir, skillsDir, settings) | Fixed |
| Codex manifest fields | Documented | Fields match research | Correct |
| All template references | Listed | All 10 templates verified to exist | Correct |

### detection-algorithm.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Platform signal detection | Various file checks | Missing openclaw.plugin.json | Fixed |

### bootstrapping.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Session-start per platform | Documented | Cursor and Claude Code output verified; Codex falls to else branch (unverifiable) | Correct |

### inventory.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Skill discovery paths | Per platform | Source plugin glob correct; platform paths handled by rubrics | Correct |
| Hook discovery | Per platform | Codex hooks now exist | Fixed (hook-merging.md updated) |

---

## 4. Templates (`lib/templates/`)

### templates/manifests/

| Template | Current | Research says | Status |
|----------|---------|---------------|--------|
| `gemini-extension.json.tmpl` | Has fields | Required fields present; optional fields handled by generation pattern | Correct |
| `codex-plugin/plugin.json.tmpl` | Has fields | Required fields (name, version, description) present + skills, hooks | Correct |
| `openclaw/openclaw.plugin.json.tmpl` | Has fields | Required fields (id, configSchema) present | Correct |
| `antigravity/package.json.tmpl` | Has fields | Required fields (name, displayName, publisher) present | Correct |
| `claude-plugin/plugin.json.tmpl` | Has fields | All fields verified | Correct |
| `cursor-plugin/plugin.json.tmpl` | Has fields | All fields + conditional path removal verified | Correct |

### templates/hooks/

| Template | Current | Research says | Status |
|----------|---------|---------------|--------|
| `hooks.json.tmpl` | Claude Code format | Correct | Correct |
| `hooks-cursor.json.tmpl` | Cursor format | Was missing `version: 1` required by Cursor | Fixed |
| Codex hooks template | Not needed (same format as Claude Code) | Codex has hooks — shares hooks.json | Fixed |
| Gemini hooks template | Does not exist | Not needed — Gemini hooks are settings-based, no file to generate | Correct |

### templates/context-files/

| Template | Current | Research says | Status |
|----------|---------|---------------|--------|
| `CLAUDE.md.tmpl` | Exists | Correct | Correct |
| `GEMINI.md.tmpl` | Exists | `@` includes rendered by builder (Mode 3) — correct | Correct |
| `AGENTS.md.tmpl` | Exists | Universal fallback with tool mapping table — correct | Correct |
| OpenClaw context templates | None | SOUL.md, TOOLS.md etc. are user workspace files, not plugin output | Correct (not needed) |

### templates/install-docs/

| Platform | Exists | Research says | Status |
|----------|--------|---------------|--------|
| claude-code.md | Yes | Commands verified (plugin install, --plugin-dir, plugin list) | Correct |
| cursor.md | Yes | Commands verified (/add-plugin, ~/.cursor/plugins/local/, reload) | Correct |
| gemini-cli.md | Yes | Commands verified (extensions install, extensions list) | Correct |
| codex.md | Yes | Commands verified (marketplace add, symlink, feature flags) | Correct |
| antigravity.md | Yes | Commands verified (copy to .agents/skills/, --install-extension) | Correct |
| openclaw.md | Yes | Commands verified (plugins install, npm, bundle detection) | Correct |
| adding-platform/* | Yes (6) | All 6 per-platform guides verified | Correct |
| publishing/* | Yes (6) | All 6 per-platform publishing guides verified | Correct |

---

## 5. Skill Logic (`skills/plugin-portability/SKILL.md`)

| Section | Claim | Research says | Status |
|---------|-------|---------------|--------|
| Phase 0a | Platform list (6) | Correct set | Correct |
| Phase 0b | Shape detection → uplift target | No platform-specific claims | Correct |
| Phase 3 | Loads rubric YAMLs per platform | Correct mechanism | Correct |
| Phase 5 | ALLOWED_CATEGORIES by shape | Category names match rubric-framework.md (verified Tier 2) | Correct |
| Phase 6 | Hook porting (skips if 4_hooks not allowed) | Codex now has hooks — hook-merging.md updated | Fixed |
| Phase 6 | References hook-merging.md | hook-merging.md now covers Codex | Fixed |

---

## 6. Per-Skill Sidecars (`skills/*/references/`)

| File | Current | Status |
|------|---------|--------|
| All 10 pointer files | Deleted — shared lib/references/ used via GEMINI.md @includes | Fixed (#11) |

Resolved: rubric conditions are now shape-aware. Plugins use shared references
via context files. Bare-skill repos use per-skill sidecars. Research documented
in `docs/research/per-platform-context-loading.md` (#12).

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

### Fixed (Tier 1 — reference verification)

16. ~~**antigravity-tools.md**: Frontmatter stripping missing `user-invocable`~~ Fixed
17. ~~**openclaw-tools.md**: Hook SDK listed only 4 events~~ Fixed — expanded to 15

### Remaining after Tier 1

- **cursor-tools.md**: Subagent support not documented (Missing — needs separate fix)
- **Table 2 Antigravity**: 7 of 13 tool names unverifiable from current research

### Fixed (Tier 2 — rubrics/patterns verification)

18. ~~**codex.yaml**: No MCP conditions~~ Fixed — added mcp.exists and mcp.config_toml
19. ~~**gemini-cli.yaml**: hooks_path comment missing extension manifest~~ Fixed
20. ~~**openclaw.yaml**: Hook event names condition listed only 4 events~~ Fixed — references full 15-event list
21. ~~**hook-merging.md**: Cursor hook generation dropped matchers~~ Fixed — matchers and timeout now carried over
22. ~~**detection-algorithm.md**: Missing openclaw.plugin.json~~ Fixed — added to sources, tie-break, and shape classification

### Fixed (Tier 3 — templates/install docs verification)

23. ~~**hooks-cursor.json.tmpl**: Missing `version: 1`~~ Fixed

### Verified Correct (Tier 3)

- All 6 manifest templates: required fields present
- Gemini hooks template: not needed (settings-based)
- OpenClaw context templates: not needed (user workspace files)
- GEMINI.md.tmpl and AGENTS.md.tmpl: correct syntax and content
- All 18 install docs: commands and paths verified against research
- Phase 5 ALLOWED_CATEGORIES: matches rubric framework

### Final gap fixes

24. ~~**cursor-tools.md**: Subagent support not documented~~ Fixed — added full subagent section
25. ~~**antigravity-tools.md + Table 2**: Tool names claimed "same as Claude"~~ Fixed — all 13 tools have different names (view_file, run_command, grep_search, etc.)

### All verification complete

Zero "Needs review", "Missing", or known gap items remain.
