Written answers — Ian Miztli Perez Aguirre

Authorship declaration

I used AI only to create this file and set up the given structure. The content here is 100% mine.

Q1 — Production correctness validation

CVnizer was my thesis project: a web system that generates ATS-compatible CVs through a chatbot interview. Its core correctness rule is an architectural invariant: a deterministic finite automaton (DFA) controls the conversation flow, and the LLM never does. The LLM only extracts data or scores an answer inside a state; it never decides the next transition. Every transition is computed in code from a signal already normalized to the automaton's alphabet.

The correctness mechanism I care about most is a set of grounding guards that run before any answer is saved to the profile. One concrete bug it caught: users were copying the example values from the prompt itself ("Ana López, Tech Lead at CompanyX", a sample phone number), and the extractor was saving those placeholders as if they were real data. I added a placeholder-echo detector that flags the echoed markers, forces a neutral signal, and blocks extraction before the value is persisted. A replay test over a real evidence log now locks this in, so the bug cannot come back silently.

What I would do differently: put the whole project under version control from day one. Right now bug traceability lives in code comments and evidence logs instead of commits, which makes the history harder to audit.

Q2 — Scaling-forced structural change

WikiCID was a semantic search system over about 900 companies, built on MongoDB Atlas with multilingual embeddings. The first version routed each query to a single collection with a flat classifier (search_target: companies, products, or both), assuming one query mapped to one collection.

As the catalog grew — a new products collection and a restructured alliances model — that assumption broke. Queries like "Argentine companies with ERP products" were no longer one search but two, chained by a join on company_id. There was also a cost signal: we served 1,000–10,000 queries/day and hit a 70B model with 2,000+ token prompts on every routing call.

So I evolved the flat classifier into a query planner with a simple mode and a chained mode, running the steps in order with the join. I also proposed splitting the models: routing and parsing (high frequency, per query) would move to a small llama-3.1-8b, keeping the 70B only for occasional batch enrichment.

I worked mostly solo here, so the resistance was not a person but a design tension: dropping routing to an 8B model risked worse intent classification. My decision rule settled it — a query that needs two collections is planned as chained steps, never forced through one classifier; and high-frequency per-query work goes to the cheapest model that holds quality, with the expensive model reserved for batch.

Q3 — A time you rejected AI output (or accepted bad output and changed your process)

My project lead questioned the results of my RAG chatbot in WikiCID. His objection came from his own ChatGPT, but he never gave that model any context: not my stack, not the repo, not my design sessions with my own agents. Worse, he framed it as my RAG competing against the raw behavior of ChatGPT.

The signal that flipped my judgment was that the comparison was unfair. My RAG is scoped to my MongoDB collection and my embeddings — a bounded, domain-specific system. Raw ChatGPT answers from general world knowledge. They have different purpose and scope, so a head-to-head "performance" number between them means nothing.

What I did was separate signal from noise. I rejected the unfair benchmark, but I did not throw away the whole summary: I took the one useful idea in it — running an LLM pass to enrich the semantic text before embedding it — and applied it to my pipeline.

The lesson I kept: an LLM recommendation made without the system's real context (stack, repo, decision history) cannot outweigh a decision made with that context — but I still mine it for the part that genuinely applies.
