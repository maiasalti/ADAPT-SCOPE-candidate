---
name: efficient-code-checker
description: Analyzes code for performance and efficiency issues — unnecessary work, poor algorithmic complexity, wasteful I/O or memory use — and suggests concrete improvements. Use when asked to check performance, optimize, or when reviewing code that runs on hot paths or large inputs.
---

# Efficient Code Checker

A general-purpose skill for evaluating whether code is efficient, and
recommending fixes when it isn't. Applies broadly, not tied to any one
language or project.

## When to use this skill

- Explicitly asked to check performance, optimize, or "make this
  faster/more efficient."
- Reviewing code that processes large inputs, runs frequently (hot
  paths, request handlers, loops over data), or has visible latency.
- Before shipping code where scale (data size, request volume) is a
  known concern.

## What to check

1. **Algorithmic complexity**
   - Identify nested loops, repeated linear scans, or repeated lookups
     over the same collection that could be replaced with a map/set
     for O(1) lookup instead of O(n).
   - Watch for accidental quadratic (or worse) behavior: e.g. `.includes()`
     or `.find()` inside a loop over another collection.
   - Check recursive code for redundant recomputation (missing
     memoization) or lack of a base case that bounds work.

2. **Unnecessary work**
   - Repeated computation of the same value inside a loop that could
     be hoisted outside it.
   - Re-parsing, re-serializing, or re-fetching data that's already
     available.
   - Work being done eagerly that's never used (unused branches,
     over-fetching fields/rows beyond what's needed).

3. **I/O and external calls**
   - N+1 query/request patterns — a call to a DB/API inside a loop
     instead of batching.
   - Missing pagination/streaming when handling large datasets or
     files (loading everything into memory at once).
   - Synchronous/blocking calls on a path that could be concurrent or
     async, where correctness doesn't require sequencing.

4. **Memory use**
   - Unbounded caches, arrays, or buffers that grow without limit.
   - Copying large structures unnecessarily instead of operating on
     them in place or via references (where safe to do so).
   - Holding onto large objects/resources longer than needed (not
     releasing connections, file handles, listeners).

5. **Data structure fit**
   - Using a list where a set/map would make membership checks or
     lookups cheaper.
   - Sorting or scanning repeatedly when the data could be indexed or
     sorted once and reused.

## How to report findings

- Point to the specific hot spot (file/line/function) and describe
  the current complexity or cost (e.g. "O(n²) due to `.find()` inside
  a loop over the same array").
- Propose a concrete, minimal alternative — don't just say "this is
  slow."
- Prioritize fixes that matter for realistic input sizes/traffic over
  micro-optimizations with no measurable impact; don't recommend
  premature optimization for code that isn't on a hot path or doesn't
  handle meaningful scale.
- If correctness or readability would be meaningfully sacrificed for a
  marginal speed gain, say so and let that trade-off be a decision,
  not a silent choice.
- If the code is already efficient for its actual scale, say so
  rather than inventing changes.
