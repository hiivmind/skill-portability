# Codex Scoring Rules

Platform-specific scoring criteria for the 7-category rubric.
See `lib/patterns/rubric-framework.md` for the shared scoring scale.

---

## Artifact Checklist (Skill-Discovery Path)

| File | Category |
|------|----------|
| `AGENTS.md` | Manifest Packaging |
| `.codex/INSTALL.md` | Install Readiness |
| `AGENTS.md` | Context Delivery |
| Standard SKILL.md | Skill Compatibility |
| `references/codex-tools.md` | Tool Mapping |

---

## Artifact Checklist (Native Plugin Path)

| File | Category |
|------|----------|
| `.codex-plugin/plugin.json` | Manifest Packaging |
| `.codex-plugin/marketplace.json` | Manifest Packaging |
| `AGENTS.md` | Context Delivery |
| Standard SKILL.md | Skill Compatibility |
| `references/codex-tools.md` | Tool Mapping |

---

## Category 1: Manifest Packaging

Score 3 when:
- **Skill-discovery path**: `AGENTS.md` present listing all agents/skills, `.codex/INSTALL.md` documents consumption as skill symlink
- **Native plugin path**: `.codex-plugin/plugin.json` present with name, version, description, author; `.codex-plugin/marketplace.json` with complete plugin entries
- Chosen path is explicitly documented
- No ambiguity between paths

Score 2 when:
- One manifest path present but other path missing or incomplete
- Chosen path documented but with gaps
- Some fields incomplete

Score 1 when:
- Manifest present but chosen path unclear
- Fields incomplete across both paths
- Limited documentation of consumption method

Score 0 when:
- Neither manifest path complete
- No clear consumption model documented

---

## Category 2: Skill Compatibility

Score 3 when:
- Standard SKILL.md format with proper frontmatter
- `references/codex-tools.md` sidecar present documenting Codex tool mapping
- Tool names clear with special handling:
  - `spawn_agent` replaces Claude Code `Task` (not `Task` tool name)
  - `update_plan` replaces Claude Code `TodoWrite` (not `TodoWrite`)
- Message framing for subagent communication documented
- No unresolved tool assumptions

Score 2 when:
- Skills properly formatted but sidecar incomplete
- Most tool usage clear but Agent/Plan substitutions partially documented
- Message framing partially explained

Score 1 when:
- Skills present but sidecar minimal
- Agent/Plan substitutions unclear or undocumented
- Message framing missing

Score 0 when:
- No skills found
- No sidecar documentation

---

## Category 3: Context Delivery

Score 3 when:
- `AGENTS.md` present with complete agent, skill, and feature listings
- All agents documented with their dispatch mechanism (spawn_agent vs direct invocation)
- `.codex/INSTALL.md` includes context on consumption path
- Context is accurate and complete
- Multi-agent configuration flag documented if applicable

Score 2 when:
- `AGENTS.md` exists but missing some listings
- Dispatch mechanisms partially documented
- Context mostly complete with minor gaps

Score 1 when:
- `AGENTS.md` minimal or sparse
- Limited dispatch documentation
- Context incomplete

Score 0 when:
- No `AGENTS.md` present
- Context file is empty

---

## Category 4: Hook Portability

Score 3 when:
- **Plugin path**: `hooks/hooks.json` with standard hook format (if applicable)
- Hooks are portable or Codex-specific with clear adaption path
- Script execution handles multi-agent context
- Documentation clear on hook behavior in Codex

Score 2 when:
- Hook configuration present but partially complete
- Some hooks portable, others Codex-specific
- Documentation partial

Score 1 when:
- Minimal hook configuration
- Hooks mostly Codex-specific without adaption guidance
- Documentation limited

Score 0 when:
- No hooks or hooks unusable on Codex

---

## Category 5: Tool Mapping

Score 3 when:
- `references/codex-tools.md` thoroughly documents Codex tool mapping:
  - Claude Code `Task`/`Agent` -> Codex `spawn_agent` (with worker role specification)
  - Claude Code `TodoWrite` -> Codex `update_plan`
  - Standard tools (Read, Write, Edit, Bash, Grep, Glob, Skill) mapped to Codex equivalents
- Message framing for multi-agent communication documented
- All skills reviewed for tool consistency
- Mapping complete and clear

Score 2 when:
- Reference document exists but incomplete mappings
- Most tool substitutions correct but 1-2 unclear
- Message framing partially documented

Score 1 when:
- Minimal tool mapping documentation
- Agent/Plan substitutions partially unclear
- Limited reference material

Score 0 when:
- No tool mapping sidecar
- Tool usage unresolved

---

## Category 6: Install Readiness

Score 3 when:
- **Skill-discovery path**: `.codex/INSTALL.md` documents symlink to `~/.agents/skills/<name>` with step-by-step instructions
- **Native plugin path**: README documents marketplace install with verification steps
- Chosen consumption path explicitly documented and justified
- Paths match actual repository structure
- Verification steps included for chosen path

Score 2 when:
- Install documented for chosen path but incomplete
- Instructions partially match structure
- Verification steps missing or minimal

Score 1 when:
- Minimal install documentation
- Instructions incomplete or partially inaccurate
- Chosen path unclear

Score 0 when:
- No install documentation
- Instructions severely inaccurate or missing

---

## Category 7: Runtime Adapters

Score 3 when:
- Multi-agent configuration flag documented (if applicable)
- `spawn_agent` message framing clearly explained with examples
- Sandbox/detached-HEAD handling documented if relevant
- Subagent role specification (worker vs other roles) documented
- Runtime behavior under both skill-discovery and plugin paths explained

Score 2 when:
- Multi-agent configuration partially documented
- Message framing mostly clear but incomplete
- Sandbox/detached-HEAD handling partially explained

Score 1 when:
- Minimal runtime documentation
- Message framing unclear or incomplete
- Special handling undocumented

Score 0 when:
- No runtime documentation
- Multi-agent support undocumented
