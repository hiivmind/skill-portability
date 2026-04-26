# Reconciliation Matrix

Track every platform-specific claim in the plugin against researched facts in
`docs/platforms/*.md`. Goal: accuracy and consistency across all domains.

**Research sources:** `docs/platforms/` (sourced, cited) and
`docs/research_sources.md` (URL index).

**Status key:** Correct | Wrong | Missing | Needs review

---

## 1. References (`lib/references/`)

### platform-mappings.md — Table 2: Tool Name Mapping

| Cell | Current value | Research says | Status |
|------|--------------|---------------|--------|
| Codex / Edit | `Edit` | `apply_patch` | Wrong |
| Codex / WebFetch | `WebFetch` | No direct equivalent (use MCP) | Wrong |
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
| All Codex events | `N/A` | Full hook system exists behind feature flag | Wrong |
| Codex / SessionStart | `N/A` | `SessionStart` (same name) | Wrong |
| Codex / PreToolUse | `N/A` | `PreToolUse` (same name) | Wrong |
| Codex / PostToolUse | `N/A` | `PostToolUse` (same name) | Wrong |
| Codex / UserPromptSubmit | `N/A` | `UserPromptSubmit` (same name) | Wrong |
| Codex / Stop | `N/A` | `Stop` (same name) | Wrong |
| Codex / PermissionRequest | Not listed | New event, no Claude equivalent | Missing |
| All Antigravity events | `N/A` | Confirmed no hooks | Correct |
| Gemini / mapped events | 3 mapped | 7 events exist (BeforeModel, AfterModel, BeforeToolSelection, BeforeTool, AfterTool, PreCompress, Notification) | Missing |
| Gemini / SubagentStart | `(N/A)` | Verify | Needs review |
| Table 3 notes | "Codex has no hook system" | Wrong — has hooks behind feature flag | Wrong |

### platform-mappings.md — Table 7: Hook Format Rules

| Cell | Current value | Research says | Status |
|------|--------------|---------------|--------|
| Codex row | Omitted entirely | Codex hooks use same JSON protocol as Claude Code | Wrong |
| Codex event case | — | PascalCase (same as Claude Code) | Missing |
| Codex timeout unit | — | Seconds | Missing |
| Codex async | — | Needs verification | Missing |
| Codex structure | — | Nested (same as Claude Code) | Missing |
| Gemini hooks location | "settings.json (user-configured)" | Can also be in extension manifest and hooks.json | Wrong |

### platform-mappings.md — Table 8: Skill Output Directory

| Cell | Current value | Research says | Status |
|------|--------------|---------------|--------|
| Gemini / Agents Path | `agents/` | `agents/` (confirmed) | Correct |
| Codex / Skills Path | `.agents/skills/` | Verify against research | Needs review |
| All others | Various | Verify | Needs review |

### platform-mappings.md — Table 13: MCP Configuration

| Cell | Current value | Research says | Status |
|------|--------------|---------------|--------|
| Codex | "MCP not supported via config file" | Supported via `config.toml` and `.mcp.json` | Wrong |
| Gemini | "MCP not supported via config file" | Supported via extensions | Needs review |
| Antigravity | "MCP not supported via config file" | Verify | Needs review |

### gemini-tools.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Subagent support | "No equivalent — Gemini CLI does not support subagents" | Full subagent support (generalist, cli_help, codebase_investigator + custom agents) | Wrong |
| Tool names | Listed mappings | Verify each against tool-names.ts | Needs review |
| Additional tools | 5 listed | Research may show more | Needs review |

### codex-tools.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Edit mapping | `Edit` | `apply_patch` | Wrong |
| WebSearch | `WebSearch` | Verify | Needs review |
| WebFetch | `WebFetch` | "Not directly equivalent — use MCP" | Wrong |
| spawn_agent details | Documented | Verify accuracy | Needs review |
| Hooks section | Not present | Should document hook availability | Missing |

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
| `hooks_path: null` | No hook system | Codex has hooks (behind feature flag) | Wrong |
| Hook conditions | None | Should have hook portability conditions | Missing |
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
| Codex hooks | Not covered (skipped) | Should generate Codex hooks | Missing |
| Gemini hooks | "user settings.json only" | Can also be in extension manifest | Wrong |
| Antigravity/OpenClaw | "no dedicated hooks file format" | Correct for Antigravity; OpenClaw uses SDK | Correct |
| Cursor hook generation | Documented | Verify format against research | Needs review |

### manifest-generation.md

| Claim | Current | Research says | Status |
|-------|---------|---------------|--------|
| Gemini manifest fields | Documented | Verify against research (new fields: hooksDir, skillsDir, settings) | Needs review |
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
| Hook discovery | Per platform | Codex hooks now exist | Missing |

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
| Codex hooks template | Does not exist | Codex has hooks — needs template | Missing |
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
| Phase 6 | Hook porting (skips if 4_hooks not allowed) | Codex now has hooks — may need hook porting | Missing |
| Phase 6 | References hook-merging.md | hook-merging.md lacks Codex | Missing |

---

## 6. Per-Skill Sidecars (`skills/*/references/`)

| File | Current | Status |
|------|---------|--------|
| All 10 pointer files | One-liner redirects to lib/references/ | Theatre (issue #11) |

These are tracked under GitHub issues #11 and #12, not this matrix.

---

## Summary: Items Requiring Action

### Definitively Wrong (fix now)

1. **Table 2**: Codex Edit → `apply_patch` not `Edit`
2. **Table 2**: Codex WebFetch → no direct equivalent
3. **Table 3**: All Codex events marked N/A — Codex has full hooks
4. **Table 3 notes**: "Codex has no hook system" — wrong
5. **Table 7**: Codex omitted — needs row
6. **Table 13**: Codex MCP "not supported" — wrong
7. **gemini-tools.md**: "No subagent support" — wrong
8. **codex-tools.md**: Edit mapped wrong, WebFetch wrong
9. **codex.yaml**: `hooks_path: null` — wrong
10. **hook-merging.md**: No Codex hook generation — missing
11. **hooks templates**: No Codex hook template — missing

### Likely Wrong (verify then fix)

12. **Table 3**: Gemini missing 4 hook events
13. **Table 7**: Gemini hooks location incomplete
14. **Table 13**: Gemini MCP claim
15. **manifest-generation.md**: Gemini manifest fields incomplete

### Needs Systematic Verification

16. All remaining tool name mappings (Table 2) against source code refs
17. All manifest template schemas against researched schemas
18. All install doc commands against researched install methods
19. All rubric conditions against researched platform capabilities
20. All context file templates against researched context file formats
