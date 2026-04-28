# Skill Portability

Make any plugin fully portable across all platforms. Accepts Claude Code, Cursor, Gemini, Codex, Antigravity, OpenClaw, or bare SKILL.md repos as input. Emits every missing platform artifact.

## Skills

@./skills/using-plugin-portability/SKILL.md
@./skills/plugin-portability/SKILL.md

## Platform API

@./lib/references/platform-api.md
@./lib/references/platforms/gemini-cli.md
@./lib/references/platforms/codex.md
@./lib/references/platforms/cursor.md
@./lib/references/platforms/antigravity.md
@./lib/references/platforms/openclaw.md

## Platform Accuracy Constraint

Every platform-specific claim in this repo must be consistent with the researched
platform reference docs. Before changing any file that makes platform-specific
claims, cross-reference:

1. **Research docs** — `docs/platforms/*.md` (sourced, with inline citations)
2. **Reconciliation matrix** — `docs/reconciliation-matrix.md` (tracks known
   discrepancies and their fix status)
3. **Platform API** — `lib/references/platform-api.md` and `lib/references/platforms/*.md`
   (structured PlatformSpec dictionaries consumed by rubrics)

If you find a conflict between these sources, trust the researched platform docs
(they have citations). Update the reconciliation matrix when fixing discrepancies
or discovering new ones.
