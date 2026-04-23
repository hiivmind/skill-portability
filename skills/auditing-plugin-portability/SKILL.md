---
name: auditing-plugin-portability
description: >
  Check a plugin for multi-platform portability gaps without making changes.
  Accepts any starting state. Reports PRESENT or MISSING for every platform
  artifact including session-start bootstrapping infrastructure.
allowed-tools: Read, Glob, Grep
inputs:
  - name: plugin_path
    type: string
    required: true
    description: Path to the plugin root directory
outputs:
  - name: audit
    type: object
    description: Complete portability audit with per-file status
---

# Auditing Plugin Portability

Inspect a plugin repo and report portability gaps across all platforms. Makes no changes.
No platform is assumed to already be present — Claude Code manifests are checked just like
Cursor or Gemini manifests.

> **Detection Algorithm:** `lib/patterns/detection-algorithm.md`
> **Injection Checks:** `patterns/injection-checks.md`

---

## Overview

| Phase | Description |
|-------|-------------|
| **Phase 1: Detect** | Run shared detection algorithm, infer metadata |
| **Phase 2: Audit** | Check manifests, sidecars, context files, hooks, injection |
| **Phase 3: Report** | Print full audit report |

**Minimum starting state:** At least one `skills/*/SKILL.md` with `name` + `description`
frontmatter, or any platform manifest file.

---

## Phase 1: Detect

### Step 1.1: Scan and Infer

```pseudocode
DETECT(plugin_path):
  # See lib/patterns/detection-algorithm.md
  computed.sources = scan_metadata_sources(plugin_path)

  IF len(computed.sources) == 0:
    DISPLAY "No recognisable plugin signals found in {plugin_path}."
    EXIT

  computed.canonical = elect_canonical(computed.sources)
  computed.metadata = build_metadata_model(computed.sources)
  computed.skills = Glob(plugin_path + "/skills/*/SKILL.md")
  print_inference_summary(computed.metadata, computed.canonical)
```

---

## Phase 2: Audit

### Step 2.1: Check Platform Manifests

```pseudocode
AUDIT_MANIFESTS(computed):
  checks = [
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    ".cursor-plugin/plugin.json",
    "gemini-extension.json",
    "GEMINI.md",
    "AGENTS.md",
    "CLAUDE.md",
    "package.json",
    ".opencode/plugins/" + computed.metadata.name + ".js",
    "hooks/hooks-cursor.json",
    "hooks/run-hook.cmd"
  ]

  computed.manifest_results = []
  FOR path IN checks:
    status = IF file_exists(path) THEN "PRESENT" ELSE "MISSING"
    computed.manifest_results.append({ path: path, status: status })
```

### Step 2.2: Check Per-Skill Sidecars

```pseudocode
AUDIT_SIDECARS(computed):
  platforms = ["copilot-tools.md", "codex-tools.md", "gemini-tools.md"]
  computed.sidecar_results = []
  FOR skill IN computed.skills:
    FOR platform IN platforms:
      target = "skills/" + skill.name + "/references/" + platform
      status = IF file_exists(target) THEN "PRESENT" ELSE "MISSING"
      computed.sidecar_results.append({ skill: skill.name, file: platform, status: status })
```

### Step 2.3: Check Context File Completeness

```pseudocode
AUDIT_CONTEXT_FILES(computed):
  computed.context_results = []

  IF file_exists("GEMINI.md"):
    content = Read("GEMINI.md")
    FOR skill IN computed.skills:
      IF "@./skills/" + skill.name + "/SKILL.md" NOT IN content:
        computed.context_results.append("GEMINI.md missing include for " + skill.name)
      IF "@./skills/" + skill.name + "/references/gemini-tools.md" NOT IN content:
        computed.context_results.append("GEMINI.md missing gemini-tools include for " + skill.name)
  ELSE:
    computed.context_results.append("GEMINI.md: MISSING — cannot check includes")

  IF file_exists("AGENTS.md"):
    content = Read("AGENTS.md")
    FOR skill IN computed.skills:
      IF "skills/" + skill.name + "/SKILL.md" NOT IN content:
        computed.context_results.append("AGENTS.md missing reference for " + skill.name)
  ELSE:
    computed.context_results.append("AGENTS.md: MISSING — cannot check skill references")
```

