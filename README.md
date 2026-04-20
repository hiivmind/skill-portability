# Portable Plugin Uplift

A Claude Code plugin that adds multi-platform portability to any Claude-only plugin.

## What it does

Takes a plugin that only has `.claude-plugin/` manifests (Claude Code only) and adds:

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

`portable-plugin-uplift` is structured using the exact pattern it produces. Check the root-level manifests as a reference.

## Usage

```
Use the uplifting-a-plugin skill on /path/to/your/plugin
```

Or audit first without changes:

```
Use the auditing-plugin-portability skill on /path/to/your/plugin
```
