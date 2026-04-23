# Detection Algorithm

Shared by `uplifting-a-plugin` and `auditing-plugin-portability`. Run once at start.

---

## Step D1: Scan for Metadata Sources

```
FUNCTION SCAN_METADATA_SOURCES(plugin_path):

  source_definitions = [
    {
      path:   ".claude-plugin/plugin.json",
      fields: ["name", "description", "version", "author.name",
               "author.email", "homepage", "repository", "license", "keywords"]
    },
    {
      path:   ".cursor-plugin/plugin.json",
      fields: ["name", "displayName", "description", "version", "author.name",
               "author.email", "homepage", "repository", "license", "keywords"]
    },
    {
      path:   "gemini-extension.json",
      fields: ["name", "description", "version"]
    },
    {
      path:   "package.json",
      fields: ["name", "version", "description"]
    },
    {
      path:   "AGENTS.md",
      fields: ["name",        # from first "# Heading" line
               "description"] # from first non-heading paragraph
    },
    {
      path:   "skills/*/SKILL.md",   # glob — one entry per matched file
      fields: ["name",               # YAML "name:" field, or skill dir name as fallback
               "description"]        # YAML "description:" field
    }
  ]

  found_sources = []

  FOR source IN source_definitions:
    IF file_exists(plugin_path / source.path):
      data   = parse_fields(plugin_path / source.path, source.fields)
      score  = count_populated_fields(data)
      found_sources.append({ path: source.path, fields: source.fields,
                             data: data, score: score })

  IF found_sources IS EMPTY:
    STOP with error:
      "No recognisable plugin signals found in `<plugin_path>`.
       Provide at least one platform manifest or one `skills/*/SKILL.md`
       with `name` and `description` frontmatter."

  RETURN found_sources
```

---

## Step D2: Score and Elect Canonical Source

```
FUNCTION ELECT_CANONICAL(found_sources):

  # Tie-breaking order when scores are equal (index 0 = highest priority)
  tie_break_order = [
    ".claude-plugin/plugin.json",
    ".cursor-plugin/plugin.json",
    "gemini-extension.json",
    "package.json",
    "AGENTS.md",
    # first skills/*/SKILL.md alphabetically by directory name
  ]

  sorted_sources = SORT found_sources BY:
    PRIMARY   score          DESCENDING
    SECONDARY tie_break_order index  ASCENDING
      # for skills/*/SKILL.md ties: sort alphabetically by skill directory name

  canonical = sorted_sources[0]
  remaining = sorted_sources[1:]

  RETURN canonical, remaining
```

---

## Step D3: Build Canonical Metadata Model

```
FUNCTION BUILD_METADATA_MODEL(canonical, remaining):

  hard_fallbacks = {
    "name":         basename(plugin_path),          # directory basename
    "displayName":  title_case(name),               # replace - and _ with spaces,
                                                    # capitalise each word
    "description":  "",      # flag as missing
    "version":      "0.1.0",
    "author.name":  "",      # flag as missing
    "author.email": "",      # flag as missing
    "homepage":     "",
    "repository":   "",
    "license":      "MIT",
    "keywords":     []
  }

  model = COPY canonical.data

  FOR field IN hard_fallbacks.keys():
    IF model[field] IS EMPTY OR ABSENT:
      # Gap-fill from remaining sources in descending score order
      FOR source IN remaining:
        IF source.data[field] IS NOT EMPTY:
          model[field] = source.data[field]
          model[field + ".source"] = source.path
          BREAK
      # If still empty after all sources, apply hard fallback
      IF model[field] IS STILL EMPTY OR ABSENT:
        model[field] = hard_fallbacks[field]
        model[field + ".source"] = "hard_fallback"

  # Always derived — never read from any source
  model["marketplaceName"] = model["name"] + "-dev"
  model["opencodeMain"]    = ".opencode/plugins/" + model["name"] + ".js"

  RETURN model
```

---

## Step D4: Print Inference Summary

```
FUNCTION PRINT_INFERENCE_SUMMARY(canonical, model):

  PRINT "## Metadata inferred"
  PRINT "  canonical source: <canonical.path>  (<canonical.score> fields)"

  FOR field IN ["name", "description", "version", "author.name", "author.email",
                "homepage", "repository", "license", "keywords"]:
    value  = model[field]
    source = model[field + ".source"]

    IF source == "hard_fallback" AND value == "" OR value == []:
      PRINT "  <field>:  [missing — not found in any source]"
    ELSE IF source == "hard_fallback":
      PRINT "  <field>:  <value>  (hard fallback)"
    ELSE:
      PRINT "  <field>:  <value>  (from <source>)"
```

Example output:

```
## Metadata inferred
  canonical source: .claude-plugin/plugin.json  (9 fields)
  name:          my-plugin        (from .claude-plugin/plugin.json)
  description:   Does X for Y.   (from .claude-plugin/plugin.json)
  version:       1.2.0            (from .cursor-plugin/plugin.json)
  author.name:   [missing — not found in any source]
  author.email:  [missing — not found in any source]
  homepage:                       (empty string — not found)
  repository:                     (empty string — not found)
  license:       MIT              (hard fallback)
  keywords:      []               (hard fallback)
```

Fields still missing after all sources are checked are flagged here and repeated
in the final report.
