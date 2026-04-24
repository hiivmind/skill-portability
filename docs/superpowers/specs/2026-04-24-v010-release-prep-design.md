# v0.1.0 Marketplace Release Prep — Design Spec

**Date:** 2026-04-24
**Goal:** Bring skill-portability from working plugin to marketplace-ready v0.1.0 release with all standard open-source artifacts, CI, and community files.

## Context

The plugin is functionally complete on `feature/portability-overhaul` (PR #4 targeting main). What's missing is release infrastructure: license, changelog, CI, community governance files, issue/PR templates, and README badges. All changes are additive new files — no modifications to existing plugin code.

## Approach

Single release branch (`release/v0.1.0`) off main (after PR #4 merges), containing all artifacts in one PR. Tag `v0.1.0` after merge.

## Artifacts

### 1. LICENSE

- MIT license at repo root
- Copyright: Nathaniel Ramm / Discrete Data Science
- Already declared as MIT in `plugin.json` and `package.json` — this adds the actual license text

### 2. CHANGELOG.md

- Keep-a-Changelog format (https://keepachangelog.com)
- Single `[0.1.0]` entry summarizing the initial release
- Categories: Added (all features are new)
- Key items: cross-platform uplift skill, 6-platform install docs, ecosystem landscape, template system, session-start bootstrapping

### 3. CONTRIBUTING.md

- Fork-and-PR workflow
- How to add a new platform: point to `docs/platforms/` and `lib/templates/`
- How to author skills: link to SKILL.md format and existing skills as examples
- Link to INSTALL.md for dev setup
- Link to CODE_OF_CONDUCT.md

### 4. CODE_OF_CONDUCT.md

- Contributor Covenant v2.1 (https://www.contributor-covenant.org/version/2/1/code_of_conduct/)
- Contact: nathaniel.ramm@discretedatascience.com

### 5. SECURITY.md

- Responsible disclosure policy
- Contact email for reporting: nathaniel.ramm@discretedatascience.com
- Scope: this plugin runs locally, no remote services, but skill content could be injected if a malicious source is used
- Response commitment: acknowledge within 7 days

### 6. Issue Templates

`.github/ISSUE_TEMPLATE/bug_report.md`:
- Fields: platform (Claude Code / Cursor / Gemini CLI / OpenCode / Copilot CLI / Codex), plugin version, description, steps to reproduce, expected vs actual behavior

`.github/ISSUE_TEMPLATE/feature_request.md`:
- Fields: description, use case, which platforms affected, alternatives considered

### 7. PR Template

`.github/PULL_REQUEST_TEMPLATE.md`:
- Sections: description, type of change (bugfix/feature/docs), platforms affected, testing done
- Checklist: SKILL.md updated if skill changed, INSTALL.md updated if install steps changed, CHANGELOG.md updated

### 8. CI Workflow

`.github/workflows/ci.yml` — triggers on push to `main` and all PRs.

**Job: shellcheck**
- Runs `shellcheck` on all `.sh` files
- Finds files via `find . -name '*.sh' -type f`
- Uses `koalaman/shellcheck-action` or installs via apt

**Job: validate-structure**
- Custom bash script checking all 6 platform artifacts:
  - **Claude Code:** `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` exist and are valid JSON
  - **Cursor:** `.cursor-plugin/plugin.json` exists and is valid JSON
  - **Gemini CLI:** `GEMINI.md` exists at repo root
  - **OpenCode:** `.opencode/plugins/skill-portability.js` exists
  - **Copilot CLI:** `.github/copilot-instructions.md` exists
  - **Codex:** `AGENTS.md` exists at repo root
  - **Skills:** every `skills/*/SKILL.md` has `name:` and `description:` in frontmatter
  - **Per-skill sidecars:** every `skills/*/references/` directory contains `codex-tools.md`, `copilot-tools.md`, and `gemini-tools.md`
  - **Version parity:** version field in `package.json`, `.claude-plugin/plugin.json`, and `.cursor-plugin/plugin.json` all match (extract with `jq -r .version`)
  - **Session-start hook:** `hooks/session-start` exists and is executable

**Job: lint-markdown**
- Uses `markdownlint-cli2`
- Config file `.markdownlint.yaml` at repo root with rules:
  - Allow YAML frontmatter in .md files (MD041 disabled — first line heading)
  - Allow long lines in tables (MD013 line-length relaxed or disabled)
  - Standard rules otherwise

**Runner:** `ubuntu-latest`. No secrets required.

### 9. README Badges

Add to top of README.md (before first heading):
- License badge: `![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)`
- Version badge: `![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)`
- CI badge: `![CI](https://github.com/hiivmind/skill-portability/actions/workflows/ci.yml/badge.svg)`

### 10. Git Tag & GitHub Release

- After the release PR merges to main: `git tag v0.1.0 && git push origin v0.1.0`
- Create a GitHub Release from the tag (`gh release create v0.1.0 --title "v0.1.0" --notes-file CHANGELOG.md`)
- This gives users an immutable install target — install docs and marketplace metadata should reference the tag, not bare `main`

### 11. Cleanup

- Delete obsolete `docs/superpowers/first_run.md`

## Out of Scope

- Version bump (staying at 0.1.0)
- npm publish or any package registry
- .github/FUNDING.yml (no sponsorship set up yet)
- Link checker in CI (not requested)
- Modifications to existing plugin code or skills (beyond deleting obsolete docs)

## Branch Strategy

1. Merge PR #4 (`feature/portability-overhaul`) to main
2. Create `release/v0.1.0` branch off main
3. Add all artifacts on that branch
4. PR `release/v0.1.0` → main
5. After merge, tag `v0.1.0`
