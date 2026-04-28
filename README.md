![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Version](https://img.shields.io/badge/version-0.1.1-blue.svg)
![CI](https://github.com/hiivmind/plugin-portability/actions/workflows/ci.yml/badge.svg)

# Plugin Portability

A plugin for agent skill and plugin authors who have built for one platform — often Claude Code — and need to go cross-platform.

Point it at a plugin repo and it tells you what's missing. Say the word and it emits every missing artifact in place — platform manifests, context files, tool mappings, install docs, and publishing guidance. No CLI to install, no sync daemon, no registry. The agent itself is the portability engine.

## How it's different

The cross-platform plugin portability space is full of [CLI tools, sync daemons, and broad frameworks](docs/competitive-landscape.md).
They are separate programs you install and run alongside your plugin. Most target consumers (people installing others' skills), not authors.
The few that do target authors only convert from Claude Code, and do so blindly — no gap analysis, no publishing guidance, no choice of target platforms.

plugin-portability takes a different approach:

- **It works where authors already work.** It's a plugin you install into the same agent you're already using to build your skill. No context switch, no separate CLI — assessment and uplift happen inside the authoring workflow.
- **Analysis first.** Examines what platform artifacts exist and reports gaps before touching anything.
- **Any platform as input.** Not locked to Claude Code as the starting point. A Cursor plugin, a Codex skill, a bare SKILL.md — all valid inputs.
- **Optional uplift in place.** Emits missing artifacts directly into the project in each platform's native format. No intermediate representation, no `.agents/` directory to maintain.
- **Publishing guidance included.** Generates PUBLISHING.md with per-platform steps for getting discovered and installed — not just the artifacts, but how to ship them.

## What it does

Starting from whatever platform manifests already exist, it detects plugin metadata and generates everything missing:

| Platform | Artifacts |
| -------- | --------- |
| **Claude Code** | `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` |
| **Cursor** | `.cursor-plugin/plugin.json` |
| **Gemini CLI** | `gemini-extension.json`, `GEMINI.md` |
| **Codex** | `.codex-plugin/plugin.json` |
| **Antigravity** | `package.json`, `.agents/skills/` |
| **OpenClaw** | `openclaw.plugin.json` |

## Skills

- **`plugin-portability`** — Assess or uplift a plugin for multi-platform portability. Asks intent upfront (assess/uplift, platforms, uplift target), runs condition-driven scoring, and optionally generates missing artifacts.

## Ecosystem landscape

Cross-platform portability has real structural limits — but the ecosystem is maturing fast.
For consumers and single-skill authors, tools like `npx skills`, `gh skill`, and platform-native CLIs make distribution easy.
The friction appears when delivering cross-platform plugins with shared resources (hooks, manifests, context files).
The `plugin-portability` skill generates everything that *can* be generated.
For the full picture — what works, what doesn't, and what needs platform-level changes — see [`docs/ecosystem-landscape.md`](docs/ecosystem-landscape.md).

## Acknowledgements

This plugin owes a direct debt to [obra/superpowers](https://github.com/obra/superpowers) by Jesse Vincent.
Superpowers pioneered the multi-platform plugin pattern for Claude Code — the manifest structures, context file conventions,
tool-mapping references, and hook portability approach that plugin-portability now automates all originate there.
Templates in this repo are seeded from superpowers v5.0.7 (see [`lib/templates/UPSTREAM.md`](lib/templates/UPSTREAM.md) for re-seeding instructions).
Beyond patterns, superpowers was used directly to build this plugin — the skills that wrote plugin-portability were themselves superpowers skills.

## This repo is itself an example

`plugin-portability` is structured using the exact pattern it produces. Check the root-level manifests as a reference.

## Installation

Full details for all platforms in [INSTALL.md](INSTALL.md).

**Claude Code** — register the marketplace, then install:

```text
/plugin marketplace add hiivmind/plugin-portability
/plugin install plugin-portability@plugin-portability-marketplace
```

**Cursor** — in Agent chat:

```text
/add-plugin hiivmind/plugin-portability
```

**Gemini CLI:**

```bash
gemini extensions install https://github.com/hiivmind/plugin-portability
```

**Codex:**

```bash
codex marketplace add hiivmind/plugin-portability
```

Then open `/plugins` in Codex and install `plugin-portability`.

**Antigravity:**

```bash
antigravity --install-extension hiivmind/plugin-portability
```

**OpenClaw:**

```bash
openclaw plugins install plugin-portability
```

## Usage

| Platform | Invocation |
| -------- | ---------- |
| **Claude Code** | `Use the plugin-portability skill on /path/to/plugin` |
| **Cursor** | `Skill: plugin-portability` |
| **Gemini CLI** | `activate_skill: plugin-portability` |
| **Codex** | `$plugin-portability` |
| **Antigravity** | Auto-discovered |
| **OpenClaw** | Auto-discovered |
