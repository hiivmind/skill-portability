# Skill Portability

A plugin that makes any plugin fully portable across all agent platforms. Works from any starting state: Claude Code, Cursor, Gemini CLI, OpenCode, or a bare directory of SKILL.md files.

## What it does

Detects whatever platform manifests are already present, infers plugin metadata, then emits every missing artifact:

- **Claude Code** — `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `CLAUDE.md`
- **Cursor** — `.cursor-plugin/plugin.json`
- **Gemini CLI** — `gemini-extension.json` + `GEMINI.md`
- **OpenCode** — `package.json` + `.opencode/plugins/<name>.js`
- **Generic harnesses** (Codex, Copilot CLI) — `AGENTS.md`
- **Per-skill tool mapping** — `references/{copilot,codex,gemini}-tools.md` in each skill
- **Hook portability** — `hooks-cursor.json` derived from `hooks.json`

## Skills

- **`uplifting-a-plugin`** — Write all missing platform manifests for a target plugin
- **`assessing-plugin-portability`** — Report portability gaps without making changes

## Known ecosystem gaps

Cross-platform portability has real structural limits in today's agent platforms: `npx skills` installs individual skill directories rather than whole plugins (losing shared context files), each platform uses different manifest formats and context file names, tool names differ across platforms, and most platforms lack hook or subagent support. The `uplifting-a-plugin` skill generates everything that *can* be generated. For what cannot be fixed at the plugin layer, see [`docs/ecosystem-friction.md`](docs/ecosystem-friction.md).

## Pattern source

This plugin implements the [superpowers](https://github.com/obra/superpowers) portability pattern. Templates are seeded from superpowers v5.0.7 (see `lib/templates/UPSTREAM.md` for re-seeding instructions).

## This repo is itself an example

`skill-portability` is structured using the exact pattern it produces. Check the root-level manifests as a reference.

## Installation

See [INSTALL.md](INSTALL.md) for per-platform install instructions covering Claude Code, Cursor, Gemini CLI, OpenCode, Codex, and Copilot CLI.

**Quick start (Claude Code):**

```bash
claude plugin install skill-portability@skill-portability-dev
```

## Usage

```
Use the uplifting-a-plugin skill on /path/to/your/plugin
```

Or audit first without changes:

```
Use the assessing-plugin-portability skill on /path/to/your/plugin
```
