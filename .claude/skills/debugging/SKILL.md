---
name: debugging
description: General-purpose troubleshooting workflow for tracking down bugs, test failures, or unexpected behavior. Use when something is broken, a test is failing, an error is being investigated, or behavior doesn't match expectations.
---

A repo-agnostic workflow for diagnosing problems methodically instead of
guessing.

## 1. Reproduce first

- Get a minimal, reliable way to trigger the problem (a failing test, a
  specific request/command, specific input) before changing anything.
- If it's intermittent, figure out what varies between runs that succeed and
  runs that fail.

## 2. Gather evidence before theorizing

- Read the actual error message/stack trace fully — don't skim.
- Check logs, test output, and return values at the point of failure.
- Confirm what you *know* happened vs. what you're assuming happened.

## 3. Localize the failure

- Narrow down where the behavior diverges from expectations: work backward
  from the symptom toward its cause, or bisect (comment out/disable half the
  suspect code path, check recent commits/diffs) to shrink the search space.
- Prefer the smallest possible change that lets you observe the actual vs.
  expected state at a given point (a log line, a debugger, a temporary
  assertion) over speculative fixes.

## 4. Form a specific hypothesis

- State plainly what you think is wrong and why, based on the evidence
  gathered — not just "let's try this and see."
- If you can't explain why a fix would work, you don't understand the bug
  yet.

## 5. Fix the root cause

- Fix the underlying cause, not just the symptom you happened to observe.
- Avoid adding defensive code, fallbacks, or broad try/catch blocks that mask
  the problem instead of resolving it.
- Keep the fix minimal and scoped to the actual bug.

## 6. Verify and guard against regressions

- Confirm the original reproduction case now passes.
- Run the full relevant test suite, not just the one failing case, to check
  for side effects.
- Add or update a test that would catch this bug if it reoccurred.

## 7. If stuck

- Re-check assumptions: is the code you're looking at actually the code
  that's running (caching, wrong branch, wrong environment)?
- Diff against the last known-good state (e.g. `git diff`, `git log`) to see
  what actually changed.
- Explain the problem from scratch, including what's been ruled out — often
  surfaces the missed possibility.
