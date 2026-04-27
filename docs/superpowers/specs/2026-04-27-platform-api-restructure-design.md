# Platform API Restructure Design

## Goal

Replace the duplicated prose-based reference system (`platform-mappings.md` +
5 `*-tools.md` files) with a structured pseudocode library: typed platform
specifications, canonical operation vocabulary, and deterministic lookup
functions. DRY, platform-agnostic, machine-readable.

## Problem

The current `lib/references/` directory has two overlapping representations of
the same data:

1. **`platform-mappings.md`** (226 lines) — 13 cross-platform comparison tables
2. **5 `*-tools.md` files** (53–127 lines each) — per-platform narrative guides

Tool name mappings, hook events, frontmatter stripping, MCP config, context
files, and model formats all appear in both. The `*-tools.md` files have grown
beyond tool mapping into full platform reference guides covering hooks,
subagents, manifests, and distribution — duplicating content from
`platform-mappings.md` Tables 3–13.

The rubric YAML files reference `LOOKUP["table_name"]["platform"]` in 28
pseudocode comments, but there is no actual lookup engine — the "single source
of truth" claim is aspirational. Both representations must be updated manually
and kept in sync.

## Architecture

### File structure

```
lib/references/
  platform-api.md              # Type definitions, canonical enums, lookup functions
  platforms/
    claude-code.md             # PLATFORMS["claude-code"]: PlatformSpec = { ... }
    gemini-cli.md              # PLATFORMS["gemini-cli"]: PlatformSpec = { ... }
    codex.md                   # PLATFORMS["codex"]: PlatformSpec = { ... }
    cursor.md                  # PLATFORMS["cursor"]: PlatformSpec = { ... }
    antigravity.md             # PLATFORMS["antigravity"]: PlatformSpec = { ... }
    openclaw.md                # PLATFORMS["openclaw"]: PlatformSpec = { ... }
```

### Deleted files

```
lib/references/platform-mappings.md    # replaced by platform-api.md + platforms/*.md
lib/references/gemini-tools.md         # replaced by platforms/gemini-cli.md
lib/references/codex-tools.md          # replaced by platforms/codex.md
lib/references/cursor-tools.md         # replaced by platforms/cursor.md
lib/references/antigravity-tools.md    # replaced by platforms/antigravity.md
lib/references/openclaw-tools.md       # replaced by platforms/openclaw.md
```

### Relocated prose

The current `codex-tools.md` contains usage patterns (subagent message framing,
environment detection, app finishing) that are not platform metadata. These move
to `lib/patterns/`:

- Subagent message framing → `lib/patterns/subagent-dispatch.md` (new)
- Environment detection → `lib/patterns/subagent-dispatch.md`
- Codex app finishing → `lib/patterns/subagent-dispatch.md`

## Type System

### PlatformSpec

```pseudocode
TYPE PlatformSpec = {
  id:           string,       # "gemini-cli", "codex", etc.
  display_name: string,

  # ── Tools ──
  tools:        Dict[Operation, ToolEntry],
  extra_tools:  List[{ name: string, purpose: string }],

  # ── Hooks ──
  hooks: {
    system:        "file" | "sdk" | "none",
    config_path:   string | null,
    event_case:    "PascalCase" | "camelCase" | "snake_case" | null,
    timeout_unit:  "seconds" | "milliseconds" | null,
    async_support: bool,
    structure:     "nested" | "flat" | "sdk" | null,
    output_key:    string | null,
    events:        Dict[CanonicalEvent, HookEvent],
    extra_events:  List[HookEvent],
  },

  # ── Context ──
  context: {
    primary_file:    string,
    secondary_files: List[string],
    priority_note:   string | null,
  },

  # ── Skills ──
  skills: {
    path:        string,
    agents_path: string,
    invocation:  string,
  },

  # ── Manifest ──
  manifest: {
    path:            string | null,
    required_fields: List[string],
  },

  # ── Frontmatter ──
  frontmatter: {
    strip:        List[string],
    keep:         List[string],
    model_format: string | null,
  },

  # ── MCP ──
  mcp: {
    config_path: string | null,
    notes:       string | null,
  },

  # ── Path Variables ──
  paths: {
    plugin_root:   string | null,
    hooks_scripts: string | null,
  },
}

TYPE ToolEntry = {
  name:  string | null,   # null = not supported
  notes: string | null,
}

TYPE HookEvent = {
  name:      string | null,   # null = no equivalent
  can_block: bool,
  notes:     string | null,
}
```

