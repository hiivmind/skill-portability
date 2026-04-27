# Consolidated Inventory Pattern

Referenced by `skills/plugin-portability/SKILL.md`. Merges the assessment
skill's 7 inventory substeps with the uplift skill's asset discovery and
conflict detection into a single pass.

```pseudocode
INVENTORY(plugin_path, computed):

  ## 2.1 Discover Assets
  ## Glob skills, parse frontmatter, collect agents/commands/hooks.
  raw_skills = Glob(plugin_path + "/skills/*/SKILL.md")
  computed.skills = [
    { path: s, dir: dirname(s), name: basename(dirname(s)),
      frontmatter: parse_yaml_frontmatter(Read(s)) }
    FOR s IN raw_skills
  ]
  computed.commands = Glob(plugin_path + "/commands/*.md")
  computed.agents   = Glob(plugin_path + "/agents/*.md")
  computed.existing_hooks = read_json_if_exists(plugin_path + "/hooks/hooks.json")

  computed.created = []   # { path, platform }
  computed.skipped = []   # { path, platform }
  computed.flagged = []   # strings

  ## 2.2 Check Platform Manifests
  ## 10 paths across 6 platforms. Record { platform, path, status }.
  manifest_checks = [
    { platform: "claude-code",  path: ".claude-plugin/plugin.json" },
    { platform: "claude-code",  path: ".claude-plugin/marketplace.json" },
    { platform: "cursor",       path: ".cursor-plugin/plugin.json" },
    { platform: "cursor",       path: ".cursor-plugin/marketplace.json" },
    { platform: "gemini-cli",   path: "gemini-extension.json" },
    { platform: "codex",        path: ".codex-plugin/plugin.json" },
    { platform: "codex",        path: ".agents/plugins/marketplace.json" },
    { platform: "antigravity",  path: "package.json" },
    { platform: "openclaw",     path: "openclaw.plugin.json" },
  ]

  computed.manifest_results = []
  FOR check IN manifest_checks:
    status = IF file_exists(plugin_path + "/" + check.path) THEN "PRESENT" ELSE "MISSING"
    computed.manifest_results.append({ platform: check.platform, path: check.path, status: status })

  ## 2.3 Check Context Files
  ## 7 checks: CLAUDE.md, AGENTS.md x4, GEMINI.md x2.
  context_checks = [
    { platform: "claude-code",  path: "CLAUDE.md" },
    { platform: "cursor",       path: "AGENTS.md" },
    { platform: "gemini-cli",   path: "GEMINI.md" },
    { platform: "codex",        path: "AGENTS.md" },
    { platform: "antigravity",  path: "AGENTS.md" },
    { platform: "antigravity",  path: "GEMINI.md" },
    { platform: "openclaw",     path: "AGENTS.md" },
  ]

  computed.context_results = []
  FOR check IN context_checks:
    status = IF file_exists(plugin_path + "/" + check.path) THEN "PRESENT" ELSE "MISSING"
    computed.context_results.append({ platform: check.platform, path: check.path, status: status })

  ## 2.4 Check Tool Reference Sidecars
  ## Shape-aware: bare-skill repos need per-skill sidecars (no context file to carry
  ## shared references). Plugin repos can use shared references via context files.
  sidecar_files = ["codex-tools.md", "gemini-tools.md", "cursor-tools.md",
                   "antigravity-tools.md", "openclaw-tools.md"]
  computed.sidecar_results = []

  IF computed.shape IN ["bare-skill-repo", "skill-first"]:
    # Bare skills need per-skill sidecars — no context file to carry shared refs
    FOR skill IN computed.skills:
      FOR sidecar IN sidecar_files:
        target = "skills/" + skill.dir + "/references/" + sidecar
        status = IF file_exists(plugin_path + "/" + target) THEN "PRESENT" ELSE "MISSING"
        computed.sidecar_results.append({ skill: skill.dir, file: sidecar, status: status })

  ELIF computed.shape == "full-portable-plugin":
    # Plugins have context files — check shared references instead
    shared_paths = ["lib/references/", "references/"]
    FOR sidecar IN sidecar_files:
      found = false
      FOR shared IN shared_paths:
        IF file_exists(plugin_path + "/" + shared + sidecar):
          found = true
          computed.sidecar_results.append({ skill: "(shared)", file: shared + sidecar, status: "PRESENT" })
          BREAK
      IF NOT found:
        computed.sidecar_results.append({ skill: "(shared)", file: sidecar, status: "MISSING" })

  ## 2.5 Check Frontmatter Compatibility
  ## name and description are required for all platforms.
  computed.frontmatter_results = []
  FOR skill IN computed.skills:
    fm = skill.frontmatter
    IF fm.name AND fm.description:
      status = "COMPATIBLE"
    ELSE:
      missing = []
      IF NOT fm.name:        missing.append("name")
      IF NOT fm.description: missing.append("description")
      status = "MISSING: " + join(missing, ", ")
    computed.frontmatter_results.append({ skill: skill.dir, status: status })

  ## 2.6 Check Hooks
  ## Read hooks.json and hooks-cursor.json contents for later phases.
  hook_paths = [
    { path: "hooks/hooks.json",        key: "claude_hooks" },
    { path: "hooks/hooks-cursor.json", key: "cursor_hooks" },
  ]

  computed.hook_results = []
  FOR hp IN hook_paths:
    full = plugin_path + "/" + hp.path
    IF file_exists(full):
      computed[hp.key] = read_json(full)
      computed.hook_results.append({ path: hp.path, status: "PRESENT" })
    ELSE:
      computed[hp.key] = NULL
      computed.hook_results.append({ path: hp.path, status: "MISSING" })

  ## 2.7 Check Session-Start Injection
  ## Delegate to injection-checks.md for the 8-component verification.
  using_path = "skills/using-" + computed.metadata.name + "/SKILL.md"
  IF file_exists(plugin_path + "/" + using_path):
    computed.injection_results = check_injection_components(computed)   # see injection-checks.md
    computed.injection_status  = compute_injection_summary(computed.injection_results)
  ELSE:
    computed.injection_results = NULL
    computed.injection_status  = "NOT CONFIGURED"

  ## 2.8 Collect Existing Files for Conflict Detection
  ## Union of all PRESENT paths from 2.2, 2.3, 2.4, 2.6.
  computed.existing_files = []
  FOR r IN computed.manifest_results:
    IF r.status == "PRESENT":
      computed.existing_files.append({ path: r.path, platform: r.platform })
  FOR r IN computed.context_results:
    IF r.status == "PRESENT":
      computed.existing_files.append({ path: r.path, platform: r.platform })
  FOR r IN computed.sidecar_results:
    IF r.status == "PRESENT":
      p = "skills/" + r.skill + "/references/" + r.file
      computed.existing_files.append({ path: p, platform: sidecar_platform(r.file) })
  FOR r IN computed.hook_results:
    IF r.status == "PRESENT":
      computed.existing_files.append({ path: r.path, platform: hook_platform(r.path) })

  # Any file that already exists will be skipped during generation (idempotent).
  computed.skipped = computed.existing_files
```

## Helper References

| Helper | Defined in |
|--------|-----------|
| `parse_yaml_frontmatter` | inline — read between `---` markers |
| `check_injection_components` | `lib/patterns/injection-checks.md` |
| `sidecar_platform(file)` | `"gemini-tools.md" → "gemini-cli"`, `"codex-tools.md" → "codex"` |
| `hook_platform(path)` | `"hooks.json" → "claude-code"`, `"hooks-cursor.json" → "cursor"` |
