# Glossary — ft_transcendence

A reference of the terms used across the project, the game and the AI features.

## Game terms

**Rock** — A base move. Beats Scissors. Loses to Paper and to the Well.

**Paper** — A base move. Beats Rock and the Well. Loses to Scissors.

**Scissors** — A base move. Beats Paper. Loses to Rock and to the Well.

**Well** — The bonus fourth move, unlocked at level 2. Beats Rock and Scissors,
and loses only to Paper. Powerful but risky because of the Well penalty.

**Base moves** — The set of moves available on levels 0 and 1: Rock, Paper,
Scissors. The bot is restricted to these on those levels.

**Tie** — When both players choose the same move. No one scores.

**Round** — A single exchange of moves that produces a win, a loss or a tie.

**Match** — A sequence of rounds played until a player reaches the target score
(5 on level 0, 10 on levels 1–3).

**Level** — One of four difficulty stages (0 to 3) that change the target
score, whether the Well is available, the Well penalty, and which combos exist.

**Well penalty** — From level 2 onward, losing a round while you played the Well
costs 2 points instead of just losing the round. Score never goes below 0.

**Combo** — A bonus point earned by playing a special winning sequence of three
moves in a row. Levels 1 and 2 have three-of-a-kind combos; level 3 adds extra
patterns and the giga-combo.

**Giga-combo** — The level 3 combo for playing three Wells in a row.

## AI bot terms

**AI opponent / bot** — The computer-controlled adversary. It is a client-side
predictive agent, not a machine-learning model. It anticipates the player's
next move and plays the counter.

**Prediction distribution** — A probability over the player's possible next
moves, built by the bot each round.

**Frequency analysis** — One prediction signal: how often the player has used
each move overall.

**Transition model (order-1 Markov chain)** — One prediction signal: given the
player's last move, which move tends to follow it, learned from the full
history.

**Win-stay / lose-shift** — One prediction signal: players tend to repeat a move
that just won and switch after a move that just lost.

**Blend** — Combining the frequency, transition and result-conditioned signals
into a single prediction distribution.

**Argmax** — Taking the most likely predicted move from the distribution. The
bot then plays the counter to that move.

**Counter** — The move that beats a given move. The bot plays the counter to its
prediction of the player's move.

**Epsilon-greedy / controlled randomness** — With a fixed probability the bot
ignores its prediction and plays a random move, keeping it human-like and
unexploitable.

**Well-risk avoidance** — From level 2, the bot refuses to play the Well when it
predicts the player is likely to play Paper, since Paper beats the Well.

**Streak reinforcement** — From level 1, when the bot has played the same move
twice in a row it tends to favor repeating it.

**Score adaptation (rubber-banding)** — The bot adjusts how random and how risky
it plays based on the score gap, playing more carefully when behind.

## Technical terms

**RAG (Retrieval-Augmented Generation)** — A technique where relevant documents
are retrieved first and given to a language model as context so it answers from
real facts instead of inventing them.

**Embedding** — A numeric vector that represents the meaning of a piece of text.
Texts with similar meaning have nearby vectors.

**Vector store** — The collection of document chunks and their embeddings used
for retrieval. In this project it is held in memory and rebuilt at startup.

**Chunk** — A small slice of a document. Long documents are split into chunks
before embedding so retrieval can return precise passages.

**Cosine similarity** — A measure of how aligned two vectors are, used to rank
which chunks are most relevant to a question. 1 means very similar, 0 means
unrelated.

**LLM (Large Language Model)** — The model that generates the natural-language
answer. Here it is Llama 3.3 70B served through Groq.

**Embedding model** — The model that turns text into vectors. Here it is
`nomic-embed-text` run locally through Ollama.

**Token** — In authentication, a signed credential (JWT) proving identity. In
language models, a unit of text the model processes.

**JWT (JSON Web Token)** — A signed token used to authenticate requests without
resending the password.

**TOTP** — Time-based one-time password, the codes used for 2FA.

**ORM** — Object-Relational Mapper (Prisma here) that lets you query the
database in TypeScript instead of raw SQL.

**WebSocket** — A persistent, two-way connection used for real-time features
(the live game and the chat).

**Reverse proxy** — nginx here, which terminates TLS and routes requests to the
right service, stripping the `/api/` prefix before forwarding to the backend.
