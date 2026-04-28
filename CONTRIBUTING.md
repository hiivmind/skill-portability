# Contributing to Plugin Portability

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

See [lib/principles/adding-a-platform.md](lib/principles/adding-a-platform.md) for the full guide — architecture overview, phased checklist, and verification gates.

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

See existing skills in `skills/` for examples. Platform-specific tool mappings are in `lib/references/platforms/`. See `lib/references/platform-api.md` for the type system and lookup functions.

## Pull Request Process

1. Update `CHANGELOG.md` if your change is user-facing
2. Update `SKILL.md` frontmatter if you changed a skill's behavior or triggers
3. Update `INSTALL.md` if install steps changed
4. Ensure shellcheck passes on any shell scripts
5. Ensure markdown linting passes
