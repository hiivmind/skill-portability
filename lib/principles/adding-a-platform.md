# Adding a New Platform

End-to-end guide for adding a new platform to plugin-portability. Covers the architecture, what to create in what order, and how to verify each step.

Audience: human contributors and coding agents. Every phase ends with a verification gate — concrete checks that can be evaluated mechanically or by inspection.

---

## Architecture

A platform is represented by 7 artifact types. They have a strict dependency order:

```
Research doc (docs/platforms/<platform>.md)
  ↓ sourced facts with citations
Platform spec (lib/references/platforms/<platform>.md)
  ↓ structured PlatformSpec dictionary
  ├→ Rubric (lib/rubrics/<platform>.yaml)
  │    conditions reference spec fields
  ├→ Manifest templates (lib/templates/manifests/<platform>/)
  │    field names from spec
  ├→ Install/publish templates (lib/templates/install-docs/)
  │    commands from spec
  ├→ Pattern updates (lib/patterns/)
  │    hook events, publishing mechanisms
  └→ Skill pseudocode (skills/plugin-portability/SKILL.md)
       platform in selection list and ELSE fallback
```

### Key principles

**Research is the source of truth.** Every platform-specific claim in any file traces back to a cited fact in the research doc. When research and other files disagree, research wins.

**The platform spec is the single structured representation.** Rubrics, templates, and patterns all derive from the spec — they don't independently describe platform behavior. The spec conforms to the `PlatformSpec` type defined in `lib/references/platform-api.md`.

**Rubric conditions are scored, not prose.** Each condition has an ID, a type (`checkable` or `judgement`), points, and pseudocode. The schema is defined in `lib/rubrics/rubric-framework.md`.

**Templates use `{{mustache}}` variables.** They're resolved at generation time for a specific target plugin. Variables fall into three categories:
- **Core:** `{{name}}`, `{{displayName}}`, `{{version}}`, `{{description}}`, `{{repository}}`, `{{marketplaceName}}`
- **Package metadata:** `{{author.name}}`, `{{author.email}}`, `{{license}}`, `{{keywords}}`, `{{homepage}}`
- **Generated:** `{{skillsList}}` and any platform-specific values produced by builder-mode templates

### Existing files to read first

| File | What it tells you |
|------|-------------------|
| `lib/references/platform-api.md` | PlatformSpec type definition and lookup functions |
| `lib/rubrics/rubric-framework.md` | Condition schema (id, type, component, critical, points, check) |
| `lib/principles/pseudocode-principles.md` | How to write pseudocode, registries, and LOAD_AND_VERIFY gates |
| `lib/references/templates/registry.md` | Template registry (schema, platform, mode, paths) |
| An existing platform's full set of artifacts | Structural reference for every phase |

---

## Phase 1: Research

**Create:** `docs/platforms/<platform>.md`

**Inputs:**
- Platform's official documentation, GitHub repos, release announcements
- An existing research doc (e.g., `docs/platforms/cursor.md`) as structural reference

**What goes in this file:**

Sourced documentation organized into the 9 standard sections. Every factual claim must have an inline `[source](url)` citation.

The 9 sections are:

1. Plugin Structure
2. Manifest
3. Skills
4. Context Files
5. Hooks
6. Tool Mapping
7. Install and Distribution
8. Runtime Components
9. Sources

Follow the heading format of existing research docs (`## 1. Plugin Structure`, etc.).

**Verification gate:**
- [ ] File exists at `docs/platforms/<platform>.md`
- [ ] All 9 standard sections present
- [ ] Every factual claim has a `[source](url)` citation
- [ ] No claims copied from another platform's research doc without independent verification

---

## Phase 2: Platform spec

**Create:** `lib/references/platforms/<platform>.md`

**Inputs:**
- Research doc from Phase 1
- `lib/references/platform-api.md` (PlatformSpec type definition)
- An existing spec (e.g., `lib/references/platforms/cursor.md`) as structural reference

**What goes in this file:**

A `REGISTRY["<platform>"]` block conforming to the PlatformSpec type. Every field must be populated — use `null` for capabilities the platform doesn't support. Key sections:

