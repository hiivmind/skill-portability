# Research Sources

All URLs used across platform reference documents, organised by platform and
source type. Each platform doc in `docs/platforms/` uses inline `[source]` links
for traceability. This file is the aggregate index.

Last updated: 2026-04-26

---

## Claude Code

### Official documentation

- https://code.claude.com/docs/en/plugins -- Plugin creation guide
- https://code.claude.com/docs/en/skills -- Skills documentation
- https://code.claude.com/docs/en/sub-agents -- Subagents documentation
- https://code.claude.com/docs/en/hooks-guide.md -- Hooks guide
- https://code.claude.com/docs/en/tools-reference -- Tools reference
- https://code.claude.com/docs/en/settings -- Settings reference
- https://code.claude.com/docs/en/memory -- Memory/CLAUDE.md documentation
- https://code.claude.com/docs/en/claude-directory -- .claude directory explorer
- https://code.claude.com/docs/en/features-overview -- Features overview
- https://code.claude.com/docs/en/plugin-marketplaces -- Marketplace guide
- https://code.claude.com/docs/en/discover-plugins -- Plugin discovery docs
- https://code.claude.com/docs/en/agent-sdk/hooks -- SDK hooks documentation
- https://docs.claude.com/en/docs/claude-code/plugins-reference -- Plugins reference (Anthropic docs)
- https://docs.claude.com/en/docs/claude-code/plugin-marketplaces -- Marketplace docs (Anthropic docs)
- https://claude.com/blog/how-to-configure-hooks -- Anthropic blog: hooks

### GitHub

- https://github.com/anthropics/claude-code/blob/bf77ee65/plugins/plugin-dev/skills/plugin-structure/SKILL.md -- plugin-dev skill source
- https://github.com/anthropics/claude-code/issues/25380 -- Validator vs extended frontmatter fields
- https://github.com/anthropics/claude-code/issues/27411 -- Typo in user-invocable, incomplete field list
- https://github.com/anthropics/claude-code/issues/23547 -- Task(agent_type) syntax in tools frontmatter
- https://github.com/anthropics/claude-code/issues/51806 -- marketplace add vs known_marketplaces.json
- https://github.com/anthropics/claude-code/issues/26455 -- Substitute decision type feature request

### Community

- https://github.com/robanderson/claude-my-skills/blob/main/README.md -- Community skills reference
- https://github.com/shanraisshan/claude-code-best-practice -- Skills frontmatter best practice
- https://git.durrantlab.pitt.edu/boostvolt/claude-code-lsps -- LSP plugin examples
- https://medium.com/@sathishkraju/claude-code-subagents-the-complete-guide-to-ai-agent-delegation-d0a9aba419d0 -- Subagent guide
- https://dev.to/speedy_devv/mcp-tool-hooks-in-claude-code-24f6 -- MCP tool hooks
- https://prg.sh/notes/Claude-Code-Hooks -- Hook event table
- http://agentpatterns.ai/tool-engineering/skill-frontmatter-reference/ -- Frontmatter reference
- https://claudecodeguides.com/skill-md-file-frontmatter-fields-explained/ -- Frontmatter explained
- https://claudefa.st/blog/guide/mechanics/rules-directory -- Rules directory guide
- https://www.morphllm.com/claude-md-examples -- CLAUDE.md hierarchy
- https://www.codewithseb.com/blog/claude-md-memory-persistent-context-guide -- CLAUDE.md guide
- https://codingnomads.com/claude-code-building-distributing-plugins -- Plugin guide
- https://www.sean-weldon.com/blog/2026-01-06-how-to-install-and-discover-claude-code-plugins-through-mark -- Marketplace installation
- https://gist.github.com/mculp/e6a573f2a45ef7dbbf30f6a8574c7351 -- Environment variables reference
- https://gist.github.com/mculp/c082bd1e5a439410158974de90c89db7 -- settings.json reference
- https://gist.github.com/wong2/e0f34aac66caf890a332f7b6f9e2ba8f -- System prompt and tool list
- https://blog.thepete.net/claude-code-tools/ -- Full tool list (Dec 2025)
- https://hexdocs.pm/claude_code/skills.html -- Elixir SDK skills docs
- https://github.com/agentskills/agentskills/issues/105 -- Agent Skills standard discussion
- https://claudelab.net/en/articles/claude-code/plugins-guide -- Plugin tutorial
- https://docs.rs/claude-codes/latest/claude_codes/tool_inputs/enum.ToolInput.html -- Rust SDK tool types

---

## Cursor

### Official documentation

