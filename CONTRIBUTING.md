# Contributing to Skill Portability

Thank you for your interest in contributing! This guide covers the basics.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Please read it before participating.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Follow [INSTALL.md](INSTALL.md) for development setup
4. Create a feature branch (`git checkout -b feature/your-feature`)
5. Make your changes
6. Open a pull request targeting `main`

## Adding a New Platform

1. Create a platform documentation file in `docs/platforms/`
2. Add a manifest template in `lib/templates/manifests/`
3. Add install doc templates in `lib/templates/install-docs/`
4. Add a platform rubric in `lib/rubrics/`
5. Update the portability skill (`skills/plugin-portability/SKILL.md`) to handle the new platform
6. Update the assessment rubric (`docs/assessment-rubric.md`) with scoring criteria

## Authoring Skills

Skills live in `skills/<skill-name>/SKILL.md` using YAML frontmatter:

```yaml
---
name: my-skill
description: >
  Trigger description for when this skill should be invoked.
allowed-tools: Read, Write, Edit
---
```

See existing skills in `skills/` for examples. Each skill should also have a `references/` subdirectory containing platform-specific tool mappings (`codex-tools.md`, `gemini-tools.md`, `antigravity-tools.md`, `openclaw-tools.md`).

## Pull Request Process

1. Update `CHANGELOG.md` if your change is user-facing
2. Update `SKILL.md` frontmatter if you changed a skill's behavior or triggers
3. Update `INSTALL.md` if install steps changed
4. Ensure shellcheck passes on any shell scripts
5. Ensure markdown linting passes
