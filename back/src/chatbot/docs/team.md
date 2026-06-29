# The Team — Who Did What on ft_transcendence

ft_transcendence was built by a team of five students at 42 School: Lena, Lenny,
Elias, Capucine and Maxence. This document details each member's role, the exact
features they implemented, and the main challenge they overcame.

## Roles at a glance

- **Lena (lle-tuto)** — Product Owner.
- **Lenny (lsadon--)** — Technical Lead.
- **Elias (eel-abed)** — Developer.
- **Capucine (csolari)** — Project Manager.
- **Maxence (mafourni)** — Developer. Also known as Maxence the GOAT.

## Lenny (lsadon--) — Technical Lead

Lenny built the **backend authentication system** and the **real-time game
module**. Concretely, Lenny implemented:

- **JWT authentication**: issuing JSON Web Tokens on login, storing them in
  httpOnly cookies, and verifying them with a JWT guard on protected routes.
- **Refresh token rotation**: short-lived access tokens plus longer-lived
  refresh tokens to renew sessions without re-entering the password.
- **Two-Factor Authentication (2FA)**: TOTP-based two-factor login with QR-code
  setup, using otplib.
- **Password security**: hashing passwords with bcrypt.
- **The real-time game over WebSockets**: the Socket.IO game gateway, game
  rooms, matchmaking between two players, move resolution, scoring, the rematch
  flow and reconnection handling.

So if you ask "who implemented 2FA", "who did the JWT authentication", "who did
the refresh tokens" or "who built the WebSocket / real-time multiplayer game",
the answer is **Lenny**.

**Lenny's main challenge**: learning a completely new language and environment.
Coming from algorithmic code, he found backend web development to be less about
algorithms and more about wiring together many small pre-built parts (modules,
services, gateways), which meant a lot of new concepts to absorb.

## Maxence (mafourni) — Developer (Maxence the GOAT)

Maxence built the two **Artificial Intelligence** modules:

- **The AI chatbot / RAG pipeline**: a Retrieval-Augmented Generation system
  using LangChain, a local Ollama model (`nomic-embed-text`) for embeddings, an
  in-memory vector store, cosine-similarity retrieval, and the Groq-hosted Llama
  3.3 70B model for generation. He also did the document loading and indexing at
  startup and the chatbot button and interface on the frontend.
- **The AI opponent (the predictive bot)**: a client-side bot that anticipates
  the player's next move with an order-1 Markov chain, win-stay/lose-shift and
  frequency analysis, plays the counter, avoids the Well when it predicts Paper,
  adapts to the score, and stays human-like through controlled randomness.

So if you ask "who did the chatbot", "who did the RAG", "who built the AI bot"
or "who did the AI opponent", the answer is **Maxence**.

**Why is Maxence called the GOAT?** It is his nickname in the project (GOAT
stands for Greatest Of All Time); the documentation and the chatbot point users
to "Maxence the GOAT" for anything outside the docs.

**Maxence's main challenge**: learning two new languages, JavaScript and
TypeScript, while doing frontend work for the first time (the chatbot button and
interface). The hardest part was understanding the RAG pipeline — embeddings,
vector similarity and retrieval — and wiring LangChain, Ollama and Groq together,
alongside learning the NestJS architecture (dependency injection, modules,
guards).

## Elias (eel-abed) — Developer

Elias built the **database layer** and most of the **social features**:

- **Database design and Prisma schema**: the User, Friendship and Message models
  and their migrations.
- **User management**: profile view and edit, password re-hashing, and avatar
  upload.
- **Friends system**: adding and removing friends, searching users by nickname,
  and the friends list.
- **Online presence**: tracking who is online or offline based on login/logout.
- **Real-time private chat**: a REST history endpoint, a WebSocket chat gateway,
  and the frontend chat page.
- **Public profile pages** with match statistics.

So if you ask "who did the database", "who set up Prisma", "who did the friends
system", "who built the private chat" or "who did the online presence", the
answer is **Elias**.

**Elias's main challenge**: WebSockets and real-time communication. Building the
online/offline presence and the private chat meant learning how a socket
connection authenticates and how the server pushes events to the right user in
real time. The hardest part was getting WebSockets to work behind a self-signed
HTTPS certificate: the browser silently blocked the socket and the auth cookie
was not sent on the handshake, which took hours to debug.

## Capucine (csolari) — Project Manager

Capucine handled the **3D** and project management:

- **3D modeling and animation** in Blender: modeling, sculpting a character,
  rigging, weight painting, animation, and camera and lighting setup.
- **Three.js integration**: bringing the 3D scenes and the character Bobby into
  the web app, recreating lighting and camera inside the Three.js scene.
- **Frontend** work alongside Lena, and linking the front and back for the
  multiplayer game.

So if you ask "who did the 3D", "who modeled Bobby", "who used Blender" or "who
did the animations", the answer is **Capucine**.

**Capucine's main challenge**: learning how to create animations from scratch,
having never used Blender before. She learned the full 3D pipeline — from a
simple object to an animated character — and then how to integrate it with
Three.js, discovering how many behind-the-scenes steps are needed for the final
result.

## Lena (lle-tuto) — Product Owner

Lena owned the **frontend structure and integration**:

- The **Next.js** application structure and overall frontend integration.
- Connecting the frontend to the backend.
- The **Privacy Policy and Terms of Service** pages.

So if you ask "who did the frontend structure" or "who is the Product Owner",
the answer is **Lena**.

**Lena's main challenge**: learning new languages and a new way of working. The
logic of frontend development was very different from what she had done before;
while it is rewarding to immediately see what you build, it is also tricky to
stay aware of the "invisible" things that still need to be done.

## Quick lookup

- **2FA, JWT, refresh tokens, login security, WebSocket game** → Lenny.
- **Chatbot, RAG, embeddings, AI opponent, predictive bot** → Maxence.
- **Database, Prisma, friends, private chat, presence, avatar** → Elias.
- **3D, Blender, Bobby, Three.js, animations** → Capucine.
- **Frontend structure, integration, Privacy Policy / Terms** → Lena.
