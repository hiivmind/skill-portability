# OpenCode Scoring Rules

Platform-specific scoring criteria for the 7-category rubric.
See `lib/patterns/rubric-framework.md` for the shared scoring scale.

---

## Artifact Checklist

| File | Category |
|------|----------|
| `.opencode/plugins/<name>.js` | Manifest Packaging |
| `package.json` | Manifest Packaging |
| `opencode.json` | Manifest Packaging |
| `AGENTS.md` | Context Delivery |
| `commands/*.toml` | Runtime Adapters |

---

## Category 1: Manifest Packaging

Score 3 when:
- `.opencode/plugins/<name>.js` exists with valid plugin export
- `package.json` present with correct `main` field pointing to the plugin
- `opencode.json` contains `"plugin"` array with plugin references
- All required fields in package.json: name, version, description

Score 2 when:
- `.opencode/plugins/<name>.js` present but plugin export incomplete
- `package.json` missing some fields (version, description)
- `opencode.json` references plugins but list incomplete

Score 1 when:
- Plugin file exists but export non-standard
- `package.json` exists but `main` field incorrect or missing
- `opencode.json` minimal or plugin list unclear

Score 0 when:
- No plugin file present
- `package.json` or `opencode.json` missing entirely

---

## Category 2: Skill Compatibility

Score 3 when:
- Standard SKILL.md format with proper frontmatter
- Skills discoverable from `.opencode/skills/`, `.agents/skills/`, `.claude/skills/`, or `skills/`
- All tool names lowercase (read, edit, write, bash, glob, grep, task, skill)
- No unresolved platform-specific tool assumptions

Score 2 when:
- Skills properly formatted but discovery paths inconsistent
- Tool names mostly lowercase with minor inconsistencies
- One skill has tool assumptions unresolved

Score 1 when:
- Skills present but with inconsistent frontmatter
- Tool names mixed case or inconsistent
- Multiple tool assumptions unclear

Score 0 when:
- No skills found
- Skills lack frontmatter or are unstructured

---

## Category 3: Context Delivery

Score 3 when:
- `AGENTS.md` is primary context file with complete agent and skill listings
- "First type wins" rule applied: if `AGENTS.md` exists, `CLAUDE.md` is ignored (but may document fallback)
- All agents and skills referenced in AGENTS.md
- Context complete and up-to-date

Score 2 when:
- `AGENTS.md` exists but missing some agent/skill listings
- Context mostly complete but minor gaps
- First-type-wins rule acknowledged

Score 1 when:
- `AGENTS.md` minimal or sparse
- Context incomplete or partially documented
- Rule unclear

Score 0 when:
- No `AGENTS.md` present
- Context file is empty

---

## Category 4: Hook Portability

Score 3 when:
- Hooks code-based in `.opencode/plugins/<name>.js`
- `experimental.chat.messages.transform` event used for session-start context
- Message object uses `msg.info.role` (not `msg.role`)
- All hooks are portable or Bun-runtime-aware
- Clear documentation of hook implementation

Score 2 when:
- Hooks present but `msg.info.role` usage inconsistent
- Most hooks portable but some Bun-specific
- Documentation partial

Score 1 when:
- Hooks minimal or partially implemented
- Message structure inconsistent
- Limited documentation

Score 0 when:
- No hooks implemented
- Hooks unusable on OpenCode

---

## Category 5: Tool Mapping

Score 3 when:
- Tool names standardized to lowercase: `read`, `edit`, `write`, `bash`, `glob`, `grep`, `task`, `skill`
- All skills use consistent tool naming
- Per-skill tool documentation clear
- Reference material for tool mapping available

Score 2 when:
- Tool names mostly lowercase with minor inconsistencies
- Some skills have undocumented tool usage
- Partial reference material

Score 1 when:
- Tool names mixed case or inconsistent
- Tool usage implicit
- Minimal reference material

Score 0 when:
- No tool consistency
- Tool mapping missing

---

## Category 6: Install Readiness

Score 3 when:
- README documents local file install in `.opencode/plugins/`
- npm install via `opencode.json` `"plugin"` array documented
- Bun requirement noted
- Verification steps included
- Paths match actual repository structure

Score 2 when:
- Install documented for one method (local or npm)
- Instructions lack Bun requirement or verification
- Minor path discrepancies

Score 1 when:
- Minimal install documentation
- Instructions incomplete or partially inaccurate
- Bun requirement undocumented

Score 0 when:
- No install documentation
- Instructions severely inaccurate

---

## Category 7: Runtime Adapters

Score 3 when:
- MCP configuration in `opencode.json` with proper server definitions
- `config` hook injects servers programmatically
- `commands/*.toml` present if commands used
- All adapters follow OpenCode conventions

Score 2 when:
- MCP configuration present but incomplete
- `config` hook partially implemented
- Commands/adapters mostly correct

Score 1 when:
- MCP minimal or partial configuration
- `config` hook undocumented
- Adapters incomplete

Score 0 when:
- No MCP or runtime configuration
- No server injection mechanism

