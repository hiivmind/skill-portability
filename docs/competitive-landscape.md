# Competitive Landscape: Cross-Platform Skill & Plugin Portability

**Date:** 2026-04-24
**Source:** Exa web search across GitHub repos, project sites, and blog posts

## Overview

A growing ecosystem of projects aims to solve the same core problem as skill-portability: skills and plugins written for one AI coding agent (typically Claude Code) should work across all major agents without rewriting. This document catalogues the known projects, their approaches, and emerging patterns.

---

## Direct Competitors

These projects share the same primary goal: write skills once, deploy everywhere.

### 1. SkillKit

- **Repo:** [rohitg00/skillkit](https://github.com/rohitg00/skillkit)
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

### 2. Agentloom

- **Site:** [agentloom.sh](https://agentloom.sh/docs)
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
- **Tagline:** "Write AI agent skills once, use everywhere"
- **Scope:** Spec-driven, agent-agnostic skill library with thin adapter files per agent.
- **Key features:**
  - Skills written once in portable Markdown under a shared directory
  - Thin adapter files per agent (e.g., `adapters/claude-code/`, `adapters/codex/`, `adapters/gemini/`)
  - Gemini CLI requires both system prompt and native skill registry population
  - Install script handles global setup
- **Agents supported:** Claude Code, Codex, Kiro, Gemini CLI, Gemini Code Assist, OpenClaw, Cursor, Windsurf (planned)
- **Differentiator:** Explicit adapter directory structure. Lighter-weight than SkillKit — no CLI tool, just a repo structure convention with adapters.

### 4. AllAgents

- **Site:** [allagents.dev](https://allagents.dev/)
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

## Broader Frameworks

These projects include skill portability as part of a larger system.

### 6. AI DevKit

- **Repo:** [codeaholicguy/ai-devkit](https://github.com/codeaholicguy/ai-devkit)
- **Site:** [ai-devkit.com](https://ai-devkit.com)
- **Tagline:** "The toolkit for AI-assisted software development"
- **Scope:** Universal CLI toolkit providing structured workflows, persistent memory, and reusable skills.
- **Key features:**
  - Phase-based development workflow
  - Memory system
  - Skill management
  - Agent configuration
- **Agents supported:** Claude Code, Copilot, Gemini CLI, Cursor, OpenCode, Antigravity, Codex (supported); Windsurf, Kilo Code, Roo Code, Amp (testing)
- **Differentiator:** Broader than just portability — provides opinionated development workflows on top of portable skills.

### 7. Everything Claude Code (ECC)

- **Repo:** [grishanin/everything-claude-code](https://github.com/grishanin/everything-claude-code)
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
- **Differentiator:** Anthropic hackathon winner. Most battle-tested (10+ months daily use). Portability achieved through pragmatic adapter pattern rather than a universal abstraction. Claude Code is explicitly the primary target.

### 8. AgentSys

- **Repo:** [agent-sh/agentsys](https://github.com/agent-sh/agentsys)
- **Tagline:** "Write tools once, run everywhere"
- **Scope:** Cross-platform library with unified utilities abstracting platform differences.
- **Key features:**
  - `lib/cross-platform/` utilities that detect platform and resolve state directories
  - CI-driven sync pipeline propagates `lib/` changes to all plugin repos
  - Slash commands as the primary interface (`/next-task`, `/ship`, `/deslop`, `/enhance`)
  - AI slop detection and cleanup
- **Agents supported:** Claude Code (primary), OpenCode, Codex CLI, Cursor, Kiro
- **Differentiator:** CI-driven lib sync across plugin repos. Each plugin repo gets its own `lib/` copy because Claude Code plugins are installed separately. Focus on workflow commands rather than raw skill portability.

### 9. agent-plugins-skills

- **Repo:** [richfrem/agent-plugins-skills](https://github.com/richfrem/agent-plugins-skills)
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

---

## Adjacent Projects

Different angle on the same problem space.

### 10. MCO (Multi-CLI Orchestrator)

- **Repo:** [mco-org/mco](https://github.com/mco-org/mco)
- **Scope:** Dispatches prompts to multiple agent CLIs in parallel, aggregates results. Not about skill portability but about agent interoperability.
- **Agents supported:** Claude Code, Codex CLI, Gemini CLI, OpenCode, Qwen Code
- **Relevance:** Complementary — if skills are portable, MCO can orchestrate execution across agents.

### 11. ZazenCodes Monorepo Approach

- **Source:** [Blog post](https://zazencodes.substack.com/p/cross-platform-agent-skills-guide) (April 2026)
- **Scope:** Tutorial/guide on managing a central git repo of skills across agents. Not a tool — a pattern.
- **Relevance:** Documents the manual version of what automated tools try to solve. Good for understanding user pain points and workflows.

### 12. AgentBridge

- **Repo:** [catatafishen/agentbridge](https://github.com/catatafishen/agentbridge)
- **Scope:** JetBrains IDE plugin bridging 6 AI coding agents to 120+ IntelliJ platform APIs via MCP. Focused on IDE-side tooling rather than skill portability.
- **Agents supported:** Copilot, Claude Code, Codex, Kiro, Junie, OpenCode
- **Relevance:** Solves the "tool" side of portability (give agents access to IDE actions) rather than the "skill" side (portable instructions/workflows).

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

## Where skill-portability Sits

Every project above falls into one of two categories:

1. **Deterministic CLI tools** (SkillKit, Agentloom, polyagent-skills, AllAgents, @agents-dev/cli) — external programs the user installs and runs. Some bundle directory services or registries. Several show signs of scope creep (SkillKit claiming 45 agents and 400K skills; Agentloom absorbing agents, commands, rules, MCP configs alongside skills).

2. **Broad frameworks** (ECC, AI DevKit, AgentSys, agent-plugins-skills) — skill portability is a secondary concern within a larger system for workflows, memory, eval loops, or performance optimization. Portability comes along for the ride but isn't the core value proposition.

**skill-portability is neither.** It is:

- **A skill, not a CLI.** No install step, no binary, no sync daemon. The agent itself is the portability engine.
- **Analysis-first.** Examines the existing plugin/repo, identifies what platform artifacts are present and missing, and reports findings.
- **Optional uplift in-place.** If the user agrees, emits the missing artifacts directly into the project. No intermediate canonical format, no registry, no `.agents/` directory to maintain.
- **Zero infrastructure.** No marketplace, no registry, no community layer. Just a skill that does one job: assess and optionally fill gaps.

This means skill-portability avoids the failure modes visible in the landscape:

| Failure mode | Examples | How skill-portability avoids it |
|-------------|----------|-------------------------------|
| Scope creep into full dev workflow | AI DevKit, ECC, AgentSys | Stays focused on portability analysis + emission |
| CLI installation friction | SkillKit, Agentloom, @agents-dev/cli | Runs as a skill inside the agent — nothing to install |
| Registry/marketplace maintenance burden | SkillKit, AllAgents | No registry; operates on whatever project is in front of it |
| Canonical format lock-in | Agentloom (`.agents/`), polyagent-skills (adapters) | Emits native format per platform — no intermediate representation |
| Requires ongoing sync | Agentloom, @agents-dev/cli | One-shot assessment and emission; no daemon or cron job |

The closest analogue would be if someone took the "translate" function out of SkillKit, removed the CLI wrapper, and made it an agent skill that also does gap analysis. But no one has done that.
