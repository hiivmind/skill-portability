# Per-Platform Context Loading in Different Deployment Shapes

Research for GitHub issue #12. All findings sourced from `docs/platforms/*.md`.

## Key Finding

No platform has per-skill context isolation (except opt-in fork mode on
Claude Code and Cursor). In plugin mode, shared references are always
reachable via context files. In bare-skill mode, only the skill directory
and its siblings (scripts/, references/, assets/) are visible.

## Summary Table

| Platform | Context file | `@` includes? | Per-skill isolation? | Shared refs reachable (plugin)? | Shared refs reachable (bare-skill)? |
|----------|-------------|--------------|---------------------|-------------------------------|-------------------------------------|
| Claude Code | CLAUDE.md | Yes | No | Yes | No |
| Cursor | AGENTS.md | Yes | No (except fork) | Yes | No |
| Gemini CLI | GEMINI.md | Yes (`@` syntax) | No | Yes | No |
| Codex | AGENTS.md | No native `@` | No | Yes | No |
| Antigravity | AGENTS.md (highest priority) | Yes (`@` in rules) | No | Yes | No |
| OpenClaw | AGENTS.md | No native `@` | No | Yes | No |

## Per-Platform Findings

### Claude Code

**Q: CLAUDE.md always loaded — shared references reachable?**
Yes. CLAUDE.md is loaded by walking up the directory tree. All discovered files
are concatenated. Plugin skills share one context with no per-skill isolation.
(docs/platforms/claude-code.md lines 198-237)

**Q: Per-skill context isolation?**
No. All CLAUDE.md files, rules, and plugin content share one context. The only
isolation is `context: fork` on individual skills. (line 237)

### Cursor

**Q: Plugin install context loading?**
AGENTS.md is loaded if present. Plugin manifest components (skills, rules,
agents, commands) are loaded. Files referenced via `@` syntax are included.
(docs/platforms/cursor.md lines 266-308)

**Q: .cursor/rules/*.mdc as tool mapping channel?**
No. Rules provide AI guidance, not tool definitions. They are passive
guardrails. (line 287)

**Q: Per-skill isolation?**
No (except fork mode). All rules and skills load into the same context.
(lines 303-307)

### Gemini CLI

**Q: GEMINI.md loading — single blob or independent discovery?**
Single blob. GEMINI.md is loaded via `contextFileName` in the manifest. Per-skill
reference files are NOT discovered independently — they are reached only through
`@` include directives in GEMINI.md. (docs/platforms/gemini-cli.md lines 243-294)

**Q: Shared reference path — does `@./lib/references/` work?**
Yes. The `@` include syntax resolves relative paths from GEMINI.md's location.
`@./lib/references/gemini-tools.md` works identically to
`@./skills/{name}/references/gemini-tools.md`. (lines 243-260)

**Q: Per-skill isolation?**
No. All extension content loads into one shared context window. (lines 181-241)

### Codex

**Q: Skill-discovery mode — what files are visible?**
Only SKILL.md + siblings within the skill directory (scripts/, references/,
assets/). The entire repo is NOT visible. On startup, Codex reads only name,
description, and file path. (docs/platforms/codex.md lines 204-225)

**Q: AGENTS.md scoping in native-plugin mode?**
No per-skill scoping. AGENTS.md is loaded hierarchically from global to project
root to CWD. One concatenated result for all skills. (lines 284-296)

**Q: references/ at repo root discovered?**
No auto-discovery. Skills discover their own `references/` subdirectory.
Shared references at repo root need explicit inclusion from AGENTS.md or
SKILL.md body. (lines 201-210)

### Antigravity

**Q: Context file priority?**
AGENTS.md has highest priority (universal standard). GEMINI.md is
Antigravity-native, loaded if present but lower priority than AGENTS.md.
(docs/platforms/antigravity.md lines 144-150)

**Q: Skill-only distribution — what's visible?**
The skill directory structure including optional scripts/, examples/,
references/, assets/. These are loaded on demand. (lines 112-125)

**Q: .agent/rules/ content loading?**
Yes. Rules in `.agents/rules/` (plural, preferred) are loaded alongside skill
content. They support `@filename` references. (lines 156-167)

### OpenClaw

**Q: skills[] array affecting file visibility?**
The `agents.list[].skills` array restricts which skills are visible to each
agent. Non-empty list is the final set — no merging with defaults.
(docs/platforms/openclaw.md lines 106-127)

**Q: AGENTS.md scope?**
Plugin-wide. AGENTS.md is loaded once for all agents/skills at session start.
Sub-agents receive only AGENTS.md and TOOLS.md. (lines 210-235)

**Q: Tool mapping from manifest?**
No. configSchema and manifest fields don't provide tool mapping. Tools are
registered via the TypeScript Plugin SDK. (lines 69-72, 334-346)

## Implications for Shape-Aware Design

**Plugin shape (`full-portable-plugin`):**
- Context files always exist and are loaded
- Shared `lib/references/` or root `references/` is reachable via `@` includes
  (Gemini, Antigravity) or inline content (AGENTS.md for Codex/Cursor/OpenClaw,
  CLAUDE.md for Claude Code)
- Per-skill sidecars are redundant — shared references suffice

**Bare-skill shape (`bare-skill-repo`, `skill-first`):**
- No context files are installed alongside the skill
- Only the skill directory and its siblings are visible
- Per-skill sidecars in `references/` are the only way to provide tool mappings
- These must be full files, not pointer files (no `lib/` to point to)
