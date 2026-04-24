# Skill Portability

An agent skill — not a CLI, not a framework — that makes any plugin fully portable across all agent platforms.

Point it at a plugin repo and it tells you what's missing. Say the word and it emits every missing artifact in place. No install step, no sync daemon, no registry. The agent itself is the portability engine.

## How it's different

The cross-platform skill portability space is full of [CLI tools and broad frameworks](docs/competitive-landscape.md). They require installation, maintain canonical directories or registries, and often absorb scope far beyond portability (workflows, memory systems, eval loops, marketplaces).

skill-portability takes a different approach:

- **It's a skill, not a CLI.** Runs inside the agent. Nothing to install beyond the plugin itself.
- **Analysis first.** Examines what platform artifacts exist and reports gaps before touching anything.
- **Optional uplift in place.** Emits missing artifacts directly into the project in each platform's native format. No intermediate representation, no `.agents/` directory to maintain.
- **Zero infrastructure.** No marketplace, no registry, no sync daemon. One job: assess and optionally fill portability gaps.

## What it emits

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

See [INSTALL.md](INSTALL.md) for per-platform install instructions covering Claude Code, Cursor, Gemini CLI, OpenCode, Codex, and Copilot CLI.

**Quick start (Claude Code):**

```bash
claude plugin install skill-portability@skill-portability-marketplace
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

See [INSTALL.md](INSTALL.md) for full install and usage details per platform.