- https://cursor.com/docs/plugins -- Plugin overview
- https://cursor.com/docs/reference/plugins -- Full manifest schema, component discovery, marketplace manifest
- https://cursor.com/docs/hooks -- Complete hooks reference
- https://cursor.com/docs/agent/third-party-hooks -- Third-party hooks compatibility
- https://cursor.com/docs/rules -- Rules format, AGENTS.md, Team Rules
- https://www.cursor.com/docs/context/skills -- Agent Skills documentation
- https://cursor.com/docs/agent/subagents -- Subagents reference

### Announcements

- https://www.cursor.com/blog/marketplace -- Cursor 2.5 announcement
- https://www.cursor.so/changelog/2-5 -- Cursor 2.5 changelog

### GitHub

- https://github.com/cursor/plugins -- Official plugins repository
- https://github.com/cursor/plugin-template -- Plugin starter template
- https://github.com/cursor/plugins/blob/08c2bbe2/create-plugin/skills/create-plugin-scaffold/SKILL.md -- Create-plugin scaffold skill
- https://github.com/cursor/plugin-template/issues/4 -- Local plugin testing discussion

### Community

- https://cursor.directory/plugins -- Community plugin directory
- https://github.com/OrcaQubits/agentic-commerce-skills-plugins/blob/main/INSTALL-CURSOR.md -- Plugin conversion guide
- https://github.com/yandy-r/claude-plugins -- Multi-platform plugin generator
- https://github.com/tech-leads-club/agent-skills -- Subagent creator skill
- https://github.com/obra/superpowers/issues/912 -- Windows hook path issues
- https://github.com/cursor/plugins/issues/32 -- Plugin root path fix

### Standards

- https://agentskills.io/specification -- Agent Skills open standard
- https://agentskills.io/integrate-skills -- Integration guide

### Forum

- https://forum.cursor.com/t/cursor-2-5-plugins/152124 -- Release discussion
- https://forum.cursor.com/t/task-tool-model-parameter-only-accepts-fast/156736 -- Subagent model limitation
- https://forum.cursor.com/t/subagents-that-are-configured-as-read-only/153490 -- Read-only subagent issues
- https://design.dev/guides/cursor-rules/ -- Cursor rules guide

---

## Gemini CLI

### Official documentation

- https://geminicli.com/docs/extensions/ -- Extensions overview
- https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/reference.md -- Manifest schema and CLI commands
- https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/writing-extensions.md -- Step-by-step authoring
- https://google-gemini.github.io/gemini-cli/docs/extensions/getting-started-extensions.html -- Tutorial
- https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/best-practices.md -- Security, structure, distribution
- https://geminicli.com/docs/extensions/extension-releasing/ -- Release and gallery listing
- https://geminicli.com/docs/cli/gemini-md/ -- Hierarchical context system
- https://geminicli.com/docs/reference/configuration/ -- settings.json options
- https://www.geminicli.com/docs/reference/tools/ -- Complete tool listing
- https://geminicli.com/docs/hooks/ -- Hook events and configuration
- https://geminicli.com/docs/hooks/reference/ -- Detailed I/O schemas
- https://geminicli.com/docs/hooks/best-practices/ -- Performance and security
- https://geminicli.com/docs/cli/skills/ -- Skill discovery and management
- https://geminicli.com/docs/cli/creating-skills/ -- Authoring guide
- https://www.geminicli.com/docs/cli/tutorials/skills-getting-started/ -- Hands-on walkthrough
- https://geminicli.com/docs/tools/activate-skill/ -- activate_skill tool reference
- https://geminicli.com/docs/tools/todos/ -- write_todos tool
- https://geminicli.com/docs/tools/shell/ -- run_shell_command tool
- https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/custom-commands.md -- TOML command format
- https://geminicli.com/docs/core/subagents/ -- Subagent system
- https://geminicli.com/docs/reference/policy-engine/ -- Policy rules and tiers
- https://www.geminicli.com/docs/ide-integration -- VS Code companion
- https://geminicli.com/docs/cli/tutorials/memory-management/ -- Context and memory

### GitHub

- https://github.com/google-gemini/gemini-cli -- Main repository
- https://github.com/gemini-cli-extensions -- Official extensions org
- https://github.com/google-gemini/gemini-cli/blob/07ab16db/packages/core/src/tools/tool-names.ts -- Canonical tool names
- https://github.com/google-gemini/gemini-cli/blob/07ab16db/packages/core/src/hooks/types.ts -- Hook event enum
- https://github.com/google-gemini/gemini-cli/pull/25008 -- Custom hooksDir/skillsDir
- https://github.com/google-gemini/gemini-cli/pull/18151 -- .agents/skills alias
- https://github.com/google-gemini/gemini-cli/pull/18486 -- AfterTool tail calls
- https://github.com/google-gemini/gemini-cli/pull/20354 -- Plan directory in manifest
- https://github.com/google-gemini/gemini-cli/pull/20049 -- Extension policy engine
- https://github.com/google-gemini/gemini-cli/pull/16377 -- Skill install/uninstall
- https://github.com/google-gemini/gemini-cli/pull/16394 -- skill-creator built-in
- https://github.com/google-gemini/gemini-cli/pull/4703 -- Extension custom commands
- https://github.com/google-gemini/gemini-cli/issues/25630 -- Hooks in manifest
- https://github.com/google-gemini/gemini-cli/discussions/12875 -- Gallery publishing