### Canonical Enums

```pseudocode
Operation = ENUM(
  "file.read",
  "file.write",
  "file.edit",
  "shell.execute",
  "search.content",
  "search.files",
  "subagent.dispatch",
  "task.track",
  "skill.invoke",
  "web.search",
  "web.fetch",
  "user.ask",
)

CanonicalEvent = ENUM(
  "session.start",
  "tool.before",
  "tool.after",
  "tool.after_failure",
  "subagent.start",
  "subagent.stop",
  "compact.before",
  "session.stop",
  "prompt.before_submit",
)
```

## Lookup Functions

Defined in `platform-api.md`. Every function is deterministic.

```pseudocode
REGISTRY: Dict[string, PlatformSpec] = {}
  # Populated by per-platform data files.

# ── Core lookups ──

FUNCTION tool_name(platform, op)
  RETURNS the platform-native tool name for a canonical operation, or null.
  LOOKUP REGISTRY[platform].tools[op].name

FUNCTION hook_event(platform, event)
  RETURNS the platform-native hook event name, or null.
  LOOKUP REGISTRY[platform].hooks.events[event].name

FUNCTION hook_can_block(platform, event)
  RETURNS whether the hook for this event can block execution.
  entry = REGISTRY[platform].hooks.events[event]
  RETURN entry.name IS NOT null AND entry.can_block

# ── Bulk queries ──

FUNCTION supported_tools(platform)
  RETURNS list of canonical operations this platform supports.
  FOR EACH op, entry IN REGISTRY[platform].tools:
    INCLUDE op WHERE entry.name IS NOT null

FUNCTION unsupported_tools(platform)
  RETURNS list of canonical operations this platform cannot perform.
  FOR EACH op, entry IN REGISTRY[platform].tools:
    INCLUDE op WHERE entry.name IS null

FUNCTION has_hooks(platform)
  RETURN REGISTRY[platform].hooks.system != "none"

FUNCTION strip_fields(platform)
  RETURN REGISTRY[platform].frontmatter.strip

# ── Cross-platform ──

FUNCTION platforms_supporting(op)
  RETURNS all platform IDs that support a given operation.
  FOR EACH pid, spec IN REGISTRY:
    INCLUDE pid WHERE spec.tools[op].name IS NOT null

FUNCTION tool_mapping_table(op)
  RETURNS { platform_id: tool_name } for one operation across all platforms.
  Replaces old platform-mappings.md Table 2 rows.
  FOR EACH pid, spec IN REGISTRY:
    EMIT pid → spec.tools[op].name

FUNCTION diff_from(source, target)
  RETURNS what changes when porting from source to target platform.
  src = REGISTRY[source]
  tgt = REGISTRY[target]
  renamed_tools:
    FOR EACH op IN Operation
      WHERE src.tools[op].name != tgt.tools[op].name
        AND tgt.tools[op].name IS NOT null:
      EMIT op → { from: src.tools[op].name, to: tgt.tools[op].name }
  lost_tools:
    FOR EACH op IN Operation
      WHERE src.tools[op].name IS NOT null
        AND tgt.tools[op].name IS null:
      EMIT op
  strip_fields: tgt.frontmatter.strip
  model_format: tgt.frontmatter.model_format
```

## Consumer Migration

### GEMINI.md @includes

**Before:**
```
@./lib/references/gemini-tools.md
@./lib/references/codex-tools.md
@./lib/references/cursor-tools.md
@./lib/references/antigravity-tools.md
@./lib/references/openclaw-tools.md
```

**After:**
```
@./lib/references/platform-api.md
@./lib/references/platforms/gemini-cli.md
@./lib/references/platforms/codex.md
@./lib/references/platforms/cursor.md
@./lib/references/platforms/antigravity.md
@./lib/references/platforms/openclaw.md
```