### Step 2.4: Check Frontmatter Compatibility

```pseudocode
AUDIT_FRONTMATTER(computed):
  computed.frontmatter_results = []
  FOR skill IN computed.skills:
    frontmatter = parse_yaml_frontmatter(skill.content)
    IF frontmatter.name AND frontmatter.description:
      status = "COMPATIBLE"
    ELSE:
      status = "MISSING FRONTMATTER"
    computed.frontmatter_results.append({ skill: skill.name, status: status })
```

### Step 2.5: Check Hooks

```pseudocode
AUDIT_HOOKS(computed):
  IF file_exists("hooks/hooks.json"):
    computed.hook_status = "PRESENT"
    IF NOT file_exists("hooks/hooks-cursor.json"):
      computed.hook_issues = ["hooks/hooks-cursor.json: MISSING"]
    IF NOT file_exists("hooks/run-hook.cmd"):
      computed.hook_issues = ["hooks/run-hook.cmd: MISSING"]
  ELSE:
    computed.hook_status = "MISSING — no hooks to port"
    computed.hook_issues = []
```

### Step 2.6: Check Session-Start Injection

See `patterns/injection-checks.md` for the 8-component verification.

```pseudocode
AUDIT_INJECTION(computed):
  using_path = "skills/using-" + computed.metadata.name + "/SKILL.md"
  IF NOT file_exists(using_path):
    computed.injection_status = "NOT CONFIGURED"
    RETURN

  computed.injection_results = check_injection_components(computed)
  computed.injection_summary = compute_injection_summary(computed.injection_results)
```

---

## Phase 3: Report

### Step 3.1: Print Report

```
# Portability Audit: {computed.metadata.name} v{computed.metadata.version}
Metadata inferred from: {computed.canonical.path}

## Platform manifests
{FOR r IN computed.manifest_results}
{r.status}  {r.path}
{/FOR}

## Skill sidecars
{FOR skill_group IN computed.sidecar_results grouped by skill}
skills/{skill_group.skill}/
  {FOR r IN skill_group.results}
  {r.status}  references/{r.file}
  {/FOR}
{/FOR}

## npx skills compatibility
{FOR r IN computed.frontmatter_results}
skills/{r.skill}/SKILL.md   {r.status}
{/FOR}

## Context file completeness
{FOR issue IN computed.context_results}
{issue}
{/FOR}

## Hooks
hooks/hooks.json: {computed.hook_status}
{FOR issue IN computed.hook_issues}
  {issue}
{/FOR}

## Session-start injection
{IF computed.injection_status == "NOT CONFIGURED"}
Not configured (no using-{name} skill found)
{ELSE}
{FOR r IN computed.injection_results}
{r.component}  {r.status}
{/FOR}
Session-start injection: {computed.injection_summary}
{/IF}

## Summary
{present} files present, {missing} missing.
{compatible} skills npx-compatible, {incompatible} missing frontmatter.
Session-start injection: {computed.injection_summary}
Run the uplifting-a-plugin skill to generate all missing files automatically.
```

---

## State Flow

```
Phase 1          Phase 2                      Phase 3
──────────────────────────────────────────────────────
computed         computed.manifest_results    Report
 .sources         .sidecar_results           (displayed)
 .canonical       .context_results
 .metadata        .frontmatter_results
 .skills          .hook_status
                  .injection_results
                  .injection_summary
```

---

## Reference Documentation

- **Detection Algorithm:** `lib/patterns/detection-algorithm.md` (shared)
- **Injection Checks:** `patterns/injection-checks.md` (local)

---

## Related Skills

- **Uplift plugin:** `skills/uplifting-a-plugin/SKILL.md`
