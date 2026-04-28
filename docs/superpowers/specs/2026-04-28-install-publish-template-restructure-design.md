# Install & Publish Template Restructure

**Date:** 2026-04-28
**Status:** Approved

## Problem

The install/publish template system has three overlapping layers:

| Layer | Path | Files |
|-------|------|-------|
| Install templates | `lib/templates/install-docs/*.md` | 6 per-platform |
| Adding-platform templates | `lib/templates/install-docs/adding-platform/*.md` | 6 per-platform |
| Publishing templates | `lib/templates/install-docs/publishing/*.md` | 6 per-platform + header |

These suffer from:

1. **Duplication between install and adding-platform.** The adding-platform templates are the same install commands with `/path/to/existing/` prefixed. "Adding another platform" is just "install from local clone."
2. **Publishing templates contain install commands.** Every publishing template has a "How users find and install" section that duplicates the install template. Publishing is author-facing; install commands are user-facing.
3. **No user-journey structure.** Install templates are random collections of commands (marketplace install, local dev, project install, verify) with no consistent ordering or framing. Users can't scan for the install path that matches their situation.
4. **Factual errors propagated through templates.** Antigravity templates described VS Code extension publishing via OpenVSX (irrelevant to skills). Codex templates included fabricated `$skill-installer install` subcommands. These were partially fixed in the pattern file but the templates and generated outputs still carried the bad data.

## Solution

Replace three template sets with two, structured around two audiences:

- **Plugin user** → `install/` templates → generates `INSTALL.md`
- **Plugin author** → `publish/` templates → generates `PUBLISHING.md`

## File Structure

### After

```
lib/templates/install-docs/
  install/
    claude-code.md
    cursor.md
    gemini-cli.md
    codex.md
    antigravity.md
    openclaw.md
  publish/
    claude-code.md
    cursor.md
    gemini-cli.md
    codex.md
    antigravity.md
    openclaw.md
  install-header.md
  publish-header.md
  whole-repo-note.md
```

### Deleted

- `lib/templates/install-docs/adding-platform/` (6 files) — absorbed into "Install from local clone"
- `lib/templates/install-docs/antigravity.md`, `claude-code.md`, `codex.md`, `cursor.md`, `gemini-cli.md`, `openclaw.md` (6 top-level files) — replaced by `install/` directory
- `lib/templates/install-docs/publishing.md` — replaced by `publish-header.md`

## Install Template Skeleton

Every install template follows the same journey order. Sections are conditional — omitted when they don't apply to the platform.

```
## {{platformDisplayName}}

### Install from registry
<!-- Present only if platform has a registry AND plugin is listed -->

### Install from GitHub
<!-- Always present — every platform supports repo URL install -->

### Install from local clone
<!-- Always present — replaces the adding-platform/ templates -->

### Verify
<!-- Always present — one command or check -->
```

### Ordering rationale

Registry first (easiest path), GitHub second (universal), local clone third (development use case). Verify last (confirms any of the above worked).

### Conditional registry section

| Platform | Registry | Section present? |
|----------|----------|-----------------|
| Claude Code | None (Git repos) | No |
| Cursor | cursor.com/marketplace | Yes |
| Gemini CLI | geminicli.com/extensions | Yes |
| Codex | /plugins browser | Yes |
| Antigravity | None | No |
| OpenClaw | ClawHub (clawhub.ai) | Yes |

### Dropped content

- **"Using the skills" sections** — runtime documentation, not install documentation. Belongs in README or skill descriptions.
- **"Adding Another Platform" framing** — the local clone section serves this case without a separate concept.

## Publish Template Skeleton

Every publish template is author-facing. No install commands.

```
## {{platformDisplayName}}

### Prerequisites
<!-- Always present — what manifests/metadata must exist -->

### Submit to registry
<!-- Present only if platform has a registry with a submission process -->

### Team / org distribution
<!-- Present only if platform has a mechanism beyond "share the URL" -->
```

### Conditional sections

| Platform | Prerequisites | Submit to registry | Team distribution |
|----------|--------------|-------------------|-------------------|
| Claude Code | `.claude-plugin/marketplace.json` | No (no registry) | Yes (`extraKnownMarketplaces`) |
| Cursor | `.cursor-plugin/plugin.json` | Yes (marketplace/publish) | Yes (team marketplaces) |
| Gemini CLI | `gemini-extension.json` | Yes (GitHub topic auto-index) | No |
| Codex | `.codex-plugin/plugin.json` + `marketplace.json` | No (self-serve coming soon) | No |
| Antigravity | `.agents/skills/*/SKILL.md` | No (no registry) | No |
| OpenClaw | `openclaw.plugin.json` | Yes (ClawHub + npm) | No |

Platforms with only a Prerequisites section (Antigravity) are correct — "publish" for Antigravity is "put files in the right places and share the repo."

## Generated Outputs

### INSTALL.md

Assembled from: `install-header.md` + (conditionally) `whole-repo-note.md` + one `install/*.md` per target platform.

No "Fresh Install" vs "Adding Another Platform" split. One section per platform with journey-ordered subsections.

### PUBLISHING.md

Assembled from: `publish-header.md` + one `publish/*.md` per target platform. Author-facing only.

## Skill Impact

Phase 7 (DOCUMENT) uses `GLOB_AND_VERIFY("lib/templates/install-docs/**/*.md", ...)`. The recursive glob matches the new `install/` and `publish/` subdirectories without changes. The Phase 7 pseudocode says "LOAD_AND_VERIFY install doc template for platform" — the templates are self-describing (each starts with the platform name as a heading), so the LLM will find the right template by matching platform name to file. No skill pseudocode changes required.

## Relationship to Pattern File

`lib/patterns/publishing-and-discoverability.md` remains as a background reference — the research-backed source of truth that templates are distilled from. It is not loaded by any skill at runtime and is not affected by this restructure. It was corrected earlier in this session (Gemini auto-discovery mechanism, Antigravity OpenVSX removal, Codex fabricated commands).

## Migration Checklist

1. Create `install/` directory with 6 journey-structured templates
2. Create `publish/` directory with 6 author-focused templates
3. Create `install-header.md` and `publish-header.md`
4. Delete `adding-platform/` directory (6 files)
5. Delete top-level per-platform files (6 files)
6. Delete `publishing.md` header
7. Regenerate `INSTALL.md` from new install templates
8. Regenerate `PUBLISHING.md` from new publish templates
9. Update `docs/reconciliation-matrix.md` to reflect new template paths