### AGENTS.md pointers

Update the tool references section to list the new paths and describe the
lookup function API.

### Rubric YAML conditions

All 28 `LOOKUP["table_name"]["platform"]` comments become function calls:

**Before:**
```yaml
condition: |
  # LOOKUP["tool_mapping"]["codex"]["Edit"] = "apply_patch"
  sidecars = glob("**/codex-tools.md")
  assert len(sidecars) > 0, "No codex-tools.md found"
```

**After:**
```yaml
condition: |
  # tool_name("codex", "file.edit") = "apply_patch"
  tool_ref = find_platform_spec("codex")
  assert tool_ref IS NOT null, "No Codex platform spec found"
```

The specific LOOKUP-to-function mappings:

| Old LOOKUP | New function call |
|------------|-------------------|
| `LOOKUP["tool_mapping"]["platform"]["Read"]` | `tool_name(platform, "file.read")` |
| `LOOKUP["tool_mapping"]["platform"]["Edit"]` | `tool_name(platform, "file.edit")` |
| `LOOKUP["tool_mapping"]["platform"]["Task"]` | `tool_name(platform, "subagent.dispatch")` |
| `LOOKUP["tool_mapping"]["platform"]["TodoWrite"]` | `tool_name(platform, "task.track")` |
| `LOOKUP["manifest_required_fields"]["platform"]` | `REGISTRY[platform].manifest.required_fields` |
| `LOOKUP["field_stripping"]["platform"]` | `strip_fields(platform)` |
| `LOOKUP["hook_events"]["platform"]` | `hook_event(platform, event)` |
| `LOOKUP["model_mapping"]["platform"]` | `REGISTRY[platform].frontmatter.model_format` |
| `LOOKUP["path_variables"]["platform"]` | `REGISTRY[platform].paths.plugin_root` |
| `LOOKUP["hook_format_rules"]["platform"]` | `REGISTRY[platform].hooks.*` (individual fields) |
| `LOOKUP["agent_output_format"]["platform"]` | `REGISTRY[platform].skills.agents_path` + `REGISTRY[platform].frontmatter.*` |

### CI workflow

Update `.github/workflows/ci.yml` to check for the new file paths:

```yaml
# Before: checks lib/references/{codex,gemini,cursor,antigravity,openclaw}-tools.md
# After:  checks lib/references/platforms/{codex,gemini-cli,cursor,antigravity,openclaw}.md
```

### Patterns

- `lib/patterns/inventory.md` — update `sidecar_files` list to reference
  `platforms/*.md`
- `lib/patterns/injection-checks.md` — update Component 2 to reference
  `lib/references/platforms/gemini-cli.md`
- `lib/patterns/bootstrapping.md` — update sidecar references to shared
  platform specs

### Prose relocation

Move these sections from `codex-tools.md` to a new
`lib/patterns/subagent-dispatch.md`:

1. **Named agent dispatch** — how to map named Claude Code agent types to
   Codex's generic `spawn_agent` with worker roles
2. **Message framing** — the XML-tag wrapping pattern for instruction adherence
3. **Environment detection** — git worktree/detached-HEAD checks
4. **Codex app finishing** — what to do when sandbox blocks branch/push

These are usage patterns consumed by skill pseudocode, not platform metadata.

## Scope

### In scope

- Create `lib/references/platform-api.md` (type system + functions)
- Create 6 `lib/references/platforms/*.md` files (one per platform)
- Create `lib/patterns/subagent-dispatch.md` (relocated prose)
- Delete 6 old files from `lib/references/`
- Update all consumers: GEMINI.md, AGENTS.md, CLAUDE.md, 6 rubric YAMLs,
  CI workflow, 3 pattern files, CONTRIBUTING.md, rubric-framework.md
- Update reconciliation matrix

### Out of scope

- Changing the rubric scoring logic (only updating references/comments)
- Changing the skill SKILL.md pseudocode (only updating external references)
- Research doc updates (`docs/platforms/*.md` are the upstream source, unchanged)
- Template changes (templates reference patterns, not the reference files directly)
