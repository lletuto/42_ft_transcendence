# Game Levels

The game has 4 levels of increasing difficulty, all played against the RPSBot.

## Level 0

Introduction level. Classic Rock-Paper-Scissors, no Well and no combos.
The first player to reach 5 points wins. Ideal to learn the game.

## Level 1

Introduces the combo system: chaining three identical winning moves (three
Rocks, Papers or Scissors) grants a bonus point. The Well is not available yet.
The first to reach 10 points wins.

## Level 2

The **Well** appears. Careful: losing a round while playing the Well costs 2
points. Combos still work (but there is no combo with the Well). The bot becomes
more cautious and anticipates your moves. First to 10 points wins.

## Level 3

The hardest level. The Well is available, with extra combo patterns and a
giga-combo for three Wells in a row. The bot uses advanced prediction (Markov
transition plus win-stay/lose-shift) and adapts to the score. First to 10 wins.

## The RPSBot

The bot predicts your next move from the history of your moves and the result of
the previous round. It never sees your current move — it only guesses.

- **Medium** (default): plays randomly about 40% of the time, predicts the rest.

At higher levels the bot is also cautious with the Well and is aware of the score.
