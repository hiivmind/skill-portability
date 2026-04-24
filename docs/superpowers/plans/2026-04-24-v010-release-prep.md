# v0.1.0 Release Prep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add all standard open-source release artifacts (license, changelog, CI, community files, templates) to prepare skill-portability for its v0.1.0 marketplace release.

**Architecture:** All changes are additive new files — no modifications to existing plugin code or skills. One release branch (`release/v0.1.0`) off main (after PR #4 merges), containing all artifacts in a single PR. Tag `v0.1.0` after merge.

**Tech Stack:** Markdown, YAML, GitHub Actions (shellcheck, markdownlint-cli2, custom bash validation), Git

**Prerequisites:** PR #4 (`feature/portability-overhaul`) must be merged to main before starting. The plan assumes you're working on a `release/v0.1.0` branch created off main post-merge.

---

### Task 1: LICENSE

**Files:**
- Create: `LICENSE`

- [ ] **Step 1: Create LICENSE file**

```
MIT License

Copyright (c) 2026 Nathaniel Ramm / Discrete Data Science

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Commit**

```bash
git add LICENSE
git commit -m "chore: add MIT license"
```

---

### Task 2: CHANGELOG.md

**Files:**
- Create: `CHANGELOG.md`

- [ ] **Step 1: Create CHANGELOG.md**

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-24

### Added

- Cross-platform plugin uplift skill — detects existing platform artifacts, infers canonical metadata, generates every missing manifest and context file
- Portability assessment skill — read-only gap analysis with 7-category rubric scoring per platform
- Session-start bootstrapping skill — platform-aware invocation help on first load
- 6-platform support: Claude Code, Cursor, Gemini CLI, OpenCode, Copilot CLI, Codex
- Per-skill tool mapping sidecars (`references/{copilot,codex,gemini}-tools.md`)
- Hook portability (`hooks.json` → `hooks-cursor.json` derivation)
- Template system for manifests, context files, install docs, and hooks
- Platform detection algorithm (environment variable and file-based)
- Ecosystem landscape documentation and competitive analysis
- Install documentation for all 6 platforms

[0.1.0]: https://github.com/hiivmind/skill-portability/releases/tag/v0.1.0
```

- [ ] **Step 2: Commit**

```bash
git add CHANGELOG.md
git commit -m "chore: add changelog for v0.1.0"
```

---

### Task 3: CODE_OF_CONDUCT.md

**Files:**
- Create: `CODE_OF_CONDUCT.md`

- [ ] **Step 1: Create CODE_OF_CONDUCT.md**

Use the Contributor Covenant v2.1 text. The full text is at https://www.contributor-covenant.org/version/2/1/code_of_conduct/. Fetch it and save as `CODE_OF_CONDUCT.md`.

Set the contact method to: `nathaniel.ramm@discretedatascience.com`

The enforcement section should reference the email above as the contact for reporting.

- [ ] **Step 2: Verify the file starts with a heading and contains the contact email**

```bash
head -5 CODE_OF_CONDUCT.md
grep -c "nathaniel.ramm@discretedatascience.com" CODE_OF_CONDUCT.md
```

Expected: heading line present, grep returns `1` or more.

- [ ] **Step 3: Commit**

```bash
git add CODE_OF_CONDUCT.md
git commit -m "chore: add Contributor Covenant v2.1 code of conduct"
```

---

### Task 4: CONTRIBUTING.md

**Files:**
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Create CONTRIBUTING.md**

```markdown
# Contributing to Skill Portability

Thank you for your interest in contributing! This guide covers the basics.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Please read it before participating.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Follow [INSTALL.md](INSTALL.md) for development setup
4. Create a feature branch (`git checkout -b feature/your-feature`)
5. Make your changes
6. Open a pull request targeting `main`

## Adding a New Platform

1. Create a platform documentation file in `docs/platforms/`
2. Add a manifest template in `lib/templates/manifests/`
3. Add install doc templates in `lib/templates/install-docs/`
4. Add a platform detection pattern in `lib/patterns/platforms/`
5. Update the uplift skill (`skills/uplifting-a-plugin/SKILL.md`) to handle the new platform
6. Update the assessment rubric (`docs/assessment-rubric.md`) with scoring criteria

## Authoring Skills

Skills live in `skills/<skill-name>/SKILL.md` using YAML frontmatter:

```yaml
---
name: my-skill
description: >
  Trigger description for when this skill should be invoked.
allowed-tools: Read, Write, Edit
---
```

See existing skills in `skills/` for examples. Each skill should also have a `references/` subdirectory containing platform-specific tool mappings (`codex-tools.md`, `copilot-tools.md`, `gemini-tools.md`).

## Pull Request Process

1. Update `CHANGELOG.md` if your change is user-facing
2. Update `SKILL.md` frontmatter if you changed a skill's behavior or triggers
3. Update `INSTALL.md` if install steps changed
4. Ensure shellcheck passes on any shell scripts
5. Ensure markdown linting passes
```

- [ ] **Step 2: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "chore: add contributing guide"
```

---

### Task 5: SECURITY.md

**Files:**
- Create: `SECURITY.md`

- [ ] **Step 1: Create SECURITY.md**

```markdown
# Security Policy

## Scope

Skill Portability runs locally as a plugin within your AI coding assistant. It does not operate remote services or store data externally.

However, skill content could be injected if a malicious source repository is used as input. The uplift and assessment skills read arbitrary plugin repositories — a crafted repository could contain skill files with prompt injection attempts.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

**Email:** nathaniel.ramm@discretedatascience.com

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact

**Response commitment:** We will acknowledge your report within 7 days and work with you to understand and address the issue.

## Preferred Languages

We accept vulnerability reports in English.
```

- [ ] **Step 2: Commit**

```bash
git add SECURITY.md
git commit -m "chore: add security policy"
```

---

### Task 6: Issue Templates

**Files:**
- Create: `.github/ISSUE_TEMPLATE/bug_report.md`
- Create: `.github/ISSUE_TEMPLATE/feature_request.md`

- [ ] **Step 1: Create bug report template**

```markdown
---
name: Bug Report
about: Report a bug in skill-portability
title: ''
labels: bug
assignees: ''
---

## Platform

- [ ] Claude Code
- [ ] Cursor
- [ ] Gemini CLI
- [ ] OpenCode
- [ ] Copilot CLI
- [ ] Codex

## Plugin Version

<!-- e.g. 0.1.0 -->

## Description

<!-- What happened? -->

## Steps to Reproduce

1.
2.
3.

## Expected Behavior

<!-- What should have happened? -->

## Actual Behavior

<!-- What happened instead? -->

## Additional Context

<!-- Logs, screenshots, or other relevant information -->
```

- [ ] **Step 2: Create feature request template**

```markdown
---
name: Feature Request
about: Suggest a new feature or improvement
title: ''
labels: enhancement
assignees: ''
---

## Description

<!-- What would you like to see? -->

## Use Case

<!-- Why do you need this? What problem does it solve? -->

## Platforms Affected

- [ ] Claude Code
- [ ] Cursor
- [ ] Gemini CLI
- [ ] OpenCode
- [ ] Copilot CLI
- [ ] Codex
- [ ] All platforms

## Alternatives Considered

<!-- Have you considered any workarounds or alternative approaches? -->
```

- [ ] **Step 3: Commit**

```bash
git add .github/ISSUE_TEMPLATE/
git commit -m "chore: add issue templates for bugs and feature requests"
```

---

### Task 7: PR Template

**Files:**
- Create: `.github/PULL_REQUEST_TEMPLATE.md`

- [ ] **Step 1: Create PR template**

```markdown
## Description

<!-- What does this PR do? -->

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] CI/infrastructure
- [ ] Refactoring

