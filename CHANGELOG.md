# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-04-26

### Changed

- **Merged skills:** `assessing-plugin-portability` and `uplifting-a-plugin` consolidated into single `plugin-portability` skill with Phase 0 intent detection via AskUserQuestion
- **Platform set:** Replaced OpenCode and Copilot CLI with Antigravity (Google) and OpenClaw
- **Rubric system:** Replaced prose-based scoring with structured YAML conditions — each condition has stable ID, type (checkable/judgement), critical flag, and pseudocode check
- **Scoring formula:** Hybrid AND/OR — critical flags gate score levels, optional flags earn within. Percentage-based bands with N/A handling
- **Condition-linked uplift:** Every generation action carries `# fixes:` annotation linking to rubric condition IDs. Template field in rubric conditions maps directly to artifacts
- **Two-layer uplift strategy:** Shape-based target (skill-first/full-portable/curated-note) confirmed by user, per-platform depth (incremental/full) auto-derived from scores

### Added

- `lib/references/platform-mappings.md` — 9 canonical lookup tables (model mapping, tool names, hook events, path variables, field stripping, manifest fields, hook format, skill dirs, agent formats)
- `lib/patterns/inventory.md` — consolidated inventory pattern merging assessment and uplift Phase 2
- 6 platform YAML rubrics with 160 total conditions across claude-code, cursor, gemini-cli, codex, antigravity, openclaw
- Antigravity platform support (Google VS Code fork, OpenVSX, `.agents/skills/`)
- OpenClaw platform support (TypeScript gateway, plugin SDK hooks, ClawHub)
- Template action types: create (new files) and merge (update existing via `?merge` suffix)
- `ALLOWED_CATEGORIES` table enforcing shape-based artifact scoping

### Removed

- `skills/assessing-plugin-portability/` — folded into `plugin-portability`
- `skills/uplifting-a-plugin/` — folded into `plugin-portability`
- OpenCode platform support
- Copilot CLI platform support
- Prose-based platform rubrics (`.md` replaced by `.yaml`)

## [0.1.0] - 2026-04-24

### Added

- Cross-platform plugin uplift skill — detects existing platform artifacts, infers canonical metadata, generates every missing manifest and context file
- Portability assessment skill — read-only gap analysis with 7-category rubric scoring per platform
- Session-start bootstrapping skill — platform-aware invocation help on first load
- 6-platform support: Claude Code, Cursor, Gemini CLI, OpenCode, Copilot CLI, Codex
- Per-skill tool mapping sidecars (`references/{copilot,codex,gemini}-tools.md`)
- Hook portability (`hooks.json` → `hooks-cursor.json` derivation)
- Template system for manifests, context files, install docs, and hooks
- Platform detection algorithm (environment variable and file-based)
- Ecosystem landscape documentation and competitive analysis
- Install documentation for all 6 platforms

[0.1.1]: https://github.com/hiivmind/plugin-portability/releases/tag/v0.1.1
[0.1.0]: https://github.com/hiivmind/plugin-portability/releases/tag/v0.1.0
