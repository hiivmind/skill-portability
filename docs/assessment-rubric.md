# Plugin Portability Assessment Rubric

This rubric is the operational companion to [`plugin-portability-patterns.md`](./plugin-portability-patterns.md).

Use it when:

- assessing a repo for portability readiness
- deciding whether a repo should be uplifted as a skill library or as a full plugin
- generating a consistent report that another skill or human can act on

## Purpose

The assessment process should produce three outputs:

1. a classification of the repo's current shape
2. a gap report covering content, packaging, and installation
3. a concrete uplift recommendation, including the preferred Codex path

This rubric is intentionally mechanical. A future assessment skill should be able to follow it step by step.

## Assessment workflow

Run the assessment in this order:

1. Inventory the repo
2. Identify the canonical metadata source
3. Classify the current repo shape
4. Score portability readiness by category
5. Identify structural blockers
6. Choose an uplift target
7. Emit install guidance requirements

## Step 1: Inventory the repo

Check for the presence and quality of the following.

### A. Skill content

Look for:

- `skills/**/SKILL.md`
- root-level `SKILL.md`
- `references/`
- `scripts/`
- `assets/`

Record:

- number of skills
- whether the skills share common files
- whether the skills depend on extra scripts or assets
- whether the repo appears to be a single skill, a skill pack, or a richer plugin

### B. Platform manifests

Look for:

- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `.cursor-plugin/plugin.json`
- `.cursor-plugin/marketplace.json` (multi-plugin repos only)
- `.codex-plugin/plugin.json`
- `gemini-extension.json`
- `package.json`
- `.opencode/plugins/*.js`

Record:

- which platforms are already represented
- which manifest is richest
- whether manifests agree on metadata and component paths

### B2. Cursor-specific components

Look for:

- `rules/*.mdc` (Cursor rules with `description`, `alwaysApply`, optional `globs` frontmatter)
- `agents/*.md` (agent definitions with `name`, `description` frontmatter)
- `commands/*.md` or `commands/*.txt` (command definitions with `name`, `description` frontmatter)
- `mcp.json` (MCP server definitions at plugin root)
- `assets/logo.svg` or other logo files

Record whether any Cursor-specific component types exist that have no cross-platform equivalent.

### C. Context and instruction files

Look for:

- `CLAUDE.md`
- `AGENTS.md`
- `GEMINI.md`
- `.codex/INSTALL.md`
- other platform install guides

Record:

- whether the repo documents behavior at session start
- whether install instructions exist
- whether install instructions match the actual repo shape

### D. Runtime adapters

Look for:

