# Competitive Landscape: Cross-Platform Skill & Plugin Portability

**Date:** 2026-04-24
**Source:** Exa web search across GitHub repos, project sites, and blog posts

## Overview

A growing ecosystem of projects aims to solve cross-platform skill and plugin portability for AI coding agents. This document catalogues the known projects, their approaches, and where plugin-portability fits.

### The Two Audiences

Every portability project serves one or both of two distinct audiences:

| Audience | What they need | Example workflow |
|----------|---------------|------------------|
| **Consumer** | Install and use skills written by others across their preferred agents | "I found a great Claude Code skill — make it work in Cursor" |
| **Author** | Publish a skill/plugin they wrote for one platform to all other platforms | "I built a plugin for Claude Code — what do I need to add for Codex, Cursor, Gemini?" |

Most projects in this space target **consumers**. Very few help **authors** — and the ones that do are either one-directional (Claude-only input) or very early stage.

---

## Consumer-Focused Tools

These projects help users install, sync, and discover skills across platforms. They do not help authors analyse what their plugin is missing or emit platform-specific artifacts.

### 1. SkillKit

- **Repo:** [rohitg00/skillkit](https://github.com/rohitg00/skillkit)
- **Audience:** Consumer (primarily)
- **Tagline:** "Supercharge AI coding agents with portable skills"
- **Scope:** Package manager for AI agent skills. Claims 45 agent targets and 400K+ skills across registries.
- **Key features:**
  - `skillkit translate <skill> --to <agent>` — converts between formats (SKILL.md, .mdc, Markdown)
  - `skillkit sync` — deploys to agent-specific config directories
  - `skillkit recommend` — smart skill recommendations
  - `skillkit generate` — AI-powered skill generation wizard
  - `skillkit serve` — REST API server for skill access
  - AI-powered translation with trust scores across any LLM (Claude, GPT-4, Gemini, Ollama, OpenRouter)
- **Agents supported:** Claude Code, Cursor, Codex, Gemini CLI, OpenCode, Copilot, Windsurf, Devin, Aider, Sourcegraph Cody, Amazon Q, and 34 more
- **Differentiator:** Marketplace/registry approach with the largest claimed agent coverage. Positions as npm-for-skills.
- **Author relevance:** The `translate` command could serve authors, but it is positioned as a consumer convenience — no gap analysis, no assessment of what's missing, no publishing guidance.

### 2. Agentloom

- **Site:** [agentloom.sh](https://agentloom.sh/docs)
- **Audience:** Consumer
- **Tagline:** "One agent config. Every AI tool."
- **Scope:** Unified `.agents/` directory with `agentloom sync` to write native configs for all providers.
- **Key features:**
  - Single `.agents/` canonical directory for agents, commands, rules, skills, MCP
  - Import from GitHub repositories
  - Rule sync writes managed instruction blocks plus provider-native formats (e.g., Cursor rules as `.mdc`)
  - Global and project-local scope support
- **Agents supported:** Cursor, Claude, Copilot, Codex, OpenCode, Gemini, Pi (all with agents, commands, rules, skills, and MCP sync)
- **Differentiator:** Focuses on the full config surface (not just skills) — agents, commands, rules, skills, and MCP configs all synced from one source. Additive-only sync.

### 3. polyagent-skills

- **Repo:** [gyanranjan/polyagent-skills](https://github.com/gyanranjan/polyagent-skills)
- **Audience:** Consumer (with author-adjacent patterns)
- **Tagline:** "Write AI agent skills once, use everywhere"
- **Scope:** Spec-driven, agent-agnostic skill library with thin adapter files per agent.
- **Key features:**
  - Skills written once in portable Markdown under a shared directory
  - Thin adapter files per agent (e.g., `adapters/claude-code/`, `adapters/codex/`, `adapters/gemini/`)
  - Gemini CLI requires both system prompt and native skill registry population
  - Install script handles global setup
- **Agents supported:** Claude Code, Codex, Kiro, Gemini CLI, Gemini Code Assist, OpenClaw, Cursor, Windsurf (planned)
- **Differentiator:** Explicit adapter directory structure. Lighter-weight than SkillKit — no CLI tool, just a repo structure convention with adapters.
- **Author relevance:** The adapter pattern helps authors structure a multi-platform repo, but it is a convention to follow manually — no tooling to analyse what is missing.

### 4. AllAgents

- **Site:** [allagents.dev](https://allagents.dev/)
- **Audience:** Consumer
- **Tagline:** "All your AI assistants. One plugin system."
- **Scope:** Plugin registries with skills/, hooks/, agents/ that sync declaratively via YAML.
- **Key features:**
  - Full plugin structure: skills, hooks, agents, commands
  - Multi-repo workspace configuration
  - Community marketplace hosted on GitHub
  - Declarative YAML-based sync
- **Agents supported:** Claude Code, GitHub Copilot, Cursor, Codex, Gemini CLI, and others
- **Differentiator:** Marketplace/registry focus with multi-repo workspace support. Declarative YAML config rather than CLI commands.

### 5. @agents-dev/cli

- **Repo:** [amtiyo/agents](https://github.com/amtiyo/agents)
- **Audience:** Consumer
- **Tagline:** "One .agents source of truth"
- **Scope:** CLI that syncs MCP servers, skills, and instructions from `.agents/` to all targets.
- **Key features:**
  - 6-step pipeline: Load → Resolve → Route → Generate → Materialize → Bridge skills
  - Environment variable expansion (`${PROJECT_ROOT}`, `${ENV_VAR}`)
  - Secret management via `.agents/local.json`
  - Skill bridging via symlinks from tool directories to `.agents/skills/`
  - Atomic config writes
- **Agents supported:** Codex, Claude Code, Gemini CLI, Cursor, Copilot, Antigravity, Windsurf, OpenCode, Junie (9 total)
- **Differentiator:** Most sophisticated sync pipeline. Handles secrets, env vars, conditional enabling via `requiredEnv`, and per-target routing. Junie support is unique.

---

## Author-Focused Tools

These projects specifically help plugin and skill authors make their work available across platforms.

### 6. acplugin

- **Repo:** [TokenRollAI/acplugin](https://github.com/tokenRollAI/acplugin)
- **Audience:** Author (Claude Code only as input)
- **Scope:** Converts Claude Code plugins to Codex CLI, OpenCode, Cursor, and Google Antigravity formats.
- **Key features:**
  - Scans a Claude Code plugin (local or GitHub) and rewrites skills, instructions (CLAUDE.md to AGENTS.md/.cursor/rules), MCP configs, agents, commands, and hooks into each target platform's format
  - Handles model mapping (Claude models to GPT-5.4/Gemini 3 Pro)
  - Interactive TUI for selecting plugins and platforms
  - Supports marketplace repos
- **Maturity:** 19 stars, 1 contributor, TypeScript, created 2026-03-22. Very early stage.
- **Limitation:** One-directional — only converts FROM Claude Code. Cannot accept a Cursor, Codex, or Gemini plugin as input. No gap analysis or assessment step — converts everything blindly.

### 7. claude-to-codex

- **Repo:** [padmilkhandelwal/convert-claude-to-codex-skill](https://github.com/padmilkhandelwal/convert-claude-to-codex-skill)
- **Audience:** Author (Claude Code → Codex only)
- **Scope:** Single-direction converter that searches the Claude skill marketplace, fetches a skill, transforms tool references and frontmatter, generates `agents/openai.yaml`, validates output, and installs as a Codex skill.
- **Maturity:** 5 stars, 1 contributor, created 2026-03-20. Minimal.
- **Limitation:** One platform pair only (Claude → Codex). No other targets.

---

## Broader Frameworks

These projects include skill portability as part of a larger system. Portability is a secondary concern.

### 8. AI DevKit

- **Repo:** [codeaholicguy/ai-devkit](https://github.com/codeaholicguy/ai-devkit)
- **Site:** [ai-devkit.com](https://ai-devkit.com)
- **Audience:** Consumer (primarily)
- **Tagline:** "The toolkit for AI-assisted software development"
- **Scope:** Universal CLI toolkit providing structured workflows, persistent memory, and reusable skills.
- **Key features:**
  - Phase-based development workflow
  - Memory system
  - Skill management
  - Agent configuration
- **Agents supported:** Claude Code, Copilot, Gemini CLI, Cursor, OpenCode, Antigravity, Codex (supported); Windsurf, Kilo Code, Roo Code, Amp (testing)
- **Differentiator:** Broader than just portability — provides opinionated development workflows on top of portable skills.

### 9. Everything Claude Code (ECC)

- **Repo:** [grishanin/everything-claude-code](https://github.com/grishanin/everything-claude-code)
- **Audience:** Consumer (with author-adjacent patterns)
- **Tagline:** "The agent harness performance optimization system"
- **Scope:** Complete system: skills, instincts, memory optimization, continuous learning, security scanning, research-first development. Cross-platform is a secondary goal.
- **Key features:**
  - DRY adapter pattern — Cursor reuses Claude Code's hook scripts without duplication
  - AGENTS.md at root as universal cross-tool instruction file
  - SKILL.md with YAML frontmatter works across Claude Code, Codex, and OpenCode
  - Pre-translated Cursor configs in `.cursor/`
  - All hooks rewritten in Node.js for cross-OS compatibility (Windows, macOS, Linux)
  - Codex adapter drift guards and SessionStart fallback
- **Agents supported:** Claude Code (primary), Codex, Cursor, OpenCode, Gemini CLI, Antigravity
- **Differentiator:** Anthropic hackathon winner. Most battle-tested (10+ months daily use). Portability achieved through pragmatic adapter pattern rather than a universal abstraction.
- **Author relevance:** The adapter pattern is instructive for authors structuring their own repos, but ECC is a skill collection, not a tool for analysing or uplifting other plugins.

### 10. AgentSys

- **Repo:** [agent-sh/agentsys](https://github.com/agent-sh/agentsys)
- **Audience:** Consumer (with author infrastructure)
- **Tagline:** "Write tools once, run everywhere"
- **Scope:** Cross-platform library with unified utilities abstracting platform differences.
- **Key features:**
  - `lib/cross-platform/` utilities that detect platform and resolve state directories
  - CI-driven sync pipeline propagates `lib/` changes to all plugin repos
  - Slash commands as the primary interface (`/next-task`, `/ship`, `/deslop`, `/enhance`)
  - AI slop detection and cleanup
- **Agents supported:** Claude Code (primary), OpenCode, Codex CLI, Cursor, Kiro
- **Differentiator:** CI-driven lib sync across plugin repos. Focus on workflow commands rather than raw skill portability.
- **Author relevance:** The CI-driven sync is author infrastructure, but only for their own plugin ecosystem — not a general-purpose tool for other authors.

### 11. agent-plugins-skills

- **Repo:** [richfrem/agent-plugins-skills](https://github.com/richfrem/agent-plugins-skills)
- **Audience:** Consumer (with author-side quality tooling)
- **Tagline:** "Universal upstream source for reusable AI agent plugins and skills"
- **Scope:** Cross-platform skill library with an autonomous eval-gated evolution loop.
- **Key features:**
  - Single `.agents/` folder standard (no duplicate copies for `.github`, `.gemini`, `.agent`, etc.)
  - Dual-Flywheel architecture for autonomous skill evolution
  - Eval-gated improvement loop: Gemini CLI (L1) orchestrates, Copilot CLI/gpt-5-mini (L2) proposes mutations, `evaluate.py` gates (exit 0 = keep, exit 1 = discard + auto-revert)
  - 20-80 mutation proposals per run at near-zero cost using free Copilot quota
  - Skills must function in complete isolation — no sibling dependencies
- **Agents supported:** Claude Code, Copilot, Gemini CLI, Antigravity, Roo Code, Windsurf, Cursor
- **Differentiator:** Autonomous skill evolution loop is unique. Uses multi-agent layering (Claude → Gemini → Copilot) for cost-effective overnight skill improvement.
- **Author relevance:** The eval-gated loop is author-side tooling, but focuses on quality improvement of existing skills, not on adding platform coverage.

---

## Adjacent Projects

Different angle on the same problem space.

### 12. MCO (Multi-CLI Orchestrator)

- **Repo:** [mco-org/mco](https://github.com/mco-org/mco)
- **Audience:** Consumer
- **Scope:** Dispatches prompts to multiple agent CLIs in parallel, aggregates results. Not about skill portability but about agent interoperability.
- **Agents supported:** Claude Code, Codex CLI, Gemini CLI, OpenCode, Qwen Code
- **Relevance:** Complementary — if skills are portable, MCO can orchestrate execution across agents.

### 13. ZazenCodes Monorepo Approach

- **Source:** [Blog post](https://zazencodes.substack.com/p/cross-platform-agent-skills-guide) (April 2026)
- **Audience:** Author (manual guidance)
- **Scope:** Tutorial/guide on managing a central git repo of skills across agents. Not a tool — a pattern.
- **Relevance:** Documents the manual version of what automated tools try to solve. Good for understanding author pain points and workflows.

### 14. AgentBridge

- **Repo:** [catatafishen/agentbridge](https://github.com/catatafishen/agentbridge)
- **Audience:** Consumer
- **Scope:** JetBrains IDE plugin bridging 6 AI coding agents to 120+ IntelliJ platform APIs via MCP. Focused on IDE-side tooling rather than skill portability.
- **Agents supported:** Copilot, Claude Code, Codex, Kiro, Junie, OpenCode
- **Relevance:** Solves the "tool" side of portability (give agents access to IDE actions) rather than the "skill" side (portable instructions/workflows).

---

## Audience Summary

| # | Project | Audience | Accepts any input platform | Gap analysis | Emits missing artifacts | Publishing guidance |
|---|---------|----------|---------------------------|-------------|------------------------|-------------------|
| 1 | SkillKit | Consumer | Yes (translate) | No | Yes (translate) | No |
| 2 | Agentloom | Consumer | No (canonical .agents/) | No | Yes (sync) | No |
| 3 | polyagent-skills | Consumer | No (convention) | No | No (manual) | No |
| 4 | AllAgents | Consumer | No (registry) | No | Yes (sync) | No |
| 5 | @agents-dev/cli | Consumer | No (canonical .agents/) | No | Yes (sync) | No |
| 6 | acplugin | Author | Claude Code only | No | Yes (convert) | No |
| 7 | claude-to-codex | Author | Claude Code only | No | Yes (convert) | No |
| 8-11 | Frameworks | Consumer+ | Varies | No | Varies | No |
| — | **plugin-portability** | **Author** | **Yes (any platform)** | **Yes** | **Yes** | **Yes** |

---

## Emerging Patterns

Across all projects, several conventions are converging:

| Pattern | Adoption | Notes |
|---------|----------|-------|
| **SKILL.md with YAML frontmatter** | Wide | De facto portable skill format. Used by Claude Code, Codex, OpenCode natively. |
| **AGENTS.md at repo root** | Wide | Treated as universal cross-tool instruction file. Read by Claude Code, Codex, Copilot, Cursor. |
| **`.agents/` canonical directory** | Growing | Agentloom, @agents-dev/cli, agent-plugins-skills all converge on this. |
| **Thin adapter pattern** | Common | Small per-agent wrapper files that include/reference the canonical skill. |
| **Symlinks for bridging** | Common | Avoid duplication by symlinking from agent-specific dirs to canonical location. |
| **YAML/JSON declarative config** | Common | Define what goes where, let a sync tool write native formats. |
| **Eval-gated quality** | Emerging | agent-plugins-skills pioneered automated skill quality gates. |

## Format Landscape

Each agent expects skills in a specific location and format:

| Agent | Format | Directory |
|-------|--------|-----------|
| Claude Code | SKILL.md (YAML frontmatter) | `.claude/skills/` or plugin |
| Cursor | .mdc (MDC rules) | `.cursor/skills/` or `.cursor/rules/` |
| Codex | SKILL.md | `.codex/skills/` |
| Gemini CLI | SKILL.md + native registry | `.gemini/skills/` |
| GitHub Copilot | Markdown | `.github/skills/` |
| Windsurf | Markdown | `.windsurf/skills/` |
| OpenCode | SKILL.md | `.opencode/skills/` |
| Kiro | Markdown specs | `.kiro/specs/` |
| Devin | Markdown | `.devin/skills/` |
| Antigravity | Flattened rules in `.agent/` | `.agent/` |

## Where plugin-portability Sits

The landscape splits into three categories:

1. **Consumer sync tools** (SkillKit, Agentloom, polyagent-skills, AllAgents, @agents-dev/cli) — external CLIs that help users install and sync skills they found. Some bundle registries or marketplaces. The user is the person consuming skills, not the person who wrote them.

2. **One-directional author converters** (acplugin, claude-to-codex) — help authors convert FROM Claude Code to other platforms. Early stage (5-19 stars, single contributors). Cannot accept non-Claude input. No gap analysis — convert everything blindly without assessing what is actually missing.

3. **Broad frameworks** (ECC, AI DevKit, AgentSys, agent-plugins-skills) — skill portability is a secondary concern within a larger system. Portability comes along for the ride but is not the core value proposition.

**plugin-portability is the only project that:**

- **Targets authors specifically.** Every other tool either helps consumers sync/install, or converts blindly from one platform.
- **Accepts any platform as input.** Not locked to Claude Code as the starting point. A Cursor plugin, a Codex skill, a bare SKILL.md — all valid inputs.
- **Analyses before acting.** Assessment identifies what platform artifacts exist and what is missing, then reports findings before emitting anything.
- **Emits native artifacts per platform.** No intermediate canonical format, no `.agents/` directory to maintain, no registry.
- **Includes publishing guidance.** Generates PUBLISHING.md with per-platform publishing steps. No other project addresses the "how do I get this discovered and installed" question.
- **Runs as a skill, not a CLI.** No install step, no binary, no sync daemon. The agent itself is the portability engine.

### Failure modes plugin-portability avoids

| Failure mode | Examples | How plugin-portability avoids it |
|-------------|----------|-------------------------------|
| Scope creep into full dev workflow | AI DevKit, ECC, AgentSys | Stays focused on portability analysis + emission |
| CLI installation friction | SkillKit, Agentloom, @agents-dev/cli | Runs as a skill inside the agent — nothing to install |
| Registry/marketplace maintenance burden | SkillKit, AllAgents | No registry; operates on whatever project is in front of it |
| Canonical format lock-in | Agentloom (`.agents/`), polyagent-skills (adapters) | Emits native format per platform — no intermediate representation |
| Requires ongoing sync | Agentloom, @agents-dev/cli | One-shot assessment and emission; no daemon or cron job |
| One-directional input | acplugin, claude-to-codex | Accepts any platform as starting point |
| No gap analysis | acplugin, SkillKit translate | Assessment-first — identifies what is missing before emitting |
| No publishing guidance | All others | Generates PUBLISHING.md with per-platform publishing steps |