- **tools** — map canonical operations (`file.read`, `shell.execute`, etc.) to the platform's native tool names
- **hooks** — event names, config path, naming convention (PascalCase/camelCase/snake_case), structure
- **context** — primary context file, secondary files, priority rules
- **skills** — path, frontmatter fields, discovery mechanism
- **marketplace** — marketplace path or `null`

**Verification gate:**
- [ ] File exists at `lib/references/platforms/<platform>.md`
- [ ] Contains `REGISTRY["<platform>"] = {`
- [ ] Every field in PlatformSpec type has a value (`null` is valid, missing is not)
- [ ] Tool entries reference actual platform tool names from the research doc
- [ ] Hook events match the platform's actual event names and casing convention
- [ ] No fields copy-pasted from another platform without verification against research

---

## Phase 3: Rubric

**Create:** `lib/rubrics/<platform>.yaml`

**Inputs:**
- Platform spec from Phase 2
- `lib/rubrics/rubric-framework.md` (condition schema)
- `lib/principles/pseudocode-principles.md` (pseudocode patterns)
- An existing rubric (e.g., `lib/rubrics/cursor.yaml`) as structural reference

**What goes in this file:**

YAML file with a header block and a `categories` map. The header declares the platform, manifest path, context files, and hooks path. Categories group conditions by concern.

Each condition has:

```yaml
- id: <platform>.<category_num>_<category_short>.<component>.<check_name>
  type: checkable | judgement
  component: <component_tag>
  critical: true | false
  points: 1
  check: |
    pseudocode (checkable) or prose description (judgement)
  template: optional — path to template that fixes this condition
```

Standard categories: `1_manifest`, `2_skills`, `3_context`, `4_hooks`, `5_toolmap`, `6_install`.

Pseudocode in `check` fields should use LOAD_AND_VERIFY / GLOB_AND_VERIFY patterns from `lib/principles/pseudocode-principles.md`.

**Verification gate:**
- [ ] File exists at `lib/rubrics/<platform>.yaml`
- [ ] Every condition has all required fields (`id`, `type`, `component`, `critical`, `points`, `check`)
- [ ] Condition IDs follow the format `<platform>.<category_num>_<category_short>.<component>.<check_name>`
- [ ] `type` is either `checkable` or `judgement`
- [ ] `check` pseudocode for `checkable` conditions references concrete file paths or spec fields
- [ ] YAML parses without errors: `python3 -c "import yaml; yaml.safe_load(open('lib/rubrics/<platform>.yaml'))"`

---

## Phase 4: Manifest templates

**Create:** `lib/templates/manifests/<platform>/` with one `.tmpl` file per manifest the platform requires.

**Inputs:**
- Platform spec from Phase 2 (manifest fields)
- Research doc (manifest format and required fields)
- `lib/references/templates/registry.md` (template registry)
- An existing manifest template directory (e.g., `lib/templates/manifests/cursor-plugin/`) as structural reference

**What goes in these files:**

JSON or TOML template files using `{{mustache}}` variables. Each template should have a `{{! fixes: <condition_id> }}` comment at the top linking it to the rubric condition it satisfies.

Fields must match what the platform actually requires per the research doc.

**Verification gate:**
- [ ] Directory exists at `lib/templates/manifests/<platform>/`
- [ ] At least one `.tmpl` file present
- [ ] Template files are valid JSON/TOML (ignoring `{{mustache}}` placeholders)
- [ ] Required fields from the platform spec are present in the template
- [ ] Every `{{variable}}` is either a core variable, a package metadata variable, or documented in the template registry
- [ ] New template entry added to `lib/references/templates/registry.md` with correct `schema`, `platform`, `mode`, `template_path`, `target_path`

---

## Phase 5: Install and publish templates

**Create:**
- `lib/templates/install-docs/install/<platform>.md`
- `lib/templates/install-docs/publish/<platform>.md`

**Inputs:**
- Platform spec from Phase 2 (install commands, marketplace info)
- Research doc (install and distribution section)
- `lib/patterns/publishing-and-discoverability.md`
- Existing install/publish templates as structural reference

