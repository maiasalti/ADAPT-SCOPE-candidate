---
name: code-cleanliness
description: Generic checklist for keeping code clean, readable, and minimal. Use when writing or reviewing code, before finishing an edit, or when the user asks for a cleanliness/quality pass.
---

Apply this checklist to code you write or review. It's repo-agnostic — always
defer to project-specific conventions (e.g. `CLAUDE.md`) when they conflict.

## Before finishing any change

- **Scope**: Only touch what the task requires. Don't refactor, rename, or
  "improve" unrelated code while you're in a file.
- **Duplication**: Look for logic that already exists elsewhere before adding
  a new version of it.
- **Dead code**: Remove code, variables, imports, and comments that are no
  longer used instead of leaving them "just in case."
- **Naming**: Names should say what something is or does without needing a
  comment. Rename anything that's misleading or vague.
- **Function/module size**: If a function is doing several unrelated things,
  or a file is a grab-bag of unrelated concerns, split it along clear
  responsibility lines.
- **Comments**: Add comments only where the *why* isn't obvious from the code
  itself. Don't narrate what the code already says.
- **Error handling**: Handle errors that can realistically occur; don't add
  defensive checks for cases that can't happen. Validate at system
  boundaries (user input, external calls), trust internal code otherwise.
- **Consistency**: Match the existing style, formatting, and patterns in the
  surrounding code rather than introducing a new convention.
- **Abstractions**: Don't build generic helpers/config options for a single
  use case. Prefer the simplest thing that solves the current problem.
- **Tests**: Make sure tests reflect the current behavior — update or remove
  tests that no longer describe reality, and add tests for new behavior.

## Quick self-review pass

Before considering a change done, re-read the diff and ask:

1. Would a reviewer understand this without extra explanation?
2. Is there anything here that isn't needed for the task at hand?
3. Could any part of this be deleted without losing functionality?
4. Are names, structure, and style consistent with the rest of the codebase?
