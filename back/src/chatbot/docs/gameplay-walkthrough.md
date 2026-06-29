# Gameplay Walkthrough — From First Login to a Finished Match

A step-by-step walkthrough of a full session, useful for new players and for
answering "how do I..." questions.

## 1. Arriving on the site

You land on the welcome page served over HTTPS. Because the certificate is
self-signed for local development, the browser shows a security warning the
first time; this is expected and safe to accept locally.

## 2. Creating an account

Open the sign-up form and provide an email, a nickname and a password. The
backend hashes the password with bcrypt and creates your user record. You can
then log in. On login the server issues a JWT stored in an httpOnly cookie,
plus a refresh token so your session can be renewed without re-entering your
password.

## 3. Optional: enabling 2FA

From your profile you can turn on Two-Factor Authentication. The server displays
a QR code; scan it with an authenticator app. After that, each login asks for
the current 6-digit TOTP code in addition to your password.

## 4. Setting up your profile

Upload an avatar and set your nickname. Other users will see this on your public
profile, which also shows your win/loss statistics.

## 5. Adding friends

Search for another user by nickname and send a friend request. Once they are in
your friends list you can see whether they are online and start a private chat
with them. Chat messages are delivered in real time and stored so you can read
the history later.

## 6. Choosing a game mode

Click "Play". You can either play "Against the bot" (single player versus the AI
opponent) or "Multiplayer" (a live match against another connected player over
WebSockets).

## 7. Playing against the bot

You start at level 0. Each round you pick a move; the bot picks one too, having
predicted what you would play and chosen a counter (with some randomness mixed
in). The result is shown and the score updates. First to 5 wins level 0; first
to 10 wins levels 1 to 3.

As you progress:
- Level 1 unlocks combos (three of a kind in a row gives a bonus point).
- Level 2 unlocks the Well and the 2-point Well penalty.
- Level 3 unlocks all combo patterns and the three-Well giga-combo.

## 8. Playing multiplayer

In multiplayer you are placed in a game room with another player. Both submit
moves and the server resolves each round and pushes the result to both clients
instantly. If your connection drops, the client tries to reconnect and you can
rejoin the ongoing match. After a match you can request a rematch.

## 9. Reading the result

When someone reaches the target score the match ends. Your win/loss counters
update and the result becomes part of your match history visible on your
profile.

## 10. Asking the chatbot

At any point you can open the chatbot (the Ousmane button). Ask it anything
about the rules, the levels, the bot's strategy, the technology stack or the
team. It retrieves the most relevant passages from the project documentation
and answers in English, or tells you if the information is not in the docs.

## Common situations

- **"My score went down by 2."** You played the Well and lost the round on
  level 2 or higher. The Well penalty is 2 points; your score never goes below
  zero.
- **"The bot keeps countering me."** You have a pattern the predictor has
  learned. Vary which move follows each of your moves and occasionally break the
  win-stay/lose-shift habit.
- **"I lost connection."** The real-time layer reconnects automatically and you
  can rejoin the room; you do not lose the whole match.
- **"The chatbot says it cannot find the answer."** The question is outside the
  indexed documentation. Rephrase it around the game, the rules, the bot or the
  stack, or ask Maxence the GOAT.

## Tips to climb levels efficiently

- Treat level 0 as practice: learn how the bot reacts before combos and the
  Well complicate things.
- On level 1, balance combo attempts against the risk of becoming predictable.
- On level 2, respect the Well penalty: only play the Well when you do not
  expect Paper, and try to bait the bot into bad Wells.
- On level 3, blend everything: combos, Well pressure and unpredictability,
  adjusting to whether the bot is playing carefully (you are ahead) or loosely
  (you are behind).
