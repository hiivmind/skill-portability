# Install Doc Consolidation

**Date:** 2026-04-24
**Status:** Approved
**Scope:** Consolidate install docs into a single root INSTALL.md, add cross-platform symlink guidance, include npx/whole-repo context, update templates and uplift skill Phase 6.

## Problem

1. **INSTALL.md is in `docs/`** — less discoverable than root. README links to `docs/INSTALL.md`.
2. **Copilot CLI missing from central install doc** — has its own `.github/INSTALL.md` but isn't in the composite doc.
3. **No "adding another platform" guidance** — users who clone for one platform don't know they can symlink/config other platforms at the same checkout.
4. **No context about why whole-repo install is required** — `npx skills` installs individual skill dirs, losing hooks, context files, and manifests. This is documented in `docs/ecosystem-friction.md` (Gap 1) but not surfaced in install docs.

## Solution

### Root `INSTALL.md`

Single file at repo root with three sections:

#### Section 1: Whole-repo install note

Brief explanation that this plugin requires whole-repo install (not `npx skills`) because it depends on shared hooks, context files, and platform manifests. Links to `docs/ecosystem-friction.md` for full details.

```markdown
## Important: Whole-repo install required

This plugin uses shared hooks, context files, and platform manifests that live outside
individual skill directories. Installing via `npx skills` (which copies only the `skills/`
directory) will lose these shared files and break session-start injection.

Every install path below clones or references the full repo. See
[docs/ecosystem-friction.md](docs/ecosystem-friction.md) for background on why this is
necessary across today's agent platforms.
```

#### Section 2: Fresh install (all 6 platforms)

Per-platform install instructions. Each platform gets a subsection with install command(s) and a verify step. All 6 platforms included: Claude Code, Cursor, Gemini CLI, OpenCode, Copilot CLI, Codex.

Content is the same as the current `docs/INSTALL.md` sections plus the missing Copilot CLI section from `.github/INSTALL.md`.

#### Section 3: Adding another platform

For users who already have the repo cloned for one platform and want to add another. Each platform gets a short subsection explaining how to point it at the existing checkout:

| Platform | Cross-install method |
|----------|---------------------|
| Claude Code | `claude --plugin-dir /path/to/existing/checkout` |
| Cursor | Symlink or copy to `~/.cursor/plugins/local/{{name}}/` |
| Gemini CLI | `gemini extensions install /path/to/existing/checkout` |
| OpenCode | Symlink `.opencode/plugins/{{name}}.js` from checkout, or add checkout path to `opencode.json` (do not copy the JS file — it resolves paths relative to the repo root) |
| Copilot CLI | Symlink `skills/` or work from the cloned directory |
| Codex | `ln -s /path/to/existing/checkout/skills ~/.agents/skills/{{name}}` |

### File operations

| Action | Path | Detail |
|--------|------|--------|
| Create | `INSTALL.md` (root) | Consolidated doc with all 3 sections |
| Delete | `docs/INSTALL.md` | Replaced by root file |
| Replace | `.github/INSTALL.md` | One-line pointer: `See [INSTALL.md](../INSTALL.md)` |
| Update | `README.md` | Change link from `docs/INSTALL.md` to `INSTALL.md` |

### Template updates

Update `lib/templates/install-docs/` so the uplift skill generates this same structure for other plugins:

| Action | Path | Detail |
|--------|------|--------|
| Create | `lib/templates/install-docs/whole-repo-note.md` | Template for the npx warning section |
| Create | `lib/templates/install-docs/adding-platform/claude-code.md` | Cross-install template |
| Create | `lib/templates/install-docs/adding-platform/cursor.md` | Cross-install template |
| Create | `lib/templates/install-docs/adding-platform/gemini-cli.md` | Cross-install template |
| Create | `lib/templates/install-docs/adding-platform/opencode.md` | Cross-install template |
| Create | `lib/templates/install-docs/adding-platform/copilot-cli.md` | Cross-install template |
| Create | `lib/templates/install-docs/adding-platform/codex.md` | Cross-install template |

