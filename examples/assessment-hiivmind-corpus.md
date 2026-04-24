# Example: Assessing hiivmind-corpus

This is sample output from running the `assessing-plugin-portability` skill against
[hiivmind-corpus](https://github.com/hiivmind/hiivmind-corpus), a Claude Code plugin
for documentation corpus management.

The plugin was Claude-first with no cross-platform artifacts. The assessment identified
it as a candidate for full portable plugin uplift.

---

## Platform Scores

```text
┌─────────────┬───────┬─────────┬───────────────────────────────────────┐
│ Platform    │ Score │ Band    │ Action                                │
├─────────────┼───────┼─────────┼───────────────────────────────────────┤
│ claude-code │ 18/21 │ Strong  │ No action required (Native)           │
│ cursor      │ 6/21  │ Partial │ Significant gaps — uplift recommended │
│ gemini-cli  │ 6/21  │ Partial │ Significant gaps — uplift recommended │
│ opencode    │ 3/21  │ Weak    │ Full uplift required                  │
│ copilot-cli │ 6/21  │ Partial │ Significant gaps — uplift recommended │
│ codex       │ 6/21  │ Partial │ Significant gaps — uplift recommended │
└─────────────┴───────┴─────────┴───────────────────────────────────────┘
```

Scores use a 7-category rubric (max 3 points each, 21 total). See
[rubric-framework.md](../lib/patterns/rubric-framework.md) for category definitions.

---

## Per-Platform Detail

### claude-code — 18/21 (Strong)

```text
┌─────────────────────┬───────┐
│ Category            │ Score │
├─────────────────────┼───────┤
│ Manifest packaging  │ 3/3   │
│ Skill compatibility │ 3/3   │
│ Context delivery    │ 3/3   │
│ Hook portability    │ 1/3   │
│ Tool mapping        │ 3/3   │
│ Install readiness   │ 3/3   │
│ Runtime adapters    │ 2/3   │
│ Total               │ 18/21 │
└─────────────────────┴───────┘
```

The plugin scores Strong on its native platform. Hook portability (1/3) and runtime
adapters (2/3) are the only gaps — hooks exist but are Claude-specific, and some
runtime features lack cross-platform equivalents.

### cursor — 6/21 (Partial)

```text
┌─────────────────────┬───────┐
│ Category            │ Score │
├─────────────────────┼───────┤
│ Manifest packaging  │ 0/3   │
│ Skill compatibility │ 3/3   │
│ Context delivery    │ 0/3   │
│ Hook portability    │ 0/3   │
│ Tool mapping        │ 3/3   │
│ Install readiness   │ 0/3   │
│ Runtime adapters    │ 0/3   │
│ Total               │ 6/21  │
└─────────────────────┴───────┘
```

Skills are compatible (SKILL.md frontmatter is valid) and tool mapping scores full
marks because Cursor shares Claude Code's tool names. Everything else is missing:
no `.cursor-plugin/plugin.json`, no `AGENTS.md`, no Cursor-format hooks.

### gemini-cli — 6/21 (Partial)

```text
┌─────────────────────┬───────┐
│ Category            │ Score │
├─────────────────────┼───────┤
│ Manifest packaging  │ 0/3   │
│ Skill compatibility │ 3/3   │
│ Context delivery    │ 0/3   │
│ Hook portability    │ 0/3   │
│ Tool mapping        │ 0/3   │
│ Install readiness   │ 0/3   │
│ Runtime adapters    │ 0/3   │
│ Total               │ 6/21  │
└─────────────────────┴───────┘
```

Skills are compatible but tool mapping scores 0 — Gemini CLI uses different tool
names and no `gemini-tools.md` sidecars exist. No `gemini-extension.json` manifest
or `GEMINI.md` context file.

---

## Blockers

- **Major:** Unresolved tool assumptions in all skills (no tool-mapping sidecars found).
- **Minor:** `GEMINI.md` and `AGENTS.md` missing — cannot check includes.
- **Minor:** Installation instructions in `README.md` are Claude-specific.

---

## Uplift Recommendation

| Field | Value |
| ----- | ----- |
| Target | `full-portable-plugin` |
| Codex path | `native-plugin-packaging` |

---

## Required Artifacts

### cursor — Partial

- `.cursor-plugin/plugin.json`
- `AGENTS.md`
- `hooks/hooks-cursor.json`

### gemini-cli — Partial

- `gemini-extension.json`
- `GEMINI.md`
- `skills/*/references/gemini-tools.md`

### opencode — Weak

- `package.json`
- `.opencode/plugins/hiivmind-corpus.js`

### copilot-cli — Partial

- `.github/copilot-instructions.md`
- `skills/*/references/copilot-tools.md`

### codex — Partial

- `.codex-plugin/plugin.json`
- `skills/*/references/codex-tools.md`

---

## Session-Start Injection

`NOT CONFIGURED`

---

## Summary

Run the `uplifting-a-plugin` skill to generate all missing artifacts automatically.
This will transform hiivmind-corpus from a Claude-first plugin into a fully portable
multi-platform plugin with native manifests, tool mappings, and unified documentation.
