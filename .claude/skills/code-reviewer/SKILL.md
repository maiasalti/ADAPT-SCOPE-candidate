---
name: code-reviewer
description: Reviews code changes (diffs, new files, or a whole module) for correctness, clarity, security, and adherence to project conventions. Use whenever a change is ready for a second pass before it's considered done, or when explicitly asked to "review" or "critique" code.
---

# Code Reviewer

A general-purpose skill for reviewing code the way a careful senior
engineer would during a PR review. Applies to any language or project,
not just this repo.

## When to use this skill

- After implementing a feature or fix, before declaring it complete.
- When asked to review, critique, or sanity-check a diff, file, or PR.
- Before merging/pushing changes that touch shared or critical code paths.

## What to check

1. **Correctness**
   - Does the code do what it claims to do? Trace through the main
     path and the edge cases (empty input, missing/null values,
     boundary conditions, concurrent access if relevant).
   - Are error paths handled explicitly, or silently swallowed?
   - Do return values, status codes, and response shapes match what
     callers/tests/specs expect?

2. **Project conventions**
   - Check for a project rules file (e.g. `CLAUDE.md`, `CONTRIBUTING.md`,
     `.editorconfig`, lint config) and confirm the change follows it.
   - Match existing patterns in the codebase (naming, file layout,
     module boundaries, error-handling style) rather than introducing
     a new style.

3. **Security**
   - No string-built queries/commands from untrusted input (SQL/OS
     command/HTML injection). Parameterize instead.
   - No secrets, tokens, or credentials hardcoded in source.
   - No sensitive data (PII/PHI, credentials, tokens) written to logs
     or error messages in plaintext.
   - Input validation exists at trust boundaries (API handlers, CLI
     args, file parsing).

4. **Clarity & maintainability**
   - Is the change minimal and focused on what was asked, or does it
     carry unrelated refactors/scope creep?
   - Are names, functions, and modules doing one clear thing?
   - Is there dead code, commented-out code, or leftover debug
     statements that should be removed?
   - Are comments used only where the "why" isn't obvious from the
     code itself (not restating the "what")?

5. **Tests**
   - Do tests exist for the new behavior, including the failure/edge
     cases, not just the happy path?
   - Do existing tests still pass? Were any tests weakened or deleted
     just to make the change pass?

## How to report findings

- Group feedback by severity: **blocking** (bugs, security issues,
  broken conventions) vs. **suggestions** (style, minor readability).
- Reference specific file paths and line numbers.
- For each issue, state what's wrong and why it matters — don't just
  assert a preference.
- Don't rewrite the whole file; propose the smallest change that
  fixes the issue.
- If everything looks good, say so plainly instead of inventing
  nitpicks.