- `hooks/hooks.json` (Claude Code and Cursor shared default path)
- `hooks/hooks-cursor.json` (Cursor-specific override, referenced via manifest `hooks` field)
- hook scripts in `scripts/` or `hooks/`
- `.mcp.json` or `mcp.json` (MCP server definitions — `mcp.json` is Cursor's default discovery)
- `.app.json`
- `commands/` (Cursor and Codex)
- `agents/` (Cursor agent definitions)
- `rules/*.mdc` (Cursor rules)

Record:

- which runtime components exist
- whether they are shared or platform-specific
- whether they appear portable or hard-coded to one platform
- whether Cursor hook events use the correct casing (`sessionStart`, `preToolUse`, etc.)

## Step 2: Identify the canonical metadata source

Choose the single best source of truth before describing gaps.

Use this precedence:

1. the richest complete platform manifest
2. another manifest with sufficient package metadata
3. `README.md`
4. directory name and inferred defaults

Extract at minimum:

- `name`
- `displayName`
- `description`
- `version`
- `author`
- `homepage`
- `repository`
- `license`
- `keywords`
- declared locations for `skills`, `hooks`, `agents`, `commands`, `apps`, `mcp`

If metadata conflicts across manifests, report the conflict explicitly.

## Step 3: Classify the current repo shape

Assign one primary shape.

### Shape A: Bare skill repo

Criteria:

- contains skills
- lacks meaningful plugin packaging
- may have helper files but no cross-platform manifest story

### Shape B: Single-platform plugin repo

Criteria:

- clearly targets one ecosystem
- has enough metadata to package on that platform
- lacks the corresponding parallel artifacts for other platforms

### Shape C: Multi-platform source repo

Criteria:

- contains multiple platform manifests
- keeps shared content in common directories
- already has a portability strategy, even if incomplete

### Shape D: Curated or packaged distribution

Criteria:

- appears to be a platform-specific packaged form of another upstream repo
- may not reflect the upstream authoring layout
- may include marketplace metadata not present upstream

This shape matters especially for Codex, where curated marketplace packages may differ from upstream repo structure.

## Step 4: Score portability readiness

Score each category from `0` to `3`.

### Scoring scale

- `0`: missing
- `1`: partial or fragile
- `2`: usable but incomplete
- `3`: strong and portable

### Category 1: Skill content portability

Score `3` when:

- skills are clearly organized
- shared references are colocated or explicitly referenced
- skills do not rely on undocumented platform assumptions

Score `2` when:

- content is usable but some tool naming or context assumptions are implicit

Score `1` when:

- skills exist but are tightly coupled to one environment

Score `0` when:

- the repo has no clear portable skill payload

### Category 2: Metadata quality

Score `3` when:

- name, description, version, author, and paths are explicit and internally consistent

Score `2` when:

- most metadata exists but fields are inconsistent or sparse

Score `1` when:

- metadata must be heavily inferred

Score `0` when:

- no reliable metadata source exists

### Category 3: Manifest coverage

Score `3` when:

- the repo already carries parallel manifests for major target platforms

Score `2` when:

- one or two platforms are supported well and others are straightforward to generate

Score `1` when:

- only one platform has a manifest

Score `0` when:

- there is no plugin packaging at all

### Category 4: Context and startup behavior

Score `3` when:

- the repo has the right context files or startup mechanism for each supported platform

Score `2` when:

- some context files exist, but delivery is incomplete or uneven

Score `1` when:

- startup behavior is implied, undocumented, or only works on one platform

Score `0` when:

- the plugin depends on startup behavior but provides no delivery mechanism

### Category 5: Tool mapping portability

Score `3` when:

- skill tool assumptions are documented across platforms using sidecars or equivalent guidance

Score `2` when:

- tool mappings exist for some platforms or can be added with low effort

Score `1` when:

- skills are written in one platform’s vocabulary with no portability guidance

Score `0` when:

- the repo is unusable outside its original platform due to tool assumptions

### Category 6: Runtime adapter portability

Score `3` when:

- hooks, commands, agents, MCP, and apps are either portable or clearly platform-adapted

Score `2` when:

- runtime pieces exist and are salvageable, but require adaptation

Score `1` when:

- runtime pieces are hard-coded to one platform

Score `0` when:

- runtime pieces are required but missing or unusable

### Category 7: Installation readiness

Score `3` when:

- the repo documents installation and verification clearly for each supported platform

Score `2` when:

- installation is documented for the primary platform only

Score `1` when:

- installation exists but is incomplete, misleading, or manual-only without verification

Score `0` when:

- users cannot reasonably install the repo from its documentation

## Step 5: Interpret the score

Add the seven category scores for a total out of `21`.

### Overall bands

- `18-21`: strong portability baseline
- `13-17`: viable uplift candidate with moderate work
- `8-12`: partial candidate; uplift is possible but requires structural cleanup
- `0-7`: weak baseline; assess whether the repo should first be normalized before uplift

The total score is helpful, but the recommendation must still consider blockers. A repo with a decent score may still have one critical structural problem.

## Step 6: Identify structural blockers

Blockers override the raw score.

Flag these explicitly if present:

- no trustworthy metadata source
- skills reference platform-specific tools without any translation path
- hooks hard-code one platform’s environment or schema
- install docs describe a different structure than the repo actually ships
- the repo requires whole-repo installation but documents single-skill copying
- the repo depends on features unavailable on target platforms
- upstream and packaged forms are being confused

Use these blocker levels:

- **Critical**: uplift cannot proceed safely without resolving this first
- **Major**: uplift can proceed, but the output will be partial or fragile
- **Minor**: uplift can proceed normally

## Step 7: Choose the uplift target

The assessment must end with one of these recommendations.

### Recommendation A: Skill-first uplift

Choose this when:

- the repo is mostly skills
- plugin metadata would add little value
- Codex should use native skill discovery
- user installation is better served by simple clone and skill exposure

Expected outputs:

- skill normalization
- per-skill tool mappings
- platform context files where needed
- install guidance for skill-based consumption

### Recommendation B: Full portable plugin uplift

Choose this when:

- the repo is already a plugin or clearly wants to be one
- it includes hooks, commands, agents, apps, or MCP
- users need platform-specific plugin installation paths
- Codex should be packaged as a native plugin, not only as raw skills

Expected outputs:

- parallel manifests
- context files
- hook adapters
- install docs by platform
- Codex plugin packaging if appropriate

### Recommendation C: Hybrid uplift

Choose this when:

- the repo should ship as a full plugin on some platforms
- Codex is better served by a skill-first install path
- the upstream layout should stay multi-platform without forcing one packaging model everywhere

This is the right recommendation for Superpowers-style repos.

## Step 8: Choose the Codex recommendation

Every assessment must make this explicit.

### Codex recommendation 1: Native skill discovery

Choose this when:

- the repo is a skills library
- install simplicity matters most
- Codex plugin packaging is unnecessary overhead

Required install docs:

- clone location
- `~/.agents/skills` or `~/.codex/skills` exposure path
- restart requirement
- verification step

### Codex recommendation 2: Native Codex plugin packaging

Choose this when:

- the repo should be installable as a Codex plugin
- the repo benefits from plugin metadata and marketplace registration
- the repo bundles more than plain skill content

Required install docs:

- plugin directory layout
- `.codex-plugin/plugin.json`
- repo-local or home-local `marketplace.json`
- restart or refresh step
- verification step

### Codex recommendation 3: Curated-package note only

Choose this when:

- the assessed repo is upstream source
- Codex marketplace packaging exists elsewhere
- the portability work should document the distinction rather than reproduce the curated package in-repo

This recommendation must state clearly that upstream source layout and curated Codex package layout are not the same thing.

## Required assessment report format

A future assessment skill should emit this report shape exactly.

### 1. Current shape

- primary shape
- brief explanation

### 2. Detected assets

- skills
- manifests
- context files
- runtime adapters

### 3. Canonical metadata source

- chosen source
- extracted metadata
- any conflicts

### 4. Category scores

- skill content portability
- metadata quality
- manifest coverage
- context and startup behavior
- tool mapping portability
- runtime adapter portability
- installation readiness
- total score

### 5. Blockers

- critical
- major
- minor

### 6. Uplift recommendation

- skill-first uplift, full portable plugin uplift, or hybrid uplift

### 7. Codex recommendation

- native skill discovery
- native Codex plugin packaging
- curated-package note only

### 8. Required uplift artifacts

List the concrete files that should be added or fixed.

### 9. Required installation docs

List the user-facing install instructions that must exist before the uplift is considered complete.

## Checklist version

Use this when you need a compact execution checklist.

- Identify all `SKILL.md` files.
- Identify all platform manifests.
- Identify all context files.
- Identify all hooks, agents, commands, apps, and MCP configs.
- Choose a canonical metadata source.
- Classify the repo shape.
- Score each portability category from `0` to `3`.
- Flag structural blockers.
- Choose the uplift target.
- Choose the Codex recommendation.
- List required files for uplift.
- List required install docs for users.

## Pass criteria

An assessment is complete when:

- the repo shape is classified
- the metadata source is explicit
- category scores are assigned
- blockers are named
- the uplift recommendation is explicit
- the Codex recommendation is explicit
- the required uplift artifacts are listed
- the required installation docs are listed

If any of these are missing, the assessment is incomplete.