## Platforms Affected

- [ ] Claude Code
- [ ] Cursor
- [ ] Gemini CLI
- [ ] OpenCode
- [ ] Copilot CLI
- [ ] Codex
- [ ] None (docs/CI only)

## Testing Done

<!-- How did you verify this works? -->

## Checklist

- [ ] `SKILL.md` updated (if skill behavior changed)
- [ ] `INSTALL.md` updated (if install steps changed)
- [ ] `CHANGELOG.md` updated (if user-facing change)
```

- [ ] **Step 2: Commit**

```bash
git add .github/PULL_REQUEST_TEMPLATE.md
git commit -m "chore: add pull request template"
```

---

### Task 8: Markdownlint Configuration

**Files:**
- Create: `.markdownlint.yaml`

This must exist before the CI workflow (Task 9) so the lint job has its config.

- [ ] **Step 1: Create .markdownlint.yaml**

```yaml
default: true

MD013:
  line_length: 300
  tables: false

MD041: false
```

`MD013` is relaxed to 300 chars and tables are excluded (platform comparison tables are wide). `MD041` is disabled because SKILL.md files start with YAML frontmatter, not a heading.

- [ ] **Step 2: Commit**

```bash
git add .markdownlint.yaml
git commit -m "chore: add markdownlint config"
```

---

### Task 9: CI Workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create CI workflow**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  shellcheck:
    name: ShellCheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install shellcheck
        run: sudo apt-get install -y shellcheck
      - name: Run shellcheck
        run: |
          files=$(find . -name '*.sh' -type f)
          if [ -n "$files" ]; then
            echo "$files" | xargs shellcheck
          else
            echo "No .sh files found"
          fi

  validate-structure:
    name: Validate Plugin Structure
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install jq
        run: sudo apt-get install -y jq
      - name: Validate platform artifacts
        run: |
          errors=0

          check_file() {
            if [ ! -f "$1" ]; then
              echo "FAIL: $1 does not exist"
              errors=$((errors + 1))
            else
              echo "OK: $1"
            fi
          }

          check_json() {
            if [ ! -f "$1" ]; then
              echo "FAIL: $1 does not exist"
              errors=$((errors + 1))
            elif ! jq empty "$1" 2>/dev/null; then
              echo "FAIL: $1 is not valid JSON"
              errors=$((errors + 1))
            else
              echo "OK: $1 (valid JSON)"
            fi
          }

          echo "=== Platform Artifacts ==="
          check_json .claude-plugin/plugin.json
          check_json .claude-plugin/marketplace.json
          check_json .cursor-plugin/plugin.json
          check_file GEMINI.md
          check_file .opencode/plugins/skill-portability.js
          check_file .github/copilot-instructions.md
          check_file AGENTS.md

          echo ""
          echo "=== Skill Frontmatter ==="
          for skill_dir in skills/*/; do
            skill_file="${skill_dir}SKILL.md"
            if [ ! -f "$skill_file" ]; then
              echo "FAIL: $skill_file does not exist"
              errors=$((errors + 1))
              continue
            fi
            if ! grep -q '^name:' "$skill_file"; then
              echo "FAIL: $skill_file missing name: in frontmatter"
              errors=$((errors + 1))
            fi
            if ! grep -q '^description:' "$skill_file"; then
              echo "FAIL: $skill_file missing description: in frontmatter"
              errors=$((errors + 1))
            fi
            echo "OK: $skill_file (frontmatter valid)"
          done

          echo ""
          echo "=== Per-Skill Sidecars ==="
          for skill_dir in skills/*/; do
            for sidecar in codex-tools.md copilot-tools.md gemini-tools.md; do
              check_file "${skill_dir}references/${sidecar}"
            done
          done

          echo ""
          echo "=== Version Parity ==="
          v_pkg=$(jq -r .version package.json)
          v_claude=$(jq -r .version .claude-plugin/plugin.json)
          v_cursor=$(jq -r .version .cursor-plugin/plugin.json)
          echo "package.json: $v_pkg"
          echo "plugin.json (claude): $v_claude"
          echo "plugin.json (cursor): $v_cursor"
          if [ "$v_pkg" != "$v_claude" ] || [ "$v_pkg" != "$v_cursor" ]; then
            echo "FAIL: version mismatch"
            errors=$((errors + 1))
          else
            echo "OK: all versions match ($v_pkg)"
          fi

          echo ""
          echo "=== Session-Start Hook ==="
          if [ ! -x hooks/session-start ]; then
            echo "FAIL: hooks/session-start does not exist or is not executable"
            errors=$((errors + 1))
          else
            echo "OK: hooks/session-start (executable)"
          fi

          echo ""
          if [ "$errors" -gt 0 ]; then
            echo "FAILED: $errors error(s) found"
            exit 1
          else
            echo "All checks passed"
          fi

  lint-markdown:
    name: Lint Markdown
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install markdownlint-cli2
        run: npm install -g markdownlint-cli2
      - name: Run markdownlint
        run: markdownlint-cli2 "**/*.md"
```

