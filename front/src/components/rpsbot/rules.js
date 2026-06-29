export const MOVES = ['rock', 'paper', 'scissors', 'well'];

export const BASE_MOVES = ['rock', 'paper', 'scissors'];

export const BEATS = {
  rock: ['scissors'],
  paper: ['rock', 'well'],
  scissors: ['paper'],
  well: ['rock', 'scissors'],
};

export const COUNTERS = MOVES.reduce((acc, m) => {
  acc[m] = MOVES.filter((c) => BEATS[c].includes(m));
  return acc;
}, {});

export const RANDOM_RATE = {medium: 0.4};

export const WELL_RISK_THRESHOLD = 0.4;

// determine the result of a round given the human move and the bot move
export function roundResult(humanMove, botMove) {
  if (humanMove === botMove) 
    return 'draw';
  return BEATS[humanMove].includes(botMove) ? 'win' : 'lose';
}
