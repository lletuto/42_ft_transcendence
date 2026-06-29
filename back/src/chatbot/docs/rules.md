# Game Rules — Rock, Paper, Scissors, Well

Our game is a variant of Rock-Paper-Scissors that adds a fourth
move: the **Well**. You play against the AI bot across four levels.

## Available moves

- **Rock** — beats Scissors; loses to Paper and to the Well.
- **Paper** — beats Rock and the Well; loses to Scissors.
- **Scissors** — beats Paper; loses to Rock and to the Well.
- **Well** — beats Rock and Scissors; loses only to Paper.

The Well is available starting at level 2. At levels 0 and 1 you only play
Rock, Paper and Scissors.

## Who beats who

- Rock crushes Scissors.
- Scissors cut Paper.
- Paper wraps Rock.
- Paper covers the Well, so Paper beats the Well.
- Rock falls into the Well, so the Well beats Rock.
- Scissors fall into the Well, so the Well beats Scissors.
- If both players pick the same move, the round is a tie.

## Scoring

- Winning a round gives **+1 point**.
- Losing a round gives nothing (your opponent scores instead).
- A tie scores nothing for anyone.

## Well penalty

From level 2 onward, if you play the **Well and lose** the round, you are
penalized **2 points** (instead of just losing the round). Your score can never
drop below 0.

## Combos (bonus points)

Playing a special winning sequence of three moves in a row triggers a combo
worth **+1 bonus point**:

- Level 0: no combos.
- Level 1: three Rocks, three Papers, or three Scissors in a row.
- Level 2: same combos as level 1 (no combo with the Well).
- Level 3: the level 1 combos plus extra patterns, and a giga-combo for three
  Wells in a row.

## Winning a match

- **Level 0**: the first to reach **5 points** wins.
- **Levels 1, 2 and 3**: the first to reach **10 points** wins.