### Blog posts

- https://blog.google/technology/developers/gemini-cli-extensions/ -- Extensions announcement
- https://www.engineering.fyi/article/making-gemini-cli-extensions-easier-to-use -- Making extensions easier
- https://cloud.google.com/blog/topics/developers-practitioners/gemini-cli-custom-slash-commands -- Custom slash commands
- https://developers.googleblog.com/tailor-gemini-cli-to-your-workflow-with-hooks/ -- Hooks announcement
- https://geminicli.com/extensions/ -- Extensions gallery

---

## Codex

### Official documentation

- https://developers.openai.com/codex/cli -- CLI overview and setup
- https://developers.openai.com/codex/cli/features/ -- CLI features
- https://developers.openai.com/codex/cli/reference/ -- Command line options
- https://developers.openai.com/codex/plugins/ -- Plugin overview
- https://developers.openai.com/codex/plugins/build/ -- Build plugins (manifest, marketplace, packaging)
- https://developers.openai.com/codex/skills/create-skill -- Agent Skills
- https://developers.openai.com/codex/concepts/customization/ -- Customization layers
- https://developers.openai.com/codex/guides/agents-md -- AGENTS.md guide
- https://developers.openai.com/codex/hooks -- Hooks reference
- https://developers.openai.com/codex/multi-agent/ -- Subagents
- https://developers.openai.com/codex/concepts/sandboxing/ -- Sandbox modes
- https://developers.openai.com/codex/agent-approvals-security -- Agent approvals
- https://developers.openai.com/codex/config-basic/ -- Config basics
- https://developers.openai.com/codex/config-advanced/ -- Advanced configuration
- https://developers.openai.com/codex/learn/best-practices -- Best practices
- https://developers.openai.com/codex/quickstart?setup=cli -- Quickstart

### GitHub

- https://github.com/openai/codex -- Main repository (open source, Rust)
- https://github.com/openai/codex/blob/13c42a07/docs/sandbox.md -- Sandbox documentation
- https://github.com/openai/codex/blob/eaf81d3f/codex-rs/README.md -- Rust CLI README
- https://github.com/openai/codex/blob/main/README.md -- Repository README
- https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md -- Built-in skill-creator
- https://github.com/ComposioHQ/awesome-codex-skills -- Community skill collection
- https://github.com/openai/codex/issues/14882 -- PreToolUse/PostToolUse lifecycle hooks proposal
- https://github.com/openai/codex/issues/17532 -- Hooks repo-local config issue
- https://github.com/openai/codex/pull/11067 -- Comprehensive hook system PR
- https://github.com/openai/codex/issues/16732 -- ApplyPatch hook event
- https://github.com/openai/codex/issues/6667 -- Sandbox mode config

### Community

- https://aintelligencehub.com/articles/openai-added-plugin-directory-codex-what-teams-can-reuse-now-april-2026 -- Plugin Directory announcement
- https://thepromptshelf.dev/blog/agents-md-codex-setup-guide-2026 -- AGENTS.md setup guide
- https://localskills.sh/blog/codex-cli-guide -- Codex CLI guide
- https://medium.com/@jpcaparas/the-definitive-guide-to-codex-cli-from-first-install-to-production-workflows-a9f1e7c887ab -- Definitive guide
- https://bibek-poudel.medium.com/the-skill-md-pattern-how-to-write-ai-agent-skills-that-actually-work-72a3169dd7ee -- SKILL.md pattern cross-platform
- https://zread.ai/openai/codex/19-hooks-and-lifecycle-events -- Hooks deep dive
- https://dev-docs.moodybeard.com/en/codex/config-advanced/ -- Advanced config mirror
- https://agent-skills.md/skills/openai/codex/skill-creator -- Skill Creator reference
- https://github.com/KevinConti/skill-universe/blob/master/docs/skill-specs/openai-codex-skills.md -- Codex skill spec

---

## Antigravity

### Official documentation

- https://antigravity.google/ -- Home
- https://antigravity.google/docs/home -- Documentation hub
- https://antigravity.google/docs/agent -- Agent documentation
- https://antigravity.google/docs/skills -- Skills documentation
- https://antigravity.google/docs/rules-workflows -- Rules and Workflows
- https://antigravity.google/blog/introducing-google-antigravity -- Launch blog post

### Codelabs

- https://codelabs.developers.google.com/getting-started-with-antigravity-skills?hl=en -- Authoring skills
- https://codelabs.developers.google.com/getting-started-google-antigravity -- Getting started