- [ ] **Step 2: Verify YAML is valid**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "Valid YAML"
```

Expected: `Valid YAML`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add shellcheck, structure validation, and markdown lint"
```

---

### Task 10: README Badges

**Files:**
- Modify: `README.md:1` (add badges before the first heading)

- [ ] **Step 1: Add badges to top of README.md**

Insert these three lines at the very top of `README.md`, before `# Skill Portability`:

```markdown
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![CI](https://github.com/hiivmind/skill-portability/actions/workflows/ci.yml/badge.svg)

```

The file should now start with:

```markdown
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![CI](https://github.com/hiivmind/skill-portability/actions/workflows/ci.yml/badge.svg)

# Skill Portability
```

- [ ] **Step 2: Verify badges are present**

```bash
head -5 README.md
```

Expected: Three badge lines followed by a blank line and the heading.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add license, version, and CI badges to README"
```

---

### Task 11: Delete Obsolete File

**Files:**
- Delete: `docs/superpowers/first_run.md` (if it exists)

- [ ] **Step 1: Check if file exists and delete if present**

```bash
if [ -f docs/superpowers/first_run.md ]; then
  git rm docs/superpowers/first_run.md
  git commit -m "chore: remove obsolete first_run.md"
else
  echo "File does not exist — nothing to do"
fi
```

Expected: "File does not exist — nothing to do" (file was already removed in a prior PR).

---

### Task 12: Git Tag & GitHub Release

This task runs **after** the release PR is merged to main.

**Files:** None (git operations only)

- [ ] **Step 1: Ensure you're on main with the merged PR**

```bash
git checkout main
git pull origin main
```

- [ ] **Step 2: Create and push the tag**

```bash
git tag v0.1.0
git push origin v0.1.0
```

- [ ] **Step 3: Create GitHub Release**

```bash
gh release create v0.1.0 --title "v0.1.0" --notes-file CHANGELOG.md
```

- [ ] **Step 4: Verify the release**

```bash
gh release view v0.1.0
```

Expected: Release page shows title "v0.1.0" with changelog content.
