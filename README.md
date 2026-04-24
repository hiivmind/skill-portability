# Skill Portability

A plugin for agent skill and plugin authors who have built for one platform — often Claude Code — and need to go cross-platform.

Point it at a plugin repo and it tells you what's missing. Say the word and it emits every missing artifact in place — platform manifests, context files, tool mappings, install docs, and publishing guidance. No CLI to install, no sync daemon, no registry. The agent itself is the portability engine.

## How it's different

The cross-platform skill portability space is full of [CLI tools, sync daemons, and broad frameworks](docs/competitive-landscape.md). They are separate programs you install and run alongside your agent. Most target consumers (people installing others' skills), not authors. The few that do target authors only convert from Claude Code, and do so blindly — no gap analysis, no publishing guidance.

skill-portability takes a different approach:

- **It works where authors already work.** It's a plugin you install into the same agent you're already using to build your skill. No context switch, no separate CLI — assessment and uplift happen inside the authoring workflow.
- **Analysis first.** Examines what platform artifacts exist and reports gaps before touching anything.
- **Any platform as input.** Not locked to Claude Code as the starting point. A Cursor plugin, a Codex skill, a bare SKILL.md — all valid inputs.
- **Optional uplift in place.** Emits missing artifacts directly into the project in each platform's native format. No intermediate representation, no `.agents/` directory to maintain.
- **Publishing guidance included.** Generates PUBLISHING.md with per-platform steps for getting discovered and installed — not just the artifacts, but how to ship them.

## What it does

Starting from whatever platform manifests already exist, it detects plugin metadata and generates everything missing:

| Platform | Artifacts |
|----------|-----------|
| **Claude Code** | `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `CLAUDE.md` |
| **Cursor** | `.cursor-plugin/plugin.json` |
| **Gemini CLI** | `gemini-extension.json`, `GEMINI.md` |
| **OpenCode** | `package.json`, `.opencode/plugins/<name>.js` |
| **Generic harnesses** (Codex, Copilot CLI) | `AGENTS.md` |
| **Per-skill tool mapping** | `references/{copilot,codex,gemini}-tools.md` |
| **Hook portability** | `hooks-cursor.json` derived from `hooks.json` |

## Skills

- **`assessing-plugin-portability`** — Report portability gaps without making changes
- **`uplifting-a-plugin`** — Write all missing platform manifests for a target plugin

## Known ecosystem gaps

Cross-platform portability has real structural limits in today's agent platforms: `npx skills` installs individual skill directories rather than whole plugins (losing shared context files), each platform uses different manifest formats and context file names, tool names differ across platforms, and most platforms lack hook or subagent support. The `uplifting-a-plugin` skill generates everything that *can* be generated. For what cannot be fixed at the plugin layer, see [`docs/ecosystem-friction.md`](docs/ecosystem-friction.md).

## Acknowledgements

This plugin owes a direct debt to [obra/superpowers](https://github.com/obra/superpowers) by Jesse Vincent. Superpowers pioneered the multi-platform plugin pattern for Claude Code — the manifest structures, context file conventions, tool-mapping references, and hook portability approach that skill-portability now automates all originate there. Templates in this repo are seeded from superpowers v5.0.7 (see [`lib/templates/UPSTREAM.md`](lib/templates/UPSTREAM.md) for re-seeding instructions). Beyond patterns, superpowers was used directly to build this plugin — the skills that wrote skill-portability were themselves superpowers skills.

## This repo is itself an example

`skill-portability` is structured using the exact pattern it produces. Check the root-level manifests as a reference.

## Installation

Full details for all platforms in [INSTALL.md](INSTALL.md).

**Claude Code** — register the marketplace, then install:

```
/plugin marketplace add hiivmind/skill-portability
/plugin install skill-portability@skill-portability-marketplace
```

**Cursor** — in Agent chat:

```
/add-plugin hiivmind/skill-portability
```

**Gemini CLI:**

```bash
gemini extensions install https://github.com/hiivmind/skill-portability
```

**Copilot CLI:**

```bash
gh skill install hiivmind/skill-portability
```

**Codex:**

```bash
git clone https://github.com/hiivmind/skill-portability
ln -s $(pwd)/skill-portability/skills ~/.agents/skills/skill-portability
```

**OpenCode** — clone and copy the plugin entrypoint:

```bash
git clone https://github.com/hiivmind/skill-portability
cp skill-portability/.opencode/plugins/skill-portability.js .opencode/plugins/
```

## Usage

| Platform | Assess portability | Uplift a plugin |
|----------|--------------------|-----------------|
| **Claude Code** | `Assess the portability of /path/to/plugin` | `Use the uplifting-a-plugin skill on /path/to/plugin` |
| **Cursor** | `/assessing-plugin-portability` | `/uplifting-a-plugin` |
| **Copilot CLI** | `/assessing-plugin-portability` | `/uplifting-a-plugin` |
| **Codex** | `$assessing-plugin-portability` | `$uplifting-a-plugin` |
| **Gemini CLI** | Mention skill by name — auto-activated | Same |
| **OpenCode** | Mention skill by name — auto-activated | Same |
