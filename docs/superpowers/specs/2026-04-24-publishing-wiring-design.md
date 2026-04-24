# Publishing Wiring & README Audience Fix

**Date:** 2026-04-24

## Problem

1. skill-portability's README doesn't state its target audience — plugin authors who have skills/plugins for one platform (often Claude Code) and want to go cross-platform.
2. The uplift skill generates INSTALL.md (consumer-facing) but no publishing guidance (author-facing). The publishing reference exists at `lib/patterns/platforms/publishing-and-discoverability.md` but nothing reads it.

## Scope

Two independent changes:

### Change A: Fix this repo's README.md

Update the opening of `README.md` to clearly state the target audience: plugin authors.

Replace:
```markdown
An agent skill — not a CLI, not a framework — that makes any plugin fully portable across all agent platforms.

Point it at a plugin repo and it tells you what's missing. Say the word and it emits every missing artifact in place. No install step, no sync daemon, no registry. The agent itself is the portability engine.
```

With:
```markdown
A plugin for agent skill and plugin authors who have built for one platform — often Claude Code — and need to go cross-platform.

Point it at a plugin repo and it tells you what's missing. Say the word and it emits every missing artifact in place — platform manifests, context files, tool mappings, install docs, and publishing guidance. No CLI to install, no sync daemon, no registry. The agent itself is the portability engine.
```

### Change B: Wire PUBLISHING.md into the uplift skill

Three sub-parts:

#### B1. New template: `lib/templates/install-docs/publishing.md`

A template for the generated `PUBLISHING.md` that the uplift skill writes to target plugins. Uses the same `{{variable}}` substitution as the install templates.

Structure:
```markdown
# Publishing & Discoverability

How to get {{displayName}} discovered and installed on each platform.

{per-platform sections, filtered to target_platforms}
```

Per-platform sections are distilled from `lib/patterns/platforms/publishing-and-discoverability.md` into template form with `{{name}}`, `{{displayName}}`, `{{repository}}`, `{{marketplaceName}}` variables.

Each platform section covers:
- Where to publish / submit
- How users discover it
- How users install it
- Team/org distribution (if applicable)

#### B2. New Phase 6.4 in uplift skill

Add after Phase 6.3 (WRITE_INSTALL_DOCS):

```pseudocode
WRITE_PUBLISHING_DOCS(computed, platforms_with_artifacts):
  sections = ""
  FOR platform IN platforms_with_artifacts:
    template = read_if_exists("lib/templates/install-docs/publishing/" + platform + ".md")
    IF template:
      sections += render(template, computed.metadata) + "\n\n"

  IF sections:
    content = render(Read("lib/templates/install-docs/publishing.md"), computed.metadata)
    content += sections
    Write("PUBLISHING.md", content)
    computed.created.append({ path: "PUBLISHING.md", platform: "cross" })
```

Template directory: `lib/templates/install-docs/publishing/` with one file per platform (same pattern as `adding-platform/`).

#### B3. Extend Phase 6.3 README flag

Update the existing README flag (lines 522-528) to also check for a PUBLISHING.md link:

```pseudocode
  IF file_exists("README.md"):
    readme = Read("README.md")
    IF "## Installation" NOT IN readme AND "## Install" NOT IN readme:
      computed.flagged.append(
        "README.md — no Installation section found. Add install instructions or link to INSTALL.md."
      )
    IF "PUBLISHING.md" NOT IN readme:
      computed.flagged.append(
        "README.md — no link to PUBLISHING.md. Add a link so plugin authors can find publishing guidance."
      )
```

## Files created

- `lib/templates/install-docs/publishing.md` — header template for PUBLISHING.md
- `lib/templates/install-docs/publishing/claude-code.md`
- `lib/templates/install-docs/publishing/cursor.md`
- `lib/templates/install-docs/publishing/gemini-cli.md`
- `lib/templates/install-docs/publishing/codex.md`
- `lib/templates/install-docs/publishing/copilot-cli.md`
- `lib/templates/install-docs/publishing/opencode.md`

## Files modified

- `README.md` — update opening to state target audience
- `skills/uplifting-a-plugin/SKILL.md` — add Phase 6.4 (WRITE_PUBLISHING_DOCS), extend Phase 6.3 README flag

## Files not changed

- `lib/patterns/platforms/publishing-and-discoverability.md` — stays as raw reference; templates distill it
- `skills/assessing-plugin-portability/SKILL.md` — assessment doesn't generate docs
- `INSTALL.md` — documents skill-portability's own install, unrelated
