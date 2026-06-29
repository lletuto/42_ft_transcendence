# Project Overview — ft_transcendence

ft_transcendence is a full-stack, real-time multiplayer web platform built
around a custom Rock-Paper-Scissors game. It was created as a group project at
42 School by Lena, Lenny, Elias, Capucine and Maxence.

## What the platform does

The platform lets a user create an account, log in securely, manage a profile,
add friends, chat privately in real time, play single-player matches against an
AI bot, and play live multiplayer matches against other users over WebSockets.
On top of the classic Rock-Paper-Scissors rules it adds a fourth move, the Well,
plus a combo system and a four-level progression. The game is rendered in a 3D
scene. The platform also ships an AI-powered assistant (a chatbot) that answers
questions about the project using a Retrieval-Augmented Generation pipeline.

## Main features

- Secure authentication: email/password signup and login, JWT stored in an
  httpOnly cookie, refresh-token rotation, and optional two-factor
  authentication (2FA) with a TOTP app.
- User management: profile with avatar, nickname, last-seen status, and
  win/loss statistics.
- Friends: send, accept and remove friends; see a friends list.
- Real-time private chat between users.
- Single-player game against the AI bot across four levels.
- Real-time multiplayer matches between two remote players over WebSockets.
- Match history and win/loss statistics per user.
- A 3D game scene with animated characters built in Blender and integrated with
  Three.js.
- An AI chatbot (RAG) that answers questions about the game and the project.
- Privacy Policy and Terms of Service pages.

## High-level architecture

The project has three components, all orchestrated with Docker Compose and
started with a single command:

- Frontend: a Next.js application (JavaScript/React) that renders the UI, the
  3D scene and the chatbot widget.
- Backend: a NestJS application (TypeScript) exposing a REST API and a WebSocket
  gateway, with authentication, the game logic and the RAG service.
- Database: PostgreSQL accessed through the Prisma ORM.

An nginx reverse proxy terminates TLS (HTTPS) and forwards requests to the
frontend and backend, stripping the `/api/` prefix before reaching the backend.

## How the work was organized

Each member owned a domain of the project while integrating with the others:
authentication and the WebSocket game module, the 3D creation and integration,
user management and chat, the database design, and the AI chatbot. The team
coordinated through a shared Git repository, with work split by feature so that
every member implemented and can explain their own modules.
