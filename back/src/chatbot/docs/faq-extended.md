# Extended FAQ — ft_transcendence

This is a longer list of frequently asked questions about the game, the
account system, the social features, the 3D interface and the AI features.

## Accounts and authentication

**Q: How do I create an account?**
A: From the landing page, open the sign-up form, enter your email, a nickname
and a password, then submit. Your password is hashed with bcrypt before it is
stored, so it is never kept in clear text.

**Q: I forgot to log out on another machine. Is my password exposed?**
A: No. The server never stores or transmits your password in clear text. Login
issues a signed JWT that is kept in an httpOnly cookie, so it is not even
readable by JavaScript in the browser.

**Q: What is 2FA and how do I enable it?**
A: Two-Factor Authentication adds a second step at login using a time-based
one-time password (TOTP). You enable it from your profile: the server shows a
QR code, you scan it with an authenticator app (Google Authenticator, Authy,
etc.), and from then on you must enter the 6-digit code at login.

**Q: What is a refresh token?**
A: The access token used to authenticate requests is short-lived for security.
The refresh token is longer-lived and lets the app silently obtain a new access
token without asking you to log in again.

**Q: Why do I stay logged in after closing the tab?**
A: The JWT cookie persists until it expires or until you log out, so reopening
the site keeps your session as long as the token is still valid.

**Q: Can I change my nickname or avatar?**
A: Yes, from your profile page you can edit your nickname and upload a new
avatar image.

## Playing the game

**Q: How do I start a game against the bot?**
A: Click "Play", then "Against the bot". You begin at level 0.

**Q: How do I play against another person?**
A: Click "Play", then "Multiplayer". You are matched into a game room and play
in real time over a WebSocket connection.

**Q: What happens if I lose my internet connection mid-game?**
A: The real-time layer (Socket.IO) attempts to reconnect automatically, and the
game supports rejoining a room so you can get back into an ongoing match.

**Q: How many points do I need to win a match?**
A: On level 0 you need 5 points. On levels 1, 2 and 3 you need 10 points.

**Q: What moves can I play?**
A: Rock, Paper and Scissors on every level. The Well is added starting at
level 2.

**Q: What beats what?**
A: Rock beats Scissors. Paper beats Rock and the Well. Scissors beat Paper. The
Well beats Rock and Scissors and loses only to Paper. Identical moves tie.

**Q: Why did I lose 2 points at once?**
A: From level 2 onward, if you play the Well and lose that round, you are
penalized 2 points instead of simply losing the round. Your score never drops
below 0.

**Q: What is a combo?**
A: Playing a special winning sequence of three moves in a row awards a bonus
point. Level 1 introduces three-Rock, three-Paper and three-Scissor combos.
Level 3 adds more patterns and a giga-combo for three Wells.

**Q: Are combos available on level 0?**
A: No. Level 0 has no combos. They start at level 1.

**Q: What is the difference between the levels?**
A: Level 0 is a short introduction (first to 5, no Well, no combos). Levels 1
to 3 are first to 10 and progressively add combos, the Well, the Well penalty
and extra combo patterns.

## The AI bot opponent

**Q: Does the bot cheat or read my move?**
A: No. The bot never sees the move you are about to play. It only predicts your
next move from your move history and the result of the previous round.

**Q: How many difficulty settings does the bot have?**
A: One. The game ships a single tuned difficulty.

**Q: Can the bot use the Well?**
A: Yes, from level 2 onward, exactly like the player. On levels 0 and 1 the bot
only uses Rock, Paper and Scissors.

**Q: Why does the bot sometimes seem to play randomly?**
A: That is intentional. The bot mixes in controlled randomness so that it never
becomes fully predictable and a player cannot exploit a fixed counter pattern
against it.

**Q: Why does the bot get harder when I am winning?**
A: The bot adapts to the score. When it is behind it plays more carefully and
less randomly to claw back points; when it is ahead it can afford to take more
risks.

## Social features

**Q: How do I add a friend?**
A: Search a user by nickname and send a friend request from their profile. Once
added, they appear in your friends list with their online status.

**Q: Can I see who is online?**
A: Yes. The presence system shows whether each of your friends is currently
online or offline.

**Q: How does the private chat work?**
A: You can open a real-time private conversation with a friend. Messages are
delivered instantly over a WebSocket connection and stored so you can read the
history later.

**Q: Where can I see my match history and statistics?**
A: On your profile and public profile pages, which show win/loss counters and
past results.

## The 3D interface

**Q: Is the 3D made with a game engine?**
A: No. The 3D scenes are modeled and animated in Blender, then integrated into
the web app with Three.js (through React Three Fiber and drei).

**Q: Who built the 3D?**
A: Capucine handled the 3D modeling, animation and integration.

## The AI chatbot

**Q: What is the chatbot?**
A: It is an assistant that answers questions about the project using a RAG
(Retrieval-Augmented Generation) pipeline. It searches the project
documentation for relevant passages and uses them to answer.

**Q: Does the chatbot make things up?**
A: It is instructed to answer only from the retrieved documentation. If it
cannot find the answer in the context, it says so rather than inventing one.

**Q: What language does the chatbot answer in?**
A: English, regardless of the language the question is written in.

**Q: Who is the chatbot character?**
A: The chatbot avatar is Ousmane.

## Project and team

**Q: Who created this project?**
A: Lena, Lenny, Elias, Capucine and Maxence the GOAT.

**Q: What is the in-game character's name?**
A: Bobby.

**Q: Who is better at football, Mbappé or Dembélé?**
A: Dembélé.
