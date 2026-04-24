# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-24

### Added

- Cross-platform plugin uplift skill — detects existing platform artifacts, infers canonical metadata, generates every missing manifest and context file
- Portability assessment skill — read-only gap analysis with 7-category rubric scoring per platform
- Session-start bootstrapping skill — platform-aware invocation help on first load
- 6-platform support: Claude Code, Cursor, Gemini CLI, OpenCode, Copilot CLI, Codex
- Per-skill tool mapping sidecars (`references/{copilot,codex,gemini}-tools.md`)
- Hook portability (`hooks.json` → `hooks-cursor.json` derivation)
- Template system for manifests, context files, install docs, and hooks
- Platform detection algorithm (environment variable and file-based)
- Ecosystem landscape documentation and competitive analysis
- Install documentation for all 6 platforms

[0.1.0]: https://github.com/hiivmind/skill-portability/releases/tag/v0.1.0
