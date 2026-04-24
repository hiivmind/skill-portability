# Copilot CLI Scoring Rules

Platform-specific scoring criteria for the 7-category rubric.
See `lib/patterns/rubric-framework.md` for the shared scoring scale.

---

## Artifact Checklist

| File | Category |
|------|----------|
| `.github/copilot-instructions.md` | Manifest Packaging |
| `.github/instructions/*.instructions.md` | Context Delivery |
| `.github/agents/*.agent.md` | Runtime Adapters |
| `.github/hooks/*.json` | Hook Portability |
| `.github/skills/` | Skill Compatibility |
| `references/copilot-tools.md` | Tool Mapping |

---

## Category 1: Manifest Packaging

Score 3 when:
- `.github/copilot-instructions.md` present with complete repo-wide instructions
- Platform context files (AGENTS.md, CLAUDE.md, GEMINI.md) recognized and read
- Skills discoverable from `.github/skills/<name>/SKILL.md` or cross-platform `skills/`
- Sidecar `references/copilot-tools.md` documents tool mapping

Score 2 when:
- `.github/copilot-instructions.md` exists but incomplete
- Some context files recognized but not all
- Skills discoverable but sidecar incomplete

Score 1 when:
- Minimal or sparse Copilot instructions
- Limited context file recognition
- Sidecar missing or minimal

Score 0 when:
- No `.github/copilot-instructions.md`
- No recognizable Copilot structure

---

## Category 2: Skill Compatibility

Score 3 when:
- Standard SKILL.md format with proper frontmatter
- Skills discoverable from `.github/skills/<name>/SKILL.md` or cross-platform `skills/`
- `references/copilot-tools.md` sidecar present documenting Copilot tool mapping
- Tool usage clear with no unresolved assumptions

Score 2 when:
- Skills properly formatted but discovery paths inconsistent
- Sidecar exists but incomplete mapping
- Most tool usage clear but 1-2 references unclear

Score 1 when:
- Skills present but with inconsistent frontmatter
- Sidecar minimal or missing
- Tool usage partially unclear

Score 0 when:
- No skills found
- No sidecar documentation

---

## Category 3: Context Delivery

Score 3 when:
- `.github/copilot-instructions.md` repo-wide instructions complete
- Path-specific `.github/instructions/*.instructions.md` present for subdivisions
- Reads AGENTS.md, CLAUDE.md, GEMINI.md as available context
- All skills referenced with context requirements
- Context accurate and up-to-date

Score 2 when:
- Repo-wide instructions present but incomplete
- Path-specific instructions partially populated
- Context mostly covers main skills
- Minor gaps or outdated sections

Score 1 when:
- Minimal repo-wide instructions
- Limited or no path-specific instructions
- Context sparse or incomplete

Score 0 when:
- No `.github/copilot-instructions.md`
- No context structure present

---

## Category 4: Hook Portability

Score 3 when:
- `.github/hooks/*.json` files present with correct format
- Separate `bash` and `powershell` fields (no `command` field)
- No `matcher` field (Copilot uses `preToolUse` blocks only)
- Event names match Copilot spec (`preToolUse`)
- Cross-platform scripts with proper shell selection

Score 2 when:
- Hook files present but mixing `command` and platform-specific fields
- Mostly correct event names with minor inconsistencies
- Scripts mostly portable

Score 1 when:
- Minimal hook configuration
- Event names partially incorrect
- Scripts platform-specific without clear adaption

Score 0 when:
- No hook files present
- Hooks unusable on Copilot

---

## Category 5: Tool Mapping

Score 3 when:
- `references/copilot-tools.md` thoroughly documents Copilot tool mapping:
  - Claude Code `Read` -> Copilot `view`
  - Claude Code `Write` -> Copilot `create`
  - Claude Code `Edit` -> Copilot `edit` (or `apply_patch` for patches)
  - Claude Code `Bash` -> Copilot `bash` or `powershell`
- All skills reviewed for tool consistency
- Mapping complete and clear

Score 2 when:
- Reference document exists but incomplete mappings
- Most tools correctly mapped but 1-2 unclear
- Limited documentation

Score 1 when:
- Minimal tool mapping documentation
- Some tool usage implicit
- Limited reference material

Score 0 when:
- No tool mapping sidecar
- Tool usage unresolved

---

## Category 6: Install Readiness

Score 3 when:
- README documents `gh skill install` command
- Auto-discovery from `skills/` directory documented
- Local install to `~/.copilot/skills/` documented
- Verification steps included
- Paths match actual repository structure

Score 2 when:
- Install documented for one method (gh command or local)
- Instructions lack verification steps
- Minor path discrepancies

Score 1 when:
- Minimal install documentation
- Instructions incomplete or partially inaccurate
- No verification guidance

Score 0 when:
- No install documentation
- Instructions severely inaccurate

---

## Category 7: Runtime Adapters

Score 3 when:
- `.github/agents/*.agent.md` present with mandatory `description` field plus name
- `tools` allowlist documented per agent
- `target` field properly specified
- `.github/hooks/*.json` with proper bash/powershell separation
- All adapters follow Copilot conventions

Score 2 when:
- `agents/` present but missing `description` on some agents
- `tools` allowlist partially defined
- Hooks present but incomplete platform coverage

Score 1 when:
- Minimal agent definitions
- `description` field missing or inconsistent
- Hooks incomplete or partially configured

Score 0 when:
- No agents or hooks present
- Runtime configuration missing

