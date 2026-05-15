# How we evaluate this challenge

Read this before you start. It tells you what we look for and — just as importantly — what we don't.

---

## The premise

Modern engineering is shifting. AI tools have made writing code dramatically cheaper. What's becoming scarcer is the ability to **decide what to build, identify what's wrong, communicate decisions clearly, and own outcomes past the merge button.**

That shift is what this challenge tries to measure. It does not measure typing speed, framework familiarity, or how many fixes you can push in an hour. It measures judgment.

---

## What we look at, ordered by what matters most

### 1. How you reason about boundaries

Software has seams — between modules, between services, between teams, between humans and AI. Strong engineers spot the seams, name them, and design across them deliberately. Weak engineers ignore them.

In this challenge: when you address an issue or add a feature, do you notice when your change crosses a seam? Do you name the seam? Do you propose a clean shape for it, or do you patch the symptom?

### 2. How you direct AI — and where you draw the line

We expect you to use AI tools on the code. We want to see the prompt history.

A good engineer with AI looks like: clear specifications, constraints stated upfront, edge cases considered before the first prompt, critical review of the output, and refinement based on root-cause diagnosis when something is wrong. The mandatory "what Claude got wrong" section in your prompt history is where you show us the critical review actually happened.

A weak engineer with AI looks like: short prompts, blind acceptance of output, frustrated re-prompts when something fails, and a final result the engineer cannot fully explain.

We score the prompt history independently from the code.

**But we also score where you *don't* use AI.** The written deliverables (decision log, validation design, sign-off, written answers, commit messages) must be human-written. We score the quality of *your* reasoning, *your* storytelling, *your* voice — not how well you direct AI to imitate them. The line is explicit so we can score both sides cleanly: AI is a tool you use on the code; the writing is how you show us you can think.

### 2b. How you build the validation layer

Anyone with a competent AI can fix the symptoms in this codebase. The architect-tier signal is whether you build the *gate* that catches the next instance of the same class of bug — property tests, golden tests, CI rules, type constraints, architecture rules, eval suites. The `validation_design.md` artifact is where you make this case.

The architect is not the speed loop; the architect is the quality gate.

### 3. How you own the outcome

Did you stop when the test passed, or when the behavior in the browser was actually right? Did you run the dashboard yourself and click through it? Did you update the docs you changed? When you found one issue, did you ask whether the same class of problem exists elsewhere?

### 4. How you communicate decisions in writing — in your own voice

Your decision log, validation design, sign-off, and written answers are weighted equally with the code, and they must be written by you. A candidate who submits brilliant code but thin or AI-laundered writing gives us less signal than a candidate who submits competent code and clear human writing about why.

We read for: specificity, honesty about tradeoffs, the ability to argue a point without overclaiming, **confidence calibration** (which fixes are you certain about, which are you guessing on, and how do you know?), and **disagreement-naming** (where did you push back on Claude — or on your own first instinct?). The decision-log template asks for these explicitly.

We also read for **voice consistency across artifacts**. Polished AI-style prose in `decision_log.md` against colloquial human prose in `written_answers.md` is one of the most reliable cheating signals we have. The honest move is: write everything yourself, in your own voice, even if your voice isn't polished.

### 5. How you handle ambiguity

We deliberately under-specify some things. We don't tell you what to improve or exactly what shape the feature should take. We want to see what you do with that.

Strong engineers make a call, write down what they chose and why, and move forward. Weak engineers freeze or ask the recruiter for clarification we will not provide.

A note on scope: we are not asking you to "find the bugs the team planted." We are asking you to evaluate this codebase as a senior engineer would, surface what's wrong or weak, and decide what's worth your time. The issues range from concrete defects (something is computed wrong) to architectural smells (something works today but won't tomorrow) to gaps (something is missing that ought to be there). Every category counts.

---

## What we do NOT evaluate

- **Whether you know our codebase or our methodology.** You don't. We've never met. We will not penalize you for not using our preferred vocabulary.
- **Whether your tech stack matches ours.** This challenge uses Node + TypeScript + SQLite because those are universally known. Use whatever idioms you're comfortable with for the feature.
- **Whether you finished everything.** Two thoughtful improvements with a clear decision log beat five sloppy ones with no writing. Quality > quantity.
- **Whether you used AI on the code.** We expect you to. The signal is *how*, not *whether*.
- **How fast you ship.** ~6 hours is a guideline. Working longer doesn't help; working faster doesn't hurt.
- **The polish of your English.** We score substance, specificity, and honesty in the writing — not grammar. Rough non-native prose with a real story beats AI-polished prose with no story.

---

## What disqualifies a candidate

These are not gut-check disqualifiers; they're things that consistently produce no-hire decisions when we discuss them in committee.

- **AI-laundered written deliverables.** If `decision_log.md`, `validation_design.md`, `signoff.md`, or `written_answers.md` reads as AI-generated — voice mismatch with other artifacts, polished startup-blog prose, parallel-structure paragraphs, vague past-tense, no false starts — we treat it as a decline. The authorship declaration at the top of each artifact is binding; mislabeling is an integrity issue.
- **Empty or fabricated prompt history.** If you tell us you used AI, give us the real prompts. If you didn't use AI at all, say so. Polished, curated prompt histories without false starts read as fabrication.
- **A `signoff.md` where every line is ✅.** Calibration failure. Honest accounting beats performed thoroughness.
- **A `validation_design.md` that's 10 generic gates with none actually built.** Checklist theater.
- **A decision log that just describes what the code does.** We can read the code. We want to know *why*, *how confident you are*, and *where you disagreed*.
- **Fixes that paper over the symptom without naming the cause.** If you wrap a query in a try/catch to silence an error, tell us in the decision log that you knew you were doing that and what the real fix would be.
- **Submitting work you can't explain.** The follow-up technical interview will walk through specific lines of your code, specific prompts in your history, and specific choices in your decision log. If you can't narrate them, the gap will be visible.
- **One giant commit titled "implement challenge".** We can't see your thinking from one commit. Multiple human-written commit messages are part of the score.

---

## After you submit

If your submission moves forward, we'll set up a **60-minute technical conversation**. It is not a coding interview. It is a discussion about the choices you made: which issue you tackled first and why, how you used AI for which parts, what you'd do differently with more time, and one or two past-tense behavioral questions about production systems you've owned.

You'll know within a week of submitting whether you're moving on.
