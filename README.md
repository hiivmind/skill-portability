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
- **`auditing-plugin-portability`** — Report portability gaps without making changes

## Pattern source

This plugin implements the [superpowers](https://github.com/obra/superpowers) portability pattern. Templates are seeded from superpowers v5.0.7 (see `assets/UPSTREAM.md` for re-seeding instructions).

## This repo is itself an example

`skill-portability` is structured using the exact pattern it produces. Check the root-level manifests as a reference.

## Usage

```
Use the uplifting-a-plugin skill on /path/to/your/plugin
```

Or audit first without changes:

```
Use the auditing-plugin-portability skill on /path/to/your/plugin
```