**Install template structure:**

Follow the journey-structured format. Sections are conditional — omit when they don't apply:

1. **Install from registry** — only if the platform has a registry
2. **Install from GitHub** — always present
3. **Install from local clone** — always present
4. **Verify** — always present

Use `{{mustache}}` variables throughout.

**Publish template structure:**

Author-facing only. No install commands:

1. **Prerequisites** — always present (required manifests/metadata)
2. **Submit to registry** — only if the platform has a submission process
3. **Team / org distribution** — only if the platform has a mechanism

**Verification gate:**
- [ ] Both files exist at the expected paths
- [ ] Install template has "Install from GitHub", "Install from local clone", and "Verify" sections
- [ ] Install template has "Install from registry" only if the platform has a registry
- [ ] Publish template has "Prerequisites" section
- [ ] Publish template contains zero install commands (`grep -c "install\|clone\|cp " <publish-file>` returns 0 or only false positives)
- [ ] Both templates use `{{mustache}}` variables, not hardcoded values

---

## Phase 6: Pattern updates

**Modify:** Files in `lib/patterns/`

**Inputs:**
- Research doc from Phase 1
- Platform spec from Phase 2

**What to update:**

- `lib/patterns/publishing-and-discoverability.md` — add platform to the quick reference table and add a dedicated platform section
- `lib/patterns/hook-merging.md` — add the platform's hook format if it supports hooks
- Other pattern files as needed based on platform capabilities

**Verification gate:**
- [ ] `grep "<platform>" lib/patterns/publishing-and-discoverability.md` returns hits
- [ ] If the platform has hooks: `grep "<platform>" lib/patterns/hook-merging.md` returns hits
- [ ] All platform-specific claims in pattern files are consistent with the research doc

---

## Phase 7: Skill integration

**Modify:** `skills/plugin-portability/SKILL.md`

**Inputs:** All artifacts from Phases 1–6.

**What to update:**

Three locations in the skill's intent-gathering pseudocode:

1. **The `options` array** in the "Select target platforms" question — add a new entry with `label` and `description`
2. **The `ELSE` fallback list** — the `platforms = ["claude-code", "cursor", ...]` line that defines the "All platforms" default
3. **The "All platforms" option description** — if it enumerates platform names, add the new one

**Verification gate:**
- [ ] Platform appears in the `options` array with `label` and `description`
- [ ] `description` accurately summarizes the platform (no fabricated features)
- [ ] Platform appears in the `ELSE` fallback list: `grep 'platforms = \[' skills/plugin-portability/SKILL.md` shows the new platform
- [ ] "All platforms" option description includes the new platform
- [ ] Template file count increased: `find lib/templates/install-docs -name "*.md" | wc -l` is 2 more than before

---

## Cross-cutting updates

Files that need a mention of the new platform but don't have their own phase:

| File | What to update |
|------|----------------|
| `docs/reconciliation-matrix.md` | Add a new section for the platform tracking claim verification status |
| `README.md` | Add platform to the "What it does" artifacts table |
| `CHANGELOG.md` | Add an entry for the new platform |

---

## Final verification checklist

Run these end-to-end checks after all phases and cross-cutting updates are complete:

- [ ] `find lib/references/platforms -name "*.md" | wc -l` matches expected platform count
- [ ] `find lib/rubrics -name "*.yaml" | wc -l` matches expected platform count
- [ ] `find lib/templates/install-docs/install -name "*.md" | wc -l` matches expected platform count
- [ ] `find lib/templates/install-docs/publish -name "*.md" | wc -l` matches expected platform count
- [ ] Platform appears in the skill's platform selection options and ELSE fallback list
- [ ] Platform appears in `lib/patterns/publishing-and-discoverability.md` quick reference table
- [ ] Phase 7 glob `lib/templates/install-docs/**/*.md` matches all template files
- [ ] No hardcoded platform counts in README or CONTRIBUTING that are now stale
- [ ] `INSTALL.md` and `PUBLISHING.md` are regenerated from the new templates (or noted as needing regeneration for a specific target plugin)
