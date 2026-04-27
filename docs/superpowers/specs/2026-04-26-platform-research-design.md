# Platform Research Rewrite — Design Spec

**Goal:** Replace all `docs/platforms/*.md` files with sourced, rubric-aligned
reference documents. Every factual claim must cite an official or community
source discovered via Exa. Remove dropped platforms (copilot-cli, opencode),
add missing platforms (antigravity, openclaw).

**Architecture:** One markdown file per platform in `docs/platforms/`. A shared
`docs/research_sources.md` collects every URL used across all platform docs,
organised by platform and source type. Each platform doc uses inline
`[source]` links for traceability.

**Platforms:** Claude Code, Cursor, Gemini CLI, Codex, Antigravity, OpenClaw.

---

## Document Structure

Every platform doc follows the same section order. Sections map to the 7 rubric
categories plus platform-specific features and source tracking.

### 1. Plugin Structure

Canonical directory layout, deployment shapes (standalone skill, full plugin,
marketplace/curated distribution). Which files are required vs optional.
Environment variables available to plugins/extensions.

### 2. Manifest

Schema for the primary manifest file. Required vs optional fields. Marketplace
manifest format if applicable. Variable substitution in manifest fields.

### 3. Skills

SKILL.md frontmatter fields (required, optional, platform-specific).
Skill discovery paths. Skill lifecycle (when loaded, compaction behaviour).
String substitutions available in skill content.

### 4. Context Files

Which context files the platform loads (CLAUDE.md, GEMINI.md, AGENTS.md, etc).
Load order and priority. `@` include resolution (Gemini). Context isolation —
whether all plugin content shares one context or skills are scoped. How tool
mapping content reaches the agent (shared vs per-skill).

### 5. Hooks

Event names and casing convention. Configuration format (JSON file, settings,
SDK). Matcher syntax. Output format. Timeout units. Async support.
Platform-specific events not available on other platforms.

### 6. Tool Mapping

Native tool names (the exact names the platform's agent uses). Which Claude
Code tools have direct equivalents, which are renamed, which are absent.
Subagent dispatch mechanism.

### 7. Install and Distribution

Install commands and scopes. Marketplace/registry submission process.
Local development workflow. Team/enterprise distribution.

### 8. Runtime Components

Agents (format, frontmatter, model field handling). Subagents (dispatch
mechanism, isolation). Rules/policies (format, location, frontmatter).
Commands (format, location). MCP server support. Any platform-unique
features (monitors, output styles, LSP, bin/, workflows, etc).

### 9. Sources

Inline in the document as `[source]` links. Also aggregated in
`docs/research_sources.md` under a heading per platform.

---

## Files Changed

| Action | Path | Description |
|--------|------|-------------|
| Rewrite | `docs/platforms/claude-code.md` | Full rewrite with sources |
| Rewrite | `docs/platforms/cursor.md` | Full rewrite with sources |
| Rewrite | `docs/platforms/gemini-cli.md` | Full rewrite with sources |
| Rewrite | `docs/platforms/codex.md` | Full rewrite with sources |
| Create | `docs/platforms/antigravity.md` | New platform doc |
| Create | `docs/platforms/openclaw.md` | New platform doc |
| Delete | `docs/platforms/copilot-cli.md` | Dropped platform |
| Delete | `docs/platforms/opencode.md` | Dropped platform |
| Rewrite | `docs/research_sources.md` | All sources, organised by platform |

---

## Research Method

For each platform:

1. Search Exa for official documentation (docs sites, GitHub repos, blog posts)
2. Search Exa for community sources (tutorials, real-world plugins, discussions)
3. Cross-reference findings against our existing rubric conditions and
   `lib/references/platform-mappings.md` to verify or correct current claims
4. Write the platform doc with inline citations
5. Append all URLs to `docs/research_sources.md`

Research is parallelisable — all 6 platforms are independent.

---

## Exclusions

- No changes to rubric YAML files (that's issue #11)
- No changes to `lib/references/platform-mappings.md` (corrections found during
  research should be noted in the platform doc and tracked as follow-ups)
- No changes to SKILL.md or templates
- The old prose "Assessment criteria" sections are dropped — rubric YAMLs own scoring

---

## Execution

Subagent-driven: one research agent per platform, running in parallel.
Each agent searches Exa, reads sources, writes the platform doc.
Main agent assembles `docs/research_sources.md` from all findings.
