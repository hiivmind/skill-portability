# Copilot CLI Installation

## Skill install

Skills are auto-discovered from the `skills/` directory. Clone the repo and skills will be available:

```bash
git clone https://github.com/nathanielramm/skill-portability
```

Alternatively, install individual skills:

```bash
gh skill install https://github.com/nathanielramm/skill-portability
```

## Context

Copilot reads `.github/copilot-instructions.md` for repo-wide context. It also reads `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` from the project root.

## Verify

Start Copilot CLI in the repo directory and check that skills appear:

```bash
copilot
```

Type `/` to see available skills.
