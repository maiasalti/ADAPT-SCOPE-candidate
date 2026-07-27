---
name: debugger
description: Systematically root-causes and fixes bugs — failing tests, stack traces, crashes, or unexpected behavior — instead of guessing or patching symptoms. Use whenever something is broken, throwing, or not behaving as expected.
---

# Debugger

A general-purpose skill for diagnosing and fixing bugs methodically,
in any language or project.

## When to use this skill

- A test is failing and the cause isn't immediately obvious.
- An error, exception, or stack trace needs to be traced to its
  source.
- Behavior doesn't match the spec/expectation and the reason is
  unclear.
- Something worked before and now doesn't (regression).

## Process

1. **Reproduce first.**
   - Get a minimal, reliable way to trigger the bug (a failing test,
     a specific request/input, a repro script). Don't start editing
     code before you can reliably observe the failure.
   - If it's intermittent, note what varies between runs (timing,
     ordering, external state).

2. **Read the actual error, don't skim it.**
   - Note the exact message, type, and full stack trace.
   - Identify the innermost frame that belongs to project code (vs.
     library/framework internals) — that's usually the most useful
     starting point.

3. **Form a hypothesis before changing code.**
   - State, in one sentence, what you think is wrong and why.
   - Identify what evidence would confirm or rule it out.

4. **Localize with evidence, not guesses.**
   - Use logging, print statements, a debugger, or targeted small
     tests to narrow down where actual behavior diverges from
     expected behavior.
   - Binary-search through the call path if the failure is far from
     the entry point: check inputs/outputs at intermediate steps
     rather than staring at the whole flow at once.
   - Check assumptions explicitly: is this value what you think it
     is? Is this function even being called? Is this branch actually
     taken?

5. **Find the root cause, not just a symptom.**
   - Prefer understanding *why* the bug happens over a change that
     merely makes the symptom disappear (e.g. swallowing an exception,
     adding a null check that masks a deeper data problem).
   - If a quick patch is applied under time pressure, say explicitly
     that it's a workaround and what the underlying issue still is.

6. **Fix minimally and verify.**
   - Make the smallest change that addresses the root cause.
   - Re-run the original repro/failing test to confirm it now passes.
   - Run the broader test suite to check for regressions elsewhere.
   - Add a regression test that would have caught the bug, if one
     doesn't already exist.

7. **Explain the fix.**
   - Summarize: what was broken, why it was happening, and what
     changed — concisely, so the reasoning is auditable later.

## Anti-patterns to avoid

- Changing multiple unrelated things at once "to see if it helps."
- Catching/suppressing an error without understanding why it occurred.
- Declaring victory because the specific symptom went away without
  confirming the actual root cause was addressed.
- Skipping reproduction and reasoning purely from reading code.
