# Skill Portability

Make any plugin fully portable across all platforms. Accepts Claude Code, Cursor, Gemini, Codex, Antigravity, OpenClaw, or bare SKILL.md repos as input. Emits every missing platform artifact.

This plugin is loaded via Claude Code's plugin system. Skills are invoked via the `Skill` tool.

## Platform Accuracy Constraint

Every platform-specific claim in this repo (tool names, hook events, manifest
fields, context files, install commands) must be consistent with the researched
platform reference docs. Before changing any file that makes platform-specific
claims, cross-reference:

1. **Research docs** — `docs/platforms/*.md` (sourced, with inline citations)
2. **Reconciliation matrix** — `docs/reconciliation-matrix.md` (tracks known
   discrepancies and their fix status)
3. **Canonical lookup tables** — `lib/references/platform-mappings.md` (single
   source of truth consumed by rubrics)

If you find a conflict between these sources, trust the researched platform docs
(they have citations). Update the reconciliation matrix when fixing discrepancies
or discovering new ones.
