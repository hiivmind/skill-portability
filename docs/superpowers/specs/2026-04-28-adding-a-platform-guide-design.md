# Adding a Platform Guide — Design Spec

**Date:** 2026-04-28
**Status:** Approved

## Problem

CONTRIBUTING.md has a 6-line "Adding a New Platform" section that lists file paths but explains nothing: no architecture context, no data shape requirements, no verification steps, no dependency ordering. A contributor (human or agent) starting from this checklist would need to reverse-engineer the architecture by reading 5+ existing files.

There is no document in the repo that explains the end-to-end architecture — how research docs feed platform specs, how specs feed rubrics and templates, and how the skill ties it all together.

## Solution

A single guide at `lib/principles/adding-a-platform.md` that serves both human contributors and coding agents. It opens with an architecture overview, walks through 7 phases in dependency order, and ends with a cross-cutting update list and final verification checklist. Every phase has concrete verification gates.

CONTRIBUTING.md's "Adding a New Platform" section is replaced with a one-liner pointing to the guide.

## Audience

Both human contributors and coding agents. The guide uses clear procedures with concrete checks — an agent can evaluate the verification gates mechanically, a human can check them by inspection.

## Document Structure

### Part 1: Architecture Overview (~80 lines)

Dependency diagram showing how the 7 artifact types connect:

```
Research doc (docs/platforms/)
  ↓ sourced facts with citations
Platform spec (lib/references/platforms/)
  ↓ structured PlatformSpec dictionary
  ├→ Rubric (lib/rubrics/)           — conditions reference spec fields
  ├→ Manifest templates (lib/templates/manifests/) — field names from spec
  ├→ Install/publish templates (lib/templates/install-docs/) — commands from spec
  ├→ Pattern updates (lib/patterns/) — hook events, publishing mechanisms
  └→ Skill pseudocode (skills/plugin-portability/SKILL.md) — platform in selection list
```

Key principles:
- **Research is the source of truth.** Every platform-specific claim traces back to a cited fact in the research doc. When research and other files disagree, research wins.
- **The platform spec is the single structured representation.** Rubrics, templates, and patterns all derive from the spec — they don't independently describe platform behavior.
- **Rubric conditions are scored, not prose.** Each condition has an ID, a type, points, and pseudocode. Schema at `lib/rubrics/rubric-framework.md`.
- **Templates use `{{mustache}}` variables.** Resolved at generation time for a specific target plugin.

Points to `lib/references/platform-api.md` for the PlatformSpec type and `lib/rubrics/rubric-framework.md` for the condition schema — doesn't re-document them.

### Part 2: Phases (~200 lines across 7 phases)

Each phase follows the same format:

```
## Phase N: <Name>

**Create:** `exact/path/to/file`

**Inputs:**
- What to read to write this file
- Structural reference (existing file for the same slot from another platform)

**What goes in this file:**
Brief description of required content and shape.

**Verification gate:**
- [ ] Concrete check 1
- [ ] Concrete check 2
- [ ] ...
```

#### Phase 1: Research

**Create:** `docs/platforms/<platform>.md`

**Inputs:** Platform's official documentation, GitHub repos, release announcements.

**What goes in this file:** Sourced documentation organized by section (manifest, skills, hooks, context files, tools, install/distribution, runtime). Every claim has an inline citation (`[source](url)`). Follow the section structure of existing research docs (e.g., `docs/platforms/cursor.md`).

**Verification gate:**
- [ ] File exists at `docs/platforms/<platform>.md`
- [ ] Covers the 9 standard sections: plugin structure, manifest, skills, context files, hooks, tool mapping, install and distribution, runtime components, sources
- [ ] Every factual claim has a `[source](url)` citation
- [ ] No claims copied from another platform's research doc without independent verification

#### Phase 2: Platform spec

**Create:** `lib/references/platforms/<platform>.md`

**Inputs:** Research doc from Phase 1, PlatformSpec type definition (`lib/references/platform-api.md`), an existing spec as structural reference.

**What goes in this file:** A `REGISTRY["<platform>"]` block conforming to the PlatformSpec type. Every field populated — `null` for capabilities the platform doesn't support. Key sections: tools, hooks, context, skills, marketplace.

**Verification gate:**
- [ ] File exists at `lib/references/platforms/<platform>.md`
- [ ] Contains `REGISTRY["<platform>"] = {`
- [ ] Every field in PlatformSpec type has a value (null is valid, missing is not)
- [ ] Tool entries reference actual platform tool names from research doc
- [ ] Hook events match the platform's actual event names and casing convention
- [ ] No fields copy-pasted from another platform without verification against research

#### Phase 3: Rubric

**Create:** `lib/rubrics/<platform>.yaml`

**Inputs:** Platform spec from Phase 2, rubric framework (`lib/rubrics/rubric-framework.md`), an existing rubric as structural reference, pseudocode principles (`lib/principles/pseudocode-principles.md`).

**What goes in this file:** YAML list of conditions following the condition schema. Each condition has `id`, `type`, `component`, `critical`, `points`, `check`. Conditions are grouped by category (manifest, skills, context, hooks, toolmap, install). Pseudocode in `check` fields uses the LOAD_AND_VERIFY / GLOB_AND_VERIFY patterns.

**Verification gate:**
- [ ] File exists at `lib/rubrics/<platform>.yaml`
- [ ] Every condition has all required fields (`id`, `type`, `component`, `critical`, `points`, `check`)
- [ ] Condition IDs follow the format `<platform>.<category_num>_<category_short>.<component>.<check_name>`
- [ ] `type` is either `checkable` or `judgement`
- [ ] `check` pseudocode for `checkable` conditions references concrete file paths or spec fields
- [ ] YAML parses without errors

