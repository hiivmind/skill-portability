# Install Docs Correctness & Platform Invocation Examples

**Date:** 2026-04-24

## Problem

INSTALL.md and README.md contain incorrect installation paths, wrong GitHub org URLs, a non-existent marketplace name, and generic usage instructions that don't show users how to actually invoke skills on their platform.

## Scope

Three files changed:

1. **INSTALL.md** — fix all install commands, add per-platform skill invocation examples
2. **README.md** — fix quick-start, replace generic usage with per-platform invocation table
3. **`.cursor-plugin/plugin.json`** — fix GitHub URLs

No changes to skills, templates, lib, or docs/superpowers plans/specs (historical records).

## Changes

### 1. Fix marketplace name (README.md, INSTALL.md)

`skill-portability@skill-portability-dev` → `skill-portability@skill-portability-marketplace`

The marketplace.json `name` field is `skill-portability-marketplace`. The `@` syntax is `plugin-name@marketplace-name`.

### 2. Fix `extraKnownMarketplaces` format (INSTALL.md)

Old (incorrect array format):
```json
{
  "extraKnownMarketplaces": ["./path-to-marketplace"]
}
```

New (correct object format):
```json
{
  "extraKnownMarketplaces": {
    "skill-portability-marketplace": {
      "source": {
        "source": "github",
        "repo": "hiivmind/skill-portability"
      }
    }
  }
}
```

### 3. Fix Cursor install (INSTALL.md)

Remove false marketplace claim. Replace with:
- `/add-plugin hiivmind/skill-portability` in Agent chat
- Local development via symlink (keep existing)

### 4. Fix all GitHub URLs

All instances of `github.com/nathanielramm/skill-portability` → `github.com/hiivmind/skill-portability`

Files affected:
- INSTALL.md lines 66, 118, 124, 148
- `.cursor-plugin/plugin.json` lines 10-11

### 5. Add per-platform skill invocation (INSTALL.md)

Add a "Using the skills" subsection to each platform section showing actual syntax:

| Platform | Assess | Uplift |
|----------|--------|--------|
| Claude Code | `Use the assessing-plugin-portability skill on /path/to/plugin` | `Use the uplifting-a-plugin skill on /path/to/plugin` |
| Cursor | `/assessing-plugin-portability` | `/uplifting-a-plugin` |
| Gemini CLI | Automatic via `activate_skill`, or mention skill name | Same |
| OpenCode | Mention skill name — agent calls `skill()` automatically | Same |
| Copilot CLI | `/assessing-plugin-portability` | `/uplifting-a-plugin` |
| Codex | `$assessing-plugin-portability` | `$uplifting-a-plugin` |

### 6. Replace README usage section

Replace the generic "Use the X skill" instructions with a table showing real invocation per platform, covering the two most common patterns inline and linking to INSTALL.md for the rest.

## Files not changed

- `docs/superpowers/plans/` — historical records, keep as-is
- `docs/superpowers/specs/` (prior) — historical records
- `.claude-plugin/marketplace.json` — already correct
- `.claude-plugin/plugin.json` — already has correct hiivmind URL
