# Detailed Strategy Guide — Beating the AI Bot

This guide explains how the bot thinks and gives concrete tactics to beat it at
each level. The single most important idea: the bot is a **predictor**. It
tries to guess your next move and play the counter to it. So the way to beat it
is to be **unpredictable in the right way** and to exploit the few moments when
its prediction is wrong.

## How the bot decides

On each round the bot builds a prediction of your next move by blending three
signals:

1. **Frequency** — which moves you have played most often overall.
2. **Transition (order-1 Markov)** — given your *last* move, which move you
   tend to play *after* it, based on your whole history.
3. **Result-conditioned (win-stay / lose-shift)** — if you just won with a
   move, you are likely to repeat it; if you just lost, you are likely to
   switch.

It blends these into one distribution, takes the most likely move (argmax), and
plays the move that **counters** it. But before locking it in, it rolls a dice:
with a fixed probability it ignores the prediction and plays a **random** move
instead. That randomness is what keeps it from being a pure counter-machine you
could farm forever.

## General principles (all levels)

- **Do not fall into habits.** If you always answer Rock after Scissors, the
  transition model learns it and the bot counters you. Vary the move that
  *follows* each of your moves, not just your overall mix.
- **Break the win-stay reflex.** After you win a round, the bot expects you to
  repeat the winning move. Occasionally switch right after a win to dodge the
  counter.
- **Break the lose-shift reflex.** After you lose, the bot expects you to
  change. Sometimes repeating the move you just lost with catches it off guard.
- **Stay roughly balanced.** If you over-use one move, the frequency signal
  alone will start countering you.

## Level 0 (first to 5, Rock/Paper/Scissors only)

This is the warm-up. No Well, no combos, no Well penalty. The bot has little
history early on, so its first few moves lean random. Play a balanced, slightly
unpredictable mix and you should reach 5 points quickly. Use this level to get a
feel for how the bot reacts to your patterns.

## Level 1 (first to 10, combos unlocked)

Combos now matter: three Rocks, three Papers or three Scissors in a row each
give a bonus point. There is a tension here:

- Playing three of the same move to land a combo is exactly the kind of pattern
  the transition model can detect, so the bot may counter your third move.
- But the bot also has its own **streak-reinforcement** behavior from level 1:
  when it has played the same move twice in a row, it tends to favor repeating
  it. You can read that and pre-counter its streak.

Tactic: go for combos when you are confident the bot is in a random phase or
when the bonus point is worth the risk, and mix in single off-pattern moves to
keep the predictor confused.

## Level 2 (first to 10, the Well appears, Well penalty active)

Two big changes: the Well is now available to both sides, and losing a round
while playing the Well costs you 2 points.

- **The Well is strong but risky.** It beats Rock and Scissors and only loses to
  Paper. So it is a great move *unless* the opponent plays Paper — and then it
  costs you double.
- **The bot avoids the Well when it smells Paper.** From level 2 the bot has
  well-risk avoidance: if its prediction says you are likely to play Paper, it
  refuses to play the Well itself (because Paper would beat it). You can use
  this: if you make the bot believe you favor Paper, it will steer away from the
  Well, narrowing its move set.
- **Bait the bot's Well.** Conversely, if you can get the bot to play the Well
  while you hold Paper, you win the round and the bot does not suffer the
  penalty (the penalty only applies to *you* playing the Well and losing) — but
  you still gain the point.
- **Mind your own Well.** Only play the Well when you do not expect a Paper
  counter, because a wrong Well here is a 2-point swing against you.

## Level 3 (first to 10, full combos and giga-combo)

The richest level. All the level 1 combos plus extra patterns, and a
**giga-combo** for three Wells in a row.

- The giga-combo is tempting but dangerous: three Wells is a strong, readable
  pattern, and any Paper from the bot during the streak costs you 2 points.
  Only chase it when the bot is clearly not anticipating Paper from itself and
  not predicting your Well.
- This is where mixing combos, Well baiting and unpredictability pays off most.
  Alternate between safe scoring (single counters) and high-value plays
  (combos, well pressure) depending on how the bot is reading you.

## Reading the bot's mood from the score

Because the bot adapts to the score:

- **When you are ahead**, the bot plays *more carefully* and less randomly, and
  it is more willing to take Well risks to catch up. Expect sharper counters.
- **When you are behind**, the bot is more random and conservative. This is a
  good time to set up combos, because its prediction is weaker.

The bot is designed to be challenging and to win occasionally, not to be
unbeatable. Stay unpredictable, exploit its risk-avoidance around the Well, and
pick your combo attempts carefully.
