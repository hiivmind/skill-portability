# Injection Checks

8-component verification for session-start bootstrapping infrastructure.
Only applies to **always-present** plugins (archetype gate). On-demand plugins
skip injection checks entirely — they have no using-skill or hooks.

Only runs when `skills/using-<name>/SKILL.md` exists.

---

## Components

| # | Component | Check | Status Values |
|---|-----------|-------|---------------|
| 1 | `skills/using-{{name}}/SKILL.md` | File exists | PRESENT / MISSING |
| 2 | `lib/references/platforms/gemini-cli.md` | File exists (platform spec) | PRESENT / MISSING |
| 3 | `hooks/session-start` | File exists and is executable | PRESENT / MISSING |
| 4 | `hooks/run-hook.cmd` | File exists and is executable | PRESENT / MISSING |
| 5 | `hooks/hooks.json` | Contains `SessionStart` entry with command containing `session-start` | PRESENT / MISSING |
| 6 | `hooks/hooks-cursor.json` | Contains `sessionStart` entry with command containing `session-start` | PRESENT / MISSING |
| 7 | `GEMINI.md` | First `@./skills/` include is `using-{{name}}` | PRESENT / MISSING / NOT_FIRST |

---

## Verification Algorithm

```pseudocode
CHECK_INJECTION_COMPONENTS(computed):
  name = computed.metadata.name
  results = []

  # 1. using-skill SKILL.md
  results.append(check_file_exists("skills/using-" + name + "/SKILL.md"))

  # 2. shared gemini platform spec
  results.append(check_file_exists("lib/references/platforms/gemini-cli.md"))

  # 3. session-start script
  path = "hooks/session-start"
  IF file_exists(path) AND is_executable(path):
    results.append({ component: path, status: "PRESENT" })
  ELSE:
    results.append({ component: path, status: "MISSING" })

  # 4. run-hook.cmd
  path = "hooks/run-hook.cmd"
  IF file_exists(path) AND is_executable(path):
    results.append({ component: path, status: "PRESENT" })
  ELSE:
    results.append({ component: path, status: "MISSING" })

  # 5. hooks.json SessionStart entry
  claude_event = hook_event("claude-code", "session.start")
  IF file_exists("hooks/hooks.json"):
    content = Read("hooks/hooks.json")
    IF content contains claude_event AND content contains "session-start":
      results.append({ component: "hooks/hooks.json (" + claude_event + ")", status: "PRESENT" })
    ELSE:
      results.append({ component: "hooks/hooks.json (" + claude_event + ")", status: "MISSING" })
  ELSE:
    results.append({ component: "hooks/hooks.json (" + claude_event + ")", status: "MISSING" })

  # 6. hooks-cursor.json sessionStart entry
  cursor_event = hook_event("cursor", "session.start")
  IF file_exists("hooks/hooks-cursor.json"):
    content = Read("hooks/hooks-cursor.json")
    IF content contains cursor_event AND content contains "session-start":
      results.append({ component: "hooks/hooks-cursor.json (" + cursor_event + ")", status: "PRESENT" })
    ELSE:
      results.append({ component: "hooks/hooks-cursor.json (" + cursor_event + ")", status: "MISSING" })
  ELSE:
    results.append({ component: "hooks/hooks-cursor.json (" + cursor_event + ")", status: "MISSING" })

  # 7. GEMINI.md ordering
  IF file_exists("GEMINI.md"):
    content = Read("GEMINI.md")
    first_skill_include = first_line_matching(content, /^@\.\/skills\//)
    IF first_skill_include contains "using-" + name:
      results.append({ component: "GEMINI.md (using-" + name + " first)", status: "PRESENT" })
    ELSE:
      results.append({ component: "GEMINI.md (using-" + name + " first)", status: "NOT_FIRST" })
  ELSE:
    results.append({ component: "GEMINI.md (using-" + name + " first)", status: "MISSING" })

  RETURN results

COMPUTE_INJECTION_SUMMARY(results):
  present = len(r for r in results if r.status == "PRESENT")
  total = len(results)
  IF present == total:
    RETURN "COMPLETE"
  ELIF present == 0:
    RETURN "MISSING"
  ELSE:
    RETURN "PARTIAL (" + str(present) + " of " + str(total) + " components)"
```