### Uplift skill Phase 6 update

Update `WRITE_INSTALL_DOCS` in `skills/uplifting-a-plugin/SKILL.md` to:
1. Always emit a single root `INSTALL.md` (not `docs/INSTALL.md`)
2. Include the whole-repo-note section
3. Include the adding-platform section for all targeted platforms
4. Emit `.github/INSTALL.md` as a pointer (not a full doc) when copilot-cli is targeted
5. Emit `.codex/INSTALL.md` as a pointer (not a full doc) when codex is targeted
6. Remove the old split logic (composite in docs/, separate in .github/ and .codex/)

Updated pseudocode:

```pseudocode
WRITE_INSTALL_DOCS(computed, sections, platforms_with_artifacts):
  # Build consolidated INSTALL.md at root

  # Whole-repo note: only include when plugin has shared assets that require
  # whole-repo install (hooks, session-start bootstrapping, root context files,
  # or platform manifests). Bare skill repos without these can use npx skills.
  has_shared_assets = (
    computed.existing_hooks
    OR file_exists("skills/using-" + computed.metadata.name + "/SKILL.md")
    OR any(file_exists(p) FOR p IN ["CLAUDE.md", "AGENTS.md", "GEMINI.md"])
    OR computed.uplift_target == "full-portable-plugin"
  )
  IF has_shared_assets:
    whole_repo_note = render(Read("lib/templates/install-docs/whole-repo-note.md"), computed.metadata)
  ELSE:
    whole_repo_note = ""

  fresh_install = ""
  adding_platform = ""
  FOR platform IN platforms_with_artifacts:
    fresh_install += sections[platform] + "\n\n"
    adding_tmpl = read_if_exists("lib/templates/install-docs/adding-platform/" + platform + ".md")
    IF adding_tmpl:
      adding_platform += render(adding_tmpl, computed.metadata) + "\n\n"

  content = "# Installation\n\n"
  IF whole_repo_note:
    content += whole_repo_note + "\n\n"
  content += "## Fresh Install\n\n" + fresh_install
  content += "## Adding Another Platform\n\n"
  content += "Already have the repo cloned for one platform? Add others by pointing them at the same checkout.\n\n"
  content += adding_platform

  Write("INSTALL.md", content)
  computed.created.append({ path: "INSTALL.md", platform: "cross" })

  # Platform-specific pointers (not full docs)
  IF "copilot-cli" IN platforms_with_artifacts:
    Write(".github/INSTALL.md", "See [INSTALL.md](../INSTALL.md) for installation instructions.\n")
    computed.created.append({ path: ".github/INSTALL.md", platform: "copilot-cli" })

  IF "codex" IN platforms_with_artifacts:
    Write(".codex/INSTALL.md", "See [INSTALL.md](../INSTALL.md) for installation instructions.\n")
    computed.created.append({ path: ".codex/INSTALL.md", platform: "codex" })

  # Flag missing Installation section in README
  IF file_exists("README.md"):
    readme = Read("README.md")
    IF "## Installation" NOT IN readme AND "## Install" NOT IN readme:
      computed.flagged.append(
        "README.md — no Installation section found. Add install instructions or link to INSTALL.md."
      )
```

## What does NOT change

- `lib/templates/install-docs/claude-code.md` etc (existing fresh-install templates) — unchanged
- Phase 6 `DETERMINE_PLATFORMS` and `RENDER_INSTALL_SECTIONS` — unchanged
- Phase 4-5, 7-8 — unchanged

## Files changed

| File | Change |
|------|--------|
| `INSTALL.md` (root) | Create — consolidated install doc |
| `docs/INSTALL.md` | Delete |
| `.github/INSTALL.md` | Replace with pointer |
| `README.md` | Update link |
| `lib/templates/install-docs/whole-repo-note.md` | Create — npx warning template |
| `lib/templates/install-docs/adding-platform/*.md` | Create — 6 cross-install templates |
| `skills/uplifting-a-plugin/SKILL.md` | Update Phase 6 WRITE_INSTALL_DOCS pseudocode |
