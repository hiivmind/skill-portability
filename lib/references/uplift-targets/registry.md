# Uplift Target Registry

Structured data and lookup functions for uplift target behavior.
Each target defines which rubric categories it generates artifacts for
and how tool-mapping sidecars are organized.

---

## Type

```pseudocode
TYPE UpliftTarget = {
  id:                 string,
  description:        string,
  allowed_categories: List[string],
  sidecar_strategy:   "per-skill" | "shared" | "none",
}
```

---

## Data

```pseudocode
UPLIFT_TARGETS: Dict[string, UpliftTarget] = {
  "skill-first": {
    id: "skill-first",
    description: "Sidecars, tool mapping, context files only.",
    allowed_categories: ["2_skills", "3_context", "5_toolmap", "6_install"],
    sidecar_strategy: "per-skill",
  },
  "full-portable-plugin": {
    id: "full-portable-plugin",
    description: "Manifests, context, hooks, install docs — everything.",
    allowed_categories: ["1_manifest", "2_skills", "3_context", "4_hooks",
                         "5_toolmap", "6_install", "7_runtime"],
    sidecar_strategy: "shared",
  },
  "curated-note-only": {
    id: "curated-note-only",
    description: "Documentation only. No generated artifacts.",
    allowed_categories: ["6_install"],
    sidecar_strategy: "none",
  },
}
```

---

## Lookup Functions

```pseudocode
FUNCTION allowed_categories(uplift_target)
  RETURNS list of category IDs this target generates artifacts for.
  RETURN UPLIFT_TARGETS[uplift_target].allowed_categories

FUNCTION sidecar_strategy(uplift_target)
  RETURNS how tool-mapping sidecars are organized for this target.
  RETURN UPLIFT_TARGETS[uplift_target].sidecar_strategy
```
