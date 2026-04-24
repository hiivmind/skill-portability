## Copilot CLI

### Skill install

Skills are auto-discovered from the `skills/` directory. Clone the repo and skills will be available:

```bash
git clone {{repository}}
```

Alternatively, install individual skills:

```bash
gh skill install {{repository}}
```

### Context

Copilot reads `.github/copilot-instructions.md` for repo-wide context. It also reads `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` from the project root.

### Custom agents

Custom agents are in `.github/agents/`. They are auto-discovered when the repo is the current working directory.

### Verify

Start Copilot CLI in the repo directory and check that skills appear:

```bash
copilot
```

Type `/` to see available skills.
