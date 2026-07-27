// grading verification test 4
# FinGuard

A small insurance-claims API used for internal SCOPE assessments.

## How this assessment works

You direct an AI coding agent by chatting with it — you don't run commands
yourself. The agent already has this repo checked out in its own sandboxed
environment and can read files, edit code, and run shell commands (installing
dependencies, running tests, starting the server, etc.) whenever you ask it
to. Tell it what you want done, one step at a time, and it'll do the work and
report back.

A live copy of the repo is synced to your machine as the agent works, so you
can open it in your own editor to read the code. Treat it as read-only,
though — edits you make there directly won't reach the agent or count toward
your submission. Any change you want made has to go through the agent.

## Working on a ticket

See `TICKET.md` for the current task and `CLAUDE.md` for the engineering
guardrails your changes are expected to follow. If you want the existing
behavior verified or the server running so you can try requests against it,
just ask the agent — e.g. "run the existing tests" or "start the dev server
on :3000."
