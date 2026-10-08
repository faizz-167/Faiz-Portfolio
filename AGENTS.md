# My-portfolio

## How we work

Spec driven. Nothing gets built without a spec.

- `implmentation plan/specs/phase-NN.md` — one per phase, written just before it starts.
  Behaviour and an acceptance check, never filenames.
- This file — always true, read on every prompt.

**Starting a phase.** Read this file and that phase's spec. Build what the spec
asks and stop.

**Dropped into a fresh context and don't know where we are?** Look at which
files exist in `implementation plan/specs/`, then the git log. The last commit is the last
phase that passed. Tell me what you've worked out before building on it.

**When a phase comes out wrong, I reset rather than patch.** Prompting on top of
wrong code three times leaves code nobody understands, including you. So if a
spec is ambiguous, say so _before_ you build.

## How to talk to me

Short. If a sentence isn't telling me something I need, cut it.

**Ask with an answer attached.** One specific question, and say which way you'd
go and why. "A or B, I'd take B because it keeps the parser standalone" is
answerable in two seconds. An open question isn't. Never pick a direction
silently, never build both.

**When you need something only I can give you** — a key, a token, a value in
`.env.local` — say exactly what and exactly where, then stop.

**No walls of text.** Don't summarise every file you touched or restate the plan
back to me. When a phase is done, say what it does and what the check should
show, in a few lines.

**Plain English.** If you're reaching for a bulleted breakdown of something
that's one sentence, it's one sentence.

**Say when something didn't work.** A failure worked around quietly costs me an
hour later.

## Conventions

Strict TypeScript, no `any`. If a type is genuinely awkward, tell me rather than
casting.

Comment the decisions, not the syntax.

Every AI call has a cache read inside its trace, so a cache hit shows up as a
recorded run with no model call in it.

One obvious way to do something beats a configurable one.

## Things not to do

Breaking one of these is worse than not finishing.

- **Never decide that two files are connected.** An edge exists because the
  parser resolved a real import to a real file. Unresolved gets reported with a
  reason, never guessed.
- **Don't install a package without asking.** Name it, say what for, wait.
- **Don't build ahead of the current phase.** No scaffolding for what's coming.
- **Don't grade the code.** No scores, ratings, severity or "issues found". This
  explains a codebase, it doesn't review one.
- **Don't leave the build broken.** Tell me about a failure instead of working
  around it.
- **Don't weaken a check to make it pass.** A check that can't run has to fail
  loudly.
