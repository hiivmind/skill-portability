## Copilot CLI

Skills published via GitHub CLI (v2.90.0+).

### Publishing

```bash
gh skill publish [--fix]
```

Validates against the Agent Skills spec. No formal review — skills are published to the GitHub repository.

### How users find and install {{displayName}}

```bash
gh skill search {{name}}
gh skill preview {{repository}} {{name}}
gh skill install {{repository}}
```

### Third-party registries

- [skills.sh](https://skills.sh) — community directory with 300k+ monthly views
- [github/awesome-copilot](https://github.com/github/awesome-copilot) — GitHub's curated collection

### Security note

Always recommend users run `gh skill preview` before installing. GitHub does not vet third-party skills.
