# Gameplay Guide — Tactics and Tips

This guide goes deeper than the basic rules. It explains how to play well, how
points add up, and how to approach each level against the AI bot.

## Quick reminder of the moves

There are four moves: Rock, Paper, Scissors and the Well. Rock beats Scissors,
Scissors beats Paper, Paper beats Rock, and Paper also beats the Well. The Well
beats both Rock and Scissors and only loses to Paper, which makes it the
strongest move once it is unlocked at level 2.

## How points work

You score one point each time you win a round. A tie gives nothing. From level 2
onward, if you play the Well and lose the round you lose two points, but your
score can never go below zero. Chaining three winning moves of the same kind can
also grant a combo bonus point on the levels that support combos.

## Reading the bot

The bot is a prediction machine. Every round it tries to guess your next move
from your past moves and from whether you won or lost the previous round, then
it plays whatever beats its guess. It chooses before seeing your move, so it
never cheats. About 40% of the time it ignores its guess and plays randomly, so
it stays unpredictable and beatable.

The single most important tactic is therefore: do not be predictable. If you
fall into habits — always repeating a winning move, always switching after a
loss, always following Rock with Paper — the bot will read you and counter you.
Mixing your moves up is what keeps you ahead.

## Level 0 — learning the game

Classic Rock-Paper-Scissors, no Well, no combos, first to 5 points. Use this
level to get comfortable. The only habit to avoid is repeating the exact same
move several times in a row.

## Level 1 — combos appear

Still no Well, first to 10 points. Chaining three Rocks, three Papers or three
Scissors (all winning) gives a bonus point, so combos are now worth setting up,
but be careful: a predictable sequence is exactly what the bot is trained to
catch. Balance combo attempts with staying unpredictable.

## Level 2 — the Well changes everything

The Well unlocks. It is powerful because it beats Rock and Scissors, but it is
risky because losing a round with the Well costs you two points. Two tips:
- Punish the bot's Well with Paper, the only move that beats it.
- Because the bot avoids the Well when it expects you to play Paper, you can
  bluff: play Paper often to scare it off the Well, then attack with Rock or
  Scissors when it stops using its best move.

## Level 3 — the full challenge

The hardest level: Well unlocked, extra combo patterns including a giga-combo for
three Wells, first to 10 points. The bot combines move prediction, its own
streaks, Well-risk avoidance and score awareness, and it plays more seriously
when it is losing. Stay fully random, keep Paper ready as your anti-Well weapon,
and avoid the costly mistake of losing a round on the Well.

## A note on the Well penalty

The two-point Well penalty is the most common way players throw away a match on
levels 2 and 3. Only commit to the Well when you are fairly confident the
opponent will not play Paper; otherwise a safer Rock or Scissors keeps your score
intact.