### Community

- https://antigravity.md/ -- Antigravity.md guide
- https://www.agensi.io/learn/skill-md-format-reference -- SKILL.md format reference
- https://antigravity.im/blog/what-is-google-antigravity-complete-guide -- Complete guide
- https://www.kdnuggets.com/build-better-ai-agents-with-google-antigravity-skills-and-workflows -- Skills and workflows guide
- https://www.cxodigitalpulse.com/google-moves-to-unify-ai-coding-tools-under-antigravity-platform/ -- Platform coverage

### GitHub

- https://github.com/sickn33/antigravity-awesome-skills -- 1,400+ cross-platform skills
- https://github.com/rmyndharis/antigravity-skills -- 300+ ported skills
- https://github.com/xenitV1/Antigravity-Workflows -- Workflows, agents, and skills
- https://github.com/rominirani/antigravity-skills -- Official codelab examples

### Forum

- https://discuss.ai.google.dev/t/hooks-in-antigravity/120458 -- Hooks discussion
- https://discuss.ai.google.dev/t/hook-support-for-context-mode/129626 -- Hook support discussion

---

## OpenClaw

### Official documentation

- https://docs.openclaw.ai/plugin -- Plugins overview
- https://docs.openclaw.ai/plugins/agent-tools -- Building plugins, registering tools
- http://docs.openclaw.ai/plugins/architecture -- Plugin internals, capability model
- http://docs.openclaw.ai/plugins/sdk-entrypoints -- Entry point helpers, registration modes
- https://openclaw-openclaw.mintlify.app/plugins/plugin-sdk -- Plugin SDK reference
- https://docs.openclaw.ai/clawhub -- ClawHub registry usage
- https://docs.openclaw.ai/tools/clawhub -- ClawHub CLI reference
- https://github.com/openclaw/openclaw/blob/main/docs/tools/skills.md -- Skills format, precedence, gating
- https://github.com/openclaw/openclaw/blob/e635cedb/docs/concepts/system-prompt.md -- System prompt assembly

### GitHub

- https://github.com/openclaw/openclaw/issues/55745 -- Typed hooks for compaction events
- https://github.com/openclaw/openclaw/issues/25074 -- Bug: api.on('command') handlers disconnected
- https://github.com/openclaw/openclaw/issues/15566 -- Configurable workspace context files
- https://github.com/openclaw/openclaw/issues/48266 -- Custom skills not auto-discovered
- https://github.com/openclaw/openclaw/issues/59050 -- Configurable workspace file load order
- https://github.com/openclaw/openclaw/pull/13965 -- Configurable contextScripts for sub-agents
- https://github.com/openclaw/clawhub -- ClawHub source
- https://registry.npmjs.org/clawhub -- ClawHub CLI on npm

### Community

- https://www.glukhov.org/ai-systems/openclaw/plugins/ -- Ecosystem guide
- https://dev.to/rosgluk/openclaw-plugins-ecosystem-guide-and-practical-picks-4an1 -- Ecosystem guide (dev.to)
- https://www.openclawplaybook.ai/guides/how-to-build-openclaw-plugins/ -- Skills vs plugins
- https://clawdbytes.com/article/2026-03-11-show-hn-openclaw-plugin-for-claude-code-and-codex-orchestration.html -- Code orchestration plugin
- https://open-claw.bot/docs/tools/plugins/ -- Plugin discovery
- https://openclawdir.com/plugins/enterprise-agent-plugins-6ddq8d -- Multi-platform scaffold
- https://www.reddit.com/r/openclaw/comments/1rm10f0/ -- Community TypeScript SDK
- https://gist.github.com/openmetaloom/657c4668c09d235f8da1306e2438904b -- Extended hook system proposal
- https://openclawblog.space/articles/openclaw-plugin-development-extending-functionality -- Plugin dev guide
- https://www.elegantsoftwaresolutions.com/blog/openclaw-v2026-3-22-clawhub-plugin-registry-guide -- ClawHub guide
- https://launchmyopenclaw.com/openclaw-agents-md-guide -- AGENTS.md guide
- https://launchmyopenclaw.com/openclaw-md-files-guide/ -- All .md context files
- https://openclawready.com/blog/customize-openclaw-agents-md-configuration-guide/ -- AGENTS.md templates
- https://www.reddit.com/r/openclaw/comments/1r7k9pr/ -- Workspace setup guide
- https://openclaws.io/docs/tools/skills/ -- Skills reference
- https://openclaws.io/docs/tools/skills-config/ -- Skills config reference
- https://www.stanza.dev/cheatsheet/openclaw-skills-development -- Skills cheatsheet
- https://www.tencentcloud.com/techpedia/141204 -- Custom plugins with TypeScript