#### Phase 4: Manifest templates

**Create:** `lib/templates/manifests/<platform>/` with one `.tmpl` file per manifest the platform requires.

**Inputs:** Platform spec from Phase 2 (manifest fields), research doc (manifest format), an existing manifest template directory as structural reference.

**What goes in this file:** JSON or TOML template files using `{{mustache}}` variables. Fields match what the platform actually requires per the research doc.

**Verification gate:**
- [ ] Directory exists at `lib/templates/manifests/<platform>/`
- [ ] At least one `.tmpl` file present
- [ ] Template files are valid JSON/TOML (ignoring `{{mustache}}` placeholders)
- [ ] Required fields from the platform spec are present in the template
- [ ] Every `{{variable}}` in the template is either a core variable (`{{name}}`, `{{displayName}}`, `{{version}}`, `{{description}}`, `{{repository}}`, `{{marketplaceName}}`) or a metadata variable documented in the template registry (`lib/references/templates/registry.md`) or sourced from the plugin's package metadata (`{{author.name}}`, `{{author.email}}`, `{{license}}`, `{{keywords}}`, `{{homepage}}`, `{{skillsList}}`)
- [ ] New template entry added to `lib/references/templates/registry.md` with correct `schema`, `platform`, `mode`, `template_path`, `target_path`

#### Phase 5: Install and publish templates

**Create:** `lib/templates/install-docs/install/<platform>.md` and `lib/templates/install-docs/publish/<platform>.md`

**Inputs:** Platform spec from Phase 2 (install commands, marketplace info), research doc (install/distribution section), `lib/patterns/publishing-and-discoverability.md`.

**What goes in the install template:** Journey-structured sections: "Install from registry" (conditional — only if platform has one), "Install from GitHub" (always), "Install from local clone" (always), "Verify" (always). Uses `{{mustache}}` variables.

**What goes in the publish template:** Author-focused sections: "Prerequisites" (always — required manifests), "Submit to registry" (conditional), "Team / org distribution" (conditional). No install commands.

**Verification gate:**
- [ ] Both files exist at the expected paths
- [ ] Install template has "Install from GitHub", "Install from local clone", and "Verify" sections
- [ ] Install template has "Install from registry" only if the platform has a registry per the spec
- [ ] Publish template has "Prerequisites" section
- [ ] Publish template contains zero install commands (no `install`, `clone`, `cp` commands)
- [ ] Both templates use `{{mustache}}` variables, not hardcoded values

#### Phase 6: Pattern updates

**Modify:** Multiple files in `lib/patterns/`.

**Inputs:** Research doc, platform spec.

**What to update:**
- `lib/patterns/publishing-and-discoverability.md` — add platform to quick reference table and add a platform section
- `lib/patterns/hook-merging.md` — add platform's hook format if it has hooks
- Other pattern files as needed based on platform capabilities

**Verification gate:**
- [ ] `grep "<platform>" lib/patterns/publishing-and-discoverability.md` returns hits
- [ ] If platform has hooks: `grep "<platform>" lib/patterns/hook-merging.md` returns hits
- [ ] All platform-specific claims in pattern files are consistent with the research doc

#### Phase 7: Skill integration

**Modify:** `skills/plugin-portability/SKILL.md`

**Inputs:** All artifacts from Phases 1-6.

**What to update:**
- Add platform to the platform selection `options` array in the intent-gathering pseudocode
- Add platform to the hardcoded `ELSE` fallback list (`platforms = ["claude-code", "cursor", ...]`) — this is the "All platforms" default path
- Update the "All platforms" option description if it enumerates platform names

**Verification gate:**
- [ ] Platform appears in the `options` array with `label` and `description`
- [ ] `description` accurately summarizes the platform (no fabricated features)
- [ ] Platform appears in the `ELSE` fallback list (grep for `platforms = \[` and confirm the new platform is included)
- [ ] "All platforms" option description includes the new platform if it enumerates names
- [ ] Skill's `GLOB_AND_VERIFY` patterns match the new files (test: `find lib/templates/install-docs -name "*.md" | wc -l` increased by 2)

### Part 3: Cross-cutting updates (~30 lines)

Files that need a mention of the new platform but don't warrant their own phase:

- `docs/reconciliation-matrix.md` — add a section for the new platform
- `README.md` — add platform to the "What it does" artifacts table
- `CHANGELOG.md` — entry for the new platform addition
- `lib/patterns/publishing-and-discoverability.md` — covered in Phase 6 but listed here for completeness

### Part 4: Final verification checklist (~20 lines)

End-to-end checks after all phases complete:

- [ ] `find lib/references/platforms -name "*.md" | wc -l` matches expected platform count
- [ ] `find lib/rubrics -name "*.yaml" | wc -l` matches expected platform count
- [ ] `find lib/templates/install-docs/install -name "*.md" | wc -l` matches expected platform count
- [ ] `find lib/templates/install-docs/publish -name "*.md" | wc -l` matches expected platform count
- [ ] Platform appears in the skill's platform selection options
- [ ] Platform appears in `lib/patterns/publishing-and-discoverability.md` quick reference table
- [ ] Phase 7 glob `lib/templates/install-docs/**/*.md` matches all template files
- [ ] No hardcoded platform counts in README or CONTRIBUTING that are now stale

## CONTRIBUTING.md Change

Replace the "Adding a New Platform" section with:

```markdown
## Adding a New Platform

See [lib/principles/adding-a-platform.md](lib/principles/adding-a-platform.md) for the full guide — architecture overview, phased checklist, and verification gates.
```

## File Impact

| Action | File |
|--------|------|
| Create | `lib/principles/adding-a-platform.md` |
| Modify | `CONTRIBUTING.md` (trim section to one-liner) |
