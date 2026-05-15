# Submission

**Six artifacts.** Send them as a single email to the recruiter you've been talking to. Subject line: `Challenge submission — <your full name>`.

Some of these artifacts must be written by *you*, without AI assistance. We say which ones below, and we mean it. **AI-laundered written deliverables are an automatic decline** — they make the rest of the submission unscoreable.

---

## What must be human, what can use AI

| Artifact | AI allowed? | Why |
|---|---|---|
| `decision_log.md` | **No** — human-written | Measures your reasoning, judgment, and ability to argue without overclaiming. |
| `validation_design.md` | **No** — human-written | Measures *your* call on how to make AI-augmented code safe. The whole point. |
| `signoff.md` | **No** — human-written | First-person attribution language is the signal. AI cannot author it authentically. |
| `written_answers.md` | **No** — human-written | Real past-tense stories from systems you have owned. We are testing how *you* tell them. |
| `prompt_history.md` | **Yes — must be raw transcript** | This file *is* the AI conversation. Do not summarize, polish, or curate it. |
| **Commit messages** | **No** — human-written | The narrative of your work in your own voice. AI commit-message helpers are obvious and lower your score. |
| Code, tests, configs | **Yes — open** | We expect heavy AI use here. The signal is how you direct, review, and decide — not whether you typed every character. |

Each human-written artifact must open with a one-line **authorship declaration** (template provided). Mislabeling — claiming "no AI" on a doc that is clearly AI-generated — is treated as evidence of dishonesty and surfaces in the interview.

---

## 1. Link to your fork

A GitHub URL to your public fork of this repository. Your work should be on `main` or on a clearly named branch (`my-name/challenge` or similar). Include a real commit history — small commits with **descriptive, human-written messages** help us trace your reasoning.

A fork with one giant commit titled "implement challenge" tells us nothing. Multiple commits with messages like *"refactor: extract X to its own module — Y reason"* tell us how you sequenced the work.

If your fork is private, share it with the GitHub user named in the recruiter's email.

---

## 2. `decision_log.md` — human-written

Place this file at the root of your fork. Use the template (`decision_log.template.md`). **Two pages maximum.**

The template asks for, per issue:

- What was wrong/weak
- Shape of your improvement (and what other shape you rejected and why)
- **Your confidence (1–10)** in the fix
- **What would falsify the fix** — a specific scenario that would prove you wrong
- **Where you disagreed with Claude** during the fix (the rejected suggestion, the alternative shape, the over-scoped refactor)

Plus: feature choice + rationale, things noticed but not fixed, intentional non-changes, and a final section listing **three places where you felt uncertain**.

"I had no uncertainty anywhere" is itself a red flag and will be probed in the interview. Honest calibration is a strength signal.

**Specificity matters.** *"I refactored the data access"* is weaker than *"I moved the metrics queries to go through `ordersDal` because the existing pattern was a coupling smell, but I left the DAL itself unchanged to minimize risk."*

---

## 3. `validation_design.md` — human-written

Place this file at the root of your fork. Use the template (`validation_design.template.md`). **~300 words.**

Anyone with a competent AI tool can fix the symptoms in this codebase. What separates an architect is *building the validation layer that catches the class of bug next time*. For each issue *class* you addressed, name the gate you built (or would build with more time) that prevents the class — property test, golden test, CI rule, type constraint, architecture rule, eval suite. "Added a regression test" is the floor; what's the gate?

We expect 1–3 *real* gates designed deliberately, not a 10-bullet wall of generic suggestions.

---

## 4. `signoff.md` — human-written

Place this file at the root of your fork. Use the template (`signoff.template.md`).

One line per meaningful commit. Pick one of three shapes per line:

- ✅ *I have read this. I checked X. I would stake my name on it shipping to a 1.5k-RPS production system tonight.*
- ⚠️ *I have read most of this. Confident on X, uncertain on Y. I'd want Z before staking my name on prod.*
- ❌ *I have NOT fully read this. Claude generated it; I accepted because X. Risks I accept: Y.*

A mix is expected. A submission claiming ✅ on every commit reads as performance, not signal — we score honest accounting higher than performed thoroughness.

---

## 5. `prompt_history.md` — raw AI transcript

Place this file at the root of your fork. Use the template (`prompt_history.template.md`). **Raw, unedited.**

If you used multiple tools (Claude Code + ChatGPT, etc.), separate them with headings. If you used AI for **less than half** of the work, say so at the top and list what you used it for.

If you did not use AI **at all**, the file should contain a single line: `Did not use AI for this challenge.` We will ask about this in the interview.

**Mandatory final section: "What Claude (or your AI tool) got wrong."** Three or more specific examples of AI output you rejected, corrected, or had to re-prompt. If you cannot fill this section, that itself is the signal — either nothing was reviewed, or the review left no trace.

---

## 6. `written_answers.md` — human-written

Place this file at the root of your fork. Use the template (`written_answers.template.md`). Three questions, ~200 words each.

**Real past-tense stories from systems you have actually worked on.** Hypothetical answers (*"I would…"*) score much lower than concrete past-tense ones (*"Last year on X, I…"*).

### Question 1
> Describe a system you owned where you had to add production correctness validation — alarms, contract tests, golden datasets, something that caught a class of bugs before users did. What did you do, what worked, what didn't, and what would you do differently?

### Question 2
> Describe a system you've worked on where scaling — traffic, data volume, team size, or geography — forced a structural change to the code or architecture. What changed, who pushed back, and how did you decide?

### Question 3
> Describe a specific moment in real work where you rejected AI output that you initially thought was correct, **or** accepted AI output that turned out to be wrong. Be concrete: what was the task, what was the output, what was the signal that flipped your judgment, and what did you do next?

If you don't have a real story for one of these questions, write a short paragraph saying so honestly and use the space to describe the closest related experience. **We prefer honest "I haven't faced this yet" over AI-generated fabrication.**

English doesn't have to be polished. We score substance and specificity, not grammar.

---

## On voice consistency

We read every artifact looking for one signature: *does this sound like the same person who wrote the other artifacts*? Polished AI-style prose in `decision_log.md` against colloquial human prose in `written_answers.md` is a tell, and it is one of the most reliable cheating signals we have. The honest move is: write everything yourself, in your own voice, even if your voice isn't polished.

---

## Anti-patterns we see often

- Submitting a beautifully-formatted decision log that just repeats what's in the README.
- A `prompt_history.md` with no false starts and no "Claude got wrong" examples — pure curation.
- Q1–Q3 written in startup-blog prose ("leveraging best practices", "moving the needle") with no concrete past systems named.
- A fork with one giant commit titled "implement challenge" — we can't see your thinking from one commit.
- An authorship declaration claiming "no AI" on a doc that reads as obviously AI-generated. We will surface this in the interview, and it will be the question we lead with.
- A `signoff.md` where every line is ✅ — calibration failure.
- A `validation_design.md` of 10 generic gates with none actually present in the diff — checklist theater.

---

## Privacy and retention

We retain submissions for the duration of the hiring decision plus 90 days, then delete them. We do not share submissions outside the hiring committee. By submitting, you consent to this.
